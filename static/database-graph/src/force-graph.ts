import { ForceGraphOptions, Link, Node, ViewBox } from "./interfaces";
import * as d3 from "d3";
import { convertToLowerCaseSeparatedWords, convertToTitleCase, extractSecondPart } from "./utils";

interface Graph {
  nodes: Node[];
  edges: Link[];
}

const VALID_OBJECTS = [
  "TRIGGERED_VALUED_FUNCTION",
  "FUNCTION",
  "STORED_PROCEDURE",
  "VIEW",
  "TRIGGER"
];

function isValidObject(d: { objectType: string; name: string }) {
  const validObjectTitleCase = VALID_OBJECTS.map((o) =>
    convertToTitleCase(o)
  );
  return validObjectTitleCase.indexOf(d.objectType) >= 0;
}

function handleNodeClick(event: any, d: { objectType: string; name: string }) {
  console.log(d);
  if (isValidObject(d)) {
    window.location.href =
      window.location.href +
      convertToLowerCaseSeparatedWords(d.objectType) +
      "/" +
      (d.name as any)
        .toLowerCase()
        .replace(".", "-")
        .replaceAll("[", "")
        .replaceAll("]", "");
  }
}

function drag(simulation: d3.Simulation<d3.SimulationNodeDatum, undefined>) {
  function dragstarted(event: {
    active: any;
    subject: { fx: any; x: any; fy: any; y: any };
  }) {
    if (!event.active) simulation.alphaTarget(0.3).restart();
    event.subject.fx = event.subject.x;
    event.subject.fy = event.subject.y;
  }

  function dragged(event: { subject: { fx: any; fy: any }; x: any; y: any }) {
    event.subject.fx = event.x;
    event.subject.fy = event.y;
  }

  function dragended(event: { active: any; subject: { fx: null; fy: null } }) {
    if (!event.active) simulation.alphaTarget(0);
    event.subject.fx = null;
    event.subject.fy = null;
  }

  return d3
    .drag()
    .on("start", dragstarted)
    .on("drag", dragged)
    .on("end", dragended);
}

export default function ForceGraph(
  graph: Graph,
  {
    nodeStroke = "#fff",
    nodeStrokeWidth = 1.5,
    nodeStrokeOpacity = 1,
    nodeRadius = 8,
    nodeStrength,
    linkStroke = "#999",
    linkStrokeOpacity = 0.6,
    linkStrokeWidth = 1.5,
    linkStrokeLinecap = "round",
    linkStrength,
    viewBox,
    legendWidth = 250,
    legendPadding = 10,
    legendTextSize = 12,
  }: ForceGraphOptions
) {
  let { nodes, edges } = graph;

  const nodeIds = d3.map(nodes, (node) => node.id);
  const linkSources = d3.map(edges, (edge) => edge.source);
  const linkTargets = d3.map(edges, (edge) => edge.target);
  const nodeNames = d3.map(nodes, (node) => node.name);
  const groupNames = d3.map(nodes, (node) => node.objectType);

  // Replace the input nodes and links with mutable objects for the simulation.
  nodes = d3.map(nodes, (node, i) => ({ ...node, id: nodeIds[i] }));
  edges = d3.map(edges, (link, i) => ({
    ...link,
    source: linkSources[i],
    target: linkTargets[i],
  }));

  // Compute default domains.
  const sortedGroups = d3.sort(groupNames);

  // Construct the scales with color scheme
  const color = d3.scaleOrdinal(sortedGroups, d3.schemeTableau10);

  // Construct the forces.
  const forceNode = d3.forceManyBody().strength(-200);
  const forceLink = d3
    .forceLink(edges)
    .id(({ index: i }) => nodeIds[i])
    .distance(150);
  if (nodeStrength !== undefined) forceNode.strength(nodeStrength);
  if (linkStrength !== undefined) forceLink.strength(linkStrength);

  const simulation = d3
    .forceSimulation(nodes)
    .force("link", forceLink)
    .force("charge", forceNode)
    .force("center", d3.forceCenter())
    .on("tick", ticked);

  const svg = d3
    .create("svg")
    .attr("class", "graph-svg")
    .attr("width", viewBox.width)
    .attr("height", viewBox.height)
    .attr("viewBox", [
      -viewBox.width / 2,
      -viewBox.height / 2,
      viewBox.width,
      viewBox.height,
    ])
    .attr(
      "style",
      "max-width: 100%; height: auto; height: intrinsic; border: 1px solid black;"
    );

  const edge = svg
    .append("g")
    .attr("stroke", linkStroke)
    .attr("stroke-opacity", linkStrokeOpacity)
    .attr("stroke-width", linkStrokeWidth)
    .attr("stroke-linecap", linkStrokeLinecap)
    .selectAll("line")
    .data(edges)
    .join("line");

  const edgeLabel = svg
    .selectAll(".link-label")
    .data(edges)
    .enter()
    .append("text")
    .attr("class", "link-label")
    .text((d: any) => d.label)
    .attr("text-anchor", "middle")
    .attr("alignment-baseline", "middle");

  const node = svg
    .append("g")
    .attr("stroke", nodeStroke)
    .attr("stroke-opacity", nodeStrokeOpacity)
    .attr("stroke-width", nodeStrokeWidth)
    .selectAll("circle")
    .data(nodes)
    .join("circle")
    .attr("r", nodeRadius)
    .call(drag(simulation) as any)
    .on("click", handleNodeClick as any)
    .style("cursor", "pointer");

  const nodeLabel = svg
    .selectAll(".node-label")
    .data(nodes)
    .enter()
    .append("text")
    .attr("class", "node-label")
    .text((d) => extractSecondPart(d.name))
    .attr("text-anchor", "middle")
    .attr("alignment-baseline", "middle");

  node
    .append("a")
    .attr("xlink:href", (d) => `${d.name}`)
    .append("circle")
    .attr("r", nodeRadius);

  node.attr("fill", ({ index: i }) => color(groupNames[i]));

  node.append("title").text(({ index: i }) => nodeNames[i]);

  // Filter out duplicate group names
  const uniqueGroups = Array.from(new Set(sortedGroups));
  // Create the legend SVG container
  const legendSVG = d3
    .create("svg")
    .attr("class", "legend-svg")
    .attr("width", legendWidth)
    .attr("height", uniqueGroups.length * (legendTextSize + legendPadding) + 2 * legendPadding)
    .style("pointer-events", "none"); // Disable pointer events for the legend SVG

  // Add a background rectangle for the legend
  legendSVG
    .append("rect")
    .attr("width", legendWidth)
    .attr("height", uniqueGroups.length * (legendTextSize + legendPadding) + 2 * legendPadding)
    .attr("fill", "white")
    .attr("stroke", "black")
    .attr("stroke-width", 1);

  // Add legend items
  const legendItems = legendSVG
    .selectAll(".legend-item")
    .data(uniqueGroups)
    .enter()
    .append("g")
    .attr("class", "legend-item")
    .attr("transform", (_, i) => `translate(${legendPadding},${i * (legendTextSize + legendPadding) + legendPadding})`);

  // Add color dots to legend items
  legendItems
    .append("circle")
    .attr("cx", 0)
    .attr("cy", legendTextSize / 2)
    .attr("r", legendTextSize / 2)
    .attr("fill", color);

  // Add group names to legend items
  legendItems
    .append("text")
    .attr("x", legendTextSize + legendPadding)
    .attr("y", legendTextSize / 2)
    .text(d => d)
    .attr("font-size", legendTextSize)
    .attr("alignment-baseline", "middle");


  function ticked() {
    edge
      .attr("x1", (d: any) => d.source.x)
      .attr("y1", (d: any) => d.source.y)
      .attr("x2", (d: any) => d.target.x)
      .attr("y2", (d: any) => d.target.y);

    edgeLabel
      .attr("x", (d: any) => (d.source.x + d.target.x) / 2)
      .attr("y", (d: any) => (d.source.y + d.target.y) / 2);

    node.attr("cx", (d: any) => d.x).attr("cy", (d: any) => d.y);

    nodeLabel.attr("x", (d: any) => d.x).attr("y", (d: any) => d.y);
  }

  return {
    graph: Object.assign(svg.node(), { scales: { color } }),
    legend: Object.assign(legendSVG.node(), { scales: { color } }),
  };
}