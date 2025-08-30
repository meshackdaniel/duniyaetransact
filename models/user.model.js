const mongoose = require("mongoose");
const ReferralCode = require("./referralCode.model");
const Transaction = require("./transaction.model");
const { Schema } = mongoose;

const referralSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    min: 0,
  },
  date: {
    type: Date,
    default: Date.now,
  },
  status: {
    type: String,
    enum: ["pending", "succesful"],
    required: true,
  },
});

const userSchema = new mongoose.Schema(
  {
    firstName: {
      type: String,
      required: true,
    },
    lastName: {
      type: String,
      required: true,
    },
    pin: {
      type: String,
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
    adrress: {
      type: String,
      required: false,
    },
    dateOfBirth: {
      type: Date,
      required: false,
    },
    gender: {
      type: String,
      required: false,
    },
    city: {
      type: String,
      required: false,
    },
    state: {
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
        read: {
          type: Boolean,
          required: true,
          default: false,
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
      referrerBalance: {
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
    },
    transactions: [
      {
        type: Schema.Types.ObjectId,
        ref: "Transaction",
      },
    ],
    referralCode: {
      type: Schema.Types.ObjectId, // Reference to another document's _id
      ref: "ReferralCode",
      required: false, // Optional, if not every user has a referral code
    },
    referrals: [referralSchema],
  },
  {
    timestamps: true,
  }
);

const User = mongoose.model("User", userSchema);
module.exports = User;
