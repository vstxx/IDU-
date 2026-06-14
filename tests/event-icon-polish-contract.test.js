const assert = require("assert");
const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const css = fs.readFileSync(path.join(root, "src", "idu-plus.css"), "utf8");

[
  "--idu-event-icon-calendar",
  "--idu-event-icon-announcement",
  "--idu-event-icon-grade",
  "--idu-event-icon-attendance",
  "--idu-event-icon-absence",
  "--idu-event-icon-lateness",
  "--idu-event-icon-file",
].forEach((token) => {
  assert(css.includes(token), `CSS should define ${token} for modern event icons`);
});

assert(
  /html\.idu-plus \.profile-event\s*\{[\s\S]*background-image:\s*none\s*!important;/.test(css),
  "Profile events should suppress legacy IDU GIF background icons"
);

assert(
  /html\.idu-plus \.profile-event::before\s*\{[\s\S]*border-radius:\s*999px;/.test(css) &&
    /html\.idu-plus \.profile-event::after\s*\{[\s\S]*-webkit-mask:\s*var\(--idu-event-icon-default\)/.test(css),
  "Profile events should render modern icon badges with CSS masks"
);

assert(
  /html\.idu-plus \.profile-event\.presence::after,[\s\S]*html\.idu-plus \.profile-event\.absence-justified::after\s*\{[\s\S]*background:\s*var\(--idu-attendance-present\);/.test(css),
  "Presence and justified attendance event icons should use the green attendance color"
);

assert(
  css.includes("--idu-attendance-present: #2f9e61;") &&
    css.includes("stroke='%232f9e61'"),
  "Present and justified inline attendance icons should be green"
);

assert(
  /html\.idu-plus \.profile-event\.absence::after\s*\{[\s\S]*background:\s*var\(--idu-attendance-absence\);/.test(css),
  "Absence event icons should use the red attendance color"
);

assert(
  /img\[src\*="icon-presence"\][\s\S]*content:\s*var\(--idu-inline-icon-presence\)\s*!important;/.test(css) &&
    /img\[src\*="icon-absence"\][\s\S]*content:\s*var\(--idu-inline-icon-absence\)\s*!important;/.test(css),
  "Inline attendance image tags should be replaced with modern green/red SVG icons"
);

assert(
  /img\[src\*="icon-lateness"\][\s\S]*content:\s*var\(--idu-inline-icon-lateness\)\s*!important;/.test(css),
  "Inline lateness image tags should be replaced with a modern clock icon"
);

console.log("event icon polish contract ok");
