const express = require("express");
const router = express.Router();

// Import the home route
router.get("/", (req, res) => {
  res.render("cookie-policy", { title: "Cookie Policy", name: "Duniya Comm" });
});

module.exports = router;