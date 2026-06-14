const assert = require("assert");
const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const manifest = JSON.parse(fs.readFileSync(path.join(root, "manifest.json"), "utf8"));
const css = fs.readFileSync(path.join(root, "src", "idu-plus.css"), "utf8");
const contentJs = fs.readFileSync(path.join(root, "src", "idu-plus.js"), "utf8");

const popupHtmlPath = path.join(root, "popup.html");
const popupCssPath = path.join(root, "src", "popup.css");
const popupJsPath = path.join(root, "src", "popup.js");

assert.equal(manifest.action?.default_popup, "popup.html", "Extension action should open popup.html");
assert(manifest.permissions?.includes("storage"), "Extension should request storage permission");

for (const filePath of [popupHtmlPath, popupCssPath, popupJsPath]) {
  assert(fs.existsSync(filePath), `${path.basename(filePath)} should exist`);
}

const popupHtml = fs.readFileSync(popupHtmlPath, "utf8");
const popupCss = fs.readFileSync(popupCssPath, "utf8");
const popupJs = fs.readFileSync(popupJsPath, "utf8");

assert(
  popupHtml.includes('data-theme-option="light"') &&
    popupHtml.includes('data-theme-option="dark"') &&
    popupHtml.includes('id="accentColor"') &&
    popupHtml.includes('id="topbarColor"') &&
    popupHtml.includes('data-accent-preset="#2f78b7"'),
  "Popup should expose light/dark theme controls, accent color controls, and topbar color controls"
);

assert(
  popupCss.includes("--popup-bg") &&
    popupCss.includes(".theme-option[aria-pressed=\"true\"]") &&
    popupCss.includes(".accent-swatch[aria-pressed=\"true\"]") &&
    popupCss.includes(".preview-card"),
  "Popup CSS should style the settings surface, selected states, and live preview"
);

assert(
  popupJs.includes("iduPlusAppearance") &&
    popupJs.includes("topbar") &&
    /storage\??\.sync/.test(popupJs) &&
    /tabs\.query/.test(popupJs) &&
    popupJs.includes("IDU_PLUS_APPEARANCE_CHANGED"),
  "Popup JS should persist settings and notify active IDU tabs"
);

assert(
    contentJs.includes("DEFAULT_APPEARANCE") &&
    contentJs.includes("applyAppearance") &&
    contentJs.includes("loadAppearance") &&
    /storage\??\.onChanged/.test(contentJs) &&
    contentJs.includes("IDU_PLUS_APPEARANCE_CHANGED") &&
    contentJs.includes("root.dataset.iduTheme") &&
    contentJs.includes("--idu-accent"),
  "Content script should load, apply, and listen for appearance settings"
);

assert(
  contentJs.includes("--idu-topbar") &&
    contentJs.includes("--idu-topbar-2") &&
    contentJs.includes("--idu-topbar-shadow"),
  "Content script should apply a separate configurable topbar color token"
);

assert(
  css.includes('html.idu-plus[data-idu-theme="dark"]') &&
    /html\.idu-plus\[data-idu-theme="dark"\][\s\S]*color-scheme:\s*dark/.test(css) &&
    /html\.idu-plus\[data-idu-theme="dark"\][\s\S]*--idu-bg:\s*#0b0c0f/.test(css) &&
    /html\.idu-plus\[data-idu-theme="dark"\][\s\S]*--idu-surface:\s*rgba\(24, 25, 29, 0\.78\)/.test(css),
  "CSS should define a neutral gray/black dark-mode token set, not a blue dark theme"
);

assert(
  css.includes("--idu-accent-deep") &&
    css.includes("--idu-accent-soft") &&
    css.includes("--idu-focus-ring") &&
    css.includes("var(--idu-accent-soft)") &&
    css.includes("var(--idu-focus-ring)"),
  "CSS should route accent-dependent UI through custom accent variables"
);

console.log("appearance controls contract ok");
