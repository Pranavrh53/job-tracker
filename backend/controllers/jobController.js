const db = require("../models/db");

exports.addJob = async (req, res) => {
  const { company, position, status, deadline } = req.body;
  const userId = req.user.id;
  try {
    await db.execute(
      "INSERT INTO jobs (user_id, company, position, status, deadline) VALUES (?, ?, ?, ?, ?)",
      [userId, company, position, status, deadline]
    );
    res.json({ message: "Job added" });
  } catch (err) {
    console.error("❌ Add job error:", err);
    res.status(500).json({ message: "Internal Server Error", error: err.message });
  }
};

exports.getJobs = async (req, res) => {
  const userId = req.user.id;
  try {
    const [results] = await db.execute("SELECT * FROM jobs WHERE user_id = ?", [userId]);
    res.json(results);
  } catch (err) {
    console.error("❌ Get jobs error:", err);
    res.status(500).json({ message: "Internal Server Error", error: err.message });
  }
};