const express = require("express");
const multer = require("multer");
const path = require("path");
const fs = require("fs"); // Add this import
const verifyToken = require("../middleware/authMiddleware");
const { uploadFile, getFiles } = require("../controllers/fileController");
const router = express.Router();

// Define upload directory
const uploadDir = path.join(__dirname, "../uploads");

// Configure multer with simpler settings
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    console.log(`Saving file to: ${uploadDir}`);
    fs.access(uploadDir, fs.constants.W_OK, (err) => {
      if (err) {
        console.error(`Upload directory not writable: ${err}`);
      } else {
        console.log(`Upload directory is writable`);
      }
      cb(null, uploadDir);
    });
  },
  filename: function (req, file, cb) {
    // Create a simple and safe filename
    const safeFilename =
      Date.now() +
      "-" +
      Buffer.from(file.originalname).toString("hex").slice(0, 20) +
      path.extname(file.originalname);
    console.log(`Generated filename: ${safeFilename}`);
    cb(null, safeFilename);
  },
});

// Simpler multer setup
const upload = multer({ storage }).single("file");

router.post("/files", verifyToken, (req, res, next) => {
  upload(req, res, function (err) {
    if (err) {
      console.error("Multer error:", err);
      return res.status(400).json({ message: `File upload error: ${err.message}` });
    }
    next();
  });
}, uploadFile);

router.get("/files", verifyToken, getFiles);

module.exports = router;