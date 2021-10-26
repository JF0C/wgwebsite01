function showShopping(subpage){
	$('#title-bar-center').html('Einkaufsliste');
	$('#title-bar-right').html('');
	$('#title-bar-left').html('');
	if(selectSubpage(subpage)) return;
	setPage(4);
	$('#main-frame').html('<div id="last-frequent"></div><div class="info-board">Einträge</div><div id="shopping-list-root"></div>');

	shoppingList.sort(function(l, r){
		if(parseInt(l['Entered']) > parseInt(r['Entered'])) return 1; 
		return -1;
	});
	for(var k = 0; k < shoppingList.length; k++){
		addShoppingEntry('shopping-list-root', shoppingList[k]);
	}
	$('.group-title').click(function(){
		var name = $(this).find('.shopping-entry-name').html();
		if($(this).hasClass('open')){
			$(this).removeClass('open');
			$(this).parent().find('.shopping-entry-details').slideUp(400, function(){ $(this).remove(); });
			$(this).find('.open-indicator').removeClass('flipped');
		}
		else{
			$('.group-title').removeClass('open');
			$(this).addClass('open');
			$('.shopping-entry-details').slideUp(400, function(){ $(this).remove(); });
			$('.group-title').not($(this)).find('.open-indicator').removeClass('flipped');
			$(this).parent().append('<div class="shopping-entry-details" style="display:none;">' +
				'<div id="check-shopping-entry" class="button3 pos"><img height="30px" src="/Icons/check.svg" /></div>' +
				'<div id="add-another-entry" class="button3 highlighted"><img height="30px" src="/Icons/plus.svg" /></div>' + 
				'<div id="reset-shopping-entry" class="button3 button3end neg"><img height="30px" src="/Icons/plus.svg" style="transform:rotate(45deg);" /></div> ' +
			'</div>');
			$('.shopping-entry-details').slideDown();
			$(this).find('.open-indicator').addClass('flipped');
			$('#check-shopping-entry').click(removeShoppingEntrySendHandler);
			$('#add-another-entry').click(addShoppingEntrySendHandler);
			$('#reset-shopping-entry').click(resetShoppingEntrySendHandler);
		}
	});

	$('#shopping-list-root').append('<div class="list-element">' +
		'<input id="new-shopping-entry" type="text" placeholder="Neuer Eintrag" />' +
		'</div>');
	$('#new-shopping-entry').keyup(function(e){
		let val = $('#new-shopping-entry').val();
		if(e.key == "Enter") {addShoppingEntrySendHandler(val); return;}
		let suggestions = $('.shopping-suggestion');
		if(val == ""){
			suggestions.slideUp();
			return;
		}
		for(s of suggestions){
			if($(s).html().toLowerCase().includes(val.toLowerCase())){
				$(s).slideDown();
			}
			else{
				$(s).slideUp();
			}
		}
	});
	$('#shopping-list-root').append('<div id="shopping-suggestions"></div>');
	for(let s of shoppingList){
		$('#shopping-suggestions').append('<div class="list-element shopping-suggestion hidden">' + s['Name'].replace("_", " ") + '</div>');
	}
	$('.shopping-suggestion').click(e =>{
		var t = $(e.target);
		addShoppingEntrySendHandler(t.html());
	});

	$('#last-frequent').append('<div class="list-element" id="last-entries">Zuletzt eingetragen' +
		'<div style="float:right;"><img src="Icons/chevron-right.svg" class="chevron" /></div>' +
		'</div>');
	$('#last-frequent').append('<div class="list-element" id="frequent-entries">Häufigste Einkäufe' +
		'<div style="float:right;"><img src="Icons/chevron-right.svg" class="chevron" /></div>' +
		'</div>');
	$('#last-entries').click(() => showLastShoppingEntries('time'));
	$('#frequent-entries').click(() => showLastShoppingEntries('frequency'));
	whitenIfDark();
}

function selectSubpage(subpage){
	switch(subpage){
		case 0: return false;
		case 1: showLastShoppingEntries('time'); return true;
		case 2: showLastShoppingEntries('frequency'); return true;
	}
}

function resetShoppingEntrySendHandler(){
	var name = $(this).parent().parent().find('.shopping-entry-name').html();
	name = name.replace(' ', '_');
	SendAjax('/php/enterShopping.php', {'Name': name, 'Mode': 'reset'}, function(result){
		console.log(result);
		if(result['status']){		
			var data = result['data'];				
			for(var k = 0; k < shoppingList.length; k++){
				if(shoppingList[k]['Name'] == data['Name']){
					shoppingList[k]['Entered'] = data['Entered'];
					shoppingList[k]['Recurred'] = data['Recurred'];
					shoppingList[k]['Open'] = data['Open'];
				}
			}
			$('#' + name).slideUp(400, function(){ $(this).remove(); });
			updateBadge(4);
		}
		else{
			highlightError($('#' + name).find('.group-title'), 'Fehler!');
		}
	}, function(faildata){
		console.log(faildata);
		highlightError($('#' + name).find('.group-title'), 'Fehler beim Senden');
	});
}

function showLastShoppingEntries(sorting){
	$('#main-frame').html('');
	addBackNavigator(showShopping);
	$('#title-bar-right').html('');
	var lastEntries = [];
	var infofunction = null;

	for(var k = 0; k < shoppingList.length; k++){
		var s = shoppingList[k];
		//if(s['Open'] > 0) continue;
		lastEntries.push(s);
	}

	if(sorting == 'time'){
		setPage('4.1');
		lastEntries.sort(function(l, r){
			if(l['Entered'] > r['Entered']) return -1;
			return 1;
		});
		infofunction = function(e){ return millis2date(e['Entered']).split(' ')[0]; };
	}
	if(sorting == 'frequency'){
		setPage('4.2');
		lastEntries.sort(function(l, r){
			if(l['Recurred'] > r['Recurred']) return -1;
			return 1;
		});
		infofunction = function(e){ return e['Recurred']};
	}
	
	for(var k = 0; k < lastEntries.length; k++){
		var e = lastEntries[k];
		$('#main-frame').append('<div class="list-element">' +
			'<div class="group-title group-title-wide"><div class="name-container" style="display:inline;">' + e['Name'].replace("_", " ") + '</div><img class="open-indicator" src="/Icons/chevron-down.svg"><div style="float: right;">' + infofunction(e) + '</div></div>' +
			'</div>');
	}
	$('.group-title').click(function(){
		if($(this).hasClass('open')){
			$(this).removeClass('open');
			$(this).find('.open-indicator').removeClass('flipped');
			$(this).parent().find('.add-button-container').slideUp(400, function(){ $(this).remove(); });
		}
		else{
			$('.group-title').removeClass('open');
			$(this).addClass('open');
			$('.add-button-container').slideUp(400, function(){ $(this).remove(); });
			$('.group-title').not($(this)).find('.open-indicator').removeClass('flipped');
			$(this).find('.open-indicator').addClass('flipped');
			$(this).parent().append('<div class="add-button-container" style="display:none;">' +
					'<div id="add-button" class="button pos"><img src="/Icons/plus.svg" height="30px"/></div>' +
					'<div id="remove-button" class="button neg" style="margin-left: 4%;"><img src="/Icons/plus.svg" height="30px" style="transform:rotate(45deg)" /></div>' +
				'</div>');

			$('.add-button-container').slideDown();
			$('#add-button').click(() => addShoppingEntrySendHandler($(this).parent().find('.name-container').html()));
			$('#remove-button').click(deleteShoppingEntrySendHandler);
		}
	});
	whitenIfDark();
}

function deleteShoppingEntrySendHandler(){
	var that = $(this).parent().parent();
	var name = that.find('.name-container').html();
	name = name.replace(' ', '_');
	SendAjax('/php/enterShopping.php', {'Name': name, 'Mode': 'remove'}, function(result){
		console.log(result);
		if(result['status']){
			var data = result['data'];				
			for(var k = 0; k < shoppingList.length; k++){
				if(shoppingList[k]['Name'] == name){
					shoppingList.splice(k, 1);
					break;
				}
			}
			that.slideUp(400, function(){ $(this).remove(); });
			updateBadge(4);
		}
		else{
			highlightError(that.find('.group-title'), 'Fehler!');
		}
	}, function(faildata){
		console.log(faildata);
		highlightError(that.find('.group-title'), 'Fehler beim Senden');
	});
}

function removeShoppingEntrySendHandler(){
	var name = $(this).parent().parent().find('.shopping-entry-name').html();
	name = name.replace(' ', '_');
	SendAjax('/php/enterShopping.php', {'Name': name, 'Mode': 'check'}, function(result){
		console.log(result);
		if(result['status']){		
			var data = result['data'];				
			for(var k = 0; k < shoppingList.length; k++){
				if(shoppingList[k]['Name'] == data['Name']){
					shoppingList[k]['Entered'] = data['Entered'];
					shoppingList[k]['Recurred'] = data['Recurred'];
					shoppingList[k]['Open'] = data['Open'];
				}
			}
			if(data['Open'] == 0) {
				$('#' + name).slideUp(400, function(){ $(this).remove(); });
			}
			else{
				$('#' + name).find('.shopping-entry-open').html(formatQty(data['Open']));
				highlightSuccess($('#' + name).find('.group-title'), '1 x Eingekauft!');
			}
			updateBadge(4);
		}
		else{
			if(result['error'] == 'already done') highlightError($('#' + name).find('.group-title'), 'Bereits erledigt!');
			highlightError($('#' + name).find('.group-title'), 'Fehler!');
		}
	}, function(faildata){
		console.log(faildata);
		highlightError($('#' + name).find('.group-title'), 'Fehler beim Senden');
	});
}

function addShoppingEntrySendHandler(name=null){
	if(name == null || typeof name != "string") var name = $(this).parent().parent().find('.shopping-entry-name').html();
	name = name.replace(' ', '_');
	SendAjax('/php/enterShopping.php', {'Name': name, 'Mode': 'add'}, function(result){
		console.log(result);
		if(result['status']){
			var data = result['data'];
			var found = false;			
			for(var k = 0; k < shoppingList.length; k++){
				if(shoppingList[k]['Name'] == data['Name']){
					shoppingList[k]['Entered'] = data['Entered'];
					shoppingList[k]['Recurred'] = data['Recurred'];
					shoppingList[k]['Open'] = data['Open'];
					found = true;
				}
			}
			if(!found){
				shoppingList.push(data);
			}
			showShopping();
			highlightSuccess($('#' + name).find('.group-title'), 'Hinzugefügt!');
			updateBadge(4);
		}
		else{
			highlightError($('#' + name).find('.group-title'), 'Fehler!');
		}
	}, function(faildata){
		console.log(faildata);
		highlightError($('#' + name).find('.group-title'), 'Fehler beim Senden');
	});
	whitenIfDark();
}

function addShoppingEntry(parid, obj){
	if(obj['Open'] < 1) return;
	$('#' + parid).append('<div class="list-element shopping-entry" id="' + obj['Name'] + '">' +
		'<div class="group-title group-title-wide">' +
			'<div class="shopping-entry-open">' + formatQty(obj['Open']) + '</div>' +
			'<div class="shopping-entry-name">' + obj['Name'].replace('_', ' ') + '</div>' +
			'<img class="open-indicator" src="Icons/chevron-down.svg" />' +
		'</div></div>');
	whitenIfDark();
}

function formatQty(n){
	return n + ' x ';
}