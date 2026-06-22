const assert = require("assert");
const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const css = fs.readFileSync(path.join(root, "src", "idu-plus.css"), "utf8");
const js = fs.readFileSync(path.join(root, "src", "idu-plus.js"), "utf8");

assert(
  js.includes("findDocumentsModule") &&
    js.includes("idu-documents-page") &&
    js.includes("enhanceDocumentsSearch") &&
    js.includes("idu-documents-module") &&
    js.includes("idu-documents-search"),
  "Content script should detect and mark the school documents search module"
);

assert(
  js.includes("idu-documents-category-field") &&
    js.includes("idu-documents-name-field") &&
    js.includes("idu-documents-actions-field"),
  "Documents search fields should receive explicit layout classes"
);

assert(
  js.includes("idu-chosen-source") &&
    js.includes('nextElementSibling?.classList.contains("chosen-container")'),
  "Documents enhancement should hide only selects already replaced by Chosen"
);

assert(
  /html\.idu-plus select\.idu-chosen-source[\s\S]*display:\s*none\s*!important;/.test(css),
  "Chosen source selects should stay hidden despite the global select reset"
);

assert(
  /html\.idu-plus \.idu-documents-search[\s\S]*display:\s*grid\s*!important;[\s\S]*grid-template-columns:\s*minmax\(260px,\s*1\.05fr\)\s*minmax\(390px,\s*1\.35fr\)\s*auto;/.test(css),
  "Documents search should use a deliberate desktop grid"
);

assert(
  css.includes(".chosen-container-multi .chosen-choices") &&
    css.includes(".chosen-container .chosen-drop") &&
    css.includes(".chosen-container .chosen-results li.highlighted"),
  "Chosen controls should be restyled to match the glassy UI"
);

assert(
  /@media \(max-width:\s*760px\)[\s\S]*html\.idu-plus \.idu-documents-search[\s\S]*grid-template-columns:\s*1fr;/.test(css),
  "Documents search should collapse cleanly on mobile"
);

console.log("documents search contract ok");
