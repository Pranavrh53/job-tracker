const db = require("../models/db");
const path = require("path");
const fs = require("fs");

exports.uploadFile = async (req, res) => {
  console.log("uploadFile controller called");
  
  if (!req.file) {
    console.error("No file in request");
    return res.status(400).json({ message: "No file uploaded" });
  }

  try {
    const userId = req.user.id;
    console.log(`Processing upload for user ID: ${userId}`);
    
    const { job_id, file_type } = req.body;
    const filename = req.file.originalname;
    
    // Simple filepath handling - just store the filename 
    // with relative path to uploads folder
    const basename = path.basename(req.file.path);
    const filepath = `Uploads/${basename}`; // Ensure 'uploads' is lowercase
    
    console.log(`File stored at: ${req.file.path}`);
    console.log(`Database filepath: ${filepath}`);

    const validFileTypes = ["Resume", "Cover Letter", "Other"];
    if (file_type && !validFileTypes.includes(file_type)) {
      console.error(`Invalid file type: ${file_type}`);
      return res.status(400).json({ message: "Invalid file type" });
    }

    // Verify job_id belongs to user if provided
    if (job_id) {
      console.log(`Verifying job_id: ${job_id} for user: ${userId}`);
      const [job] = await db.execute("SELECT id FROM jobs WHERE id = ? AND user_id = ?", [
        job_id,
        userId,
      ]);
      
      if (job.length === 0) {
        console.error(`Invalid job ID: ${job_id} for user: ${userId}`);
        return res.status(400).json({ message: "Invalid or unauthorized job ID" });
      }
    }

    console.log("Inserting file record into database");
    const [result] = await db.execute(
      "INSERT INTO files (user_id, job_id, filename, filepath, file_type) VALUES (?, ?, ?, ?, ?)",
      [userId, job_id || null, filename, filepath, file_type || "Other"]
    );
    
    console.log("File uploaded successfully, database insert result:", result);
    res.status(201).json({ 
      message: "File uploaded successfully",
      file: {
        id: result.insertId,
        filename,
        filepath,
        file_type: file_type || "Other",
        job_id: job_id || null
      }
    });
  } catch (err) {
    console.error("File upload database error:", err);
    res.status(500).json({ 
      message: "Server error during file upload", 
      error: err.message 
    });
  }
};

exports.getFiles = async (req, res) => {
  console.log("getFiles controller called");
  const userId = req.user.id;

  try {
    console.log(`Fetching files for user: ${userId}`);
    const [files] = await db.execute(
      "SELECT f.*, j.company, j.position FROM files f LEFT JOIN jobs j ON f.job_id = j.id WHERE f.user_id = ?",
      [userId]
    );
    console.log(`Found ${files.length} files`);
    res.json(files);
  } catch (err) {
    console.error("Get files error:", err);
    res.status(500).json({ 
      message: "Server error while retrieving files",
      error: err.message
    });
  }
};