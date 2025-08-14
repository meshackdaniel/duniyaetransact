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
  res.render("airtime", { title: "Airtime", user: user, name: "Duniya Comm" });
});

// Handle the form submission
router.post("/", async (req, res) => {
  const { phoneNumber, amount, pin, network, email } = req.body;
  const getUser = await User.findOne({ email: email });
  const gloBody = {
    transId: "Glo00002",
    msisdn: "234" + phoneNumber,
    bucketId: 12,
    planId: 550,
    sponsorId: "Glotest",
    quantity: 1,
    ignoresms: false,
  };
  if (!getUser) {
    return res.status(404).send("User not found");
  } else {
    if (await bcrypt.compare(pin, getUser.pin)) {
      if (network == "GLO") {
      console.log("network is glo");
        fetch("https://gift-api.gloworld.com/ ", {
          method: "POST",
          body: JSON.stringify(gloBody),
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
            "x-api-key":
              "glotest:aDUy7OHTM7l.pe3.kAuRJZRKXOiGZC5WjJ9-qmbJ-XvBzcOrz7",
          },
        }).then(async (data) => {
          console.log(data);
          if (!data.ok) {
            throw new Error("Internal server error");
          } else {
          }
        });
      }
      const updatedUser = await User.updateOne(
        { email: email },
        { $inc: { "account.accountBalance": -amount } },
        { new: true }
      );
      if (updatedUser) {
        const transaction = await User.updateOne(
          { email: email },
          {
            $push: {
              "account.transactions": {
                category: "airtime",
                amount: amount,
                recipient: phoneNumber,
                status: "successful",
              },
            },
          },
          { new: true }
        );
        console.log("Balance updated successfully");
      }
      res.status(200).send("Airtime purchase successful");
    } else {
      return res.status(400).json({ message: "Incorrect pin" });
    }
  }
});

module.exports = router;
