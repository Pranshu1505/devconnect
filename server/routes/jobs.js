const express = require("express");
const {
  getJobs, getJob, createJob, updateJob, deleteJob,
  applyJob, getApplications, updateApplicationStatus,
} = require("../controllers/jobController");
const { protect } = require("../middleware/authMiddleware");
const authorize = require("../middleware/roleMiddleware");

const router = express.Router();

router.get("/", getJobs);
router.get("/:id", getJob);
router.post("/", protect, authorize("company"), createJob);
router.put("/:id", protect, authorize("company"), updateJob);
router.delete("/:id", protect, deleteJob);
router.post("/:id/apply", protect, authorize("developer"), applyJob);
router.get("/:id/applications", protect, authorize("company"), getApplications);
router.put("/:id/applications/:appId", protect, authorize("company"), updateApplicationStatus);

module.exports = router;