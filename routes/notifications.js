const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const User = require("../models/user.model");

// Import the home route
router.get("/", async (req, res) => {
  const username = req.user ? req.user.username : "";
  try {
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
      account: getUser.account,
    };
    res.render("notifications", {
      title: "Notifications",
      user: user,
      name: "Duniya Comm",
    });
  } catch (error) {
    return res.render("internalservererror", {title: "Server Error",name: "Duniya Comm"});
  }
});

module.exports = router;