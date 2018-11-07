import {createTooltip} from './tooltips.js';
import * as d3 from "d3";

export class Network {
    constructor(selection, data) {
        this.selection = selection;
        this.data = data;

        this.nodeColorScale = d3.interpolateWarm;

        this.buildGraph();
    }

    isConnected(a, b) {
        return this.linkedByIndex[a.index + "," + b.index] || this.linkedByIndex[b.index + "," + a.index] || a.index == b.index;
    }

    getAdjacents(a) {
        return this.adjacencyList[a.index];
    }

    buildGraph() {
        // adjacency lookup
        this.linkedByIndex = {};
        this.adjacencyList = {};
        this.data.links.forEach(d => {
            this.linkedByIndex[d.source + "," + d.target] = true;

            //Build a darn adjacency list
            var src = d.source.toString();
            var tar = d.target.toString();
            if (this.adjacencyList[src] === undefined) {
                var dst = {}
                dst[d.target.toString()] = "to";
                // var dst = d.target.toString();
                this.adjacencyList[src] = [dst];
            } else {
                var dst = {}
                dst[d.target.toString()] = "to";
                //var dst = d.target.toString();
                var dsts = this.adjacencyList[src];
                if (dsts[dst] === undefined) {
                    dsts.push(dst);
                }
                this.adjacencyList[src] = dsts;
            }

            if (this.adjacencyList[tar] === undefined) {
                var dst = {}
                dst[d.source.toString()] = "from";
                //var dst = d.source.toString();
                this.adjacencyList[tar] = [dst];
            } else {
                //var dst = d.source.toString();
                var dst = {}
                dst[d.source.toString()] = "from";
                var dsts = this.adjacencyList[tar];
                if (dsts[dst] === undefined) {
                    dsts.push(dst);
                }
                this.adjacencyList[tar] = dsts;
            }
        });

        console.log(this.adjacencyList);
    
        let ticked = () => {
            this.node.attr("cx", d => d.x)
                .attr("cy", d => d.y);
            this.link.attr("x1", d => d.source.x)
                .attr("y1", d => d.source.y)
                .attr("x2", d => d.target.x)
                .attr("y2", d => d.target.y);
        }

        const container = this.selection.append("g");
    
        const simulation = d3.forceSimulation(this.data.nodes)
            .force("link", d3.forceLink().links(this.data.links).distance(40))
            .force("charge", d3.forceManyBody())
            .force("x", d3.forceX())
            .force("y", d3.forceY())
            .on("tick", ticked);
    
        this.link = container.append("g")
            .attr("class", "links")
            .selectAll("line")
            .data(this.data.links)
            .enter().append("line");
    
        this.node = container.append("g")
            .attr("class", "nodes")
            .selectAll("circle")
            .data(this.data.nodes)
            .enter().append("circle")
            .attr("r", nodeSize)
            .attr("fill", nodeColor);
    
        this.node.each(createTooltip);
    
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
        this.node.call(dragDrop);
    
        this.zoom = d3.zoom()
            .scaleExtent([0.4, 10])
            .on("zoom", () => {
                container.attr("transform", d3.event.transform);
            });
        // center the graph initially
        this.zoom.translateTo(this.selection, 0, 0);
        this.selection.call(this.zoom);
    
        this.node.on("mouseover", d => {
                this.link.attr("class", l =>
                    (l.source == d || l.target == d) ? "highlighted" : null
                );
            })
            .on("mouseout", d => {
                this.link.attr("class", null);
            });
    
        // begin node isolation
        this.allActive = true;
        this.selectedNode = null;
        this.node
                .on("click", d => {
                        if (this.allActive || d != this.selectedNode) {
                                this.selectedNode = d;
                                this.isolate(d);
                        } else {
                                this.unisolate(d);
                        }
                        // stop event from propagating to SVG
                        d3.event.stopPropagation();
                });
        this.selection.on("click", () => {
            // SVG background click
            if (!this.allActive) {
                this.unisolate();
            }
        })
        //end node isolation
    

    
        function nodeSize(d) {
            return Math.sqrt(d.degree) + 4;
        }
    
        function nodeColor(d) {
            return d3.schemeSet1[d.group - 1];
        }
    }
    
    unisolate(d) {
        if (d3.event.defaultPrevented) return;
        this.node.style('opacity', 1);
        this.link.style('display', null);
        this.allActive = true;
    }

    isolate(d) {
        //if (d3.event.defaultPrevented) return;
        console.log(JSON.stringify(d))
        this.node.style('opacity', (o) => {
                o.active = this.isConnected(d, o)
                return o.active ? 1 : 0.05;
        });

        var adjacents = this.getAdjacents(d);
        var influenceeNames = new Array();
        var influencerNames = new Array();
        for (var i = 0; i < adjacents.length; i++) {
            for (var key in adjacents[i]) {
                var val = adjacents[i][key]
                console.log(val)
                if (val == "to") {
                    influenceeNames.push(this.data.nodes[key].id.replace(/_/g, " "));
                } else if (val == "from") {
                    influencerNames.push(this.data.nodes[key].id.replace(/_/g, " "));
                }
            }
        }
        console.log(adjacents);
        console.log(influenceeNames);
        console.log(influencerNames)

        this.link.style('display', function(o) {
            o.active = (o.source == d || o.target == d);
            return o.active ? null : "none";
        });

        // center on the selected node
        this.selection.transition().duration(250).call(this.zoom.translateTo, d.x, d.y);
        //zoom.translateTo(this.selection, d.x, d.y);

        this.allActive = false;
    }

    searchNode(selectedVal) {
        //node = svg.selectAll(".node");
        if (selectedVal == "") {
            // nodeMap.style("stroke", "white").style("stroke-width", "1");
            console.log("Nuthin to search");
        } else {
            var selected = this.node.filter( function(d, i) {
            // console.log(d.id);
            return d.name === selectedVal;
            });

            console.log(JSON.stringify(selected._groups[0][0]['__data__']));


            this.isolate(selected._groups[0][0]['__data__']);
        }
    }
}