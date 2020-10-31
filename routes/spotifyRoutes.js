const requireLogin = require('../middlewares/requireLogin');
const axios = require('axios');
const mongoose = require('mongoose');

const User = mongoose.model('users');
const Artist = mongoose.model('artists');

const api = 'https://api.spotify.com/v1';

module.exports = (app) => {
  app.get('/api/spotify/user', requireLogin, (req, res) => {
    const config = {
      headers: {
        Authorization: `Bearer ${req.user.accessToken}`,
      },
    };

    axios
      .get(`${api}/me`, config)
      .then((response) => res.send(response.data))
      .catch((err) => res.send(err.response.data));
  });

  app.get('/api/spotify/artists', requireLogin, async (req, res) => {
    const config = {
      headers: {
        Authorization: `Bearer ${req.user.accessToken}`,
      },
    };

    let url, response, items, ids;

    let artists = [];
    ids = [...savedArtistIds, ...playlistArtistIds]; //copy for splice
    while (ids.length) {
      url = `${api}/artists?ids=${ids.splice(0, 50).toString()}`;
      response = await axios.get(url, config);

      artists.push(...response.data.artists);
    }

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
          savedArtistIds,
          playlistArtistIds,
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
};
