var value;

$(function () {
	$('.myradio').change(function (e) {
		value = this.value;

		$('.mystate').removeClass('mystate_active')

		if (value == 'new1old0') {
			$('.new1old0').addClass('mystate_active');
		} else if (value == 'new1old1') {
			$('.new1old1').addClass('mystate_active');
		} else if (value == 'new0old0') {
			$('.new0old0').addClass('mystate_active');
		} else if (value == 'new0old1') {
			$('.new0old1').addClass('mystate_active');
		} else if (value == 'new05old0') {
			$('.new05old0').addClass('mystate_active');
		} else if (value == 'new05old1') {
			$('.new05old1').addClass('mystate_active');
		} else {
			$('.newbie').addClass('mystate_active');
		}
	})
})
