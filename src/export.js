import * as d3 from "d3";
import {saveAs} from "file-saver";

export function setupExport(id, data) {
    d3.select("#detail-export").on("click", function() {
        var rows = [["Source", "Target"]];
        for (let link of data.links) {
            if (link.source.id == id || link.target.id == id) {
                rows.push([link.source.id, link.target.id]);
            }
        }

        let csv = d3.csvFormatRows(rows);
        let blob = new Blob([csv], {type: "text/plain;charset=utf-8"});
        saveAs(blob, id + ".csv");
    })
}