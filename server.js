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
// Set view engine to EJS
app.set("view engine", "ejs");

const Confirmation = require("./models/confirmation.model");
const User = require("./models/user.model");

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

const fundAccountRouter = require("./routes/fund-account");
app.use("/fund-account", authenticateToken, fundAccountRouter);

const helpAndSupportRouter = require("./routes/help-and-support");
app.use("/help-and-support", helpAndSupportRouter);

const accountCreatedRouter = require("./routes/account-created");
app.use("/account-created", authenticateToken, accountCreatedRouter);

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
  console.log("in check email");
  const { email, phone } = req.body;
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

app.listen(port);
