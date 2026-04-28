const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const bcrypt = require("bcryptjs");
const User = require("./models/User");

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL:
        "https://campa-cola-1.onrender.com/auth/google/callback",
    },

    async (accessToken, refreshToken, profile, done) => {
      try {
        const email = profile.emails[0].value;

        let user = await User.findOne({ email });

        if (!user) {
          const hashedPassword = await bcrypt.hash(
            "google_oauth_login",
            10
          );

          user = await User.create({
            name: profile.displayName,
            email,
            password: hashedPassword,
            role: "user",
          });
        }

        return done(null, user);

      } catch (error) {
        console.log(error);
        return done(error, null);
      }
    }
  )
);

module.exports = passport;