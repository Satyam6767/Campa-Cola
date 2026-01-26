const express = require("express");
const Category = require("../models/Category");
const auth = require("../middleware/auth");
const router = express.Router();

// Admin: Add Category
router.post("/", auth("admin"), async (req, res) => {
  try {
    const category = new Category(req.body);
    await category.save();
    res.json({ msg: "Category added", category });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// All Categories (user + admin)
router.get("/", async (req, res) => {
  try {
    const categories = await Category.find();
    res.json(categories);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete Category
router.delete("/:id", auth("admin"), async (req, res) => {
  try {
    await Category.findByIdAndDelete(req.params.id);
    res.json({ msg: "Category deleted" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
