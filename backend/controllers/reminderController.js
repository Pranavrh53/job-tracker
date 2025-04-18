const db = require("../models/db");

exports.getReminders = async (req, res) => {
  const userId = req.user.id;
  try {
    const [reminders] = await db.execute(
      `SELECT r.*, j.company, j.position
       FROM reminders r
       LEFT JOIN jobs j ON r.job_id = j.id
       WHERE r.user_id = ?
       AND r.remind_at >= NOW()
       ORDER BY r.remind_at ASC`,
      [userId]
    );
    res.json(reminders);
  } catch (err) {
    console.error("❌ Get reminders error:", err);
    res.status(500).json({ message: "Internal Server Error", error: err.message });
  }
};

exports.createReminder = async (req, res) => {
  const { job_id, type, message, remind_at } = req.body;
  const userId = req.user.id;

  const validTypes = ["Deadline", "Follow-up", "Interview"];
  if (!validTypes.includes(type)) {
    return res.status(400).json({ message: "Invalid reminder type" });
  }

  if (!message || !remind_at) {
    return res.status(400).json({ message: "Message and remind_at are required" });
  }

  try {
    if (job_id) {
      const [job] = await db.execute("SELECT id FROM jobs WHERE id = ? AND user_id = ?", [
        job_id,
        userId,
      ]);
      if (job.length === 0) {
        return res.status(400).json({ message: "Invalid or unauthorized job ID" });
      }
    }

    await db.execute(
      "INSERT INTO reminders (user_id, job_id, type, message, remind_at) VALUES (?, ?, ?, ?, ?)",
      [userId, job_id || null, type, message, remind_at]
    );
    res.status(201).json({ message: "Reminder created" });
  } catch (err) {
    console.error("❌ Create reminder error:", err);
    res.status(500).json({ message: "Internal Server Error", error: err.message });
  }
};