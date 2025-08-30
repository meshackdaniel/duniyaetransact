const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const User = require("../models/user.model");
const Transaction = require("../models/transaction.model");
const bcrypt = require("bcrypt");

// Import the home route
router.get("/", async (req, res) => {
  const username = req.user ? req.user.username : "";
  try {
    const getUser = await User.findOne({ email: username });
    if (!getUser) {
      return res.status(404).send("User not found");
    }
    const user = {
      name: getUser.name,
      email: getUser.email,
      phone: getUser.phone,
      countryCode: getUser.countryCode,
      profile: getUser.profile || "images/profile.png", // Default profile image if not set
      notifications: getUser.notifications.slice(0, 3) || [],
    };
    res.render("airtime", {
      title: "Airtime",
      user: user,
      name: "Duniya Comm",
    });
  } catch (error) {
  return res.render("internalservererror", {title: "Server Error",name: "Duniya Comm"}) 
  }
  
});

// Handle the form submission
router.post("/", async (req, res) => {
  const { phoneNumber, amount, pin, network, email } = req.body;
  try {
    const getUser = await User.findOne({ email: email });
    if (!getUser) {
      return res.status(404).send("User not found");
    } else {
      if (await bcrypt.compare(pin, getUser.pin)) {
        if (amount > getUser.account.accountBalance) {
          return res.status(400).json({ message: "Insufficient Balance" });
        } else {
          const updatedUser = await User.updateOne(
            { email: email },
            { $inc: { "account.accountBalance": -amount } },
            { new: true }
          );
          if (!updatedUser) {
            return res
              .status(500)
              .json({ message: "Failed to update balance" });
          }
          const createTransaction = await Transaction.create({
            user: getUser._id,
            category: "airtime",
            amount: amount,
            recipient: phoneNumber,
            status: "successful",
            network: network,
            phoneNumber: phoneNumber,
            description: `Airtime purchase of ${amount} on ${network} network`,
          });
          const transaction = await User.updateOne(
            { email: email },
            {
              $push: {
                transactions: createTransaction._id,
              },
            },
            { new: true }
          );
          if (network == "GLO") {
            console.log("GLO network selected");
            const message = { status: "ok", resultCode: "0000" };
            if (message.resultCode === "0000") {
              const transactionDetails = {
                message: "Airtime purchase successful",
                status: "succesful",
                id: createTransaction._id,
                service: network,
                phoneNumber: phoneNumber,
                amount: amount,
                date: createTransaction.date.toLocaleDateString(),
                time: createTransaction.date.toLocaleTimeString(),
              };
              return res.status(200).json(transactionDetails);
            } else if (message.resultCode === "0002") {
              const transactionDetails = {
                message: "airtime purchase pending",
                status: "pending",
                id: createTransaction._id,
                service: network,
                phoneNumber: phoneNumber,
                amount: amount,
                date: createTransaction.date.toLocaleDateString(),
                time: createTransaction.date.toLocaleTimeString(),
              };
              return res.status(200).json(transactionDetails);
            } else {
              const transactionDetails = {
                message: "airtime purchase failed",
                status: "failed",
                id: createTransaction._id,
                service: network,
                phoneNumber: phoneNumber,
                amount: amount,
                date: createTransaction.date.toLocaleDateString(),
                time: createTransaction.date.toLocaleTimeString(),
              };
              return res.status(400).json(transactionDetails);
            }
          }
          if (network == "MTN") {
            const message = { status: "ok", resultCode: "0000" };
            if (message.resultCode === "0000") {
              const transactionDetails = {
                message: "Airtime purchase successful",
                status: "succesful",
                id: createTransaction._id,
                service: network,
                phoneNumber: phoneNumber,
                amount: amount,
                amount: amount,
                validity: validity,
                date: createTransaction.date.toLocaleDateString(),
                time: createTransaction.date.toLocaleTimeString(),
              };
              return res.status(200).json(transactionDetails);
            } else if (message.resultCode === "0002") {
              const transactionDetails = {
                message: "airtime purchase pending",
                status: "pending",
                id: createTransaction._id,
                service: network,
                phoneNumber: phoneNumber,
                amount: amount,
                date: createTransaction.date.toLocaleDateString(),
                time: createTransaction.date.toLocaleTimeString(),
              };
              return res.status(200).json(transactionDetails);
            } else {
              const transactionDetails = {
                message: "airtime purchase failed",
                status: "failed",
                id: createTransaction._id,
                service: network,
                phoneNumber: phoneNumber,
                amount: amount,
                date: createTransaction.date.toLocaleDateString(),
                time: createTransaction.date.toLocaleTimeString(),
              };
              return res.status(400).json(transactionDetails);
            }
          }
          if (network == "Airtel") {
            const message = { status: "ok", resultCode: "0000" };
            if (message.resultCode === "0000") {
              const transactionDetails = {
                message: "Airtime purchase successful",
                status: "succesful",
                id: createTransaction._id,
                service: network,
                phoneNumber: phoneNumber,
                amount: amount,
                date: createTransaction.date.toLocaleDateString(),
                time: createTransaction.date.toLocaleTimeString(),
              };
              return res.status(200).json(transactionDetails);
            } else if (message.resultCode === "0002") {
              const transactionDetails = {
                message: "airtime purchase pending",
                status: "pending",
                id: createTransaction._id,
                service: network,
                phoneNumber: phoneNumber,
                amount: amount,
                date: createTransaction.date.toLocaleDateString(),
                time: createTransaction.date.toLocaleTimeString(),
              };
              return res.status(200).json(transactionDetails);
            } else {
              const transactionDetails = {
                message: "airtime purchase failed",
                status: "failed",
                id: createTransaction._id,
                service: network,
                phoneNumber: phoneNumber,
                amount: amount,
                date: createTransaction.date.toLocaleDateString(),
                time: createTransaction.date.toLocaleTimeString(),
              };
              return res.status(400).json(transactionDetails);
            }
          }
          if (network == "9mobile") {
            const message = { status: "ok", resultCode: "0000" };
            if (message.resultCode === "0000") {
              const transactionDetails = {
                message: "Airtime purchase successful",
                status: "succesful",
                id: createTransaction._id,
                service: network,
                phoneNumber: phoneNumber,
                amount: amount,
                date: createTransaction.date.toLocaleDateString(),
                time: createTransaction.date.toLocaleTimeString(),
              };
              return res.status(200).json(transactionDetails);
            } else if (message.resultCode === "0002") {
              const transactionDetails = {
                message: "airtime purchase pending",
                status: "pending",
                id: createTransaction._id,
                service: network,
                phoneNumber: phoneNumber,
                amount: amount,
                date: createTransaction.date.toLocaleDateString(),
                time: createTransaction.date.toLocaleTimeString(),
              };
              return res.status(200).json(transactionDetails);
            } else {
              const transactionDetails = {
                message: "airtime purchase failed",
                status: "failed",
                id: createTransaction._id,
                service: network,
                phoneNumber: phoneNumber,
                amount: amount,
                date: createTransaction.date.toLocaleDateString(),
                time: createTransaction.date.toLocaleTimeString(),
              };
              return res.status(400).json(transactionDetails);
            }
          }
        }
      } else {
        console.log("Incorrect pin");
        return res.status(400).json({ message: "Incorrect pin" });
      }
    }
  } catch (error) {
    return res.render("internalservererror", {title: "Server Error",name: "Duniya Comm"})
  }
});

module.exports = router;
