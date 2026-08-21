const assert = require("assert");
const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const css = fs.readFileSync(path.join(root, "src", "idu-plus.css"), "utf8");

assert(
  css.includes('html.idu-plus[data-idu-theme="dark"] [style*="background-color: #F6F8FA"]') &&
    css.includes('html.idu-plus[data-idu-theme="dark"] [style*="background-color:#F6F8FA"]') &&
    css.includes('html.idu-plus[data-idu-theme="dark"] [style*="background-color: white"]'),
  "Dark mode should override common legacy inline light backgrounds"
);

assert(
  css.includes('html.idu-plus[data-idu-theme="dark"] .ui-dialog') &&
    css.includes('html.idu-plus[data-idu-theme="dark"] .ui-datepicker') &&
    css.includes('html.idu-plus[data-idu-theme="dark"] .ui-autocomplete') &&
    css.includes('html.idu-plus[data-idu-theme="dark"] #fancybox-content'),
  "Dark mode should harden legacy jQuery/dialog popup surfaces"
);

assert(
  /html\.idu-plus\[data-idu-theme="dark"\] input:-webkit-autofill\s*\{[\s\S]*-webkit-text-fill-color:\s*var\(--idu-text\)\s*!important;/.test(css) &&
    /html\.idu-plus\[data-idu-theme="dark"\] input:-webkit-autofill\s*\{[\s\S]*box-shadow:\s*0 0 0 1000px var\(--idu-input-bg\) inset\s*!important;/.test(css),
  "Dark mode should stop browser autofill from creating white input boxes"
);

assert(
  css.includes('html.idu-plus[data-idu-theme="dark"] table tr[style*="background"]') &&
    css.includes('html.idu-plus[data-idu-theme="dark"] table td[style*="background"]') &&
    css.includes('html.idu-plus[data-idu-theme="dark"] option'),
  "Dark mode should suppress inline table backgrounds and native option white surfaces"
);

assert(
  /html\.idu-plus\[data-idu-theme="dark"\] \.presence-table thead tr th,[\s\S]*html\.idu-plus\[data-idu-theme="dark"\] \.presence-table th\.lateness-cell\s*\{[\s\S]*background:\s*var\(--idu-row-bg\)\s*!important;/.test(css) &&
    /html\.idu-plus\[data-idu-theme="dark"\] \.presence-table td\.presence-cell,[\s\S]*html\.idu-plus\[data-idu-theme="dark"\] \.presence-table td\.lateness-cell\s*\{[\s\S]*background-color:\s*var\(--idu-row-bg-soft\)\s*!important;/.test(css),
  "Dark mode should replace the white attendance summary strip and pastel attendance cells with dark surfaces"
);

console.log("dark mode hardening contract ok");
