import * as d3 from "d3";

export function showSidebar(node, network) {
    d3.select("#detail").classed("active", true);
    d3.select("#detail-name").text(node.name);

    updateJoin("#detail-linksTo", node.children, network);
    updateJoin("#detail-linksFrom", node.parents, network);

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

function updateJoin(selector, data, network) {
    let row = d3.select(selector)
        .selectAll("li")
        .data(data);

    let enter = row.enter().append("li")
        .attr("class", "link-row");
    enter.append("label");
    enter.append("button")
        .attr("class", "fas fa-times");

    let merge = enter.merge(row)
        .on("click", onClick.bind(network));
    merge.select("label")
        .text(d => d.name);
    merge.select("button")
        .on("click", deleteLink);

    row.exit().remove();
}

function onClick(d) {
    this.isolate(d);
}

function deleteLink(link) {
    var confirmDelete = confirm("Are you sure you want to delete the link between " + source + " and " + target + "?");
    if (confirmDelete) {
        api.deleteLink(source, target);
    }
}

export function hideSidebar() {
    d3.select("#detail").classed("active", false);
}