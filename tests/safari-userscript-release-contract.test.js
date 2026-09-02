const assert = require("assert");
const fs = require("fs");
const path = require("path");
const { listZipEntries } = require("./zip-helpers");

const root = path.resolve(__dirname, "..");
const releaseDir = path.join(root, "release", "idu-plus-safari-userscript");
const userScriptPath = path.join(releaseDir, "IDU+.user.js");

assert.ok(fs.existsSync(releaseDir), "Safari userscript release folder should exist");
assert.ok(fs.existsSync(userScriptPath), "Safari userscript file should exist");

const safariArchiveEntries = listZipEntries(path.join(root, "release", "idu-plus-safari-userscript.zip"));
assert.ok(safariArchiveEntries.includes("IDU+.user.js"), "Safari ZIP should contain the installable userscript at its root");
assert.ok(!safariArchiveEntries.some((entry) => entry.includes("\\")), "Safari ZIP should use portable entry paths");

const userScript = fs.readFileSync(userScriptPath, "utf8");
const firstBytes = fs.readFileSync(userScriptPath).subarray(0, 3);

assert.notDeepStrictEqual([...firstBytes], [0xef, 0xbb, 0xbf], "Userscript should not include a UTF-8 BOM");
assert.ok(userScript.startsWith("// ==UserScript=="), "Userscript should start with metadata block");
assert.ok(userScript.includes("// @name         IDU+"), "Userscript should declare IDU+ name");
assert.ok(userScript.includes("// @version      0.3.12"), "Userscript should use release version 0.3.12");
assert.ok(userScript.includes("// @match        https://*.idu.edu.pl/*"), "Userscript should target IDU portals");
assert.ok(userScript.includes("// @run-at       document-start"), "Userscript should run at document-start");
assert.ok(userScript.includes("// @grant        none"), "Userscript should not require userscript manager grants");
assert.ok(userScript.includes("globalScope.IDUPlusDiagnostics = diagnostics"), "Userscript should bundle the diagnostics helper");
assert.ok(
  userScript.includes('window.__IDU_PLUS_USERSCRIPT_VERSION__ = "0.3.12"') &&
    userScript.includes("fallbackStorage") &&
    userScript.includes("diagnostics:${stage}"),
  "Safari diagnostics should have a version, persistent local fallback, and safe stage logging"
);
assert.ok(userScript.includes("data:font/woff2;base64,"), "Userscript should embed extension fonts");
assert.ok(userScript.includes("data:image/png;base64,"), "Userscript should embed IDU+ logo");
assert.ok(!userScript.includes("../fonts/"), "Userscript should not reference extension font paths");
assert.ok(!userScript.includes("\"assets/idu-plus-logo.png\""), "Userscript should not reference extension asset paths");
assert.ok(userScript.includes("idu-plus-userscript-style"), "Userscript should inject bundled CSS");
assert.ok(
  userScript.includes('localStorage.getItem(STORAGE_KEY) || "null"'),
  "Userscript should load appearance settings from page localStorage"
);
assert.ok(
  userScript.includes('const MOBILE_VIEWPORT_CONTENT = "width=device-width, initial-scale=1, viewport-fit=cover"') &&
    userScript.includes("root.classList.add(\"idu-mobile-web-app\")"),
  "Userscript should include the mobile Safari viewport hardening"
);
assert.ok(
  userScript.includes('document.documentElement.classList.add("idu-userscript-build")') &&
    userScript.includes("window.__IDU_PLUS_USERSCRIPT__ = true") &&
    userScript.includes("const normalizeSchoolName = () =>") &&
    userScript.includes("schoolName.textContent = schoolName.dataset.iduOriginalSchoolName") &&
    userScript.includes("grid-template-columns: 104px minmax(0, 1fr)") &&
    !userScript.includes('const USERSCRIPT_COMPACT_SCHOOL_NAME = "1SLO IB"'),
  "Userscript should mark itself and keep the full school name beside the mobile logo"
);
assert.ok(
  userScript.includes('const USERSCRIPT_THEME_DOCK_ID = "idu-plus-userscript-theme-dock"') &&
    userScript.includes("data-idu-userscript-theme") &&
    userScript.includes("data-idu-userscript-layout") &&
    userScript.includes("data-idu-userscript-title-font") &&
    userScript.includes("data-idu-userscript-accent-preset") &&
    userScript.includes("data-idu-userscript-topbar-preset") &&
    userScript.includes("document.createElement(\"details\")") &&
    userScript.includes("dock.open = false") &&
    userScript.includes("writeLocalAppearance(nextAppearance)"),
  "Userscript should include the collapsed bottom appearance settings panel"
);

console.log("safari userscript release contract ok");
