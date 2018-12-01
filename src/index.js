import Awesomplete from "awesomplete";
import * as d3 from "d3";

import {Network} from "./network.js";
import {createNodeColorLegend} from "./legend.js";

import 'awesomplete/awesomplete.css';
import '@fortawesome/fontawesome-free/css/all.css';
import 'tippy.js/dist/tippy.css';
import './style.css';

let API_URL = "https://nines.mooo.com/";

var network;

document.addEventListener('DOMContentLoaded', async function() {
	let data = await loadData();
	network = new Network(d3.select("#graph"), data);
	createNodeColorLegend();
	bindInput();
});

function bindInput() {
	d3.select("#explore-link").on("click", closeHome);

	d3.selectAll(".search-form").on("submit", function(d, i) {
		d3.event.preventDefault();
		closeHome();

		let input = this.querySelector(".search-input").value;
		network.searchNode(input);
	});
}

function closeHome() {
	d3.select(".content-wrap-home").classed("hidden", true);
	d3.select(".search-floating").classed("hidden", false);
}

async function loadData() {
	const data = await d3.json(API_URL + "data");

	// source/target IDs -> object references
	data.links.forEach(link => {
		link.source = data.nodes[link.source];
		link.target = data.nodes[link.target];
	});

	// generate human-friendly names
	data.nodes.forEach(d => {
		d.name = d.id.replace(/_/g, " ");
	});

	d3.selectAll(".search-input").each(function() {
		new Awesomplete(this, {
			minChars: 1,
			list: data.nodes.map(n => n.name)
		});
	});

	return data;
}