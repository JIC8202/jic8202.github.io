import tippy from "tippy.js";

let WIKIPEDIA_ENDPOINT = 'https://en.wikipedia.org/api/rest_v1/page/summary/';
let WIKIPEDIA_LINK = "https://en.wikipedia.org/wiki/";

function getTippyConfig(d) {
	let timeout;

	return {
		arrow: true,
		sticky: true,
		updateDuration: 0,
		performance: true,

		content: d.name,

		onShow(tip) {
			timeout = setTimeout(async () => {
				const response = await fetch(WIKIPEDIA_ENDPOINT + d.id);
				const json = await response.json();
				if (tip.state.isVisible) {
					const el = document.importNode(document.querySelector("#tooltip").content, true);
					el.querySelector(".tooltip-summary").innerHTML = json.extract_html;
					el.querySelector(".tooltip-link").href = WIKIPEDIA_LINK + d.id;
					tip.setContent(el.querySelector(".tooltip-content"));
					tip.set({interactive: true});
				}
			}, 1000);
		},

		onHidden(tip) {
			clearTimeout(timeout);
			tip.setContent(d.name);
			tip.set({interactive: false});
		}
	};
}

export function createTooltip(d) {
	tippy(this, getTippyConfig(d));
}