const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const db = require("../models/db");

// Register a new user
const register = async (req, res) => {
  const { email, password } = req.body;

  try {
    // Validate input
    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }

    // Check if user exists
    const [existingUser] = await db.execute("SELECT * FROM users WHERE email = ?", [email]);
    if (existingUser.length > 0) {
      return res.status(400).json({ message: "Email already registered" });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);
    console.log("🔒 Hashed password for", email, ":", hashedPassword);

    // Insert user
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

// Login existing user
const loginUser = async (req, res) => {
  const { email, password } = req.body;
  console.log("🔐 Login attempt:", { email });

  try {
    // Validate input
    if (!email || !password) {
      console.log("❌ Missing email or password");
      return res.status(400).json({ message: "Email and password are required" });
    }

    // Find user (case-insensitive email search)
    const [users] = await db.execute("SELECT id, email, password FROM users WHERE email = ?", [
      email.toLowerCase(),
    ]);
    if (users.length === 0) {
      console.log("❌ No user found for email:", email);
      return res.status(401).json({ message: "Invalid email or password" });
    }

    const user = users[0];
    console.log("🔍 Found user:", { id: user.id, email: user.email });

    // Compare password
    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      console.log("❌ Password mismatch for:", email);
      return res.status(401).json({ message: "Invalid email or password" });
    }

    // Generate JWT
    const token = jwt.sign(
      { id: user.id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: "24h" }
    );
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

module.exports = { register, loginUser };