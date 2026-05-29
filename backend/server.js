const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const passport = require("passport");
const jwt = require("jsonwebtoken");

require("dotenv").config();
require("./passport");

const authRoute = require("./routes/auth");
const productRoute = require("./routes/product");
const orderRoute = require("./routes/order");
const categoryRoute = require("./routes/category");
const billingRoute = require("./routes/billing");
const adminDashboardRoute = require("./routes/dashboard");
const cartRoute = require("./routes/cart");
const customerRoute = require("./routes/customer");

const app = express();


// ===============================
// MIDDLEWARES
// ===============================

app.use(
  cors({
    origin: [
  "http://localhost:5173",
  "https://www.jankienterprisespupri.com",
  "https://jankienterprisespupri.com",
],
    credentials: true,
  })
);

app.use(express.json());

// Passport Initialize Only (JWT based auth → no session needed)
app.use(passport.initialize());


// ===============================
// API ROUTES
// ===============================

app.use("/api/auth", authRoute);
app.use("/api/products", productRoute);
app.use("/api/orders", orderRoute);
app.use("/api/categories", categoryRoute);
app.use("/api/billing", billingRoute);
app.use("/api/admin/dashboard", adminDashboardRoute);
app.use("/api/cart", cartRoute);
app.use("/api/customers", customerRoute);


// ===============================
// GOOGLE AUTH ROUTES
// ===============================

// Step 1 → Redirect to Google Login
app.get(
  "/auth/google",
  passport.authenticate("google", {
    scope: ["profile", "email"],
    session: false,
  })
);


// Step 2 → Google Callback
app.get(
  "/auth/google/callback",
  passport.authenticate("google", {
    failureRedirect: "/login",
    session: false,
  }),
  (req, res) => {
    try {
      // Create JWT token after successful Google login
      const token = jwt.sign(
        {
          id: req.user._id,
          role: req.user.role,
          name: req.user.name,
          email: req.user.email,
        },
        process.env.JWT_SECRET,
        {
          expiresIn: "7d",
        }
      );

      // Redirect frontend with token
      res.redirect(
        `https://www.jankienterprisespupri.com/login-success?token=${token}`
      );

    } catch (error) {
      console.log(error);

      res.status(500).json({
        msg: "Google Login Failed",
      });
    }
  }
);


// ===============================
// DEFAULT ROUTE
// ===============================

app.get("/", (req, res) => {
  res.send("CampaCola Backend Running");
});


// ===============================
// 404 HANDLER
// ===============================

app.use((req, res) => {
  res.status(404).json({
    error: "Route not found",
  });
});


// ===============================
// GLOBAL ERROR HANDLER
// ===============================

app.use((err, req, res, next) => {
  console.error(err.stack);

  res.status(500).json({
    error: err.message,
  });
});


// ===============================
// DATABASE CONNECTION
// ===============================

mongoose
  .connect(process.env.MONGO_URL)
  .then(() => {
    console.log("MongoDB Connected");
  })
  .catch((err) => {
    console.log(err);
  });


// ===============================
// SERVER START
// ===============================

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on PORT ${PORT}`);
});