"use strict";

/**
 * The goal of service implementation here is to provide offline access, while
 *
 * 1) atomically update the website
 * 2) present the updated page as soon as the website finished updating
 *
 * For (1) the only reliable way to do so is to use multiple Cache instances.
 * Pushing new content into the existing cache from the new worker does not allow
 * client pages of the old worker to assess them, even if you could replace
 * the pages themselves.
 *
 * For (2) the page would have to reload itself as soon as it detects the
 * replacement of the worker. This is not the optimal experience, as the state of
 * the page will be erased. But it suits our purpose here as a portfolio website,
 * since the only state we care about - the scroll position - is kept by the
 * browser. It's possible to activate the new worker w/o reloading the existing
 * pages, but these pages might be left with a broken state if they ask for assets
 * from the deleted cache. We could fix that by defer the deletion of old caches,
 * but it would not be easy to find the right time to delete it later on.
 *
 * Manual test steps:
 *
 * 1. Load the page with HTTP cache disabled
 * 2. Switch to offline mode, click on a page
 * 3. Verify that page loads from Service Worker
 * 4. Switch back to online mode.
 * 5. Change the source code of another page a bit and re-build.
 * 6. Click on the link that goes to another page.
 * 7. Confirm that the page loads from Service Worker.
 * 8. Confirm that the update banner shows briefly.
 * 9. Confirm that the page reloads with changed content.
 */

// The version of this service worker, to be generated by the build script.
const versionHash = "%ALLHASHES%".substr(0, 6);
// Our cache key.
const cacheKey = "profile-" + versionHash;

// List of paths with correct hashes (if the request needs it)
// These are the only URLs we will cache.
const fileList = "%FILELIST%"
  .split(" ")
  .map(relativeURL => new URL(relativeURL, self.location).href);

// Install our resources into the cache.
// For assets (URLs with hashes), they will be copy over from the old cache
// to avoid duplicate download.
// For pages (URLs w/o hashes), they will be replaced by pages re-fetched with
// cache-busting URLs. Cache-busting URLs are needed because I do not have control
// over the static hosting.
self.oninstall = evt => {
  evt.waitUntil(
    self.caches
      .open(cacheKey)
      .then(cache => {
        const cachePromises = [].concat(
          fileList
            .filter(url => url.includes("?_="))
            .map(url =>
              caches
                .match(url)
                .then(response => response || fetch(url))
                .then(response => {
                  if (!response.ok && url.includes("fonts")) {
                    return;
                  }
                  return cache.put(url, response);
                })
            ),
          fileList
            .filter(url => !url.includes("?_="))
            .map(url =>
              fetch(url + "?_=" + versionHash).then(response => {
                if (!response.ok) {
                  throw new Error("Failed");
                }
                return cache.put(url, response);
              })
            )
        );
        return Promise.all(cachePromises);
      })
      .then(() => self.skipWaiting())
  );
};

// When we reached here this means there are no longer any old clients.
// This is the right time to safely discard old resources.
self.onactivate = evt => {
  evt.waitUntil(
    self.caches
      .keys()
      .then(keyList =>
        Promise.all(
          keyList
            .filter(key => key !== cacheKey && key.startsWith("profile"))
            .map(key => caches.delete(key))
        )
      )
  );
};

// When the page asked for a resource, return the one from the cache first.
// Turn to network only if it's not there.
self.onfetch = evt => {
  if (fileList.indexOf(evt.request.url) === -1) {
    // An unlisted file is being requested.
    return;
  }

  // Using cache-then-network strategy
  evt.respondWith(
    caches
      .open(cacheKey)
      .then(cache => cache.match(evt.request))
      .then(response => response || fetch(evt.request))
  );
};
