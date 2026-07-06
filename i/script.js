(function () {
  "use strict";

  var CODE_RE = /^[A-Za-z0-9_-]{6,40}$/;
  var APP_STORE_ID = "6770280880"; // FILL IN

  function extractCode() {
    // Primary source: trailing path segment of /i/<code>
    var path = (window.location.pathname || "").replace(/\/+$/, "");
    var m = path.match(/\/i\/([^\/?#]+)$/);
    var raw = m ? decodeURIComponent(m[1]) : "";

    // Fallback: ?code=, used by the 404 redirect path on hosts without rewrites.
    if (!raw) {
      var params = new URLSearchParams(window.location.search);
      raw = params.get("code") || "";
    }

    return raw;
  }

  function showNotFound() {
    document.getElementById("not-found").hidden = false;
  }

  function showInvite(code) {
    var card = document.getElementById("invite-card");
    document.getElementById("code-pill").textContent = code;

    var deepLink = "travelwise://i/" + encodeURIComponent(code);
    document.getElementById("open-app").setAttribute("href", deepLink);

    // Smart App Banner: keep current URL as app-argument so the app can resume the flow.
    var banner = document.querySelector('meta[name="apple-itunes-app"]');
    if (banner) {
      banner.setAttribute(
        "content",
        "app-id=" + APP_STORE_ID + ", app-argument=" + window.location.href
      );
    }

    // Platform-specific store buttons.
    var ua = navigator.userAgent || "";
    var isIOS = /iPad|iPhone|iPod/.test(ua) ||
                (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
    var isAndroid = /Android/.test(ua);

    if (isIOS) {
      document.getElementById("play-store").hidden = true;
    } else if (isAndroid) {
      document.getElementById("app-store").hidden = true;
    }

    card.hidden = false;

    // One-shot deep link attempt on mobile. If the app isn't installed the
    // scheme silently no-ops and the user falls back to the install CTAs.
    if (isIOS || isAndroid) {
      setTimeout(function () { window.location.href = deepLink; }, 300);
    }
  }

  function boot() {
    var code = extractCode();
    if (!code || !CODE_RE.test(code)) {
      showNotFound();
      return;
    }
    showInvite(code);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }
})();
