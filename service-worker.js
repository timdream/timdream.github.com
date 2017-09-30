'use strict';

// This version cache will trigger the browser to
// install the new service worker.
/*! Hash: d10a2124364e18092a4ecf8959775e8d */

const cacheKey = 'profile';

// List of paths with correct hashes (if the request needs it)
const fileList = './ assets/45-degree-fabric-dark.png?_=fe52ed assets/academia-sinica.icon.svg?_=1e8c57 assets/academia-sinica.svg?_=afef9b assets/asmcrypto-decipher.min.js?_=dbe157 assets/asmcrypto.js?_=fa9483 assets/cv.min.css?_=cc4e66 assets/cv.min.js?_=229c3f assets/demolab-screenshot.jpg?_=632367 assets/demolab.icon.svg?_=ff4890 assets/demolab.svg?_=18ba76 assets/firefox-os-commit.svg?_=7f4a96 assets/firefox-os-keyboard.png?_=4efcc0 assets/firefox-os.icon.png?_=ac06b9 assets/firefox-os.png?_=19638c assets/firefox.icon.png?_=acd200 assets/firefox.png?_=2e2c47 assets/jszhuyin-learn.mp4?_=de1cef assets/jszhuyin.svg?_=7eb9dc assets/little-pluses.png?_=3ab494 assets/moztw-gfx-tw-tim.jpg?_=c311b2 assets/moztw-ie8.jpg?_=c2f527 assets/moztw.icon.png?_=baa4bc assets/moztw.png?_=8dcd65 assets/owl-publishing.svg?_=379728 assets/reading-signpost-in-paris-foreground.png?_=42be09 assets/reading-signpost-in-paris-scene.jpg?_=39d0e9 assets/reading-signpost-in-paris.jpg?_=b0f285 assets/script.min.js?_=b4ded5 assets/style.min.css?_=4b6cbc assets/tiramisu-icon-64-shadow.png?_=3d869c assets/webcrypto-decipher.min.js?_=ce9abd assets/wordcloud-example-noscript.jpg?_=318640 assets/wordcloud.svg?_=958049 cv/ cv/steps.json.aes?_=bc3132 cv/timdream-private.pdf.aes?_=25ff2a cv/timdream.pdf?_=0adaa3 portfolio/academia-sinica/ portfolio/demolab/ portfolio/firefox-os/ portfolio/firefox/ portfolio/jszhuyin/ portfolio/moztw/ portfolio/owl-publishing/ portfolio/wordcloud/'
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
