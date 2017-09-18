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

//%decipher-common.inc.js%
