function showNotifications(){
	setPage(1.6);
	$('#main-frame').html('');
	$('#main-frame').append('<div id="notifications-root"></div>');
	$('#title-bar-center').html('Benachrichtigungen');
	$('#title-bar-right').html('');
	addBackNavigator(showAccount);
	let currentUser = users.find(u=>u['Id']==userid);
	let usernotis = '';
	if(currentUser['Notifications'] != undefined){
		usernotis = currentUser['Notifications'];
	}

	for(let n of validNotifications){
		if(!n['Requires'].split(' ').every(req => currentUser['Permissions'].includes(req))) continue;
		let act = '';
		if(usernotis.includes(n['Name'])) act = 'active';
		$('#notifications-root').append('<div class="notification-toggle-container list-element" data="' + n['Name'] + '">'+
				'<div class="notification-name" style="display:inline">'+ translateNotification(n['Name']) + '</div>'+
				'<div class="list-element-toggle"><div class="list-element-toggle-indicator ' + act + '"></div></div>'+
			'</div>');
	}

	$('.notification-toggle-container').click(e => {
		let t = $(e.target);
		while(!t.hasClass('notification-toggle-container')){
			t = $(t.parent());
		}
		let n = t.attr('data');
		let indi = t.find('.list-element-toggle-indicator');
		let nname = t.find('.notification-name');

		SendAjax('/php/changeNotification.php', {'Notification': n}, 
			e => {
				if(e['status'] == false){
				  highlightError($(e.target).find('.permission-name'), 'Fehler!');
				  return;
				}
				let val = '';
				if(e['Value']){
					val = ' Ein';
					indi.addClass('active');
					appendAttribute(userid, 'Notifications', n);
				}
				else{
					val = ' Aus';
					indi.removeClass('active');
					removeAttribute(userid, 'Notifications', n);
				}
				highlightSuccess(nname, nname.html() + val);
				console.log(e);
			}, 
			e => {
				highlightError($(e.target).find('.permission-name'), 'Fehler!');
				console.log(e);
			});
	});
	whitenIfDark();
}

function translateNotification(name){
	switch(name){
		case 'Drinks': return 'Eingetragene Getränke';
		case 'KarmaDone': return 'Karma-Aufgabe erledigt';
		case 'BeerCancel': return 'Stornoanfrage Getränke';
		case 'KarmaModify': return 'Karma-Aufgabe modifiziert';
		case 'NewUser': return 'Neuer Benutzer';
		case 'KarmaList': return 'Aktuelle Aufgabe hinzugefügt';
		case 'ShoppingList': return 'Neuer Eintrag in Einkaufsliste';
		case 'ShoppingDone': return 'Gegenstand in Einkaufsliste gekauft';
		case 'Payment': return 'Getränkeguthaben verändert';
		case 'DebtReminder': return 'Erinnerung an Deine Schulden';
		case 'KarmaTransfer': return 'Karmabuchungen an Dich';
		case 'SiteUpdate': return 'Updates für diese Website';
		case 'KarmaBalance': return 'Karma-Abrechnungen';
		case 'NewProduct': return 'Neue Getränke verfügbar';
		case 'MultiDrink': return 'Mehrere Getränke Eingetragen';
	}
}