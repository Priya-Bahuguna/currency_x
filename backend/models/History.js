const mongoose = require("mongoose");

const historySchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    fromCurrency: { type: String, required: true },
    toCurrency: { type: String, required: true },
    amount: { type: Number, required: true },
    result: { type: Number, required: true },
    rate: { type: Number, required: true },
    isPredicted: { type: Boolean, default: false },
  },
  { timestamps: true }
);

module.exports = mongoose.model("History", historySchema);
