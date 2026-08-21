const assert = require("assert");
const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const css = fs.readFileSync(path.join(root, "src", "idu-plus.css"), "utf8");
const js = fs.readFileSync(path.join(root, "src", "idu-plus.js"), "utf8");

assert(
  js.includes('root.classList.toggle("idu-class-page", classPage)') &&
    js.includes('card.classList.toggle("idu-class-overview", isClassOverview)') &&
    js.includes("/prowadz|teacher|wychowawc|tutor/i"),
  "All class overview pages should receive stable hooks for year and tutor information"
);

assert(
  js.includes("const enhanceStudentLists") &&
    js.includes('document.querySelectorAll("ul.students")') &&
    js.match(/enhanceStudentLists\(\);/g)?.length >= 2,
  "Student lists should be enhanced on both initial and dynamically loaded class or subject content"
);

assert(
  js.includes('row.querySelector(\'a[href^="/students/"]\')') &&
    js.includes('row.querySelector(".avatar")?.classList.add("idu-student-list-avatar")') &&
    js.includes('row.querySelector(".name")?.classList.add("idu-student-list-name")'),
  "The enhancement should preserve real student links, photos, and names"
);

assert(
  /html\.idu-plus ul\.idu-student-list\s*\{[\s\S]*grid-template-columns:\s*repeat\(auto-fit, minmax\(min\(100%, 220px\), 1fr\)\)/.test(css) &&
    /\.idu-student-list-item\s*\{[\s\S]*counter-increment:\s*idu-student/.test(css),
  "Student lists should use available width with stable, compact numbering"
);

assert(
  /\.idu-student-list-avatar\s*\{[\s\S]*border-radius:\s*50%/.test(css) &&
    /\.idu-student-list-avatar::before\s*\{[\s\S]*mask:\s*var\(--idu-profile-icon-user\)/.test(css) &&
    /\.idu-student-list-avatar img\s*\{[\s\S]*object-fit:\s*cover/.test(css),
  "Student photos and privacy-safe fallbacks should stay circular and readable"
);

assert(
  /html\.idu-plus\.idu-class-page #content\s*\{[\s\S]*minmax\(420px, 0\.82fr\)/.test(css) &&
    /@media \(max-width: 1100px\)[\s\S]*html\.idu-plus\.idu-class-page #content\s*\{[\s\S]*grid-template-columns:\s*minmax\(0, 1fr\)/.test(css),
  "Class pages should give student lists useful desktop width and stack safely on narrow screens"
);

console.log("class and student list polish contract ok");
