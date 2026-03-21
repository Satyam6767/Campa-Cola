const express = require("express");
const auth = require("../middleware/auth");
const Customer = require("../models/Customer");
const Bill = require("../models/Bill");

const router = express.Router();

/* ======================================================
   ADD CUSTOMER (Admin manually adds)
====================================================== */
router.post("/", auth(["admin"]), async (req, res) => {
  try {
    const { name, phone, address } = req.body;

    if (!name || !phone) {
      return res.status(400).json({ error: "Name and phone are required" });
    }

    const existing = await Customer.findOne({ phone });
    if (existing) {
      return res.status(400).json({ error: "Customer with this phone already exists" });
    }

    const customer = new Customer({ name, phone, address });
    await customer.save();

    res.status(201).json({ message: "Customer added successfully", customer });
  } catch (error) {
    console.error("ADD CUSTOMER ERROR:", error);
    res.status(500).json({ error: error.message });
  }
});

/* ======================================================
   GET ALL CUSTOMERS (with search + pagination)
====================================================== */
router.get("/", auth(["admin"]), async (req, res) => {
  try {
    const page = Math.max(parseInt(req.query.page) || 1, 1);
    const limit = Math.max(parseInt(req.query.limit) || 10, 1);
    const search = req.query.search?.trim() || "";

    let query = {};

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { phone: { $regex: search, $options: "i" } },
      ];
    }

    const total = await Customer.countDocuments(query);

    const customers = await Customer.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean();

    res.json({ customers, total, page, totalPages: Math.ceil(total / limit) });
  } catch (error) {
    console.error("GET CUSTOMERS ERROR:", error);
    res.status(500).json({ error: error.message });
  }
});

/* ======================================================
   GET SINGLE CUSTOMER
====================================================== */
router.get("/:id", auth(["admin"]), async (req, res) => {
  try {
    const customer = await Customer.findById(req.params.id).lean();
    if (!customer) return res.status(404).json({ error: "Customer not found" });
    res.json(customer);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/* ======================================================
   GET CUSTOMER'S BILL HISTORY (by phone match)
====================================================== */
router.get("/:id/bills", auth(["admin"]), async (req, res) => {
  try {
    const customer = await Customer.findById(req.params.id).lean();
    if (!customer) return res.status(404).json({ error: "Customer not found" });

    const bills = await Bill.find({
      customerMobile: customer.phone,
    })
      .sort({ createdAt: -1 })
      .lean();

    // Compute live stats from bills
    const totalBills = bills.length;
    const totalSpent = bills.reduce((sum, b) => sum + b.totalAmount, 0);
    const pendingAmount = bills.reduce((sum, b) => sum + (b.pendingAmount || 0), 0);
    const lastPurchase = bills.length > 0 ? bills[0].createdAt : null;

    // Update customer stats
    await Customer.findByIdAndUpdate(req.params.id, {
      totalBills,
      totalSpent,
      pendingAmount,
      lastPurchase,
    });

    res.json({ customer, bills, totalBills, totalSpent, pendingAmount, lastPurchase });
  } catch (error) {
    console.error("GET CUSTOMER BILLS ERROR:", error);
    res.status(500).json({ error: error.message });
  }
});

/* ======================================================
   UPDATE CUSTOMER
====================================================== */
router.put("/:id", auth(["admin"]), async (req, res) => {
  try {
    const { name, phone, address } = req.body;

    const customer = await Customer.findByIdAndUpdate(
      req.params.id,
      { name, phone, address },
      { new: true }
    );

    if (!customer) return res.status(404).json({ error: "Customer not found" });

    res.json({ message: "Customer updated", customer });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/* ======================================================
   DELETE CUSTOMER
====================================================== */
router.delete("/:id", auth(["admin"]), async (req, res) => {
  try {
    await Customer.findByIdAndDelete(req.params.id);
    res.json({ message: "Customer deleted" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;