'use strict';

//%common.inc.js%

window.addEventListener('pagehide', function() {
  document.body.classList.add('pagehide') });
window.addEventListener('pageshow', function() {
  document.body.classList.remove('pagehide') });
