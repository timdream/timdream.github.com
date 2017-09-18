#!/usr/bin/env node

'use strict';

function hexToArray(str) {
  const iv = new Uint8Array(str.length / 2);
  for (let i = 0; i < str.length; i += 2) {
    iv[i / 2] = parseInt(str.charAt(i) + str.charAt(i + 1), 16);
  }

  return iv;
}

function encrypt(data) {
  const cipher = crypto.createCipheriv('aes-256-cbc', key, ivArr);
  let buf = cipher.update(data);
  buf = Buffer.concat([buf, cipher.final()]);
  return buf;
}

function decrypt(data) {
  const cipher = crypto.createDecipheriv('aes-256-cbc', key, ivArr);
  let buf = cipher.update(data);
  buf = Buffer.concat([buf, cipher.final()]);
  return buf;
}

const crypto = require('crypto');
const fs = require('fs');

const password = fs.readFileSync(__dirname + '/password.secret', { encoding: 'utf-8'}).trim();
const saltArr = hexToArray(fs.readFileSync(__dirname + '/salt.txt', { encoding: 'utf-8'}).trim());
const ivArr = hexToArray(fs.readFileSync(__dirname + '/iv.txt', { encoding: 'utf-8'}).trim());

const key = crypto.pbkdf2Sync(password, saltArr, 500, 32, 'sha256');

/* Key can be saved by
   fs.writeFileSync('./key.secret', key.toString('hex'));

   And used by OpenSSL with
   openssl aes-256-cbc -in plaintext.txt \
    -iv iv.txt \
    -K key.secret \
    -out encrypted.bin

  to produce the exact equal result.
 */

fs.writeFileSync(__dirname + '/testvalue.hex.txt',
  encrypt('testvalue').toString('hex'));

if (!fs.existsSync(__dirname + '/steps.json') ||
    !fs.existsSync(__dirname + '/timdream-private.pdf')) {
  console.log('Attempt to decrypt from encrypted files.');

  fs.writeFileSync(__dirname + '/steps.json',
    decrypt(fs.readFileSync(__dirname + '/../../cv/steps.json.aes')));

  fs.writeFileSync(__dirname + '/timdream-private.pdf',
    decrypt(fs.readFileSync(__dirname + '/../../cv/timdream-private.pdf.aes')));

  return;
}

fs.writeFileSync(__dirname + '/steps.json.aes',
  encrypt(fs.readFileSync(__dirname + '/steps.json')));

fs.writeFileSync(__dirname + '/timdream-private.pdf.aes',
  encrypt(fs.readFileSync(__dirname + '/timdream-private.pdf')));
