const assert = require("assert");
const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const css = fs.readFileSync(path.join(root, "src", "idu-plus.css"), "utf8");
const js = fs.readFileSync(path.join(root, "src", "idu-plus.js"), "utf8");

assert(
  css.includes('font-family: "Aligra";') &&
    css.includes('src: url("../fonts/Aligra.woff2") format("woff2");'),
  "Aligra font face should be loaded from /fonts"
);

assert(
  css.includes("--idu-title-font: \"Aligra\", Georgia, serif;"),
  "CSS should define a title font token for Aligra"
);

assert(
  /html\.idu-plus \.module h3,[\s\S]*font-family:\s*var\(--idu-title-font\)\s*!important;/.test(css),
  "Module titles should use the Aligra title font"
);

assert(
  js.includes("moveDocumentsAction") &&
    js.includes("idu-toolbar-actions") &&
    js.includes("idu-plus-removed"),
  "JS should move Documents into the toolbar and remove the old section"
);

assert(
  js.includes("hideEmptyFlashSection") && js.includes("idu-plus-empty"),
  "JS should hide the empty flash section below breadcrumbs"
);

assert(
  css.includes("#flash-messages-section.idu-plus-empty") &&
    /#flash-messages-section\.idu-plus-empty[\s\S]*display:\s*none\s*!important;/.test(css),
  "Empty flash section should win over the normal flash-section display rule"
);

assert(
  css.includes("#account-actions #messages::before") &&
    css.includes("mask: var(--idu-icon-mail) center / 15px 15px no-repeat;"),
  "Topbar message chip should receive a clean CSS icon"
);

assert(
  /#last_internal_messages[\s\S]*color:\s*var\(--idu-text\)\s*!important;/.test(css) &&
    /#last_internal_messages a[\s\S]*color:\s*var\(--idu-text\)\s*!important;/.test(css),
  "Message dropdown text and links should render dark, not white"
);

console.log("ui refinement contract ok");
