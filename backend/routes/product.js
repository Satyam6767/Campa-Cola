const express = require("express");
const Product = require("../models/Product");
const auth = require("../middleware/auth");

const router = express.Router();

/* ===============================
   ADD PRODUCT (ADMIN)
================================ */
router.post("/", auth("admin"), async (req, res) => {
  try {
    const product = new Product(req.body);
    await product.save();
    res.json({ msg: "Product added successfully", product });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/* ===============================
   GET PRODUCTS (LIMIT SUPPORT)
================================ */
router.get("/", async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 0;

    if (limit === 0) {
      const products = await Product.find().sort("-createdAt");
      return res.json(products);
    }

    const products = await Product.find()
      .sort("-createdAt")
      .limit(limit);

    res.json(products);

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/* ===============================
   GET SINGLE PRODUCT
================================ */
router.get("/:id", async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    res.json(product);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/* ===============================
   DELETE PRODUCT (ADMIN)
================================ */
router.delete("/:id", auth("admin"), async (req, res) => {
  try {
    await Product.findByIdAndDelete(req.params.id);
    res.json({ msg: "Product deleted" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/* ===============================
   UPDATE PRODUCT (ADMIN)
================================ */
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