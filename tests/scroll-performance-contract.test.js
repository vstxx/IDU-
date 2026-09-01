const assert = require("assert");
const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const css = fs.readFileSync(path.join(root, "src", "idu-plus.css"), "utf8");
const js = fs.readFileSync(path.join(root, "src", "idu-plus.js"), "utf8");

const blurRule = css.match(
  /html\.idu-plus #top,[\s\S]*?backdrop-filter:\s*blur\(var\(--idu-glass-blur\)\) saturate\(var\(--idu-glass-saturation\)\);\s*\}/
)?.[0] || "";

for (const scrollingSurface of [".module", ".module-important", ".action-module", "#student-card", "#subject-card", ".profile-event"]) {
  assert(!blurRule.includes(scrollingSurface), `${scrollingSurface} should not carry a live backdrop blur while scrolling`);
}

assert(
  /@supports \(content-visibility: auto\)[\s\S]*?\.profile-event\s*\{[\s\S]*?content-visibility:\s*auto;[\s\S]*?contain-intrinsic-block-size:\s*auto 76px;/.test(css),
  "Long activity feeds should skip off-screen rendering when the browser supports it"
);

assert(
  !/\.foldable\s*\{[^}]*will-change:\s*height, opacity;/s.test(css) &&
    /\.foldable\.idu-foldable-animating\s*\{[^}]*will-change:\s*height, opacity;/s.test(css),
  "Foldables should only reserve compositor resources while they are actually animating"
);

assert(
  js.includes('typeof window.requestIdleCallback === "function"') &&
    js.includes("window.requestIdleCallback(run, { timeout: 480 })") &&
    js.includes('document.addEventListener("visibilitychange"') &&
    /if \(document\.hidden \|\| dynamicEnhancementRunning\)\s*\{\s*return;/.test(js),
  "Dynamic full-page enhancement scans should run when the main thread is idle and pause in hidden tabs"
);

assert(
  /heading\.dataset\.iduTitleFont !== normalizedTitleFont/.test(js) &&
    /child\.style\.getPropertyValue\("font-family"\) !== "inherit"/.test(js),
  "Repeated dynamic passes should not rewrite unchanged title styles"
);

console.log("scroll performance contract ok");
