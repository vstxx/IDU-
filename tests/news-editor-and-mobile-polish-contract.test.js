const assert = require("assert");
const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const css = fs.readFileSync(path.join(root, "src", "idu-plus.css"), "utf8");
const js = fs.readFileSync(path.join(root, "src", "idu-plus.js"), "utf8");

assert(
  js.includes('const isNewsPagePath =') &&
    js.includes('const isNewsDetailPath =') &&
    js.includes('root.classList.toggle("idu-news-page", newsPage)') &&
    js.includes('root.classList.toggle("idu-news-detail-page", newsDetailPage)'),
  "News list and opened-post pages should receive isolated page hooks"
);

assert(
  js.includes('list.classList.add("idu-news-list")') &&
    js.includes('row.classList.add("idu-news-row")') &&
    js.includes('title?.classList.add("idu-news-row-title")') &&
    js.includes('updated.className = "idu-news-updated idu-generated"'),
  "News list rows should expose stable title and metadata hooks"
);

assert(
  /\.idu-news-article > \.idu-news-title\s*\{[\s\S]*display:\s*block\s*!important;[\s\S]*overflow-wrap:\s*anywhere;/.test(css) &&
    /\.idu-news-body hr,[\s\S]*\.idu-news-comments hr\s*\{[\s\S]*width:\s*100%\s*!important;[\s\S]*background:\s*var\(--idu-line\)\s*!important;/.test(css),
  "Opened news posts should keep titles inline and replace bright overflowing separators"
);

assert(
  /@media \(max-width:\s*760px\)[\s\S]*--idu-section-gap:\s*22px;[\s\S]*--idu-dashboard-gap:\s*24px;/.test(css) &&
    /@media \(max-width:\s*760px\)[\s\S]*\.container\s*\{[\s\S]*gap:\s*22px;/.test(css) &&
    /\.idu-news-row\s*\{[\s\S]*grid-template-areas:\s*"title title"\s*"date comments";/.test(css),
  "Mobile pages should use a roomier section rhythm and readable announcement cards"
);

const digestBlock = js.match(/const LOCAL_NEWS_EDITOR_ACCOUNT_DIGESTS = new Set\(\[([\s\S]*?)\]\);/);
assert(digestBlock, "Local editor should declare its account digest gate");
const digests = Array.from(digestBlock[1].matchAll(/"([a-f0-9]{64})"/g), (match) => match[1]);
assert.equal(digests.length, 4, "Exactly four account digests should be authorized");
assert.equal(new Set(digests).size, 4, "Authorized account digests should be unique");

const distributedNewsScripts = [
  js,
  ...[
    path.join(root, "release", "idu-plus-chrome-web-store", "src", "idu-plus.js"),
    path.join(root, "release", "idu-plus-firefox-addon", "src", "idu-plus.js"),
    path.join(root, "release", "idu-plus-safari-userscript", "IDU+.user.js")
  ].map((filePath) => fs.readFileSync(filePath, "utf8"))
];

for (const accountLabel of ["Dominik Pawe\u0142ko", "Filip Izydorczyk", "Jan Nowacki", "Adrian Przybysz"]) {
  for (const distributedScript of distributedNewsScripts) {
    assert(
      !distributedScript.includes(accountLabel),
      `Distributed scripts must not contain the clear-text account label: ${accountLabel}`
    );
  }
}

assert(
  js.includes("const LOCAL_NEWS_EDITOR_CLICK_COUNT = 5") &&
    js.includes("LOCAL_NEWS_EDITOR_CLICK_WINDOW_MS") &&
    js.includes("setEditing(!editing)") &&
    js.includes('title.setAttribute("contenteditable", "plaintext-only")') &&
    js.includes('body.setAttribute("contenteditable", "true")'),
  "Five rapid title clicks should toggle direct title/body editing"
);

assert(
  js.includes("globalThis.chrome?.storage?.local") &&
    !js.includes("chrome.storage.sync") &&
    js.includes("writeLocalNewsDraft(storageKey") &&
    js.includes('window.addEventListener("pagehide"'),
  "News drafts should persist in device-local storage and flush before navigation"
);

const localFeature = js.slice(js.indexOf("const digestLocalNewsAccount"), js.indexOf("const enhanceProfileBoards"));
assert(
  !/\bfetch\s*\(|XMLHttpRequest|sendBeacon|\.submit\s*\(/.test(localFeature) &&
    localFeature.includes("sanitizeLocalNewsMarkup") &&
    localFeature.includes("allowedResourceSources.has(url.href)") &&
    localFeature.includes("LOCAL_NEWS_CONTENT_TAGS") &&
    localFeature.includes("LOCAL_NEWS_CONTENT_ATTRIBUTES") &&
    localFeature.includes("restoreLocalNewsNode") &&
    localFeature.includes("version: 2") &&
    !localFeature.includes("createContextualFragment") &&
    !localFeature.includes("DOMParser") &&
    !/\.innerHTML\s*=/.test(localFeature),
  "The local editor must use a safe structured DOM snapshot, reject new resource URLs, and contain no HTML injection or submission path"
);

assert(
  /\.idu-news-title\[contenteditable\],[\s\S]*\.idu-news-body\[contenteditable\]\s*\{[\s\S]*outline:/.test(css) &&
    /\.idu-local-news-editing::after\s*\{[\s\S]*content:\s*attr\(data-idu-local-label\);/.test(css),
  "Editor affordances should only become visible while local editing is active"
);

console.log("news editor and mobile polish contract ok");
