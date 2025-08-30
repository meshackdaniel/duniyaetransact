const mongoose = require("mongoose");
const referralCodeSchema = new mongoose.Schema({
  code: {
    type: String,
    required: true,
    unique: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const ReferralCode = mongoose.model("ReferralCode", referralCodeSchema);
module.exports = ReferralCode;