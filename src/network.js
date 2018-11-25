import * as d3 from "d3";
import {showSidebar, hideSidebar} from "./sidebar.js";
import {createTooltip} from './tooltips.js';
import {setupExport} from './export.js';

export class Network {
    constructor(svg, data) {
        this.svg = svg;
        this.data = data;
        this.selectedNode = null;

        this.nodeColor = d3.scaleOrdinal(d3.schemeSet1)
            .domain([1,2,3]);

        // Build an adjacency list (and calculate degree)
        data.nodes.forEach(node => {
            node.children = [];
            node.parents = [];

            node.degree = 0;
        });
        data.links.forEach(function(link) {
            link.source.children.push(link.target);
            link.target.parents.push(link.source);

            link.source.degree++;
            link.target.degree++;
        });

        this.bind();
    }

    // checks if two nodes are connected
    connected(d, o) {
        return o === d ||
            (d.children.includes(o)) || (o.children.includes(d)) ||
            (o.parents.includes(d)) || (d.parents.includes(o));
    };

    // check if a link is incident to a node
    incident(l, n) {
        return l.source == n || l.target == n;
    }

    bind() {
        const container = this.svg.append("g");

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
            .attr("r", d => Math.sqrt(d.degree) + 4)
            .attr("fill", d => this.nodeColor(d.group));

        this.node.attr("cx", d => d.x)
            .attr("cy", d => d.y);
        this.link.attr("x1", d => d.source.x)
            .attr("y1", d => d.source.y)
            .attr("x2", d => d.target.x)
            .attr("y2", d => d.target.y);

        this.node.each(createTooltip);

        // pan and zoom
        this.zoom = d3.zoom()
            .scaleExtent([0.4, 10])
            .on("zoom", () => {
                container.attr("transform", d3.event.transform);
            });

        // center the graph initially
        this.zoom.translateTo(this.svg, 0, 0);
        this.svg.call(this.zoom);

        // highlight incident links on mouseover
        this.node.on("mouseover", d => {
            this.link.classed("highlight", l => this.incident(l, d));
        })
        .on("mouseout", d => {
            this.link.classed("highlight", false);
        });

        // node isolation
        this.node.on("click", d => {
            if (this.selectedNode != d) {
                this.isolate(d);
            } else {
                this.unisolate();
            }
            // stop event from propagating to background
            d3.event.stopPropagation();
        });
        // unisolate on background click
        this.svg.on("click", () => {
            if (!this.selectedNode != null) {
                this.unisolate();
            }
        });
    }

    isolate(node) {
        this.selectedNode = node;

        this.node.classed("fade", o => !this.connected(node, o));
        this.link.classed("fade", l => !this.incident(l, node));

        // center on the selected node
        this.svg.transition().duration(250)
            .call(this.zoom.translateTo, node.x, node.y);

        showSidebar(node, this);
        setupExport(node.id, this.data);
    }

    unisolate() {
        this.selectedNode = null;

        this.node.classed("fade", false);
        this.link.classed("fade", false);

        hideSidebar();
    }

    searchNode(input) {
        let match = this.data.nodes.find(node => node.name == input);
        if (match) this.isolate(match);
    }
}