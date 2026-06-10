const GitHubStrategy = require("passport-github2").Strategy;
const User = require("../models/User");

module.exports = (passport) => {
  passport.use(
    new GitHubStrategy(
      {
        clientID: process.env.GITHUB_CLIENT_ID,
        clientSecret: process.env.GITHUB_CLIENT_SECRET,
        callbackURL: process.env.GITHUB_CALLBACK_URL,
        scope: ["user:email"],
      },
      async (accessToken, refreshToken, profile, done) => {
        try {
          // Check if user already exists
          let user = await User.findOne({ githubId: profile.id });

          if (user) return done(null, user);

          // Check if email already registered
          const email =
            profile.emails && profile.emails[0]
              ? profile.emails[0].value
              : null;

          if (email) {
            user = await User.findOne({ email });
            if (user) {
              // Link GitHub to existing account
              user.githubId = profile.id;
              await user.save();
              return done(null, user);
            }
          }

          // Create new user
          user = await User.create({
            name: profile.displayName || profile.username,
            email: email,
            githubId: profile.id,
            avatar: profile.photos[0]?.value,
            username: profile.username,
            role: "developer",
          });

          done(null, user);
        } catch (err) {
          done(err, null);
        }
      }
    )
  );
};