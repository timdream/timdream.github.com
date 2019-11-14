'use strict';

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
  start: function() {
    if (! ('serviceWorker' in navigator)) {
      this.state = 'notsupported';
      return;
    }

    this.check()
      .then(function() {
        if (!this.swReg || (!this.swReg.installing &&
                            !this.swReg.waiting &&
                            !this.swReg.active)) {
          return this.install();
        } else if (this.swReg.active) {
          // Update will fail on offline; disregard.
          return this.swReg.update();
        }
      }.bind(this))
      .then(function() {
        this.swReg.addEventListener('updatefound', this);
        this.showUpdateProgress();
      }.bind(this))
      .catch(function(error) {
        console.log(error);
      }.bind(this));
  },
  check: function() {
    return navigator.serviceWorker
      .getRegistration('/')
      .then(function(swReg) {
        this.swReg = swReg;
      }.bind(this));
  },
  install: function() {
    return navigator.serviceWorker
      .register('/service-worker.min.js', {scope: '/'})
      .then(function(swReg) {
        this.swReg = swReg;
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
  },
  showUpdateProgress: function() {
    // No UI to show if there isn't anything being installed,
    // or if this page is newly installed or bypasses service worker.
    if (!this.swReg.installing ||
        !navigator.serviceWorker.controller) {
      return;
    }
    document.documentElement.classList.add('updating');
    this.swReg.installing.addEventListener('statechange', this);
  },
  handleEvent: function(evt) {
    switch (evt.type) {
      case 'updatefound':
        this.showUpdateProgress();
        break;
      case 'statechange':
        evt.target.removeEventListener('statechange', this);
        if (evt.target.state === 'redundant') {
          // Install failed, hide UI and exit.
          document.documentElement.classList.remove('updating');
          return;
        }
        // page is not current, should reload
        window.location.reload();
        break;
    }
  }
};

window.swController = new ServiceWorkerController();
window.swController.start();

window.addEventListener('pagehide', function() {
  document.body.classList.add('pagehide') });
window.addEventListener('pageshow', function() {
  document.body.classList.remove('pagehide') });

function PicMotion() {
}

PicMotion.prototype = {
  MAX_DEG_MOUSE: 20,
  MAX_DEG_TOUCH: 10,

  SCENE_Z_DIST: 30,
  FOREGROUND_Z_DIST: -10,

  start: function() {
    var areaEl = this.areaEl = document.getElementById('motion-pic');
    if (!areaEl) {
      return;
    }

    var foregroundEl = this.foregroundEl = document.createElement('img');
    foregroundEl.className = 'pic-foreground';
    foregroundEl.src = '/assets/reading-signpost-in-paris-foreground.png?_=42be09';

    var sceneEl = this.sceneEl = document.createElement('img');
    sceneEl.className = 'pic-scene';
    sceneEl.src = '/assets/reading-signpost-in-paris-scene.jpg?_=39d0e9';

    areaEl.insertBefore(foregroundEl, areaEl.firstChild);
    areaEl.insertBefore(sceneEl, areaEl.firstChild);
    areaEl.addEventListener('touchstart', this, { passive: true });
    areaEl.addEventListener('touchmove', this, { passive: true });
    areaEl.addEventListener('touchend', this, { passive: true });
    areaEl.addEventListener('touchcancel', this, { passive: true });
    areaEl.addEventListener('mousemove', this, { passive: true });
    areaEl.addEventListener('mouseleave', this, { passive: true });
    areaEl.classList.add('motion');
  },

  handleEvent: function(evt) {
    switch (evt.type) {
      case 'touchstart':
        // Disregard emulated mouse events
        this.areaEl.removeEventListener('mousemove', this, { passive: true });
        this.areaEl.removeEventListener('mouseleave', this, { passive: true });
        break;

      case 'touchmove':
        // Considering the touch also scrolls the page,
        // the motion is derived from the position of the finger on the viewport,
        // as the vertical position of the finger will likely stay the same.
        var x = 2 * this.MAX_DEG_TOUCH *
          (evt.touches[0].clientX - window.innerWidth / 2) / window.innerWidth;
        var y = -2 * this.MAX_DEG_TOUCH *
          (evt.touches[0].clientY - window.innerHeight / 2) / window.innerHeight;
        this.scheduleMotionUpdate(x, y);
        break;

      case 'mousemove':
        // The motion is based on the position of the cursor on the picture.
        var x = 2 * this.MAX_DEG_MOUSE * ((evt.offsetX - 150) / 300);
        var y = -2 * this.MAX_DEG_MOUSE * ((evt.offsetY - 150) / 300);
        this.scheduleMotionUpdate(x, y);
        break;

      case 'mouseleave':
      case 'touchend':
      case 'touchcancel':
        this.scheduleMotionEnd();
        break;
    }
  },

  scheduleMotionUpdate: function(x, y) {
    this.scheduleStyleChange(function() {
      this.areaEl.classList.add('active');
      var styleStr = 'rotateX(' + y + 'deg) rotateY(' + x + 'deg)';
      this.foregroundEl.style.transform =
        styleStr + ' translateZ(' + this.SCENE_Z_DIST + 'px)';
      this.sceneEl.style.transform =
        styleStr + ' translateZ(' + this.FOREGROUND_Z_DIST + 'px)';
    }.bind(this));
  },

  scheduleMotionEnd() {
    this.scheduleStyleChange(function() {
      this.areaEl.classList.remove('active');
      this.foregroundEl.style.transform = '';
      this.sceneEl.style.transform = '';
    }.bind(this));
  },

  scheduleStyleChange: function(callback) {
    (window.cancelAnimationFrame || window.clearTimeout)(this.reqId);
    this.reqId = (window.requestAnimationFrame || window.setTimeout)(callback);
  }
};

window.picMotion = new PicMotion();
window.picMotion.start();
