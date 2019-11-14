'use strict';

function getKey(password) {
  return self.crypto.subtle.importKey('raw', strToArray(password),
      {name: 'PBKDF2'}, false, ['deriveKey'])
    .then(function(masterKey) {
      return self.crypto.subtle.deriveKey(
        { 'name': 'PBKDF2', 'salt': saltArr,
          'iterations': 500, 'hash': 'SHA-256' },
        masterKey,
        { "name": 'AES-CBC', "length": 256 },
        false,
        ['decrypt' ])
    })
    .then(function(key) {
      return Promise.all([key, decipher(key, testEncryptedData)]);
    })
    .then(function(values) {
      if (arrayToStr(new Uint8Array(values[1])) !== testEncryptedPlainText) {
        return;
      }

      return values[0];
    })
    .catch(function(e) {
      console.error(e);
      return;
    });
}

function decipher(key, encryptedArr) {
  return self.crypto.subtle.decrypt(
    { "name": 'AES-CBC', iv: ivArr }, key, encryptedArr);
}

function hexToArray(str) {
  var hex = new Uint8Array(str.length / 2);
  for (var i = 0; i < str.length; i += 2) {
    hex[i / 2] = parseInt(str.charAt(i) + str.charAt(i + 1), 16);
  }

  return hex;
}

function strToArray(str) {
  return Uint8Array.from(
    unescape(encodeURIComponent(str))
      .split('').map(function(ch) { return ch.charCodeAt(0); }));
}

function arrayToStr(arr) {
  return decodeURIComponent(
    escape(
      Array.prototype.map.call(arr, function (i) { return String.fromCharCode(i); }).join('')));
}

function getFile(filename) {
  var xhr = new XMLHttpRequest();
  xhr.responseType = 'arraybuffer';
  xhr.open('GET', filename);
  xhr.send(null);
  return new Promise(function(resolve, reject) {
    xhr.onloadend = function() {
      if (xhr.status === 404) {
        resolve('');
      } else if (xhr.response) {
        resolve(xhr.response);
      } else {
        reject(xhr.error);
      }
    };
  });
}

var saltArr = hexToArray('79f9ff63bf690f0c4640a8fce3bc3d6e');
var ivArr = hexToArray('c9567d08a04248a3202e7a5541ff9cf0');
var testEncryptedData = hexToArray('ab7334b313ea8e5333a1db44dd782e59');
var testEncryptedPlainText = 'testvalue';

var encryptedDOMSteps = '/cv/steps.json.aes?_=67f271';
var encryptedPrivatePDF = '/cv/timdream-private.pdf.aes?_=b80308';

self.onmessage = function(evt) {
  var password = evt.data.password;

  Promise.all([getKey(password),
               getFile(encryptedDOMSteps),
               getFile(encryptedPrivatePDF)])
    .then(function(values) {
      var key = values[0];
      var stepsArr = values[1];
      var pdfArr = values[2];

      if (!key) {
        throw 'Incorrect Password.';
      }

      return Promise.all([decipher(key, stepsArr),
        decipher(key, pdfArr)]);
    })
    .then(function(values) {
      self.postMessage({
        type: 'result',
        domModifications: JSON.parse(arrayToStr(new Uint8Array(values[0]))),
        privatePDFBlob: new Blob([values[1]], { type: 'application/pdf' })
      });
    })
    .catch(function(e) {
      console.error(e);
      if (typeof e === 'string') {
        self.postMessage({ type: 'result', error: e });
      } else {
        self.postMessage({ type: 'error', message: message });
      }
    });
};
