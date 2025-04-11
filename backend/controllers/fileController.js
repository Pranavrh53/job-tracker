const db = require("../models/db");

exports.uploadFile = async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: "No file uploaded" });
  }

  const userId = req.user.id;
  const filename = req.file.originalname;
  const filepath = req.file.path; // Use path instead of filename

  try {
    await db.execute(
      "INSERT INTO files (user_id, filename, filepath) VALUES (?, ?, ?)",
      [userId, filename, filepath]
    );
    res.status(201).json({ message: "File uploaded successfully" });
  } catch (err) {
    console.error("File upload error:", err);
    res.status(500).json({ message: "Server error during file upload" });
  }
};

exports.getFiles = async (req, res) => {
  const userId = req.user.id;
  
  try {
    const [files] = await db.execute(
      "SELECT * FROM files WHERE user_id = ?", 
      [userId]
    );
    res.json(files);
  } catch (err) {
    console.error("Get files error:", err);
    res.status(500).json({ message: "Server error while retrieving files" });
  }
};