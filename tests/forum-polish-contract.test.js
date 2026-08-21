const assert = require("assert");
const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const css = fs.readFileSync(path.join(root, "src", "idu-plus.css"), "utf8");
const js = fs.readFileSync(path.join(root, "src", "idu-plus.js"), "utf8");

assert(
  js.includes("const enhanceForumPages") &&
    js.includes('root.classList.toggle("idu-forum-page", forumPage)') &&
    js.includes('row.classList.add("idu-forum-row")'),
  "Forum pages and their interactive rows should receive stable semantic hooks"
);

assert(
  /html\.idu-plus \.forum-table tr\.idu-forum-row:hover\s*\{[\s\S]*background:\s*var\(--idu-hover-bg\)\s*!important/.test(css) &&
    /html\.idu-plus \.forum-table td\.thread-title \.title a,[\s\S]*color:\s*var\(--idu-text\)\s*!important/.test(css) &&
    /html\.idu-plus \.forum-table \.last-post\s*\{[\s\S]*color:\s*var\(--idu-muted\)\s*!important/.test(css),
  "Forum lists should use quiet rows, readable titles, and restrained metadata"
);

assert(
  /html\.idu-plus \.forum-table td\.icon img\s*\{[\s\S]*display:\s*none\s*!important/.test(css) &&
    /html\.idu-plus \.forum-table td\.icon::before\s*\{[\s\S]*mask:\s*var\(--idu-icon-forum\)/.test(css),
  "Legacy forum GIFs should be replaced with the existing clean IDU+ icon system"
);

assert(
  /html\.idu-plus\[data-idu-theme="dark"\] \.forum-table,[\s\S]*background-color:\s*transparent\s*!important/.test(css) &&
    /html\.idu-plus\[data-idu-theme="dark"\] \.forum-table \.forum-header,[\s\S]*background-color:\s*var\(--idu-row-bg-soft\)\s*!important/.test(css),
  "Dark forum pages should never fall back to legacy white table strips"
);

assert(
  /html\.idu-plus \.thread-reply\s*\{[\s\S]*border:\s*1px solid var\(--idu-border\)/.test(css) &&
    /html\.idu-plus \.markItUpContainer\s*\{[\s\S]*background:\s*var\(--idu-input-bg\)\s*!important/.test(css) &&
    /html\.idu-plus form\.new_forum_topic\s*\{[\s\S]*display:\s*grid/.test(css),
  "Replies, the legacy MarkItUp editor, and new-topic forms should share the clean form system"
);

assert(
  /@media \(max-width: 760px\)[\s\S]*html\.idu-plus \.forum-table tr\s*\{[\s\S]*grid-template-columns:\s*38px minmax\(0, 1fr\)/.test(css) &&
    /@media \(max-width: 760px\)[\s\S]*html\.idu-plus \[id="forum\/post_search"\]\s*\{[\s\S]*flex-direction:\s*column/.test(css),
  "Forum lists and search controls should reflow cleanly on phones"
);

assert(
  js.includes('table.dataset.iduEmptyLabel = getCurrentLocale() === "en"') &&
    css.includes("content: attr(data-idu-empty-label)"),
  "Empty forum search results should remain localized and intentional"
);

console.log("forum polish contract ok");
