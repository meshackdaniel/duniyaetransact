const mongoose = require("mongoose");
const User = require("./user.model");
const transactionSchema = new mongoose.Schema(
  {
    category: {
      type: String,
      enum: ["deposit", "transfer", "airtime", "data", "nin"],
      required: true,
    },
    network: {
      type: String,
      required: false, // Not required for deposits
    },
    phoneNumber: {
      type: String,
      required: false, // Not required for deposits
    },
    accountNumber: {
      type: String,
      required: false, // Not required for airtime and data
    },
    bankName: {
      type: String,
      required: false, // Not required for airtime and data
    },
    bundle: {
      type: String,
      required: false, // Not required for deposits
    },
    validity: {
      type: String,
      required: false, // Not required for deposits
    },
    amount: {
      type: Number,
      required: true,
      min: 0,
    },
    date: {
      type: Date,
      default: Date.now,
    },
    recipient: {
      type: String,
      required: false, // Not required for deposits
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    status: {
      type: String,
      enum: ["pending", "successful", "reversed", "failed"],
      required: true,
    },
    description: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

const Transaction = mongoose.model("Transaction", transactionSchema);
module.exports = Transaction;
