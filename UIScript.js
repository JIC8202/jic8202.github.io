// window.onloadend = setup();
// document.addEventListener("DOMContentLoaded", setup, false);
// document.addEventListener("resize", setup, false);


function setup() {
	
	//make elements look pretty in the window

	//Title block
	var titleBlock = document.getElementById("Welcome-Message");
	var titleStyle = window.getComputedStyle(titleBlock);

	console.log(titleStyle.getPropertyValue('left').slice(0, -2));
	console.log(titleStyle.getPropertyValue('width'));

	var titleLeft = titleStyle.getPropertyValue('left');
	var titleWidth = titleStyle.getPropertyValue('width');

	titleLeft = parseInt( titleLeft.slice(0,-2), 10);
	titleWidth = parseInt( titleWidth.slice(0,-2), 10);
	titleBlock.style.left = titleLeft - titleWidth/2;

	//search bar
	var searchBar = document.getElementById("Home-Search-Bar");
	var searchStyle = window.getComputedStyle(searchBar);

	console.log(searchStyle.getPropertyValue('left').slice(0, -2));
	console.log(searchStyle.getPropertyValue('width'));

	var searchLeft = searchStyle.getPropertyValue('left');
	var searchWidth = searchStyle.getPropertyValue('width');

	searchLeft = parseInt( searchLeft.slice(0,-2), 10);
	searchWidth = parseInt( searchWidth.slice(0,-2), 10);
	searchBar.style.left = searchLeft - searchWidth/2;

	//adjust searchbar height to accomodate button
}