import { existsSync, readFileSync } from "node:fs";
import path from "node:path";

const root = process.cwd();
const required = [
  "manifest.json",
  "content/idu-modern.css",
  "content/idu-modern.js",
  "popup/popup.html",
  "popup/popup.css",
  "popup/popup.js",
  "icons/icon16.png",
  "icons/icon32.png",
  "icons/icon48.png",
  "icons/icon128.png"
];

let ok = true;
for (const file of required) {
  const full = path.join(root, file);
  if (!existsSync(full)) {
    console.error(`Missing: ${file}`);
    ok = false;
  }
}

try {
  const manifest = JSON.parse(readFileSync(path.join(root, "manifest.json"), "utf8"));
  if (manifest.manifest_version !== 3) {
    console.error("manifest.json must use manifest_version 3.");
    ok = false;
  }
  if (!/^\d+\.\d+\.\d+$/.test(manifest.version || "")) {
    console.error("manifest.json version must be a valid x.y.z semver string.");
    ok = false;
  }
  if (manifest.name !== "IDU+") {
    console.error("manifest.json name should be IDU+.");
    ok = false;
  }
  const matches = manifest.content_scripts?.flatMap((script) => script.matches || []) || [];
  if (!matches.includes("https://s19.idu.edu.pl/*")) {
    console.error("Missing content script match for https://s19.idu.edu.pl/*");
    ok = false;
  }
  for (const script of manifest.content_scripts || []) {
    for (const file of [...(script.css || []), ...(script.js || [])]) {
      if (!existsSync(path.join(root, file))) {
        console.error(`Content script points to missing file: ${file}`);
        ok = false;
      }
    }
  }
} catch (error) {
  console.error("manifest.json is not valid JSON:", error.message);
  ok = false;
}

for (const file of ["content/idu-modern.css", "popup/popup.css"]) {
  const source = readFileSync(path.join(root, file), "utf8");
  if (/@import\s+url\(\s*["']?https?:\/\//i.test(source)) {
    console.error(`${file} must not import remote stylesheets.`);
    ok = false;
  }
}

if (!ok) process.exit(1);
console.log("IDU+ extension workspace check passed.");
