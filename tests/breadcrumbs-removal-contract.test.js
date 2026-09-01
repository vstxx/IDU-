const assert = require("assert");
const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const css = fs.readFileSync(path.join(root, "src", "idu-plus.css"), "utf8");
const js = fs.readFileSync(path.join(root, "src", "idu-plus.js"), "utf8");

assert(
  /html\.idu-plus #breadcrumbs-section,\s*html\.idu-plus #breadcrumbs\s*\{\s*display:\s*none\s*!important;/.test(css),
  "Breadcrumbs should be hidden immediately on desktop and mobile"
);

assert(
  /const removeBreadcrumbs = \(\) => \{[\s\S]*?#breadcrumbs-section[\s\S]*?\.remove\(\);[\s\S]*?#breadcrumbs[\s\S]*?\.remove\(\);[\s\S]*?\};/.test(js) &&
    /const markPageType = \(\) => \{\s*removeBreadcrumbs\(\);/.test(js),
  "Breadcrumb containers should be removed from the DOM, including dynamically restored markup"
);

console.log("Breadcrumb removal contract passed.");
