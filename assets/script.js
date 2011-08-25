jQuery(function ($) {
	$('#contact a').bind(
		'click',
		function (ev) {
			ev.preventDefault();
			window.open(this.href, '', 'width=600,height=400');
		}
	);
});