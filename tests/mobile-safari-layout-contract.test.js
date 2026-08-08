const assert = require("assert");
const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const css = fs.readFileSync(path.join(root, "src", "idu-plus.css"), "utf8");
const js = fs.readFileSync(path.join(root, "src", "idu-plus.js"), "utf8");

assert.ok(
  js.includes('const MOBILE_VIEWPORT_CONTENT = "width=device-width, initial-scale=1, viewport-fit=cover"') &&
    js.includes("const isMobileBrowser = () =>") &&
    js.includes("root.classList.add(\"idu-mobile-web-app\")") &&
    js.includes('head.querySelector(\'meta[name="viewport"]\')') &&
    js.includes("document.addEventListener(\"DOMContentLoaded\", applyMobileViewport"),
  "Content script should install a mobile viewport only for mobile browsers"
);

assert.ok(
  js.includes('const USERSCRIPT_COMPACT_SCHOOL_NAME = "1SLO IB"') &&
    js.includes("const isUserscriptBuild = () =>") &&
    js.includes("const shouldUseUserscriptMobileUX = () => isUserscriptBuild() && isMobileBrowser()") &&
    js.includes("compactUserscriptSchoolName();"),
  "Safari userscript mobile UX should compact the topbar school name without changing extension builds"
);

assert.ok(
  js.includes('const USERSCRIPT_THEME_DOCK_ID = "idu-plus-userscript-theme-dock"') &&
    js.includes("function buildUserscriptAppearanceDock()") &&
    js.includes("document.createElement(\"details\")") &&
    js.includes("dock.open = false") &&
    js.includes("data-idu-userscript-theme") &&
    js.includes("data-idu-userscript-layout") &&
    js.includes("data-idu-userscript-title-font") &&
    js.includes("data-idu-userscript-accent-preset") &&
    js.includes("data-idu-userscript-topbar-preset") &&
    js.includes("data-idu-userscript-accent-hex") &&
    js.includes("data-idu-userscript-topbar-hex") &&
    js.includes("writeLocalAppearance(nextAppearance)") &&
    js.includes("buildUserscriptAppearanceDock();"),
  "Userscript mode should add a collapsed bottom appearance panel with the full extension settings"
);

assert.ok(
  js.includes('localStorage.getItem(STORAGE_KEY) || "null"'),
  "Userscript mode should keep appearance settings in localStorage instead of losing them"
);

assert.ok(
  /@media \(max-width:\s*760px\)\s*\{[\s\S]*html\.idu-plus,\s*\n\s*html\.idu-plus body[\s\S]*overflow-x:\s*hidden;/.test(css),
  "Mobile CSS should prevent page-level horizontal overflow"
);

assert.ok(
  /@media \(max-width:\s*760px\)[\s\S]*html\.idu-plus #top\s*\{[\s\S]*env\(safe-area-inset-top\)[\s\S]*min-height:\s*0;/.test(css),
  "Mobile topbar should account for iOS safe area and avoid desktop-height header"
);

assert.ok(
  /@media \(max-width:\s*1100px\)[\s\S]*html\.idu-plus #account-actions\s*\{[\s\S]*flex-wrap:\s*nowrap\s*!important;[\s\S]*overflow-x:\s*auto\s*!important;[\s\S]*-webkit-overflow-scrolling:\s*touch;/.test(css) &&
    /@media \(max-width:\s*1100px\)[\s\S]*html\.idu-plus \.idu-sticky-actions-row\s*\{[\s\S]*flex-wrap:\s*nowrap;[\s\S]*overflow-x:\s*auto;/.test(css),
  "Mobile and narrow desktop topbar actions should become smooth horizontal chip rails"
);

assert.ok(
  /@media \(max-width:\s*760px\)[\s\S]*html\.idu-plus \.container\s*\{[\s\S]*gap:\s*14px;/.test(css) &&
    /@media \(max-width:\s*760px\)[\s\S]*html\.idu-plus #site-content,[\s\S]*gap:\s*14px;/.test(css) &&
    /@media \(max-width:\s*760px\)[\s\S]*html\.idu-plus \.module,[\s\S]*margin:\s*0 0 4px\s*!important;/.test(css),
  "Mobile pages should have more breathing room between grade, attendance, schedule, and similar sections"
);

assert.ok(
  /@media \(max-width:\s*760px\)[\s\S]*html\.idu-plus\.idu-profile-page #student-card > table > tbody > tr,[\s\S]*grid-template-columns:\s*1fr;/.test(css) &&
    /@media \(max-width:\s*760px\)[\s\S]*html\.idu-plus\.idu-profile-page #student-data > table > tbody > tr[\s\S]*grid-template-columns:\s*1fr;/.test(css),
  "Mobile profile page should collapse profile and contact cards to one column"
);

assert.ok(
  /@media \(max-width:\s*760px\)[\s\S]*html\.idu-plus \.idu-subject-actions\s*\{[\s\S]*grid-template-columns:\s*repeat\(2,\s*minmax\(0,\s*1fr\)\);/.test(css),
  "Mobile subject actions should align as stable touch-size controls"
);

assert.ok(
  /@media \(max-width:\s*760px\)[\s\S]*html\.idu-plus \.schedule\s*\{[\s\S]*overflow-x:\s*auto;[\s\S]*-webkit-overflow-scrolling:\s*touch;/.test(css) &&
    /@media \(max-width:\s*760px\)[\s\S]*html\.idu-plus \.schedule table\s*\{[\s\S]*min-width:\s*760px;/.test(css),
  "Mobile schedule should stay readable with contained horizontal scrolling instead of page zoom"
);

assert.ok(
  /@media \(max-width:\s*760px\)[\s\S]*html\.idu-plus div\.lesson-cell\s*\{[\s\S]*overflow:\s*hidden;/.test(css) &&
    /@media \(max-width:\s*760px\)[\s\S]*html\.idu-plus \.schedule table tbody td \.subject a\s*\{[\s\S]*overflow-wrap:\s*anywhere;[\s\S]*white-space:\s*normal;[\s\S]*-webkit-line-clamp:\s*2;/.test(css),
  "Mobile schedule lesson names should wrap inside cards instead of overflowing"
);

assert.ok(
  /html\.idu-plus \.idu-userscript-theme-dock\s*\{[\s\S]*display:\s*grid;/.test(css) &&
    /html\.idu-plus \.idu-userscript-theme-dock > summary[\s\S]*cursor:\s*pointer;/.test(css) &&
    /html\.idu-plus \.idu-userscript-appearance-body[\s\S]*display:\s*grid;/.test(css) &&
    /html\.idu-plus \.idu-userscript-theme-switch[\s\S]*grid-template-columns:\s*repeat\(2,\s*minmax\(0,\s*1fr\)\);/.test(css) &&
    /html\.idu-plus \.idu-userscript-layout-switch[\s\S]*display:\s*grid;/.test(css) &&
    /html\.idu-plus \.idu-userscript-title-font-switch[\s\S]*grid-template-columns:\s*repeat\(2,\s*minmax\(0,\s*1fr\)\);/.test(css) &&
    /html\.idu-plus \.idu-userscript-swatch-grid[\s\S]*grid-template-columns:\s*repeat\(6,\s*minmax\(0,\s*1fr\)\);/.test(css) &&
    /html\.idu-plus \.idu-userscript-option\[aria-pressed="true"\]/.test(css),
  "Userscript bottom dock should visually match the extension appearance controls"
);

console.log("mobile safari layout contract ok");
