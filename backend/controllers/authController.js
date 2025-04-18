const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const db = require("../models/db");
const crypto = require("crypto");
const nodemailer = require("nodemailer");

// Configure email transporter (update with your email service)
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

exports.register = async (req, res) => {
  const { email, password } = req.body;

  try {
    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }

    const [existingUser] = await db.execute("SELECT * FROM users WHERE email = ?", [email]);
    if (existingUser.length > 0) {
      return res.status(400).json({ message: "Email already registered" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    console.log("🔒 Hashed password for", email, ":", hashedPassword);

    const [result] = await db.execute(
      "INSERT INTO users (email, password) VALUES (?, ?)",
      [email, hashedPassword]
    );

    if (result.affectedRows === 1) {
      console.log("✅ User registered:", email);
      return res.status(201).json({ message: "User registered successfully" });
    } else {
      throw new Error("Failed to insert user");
    }
  } catch (err) {
    console.error("❌ Register error:", err);
    res.status(500).json({ message: "Failed to register user", error: err.message });
  }
};

exports.loginUser = async (req, res) => {
  const { email, password } = req.body;
  console.log("🔐 Login attempt:", { email });

  try {
    if (!email || !password) {
      console.log("❌ Missing email or password");
      return res.status(400).json({ message: "Email and password are required" });
    }

    const [users] = await db.execute("SELECT id, email, password FROM users WHERE email = ?", [
      email.toLowerCase(),
    ]);
    if (users.length === 0) {
      console.log("❌ No user found for email:", email);
      return res.status(401).json({ message: "Invalid email or password" });
    }

    const user = users[0];
    console.log("🔍 Found user:", { id: user.id, email: user.email });

    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      console.log("❌ Password mismatch for:", email);
      return res.status(401).json({ message: "Invalid email or password" });
    }

    const token = jwt.sign({ id: user.id, email: user.email }, process.env.JWT_SECRET, {
      expiresIn: "24h",
    });
    console.log("✅ Token generated for:", email);

    res.status(200).json({
      message: "Login successful",
      userId: user.id,
      token,
    });
  } catch (err) {
    console.error("❌ Login error:", {
      message: err.message,
      stack: err.stack,
    });
    res.status(500).json({ message: "Failed to login", error: err.message });
  }
};

exports.forgotPassword = async (req, res) => {
  const { email } = req.body;

  try {
    const [users] = await db.execute("SELECT id, email FROM users WHERE email = ?", [email]);
    if (users.length === 0) {
      return res.status(404).json({ message: "Email not found" });
    }

    const user = users[0];
    const resetToken = crypto.randomBytes(32).toString("hex");
    const resetTokenExpiry = Date.now() + 3600000; // 1 hour

    await db.execute(
      "UPDATE users SET reset_token = ?, reset_token_expiry = ? WHERE id = ?",
      [resetToken, resetTokenExpiry, user.id]
    );

    const resetLink = `http://localhost:3000/reset-password/${resetToken}`;
    await transporter.sendMail({
      to: email,
      subject: "Job Tracker Password Reset",
      html: `Click <a href="${resetLink}">here</a> to reset your password. Link expires in 1 hour.`,
    });

    res.json({ message: "Password reset email sent" });
  } catch (err) {
    console.error("❌ Forgot password error:", err);
    res.status(500).json({ message: "Internal Server Error", error: err.message });
  }
};

exports.resetPassword = async (req, res) => {
  const { token, password } = req.body;

  try {
    const [users] = await db.execute(
      "SELECT id FROM users WHERE reset_token = ? AND reset_token_expiry > ?",
      [token, Date.now()]
    );
    if (users.length === 0) {
      return res.status(400).json({ message: "Invalid or expired token" });
    }

    const user = users[0];
    const hashedPassword = await bcrypt.hash(password, 10);

    await db.execute(
      "UPDATE users SET password = ?, reset_token = NULL, reset_token_expiry = NULL WHERE id = ?",
      [hashedPassword, user.id]
    );

    res.json({ message: "Password reset successfully" });
  } catch (err) {
    console.error("❌ Reset password error:", err);
    res.status(500).json({ message: "Internal Server Error", error: err.message });
  }
};