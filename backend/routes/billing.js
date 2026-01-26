const express = require("express");
const auth = require("../middleware/auth");
const Bill = require("../models/Bill");
const Product = require("../models/Product"); // ✅ IMPORT PRODUCT MODEL
const router = express.Router();


// ===============================
// CREATE BILL (OFFLINE) + UPDATE STOCK
// ===============================
router.post("/create", auth("admin"), async (req, res) => {
  try {
    const {
      customerName,
      customerMobile,
      items,
      totalAmount,
      paymentMode
    } = req.body;

    // 🔴 VALIDATION
    if (!customerName || !customerMobile || !items || items.length === 0) {
      return res.status(400).json({ error: "Invalid billing data" });
    }

    // 🔴 1️⃣ CHECK & UPDATE STOCK
    for (let item of items) {
      const product = await Product.findById(item.productId);

      if (!product) {
        return res.status(404).json({
          error: "Product not found",
        });
      }

      if (product.stock < item.quantity) {
        return res.status(400).json({
          error: `Insufficient stock for ${product.title}`,
        });
      }

      // ✅ DEDUCT STOCK
      product.stock = product.stock - item.quantity;
      await product.save();
    }

    // 🔴 2️⃣ CREATE BILL
    const newBill = new Bill({
      customerName,
      customerMobile,
      items,
      totalAmount,
      paymentMode,
    });

    await newBill.save();

    res.json({
      msg: "Bill created successfully",
      bill: newBill,
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
    res.json({ msg: "Bill deleted" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});


// ===============================
// GET ALL BILLS
// ===============================
router.get("/all", auth("admin"), async (req, res) => {
  try {
    const bills = await Bill.find().populate("items.productId");
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
    const bill = await Bill.findById(req.params.id).populate("items.productId");
    res.json(bill);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
