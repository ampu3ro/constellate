export default (nodes, n = 5) => {
  let counts = [];
  const layerIds = [...new Set(nodes.map((v) => v.layerId))];
  const genres = [...new Set(nodes.map((v) => v.genres).flat())];

  for (let genre of genres) {
    let count = nodes
      .filter((v) => v.genres.includes(genre))
      .map((v) => v.layerId)
      .reduce((a, b) => {
        a[b] ? a[b]++ : (a[b] = 1);
        return a;
      }, {});

    count.genre = genre;
    counts.push(count);
  }

  // return only top n
  counts = counts.sort((a, b) => b[layerIds[0]] - a[layerIds[0]]).slice(0, n);
  return counts;
};
