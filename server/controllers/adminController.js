const User = require("../models/User");
const Post = require("../models/Post");
const Job = require("../models/Job");

// @desc    Get dashboard stats
// @route   GET /api/admin/stats
// @access  Admin
const getStats = async (req, res, next) => {
  try {
    const [users, posts, jobs] = await Promise.all([
      User.countDocuments(),
      Post.countDocuments(),
      Job.countDocuments(),
    ]);

    const recentUsers = await User.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .select("name username email role createdAt");

    res.json({ success: true, stats: { users, posts, jobs }, recentUsers });
  } catch (err) {
    next(err);
  }
};

// @desc    Ban / Unban user
// @route   PUT /api/admin/users/:id/ban
// @access  Admin
const toggleBanUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ success: false, message: "User not found" });

    user.isBanned = !user.isBanned;
    await user.save();

    res.json({
      success: true,
      message: user.isBanned ? "User banned" : "User unbanned",
      isBanned: user.isBanned,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get all users (paginated)
// @route   GET /api/admin/users
// @access  Admin
const getAllUsers = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = 20;
    const skip = (page - 1) * limit;

    const users = await User.find()
      .select("name username email role isBanned createdAt postCount")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await User.countDocuments();

    res.json({ success: true, users, pagination: { page, total, pages: Math.ceil(total / limit) } });
  } catch (err) {
    next(err);
  }
};

// @desc    Delete any post (moderation)
// @route   DELETE /api/admin/posts/:id
// @access  Admin
const deletePost = async (req, res, next) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ success: false, message: "Post not found" });

    await post.deleteOne();
    await User.findByIdAndUpdate(post.author, { $inc: { postCount: -1 } });

    res.json({ success: true, message: "Post removed by admin" });
  } catch (err) {
    next(err);
  }
};

// @desc    Delete any job
// @route   DELETE /api/admin/jobs/:id
// @access  Admin
const deleteJob = async (req, res, next) => {
  try {
    const job = await Job.findById(req.params.id);
    if (!job) return res.status(404).json({ success: false, message: "Job not found" });

    await job.deleteOne();
    res.json({ success: true, message: "Job removed by admin" });
  } catch (err) {
    next(err);
  }
};

module.exports = { getStats, toggleBanUser, getAllUsers, deletePost, deleteJob };