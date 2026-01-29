const express = require("express");
const auth = require("../middleware/auth");
const Bill = require("../models/Bill");
const Product = require("../models/Product");

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
        return res
          .status(404)
          .json({ error: "Product not found" });
      }

      if (product.stock < item.quantity) {
        return res.status(400).json({
          error: `Insufficient stock for ${product.title}`,
        });
      }

      // ✅ DEDUCT STOCK
      product.stock -= item.quantity;
      await product.save();
    }

    // 🔴 2️⃣ PAYMENT CALCULATION
    const finalPaid =
      paymentStatus === "Paid" ? paidAmount : 0;

    const pendingAmount = totalAmount - finalPaid;

    // 🔴 3️⃣ CREATE BILL
    const newBill = new Bill({
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
