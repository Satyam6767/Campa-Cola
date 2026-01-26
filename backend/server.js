const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
require("dotenv").config();
const authRoute = require("./routes/auth");
const productRoute = require("./routes/product");
const orderRoute = require("./routes/order");
const categoryRoute = require("./routes/category");
const billingRoute = require("./routes/billing");
const adminDashboardRoute = require("./routes/dashboard");
const cartRoute = require("./routes/cart");












const app = express();

// Middlewares
app.use(cors());
app.use(express.json());

app.use("/api/auth", authRoute);
app.use("/api/products", productRoute);
app.use("/api/orders", orderRoute);
app.use("/api/categories", categoryRoute);
app.use("/api/billing", billingRoute);
app.use("/api/admin/dashboard", adminDashboardRoute);
app.use("/api/cart", cartRoute);




// Default route
app.get("/", (req, res) => {
  res.send("CampaCola Backend Running");
});

// Connect MongoDB
mongoose
  .connect(process.env.MONGO_URL)
  .then(() => console.log("MongoDB Connected"))
  .catch((err) => console.log(err));

// Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on PORT ${PORT}`));
