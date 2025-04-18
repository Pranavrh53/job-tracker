const express = require("express");
const cors = require("cors");
const path = require("path");
const fs = require("fs").promises; // Use promises for async handling
const authRoutes = require("./routes/authRoutes");
const jobRoutes = require("./routes/jobRoutes");
const fileRoutes = require("./routes/fileRoutes");
const reminderRoutes = require("./routes/reminderRoutes");
const analyticsRoutes = require("./routes/analyticsRoutes");

// Ensure uploads directory exists
const uploadDir = path.join(__dirname, "uploads"); // Use lowercase 'uploads'
const createUploadDir = async () => {
  try {
    await fs.access(uploadDir); // Check if directory exists
    console.log(`Uploads directory already exists: ${uploadDir}`);
  } catch {
    console.log(`Creating uploads directory: ${updateDir}`);
    await fs.mkdir(uploadDir, { recursive: true });
    console.log(`Uploads directory created successfully: ${uploadDir}`);
  }
};

// Call createUploadDir before setting up middleware
createUploadDir().catch((err) => {
  console.error(`Failed to create uploads directory: ${err}`);
  process.exit(1); // Exit if directory creation fails
});

const app = express();

// Basic CORS setup
app.use(cors());

// Configure body parsers
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Configure static file serving
app.use("/uploads", express.static(uploadDir));

// API routes
app.use("/api/auth", authRoutes);
app.use("/api", jobRoutes);
app.use("/api", fileRoutes);
app.use("/api", reminderRoutes);
app.use("/api", analyticsRoutes);

// Simple way to check if server is serving static files correctly
app.get("/check-uploads", async (req, res) => {
  try {
    const files = await fs.readdir(uploadDir);
    res.json({
      message: "Upload directory contents",
      uploadPath: uploadDir,
      files,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Global error handler
app.use((err, req, res, next) => {
  console.error("Server error:", err);
  res.status(500).json({ message: "Internal server error", error: err.message });
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Uploads directory: ${uploadDir}`);
  console.log(`Uploads URL path: /uploads`);
});