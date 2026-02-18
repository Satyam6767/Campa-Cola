const express = require("express");
const auth = require("../middleware/auth");
const Bill = require("../models/Bill");
const Product = require("../models/Product");
const Counter = require("../models/Counter");

const router = express.Router();


// ===============================
// CREATE BILL (SECURE)
// ===============================
router.post("/create", auth("admin"), async (req, res) => {
  try {
    const {
      customerName,
      customerMobile,
      customerAddress,
      items,
      paymentMode,
      paidAmount = 0,
    } = req.body;

    if (
      !customerName ||
      !customerMobile ||
      !customerAddress ||
      !items ||
      items.length === 0
    ) {
      return res.status(400).json({ error: "Invalid billing data" });
    }

    let totalAmount = 0;

    // 🔹 CHECK STOCK + CALCULATE TOTAL USING DB PRICE
    for (let item of items) {
      const product = await Product.findById(item.productId);

      if (!product) {
        return res.status(404).json({ error: "Product not found" });
      }

      if (product.stock < item.quantity) {
        return res.status(400).json({
          error: `Insufficient stock for ${product.title}`,
        });
      }

      product.stock -= item.quantity;
      await product.save();

      item.price = product.price; // 🔐 Secure price
      totalAmount += product.price * item.quantity;
    }

    if (paidAmount > totalAmount) {
      return res
        .status(400)
        .json({ error: "Paid amount cannot exceed total amount" });
    }

    const pendingAmount = totalAmount - paidAmount;
    const paymentStatus =
      pendingAmount === 0 ? "Paid" : "Unpaid";

    // 🔹 AUTO INCREMENT INVOICE
    const counter = await Counter.findOneAndUpdate(
      { name: "invoice" },
      { $inc: { seq: 1 } },
      { new: true, upsert: true }
    );

    const newBill = new Bill({
      invoiceNumber: counter.seq,
      customerName,
      customerMobile,
      customerAddress,
      items,
      totalAmount,
      paymentMode,
      paidAmount,
      pendingAmount,
      paymentStatus,
    });

    await newBill.save();

    res.status(201).json({
      message: "Bill created successfully",
      bill: newBill,
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
});


// ===============================
// GET ALL BILLS
// ===============================
router.get("/all", auth("admin"), async (req, res) => {
  try {
    const bills = await Bill.find()
      .sort({ createdAt: -1 })
      .populate("items.productId");

    res.json(bills);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});


// ===============================
// GET SINGLE BILL
// ===============================
router.get("/:id", auth("admin"), async (req, res) => {
  try {
    const bill = await Bill.findById(req.params.id)
      .populate("items.productId");

    if (!bill) {
      return res.status(404).json({ error: "Bill not found" });
    }

    res.json(bill);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});


// ===============================
// UPDATE BILL (EDIT - SECURE)
// ===============================
router.put("/:id", auth("admin"), async (req, res) => {
  try {
    const {
      customerName,
      customerMobile,
      customerAddress,
      items,
      paymentMode,
      paidAmount = 0,
    } = req.body;

    if (
      !customerName ||
      !customerAddress ||
      !items ||
      items.length === 0
    ) {
      return res.status(400).json({ error: "Invalid billing data" });
    }

    const bill = await Bill.findById(req.params.id);

    if (!bill) {
      return res.status(404).json({ error: "Bill not found" });
    }

    // 🔹 RESTORE OLD STOCK
    for (let oldItem of bill.items) {
      const product = await Product.findById(oldItem.productId);
      if (product) {
        product.stock += oldItem.quantity;
        await product.save();
      }
    }

    let totalAmount = 0;

    // 🔹 VALIDATE + DEDUCT NEW STOCK + CALCULATE TOTAL
    for (let item of items) {
      const product = await Product.findById(item.productId);

      if (!product) {
        return res.status(404).json({ error: "Product not found" });
      }

      if (product.stock < item.quantity) {
        return res.status(400).json({
          error: `Insufficient stock for ${product.title}`,
        });
      }

      product.stock -= item.quantity;
      await product.save();

      item.price = product.price; // 🔐 Secure price
      totalAmount += product.price * item.quantity;
    }

    if (paidAmount > totalAmount) {
      return res
        .status(400)
        .json({ error: "Paid amount cannot exceed total amount" });
    }

    const pendingAmount = totalAmount - paidAmount;
    const paymentStatus =
      pendingAmount === 0 ? "Paid" : "Unpaid";

    // 🔹 UPDATE BILL
    bill.customerName = customerName;
    bill.customerMobile = customerMobile;
    bill.customerAddress = customerAddress;
    bill.items = items;
    bill.totalAmount = totalAmount;
    bill.paymentMode = paymentMode;
    bill.paidAmount = paidAmount;
    bill.pendingAmount = pendingAmount;
    bill.paymentStatus = paymentStatus;

    await bill.save();

    res.json({
      message: "Bill updated successfully",
      bill,
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
});


// ===============================
// DELETE BILL (RESTORE STOCK)
// ===============================
router.delete("/:id", auth("admin"), async (req, res) => {
  try {
    const bill = await Bill.findById(req.params.id);

    if (!bill) {
      return res.status(404).json({ error: "Bill not found" });
    }

    // 🔹 RESTORE STOCK BEFORE DELETE
    for (let item of bill.items) {
      const product = await Product.findById(item.productId);
      if (product) {
        product.stock += item.quantity;
        await product.save();
      }
    }

    await Bill.findByIdAndDelete(req.params.id);

    res.json({ message: "Bill deleted successfully" });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});


module.exports = router;
