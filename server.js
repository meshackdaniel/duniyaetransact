const { MongoClient, ServerApiVersion } = require("mongodb");
const mongoose = require("mongoose");
const { name } = require("ejs");
const express = require("express");
const expressLayouts = require("express-ejs-layouts");
const app = express();
const port = 4000;
const cookieParser = require("cookie-parser");
const path = require("path");
//  require jwt for authentication
const jwt = require("jsonwebtoken");
// Set view engine to EJS
app.set("view engine", "ejs");

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
  if (token == null) return res.sendStatus(401);

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

const signupRouter = require("./routes/signup");
app.use("/signup", signupRouter);

const dashboardRouter = require("./routes/dashboard");
app.use("/dashboard", authenticateToken, dashboardRouter);

const transactionsRouter = require("./routes/transactions");
app.use("/transactions", authenticateToken, transactionsRouter);

const myAccountRouter = require("./routes/my-account");
app.use("/my-account", authenticateToken, myAccountRouter);

const helpAndSupportRouter = require("./routes/help-and-support");
app.use("/help-and-support", helpAndSupportRouter);

app.listen(port);
