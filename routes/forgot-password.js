require("dotenv").config();
const mongoose = require("mongoose");
const User = require("../models/user.model");
const Confirmation = require("../models/confirmation.model");
const express = require("express");
const router = express.Router();
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
  res.render("forgot-password", {
    title: "Forgot Password",
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
  const user = await User.findOne({ email: email });

  if (!user) {
    return res
      .status(400)
      .json({ message: "There is no account with this email" });
  }
  try {
  } catch (error) {
    console.log("Error during password comparison:", error);
    res.status(500).send();
  }
});

router.post("/check-email", async (req, res) => {
  const { email } = req.body;
  const user = await User.findOne({ email: email });
  if (!user) {
    return res
      .status(400)
      .json({ message: "There is no account with this email" });
  }
  const code = generateRandomString(6);
  const getConfirmation = await Confirmation.findOne({ email });
  if (getConfirmation) {
    const updatedConfirmation = await Confirmation.deleteOne({ email });
  }
  await Confirmation.create({ email, code });
  try {
    await transporter.sendMail({
      from: myEmail,
      to: email,
      text: `Confirmation code to change your password is: ${code}`,
      subject: "Confirmation code for duniya comm",
    });
    res.status(200).json({
      message: "successful",
    });
  } catch (error) {
    return res.status(400).send(error);
  }
});

router.post("/check-code", async (req, res) => {
  const { code, email } = req.body;
  console.log(code, email);
  const confirmation = await Confirmation.findOne({
    email: email,
  });
  if (code == confirmation.code) {
    res.status(200).json({ message: "Correct code" });

    res.redirect("/login");
  }
  return res.status(400).json({ message: "Incorrect code" });
});

module.exports = router;
