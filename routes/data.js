const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const User = require("../models/user.model");
const bcrypt = require("bcrypt");

// Import the home route
router.get("/", async (req, res) => {
  const username = req.user ? req.user.username : "";
  const getUser = await User.findOne({ email: username });
  if (!getUser) {
    return res.status(404).send("User not found");
  }
  const user = {
    name: getUser.name,
    email: getUser.email,
    phone: getUser.phone,
    countryCode: getUser.countryCode,
    profile: getUser.profile || "images/profile.png", // Default profile image if not set
    notifications: getUser.notifications.slice(0, 3) || [],
  };
  res.render("data", { title: "Data", user: user, name: "Duniya Comm" });
});

// Handle the form submission
router.post("/", async (req, res) => {
  const { phoneNumber, amount, pin, network, email, bundle } = req.body;
  const getUser = await User.findOne({ email: email });
  if (!getUser) {
    return res.status(404).send("User not found");
  } else {
    if (await bcrypt.compare(pin, getUser.pin)) {
      console.log("bundle", bundle);
      const updatedUser = await User.updateOne(
        { email: email },
        { $inc: { "account.accountBalance": -amount } },
        { new: true }
      );
      if (updatedUser) {
        console.log("Balance updated successfully");
      }
      const transactionDetails = {
        message: "Airtime purchase successful",
        status: "succesful",
        id: "9819809898908809809",
        service: network,
        phoneNumber: phoneNumber,
        amount: amount,
        bundle: bundle,
        validity: "2 days",
        date: "13 Aug 2025",
        time: "4:00pm",
      };
      return res.status(200).json(transactionDetails);
    } else {
      console.log("Incorrect pin");
      return res.status(400).json({ message: "Incorrect pin" });
    }
  }
});

module.exports = router;
