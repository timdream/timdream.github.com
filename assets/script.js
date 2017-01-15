'use strict';

(function(){
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

  document.querySelector('.make').addEventListener(
    'dblclick',
    function makeDblclick(ev) {
      this.removeEventListener('dblclick', makeDblclick);
      ev.preventDefault();
      this.setAttribute('contenteditable', true);
      this.focus();
    }
  );

  var scriptEl = document.createElement('script');
  scriptEl.src = 'https://apis.google.com/js/plusone.js';
  document.documentElement.firstElementChild.appendChild(scriptEl);
})();

/* AppCacheUI: https://github.com/timdream/appcacheui */
(function(){var e={init:function(){var a=document,b=a.body,c=window.applicationCache;if(c)if(b){this.info=a.getElementById("appcache_info");if(!this.info){a.cE=a.createElement;var d=a.cE("a"),a=a.cE("div");a.id="appcache_info";d.href="";a.appendChild(d);b.firstChild&&b.insertBefore(a,b.firstChild);this.info=a}"checking,downloading,progress,noupdate,cached,updateready,obsolete,error".split(",").forEach(function(a){c.addEventListener(a,e)})}else console.log("Premature init. Put the <script> in <body>.")},
handleEvent:function(a){this.info.className=this.info.className.replace(/ ?appcache\-.+\b/g,"")+" appcache-"+a.type;"progress"===a.type&&a.total&&this.info.setAttribute("data-progress",a.loaded+1+"/"+a.total)}};e.init()})();
