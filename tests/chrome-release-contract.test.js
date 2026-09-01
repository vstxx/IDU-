const assert = require("assert");
const fs = require("fs");
const path = require("path");
const { listZipEntries } = require("./zip-helpers");

const root = path.resolve(__dirname, "..");
const releaseRoot = path.join(root, "release", "idu-plus-chrome-web-store");
const manifestPath = path.join(releaseRoot, "manifest.json");

assert(fs.existsSync(releaseRoot), "Chrome release folder should exist");
assert(fs.existsSync(manifestPath), "Chrome release manifest should exist");
assert(fs.existsSync(path.join(root, "release", "idu-plus-chrome-web-store.zip")), "Chrome Web Store ZIP package should exist");

const chromeArchiveEntries = listZipEntries(path.join(root, "release", "idu-plus-chrome-web-store.zip"));
assert(chromeArchiveEntries.includes("assets/icon-128.png"), "Chrome ZIP should use portable forward-slash asset paths");
assert(!chromeArchiveEntries.some((entry) => entry.includes("\\")), "Chrome ZIP should not contain Windows-style paths");

const manifestBytes = fs.readFileSync(manifestPath);
assert.notEqual(manifestBytes[0], 0xef, "Chrome manifest should be UTF-8 without a BOM");

const manifest = JSON.parse(manifestBytes.toString("utf8"));

assert.equal(manifest.manifest_version, 3, "Chrome package should stay on Manifest V3");
assert.equal(manifest.version, "0.3.11", "Chrome package should use the current IDU+ release version");
assert.equal(manifest.action?.default_popup, "popup.html", "Chrome package should keep the settings popup");
assert.deepEqual(
  manifest.content_scripts?.[0]?.js,
  ["src/diagnostics.js", "src/idu-plus.js"],
  "Chrome package should load diagnostics before the main content script"
);
assert(!manifest.host_permissions, "Chrome package should not request broad host permissions");

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
  assert(fs.existsSync(path.join(releaseRoot, filePath)), `Chrome package should include ${filePath}`);
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

assert(!releaseText.includes(["discord.com/api", "webhooks"].join("/")), "Chrome release must not contain a Discord webhook URL");

console.log("chrome release contract ok");
