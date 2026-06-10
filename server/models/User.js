const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const UserSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    username: { type: String, unique: true, sparse: true, lowercase: true },
    email: { type: String, unique: true, sparse: true, lowercase: true },
    password: { type: String, select: false },
    githubId: { type: String, unique: true, sparse: true },
    avatar: { type: String, default: "" },
    bio: { type: String, maxlength: 300, default: "" },
    role: {
      type: String,
      enum: ["developer", "company", "admin"],
      default: "developer",
    },

    // Developer-specific
    skills: [{ type: String }],
    githubUrl: { type: String, default: "" },
    portfolioUrl: { type: String, default: "" },
    location: { type: String, default: "" },
    openToWork: { type: Boolean, default: false },

    // Company-specific
    companyName: { type: String, default: "" },
    companyWebsite: { type: String, default: "" },
    companySize: { type: String, default: "" },

    // Social
    following: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    followers: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],

    // Stats
    postCount: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true },
    isBanned: { type: Boolean, default: false },
  },
  { timestamps: true }
);

// Hash password before saving
UserSchema.pre("save", async function () {
  if (!this.isModified("password") || !this.password) return ;
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  // next();
});

// Compare password method
UserSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// Auto-generate username from name if not provided
UserSchema.pre("save", async function (next) {
  if (!this.username && this.name) {
    const base = this.name.toLowerCase().replace(/\s+/g, "") + Math.floor(Math.random() * 1000);
    this.username = base;
  }
  // next();
});

module.exports = mongoose.model("User", UserSchema);