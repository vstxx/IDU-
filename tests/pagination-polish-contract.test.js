const assert = require("assert");
const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const css = fs.readFileSync(path.join(root, "src", "idu-plus.css"), "utf8");

assert(
  /html\.idu-plus \.apple_pagination\s*\{[\s\S]*background:\s*transparent\s*!important;/.test(css) &&
    /html\.idu-plus \.apple_pagination\s*\{[\s\S]*border-top:\s*1px solid var\(--idu-line\)\s*!important;/.test(css),
  "Legacy pagination should not create a white strip inside IDU+ modules"
);

assert(
  /html\.idu-plus \.apple_pagination em\.current\s*\{[\s\S]*background:\s*var\(--idu-accent-soft\)\s*!important;/.test(css) &&
    /html\.idu-plus \.apple_pagination a:hover\s*\{[\s\S]*color:\s*var\(--idu-accent\)\s*!important;/.test(css),
  "Current and hover pagination states should use the selected accent cleanly"
);

console.log("pagination polish contract ok");
