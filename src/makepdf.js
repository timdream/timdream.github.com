#!/usr/bin/env node

/*
 * This script generates timdream.pdf and timdream-private.pdf
 * in their desired directories.
 *
 * This is not included in the build process because it technically
 * a circular dependency, and also the fact the resulting PDF is not
 * reproducible even after removing all metadata timestamps.
 */

'use strict';

const fs = require('fs');

const puppeteer = require('puppeteer');
const { createServer } = require('http-server');

const port = 20808;
const host = '127.0.0.1';

const password = fs.readFileSync(__dirname + '/encryption/password.secret', { encoding: 'utf-8'}).trim();

async function startServer() {
  var server = createServer({ root: __dirname + '/../' });
  await new Promise(res => server.listen(port, host, res));
}

async function shot() {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.goto('http://' + host + ':' + port + '/cv/' , { waitUntil: 'networkidle' });

  // Get public pages
  await page.$eval('body', el => el.classList.add('with-page-number'));
  await page.pdf({ path: __dirname + '/../cv/timdream.pdf', format: 'Letter'});

  // Decrypt
  await page.evaluate(password => {
    document.getElementById('unlock-password').value = password;
    app.cipherUI.decrypt();
  }, password);
  await page.waitForSelector('body.decrypted');

  // Get private pages
  await page.pdf({ path: __dirname + '/encryption/timdream-private.pdf', format: 'Letter'});

  await browser.close();
}

(async () => {
  try {
    await startServer();
    await shot();
  } catch (e) { console.error(e); }

  process.exit();
})();
