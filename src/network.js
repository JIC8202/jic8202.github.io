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
        this.accentColor = d3.scaleOrdinal(d3.schemePastel1)
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
            .selectAll("line")
            .data(this.data.links)
            .enter().append("line")
            .attr("class", "link");

        this.node = container.append("g")
            .selectAll("circle")
            .data(this.data.nodes)
            .enter().append("circle")
            .attr("class", "node")
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
            if (!this.selectedNode)
                this.highlight(d);
        })
        .on("mouseout", d => {
            if (!this.selectedNode)
                this.unhighlight(d);
        });

        // node isolation
        this.node.on("click", d => {
            if (this.selectedNode != d) {
                this.isolate(d);
            } else {
                this.unisolate(this.selectedNode);
            }
            // stop event from propagating to background
            d3.event.stopPropagation();
        });
        // unisolate on background click
        this.svg.on("click", () => {
            if (this.selectedNode) {
                this.unisolate(this.selectedNode);
            }
        });
    }

    isolate(node) {
        if (this.selectedNode)
            this.unhighlight(this.selectedNode);

        this.selectedNode = node;
        this.highlight(node);

        this.node.classed("fade", o => !this.connected(node, o));
        this.link.classed("fade", l => !this.incident(l, node));

        // center on the selected node
        this.zoomExtents(node);

        showSidebar(node, this);
        setupExport(node.id, this.data);
    }

    unisolate(node) {
        this.selectedNode = null;
        this.unhighlight(node);

        this.node.classed("fade", false);
        this.link.classed("fade", false);

        hideSidebar();
    }

    highlight(node) {
        this.node.filter(d => this.connected(node, d))
            .classed("highlight", true)
            .style("stroke", d => this.accentColor(d.group));

        this.link.filter(l => this.incident(l, node))
            .classed("highlight", true)
            .style("stroke", l => {
                let other = l.source == node ? l.target : l.source;
                return this.accentColor(other.group);
            });
    }

    unhighlight(node) {
        this.node.filter(d => this.connected(node, d))
            .classed("highlight", false).style("stroke", null);
        this.link.filter(l => this.incident(l, node))
            .classed("highlight", false).style("stroke", null);
    }

    zoomExtents(node) {
        let adj = [node].concat(node.parents, node.children);

        let bounds = [
            [d3.min(adj, d => d.x), d3.min(adj, d => d.y)],
            [d3.max(adj, d => d.x), d3.max(adj, d => d.y)]
        ];

        let dx = bounds[1][0] - bounds[0][0],
            dy = bounds[1][1] - bounds[0][1],
            cx = (bounds[0][0] + bounds[1][0]) / 2,
            cy = (bounds[0][1] + bounds[1][1]) / 2;

        let extent = this.zoom.extent().apply(this.svg.node()),
            width = extent[1][0] - extent[0][0],
            height = extent[1][1] - extent[0][1];

        let scale = Math.min(2, 0.9 / Math.max(dx / width, dy / height)),
            translate = [width / 2 - scale * cx, height / 2 - scale * cy];

        this.svg.transition().duration(750).call(this.zoom.transform,
            d3.zoomIdentity.translate(translate[0], translate[1]).scale(scale));
    }

    searchNode(input) {
        let match = this.data.nodes.find(node => node.name == input);
        if (match) this.isolate(match);
    }
}