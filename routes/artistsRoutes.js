const requireLogin = require('../middlewares/requireLogin');
const axios = require('axios');
const mongoose = require('mongoose');

const User = mongoose.model('users');
const Artist = mongoose.model('artists');

module.exports = (app) => {
  app.post('/api/artists', requireLogin, async (req, res) => {
    let spotifyIds = req.body.length ? req.body : req.user.spotifyId;
    let artistIds;

    let users = await User.find({ spotifyId: { $in: spotifyIds } }).lean();

    users = users.map((user) => {
      artistIds = [
        ...user.shortArtistIds,
        ...user.mediumArtistIds,
        ...user.longArtistIds,
      ];
      return { ...user, artistIds };
    });

    artistIds = users.map(({ artistIds }) => artistIds).flat();
    artistIds = [...new Set(artistIds)];

    let artists = await Artist.find({ artistId: { $in: artistIds } }).lean();

    let u;
    artists = artists.map((artist) => {
      u = users.filter((user) => user.artistIds.includes(artist.artistId));
      return {
        ...artist,
        spotifyIds: u.map(({ spotifyId }) => spotifyId),
        userNames: u.map(({ name }) => name),
      };
    });

    res.send(artists);
  });
};
