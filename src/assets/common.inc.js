document.documentElement.classList.remove('no-js');

if (window.location.hostname === 'timdream.org' &&
    window.doNotTrack !== '1' && navigator.doNotTrack !== '1') {
  var _gaq = _gaq || [];
  _gaq.push(['_setAccount', 'UA-4623408-2']);
  _gaq.push(['_trackPageview']);

  (function() {
    var ga = document.createElement('script'); ga.type = 'text/javascript'; ga.async = true;
    ga.src = 'https://ssl.google-analytics.com/ga.js';
    var s = document.getElementsByTagName('script')[0]; s.parentNode.insertBefore(ga, s);
  })();
}

function ServiceWorkerController() {
}
ServiceWorkerController.prototype = {
  state: 'notstarted',
  start: function() {
    if (! ('serviceWorker' in navigator)) {
      this.state = 'notsupported';
      return;
    }

    this.install();
  },
  install: function() {
    this.state = 'installing';

    navigator.serviceWorker
      .register('/service-worker.min.js', {scope: '/'})
      .then(function(swReg) {
        this.swReg = swReg;
        if (swReg.active) {
          this.state = 'installed';
          return;
        }
        var worker = swReg.installing;
        worker.addEventListener('statechange', function() {
          if (worker.state == 'redundant') {
            this.state = 'uninstalled';
          }
          if (worker.state == 'installed') {
            this.state = 'installed';
          }
        }.bind(this));
      }.bind(this))
      .catch(function(error) {
        console.error(error);
        this.state = 'uninstalled';
      }.bind(this));
  },
  remove: function() {
    this.state = 'removing';
    this.swReg.unregister()
      .then(function(unregistered) {
        if (unregistered) {
          this.state = 'uninstalled';
          this.swReg = null;
        } else {
          this.state = 'installed';
        }
      }.bind(this));
  }
};

window.swController = new ServiceWorkerController();
window.swController.start();
