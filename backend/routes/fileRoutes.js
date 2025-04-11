const express = require("express");
const multer = require("multer");
const verifyToken = require("../middleware/authMiddleware");
const { uploadFile, getFiles } = require("../controllers/fileController");
const router = express.Router();

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/");
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + "-" + file.originalname);
  },
});

const upload = multer({ storage });

router.post("/files", verifyToken, upload.single("file"), uploadFile); // Changed from "/"
router.get("/files", verifyToken, getFiles); // Changed from "/"

module.exports = router;