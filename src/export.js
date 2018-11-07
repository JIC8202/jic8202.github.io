import * as d3 from "d3";
import {saveAs} from "file-saver";

export function setupExport(id, data) {
    d3.select("#sidebar-export").on("click", function() {
        var csv = [];
        for (let link of data.links) {
            let source = data.nodes[link.source];
            let target = data.nodes[link.target];
            if (source.id == id ||target.id == id) {
                csv.push(source.id + "," + target.id);
            }
        }

        var file = new File(csv, id + "_adjacents.csv", {type: "text/plain;charset=utf-8"});
        saveAs(file);
    })
}
