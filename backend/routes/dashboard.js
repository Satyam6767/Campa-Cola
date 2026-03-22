const express = require("express");
const auth = require("../middleware/auth");
const Order = require("../models/Order");
const Bill = require("../models/Bill");
const Product = require("../models/Product");
const Customer = require("../models/Customer");

const router = express.Router();

// Admin Dashboard Summary
router.get("/", auth(["admin"]), async (req, res) => {
  try {

    /* ── ORDERS ── */
    const orders = await Order.find();
    const totalOrders = orders.length;
    const deliveredOrders = orders.filter(o => o.status === "Delivered").length;
    const pendingOrders = orders.filter(o => o.status !== "Delivered").length;

    /* ── BILLS ── */
    const bills = await Bill.find().populate("items.productId").lean();
    const totalBills = bills.length;
    const totalRevenue = bills.reduce((sum, b) => sum + b.totalAmount, 0);
    const totalPendingPayments = bills.reduce((sum, b) => sum + (b.pendingAmount || 0), 0);

    /* ── PRODUCTS ── */
    const products = await Product.find().lean();
    const totalProducts = products.length;
    const lowStockProducts = products
      .filter(p => p.stock <= 10)
      .sort((a, b) => a.stock - b.stock)
      .slice(0, 5)
      .map(p => ({ _id: p._id, title: p.title, stock: p.stock, image: p.image }));

    /* ── CUSTOMERS ── */
    const totalCustomers = await Customer.countDocuments();

    /* ── TOP PRODUCTS (most billed by quantity) ── */
    const productSalesMap = {};
    bills.forEach(bill => {
      bill.items.forEach(item => {
        const id = item.productId?._id?.toString() || item.productId?.toString();
        const title = item.productId?.title || "Unknown";
        const image = item.productId?.image || "";
        if (!id) return;
        if (!productSalesMap[id]) {
          productSalesMap[id] = { title, image, totalQty: 0, totalRevenue: 0 };
        }
        productSalesMap[id].totalQty += item.quantity;
        productSalesMap[id].totalRevenue += item.price * item.quantity;
      });
    });

    const topProducts = Object.entries(productSalesMap)
      .map(([id, data]) => ({ id, ...data }))
      .sort((a, b) => b.totalQty - a.totalQty)
      .slice(0, 5);

    /* ── RECENT BILLS ── */
    const recentBills = await Bill.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .lean();

    res.json({
      // Orders
      totalOrders,
      deliveredOrders,
      pendingOrders,
      // Bills
      totalBills,
      totalRevenue,
      totalPendingPayments,
      // Products
      totalProducts,
      lowStockProducts,
      // Customers
      totalCustomers,
      // Top products
      topProducts,
      // Recent bills
      recentBills,
    });

  } catch (err) {
    console.error("DASHBOARD ERROR:", err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;