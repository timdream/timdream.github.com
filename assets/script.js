'use strict';

(function(){
  document.documentElement.className = 'js';

  var handleHash = window.onhashchange = function() {
    var hash = window.location.hash;

    // prevent scrolling by hide the element first and use replace()
    var sectionEls = document.querySelectorAll('body > section');
    var sectionToShow = hash.substr(1) || 'about';
    var elToShow;
    Array.prototype.forEach.call(sectionEls, function(el) {
      el.hidden = true;
      if (sectionToShow === el.id) {
        elToShow = el;
      }
    });
    if (hash) {
      window.location.replace(hash);
    }
    elToShow.hidden = false;
  }
  handleHash();

  document.querySelector('.contact a').addEventListener(
    'click',
    function contactClick(ev) {
      ev.preventDefault();
      window.open(this.href, '', 'width=480,height=360');
    }
  );

  if (navigator.doNotTrack !== '1') {
    document.body.classList.remove('hide-share');

    var scriptEl = document.createElement('script');
    scriptEl.src = 'https://apis.google.com/js/plusone.js';
    document.documentElement.firstElementChild.appendChild(scriptEl);

    var facebookLikeFrameEl = document.getElementById('facebook_like');
    facebookLikeFrameEl.src = facebookLikeFrameEl.dataset.src;
  }
})();
