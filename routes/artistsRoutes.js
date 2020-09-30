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
        ...user.savedArtistIds,
        ...user.playlistArtistIds,
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

  app.get('/api/spotify', requireLogin, async (req, res) => {
    const api = 'https://api.spotify.com/v1';
    const config = {
      headers: {
        Authorization: `Bearer ${req.user.accessToken}`,
      },
    };
    let url, response, items, ids;

    // KEEP QUERIES TO MINIMUM FOR NOW

    let savedArtistIds = [];
    // url = `${api}/me/tracks?limit=50`;
    // while (url) {
    //   try {
    //     response = await axios.get(url, config);

    //     items = [...response.data.items];
    //     ids = items
    //       .map((item) => item.track.artists.map(({ id }) => id))
    //       .flat();
    //     savedArtistIds.push(...new Set(ids));

    //     url = response.data.next;
    //   } catch (err) {
    //     res.send(err);
    //   }
    // }
    // savedArtistIds = [...new Set(savedArtistIds)]; //de-dupe again

    // let savedPlaylistIds = [];
    // url = `${api}/me/playlists?limit=50`;
    // while (url) {
    //   response = await axios.get(url, config);

    //   items = [...response.data.items];
    //   ids = items.map(({ id }) => id);
    //   savedPlaylistIds.push(...ids);

    //   url = response.data.next;
    // }

    let playlistArtistIds = [];
    // for (id of savedPlaylistIds) {
    //   url = `${api}/playlists/${id}?fields=tracks.items(track(artists(id)))`;

    //   response = await axios.get(url, config);
    //   items = [...response.data.tracks.items];
    //   ids = items.map((item) => item.track.artists.map(({ id }) => id)).flat();
    //   playlistArtistIds.push(...new Set(ids));
    // }
    // playlistArtistIds = [...new Set(playlistArtistIds)]; //de-dupe again

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
