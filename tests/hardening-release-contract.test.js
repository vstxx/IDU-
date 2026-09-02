const assert = require("assert");
const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const contentJs = fs.readFileSync(path.join(root, "src", "idu-plus.js"), "utf8");
const contentCss = fs.readFileSync(path.join(root, "src", "idu-plus.css"), "utf8");
const popupJs = fs.readFileSync(path.join(root, "src", "popup.js"), "utf8");
const popupCss = fs.readFileSync(path.join(root, "src", "popup.css"), "utf8");

assert(
  popupJs.includes("const SETTINGS_WRITE_DEBOUNCE_MS = 180") &&
    popupJs.includes("persistTimer") &&
    popupJs.includes("persistRevision") &&
    /render\(nextAppearance\);[\s\S]{0,100}notifyActiveTab\(nextAppearance\);[\s\S]{0,220}if \(debounceWrite\)/.test(popupJs) &&
    /save\(\{ accent: event\.currentTarget\.value \}, \{ debounceWrite: true \}\)/.test(popupJs) &&
    /save\(\{ topbar: event\.currentTarget\.value \}, \{ debounceWrite: true \}\)/.test(popupJs),
  "Popup color controls should preview immediately while debouncing persistent writes"
);

assert(
  contentJs.includes("let userscriptAppearanceWriteTimer = null") &&
    /applyAppearance\(nextAppearance\);[\s\S]{0,180}if \(debounceWrite\)/.test(contentJs) &&
    /setUserscriptAppearance\(\{ \[appearanceKey\]: event\.currentTarget\.value \}, \{ debounceWrite: true \}\)/.test(
      contentJs
    ) &&
    contentJs.includes('window.addEventListener("pagehide"'),
  "Safari userscript controls should keep live preview and flush a debounced final value"
);

assert(
  /@media \(prefers-reduced-motion: reduce\)\s*\{[\s\S]*html\.idu-plus \*,[\s\S]*animation:\s*none\s*!important;[\s\S]*transition:\s*none\s*!important;/.test(
    contentCss
  ) &&
    /@media \(prefers-reduced-motion: reduce\)\s*\{[\s\S]*\*::after[\s\S]*animation:\s*none\s*!important;[\s\S]*transition:\s*none\s*!important;/.test(
      popupCss
    ) &&
    contentJs.includes('window.matchMedia?.("(prefers-reduced-motion: reduce)")') &&
    /if \(prefersReducedMotion\(\)\) \{[\s\S]{0,220}finishFoldableAnimation\(foldable, collapsed\)/.test(contentJs),
  "Reduced-motion mode should remove CSS motion and bypass foldable animation delays"
);

assert(
  contentJs.includes("const enhanceSessionTimeout = () =>") &&
    contentJs.includes('timer.setAttribute("role", "timer")') &&
    contentJs.includes('const shortLabel = isEnglish ? "Session:" : "Sesja:"') &&
    contentJs.includes("workspaceSessionTimeoutObserver.observe") &&
    /#change_language \.logout-timer\s*\{[\s\S]*display:\s*inline-flex\s*!important;/.test(contentCss) &&
    /#change_language \.js-counter\s*\{[\s\S]*font-variant-numeric:\s*tabular-nums;/.test(contentCss) &&
    /#account-actions\s*\{[\s\S]*flex-flow:\s*row nowrap\s*!important;[\s\S]*overflow-x:\s*auto\s*!important;/.test(contentCss),
  "Session timeout should remain compact and synchronized while the topbar stays on one horizontal line"
);

console.log("0.3.12 hardening contract ok");
