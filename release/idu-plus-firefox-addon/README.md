# IDU+ 0.3.2

IDU+ is an MV3 browser extension and Safari userscript that modernizes the real IDU portal while preserving its existing data, links, and workflows.

Privacy policy: https://vstxx.github.io/IDU-/privacy.html

## What's new in 0.3.2

- Cleaner, flatter interface with fewer gradients, glows, and expensive visual effects.
- Consistent custom dropdowns throughout IDU.
- Reworked profile dashboard with aligned, compact information cards.
- Improved detailed schedule form, print actions, and calendar export placement.
- Minimal animated collapse icons instead of text pills.
- Single-row horizontally scrollable topbar actions on iOS and narrow desktop windows.
- Performance and responsive-layout improvements across portal, sidebar, and dark modes.

## What is included

- `manifest.json` loads the extension on `https://*.idu.edu.pl/*`.
- `popup.html` and `src/popup.*` provide appearance settings.
- `src/idu-plus.css` contains the responsive visual layer.
- `src/idu-plus.js` enhances the existing IDU interface without replacing its links or data.
- `src/diagnostics.js` sends the limited active-use diagnostics described in the privacy policy.
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

`https://idu-plus-diagnostics.jas-nowacki.workers.dev/diagnostics`

The Discord webhook must be configured only as the Cloudflare Worker secret named `DISCORD_WEBHOOK_URL`.

Deploy from the Worker directory:

```sh
npx wrangler secret put DISCORD_WEBHOOK_URL --config workers/wrangler.jsonc
npx wrangler deploy --config workers/wrangler.jsonc
```
