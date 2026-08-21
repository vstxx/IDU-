const assert = require("assert");
const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const js = fs.readFileSync(path.join(root, "src", "idu-plus.js"), "utf8");

assert(
  js.includes('const languageLabel = getCurrentLocale() === "en" ? "Language" : "J\\u0119zyk"') &&
    js.includes('languageLink.textContent = `${languageLabel}: ${targetLocale}`'),
  "The native locale link should use compact Język/Language labels"
);

assert(
  js.includes("STATIC_UI_TEXT_SELECTOR") &&
    js.includes("STATIC_UI_ATTRIBUTE_SELECTOR") &&
    js.includes("translateUiAttributes") &&
    js.includes("root.dataset.iduLocale = locale") &&
    js.includes("translateTextNodes(STATIC_UI_TEXT_SELECTOR, locale)") &&
    js.includes("translateUiAttributes(STATIC_UI_ATTRIBUTE_SELECTOR, locale)"),
  "Locale application should cover static text, control values, placeholders, titles, and accessible labels"
);

for (const pair of [
  ['"Twoja klasa i przedmioty", "Your class and subjects"'],
  ['"Og\\u0142oszenia przedmiotowe", "Subject announcements"'],
  ['"zadania domowe", "homework"'],
  ['"tematy lekcji", "lesson topics"'],
  ['"Obecno\\u015bci", "Attendance"'],
  ['"Oceny", "Grades"'],
  ['"Dokumenty", "Documents"'],
  ['"Rok szkolny", "School year"'],
  ['"Szczeg\\u00f3\\u0142owy plan dla dni", "Detailed timetable for days"']
]) {
  assert(js.includes(pair), `Missing common IDU translation: ${pair}`);
}

assert(
  js.includes('pl: new Map([') &&
    js.includes('["IDU+ Appearance", "Wygl\\u0105d IDU+"]') &&
    js.includes('["Theme", "Motyw"]'),
  "Safari-generated IDU+ controls should also follow the active portal language"
);

console.log("localization contract ok");
