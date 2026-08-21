const assert = require("assert");
const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const css = fs.readFileSync(path.join(root, "src", "idu-plus.css"), "utf8");
const js = fs.readFileSync(path.join(root, "src", "idu-plus.js"), "utf8");

assert(
  js.includes("const enhanceGroupedSubjectList") &&
    js.includes('higher: "Higher"') &&
    js.includes('standard: "Standard"') &&
    js.includes('getCurrentLocale() === "en" ? "Other" : "Inne"'),
  "Nested profile subjects should be normalized into Higher, Standard, and localized Other groups"
);

assert(
  js.includes('section.dataset.iduSubjectLevel = level') &&
    js.includes('row.className = "idu-profile-subject-row"') &&
    js.includes("teachers.appendChild(teacher)"),
  "The enhancement should preserve real subject and teacher links in semantic sections"
);

assert(
  /html\.idu-plus \.idu-profile-subject-groups\s*\{[\s\S]*grid-template-columns:\s*repeat\(3, minmax\(0, 1fr\)\)/.test(css) &&
    /html\.idu-plus \.idu-profile-subject-group\s*\{[\s\S]*background:\s*var\(--idu-row-bg-soft\)/.test(css),
  "Desktop profile subjects should use three restrained material sections"
);

assert(
  /html\.idu-plus \.idu-profile-subject-row\s*\{[\s\S]*border-bottom:\s*1px solid var\(--idu-line\)/.test(css) &&
    /html\.idu-plus \.idu-profile-subject-teachers\s*\{[\s\S]*color:\s*var\(--idu-muted\)/.test(css),
  "Subjects should use calm separators and secondary teacher typography"
);

assert(
  /@media \(max-width: 760px\)[\s\S]*html\.idu-plus \.idu-profile-subject-groups\s*\{[\s\S]*grid-template-columns:\s*minmax\(0, 1fr\)/.test(css),
  "Subject groups should stack into one column on phones"
);

console.log("profile subject groups contract ok");
