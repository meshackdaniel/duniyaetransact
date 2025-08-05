const express = require("express");
const router = express.Router();

// Import the home route
router.get("/", (req, res) => {
  res.render("security", { title: "Security", name: "Duniya Comm" });
});

module.exports = router;