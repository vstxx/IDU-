const assert = require("assert");
const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const contentCss = fs.readFileSync(path.join(root, "src", "idu-plus.css"), "utf8");
const contentJs = fs.readFileSync(path.join(root, "src", "idu-plus.js"), "utf8");
const popupCss = fs.readFileSync(path.join(root, "src", "popup.css"), "utf8");
const popupJs = fs.readFileSync(path.join(root, "src", "popup.js"), "utf8");

const count = (source, pattern) => source.match(pattern)?.length || 0;

assert(!/backdrop-filter\s*:/i.test(contentCss), "Portal surfaces should not trigger backdrop blur passes");
assert(!/backdrop-filter\s*:/i.test(popupCss), "Popup surfaces should not trigger backdrop blur passes");
assert(count(contentCss, /gradient\(/gi) <= 6, "Portal gradients should stay limited to branded topbars");
assert(count(popupCss, /gradient\(/gi) <= 1, "Popup should keep only its small topbar preview gradient");
assert(
  /html\.idu-plus body\s*\{[\s\S]*background:\s*var\(--idu-bg\)\s*!important;/.test(contentCss),
  "The full page should use a flat, inexpensive background"
);
assert(
  contentJs.includes("lastAppliedAppearance") && contentJs.includes("appearanceKey === lastAppliedAppearance"),
  "Repeated storage and runtime events should not repaint an unchanged appearance"
);
assert(
  popupJs.includes("const controls = Object.freeze") && popupJs.includes('document.addEventListener("click"'),
  "Static popup controls should be cached and use one delegated click handler"
);

console.log("performance cleanup contract ok");
