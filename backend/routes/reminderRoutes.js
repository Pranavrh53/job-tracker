const express = require("express");
const { getReminders, createReminder } = require("../controllers/reminderController");
const verifyToken = require("../middleware/authMiddleware");
const router = express.Router();

router.get("/reminders", verifyToken, getReminders);
router.post("/reminders", verifyToken, createReminder);

module.exports = router;