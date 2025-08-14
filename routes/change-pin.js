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
  res.render("change-pin", {
    title: "Change Pin",
    user: user,
    name: "Duniya Comm",
  });
});

router.post("/", async (req, res) => {
  console.log("in change pin");
  const { currentPin, newPin, confirmPin, email } = req.body;
  if (!currentPin || !newPin || !confirmPin || !email) {
    return res.status(400).send("All fields are required");
  }

  if (newPin !== confirmPin) {
    return res
      .status(400)
      .send("New pin and confirm pin do not match");
  }

  if (newPin.length < 4) {
    return res
      .status(400)
      .send("New pin must be at least 6 characters long");
  }

  const getUser = await User.findOne({ email: email });
  if (!getUser) {
    console.log("user not found");
    return res.status(404).send("User not found");
  }

  const pinMatch = await bcrypt.compare(
    currentPin,
    getUser.pin,
    async (err, result) => {
      if (result) {
        const newHashedPin = await bcrypt.hash(newPin, 10);
        const updatedUser = await User.findOneAndUpdate(
          { email: email },
          { pin: newHashedPin },
          { new: true }
        );
        return res
          .status(200)
          .json({ message: "Pin updated successfully" });
      } else {
        return res
          .status(404)
          .json({ message: "Current pin is incorrect" });
      }
    }
  );
});

module.exports = router;
