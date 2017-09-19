'use strict';

self.importScripts('/assets/asmcrypto.js');

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

//%decipher-common.inc.js%
