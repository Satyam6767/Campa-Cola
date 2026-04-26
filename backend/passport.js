const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const User = require("./models/User"); // adjust path if needed

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: "/auth/google/callback",
    },

    async (accessToken, refreshToken, profile, done) => {
      try {
        // Get email from Google profile
        const email = profile.emails[0].value;

        // Check if user already exists
        let user = await User.findOne({ email });

        // If user does not exist, create new user
        if (!user) {
          user = await User.create({
            name: profile.displayName,
            email: email,
            password: "google_oauth_login", // dummy password
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

// Save user id in session
passport.serializeUser((user, done) => {
  done(null, user.id);
});

// Get full user details from DB
passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (error) {
    done(error, null);
  }
});