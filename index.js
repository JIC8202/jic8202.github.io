'use strict';

var nodeMap, linkMap, simMap;

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

	d3.selectAll(".search-input").each(function() {
		new Awesomplete(this, {
			minChars: 1,
			list: data.nodes.map(n => n.name)
		});
	})

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

	const link = container.append("g")
		.attr("class", "links")
		.selectAll("line")
		.data(data.links)
		.enter().append("line");

	const node = container.append("g")
		.attr("class", "nodes")
		.selectAll("circle")
		.data(data.nodes)
		.enter().append("circle")
		.attr("r", nodeSize)
		.attr("fill", nodeColor);

	node.each(function(d) {tippy(this, getTippyConfig(d))});

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

	var zoom = d3.zoom()
		.scaleExtent([0.4, 10])
		.on("zoom", () => {
			container.attr("transform", d3.event.transform);
		});
	// center the graph initially
	zoom.translateTo(svg, 0, 0);
	svg.call(zoom);

	node.on("mouseover", d => {
			link.attr("class", l =>
				(l.source == d || l.target == d) ? "highlighted" : null
			);
		})
		.on("mouseout", d => {
			link.attr("class", null);
		});

		// begin node isolation
		var allActive = true;
		node
				.on("click", d => {
						if (allActive) {
								isolate(d);
						} else {
								unisolate(d);
						}

				})

		function isolate(d) {
			//if (d3.event.defaultPrevented) return;
			console.log(JSON.stringify(d))
			node.style('opacity', function(o) {
					o.active = isConnected(d, o)
					return o.active ? 1 : 0.05;
			});

			link.style('opacity', function(o) {
					o.active = (o.source == d || o.target == d);
					return o.active ? 1 : 0.05;
			});

			// center on the selected node
			svg.transition().duration(250).call(zoom.translateTo, d.x, d.y);
			//zoom.translateTo(svg, d.x, d.y);

			allActive = !allActive;
		}

		function unisolate(d) {
			if (d3.event.defaultPrevented) return;
			node.style('opacity', 1);
			link.style('opacity', 1);
			allActive = !allActive;
		}
		//end node isolation

		function bindInput() {
			d3.select("#explore-link").on("click", () => {
				d3.select(".content-wrap-home").classed("hidden", true);
				d3.select(".search-floating").classed("hidden", false);
			});

			d3.selectAll(".search-form").on("submit", function(d, i) {
				let input = this.querySelector(".search-input").value;
				searchNode(input);
				d3.select(".content-wrap-home").classed("hidden", true);
				d3.select(".search-floating").classed("hidden", false);
				d3.event.preventDefault();
			});
		}

		function searchNode(selectedVal) {
		    //node = svg.selectAll(".node");
		    if (selectedVal == "") {
		      // nodeMap.style("stroke", "white").style("stroke-width", "1");
		      console.log("Nuthin to search");
		    } else {
		      var selected = node.filter( function(d, i) {
		    	// console.log(d.id);
		        return d.name === selectedVal;
		      });

		      console.log(JSON.stringify(selected._groups[0][0]['__data__']));


		      isolate(selected._groups[0][0]['__data__']);
		    }
		}

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
		node.attr("cx", d => d.x)
			.attr("cy", d => d.y);
		link.attr("x1", d => d.source.x)
			.attr("y1", d => d.source.y)
			.attr("x2", d => d.target.x)
			.attr("y2", d => d.target.y);
	}

	nodeMap = node;
	linkMap = link;
	simMap = simulation;

	bindInput();



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







buildGraph();
