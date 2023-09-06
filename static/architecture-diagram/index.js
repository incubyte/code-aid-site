const applyFiltersButton = document.getElementById("apply-filters");
const resetFiltersButton = document.getElementById("reset-filters");

const nameFilter = document.getElementById("name-filter");

const locFilterMin = document.getElementById("loc-filter-min");
const locFilterMax = document.getElementById("loc-filter-max");
const minSelectedValue = document.getElementById("min-selected-value");
const maxSelectedValue = document.getElementById("max-selected-value");

applyFiltersButton.addEventListener("click", applyFilters);
resetFiltersButton.addEventListener("click", () => {
    nameFilter.value = "";
    locFilterMin.value = 0;
    locFilterMax.value = locFilterMax.max;
    updateLocFilterValues();
    applyFilters();
});

const data = fetch("./d3-diagram.json")
    .then((res) => res.json())
    .then((data) => dependencyAnalysis(data));
let filteredData;

const chart = () => {
    let tooltipTimeout;

    // Specify the chart’s dimensions.
    const width = 1200;
    const height = 700;

    // Create the color scale.
    // Adjusted color scale with better contrast
    const color = d3.scaleSequential(d3.interpolateBlues).domain([0, 15]);

    // Compute the layout.
    const pack = (data) =>
        d3
            .pack()
            .size([width + 300, height + 300])
            .radius(() => 1)
            .padding(function (d) {
                return d.height > 1 ? Math.min(d.height, 8) * 0.5 : 0.25;
            })(
                d3
                    .hierarchy(data)
                    .sum((d) => {
                        return 1;
                    })
                    .sort((a, b) => 1)
            );
    const root = pack(filteredData);

    const maxLoc = d3.max(root.descendants().slice(1), (d) =>
        d.children ? 0 : d.data.loc
    );

    const greenScale = d3
        .scaleQuantize()
        .domain([0, maxLoc])
        .range(d3.quantize(d3.interpolateGreens, 10));

    // Create the SVG container.
    const svg = d3
        .create("svg")
        .attr("viewBox", `-${width / 2} -${height / 2} ${width} ${height}`)
        .attr("width", width)
        .attr("height", height)
        .attr(
            "style",
            `max-width: 100%; height: auto; display: block; margin: 0 -14px; background: ${color(
                0
            )}; cursor: pointer;`
        );

    // Append the nodes.
    const node = svg
        .append("g")
        .selectAll("circle")
        .data(root.descendants().slice(1))
        .join("circle")
        .attr("fill", (d) => (d.children ? color(d.depth) : (d.data.actualModule === d.data.optimalModule ? greenScale(d.data.loc) : "#DDA0DD")))
        .attr("stroke", "grey")
        // .attr("pointer-events", d => !d.children ? "none" : null)
        .on("click", function (e, d) {
            const isSelected = d3.select(this).attr("stroke") === "red";
            setAttributeToEveryChild(d, "stroke", isSelected ? "grey" : "red");
            // Show/hide dependency lines
            linkPaths
                .filter((l) => {
                    // console.log(l.source, d);
                    return (
                        isInsideOrEqualNode(d, l.source)
                    );
                })
                .style("stroke", (d) => "#ff7f00")
                .attr("marker-end", (d) => `url(#arrow-fanOut)`)
                .style("display", isSelected ? "none" : "inline");

            linkPaths
                .filter((l) => {
                    // console.log(l.source, d);
                    return (
                        isInsideOrEqualNode(d, l.target)
                    );
                })
                .style("stroke", (d) => "#e013e5")
                .attr("marker-end", (d) => `url(#arrow-fanIn)`)
                .style("display", isSelected ? "none" : "inline");
            linkPaths
                .filter((l) => {
                    // console.log(l.source, d);
                    return (
                        isInsideOrEqualNode(d, l.target) && isInsideOrEqualNode(d, l.source)
                    );
                })
                .style("stroke", (d) => "#078d94")
                .attr("marker-end", (d) => `url(#arrow-internal)`)
                .style("display", isSelected ? "none" : "inline");
        })
        .on("wheel", (event, d) => {
            event.preventDefault();
            event.stopPropagation();
            if (event.deltaY > 0) {
                // Scrolled down
                if (focus.parent) zoom(event, focus.parent);
                return;
            }
            // Scrolled up
            focus !== d && zoom(event, d);
        });

    node
        .on("mousemove", function (e, d) {
            if (tooltipTimeout) {
                clearTimeout(tooltipTimeout);
            }

            tooltip.transition().duration(300).style("display", "none");
            // Set a timeout for showing the tooltip
            tooltipTimeout = setTimeout(() => {
                tooltip.transition().duration(200).style("display", "block");
                tooltip
                    .html(
                        (() => {
                            const fullyQualifiedName = d.data.name;
                            const parts = fullyQualifiedName.split(".");
                            const fileName = parts[parts.length - 1];
                            const locInfo = d.children
                                ? ""
                                : `<br/>Lines of Code: ${d.data.loc}`;
                            const actualModule = d.children
                                ? ""
                                : `<br/>Acutal module of class: ${d.data.actualModule}`;
                            const proposedModule = d.children
                                ? ""
                                : `<br/>Acutal module of class: ${d.data.optimalModule}`;
                            return `<strong>${fileName}</strong>${locInfo}${actualModule}${proposedModule}`;
                        })()
                    )
                    .style("left", e.pageX + 10 + "px")
                    .style("top", e.pageY - 35 + "px");
            }, 300); // 500ms delay
        })
        .on("mouseenter", function (e, d) {
            d3.select(this)
                .transition() // Smooth transition
                .duration(200) // Duration of transition in milliseconds
                .attr("stroke-width", 5);
        })
        .on("mouseleave", function (e, d) {
            d3.select(this)
                .transition() // Smooth transition back
                .duration(200) // Duration of transition in milliseconds
                .attr("stroke-width", 1);

            if (tooltipTimeout) {
                //dont show if mouse left node, to handle mouse moving outside nodes
                clearTimeout(tooltipTimeout);
            }
        });

    function isInsideOrEqualNode(currNode, nodeToCheck) {
        return (
            currNode === nodeToCheck ||
            currNode.descendants().some((node) => node === nodeToCheck)
        );
    }

    function setAttributeToEveryChild(currNode, attr, val) {
        node.filter((n) => isInsideOrEqualNode(currNode, n)).attr(attr, val);
    }

    const tooltip = d3
        .select("body")
        .append("div")
        .attr("pointer-events", "none")
        .style("display", "block")
        .style("opacity", 0.9)
        .style("position", "absolute")
        .style("padding", "10px") // Added padding for better visual appearance
        .style("background", "rgba(255, 255, 255, 0.9)") // Semi-transparent background
        .style("border", "1px solid #ccc") // Added border for distinction
        .style("border-radius", "5px") // Rounded corners for better visuals
        .style("font-size", "12px") // Adjusted font size
        .style("color", "#333") // Dark text color for contrast
        .style("box-shadow", "0px 0px 10px rgba(0, 0, 0, 0.2)");

    const label = svg
        .append("g")
        .attr("pointer-events", "none")
        .attr("text-anchor", "middle")
        .selectAll("g")
        .data(root.descendants().slice(1))
        .join("g")
        .each(function (d, i) {
            d3.select(this).style("display", () => (d.depth < 3 ? "inline" : "none"));
            const pathId = `CircleText--${i}`;
            const radius = d.r;

            d3.select(this)
                .append("path")
                .attr("class", "scalable-path")
                .attr("fill", "none")
                .attr("id", pathId)
                .attr(
                    "d",
                    `M 0 ${radius} A ${radius} ${radius} 0 0 1 0 ${-radius} A ${radius} ${radius} 0 0 1 0 ${radius}`
                );

            d3.select(this)
                .append("text")
                .style("fill-opacity", 1)
                .style("display", "inline")
                .append("textPath")
                .attr("href", `#${pathId}`)
                .attr("startOffset", "50%")
                .attr("text-anchor", "middle")
                .attr("fill", "#374151")
                .text(
                    (() => {
                        const fullyQualifiedName = d.data.name;
                        if (!fullyQualifiedName) return "";
                        const parts = fullyQualifiedName.split(".");
                        const fileName = parts[parts.length - 1];
                        return fileName;
                    })()
                );
        });

    const defs = svg.append("defs");

    const arrowColors = {
        fanIn: "#e013e5",
        fanOut: "#ff7f00",
        internal: "#078d94",
    };

    for (let type in arrowColors) {
        defs
            .append("marker")
            .attr("id", "arrow-" + type)
            .attr("viewBox", "0 0 10 10")
            .attr("refX", 10)
            .attr("refY", 5)
            .attr("markerWidth", 7)
            .attr("markerHeight", 7)
            .attr("orient", "auto-start-reverse")
            .append("path")
            .attr("d", "M 0 0 L 10 5 L 0 10 Z") // Defines an arrow shape
            .attr("fill", arrowColors[type]);
    }

    const links = root
        .descendants()
        .slice(1)
        .flatMap((d) =>
            d.data.dependencies?.map((dep) => ({
                source: d,
                target: findNodeByName(root, dep.to),
                type: dep.type,
            }))
        )
        .filter((x) => x && x.target);

    const linkPaths = svg
        .append("g")
        .attr("pointer-events", "none")
        .attr("fill", "none")
        .attr("stroke-width", 1.5)
        .selectAll("line")
        .data(links)
        .join("line")
        .attr("marker-end", (d) => `url(#arrow-fanIn)`)
        .style("stroke", (d) => "orange")
        .style("stroke-dasharray", (d) => {
            switch (d.type) {
                case "superclass":
                    return "3.1";
                case "interface":
                    return "10.2";
                case "others":
                    return "0";
                default:
                    return "0";
            }
        })
        .style("display", "none"); // Initially hidden

    // Create the zoom behavior and zoom immediately in to the initial focus node.
    let focus = root;
    let view;
    zoomTo([focus.x, focus.y, focus.r * 2]);

    function zoomTo(v) {
        const k = (height * 0.9) / v[2];

        view = v;

        label.attr(
            "transform",
            (d) => `translate(${(d.x - v[0]) * k},${(d.y - v[1]) * k})`
        );
        // Scale the text paths
        svg.selectAll(".scalable-path").attr("transform", (d) => `scale(${k})`);

        node.attr(
            "transform",
            (d) => `translate(${(d.x - v[0]) * k},${(d.y - v[1]) * k})`
        );
        node.attr("r", (d) => d.r * k);
        // Scale the text itself (you can adjust the scaling factor if needed)
        svg.selectAll("text").style("font-size", (d) => {
            return `${(d.r * k) / 8}px`;
        });

        linkPaths
            .attr("x1", (d) => (d.source.x - v[0]) * k)
            .attr("y1", (d) => (d.source.y - v[1]) * k)
            .attr("x2", (d) => (d.target.x - v[0]) * k)
            .attr("y2", (d) => (d.target.y - v[1]) * k);
    }

    function findNodeByName(node, name) {
        if (node.data.name === name) return node;
        if (node.children) {
            for (const child of node.children) {
                const found = findNodeByName(child, name);
                if (found) return found;
            }
        }
        return null;
    }

    function zoom(event, d) {
        const focus0 = focus;

        focus = d;

        const transition = svg
            .transition()
            .duration(event.altKey ? 7500 : 750)
            .tween("zoom", (d) => {
                const i = d3.interpolateZoom(view, [focus.x, focus.y, focus.r * 2]);
                return (t) => zoomTo(i(t));
            });

        label
            .transition(transition)
            .on("start", function (d) {
                if (d === focus || d.parent === focus || d.parent?.parent === focus)
                    this.style.display = "inline";
            })
            .on("end", function (d) {
                if (d !== focus && d.parent !== focus && d.parent?.parent !== focus)
                    this.style.display = "none";
            });
    }

    document.getElementById("chart")?.replaceChildren(svg.node());
};

(async () => {
    filteredData = await data;
    const maxLoc = getMaxLOC(filteredData.children);
    locFilterMax.max = maxLoc;
    locFilterMin.max = maxLoc;
    locFilterMin.value = 0;
    locFilterMax.value = maxLoc;
    updateLocFilterValues();
    chart();
})();

async function applyFilters() {
    filteredData = JSON.parse(JSON.stringify(await data));
    const nameFilterValue = nameFilter.value;
    if (nameFilterValue) {
        filteredData.children = filterByName(
            filteredData.children,
            nameFilterValue
        );
    }
    const locFilterMinValue = parseInt(locFilterMin.value);
    const locFilterMaxValue = parseInt(locFilterMax.value);
    filteredData.children = filterByLOC(
        filteredData.children,
        locFilterMinValue,
        locFilterMaxValue
    );

    chart();
}

function filterByName(data, name) {
    return data.filter((d) => {
        if (d.name?.includes(name)) {
            return true;
        }
        if (d.children) {
            d.children = filterByName(d.children, name);
            return d.children.length > 0;
        }
        return false;
    });
}

function updateLocFilterValues() {
    minSelectedValue.textContent = locFilterMin.value;
    maxSelectedValue.textContent = locFilterMax.value;
}

locFilterMin.addEventListener("input", function () {
    if (parseInt(this.value) > parseInt(locFilterMax.value)) {
        locFilterMax.value = this.value;
    }
    updateLocFilterValues();
});

locFilterMax.addEventListener("input", function () {
    if (parseInt(this.value) < parseInt(locFilterMin.value)) {
        locFilterMin.value = this.value;
    }
    updateLocFilterValues();
});

function getMaxLOC(data) {
    let max = 0;
    for (const d of data) {
        if (d.children) {
            const maxLoc = getMaxLOC(d.children);
            if (maxLoc > max) {
                max = maxLoc;
            }
        } else {
            if (d.loc > max) {
                max = d.loc;
            }
        }
    }
    return max;
}

function filterByLOC(data, min, max) {
    return data.filter((d) => {
        if (d.children) {
            d.children = filterByLOC(d.children, min, max);
            return d.children.length > 0;
        }
        return d.loc >= min && d.loc <= max;
    });
}

function dependencyAnalysis(data) {
    const controllerNodes = findAllNodes(data, (node) => node.name.includes("Controller"));
    const nodesToVisit = new Map() // Map<node, {proposedModule: number}>
    const visitedNodes = new Set()
    for (const node of controllerNodes) {
        nodesToVisit.set(node, {[node.actualModule]: 1});
    }
    while (nodesToVisit.size > 0) {
        const [node, proposedModules] = nodesToVisit.entries().next().value;
        nodesToVisit.delete(node);
        visitedNodes.add(node);
        const optimalModule = Object.keys(proposedModules).reduce((a, b) => proposedModules[a] > proposedModules[b] ? a : b);
        node.optimalModule = optimalModule;
        if (!node.dependencies) continue;
        for (const dependency of node.dependencies) {
            const dependencyNode = findNodeByName(data, dependency.to);
            if (!dependencyNode) continue;
            if (visitedNodes.has(dependencyNode)) {
                continue;
            }
            if (!nodesToVisit.has(dependencyNode)) {
                nodesToVisit.set(dependencyNode, {});
            }
            if (!nodesToVisit.get(dependencyNode)[optimalModule]) {
                nodesToVisit.get(dependencyNode)[optimalModule] = 0;
            }
            nodesToVisit.get(dependencyNode)[optimalModule] += 1;
        }

    }
    return data;
}

function findAllNodes(data, shouldIncludeFn) {
    const filteredNodes = [];
    const stack = [data];
    while (stack.length > 0) {
        const node = stack.pop();
        if (!node.name) {continue;}
        if (shouldIncludeFn(node)) {
            filteredNodes.push(node);
        }
        if (node.children) {
            stack.push(...node.children);
        } else {
            node.actualModule = node.name.split(".")[0];
            node.optimalModule = node.name.split(".")[0];
        }
    }
    return filteredNodes;
}

function findNodeByName(node, name) {
    if (node.name === name) return node;
    if (node.children) {
        for (const child of node.children) {
            const found = findNodeByName(child, name);
            if (found) return found;
        }
    }
    return null;
}
