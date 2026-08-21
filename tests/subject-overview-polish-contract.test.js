const assert = require("assert");
const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const css = fs.readFileSync(path.join(root, "src", "idu-plus.css"), "utf8");
const js = fs.readFileSync(path.join(root, "src", "idu-plus.js"), "utf8");

assert(
  js.includes("const enhanceSubjectOverview") &&
    js.includes('card.dataset.iduSubjectOverview = "true"') &&
    js.match(/enhanceSubjectOverview\(\);/g)?.length >= 2,
  "Subject overview enhancement should be idempotent and support initial plus dynamic IDU content"
);

assert(
  js.includes('row.querySelector(\'a[href*="/klasses/"]\')') &&
    js.includes('teacherRow.classList.add("idu-subject-overview-teacher")') &&
    js.includes("grid.appendChild(classRow)"),
  "The enhancement should preserve real teacher and class links while grouping existing class rows"
);

assert(
  /#subject-card \.idu-subject-overview-title\s*\{[\s\S]*border-bottom:\s*1px solid var\(--idu-line\)\s*!important;/.test(css) &&
    /#subject-card \.idu-subject-overview-teacher\s*\{[\s\S]*background-image:\s*none\s*!important;/.test(css),
  "Legacy bright subject separators and the bitmap teacher icon should be removed"
);

assert(
  /#subject-card \.idu-subject-overview-teacher::before\s*\{[\s\S]*mask:\s*var\(--idu-profile-icon-user\)/.test(css) &&
    /#subject-card \.idu-subject-overview-teacher\s*\{[\s\S]*border:\s*1px solid var\(--idu-line\)/.test(css),
  "Teacher information should use the clean vector icon and theme-aware material tokens"
);

assert(
  /#subject-card \.idu-subject-class-grid\s*\{[\s\S]*grid-template-columns:\s*repeat\(2, minmax\(0, 1fr\)\)/.test(css) &&
    /@media \(max-width: 760px\)[\s\S]*#subject-card \.idu-subject-class-grid\s*\{[\s\S]*grid-template-columns:\s*minmax\(0, 1fr\)/.test(css),
  "Class links should use the available width on desktop and stack cleanly on phones"
);

console.log("subject overview polish contract ok");
