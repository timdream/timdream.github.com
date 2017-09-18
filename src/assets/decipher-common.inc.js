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

var saltArr = hexToArray('%salt.txt%');
var ivArr = hexToArray('%iv.txt%');
var testEncryptedData = hexToArray('%testvalue.hex.txt%');
var testEncryptedPlainText = 'testvalue';

var encryptedDOMSteps = '/cv/steps.json.aes?_=%hash-steps.json.aes%';
var encryptedPrivatePDF = '/cv/timdream-private.pdf.aes?_=%hash-timdream-private.pdf.aes%';

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
