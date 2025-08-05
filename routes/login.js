require("dotenv").config();
const mongoose = require("mongoose");
const User = require("../models/user.model");
const express = require("express");
const router = express.Router();
//  require jwt for authentication
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");

// Import the home route
router.get("/", (req, res) => {
  res.render("login", { title: "Login", name: "Duniya Comm" });
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
  const { email, password } = req.body;
  const user = await User.findOne({ email: email });

  if (!user) {
    return res.status(400).send("Invalid Credentials");
  }
  try {
    if (await bcrypt.compare(password, user.password)) {
      console.log("Password match");
      const username = user.email;
      const accessToken = jwt.sign({username}, process.env.ACCESS_TOKEN_SECRET, {
        expiresIn: "1m",
      });
      const refreshToken = jwt.sign(
        {username},
        process.env.REFRESH_TOKEN_SECRET,
        { expiresIn: "1d" }
      );
      const currentUser = { ...user, refreshToken };
      res.cookie("refreshToken", refreshToken, {
        httpOnly: true,
        maxAge: 24 * 60 * 60 * 1000, // 1 day
        // secure: process.env.NODE_ENV === "production", // Use secure cookies in production
        // sameSite: "Strict",
      });
      res.json({ accessToken });
      // return res.status(200).send({ status: "user found" });
    } else {
      console.log("Password does not match");
      return res.status(400).send("Invalid Credentials");
    }
  } catch (error) {
    console.log("Error during password comparison:", error);
    res.status(500).send();
  }
});

module.exports = router;
