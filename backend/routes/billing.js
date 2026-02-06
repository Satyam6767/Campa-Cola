const express = require("express");
const auth = require("../middleware/auth");
const Bill = require("../models/Bill");
const Product = require("../models/Product");
const Counter = require("../models/Counter");

const router = express.Router();

// ===============================
// CREATE BILL (OFFLINE)
// ===============================
router.post("/create", auth("admin"), async (req, res) => {
  try {
    const {
      customerName,
      customerMobile,
      customerAddress,
      items,
      totalAmount,
      paymentMode,
      paymentStatus,
      paidAmount,
    } = req.body;

    // 🔴 VALIDATION
    if (
      !customerName ||
      !customerMobile ||
      !customerAddress ||
      !items ||
      items.length === 0
    ) {
      return res.status(400).json({ error: "Invalid billing data" });
    }

    if (paymentStatus === "Paid" && paidAmount > totalAmount) {
      return res
        .status(400)
        .json({ error: "Paid amount cannot exceed total amount" });
    }

    // 🔴 1️⃣ CHECK & UPDATE STOCK
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

    // 🔴 2️⃣ PAYMENT CALCULATION
    const finalPaid = paymentStatus === "Paid" ? paidAmount : 0;
    const pendingAmount = totalAmount - finalPaid;

    // 🔴 3️⃣ AUTO INCREMENT INVOICE NUMBER
    const counter = await Counter.findOneAndUpdate(
      { name: "invoice" },
      { $inc: { seq: 1 } },
      { new: true, upsert: true }
    );

    // 🔴 4️⃣ CREATE BILL
    const newBill = new Bill({
      invoiceNumber: counter.seq,
      customerName,
      customerMobile,
      customerAddress,
      items,
      totalAmount,
      paymentMode,
      paymentStatus,
      paidAmount: finalPaid,
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
// UPDATE BILL (EDIT BILL)
// ===============================
router.put("/:id", auth("admin"), async (req, res) => {
  try {
    const {
      customerName,
      customerMobile,
      customerAddress,
      items,
      paymentMode,
      paidAmount,
    } = req.body;

    // 🔴 VALIDATION
    if (
      !customerName ||
      !customerAddress ||
      !items ||
      items.length === 0
    ) {
      return res.status(400).json({ error: "Invalid billing data" });
    }

    // 🔴 FIND BILL
    const bill = await Bill.findById(req.params.id);

    if (!bill) {
      return res.status(404).json({ error: "Bill not found" });
    }

    // 🔒 BLOCK EDIT ONLY IF FULLY PAID
    if (bill.pendingAmount === 0) {
      return res.status(403).json({
        error: "Fully paid bill cannot be edited",
      });
    }

    // 🔴 1️⃣ RESTORE OLD STOCK
    for (let oldItem of bill.items) {
      const product = await Product.findById(oldItem.productId);
      if (product) {
        product.stock += oldItem.quantity;
        await product.save();
      }
    }

    // 🔴 2️⃣ CHECK & DEDUCT NEW STOCK
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

    // 🔴 3️⃣ RECALCULATE TOTAL
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

    // 🔴 4️⃣ UPDATE BILL (INVOICE NUMBER UNCHANGED)
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
// DELETE BILL
// ===============================
router.delete("/:id", auth("admin"), async (req, res) => {
  try {
    await Bill.findByIdAndDelete(req.params.id);
    res.json({ message: "Bill deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
