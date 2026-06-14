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
  /html\.idu-plus\.idu-dashboard-page \.no-menu #content > \.double-column > \.module[\s\S]*margin-bottom:\s*0\s*!important/.test(css),
  "Full-width dashboard modules should not add extra bottom margin on top of grid gaps"
);

assert(
  js.includes("flash.remove()"),
  "Empty flash section should be removed from layout after being identified"
);

console.log("layout polish contract ok");
