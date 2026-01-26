const express = require("express");
const Order = require("../models/Order");
const auth = require("../middleware/auth");
const router = express.Router();

// Create Order (User)
router.post("/create", auth(), async (req, res) => {
  try {
    const { items, totalAmount, contact, address, paymentMode } = req.body;
    const order = new Order({
      userId: req.user.id,
      items,
      totalAmount,
      contact,
      address,
      paymentMode,
    });

    await order.save();
    res.json({ msg: "Order placed successfully", order });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// View User Orders
router.get("/my-orders", auth(), async (req, res) => {
  try {
    const orders = await Order.find({ userId: req.user.id }).populate("items.productId");
    res.json(orders);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Admin: All Orders
router.get("/all", auth("admin"), async (req, res) => {
  try {
    const orders = await Order.find().populate("userId").populate("items.productId");
    res.json(orders);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Admin: Update Status
router.put("/status/:id", auth("admin"), async (req, res) => {
  try {
    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { status: req.body.status },
      { new: true }
    );
    res.json({ msg: "Order status updated", order });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
