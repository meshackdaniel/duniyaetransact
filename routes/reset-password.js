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
const password = process.env.NODEMAILER_PASSWORD; // Use environment variable or hardcoded password for testing

const transporter = nodemailer.createTransport({
  service: process.env.NODEMAILER_SERVICE,
  auth: {
    user: myEmail,
    pass: password,
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
  res.render("reset-password", {
    title: "reset Password",
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
  const { newPassword, confirmPassword, token } = req.body;
  // Generate unique token

  if (newPassword !== confirmPassword) {
    return res.status(400).send()
  }
  if (newPassword < 6) {
    return res.status(400).send();
  }
  const checkToken = await Reset.findOne({ token });
  if (!checkToken) {
    return res.status(400).send("This link is invalid or has expired")
  }
  const hashedPassword = await bcrypt.hash(newPassword, 10);
  const email = checkToken.email;
  try {
    const updatedUser = await User.updateOne(
      { email },
      { password: hashedPassword },
      { new: true }
    );
    const updatedReset = await Reset.deleteOne({ email });
  } catch (error) {
    return res.render("internalservererror", {title: "Server Error",name: "Duniya Comm"});
  }
  return res.status(200).send();
});

module.exports = router;