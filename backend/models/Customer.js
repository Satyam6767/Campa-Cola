const mongoose = require("mongoose");

const customerSchema = new mongoose.Schema({
  name: String,
  phone: { type: String, unique: true },
  address: String,
  totalSpent: { type: Number, default: 0 },
  lastPurchase: { type: Date, default: null }
}, { timestamps: true });

module.exports = mongoose.model("Customer", customerSchema);
