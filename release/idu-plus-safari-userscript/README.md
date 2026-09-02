# IDU+ for Safari Userscripts

This release is the Safari userscript build of IDU+ 0.3.12.

## Files

- `IDU+.user.js` - self-contained userscript for Safari Userscripts.
- `README-extension.md` - original extension notes.

The userscript embeds the IDU+ CSS, fonts, and logo directly, so it does not need the Chrome/Firefox extension folder structure.

## Install on Safari for macOS

1. Install the **Userscripts** app from the App Store.
2. Open the Userscripts app once and choose a folder where scripts will be stored.
3. Open Safari.
4. Go to **Safari > Settings > Extensions**.
5. Enable **Userscripts**.
6. Allow Userscripts on `idu.edu.pl` when Safari asks for website access.
7. Copy `IDU+.user.js` into the folder selected in the Userscripts app.
8. Open or refresh your IDU portal page.

## Install on Safari for iPhone or iPad

1. Install **Userscripts** from the App Store.
2. Open the Userscripts app once and choose or create its scripts folder.
3. Open the Files app and place `IDU+.user.js` in that Userscripts folder.
4. Open **Settings > Safari > Extensions**.
5. Enable **Userscripts**.
6. Allow it for the IDU portal domain.
7. Open or refresh IDU in Safari.

## Notes

- This build targets `https://*.idu.edu.pl/*`.
- It does not collect passwords, cookies, grades, messages, page contents, or screenshots.
- It sends only the limited active-use diagnostics described in the project privacy policy.
- The Safari userscript build does not include the Chrome/Firefox popup UI. It adds a collapsed **IDU+ Appearance** panel at the bottom of IDU pages with the same theme, layout, title font, accent, and topbar settings.
- Appearance settings are saved locally in `localStorage`.
