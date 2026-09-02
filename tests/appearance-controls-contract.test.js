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
assert.equal(manifest.version, "0.3.12", "Manifest should declare the 0.3.12 release version");
assert(
  /customize|themes|colors|fonts|layouts/i.test(manifest.description || ""),
  "Manifest description should emphasize customizable appearance controls"
);
assert.equal(
  manifest.homepage_url,
  "https://vstxx.github.io/IDU-/",
  "Manifest should point users to the GitHub Pages project site"
);
assert(
  manifest.icons?.["16"] === "assets/icon-16.png" &&
    manifest.icons?.["32"] === "assets/icon-32.png" &&
    manifest.icons?.["48"] === "assets/icon-48.png" &&
    manifest.icons?.["128"] === "assets/icon-128.png" &&
    manifest.action?.default_icon?.["128"] === "assets/icon-128.png",
  "Manifest should expose generated IDU+ extension icons for Chrome and the toolbar"
);

for (const filePath of [popupHtmlPath, popupCssPath, popupJsPath]) {
  assert(fs.existsSync(filePath), `${path.basename(filePath)} should exist`);
}

const popupHtml = fs.readFileSync(popupHtmlPath, "utf8");
const popupCss = fs.readFileSync(popupCssPath, "utf8");
const popupJs = fs.readFileSync(popupJsPath, "utf8");
const resources = manifest.web_accessible_resources.flatMap((entry) => entry.resources);

assert(
  popupHtml.includes('data-theme-option="light"') &&
    popupHtml.includes('data-theme-option="dark"') &&
    popupHtml.includes('data-title-font-option="aligra"') &&
    popupHtml.includes('data-title-font-option="inter"') &&
    popupHtml.includes('data-title-font-option="audex"') &&
    popupHtml.includes('data-title-font-option="otfits"') &&
    popupHtml.includes('id="accentColor"') &&
    popupHtml.includes('id="topbarColor"') &&
    popupHtml.includes('data-accent-preset="#2f78b7"') &&
    popupHtml.includes('src="assets/idu-plus-logo.png"'),
  "Popup should expose light/dark theme controls, title font controls, accent color controls, and topbar color controls"
);

assert(
  popupCss.includes("--popup-bg") &&
    popupCss.includes("--title-font") &&
    /\.popup-header h1\s*\{[\s\S]*font-family:\s*var\(--title-font\);/.test(popupCss) &&
    /\.section-heading h2\s*\{[\s\S]*font-family:\s*var\(--title-font\);/.test(popupCss) &&
    popupCss.includes(".title-font-option[aria-pressed=\"true\"]") &&
    popupCss.includes(".theme-option[aria-pressed=\"true\"]") &&
    popupCss.includes(".accent-swatch[aria-pressed=\"true\"]") &&
    popupCss.includes(".popup-logo") &&
    popupCss.includes('body[data-logo-tone="dark"] .preview-logo') &&
    popupCss.includes(".preview-card") &&
    /\.layout-switch\s*\{[\s\S]*grid-template-columns:\s*repeat\(2, minmax\(0, 1fr\)\)/.test(popupCss) &&
    /\.control-group,[\s\S]*\.preview-card[\s\S]*border-radius:\s*15px/.test(popupCss),
  "Popup CSS should style the settings surface, font selected states, and live preview"
);

assert(
  popupJs.includes("iduPlusAppearance") &&
    popupJs.includes("topbar") &&
    popupJs.includes('titleFont: "aligra"') &&
    popupJs.includes("TITLE_FONT_STACKS") &&
    popupJs.includes("data-title-font-option") &&
    popupJs.includes("isVeryLightHex") &&
    popupJs.includes("document.body.dataset.logoTone") &&
    /storage\??\.sync/.test(popupJs) &&
    /tabs\.query/.test(popupJs) &&
    popupJs.includes("IDU_PLUS_APPEARANCE_CHANGED"),
  "Popup JS should persist settings including title font and notify active IDU tabs"
);

assert(
    contentJs.includes("DEFAULT_APPEARANCE") &&
    contentJs.includes("applyAppearance") &&
    contentJs.includes("loadAppearance") &&
    /storage\??\.onChanged/.test(contentJs) &&
    contentJs.includes("IDU_PLUS_APPEARANCE_CHANGED") &&
    contentJs.includes("root.dataset.iduTheme") &&
    contentJs.includes("root.dataset.iduTitleFont") &&
    contentJs.includes("root.dataset.iduLogoTone") &&
    contentJs.includes("applyPageLogos") &&
    contentJs.includes("--idu-accent"),
  "Content script should load, apply, and listen for appearance settings"
);

assert(
  resources.includes("assets/*.png") &&
    contentJs.includes("assets/idu-plus-logo.png") &&
    css.includes('html.idu-plus[data-idu-logo-tone="dark"] #logo img') &&
    css.includes("filter: brightness(0)"),
  "Manifest, content script, and CSS should support the shared IDU+ logo asset and dark logo tone"
);

assert(
  /html\.idu-plus\[data-idu-logo-tone="dark"\] #top[\s\S]*color:\s*var\(--idu-text\)/.test(css) &&
    /html\.idu-plus\[data-idu-logo-tone="dark"\] #school-name[\s\S]*text-shadow:\s*none/.test(css) &&
    /html\.idu-plus\[data-idu-logo-tone="dark"\] #account-actions > div:not\(#last_internal_messages\):not\(#unread_forum_posts\)[\s\S]*color:\s*var\(--idu-text-soft\)/.test(css) &&
    /html\.idu-plus\[data-idu-logo-tone="dark"\] #account-actions strong,[\s\S]*#account-actions #login strong[\s\S]*color:\s*var\(--idu-text\)/.test(css) &&
    /html\.idu-plus\[data-idu-logo-tone="dark"\] #change_language \.logout-timer,[\s\S]*#change_language \.js-counter[\s\S]*color:\s*var\(--idu-text-soft\)/.test(css),
  "Light topbars should darken portal topbar text, links, buttons, icons, and timer text with the logo tone"
);

assert(
  contentJs.includes('titleFont: "aligra"') &&
    contentJs.includes("TITLE_FONT_STACKS") &&
    contentJs.includes("TITLE_FONT_FAMILIES") &&
    contentJs.includes("TITLE_HEADING_SELECTOR") &&
    contentJs.includes("#content h3") &&
    contentJs.includes("applyTitleFontToHeadings") &&
    contentJs.includes('heading.style.setProperty("font-family", stack, "important")') &&
    contentJs.includes("loadExtensionFontAsset") &&
    contentJs.includes("response.arrayBuffer()") &&
    contentJs.includes("new FontFace") &&
    contentJs.includes("document.fonts.add(fontFace)") &&
    contentJs.includes("document.fonts.load") &&
    contentJs.includes("--idu-title-font"),
  "Content script should load bundled Chrome fonts and apply selected title fonts to real portal headings"
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
    /html\.idu-plus\[data-idu-theme="dark"\][\s\S]*--idu-glass-bg:\s*rgba\(21, 23, 28, 0\.68\)/.test(css) &&
    /html\.idu-plus\[data-idu-theme="dark"\][\s\S]*--idu-surface:\s*var\(--idu-material-bg\)/.test(css),
  "CSS should define a neutral graphite Frost token set for dark mode"
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
