
jQuery(function ($) {

  var reloadOnNextHashChange = false;

  function handleHash () {
    var hash = window.location.hash;

    // prevent scrolling by hide the element first and use replace()
    $('body > section').hide();
    if (hash) window.location.replace(hash);
    $(hash || '#about').show();
    if (reloadOnNextHashChange) window.location.reload();
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

  $.getScript('https://apis.google.com/js/plusone.js');

  if (window.applicationCache) {
    window.applicationCache.addEventListener(
      'error', // can't get manifest file - currently offline
      function () {
        $('html').addClass('applicationcache-offline');
      }
    );
  }

});

/* AppCacheUI: https://github.com/timdream/appcacheui */
(function(){var e={init:function(){var a=document,b=a.body,c=window.applicationCache;if(c)if(b){this.info=a.getElementById("appcache_info");if(!this.info){a.cE=a.createElement;var d=a.cE("a"),a=a.cE("div");a.id="appcache_info";d.href="";a.appendChild(d);b.firstChild&&b.insertBefore(a,b.firstChild);this.info=a}"checking,downloading,progress,noupdate,cached,updateready,obsolete,error".split(",").forEach(function(a){c.addEventListener(a,e)})}else console.log("Premature init. Put the <script> in <body>.")},
handleEvent:function(a){this.info.className=this.info.className.replace(/ ?appcache\-.+\b/g,"")+" appcache-"+a.type;"progress"===a.type&&a.total&&this.info.setAttribute("data-progress",a.loaded+1+"/"+a.total)}};e.init()})();
