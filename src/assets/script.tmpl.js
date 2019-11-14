'use strict';

//%common.inc.js%

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
    foregroundEl.src = '/assets/reading-signpost-in-paris-foreground.png';

    var sceneEl = this.sceneEl = document.createElement('img');
    sceneEl.className = 'pic-scene';
    sceneEl.src = '/assets/reading-signpost-in-paris-scene.jpg';

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
