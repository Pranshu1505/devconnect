const express = require("express");
const { getStats, toggleBanUser, getAllUsers, deletePost, deleteJob } = require("../controllers/adminController");
const { protect } = require("../middleware/authMiddleware");
const authorize = require("../middleware/roleMiddleware");

const router = express.Router();

// All admin routes require login + admin role
router.use(protect, authorize("admin"));

router.get("/stats", getStats);
router.get("/users", getAllUsers);
router.put("/users/:id/ban", toggleBanUser);
router.delete("/posts/:id", deletePost);
router.delete("/jobs/:id", deleteJob);

module.exports = router;