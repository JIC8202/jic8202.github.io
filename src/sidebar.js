import * as d3 from "d3";
import * as api from "./api";

export function showSidebar(node) {
    d3.select("#detail").classed("active", true);
    d3.select("#detail-name").text(node.name);

    d3.select("#detail-linksTo")
        .call(updateJoin.bind(this), node, node.children, outLink);
    d3.select("#detail-linksFrom")
        .call(updateJoin.bind(this), node, node.parents, inLink);

    // detect overflow (scrollbar) on .detail-links
    // if there is overflow, set a constant flex-basis
    // so that the two lists take up equal space

    // this is done to avoid uneven size of lists
    // if their content sizes are disproportionate
    // i.e. a node having many more links in one category
    let lists = d3.selectAll(".detail-links");
    lists.classed("overflow", false); // reset before checking
    lists.filter(function() {
        return this.scrollHeight > this.clientHeight;
    }).classed("overflow", true);
}

export function hideSidebar() {
    d3.select("#detail").classed("active", false);
}

function updateJoin(selector, node, data, linkFn) {
    let row = selector
        .selectAll("li")
        .data(data);

    let enter = row.enter().append("li")
        .attr("class", "link-row");
    enter.append("label");
    enter.append("button")
        .attr("class", "fas fa-times");

    let merge = enter.merge(row)
        .on("click", onClick.bind(this));
    merge.select("label")
        .text(d => d.name);
    merge.select("button")
        .on("click", d => {
            let link = linkFn.call(this, node, d);
            deleteLink.call(this, link);
            d3.event.stopPropagation();
        });

    row.exit().remove();
}

function deleteLink(link) {
    var confirmDelete = confirm(
        "Are you sure you want to delete the link between "
        + link.source.name + " and " + link.target.name + "?"
    );
    if (confirmDelete) {
        this.deleteLink(link);
        api.deleteLink(link.source.id, link.target.id);
    }
}

function onClick(d) {
    this.isolate(d);
}

function inLink(node, adj) {
    return this.data.links
        .find(link => link.target == node && link.source == adj);
}

function outLink(node, adj) {
    return this.data.links
        .find(link => link.source == node && link.target == adj);
}
