const assert = require("assert");
const fs = require("fs");
const path = require("path");
const { listZipEntries } = require("./zip-helpers");

const root = path.resolve(__dirname, "..");
const releaseRoot = path.join(root, "release", "idu-plus-firefox-addon");
const manifestPath = path.join(releaseRoot, "manifest.json");

assert(fs.existsSync(releaseRoot), "Firefox release folder should exist");
assert(fs.existsSync(manifestPath), "Firefox release manifest should exist");
assert(fs.existsSync(path.join(root, "release", "idu-plus-firefox-addon.zip")), "Firefox ZIP package should exist");
assert(fs.existsSync(path.join(root, "release", "idu-plus-firefox-addon.xpi")), "Firefox XPI package should exist");

for (const archiveName of ["idu-plus-firefox-addon.zip", "idu-plus-firefox-addon.xpi"]) {
  const entries = listZipEntries(path.join(root, "release", archiveName));
  assert(entries.includes("assets/icon-128.png"), `${archiveName} should use a valid forward-slash icon path`);
  assert(!entries.some((entry) => entry.includes("\\")), `${archiveName} should not contain Windows-style paths`);
}

const manifestBytes = fs.readFileSync(manifestPath);
assert.notEqual(manifestBytes[0], 0xef, "Firefox manifest should be UTF-8 without a BOM");

const manifest = JSON.parse(manifestBytes.toString("utf8"));
const gecko = manifest.browser_specific_settings?.gecko;
const geckoAndroid = manifest.browser_specific_settings?.gecko_android;

assert.equal(manifest.manifest_version, 3, "Firefox package should stay on Manifest V3");
assert.equal(manifest.version, "0.3.12", "Firefox package should use the current IDU+ release version");
assert.equal(gecko?.id, "idu-plus@vstxx.github.io", "Firefox package should declare a stable Gecko add-on ID");
assert.equal(
  gecko?.strict_min_version,
  "140.0",
  "Firefox package should declare a minimum version that supports built-in data collection disclosure"
);
assert.deepEqual(
  gecko?.data_collection_permissions,
  { required: ["personallyIdentifyingInfo"] },
  "Firefox package should disclose the displayed name and identity-linked diagnostics described by the privacy policy"
);
assert.equal(
  geckoAndroid?.strict_min_version,
  "142.0",
  "Firefox package should avoid Android data disclosure compatibility warnings"
);
assert.equal(manifest.action?.default_popup, "popup.html", "Firefox package should keep the settings popup");
assert.equal(manifest.icons?.["128"], "assets/icon-128.png", "Firefox package should include the extension icon");
assert.deepEqual(
  manifest.content_scripts?.[0]?.js,
  ["src/diagnostics.js", "src/idu-plus.js"],
  "Firefox package should load diagnostics before the main content script"
);
assert(!manifest.host_permissions, "Firefox package should not request broad host permissions");

for (const filePath of [
  "popup.html",
  "src/diagnostics.js",
  "src/idu-plus.css",
  "src/idu-plus.js",
  "src/popup.css",
  "src/popup.js",
  "assets/idu-plus-logo.png",
  "assets/icon-128.png",
  "fonts/Inter-Regular.woff2",
  "fonts/Aligra.woff2"
]) {
  assert(fs.existsSync(path.join(releaseRoot, filePath)), `Firefox package should include ${filePath}`);
}

const releaseText = [
  "manifest.json",
  "popup.html",
  "src/diagnostics.js",
  "src/idu-plus.js",
  "src/popup.js",
  "src/popup.css"
]
  .map((relativePath) => fs.readFileSync(path.join(releaseRoot, relativePath), "utf8"))
  .join("\n");

assert(!releaseText.includes(["discord.com/api", "webhooks"].join("/")), "Firefox release must not contain a Discord webhook URL");
assert(
  !/\.innerHTML\s*=|\.outerHTML\s*=|insertAdjacentHTML\s*\(/.test(releaseText),
  "Firefox release should not contain unsafe HTML assignment patterns"
);

console.log("firefox release contract ok");
