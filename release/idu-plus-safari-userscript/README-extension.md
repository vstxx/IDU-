# IDU+ 0.3.7

IDU+ is an MV3 browser extension and Safari userscript that modernizes the real IDU portal while preserving its existing data, links, and workflows.

Privacy policy: https://vstxx.github.io/IDU-/privacy.html

## What's new in 0.3.7

- Fixed the Messages topbar action so a normal click reliably opens the inbox instead of the legacy preview.
- Restyled the portal's native message folders as one aligned five-column control with equal button heights and widths.
- Kept message-folder navigation responsive with horizontal overflow on narrow screens.

## Previously in 0.3.5

- Refined Frost surfaces and typography across real IDU pages in Portal and Workspace layouts, with restrained light/dark materials and mobile fallbacks.
- Reworked forums, forum search, message folders, grade details, documents, profile boards, pagination, and user search while preserving native IDU links and actions.
- Safer recurring ICS timetable exports through the end of the school year, including parallel lessons and visible lesson-block times.
- Improved attendance tables, schedules, class and subject summaries, tutor rows, class links, and student lists across desktop and mobile.
- Reliable handling of dynamically inserted IDU content so enhancements remain active after partial page updates.
- Cleaner responsive navigation, localized fixed interface labels, compact session status, and dependable bundled title-font selection.
- One-time diagnostics reporting with server-side rate limiting, debounced settings persistence, and complete reduced-motion support.

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
