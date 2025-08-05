const express = require("express");
const router = express.Router();

// Import the home route
router.get("/", (req, res) => {
  res.render("terms-of-service", { title: "Terms of Service", name: "Duniya Comm" });
});

module.exports = router;