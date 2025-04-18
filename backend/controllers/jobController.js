const db = require("../models/db");

exports.addJob = async (req, res) => {
  const {
    company,
    position,
    location,
    salary,
    date_applied,
    job_link,
    notes,
    status,
    deadline,
    interview_date,
  } = req.body;
  const userId = req.user.id;

  // Validate required fields
  if (!company || !position || !status) {
    return res.status(400).json({ message: "Company, position, and status are required" });
  }

  // Validate status
  const validStatuses = ["Saved", "Applied", "Interviewing", "Offer", "Rejected", "Ghosted"];
  if (!validStatuses.includes(status)) {
    return res.status(400).json({ message: "Invalid status" });
  }

  // Validate location if provided
  const validLocations = ["Remote", "Onsite", "Hybrid"];
  if (location && !validLocations.includes(location)) {
    return res.status(400).json({ message: "Invalid location" });
  }

  try {
    await db.execute(
      `INSERT INTO jobs (user_id, company, position, location, salary, date_applied, job_link, notes, status, deadline, interview_date)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        userId,
        company,
        position,
        location || null,
        salary || null,
        date_applied || null,
        job_link || null,
        notes || null,
        status,
        deadline || null,
        interview_date || null,
      ]
    );

    // Create follow-up reminder if applied
    if (status === "Applied" && date_applied) {
      const followUpDate = new Date(date_applied);
      followUpDate.setDate(followUpDate.getDate() + 7);
      await db.execute(
        `INSERT INTO reminders (user_id, job_id, type, message, remind_at)
         VALUES (?, LAST_INSERT_ID(), ?, ?, ?)`,
        [
          userId,
          "Follow-up",
          `Follow up with ${company} regarding ${position} application`,
          followUpDate.toISOString().slice(0, 19).replace("T", " "),
        ]
      );
    }

    // Create deadline reminder if deadline exists
    if (deadline) {
      await db.execute(
        `INSERT INTO reminders (user_id, job_id, type, message, remind_at)
         VALUES (?, LAST_INSERT_ID(), ?, ?, ?)`,
        [
          userId,
          "Deadline",
          `Application deadline for ${company} - ${position}`,
          new Date(deadline).toISOString().slice(0, 19).replace("T", " "),
        ]
      );
    }

    res.status(201).json({ message: "Job added" });
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

exports.updateJob = async (req, res) => {
  const jobId = req.params.id;
  const {
    company,
    position,
    location,
    salary,
    date_applied,
    job_link,
    notes,
    status,
    deadline,
    interview_date,
  } = req.body;
  const userId = req.user.id;

  const validStatuses = ["Saved", "Applied", "Interviewing", "Offer", "Rejected", "Ghosted"];
  if (status && !validStatuses.includes(status)) {
    return res.status(400).json({ message: "Invalid status" });
  }

  const validLocations = ["Remote", "Onsite", "Hybrid"];
  if (location && !validLocations.includes(location)) {
    return res.status(400).json({ message: "Invalid location" });
  }

  try {
    const [result] = await db.execute(
      `UPDATE jobs
       SET company = ?, position = ?, location = ?, salary = ?, date_applied = ?, job_link = ?, notes = ?, status = ?, deadline = ?, interview_date = ?
       WHERE id = ? AND user_id = ?`,
      [
        company || null,
        position || null,
        location || null,
        salary || null,
        date_applied || null,
        job_link || null,
        notes || null,
        status || null,
        deadline || null,
        interview_date || null,
        jobId,
        userId,
      ]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Job not found or unauthorized" });
    }

    // Update reminders if status or dates change
    if (status === "Applied" && date_applied) {
      const followUpDate = new Date(date_applied);
      followUpDate.setDate(followUpDate.getDate() + 7);
      await db.execute(
        `INSERT INTO reminders (user_id, job_id, type, message, remind_at)
         VALUES (?, ?, ?, ?, ?)
         ON DUPLICATE KEY UPDATE message = ?, remind_at = ?`,
        [
          userId,
          jobId,
          "Follow-up",
          `Follow up with ${company} regarding ${position} application`,
          followUpDate.toISOString().slice(0, 19).replace("T", " "),
          `Follow up with ${company} regarding ${position} application`,
          followUpDate.toISOString().slice(0, 19).replace("T", " "),
        ]
      );
    }

    if (interview_date) {
      await db.execute(
        `INSERT INTO reminders (user_id, job_id, type, message, remind_at)
         VALUES (?, ?, ?, ?, ?)
         ON DUPLICATE KEY UPDATE message = ?, remind_at = ?`,
        [
          userId,
          jobId,
          "Interview",
          `Interview with ${company} for ${position}`,
          new Date(interview_date).toISOString().slice(0, 19).replace("T", " "),
          `Interview with ${company} for ${position}`,
          new Date(interview_date).toISOString().slice(0, 19).replace("T", " "),
        ]
      );
    }

    res.json({ message: "Job updated" });
  } catch (err) {
    console.error("❌ Update job error:", err);
    res.status(500).json({ message: "Internal Server Error", error: err.message });
  }
};

exports.deleteJob = async (req, res) => {
  const jobId = req.params.id;
  const userId = req.user.id;

  try {
    const [result] = await db.execute("DELETE FROM jobs WHERE id = ? AND user_id = ?", [
      jobId,
      userId,
    ]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Job not found or unauthorized" });
    }
    res.json({ message: "Job deleted" });
  } catch (err) {
    console.error("❌ Delete job error:", err);
    res.status(500).json({ message: "Internal Server Error", error: err.message });
  }
};