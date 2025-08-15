require("dotenv").config();
const express = require("express");
const router = express.Router();
const nodemailer = require("nodemailer");
const myEmail = process.env.NODEMAILER_EMAIL;
const password = process.env.NODEMAILER_PASSWORD; // Use environment variable or hardcoded password for testing

const transporter = nodemailer.createTransport({
  service: process.env.NODEMAILER_SERVICE,
  auth: {
    user: myEmail,
    pass: password,
  },
});

const dataToHTML = (data) => {
  let str = "";
  for (const [key, value] of Object.entries(data)) {
    str += `<h3>${key}:</h3><p>${value}</p>`;
  }
  return str;
};

const dataToText = (data) => {
  let str = "";
  for (const [key, value] of Object.entries(data)) {
    str += `${key} - ${value} \n`;
  }
  return str;
};

// Import the home route
router.get("/", (req, res) => {
  res.render("contact", { title: "Contact", name: "Duniya Comm" });
});

router.post("/", async (req, res) => {
  const values = req.body;
  try {
    await transporter.sendMail({
      from: myEmail,
      to: myEmail,
      text: `Contact form Duniya comm \n ${dataToText(values)}`,
      html: `
                <!DOCTYPE html>
                <html lang="en">
                    <head>
                        <meta charset="UTF-8">
                        <meta name="viewport" content="width=device-width, initial-scale=1.0">
                        <title>Contact Form</title>
                    </head>
                    <body>
                        <div style="max-width: 800px; margin: auto; padding: 10px; border: 1px #000 dotted">
                            <h1>Contact Form</h1>
                            ${dataToHTML(values)}
                        </div>
                    </body>
                </html>    
            `,
      subject: "Contact Form",
    });
    return res.status(200).json({ message: "successful" });
  } catch (error) {
    return res.status(400).json({ message: "failed" });
  }
});

module.exports = router;
