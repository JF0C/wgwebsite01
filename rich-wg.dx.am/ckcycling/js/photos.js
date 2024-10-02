let photoMarkers = [];
let currentPhoto = null;
let photoCluster = null;

function loadFotoList() {
	fetch('http://rich-wg.dx.am/ckcycling/json/photoData.txt')
		.then(r => r.json())
		.then(arr => photos = arr);
}

function uploadControls(){
	if(user.permissions.includes('tour_admin')){
		let inp = document.createElement('input');
		inp.setAttribute('type', 'file');
		inp.setAttribute('accept', '.jpg, .jpeg, .JPG, .JPEG');
		inp.setAttribute('id', 'foto-upload');
		inp.setAttribute('name', '&#128247;');
		inp.style.display = 'none';
		inp.addEventListener('change', fotoSelected);
		let btn = document.createElement('button');
		btn.innerHTML = '<img src="./ckcycling/css/images/foto.png" height="15.5px"/>';
		btn.appendChild(inp);
		btn.style.verticalAlign = 'bottom';
		btn.setAttribute('class', 'control-element');
		btn.onclick = () => inp.click();
		controls.appendChild(btn);
	}
	setTimeout(() => trackSelectWidth(), 100);
}

function centerMarker(){
	plotPhotos(mymap);
	if(uploadMarker == null) return;
	let bounds = mymap.getBounds();
	let middle = [(bounds._northEast.lat + bounds._southWest.lat)/2, (bounds._northEast.lng + bounds._southWest.lng) / 2];
	uploadMarker.setLatLng(middle);
	let sel = document.getElementById('foto-track');
	if(sel != null){
		sel.innerHTML = trackOptions();
	}
	setClosestTrack();
}

function resetPhotos(){
	for(m of photoMarkers) m.remove();
	photoMarkers.splice(0, markers.length);
	if(photoCluster != null) photoCluster.remove();
}

function plotPhotos(map){
	resetPhotos();
	photoCluster = L.markerClusterGroup();
	for(let p of photos){
		let onTrack = false;
		for(let t of tracks){
			if(t.name == p.track.replace('>', '&gt;')){
				onTrack = true;
				break;
			}
		}
		if(!onTrack) continue;
		let marker = photoMarker(p);
		photoMarkers.push(marker);
		photoCluster.addLayer(marker);
		//marker.addTo(mymap);
	}
	mymap.addLayer(photoCluster);
}

function photoMarker(photo){
	let coords = latLngStrToArr(photo.coordinates);
	let marker = L.marker(coords);
	let popup = marker.bindPopup('<h3>' + photo.title + '</h3><div id="' + photo.file + '"></div><div style="margin-top: 10px;">' + photo.description + '</div>');
	marker.on('click', () => {
		let imgContainer = document.getElementById(photo.file);
		if(imgContainer.children.length < 1){
			imgContainer.innerHTML = '<img id="pimg-' + photo.file + '" style="transform: rotate(' + photo.rotation + 'deg);" onclick="photoFullscreen(' + photos.indexOf(photo) + ')" src="./ckcycling/photos/' + photo.file + '" width="130px"/>';
		}
		if(photo.rotation == 90 || photo.rotation == 270){
			document.getElementById(photo.file).style.height = '130px';+
			setTimeout(() => {
				let bounds = document.getElementById('pimg-' + photo.file).getBoundingClientRect();
				let diff = (bounds.height-bounds.width) / 2;
				if(diff > 0){
					document.getElementById('pimg-' + photo.file).style.marginTop = diff + 'px';
				}
			}, 200);
		}
	});
	return marker;
}

function photoFullscreen(idx){
	let photo = photos[idx];
	$('#fullscreen-photo-container').css({marginTop: '0px', marginBottom: '0px'});
	$('.leaflet-popup-close-button')[0].click();
	$('#photo-overlay').css({display: ''});
	$('#photo-view-title').html(photo.title);
	$('#fullscreen-photo').attr('src', './ckcycling/photos/' + photo.file);
	setRotation('fullscreen-photo', photo.rotation);
	$('#photo-description').html(photo.description);
	$('#photo-tour').html('Tour: ' + photo.track);
	currentPhoto = photo;
	if(user.permissions.includes('tour_admin') && $('#editing-controls').length === 0){
		$('#photo-body').append(`
			<div id="editing-controls" class="photo-content">
				<button onclick="$('#text-edit-controls').slideToggle()">edit</button>
				<button value="` + photo.file + `" onclick="deletePhoto(this)">delete</button>
				<div style="display:none;" id="text-edit-controls">
					<input style="width: -webkit-fill-available;" placeholder="Title" id="new-photo-title" value="` + photo.title + `"/>
					<textarea style="width: -webkit-fill-available;" placeholder="Description" id="new-photo-description" value="` + photo.description + `"/>
					<button onclick="rotatePhoto('fullscreen-photo')" style="vertical-align: bottom;">&#8635;</button>
					<button onclick="selectCoordinates()" style="vertical-align: bottom;"><img src="./ckcycling/css/images/marker-red.png" height="15.5px"></button>
					<button value="` + photo.file + `" onclick="editPhoto()">&#10004;</button>
				</div>
			</div>`);
	}
	try{
		document.getElementById('new-photo-title').value = photo.title;
		document.getElementById('new-photo-description').value = photo.description;
	}
	catch{};
	setTimeout(()=>{
		fixRotationFullscreen();
	}, 200);
}

function fixRotationFullscreen(){
	let p = document.getElementById('fullscreen-photo');
	let bounds = p.getBoundingClientRect();
	if(bounds.height > bounds.width && (getRotation('fullscreen-photo') == 90 || getRotation('fullscreen-photo') == 270)){
		let diff = (bounds.height - bounds.width)/2;
		$('#fullscreen-photo-container').css({marginTop: diff + 'px', marginBottom: '-' + diff + 'px', height: bounds.height + 'px'});
	}
	else{
		$('#fullscreen-photo-container').css({marginTop: '0px', marginBottom: '0px', height: ''});
	}
}

function rotatePhoto(id){
	let rotation = getRotation(id);
	setRotation(id, (rotation + 90) % 360);
	try{
		fixRotationFullscreen();
	}
	catch{}
}

function selectCoordinates(){
	// TODO
	console.log("TODO");
}

function editPhoto(){
	startLoading();
	let form = new FormData();
	form.append('File', currentPhoto.file);
	form.append('UserId', user.id);
	form.append('Token', getCookieVal("token"));
	form.append('Title', document.getElementById('new-photo-title').value);
	form.append('Description', document.getElementById('new-photo-description').value);
	form.append('Rotation', getRotation('fullscreen-photo'));
	//form.append('Coordinates', uploadMarker._latlng);
	//form.append('Track', document.getElementById('foto-track').value);
	sendPhotoForm(form, '/php/photoEdit.php');
}

function sendPhotoForm(form, url){
	try{
		$.ajax({
	        url: url, // point to server-side PHP script 
	        dataType: 'json',  // what to expect back from the PHP script, if anything
	        cache: false,
	        contentType: false,
	        processData: false,
	        data: form,                         
	        type: 'post',
	        success: function(result){
	        	photos = result.photos;
	            console.log(result); // display response from the PHP script, if any
				finishLoading();
	 			closeFullscreen();
	 			plotPhotos(mymap);
	        }
	    }).fail(function(result){
	 		console.log(result);
			finishLoading();
 			closeFullscreen();
	 	});
	}
	catch{
		finishLoading();
	}
}

function deletePhoto(btn){
	if(confirm('Do you really want to delete this photo?')){
		startLoading();
		let form = new FormData();
		form.append('File', btn.value);
		form.append('UserId', user.id);
		form.append('Token', getCookieVal("token"));

		sendPhotoForm(form, '/php/photoDelete.php');
	}
}

function closeFullscreen(){
	try{
		$('#text-edit-controls').slideUp();
		document.getElementById('new-photo-title').value = "";
		document.getElementById('new-photo-description').value = "";
	}
	catch{}
	$('#photo-overlay').css({display: 'none'});
}

function fotoSelected(e){
	if(e.target.files.length > 0){
		if(uploadMarker != null){
			uploadMarker.remove();
			uploadMarker = null;
		}
		document.getElementById('info-button').style.display = 'none';
		let uploader = document.getElementById('foto-upload');
		let icon = L.icon({
	    	iconSize: [40, 40],
	    	iconAnchor: [20, 40],
	    	shadowSize: [24, 40],
	    	shadowAnchor: [8, 40],
	    	iconUrl: './ckcycling/css/images/marker-red.png',
	    	shadowUrl: './ckcycling/css/images/marker-shadow.png'
		});
		uploadMarker = L.marker([0, 0], {draggable:'true', icon: icon});
		mymap.addLayer(uploadMarker);
		centerMarker();
		uploadMarker.on('dragend', e => {
			setClosestTrack();
		});
		setClosestTrack();
		let cancelFoto = document.createElement('button');
		cancelFoto.setAttribute('id', 'cancel-foto');
		cancelFoto.innerHTML = '&#10006;';
		cancelFoto.addEventListener('click', () => 
			{
				document.getElementById('foto-upload').value = null;
				document.getElementById('cancel-foto').style = 'display: none;';
				if(uploadMarker != null){
					uploadMarker.remove();
					uploadMarker = null;
				}
				document.getElementById('confirm-foto').remove();
				if(showInfo){
					toggleInfo();
				}
				document.getElementById('info-button').style.display = '';
				setTimeout(() => trackSelectWidth(), 100);
				lines.forEach(l => l.setStyle({color: lineColor}));
			});
		let confirm = document.createElement('button');
		confirm.innerHTML = "&#10004;";
		confirm.setAttribute('id', 'confirm-foto');
		confirm.addEventListener('click', confirmUpload);
		document.getElementById('');

	    if(!showInfo){
	    	toggleInfo();
	    }
	    let info = document.getElementById('info-container');
	    info.innerHTML = '';
	    let imgContainer = document.createElement('div');
	    imgContainer.setAttribute('class', 'popup-img-container');
	    let imgPreview = document.createElement('img');
	    imgPreview.setAttribute('id', 'img-preview');
	    let dataEntry = document.createElement('div');
	    let onImageLoaded = () => {};
	    if(isMobile()){
		    imgPreview.setAttribute('height', (infoHeight - 3) + '%;');
	    	imgPreview.style.float = 'left';
	    	imgPreview.style.marginLeft = '-5px';
	    	dataEntry.style.float = 'left';
	    	dataEntry.style.paddingLeft = '5px';
	    	onImageLoaded = () => {
	    		setTimeout(() => {
	    			dataEntry.style.width = (window.screen.width - imgPreview.width - 20) + 'px', 100;
			    	if(getRotation('img-preview') - 90 === 0 || getRotation('img-preview') - 270 === 0){
			    		//TODO
    				}
	    		});
	    		
	    	};
	    	dataEntry.style.width = "130px";
	    }
	    else{
	    	let colWidth = infoWidth / 100 * window.screen.width - 20;
	    	imgPreview.setAttribute('width', colWidth + 'px');
	    	imgPreview.style.marginTop = '-5px';
	    	dataEntry.style.paddingTop = '5px';
	    	dataEntry.style.width = colWidth + 'px';
	    }
	    imgContainer.appendChild(imgPreview);
	    info.appendChild(imgContainer);
	    dataEntry.innerHTML = `
	    		<input placeholder="Title" id="foto-title" style="width:-webkit-fill-available;"/>
	    		<textarea placeholder="Description" id="foto-description" style="width:-webkit-fill-available;"></textarea>
	    		<select onchange="trackChanged()" style="width:-webkit-fill-available;" id="foto-track">` + trackOptions() + '</select>' +
	    	`<button onclick="rotatePhoto('img-preview')" style="vertical-align: bottom;">&#8635;</button>`;
	    info.appendChild(dataEntry);
	    let markerCentering = document.createElement('button');
	    markerCentering.addEventListener('click', centerMarker);
	    markerCentering.style.verticalAlign = 'bottom';
	    markerCentering.innerHTML = `<img src="./ckcycling/css/images/marker-red.png" height="15.5px"/>`;
	    dataEntry.appendChild(markerCentering);
	    dataEntry.appendChild(cancelFoto);
	    dataEntry.appendChild(confirm);
		let reader = new FileReader();
	    reader.onload = function(){
	        imgPreview.setAttribute('src', reader.result);
	    	onImageLoaded();
	    };
	    try{
	    	reader.readAsDataURL(uploader.files[0]);
	    }
	    catch(e){
	        imgPreview.setAttribute('src', '');
	    }
	    trackSelectWidth();
	}
}

function trackOptions(){
	let result = "";
	for(let t of tracks){
		result += '<option value="' + t.name + '">' + t.name + '</option>';
	}
	return result;
}

function setClosestTrack(){
	setTimeout(() => {
		let coord = [uploadMarker.getLatLng().lat, uploadMarker.getLatLng().lng]
		let closest = tracks[0];
		let distance = Infinity;
		for(let t of tracks){
			for(let p of t.points){
				let dist = (coord[0] - p.lat)**2 + (coord[1] - p.lon)**2;
				if(dist < distance){
					distance = dist;
					closest = t;
				}
			}
		}
		let sel = document.getElementById('foto-track');
		if(sel != null){
			for(let idx = 0; idx < sel.options.length; idx++){
				let opt = sel.options[idx];
				if(opt.value.replace('>', '&gt;') == closest.name){
					lines[idx].setStyle({color: lineHighlighted});
					sel.selectedIndex = idx;
				}
				else{
					lines[idx].setStyle({color: lineColor});
				}
			}
		}
	}, 10);
}

function trackChanged(){
	for(let k = 0; k < lines.length; k++){
		if(k == document.getElementById('foto-track').selectedIndex){
			lines[k].setStyle({color: lineHighlighted});
		}
		else{
			lines[k].setStyle({color: lineColor});
		}
	}
}

function confirmUpload(){
	startLoading();
	let file = document.getElementById('foto-upload').files[0];
	let form = new FormData();
	form.append('file', file);
	form.append('UserId', user.id);
	form.append('Token', getCookieVal("token"));
	form.append('Title', document.getElementById('foto-title').value);
	form.append('Description', document.getElementById('foto-description').value);
	form.append('Coordinates', uploadMarker._latlng);
	form.append('Track', document.getElementById('foto-track').value);
	// TODO
	form.append('Rotation', getRotation('img-preview'));

	sendPhotoForm(form, '/php/photoUpload.php');
	$('#cancel-foto').click();
}