import * as d3 from "d3";
import {saveAs} from "file-saver";

export function setupExport(id, data) {
    d3.select("#sidebar-export").on("click", function() {
        var csv = ["Source,Target\n"];
        for (let link of data.links) {
            if (link.source.id == id || link.target.id == id) {
                csv.push(link.source.id + "," + link.target.id + "\n");
            }
        }
        var file = new File(csv, id + ".csv", {type: "text/plain;charset=utf-8"});
        saveAs(file);
    })
}
