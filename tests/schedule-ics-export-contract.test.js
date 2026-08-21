const assert = require("assert");
const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const js = fs.readFileSync(path.join(root, "src", "idu-plus.js"), "utf8");
const css = fs.readFileSync(path.join(root, "src", "idu-plus.css"), "utf8");

// Wiersze planu to pojedyncze lekcje po 45 minut, a bloki to ich pary.
const expectedSlots = [
  [0, "08:00", "08:40", 0],
  [1, "08:45", "09:30", 1],
  [2, "09:35", "10:20", 1],
  [3, "10:35", "11:20", 2],
  [4, "11:25", "12:10", 2],
  [5, "12:30", "13:15", 3],
  [6, "13:20", "14:05", 3],
  [7, "14:35", "15:20", 4],
  [8, "15:25", "16:10", 4],
  [9, "16:20", "17:05", 5],
  [10, "17:10", "17:50", 5]
];

expectedSlots.forEach(([lesson, start, end, block]) => {
  assert(
    new RegExp(
      `${lesson}: Object\\.freeze\\(\\{ start: "${start}", end: "${end}", block: ${block} \\}\\)`
    ).test(js),
    `Lesson ${lesson} should run ${start}-${end} inside block ${block}`
  );
});

assert(
  /cell\.dataset\.iduLessonNumber = String\(lessonNumber\);/.test(js) &&
    /cells\[0\]\.dataset\.iduLessonNumber \|\|[\s\S]*\.idu-schedule-slot-number/.test(js),
  "ICS parsing should keep the numeric lesson index after the visible time range is added to the first column"
);

assert(
  !/11: Object\.freeze\(\{ start:/.test(js) && !/12: Object\.freeze\(\{ start:/.test(js),
  "Lesson rows without a known bell time must stay unmapped instead of being guessed"
);

assert(
  /if \(!slot\) \{[\s\S]{0,80}skippedLessons \+= 1;[\s\S]{0,40}return;/.test(js),
  "Lessons without a known bell time should be skipped and counted, never exported at a guessed hour"
);

assert(
  /current\.block === entry\.block &&[\s\S]*current\.subject === entry\.subject &&[\s\S]*current\.room === entry\.room &&[\s\S]*entry\.lessonNumber === current\.lastLesson \+ 1/.test(
    js
  ),
  "Two lessons should merge into one block event only when the block, subject, room and order all match"
);

assert(
  /const readScheduleCells = \(cell\) => \{/.test(js) &&
    /const lessonCards = Array\.from\(cell\.children\)/.test(js) &&
    /parallelIndex,[\s\S]*parallelCount: boxes\.length/.test(js) &&
    /const lessons = readScheduleCells\(cell\);[\s\S]*lessons\.forEach\(\(lesson\) => \{/.test(js),
  "ICS export should read every simultaneous lesson card in a timetable cell"
);

assert(
  /const currentByParallelTrack = new Map\(\);/.test(js) &&
    /currentByParallelTrack\.get\(entry\.parallelIndex\)/.test(js) &&
    /currentByParallelTrack\.set\(entry\.parallelIndex, nextEvent\)/.test(js),
  "Consecutive lessons should merge independently inside each parallel timetable track"
);

assert(
  /const limit = chunks\.length \? 74 : 75;/.test(js) && /chunks\.join\("\\r\\n "\)/.test(js),
  "ICS lines should fold at 75 octets with a leading space on continuation lines (RFC 5545)"
);

assert(
  /const encoder = new TextEncoder\(\);/.test(js) && /encoder\.encode\(character\)\.length/.test(js),
  "Folding should count UTF-8 octets so Polish characters are not split incorrectly"
);

assert(
  js.includes(String.raw`.replace(/\\/g, "\\\\")`) &&
    js.includes(String.raw`.replace(/;/g, "\\;")`) &&
    js.includes(String.raw`.replace(/,/g, "\\,")`) &&
    js.includes(String.raw`.replace(/\r?\n/g, "\\n")`),
  "ICS text values should escape backslashes, semicolons, commas and newlines"
);

assert(
  /BEGIN:VTIMEZONE/.test(js) &&
    /TZID:\$\{SCHEDULE_TIMEZONE\}/.test(js) &&
    /"TZNAME:CEST"/.test(js) &&
    /"TZNAME:CET"/.test(js) &&
    /"RRULE:FREQ=YEARLY;BYMONTH=3;BYDAY=-1SU"/.test(js) &&
    /"RRULE:FREQ=YEARLY;BYMONTH=10;BYDAY=-1SU"/.test(js),
  "The calendar should carry a full Europe/Warsaw VTIMEZONE so DST shifts stay correct"
);

assert(
  /const SCHEDULE_TIMEZONE = "Europe\/Warsaw";/.test(js) &&
    /DTSTART;TZID=\$\{SCHEDULE_TIMEZONE\}/.test(js) &&
    /DTEND;TZID=\$\{SCHEDULE_TIMEZONE\}/.test(js),
  "Event times should be anchored to Europe/Warsaw rather than floating"
);

assert(
  /const SCHEDULE_ICS_WEEKDAYS = Object\.freeze\(\["SU", "MO", "TU", "WE", "TH", "FR", "SA"\]\);/.test(js) &&
    /schoolYearEnd: readSchoolYearEnd\(weekStart\)/.test(js) &&
    /Pobierz cotygodniowy plan do ko\\u0144ca roku szkolnego jako plik \.ics/.test(js),
  "Export should build a weekly timetable through the end of the relevant school year"
);

assert(
  /const readSchoolYearEnd = \(weekStart\) => \{/.test(js) &&
    /weekStart\.getMonth\(\) >= 7 \? weekStart\.getFullYear\(\) \+ 1 : weekStart\.getFullYear\(\)/.test(js) &&
    /new Date\(Date\.UTC\(year, 5, 30, 21, 59, 59\)\)/.test(js),
  "The recurring timetable should end at the end of June 30 in the correct school year"
);

assert(
  /DTSTART;TZID=\$\{SCHEDULE_TIMEZONE\}:\$\{toIcsLocalStamp\(event\.date, event\.start\)\}/.test(js) &&
    /DTEND;TZID=\$\{SCHEDULE_TIMEZONE\}:\$\{toIcsLocalStamp\(event\.date, event\.end\)\}/.test(js) &&
    /RRULE:FREQ=WEEKLY;BYDAY=\$\{weekday\};UNTIL=\$\{until\}/.test(js) &&
    /const parallelSuffix = event\.parallelIndex \? `-p\$\{event\.parallelIndex \+ 1\}` : "";/.test(js) &&
    /UID:idu-plus-\$\{weekday\}-\$\{event\.lessonNumber\}-\$\{slug \|\| "lekcja"\}\$\{parallelSuffix\}@idu\.edu\.pl/.test(js),
  "Each exported lesson should recur weekly on its weekday through the calculated school-year end"
);

assert(
  /const toggle = heading\.querySelector\("\.toggle-switch"\);[\s\S]{0,120}toggle\.before\(button\);/.test(js),
  "The export button should sit next to the collapse toggle in the module heading"
);

assert(
  /button\.type = "button";/.test(js),
  "The export control should be a real button so it never behaves like a foldable toggle link"
);

assert(
  /:scope > :not\(\.toggle-switch\):not\(\.idu-plus-ics-export\)/.test(js),
  "The heading title font must not be forced onto the export button"
);

assert(
  css.includes(
    "html.idu-plus .module h3 > :not(.toggle-switch):not(.idu-plus-ics-export)"
  ),
  "CSS should exclude the export button from the heading title-font override"
);

const exportPillRule = (css.match(
  /html\.idu-plus \.idu-plus-ics-export\s*\{([\s\S]*?)\}/
) || [])[1];

assert(exportPillRule, "The export button should have its own style rule");

assert(
  /margin: 0 0 0 auto;/.test(exportPillRule),
  "The export button should push itself to the end of the heading row"
);

// Te same tokeny co ".toggle-switch a", zeby obie pigulki czytaly sie jak para
// w kazdym motywie.
[
  ["min-height", "28px"],
  ["border-radius", "999px"],
  ["color", "var\\(--idu-accent\\)"],
  ["border", "1px solid var\\(--idu-accent-border\\)"],
  ["background", "var\\(--idu-accent-faint\\)"],
  ["font-family", "var\\(--idu-font\\)"],
  ["font-size", "12px"],
  ["font-weight", "650"]
].forEach(([prop, value]) => {
  assert(
    new RegExp(`${prop}: ${value} !important;`).test(exportPillRule),
    `The export pill should set ${prop} to the same value as the collapse pill, forced past the global button rule`
  );
});

// "html.idu-plus button" narzuca gradientowe CTA z !important, wiec kazda
// wymuszona przez nie wlasciwosc musi byc tu nadpisana rowniez przez !important.
["padding", "box-shadow"].forEach((prop) => {
  assert(
    new RegExp(`${prop}: [^;]*!important;`).test(exportPillRule),
    `The export pill must override the global button ${prop} with !important`
  );
});

assert(
  /box-shadow: none !important;/.test(exportPillRule),
  "The export pill should drop the global button drop shadow"
);

assert(
  !/outline: 2px solid/.test(exportPillRule),
  "The export button should inherit the shared focus ring instead of defining its own outline"
);

assert(
  /html\.idu-plus \.idu-plus-ics-export \+ \.toggle-switch\s*\{[\s\S]*margin-left: 0;/.test(css),
  "The collapse pill should sit directly beside the export button"
);

assert(
  /html\.idu-plus \.idu-plus-ics-export::before\s*\{[\s\S]*mask-image: var\(--idu-event-icon-calendar\);/.test(css),
  "The export button should reuse the existing calendar icon token"
);

assert(
  /const enhancePage = \(\) => \{[\s\S]*buildScheduleExportButtons\(\);[\s\S]*observeDynamicContent\(\);[\s\S]*\};/.test(js),
  "Schedule export buttons should be built as part of the standard page enhancement"
);

assert(
  /type: "text\/calendar;charset=utf-8"/.test(js) && /link\.download = fileName;/.test(js),
  "The export should download a real .ics file"
);

console.log("schedule ics export contract ok");
