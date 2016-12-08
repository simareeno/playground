var fullPanWidth = 400;

$(function() {

	$('.duck--utochka').on('click', goUtochka)

	$('.duck--czar').on('click', goCzar)

	setTimeout(function () {
		$('.prizes__list--utochka').removeClass('prizes__list--active')
	}, 200)

	var prizeList = document.getElementById('ducks');
	var hammertime = new Hammer(prizeList);

	hammertime.on("panright", function(ev) {
		goUtochka();
	});

	hammertime.on("panleft", function(ev) {
		goCzar();
	});
});

function goUtochka() {
	$('.slider').removeClass('slider--state-czar').addClass('slider--state-utochka');
}

function goCzar() {
	$('.slider').removeClass('slider--state-utochka').addClass('slider--state-czar');
}
