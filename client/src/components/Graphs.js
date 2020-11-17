import React, { useRef, useEffect } from 'react';
import useResizeObserver from '../utils/useResizeObserver';
import { useArtistSelected } from '../hooks';
import * as d3 from 'd3';

const styles = {
  link: { stroke: '#999', alpha: 0.1 },
  node: { r: 4, r2: 8 },
  text: { fill: '#fff', alpha: 0.3, size: '0.9em', size2: '2em' },
  bar: { alpha: 0.9 },
  transition: 500,
};

const Graphs = ({ data, showBar, color, charge, distance }) => {
  const wrapperRef = useRef();
  const dims = useResizeObserver(wrapperRef);

  const svgRef = useRef();
  const networkRef = useRef();
  const linkRef = useRef();
  const layerRef = useRef();
  const nodeRef = useRef();
  const labelRef = useRef();

  const histogramRef = useRef();
  const barGroupRef = useRef();
  const barRef = useRef();
  const yLabelRef = useRef();
  const legendRef = useRef();

  // https://stackoverflow.com/questions/61515547/redux-useselector-not-updated-need-to-be-refresh
  const userRef = useRef();
  const { userActive, artistSelected } = useArtistSelected();
  useEffect(() => {
    userRef.current = userActive;
  }, [userActive]);

  const effect = () => {
    if (!dims || !data) return;

    const marginTopHist = 40;

    const dimsHist = {
      margin: { top: 0, right: 0, bottom: 0, left: 0 },
      width: dims.width / 5,
      height: dims.height / 5,
    };

    let { links, nodes } = data;

    const layerIds = [...new Set(nodes.map(({ layerId }) => layerId))];

    const simulation = d3
      .forceSimulation()
      .force('center', d3.forceCenter(dims.width / 2, dims.height / 2))
      .force('charge', d3.forceManyBody().strength(-charge || -50))
      .force(
        'link',
        d3
          .forceLink()
          .id((d) => d.id)
          .distance(distance || 150)
      )
      .on('tick', ticked);

    const svg = d3.select(svgRef.current);
    const network = d3.select(networkRef.current);

    let link = d3.select(linkRef.current).selectAll('.links');
    let text = d3.select(labelRef.current).selectAll('.labels');
    let layer = d3.select(layerRef.current).selectAll('.layers');
    let node = d3.select(nodeRef.current).selectAll('.nodes');

    // https://observablehq.com/@d3/modifying-a-force-directed-graph
    links = links.map((d) => Object.assign({}, d));

    const oldDataMap = new Map(layer.data().map((d) => [d.id + d.layerId, d]));
    let layers = nodes.map((d) =>
      Object.assign(oldDataMap.get(d.id + d.layerId) || {}, d)
    );

    nodes = layers.filter((v, i, a) => a.findIndex((t) => t.id === v.id) === i);
    const rest = layers
      .filter((v, i, a) => a.findIndex((t) => t.id === v.id) !== i)
      .map((d) => {
        let n = nodes
          .filter((v) => v.id === d.id)
          .map(({ vx, vy, x, y }) => ({ vx, vy, x, y }));
        return Object.assign(n[0], d);
      })
      .reverse();
    layers = [...nodes, ...rest];

    link = link
      .data(links, (d) => d.source + d.target)
      .join('line')
      .attr('class', 'links')
      .style('stroke', styles.link.stroke)
      .style('stroke-opacity', styles.link.alpha);

    text = text
      .data(nodes, (d) => d.id)
      .join('text')
      .attr('class', 'labels')
      .text((d) => d.label)
      .attr('x', 10)
      .style('fill', styles.text.fill)
      .style('fill-opacity', styles.text.alpha)
      .style('font-size', styles.text.size);

    layer = layer
      .data(layers, (d) => d.id + d.layerId)
      .join('circle')
      .attr('class', 'layers')
      .attr('r', (d) => styles.node.r * (1 + d.layerIndex / 2))
      .style('fill', (d) => color(d.layerId))
      .on('mouseover', mouseOver)
      .on('mouseout', mouseOut);

    node = node
      .data(nodes, (d) => d.id)
      .join('circle')
      .attr('class', 'nodes')
      .attr('r', styles.node.r)
      .style('fill', color(layerIds[0]))
      .on('mouseover', mouseOver)
      .on('mouseout', mouseOut)
      .on('click', (d) => artistSelected(userRef.current, d.id))
      .call(drag());

    simulation.nodes(nodes).force('link').links(links);

    svg.call(zoom());

    d3.select(histogramRef.current).attr(
      'transform',
      `translate(0,${marginTopHist})`
    );

    // https://observablehq.com/@d3/grouped-bar-chart
    const x = d3
      .scaleLinear()
      .range([dimsHist.margin.left, dimsHist.width - dimsHist.margin.right]);

    const y0 = d3
      .scaleBand()
      .range([dimsHist.margin.top, dimsHist.height - dimsHist.margin.bottom])
      .paddingInner(0.5);

    const y1 = d3.scaleBand().domain(layerIds);

    updateBar(layers, showBar);

    function ticked() {
      link
        .attr('x1', (d) => d.source.x)
        .attr('y1', (d) => d.source.y)
        .attr('x2', (d) => d.target.x)
        .attr('y2', (d) => d.target.y);

      node.attr('cx', (d) => d.x).attr('cy', (d) => d.y);

      const nodeData = node.data();
      layer
        .attr('cx', (d) => nodeData.filter((v) => v.id === d.id)[0].x)
        .attr('cy', (d) => nodeData.filter((v) => v.id === d.id)[0].y);

      text.attr('transform', (d) => 'translate(' + d.x + ',' + d.y + ')');
    }

    function drag() {
      return d3
        .drag()
        .on('start', (d) => {
          if (!d3.event.active) simulation.alphaTarget(0.3).restart();
          d.fx = d.x;
          d.fy = d.y;
        })
        .on('drag', (d) => {
          d.fx = d3.event.x;
          d.fy = d3.event.y;
        })
        .on('end', (d) => {
          if (!d3.event.active) simulation.alphaTarget(0);
          d.fx = null;
          d.fy = null;
        });
    }

    function zoom() {
      return d3
        .zoom()
        .on('zoom', () => network.attr('transform', d3.event.transform));
    }

    let linkPairs = {};
    links.forEach((d) => {
      linkPairs[d.source.id + ',' + d.target.id] = true;
    });

    function linked(o, d) {
      return (
        o.id === d.id ||
        linkPairs[o.id + ',' + d.id] ||
        linkPairs[d.id + ',' + o.id]
      );
    }

    function mouseOver(d) {
      link
        .transition(styles.transition)
        .style('stroke-opacity', (o) =>
          o.source === d || o.target === d ? 1 : styles.link.alpha
        );

      text
        .transition(styles.transition)
        .style('fill-opacity', (o) => (linked(o, d) ? 1 : styles.text.alpha))
        .style('font-size', (o) =>
          o.id === d.id ? styles.text.size2 : styles.text.size
        );

      layer
        .transition(styles.transition)
        .style('fill-opacity', (o) => (linked(o, d) ? 1 : styles.text.alpha));

      node
        .transition(styles.transition)
        .style('fill-opacity', (o) => (linked(o, d) ? 1 : styles.text.alpha))
        .attr('r', (o) => (o.id === d.id ? styles.node.r2 : styles.node.r));

      updateBar(
        layers.filter((o) => linked(o, d)),
        showBar
      );
    }

    function mouseOut() {
      link
        .transition(styles.transition)
        .style('stroke-opacity', styles.link.alpha);

      text
        .transition(styles.transition)
        .style('fill-opacity', styles.text.alpha)
        .style('font-size', styles.text.size);

      layer.transition(styles.transition).style('fill-opacity', 1);

      node
        .transition(styles.transition)
        .style('fill-opacity', 1)
        .attr('r', styles.node.r);

      updateBar(layers, showBar);
    }

    function updateBar(layers, showBar) {
      const data = showBar ? countGenres(layers) : [];

      x.domain([0, d3.max(data, (b) => d3.max(layerIds, (l) => b[l]))]);
      y0.domain(data.map((d) => d.genre));
      y1.range([0, y0.bandwidth()]);

      const barGroup = d3
        .select(barGroupRef.current)
        .selectAll('.barGroups')
        .data(data)
        .join('g')
        .attr('class', 'barGroups')
        .attr('transform', (d) => `translate(0,${y0(d.genre)})`);

      barGroup
        .selectAll('rect')
        .data((d) =>
          layerIds.map((layerId) => ({ layerId, count: d[layerId] }))
        )
        .join('rect')
        .attr('x', (d) => x(0))
        .attr('y', (d) => y1(d.layerId))
        .attr('height', y1.bandwidth())
        .attr('width', (d) => x(d.count))
        .attr('fill', (d) => color(d.layerId))
        .attr('fill-opacity', styles.bar.alpha);

      barGroup
        .selectAll('.xLabel')
        .data((d) =>
          layerIds.map((layerId) => ({
            layerId,
            count: d[layerId] ? d[layerId] : 0,
          }))
        )
        .join('text')
        .attr('class', 'xLabel')
        .attr('x', (d) => x(d.count) + 5)
        .attr('y', (d) => y1(d.layerId) + 1)
        .text((d) => {
          const total = data
            .map((v) => (v[d.layerId] ? v[d.layerId] : 0))
            .reduce((a, b) => a + b, 0);
          return total === 0 || d.count === 0
            ? ''
            : ((100 * d.count) / total).toFixed(0) + '%';
        })
        .attr('alignment-baseline', 'hanging')
        .style('fill', styles.text.fill)
        .style(
          'font-size',
          parseFloat(styles.text.size) - layerIds.length / 10 + 'em'
        );

      d3.select(yLabelRef.current)
        .selectAll('.yLabel')
        .data(data)
        .join('text')
        .attr('class', 'yLabel')
        .attr('x', (d) => x(0))
        .attr('y', (d) => y0(d.genre) - 1)
        .text((d) => d.genre)
        .style('fill', styles.text.fill)
        .style('font-size', styles.text.size);
    }

    function countGenres(nodes) {
      let counts = [];
      const genres = [...new Set(nodes.map((d) => d.genres).flat())];
      for (let genre of genres) {
        let count = nodes
          .filter((d) => d.genres.includes(genre))
          .map((d) => d.layerId)
          .reduce((a, b) => {
            a[b] ? a[b]++ : (a[b] = 1);
            return a;
          }, {});

        count.genre = genre;
        counts.push(count);
      }
      counts = counts
        .sort((a, b) => b[layerIds[0]] - a[layerIds[0]])
        .slice(0, 5);
      return counts;
    }
  };

  useEffect(effect, [data, dims]);

  return (
    <div ref={wrapperRef}>
      <svg ref={svgRef} width="100%" height={'70vh'}>
        <g ref={networkRef}>
          <g ref={linkRef} />
          <g ref={layerRef} />
          <g ref={nodeRef} />
          <g ref={labelRef} />
        </g>
        <g ref={legendRef} />
        <g ref={histogramRef}>
          <g ref={barGroupRef}>
            <g ref={barRef} />
          </g>
          <g ref={yLabelRef} />
        </g>
      </svg>
    </div>
  );
};

export default Graphs;
