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
  css.includes('font-family: "Audex";') &&
    css.includes('src: url("../fonts/Audex-Regular.woff2") format("woff2");') &&
    css.includes('font-family: "Otfits";') &&
    css.includes('src: url("../fonts/Otfits Grotesk Reg Trial.woff2") format("woff2");'),
  "Optional title fonts should be loaded from /fonts"
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
  css.includes('html.idu-plus[data-idu-title-font="aligra"]') &&
    css.includes('html.idu-plus[data-idu-title-font="inter"]') &&
    css.includes('html.idu-plus[data-idu-title-font="audex"]') &&
    css.includes('html.idu-plus[data-idu-title-font="otfits"]') &&
    /html\.idu-plus #content h3,[\s\S]*font-family:\s*var\(--idu-title-font\)\s*!important;/.test(css) &&
    css.includes("html.idu-plus #subject-card h3") &&
    css.includes("html.idu-plus #message h3") &&
    css.includes("html.idu-plus #content h3 > :not(.toggle-switch)") &&
    /html\.idu-plus \.module h3 > :not\(\.toggle-switch\),[\s\S]*font-family:\s*inherit\s*!important;/.test(css) &&
    /html\.idu-plus \.module h3 \.toggle-switch,[\s\S]*font-family:\s*var\(--idu-font\)\s*!important;/.test(css),
  "Title font choices should map to real module headings while preserving toggle UI font"
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
