const mongoose = require("mongoose");

const billSchema = new mongoose.Schema({
  customerName: { type: String, required: true },
  customerMobile: { type: String, required: true },

  customerAddress: { type: String, required: true }, // ✅ NEW

  items: [
    {
      productId: { type: mongoose.Schema.Types.ObjectId, ref: "Product" },
      quantity: { type: Number, required: true },
      price: { type: Number, required: true }
    }
  ],
  totalAmount: { type: Number, required: true },
  paymentMode: {
    type: String,
    enum: ["Cash", "Card", "UPI"],
    default: "Cash"
  },
}, { timestamps: true });

module.exports = mongoose.model("Bill", billSchema);
