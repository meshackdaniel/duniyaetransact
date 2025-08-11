const mongoose = require("mongoose");
const confirmationSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
  },
  code: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
    expires: 300, // Expires after 300 seconds (5 minutes)
  },
});

const Confirmation = mongoose.model("Confirmation", confirmationSchema);
module.exports = Confirmation;