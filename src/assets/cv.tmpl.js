'use strict';

//%common.inc.js%

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
        window.history.replaceState(
          { password: password }, document.title, './');
      }
    }

    if (window.history.state && window.history.state.password) {
      this.cipherUI.decrypt(window.history.state.password);
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
      worker = this.worker = new Worker('/assets/webcrypto-decipher.min.js?_=%hash-webcrypto-decipher.min.js%');
      this.decipherName = 'Web Crypto Decipher';
    } else {
      worker = this.worker = new Worker('/assets/asmcrypto-decipher.min.js?_=%hash-asmcrypto-decipher.min.js%');
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
