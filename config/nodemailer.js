require("dotenv").config();
const nodemailer = require("nodemailer");

// Configure the nodemailer transporter
// Replace with your email and password
// Ensure to use environment variables for sensitive information in production
const email = process.env.NODEMAILER_EMAIL;
const password = process.env.NODEMAILER_PASSWORD; // Use environment variable or hardcoded password for testing

export const transporter = nodemailer.createTransport({
  service: process.env.NODEMAILER_SERVICE,
  auth: {
    user: email,
    pass: password,
  },
});

export const mailOptions = {
  from: email,
  to: email,
};
