function ForceGraph(
  {
    nodes, // an iterable of node objects (typically [{id}, …])
    links, // an iterable of link objects (typically [{source, target}, …])
  },
  {
    nodeId = (d) => d.id, // given d in nodes, returns a unique identifier (string)
    nodeGroup, // given d in nodes, returns an (ordinal) value for color
    nodeGroups, // an array of ordinal values representing the node groups
    nodeTitle, // given d in nodes, a title string
    nodeFill = "currentColor", // node stroke fill (if not using a group color encoding)
    nodeStroke = "#fff", // node stroke color
    nodeStrokeWidth = 1.5, // node stroke width, in pixels
    nodeStrokeOpacity = 1, // node stroke opacity
    nodeRadius = 8, // node radius, in pixels
    nodeStrength,
    linkSource = ({ source }) => source, // given d in links, returns a node identifier string
    linkTarget = ({ target }) => target, // given d in links, returns a node identifier string
    linkStroke = "#999", // link stroke color
    linkStrokeOpacity = 0.6, // link stroke opacity
    linkStrokeWidth = 1.5, // given d in links, returns a stroke width in pixels
    linkStrokeLinecap = "round", // link stroke linecap
    linkStrength,
    colors = d3.schemeTableau10, // an array of color strings, for the node groups
    width = 640, // outer width, in pixels
    height = 400, // outer height, in pixels
    invalidation, // when this promise resolves, stop the simulation
  } = {}
) {
  // Compute values.
  const N = d3.map(nodes, nodeId).map(intern);
  const LS = d3.map(links, linkSource).map(intern);
  const LT = d3.map(links, linkTarget).map(intern);
  if (nodeTitle === undefined) nodeTitle = (_, i) => N[i];
  const T = nodeTitle == null ? null : d3.map(nodes, nodeTitle);
  const G = nodeGroup == null ? null : d3.map(nodes, nodeGroup).map(intern);
  const W =
    typeof linkStrokeWidth !== "function"
      ? null
      : d3.map(links, linkStrokeWidth);
  const L = typeof linkStroke !== "function" ? null : d3.map(links, linkStroke);

  // Replace the input nodes and links with mutable objects for the simulation.
  nodes = d3.map(nodes, (node, i) => ({ ...node, id: N[i] }));
  links = d3.map(links, (link, i) => ({
    ...link,
    source: LS[i],
    target: LT[i],
  }));

  // Compute default domains.
  if (G && nodeGroups === undefined) nodeGroups = d3.sort(G);

  // Construct the scales.
  const color = nodeGroup == null ? null : d3.scaleOrdinal(nodeGroups, colors);

  // Construct the forces.
  const forceNode = d3.forceManyBody().strength(-200);
  const forceLink = d3
    .forceLink(links)
    .id(({ index: i }) => N[i])
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
    .attr("width", width)
    .attr("height", height)
    .attr("viewBox", [-width / 2, -height / 2, width, height])
    .attr(
      "style",
      "max-width: 100%; height: auto; height: intrinsic; border: 1px solid black;"
    );

  const link = svg
    .append("g")
    .attr("stroke", typeof linkStroke !== "function" ? linkStroke : null)
    .attr("stroke-opacity", linkStrokeOpacity)
    .attr(
      "stroke-width",
      typeof linkStrokeWidth !== "function" ? linkStrokeWidth : null
    )
    .attr("stroke-linecap", linkStrokeLinecap)
    .selectAll("line")
    .data(links)
    .join("line");

  const linkLabel = svg
    .selectAll(".link-label")
    .data(links)
    .enter()
    .append("text")
    .attr("class", "link-label")
    .text((d) => d.label)
    .attr("text-anchor", "middle")
    .attr("alignment-baseline", "middle");

  const node = svg
    .append("g")
    .attr("fill", nodeFill)
    .attr("stroke", nodeStroke)
    .attr("stroke-opacity", nodeStrokeOpacity)
    .attr("stroke-width", nodeStrokeWidth)
    .selectAll("circle")
    .data(nodes)
    .join("circle")
    .attr("r", nodeRadius)
    .call(drag(simulation))
    .on("click", handleNodeClick)
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

  function handleNodeClick(event, d) {
    if (
      ["TRIGGERED_VALUED_FUNCTION", "FUNCTION", "STORED_PROCEDURE"].indexOf(
        d.objectType
      ) >= 0
    ) {
      window.location.href =
        window.location.href +
        convertToLowerCaseSeparatedWords(d.objectType) +
        "/" +
        d.name
          .toLowerCase()
          .replace(".", "-")
          .replaceAll("[", "")
          .replaceAll("]", "");
    }
  }

  node
    .append("a")
    .attr("xlink:href", (d) => `${d.name}`)
    .append("circle")
    .attr("r", nodeRadius);

  if (W) link.attr("stroke-width", ({ index: i }) => W[i]);
  if (L) link.attr("stroke", ({ index: i }) => L[i]);
  if (G) node.attr("fill", ({ index: i }) => color(G[i]));
  if (T) node.append("title").text(({ index: i }) => T[i]);
  if (invalidation != null) invalidation.then(() => simulation.stop());

  function intern(value) {
    return value !== null && typeof value === "object"
      ? value.valueOf()
      : value;
  }

  function ticked() {
    link
      .attr("x1", (d) => d.source.x)
      .attr("y1", (d) => d.source.y)
      .attr("x2", (d) => d.target.x)
      .attr("y2", (d) => d.target.y);

    linkLabel
      .attr("x", (d) => (d.source.x + d.target.x) / 2)
      .attr("y", (d) => (d.source.y + d.target.y) / 2);

    node.attr("cx", (d) => d.x).attr("cy", (d) => d.y);

    nodeLabel.attr("x", (d) => d.x).attr("y", (d) => d.y);
  }

  function drag(simulation) {
    function dragstarted(event) {
      if (!event.active) simulation.alphaTarget(0.3).restart();
      event.subject.fx = event.subject.x;
      event.subject.fy = event.subject.y;
    }

    function dragged(event) {
      event.subject.fx = event.x;
      event.subject.fy = event.y;
    }

    function dragended(event) {
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

  return Object.assign(svg.node(), { scales: { color } });
}

fetch("/graph.json")
  .then((response) => response.json())
  .then((data) => {
    console.log(window.location.href);
    const nodes = data.nodes.map((node) => {
      return { ...node, label: node.name };
    });

    const links = data.links.map((link) => {
      return { ...link, label: link.type };
    });

    const resultsSqlobjectsdb = {
      nodes: nodes,
      links: links,
    };

    chart = ForceGraph(resultsSqlobjectsdb, {
      nodeId: (d) => d.id,
      nodeGroup: (d) => d.group,
      // nodeTitle: (d) => `${d.id}\n${d.group}`,
      nodeTitle: (d) => d.name,
      linkStrokeWidth: (l) => Math.sqrt(l.value),
      width: 1200,
      height: 600,
    });

    // document.body.appendChild(chart);
    // console.log(chart);
    document.getElementById("graph-container").appendChild(chart);
    makeSvgScrollable();
  });

function extractSecondPart(str) {
  const regex = /\[([^.\]]+)\](?:\.(\[[^.\]]+\]|[^.\[\]]+))?/;
  const match = str.match(regex);

  if (match) {
    const secondPart = match[2] || match[1];
    const parts = secondPart.split(".");
    return parts[parts.length - 1].replace(/\[|\]/g, ""); // Get the last part and remove brackets
  }

  const lastDotIndex = str.lastIndexOf(".");
  if (lastDotIndex !== -1) {
    return str.substring(lastDotIndex + 1);
  }

  return str;
}

function convertToLowerCaseSeparatedWords(str) {
  // Replace underscores with spaces
  const stringWithSpaces = str.replace(/_/g, " ");

  // Convert to lower case and split into words
  const words = stringWithSpaces.toLowerCase().split(" ");

  // Join words with hyphens
  const convertedString = words.join("-");

  return convertedString;
}

function makeSvgScrollable() {
  const svgPointer = document.getElementsByTagName("svg")[0];
  let viewBox = { x: 0, y: 0, width: 800, height: 600 }; // Initial viewBox values

  let isDragging = false;
  let startCoords = { x: 0, y: 0 };

  svgPointer.addEventListener("mousedown", startDrag);
  svgPointer.addEventListener("mousemove", handleDrag);
  svgPointer.addEventListener("mouseup", endDrag);
  svgPointer.addEventListener("mouseleave", endDrag);

  function startDrag(event) {
    isDragging = true;
    startCoords = { x: event.clientX, y: event.clientY };
  }

  function handleDrag(event) {
    if (isDragging) {
      const { clientX, clientY } = event;
      const dx = clientX - startCoords.x;
      const dy = clientY - startCoords.y;

      viewBox.x -= dx;
      viewBox.y -= dy;

      svgPointer.setAttribute(
        "viewBox",
        `${viewBox.x} ${viewBox.y} ${viewBox.width} ${viewBox.height}`
      );

      startCoords = { x: clientX, y: clientY };
    }
  }

  function endDrag() {
    isDragging = false;
  }
}
