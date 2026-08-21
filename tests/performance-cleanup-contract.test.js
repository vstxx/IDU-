const assert = require("assert");
const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const contentCss = fs.readFileSync(path.join(root, "src", "idu-plus.css"), "utf8");
const contentJs = fs.readFileSync(path.join(root, "src", "idu-plus.js"), "utf8");
const popupCss = fs.readFileSync(path.join(root, "src", "popup.css"), "utf8");
const popupJs = fs.readFileSync(path.join(root, "src", "popup.js"), "utf8");

const count = (source, pattern) => source.match(pattern)?.length || 0;

assert(count(contentCss, /^\s*(?:-webkit-)?backdrop-filter\s*:/gim) <= 2, "Portal should centralize blur in one bounded material rule");
assert(count(popupCss, /^\s*(?:-webkit-)?backdrop-filter\s*:/gim) <= 2, "Popup should centralize blur in one bounded material rule");
assert(contentCss.includes("@supports ((backdrop-filter: blur(1px))"), "Portal blur should be capability-gated");
assert(popupCss.includes("@supports ((backdrop-filter: blur(1px))"), "Popup blur should be capability-gated");
assert(count(contentCss, /gradient\(/gi) <= 2, "Portal should only keep two restrained ambient gradients");
assert(count(popupCss, /gradient\(/gi) <= 2, "Popup should only keep two restrained ambient gradients");
assert(
  /html\.idu-plus body\s*\{[\s\S]*background:\s*var\(--idu-ambient-background\)\s*!important;/.test(contentCss) &&
    /@media \(max-width: 760px\)[\s\S]*--idu-glass-blur:\s*11px;[\s\S]*background-attachment:\s*scroll\s*!important/.test(contentCss),
  "The page should use restrained ambient depth and a cheaper mobile Frost configuration"
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
