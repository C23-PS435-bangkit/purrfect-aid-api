const passport = require('passport');
require('dotenv').config()
const GoogleStrategy = require('passport-google-oauth2').Strategy;

const GOOGLE_CLIENT_ID = process.env.CLIENT_ID;
const GOOGLE_CLIENT_SECRET = process.env.CLIENT_SECRET;
// Ini CLIENT ID sama CLIENT SECRET di file .env masih menggunakan punya Nadine, nanti minta tolong diganti di nilai .env-nya

passport.use(new GoogleStrategy({
  clientID: GOOGLE_CLIENT_ID,
  clientSecret: GOOGLE_CLIENT_SECRET,
  callbackURL: "http://localhost:3000/users/google/callback",
  // ^Ini diganti sesuai callback aslimya nanti, jangan lupa diganti juga di consolenya.
  passReqToCallback: true,
},
function(request, accessToken, refreshToken, profile, done) {
  return done(null, profile);
}));

passport.serializeUser(function(user, done) {
  done(null, user);
});

passport.deserializeUser(function(user, done) {
  done(null, user);
});
