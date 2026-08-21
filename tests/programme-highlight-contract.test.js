const assert = require("assert");
const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const css = fs.readFileSync(path.join(root, "src", "idu-plus.css"), "utf8");
const js = fs.readFileSync(path.join(root, "src", "idu-plus.js"), "utf8");

assert(
  js.includes("highlightProgrammeTokens") &&
    js.includes("TreeWalker") &&
    js.includes("iduProgrammePattern") &&
    js.includes("idu-programme-badge"),
  "Content script should walk text nodes and wrap programme tokens in badge spans"
);

["MYP5", "MYP4", "DP1", "DP2"].forEach((programme) => {
  assert(
    js.includes(`idu-programme-${programme.toLowerCase()}`),
    `Content script should assign a distinct class for ${programme}`
  );
});

assert(
  js.includes("SCRIPT") &&
    js.includes("STYLE") &&
    js.includes("TEXTAREA") &&
    js.includes("INPUT") &&
    js.includes("SELECT"),
  "Programme highlighting should skip unsafe and editable elements"
);

assert(
    /html\.idu-plus \.idu-programme-badge[\s\S]*border:\s*0\s*!important;/.test(css) &&
    /html\.idu-plus \.idu-programme-badge[\s\S]*background:\s*transparent\s*!important;/.test(css) &&
    /html\.idu-plus \.idu-programme-badge[\s\S]*text-decoration-line:\s*underline;/.test(css) &&
    /html\.idu-plus \.idu-programme-badge[\s\S]*text-shadow:\s*none\s*!important;/.test(css) &&
    /html\.idu-plus \.idu-programme-myp5/.test(css) &&
    /html\.idu-plus \.idu-programme-myp4/.test(css) &&
    /html\.idu-plus \.idu-programme-dp1/.test(css) &&
    /html\.idu-plus \.idu-programme-dp2/.test(css),
  "CSS should style programme markers as colored text accents without pill outlines"
);

console.log("programme highlight contract ok");
