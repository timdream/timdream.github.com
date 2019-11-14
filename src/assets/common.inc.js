document.documentElement.classList.remove("no-js");

if (
  window.location.hostname === "timdream.org" &&
  window.doNotTrack !== "1" &&
  navigator.doNotTrack !== "1"
) {
  var _gaq = _gaq || [];
  _gaq.push(["_setAccount", "UA-4623408-2"]);
  _gaq.push(["_trackPageview"]);

  (function() {
    var ga = document.createElement("script");
    ga.type = "text/javascript";
    ga.async = true;
    ga.src = "https://ssl.google-analytics.com/ga.js";
    var s = document.getElementsByTagName("script")[0];
    s.parentNode.insertBefore(ga, s);
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
