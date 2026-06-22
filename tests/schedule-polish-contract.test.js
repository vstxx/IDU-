const assert = require("assert");
const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const css = fs.readFileSync(path.join(root, "src", "idu-plus.css"), "utf8");

assert(
  /html\.idu-plus \.schedule\s*\{[\s\S]*border-radius:\s*var\(--idu-radius-lg\)/.test(css) &&
    /html\.idu-plus \.schedule\s*\{[\s\S]*background:\s*var\(--idu-surface-soft\)/.test(css),
  "Schedule wrapper should become a single modern glass surface"
);

assert(
  /html\.idu-plus \.schedule table\s*\{[\s\S]*border-spacing:\s*4px\s*!important;/.test(css) &&
    /html\.idu-plus \.schedule table\s*\{[\s\S]*background:\s*transparent\s*!important;/.test(css),
  "Schedule table should use spacing between cells and avoid a second table background"
);

assert(
  /html\.idu-plus \.schedule\s*\{[\s\S]*padding:\s*8px;/.test(css) &&
    /html\.idu-plus \.schedule table\s*\{[\s\S]*border-spacing:\s*4px\s*!important;/.test(css) &&
    /html\.idu-plus \.schedule\s*\{[\s\S]*--idu-schedule-slot-height:\s*78px;/.test(css) &&
    /html\.idu-plus \.schedule table tbody td\s*\{[\s\S]*height:\s*var\(--idu-schedule-slot-height\);/.test(css),
  "Schedule should use a balanced compact table rhythm"
);

assert(
  /html\.idu-plus \.schedule table\s*\{[\s\S]*width:\s*100%;/.test(css) &&
    /html\.idu-plus \.schedule table\s*\{[\s\S]*table-layout:\s*fixed;/.test(css) &&
    /html\.idu-plus \.schedule table tbody td\s*\{[\s\S]*vertical-align:\s*middle;/.test(css),
  "Schedule rows and columns should stay evenly aligned"
);

assert(
  /html\.idu-plus \.schedule table tbody td\s*\{[\s\S]*background:\s*transparent\s*!important;/.test(css) &&
    /html\.idu-plus \.schedule table tbody td\s*\{[\s\S]*border:\s*0\s*!important;/.test(css),
  "Empty schedule cells should not create the double-background grid effect"
);

assert(
  /html\.idu-plus \.schedule table tbody td\.lesson\s*\{[\s\S]*background:\s*transparent\s*!important;/.test(css) &&
    /html\.idu-plus div\.lesson-cell\s*\{[\s\S]*background:\s*var\(--idu-lesson-bg\)\s*!important;/.test(css),
  "Only lesson cards should carry the lesson surface, not both td.lesson and lesson-cell"
);

assert(
  css.includes("--idu-lesson-bg") &&
    css.includes("--idu-lesson-border") &&
    css.includes("--idu-lesson-shadow"),
  "Schedule lesson cards should use dedicated theme-aware tokens"
);

assert(
  /html\.idu-plus div\.lesson-cell\s*\{[\s\S]*place-items:\s*center;/.test(css) &&
    /html\.idu-plus div\.lesson-cell\s*\{[\s\S]*align-content:\s*center;/.test(css) &&
    /html\.idu-plus div\.lesson-cell\s*\{[\s\S]*min-height:\s*calc\(var\(--idu-schedule-slot-height\) - 8px\);/.test(css) &&
    /html\.idu-plus div\.lesson-cell\s*\{[\s\S]*height:\s*100%;/.test(css) &&
    /html\.idu-plus div\.lesson-cell\s*\{[\s\S]*box-sizing:\s*border-box;/.test(css) &&
    /html\.idu-plus div\.lesson-cell\s*\{[\s\S]*padding:\s*8px 10px;/.test(css) &&
    /html\.idu-plus div\.lesson-cell > br\s*\{[\s\S]*display:\s*none\s*!important;/.test(css) &&
    /html\.idu-plus \.schedule table tbody td \.location\s*\{[\s\S]*display:\s*inline-flex;/.test(css) &&
    /html\.idu-plus \.schedule table tbody td \.location\s*\{[\s\S]*margin-top:\s*4px;/.test(css) &&
    /html\.idu-plus \.schedule table tbody td \.location br\s*\{[\s\S]*display:\s*none\s*!important;/.test(css) &&
    /html\.idu-plus \.schedule table tbody td \.subject \+ \.location\s*\{[\s\S]*margin-top:\s*5px;/.test(css),
  "Lesson cards should stay comfortable while keeping room numbers close to lesson names"
);

console.log("schedule polish contract ok");
