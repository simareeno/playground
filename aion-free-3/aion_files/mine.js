$(function () {

	$('.bUIRadiobutton__eLabel').click(function () {
		$('.bUIRadiobutton__eLabel').removeClass('bUIRadiobutton__mChecked');
		$(this).addClass('bUIRadiobutton__mChecked');
	})

	$('.bUISelect').click(function () {
		$(this).toggleClass('bUISelect__mEvent_openBottom');
	})

	$('.bUISelect__eItem').click(function () {
		var choosed = $(this).text();
		$('.currentSelect').text(choosed);
		checkIfPlaceholder(choosed);
		checkIfChoosed(choosed);
	})

})

function checkIfPlaceholder(text) {
	if (text == 'Выбери персонажа') {
		$('.currentSelect').addClass('currentSelect_placeholder')
	} else {
		$('.currentSelect').removeClass('currentSelect_placeholder')
	}
}

function checkIfChoosed(text) {
	if (text == 'Выбери персонажа') {
		$('.bUIButton_buy').addClass('bUIButton__mState_disabled')
	} else {
		$('.bUIButton_buy').removeClass('bUIButton__mState_disabled')
	}
}
