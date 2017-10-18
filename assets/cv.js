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

function CVApp() {
}

CVApp.prototype = {
  start: function() {
    document.getElementById('print').addEventListener('click', this);
    document.getElementById('unlock').addEventListener('click', this);

    this.cipherUI = new CVCipherUI();
    this.cipherUI.start();

    if (document.location.hash.substr(1)) {
      var base64password = (document.location.hash.match(/p=(\w+)/) || [])[1];
      if (base64password) {
        var password = atob(base64password);
        this.cipherUI.decrypt(password);
      }
    }
  },

  handleEvent: function(evt) {
    evt.preventDefault();
    switch (evt.target.id) {
      case 'print':
        window.print();
        break;
      case 'unlock':
        this.cipherUI.toggleDialog();
        break;
    }
  }
};

function CVCipherUI() {
  this.state = 'undecrypted';
}

CVCipherUI.prototype = {
  start: function() {
    var formEl = this.formEl = document.getElementById('unlock-form');
    formEl.hidden = false;
    formEl.addEventListener('submit', this);
    formEl.addEventListener('reset', this);
    formEl.addEventListener('transitionend', this);

    this.passwordEl = document.getElementById('unlock-password');
  },

  toggleDialog: function() {
    if (this.state !== 'undecrypted') {
      return;
    }

    document.body.classList.toggle('unlock-dialog');
  },

  handleEvent: function(evt) {
    if (this.state !== 'undecrypted') {
      return;
    }
    switch (evt.type) {
      case 'transitionend':
        this.passwordEl.focus();
        break;
      case 'submit':
        this.decrypt();
        document.body.classList.remove('unlock-dialog');
        evt.preventDefault();
        break;
      case 'reset':
        document.body.classList.remove('unlock-dialog');
        break;
    }
  },

  decrypt: function(password) {
    this.state = 'decrypting';
    document.body.classList.add('decrypting');
    if (!password) {
      password = document.getElementById('unlock-password').value;
      document.getElementById('unlock-password').value = '';
    }
    var decipher = new CVDecipher();
    decipher.onloadend = this.decipherLoadEnd.bind(this);
    decipher.load(password);
  },

  decipherLoadEnd: function(msg) {
    document.body.classList.remove('decrypting');
    switch (msg.type) {
      case 'error':
        alert('Sorry, there were some problem decrypting the information. ' +
              'Please try a different device?\n\n' +
              'Error: ' + msg.message + '\n' +
              'Decipher type: ' + msg.decipherName);
        this.state = 'undecrypted';
        break;
      case 'result':
        if (msg.data.error) {
          alert(msg.data.error);
          this.state = 'undecrypted';
          break;
        }

        var blob = msg.data.privatePDFBlob;
        var url = window.URL.createObjectURL(blob);
        document.getElementById('download-private').href = url;

        msg.data.domModifications.forEach(function(step) {
          document.getElementById(step.id)[step.prop] = step.value;
        });

        this.state = 'decrypted';
        document.body.classList.add('decrypted');
        break;
    }
  }
};

function CVDecipher() {
}

CVDecipher.prototype = {
  useWebCrypto: !!(window.crypto &&
                   window.crypto.subtle &&
                   window.crypto.subtle.deriveKey),
  onloadend: null,
  load: function(password) {
    var worker;
    if (this.useWebCrypto) {
      worker = this.worker = new Worker('/assets/webcrypto-decipher.min.js?_=21d2cc');
      this.decipherName = 'Web Crypto Decipher';
    } else {
      worker = this.worker = new Worker('/assets/asmcrypto-decipher.min.js?_=b60414');
      this.decipherName = 'asmCrypto Decipher';
    }
    worker.postMessage({ password: password });
    worker.addEventListener('message', this);
    worker.addEventListener('error', this);
  },
  handleEvent: function(evt) {
    if (evt.type === 'error' || evt.data.type === 'error') {
      this.onloadend({ type: 'error',
                       message: evt.data ? evt.data.message : evt.message,
                       decipherName: this.decipherName });
      this.worker.terminate();
      return;
    }

    this.onloadend({ type: 'result', data: evt.data });
  }
};

var app = new CVApp();
app.start();
