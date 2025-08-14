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
      transactions: [
        {
          category: {
            type: String,
            enum: [
              "deposit",
              "transfer",
              "airtime purchase",
              "data subscription",
            ],
            required: true,
          },
          service: {
            type: String,
            enum: ["Airtel", "MTN", "GLO", "9mobile"],
            required: true,
          },
          phoneNumber: {
            type: Number,
            required: false,
            min: 0,
          },
          bundle: {
            type: String,
            required: false,
          },
          validity: {
            type: String,
            required: false,
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
          sender: {
            type: String,
            required: false,
          },
          recipient: {
            type: String,
            required: false,
          },
          status: {
            type: String,
            enum: ["pending", "succesful", "reversed", "failed"],
            required: true,
          },
          description: {
            type: String,
            trim: true,
            required: false,
          },
        },
      ],
    },
  },
  {
    timestamps: true,
  }
);

const User = mongoose.model("User", userSchema);
module.exports = User;
