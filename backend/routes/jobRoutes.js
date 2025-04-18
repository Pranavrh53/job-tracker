const express = require("express");
const { addJob, getJobs, updateJob, deleteJob } = require("../controllers/jobController");
const verifyToken = require("../middleware/authMiddleware");
const router = express.Router();

router.post("/jobs", verifyToken, addJob);
router.get("/jobs", verifyToken, getJobs);
router.put("/jobs/:id", verifyToken, updateJob);
router.delete("/jobs/:id", verifyToken, deleteJob);

module.exports = router;