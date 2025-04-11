const express = require("express");
const { addJob, getJobs } = require("../controllers/jobController");
const verifyToken = require("../middleware/authMiddleware");
const router = express.Router();

router.post("/jobs", verifyToken, addJob); // Changed from "/"
router.get("/jobs", verifyToken, getJobs); // Changed from "/"

module.exports = router;