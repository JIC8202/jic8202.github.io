import * as d3 from "d3";

export function createNodeColorLegend() {
    const labels = [
        "SF author",
        "Scientist",
        "Both"
    ];
    var data = labels.map((e, i) => ({
        label: e,
        color: d3.schemeSet1[i]
    }));

    const legend = d3.select("#legend");
    const row = legend.selectAll("div")
        .data(data)
        .enter().append("div")
        .attr("class", "legend-row");
    row.append("div")
        .attr("class", "legend-swatch")
        .style("background-color", d => d.color);
    row.append("div")
        .text(d => d.label);
}