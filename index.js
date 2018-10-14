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

	nodes.each(function(d) {tippy(this, getTippyConfig(d))});

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

function getTippyConfig(d) {
	let timeout;
	return {
		content: d.name,
		arrow: true,
		sticky: true,
		updateDuration: 0,
		performance: true,
		onShow(tip) {
			timeout = setTimeout(async () => {
				const response = await fetch('https://en.wikipedia.org/api/rest_v1/page/summary/' + d.id);
				const json = await response.json();
				if (tip.state.isVisible) {
					const el = document.importNode(document.querySelector("#tooltip").content, true);
					el.querySelector(".tooltip-summary").innerHTML = json.extract_html;
					el.querySelector(".tooltip-link").href = "https://en.wikipedia.org/wiki/" + d.id;
					tip.setContent(el.querySelector(".tooltip-content"));
					tip.set({interactive: true});
				}
			}, 2000);
		},
		onHidden(tip) {
			clearTimeout(timeout);
			tip.setContent(d.name);
			tip.set({interactive: false});
		}
	}
}

function bindInput() {
	d3.select("#explore-link").on("click", () => {
		document.querySelector(".content-wrap-home").style.display = "none";
	});
}

buildGraph();
bindInput();