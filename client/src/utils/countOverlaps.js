export default (nodes) => {
  let counts = [],
    count = [];
  const layerIds = [...new Set(nodes.map((v) => v.layerId).sort())];

  for (let layerId of layerIds) {
    let layerNodes = nodes.filter((v) => v.layerId === layerId);
    let ids = [...new Set(layerNodes.map((v) => v.id))];
    let idNodes = nodes.filter((v) => ids.includes(v.id));

    let otherLayerIds = layerIds.filter((v) => v !== layerId);
    for (let otherLayerId of otherLayerIds) {
      count = idNodes
        .filter((v) => [layerId, otherLayerId].includes(v.layerId))
        .map((v) => v.id)
        .filter((a, i, aa) => aa.indexOf(a) === i && aa.lastIndexOf(a) !== i)
        .length;

      counts.push({
        x: layerId,
        y: otherLayerId,
        count,
      });
    }
  }

  return counts;
};
