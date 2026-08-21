const assert = require("assert");
const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const css = fs.readFileSync(path.join(root, "src", "idu-plus.css"), "utf8");
const js = fs.readFileSync(path.join(root, "src", "idu-plus.js"), "utf8");

assert(
  js.includes("const enhanceScheduleLessonStacks") &&
    js.includes('cell.classList.toggle("idu-schedule-multi-lesson", multipleLessons)') &&
    js.includes("cell.dataset.iduLessonCount = String(lessonCards.length)") &&
    js.includes("enhanceScheduleLessonStacks();"),
  "Every schedule should detect cells containing multiple simultaneous lessons"
);

assert(
  /td\.lesson\.idu-schedule-multi-lesson,[\s\S]*height:\s*auto\s*!important;/.test(css) &&
    /td\.lesson\.idu-schedule-multi-lesson > \.lesson-cell,[\s\S]*height:\s*auto\s*!important;/.test(css),
  "Multi-lesson cells and cards must grow naturally instead of repeating a 100% row height"
);

assert(
  /td\.lesson:has\(> \.lesson-cell ~ \.lesson-cell\)/.test(css) &&
    /td\.lesson\.idu-schedule-multi-lesson > \.lesson-cell-line,[\s\S]*height:\s*4px;/.test(css),
  "CSS should provide a dynamic-DOM fallback and a controlled separator between stacked lessons"
);

assert(
  /td\.lesson\.idu-schedule-multi-lesson,[\s\S]*overflow:\s*hidden;/.test(css) &&
    /td\.lesson\.idu-schedule-multi-lesson,[\s\S]*vertical-align:\s*top;/.test(css),
  "Stacked lessons should stay clipped to their own expanded table row"
);

console.log("schedule multi-lesson contract ok");
