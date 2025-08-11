const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const User = require("../models/user.model");

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
    notifications: getUser.notifications.slice(0,3) || [],
  };
  res.render("data", { title: "Data", user: user, name: "Duniya Comm" });
});

// Handle the form submission
router.post("/", async (req, res) => {
  const { phoneNumber, amount, pin, network, email } = req.body;
  const getUser = await User.findOne({ email: email });
  if (!getUser) {
    return res.status(404).send("User not found");
  } else {
    if (pin == getUser.pin) {
      console.log("correct pin");
      const updatedUser = await User.updateOne(
        { email: email },
        { $inc: { 'account.accountBalance': -amount } },
        { new: true }
      );
      if(updatedUser) {
        console.log("Balance updated successfully");
      }
      res.status(200).send("Airtime purchase successful");
    } else {
      return res.status(400).send("Incorrect pin");
    }
  }
});

module.exports = router;