console.log("Script loaded");

const colors = ["#787c7e", "#c9b458", "#6aaa64"]; // Grey, Yellow, Green (Wordle colors)
const wordleColors = ["#787c7e", "#c9b458", "#6aaa64"]; // Grey, Yellow, Green

let currentColors = [];
const numTiles = 5; // Define numTiles at a global scope

document.addEventListener("DOMContentLoaded", function() {
    console.log("DOM fully loaded and parsed");
    const tileContainer = document.getElementById("tile-container");
    const submitBtn = document.getElementById("submit-btn");

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
});

function changeColor(event) {
    const tile = event.target;
    const index = tile.dataset.index;
    currentColors[index] = (currentColors[index] + 1) % colors.length;
    tile.style.backgroundColor = colors[currentColors[index]];
}

function generateTree() {
    console.log("Generating tree");
    const treeContainer = document.getElementById("tree-container");
    treeContainer.innerHTML = "";

    const root = { name: "Root", children: [] };
    buildTree(root, 0);

    const width = 1200;
    const height = 800;

    const treeLayout = d3.tree().size([height, width]);
    const rootNode = d3.hierarchy(root);
    treeLayout(rootNode);

    const svg = d3.select("#tree-container").append("svg")
        .attr("width", width + 200)
        .attr("height", height + 200)
        .append("g")
        .attr("transform", "translate(100,50)");

    // Add column labels
    svg.selectAll(".tree-label")
        .data(d3.range(numTiles))
        .enter().append("text")
        .attr("class", "tree-label")
        .attr("x", d => (d + 1) * (width / numTiles))
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
        .attr("y1", d => d.source.x + adjustY(d.source.depth))
        .attr("x2", d => d.target.y)
        .attr("y2", d => d.target.x + adjustY(d.target.depth))
        .style("stroke", "#ddd")
        .style("stroke-width", "2px");

    const node = svg.selectAll(".node")
        .data(nodes)
        .enter().append("g")
        .attr("class", "node")
        .attr("transform", d => `translate(${d.y},${d.x + adjustY(d.depth)})`);

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

function adjustY(depth) {
    return depth >= 3 ? (depth - 2) * 20 : 0; // Increase spacing for levels 3 and beyond
}