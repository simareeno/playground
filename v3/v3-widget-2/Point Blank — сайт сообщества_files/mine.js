// $(function () {
//
// 	$('#do').change(function(event) {
// 		if ($(this).is (':checked'))
// 			{
// 				$('.linky').removeClass('linky--hidden');
// 				$('.bUIButton__eLabel span').text('Установить');
// 				$('.bGamePanelCommon__eTitleName').text('Point Blank [PTS2]');
// 			}
// 	});
//
// 	$('#dont').change(function(event) {
// 		if ($(this).is (':checked'))
// 			{
// 				$('.linky').addClass('linky--hidden');
// 				$('.bUIButton__eLabel span').text('Играть');
// 				$('.bGamePanelCommon__eTitleName').text('Point Blank');
// 			}
// 	});
//
// })


$(function () {

	$('.choice-single').click(function () {
		$('.choice-single').removeClass('choice-active');
		$(this).addClass('choice-active');

		if ($(this).hasClass('choice-yes')) {
			$('.linky').removeClass('linky--hidden');
			$('.bUIButton__eLabel span').text('Установить');
			$('.bGamePanelCommon__eTitleName').text('Point Blank [PTS2]');
		} else {
			$('.linky').addClass('linky--hidden');
			$('.bUIButton__eLabel span').text('Играть');
			$('.bGamePanelCommon__eTitleName').text('Point Blank');
		}
	})

})
