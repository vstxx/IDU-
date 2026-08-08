const assert = require("assert");
const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const css = fs.readFileSync(path.join(root, "src", "idu-plus.css"), "utf8");
const js = fs.readFileSync(path.join(root, "src", "idu-plus.js"), "utf8");

assert(
  js.includes("enhanceSelects") &&
    js.includes("idu-select-source") &&
    js.includes("idu-select-option") &&
    js.includes('dispatchEvent(new Event("change", { bubbles: true }))'),
  "Visible native selects should use the shared accessible dropdown without losing change events"
);

assert(
  /html\.idu-plus select\[style\*="display: none"\]\s*\{[\s\S]*display:\s*none\s*!important;/.test(css),
  "Technical date-part selects hidden by IDU must remain hidden"
);

assert(
  css.includes("html.idu-plus .idu-select-menu") &&
    css.includes("html.idu-plus .idu-select-option.is-selected") &&
    css.includes("html.idu-plus .chosen-container .chosen-results li.active-result:hover"),
  "Native and Chosen menus should use matching option surfaces and selected states"
);

assert(
  js.includes("enhanceScheduleForms") &&
    js.includes("iduScheduleForm") &&
    js.includes("iduRangeLabel") &&
    js.includes("idu-schedule-print-link"),
  "Detailed schedule forms and print links should receive explicit layout hooks"
);

assert(
  /html\.idu-plus \.schedule-form\s*\{[\s\S]*grid-template-columns:\s*repeat\(2, minmax\(190px, 240px\)\) auto;/.test(css) &&
    /html\.idu-plus \.schedule-form \.datepicker-input\s*\{[\s\S]*width:\s*100%\s*!important;/.test(css) &&
    css.includes("html.idu-plus .idu-schedule-print-link"),
  "Detailed schedule controls should form a compact aligned date range"
);

assert(
  /html\.idu-plus \.idu-schedule-print-link \+ \.idu-plus-ics-export\s*\{[\s\S]*margin-left:\s*0;/.test(css) &&
    /html\.idu-plus \.idu-schedule-print-link\s*\{[\s\S]*font-family:\s*var\(--idu-font\)\s*!important;[\s\S]*font-weight:\s*650\s*!important;/.test(css) &&
    js.includes(":not(.idu-schedule-print-link)"),
  "Print, calendar, and collapse actions should form one matching button group"
);

console.log("dropdown and schedule polish contract ok");
