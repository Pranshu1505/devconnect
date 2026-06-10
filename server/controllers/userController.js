const User = require("../models/User");
const Post = require("../models/Post");
const Job = require("../models/Job");
const Notification = require("../models/Notification");

// @desc    Get user profile by username
// @route   GET /api/users/:username
// @access  Public
const getProfile = async (req, res, next) => {
  try {
    const user = await User.findOne({ username: req.params.username })
      .populate("following", "name username avatar")
      .populate("followers", "name username avatar");

    if (!user) return res.status(404).json({ success: false, message: "User not found" });

    // Get their posts
    const posts = await Post.find({ author: user._id, isPublished: true })
      .sort({ createdAt: -1 })
      .limit(10)
      .select("title tags likes views readTime createdAt");

    res.json({ success: true, user, posts });
  } catch (err) {
    next(err);
  }
};

// @desc    Update own profile
// @route   PUT /api/users/profile
// @access  Private
const updateProfile = async (req, res, next) => {
  try {
    const allowedFields = [
      "name", "bio", "skills", "githubUrl", "portfolioUrl",
      "location", "openToWork", "companyName", "companyWebsite",
      "companySize", "avatar",
    ];

    const updates = {};
    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) updates[field] = req.body[field];
    });

    const user = await User.findByIdAndUpdate(req.user._id, updates, {
      new: true,
      runValidators: true,
    });

    res.json({ success: true, user });
  } catch (err) {
    next(err);
  }
};

// @desc    Follow / Unfollow user
// @route   PUT /api/users/:id/follow
// @access  Private
const followUser = async (req, res, next) => {
  try {
    if (req.params.id === req.user._id.toString()) {
      return res.status(400).json({ success: false, message: "Cannot follow yourself" });
    }

    const targetUser = await User.findById(req.params.id);
    if (!targetUser) return res.status(404).json({ success: false, message: "User not found" });

    const isFollowing = req.user.following.includes(req.params.id);

    if (isFollowing) {
      await User.findByIdAndUpdate(req.user._id, { $pull: { following: req.params.id } });
      await User.findByIdAndUpdate(req.params.id, { $pull: { followers: req.user._id } });
    } else {
      await User.findByIdAndUpdate(req.user._id, { $addToSet: { following: req.params.id } });
      await User.findByIdAndUpdate(req.params.id, { $addToSet: { followers: req.user._id } });

      // Notify
      await Notification.create({
        recipient: req.params.id,
        sender: req.user._id,
        type: "follow",
      });

      const io = req.app.get("io");
      io.to(req.params.id).emit("notification", { type: "follow" });
    }

    res.json({ success: true, following: !isFollowing });
  } catch (err) {
    next(err);
  }
};

// @desc    Get notifications for logged in user
// @route   GET /api/users/notifications
// @access  Private
const getNotifications = async (req, res, next) => {
  try {
    const notifications = await Notification.find({ recipient: req.user._id })
      .populate("sender", "name username avatar")
      .populate("post", "title")
      .populate("job", "title")
      .sort({ createdAt: -1 })
      .limit(30);

    res.json({ success: true, notifications });
  } catch (err) {
    next(err);
  }
};

// @desc    Mark notifications as read
// @route   PUT /api/users/notifications/read
// @access  Private
const markNotificationsRead = async (req, res, next) => {
  try {
    await Notification.updateMany(
      { recipient: req.user._id, read: false },
      { read: true }
    );
    res.json({ success: true, message: "Notifications marked as read" });
  } catch (err) {
    next(err);
  }
};

// @desc    Get bookmarked posts
// @route   GET /api/users/bookmarks
// @access  Private
const getBookmarks = async (req, res, next) => {
  try {
    const posts = await Post.find({ bookmarks: req.user._id })
      .populate("author", "name username avatar")
      .sort({ createdAt: -1 })
      .select("-body");

    res.json({ success: true, posts });
  } catch (err) {
    next(err);
  }
};

// @desc    Search users
// @route   GET /api/users/search?q=
// @access  Public
const searchUsers = async (req, res, next) => {
  try {
    const { q } = req.query;
    if (!q) return res.json({ success: true, users: [] });

    const users = await User.find({
      $or: [
        { name: new RegExp(q, "i") },
        { username: new RegExp(q, "i") },
        { skills: new RegExp(q, "i") },
      ],
      isActive: true,
      isBanned: false,
    })
      .select("name username avatar bio skills role")
      .limit(10);

    res.json({ success: true, users });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getProfile, updateProfile, followUser,
  getNotifications, markNotificationsRead,
  getBookmarks, searchUsers,
};