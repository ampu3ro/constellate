import React, { useRef, useEffect } from 'react';
import * as d3 from 'd3';

import useResizeObserver from '../utils/useResizeObserver';
import { useArtistSelected } from '../hooks';
import countGenres from '../utils/countGenres';
import countOverlaps from '../utils/countOverlaps';

const styles = {
  link: { stroke: '#999', alpha: 0.1 },
  node: { r: 4, r2: 8 },
  text: { fill: '#fff', alpha: 0.3, size: '0.9em', size2: '2em' },
  bar: { alpha: 0.9 },
  transition: 500,
};

const Graphs = ({
  data,
  layers,
  showGenres,
  showOverlap,
  color,
  charge,
  distance,
}) => {
  const wrapperRef = useRef();
  const dims = useResizeObserver(wrapperRef);

  const svgRef = useRef();
  const networkRef = useRef();
  const linkRef = useRef();
  const layerNodeRef = useRef();
  const nodeRef = useRef();
  const labelRef = useRef();

  const histogramRef = useRef();
  const barGroupRef = useRef();
  const barRef = useRef();
  const yBarRef = useRef();

  const correlogramRef = useRef();
  const corLabelRef = useRef();
  const bubbleGroupRef = useRef();
  const bubbleRef = useRef();
  const bubbleLabelRef = useRef();

  // https://stackoverflow.com/questions/61515547/redux-useselector-not-updated-need-to-be-refresh
  const userRef = useRef();
  const { userActive, artistSelected } = useArtistSelected();
  useEffect(() => {
    userRef.current = userActive;
  }, [userActive]);

  const effect = () => {
    if (!dims || !data) return;

    const marginTop = 40;

    const dimsGenres = {
      margin: { top: 0, right: 0, bottom: 0, left: 0 },
      width: dims.width / 5,
      height: dims.height / 4,
    };

    const dimsOverlap = {
      margin: { top: 0, right: 20, bottom: 0, left: 0 },
      width: (layers.length * dims.width) / 20,
      height: (layers.length * dims.height) / 20,
    };

    let { links, nodes } = data;
    const layerIds = layers.map((v) => v.id);
    const layerIdsOrdered = [...layerIds].sort();

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
    let layerNode = d3.select(layerNodeRef.current).selectAll('.layerNodes');
    let node = d3.select(nodeRef.current).selectAll('.nodes');

    // https://observablehq.com/@d3/modifying-a-force-directed-graph
    links = links.map((v) => Object.assign({}, v));

    const oldDataMap = new Map(
      layerNode.data().map((v) => [v.id + v.layerId, v])
    );
    let layerNodes = nodes.map((v) =>
      Object.assign(oldDataMap.get(v.id + v.layerId) || {}, v)
    );

    nodes = layerNodes.filter(
      (v, i, a) => a.findIndex((t) => t.id === v.id) === i
    );
    const rest = layerNodes
      .filter((v, i, a) => a.findIndex((t) => t.id === v.id) !== i)
      .map((d) => {
        let n = nodes
          .filter((v) => v.id === d.id)
          .map(({ vx, vy, x, y }) => ({ vx, vy, x, y }));
        return Object.assign(n[0], d);
      })
      .reverse();
    layerNodes = [...nodes, ...rest];

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

    layerNode = layerNode
      .data(layerNodes, (d) => d.id + d.layerId)
      .join('circle')
      .attr('class', 'layerNodes')
      .attr('r', (d) => styles.node.r * (1 + d.layerIndex / 2))
      .style('fill', (d) => color(d.layerId))
      .on('mouseover', mouseOver)
      .on('mouseout', mouseOut);

    node = node
      .data(nodes, (d) => d.id)
      .join('circle')
      .attr('class', 'nodes')
      .attr('r', styles.node.r)
      .style('fill', (d) => color(d.layerId))
      .on('mouseover', mouseOver)
      .on('mouseout', mouseOut)
      .on('click', (d) => artistSelected(userRef.current, d.id))
      .call(drag());

    simulation.nodes(nodes).force('link').links(links);

    svg.call(zoom());

    // https://observablehq.com/@d3/grouped-bar-chart
    const xGenres = d3
      .scaleLinear()
      .range([
        dimsGenres.margin.left,
        dimsGenres.width - dimsGenres.margin.right,
      ]);

    const y0Genres = d3
      .scaleBand()
      .range([
        dimsGenres.margin.top,
        dimsGenres.height - dimsGenres.margin.bottom,
      ])
      .paddingInner(0.5);

    const y1Genres = d3.scaleBand().domain(layerIds);

    d3.select(histogramRef.current).attr(
      'transform',
      `translate(0,${marginTop})`
    );

    updateGenres(layerNodes, showGenres);

    // https://www.d3-graph-gallery.com/graph/correlogram_basic.html
    const xOverlap = d3
      .scalePoint()
      .range([
        dimsOverlap.width - dimsOverlap.margin.right,
        dimsOverlap.margin.left,
      ])
      .domain(layerIdsOrdered.slice(1, layers.length).reverse())
      .align(1)
      .padding(1);

    const yOverlap = d3
      .scalePoint()
      .range([
        dimsOverlap.margin.top,
        dimsOverlap.height - dimsOverlap.margin.bottom,
      ])
      .domain(layerIdsOrdered.slice(0, layers.length - 1))
      .align(0)
      .padding(1);

    d3.select(correlogramRef.current).attr(
      'transform',
      `translate(${dims.width - dimsOverlap.width},${marginTop})`
    );

    d3.select(bubbleGroupRef.current).attr('transform', `translate(0,30)`); // for top label

    updateOverlap(layerNodes, showOverlap);

    function ticked() {
      link
        .attr('x1', (d) => d.source.x)
        .attr('y1', (d) => d.source.y)
        .attr('x2', (d) => d.target.x)
        .attr('y2', (d) => d.target.y);

      node.attr('cx', (d) => d.x).attr('cy', (d) => d.y);

      const nodeData = node.data();
      layerNode
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

      layerNode
        .transition(styles.transition)
        .style('fill-opacity', (o) => (linked(o, d) ? 1 : styles.text.alpha));

      node
        .transition(styles.transition)
        .style('fill-opacity', (o) => (linked(o, d) ? 1 : styles.text.alpha))
        .attr('r', (o) => (o.id === d.id ? styles.node.r2 : styles.node.r));

      updateGenres(
        layerNodes.filter((o) => linked(o, d)),
        showGenres
      );

      updateOverlap(
        layerNodes.filter((o) => linked(o, d)),
        showOverlap
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

      layerNode.transition(styles.transition).style('fill-opacity', 1);

      node
        .transition(styles.transition)
        .style('fill-opacity', 1)
        .attr('r', styles.node.r);

      updateGenres(layerNodes, showGenres);

      updateOverlap(layerNodes, showOverlap);
    }

    function updateGenres(layerNodes, showGenres) {
      const data = showGenres ? countGenres(layerNodes) : [];

      xGenres.domain([0, d3.max(data, (b) => d3.max(layerIds, (l) => b[l]))]);
      y0Genres.domain(data.map((d) => d.genre));
      y1Genres.range([0, y0Genres.bandwidth()]);

      const barGroup = d3
        .select(barGroupRef.current)
        .selectAll('.barGroups')
        .data(data)
        .join('g')
        .attr('class', 'barGroups')
        .attr('transform', (d) => `translate(0,${y0Genres(d.genre)})`);

      barGroup
        .selectAll('rect')
        .data((d) =>
          layerIds.map((layerId) => ({ layerId, count: d[layerId] }))
        )
        .join('rect')
        .attr('x', (d) => xGenres(0))
        .attr('y', (d) => y1Genres(d.layerId))
        .attr('height', y1Genres.bandwidth())
        .attr('width', (d) => xGenres(d.count))
        .attr('fill', (d) => color(d.layerId))
        .attr('fill-opacity', styles.bar.alpha);

      barGroup
        .selectAll('.xBar')
        .data((d) =>
          layerIds.slice(0, 1).map((layerId) => ({
            layerId,
            count: d[layerId] ? d[layerId] : 0,
          }))
        )
        .join('text')
        .attr('class', 'xBar')
        .attr('x', (d) => xGenres(d.count) + 5)
        .attr('y', (d) => y1Genres(d.layerId))
        .text((d) => {
          const total = data
            .map((v) => (v[d.layerId] ? v[d.layerId] : 0))
            .reduce((a, b) => a + b, 0);
          return total === 0 || d.count === 0
            ? ''
            : ((100 * d.count) / total).toFixed(0) + '%';
        })
        .style('alignment-baseline', 'hanging')
        .style('fill', styles.text.fill)
        .style('font-size', styles.text.size);

      d3.select(yBarRef.current)
        .selectAll('.yBar')
        .data(data)
        .join('text')
        .attr('class', 'yBar')
        .attr('x', (d) => xGenres(0))
        .attr('y', (d) => y0Genres(d.genre) - 1)
        .text((d) => d.genre)
        .style('fill', styles.text.fill)
        .style('font-size', styles.text.size);
    }

    function updateOverlap(layerNodes, showOverlap) {
      let data = showOverlap ? countOverlaps(layerNodes) : [];

      const max = d3.max(data.map((v) => v.count));

      function upper(x, y) {
        return layerIdsOrdered.indexOf(x) > layerIdsOrdered.indexOf(y);
      }

      data = data.reverse().map((v) => ({
        ...v,
        r: styles.node.r * (1 + upper(v.x, v.y) + (v.count / max) ** 3),
      }));

      const dataUpper = data.filter((v) => upper(v.x, v.y));
      const count = d3.sum(dataUpper.map((v) => v.count));
      const total = d3.sum(layers.map((v) => v.totalNodes));
      const percent = ((100 * count) / total).toFixed(0);
      const label = showOverlap ? `${count} overlapping (${percent}%)` : '';
      updateCorLabel([label]);

      d3.select(bubbleRef.current)
        .selectAll('circle')
        .data(data)
        .join('circle')
        .attr('cx', (d) => (upper(d.x, d.y) ? xOverlap(d.x) : xOverlap(d.y)))
        .attr('cy', (d) => (upper(d.x, d.y) ? yOverlap(d.y) : yOverlap(d.x)))
        .attr('r', (d) => d.r)
        .attr('fill', (d) => color(d.x))
        .attr('fill-opacity', styles.node.alpha);

      d3.select(bubbleLabelRef.current)
        .selectAll('text')
        .data(dataUpper)
        .join('text')
        .attr('x', (d) => xOverlap(d.x) - d.r * 1.3)
        .attr('y', (d) => yOverlap(d.y))
        .text((d) => d.count)
        .style('text-anchor', 'end')
        .style('alignment-baseline', 'middle')
        .style('font-size', styles.text.size)
        .style('fill', styles.text.fill);
    }

    function updateCorLabel(data) {
      d3.select(corLabelRef.current)
        .selectAll('text')
        .data(data)
        .join('text')
        .attr('x', dimsOverlap.width)
        .attr('y', 0)
        .text((d) => d)
        .style('text-anchor', 'end')
        .style('font-size', styles.text.size)
        .style('fill', styles.text.fill);
    }
  };

  useEffect(effect, [data, dims]);

  return (
    <div ref={wrapperRef}>
      <svg ref={svgRef} width="100%" height={'60vh'}>
        <g ref={networkRef}>
          <g ref={linkRef} />
          <g ref={layerNodeRef} />
          <g ref={nodeRef} />
          <g ref={labelRef} />
        </g>
        <g ref={histogramRef}>
          <g ref={barGroupRef}>
            <g ref={barRef} />
          </g>
          <g ref={yBarRef} />
        </g>
        <g ref={correlogramRef}>
          <g ref={corLabelRef} />
          <g ref={bubbleGroupRef}>
            <g ref={bubbleRef} />
            <g ref={bubbleLabelRef} />
          </g>
        </g>
      </svg>
    </div>
  );
};

export default Graphs;
