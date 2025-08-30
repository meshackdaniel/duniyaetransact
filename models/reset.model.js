const mongoose = require("mongoose");
const resetSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
  },
  token: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
    expires: 3600, // Expires after 3600 seconds (1 hour)
  },
});

const Reset = mongoose.model("Reset", resetSchema);
module.exports = Reset;