

function startLoading(){
	document.getElementById('loading-overlay').style.display = "";
}

function finishLoading(){
	document.getElementById('loading-overlay').style.display = "none";
}

function isMobile(){
	return window.screen.width < 600;
}

function getCookieVal(cookie){
	return document.cookie.split(';').find(e=>e.includes(cookie)).replace(" ", "").replace(cookie, "").replace("=", "");
}

function getRotation(id){
	if(document.getElementById(id) === null){
		return;
	}
	let text = document.getElementById(id).style.transform;
	if(text === '') return 0;
	text = text.replace('rotate(', '');
	return parseInt(text.replace('deg)', ''));
}

function setRotation(id, rotation){
	document.getElementById(id).style.transform = "rotate(" + rotation + "deg)";
}

function latLngStrToArr(latlng){
	return latlng.split(',').map(c => parseFloat(c.replace('LatLng(', '')));
}

// http://www.jtrive.com/calculating-distance-between-geographic-coordinate-pairs.html
function geoDist(p1, p2){
	let dlat = (p2[0] - p1[0]) / 2 * Math.PI / 180;
	let dlng = (p2[1] - p1[1]) / 2 * Math.PI / 180;
	let lat1 = p1[0] * Math.PI / 180;
	let lat2 = p2[0] * Math.PI / 180;
	let init = (Math.sin(dlat)**2 + Math.sin(dlng)**2 * Math.cos(lat1) * Math.cos(lat2))**0.5;
	let R = 6367;
	return 2 * R * Math.asin(Math.min(1, init));
}

const lineColor = 'black';
const lineHighlighted = 'red';