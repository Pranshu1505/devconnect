const express = require("express");
const {
  getPosts, getPost, createPost, updatePost,
  deletePost, likePost, bookmarkPost,
  addComment, deleteComment,
} = require("../controllers/postController");
const { protect, optionalAuth } = require("../middleware/authMiddleware");
const { upload, uploadCover } = require("../middleware/uploadMiddleware");

const router = express.Router();

// Upload cover image → returns Cloudinary URL to use in createPost
router.post("/upload-cover", protect, upload.single("cover"), uploadCover, (req, res) => {
  res.json({ success: true, url: req.uploadedUrl });
});

router.get("/", optionalAuth, getPosts);
router.get("/:id", optionalAuth, getPost);
router.post("/", protect, createPost);
router.put("/:id", protect, updatePost);
router.delete("/:id", protect, deletePost);
router.put("/:id/like", protect, likePost);
router.put("/:id/bookmark", protect, bookmarkPost);
router.post("/:id/comments", protect, addComment);
router.delete("/:id/comments/:commentId", protect, deleteComment);

module.exports = router;