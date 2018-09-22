'use strict';

async function buildGraph() {
	const data = await d3.json("data.json");

	// calculate indegree and outdegree
	data.nodes.forEach(d => {
		d.indegree = 0;
		d.outdegree = 0;
	});
	data.links.forEach(d => {
		data.nodes[d.target].indegree++;
		data.nodes[d.source].outdegree++;
	});

	const svg = d3.select("svg");
	const container = svg.append("g");

	const simulation = d3.forceSimulation(data.nodes)
		.force("link", d3.forceLink().links(data.links))
		.force("charge", d3.forceManyBody())
		.force("collide", d3.forceCollide(nodeSize))
		.on("tick", ticked);

	const links = container.append("g")
		.attr("class", "links")
		.selectAll("line")
		.data(data.links)
		.enter().append("line");

	const nodes = container.append("g")
		.attr("class", "nodes")
		.selectAll("circle")
		.data(data.nodes)
		.enter().append("circle")
		.attr("r", nodeSize)
		.attr("fill", nodeColor);

	nodes.append("title").text(d => d.id);
	const dragDrop = d3.drag()
		.on('start', node => {
			node.fx = node.x;
			node.fy = node.y;
		})
		.on('drag', node => {
			simulation.alphaTarget(0.7).restart();
			node.fx = d3.event.x;
			node.fy = d3.event.y;
		})
		.on('end', node => {
			if (!d3.event.active) {
				simulation.alphaTarget(0);
			}
			node.fx = null;
			node.fy = null;
		})
	nodes.call(dragDrop);

	var zoom = d3.zoom()
		.scaleExtent([0.4, 10])
		.on("zoom", () => {
			container.attr("transform", d3.event.transform);
		});
	svg.call(zoom);

	function nodeSize(d) {
		return Math.sqrt(d.outdegree) + 5;
	}

	function nodeColor(d) {
		const ratio = (d.outdegree) / (d.indegree + d.outdegree);
		return d3.interpolateWarm(ratio);
	}

	function ticked() {
		nodes.attr("cx", d => d.x)
			.attr("cy", d => d.y);
		links.attr("x1", d => d.source.x)
			.attr("y1", d => d.source.y)
			.attr("x2", d => d.target.x)
			.attr("y2", d => d.target.y);
	}

	function centerForces() {
		const bounds = svg.node().getBoundingClientRect();
		const centerX = bounds.width / 2;
		const centerY  = bounds.height / 2;
		simulation
			.force("center", d3.forceCenter(centerX, centerY))
			.force("x", d3.forceX(centerX))
			.force("y", d3.forceY(centerY))
			.restart();
	}
	centerForces();
	window.addEventListener("resize", centerForces);
}

function bindInput() {
	document.querySelector("#search-form")
		.addEventListener("submit", event => {
			document.querySelector(".content-wrap-home").style.display = "none";
			event.preventDefault();
		});
}

buildGraph();
bindInput();