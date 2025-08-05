require("dotenv").config();
const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const mongoose = require("mongoose");
const User = require("../models/user.model");

router.use(express.json());

mongoose
  .connect(process.env.ATLAS_URI)
  .then(() => {
    console.log("Connected to MongoDB");
  })
  .catch((err) => {
    console.error("MongoDB connection error:", err);
  });
// Import the home route
router.get("/", (req, res) => {
  // Authenticate user
  res.render("signup", { title: "Signup", name: "Duniya Comm" });
});

router.post("/", async (req, res) => {
  try {
    const name = req.body.fullname;
    const phone = req.body.phone;
    const email = req.body.email;
    const countryCode = req.body.countryCode;
    const hashedPassword = await bcrypt.hash(req.body.password, 10);
    const user = {
      name: name,
      password: hashedPassword,
      email: email,
      phone: phone,
      countryCode: countryCode,
      profile: ""
    };
    await User.create(user);
    res.status(201).send();
  } catch (e) {
    console.log(e);
    res.status(500).send();
  }
});

module.exports = router;
