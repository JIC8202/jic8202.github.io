// window.onloadend = main();
document.addEventListener("DOMContentLoaded", main, false);
// document.addEventListener("resize", setup, false);

var cheatJSON = 
{"Jules Verne":["Igor Sikorsky","Konstantin Tsiolkovsky","Simon Lake","Yuri Gregarin","Wernher von Braun"],"Isaac Asimov":["Elon Musk"],"Ray Bradbury":["Bill Nye","Steve Jobs","Hermann Oberth"],"Isaac Newton":["Isaac Asimov","Ray Bradbury"]};



function main() {

	// document.getElementById("searchButton").addEventListener("click", pullData());
	
}

function pullData(){
	var searchTerm = document.getElementById("searchBox").value;
	console.log(searchTerm);

	document.getElementById("closeButton").style.visibility = "visible";
	//clear prev search

	var results = document.getElementById("results")
	results.innerHTML = ""; 

	//check for bad query
	if( cheatJSON[ searchTerm ] != undefined ) {
		//good query, build results
		var lookup = cheatJSON[ searchTerm ];
		results.innerHTML = "Found : <b>" + searchTerm + "</b> with " + lookup.length + " influences. <br>Known influences :<br><ul> ";
		for(key in lookup ) {
			results.innerHTML += "<li> " + lookup[ key ] + " </li>";
		}
		results.innerHTML += "</ul>";
	}


}

function closeSearch() {
	document.getElementById("closeButton").style.visibility = "hidden";
	//clear prev search

	var results = document.getElementById("results")
	results.innerHTML = ""; 
}


function loadJson(){
	fetch("https://raw.githubusercontent.com/Masbuc53/JIC8202/master/FakeData.json").then( response =>{
		console.log(response.json().name);
		return response.json();
	}).catch(err => {
		console.log(err);
	})
}



function loadJSON(callback) {   

    var xobj = new XMLHttpRequest();
        xobj.overrideMimeType("application/json");
    xobj.open('GET', 'my_data.json', true); // Replace 'my_data' with the path to your file
    xobj.onreadystatechange = function () {
          if (xobj.readyState == 4 && xobj.status == "200") {
            // Required use of an anonymous callback as .open will NOT return a value but simply returns undefined in asynchronous mode
            callback(xobj.responseText);
          }
    };
    xobj.send(null);  
 }