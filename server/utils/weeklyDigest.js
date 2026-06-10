const Post = require("../models/Post");
const User = require("../models/User");
const { sendEmail, weeklyDigestTemplate } = require("./sendEmail");

// Call this function once a week (use node-cron or a cron job on server)
// Example with node-cron:
//   const cron = require("node-cron");
//   cron.schedule("0 9 * * 1", sendWeeklyDigest); // every Monday 9AM

const sendWeeklyDigest = async () => {
  try {
    console.log("📧 Sending weekly digest...");

    // Get top 5 posts from last 7 days by likes
    const since = new Date();
    since.setDate(since.getDate() - 7);

    const topPosts = await Post.find({
      createdAt: { $gte: since },
      isPublished: true,
    })
      .populate("author", "name username")
      .sort({ "likes.length": -1 })
      .limit(5)
      .select("title excerpt likes author _id");

    if (topPosts.length === 0) {
      console.log("No posts this week, skipping digest");
      return;
    }

    // Get all users who want digest (you can add a preference field later)
    const users = await User.find({ isActive: true, isBanned: false })
      .select("email name");

    const html = weeklyDigestTemplate(topPosts);

    // Send in batches of 50 to avoid rate limits
    const batchSize = 50;
    for (let i = 0; i < users.length; i += batchSize) {
      const batch = users.slice(i, i + batchSize);
      await Promise.allSettled(
        batch.map((user) =>
          sendEmail({
            to: user.email,
            subject: "🔥 Top Posts This Week on DevConnect",
            html,
          })
        )
      );
      console.log(`Sent digest to batch ${i / batchSize + 1}`);
    }

    console.log(`✅ Weekly digest sent to ${users.length} users`);
  } catch (err) {
    console.error("Weekly digest error:", err);
  }
};

module.exports = sendWeeklyDigest;