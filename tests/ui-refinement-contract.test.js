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
    /html\.idu-plus \.module h3 > :not\(\.toggle-switch\)[^,\n]*,[\s\S]*font-family:\s*inherit\s*!important;/.test(css) &&
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

assert(
  /html\.idu-plus #change_language\s*\{[\s\S]*flex-direction:\s*row;[\s\S]*align-items:\s*center;/.test(css) &&
    /html\.idu-plus #change_language \.logout-timer,[\s\S]*html\.idu-plus #change_language \.js-counter\s*\{[\s\S]*display:\s*none\s*!important;/.test(css) &&
    js.includes("removeLogoutCountdown"),
  "Topbar language control should align like a normal chip and remove the logout countdown"
);

assert(
  js.includes("moveLanguageControl") &&
    js.includes('document.querySelector("#account-actions")') &&
    js.includes("Change language") &&
    /html\.idu-plus #account-actions > #change_language:not\(#last_internal_messages\):not\(#unread_forum_posts\)[\s\S]*min-height:\s*34px;/.test(css) &&
    /html\.idu-plus #account-actions #change_language a\s*\{[\s\S]*border:\s*0\s*!important;[\s\S]*background:\s*transparent\s*!important;/.test(css),
  "Language chip should live in the same action row and match the size of the other topbar buttons"
);

assert(
  js.includes("bindFoldableAnimations") &&
    js.includes("animateFoldable") &&
    js.includes("idu-foldable-animating") &&
    /html\.idu-plus \.foldable\s*\{[\s\S]*transition:\s*height 180ms ease, opacity 180ms ease;/.test(css) &&
    /html\.idu-plus \.foldable\.idu-foldable-collapsed\s*\{[\s\S]*display:\s*none\s*!important;/.test(css),
  "Foldable sections should animate quickly when collapsed or expanded"
);

assert(
  js.includes('toggleLink.classList.add("idu-fold-toggle")') &&
    js.includes('toggleLink.setAttribute("aria-expanded", String(!collapsed))') &&
    js.includes('toggleLink.setAttribute("aria-label", label)') &&
    /html\.idu-plus \.toggle-switch a::before\s*\{[\s\S]*border-right:\s*2px solid currentColor;[\s\S]*transform:\s*rotate\(45deg\)/.test(css) &&
    /html\.idu-plus \.toggle-switch a\.hide-me::before\s*\{[\s\S]*transform:\s*rotate\(-135deg\)/.test(css),
  "Collapse controls should use an accessible animated chevron instead of visible text"
);

assert(
  js.includes("buildStickyActionBar") &&
    js.includes("idu-sticky-actions") &&
    js.includes("idu-sticky-actions-row") &&
    js.includes("data-sticky-action") &&
    js.includes("IntersectionObserver") &&
    /html\.idu-plus \.idu-sticky-actions\s*\{[\s\S]*position:\s*fixed;[\s\S]*top:\s*0;/.test(css) &&
    /html\.idu-plus \.idu-sticky-actions\s*\{[\s\S]*background:\s*var\(--idu-topbar\)\s*!important;/.test(css) &&
    /html\.idu-plus \.idu-sticky-actions\.is-visible\s*\{[\s\S]*transform:\s*translateY\(0\);/.test(css),
  "Topbar action buttons should stay available in a compact flat sticky bar after scrolling and reuse the selected topbar color"
);

assert(
  /html\.idu-plus\[data-idu-logo-tone="dark"\] \.idu-sticky-actions-row > div\s*\{[\s\S]*color:\s*var\(--idu-text-soft\);/.test(css) &&
    /html\.idu-plus\[data-idu-logo-tone="dark"\] \.idu-sticky-actions-row a,[\s\S]*html\.idu-plus\[data-idu-logo-tone="dark"\] \.idu-sticky-actions-row strong\s*\{[\s\S]*color:\s*var\(--idu-text\)\s*!important;/.test(css),
  "Sticky action bar should darken chip text when the selected topbar color is very light"
);

assert(
  js.includes("getCurrentLocale") &&
    js.includes("TOPBAR_LABELS") &&
    js.includes("UI_TRANSLATIONS") &&
    js.includes("applyLocaleText") &&
    js.includes("Templates") &&
    js.includes("Logout") &&
    js.includes("Recent homework"),
  "Language switching should rebuild IDU+ labels and common IDU chrome in the active locale"
);

console.log("ui refinement contract ok");
