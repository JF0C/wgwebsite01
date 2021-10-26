$(document).ready(function(){

	if(!users.find(function(u){return u['Id']==userid})['Permissions'].includes("karma")){
		$('#bottom-menu-selector a[data-title=2]').remove();
	}

	if(!users.find(function(u){return u['Id']==userid})['Permissions'].includes("beer")){
		$('#bottom-menu-selector a[data-title=3]').remove();
	}

	if(!users.find(function(u){return u['Id']==userid})['Permissions'].includes("shoppingList")){
		$('#bottom-menu-selector a[data-title=4]').remove();
	}

	scale_all();

	setTimeout(function(){
		Btn5Functions("bottom-menu-selector", userposition, function(btnid){
			let sub = 0;
			btnid = ''+btnid;
			if(btnid.includes('.')){
				sub = parseInt(btnid.substring(btnid.indexOf('.')+1));
				btnid = parseInt(btnid.substring(0, btnid.indexOf('.')));
			}
			switch(parseInt(btnid)){
				case 1:
					showAccount(sub);
					break;
				case 2:
					showKarma(sub);
					break;
				case 3:
					showBeer(sub);
					break;
				case 4:
					showShopping(sub);
					break;
			}
		});
		updateAllBadges();
	}, 200);
	
});

function whitenIfDark(){
	if(users.find(u => u['Id'] == userid)['Theme'] != "dark") return;
	let images = $('img');
	for(let k = 0; k < images.length; k++){
		try{
			let src = $(images[k]).attr('src');
			if(src.includes('circle'))continue;
			if(src.endsWith('.svg') && !src.endsWith('-w.svg')){
				$(images[k]).attr('src', src.replace('.svg', '-w.svg'));
			}
		}
		catch(e){
			continue;
		}
	}
}

$(window).resize(function(){
	scale_all();
});

function getCookieVal(cookie){
	return document.cookie.split(';').find(e=>e.includes(cookie)).replace(" ", "").replace(cookie, "").replace("=", "");
}

function setPage(btnid){
	var payload = "PageId=" + btnid + "&Token=" + getCookieVal("token") + "&UserId=" + userid;
	$.ajax({
	  "url": "/php/setpage.php",
  	  "type": "POST",
  	  "dataType": "text",
  	  "data": payload
  	});
}

function showAccount(subpage){
	if(selectSubpageAccount(subpage)) return;
	setPage(1);
	$('#main-frame').html('');
	$('#main-frame').append('<div id="account-root"></div>');
	$('#title-bar-center').html('Account');
	$('#title-bar-left').html('');
	$('#title-bar-right').html('');
	let currentUser = users.find(u=>u['Id']==userid);
	$('#account-root').append('<div id="welcome-message">Hallo, ' + currentUser['Name'] + '!</div>');

	let picname = 'profile-pic-' + userid;
	let picfile = 'Images/' + picname + '.jpg';
	$('#account-root').append('<img id="' + picname + '" class="img-center" src="' + picfile + '"></img>');
	ReplacePic(picname, picfile, ()=>{
		$('#'+picname).click(showChangeProfilePic);
	});

	$('#account-root').append('<div style="height:20px;"></div>')
	$('#account-root').append('<div class="list-element" id="change-name-password"><div style="display: inline;">Benutzernamen und Passwort ändern</div>'+
		'<div style="float:right;"><img class="chevron" src="Icons/chevron-right.svg"/></div>'+
		'</div>');
	$('#account-root').append('<div class="list-element" id="change-profile-pic"><div style="display: inline;">Profilfoto ändern</div>'+
		'<div style="float:right;"><img class="chevron" src="Icons/chevron-right.svg"/></div>'+
		'</div>');
	if(currentUser['Permissions'].includes('karma')){
		$('#account-root').append('<div class="list-element" id="add-user"><div style="display: inline;">Benutzer hinzufügen</div>'+
		'<div style="float:right;"><img class="chevron" src="Icons/chevron-right.svg"/></div>'+
		'</div>');
	}
	$('#account-root').append('<div class="list-element" id="dark-theme-toggle-container">'+
		'<div class="group-title" style="width:80%;">Dark Theme</div>'+
		'<div class="list-element-toggle"><div class="list-element-toggle-indicator"></div></div>'+
	'</div>');
	if(currentUser['Theme'] == 'dark'){
		$('#dark-theme-toggle-container .list-element-toggle-indicator').addClass('active');
	}
	$('#account-root').append('<div class="list-element" id="GpxAnalyser"><div style="display: inline;">GPX Dateien analysieren</div>'+
		'<div style="float:right;"><img class="chevron" src="Icons/chevron-right.svg"/></div>')

	$('#dark-theme-toggle-container').click(function(e){
		let indi = $('#dark-theme-toggle-container .list-element-toggle-indicator');
		indi.toggleClass('active');
		let theme = 'normal';
		if(indi.hasClass('active')) theme = 'dark';
		SendAjax('/php/editUser.php', {'Target': userid, 'Property': 'theme', 'Value': theme}, 
			function(e){
				highlightSuccess($('#dark-theme-toggle-container .group-title'), theme + ' Theme aktiviert!');
				if(e['Value'] == 'dark') indi.addClass('active');
				else indi.removeClass('active');
				console.log(e);
				setTimeout(()=>{location.reload();}, 500);
			},
			function(e){
				indi.toggleClass('active');
				highlightError($('#dark-theme-toggle-container .group-title'), 'Fehler!');
				console.log(e);
			});
	});

	/* Disabled due to hosting restrictions
	$('#account-root').append('<div class="list-element" id="notifications"><div style="display:inline">Benachrichtigungen</div>'+
		'<div style="float:right;"><img class="chevron" src="Icons/chevron-right.svg"/></div>'+
		'</div>');
	*/

	if(currentUser['Permissions'].includes('admin')){
		$('#account-root').append('<div class="list-element" id="permissions">'+
				'<div style="display: inline;">Berechtigungen</div>'+
				'<div style="float: right;"><img class="chevron" src="Icons/chevron-right.svg"/></div>'+
			'</div>');
		$('#permissions').click(showPermissions);
		$('#account-root').append('<div class="list-element" id="sendbu"><div class="title">Backup senden</div></div>');
		$('#sendbu').click(sendBackup);
	}

	$('#account-root').append('<div class="list-element" id="show-refs"><div style="display: inline;">Referenzen</div>'+
		'<div style="float:right;"><img class="chevron" src="Icons/chevron-right.svg"/></div>'+
		'</div>');
	$('#account-root').append('<div class="list-element" id="logout"><div>Ausloggen</div></div>');

	$('#change-profile-pic').click(showChangeProfilePic);
	$('#change-name-password').click(showChangeNamePassword);
	$('#notifications').click(showNotifications);
	$('#add-user').click(showNewUser);
	$('#show-refs').click(showRefs);
	$('#GpxAnalyser').click(showGpxUploader);
	$('#logout').click(function(){
		document.cookie="username=0;expires=0";
		document.cookie="token=0;expires=0";
		window.open(document.location['href'].replace("index", "login"), "_self");
	});

	whitenIfDark();
}

function sendBackup(){
	SendAjax('php/sendBackup.php', {},
		e => {
			if(e['status'] == true){
				highlightSuccess($('#sendbu .title'), 'Gesendet!');
			}
			else{
				highlightError($('#sendbu .title'), 'Fehler!');
			}
			console.log(e);
		}, e => {
			highlightError($('#sendbu .title'), 'Fehler!');
			console.log(e);
	});
}

function showPermissions(){
	setPage('1.5');
	addBackNavigator(showAccount);
	$('#title-bar-center').html('Berechtigungen');
	$('#main-frame').html('');
	$('#title-bar-right').html('');

	let allPermissions = validPermissions;

	for(let u of users){
		let phtml = '';
		for(let p of allPermissions){
			let act = '';
			if(u['Permissions'].includes(p)) act = 'active';
			phtml+='<div class="permission-toggle-container list-element hidden" data="' + p + '">'+
					'<div class="permission-name" style="display:inline">'+ permissionToGerman(p) + '</div>'+
					'<div class="list-element-toggle"><div class="list-element-toggle-indicator ' + act + '"></div></div>'+
				'</div>';
		}
		$('#main-frame').append('<div class="list-element">'+
			'<div id="' + u['Id'] + '" class="group-title permission-user">' + u['Name'] + '</div><img class="open-indicator" src="Icons/chevron-down.svg" />'+
			phtml +
			'</div>');
	}
	$('.permission-user').click(e => {
		let indi = $(e.target).parent().find('.open-indicator');
		let toggles = $(e.target).parent().find('.permission-toggle-container');
		indi.toggleClass('flipped');
		if(indi.hasClass('flipped')){
			toggles.slideDown();
			$('.open-indicator').not(indi).parent().find('.permission-toggle-container').slideUp();
			$('.open-indicator').not(indi).removeClass('flipped');
		}
		else{
			toggles.slideUp();
		}
	});
	$('.permission-toggle-container').click(e => {
		let t = $(e.target);
		while(!t.hasClass('permission-toggle-container')){
			t = $(t.parent());
		}
		let p = t.attr('data');
		let targetUser = t.parent().find('.group-title').attr('id');
		let pname = t.find('.permission-name');
		let indi = t.find('.list-element-toggle-indicator');
		SendAjax('/php/changePermission.php', {'TargetUser': targetUser, 'Permission': p}, 
			e => {
				if(e['status'] == false){
				  highlightError($(e.target).find('.permission-name'), 'Fehler!');
				  return;
				}
				let val = '';
				if(e['Value']){
					val = ' Ein';
					indi.addClass('active');
					appendAttribute(targetUser, 'Permissions', p);
				}
				else{
					val = ' Aus';
					indi.removeClass('active');
					removeAttribute(targetUser, 'Permissions', p);
				}
				highlightSuccess(pname, pname.html() + val);
				console.log(e);
			}, 
			e => {
				highlightError($(e.target).find('.permission-name'), 'Fehler!');
				console.log(e);
			});
	});

	whitenIfDark();
}

function appendAttribute(userId, attribute, value){
	for(let k = 0; k < users.length; k++){
		if(users[k]['Id'] != userId) continue;
		let old = users[k][attribute].split(' ');
		if(!old.includes(value))
			old.push(value);
		old = old.filter(e => e!='');
		users[k][attribute] = old.reduce((a, b) => a + ' ' + b);
		break;
	}
}
function removeAttribute(userId, attribute, value){
	for(let k = 0; k < users.length; k++){
		if(users[k]['Id'] != userId) continue;
		let old = users[k][attribute].split(' ');
		old = old.filter(e => e!='');
		users[k][attribute] = old.filter(e => e!=value);
		break;
	}
}

function permissionToGerman(permission){
	switch(permission){
		case 'beer': return 'Bier';
		case 'karma': return 'Karma';
		case 'shoppingList': return 'Einkaufsliste';
		case 'beer_admin': return 'Bier Administrator';
		case 'site_admin': return 'Administrator';
		default: 'Fehler: Berechtigung nicht gefunden';
	}
}

function selectSubpageAccount(subpage){
	switch(subpage){
		case 0:	return false;
		case 1: showRefs(); return true;
		case 2: showNewUser(); return true;
		case 3: showChangeProfilePic(); return true;
		case 4: showChangeNamePassword(); return true;
		case 5: showPermissions(); return true;
		case 6: showNotifications(); return true;
		case 7: showGpxUploader(); return true;
	}
}

function showRefs(){
	setPage('1.1');
	addBackNavigator(showAccount);
	$('#title-bar-right').html('');
	$('#title-bar-center').html('Referenzen');
	$('#main-frame').html('');
	$('#main-frame').append('<div class="list-element">Yin-Yang-icon made from <a href="http://www.onlinewebfonts.com/icon">Icon Fonts</a> is licensed by CC BY 3.0</div>' +
		'<div class="list-element">All other icons from <a href="https://github.com/encharm/Font-Awesome-SVG-PNG/tree/master/black/svg">Font-Awesome</a></div>');
	whitenIfDark();
}

function showNewUser(){
	setPage('1.2');
	addBackNavigator(showAccount);
	$('#title-bar-right').html('');
	$('#main-frame').html('');
	$('#main-frame').append('<input type="text "id="username" placeholder="Benutzername" class="new-user-info">');
	$('#main-frame').append('<input type="text" id="mail" placeholder="E-Mail" class="new-user-info">');
	$('#main-frame').append('<input type="password" id="password" placeholder="Passwort" class="new-user-info">');
	$('#main-frame').append('<input type="password" id="repeat-password" placeholder="Passwort wiederholen" class="new-user-info">');
	$('#main-frame').append('<div id="send-button" style="text-align: center;" class="list-element highlighted">Senden</div>');

	let w = $(document).width();
	$('input').css('width', (w-25) + 'px');
	$('#send-button').click(function(){
		var username = $('#username').val();
		var mail = $('#mail').val();
		var pw1 = $('#password').val();
		var pw2 = $('#repeat-password').val();
		if(username == "" || mail == "" || pw1 == "" || pw2 == ""){
			highlightError($('#send-button'), 'Alle Felder ausfüllen');
			return;
		}
		if(pw1 != pw2){
			highlightError($('#send-button'), 'Passwort Wiederholung nicht gleich');
			return;
		}
		var payload = {
			'UserName': username,
			'Password': pw1,
			'Mail': mail
		};
		SendAjax('/php/addUser.php', payload, function(result){
			if(result['status']){
				highlightSuccess($('#send-button'), 'Eingetragen!');
				users.push(result['data']);
			}
			else{
				highlightError($('#send-button'), 'Fehler!');
			}
		},function(faildata){
			console.log(faildata);
			highlightError($('#send-button'), 'Fehler beim Senden');
		})
	});

	whitenIfDark();
}

let gpxdata = [];
function showGpxUploader(){
	setPage('1.7');
	addBackNavigator(showAccount);
	$('#title-bar-right').html('');
	$('#title-bar-center').html('GPX Analysieren');
	$('#main-frame').html('');
	let inputwidth = $('#title-bar').width() - 30;
	$('#main-frame').append('<input type="file" id="file-select" name="gpxdatainput" style="width: ' + inputwidth + 'px;"/>');
	$('#main-frame').append('<div class="list-element">' +
			'<div class="group-title" style="display:inline;">Achsen gleich</div>' +
			'<div id="sync-axis" class="list-element-toggle"><div class="list-element-toggle-indicator"></div></div>' +
		'</div>');
	$('#main-frame').append('<div class="list-element">' +
				'<div class="radio3 left" value="100">flach</div>' +
				'<div class="radio3 active" value="180">mittel</div>' +
				'<div class="radio3 right" value="400">hoch</div>' +
			'</div>');
	$('#main-frame').append(
		'<div class="list-element list-element-inactive">' +
			'<div id="velocityresult" class="graph-result-horizontal"></div>' +
			'<div id="velocitydetail">Data</div>' +
			'<div id="velocityscroll" class="scrollContainer" ontouchmove="moveHandle(event)" onmousemove="moveHandle(event)"><div id="velocityhandle" class="moveablehandle"></div></div>' +
		'</div>');
	$('#main-frame').append(
		'<div class="list-element list-element-inactive">' +
			'<div id="altituderesult" class="graph-result-horizontal"></div>' +
			'<div id="altitudedetail">Data</div>' +
			'<div id="altitudescroll" class="scrollContainer" ontouchmove="moveHandle(event)" onmousemove="moveHandle(event)"><div id="altitudehandle" class="moveablehandle"></div></div>' +
		'</div>');
	$('#main-frame').append(
		'<div class="list-element list-element-inactive">' +
			'<div id="powerresult" class="graph-result-horizontal"></div>' +
			'<div id="powerdetail">Data</div>' +
			'<div id="powerscroll" class="scrollContainer" ontouchmove="moveHandle(event)" onmousemove="moveHandle(event)"><div id="altitudehandle" class="moveablehandle"></div></div>' +
		'</div>');
	$('#sync-axis').click(function(e){
		let indi = $('#sync-axis .list-element-toggle-indicator');
		indi.toggleClass('active');
		if(indi.hasClass('active')){
			$('.graph-result-horizontal').not('#velocityresult').scrollLeft($('#velocityresult').scrollLeft());
		}
	});
	$('.graph-result-horizontal').scroll(e =>{
		if($('#sync-axis .list-element-toggle-indicator').hasClass('active')){
			$('.graph-result-horizontal').not($(e.target)).scrollLeft($(e.target).scrollLeft());
		}
	});
	$('#file-select').change((e) => {
		let file = $('#file-select')[0].files[0];
		let reader = new FileReader();
		reader.onload = ()=>{
			let data = reader.result;
			let bin = data.substring(data.indexOf("base64,") + 7);
			let xmldata = atob(bin);
			if(!xmldata.startsWith("<?xml version='1.0' encoding='UTF-8'?>")){
				$('#velocityresult').html('Fehler: keine GPX-Datei');
				return;
			}
			try{
				let data = parseGpx(xmldata);
				gpxdata = data;
				plotAllGpxData();
			}
			catch(e){
				$('#velocityresult').html(e);
				console.log(e);
			}
		};
		reader.readAsDataURL(file);
	});
	$('.radio3').click(e => {
		$('.radio3').removeClass('active');
		$(e.target).addClass('active');
		plotAllGpxData();
	});
	whitenIfDark();
}

function plotAllGpxData(){
	let height = Number($('.radio3.active').attr('value'));
	plotGpx(gpxdata, $('#velocityresult'), d => d['vel'], 'velocity', 0.001, height);
	plotGpx(gpxdata, $('#altituderesult'), d => d['ele'], 'altitude', 0.001, height);
	plotGpx(gpxdata, $('#powerresult'), d => d['pow'], 'power', 0.001, height);
}

function moveHandle(e, stop = false){
	let x = 0;
	let xmax = $('#velocityscroll').width();
	if(e.type == "touchmove"){
		x = e.changedTouches[0].clientX;
	}
	else if(e.type == "mousemove"){
		x = e.clientX;
	}
	else{
		console.log("cant handle movement");
	}
	x = Math.min(Math.max(x, 0), xmax);
	let target = $(e.target);
	let c = 0;
	while(!target.hasClass('scrollContainer')){
		c++;
		target = $(target.parent());
		if(c>4) return;
	}
	let handle = $('#' + target.attr('id') + ' .moveablehandle');
	let handleposmax = xmax - handle.width();
	let handlepos = handleposmax * x / xmax;
	handle.css('left', handlepos);
	let targetid = target.attr('id').replace("scroll", "");
	let indicator = d3.select('#' + targetid + 'indicator');
	let rescontainer = $('#' + targetid + 'result');
	let pos = rescontainer.scrollLeft() + x;

	indicator.attr('transform', 'translate(' + pos + ', 0)');
	let graph = $('#' + targetid + 'graph');
	let points = graph.attr('d').replace('M', '').split('L');
	let pbefore = points[0];
	let pafter = points[1];
	let targetindex = 0;
	let subpos = 0;
	let intersecty = 0;
	for(let k = 1; k < points.length; k++){
		pafter = points[k];
		let x0 = Number(pbefore.substring(0, pbefore.indexOf(',')));
		let x1 = Number(pafter.substring(0, pafter.indexOf(',')));
		if(x0 < pos && x1 >= pos){
			targetindex = k-1;
			subpos = (pos - x0)/(x1 - x0);
			if(isNaN(subpos) || subpos == "Infinity")
				subpos = 0;
			let y0 = Number(pbefore.substring(pbefore.indexOf(',') + 1));
			let y1 = Number(pafter.substring(pafter.indexOf(',') + 1));
			intersecty = y0 + subpos * (y1 - y0);
			break;
		}
		pbefore = pafter;
	}
	let transformed = graph.css('transform').replace('matrix(', '').replace(')', '').split(',');
	let offset = Number(transformed[transformed.length - 1]);
	d3.select('#' + targetid + 'intersect').attr('transform', 'translate(' + pos + ',' + (intersecty + offset) + ')');
	let data0 = gpxdata[targetindex];
	let data1 = gpxdata[targetindex + 1];
	let val0 = 0;
	let val1 = 0;
	let valname = "";
	let unit = "";
	if(targetid == "velocity"){
		val0 = data0.vel;
		val1 = data1.vel;
		valname = "Geschwindigkeit: ";
		unit = "km/h";
	}
	if(targetid == "altitude"){
		val0 = data0.ele;
		val1 = data1.ele;
		valname = "Höhe: ";
		unit = "m";
	}
	if(targetid == "power"){
		val0 = data0.pow;
		val1 = data1.pow;
		valname = "Leistung: ";
		unit = "W"
	}
	let val = val0 + subpos * (val1 - val0);
	let time = new Date((data0.time.valueOf() + data1.time.valueOf())/2.0);
	let timestr = twodigit(time.getHours()) + ':' + twodigit(time.getMinutes()) + ':' + twodigit(time.getSeconds());
	$('#' + targetid + 'detail').html(timestr + ' | ' + valname + val.toFixed(1) + ' ' + unit);
	if($('#sync-axis .list-element-toggle-indicator').hasClass('active') && !stop){
		for (var el of $('.scrollContainer').not('#' + targetid + 'scroll')){
			moveHandle({
				'target': el,
				'type': 'mousemove',
				'clientX': x
			}, true);
		};
	}
	//console.log(e);
}
function twodigit(number){
	if(number < 10) return '0' + number;
	return number
}

function parseGpx(xmldata){
	let parser = new DOMParser();
	let xmlDoc = parser.parseFromString(xmldata, "text/xml");
	let title = xmlDoc.children[0].children[0].children[0].innerHtml;
	let rawdata = xmlDoc.children[0].children[1].children[1];
	let graphdata = [];
	let point = rawdata.children[0];
	let m = 82.0;
	let g = 9.81;
	let lastele = Number(rawdata.children[0].children[0].innerHTML);
	let lasttime = new Date(rawdata.children[0].children[1].innerHTML).valueOf();
	let lastvelocity = 0;
	let lat = Number(point.attributes.lat.value);
	let lon = Number(point.attributes.lon.value);
	let tstart = new Date(point.children[1].innerHTML).valueOf();
	let ele = Number(point.children[0].innerHTML);
	graphdata.push({
		'lat': lat,
		'lon': lon,
		'ele': ele,
		'pow': 0,
		'time': tstart,
		'taxis': 0,
		'vel': 0
	});
	for(let k = 1; k < rawdata.childElementCount; k++){
		let point = rawdata.children[k];
		let taxis = 0;
		let velocity = 0;
		//if(point.attributes === undefined) continue;
		let lat = Number(point.attributes.lat.value);
		let lon = Number(point.attributes.lon.value);
		let ele = Number(point.children[0].innerHTML);

		let time = new Date(point.children[1].innerHTML).valueOf();
		taxis = time - tstart;
		let distflat = haversine(graphdata[k-1].lon, graphdata[k-1].lat, lon, lat);
		let dist = Math.sqrt(distflat**2, (ele - graphdata[k-1].ele)**2);
		velocity = dist / (taxis - graphdata[k-1].taxis) * 1000;

		let fr = 0.0083 * m * g;
		let fs = (ele - lastele)/dist * m * g;
		let fa = 0;
		if(lastvelocity < velocity){
			fa = (velocity - lastvelocity)/(time - lasttime) * m;
		}
		else{
			fs = 0;
		}
		let fw = velocity**2 * 0.234;
		let force = fr + fs + fa + fw;
		let pow = force / (time - lasttime) * dist * 1000;
		lastele = ele;
		lastvelocity = velocity;
		lasttime = time;

		try{
			graphdata.push({
				'lat': lat,
				'lon': lon,
				'ele': ele,
				'pow': pow,
				'time': new Date(point.children[1].innerHTML),
				'taxis': taxis,
				'vel': velocity * 3.6 // m/s -> kph
			});
		}
		catch(e){
			console.log(k);
			console.log(point);
		}
	}
	let smoothcount = 10;
	for(let k = smoothcount - 1; k < graphdata.length; k++){
		let sum = 0;
		for(let l = 0; l < smoothcount; l++){
			sum += graphdata[k - l].pow;
		}
		sum /= smoothcount;
		graphdata[k].pow = sum;
	}
	return graphdata;
}

function plotGpx(data, target, selector, id, widthscale = 0.001, height = 400){
	target.html('<svg id="' + id + 'scale" style="height:' + height + 'px; width: 25px; position: fixed;"></svg>'+
		'<svg id="' + id + 'graphcontainer" style="height:' + height + 'px"></svg>');
	let maxval = 0;
	let minval = 1000000;
	let minidx = 0;
	for(k = 0; k < data.length; k++){
		let el = data[k];
		if(selector(el) > maxval) maxval = selector(el);
		if(selector(el) < minval){
			minidx = k;
			minval = selector(el);
		}
	}
	let svg = d3.select('#' + id + 'graphcontainer');
    let yscale = d3.scaleLinear().domain([maxval, minval]).range([0, height]);
	let line = d3.line()
        .x(d => d['taxis'] * widthscale)
        .y(d => maxval - (selector(d)/(maxval-minval) * height));
        //.curve(d3.curveCatmullRom.alpha(0.5));
    let yticks = Math.floor(height / 20);
    svg.append('path')
        .datum(data)
        .attr('fill', 'none')
        .attr('stroke', 'white')
        .attr('stroke-linejoin', 'round')
        .attr('stroke-linecap', 'round')
        .attr('stroke-width', 2)
        //.attr('transform', 'translate(' + (0.1*w) + ', ' + (0.05*h) + ')')
        .attr('d', line)
        .attr('id', id + 'graph')
        .attr('class', 'gpxgraph');

    let minpoint = d3.select('#' + id + 'graph').attr('d').split('L')[minidx];
    let mingraph = Number(minpoint.split(',')[1]);
    let offset = height - mingraph;
    $('#' + id + 'graph').css('transform', 'translate(0px, ' + offset + 'px)');
    let width = $('#' + id + 'graph')[0].getBoundingClientRect().width;
    $('#' + id + 'graphcontainer').attr('width', width);
    let xscale = d3.scaleLinear().domain([data[0].time, data[data.length - 1].time]).range([0, width]);
    let timeFormat = d3.timeFormat("%H:%M:%S");
    let xaxis = d3.axisBottom().scale(xscale).tickFormat(timeFormat).ticks(Math.floor(width/60));
    svg.append('g').call(xaxis); // .attr("transform", "translate(" + (0.1*w) + ", " + (0.9*h) + ")")
    let yaxis = d3.axisRight().scale(yscale).ticks(yticks);
    d3.select('#' + id + 'scale').append('g').attr('transform', 'translate(0,0)').call(yaxis);
    let scl = $('#' + id + 'scale');
    let scltop = scl.position().top;
    svg.append('path')
    	.attr('fill', 'none')
    	.attr('stroke', 'red')
    	.attr('stroke-width', 1)
    	.attr('d', 'M0,0L0,' + height)
    	.attr('id', id + 'indicator');
    svg.append('circle')
    	.attr('fill', 'red')
    	.attr('stroke', 'red')
    	.attr('stroke-width', 1)
    	.attr('r', 2)
    	.attr('id', id + 'intersect')
    	.attr('cx', 0)
    	.attr('cy', 0);

    let mintop = Number($('#title-bar').css('height').replace('px', ''));
    let maxtop = Number($('#title-bar').css('height').replace('px', '')) + Number($('#main-frame').css('height').replace('px', ''));
    let checkscalevis = e => {
    	scl.css('top', scltop - $('#main-frame').scrollTop());
    	let currenttop = Number(scl.css('top').replace('px', ''));
    	if(currenttop < mintop || currenttop + height > maxtop){
    		scl.css('display', 'none');
    	}
    	else{
    		scl.css('display', '');
    	}
    };
    $('#main-frame').scroll(checkscalevis);
    checkscalevis(0);

    let ticks = d3.selectAll('#' + id + 'scale .tick')._groups[0];
    let tickdist = yTranslation(ticks[1]) - yTranslation(ticks[0])
    for(let k = 0; k < ticks.length; k++){
    	let y = height - k*tickdist;
    	svg.append('path')
    		.attr('fill', 'none')
    		.attr('stroke', 'white')
    		.attr('stroke-width', 1)
    		.attr('opacity', 0.5)
    		.attr('d', 'M0,' + y + 'L' + width + ',' + y);
    }

}

function yTranslation(el){
	let str = $(el).attr('transform').replace("translate(", "").replace(")", "").split(",");
	return Number(str[1]);
}

// many thanks to https://www.movable-type.co.uk/scripts/latlong.html
function haversine(lon1, lat1, lon2, lat2){
	const R = 6371e3; // metres
	const φ1 = lat1 * Math.PI/180; // φ, λ in radians
	const φ2 = lat2 * Math.PI/180;
	const Δφ = (lat2-lat1) * Math.PI/180;
	const Δλ = (lon2-lon1) * Math.PI/180;

	const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
	          Math.cos(φ1) * Math.cos(φ2) *
	          Math.sin(Δλ/2) * Math.sin(Δλ/2);
	const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

	const d = R * c; // in metres
	return d;
}

function showChangeProfilePic(){
	setPage('1.3');
	addBackNavigator(showAccount);
	$('#title-bar-right').html('');
	$('#main-frame').html('');
	$('#main-frame').append('<input type="file" id="file-select" name="profilepic" accept="image/jpeg"/>');
	$('#main-frame').append('<img id="preview-image" class="img-center"></img>')
	$('#main-frame').append('<div class="list-element highlighted" id="upload-button">Hochladen</div>');

	let w = $(document).width();
	$('#file-select').css({'width': (w - 25) + "px"});
	$("#file-select").on('change', function() {
	    var reader = new FileReader();
	    reader.onload = function(){
	        $("#preview-image").attr('src', reader.result).show();
	    };
	    try{
	    	reader.readAsDataURL($("#file-select").get(0).files[0]);
	    }
	    catch(e){
	    	$("#preview-image").attr('src', '');
	    }
	});

	$('#upload-button').click(function(){
		var file = $("#file-select").get(0).files[0];
		
		if(file.size > 2*1024*1024){
			highlightError($('#upload-button'), "Datei größer 2MB");
			return;
		}

		var form = new FormData();
		form.append('file', file);
		form.append('UserId', userid);
		form.append('Token', getCookieVal("token"));

		$.ajax({
	        url: '/php/picUpload.php', // point to server-side PHP script 
	        dataType: 'json',  // what to expect back from the PHP script, if anything
	        cache: false,
	        contentType: false,
	        processData: false,
	        data: form,                         
	        type: 'post',
	        success: function(result){
	            console.log(result); // display response from the PHP script, if any
	            window.location.href = document.location['href'];
	        }
	     }).fail(function(result){console.log(result);});
		/*

		var data = new FormData();
		var request = new XMLHttpRequest();

		data.append('pic', file);
		request.addEventListener('load', function(e) { 
			console.log(e);
		});
		request.responseType = 'json';
		request.open('post', 'picUpload.php');
		request.send(data);
		*/
	});
	whitenIfDark();
}

function copy(obj){
	let cp = {};
	for(let key in obj){
		cp[key] = obj[key];
	}
	return cp;
}

function showChangeNamePassword(){
	setPage('1.4');
	addBackNavigator(showAccount);

	$('#main-frame').html('');
	var username = users.find(function(u){return u['Id']==userid})['Name'];
	$('#main-frame').append('<input type="text" id="username" placeholder="' + username + '" value ="' + username + '">');
	$('#main-frame').append('<input type="password" id="newpassword1" placeholder="Neues Passwort">');
	$('#main-frame').append('<input type="password" id="newpassword2" placeholder="Neues Passwort wiederholen">');
	$('#main-frame').append('<div id="send-button" class="list-element highlighted">Speichern</div>');

	let w = $(document).width();
	$('#username').css({"width": (w - 25) + "px"});
	$('#newpassword1').css({"width": (w - 25) + "px"});
	$('#newpassword2').css({"width": (w - 25) + "px"});
	
	$('#send-button').click(function(){
		if($('#newpassword1').val() != $('#newpassword2').val()){
			highlightError($('#send-button'), "Fehler: PW1 != PW2");
			return;
		}
		var data = {};
		data['newusername'] = $('#username').val();
		data['newpassword'] = $('#newpassword1').val();
		SendAjax('/php/changeUsernamePassword.php', data, function(result){
			console.log(result);
			if(result['status']){
				if(result['changed_password']){
					document.cookie = "token=" + result['newtoken'] + ";expires=" + new Date((new Date()).valueOf() + (86400 * 7 * 1000));
				}
				if(result['changed_username']){
					document.cookie = "username=" + $('#username').val() + ";expires=" + new Date((new Date()).valueOf() + (86400 * 7 * 1000));
					for(var k = 0; k < users.length; k++){
						if(users[k]["Id"] == userid){
							users[k]["Name"] = $('#username').val();
						}
					}
				}
			}
			else{
				highlightError($('#send-button'), "Fehler beim Senden");
				$('#username').val(users.find(function(u){return u['Id']==userid})['Name']);
			}
		}, function(faildata){
			console.log(faildata);
			highlightError($('#send-button'), "Fehler beim Senden");
			$('#username').val(users.find(function(u){return u['Id']==userid})['Name']);
		});		
	});
	whitenIfDark();
}

function SendAjax(target, data, successfunction, failfunction){
	var payload = "Token=" + getCookieVal("token") + "&UserId=" + userid;
	for(var key in data){
		payload += "&" + key + "=" + data[key];
	}
	console.log('sending: ' + payload + ' to ' + target);
    $.ajax({
      "url": target,
  	  "type": "POST",
  	  "dataType": "json",
  	  "data": payload
    }).done(successfunction).fail(failfunction);
}

function highlightError(element, error){
	highlight(element, "send-fail", error, 2000);
}

function highlightSuccess(element, msg){
	highlight(element, "inactive-success", msg, 2000);
}

function highlight(element, styleclass, text, duration){
	let styled_element = $(element);
	while(!styled_element.hasClass('list-element') && styled_element.parent().length != 0){
		styled_element = styled_element.parent();
	}
	if(styled_element.parent().length == 0){
		styled_element = $(element);
	}
	if($(styled_element).hasClass(styleclass)) return;
	var temp_text = $(element).html();
	$(styled_element).addClass(styleclass);
	$(element).html(text);
	setTimeout(function(){
		$(styled_element).removeClass(styleclass);
		$(element).html(temp_text);
	}, duration);
}

function totalKarma(userid){
	var karma = 0;
	for(var k = 0; k < karmaHistory.length; k++){
		var h = karmaHistory[k];
		
		if(h["UserId"] == userid){
			if(h['KarmaTaskId'] == "-1"){
				karma += parseInt(h['Amount']);
				continue;
			}
			let task = karmaTasks.find(function(e){return parseInt(e["Id"]) == parseInt(h["KarmaTaskId"])});
			if(task == undefined){
				console.log("could not find ");
				console.log(h);
			}
			else{
				karma += parseInt(task["Karma"]);
			}
		}
	}
	return karma;
}

function addBackNavigator(onclick){
	$('#title-bar-left').html('<img id="back-navigator" src="Icons/chevron-left.svg" class="chevron-title"/>');
	$('#back-navigator').click(function(){
		setTimeout(function(){onclick();}, 100); 
	});
}

function getKarmaUsers(){
	var usersWithKarma = [];

	for(var k = 0; k < users.length; k++){
		if(!users[k]['Permissions'].includes('karma')) continue;
		var u = users[k];
		usersWithKarma.push({'Id': u['Id'], 'Name': u['Name'], 'Permissions': u['Permissions'], 'Karma': totalKarma(u['Id'])});
	}
	return usersWithKarma;
}

function showKarmaDetails(){
	setPage('2.1');
	$('#main-frame').html('<div id="User-Karma-Container"></div>');
	$('#title-bar-right').html('<img id="modify-entries" src="Icons/cog-wheel.svg" class="chevron-title"/>');
	var usersWithKarma = getKarmaUsers();

	usersWithKarma.sort(function(l, r){
		if(l['Karma'] > r['Karma']) return -1;
		return 1;
	});

	for(var k = 0; k < usersWithKarma.length; k++){
		//if(!usersWithKarma[k]['Permissions'].includes('karma')) continue;
		var u = usersWithKarma[k];
		var special = "";
		if(k == 0) special = " 👑";
		let picname = 'profile-pic-' + u['Id'];
		let picfile = 'Images/' + picname + '.jpg';
		$('#User-Karma-Container').append("<div id='karma-user-" + u["Id"] + "' class='list-element karma-container'>"+
				"<div class='image-container' style='float: left;'><img id='" + picname + "' class='profilepic' src='" + picfile + "' /></div>"+
				"<div class='group-title'>" + u["Name"] + special +
				"<img class='open-indicator' src='Icons/chevron-down.svg'>" +
				"<div id='karma-user-" + u["Id"] + "-karma' class='karma-amount' style='display:inline; float:right;'>" + u['Karma'] + "</div>" + "</div>" +
			"</div>");
		if(u['Id'] == userid) $('#karma-user-' + u['Id']).addClass('highlighted');
		ReplacePic(picname, picfile);
	}

	$('#main-frame').append('<div class="info-board">Karma-Aktionen</div>');
	$('#main-frame').append('<div id="karma-transfer" class="list-element">'+
		'<div style="display:inline;">Übertrag</div>'+
		'<div style="display:inline; float:right;"><img class="chevron" src="Icons/chevron-right.svg"></div>'+
		'</div>');
	$('#karma-transfer').click(showKarmaTransfer);
	$('#main-frame').append('<div id="karma-graph" class="list-element">'+
		'<div style="display:inline;">Graph</div>'+
		'<div style="display:inline; float:right;"><img class="chevron" src="Icons/chevron-right.svg"></div>'+
		'</div>');
	$('#karma-graph').click(showKarmaGraph);

	addBackNavigator(showKarma);
	ClickableProfilePics();

	$('#modify-entries').click(function(){
		editEntries();
	});

	$('.group-title').click(function(){
		var parent = $($(this).parent());
		var id = $($(this).parent()).attr('id');
		if($(this).hasClass('open')){
			$('.' + id).slideUp(400, () => parent.css({'height': '23px'}));
			$(this).removeClass('open');
			$(this).find('.open-indicator').removeClass('flipped');
		}
		else{
			$('.group-title').removeClass('open');
			$(this).addClass('open');
			$('.open-indicator').removeClass('flipped');
			$('.karma-entry').not('.' + id).slideUp(400, () => $('.karma-container').not('#'+id).css({'height': '23px'}));
			parent.css({'height': ''});
			$('.' + id).slideDown();
			$(this).find('.open-indicator').addClass('flipped');
		}
	});
	karmaHistory.sort(function(l, r){
		if(parseInt(l.Date) > parseInt(r.Date)) return -1;
		else return 1;
	});

	for(let k = 0; k < karmaHistory.length; k++){
		let h = karmaHistory[k];
		let tl = karmaTasks.find(function(e) {return e["Id"] == h["KarmaTaskId"]});
		let t = copy(tl);
		let transferMarker = '';
		if(h['KarmaTaskId'] == -1) {
			transferMarker = 'transfer';
			t['Karma'] = h['Amount'];
			if(h['Amount'] < 0) {t['Name'] += ' an ' + users.find(e => e['Id'] == h['To'])['Name'];}
			else {t['Name'] += ' von ' + users.find(e => e['Id'] == h['From'])['Name'];}
		}
		$('#karma-user-' + h["UserId"]).append("<div class='" + transferMarker + " list-element karma-entry karma-user-" + h["UserId"] + "' data='" + h["Date"] + "' style='display:none;'>"+
				"<div style='display:inline;'>" + t["Name"].replaceAll('_', ' ') + "</div>"+
				"<div style='display:inline; float:right;'>" + t["Karma"] + "</div>"+
			"</div>");
	}
	$('.karma-entry').click(function(){
		if($(this).hasClass("showdate")){
			$(this).removeClass("showdate");
			$('.date-indicator').remove();
		}
		else{
			$('.date-indicator').remove();
			$('.karma-entry').removeClass('showdate');
			$(this).append('<div class="date-indicator style="display:none">' + millis2date($(this).attr('data')) + '</div>');
			//$('.date-indicator').slideUp(300, function(){ $('.date-indicator').remove(); });
			//$('.date-indicator-temp').slideDown(400, function(){ $('.date-indicator-temp').removeClass('date-indicator-temp').addClass('date-indicator'); });
			$(this).addClass('showdate');
		}
	});

	$('.karma-container').css({'height': '23px'});
	whitenIfDark();
}

function showKarmaTransfer(){
	setPage('2.3');
	$('#main-frame').html('<div id="userlist"></div>');
	$('#title-bar-right').html('');
	$('#title-bar-center').html('Karma');
	$('#title-bar-left').html('');
	addBackNavigator(showKarmaDetails);

	karmaUsers = getKarmaUsers();

	for(var ku of karmaUsers){
		if (ku['Id'] == userid) continue;
		let picname = 'profile-pic-' + ku['Id'];
		let picfile = 'Images/' + picname + '.jpg';
		$('#userlist').append('<div class="list-element toggleable" userId="' + ku['Id'] + '">'+
			"<div class='image-container' style='float: left;'><img id='" + picname + "'class='profilepic' src='" + picfile + "' /></div>"+
			'<div class="group-title">' + ku['Name'] + '</div>'+
			'</div>');
		ReplacePic(picname, picfile);
	}

	$('.toggleable').click(function(){
		$('.toggleable').removeClass('highlighted');
		$(this).addClass('highlighted');
	});

	$('#main-frame').append('<div id="submit-group">'+
		'<input tpye="number" id="amount" inputmode="numeric" lastval="" placeholder="Karma" />'+
		'<div id="payment-submit-button">Übertragen</div>'+
		'</div>');
	$('#amount').keyup((e)=>{
		let t = $(e.target);
		if(isNaN(parseInt(e.key)) && e.key != 'Backspace'){
			t.val(t.attr('lastval'));
			return;
		}
		t.attr('lastval', t.val());
	});

	$('#payment-submit-button').click(function(){
		let target = $('.toggleable.highlighted');
		if(target.length == 0){
			highlightError($(this), 'Wähle einen Empfänger!');
			return;
		}
		let karmaAmount = parseInt($('#amount').val());
		if(isNaN(karmaAmount)){
			highlightError($(this), 'Gib einen ganzzahligen Wert ein!');
			return;
		}
		let that = $(this);
		let id = $(target).attr('userId');
		let data = {'Target': id, 'Amount': karmaAmount};
		SendAjax("/php/karmaTransfer.php", data, 
			function(e){
				highlightSuccess(that, "Übertrag erfolgreich!");
				karmaHistory.push({
					'UserId': ''+userid,
					'To': ''+id,
					'KarmaTaskId': "-1",
					'Amount': '-'+karmaAmount,
					'Date': e['timestamp']
				});
				karmaHistory.push({
					'UserId': ''+id,
					'From': ''+userid,
					'KarmaTaskId': "-1",
					'Amount': ''+karmaAmount,
					'Date': e['timestamp']
				});
			}, 
			function(e){
				highlightError(that, "Fehler!");
			}
		);
	});
	ClickableProfilePics();
	whitenIfDark();
}

function editEntries(){
	if($('#modify-entries').hasClass("modify-entries-acive")){
		$('#modify-entries').removeClass("modify-entries-acive");
		$('.delete-icon').animate({width: 0}, 100, function(){
			$('.delete-button').remove();
		});
	}	
	else{
		$('#modify-entries').addClass("modify-entries-acive");
		$('.karma-entry').append('<div class="delete-button" style="display:inline;float:left;line-height:20px;"><img class="delete-icon" src="Icons/minus-circle.svg" width="0" height="20" />  </div>');
		$('.delete-icon').animate({width: 20}, 100);
		$('.delete-button').click(function(){
			var par = $(this).parent();
			var user_id = parseInt($(this).parent().parent().attr('id').replace("karma-user-", ""));
			var timestamp = $(this).parent().attr('data');
			if($(this).parent().hasClass('transfer')){
				SendAjax("/php/removeKarmaTransfer.php", {'KarmaTimeStamp': timestamp},
					function(e){
						if(e['status'] == true){
							par.remove();
							$('[data=' + timestamp + ']').remove();
							removeEntryFromHistory(user_id, timestamp);
							let target = karmaHistory.find(h => 
								h['Date'] == timestamp && h['UserId'] != user_id && h['KarmaTaskId'] == -1)['UserId'];
							removeEntryFromHistory(target, timestamp);
						}
					}
				);
			}
			else{
				SendAjax("/php/removekarma.php", {'KarmaTimeStamp': timestamp},
					function(e){
						if(e['status'] == true){
							par.remove();
							removeEntryFromHistory(user_id, timestamp);
						}
					},
					function(e){
						console.log(e);
					}
				);
			}
			/*
			SendKarmaRemove(user_id, getCookieVal("token"), timestamp,
				function(result){
					console.log(result);
					result = JSON.parse(result);
					if(result['status'] == true){
						par.remove();
						removeEntryFromHistory(user_id, timestamp);
					}
				},
				function(faildata){
					console.log(faildata);
			});
			console.log($(this).parent().attr('data'));
			*/
		});
	}
	whitenIfDark();
}

function removeEntryFromHistory(userid, timestamp){
	for(var k = karmaHistory.length - 1; k >= 0; k--){
		if(karmaHistory[k]['UserId'] == userid && karmaHistory[k]['Date'] == timestamp){
			karmaHistory.splice(k, 1);
			break;
		}
	}
	$('#karma-user-' + userid + '-karma').html(totalKarma(userid));
}

function SendKarmaRemove(userid, token, karmatimestamp, successfunction, failfunction){
	var payload = "KarmaTimeStamp=" + karmatimestamp + "&Token=" + token + "&UserId=" + userid;
    $.ajax({
      "url": "/php/removekarma.php",
  	  "type": "POST",
  	  "dataType": "text",
  	  "data": payload
    }).done(successfunction).fail(failfunction);
}

function millis2date(millis){
	let d = new Date(parseInt(millis));
	let day = d.getDate();
	if(day < 10) day = "0"+day;
	let month = d.getMonth()+1;
	if(month < 10) month = "0"+month;
	let year = d.getFullYear();
	let hour = d.getHours();
	if(hour < 10) hour = "0"+hour;
	let minute = d.getMinutes();
	if(minute < 10) minute = "0"+minute;
	let second = d.getSeconds();
	if(second < 10) second = "0"+second;
	return day + "." + month + "." + year + " " + hour + ":" + minute + ":" + second;
}

function selectSubpageKarma(subpage){
	switch(subpage){
		case 0: return false;
		case 1: showKarmaDetails(); return true;
		case 2: showKarmaBalances(); return true;
		case 3: showKarmaTransfer(); return true;
		case 4: showKarmaGraph(); return true;
	}
}

function showKarma(subpage){
	$('#title-bar-center').html('Karma');
	$('#title-bar-right').html('<img id="modify-entries" src="Icons/cog-wheel.svg" class="chevron-title"/>');
	$('#title-bar-left').html('<img id="check-queue" class="check chevron-title" src="Icons/list.svg" />');
	$('#modify-entries').click(editTasks);

	if(selectSubpageKarma(subpage)) return;
	setPage(2);
	$('#main-frame').html('');
	$('#main-frame').css({'overflow-y': 'scroll'});
	$('#main-frame').append('<div class="list-element highlighted" id="karma-overview">'+
		'<div id="karma-overview-count" style="display:inline;">Dein Karma: '+totalKarma(userid)+'</div>'+
		'<div style="display:inline; float: right;"><img class="chevron" src="Icons/chevron-right.svg"/></div></div>');
	$('#main-frame').append('<div class="list-element" id="todo-list"><div class="group-title-todo" style="display: inline-block; width: 80%;">Aktuelle Aufgaben</div><div style="float: right;" class="badge" id="todo-badge">0</div></div>');
	$('#main-frame').append('<div class="list-element highlighted" id="balances">'+
		'<div id="next-balance-date" style="display:inline;">Nächste Abrechnung: ' + millis2date(new Date(balances.find(e=>e['Id'] == -1)['Date']).valueOf()).split(' ')[0] + '</div>'+
		'<div style="display:inline; float: right;"><img class="chevron" src="Icons/chevron-right.svg"/></div></div>');
	//$('#main-frame').append('<div class="list-sep"></div>');
	$('#main-frame').append('<div id="karma-action-info" class="info-board">Karma eintragen</div>');
	$('#main-frame').append('<div id="search-field">'+
			'<input type="text" id="tasks-filter" class="filter-input search-karma" placeholder="Suchen"/>'+
			'</div>');
	$('#main-frame').append('<div id="karma-root-node" name="root"></div>');

	$('#balances').click(showKarmaBalances);

	$('#check-queue').click(function(){
		if($(this).hasClass('check')){
			$(this).removeClass('check').addClass('queue').addClass('modify-entries-acive');
			$('.remove-todo').animate({width: 30}, 100);
			$('#karma-action-info').html('Karma zu Aktuelle Aufgaben hinzufügen');
		}
		else{
			$(this).removeClass('queue').addClass('check').removeClass('modify-entries-acive');
			$('.remove-todo').animate({width: 0}, 100);
			$('#karma-action-info').html('Karma eintragen');
		}
	});

	$('.group-title-todo').click(function(){
		if($(this).hasClass('open')){
			$(this).parent().children().not('.group-title-todo').not('.badge').slideUp();
			$(this).removeClass('open');
		}
		else{
			$(this).parent().children().not('.group-title-todo').not('.badge').slideDown();
			$(this).addClass('open');
		}
	});

	for(var task in karmaTasks){
		addKarmaTask(karmaTasks[task]);
	}
	updateTodoList();

	$('.menu-level-0').css({"display": ""});
	$('.group-title-0').click(function(){
		var parent = $($(this).parent());
		if(parent.hasClass('open')){
			$('.'+parent.attr('name')+'1').slideUp();
			parent.removeClass('open');
			$(this).find('.open-indicator').removeClass('flipped');
		}
		else{
			$('.menu-level-1').not('.'+parent.attr('name')+'1').slideUp();
			$('.menu-level-0').removeClass('open');
			$('.group-title-0').find('.open-indicator').removeClass('flipped');
			$('.'+parent.attr('name')+'1').slideDown();
			parent.addClass('open');
			$(this).find('.open-indicator').addClass('flipped');
		}		
	});
	$('.group-title-1').click(function(){
		var parent = $($(this).parent());
		if(parent.hasClass('open')){
			$('.'+parent.attr('name')+'2').slideUp();
			parent.removeClass('open');
			$(this).find('.open-indicator').removeClass('flipped');
		}
		else{
			$('.task-node').not('.'+parent.attr('name')+'2').slideUp();
			$('.menu-level-1').removeClass('open');
			$('.group-title-1').find('.open-indicator').removeClass('flipped');
			$('.'+parent.attr('name')+'2').slideDown();
			parent.addClass('open');
			$(this).find('.open-indicator').addClass('flipped');
		}
	});
	$('#search-field').keyup(k => {
		let key = k.key;
		let text = $('#tasks-filter').val();

		
		if(text.length > 0){
			if(!$('#karma-root-node').hasClass('hidden')){
				$('#karma-root-node').slideUp(300, e => $('#karma-root-node').addClass('hidden'));
			}
			for(node of $('#search-field').find('.task-node')){
				let name = $(node).attr('name').replace('_', ' ').toLowerCase();
				let keywords = text.toLowerCase().split(' ');
				if(keywords.every(k => name.includes(k))){
					$(node).slideDown();
				}
				else{
					$(node).slideUp();
				}
			}
		}
		else{
			if(text.length == 0 && $('#karma-root-node').hasClass('hidden')){
				$('#search-field .task-node').slideUp(300, k =>{
					$('#karma-root-node').slideDown(300, e => $('#karma-root-node').removeClass('hidden'));
				});
			}
		}
	});

	$('.task-node').off().click(TaskNodeSendHandler);
	$('.remove-todo').off().click(removeTodoSendHandler);
	$('#karma-overview').click(showKarmaDetails);
	whitenIfDark();
}

function updateTodoList(){
	let ntodo = $('#todo-list').children().length - 2;

	if(ntodo > 0) {
		$('#todo-list').addClass('highlighted');
		$('#todo-badge').addClass('badge-active');
	}
	else{
		$('#todo-list').removeClass('highlighted');
		$('#todo-badge').removeClass('badge-active');		
	}
	$('#todo-badge').html(ntodo);
	updateBadge(2);
	whitenIfDark();
}

function TaskNodeSendHandler(){
	if($(this).hasClass("inactive-success")) return;
	var that = $(this);

	var taskname = $(this).attr('name');
	var taskid = $(this).attr('data');
	var karma = $(this).find('.task-karma').html();
	var children = $(this).children();
	var todo = $('#check-queue').hasClass('queue');

	if($(this).hasClass('todo') && todo) return;
	
	console.log("Task: " + taskname + "\n" +
				"Task-Id: " + taskid + "\n" +
				"Karma: " + karma + "\n" +
				"UserId: " + userid);

	SendKarmaEntry(userid, getCookieVal("token"), taskid, todo,
		function(result){
			console.log(result);
			result = JSON.parse(result);
			if(result['status'] == true){
				if(!todo){
					var entry = {
						"UserId":userid,
						"Date":result["timestamp"],
						"KarmaTaskId": taskid
					};
					karmaHistory.push(entry);
					highlightSuccess(that, "Gemacht!");
					$('#karma-overview-count').html("Dein Karma: " + totalKarma(userid));
					removeKarmaTaskFromTodo(taskid);
					updateTodoList();
				}
				else{
					highlightSuccess(that, "Zur Liste hinzugefügt!");
					for(var k = 0; k < karmaTasks.length; k++){
						if(karmaTasks[k]['Id'] == taskid){
							karmaTasks[k]['Todo'] = result["timestamp"];
							addKarmaTaskToTodo(karmaTasks[k]);
						}
					}
					updateTodoList();
				}
			}
			else{
				that.addClass('send-fail');
				that.find('.task-title').html('Fehler!');
				setTimeout(function(){
					that.removeClass('send-fail');
					that.find('.task-title').html(that.attr('name').replaceAll("_", " "));
				}, 1500);
			}
		}, 
		function(faildata){
			console.log(faildata);
			that.addClass('send-fail');
			that.find('.task-title').html('Fehler!');
			setTimeout(function(){
				that.removeClass('send-fail');
				that.find('.task-title').html(that.attr('name').replaceAll("_", " "));
			}, 1500);
		}
	);
}

function showKarmaBalances(){
	setPage('2.2');
	$('#main-frame').html('');
	$('#title-bar-left').html('<img src="Icons/chevron-left.svg" class="chevron" id="navigate-back"></img>');
	$('#navigate-back').click(showKarma);
	$('#title-bar-right').html('');
	$('#main-frame').append('<div class="list-element highlighted">Nächste Abrechnung: ' + millis2date(new Date(balances.find(e=>e['Id'] == -1)['Date']).valueOf()).split(' ')[0] +
		'</div>');
	$('#main-frame').append('<div class="info-board">Vergangene Abrechnungen</div>');
	for(let k = 0; k < balances.length; k++){
		let bal = balances[k];
		if(bal['Id'] == -1) continue;
		let from = millis2date(bal['Date'] - 1000*60*60*24*61).split(" ")[0];
		let to = millis2date(bal['Date']).split(" ")[0];
		$('#main-frame').append('<div class="list-element" id="balance-' + k + '"><div class="group-title">Abrechnung von ' + from + ' bis ' + to + '</div></div>');
		let balanced = "ja";
		if(bal['Balanced'] != 'true'){
			$('#balance-' + k).addClass('unfinished-balance');
			balanced = "nein";
		}
		let sum = 0;
		let n = 0;
		let winnerids = [];
		let maxkarma = 0;
		for(var l = 0 in bal['Users']){
			sum += bal['Users'][l];
			n++;
			if(bal['Users'][l] > maxkarma){
				maxkarma = bal['Users'][l];
				winnerids = [l];
			}
			else if(bal['Users'][l] == maxkarma){
				winnerids.push(l);
			}
		}
		winnerids = winnerids.map(e => parseInt(e));
		let mean = sum/n;
		$('#balance-' + k).append('<div class="list-element highlighted balance-info" style="display:none;">Summe: ' + sum + '  Mittel: ' + mean + '</div>');
		for(var l in bal['Users']){
			let user = users.find(u=>u['Id'] == l);
			let karma = bal['Users'][l];
			$('#balance-' + k).append('<div class="list-element balance-info" style="display: none;">'+
				'<span class="balance-name">' + user['Name'] + '</span>' +
				'<span class="balance-karma-amount">Karma: ' + karma + '</span>' +
				'<span class="balance-mean-diff">Abw. v. Mittel: ' + (karma - mean) + '</span>' +
				'</div>');
		}
		$('#balance-' + k).append('<div class="list-element highlighted balance-info" style="display:none;" id="balance-status-' + k + '">Quittiert: ' + balanced + '</div>');
		if(winnerids.includes(userid) && bal['Balanced'] != 'true'){
			$('#balance-' + k).append('<div class="list-element balance-info" id="quit-balance-' + k + '" style="display: none; background: olivedrab; text-align: center;">Quittieren</div>');
			$('#quit-balance-' + k).click(function(){
				SendAjax("/php/quitBalance.php", {'BalanceId' : bal['Id']}, function(result){
					console.log(result);
					if(result['status'] == true){
						$('#quit-balance-' + k).remove();
						$('#balance-' + k).removeClass('unfinished-balance');
						$('#balance-status-' + k).html('Quittiert: ja');
						balances[k]["Balanced"] = true;
					}
					else{
						highlightError($('#quit-balance-' + k), "Fehler beim senden!");
					}
				}, function(faildata){
					console.log(faildata);
					highlightError($('#quit-balance-' + k), "Fehler beim senden!");
				})
			});
		}
	}
	$('.group-title').click(function(){
		let chil = $($(this).parent().children());
		if($(this).hasClass('open')){
			chil.not('.group-title').slideUp();
			$(this).removeClass('open');
		}
		else{
			$('.group-title').removeClass('open');
			$('.group-title').parent().not($(this)).children().not('.group-title').slideUp();
			$(this).addClass('open');
			chil.not('.group-title').slideDown();
		}
	});

	whitenIfDark();
}

function removeTodoSendHandler(){
	var par = $(this).parent();
	var id = par.attr('data');
	SendAjax("/php/removeTodo.php", {"KarmaId": id}, function(res){
		console.log(res);
		if(res['status'] == true){
			for(var k = 0; k < karmaTasks.length; k++){
				if(karmaTasks[k]["Id"] == id) karmaTasks[k]["Todo"] = 0;
			}
			removeKarmaTaskFromTodo(id);
			updateTodoList();
		}
		else{
			highlightError($(par), "Fehler!");
		}
		console.log(res);
	}, 
	function(faildata){
		console.log(faildata);
		highlightError($(par), "Fehler!");
	});
}

function editTasks(lastposition=-1){
	$('#title-bar-left').html('');
	if($(this).hasClass('modify-entries-acive')){
		$(this).removeClass('modify-entries-acive');
		showKarma();
	}
	else{
		$(this).addClass('modify-entries-acive');
		$('#main-frame').html('<div id="search-field">'+
			'<input type="text" id="tasks-filter" class="filter-input" placeholder="Suchen"/>'+
			'</div>'+
			'<div id="task-list" style="overflow-y:scroll;"></div>');
		$('#main-frame').css({'overflow-y': 'none'});
		$('#task-list').css({'height': (parseFloat($('#main-frame').css('height')) - 39) + 'px'});
		$('#task-list').append('<div class="list-element" id="karma-id--1" name="">'+
			'<div class="karma-expand" style="display:inline"><img src="Icons/bars.svg" class="chevron"></img></div>' +
			'<input class="karma-name edit-input" original-data="" placeholder="Neue Aufgabe" style="display:inline"></input>'+
			'<input class="karma-amount edit-input" original-data="" placeholder="Karma" style="float:right"></input>'+
			'<div class="karma-categories" style="display:none;"><div style="margin-left: 30px;">Kategorien:</div>'+
				'<img class="add-category" src="Icons/plus-circle.svg" class="chevron"></img>' +
				'<input class="edit-input edit-category add-category-input" original-data="" placeholder="Kategorie hinzufügen"></input>' +
			'</div>' +
			'</div>');
		karmaTasks.sort(function(l, r){
			if(l['Name'] > r['Name']) return 1;
			else return -1;
		});
		for(var k = 0; k < karmaTasks.length; k++){
			var t = karmaTasks[k];
			var id = t["Id"];
			if(id == -1) continue;
			$('#task-list').append('<div class="list-element" id="karma-id-' + id + '" name="' + t["Name"] + '" amount="' + t["Karma"] + '">'+
				'<div class="karma-expand" style="display:inline"><img src="Icons/bars.svg" class="chevron"></img></div>'+
				'<input class="karma-name edit-input" original-data="' + t["Name"] + '" style="display:inline"></input>'+
				'<input class="karma-amount edit-input" original-data="' + t["Karma"] + '" style="float:right"></input>'+
				'<div class="karma-categories" style="display:none;"><div style="margin-left: 30px;">Kategorien:</div></div>' +
			'</div>');
			var cats = t["Categories"];
			for(var l = 0; l < cats.length; l++){
				$('#karma-id-' + t["Id"]).find('.karma-categories').append('<img class="remove-category" src="Icons/minus-circle.svg" data="karma-id-' + id + '.edit-no-' + l + '" class="chevron"></img>' +
					'<input class="edit-input edit-category edit-no-' + l + '" original-data="' + cats[l] + '" value="' + cats[l].replaceAll("_", " ") + '"></input><br>');
			}
			$('#karma-id-' + t["Id"]).find('.karma-categories').append('<img class="add-category" src="Icons/plus-circle.svg" class="chevron"></img>' +
				'<input class="edit-input edit-category add-category-input" original-data="" placeholder="Kategorie hinzufügen"></input>');
		}
		var winp = 0.7 * $(document).width();
		$('.karma-categories').children().not('.remove-category').not('.add-category').css({'width': winp + "px"});
		$('.karma-name').each(function(e){$(this).val($(this).parent().attr('name').replaceAll("_", " "))});
		$('.karma-name').css({'width': winp + "px"});
		$('.karma-amount').each(function(e){$(this).val($(this).parent().attr('amount'))});
		$('.karma-amount').css({'width': "40px"});

		$('.remove-category').click(function(){
			var inp = $('#' + $(this).attr('data').split('.')[0]).find('.' + $(this).attr('data').split('.')[1]);
			inp.val('');
			SendEditedTask($(this));
		});
		$('.add-category').click(function(){
			SendEditedTask($(this));
		});
		$('.edit-input').keyup(function(e){
			if(e.key == "Enter"){
				SendEditedTask($(this));
			}
		});

		$('.karma-expand').click(function(){
			$('#dropdown-container').remove();
			if($(this).parent().hasClass('expanded')){
				$(this).parent().find('.karma-categories').slideUp();
				$(this).parent().removeClass('expanded');
			}
			else{
				$('.karma-categories').slideUp();
				$('.karma-categories').parent().removeClass('expanded');
				$(this).parent().addClass('expanded');
				$(this).parent().find('.karma-categories').slideDown();
			}
		});

		$('#tasks-filter').keyup(function(e){
			var text = $('#tasks-filter').val();
			var karmatasks = $('.karma-name');
			for(var k = 0; k < karmatasks.length; k++){
				if($(karmatasks[k]).val().toLowerCase().includes(text.toLowerCase())) $(karmatasks[k]).parent().css({'display': ''});
				else $(karmatasks[k]).parent().css({'display': 'none'});
			}
		});

		if(lastposition > -1){
			$('#task-list').animate({scrollTop: $('#task-list').scrollTop() + $('#karma-id-' + lastposition).offset().top - $('#task-list').position()['top']}, 500, function(){
				$('#karma-id-' + lastposition).addClass('highlighted');
				setTimeout(function(){$('#karma-id-' + lastposition).removeClass('highlighted');}, 1000);
			});
		}

		$('.edit-category').keyup(e=>updateDropdown(e));
		$('.edit-category').focusin(e=>updateDropdown(e));
		$('.edit-category').click(e=>updateDropdown(e));

		$('#task-list').scroll(e=>{
			$('#dropdown-container').remove();
		});
	}
	whitenIfDark();
}

function getKarmaCategories(){
	let scats = [];
	for(let t of karmaTasks){
		let cats = t['Categories'];
		if(cats == undefined) continue;
		for(let c of cats){
			let cs = c.split('.');
			if(cs.length != 2) continue;
			if(!scats.some(e => e['Name'] == cs[0].replace('_', ' '))){
				scats.push({'Name': cs[0].replace('_', ' '), 'Sub': [cs[1].replace('_', ' ')]});
			}
			else{
				if(!scats.find(e => e['Name'] == cs[0])['Sub'].includes(cs[1].replace('_', ' ')))
					scats.find(e => e['Name'] == cs[0])['Sub'].push(cs[1].replace('_', ' '));
			}
		}
	}
	return scats;
}

function createDropdown(top, left){
	$('#dropdown-container').remove();
	$('#main-frame').append('<div id="dropdown-container" class="suggestion-dropdown"></div>');
	$('#dropdown-container').css({'left': left, 'top': top});
	return $('#dropdown-container');
}
function updateDropdown(el){
	let t = $(el.target);
	let pos = t.offset();
	let d = createDropdown(pos['top']+35, pos['left']);
	let v = t.val();
	let cats = getKarmaCategories();
	let arr = [];

	if(v.includes('.')){
		let pred = v.substring(0, v.indexOf('.'));
		v = v.substring(v.indexOf('.') + 1);
		let cat = cats.find(c => c['Name'] == pred);
		if(cat != undefined) arr = cat['Sub'].filter(s => s.toLowerCase().includes(v.toLowerCase())).map(s => pred + '.' + s);
	}
	else{
		arr = cats.map(c => c['Name']).filter(c => c.toLowerCase().includes(v.toLowerCase()));
	}

	if(arr.length == 0){
		d.css({'display': 'none'});
		return;
	}
	d.css({'display': ''});
	
	for(let e of arr){
		d.append('<div class="dropdown-element" value="' + e + '">' + e + '</div>');
	}
	
	$('.dropdown-element').click(function(d){
		let v = $(d.target).html();
		if($(t).val().includes('.')) t.val(v);
		else t.val(v + '.');
		t.focus();
	});
}

function SendEditedTask(element){
	var payload = packageTaskInfo(element);
	var target = getFirstParentWithClass(element, 'list-element');
	SendAjax('/php/editTasks.php', payload, 
		function(result){
			console.log(result);
			if(result['status'] == true){
				includeKarmaTask(result['task']);
				editTasks(result['task']['Id']);
			}
			else{
				$('.edit-input').each(function(){element.val(element.attr('original-data').replaceAll("_", " "))});
				highlightError(target, "Daten falsch");
			}
		},
		function(faildata){
			console.log(faildata);
			$('.edit-input').each(function(){element.val(element.attr('original-data').replaceAll("_", " "))});
			highlightError(target, "Senden fehlgeschlagen");
		}
	);
}

function includeKarmaTask(task){
	var edited = false;
	for(var k = 0; k < karmaTasks.length; k++){
		if(karmaTasks[k]['Id'] == task['Id']){
			if(task['Name'] != undefined) karmaTasks[k]['Name'] = task['Name'];
			if(task['Karma'] != undefined) karmaTasks[k]['Karma'] = task['Karma'];
			if(task['Categories'] != undefined) karmaTasks[k]['Categories'] = task['Categories'];
			edited = true;
			break;
		}
	}
	if(!edited){
		karmaTasks.push(task);
	}
}

function getFirstParentWithClass(element, classname){
	var target = element;
	while(!$(target).hasClass(classname)){
		target = $(target).parent();
	}
	return target;
}

function packageTaskInfo(element){
	var target = element;
	while(!$(target).hasClass('list-element')){
		target = $(target).parent();
	}
	var data = {};
	data['KarmaName'] = $(target).find('.karma-name').val().replaceAll(" ", "_");
	data['KarmaAmount'] = $(target).find('.karma-amount').val();
	data['Categories'] = '';
	$(target).find('.edit-category').each(function(i){data['Categories'] += $(this).val().replaceAll(" ", "_") + "," ;});
	data['KarmaId'] = $(target).attr('id').replace('karma-id-', '');

	console.log(data);
	if(!checkString(data['KarmaName']) || !checkStringNum(data['KarmaAmount']) || !checkString(data['Categories'], [","]) || !checkStringNum(data['KarmaId']))
		throw "invalid input format of task details";
	return data;
}

function SendKarmaEntry(userid, token, karmataskid, todo, successfunction, failfunction){
	var tododata = "false";
	if(todo) tododata = "true";
	var payload = "KarmaId=" + karmataskid + "&Token=" + token + "&UserId=" + userid + "&Todo=" + tododata;
    $.ajax({
      "url": "/php/addkarma.php",
  	  "type": "POST",
  	  "dataType": "text",
  	  "data": payload
    }).done(successfunction).fail(failfunction);
}

function checkString(str, more=[]){
	for(var k = 0; k < str.length; k++){
		var c = str.charCodeAt(k);
		if(c >= 48 && c <= 57) continue; //0-9
		if(c >= 97 && c <= 122) continue;
		if(c >= 65 && c <= 90) continue;
		if(c >= 44 && c <= 46) continue;
		if(c == 95 || c == 228 || c == 246 || c == 252 || c == 196 || c == 214 || c == 220 || c == 223) continue;
		var checkmore = false;
		for(var l = 0; l < more.length; l++){
			if(c == more[l]) checkmore = true;
		}
		if(checkmore) continue;
		return false;
	}
	return true;
}

function pullData(){
	SendAjax('php/pullData.php', "", function(result){console.log(result);}, function(faildata){console.log(faildata)});
}

function checkStringNum(str){
	for(var k = 0; k < str.length; k++){
		var c = str.charCodeAt(k);
		if(c >= 48 && c <= 57) continue; //0-9
		if(c == 45) continue;
		return false;
	}
	return true;
}

String.prototype.charCodeOf = function(asarray=false){
	var str = this;
	var res = "";
	for(var k = 0; k < str.length; k++){
		res += str.charCodeAt(k) + ",";
	}
	res = res.slice(0, -1);
	return asarray ? res.split(',').map(e => parseInt(e)) : res;
}

function addKarmaTask(task){
	let ntodo = false;
	if(task['Id'] < 0) return;
	for(var k=0; k < task["Categories"].length; k++){
		var currentnode = $('#karma-root-node');
		var splitcategory = (task["Categories"])[k].split('.');
		for(var l=0; l < splitcategory.length; l++){
			var word = splitcategory[l];
			var nextnode = currentnode.find("div[name='" + word  + "']").not(currentnode.children().find("div[name='" + word  + "']"));
			if(nextnode.length == 0){
				currentnode.append("<div style='display:none;' class='list-element menu-level-" + l + " " + currentnode.attr('name')+ l + "' name='" + word + "'>" + 
					"<div class='group-title-" + l + "'>" + word.replaceAll("_", " ") +
					"<img class='open-indicator' src='Icons/chevron-down.svg' /></div></div>");
				nextnode = currentnode.find("div[name='" + word + "']").not(currentnode.children().find("div[name='" + word + "']"));
			}
			currentnode = nextnode;
		}
		var tasknode = currentnode.find("div[name='" + task["Name"] + "']");
		var taskhtml = createTaskNode(task, currentnode.attr('name') + l);
		if(tasknode.length == 0){
			currentnode.append(taskhtml);
		}
		
	}
	if(task["Todo"] > 0){
		addKarmaTaskToTodo(task);
		ntodo = true;
	}
	$('#search-field').append(createTaskNode(task, 'search-field'));
	whitenIfDark();
	return ntodo;
}

function addKarmaTaskToTodo(task){
	var c = $('#todo-list').children();
	for(var k = 0; k < c.length; k++){
		if($(c[k]).attr('data') == task['Id']) return;
	}
	var taskhtml = createTaskNode(task, "", true);
	$('#todo-list').append(taskhtml);
	if($('#check-queue').hasClass("queue")) {
		$('.remove-todo').css({'width': '30px'});
	}
	$('.remove-todo').off().click(removeTodoSendHandler);
	$('.task-node').off().click(TaskNodeSendHandler);

	whitenIfDark();
	// TODO: sort from least recently enterted(top) to most recently entered(bottom)
	
}

function removeKarmaTaskFromTodo(taskid){
	var c = $('#todo-list').children();
	for(var k = 0; k < c.length; k++){
		if($(c[k]).attr('data') == taskid){
			$(c[k]).remove();
		}
	}
	for(var k = 0; k < karmaTasks.length; k++){
		if(karmaTasks[k]["Id"] == taskid)
			karmaTasks[k]["Todo"] = 0;
	}
}

function updateAllBadges(){
	var l = $('#bottom-menu-selector').children().length;
	for(var k = 1; k <= l; k++){
		updateBadge(k);
	}
}

function updateBadge(id){
	var value = 0;
	switch(id){
		case 1:

			break;
		case 2:
			for(var k = 0; k < karmaTasks.length; k++){
				var kt = karmaTasks[k];
				if(kt['Todo'] > 0){
					value++;
				}
			}
			break;
		case 3:

			break;
		case 4:
			for(var k = 0; k < shoppingList.length; k++){
				value += shoppingList[k]['Open'];
			}
			break;
	}
	if(value == 0){
		$('#bottom-menu-selector a[data-title=' + id + ']').find('.badge').removeClass('badge-active').html('0');
	}
	else{
		$('#bottom-menu-selector a[data-title=' + id + ']').find('.badge').addClass('badge-active').html(value);
	}
}

function createTaskNode(task, parentname, todo=false){
	var t = "";
	var removeIcon = "";
	if(todo) {
		t="todo";
		removeIcon = '<img style="width:0px; height:20px;" class="remove-todo" src="Icons/minus-circle.svg" />';
	}
	return "<div style='display:none;' data='" + task["Id"] + "' class='list-element task-node " + t + " " + parentname + "' name='" + task["Name"] + "'>" +
		removeIcon +
		"<div class='task-title'>" + task["Name"].replaceAll("_", " ") + "</div>" +
		"<div class='task-karma'>" + task["Karma"] + "</div></div>";
}

function oneLevelFind(node, phrase){
	var children = node.children();
	var res = [];
	for(var k = 0; k < children.length; k++){
		if(children[k].attr['name'] == phrase){
			res.push(children[k]);
		}
	}
}

String.prototype.replaceAll = function(search, replacement) {
    var target = this;
    return target.replace(new RegExp(search, 'g'), replacement);
};

function scale_all(){
	let h = $(document).height();
	let w = screen.width;

	$('#bottom-menu').css({'height': 0.1*h + 'px'});
	$('#main-frame').css({'height': 0.8*h + 'px'});
	$('.bottom-menu-button').css({'height': 0.1*h + 'px'});
	$('#title-bar').css({'height': 0.1*h + 'px'});
	$('#title-bar-left').css({'height': 0.1*h, 'width': 0.19*w + 'px'});
	$('#title-bar-center').css({'height': 0.1*h, 'width': 0.6*w-5 + 'px'});
	$('#title-bar-right').css({'height': 0.1*h, 'width': 0.19*w-1 + 'px'});
	$('.title-bar-element').css({'line-height': 0.1*h + 'px'});

}

function Btn5Functions(radioname, init_val, changed_fun){
	changed_fun(init_val);
	init_val = ''+init_val;
	if((''+init_val).includes('.')){
		init_val = init_val.substring(0, init_val.indexOf('.'));
	}
	$('#' + radioname + ' a[data-title='+ init_val +']').addClass('active');

	$('#' + radioname + ' a').click(function(){
	var sel = $(this).data('title');
	var tog = $(this).data('toggle');
	//var lastval = $('#'+tog).val();
	$('#'+tog).val(sel);

	$('a[data-toggle="'+tog+'"]').not('[data-title="'+sel+'"]').removeClass('active').addClass('notActive');
	$('a[data-toggle="'+tog+'"][data-title="'+sel+'"]').removeClass('notActive').addClass('active');
	changed_fun(sel);
	/*
	Send(tog, sel, function(){ 
	$('#'+tog).val(lastval);
	$('a[data-toggle="'+tog+'"]').not('[data-title="'+lastval+'"]').removeClass('active').addClass('notActive');
	$('a[data-toggle="'+tog+'"][data-title="'+lastval+'"]').removeClass('notActive').addClass('active');
	});
	*/
	});
}

function ResizeBtn5(radioname, height){
  var toggles = $('#' + radioname + ' a');
  for(var k = 0; k < toggles.length; k++){
    $(toggles[k]).css({
      'width': String(parseInt($('#' + radioname + '-container').css('width').replace('px', ''))/toggles.length + 1) + 'px',
      'height': String(height) + 'px'
    });
  }
}

function ClickableProfilePics(){
	$('.image-container').click(function(e){toggleImageContainer($(this))});
}

function toggleImageContainer(target){
	if(target.hasClass('highlighted-img-container')){
			target.removeClass('highlighted-img-container');
			const newstyle = {
				'left': Math.round(parseInt(target.attr('original-left')))+'px', 
				'top': Math.round(parseInt(target.attr('original-top')))+'px'
			};
			console.log(newstyle);
			target.animate(newstyle, 400, 'swing', 
				()=>{target.css({'position': '', 'left': '', 'right': ''});}
			);
			target.find('.profilepic').removeClass('highlighted-img');
			$('#profile-pic-background').remove();
		}
		else{
			const pos = target.position();
			target.attr('original-left', pos.left);
			target.attr('original-top', pos.top);
			target.css({'position': 'absolute', 'left': pos.left, 'top': pos.top});
			target.animate({'left': '45px', 'top': '100px'}, 500);
			$('.image-container').removeClass('highlighted-img-container');
			$('.profilepic').removeClass('highlighted-img');
			target.addClass('highlighted-img-container');
			target.find('.profilepic').addClass('highlighted-img');
			$('body').append('<div id="profile-pic-background"></div>');
			$('#profile-pic-background').click(function(e){toggleImageContainer(target)});
		}
}

function ReplacePic(jqid, picfile, failfun=()=>{}){
	let isDark = users.find(u => u['Id'] == userid)['Theme'] == 'dark';
	$.get(picfile).fail(e => {
		setTimeout(function(){
			let replacement = isDark ? '/Icons/user-w.svg' : '/Icons/user.svg';
			$('#'+jqid).attr('src', replacement);
		}, 100);
		failfun();
	});
}
