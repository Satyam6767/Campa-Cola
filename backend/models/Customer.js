const mongoose = require("mongoose");

const customerSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  phone: { type: String, unique: true, required: true, trim: true },
  address: { type: String, trim: true },
  totalSpent: { type: Number, default: 0 },
  totalBills: { type: Number, default: 0 },
  pendingAmount: { type: Number, default: 0 },
  lastPurchase: { type: Date, default: null },
}, { timestamps: true });

module.exports = mongoose.model("Customer", customerSchema);