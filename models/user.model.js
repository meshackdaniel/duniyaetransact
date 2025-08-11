const { status } = require("express/lib/response");
const { Transaction } = require("mongodb");
const mongoose = require("mongoose");
const transactionSchema = new mongoose.Schema({
  category: {
    type: String,
    enum: ["deposit", "transfer", "airtime", "data"],
    required: true,
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
    required: true, // Not required for deposits
  },
  status: {
    type: String,
    enum: ["pending", "succesful", "reversed", "failed"],
    required: true,
  },
  description: {
    type: String,
    trim: true,
  },
});

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    pin: {
      type: Number,
      minlength: 4,
      maxlength: 4,
      required: true,
    },
    password: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    countryCode: {
      type: String,
      required: true,
    },
    phone: {
      type: String,
      required: true,
      unique: true,
    },
    profile: {
      type: String,
      required: false,
    },
    notifications: [
      {
        title: {
          type: String,
          required: true,
          trim: true,
        },
        text: {
          type: String,
          required: true,
          trim: true,
        },
        type: {
          type: String,
          required: true,
          enum: [
            "Success",
            "Pending",
            "Failed",
            "Security",
            "Profile",
            "Info",
            "Greetings",
          ], // You can modify these types as needed
          default: "Info",
        },
        time: {
          type: Date,
          required: true,
          default: Date.now,
        },
      },
    ],
    account: {
      accountName: {
        type: String,
        required: true,
        trim: true,
      },
      accountBalance: {
        type: Number,
        required: true,
        min: 0,
        default: 0,
      },
      accountNumber: {
        type: String,
        required: true,
        unique: true,
        trim: true,
      },
      bankName: {
        type: String,
        required: true,
        trim: true,
      },
      transactions: [transactionSchema],
    },
  },
  {
    timestamps: true,
  }
);

const User = mongoose.model("User", userSchema);
module.exports = User;
