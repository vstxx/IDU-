const assert = require("assert");
const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const css = fs.readFileSync(path.join(root, "src", "idu-plus.css"), "utf8");
const js = fs.readFileSync(path.join(root, "src", "idu-plus.js"), "utf8");

assert(
  js.includes("findMessagesModule") &&
    js.includes("searchableInputs") &&
    js.includes("idu-messages-page") &&
    js.includes("enhanceMessagesSearch") &&
    js.includes("idu-messages-module") &&
    js.includes("idu-messages-search"),
  "Content script should detect and mark the messages search module"
);

assert(
  js.includes('input.setAttribute("placeholder", labelText)') &&
    js.includes('input.setAttribute("aria-label", labelText)') &&
    js.includes("idu-messages-search-field") &&
    js.includes("idu-messages-actions-field"),
  "Messages search labels should move into placeholders while preserving accessible labels"
);

assert(
  /html\.idu-plus \.idu-messages-search[\s\S]*display:\s*grid\s*!important;[\s\S]*grid-template-columns:\s*repeat\(3,\s*minmax\(180px,\s*1fr\)\)\s*auto;/.test(css),
  "Messages search should use a horizontal three-field desktop grid"
);

assert(
  /html\.idu-plus \.idu-messages-search \.idu-messages-search-field label[\s\S]*clip:\s*rect\(0 0 0 0\)\s*!important;/.test(css),
  "Messages search labels should be visually hidden after moving text into inputs"
);

assert(
  /html\.idu-plus \.idu-messages-search \.idu-messages-search-field input\[type="text"\],[\s\S]*width:\s*100%\s*!important;/.test(css) &&
    /html\.idu-plus \.idu-messages-search input::placeholder[\s\S]*font-weight:\s*650;/.test(css),
  "Messages search inputs should fill their columns and show stronger placeholder text"
);

assert(
  /@media \(max-width:\s*760px\)[\s\S]*html\.idu-plus \.idu-messages-search[\s\S]*grid-template-columns:\s*1fr;/.test(css),
  "Messages search should collapse cleanly on mobile"
);

assert(
  js.includes('document.querySelectorAll(\'#toggle_last_internal_messages, #messages a[href]\')') &&
    js.includes('window.location.assign(messageLink.href)') &&
    js.includes('window.location.assign("/internal_messages")'),
  "Messages topbar action should bypass the legacy preview and navigate to the inbox"
);

assert(
  js.includes('module.querySelector("#message-folders")') &&
    js.includes('nativeNavigation.classList.add("idu-page-tools", "idu-message-folders")') &&
    js.includes('const folderKeys = ["inbox", "sent", "drafts", "trash", "compose"]'),
  "Message folders should enhance the native IDU navigation instead of duplicating it"
);

assert(
  /html\.idu-plus\.idu-messages-page \.idu-message-folders[\s\S]*display:\s*grid\s*!important;[\s\S]*grid-template-columns:\s*repeat\(5,\s*minmax\(118px,\s*1fr\)\);/.test(css) &&
    /html\.idu-plus\.idu-messages-page \.idu-message-folders \.idu-page-tool-link[\s\S]*min-height:\s*44px;[\s\S]*height:\s*44px;/.test(css),
  "Message folder actions should use five aligned equal-height columns"
);

console.log("messages search contract ok");
