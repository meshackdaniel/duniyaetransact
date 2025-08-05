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
      profile: getUser.profile || "images/profile.png" // Default profile image if not set
    };
  res.render("transactions", {
    title: "Transactions",
    user: user,
    name: "Duniya Comm",
  });
});

module.exports = router;