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
const versionHash = "79b6a176dc58cc3a2b5249f63b747e2a".substr(0, 6);
// Our cache key.
const cacheKey = "profile-" + versionHash;

// List of paths with correct hashes (if the request needs it)
// These are the only URLs we will cache.
const fileList = "./ assets/45-degree-fabric-dark.png?_=fe52ed assets/academia-sinica.icon.svg?_=1e8c57 assets/academia-sinica.svg?_=afef9b assets/apple.svg?_=8685eb assets/asmcrypto-decipher.min.js?_=4e7678 assets/asmcrypto.js?_=fa9483 assets/cv.min.css?_=4d3ebc assets/cv.min.js?_=ee208d assets/demolab-screenshot.jpg?_=632367 assets/demolab.icon.svg?_=ff4890 assets/demolab.svg?_=18ba76 assets/firefox-os-commit.svg?_=7f4a96 assets/firefox-os-keyboard.png?_=4efcc0 assets/firefox-os.icon.png?_=aca0f2 assets/firefox-os.png?_=19638c assets/firefox.icon.png?_=4bbced assets/firefox.png?_=2e2c47 assets/fonts/merriweather-v21-latin-700.woff2?_=fa534b assets/fonts/merriweather-v21-latin-700.woff?_=ba56ea assets/fonts/merriweather-v21-latin-regular.woff2?_=8276fd assets/fonts/merriweather-v21-latin-regular.woff?_=69f098 assets/jszhuyin-learn.mp4?_=de1cef assets/jszhuyin.svg?_=7eb9dc assets/little-pluses.png?_=3ab494 assets/moztw-gfx-tw-tim.jpg?_=c311b2 assets/moztw-ie8.jpg?_=c2f527 assets/moztw.icon.png?_=2c7809 assets/moztw.png?_=8dcd65 assets/owl-publishing.svg?_=379728 assets/reading-signpost-in-paris-foreground.png?_=42be09 assets/reading-signpost-in-paris-scene.jpg?_=39d0e9 assets/reading-signpost-in-paris.jpg?_=b0f285 assets/script.min.js?_=a29049 assets/style.min.css?_=66723d assets/tiramisu-icon-64-shadow.png?_=3d869c assets/webcrypto-decipher.min.js?_=8aad1e assets/wordcloud-example-noscript.jpg?_=318640 assets/wordcloud.svg?_=958049 cv/ cv/steps.json.aes?_=67f271 cv/timdream-private.pdf.aes?_=b8a7c2 cv/timdream.pdf?_=a94b04 portfolio/academia-sinica/ portfolio/apple/ portfolio/demolab/ portfolio/firefox-os/ portfolio/firefox/ portfolio/jszhuyin/ portfolio/moztw/ portfolio/owl-publishing/ portfolio/wordcloud/"
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
