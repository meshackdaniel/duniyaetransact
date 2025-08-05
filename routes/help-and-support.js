const express = require("express");
const router = express.Router();

// Import the home route
router.get("/", (req, res) => {
  res.render("help-and-support", { title: "Help and Support", name: "Duniya Comm" });
});

module.exports = router;