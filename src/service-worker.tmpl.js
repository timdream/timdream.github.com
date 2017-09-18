'use strict';

// This version cache will trigger the browser to
// install the new service worker.
/*! Hash: %ALLHASHES% */

const cacheKey = 'profile';

// List of paths with correct hashes (if the request needs it)
const fileList = '%FILELIST%'
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
