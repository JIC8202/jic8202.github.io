'use strict';

async function buildGraph() {
	const svg = d3.select("svg");
	const data = await d3.json("data.json");

	const simulation = d3.forceSimulation(data.nodes)
		.force("link", d3.forceLink().id(d => d.id))
		.force("charge", d3.forceManyBody())
		.on("tick", ticked);

	const color = d3.scaleOrdinal(d3.schemeCategory10);

	const link = svg.append("g")
		.attr("class", "links")
		.selectAll("line")
		.data(data.links)
		.enter().append("line")
		.attr("stroke-width", function(d) {
			return Math.sqrt(d.value);
		});

	const node = svg.append("g")
		.attr("class", "nodes")
		.selectAll("circle")
		.data(data.nodes)
		.enter().append("circle")
		.attr("r", 5)
		.attr("fill", function(d) {
			return color(d.group);
		});

	node.append("title")
		.text(function(d) {
			return d.id;
		});

	simulation.force("link")
		.links(data.links);

	function ticked() {
		node.attr("cx", d => d.x)
			.attr("cy", d => d.y);
		link.attr("x1", d => d.source.x)
			.attr("y1", d => d.source.y)
			.attr("x2", d => d.target.x)
			.attr("y2", d => d.target.y);
	}
	
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
	node.call(dragDrop);

	function center() {
		const width = svg.node().getBoundingClientRect().width;
		const height = svg.node().getBoundingClientRect().height;
		simulation.force("center", d3.forceCenter(width / 2, height / 2));
		simulation.restart();
	}
	window.addEventListener("resize", center);
	center();
}

function bindInput() {
	document.querySelector("#search-form")
		.addEventListener("submit", event => {
			document.querySelector(".content-wrap-home").style.display = "none";
			event.preventDefault(); // cancel form submission
		});
}

buildGraph();
bindInput();