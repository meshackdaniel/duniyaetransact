const express = require("express");
const router = express.Router();

// Import the home route
router.get("/", (req, res) => {
  res.render("contact", { title: "Contact", name: "Duniya Comm" });
});

module.exports = router;