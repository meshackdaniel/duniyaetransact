const { MongoClient, ServerApiVersion } = require("mongodb");
const mongoose = require("mongoose");
const { name } = require("ejs");
const express = require("express");
const expressLayouts = require("express-ejs-layouts");
const app = express();
require("dotenv").config();
const port = process.env.PORT || 8080;
const cookieParser = require("cookie-parser");
const path = require("path");
//  require jwt for authentication
const jwt = require("jsonwebtoken");
const { createCanvas, loadImage } = require("canvas");
const QRCode = require("qrcode");
const fs = require("fs");
const PDFDocument = require("pdfkit");
const cors = require("cors"); // Added for CORS support
// Set view engine to EJS
app.set("view engine", "ejs");

const Confirmation = require("./models/confirmation.model");
const User = require("./models/user.model");
const Transaction = require("./models/transaction.model");
const ReferralCode = require("./models/referralCode.model");

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

// MIDDLEWARES
// Add this middleware to parse JSON bodies
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
// Serve static files from the "public" directory
app.use(express.static(path.join(__dirname, "public")));
app.use(cors());

const authenticateToken = (req, res, next) => {
  console.log("Authenticating token...");
  //   const authHeader = req.headers["authorization"];
  //   console.log("Authorization header:", authHeader);
  //   const token = authHeader && authHeader.split(" ")[1];
  const token = req.cookies.refreshToken;
  if (token == null) {
    res.redirect("/login");
    res.sendStatus(401);
  }

  jwt.verify(token, process.env.REFRESH_TOKEN_SECRET, (err, decodedUser) => {
    if (err) return res.sendStatus(403);
    req.user = decodedUser;
    next();
  });
};

app.use(expressLayouts);

const homeRouter = require("./routes/home");
app.use("/", homeRouter);

const aboutRouter = require("./routes/about");
app.use("/about", aboutRouter);

const contactRouter = require("./routes/contact");
app.use("/contact", contactRouter);

const termsOfServiceRouter = require("./routes/terms-of-service");
app.use("/terms-of-service", termsOfServiceRouter);

const securityRouter = require("./routes/security");
app.use("/security", securityRouter);

const cookieRouter = require("./routes/cookie-policy");
app.use("/cookie-policy", cookieRouter);

const loginRouter = require("./routes/login");
app.use("/login", loginRouter);

const forgotPasswordRouter = require("./routes/forgot-password");
app.use("/forgot-password", forgotPasswordRouter);

const forgotPinRouter = require("./routes/forgot-pin");
app.use("/forgot-pin", forgotPinRouter);

const resetPasswordRouter = require("./routes/reset-password");
app.use("/reset-password", resetPasswordRouter);

const resetPinRouter = require("./routes/reset-pin");
app.use("/reset-pin", resetPinRouter);

const signupRouter = require("./routes/signup");
app.use("/signup", signupRouter);

const dashboardRouter = require("./routes/dashboard");
app.use("/dashboard", authenticateToken, dashboardRouter);

const notificationsRouter = require("./routes/notifications");
app.use("/notifications", authenticateToken, notificationsRouter);

const transactionsRouter = require("./routes/transactions");
app.use("/transactions", authenticateToken, transactionsRouter);

const myAccountRouter = require("./routes/my-account");
app.use("/my-account", authenticateToken, myAccountRouter);

const referralRouter = require("./routes/referral");
app.use("/referral", authenticateToken, referralRouter);

const notificationPrefrencesRouter = require("./routes/notification-prefrences");
app.use(
  "/notification-prefrences",
  authenticateToken,
  notificationPrefrencesRouter
);

const changePinRouter = require("./routes/change-pin");
app.use("/change-pin", authenticateToken, changePinRouter);

const changePasswordRouter = require("./routes/change-password");
app.use("/change-password", authenticateToken, changePasswordRouter);

const airtimeRouter = require("./routes/airtime");
app.use("/airtime", authenticateToken, airtimeRouter);

const dataRouter = require("./routes/data");
app.use("/data", authenticateToken, dataRouter);

const nimcVerificationRouter = require("./routes/nimc-verification");
app.use("/nimc-verification", authenticateToken, nimcVerificationRouter);

const fundAccountRouter = require("./routes/fund-account");
app.use("/fund-account", authenticateToken, fundAccountRouter);

const helpAndSupportRouter = require("./routes/help-and-support");
app.use("/help-and-support", helpAndSupportRouter);

const accountCreatedRouter = require("./routes/account-created");
app.use("/account-created", authenticateToken, accountCreatedRouter);

const nimcDemographicSearchRouter = require("./routes/nimc-verification/demographic-search");
const req = require("express/lib/request");
app.use(
  "/nimc-verification/demographic-search",
  authenticateToken,
  nimcDemographicSearchRouter
);

const nimcNinSearchRouter = require("./routes/nimc-verification/nin-search");
app.use(
  "/nimc-verification/nin-search",
  authenticateToken,
  nimcNinSearchRouter
);

const nimcPhoneSearchRouter = require("./routes/nimc-verification/phone-search");
app.use(
  "/nimc-verification/phone-search",
  authenticateToken,
  nimcPhoneSearchRouter
);

function generateRandomString(max) {
  const characters =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let result = "";
  for (let i = 0; i < max; i++) {
    const randomIndex = Math.floor(Math.random() * characters.length);
    result += characters[randomIndex];
  }
  return result;
}

app.post("/api/send-confirmation-email", async (req, res) => {
  const { email } = req.body;
  const code = generateRandomString(6);
  const getConfirmation = await Confirmation.findOne({ email });
  if (getConfirmation) {
    const updatedConfirmation = await Confirmation.deleteOne({ email });
  }
  await Confirmation.create({ email, code });
  try {
    await transporter.sendMail({
      from: myEmail,
      to: email,
      text: `Your confirmation code for duniya comm is: ${code}`,
      subject: "Confirmation code for duniya comm",
    });
    res.status(200).json({
      message: "Confirmation email sent successfully",
    });
  } catch (error) {
    console.log(error);
  }
});

app.post("/api/resend-confirmation-email", async (req, res) => {
  const { email } = req.body;
  const code = generateRandomString(6);
  console.log("Email received:", email);
  const getConfirmation = await Confirmation.findOne({ email });
  if (getConfirmation) {
    const updatedConfirmation = await Confirmation.deleteOne({ email });
  }
  await Confirmation.create({ email, code });
  try {
    await transporter.sendMail({
      from: myEmail,
      to: email,
      text: `Your confirmation code for duniya comm is: ${code}`,
      subject: "Confirmation code for duniya comm",
    });
    res.status(200).json({
      message: "Confirmation email sent successfully",
    });
  } catch (error) {
    console.log(error);
  }
});

app.post("/api/edit-profile", async (req, res) => {
  const {
    firstName,
    lastName,
    email,
    newEmail,
    phoneNumber,
    dateOfBirth,
    gender,
    address,
    city,
    state,
  } = req.body;
  const getUser = await User.findOne({ email: email });
  if (getUser) {
    const updatedUser = await User.updateOne(
      { email: email },
      { firstName: firstName },
      { secondName: lastName },
      { dateOfBirth: dateOfBirth },
      { gender: gender },
      { address: address },
      { city: city },
      { state: state }
    );
    if (updatedUser) {
      return res.status(200).send("Profile Updated Successfully");
    }
  } else return res.status(400).send("Unauthorized");
});

app.post("/api/check-email", async (req, res) => {
  const { email, phone, referrerCode } = req.body;
  const getUser = await User.findOne({ email: email });
  const getPhone = await User.findOne({ phone: phone });
  if (getUser) {
    return res
      .status(400)
      .json({ message: "This email has been used by anorther user" });
  }
  if (getPhone) {
    return res
      .status(400)
      .json({ message: "This phone number has been used by anorther user" });
  }
  if (referrerCode.length == 6) {
    const checkReferrer = await ReferralCode.findOne({ code: referrerCode });
    if (!checkReferrer) {
      console.log("Invalid referrer code");
      return res.status(400).json({ message: "Invalid referrer code" });
    }
  }
  return res.status(200).send();
});

app.post("/api/delete-action", async (req, res) => {
  const { email } = req.body;
  const deletedUser = User.findByIdAndDelete({ email: email });
  if (deletedUser) {
    res.status(200).send("User Deleted");
    res.clearCookie("refreshToken");
    res.redirect("/");
  } else return res.status(400).send("unautorized");
});

app.get("/logout", (req, res) => {
  res.clearCookie("refreshToken");
  res.redirect("/");
});

app.post("/api/get-nin", async (req, res) => {
  const { nin, type, email, phone } = req.body;
  const getUser = await User.findOne({ email: email });
  console.log(phone.length);
  let amount;
  if (nin) {
    if (type == "premium") {
      amount = 350;
    } else if (type == "improved") {
      amount = 240;
    } else {
      amount = 200;
    }
    if (!getUser) {
      return res.status(400).send("user not found");
    }
    if (amount > getUser.account.accountBalance) {
      return res.status(400).json({ message: "Insufficient Balance" });
    } else {
      const updatedUser = await User.updateOne(
        { email: email },
        { $inc: { "account.accountBalance": -amount } },
        { new: true }
      );
      if (!updatedUser) {
        return res.status(500).json({ message: "Failed to update balance" });
      }
    }
    if (!nin) {
      return res.status(400).json({ message: "NIN is required" });
    }
    if (nin.length !== 11) {
      return res
        .status(400)
        .json({ message: "NIN must be 11 characters long" });
    }
    if (!/^\d{11}$/.test(nin)) {
      return res.status(400).json({ message: "NIN must be numeric" });
    }
    if (nin === "12345678901") {
      console.log(nin);
      const feedback = {
        status: true,
        data: {
          birthdate: "10-12-1994",
          email: "email@yahoo.com",
          emplymentstatus: "self employed",
          firstname: "Meshack",
          gender: "f",
          maritalstatus: "single",
          middlename: "Ariwola",
          nin: "12345678901",
          photo:
            "/9j/4AAQSkZJRgABAgAAAQABAAD/2wBDAAgGBgcGBQgHBwcJCQgKDBQNDAsLDBkSEw8UHRofHh0a\nHBwgJC4...",
          profession: "BUSINESS",
          religion: "christianity",
          residence_AdressLine1: "11 TUNAKIA STREET BARUWA",
          residence_Town: "Abuna",
          residence_lga: "Ananbis",
          residence_state: "Abuja",
          residencestatus: "birth",
          signature:
            "/9j/4AAQSkZJRgABAgAAAQABAAD/2wBDA\nRRRRRRRRRRRRRRRRRRRRkdfgdknfgdfksdf\nRRRRRRRRXdfs...",
          surname: "AHMED",
          telephoneno: "12345678901",
          title: "miss",
          trackingId: "123456789",
        },
      };
      if (feedback.status == true) {
        res.status(200).json({
          ...feedback,
          issueDate: new Date().toLocaleDateString(),
          type,
        });
      }
    }
  }
  if (phone.length == 10) {
    if (type == "premium") {
      amount = 350;
    } else if (type == "improved") {
      amount = 240;
    } else {
      amount = 200;
    }
    if (!getUser) {
      return res.status(400).send("user not found");
    }
    if (amount > getUser.account.accountBalance) {
      return res.status(400).json({ message: "Insufficient Balance" });
    } else {
      const updatedUser = await User.updateOne(
        { email: email },
        { $inc: { "account.accountBalance": -amount } },
        { new: true }
      );
      if (!updatedUser) {
        return res.status(500).json({ message: "Failed to update balance" });
      }
    }
    if (!phone) {
      return res.status(400).json({ message: "Phone number is required" });
    }
    if (phone.length !== 10) {
      return res
        .status(400)
        .json({ message: "Phone must be 11 characters long" });
    }
    if (phone === "9070807080") {
      console.log(phone);
      const feedback = {
        status: true,
        data: {
          birthdate: "10-12-1994",
          email: "email@yahoo.com",
          emplymentstatus: "self employed",
          firstname: "Meshack",
          gender: "f",
          maritalstatus: "single",
          middlename: "Ariwola",
          nin: "12345678901",
          photo:
            "/9j/4AAQSkZJRgABAgAAAQABAAD/2wBDAAgGBgcGBQgHBwcJCQgKDBQNDAsLDBkSEw8UHRofHh0a\nHBwgJC4...",
          profession: "BUSINESS",
          religion: "christianity",
          residence_AdressLine1: "11 TUNAKIA STREET BARUWA",
          residence_Town: "Abuna",
          residence_lga: "Ananbis",
          residence_state: "Abuja",
          residencestatus: "birth",
          signature:
            "/9j/4AAQSkZJRgABAgAAAQABAAD/2wBDA\nRRRRRRRRRRRRRRRRRRRRkdfgdknfgdfksdf\nRRRRRRRRXdfs...",
          surname: "AHMED",
          telephoneno: "12345678901",
          title: "miss",
          trackingId: "123456789",
        },
      };
      if (feedback.status == true) {
        res.status(200).json({
          ...feedback,
          issueDate: new Date().toLocaleDateString(),
          type,
        });
      }
    }
  }
});

// Route to process image with text and overlay
app.post("/api/create-nin", async (req, res) => {
  const { type } = req.body;
  if (type == "premium") {
    const { nin, surname, firstname, middlename, dateOfBirth, gender } =
      req.body;
    let responseSent = false; // Flag to prevent multiple response writes
    try {
      // Extract and validate NIN from request body
      const filename = "premium_nin.pdf"; // Allow filename in body
      if (!nin) {
        return res.status(400).json({ message: "NIN is required" });
      }
      if (nin.length !== 11) {
        return res
          .status(400)
          .json({ message: "NIN must be 11 characters long" });
      }
      if (!/^\d{11}$/.test(nin)) {
        return res.status(400).json({ message: "NIN must be numeric" });
      }
      // Validate filename
      if (!filename.match(/^[a-zA-Z0-9_-]+\.pdf$/)) {
        return res.status(400).json({
          message:
            "Invalid filename. Use alphanumeric characters and .pdf extension.",
        });
      }

      // Mock feedback data for NIN
      if (nin === "12345678901") {
        // Parameters for canvas rendering
        const prenorms = middlename + ", " + firstname;
        const issueDate = new Date().toLocaleDateString();
        const fontSize = 50;
        const font = "Arial";
        const textColor = "black";
        const ninX = 570;
        const ninY = 680;
        const overlayX = 455;
        const overlayY = 430;
        const overlayWidth = 130;
        const overlayHeight = 160;
        const name = "MESHACK KANTIOK DANIEL"; // Hardcoded as per original

        // Check if image files exist
        const baseImagePath = "./premiumninslip.png";
        const overlayImagePath = "./passport.jpg";
        if (!fs.existsSync(baseImagePath)) {
          return res
            .status(400)
            .json({ message: `Base image not found at ${baseImagePath}` });
        }
        if (!fs.existsSync(overlayImagePath)) {
          return res.status(400).json({
            message: `Overlay image not found at ${overlayImagePath}`,
          });
        }

        // Load the base image
        let baseImage;
        try {
          baseImage = await loadImage(baseImagePath);
        } catch (err) {
          return res
            .status(500)
            .json({ message: `Failed to load base image: ${err.message}` });
        }

        // Create a canvas
        const canvas = createCanvas(baseImage.width, baseImage.height);
        const ctx = canvas.getContext("2d");

        // Draw the base image
        ctx.drawImage(baseImage, 0, 0);

        // Add surname text
        ctx.font = `bold 17px ${font}`;
        ctx.fillStyle = textColor;
        ctx.fillText(surname, 613, 462);

        // Add prenorms text
        ctx.font = `bold 17px ${font}`;
        ctx.fillStyle = textColor;
        ctx.fillText(prenorms, 613, 518);

        // Add DOB text
        ctx.font = `bold 17px ${font}`;
        ctx.fillStyle = textColor;
        ctx.fillText(dateOfBirth, 613, 572);

        // Add Gender text
        ctx.font = `bold 17px ${font}`;
        ctx.fillStyle = textColor;
        ctx.fillText(gender, 774, 572);

        // Add Issue date text
        ctx.font = `bold 14px ${font}`;
        ctx.fillStyle = textColor;
        ctx.fillText(issueDate, 936, 600);

        // Add NIN text
        ctx.font = `bold ${fontSize}px ${font}`;
        ctx.fillStyle = textColor;
        ctx.fillText(nin, ninX, ninY);

        // Load and draw the passport image
        let overlayImage;
        try {
          overlayImage = await loadImage(overlayImagePath);
        } catch (err) {
          return res
            .status(500)
            .json({ message: `Failed to load overlay image: ${err.message}` });
        }
        ctx.drawImage(
          overlayImage,
          overlayX,
          overlayY,
          overlayWidth,
          overlayHeight
        );

        // Create and draw the QR code
        const qrCanvas = createCanvas(150, 150);
        try {
          await QRCode.toCanvas(qrCanvas, `${name}|${nin}`, {
            width: 150,
            margin: 1,
            errorCorrectionLevel: "H",
          });
        } catch (err) {
          return res
            .status(500)
            .json({ message: `Failed to generate QR code: ${err.message}` });
        }
        ctx.drawImage(qrCanvas, 890, 370, 150, 150);

        // Create a PDF document
        const doc = new PDFDocument({
          size: [baseImage.width, baseImage.height],
        });

        // Set response headers for PDF download
        res.setHeader("Content-Type", "application/pdf");
        res.setHeader(
          "Content-Disposition",
          `attachment; filename="${filename}"`
        );
        responseSent = true;

        // Pipe the PDF to the response
        doc.pipe(res);

        // Embed the canvas image into the PDF
        let imageBuffer;
        try {
          imageBuffer = canvas.toBuffer("image/png");
        } catch (err) {
          if (!res.headersSent) {
            return res.status(500).json({
              message: `Failed to generate image buffer: ${err.message}`,
            });
          }
          throw err;
        }
        doc.image(imageBuffer, 0, 0, {
          width: baseImage.width,
          height: baseImage.height,
        });

        // Handle PDF stream errors
        doc.on("error", (err) => {
          console.error(`PDF stream error: ${err.message}`);
          if (!responseSent) {
            res
              .status(500)
              .json({ message: `PDF generation failed: ${err.message}` });
          }
        });

        // Finalize the PDF
        doc.end();
      } else {
        return res.status(404).json({ message: "NIN not found" });
      }
    } catch (error) {
      console.error(`General error: ${error.message}`);
      if (!responseSent) {
        res
          .status(500)
          .json({ message: `Error processing image: ${error.message}` });
      }
    }
  }
  if (type == "improved") {
    const { nin, surname, firstname, middlename, dateOfBirth, gender } =
      req.body;
    let responseSent = false; // Flag to prevent multiple response writes
    try {
      // Extract and validate NIN from request body
      const filename = "improved_nin.pdf"; // Allow filename in body
      if (!nin) {
        return res.status(400).json({ message: "NIN is required" });
      }
      if (nin.length !== 11) {
        return res
          .status(400)
          .json({ message: "NIN must be 11 characters long" });
      }
      if (!/^\d{11}$/.test(nin)) {
        return res.status(400).json({ message: "NIN must be numeric" });
      }
      // Validate filename
      if (!filename.match(/^[a-zA-Z0-9_-]+\.pdf$/)) {
        return res.status(400).json({
          message:
            "Invalid filename. Use alphanumeric characters and .pdf extension.",
        });
      }

      // Mock feedback data for NIN
      if (nin === "12345678901") {
        // Parameters for canvas rendering
        const prenorms = middlename + ", " + firstname;
        const issueDate = new Date().toLocaleDateString();
        const fontSize = 50;
        const font = "Arial";
        const textColor = "black";
        const ninX = 570;
        const ninY = 680;
        const overlayX = 455;
        const overlayY = 430;
        const overlayWidth = 130;
        const overlayHeight = 160;
        const name = "MESHACK KANTIOK DANIEL"; // Hardcoded as per original

        // Check if image files exist
        const baseImagePath = "./improvedninslip.png";
        const overlayImagePath = "./passport.jpg";
        if (!fs.existsSync(baseImagePath)) {
          return res
            .status(400)
            .json({ message: `Base image not found at ${baseImagePath}` });
        }
        if (!fs.existsSync(overlayImagePath)) {
          return res.status(400).json({
            message: `Overlay image not found at ${overlayImagePath}`,
          });
        }

        // Load the base image
        let baseImage;
        try {
          baseImage = await loadImage(baseImagePath);
        } catch (err) {
          return res
            .status(500)
            .json({ message: `Failed to load base image: ${err.message}` });
        }

        // Create a canvas
        const canvas = createCanvas(baseImage.width, baseImage.height);
        const ctx = canvas.getContext("2d");

        // Draw the base image
        ctx.drawImage(baseImage, 0, 0);

        // Add surname text
        ctx.font = `bold 17px ${font}`;
        ctx.fillStyle = textColor;
        ctx.fillText(surname, 613, 462);

        // Add prenorms text
        ctx.font = `bold 17px ${font}`;
        ctx.fillStyle = textColor;
        ctx.fillText(prenorms, 613, 518);

        // Add DOB text
        ctx.font = `bold 17px ${font}`;
        ctx.fillStyle = textColor;
        ctx.fillText(dateOfBirth, 613, 572);

        // Add Gender text
        ctx.font = `bold 17px ${font}`;
        ctx.fillStyle = textColor;
        ctx.fillText(gender, 774, 572);

        // Add Issue date text
        ctx.font = `bold 14px ${font}`;
        ctx.fillStyle = textColor;
        ctx.fillText(issueDate, 936, 600);

        // Add NIN text
        ctx.font = `bold ${fontSize}px ${font}`;
        ctx.fillStyle = textColor;
        ctx.fillText(nin, ninX, ninY);

        // Load and draw the passport image
        let overlayImage;
        try {
          overlayImage = await loadImage(overlayImagePath);
        } catch (err) {
          return res
            .status(500)
            .json({ message: `Failed to load overlay image: ${err.message}` });
        }
        ctx.drawImage(
          overlayImage,
          overlayX,
          overlayY,
          overlayWidth,
          overlayHeight
        );

        // Create and draw the QR code
        const qrCanvas = createCanvas(150, 150);
        try {
          await QRCode.toCanvas(qrCanvas, `${name}|${nin}`, {
            width: 150,
            margin: 1,
            errorCorrectionLevel: "H",
          });
        } catch (err) {
          return res
            .status(500)
            .json({ message: `Failed to generate QR code: ${err.message}` });
        }
        ctx.drawImage(qrCanvas, 890, 370, 150, 150);

        // Create a PDF document
        const doc = new PDFDocument({
          size: [baseImage.width, baseImage.height],
        });

        // Set response headers for PDF download
        res.setHeader("Content-Type", "application/pdf");
        res.setHeader(
          "Content-Disposition",
          `attachment; filename="${filename}"`
        );
        responseSent = true;

        // Pipe the PDF to the response
        doc.pipe(res);

        // Embed the canvas image into the PDF
        let imageBuffer;
        try {
          imageBuffer = canvas.toBuffer("image/png");
        } catch (err) {
          if (!res.headersSent) {
            return res.status(500).json({
              message: `Failed to generate image buffer: ${err.message}`,
            });
          }
          throw err;
        }
        doc.image(imageBuffer, 0, 0, {
          width: baseImage.width,
          height: baseImage.height,
        });

        // Handle PDF stream errors
        doc.on("error", (err) => {
          console.error(`PDF stream error: ${err.message}`);
          if (!responseSent) {
            res
              .status(500)
              .json({ message: `PDF generation failed: ${err.message}` });
          }
        });

        // Finalize the PDF
        doc.end();
      } else {
        return res.status(404).json({ message: "NIN not found" });
      }
    } catch (error) {
      console.error(`General error: ${error.message}`);
      if (!responseSent) {
        res
          .status(500)
          .json({ message: `Error processing image: ${error.message}` });
      }
    }
  } else if (type == "regular") {
    const { nin, surname, firstname, middlename, address, gender, state } =
      req.body;
    let responseSent = false; // Flag to prevent multiple response writes

    try {
      // Extract and validate NIN from request body
      const filename = "regular_nin.pdf"; // Allow filename in body
      if (!nin) {
        return res.status(400).json({ message: "NIN is required" });
      }
      if (nin.length !== 11) {
        return res
          .status(400)
          .json({ message: "NIN must be 11 characters long" });
      }
      if (!/^\d{11}$/.test(nin)) {
        return res.status(400).json({ message: "NIN must be numeric" });
      }
      // Validate filename
      if (!filename.match(/^[a-zA-Z0-9_-]+\.pdf$/)) {
        return res.status(400).json({
          message:
            "Invalid filename. Use alphanumeric characters and .pdf extension.",
        });
      }

      // Mock feedback data for NIN
      if (nin === "12345678901") {
        // Parameters for canvas rendering
        const issueDate = new Date().toLocaleDateString();
        const fontSize = 50;
        const font = "Arial";
        const textColor = "black";

        // Check if image files exist
        const baseImagePath = "./regularninslip.png";
        const overlayImagePath = "./passport.jpg";
        if (!fs.existsSync(baseImagePath)) {
          return res
            .status(400)
            .json({ message: `Base image not found at ${baseImagePath}` });
        }
        if (!fs.existsSync(overlayImagePath)) {
          return res.status(400).json({
            message: `Overlay image not found at ${overlayImagePath}`,
          });
        }

        // Load the base image
        let baseImage;
        try {
          baseImage = await loadImage(baseImagePath);
        } catch (err) {
          return res
            .status(500)
            .json({ message: `Failed to load base image: ${err.message}` });
        }

        // Create a canvas
        const canvas = createCanvas(baseImage.width, baseImage.height);
        const ctx = canvas.getContext("2d");

        // Draw the base image
        ctx.drawImage(baseImage, 0, 0);

        // Add surname text
        ctx.font = `bold 20px ${font}`;
        ctx.fillStyle = textColor;
        ctx.fillText(surname, 561, 318);

        // Add first name text
        ctx.font = `bold 20px ${font}`;
        ctx.fillStyle = textColor;
        ctx.fillText(firstname, 581, 363);

        // Add middle name text
        ctx.font = `bold 20px ${font}`;
        ctx.fillStyle = textColor;
        ctx.fillText(middlename, 599, 409);

        if (address.length > 20) {
          const part1 = address.slice(0, 20);
          const part2 = address.slice(20);
          ctx.font = `bold 20px ${font}`;
          ctx.fillStyle = textColor;
          ctx.fillText(part1, 888, 348);

          ctx.font = `bold 20px ${font}`;
          ctx.fillStyle = textColor;
          ctx.fillText(part2, 888, 372);
        } else {
          // Add address text
          ctx.font = `bold 18px ${font}`;
          ctx.fillStyle = textColor;
          ctx.fillText(address, 888, 348);
        }

        // Add Gender text
        ctx.font = `bold 20px ${font}`;
        ctx.fillStyle = textColor;
        ctx.fillText(gender, 544, 449);

        // Add State text
        ctx.font = `bold 20px ${font}`;
        ctx.fillStyle = textColor;
        ctx.fillText(state, 888, 490);

        // Add NIN text
        ctx.font = `bold 22px ${font}`;
        ctx.fillStyle = textColor;
        ctx.fillText(nin, 128, 364);

        // Load and draw the passport image
        let overlayImage;
        try {
          overlayImage = await loadImage(overlayImagePath);
        } catch (err) {
          return res
            .status(500)
            .json({ message: `Failed to load overlay image: ${err.message}` });
        }
        ctx.drawImage(overlayImage, 1153, 292, 185, 218);

        // Create a PDF document
        const doc = new PDFDocument({
          size: [baseImage.width, baseImage.height],
        });

        // Set response headers for PDF download
        res.setHeader("Content-Type", "application/pdf");
        res.setHeader(
          "Content-Disposition",
          `attachment; filename="${filename}"`
        );
        responseSent = true;

        // Pipe the PDF to the response
        doc.pipe(res);

        // Embed the canvas image into the PDF
        let imageBuffer;
        try {
          imageBuffer = canvas.toBuffer("image/png");
        } catch (err) {
          if (!res.headersSent) {
            return res.status(500).json({
              message: `Failed to generate image buffer: ${err.message}`,
            });
          }
          throw err;
        }
        doc.image(imageBuffer, 0, 0, {
          width: baseImage.width,
          height: baseImage.height,
        });

        // Handle PDF stream errors
        doc.on("error", (err) => {
          console.error(`PDF stream error: ${err.message}`);
          if (!responseSent) {
            res
              .status(500)
              .json({ message: `PDF generation failed: ${err.message}` });
          }
        });

        // Finalize the PDF
        doc.end();
      } else {
        return res.status(404).json({ message: "NIN not found" });
      }
    } catch (error) {
      console.error(`General error: ${error.message}`);
      if (!responseSent) {
        res
          .status(500)
          .json({ message: `Error processing image: ${error.message}` });
      }
    }
  }
});

app.get("/image-overlay", async (req, res) => {
  let responseSent = false; // Flag to prevent multiple response writes

  try {
    // Extract and validate NIN from request body
    const nin = "12345678901";
    const filename = "premium_nin.pdf"; // Allow filename in body
    if (!nin) {
      return res.status(400).json({ message: "NIN is required" });
    }
    if (nin.length !== 11) {
      return res
        .status(400)
        .json({ message: "NIN must be 11 characters long" });
    }
    if (!/^\d{11}$/.test(nin)) {
      return res.status(400).json({ message: "NIN must be numeric" });
    }
    // Validate filename
    if (!filename.match(/^[a-zA-Z0-9_-]+\.pdf$/)) {
      return res.status(400).json({
        message:
          "Invalid filename. Use alphanumeric characters and .pdf extension.",
      });
    }

    // Mock feedback data for NIN
    if (nin === "12345678901") {
      // Parameters for canvas rendering
      const issueDate = new Date().toLocaleDateString();
      const fontSize = 50;
      const font = "Arial";
      const textColor = "black";

      // Check if image files exist
      const baseImagePath = "./regularninslip.png";
      const overlayImagePath = "./passport.jpg";
      if (!fs.existsSync(baseImagePath)) {
        return res
          .status(400)
          .json({ message: `Base image not found at ${baseImagePath}` });
      }
      if (!fs.existsSync(overlayImagePath)) {
        return res.status(400).json({
          message: `Overlay image not found at ${overlayImagePath}`,
        });
      }

      // Load the base image
      let baseImage;
      try {
        baseImage = await loadImage(baseImagePath);
      } catch (err) {
        return res
          .status(500)
          .json({ message: `Failed to load base image: ${err.message}` });
      }

      // Create a canvas
      const canvas = createCanvas(baseImage.width, baseImage.height);
      const ctx = canvas.getContext("2d");

      // Draw the base image
      ctx.drawImage(baseImage, 0, 0);

      // Add surname text
      ctx.font = `bold 20px ${font}`;
      ctx.fillStyle = textColor;
      ctx.fillText("SURNAME", 561, 318);

      // Add first name text
      ctx.font = `bold 20px ${font}`;
      ctx.fillStyle = textColor;
      ctx.fillText("FIRST NAME", 581, 363);

      // Add middle name text
      ctx.font = `bold 20px ${font}`;
      ctx.fillStyle = textColor;
      ctx.fillText("MIDDLE NAME", 599, 409);

      let address = "11 TUNAKIA STREET BARUWA";
      if (address.length > 20) {
        const part1 = address.slice(0, 20);
        const part2 = address.slice(20);
        ctx.font = `bold 20px ${font}`;
        ctx.fillStyle = textColor;
        ctx.fillText(part1, 888, 348);

        ctx.font = `bold 20px ${font}`;
        ctx.fillStyle = textColor;
        ctx.fillText(part2, 888, 372);
      } else {
        // Add address text
        ctx.font = `bold 18px ${font}`;
        ctx.fillStyle = textColor;
        ctx.fillText("11 TUNAKIA STREET BARUWA", 888, 348);
      }

      // Add Gender text
      ctx.font = `bold 20px ${font}`;
      ctx.fillStyle = textColor;
      ctx.fillText("GENDER", 544, 449);

      // Add State text
      ctx.font = `bold 20px ${font}`;
      ctx.fillStyle = textColor;
      ctx.fillText("STATE", 888, 490);

      // Add NIN text
      ctx.font = `bold 22px ${font}`;
      ctx.fillStyle = textColor;
      ctx.fillText(nin, 128, 364);

      // Load and draw the passport image
      let overlayImage;
      try {
        overlayImage = await loadImage(overlayImagePath);
      } catch (err) {
        return res
          .status(500)
          .json({ message: `Failed to load overlay image: ${err.message}` });
      }
      ctx.drawImage(overlayImage, 1153, 292, 185, 218);

      // Create a PDF document
      const doc = new PDFDocument({
        size: [baseImage.width, baseImage.height],
      });

      // Set response headers for PDF download
      res.setHeader("Content-Type", "application/pdf");
      res.setHeader(
        "Content-Disposition",
        `attachment; filename="${filename}"`
      );
      responseSent = true;

      // Pipe the PDF to the response
      doc.pipe(res);

      // Embed the canvas image into the PDF
      let imageBuffer;
      try {
        imageBuffer = canvas.toBuffer("image/png");
      } catch (err) {
        if (!res.headersSent) {
          return res.status(500).json({
            message: `Failed to generate image buffer: ${err.message}`,
          });
        }
        throw err;
      }
      doc.image(imageBuffer, 0, 0, {
        width: baseImage.width,
        height: baseImage.height,
      });

      // Handle PDF stream errors
      doc.on("error", (err) => {
        console.error(`PDF stream error: ${err.message}`);
        if (!responseSent) {
          res
            .status(500)
            .json({ message: `PDF generation failed: ${err.message}` });
        }
      });

      // Finalize the PDF
      doc.end();
    } else {
      return res.status(404).json({ message: "NIN not found" });
    }
  } catch (error) {
    console.error(`General error: ${error.message}`);
    if (!responseSent) {
      res
        .status(500)
        .json({ message: `Error processing image: ${error.message}` });
    }
  }
});

app.listen(port);
