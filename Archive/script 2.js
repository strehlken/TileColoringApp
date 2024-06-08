console.log("Script loaded");

const colors = ["#787c7e", "#c9b458", "#6aaa64"]; // Grey, Yellow, Green (Wordle colors)
const wordleColors = ["#787c7e", "#c9b458", "#6aaa64"]; // Grey, Yellow, Green

let currentColors = [];
const numTiles = 5; // Define numTiles at a global scope
let verticalSpacing = 20; // Default vertical spacing
let zoomTransform = d3.zoomIdentity; // Default zoom transform

document.addEventListener("DOMContentLoaded", function() {
    console.log("DOM fully loaded and parsed");
    const tileContainer = document.getElementById("tile-container");
    const submitBtn = document.getElementById("submit-btn");
    const spacingSlider = document.getElementById("spacing-slider");

    for (let i = 0; i < numTiles; i++) {
        const tile = document.createElement("div");
        tile.classList.add("tile");
        tile.dataset.index = i;
        tile.style.backgroundColor = colors[0];
        currentColors.push(0);
        tile.addEventListener("click", changeColor);
        tileContainer.appendChild(tile);
    }

    submitBtn.addEventListener("click", generateTree);
    spacingSlider.addEventListener("input", function() {
        verticalSpacing = +this.value;
        generateTree();
    });
});

function changeColor(event) {
    const tile = event.target;
    const index = tile.dataset.index;
    currentColors[index] = (currentColors[index] + 1) % colors.length;
    tile.style.backgroundColor = colors[currentColors[index]];
    generateTree();
}

function generateTree() {
    console.log("Generating tree with vertical spacing:", verticalSpacing);
    const treeContainer = document.getElementById("tree-container");
    treeContainer.innerHTML = "";

    const root = { name: "Root", children: [] };
    buildTree(root, 0);

    const width = 1600;
    const nodeWidth = 300; // Set width for nodes to ensure proper horizontal spacing

    const treeLayout = d3.tree().nodeSize([verticalSpacing, nodeWidth]);
    const rootNode = d3.hierarchy(root);
    treeLayout(rootNode);

    const svg = d3.select("#tree-container").append("svg")
        .attr("width", "100%")
        .attr("height", "100%")
        .call(d3.zoom().on("zoom", (event) => {
            zoomTransform = event.transform;
            svg.attr("transform", event.transform);
        }))
        .append("g")
        .attr("transform", zoomTransform);

    // Add column labels
    svg.selectAll(".tree-label")
        .data(d3.range(numTiles))
        .enter().append("text")
        .attr("class", "tree-label")
        .attr("x", d => (d + 1) * nodeWidth)
        .attr("y", 0)
        .attr("dy", -20)
        .style("text-anchor", "middle")
        .text(d => `Tile ${d + 1}`);

    const nodes = rootNode.descendants().slice(1); // Remove root node

    const link = svg.selectAll(".link")
        .data(nodes.slice(1).map(d => d.parent ? { source: d.parent, target: d } : null).filter(d => d && d.source.depth > 0)) // Filter out links from root
        .enter().append("line")
        .attr("class", "link")
        .attr("x1", d => d.source.y)
        .attr("y1", d => d.source.x)
        .attr("x2", d => d.target.y)
        .attr("y2", d => d.target.x)
        .style("stroke", "#ddd")
        .style("stroke-width", "2px");

    const node = svg.selectAll(".node")
        .data(nodes)
        .enter().append("g")
        .attr("class", "node")
        .attr("transform", d => `translate(${d.y},${d.x})`);

    node.append("rect")
        .attr("width", 20)
        .attr("height", 20)
        .attr("x", -10)
        .attr("y", -10)
        .style("fill", d => wordleColors[d.data.color])
        .style("fill-opacity", d => isUserPath(d) ? 1 : 0.1); // Highlight the user path

    function isUserPath(d) {
        if (d.depth > currentColors.length) return false;

        const currentColor = currentColors[d.depth - 1];
        const nodeColor = d.data.color;

        if (currentColor !== nodeColor) return false;

        return d.depth === 1 || isUserPath(d.parent); // Check parent if not at the first level
    }
}

function buildTree(node, level) {
    if (level >= currentColors.length) return;

    node.children = colors.map((color, index) => {
        const childNode = { name: ``, color: index, children: [] };
        buildTree(childNode, level + 1);
        return childNode;
    });
}