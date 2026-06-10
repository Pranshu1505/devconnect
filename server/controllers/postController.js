const Post = require("../models/Post");
const User = require("../models/User");
const Notification = require("../models/Notification");

// @desc    Get all posts (feed) with pagination
// @route   GET /api/posts
// @access  Public
const getPosts = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const tag = req.query.tag;
    const search = req.query.search;
    const skip = (page - 1) * limit;

    let query = { isPublished: true };
    if (tag) query.tags = tag;
    if (search) query.$text = { $search: search };

    const posts = await Post.find(query)
      .populate("author", "name username avatar role")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .select("-body"); // exclude heavy body in list view

    const total = await Post.countDocuments(query);

    res.json({
      success: true,
      posts,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get single post by ID
// @route   GET /api/posts/:id
// @access  Public
const getPost = async (req, res, next) => {
  try {
    const post = await Post.findById(req.params.id)
      .populate("author", "name username avatar bio role skills")
      .populate("comments.user", "name username avatar");

    if (!post) return res.status(404).json({ success: false, message: "Post not found" });

    // Increment views
    post.views += 1;
    await post.save();

    res.json({ success: true, post });
  } catch (err) {
    next(err);
  }
};

// @desc    Create post
// @route   POST /api/posts
// @access  Private
const createPost = async (req, res, next) => {
  try {
    const { title, body, tags, coverImage, series } = req.body;

    const post = await Post.create({
      title,
      body,
      tags: tags || [],
      coverImage: coverImage || "",
      series: series || "",
      author: req.user._id,
    });

    await User.findByIdAndUpdate(req.user._id, { $inc: { postCount: 1 } });

    const populated = await post.populate("author", "name username avatar");
    res.status(201).json({ success: true, post: populated });
  } catch (err) {
    // next(err);
    console.error("CREATE POST ERROR:", err);
    return res.status(500).json({
      success: false,
      message: err.message,
      stack: err.stack,
    });
  }
};

// @desc    Update post
// @route   PUT /api/posts/:id
// @access  Private (author only)
const updatePost = async (req, res, next) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ success: false, message: "Post not found" });

    if (post.author.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: "Not authorized" });
    }

    const { title, body, tags, coverImage, isPublished, series } = req.body;
    Object.assign(post, { title, body, tags, coverImage, isPublished, series });
    await post.save();

    res.json({ success: true, post });
  } catch (err) {
    next(err);
  }
};

// @desc    Delete post
// @route   DELETE /api/posts/:id
// @access  Private (author or admin)
const deletePost = async (req, res, next) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ success: false, message: "Post not found" });

    const isAuthor = post.author.toString() === req.user._id.toString();
    const isAdmin = req.user.role === "admin";

    if (!isAuthor && !isAdmin) {
      return res.status(403).json({ success: false, message: "Not authorized" });
    }

    await post.deleteOne();
    await User.findByIdAndUpdate(post.author, { $inc: { postCount: -1 } });

    res.json({ success: true, message: "Post deleted" });
  } catch (err) {
    next(err);
  }
};

// @desc    Like / Unlike post
// @route   PUT /api/posts/:id/like
// @access  Private
const likePost = async (req, res, next) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ success: false, message: "Post not found" });

    const liked = post.likes.includes(req.user._id);

    if (liked) {
      post.likes = post.likes.filter((id) => id.toString() !== req.user._id.toString());
    } else {
      post.likes.push(req.user._id);

      // Notify post author (not self-like)
      if (post.author.toString() !== req.user._id.toString()) {
        await Notification.create({
          recipient: post.author,
          sender: req.user._id,
          type: "like",
          post: post._id,
        });

        // Emit real-time notification
        const io = req.app.get("io");
        io.to(post.author.toString()).emit("notification", { type: "like" });
      }
    }

    await post.save();
    res.json({ success: true, likes: post.likes.length, liked: !liked });
  } catch (err) {
    next(err);
  }
};

// @desc    Bookmark / Unbookmark post
// @route   PUT /api/posts/:id/bookmark
// @access  Private
const bookmarkPost = async (req, res, next) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ success: false, message: "Post not found" });

    const bookmarked = post.bookmarks.includes(req.user._id);

    if (bookmarked) {
      post.bookmarks = post.bookmarks.filter((id) => id.toString() !== req.user._id.toString());
    } else {
      post.bookmarks.push(req.user._id);
    }

    await post.save();
    res.json({ success: true, bookmarked: !bookmarked });
  } catch (err) {
    next(err);
  }
};

// @desc    Add comment
// @route   POST /api/posts/:id/comments
// @access  Private
const addComment = async (req, res, next) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ success: false, message: "Post not found" });

    const comment = { user: req.user._id, body: req.body.body };
    post.comments.push(comment);
    await post.save();

    // Notify post author
    if (post.author.toString() !== req.user._id.toString()) {
      await Notification.create({
        recipient: post.author,
        sender: req.user._id,
        type: "comment",
        post: post._id,
      });

      const io = req.app.get("io");
      io.to(post.author.toString()).emit("notification", { type: "comment" });
    }

    const populated = await Post.findById(post._id).populate("comments.user", "name username avatar");
    res.status(201).json({ success: true, comments: populated.comments });
  } catch (err) {
    next(err);
  }
};

// @desc    Delete comment
// @route   DELETE /api/posts/:id/comments/:commentId
// @access  Private
const deleteComment = async (req, res, next) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ success: false, message: "Post not found" });

    const comment = post.comments.id(req.params.commentId);
    if (!comment) return res.status(404).json({ success: false, message: "Comment not found" });

    const isOwner = comment.user.toString() === req.user._id.toString();
    const isAdmin = req.user.role === "admin";

    if (!isOwner && !isAdmin) {
      return res.status(403).json({ success: false, message: "Not authorized" });
    }

    comment.deleteOne();
    await post.save();
    res.json({ success: true, message: "Comment deleted" });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getPosts, getPost, createPost, updatePost,
  deletePost, likePost, bookmarkPost, addComment, deleteComment,
};