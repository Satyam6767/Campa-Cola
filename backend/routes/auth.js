const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const passport = require("passport");

const User = require("../models/User");
const auth = require("../middleware/auth");

const router = express.Router();


// ================= REGISTER USER =================

router.post("/register", async (req, res) => {
  try {
    const { name, email, password, phone, address, role } = req.body;

    // Check existing user
    const userExist = await User.findOne({ email });

    if (userExist) {
      return res.status(400).json({
        msg: "Email already registered",
      });
    }

    // Hash password
    const hashedPass = await bcrypt.hash(password, 10);

    // Create new user
    const newUser = new User({
      name,
      email,
      password: hashedPass,
      phone,
      address,
      role: role || "user",
    });

    await newUser.save();

    res.status(201).json({
      msg: "User registered successfully",
    });

  } catch (error) {
    res.status(500).json({
      error: error.message,
    });
  }
});


// ================= NORMAL LOGIN =================

router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(400).json({
        msg: "User not found",
      });
    }

    // Compare password
    const isMatch = await bcrypt.compare(
      password,
      user.password
    );

    if (!isMatch) {
      return res.status(400).json({
        msg: "Invalid password",
      });
    }

    // Create JWT Token
    const token = jwt.sign(
      {
        id: user._id,
        role: user.role,
        name: user.name,
        email: user.email,
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "7d",
      }
    );

    res.json({
      msg: "Login successful",
      token,
      role: user.role,
      name: user.name,
    });

  } catch (error) {
    res.status(500).json({
      error: error.message,
    });
  }
});


// ================= GOOGLE LOGIN START =================

router.get(
  "/google",
  passport.authenticate("google", {
    scope: ["profile", "email"],
    session: false,
  })
);


// ================= GOOGLE CALLBACK =================

router.get(
  "/google/callback",
  passport.authenticate("google", {
    failureRedirect: "/login",
    session: false,
  }),
  async (req, res) => {
    try {
      // Create JWT Token after Google login success
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
      // CHANGE THIS URL to your frontend deployed URL
      res.redirect(
        `https://your-frontend-url.com/login-success?token=${token}`
      );

    } catch (error) {
      console.log(error);

      res.status(500).json({
        msg: "Google Login Failed",
      });
    }
  }
);


// ================= GET LOGGED-IN USER =================

router.get("/me", auth(), async (req, res) => {
  try {
    const user = await User.findById(req.user.id)
      .select("-password");

    res.json(user);

  } catch (error) {
    res.status(500).json({
      error: error.message,
    });
  }
});

module.exports = router;