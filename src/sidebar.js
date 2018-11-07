import * as d3 from "d3";

export function createSidebar(name, influencers, influencees) {
    d3.select('#sidebar-name').text(name);
    document.querySelector('#sidebar-linksTo').innerHTML = "";
    document.querySelector('#sidebar-linksFrom').innerHTML = "";
    let row = d3.select('#sidebar-linksTo')
        .selectAll("div")
        .data(influencers);
    row.enter().append("div")
        .text(d => d);
    row.exit().remove();
    // TODO: proper d3 data joins
    d3.select('#sidebar-linksFrom')
        .selectAll("div")
        .data(influencees)
        .enter().append("div")
        .text(d => d)
        .exit().remove();
}