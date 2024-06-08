const colors = ["white", "yellow", "green"];
let currentColors = [];

document.addEventListener("DOMContentLoaded", function() {
    const tileContainer = document.getElementById("tile-container");
    const submitBtn = document.getElementById("submit-btn");
    const numTiles = 5;

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
    const treeContainer = document.getElementById("tree-container");
    treeContainer.innerHTML = "";
    
    const root = { name: "Root", children: [] };
    buildTree(root, 0);

    const width = 800;
    const height = 600;

    const treeLayout = d3.tree().size([height, width]);
    const rootNode = d3.hierarchy(root);

    treeLayout(rootNode);

    const svg = d3.select("#tree-container").append("svg")
        .attr("width", width)
        .attr("height", height);

    const link = svg.selectAll(".link")
        .data(rootNode.links())
        .enter().append("line")
        .attr("class", "link")
        .attr("x1", d => d.source.y)
        .attr("y1", d => d.source.x)
        .attr("x2", d => d.target.y)
        .attr("y2", d => d.target.x)
        .style("stroke", "#ccc");

    const node = svg.selectAll(".node")
        .data(rootNode.descendants())
        .enter().append("g")
        .attr("class", "node")
        .attr("transform", d => `translate(${d.y},${d.x})`);

    node.append("circle")
        .attr("r", 5)
        .style("fill", d => d.data.color);

    node.append("text")
        .attr("dy", 3)
        .attr("x", d => d.children ? -8 : 8)
        .style("text-anchor", d => d.children ? "end" : "start")
        .text(d => d.data.name);
}

function buildTree(node, level) {
    if (level >= currentColors.length) return;

    node.children = colors.map(color => {
        const childNode = { name: `Tile ${level + 1}: ${color}`, color: color, children: [] };
        buildTree(childNode, level + 1);
        return childNode;
    });
}