require("dotenv").config();
const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const mongoose = require("mongoose");
const User = require("../models/user.model");
const Confirmation = require("../models/confirmation.model");
const { accepts } = require("express/lib/request");
const jwt = require("jsonwebtoken");

router.use(express.json());

mongoose
  .connect(process.env.ATLAS_URI)
  .then(() => {
    console.log("Connected to MongoDB");
  })
  .catch((err) => {
    console.error("MongoDB connection error:", err);
  });
// Import the home route
router.get("/", (req, res) => {
  // Authenticate user
  res.render("signup", { title: "Signup", name: "Duniya Comm" });
});

const otPayApiKey = process.env.OTPAY_API_KEY;
const otPayApiSecret = process.env.OTPAY_API_SECRET;
const otPayBusinessCode = process.env.OTPAY_BUSINESS_CODE;

router.post("/", async (req, res) => {
  const name = req.body.fullname;
  const phone = req.body.phone;
  const email = req.body.email;
  const countryCode = req.body.countryCode;
  const hashedPassword = await bcrypt.hash(req.body.password, 10);
  const pin = req.body.pin;
  // const hashedPin = await bcrypt.hash(req.body.pin, 10);
  const confirmationCode = req.body.confirmationCode;
  const otPayBody = {
    business_code: otPayBusinessCode,
    phone: phone,
    email: email,
    bank_code: [100033],
    name: name,
  };
  const confirmation = await Confirmation.findOne({
    email: email,
  });
  if (confirmationCode == confirmation.code) {
    fetch("https://otpay.ng/api/v1/create_virtual_account", {
      method: "POST",
      body: JSON.stringify(otPayBody),
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        "api-key": otPayApiKey,
        "secret-key": otPayApiSecret,
      },
    }).then(async (data) => {
      if (!data.ok) {
        throw new Error("Internal server error");
      } else {
        try {
          const newAccount = await data.json();
          console.log("value of account is", newAccount);

          const user = {
            name: name,
            password: hashedPassword,
            email: email,
            phone: phone,
            countryCode: countryCode,
            profile: "",
            notifications: [
              {
                title: "Welcome to Duniya Comm",
                text: "Thank you for signing up! We're excited to have you on board. visit your dashboard to explore features. Visit your profile to set up your account.",
                type: "Greetings",
              },
            ],
            account: {
              accountNumber: newAccount.accounts[0].number,
              bankName: newAccount.accounts[0].bank,
              accountName: newAccount.accounts[0].name,
              accountBalance: 0,
            },
            pin: pin, // Default pin, should be changed by user
          };
          console.log("user", user);
          const createdUser = await User.create(user);
          console.log("createduser", createdUser);
          const username = email;
          const refreshToken = jwt.sign(
            { username },
            process.env.REFRESH_TOKEN_SECRET,
            { expiresIn: "1d" }
          );
          res.cookie("refreshToken", refreshToken, {
            httpOnly: true,
            maxAge: 24 * 60 * 60 * 1000, // 1 day
          });
          console.log("Account created successfully");
          return res.status(201).send("Account created successfully");
        } catch (e) {
          return res.status(500).send(e);
        }
      }
    });
  } else {
    console.log("Confirmation code is in valid");
    return res.status(400).send("Invalid confirmation code");
  }
});

module.exports = router;
