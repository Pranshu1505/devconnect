const express = require("express");
const User = require("../models/User");
const {
  getProfile, updateProfile, followUser,
  getNotifications, markNotificationsRead,
  getBookmarks, searchUsers,
} = require("../controllers/userController");
const { protect } = require("../middleware/authMiddleware");
const { upload, uploadAvatar } = require("../middleware/uploadMiddleware");

const router = express.Router();

router.get("/search", searchUsers);
router.get("/notifications", protect, getNotifications);
router.put("/notifications/read", protect, markNotificationsRead);
router.get("/bookmarks", protect, getBookmarks);
router.put("/profile", protect, updateProfile);

// Avatar upload
router.post("/avatar", protect, upload.single("avatar"), uploadAvatar, async (req, res, next) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.user._id,
      { avatar: req.uploadedUrl },
      { new: true }
    );
    res.json({ success: true, avatar: user.avatar });
  } catch (err) {
    next(err);
  }
});

router.get("/:username", getProfile);
router.put("/:id/follow", protect, followUser);

module.exports = router;