# IDU+ 0.3.12

IDU+ is an MV3 browser extension and Safari userscript that modernizes the real IDU portal while preserving its existing data, links, and workflows.

Privacy policy: https://vstxx.github.io/IDU-/privacy.html

## What's new in 0.3.12

- Fixed IDU+ Diagnostics delivery in the Safari userscript by bundling the helper, removing its hard dependency on `chrome.runtime`, and persisting its one-time marker in browser-local storage.
- Diagnostics now exposes privacy-safe console stages for missing users/runtime/storage, request attempts, HTTP/network failures, rate limits, Worker/Discord failures, and success. No name or install ID is logged.
- Kept the primary and sticky topbars on one horizontally scrollable row at every viewport width, including narrow tablets and desktop windows.
- Increased the mobile spacing rhythm between page-level sections and stacked dashboard columns without enlarging form-field spacing.

## Previously in 0.3.9

- Polished announcement lists and opened news posts across desktop and mobile, including cleaner titles, separators, comments, and section spacing.
- Added an account-gated, local-only news customization mode. Customized content remains in browser-local storage and is never submitted to IDU.
- Removed the legacy breadcrumb box and its unused layout space from every page.
- Reduced scroll rendering cost by limiting live backdrop blur, skipping off-screen feed rendering where supported, and moving dynamic DOM enhancement work off the active interaction path.

## Previously in 0.3.8

- Rebuilt the message composer into a clean responsive layout with a full-width editor and compact fields and actions.
- Added a dark CKEditor canvas and toolbar without a white loading flash in Dark Mode.
- Improved the mobile inbox, attendance cards, message-folder consistency, forum navigation, and global overflow containment.

## What is included

- `manifest.json` loads the extension on `https://*.idu.edu.pl/*`.
- `popup.html` and `src/popup.*` provide appearance settings.
- `src/idu-plus.css` contains the responsive visual layer.
- `src/idu-plus.js` enhances the existing IDU interface without replacing its links or data.
- `src/diagnostics.js` sends the one-time-per-person active-use diagnostics described in the privacy policy.
- `fonts/` and `assets/` contain the bundled fonts, logo, and extension icons.

## Local installation

### Chrome or Edge

Open Chrome or Edge extension settings, enable developer mode, choose "Load unpacked", and select this `IDU+` folder.

### Firefox

Open `about:debugging`, choose **This Firefox**, select **Load Temporary Add-on**, and open `manifest.json` from the Firefox release folder. The packaged `.xpi` can be used where unsigned local add-ons are supported.

### Safari on iPhone, iPad, or Mac

Use `release/idu-plus-safari-userscript/IDU+.user.js` with the Safari **Userscripts** extension. The userscript is self-contained and stores appearance preferences locally.

## Diagnostics Worker

IDU+ sends a small active-use diagnostics event to:

`https://idu-diagnostics.vastbrowser.com/diagnostics`

The Discord webhook must be configured only as the Cloudflare Worker secret named `DISCORD_WEBHOOK_URL`. Server-side global and per-client rate limiting is configured through the two native bindings in `workers/wrangler.jsonc`; no rate-limit secret is stored in the extension.

Deploy from the Worker directory:

```sh
npx wrangler secret put DISCORD_WEBHOOK_URL --config workers/wrangler.jsonc
npx wrangler deploy --config workers/wrangler.jsonc
```
