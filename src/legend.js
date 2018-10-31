import * as d3 from "d3";

export function createNodeColorLegend(colorScale) {
    const palette = d3.select("#legend-palette");
    var colorScale = d3.range(5).map(t => colorScale(t / 4)).reverse();
    var swatch = palette.selectAll('div').data(colorScale);
    swatch.enter().append('div')
        .attr('class', 'legend-swatch')
        .style('background-color', d => d);
}