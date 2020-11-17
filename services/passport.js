const passport = require('passport');
const SpotifyStrategy = require('passport-spotify').Strategy;
const mongoose = require('mongoose');
const keys = require('../config/keys');

const User = mongoose.model('users');

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser((id, done) => {
  User.findById(id).then((user) => {
    done(null, user);
  });
});

passport.use(
  new SpotifyStrategy(
    {
      clientID: keys.spotifyClientID,
      clientSecret: keys.spotifyClientSecret,
      callbackURL: '/auth/spotify/callback',
      proxy: true,
    },
    async (accessToken, refreshToken, expires_in, profile, done) => {
      const user = {
        spotifyId: profile.id,
        $set: {
          name: profile.displayName,
          email: profile.emails[0].value || '',
          photo: profile.photos[0] || '',
          accessToken,
          refreshToken,
          tokenExpires: Date.now() + expires_in * 1000,
        },
        $setOnInsert: {
          isPublic: false,
          savedArtistIds: [],
          playlistArtistIds: [],
          shortArtistIds: [],
          mediumArtistIds: [],
          longArtistIds: [],
        },
      };

      const cachedUser = await User.findOneAndUpdate(
        { spotifyId: user.spotifyId },
        user,
        { upsert: true, new: true }
      );

      done(null, cachedUser);
    }
  )
);
