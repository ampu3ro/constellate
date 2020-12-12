export default (artists) => {
  if (!artists.length) return;

  const artistIds = artists.map((v) => v.artistId);
  let linkedIds = [];

  const idPairs = [];
  let x;
  for (let artist of artists) {
    linkedIds = artist.linkedIds.filter((id) => artistIds.includes(id));
    for (let linkedId of linkedIds) {
      x = [artist.artistId, linkedId].sort();
      idPairs.push(x);
    }
  }

  // https://stackoverflow.com/questions/43772320/map-set-to-maintain-unique-array-of-arrays-javascript
  const idSet = new Set(idPairs.map((pair) => pair.toString()));

  const links = Array.from(idSet).map((pair) => {
    x = pair.split(',');
    return { source: x[0], target: x[1] };
  });

  let nodes = [];
  const spotifyIds = [...new Set(artists.map((v) => v.spotifyIds).flat())];
  for (let spotifyId of spotifyIds) {
    x = artists
      .filter((v) => v.spotifyIds.includes(spotifyId))
      .map((v) => ({
        id: v.artistId,
        label: v.name,
        genres: v.genres,
        layerId: spotifyId,
      }));

    nodes.push(...x);
  }

  for (let node of nodes) {
    nodes.filter((v) => v.id === node.id).forEach((v, i) => (v.layerIndex = i));
  }

  return { links, nodes };
};
