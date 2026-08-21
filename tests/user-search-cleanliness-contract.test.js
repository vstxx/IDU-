const assert = require("assert");
const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const css = fs.readFileSync(path.join(root, "src", "idu-plus.css"), "utf8");

assert(
  /html\.idu-plus #users_search_result\s*\{[\s\S]*grid-template-columns:\s*minmax\(0, 1fr\);/.test(css) &&
    /@media \(min-width: 1100px\)[\s\S]*grid-template-columns:\s*repeat\(2, minmax\(0, 1fr\)\);/.test(css),
  "User search results should use full-width rows and only split on genuinely wide screens"
);

assert(
  /html\.idu-plus #users_search_result \.single_user\s*\{[\s\S]*grid-template-columns:\s*40px minmax\(0, 1fr\);/.test(css) &&
    /html\.idu-plus #users_search_result \.single_user\s*\{[\s\S]*width:\s*100%\s*!important;/.test(css) &&
    /html\.idu-plus #users_search_result \.single_user\s*\{[\s\S]*border-radius:\s*12px;/.test(css) &&
    /html\.idu-plus #users_search_result \.single_user:hover,[\s\S]*background:\s*var\(--idu-hover-bg\);/.test(css),
  "Each user result should be a clean interactive card"
);

assert(
  /html\.idu-plus #users_search_result \.single_user \.user_avatar\s*\{[\s\S]*border-radius:\s*50%;/.test(css) &&
    /html\.idu-plus #users_search_result \.single_user \.user_avatar img\s*\{[\s\S]*object-fit:\s*cover;/.test(css),
  "User result avatars should be consistently circular and cropped"
);

assert(
  /html\.idu-plus #users_search_result \.single_user \.user_name\s*\{[\s\S]*visibility:\s*visible\s*!important;/.test(css) &&
    /html\.idu-plus #users_search_result \.single_user \.user_name a\s*\{[\s\S]*font-size:\s*14px\s*!important;/.test(css) &&
    /html\.idu-plus #users_search_result \.single_user \.user_name a\s*\{[\s\S]*white-space:\s*normal\s*!important;/.test(css),
  "Every result should immediately show the full first and last name"
);

assert(
  /html\.idu-plus #users_search_result > :not\(\.single_user\):not\(script\):not\(style\)\s*\{[\s\S]*display:\s*contents\s*!important;/.test(css),
  "Legacy IDU result-column wrappers should not waste horizontal space"
);

assert(
  /@media \(max-width: 760px\)[\s\S]*html\.idu-plus #users_search_result\s*\{[\s\S]*grid-template-columns:\s*minmax\(0, 1fr\);/.test(css),
  "User search results should collapse to one column on phones"
);

console.log("user search cleanliness contract ok");
