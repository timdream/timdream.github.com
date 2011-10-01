jQuery(function ($) {

	function handleHash () {
		var hash = window.location.hash || '#about';

		// prevent scrolling by hide the element first and use replace()
		$('body > section').hide();
		window.location.replace(hash); 
		$(hash).show();
	}

	$('.contact a').bind(
		'click',
		function (ev) {
			ev.preventDefault();
			window.open(this.href, '', 'width=480,height=360');
		}
	);

	$('.make').one(
		'dblclick',
		function (ev) {
			ev.preventDefault();
			$(this).attr('contenteditable', true).focus();
		}
	);

	if ('onhashchange' in window) {
		window.onhashchange = handleHash;
	} else {
		// no crappy iframe of IE6/7, just make sure $('a') links works
		$('a').live(
			'click',
			function () {
				if (ev.which == 2 || ev.metaKey) return true;

				var $this = $(this);

				if ($this.attr('href').substr(0,1) === '#') {
					window.location.replace($this.attr('href'));
					handleHash();
				}
			}
		);
	}
	handleHash();

	window.applicationCache.addEventListener(
		'updateready',
		function () {
			// window.applicationCache.swapCache(); // hard
			window.location.reload(); // easier
		}
	);
});