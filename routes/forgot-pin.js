require("dotenv").config();
const mongoose = require("mongoose");
const User = require("../models/user.model");
const Reset = require("../models/reset.model");
const express = require("express");
const router = express.Router();
const crypto = require("crypto");

//  require jwt for authentication
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");

const nodemailer = require("nodemailer");
const myEmail = process.env.NODEMAILER_EMAIL;
const pin = process.env.NODEMAILER_PASSWORD; // Use environment variable or hardcoded pin for testing

const transporter = nodemailer.createTransport({
  service: process.env.NODEMAILER_SERVICE,
  auth: {
    user: myEmail,
    pass: pin,
  },
});

function generateRandomString(max) {
  const characters =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let result = "";
  for (let i = 0; i < max; i++) {
    const randomIndex = Math.floor(Math.random() * characters.length);
    result += characters[randomIndex];
  }
  return result;
}

// Import the home route
router.get("/", (req, res) => {
  res.render("forgot-pin", {
    title: "Forgot Pin",
    name: "Duniya Comm",
  });
});

mongoose
  .connect(process.env.ATLAS_URI)
  .then(() => {
    console.log("Connected to MongoDB");
  })
  .catch((err) => {
    console.error("MongoDB connection error:", err);
  });

router.post("/", async (req, res) => {
  const { email } = req.body;
  // Generate unique token
  const token = crypto.randomBytes(32).toString("hex");
  try {
    const user = await User.findOne({ email: email });

    if (user) {
      if (await Reset.findOne({ email })) {
        const updatedReset = await Reset.deleteOne({ email });
      }
      await Reset.create({ email, token });
      await transporter.sendMail({
        from: myEmail,
        to: email,
        html: `
          <!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Reset Pin</title>
</head>
<body>
    <p>Click on the link below to reset your account</p>
    <a href=http://localhost:3000/forgot-pin?token=${token}>http://localhost:3000/reset-pin/token=${token}</a>
</body>
</html>
        `,
        subject: "Confirmation code for duniya comm",
      });
      res.status(200).json({
        message: "successful",
      });
    }
    return res.status(200).send();
  } catch (error) {
    return res.render("internalservererror", {title: "Server Error",name: "Duniya Comm"});
  }
});
module.exports = router;
