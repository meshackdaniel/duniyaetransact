const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const User = require("../models/user.model");
const bcrypt = require("bcrypt");

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
    };
    res.render("change-password", {
      title: "Change Password",
      user: user,
      name: "Duniya Comm",
    });
  } catch (error) {
    return res.render("internalservererror", {title: "Server Error",name: "Duniya Comm"});
  }
});

router.post("/", async (req, res) => {
  console.log("in change password");
  const { currentPassword, newPassword, confirmPassword, email } = req.body;
  if (!currentPassword || !newPassword || !confirmPassword || !email) {
    return res.status(400).send("All fields are required");
  }

  if (newPassword !== confirmPassword) {
    return res
      .status(400)
      .send("New password and confirm password do not match");
  }

  if (newPassword.length < 6) {
    return res
      .status(400)
      .send("New password must be at least 6 characters long");
  }

  try {
    const getUser = await User.findOne({ email: email });
    if (!getUser) {
      console.log("user not found");
      return res.status(404).send("User not found");
    }

    const passwordMatch = await bcrypt.compare(
      currentPassword,
      getUser.password,
      async (err, result) => {
        if (result) {
          const newHashedPassword = await bcrypt.hash(newPassword, 10);
          const updatedUser = await User.findOneAndUpdate(
            { email: email },
            { password: newHashedPassword },
            { new: true }
          );
          return res
            .status(200)
            .json({ message: "Password updated successfully" });
        } else {
          return res
            .status(404)
            .json({ message: "Current password is incorrect" });
        }
      }
    );
  } catch (error) {
    return res.render("internalservererror", {title: "Server Error",name: "Duniya Comm"});
  }
});

module.exports = router;
