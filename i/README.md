# TravelWise invite landing page

Static fallback page served at `https://www.travelwise.top/i/{code}` when the
OS does not open the TravelWise app directly via Universal Links / App Links
(app not installed, association files not yet trusted, in-app browser
intercepts, desktop browsers, etc).

## Files

```
/i/index.html         — canonical invite page (handles /i/ and /i/index.html)
/i/style.css          — styles (off-white background, warm coral CTA)
/i/script.js          — extracts code from path, fires travelwise:// scheme
/404.html             — smart router: any /i/<code> URL renders the invite UI
                        with the original URL preserved; other unmatched paths
                        render a generic "Page not found"
/.well-known/apple-app-site-association  — already includes /i/* component
/.well-known/assetlinks.json             — Android App Links manifest
```

The OG image is referenced as `/i/og-invite.png` (1200×630). **Add this asset
before announcing the link** — without it WhatsApp / iMessage / Slack will
not render a rich preview.

## Placeholders to fill in

| Placeholder       | Where                                         | How to get it                                                      |
| ----------------- | --------------------------------------------- | ------------------------------------------------------------------ |
| `<APP_STORE_ID>`  | `i/index.html`, `404.html`, `i/script.js`     | Apple Developer → App Store Connect → app → General → Apple ID     |
| `og-invite.png`   | `i/og-invite.png` (1200×630 hero image)       | Design asset                                                       |

The iOS Team ID (`V84ZPU33SN`) and Android signing fingerprints are already
filled in inside `.well-known/`.

## How routing works on GitHub Pages

GitHub Pages has no rewrite rules, so `/i/<code>` would normally 404. We
exploit GitHub Pages' built-in `404.html` fallback:

- `/i/` and `/i/index.html` → served directly by `i/index.html`.
- `/i/<code>` → 404'd by GH Pages → `404.html` is returned.
  `404.html` detects the `/i/<code>` pattern, sets `data-route="invite"` on
  `<html>` so the invite UI is revealed, and `i/script.js` extracts the code
  from `window.location.pathname`. The browser address bar keeps the
  original URL.
- Any other unmatched path → `404.html` shows a generic "Page not found".

The HTTP status is 404 even on the invite path. Users never see this; it does
not affect Universal Links / App Links (those bypass HTTP entirely once the
association file is trusted).

## Deployment

This site is served from the `main` branch of this repo via GitHub Pages
(custom domain `www.travelwise.top`, CNAME committed at the repo root).
Push to `main` and GH Pages will publish within ~1 minute.

After the first deploy, verify:

```bash
curl -sI https://www.travelwise.top/.well-known/apple-app-site-association | head
curl -sI https://www.travelwise.top/.well-known/assetlinks.json | head
```

Both must return `200 OK` with `Content-Type: application/json` (GH Pages
serves JSON via the `_config.yml` `include` directive — already configured).

## Verification

### iOS Universal Links

1. Wait a few minutes after deploy, then ask Apple's CDN:
   ```bash
   curl -s https://app-site-association.cdn-apple.com/a/v1/www.travelwise.top | jq
   ```
   This should return the AASA JSON. Apple's CDN caches aggressively — if
   it's stale, retry after a few minutes.
2. On a real device with TravelWise installed: paste
   `https://www.travelwise.top/i/test123` into Notes.app, long-press, and
   tap "Open in TravelWise". The app should open directly.
3. If it instead opens this fallback page in Safari, force a refresh of the
   association: delete the app, reinstall, and reboot the device.

### Android App Links

1. Connect a device or emulator running a release-signed build of the app:
   ```bash
   adb shell pm verify-app-links --re-verify com.osw.travelwise
   adb shell pm get-app-links com.osw.travelwise
   ```
2. The output should show `www.travelwise.top` with host status `verified`.
3. Test the link:
   ```bash
   adb shell am start -a android.intent.action.VIEW \
     -d "https://www.travelwise.top/i/test123" com.osw.travelwise
   ```
   Without the package argument, the system should still resolve to the app.

### Custom URL scheme fallback

In the in-app browser of Instagram, Facebook, etc., Universal Links may not
fire. The page falls back to `travelwise://i/<code>` once on load, and shows
a manual "Open in TravelWise" button that fires the same scheme.
