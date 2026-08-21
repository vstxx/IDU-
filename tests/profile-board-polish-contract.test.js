const assert = require("assert");
const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const css = fs.readFileSync(path.join(root, "src", "idu-plus.css"), "utf8");
const js = fs.readFileSync(path.join(root, "src", "idu-plus.js"), "utf8");

assert(
  js.includes("const enhanceProfileBoards") &&
    js.includes('module.classList.add("idu-board-module")') &&
    js.includes('surface.classList.add("idu-board-surface")') &&
    js.includes("enhanceProfileBoards();"),
  "Profile boards should receive stable semantic hooks without changing their content"
);

assert(
  /html\.idu-plus \.idu-board-module \.idu-board-surface\s*\{[\s\S]*border:\s*1px solid var\(--idu-border\)\s*!important;/.test(css) &&
    /html\.idu-plus \.idu-board-module \.idu-board-surface\s*\{[\s\S]*background-color:\s*var\(--idu-row-bg-soft\)\s*!important;/.test(css),
  "Legacy inline board backgrounds and thick borders should be replaced by the material system"
);

assert(
  /html\.idu-plus\[data-idu-theme="dark"\] \.idu-board-module \.idu-board-surface\s*\{[\s\S]*color:\s*var\(--idu-text-soft\)\s*!important;/.test(css) &&
    /html\.idu-plus \.idu-board-surface strong,[\s\S]*color:\s*var\(--idu-text\)\s*!important;/.test(css),
  "Board copy and emphasis should remain readable in dark mode"
);

assert(
  /@media \(max-width: 760px\)[\s\S]*html\.idu-plus \.idu-board-module \.idu-board-surface\s*\{[\s\S]*padding:\s*15px 16px\s*!important;/.test(css),
  "Board spacing should tighten on phones"
);

console.log("profile board polish contract ok");
