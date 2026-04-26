const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const passport = require("passport");
const session = require("express-session");

require("dotenv").config();
require("./passport");

const authRoute = require("./routes/auth");
const productRoute = require("./routes/product");
const orderRoute = require("./routes/order");
const categoryRoute = require("./routes/category");
const billingRoute = require("./routes/billing");
const adminDashboardRoute = require("./routes/dashboard");
const cartRoute = require("./routes/cart");
const customerRoute = require("./routes/customer"); // ✅ NEW

const app = express();

// Middlewares
app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "https://www.jankienterprisespupri.com"
    ],
    credentials: true,
  })
);

app.use(express.json());

// Session Middleware
app.use(
  session({
    secret: "yourSecretKey",
    resave: false,
    saveUninitialized: false,
  })
);

// Passport Middleware
app.use(passport.initialize());
app.use(passport.session());

// Existing Routes
app.use("/api/auth", authRoute);
app.use("/api/products", productRoute);
app.use("/api/orders", orderRoute);
app.use("/api/categories", categoryRoute);
app.use("/api/billing", billingRoute);
app.use("/api/admin/dashboard", adminDashboardRoute);
app.use("/api/cart", cartRoute);
app.use("/api/customers", customerRoute); // ✅ NEW

// ===============================
// GOOGLE LOGIN ROUTES
// ===============================

// Step 1 → Redirect to Google Login
app.get(
  "/auth/google",
  passport.authenticate("google", {
    scope: ["profile", "email"],
  })
);

// Step 2 → Google Callback
app.get(
  "/auth/google/callback",
  passport.authenticate("google", {
    failureRedirect: "/login",
  }),
  (req, res) => {
    // Successful login redirect to frontend
    res.redirect("https://www.jankienterprisespupri.com/");
  }
);

// Default route
app.get("/", (req, res) => {
  res.send("CampaCola Backend Running");
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: "Route not found" });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: err.message });
});

// Connect MongoDB
mongoose
  .connect(process.env.MONGO_URL)
  .then(() => console.log("MongoDB Connected"))
  .catch((err) => console.log(err));

// Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on PORT ${PORT}`));