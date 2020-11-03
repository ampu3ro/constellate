const requireLogin = require('../middlewares/requireLogin');
const axios = require('axios');
const mongoose = require('mongoose');

const User = mongoose.model('users');
const Artist = mongoose.model('artists');

const api = 'https://api.spotify.com/v1';
const configAuth = (token) => {
  return {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };
};

module.exports = (app) => {
  app.get('/api/spotify/user', requireLogin, (req, res) => {
    axios
      .get(`${api}/me`, configAuth(req.user.accessToken))
      .then((response) => res.send(response.data))
      .catch((err) => res.send(err.response.data));
  });

  app.get('/api/spotify/artists', requireLogin, async (req, res) => {
    const config = configAuth(req.user.accessToken);

    let url, response, items, ids;
    let artists = [];

    let topArtists = { short: [], medium: [], long: [] };
    for (term in topArtists) {
      url = `${api}/me/top/artists?limit=50&time_range=${term}_term`;
      while (url) {
        response = await axios.get(url, config);

        items = [...response.data.items];
        topArtists[term].push(...items);

        url = response.data.next;
      }
      artists.push(...topArtists[term]);
    }

    artists = artists.filter(
      (v, i, a) => a.findIndex((t) => t.id === v.id) === i
    );
    let artistIds = artists.map(({ id }) => id);

    for (artist of artists) {
      url = `${api}/artists/${artist.id}/related-artists`;
      response = await axios.get(url, config);

      artist.linkedIds = response.data.artists
        .map(({ id }) => id)
        .filter((id) => artistIds.includes(id));
    }

    await User.updateOne(
      { _id: req.user.id },
      {
        $set: {
          shortArtistIds: topArtists.short.map(({ id }) => id),
          mediumArtistIds: topArtists.medium.map(({ id }) => id),
          longArtistIds: topArtists.long.map(({ id }) => id),
        },
      }
    );

    for (artist of artists) {
      try {
        await Artist.replaceOne(
          { artistId: artist.id },
          {
            artistId: artist.id,
            name: artist.name,
            photo: artist.images.map(({ url }) => url)[0] || '',
            genres: artist.genres || [],
            popularity: artist.popularity,
            linkedIds: artist.linkedIds || [],
          },
          {
            upsert: true,
          }
        );
      } catch (err) {
        res.send(artist);
      }
    }

    res.send('Spotify query complete, artist data updated and stored!');
  });

  app.put('/api/spotify/player', requireLogin, (req, res) => {
    axios
      .put(
        `${api}/me/player`,
        { device_ids: [req.body.deviceId], play: false },
        configAuth(req.user.accessToken)
      )
      .then(() => console.log('New Spotify player', req.body.deviceId))
      .catch((err) => res.send(err.response.data));
  });

  app.put('/api/spotify/play', requireLogin, (req, res) => {
    axios
      .put(
        `${api}/me/player/play?device_id=${req.body.deviceId}`,
        { context_uri: `spotify:artist:${req.body.artistId}` },
        configAuth(req.user.accessToken)
      )
      .catch((err) => res.send(err.response.data));
  });
};
