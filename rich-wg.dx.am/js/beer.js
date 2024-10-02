function showBeer(subpage){
	$('#title-bar-center').html('Getränke');
	$('#title-bar-left').html('<img id="group-selector" src="Icons/group.svg" class="chevron-title" />');
	$('#title-bar-right').html('');
	$('#main-frame').html('');
	$('#main-frame').append('<div class="list-element highlighted" id="drinks-overview">'+
		'<div style="display:inline;" class="group-title">' + totalDebtFormatted(userid) + '</div>'+
		'<div style="float:right;"><img src="Icons/chevron-right.svg" class="chevron" /> </div>'+
		'</div>');
	if(users.find(function(u){return u['Id']==userid})['Permissions'].includes("beer_admin")){
		$('#main-frame').append('<div class="list-element" id="payments">'+
			'<div style="display:inline;" class="group-title">Bezahlen</div>'+
			'<div style="float:right;"><img src="Icons/chevron-right.svg" class="chevron" /> </div>'+
			'</div>');
		$('#payments').click(showPayments);
		$('#main-frame').append('<div class="list-element" id="cancel-list">'+
			'<div style="display:inline;" class="group-title">Stornoanfragen</div>'+
			'<div style="float:right;"><img src="Icons/chevron-right.svg" class="chevron" /> </div>'+
			'<div id="cancel-badge" class="badge">' + toCancel.length + '</div>'+
			'</div>');
		if(toCancel.length > 0) {
			$('#cancel-badge').css({'display': 'inline', 'float': 'right'});
			$('#cancel-list').addClass('highlighted');
		}
		$('#title-bar-right').html('<img id="modify-entries" src="Icons/cog-wheel.svg" class="chevron-title"/>');
		$('#modify-entries').off().click(showEditProducts);
		$('#modify-entries').removeClass('modify-entries-acive');
	}
	if(selectSubpageBeer(subpage)) return;
	setPage(3);
	$('#main-frame').append('<div id="drinks-action-info" class="info-board">Getränke eintragen</div>');
	$('#main-frame').append('<div id="drinks-root"></div>');

	$('#drinks-overview').click(showDebt);
	$('#cancel-list').click(showCancel);
	$('#group-selector').click(groupEntry);
	for(var k = 0; k < products.length; k++){
		addProduct(products[k]);
	}
	whitenIfDark();
}

function selectSubpageBeer(subpage){
	switch(subpage){
		case 0: return false;
		case 1: showDebt(); return true;
		case 2: showPayments(); return true;
		case 3: showCancel(); return true;
		case 4: showEditProducts(); return true;
	}
}

function totalDebt(id){
	var debt = 0;
	for(var k = 0; k < drinksHistory.length; k++){
		var entry = drinksHistory[k];
		if(entry['UserId'] == id){
			if(entry['ProductId'] == -1){
				debt -= parseFloat(entry['Amount']);
			}
			else if(entry['ProductId'] == -2){
				debt -= parseFloat(entry['Amount']);
			}
			else{
				for(var l = 0; l < products.length; l++){
					if(products[l]['Id'] == entry['ProductId']){
						debt += parseFloat(products[l]['Cost']) * parseFloat(entry['Ratio']);
					}
				}
			}			
		}
	}
	return debt;
}

function groupEntry(){
	if($('#group-selector').hasClass('modify-entries-acive')){
		$('#group-entry-container').remove();
		$('#group-selector').removeClass('modify-entries-acive');
		$('#drinks-action-info').html('Getränke eintragen');
		$('#group-entry-container').remove();
		$('#drinks-root').css({'display': ''});
	}
	else{
		$('#group-selector').addClass('modify-entries-acive');
		$('#drinks-action-info').html('Getränke zur Auswahl hinzufügen');
		$('#drinks-root').css({'display': 'none'});
		$('#main-frame').append('<div id="group-entry-container">'+
			'<div id="selected-drinks"></div>'+
			'<div class="info-board">Freunde auswählen</div>'+
			'<div id="user-selector"></div>'+
			'<div id="additional-users">'+
				'<div id="show-all-users" class="list-element">'+
				'<input type="text" id="search-drink-user" class="search-drink-user squashed" placeholder="Filter"/>'+
				'<div class="group-title" style="display:inline-block;width:auto;">Weitere</div>'+
				'<img class="open-indicator" src="Icons/chevron-down.svg"></div>'+
			'</div>'+
			'<div id="send-order" class="list-element group-entry-button">Eintragen</div>'+
			'</div>');

		$('#show-all-users').click(function(e){
			if($(e.target).hasClass('search-drink-user')) return;
			let hiddenusers = $('#additional-users .user-selection');
			if($(this).find('.group-title').hasClass('open')){
				hiddenusers.slideUp();
				$(this).find('.group-title').removeClass('open');
				$(this).find('.group-title').html('Weitere');
				$(this).find('.open-indicator').removeClass('flipped');
				$(this).find('.search-drink-user').addClass('squashed');
			}
			else{
				hiddenusers.slideDown();
				$(this).find('.group-title').addClass('open');
				$(this).find('.group-title').html('Weniger');
				$(this).find('.open-indicator').addClass('flipped');
				$(this).find('.search-drink-user').removeClass('squashed');
			}
		});

		$('#search-drink-user').keyup(e=>{
			let t = $(e.target);
			let v = t.val();
			let au = $('#additional-users .user-selection');
			if(v == ""){
				au.slideDown();
				return;
			}
			for(u of au){
				if($(u).find('.user-name').html().toLowerCase().includes(v.toLowerCase())){
					$(u).slideDown();
				}
				else{
					$(u).slideUp();
				}
			}
		});

		for(var k = 0; k < users.length; k ++){
			var u = users[k];
			if(!u['Permissions'].includes('beer')) continue;
			let picname = 'profile-pic-' + u['Id'];
			let picfile = 'Images/' + picname + '.jpg';

			var name = '<img id="' + picname + '" src="' + picfile + '" class="profilepic profilepic-inline" >' + '<div class="user-name" style="display: inline;">' + u['Name'] + '</div>';
			ReplacePic(picname, picfile);

			var initval = u['Id'] == userid ? 1 : 0;
			var par_name = '#user-selector';
			var hidden = '';
			if(k > 3) {
				par_name = '#additional-users';
				hidden = 'hidden '
			}
			createUpDownCounter($(par_name), name, initval, 'user-selector-' + u['Id'], hidden + 'user-selection', false, initval, 0, 
				function(e){
					if(parseInt(e.find('.amount-display').html()) > 0) e.addClass('highlighted');
					else e.removeClass('highlighted');
				});
		}

		for(var k = 0; k < products.length; k++){
			var p = products[k];
			if(p["Expired"]) continue;
			createUpDownCounter($('#selected-drinks'), p['Name'].replaceAll('_', ' '), 0, 'selected-product-' + p['Id'], 'drink-selection', false, 0, 0, 
				function(e){
					if(parseInt(e.find('.amount-display').html()) > 0) e.addClass('highlighted');
					else e.removeClass('highlighted');
				});
		}

		$('#send-order').click(SendGroupEntry);
	}
}

function SendGroupEntry(){
	var userselector = $('.user-selection');
	var userids = [];
	for(var k = 0; k < userselector.length; k ++){
		var u = $(userselector[k]);
		var n = parseInt(u.find('.amount-display').html());
		var id = parseInt(u.attr('id').replace('user-selector-', ''));
		while(n-- > 0) userids.push(id);
	}

	var drinkselection = $('.drink-selection');
	var drinkids = [];
	for(var k = 0; k < drinkselection.length; k++){
		var d = $(drinkselection[k]);
		var n = parseInt(d.find('.amount-display').html());
		var id = parseInt(d.attr('id').replace('selected-product-', ''));
		while(n-- > 0) drinkids.push(id)
	}
	var payload = {'UserIds': userids, 'DrinkIds': drinkids};
	SendAjax('/php/enterDrinkGroup.php', payload, function(result){
		if(result['status'] == true){
			for(var k = 0; k < result['data'].length; k++){
				drinksHistory.push(result['data'][k]);
			}
			$('#drinks-overview .group-title').html(totalDebtFormatted(userid));
			$('.amount-display').not('#user-selector-'+userid+'-amount-display').html('0 x ');
			$('.user-selection').not('#user-selector-'+userid).removeClass('highlighted');
			$('.drink-selection').removeClass('highlighted');
			highlightSuccess($('#send-order'), 'Getrunken!');
		}
		else{
			highlightError($('#send-order'), 'Fehler!');
		}
		console.log(result);
	}, function(faildata){
		highlightError($('#send-order'), 'Fehler beim Senden');
		console.log(faildata);
	});
}

function createUpDownCounter(parent, name, initval, id, classname, removeonzero=true, lowerlimit=0, upperlimit=0, onupdate=function(element){}){
	$(parent).append('<div class="list-element ' + classname + '" id="' + id + '">' +
		'<div class="list-element-left clickable" style="background: indianred;" id="' + id + '-count-down"><img class="group-entry-minus" src="Icons/minus.svg" ></div>' +
		'<div class="amount-display" style="display:inline;" id="' + id + '-amount-display">' + initval + ' x </div>' +
		'<div class="name-container" style="display:inline;">' + name + '</div>' +
		'<div class="list-element-right clickable" style="background: olivedrab;" id="' + id + '-count-up"><img class="group-entry-plus" src="Icons/plus.svg"></div>' +
		'</div>');
	$('#' + id + '-count-down').click(function(){
		var n = parseInt($('#' + id + '-amount-display').html());
		if(n == lowerlimit) return;
		if(n == 1 && removeonzero) $('#' + id).remove();
		else $('#' + id + '-amount-display').html((n-1) + " x ");
		onupdate($('#' + id));
	});
	$('#' + id + '-count-up').click(function(){
		var n = parseInt($('#' + id + '-amount-display').html());
		if(n == upperlimit && upperlimit > lowerlimit) return;
		$('#' + id + '-amount-display').html((n+1) + " x ");
		onupdate($('#' + id));
	});
	onupdate($('#' + id));
	whitenIfDark();
}

function addDrinkToOrder(prodId){
	var p = products.find(p => p['Id'] == prodId);
	if($('#selected-product-' + prodId).length == 0){
		createUpDownCounter($('#selected-drinks'), p['Name'], 1, 'selected-product-' + prodId, 'drink-selection');
	}
	else{
		var n = $('#selected-product-' + prodId + ' .amount-display').html();
		$('#selected-product-' + prodId + ' .amount-display').html((n + 1) + " x ");
	}
}

function showEditProducts(){
	setPage('3.4');
	$('#title-bar-left').html('');
	$('#modify-entries').addClass('modify-entries-acive');
	$('#modify-entries').off().click(showBeer);
	$('#main-frame').html('<div id="product-container"></div>');

	for(var k = 0; k < products.length; k++){
		var p = products[k];

		$('#product-container').append('<div class="list-element" id="' + p['Id'] + '">' +
			'<div class="group-title-beer-edit">' + p['Name'].replaceAll('_', ' ') + '</div>' +
			'<div class="drink-cost">' + formatCost(p['Cost']) + '</div>' +
			'</div>');
		if(!p['Expired']){
			$('#'+p['Id']).append('<div class="disable-drink-button drawer" style="display:none">Deaktivieren</div>');
		}
		else{
			$('#'+p['Id']).append('<div class="disable-drink-button enable-drink-button drawer" style="display:none">Aktivieren</div>');
			$('#'+p['Id']).addClass('expired-drink');
		}
	}

	$('#product-container').append('<div class="list-element highlighted new-product" id="-1">'+
		'<div class="group-title-beer-edit">Neues Produkt</div>'+
		'<form class="drawer" style="display:none"><input type="text" id="newprodname" placeholder="Name"/>'+
		'<input id="newprodcost" lastval="" inputmode="numeric" placeholder="€" />'+
		'<div class="product-submit-button"><img src="Icons/plus-circle.svg" class="chevron"/></div></form>'+
		//'<form><input type="tel" id="newprodcost" /></form>'+
		'</div>');


	$('.group-title-beer-edit').click(function(){
		var par = $(this).parent();
		var slideobj = par.find('.drawer');
		if(par.hasClass('open')){
			slideobj.slideUp();
			par.removeClass('open');
		}
		else{
			$('.drawer').not(slideobj).slideUp();
			$('.drawer').parent().removeClass('open');
			slideobj.slideDown();
			par.addClass('open');
		}
	});

	$('#newprodcost').keyup(function(e){
		let t = $(e.target)
		let v = t.val();
		if(e.key == "Enter"){
			SendEditProduct($(this));
			t.val('');
			return;
		}
		v = v.replace('.', '').replace('€', '');
		while(v.startsWith('0')) v = v.substring(1);

		if(isNaN(parseInt(k)) && e.key != 'Backspace'){
			t.val(t.attr('lastval'));
			return;
		}
		if(e.key == 'Backspace'){
			v = v.substring(0, v.length - 1);
		}
		if(v.length < 1){
			v = '0.00';
		}
		else if(v.length < 2){
			v = '0.0' + v;
		}
		else if(v.length < 3){
			v = '0.' + v;
		}
		else{
			v = v.substring(0, v.length - 2) + '.' + v.substring(v.length - 2);
		}
		v = v + '€';
		
		t.val(v);
		t.attr('lastval', v);
	});
	$('#newprodname').keyup(function(e){
		if(e.key == "Enter"){
			SendEditProduct($(this));
		}
	});

	$('.disable-drink-button').click(function(){
		var id = $(this).parent().attr('id');
		SendEditProduct($(this));
	});
	$('.enable-drink-button').click(function(){
		var id = $(this).parent().attr('id');
	});
	
	whitenIfDark();
}

function showPayments(){
	setPage('3.2');
	addBackNavigator(showBeer);
	$('#title-bar-right').html('');
	$('#main-frame').html('<div id="userlist"></div>');
	$('#main-frame').append('<div id="input-container"></div>');
	for(var k = 0; k < users.length; k++){
		var u = users[k];
		if(!u['Permissions'].includes('beer')) continue;
		$('#userlist').append('<div class="user-selector list-element" id="' + u['Id'] + '">' + 
			u['Name'] + '<div style="float:right;">' + totalDebtFormatted(u["Id"]).replace('Deine', '').replace('Dein', '') + '</div>' + 
		'</div>');
	}
	$('.user-selector').click(function(){
		$('.user-selector').removeClass('highlighted');
		$(this).addClass('highlighted');
	});
	$('#input-container').append('<form>'+
		'<input id="amount" lastval="" inputmode="numeric" placeholder="€" />'+
		'<div id="payment-submit-button">Einzahlen</div></form>');
	$('#amount').keyup((e)=>{
		let t = $(e.target);
		let v = t.val();
		let k = e.key;
		let isneg = v.startsWith('-');
		v = v.replace('.', '').replace('€', '').replace('-', '');
		while(v.startsWith('0')) v = v.substring(1);

		if(k == '0' && v == '') isneg = !isneg;
		if(isNaN(parseInt(k)) && e.key != 'Backspace'){
			t.val(t.attr('lastval'));
			return;
		}
		if(e.key == 'Backspace'){
			v = v.substring(0, v.length - 1);
		}
		if(v.length < 1){
			v = '0.00';
		}
		else if(v.length < 2){
			v = '0.0' + v;
		}
		else if(v.length < 3){
			v = '0.' + v;
		}
		else{
			v = v.substring(0, v.length - 2) + '.' + v.substring(v.length - 2);
		}
		v = v + '€';
		if(isneg) {
			v = '-' + v;
			$('#payment-submit-button').html('Auszahlen');
		}
		else{
			$('#payment-submit-button').html('Einzahlen');
		}
		t.val(v);
		t.attr('lastval', v);
	});
	$('#payment-submit-button').click(function(){
		var id = $('#userlist').find('.highlighted').attr('id');
		var amount = parseFloat($('#amount').val().replace('€',''));
		if(id == undefined){
			highlightError($(this), 'Benutzer auswählen!');
			return;
		}
		if(isNaN(amount)){
			highlightError($(this), 'Betrag eingeben!');
			return;
		}
		var payload = {'CustomerId': id, 'ProductId': -1, 'Amount': amount};
		var that = $(this);
		console.log(payload);
		SendAjax('php/enterDrink.php', payload, function(result){
			console.log(result);
			if(result['status']){
				highlightSuccess(that, 'Eingetragen');
				drinksHistory.push(result['data']);
			}
			else{
				highlightError(that, 'Fehler!');				
			}
		}, function(faildata){
			console.log(faildata);
			highlightError(that, 'Fehler beim Senden');
		});
	});
	whitenIfDark();
}

function SendEditProduct(element){
	var e = $(element);
	while(!e.hasClass('list-element')) e=e.parent();
	var id = e.attr('id');
	if(e.hasClass('new-product')){
		var payload = {
			'ProductId': id, 
			'ProductName': $('#newprodname').val().replaceAll(' ', '_'),
			'ProductCost': $('#newprodcost').val().replace(',', '.').replace('€', ''),
			'Disable': "false"
		};
	}
	else{
		var payload = {
			'ProductId': id,
			'Disable': !e.hasClass('expired-drink'),
			'ProductCost': products.find(p => p['Id'] == id)['Cost'],
			'ProductName': products.find(p => p['Id'] == id)['Name']
		}
	}
	SendAjax('/php/editProducts.php', payload, function(result){
		console.log(result);
		if(result['status']){
			if(id == -1){
				products.push(result['data']);
			}
			else{
				for(var k = 0; k < products.length; k++){
					if(products[k]['Id'] == id){
						products[k]['Expired'] = !products[k]['Expired'];
					}
				}
			}
			showEditProducts();
			if(id == -1){
				highlightSuccess($('#'+result['data']['Id']), 'Neu: ' + result['data']['Name'].replaceAll('_', ''));
			}
			else{
				var msg = '';
				if(payload['Disable']){
					msg = 'Deaktiviert';
				}
				else{
					msg = 'Aktiviert';
				}
				highlightSuccess($('#'+id), msg);
			}
		}
		else{
			highlightError($('#'+id), 'Fehler!');
		}
	},
	function(faildata){
		highlightError($('#'+id), 'Fehler beim Senden!');
		console.log(faildata);
	});
}

function totalDebtFormatted(id){
	var debt = totalDebt(id);
	if(debt <= 0){
		return "Dein Guthaben: " + (formatCost(-debt));
	}
	else{
		return "Deine Schulden: " + (formatCost(debt));
	}
}
function addProduct(product){
	if(product['Expired'] != false) return;
	let id = product['Id'];

	$('#drinks-root').append('<div class="list-element drink-element">'+
		'<div id="drink-id-' + id + '" class="drink-name">' + product['Name'].replaceAll('_',' ') + '</div>'+
		'<div style="float:right;" class="fraction-toggle" id="drink-fraction-' + id + '"><img src="Icons/chevron-down.svg" class="chevron open-indicator" /></div>'+
		'<div style="float:right;" class="beer-drink-cost">' + formatCost(product['Cost']) + '</div>'+
		'<div class="fraction-selector-container" id="fraction-selector-container-' + id + '" style="display:none">'+
			'<span class="fraction-selector fraction-selector-left fraction-selector-' + id + '" data="0.25">1/4</span>'+
			'<span class="fraction-selector fraction-selector-' + id + '" data="0.50">1/2</span>'+
			'<span class="fraction-selector fraction-selector-' + id + '" data="0.75">3/4</span>'+
			'<span class="fraction-selector fraction-selector-' + id + ' fraction-confirm">ok</span>'+
		'</div>'+
		'</div>');
	$('#drink-fraction-' + id).click(()=>{
		let toggle = $('#drink-fraction-' + id + ' .chevron');
		if(toggle.hasClass('flipped')){
			toggle.removeClass('flipped');
			$('#fraction-selector-container-' + id).slideUp();
		}
		else{
			$('.open-indicator').removeClass('flipped');
			toggle.addClass('flipped');
			$('.fraction-selector-container').slideUp();
			$('#fraction-selector-container-' + id).slideDown();
		}
	});
	let lock = false;
	$('.fraction-selector-' + id).click((e)=>{
		if(lock) return;
		if($(e.target).hasClass('fraction-confirm')){
			lock = true;
			setTimeout(()=>{lock=false;}, 1000);
			let amount = $('#fraction-selector-container-' + id + ' .fraction-selector-' + id + '.highlighted').attr('data');
			SendEnterDrink(id, parseFloat(amount));
			return;
		}
		$('.fraction-selector').not($(e.target)).removeClass('highlighted');
		$(e.target).addClass('highlighted');
	});
	$('#drink-id-' + id).click(function(){ SendEnterDrink(product['Id'], 1.0) });
}

function SendEnterDrink(prodId, amount){
	SendAjax('/php/enterDrink.php', {"ProductId": prodId, "Amount": amount}, 
		function(result){
			console.log(result);
			if(result['status'] == true){
				highlightSuccess($('#drink-id-' + prodId), "Getrunken!");
				drinksHistory.push(result['data']);
				$('#drinks-overview .group-title').html(totalDebtFormatted(userid));
			}
			else{
				highlightError($('#drink-id-' + prodId), "Fehler!");
			}
		}, function(faildata){
			console.log(faildata);
			highlightError($('#drink-id-' + prodId), "Fehler beim Senden")
		}
	);
}

function showCancel(){
	setPage('3.3');
	addBackNavigator(showBeer);
	$('#title-bar-right').html('');
	$('#main-frame').html('<div id="cancel-list-container"></div>');
	for(var k = 0; k < toCancel.length; k++){
		var c = toCancel[k];
		$('#cancel-list-container').append('<div class="list-element cancel-entry" data="' + c['Timestamp'] + '" product="' + c['ProductId'] + '">'+
			'<div class="cancel-user-name">' + users.find(u => u['Id'] == c['UserId'])['Name'] + '</div>' +
			'<div class="cancel-product">' + products.find(p => p['Id'] == c['ProductId'])['Name'] + '</div>' +
			'</div>');
	}
	$('.cancel-user-name').click(function(){
		if($(this).hasClass('open')){
			$(this).removeClass('open');
			$('.detail-view').slideUp(400, function(){$('.detail-view').remove();});
		}
		else{
			$('.cancel-user-name').removeClass('open');
			$(this).addClass('open');
			var par = $(this).parent();
			$('.detail-view').not(par.find('.detail-view')).slideUp(400, function(){$('.detail-view').not(par.find('.detail-view')).remove();});
			$(this).parent().append('<div class="detail-view" style="display:none">' + 
				'<div class="cancel-date">' + millis2date(par.attr('data')) + '</div>' +
				'<div class="refuse-button button">Ablehnen</div><div class="accept-button button">Akzeptieren</div>' +
				'</div>');
			par.find('.detail-view').slideDown();

			$('.refuse-button').click(function(){
				var listElement = $(this).parent().parent();
				var timestamp = listElement.attr('data');
				SendAjax('/php/removeDrink.php', {'Timestamp': timestamp, 'Action': 'unmark'}, function(result){
					console.log(result);
					if(result['status']){
						removeEntryFromCancel(timestamp);
						listElement.remove();
					}
					else{
						highlightError(listElement, "Fehler!");
					}
				},function(faildata){
					console.log(faildata);
					highlightError(listElement, "Fehler beim Senden");
				});
			});

			$('.accept-button').click(function(){
				var listElement = $(this).parent().parent();
				var timestamp = listElement.attr('data');
				SendAjax('/php/removeDrink.php', {'Timestamp': timestamp, 'Action': 'remove', 'ProductId': listElement.attr('product')}, function(result){
					console.log(result);
					if(result['status']){
						removeEntryFromCancel(timestamp);
						removeDrinkFromHistory(timestamp);
						listElement.remove();
					}
					else{
						highlightError(listElement, "Fehler!");
					}
				}, function(faildata){
					console.log(faildata);
					highlightError(listElement, "Fehler beim Senden");
				})
			});
		}
	});
	whitenIfDark();
}

function showDebt(){
	setPage('3.1');
	addBackNavigator(showBeer);
	$('#title-bar-right').html('<img id="modify-entries" src="Icons/cog-wheel.svg" class="chevron-title"/>');
	$('#main-frame').html('<div id="user-drinks-container"></div>');

	drinksHistory.sort(function(l, r){
		if(parseInt(l['Timestamp']) > parseInt(r['Timestamp'])) return -1;
		else return 1;
	});

	var usersSorted = users.map(u => {u.debt = totalDebt(u.Id); return u}).sort((a, b) => a.debt < b.debt);
	addDrinksUser(users.find(u => u.Id == userid));
	for(var k = 0; k < usersSorted.length; k++){
		let user = usersSorted[k];
		if (!user['Permissions'].includes('beer') || user.Id == userid) continue;
		addDrinksUser(users[k]);
	}

	ClickableProfilePics();

	$('#modify-entries').click(editDrinkEntries);

	$('.group-title').click(function(){
		var parent = $($(this).parent());
		var id = $($(this).parent()).attr('id');
		if($(this).hasClass('open')){
			$('.' + id).slideUp(400, ()=>parent.css({'height': '23px'}));
			$(this).removeClass('open');
			$(this).find('.open-indicator').removeClass('flipped');
		}
		else{
			$('.group-title').removeClass('open');
			$(this).addClass('open');
			$('.open-indicator').removeClass('flipped');
			$('.drinks-entry').not('.' + id).slideUp();
			$('.show-all-drinks').slideUp();
			setTimeout(()=>{$('.debt-container').not('#' + id).css({'height': '23px'}), 500});
			parent.css({'height': ''});
			$('.' + id).slideDown();
			$(this).find('.open-indicator').addClass('flipped');
		}
	});
	$('.debt-container').css({'height': '23px'});

	for(var k = 0; k < drinksHistory.length; k++){
		var h = drinksHistory[k];
		var userDrinksContainer = $('#drinks-user-' + h['UserId']);
		addDrinksHistoryEntry(userDrinksContainer, h);
	}

	$('.drinks-entry').click(drinksEntryClick);
	$('.show-all-drinks').click(function(){
		var id = $(this).parent().attr('id');
		$('.' + id).remove();
		var par = $('#' + id);
		var drinksid = id.replace("drinks-user-", "");
		for(var k = 0; k < drinksHistory.length; k++){
			var h = drinksHistory[k];
			if(h['UserId'] != drinksid) continue;
			addDrinksHistoryEntry(par, h, -1);
			$('.' + id).slideDown();
		}
		$('.' + id).off().click(drinksEntryClick);
	});
	whitenIfDark();
}

function addDrinksUser(user){
	let picname = 'profile-pic-' + user['Id'];
	let picfile = 'Images/' + picname + '.jpg';
	$('#user-drinks-container').append("<div id='drinks-user-" + user["Id"] + "' class='list-element debt-container'>"+
			"<div class='image-container' style='float: left;'><img id='" + picname + "' class='profilepic' src='" + picfile + "' /></div>"+
			"<div class='group-title'>" + user["Name"] +
			"<img class='open-indicator' src='Icons/chevron-down.svg' />" +
			"<div id='drinks-user-" + user["Id"] + "-debt' style='display:inline; float:right;'>" + totalDebtFormatted(user["Id"]).replaceAll('Deine ', '').replaceAll('Dein ', '') + "</div>" + "</div>" +
		"</div>");
	if(user['Id'] == userid) $('#drinks-user-' + user['Id']).addClass('highlighted');
	ReplacePic(picname, picfile);
}

function drinksEntryClick(){
	//if($('#modify-entries').hasClass('modify-entries-acive')) return;
	if($(this).hasClass("showdate")){
		$(this).removeClass("showdate");
		$('.date-indicator').remove();
	}
	else{
		$('.date-indicator').remove();
		$('.drinks-entry').removeClass('showdate');
		$(this).append('<div class="date-indicator style="display:none">' + millis2date($(this).attr('data')) + '</div>');
		//$('.date-indicator').slideUp(300, function(){ $('.date-indicator').remove(); });
		//$('.date-indicator-temp').slideDown(400, function(){ $('.date-indicator-temp').removeClass('date-indicator-temp').addClass('date-indicator'); });
		$(this).addClass('showdate');
	}
}

function addDrinksHistoryEntry(parent, entry, maxlen=7){
	var h = entry;

	if(maxlen > 0){
		if(parent.children().length > maxlen) return;
		if(parent.children().length == maxlen){
			parent.append('<div style="display:none" class="list-element show-all-drinks drinks-user-' + h['UserId'] + '">Alle anzeigen</div>');
			return;
		}
	}	
	if(h['ProductId'] == -1){
		let payment_type = "Einzahlung";
		let sign = "+";
		let amount = parseFloat(h["Amount"]);
		if(amount < 0){
			payment_type = "Auszahlung";
			amount *= -1;
			sign = "-"
		}
		parent.append('<div class="list-element drinks-entry drinks-user-' + h["UserId"] + '" data="' + h["Timestamp"] + '" style="display:none;">'+
			"<div style='display:inline;'>" + payment_type + "</div>"+
			"<div style='display:inline; float:right;'>" + sign  + formatCost(amount)+ "</div>"+
			'</div>');
		return;
	}
	if(h['ProductId'] == -2){
		let amount = parseFloat(h["Amount"]);
		let sign = '+';
		if(amount < 0) sign = '';
		parent.append('<div class="list-element drinks-entry drinks-user-' + h["UserId"] + '" data="' + h["Timestamp"] + '" style="display:none;">'+
			"<div style='display:inline;'>Kumuliertes Guthaben</div>"+
			"<div style='display:inline; float:right;'>" + sign  + formatCost(amount)+ "</div>"+
			'</div>');
		return;
	}
	var cancelIndicator = "";
	var highl = "";
	for(var l = 0; l < toCancel.length; l++){
		if(toCancel[l]['Timestamp'] == h['Timestamp']){
			cancelIndicator = '<div class="cancel-indicator">S:</div>';
			highl = "highlighted";
		}
	}
	var partly = '';
	if(h['Ratio'] != 1) partly = formatRatio(h['Ratio']) + " x ";
	var prod = products.find(function(e) {return e["Id"] == h["ProductId"]});
	parent.append("<div class='" + highl + " list-element drinks-entry drinks-user-" + h["UserId"] + "' data='" + h["Timestamp"] + "' product='" + h['ProductId'] + "' style='display:none;'>"+
			cancelIndicator+
			"<div style='display:inline;'>" + partly + prod["Name"].replaceAll('_', ' ') + "</div>"+
			"<div style='display:inline; float:right;'>-" + formatCost(prod["Cost"]*h['Ratio']) + "</div>"+
		"</div>");
	whitenIfDark();
}

function highlightDebt(user, timestamp, msg){
	$('#drinks-user-' + user + ' .drinks-entry').css({'display': ''});
	$('#drinks-user-' + user).css({'height': ''});
	$('#drinks-user-' + user).addClass('open');
	highlightSuccess($('#user-drinks-container').find('[data=' + timestamp + ']'), msg);
}

function editDrinkEntries(){
	if($('#modify-entries').hasClass("modify-entries-acive")){
		$('#modify-entries').removeClass("modify-entries-acive");
		$('.delete-icon').animate({width: 0}, 100, function(){
			$('.delete-button').remove();
		});
		$('.unmark-icon').animate({width: 0}, 100, function(){
			$('.unmark-button').remove();
		});
	}	
	else{
		$('.date-indicator').remove();
		$('#modify-entries').addClass("modify-entries-acive");
		$('.drinks-entry').not('.highlighted').append('<div class="delete-button" style="display:inline;float:left;line-height:20px;"><img class="delete-icon" src="Icons/minus-circle.svg" width="0" height="20" />  </div>');
		$('.delete-icon').animate({width: 20}, 100);
		$('.delete-button').click(function(){
			var par = $(this).parent();
			var timestamp = par.attr('data');
			var id = par.parent().attr('id').replace('drinks-user-', '');
			var pid = par.attr('product');
			SendAjax("/php/removeDrink.php", {'Timestamp': timestamp, 'Action': 'remove', 'ProductId': pid}, function(result){
				console.log(result);
				if(result['status'] == true){
					if(users.find(u => u["Id"] == userid)['Permissions'].includes('beer_admin')){
						removeDrinkFromHistory(timestamp, userid);
					}
					else{
						par.addClass('highlighted');
						toCancel.push(result['data']);
					}
					showDebt();
					editDrinkEntries();
					highlightDebt(id, timestamp, 'Stornoanfrage gemacht!');
				}
				else{
					highlightError(par, "Fehler!");
				}
			}, function(faildata){
				highlightError(par, "Fehler beim Senden!");
				console.log(faildata);
			});
		});

		$('.drinks-entry.highlighted').append('<div class="unmark-button" style="display:inline; float:left; line-height: 20px;"><img class="unmark-icon" src="Icons/ban.svg" width="0" height="20" /></div>');
		$('.unmark-icon').animate({width: 20}, 100);
		$('.unmark-button').click(function(){
			var par = $(this).parent();
			var timestamp = par.attr('data');
			var id = par.parent().attr('id').replace('drinks-user-', '');
			var pid = par.attr('product');
			SendAjax("/php/removeDrink.php", {'Timestamp': timestamp, 'Action': 'unmark', 'ProductId': pid}, function(result){
				console.log(result);
				if(result['status'] == true){
					//par.find('.cancel-indicator').remove();
					//par.removeClass('highlighted');
					removeEntryFromCancel(timestamp);
					showDebt();
					editDrinkEntries();
					highlightDebt(id, timestamp, 'Stornoanfrage gelöscht');
				}
				else{
					highlightError(par, "Fehler!");
				}
			}, function(faildata){
				console.log(faildata);
				highlightError(par, "Fehler beim Senden!");
			});
		});
	}
	whitenIfDark();
}

function removeEntryFromCancel(timestamp){
	for(var k = 0; k < toCancel.length; k++){
		if(toCancel[k]['Timestamp'] == timestamp){
			toCancel.splice(k, 1);
			break;
		}
	}
}

function removeDrinkFromHistory(timestamp){
	for(var k = 0; k < drinksHistory.length; k++){
		if(drinksHistory[k]['Timestamp'] == timestamp){
			drinksHistory.splice(k, 1);
			break;
		}
	}
	$('#drinks-user-' + userid + '-debt').html(totalDebtFormatted(userid));
}

function formatRatio(rat){
	return parseFloat(rat).toFixed(2).replace('.', ',');
}

function formatCost(cost){
	return parseFloat(cost).toFixed(2).replace('.', ',') + "€";
}

function unformatCost(cost){
	return parseFloat(cost.replace(',', '.').replace('€', ''));
}