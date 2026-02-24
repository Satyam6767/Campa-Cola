const express = require("express");
const auth = require("../middleware/auth");
const Bill = require("../models/Bill");
const Product = require("../models/Product");
const Counter = require("../models/Counter");

const router = express.Router();


// ======================================================
// CREATE BILL
// ======================================================
router.post("/create", auth("admin"), async (req, res) => {
  try {
    const {
      customerName,
      customerMobile,
      customerAddress,
      items,
      paymentMode,
      paymentStatus,
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

    // 🔹 1️⃣ Check & Deduct Stock
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
    }

    // 🔹 2️⃣ Recalculate Total From Backend
    const totalAmount = items.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );

    if (paidAmount > totalAmount) {
      return res
        .status(400)
        .json({ error: "Paid amount cannot exceed total amount" });
    }

    const pendingAmount = totalAmount - paidAmount;
    const finalPaymentStatus =
      pendingAmount === 0 ? "Paid" : "Unpaid";

    // 🔹 3️⃣ Auto Increment Invoice
    const counter = await Counter.findOneAndUpdate(
      { name: "invoice" },
      { $inc: { seq: 1 } },
      { new: true, upsert: true }
    );

    // 🔹 4️⃣ Create Bill
    const newBill = new Bill({
      invoiceNumber: counter.seq,
      customerName,
      customerMobile,
      customerAddress,
      items,
      totalAmount,
      paymentMode,
      paymentStatus: finalPaymentStatus,
      paidAmount,
      pendingAmount,
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


// ======================================================
// GET ALL BILLS
// ======================================================
router.get("/all", auth("admin"), async (req, res) => {
  try {
    const bills = await Bill.find()
      .sort({ createdAt: -1 })
      .limit(100)   // 🔥 prevents huge data load
      .lean();      // 🔥 makes query much faster

    res.json(bills);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});


// ======================================================
// GET SINGLE BILL
// ======================================================
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


// ======================================================
// UPDATE BILL (EDIT BILL)
// ======================================================
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

    // 🔹 1️⃣ Restore Old Stock
    for (let oldItem of bill.items) {
      const product = await Product.findById(oldItem.productId);
      if (product) {
        product.stock += oldItem.quantity;
        await product.save();
      }
    }

    // 🔹 2️⃣ Check & Deduct New Stock
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
    }

    // 🔹 3️⃣ Recalculate Total
    const totalAmount = items.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );

    if (paidAmount > totalAmount) {
      return res
        .status(400)
        .json({ error: "Paid amount cannot exceed total amount" });
    }

    const pendingAmount = totalAmount - paidAmount;
    const paymentStatus =
      pendingAmount === 0 ? "Paid" : "Unpaid";

    // 🔹 4️⃣ Update Bill
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


// ======================================================
// DELETE BILL (RESTORE STOCK)
// ======================================================
router.delete("/:id", auth("admin"), async (req, res) => {
  try {
    const bill = await Bill.findById(req.params.id);

    if (!bill) {
      return res.status(404).json({ error: "Bill not found" });
    }

    // 🔹 Restore Stock Before Delete
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
