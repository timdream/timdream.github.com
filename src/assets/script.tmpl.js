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
    areaEl.addEventListener('touchstart', this);
    areaEl.addEventListener('touchmove', this);
    areaEl.addEventListener('touchend', this);
    areaEl.addEventListener('mousemove', this);
    areaEl.addEventListener('mouseleave', this);
    areaEl.classList.add('motion');
  },

  handleEvent: function(evt) {
    switch (evt.type) {
      case 'touchstart':
        // Disregard emulated mouse events
        this.areaEl.removeEventListener('mousemove', this);
        this.areaEl.removeEventListener('mouseleave', this);
      break;

      case 'touchmove':
      case 'mousemove':
        var x = 2 * ('offsetX' in evt ?
          this.MAX_DEG_MOUSE * ((evt.offsetX - 150) / 300) :
          this.MAX_DEG_TOUCH *
            (evt.touches[0].clientX - window.innerWidth / 2) / window.innerWidth);
        var y = -2 * ('offsetY' in evt ?
          this.MAX_DEG_MOUSE * ((evt.offsetY - 150) / 300) :
          this.MAX_DEG_TOUCH *
            (evt.touches[0].clientY - window.innerHeight / 2) / window.innerHeight);
        this.updateAngle(function() {
          this.areaEl.classList.add('active');
          var styleStr = 'perspective(500px) '
            + 'rotateX(' + y + 'deg) rotateY(' + x + 'deg)';
          this.foregroundEl.style.transform = styleStr + ' translateZ(60px)';
          this.sceneEl.style.transform = styleStr + ' translateZ(-10px)';
        }.bind(this));
        break;
      case 'mouseleave':
      case 'touchend':
        this.updateAngle(function() {
          this.areaEl.classList.remove('active');
          this.foregroundEl.style.transform = '';
          this.sceneEl.style.transform = '';
        }.bind(this));
        break;
    }
  },

  updateAngle: function(callback) {
    (window.cancelAnimationFrame || window.clearTimeout)(this.reqId);
    this.reqId = (window.requestAnimationFrame || window.setTimeout)(callback);
  }
};

window.picMotion = new PicMotion();
window.picMotion.start();
