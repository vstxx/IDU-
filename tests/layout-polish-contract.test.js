const assert = require("assert");
const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const css = fs.readFileSync(path.join(root, "src", "idu-plus.css"), "utf8");
const js = fs.readFileSync(path.join(root, "src", "idu-plus.js"), "utf8");

assert(
  js.includes("markPageType") &&
    js.includes("idu-login-page") &&
    js.includes("idu-dashboard-page") &&
    js.includes("#new_user") &&
    js.includes("/users/sign_in"),
  "Content script should classify login and dashboard pages from real IDU markup"
);

assert(
  /html\.idu-plus\.idu-login-page body[\s\S]*min-height:\s*100vh[\s\S]*display:\s*grid[\s\S]*place-items:\s*center/.test(css),
  "Login page body should vertically center the login panel"
);

assert(
  /html\.idu-plus\.idu-login-page #container[\s\S]*position:\s*relative[\s\S]*top:\s*auto[\s\S]*left:\s*auto/.test(css),
  "Login container should opt out of legacy absolute centering"
);

assert(
  css.includes("--idu-section-gap: 12px;") &&
    css.includes("--idu-dashboard-gap: 18px;"),
  "Dashboard spacing should use compact, explicit rhythm tokens"
);

assert(
  /html\.idu-plus #site-content[\s\S]*margin-top:\s*var\(--idu-section-gap\)/.test(css) &&
    /html\.idu-plus #content[\s\S]*gap:\s*var\(--idu-dashboard-gap\) 22px/.test(css),
  "Breadcrumb-to-content and dashboard row gaps should share the compact rhythm"
);

assert(
  /html\.idu-plus #logo\s*\{[\s\S]*display:\s*inline-flex[\s\S]*flex:\s*0 0 104px[\s\S]*width:\s*104px\s*!important/.test(css) &&
    /html\.idu-plus #logo a\s*\{[\s\S]*position:\s*relative[\s\S]*display:\s*inline-flex[\s\S]*width:\s*104px/.test(css) &&
    css.includes('html.idu-plus[data-idu-logo-tone="dark"] #logo img') &&
    css.includes('html.idu-plus[data-idu-logo-tone="dark"] .idu-workspace-logo img') &&
    css.includes("filter: brightness(0)") &&
    !css.includes("#logo a::after") &&
    !css.includes("#logo::after"),
  "Every IDU logo should use the real IDU+ asset and switch to a dark treatment on very light bars"
);

assert(
  /html\.idu-plus\.idu-dashboard-page \.no-menu #content > \.double-column > \.module[\s\S]*margin-bottom:\s*0\s*!important/.test(css),
  "Full-width dashboard modules should not add extra bottom margin on top of grid gaps"
);

assert(
  /html\.idu-plus\.idu-dashboard-page \.no-menu #content > \.double-column\s*\{[\s\S]*display:\s*grid;[\s\S]*gap:\s*var\(--idu-dashboard-gap\);/.test(css),
  "Stacked dashboard modules such as Events and Recent Homework should keep a visible gap inside full-width columns"
);

assert(
  /html\.idu-plus \.menu-exist #content\s*\{[\s\S]*gap:\s*20px;/.test(css) &&
    /html\.idu-plus \.menu-exist #content > \.module,[\s\S]*margin-bottom:\s*0\s*!important/.test(css),
  "Menu pages should use one comfortable grid gap between content sections, without stacked module margins"
);

assert(
  js.includes("flash.remove()"),
  "Empty flash section should be removed from layout after being identified"
);

assert(
    js.includes("enhanceLoginForm") &&
    js.includes("applyLogoAsset") &&
    js.includes("assets/idu-plus-logo.png") &&
    js.includes('submit.value = "Zaloguj"') &&
    js.includes('placeholder", "Login"') &&
    js.includes('placeholder", "Hasło"') &&
    /html\.idu-plus\.idu-login-page #new_user \.field:has\(h1\)[\s\S]*text-align:\s*center/.test(css) &&
    /html\.idu-plus\.idu-login-page #container #top[\s\S]*linear-gradient\(135deg, var\(--idu-topbar\), var\(--idu-topbar-2\)\)/.test(css) &&
    /html\.idu-plus\.idu-login-page #new_user \.field:not\(:has\(h1\)\) label[\s\S]*clip:\s*rect\(0 0 0 0\)/.test(css),
  "Login page should keep the title centered, language chip visible, topbar-colored header, placeholder inputs, and submit label restored"
);

console.log("layout polish contract ok");
