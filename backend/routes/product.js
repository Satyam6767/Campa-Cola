const express = require("express");
const Product = require("../models/Product");
const auth = require("../middleware/auth");

const router = express.Router();

/* =========================================
   ADD PRODUCT (ADMIN)
========================================= */
router.post("/", auth("admin"), async (req, res) => {
  try {
    const product = new Product(req.body);
    await product.save();

    res.json({
      msg: "Product added successfully",
      product,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/* =========================================
   GET PRODUCTS (WITH PAGINATION SUPPORT)
========================================= */
router.get("/", async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 0; // 0 means return all
    const sort = req.query.sort || "-createdAt";

    // If no limit provided → return all products (old behavior)
    if (limit === 0) {
      const products = await Product.find().sort(sort);
      return res.json(products);
    }

    const skip = (page - 1) * limit;

    const total = await Product.countDocuments();

    const products = await Product.find()
      .sort(sort)
      .skip(skip)
      .limit(limit);

    res.json({
      total,
      page,
      totalPages: Math.ceil(total / limit),
      products,
    });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/* =========================================
   GET SINGLE PRODUCT
========================================= */
router.get("/:id", async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ msg: "Product not found" });
    }

    res.json(product);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/* =========================================
   DELETE PRODUCT (ADMIN)
========================================= */
router.delete("/:id", auth("admin"), async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);

    if (!product) {
      return res.status(404).json({ msg: "Product not found" });
    }

    res.json({ msg: "Product deleted successfully" });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/* =========================================
   UPDATE PRODUCT (ADMIN)
========================================= */
router.put("/:id", auth("admin"), async (req, res) => {
  try {
    const product = await Product.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );

    if (!product) {
      return res.status(404).json({ msg: "Product not found" });
    }

    res.json({
      msg: "Product updated successfully",
      product,
    });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;