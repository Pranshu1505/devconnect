const mongoose = require("mongoose");

const CommentSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    body: { type: String, required: true, maxlength: 1000 },
    likes: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  },
  { timestamps: true }
);

const PostSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true, maxlength: 150 },
    body: { type: String, required: true },         // Markdown content
    excerpt: { type: String, maxlength: 300 },      // Auto-generated summary
    coverImage: { type: String, default: "" },
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    tags: [{ type: String, lowercase: true, trim: true }],
    likes: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    bookmarks: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    comments: [CommentSchema],
    readTime: { type: Number, default: 1 },        // in minutes
    isPublished: { type: Boolean, default: true },
    views: { type: Number, default: 0 },
    series: { type: String, default: "" },         // optional series name
  },
  { timestamps: true }
);

// Full-text search index
PostSchema.index({ title: "text", body: "text", tags: "text" });

// Auto-generate excerpt from body
PostSchema.pre("save", function () {
  if (this.isModified("body")) {
    this.excerpt = this.body.replace(/[#*`>\-]/g, "").substring(0, 250) + "...";
    // Estimate read time (avg 200 words/min)
    const wordCount = this.body.split(" ").length;
    this.readTime = Math.ceil(wordCount / 200);
  }
  // next();
});

module.exports = mongoose.model("Post", PostSchema);