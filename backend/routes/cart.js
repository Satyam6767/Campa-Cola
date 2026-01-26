const express = require("express");
const auth = require("../middleware/auth");
const Cart = require("../models/Cart");
const router = express.Router();

// Add Item to Cart
router.post("/add", auth(), async (req, res) => {
  try {
    const { productId, quantity } = req.body;
    const userId = req.user.id;

    let cart = await Cart.findOne({ userId });

    if (!cart) {
      cart = await Cart.create({
        userId,
        items: [{ productId, quantity }]
      });
    } else {
      const itemIndex = cart.items.findIndex(
        (item) => item.productId.toString() === productId
      );

      if (itemIndex >= 0) {
        cart.items[itemIndex].quantity += quantity;
      } else {
        cart.items.push({ productId, quantity });
      }

      await cart.save();
    }

    res.json({ msg: "Item added to cart", cart });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get Cart Items
router.get("/", auth(), async (req, res) => {
  const userId = req.user.id;

  const cart = await Cart.findOne({ userId }).populate("items.productId");

  res.json(cart || { items: [] });
});


// Remove Item from Cart
router.delete("/remove", auth(), async (req, res) => {
  try {
    const userId = req.user.id;
    const { productId } = req.body;

    const cart = await Cart.findOne({ userId });
    if (!cart) {
      return res.status(404).json({ msg: "Cart not found" });
    }

    cart.items = cart.items.filter(
      (item) => item.productId.toString() !== productId
    );

    await cart.save();

    res.json({ msg: "Item removed from cart", cart });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});


module.exports = router;
