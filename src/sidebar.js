import * as d3 from "d3";
import * as Popper from "popper.js";

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
    row.enter().append("li")
        .text(d => d.name)
        .on("click", onClick.bind(network))
        .merge(row)
        .text(d => d.name)
        .on("click", onClick.bind(network))
        .append("button")
        .text("X")
        .each(function(d){
            d3.select(this).attr("name", d.id)
                .attr("select", d.id);
        })
        .on("click", function() {
            d3.select(this).style({"background-color": "red"});
            var select = d3.select("#detail-name").text().replace(/ /g,"_");
            if(this.parentNode.parentNode.id === "detail-linksTo"){
                deleteLink(select, this.name)
            }
            else{
                deleteLink(this.name, select)
            }
            d3.event.stopPropagation();

              
              

            });
    row.exit().remove();
}

function onClick(d) {
    this.isolate(d);
}

function deleteLink(source, target) {
    var confirmDelete = confirm("Are you sure you want to delete the link between " + source + " and " + target + "?");
    if(confirmDelete){
        fetch(
            "https://nines.mooo.com/link/" + source + "/" + target,
            {
                method: 'DELETE'
            }
        )
        .then(res => res.json())
    }
}

export function hideSidebar() {
    d3.select("#detail").classed("active", false);
}