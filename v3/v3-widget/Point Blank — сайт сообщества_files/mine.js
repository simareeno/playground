$(function () {

	$('#do').change(function(event) {
		if ($(this).is (':checked'))
			{
				$('.linky').removeClass('linky--hidden');
				$('.bUIButton__eLabel span').text('Установить');
				$('.bGamePanelCommon__eTitleName').text('Point Blank [PTS2]');
			}
	});

	$('#dont').change(function(event) {
		if ($(this).is (':checked'))
			{
				$('.linky').addClass('linky--hidden');
				$('.bUIButton__eLabel span').text('Играть');
				$('.bGamePanelCommon__eTitleName').text('Point Blank');
			}
	});

})

// console.log('rdy');
