const express = require("express");
const auth = require("../middleware/auth");
const Bill = require("../models/Bill");
const Product = require("../models/Product");
const Counter = require("../models/Counter");

const router = express.Router();

/* ======================================================
   CREATE BILL
====================================================== */
router.post("/create", auth(["admin"]), async (req, res) => {
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

    /* 1️⃣ CHECK & DEDUCT STOCK */
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

    /* 2️⃣ RECALCULATE TOTAL */
    const totalAmount = items.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );

    const paid = Number(paidAmount);

    if (paid > totalAmount) {
      return res
        .status(400)
        .json({ error: "Paid amount cannot exceed total amount" });
    }

    const pendingAmount = totalAmount - paid;

    const paymentStatus =
      pendingAmount === 0
        ? "Paid"
        : paid === 0
        ? "Unpaid"
        : "Partial";

    /* 3️⃣ AUTO INCREMENT INVOICE (FINANCIAL YEAR + LETTER) */

// Current date
const now = new Date();
const year = now.getFullYear();
const month = now.getMonth() + 1;

// Financial Year (April → March)
let fyStartYear = month >= 4 ? year : year - 1;

// 🎯 Letter logic (A, B, C...)
const baseYear = 2026; // starting year
const letterIndex = fyStartYear - baseYear;

// Safety check
if (letterIndex < 0) {
  return res.status(400).json({ error: "Invalid financial year setup" });
}

const prefix = String.fromCharCode(65 + letterIndex); // A, B, C...

// Unique counter per financial year
const counterName = `invoice-${fyStartYear}`;

let counter = await Counter.findOne({ name: counterName });

// 🔥 If counter does not exist → initialize from existing bills
if (!counter) {
  const existingBillsCount = await Bill.countDocuments({
    createdAt: {
      $gte: new Date(fyStartYear, 3, 1), // April 1
      $lte: new Date(),
    },
  });

  counter = await Counter.create({
    name: counterName,
    seq: existingBillsCount,
  });
}

// Increment counter
counter.seq += 1;
await counter.save();

// 5-digit number
const billNumber = String(counter.seq).padStart(5, "0");

// FINAL INVOICE NUMBER
const invoiceNumber = `${prefix}${billNumber}`;

    /* 4️⃣ CREATE BILL */
    const newBill = new Bill({
      invoiceNumber, // ✅ UPDATED
      customerName,
      customerMobile,
      customerAddress,
      items,
      totalAmount,
      paymentMode,
      paidAmount: paid,
      pendingAmount,
      paymentStatus,
    });

    await newBill.save();

    res.status(201).json({
      message: "Bill created successfully",
      bill: newBill,
    });

  } catch (error) {
    console.error("CREATE BILL ERROR:", error);
    res.status(500).json({ error: error.message });
  }
});

/* ======================================================
   GET ALL BILLS (FILTER + SEARCH + PAGINATION)
====================================================== */
router.get("/all", auth(["admin"]), async (req, res) => {
  try {
    const page = Math.max(parseInt(req.query.page) || 1, 1);
    const limit = Math.max(parseInt(req.query.limit) || 10, 1);

    const search = req.query.search?.trim() || "";
    const payment = req.query.payment || "all";
    const date = req.query.date || "all";

    let query = {};

    /* 🔎 SEARCH (NAME OR MOBILE OR INVOICE) */
    if (search) {
      query.$or = [
        { customerName: { $regex: search, $options: "i" } },
        { customerMobile: { $regex: search, $options: "i" } },
        { invoiceNumber: { $regex: search, $options: "i" } }, // ✅ ADDED
      ];
    }

    /* 💳 PAYMENT FILTER */
    if (payment === "Paid") {
      query.pendingAmount = 0;
      query.paidAmount = { $gt: 0 };
    }

    if (payment === "Unpaid") {
      query.paidAmount = 0;
    }

    if (payment === "Partial") {
      query.paidAmount = { $gt: 0 };
      query.pendingAmount = { $gt: 0 };
    }

    /* 📅 DATE FILTER */
    if (date !== "all") {
      const now = new Date();
      let startDate = new Date();

      if (date === "today") {
        startDate.setHours(0, 0, 0, 0);
      }

      if (date === "7days") {
        startDate.setDate(now.getDate() - 7);
      }

      if (date === "30days") {
        startDate.setDate(now.getDate() - 30);
      }

      query.createdAt = { $gte: startDate };
    }

    const total = await Bill.countDocuments(query);

    const bills = await Bill.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean();

    res.json({
      bills,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    });

  } catch (error) {
    console.error("GET ALL BILLS ERROR:", error);
    res.status(500).json({ error: error.message });
  }
});

/* ======================================================
   GET SINGLE BILL
====================================================== */
router.get("/:id", auth(["admin"]), async (req, res) => {
  try {
    const bill = await Bill.findById(req.params.id)
      .populate("items.productId")
      .lean();

    if (!bill) {
      return res.status(404).json({ error: "Bill not found" });
    }

    res.json(bill);

  } catch (error) {
    console.error("GET BILL ERROR:", error);
    res.status(500).json({ error: error.message });
  }
});

/* ======================================================
   UPDATE BILL
====================================================== */
router.put("/:id", auth(["admin"]), async (req, res) => {
  try {
    const {
      customerName,
      customerMobile,
      customerAddress,
      items,
      paymentMode,
      paidAmount = 0,
    } = req.body;

    if (!customerName || !customerAddress || !items || items.length === 0) {
      return res.status(400).json({ error: "Invalid billing data" });
    }

    const bill = await Bill.findById(req.params.id);
    if (!bill) {
      return res.status(404).json({ error: "Bill not found" });
    }

    /* RESTORE OLD STOCK */
    for (let oldItem of bill.items) {
      const product = await Product.findById(oldItem.productId);
      if (product) {
        product.stock += oldItem.quantity;
        await product.save();
      }
    }

    /* CHECK & DEDUCT NEW STOCK */
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

    /* RECALCULATE TOTAL */
    const totalAmount = items.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );

    const paid = Number(paidAmount);

    if (paid > totalAmount) {
      return res
        .status(400)
        .json({ error: "Paid amount cannot exceed total amount" });
    }

    const pendingAmount = totalAmount - paid;

    const paymentStatus =
      pendingAmount === 0
        ? "Paid"
        : paid === 0
        ? "Unpaid"
        : "Partial";

    bill.customerName = customerName;
    bill.customerMobile = customerMobile;
    bill.customerAddress = customerAddress;
    bill.items = items;
    bill.totalAmount = totalAmount;
    bill.paymentMode = paymentMode;
    bill.paidAmount = paid;
    bill.pendingAmount = pendingAmount;
    bill.paymentStatus = paymentStatus;

    await bill.save();

    res.json({
      message: "Bill updated successfully",
      bill,
    });

  } catch (error) {
    console.error("UPDATE BILL ERROR:", error);
    res.status(500).json({ error: error.message });
  }
});

/* ======================================================
   DELETE BILL
====================================================== */
router.delete("/:id", auth(["admin"]), async (req, res) => {
  try {
    const bill = await Bill.findById(req.params.id);
    if (!bill) {
      return res.status(404).json({ error: "Bill not found" });
    }

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
    console.error("DELETE BILL ERROR:", error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;