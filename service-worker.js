'use strict';

// This version cache will trigger the browser to
// install the new service worker.
/*! Hash: 1a5f8384a15723ff73702929fcdd4466 */

const cacheKey = 'profile';

// List of paths with correct hashes (if the request needs it)
const fileList = './ portfolio/firefox/ portfolio/firefox-os/ portfolio/owl-publishing/ portfolio/academia-sinica/ portfolio/moztw/ portfolio/demolab/ portfolio/wordcloud/ portfolio/jszhuyin/ cv/ assets/cv.min.js?_=606750 assets/cv.min.css?_=e65073 assets/script.min.js?_=144e6f assets/style.min.css?_=d5b308 assets/asmcrypto.js?_=fa9483 assets/asmcrypto-decipher.min.js?_=1c2571 assets/webcrypto-decipher.min.js?_=ae158a cv/steps.json.aes?_=08f817 cv/timdream-private.pdf.aes?_=193374 cv/timdream.pdf?_=3e8aff assets/reading-signpost-in-paris.jpg?_=48e24c favicon.ico assets/45-degree-fabric-dark.png assets/little-pluses.png assets/academia-sinica.png assets/demolab-screenshot.png assets/demolab.png assets/firefox-os-commit.svg assets/firefox-os-keyboard.png assets/firefox-os.png assets/firefox.png assets/jszhuyin-learn.gif assets/jszhuyin.png assets/moztw-gfx-tw-tim.png assets/moztw-ie8.png assets/moztw.png assets/owl-publishing.svg assets/tiramisu-icon-64-shadow.png assets/wordcloud-example-noscript.png assets/wordcloud.png'
  .split(' ').map(relativeURL => (new URL(relativeURL, self.location)).href);

// Install our resources into the cache.
// For ones with hashes that don't exist, we will be adding them into the cache;
// for the ones w/o hashes (e.g. pages) we will be *replacing* them.
// The replaced ones will be seen even before activation.
self.oninstall = evt => {
  evt.waitUntil(self.caches.open(cacheKey)
    .then(cache => Promise.all([cache, cache.keys()]))
    .then(([cache, keys]) => {
      let cachedUrls = keys.map((request) => request.url);
      return cache.addAll([].concat(fileList)
        .filter(url => !(url.includes('?_=') && cachedUrls.includes(url))));
    }));
};

// When we reached here this means there are no longer any old clients.
// This is the right time to safely discard old resources.
self.onactivate = evt => {
  evt.waitUntil(self.caches.open(cacheKey)
    .then(cache => Promise.all([cache, cache.keys()]))
    .then(([cache, keys]) => keys
      .filter((request) => !fileList.includes(request.url))
      .map((request) => cache.delete(request))));
};

// When the page asked for a resource, return the one from the cache first.
// Turn to network only if it's not there.
self.onfetch = evt => {
  if (fileList.indexOf(evt.request.url) === -1) {
    // A unlisted file is being requested.
    return;
  }

  // Using cache-then-network strategy
  evt.respondWith(caches.open(cacheKey)
    .then(cache => cache.match(evt.request))
    .then(response => response || fetch(evt.request)));
};
