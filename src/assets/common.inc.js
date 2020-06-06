document.documentElement.classList.remove("no-js");

if (
  window.location.hostname === "timdream.org" &&
  window.doNotTrack !== "1" &&
  navigator.doNotTrack !== "1"
) {
    var _paq = window._paq || [];
    /* tracker methods like "setCustomDimension" should be called before "trackPageView" */
    _paq.push(['trackPageView']);
    _paq.push(['enableLinkTracking']);
    (function() {
      var u="//timc.idv.tw/matomo/";
      _paq.push(['setTrackerUrl', u+'matomo.php']);
      _paq.push(['setSiteId', '1']);
      var d=document, g=d.createElement('script'), s=d.getElementsByTagName('script')[0];
      g.type='text/javascript'; g.async=true; g.defer=true; g.src=u+'matomo.js'; s.parentNode.insertBefore(g,s);
    })();
}

function ServiceWorkerController() {}
ServiceWorkerController.prototype = {
  start: function() {
    if (!("serviceWorker" in navigator)) {
      this.state = "notsupported";
      return;
    }

    this.check()
      .then(
        function() {
          if (
            !this.swReg ||
            (!this.swReg.installing &&
              !this.swReg.waiting &&
              !this.swReg.active)
          ) {
            return this.install();
          } else if (this.swReg.active) {
            // Update will fail on offline; disregard.
            return this.swReg.update();
          }
        }.bind(this)
      )
      .then(
        function() {
          this.swReg.addEventListener("updatefound", this);
          this.showUpdateProgress();
        }.bind(this)
      )
      .catch(
        function(error) {
          console.log(error);
        }.bind(this)
      );
  },
  check: function() {
    return navigator.serviceWorker.getRegistration("/").then(
      function(swReg) {
        this.swReg = swReg;
      }.bind(this)
    );
  },
  install: function() {
    return navigator.serviceWorker
      .register("/service-worker.min.js", { scope: "/" })
      .then(
        function(swReg) {
          this.swReg = swReg;
        }.bind(this)
      );
  },
  remove: function() {
    this.state = "removing";
    this.swReg.unregister().then(
      function(unregistered) {
        if (unregistered) {
          this.state = "uninstalled";
          this.swReg = null;
        } else {
          this.state = "installed";
        }
      }.bind(this)
    );
  },
  showUpdateProgress: function() {
    // No UI to show if there isn't anything being installed,
    // or if this page is newly installed or bypasses service worker.
    if (!this.swReg.installing || !navigator.serviceWorker.controller) {
      return;
    }
    document.documentElement.classList.add("updating");
    this.swReg.installing.addEventListener("statechange", this);
  },
  handleEvent: function(evt) {
    switch (evt.type) {
      case "updatefound":
        this.showUpdateProgress();
        break;
      case "statechange":
        evt.target.removeEventListener("statechange", this);
        if (evt.target.state === "redundant") {
          // Install failed, hide UI and exit.
          document.documentElement.classList.remove("updating");
          return;
        }
        // page is not current, should reload
        window.location.reload();
        break;
    }
  }
};

window.swController = new ServiceWorkerController();
window.swController.start();
