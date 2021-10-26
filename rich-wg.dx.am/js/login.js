$(document).ready(function(){
  scale_all();

});

$(window).resize(function(){
	scale_all();
});

function scale_all(){
  let h = $(document).height();
  let w = $(document).width();
  
  $('.header').css({'line-height': 0.1*h + 'px'});
  $('input').css({'width': (w-24) + 'px'});
  $('input[type=submit]').css({'width': (w-10) + 'px'});
}