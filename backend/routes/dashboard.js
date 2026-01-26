const express = require("express");
const auth = require("../middleware/auth");
const Order = require("../models/Order");
const router = express.Router();

// Admin Dashboard Summary
router.get("/", auth("admin"), async (req, res) => {
  try {
    const orders = await Order.find();

    const totalSales = orders.reduce((sum, o) => sum + o.totalAmount, 0);
    const totalOrders = orders.length;
    const deliveredOrders = orders.filter(o => o.status === "Delivered").length;
    const pendingOrders = orders.filter(o => o.status !== "Delivered").length;

    res.json({
      totalSales,
      totalOrders,
      deliveredOrders,
      pendingOrders
    });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
