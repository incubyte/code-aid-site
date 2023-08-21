import ForceGraph from "./force-graph";
import { Link, Node } from "./interfaces";
import { convertToTitleCase, makeSvgScrollable, makeSvgZoomable } from "./utils";

function assignLinkLabels(links: Link[]) {
  return links.map((link) => {
    return { ...link, label: link.type };
  });
}

function assignNodeLabels(nodes: Node[]) {
  return nodes.map((node) => {
    return { ...node, label: node.name, objectType: convertToTitleCase(node.objectType) };
  });
}

const loadSqlGraph = async () => {
  const response = await fetch("./graph.json");
  const data = await response.json();

  const width = 1200;
  const height = 600;
  const viewBox = {x: -width / 2, y: -height / 2, width, height};

  const nodes = assignNodeLabels(data.nodes);
    const links = assignLinkLabels(data.links);

    const {graph, legend} = ForceGraph({nodes, edges: links}, {
      viewBox
    });

    document.getElementById("graph-container").appendChild(graph);
    document.getElementById("graph-container").appendChild(legend);
    makeSvgScrollable(graph, viewBox);
    makeSvgZoomable(graph, viewBox);
}

loadSqlGraph();
