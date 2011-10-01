jQuery(function ($) {

	function handleHash (hash) {
		$('body > section').hide();
		window.location.hash = hash;
		$(hash).show();
	}

	$('.contact a').bind(
		'click',
		function (ev) {
			ev.preventDefault();
			window.open(this.href, '', 'width=480,height=360');
		}
	);
	$('nav a').bind(
		'click',
		function (ev) {
			handleHash($(this).attr('href')); // not using this.hash
			ev.preventDefault();
		}
	);
	if (window.location.hash) {
		handleHash(window.location.hash);
	} else {
		handleHash('#about');
	}
});