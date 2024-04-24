
let lines = [];
let markers = [];
let tourSelector = document.getElementById('tour-select');
let trackSelector = document.getElementById('track-select');
let controls = document.getElementById('controls');
let cache = {};
let showInfo = false;
let tracks = [];
let arrows = [];
let busy = 0;
let files = {};
let uploadMarker = null;
const infoWidth = 30;
const infoHeight = 25;
let tiles = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
	maxZoom: 18,
	attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
});
let viewCenter = [48.14, 11.58];
let mymap = L.map('map', {center: viewCenter, zoom: 13, layers: [tiles]});

setOptions();
setTimeout(() => {
	//selector.value = 'alle';
	tourSelect();
	uploadControls();
	plotPhotos(mymap);
}, 1000);
window.onresize = () => {
	trackSelectWidth();
};
// thanks to https://loading.io/css/ and https://blog.aaronlenoir.com/2019/09/25/draw-gps-track-on-openstreetmap/

//select('https://raw.githubusercontent.com/JF0C/cktrk2022/main/01%20-%20Muenchen%20-%3E%20Bad%20Aibling.gpx');
//setTimeout(() => setView(), 300);

function trackSelectWidth(){
	let totalWidth = 35;
	trackSelector.style.width = '';
	for(let child of document.getElementsByClassName('control-element')){
		totalWidth += child.getBoundingClientRect().width;
	}
	
	if(totalWidth > window.screen.width){
		let reduction = totalWidth - window.screen.width;
		trackSelector.style.width = (trackSelector.getBoundingClientRect().width - reduction) + 'px';
	}
}

function setOptions(url){
	if(url === undefined){
		url = 'https://api.github.com/repos/JF0C/cktrk2022/contents';
	}
	fetch(url)
		.then(r => r.text())
		.then(t => {
			for(let file of JSON.parse(t)){
				if(file.type !== "dir"){
					let ffolder = file.url.substring(0, file.url.lastIndexOf("/"));
					ffolder = ffolder.substring(ffolder.lastIndexOf("/") + 1);
					if(files[ffolder] !== undefined){
						files[ffolder].push(file);
					}
				}
				else{
					let folder = file.url.substring(file.url.lastIndexOf("/") + 1);
					folder = folder.substring(0, folder.indexOf("?"));
					files[folder] = [];
					addOption(folder, folder, true);
					setOptions(file.url);
				}
			}
		});
}

function addOption(name, value, isTour){
	let opt = document.createElement('option');
	opt.setAttribute('value', value);
	opt.append(name);
	if(isTour){
		tourSelector.appendChild(opt);
	}
	else{
		trackSelector.appendChild(opt);
	}
}

function tourSelect(){
	trackSelector.innerHTML = '';
	addOption('all', 'all', false);
	for(file of files[tourSelector.value]){
		addOption(file.name, file.download_url, false);
	}
	trackSelect();
}

function trackSelect(){
	startLoading();
	setTimeout(() => {
		let val = trackSelector.value;
		resetData();
	    if(val === 'all'){
	    	let narrows = parseInt(30 / trackSelector.childNodes.length);
	    	narrows = Math.max(narrows, 2);
	    	for(let opt of trackSelector.childNodes){
	    		try{
	    			select(opt.getAttribute('value'), narrows);
	    		}
	    		catch{}
	    	}
	    }
	    else{
			select(val, 20);
	    }
	    afterPlotting();
	}, 50);	
}



function afterPlotting(){
	setTimeout(() => {
		if(busy == 0){
			setView();
			finishLoading();
			console.log("done");
		}
		else{
			afterPlotting();
			console.log("waiting for plots " + busy);
		}
	}, 100);
}

function select(path, narrows){
	if(!path.startsWith('http')) return;
	busy += 1;
	if(cache[path] !== undefined){
		plotTrack(cache[path], narrows);
		busy -= 1;
	}
	else{
		try{
			fetch(path)
				.then(r => r.text())
				.then(data => {
					try{
						plotTrack(data, narrows);
						cache[path] = data;
					}
					catch{
						console.log('unreadable data: s' + data)
					}
					busy -= 1;
				});
		}
		catch{
			busy -= 1;
		}
	}
}

function setView() {
	try{
		let bounds = lines[0].getBounds();
		for(let l of lines){
			tbound = l.getBounds();
			if(tbound._northEast.lat > bounds._northEast.lat)
				bounds._northEast.lat = tbound._northEast.lat;
			if(tbound._northEast.lng > bounds._northEast.lng)
				bounds._northEast.lng = tbound._northEast.lng;
			if(tbound._southWest.lat < bounds._southWest.lat)
				bounds._southWest.lat = tbound._southWest.lat;
			if(tbound._southWest.lng < bounds._southWest.lng)
				bounds._southWest.lng = tbound._southWest.lng;
		}
	    let r = mymap.fitBounds(bounds);
	}
	catch{
		mymap.setView(viewCenter, 7);
	}
	setTimeout(centerMarker, 500);
}

//fetch('https://raw.githubusercontent.com/JF0C/cktrk2022/main/02%20-%20Bad%20Aibling%20-%3E%20Salzburg.gpx')
function toggleInfo(){
	showInfo = !showInfo;
	if(showInfo){
		calcInfo();
	}
	let mobile = isMobile();
	let mapcol = document.getElementById('map-container');
	let infocol = document.getElementById('info-container');

	if(!mobile){
		infocol.style.height = "";
		if(showInfo){
			mapcol.style.width = (100 - infoWidth) + "%";
			//infocol.style.display = "";
			//infocol.style.width = "";
		}
		else{
			mapcol.style.width = "100%";
			//infocol.style.display = "none";
			//infocol.style.width = "0px";
		}
	}
	else{
		infocol.style.width = "";
		if(showInfo){
			mapcol.style.height = (85 - infoHeight) + "%";
			//infocol.style.display = "";
			//infocol.style.height = "";
		}
		else{
			mapcol.style.height = "85%";
			//infocol.style.display = "none";
			//infocol.style.height = "0px";
		}
	}
	if(showInfo){
		infocol.style.display = "";
		infocol.style.width = "";
	}
	else{
		infocol.style.display = "none";
		infocol.style.width = "0px";
	}
}

function calcInfo(){
	let info = document.getElementById("info-container");
    info.style.textAlign = '';
	let distance = 0;
	let elevation = 0;
	let time = 0;
	let startdate = tracks[0].points[0].time.toDateString();
	let enddate = tracks[tracks.length-1].points[0].time.toDateString();
	if(enddate == startdate) enddate = "";
	else enddate = " to " + enddate;
	for(track of tracks){
		distance += track.distance.total / 1000;
		elevation += track.elevation.pos;
		time += (track.points[track.points.length-1].time - track.points[0].time)/1000/60/60;
	}
	info.innerHTML = "Date: " + startdate + enddate + "<br/>" +
		"Distance: " + distance.toFixed(2) + "km<br/>" +
		"Elevation: " + elevation.toFixed(2) + "m<br/>" +
		"Time: " + time.toFixed(2) + "h";

}

function plotTrack(trackfile, narrows){
	let gpx = new gpxParser();
	gpx.parse(trackfile);
	let track = gpx.tracks[0];
	tracks.push(track);
	let coordinates = track.points.map(p => [p.lat.toFixed(5), p.lon.toFixed(5)]);
    let polyline = L.polyline(coordinates, { weight: 3, color: lineColor });
    mymap.addLayer(polyline);

	
    for(let k = 0; k < narrows; k++){
    	let idx = k * parseInt(coordinates.length / narrows);
    	let arrow = getArrows([coordinates[idx], coordinates[idx+1]], lineColor, 1, mymap);
    	let ag = L.featureGroup(arrow);
    	mymap.addLayer(ag);
    	arrows.push(ag);
    }
    

    let finish = coordinates[coordinates.length-1];
    let fincoord = [parseFloat(finish[0]), parseFloat(finish[1])];
	let start = coordinates[0];
	let startcoord = [parseFloat(start[0]), parseFloat(start[1])];
	let closest = closeBy(startcoord);
	
    if(closest == null){
    	makeMarker(startcoord, track.name.substring(0, track.name.lastIndexOf("-&gt;")));
    }
    makeMarker(fincoord, track.name.substring(track.name.lastIndexOf("-&gt;") + 5));
    
    lines.push(polyline);
}

function closeBy(coord){
	for(let m of markers){
		let dist = geoDist([m._latlng.lat, m._latlng.lng], coord);
		if(dist < 5){
			return m;
		}
	}
	return null;
}

function makeMarker(coord, name){
	let icon = L.icon({
    	iconSize: [12, 20],
    	iconAnchor: [6, 20],
    	popupAnchor: [0, -18],
    	shadowSize: [12, 20],
    	iconUrl: './ckcycling/css/images/marker-icon-2x.png',
    	shadowUrl: './ckcycling/css/images/marker-shadow.png'
	});
	let marker = L.marker(coord, {icon: icon});
	mymap.addLayer(marker);
	marker.bindPopup(name);
    markers.push(marker);
}

function resetData(){
	tracks = [];
	busy = 0;
	for(l of lines) l.remove();
	lines.splice(0, lines.length);
	for(m of markers) m.remove();
	markers.splice(0, markers.length);
	for(a of arrows) a.remove();
	arrows.splice(0, arrows.length);
	tourDate = new Date();
}

