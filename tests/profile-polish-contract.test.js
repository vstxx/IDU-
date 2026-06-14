const assert = require("assert");
const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const css = fs.readFileSync(path.join(root, "src", "idu-plus.css"), "utf8");
const js = fs.readFileSync(path.join(root, "src", "idu-plus.js"), "utf8");

assert(
  js.includes("normalizeTopbarLabels") &&
    js.includes("open_user_templates") &&
    js.includes("Szablony") &&
    js.includes("link_to_unread_forum_posts") &&
    js.includes("Forum") &&
    js.includes("Wyloguj się"),
  "Content script should normalize topbar labels without replacing the original links"
);

assert(
  js.includes("idu-profile-page") && js.includes("#student-card #student-data"),
  "Content script should mark the real profile page from the audited student-card DOM"
);

assert(
  /html\.idu-plus\.idu-profile-page #student-card[\s\S]*padding:\s*24px/.test(css) &&
    /html\.idu-plus\.idu-profile-page #student-card > table[\s\S]*display:\s*block/.test(css),
  "Student card should get a modern profile layout surface"
);

assert(
  /html\.idu-plus\.idu-profile-page #student-card > table > tbody > tr[\s\S]*grid-template-columns:\s*132px minmax\(0, 1fr\)/.test(css),
  "Student card should split photo/action and profile details into a clean grid"
);

assert(
  /html\.idu-plus\.idu-profile-page #student-card #photo img[\s\S]*border-radius:\s*22px[\s\S]*object-fit:\s*cover/.test(css),
  "Student photo should become a polished rounded portrait"
);

assert(
  /html\.idu-plus\.idu-profile-page #student-data > table > tbody > tr[\s\S]*grid-template-columns:\s*repeat\(4, minmax\(170px, 1fr\)\)/.test(css),
  "Profile detail groups should become an aligned card grid on desktop"
);

assert(
  css.includes("html.idu-plus.idu-profile-page #parents,") &&
    css.includes("html.idu-plus.idu-profile-page #contact-data,") &&
    css.includes("html.idu-plus.idu-profile-page #messengers,") &&
    css.includes("html.idu-plus.idu-profile-page #social-media") &&
    /html\.idu-plus\.idu-profile-page #parents,[\s\S]*background:\s*var\(--idu-surface-soft\)/.test(css),
  "Profile detail groups should share the glassy card treatment"
);

assert(
  css.includes("--idu-profile-icon-user") &&
    css.includes("--idu-profile-icon-home") &&
    css.includes("--idu-profile-icon-mail"),
  "Profile should define clean modern icon masks for data rows"
);

assert(
  /html\.idu-plus\.idu-profile-page #student-card \.data[\s\S]*background-image:\s*none\s*!important/.test(css),
  "Profile data rows should suppress legacy IDU background icons"
);

assert(
  /html\.idu-plus\.idu-profile-page #student-card \.data\.father,[\s\S]*grid-template-columns:\s*18px minmax\(0, 1fr\)/.test(css) &&
    /html\.idu-plus\.idu-profile-page #student-card \.data\.father::before,[\s\S]*mask:\s*var\(--idu-profile-icon-user\) center \/ 16px 16px no-repeat/.test(css),
  "Profile data icons should be aligned as their own grid column"
);

assert(
  /html\.idu-plus\.idu-profile-page #student-card \.data\.address::before[\s\S]*mask:\s*var\(--idu-profile-icon-home\) center \/ 16px 16px no-repeat/.test(css) &&
    /html\.idu-plus\.idu-profile-page #student-card \.data\.email::before[\s\S]*mask:\s*var\(--idu-profile-icon-mail\) center \/ 16px 16px no-repeat/.test(css),
  "Address and email rows should use modern home/mail icons instead of legacy image sprites"
);

console.log("profile polish contract ok");
