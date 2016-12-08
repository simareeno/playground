$(document).ready(function(){
	var pattern1 = $('#pattern1')
	var line = $('.line');
	var tl = new TimelineMax({repeat:1, yoyo:true});

	tl.fromTo(line, 3, {drawSVG:0}, {drawSVG:"102%"}, "-=1");

	TweenLite.render();
});
