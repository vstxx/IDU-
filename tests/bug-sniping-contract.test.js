const assert = require("assert");
const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const css = fs.readFileSync(path.join(root, "src", "idu-plus.css"), "utf8");
const js = fs.readFileSync(path.join(root, "src", "idu-plus.js"), "utf8");

assert(
  /html\.idu-plus,\s*html\.idu-plus body\s*\{[\s\S]*overflow-x:\s*hidden;[\s\S]*overflow-x:\s*clip;/.test(css),
  "The enhanced page should contain legacy full-viewport elements without horizontal document overflow"
);

assert(
  js.includes('if (/^\\/forums\\/?$/.test(window.location.pathname))') &&
    js.includes('^\\/forum\\/search\\/?$') &&
    js.includes('actionModule.classList.toggle("idu-redundant-forum-action"') &&
    /\.idu-redundant-forum-action\s*\{\s*display:\s*none\s*!important;/.test(css),
  "The forum landing page should hide only its redundant native search action"
);

assert(
  js.includes('const folderKeys = ["inbox", "sent", "drafts", "trash", "compose"]') &&
    js.indexOf('["sent", "/internal_messages/sent"]') < js.indexOf('["drafts", "/internal_messages/drafts"]') &&
    js.includes("labelTarget.textContent = labels[key]"),
  "Native and generated message folder navigation should use the same labels and order"
);

assert(
  js.includes('frame.dataset.iduEditorThemeReady = "true"') &&
    /\.cke_wysiwyg_frame:not\(\[data-idu-editor-theme-ready="true"\]\)\s*\{\s*opacity:\s*0;/.test(css),
  "Dark mode should hide the editor canvas until its iframe theme is ready"
);

assert(
  /@media \(max-width:\s*760px\)[\s\S]*table\.message-table > tbody > tr\s*\{[\s\S]*grid-template-areas:\s*"select user date"\s*"select subject subject";/.test(css) &&
    /table\.message-table input\[type="checkbox"\]\s*\{[\s\S]*width:\s*18px;[\s\S]*height:\s*18px;/.test(css),
  "Mobile inbox rows should use readable cards with touch-friendly selection controls"
);

assert(
  /\.idu-attendance-summary-table > tbody > tr > td:nth-child\(3\)\s*\{[\s\S]*display:\s*block;/.test(css) &&
    /tr\.js-presences-details\s*\{\s*grid-template-rows:\s*auto auto auto;/.test(css) &&
    /tr\.js-presences-details > td:nth-child\(5\)\s*\{\s*display:\s*none\s*!important;/.test(css),
  "Mobile attendance cards should keep absence details inline and remove their empty action row"
);

console.log("bug sniping contract ok");
