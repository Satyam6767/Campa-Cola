const express = require("express");
const Product = require("../models/Product");
const auth = require("../middleware/auth");
const router = express.Router();

// Add Product (Admin)
router.post("/", auth("admin"), async (req, res) => {
  try {
    const product = new Product(req.body);
    await product.save();
    res.json({ msg: "Product added successfully", product });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get All Products (with optional limit)
router.get("/", async (req, res) => {
  try {
    const limit = parseInt(req.query.limit);

    let query = Product.find(); // ✅ No sort (sequence unchanged)

    if (limit) {
      query = query.limit(limit);
    }

    const products = await query;
    res.json(products);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get Single Product
router.get("/:id", async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    res.json(product);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete Product (Admin)
router.delete("/:id", auth("admin"), async (req, res) => {
  try {
    await Product.findByIdAndDelete(req.params.id);
    res.json({ msg: "Product deleted" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update Product (Admin)
router.put("/:id", auth("admin"), async (req, res) => {
  try {
    const product = await Product.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    res.json({ msg: "Product updated", product });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;