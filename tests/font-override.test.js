const assert = require("assert");
const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const css = fs.readFileSync(path.join(root, "src", "idu-plus.css"), "utf8");
const manifest = JSON.parse(fs.readFileSync(path.join(root, "manifest.json"), "utf8"));

assert(
  css.includes('--idu-font: "InterVariable", Inter, "Segoe UI", Arial, sans-serif;'),
  "CSS should define a single Inter font stack token"
);

assert(
  css.includes('src: url("../fonts/Inter-Regular.woff2") format("woff2");'),
  "Regular Inter face should load from /fonts"
);

assert(
  css.includes('src: url("../fonts/Inter-Medium.woff2") format("woff2");'),
  "Medium Inter face should load from /fonts"
);

assert(
  /html\.idu-plus body \*,[\s\S]*font-family:\s*var\(--idu-font\)\s*!important;/.test(css),
  "CSS should force Inter on all IDU text descendants"
);

const resources = manifest.web_accessible_resources.flatMap((entry) => entry.resources);

assert(
  resources.includes("fonts/*.woff2"),
  "Manifest should expose /fonts Inter files to content CSS"
);

for (const fontFile of ["Inter-Regular.woff2", "Inter-Medium.woff2"]) {
  assert(
    fs.existsSync(path.join(root, "fonts", fontFile)),
    `${fontFile} should exist in /fonts`
  );
}

console.log("font override contract ok");
