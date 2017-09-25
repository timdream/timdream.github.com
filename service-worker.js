'use strict';

// This version cache will trigger the browser to
// install the new service worker.
/*! Hash: d9e6a2a7a54c7ba7514b0ae256356b67 */

const cacheKey = 'profile';

// List of paths with correct hashes (if the request needs it)
const fileList = './ assets/45-degree-fabric-dark.png?_=fe52ed assets/academia-sinica.svg?_=38ca46 assets/asmcrypto-decipher.min.js?_=189c07 assets/asmcrypto.js?_=fa9483 assets/cv.min.css?_=cc4e66 assets/cv.min.js?_=796346 assets/demolab-screenshot.jpg?_=632367 assets/demolab.svg?_=1ad974 assets/firefox-os-commit.svg?_=8fa997 assets/firefox-os-keyboard.png?_=a4f28a assets/firefox-os.png?_=907a94 assets/firefox.png?_=aa3132 assets/jszhuyin-learn.gif?_=d56f91 assets/jszhuyin.svg?_=9caf29 assets/little-pluses.png?_=3ab494 assets/moztw-gfx-tw-tim.jpg?_=c311b2 assets/moztw-ie8.jpg?_=c2f527 assets/moztw.png?_=53d1f2 assets/owl-publishing.svg?_=eb546e assets/reading-signpost-in-paris-foreground.png?_=42be09 assets/reading-signpost-in-paris-scene.jpg?_=39d0e9 assets/reading-signpost-in-paris.jpg?_=7c2074 assets/script.min.js?_=d412a5 assets/style.min.css?_=4523cd assets/tiramisu-icon-64-shadow.png?_=3d869c assets/webcrypto-decipher.min.js?_=ae158a assets/wordcloud-example-noscript.jpg?_=318640 assets/wordcloud.svg?_=fd516a cv/ cv/steps.json.aes?_=08f817 cv/timdream-private.pdf.aes?_=193374 cv/timdream.pdf?_=3e8aff portfolio/academia-sinica/ portfolio/demolab/ portfolio/firefox-os/ portfolio/firefox/ portfolio/jszhuyin/ portfolio/moztw/ portfolio/owl-publishing/ portfolio/wordcloud/'
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
