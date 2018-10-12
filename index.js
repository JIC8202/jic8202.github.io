'use strict';

async function loadData() {
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

	// generate human-friendly names
	data.nodes.forEach(d => {
		d.name = d.id.replace(/_/g, " ");
	});

	new Awesomplete(document.querySelector("#search-input"), {
		minChars: 1,
		list: data.nodes.map(n => n.name)
	});

	return data;
}

async function buildGraph() {
	const data = await loadData();

	// adjacency lookup
	var linkedByIndex = {};
    data.links.forEach(d => {
		linkedByIndex[d.source + "," + d.target] = true;
    });
	function isConnected(a, b) {
        return linkedByIndex[a.index + "," + b.index] || linkedByIndex[b.index + "," + a.index] || a.index == b.index;
	}

	const svg = d3.select("svg");
	const container = svg.append("g");

	const simulation = d3.forceSimulation(data.nodes)
		.force("link", d3.forceLink().links(data.links))
		.force("charge", d3.forceManyBody())
		.force("x", d3.forceX())
		.force("y", d3.forceY())
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

	nodes.append("title").text(d => d.name);
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
	// center the graph initially
	zoom.translateBy(svg, window.innerWidth / 2, window.innerHeight / 2);
	svg.call(zoom);

	nodes
		.on("mouseover", d => {
			links.attr("class", l =>
				(l.source == d || l.target == d) ? "highlighted" : null
			);
		})
		.on("mouseout", d => {
			links.attr("class", null);
		});

	// draw color legend
	const palette = d3.select("#legend-palette");
	var colorScale = d3.range(5).map(t => d3.interpolateWarm(t / 4)).reverse();
	var swatch = palette.selectAll('div').data(colorScale);
	swatch.enter().append('div')
		.attr('class', 'legend-swatch')
		.style('background-color', d => d);

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
}

function bindInput() {
	d3.select("#explore-link").on("click", () => {
		document.querySelector(".content-wrap-home").style.display = "none";
	});
}

buildGraph();
bindInput();