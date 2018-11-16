import * as d3 from "d3";

export function showSidebar(name, influencers, influencees, network) {
    d3.select("#detail").classed("active", true);
    d3.select("#detail-name").text(name);

    updateJoin("#detail-linksTo", influencers, network);
    updateJoin("#detail-linksFrom", influencees, network);

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
    row.enter().append("li")
        .text(d => d)
        .on("click", onClick.bind(network))
        .merge(row)
        .text(d => d)
        .on("click", onClick.bind(network));
    row.exit().remove();
}

function onClick(d) {
    this.searchNode(d);
}

export function hideSidebar() {
    d3.select("#detail").classed("active", false);
}