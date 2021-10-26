$(document).ready(()=>{
    createLogo();
    generateArticles();
    generateSidebar();
    $('#title-text-text').html(userdata.title);
    $('#subtitle').html(userdata.subtitle);
    $('#language-toggle').html(userdata.lang);
    $('#language-toggle').click(e=>changeLanguage($(e.target)));
    $(window).scroll(e=>{
        scrolling(e);
    });
    $('#sidebar-toggle').click(e => $('#sidebar').toggleClass('active'));
    $('#text-container').click(e => $('#sidebar').removeClass('active'));
    $('#logo-container').click(e => $('#sidebar').removeClass('active'));
    $('#subtitle').click(e => $('#sidebar').removeClass('active'));
    $('.btn-2').click(e=>sendResponse(e));
    windowResize();
    updateButtons(userdata.status);
    $(window).resize(e=>windowResize());
    if(userdata.visited == true)
        $('body').animate({'scrollTop': $('#tldr').position().top - 50}, 500, 'swing');
});
let checkhidelogo = false;
function scrolling(e){
    let st = $(e.target).scrollTop();
    if(st > 300){
        SVG('#logo').opacity(0.4);
        $('#subtitle').css('opacity', 0.0);
        $('#status-info').css('opacity', 0.0);
        $('#logo-container').css('display', 'none');
        $('#subtitle').css('display', 'none');
    }
    else{
        SVG('#logo').opacity(1-(st/300));
        $('#subtitle').css('opacity', 1-(st/300));
        $('#status-info').css('opacity', 1-(st/300));
        $('#logo-container').css('display', '');
        $('#subtitle').css('display', '');
    }
    
    if(!checkhidelogo){
        setTimeout(()=>{
            checkhidelogo = true;
        }, 100);
        return;
    }
    checkhidelogo = false;
    let restop = 0;
    if($('#Antworten').position() != undefined) restop = $('#Antworten').position().top;
    if($('#Respond').position() != undefined) restop = $('#Respond').position().top;
    for(let art of $('.article-container')){
        if($(art).css('display') == 'none') continue;
        if($(art).position().top < st + 150){
            $('.sidebar-entry').removeClass('active');
            $('.sidebar-entry[data=' + $(art).attr('id') + ']').addClass('active');
        }
        /*
        if(($('#Antworten').css('display') != 'none' ||  $('#Respond').css('display') != 'none') && restop < st + 300){
            $('#logo-container').css('display', 'none');
            $('#subtitle').css('display', 'none');
        }
        else{
            $('#logo-container').css('display', '');
            $('#subtitle').css('display', '');
        }
        */
    }
    
}

function sendResponse(e){
    highlight($(e.target), '', '#b58f06', 500);
    let succ = 'Gemacht!';
    if(userdata.lang == "EN") succ = 'Done!';
    let fail = 'Fehler!';
    if(userdata.lang == "EN") fail = 'Error!';
    send({'response': $(e.target).attr('id')}, r=>{
        if(r.success) highlight($(e.target), succ, '#f8c92b', 1000);
        else highlight($(e.target), fail, 'darkred', 1000);
        userdata.status = r.status;
        updateButtons(r.status);
        generateSidebar();
        updateStatus(r.status, replacements);
    });  
}

function updateButtons(status){
    if(status == 'declined'){
        $('#decline').css({'display': 'none'});
        $('#accept').css({'width': '100%', 'display': ''});
    }
    if(status == 'accepted' || status == 'requeued'){
        $('#accept').css({'display': 'none'});
        $('#decline').css({'width': '100%', 'display': ''});
    }
    if(status == 'confirmed'){
        $('#Antworten').css({'display': 'none'});
        $('#Respond').css({'display': 'none'});
        //$('.sidebar-entry[data=Antworten]').css({'display': 'none'});
        //$('.sidebar-entry[data=Respond]').css({'display': 'none'});
    }
}

function updateStatus(status, dict){
    $('#Status .article-heading').html(replace('Status: {' + status + '} ', dict));
    $('#Status .article-text').html(replace('{' + status + 'v}', dict));
    if(userdata.status != "open")
        $('#status-info').html(replace('Status: {' + status + '} ', dict));
}

function send(data, after){
    data['id'] = userdata.id;
    console.log("sending: ");
    console.log(data);
    
    $.ajax({
        'url': '/php/partyresponse.php',
        'dataType': 'json',
        'data': data,
        'method': 'POST'
    }).done(e=>{
        console.log(e);
        if(after !== undefined) after(e);
    }).fail(e=>console.log(e));
    
}

function highlight(el, text, color, timeout){
	if($(el).attr('highlighted') == 'true') {
        setTimeout(()=>{
            highlight(el, text, color, timeout);
        }, timeout);
        return;
    }
	let temp_text = $(el).html();
	let temp_col = $(el).css('background');
	$(el).attr('highlighted', 'true');
	if(text != "")
		$(el).html(text);
	$(el).css('background', color);
	setTimeout(()=>{
		$(el).html(temp_text);
		$(el).css('background', temp_col);
		$(el).attr('highlighted', 'false');
	}, timeout);
}

function changeLanguage(t){
    if(t.html() == "DE") userdata.lang = "EN";
    if(t.html() == "EN") userdata.lang = "DE";
    $('#language-toggle').html(userdata.lang);
    send({'lang': userdata.lang});
    generateArticles();
    generateSidebar();
    updateButtons(userdata.status);
    $('.btn-2').click(e=>sendResponse(e));
}

function windowResize(){
    $('#language-toggle').css({'left': ($(document).width() - 50) + 'px'});
    generateSidebar();
}

function generateArticles(){
    $('#text-container').html('<div id="logo-placeholder"></div>');
    let salut = "Liebe";
    if(userdata.gender == "m") salut = "Lieber";
    let dict = replacements;
    dict['name'] = {"DE": userdata.name, "EN": userdata.name};
    dict['salut'] = {"DE": salut, "EN": "Dear"};
    for(let art of articles){
        if(art.lang != userdata.lang) continue;
        let article = replace(art.content, dict);
        $('#text-container').append('<div class="article-container" id="' + idfromtext(art.title) + '">'+
            '<div class="article-heading">' + art.title + '</div>'+
            '<div class="article-text">' + article + '</div>'+
            '</div>'
        );
    }
    $('#text-container').append('<div style="width: 100%; height: 100%;"></div>');
    $('.depart-btn').click(e=>{
        $('.depart-btn').removeClass('active');
        $(e.target).addClass('active');
    });
    $('.arrival-btn').click(e=>{
        $('.arrival-btn').removeClass('active');
        $(e.target).addClass('active');
    });
    updateStatus(userdata.status, dict);
}

function createLogo(){
    let strokewidth = 5;
    let strokecol = '#f8c92b';
    //let strokecol = '#b58f06';
    //let strokecol = 'white';
    let draw = SVG('#logo').addTo('#logo-container').size(300, 300);
    draw.polyline('150,5 150,295').stroke({'color': strokecol, 'width': strokewidth, 'linecap': 'round'});
    draw.polyline('75,45 75, 255').stroke({'color': strokecol, 'width': strokewidth, 'linecap': 'round'});
    draw.polyline('75,185 150, 185').stroke({'color': strokecol, 'width': strokewidth, 'linecap': 'round'});
    draw.polyline('150,45 225,115 150,185 225,255').stroke({'color': strokecol, 'width': strokewidth, 'linecap': 'round'}).fill('none');
    //draw.polyline('150,45 225,97.5 150,150 225,255').stroke('black').stroke({'width': 2}).fill('none');
}

function generateSidebar(){
    $('#sidebar').html('');
    let h = 0;
    for(let art of articles){
        if(art.lang != userdata.lang) continue;
        if(userdata.status == "confirmed" && (art.title == "Antworten" || art.title == "Respond")) continue;
        $('#sidebar').append('<div class="sidebar-entry" data="' + idfromtext(art.title) + '">' + art.title + '</div>');
        h += parseFloat($('.sidebar-entry[data=' + idfromtext(art.title) + ']')[0].clientHeight);
    }

    $('#sidebar').append('<div id="sidebar-bg"></div>');
    $('#sidebar-bg').css('height', h + 'px');
    $('#sidebar-bg').css('top', '-' + h + 'px');
    $('#sidebar').css('height', h + 'px');
    $('#sidebar').removeClass('active');
    $('.sidebar-entry').click(e=>{
        $('#sidebar').removeClass('active');
        $(e.target).addClass('active');
        let top = $('#' + $(e.target).attr('data')).position().top;
        $('body').animate({'scrollTop': top-100}, 400, 'swing');
    });
    //$('#sidebar').css({'left': '-' + $('#sidebar').width() + 'px'});
}

function replace(article, dict){
    if(userdata.lang == "DE")
        for(let k in dict)
            article = article.split('{' + k + '}').join(dict[k].DE);
    else if(userdata.lang == "EN")
        for(let k in dict)
            article = article.split('{' + k + '}').join(dict[k].EN);
    else throw "invalid language set";
    return article;
}

function idfromtext(text){
    return text.split(' ').join('').split(':').join('');
}