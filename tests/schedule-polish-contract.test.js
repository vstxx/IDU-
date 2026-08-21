const assert = require("assert");
const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const css = fs.readFileSync(path.join(root, "src", "idu-plus.css"), "utf8");
const js = fs.readFileSync(path.join(root, "src", "idu-plus.js"), "utf8");

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
  /const enhanceScheduleTimeLabels = \(\) => \{/.test(js) &&
    /const slot = SCHEDULE_LESSON_SLOTS\[lessonNumber\];/.test(js) &&
    /time\.textContent = range;/.test(js) &&
    /enhanceScheduleTimeLabels\(\);/.test(js),
  "Schedule row labels should reuse the ICS lesson times and be enhanced on every page pass"
);

assert(
  /html\.idu-plus \.schedule table thead th:first-child\s*\{[\s\S]*width:\s*54px;/.test(css) &&
    /html\.idu-plus \.schedule table tbody td:first-child\s*\{[\s\S]*width:\s*54px;/.test(css) &&
    /html\.idu-plus \.idu-schedule-slot-time\s*\{[\s\S]*font-size:\s*8\.5px;/.test(css),
  "Schedule number column should stay narrow while showing a compact time range"
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

assert(
  /html\.idu-plus div\.lesson-cell\.canceled\s*\{[\s\S]*border-color:\s*rgba\(239, 68, 68, 0\.72\)/.test(css) &&
    /html\.idu-plus div\.lesson-cell\.canceled\s*\{[\s\S]*background:[\s\S]*rgba\(239, 68, 68, 0\.22\)/.test(css) &&
    /html\.idu-plus div\.lesson-cell\.canceled \.subject a,[\s\S]*html\.idu-plus div\.lesson-cell\.canceled \.location\s*\{[\s\S]*text-decoration-line:\s*underline;/.test(css),
  "Canceled lessons should be visibly red and underlined instead of looking like normal lesson cards"
);

console.log("schedule polish contract ok");
