const assert = require("assert");
const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const css = fs.readFileSync(path.join(root, "src", "idu-plus.css"), "utf8");
const popupCss = fs.readFileSync(path.join(root, "src", "popup.css"), "utf8");
const js = fs.readFileSync(path.join(root, "src", "idu-plus.js"), "utf8");

for (const token of [
  "--idu-glass-bg",
  "--idu-glass-bg-strong",
  "--idu-glass-bg-soft",
  "--idu-glass-border",
  "--idu-glass-border-highlight",
  "--idu-glass-blur",
  "--idu-glass-saturation",
  "--idu-glass-shadow",
  "--idu-glass-shadow-soft",
  "--idu-glass-inner-highlight",
  "--idu-glass-input-bg",
  "--idu-glass-hover",
  "--idu-glass-active"
]) {
  assert(css.includes(token), `Portal Frost system should define ${token}`);
  assert(popupCss.includes(token), `Popup Frost system should define ${token}`);
}

assert(
  css.includes("--idu-glass-fallback-bg") &&
    css.includes("--idu-material-bg: var(--idu-glass-fallback-bg)") &&
    /@supports \(\(backdrop-filter: blur\(1px\)\)[\s\S]*--idu-material-bg:\s*var\(--idu-glass-bg\)/.test(css),
  "Frost surfaces should have an opaque fallback and switch to translucent material only when blur is supported"
);

assert(
  /html\.idu-plus\[data-idu-theme="dark"\][\s\S]*--idu-glass-bg:\s*rgba\(21, 23, 28, 0\.68\)/.test(css) &&
    /--idu-glass-border:\s*rgba\(255, 255, 255, 0\.085\)/.test(css),
  "Dark Frost should use graphite material and quiet light edges"
);

assert(
  /--idu-ambient-background:[\s\S]*radial-gradient[\s\S]*var\(--idu-accent\)[\s\S]*var\(--idu-bg\)/.test(css) &&
    !/linear-gradient/i.test(css) &&
    !/linear-gradient/i.test(popupCss),
  "Ambient depth should be accent-aware and restrained, with no legacy linear gradients"
);

assert(
  /html\.idu-plus body \*,[\s\S]*font-family:\s*var\(--idu-font\)\s*!important/.test(css) &&
    /html\.idu-plus \.module > h3,[\s\S]*font-family:\s*var\(--idu-title-font\)\s*!important/.test(css) &&
    /body \*,[\s\S]*font-family:\s*"InterVariable", Inter, "Segoe UI", Arial, sans-serif/.test(popupCss),
  "All UI copy should use Inter while semantic headings retain the selected Title Font"
);

assert(
  /html\.idu-plus #top\s*\{[\s\S]*background:\s*var\(--idu-glass-topbar-surface\)/.test(css) &&
    /--idu-glass-topbar-surface:\s*color-mix\(in srgb, var\(--idu-topbar\)/.test(css) &&
    js.includes("root.dataset.iduLogoTone"),
  "Frost topbar should derive from the selected topbar color and preserve contrast behavior"
);

assert(
  /@media \(max-width: 760px\)[\s\S]*--idu-glass-blur:\s*11px;/.test(css) &&
    /@media \(prefers-reduced-motion: reduce\)[\s\S]*transition:\s*none\s*!important/.test(css) &&
    /@media \(prefers-reduced-motion: reduce\)[\s\S]*transition:\s*none\s*!important/.test(popupCss),
  "Frost should lower mobile blur and retain complete reduced-motion handling"
);

assert(
  /\.idu-workspace-nav-link\[aria-current="page"\]/.test(css) &&
    js.includes('link.setAttribute("aria-current", "page")') &&
    /\.idu-workspace-nav-icon\s*\{[\s\S]*border:\s*0;[\s\S]*background:\s*transparent;/.test(css),
  "Workspace should use a restrained current-page material while keeping standalone icons"
);

console.log("frost material contract ok");
