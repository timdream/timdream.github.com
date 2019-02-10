'use strict';

self.importScripts('/assets/asmcrypto.js?_=fa9483');

function getKey(password) {
  var key = asmCrypto.PBKDF2_HMAC_SHA256.bytes(
    strToArray(password), saltArr, 500, 32);
  var decryptedText;
  try {
    decryptedText = arrayToStr(new Uint8Array(decipher(key, testEncryptedData)));
  } catch (e) {
    return;
  }
  if (decryptedText === testEncryptedPlainText) {
    return key;
  }
}

function decipher(key, encryptedArr) {
  return asmCrypto.AES_CBC.decrypt(encryptedArr, key, true, ivArr).buffer;
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
var encryptedPrivatePDF = '/cv/timdream-private.pdf.aes?_=2b8a7b';

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
