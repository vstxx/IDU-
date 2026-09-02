const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const outDir = path.join(root, "release", "idu-plus-safari-userscript");
const outFile = path.join(outDir, "IDU+.user.js");

const readText = (relativePath) => fs.readFileSync(path.join(root, relativePath), "utf8");
const readBase64 = (relativePath) => fs.readFileSync(path.join(root, relativePath)).toString("base64");
const releaseVersion = JSON.parse(readText("manifest.json")).version;

const fontReplacements = new Map([
  ["../fonts/Inter-Regular.woff2", "fonts/Inter-Regular.woff2"],
  ["../fonts/Inter-Medium.woff2", "fonts/Inter-Medium.woff2"],
  ["../fonts/Aligra.woff2", "fonts/Aligra.woff2"],
  ["../fonts/Audex-Regular.woff2", "fonts/Audex-Regular.woff2"],
  ["../fonts/Otfits Grotesk Reg Trial.woff2", "fonts/Otfits Grotesk Reg Trial.woff2"]
]);

let css = readText("src/idu-plus.css");

for (const [cssPath, filePath] of fontReplacements) {
  const fontDataUrl = `data:font/woff2;base64,${readBase64(filePath)}`;
  css = css.replaceAll(`url("${cssPath}")`, `url("${fontDataUrl}")`);
}

const logoDataUrl = `data:image/png;base64,${readBase64("assets/idu-plus-logo.png")}`;
const diagnosticsScript = readText("src/diagnostics.js");
const contentScript = readText("src/idu-plus.js").replace(
  'const LOGO_ASSET_PATH = "assets/idu-plus-logo.png";',
  `const LOGO_ASSET_PATH = "${logoDataUrl}";`
);

const metadata = `// ==UserScript==
// @name         IDU+
// @namespace    https://vstxx.github.io/IDU-/
// @version      ${releaseVersion}
// @description  Modern glassy visual layer for the IDU school portal with themes, accent colors, fonts, and layouts.
// @author       IDU+
// @homepageURL  https://vstxx.github.io/IDU-/
// @supportURL   https://github.com/vstxx/IDU-/issues
// @match        https://*.idu.edu.pl/*
// @run-at       document-start
// @noframes
// @grant        none
// ==/UserScript==
`;

const userScript = `${metadata}
(() => {
  "use strict";

  document.documentElement.classList.add("idu-userscript-build");
  window.__IDU_PLUS_USERSCRIPT__ = true;
  window.__IDU_PLUS_USERSCRIPT_VERSION__ = ${JSON.stringify(releaseVersion)};

  const css = ${JSON.stringify(css)};
  const style = document.createElement("style");
  style.id = "idu-plus-userscript-style";
  style.textContent = css;
  (document.head || document.documentElement).appendChild(style);

${diagnosticsScript}

${contentScript}
})();
`;

fs.mkdirSync(outDir, { recursive: true });
fs.writeFileSync(outFile, userScript, "utf8");

console.log(`Built ${path.relative(root, outFile)}`);
