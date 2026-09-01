const assert = require("assert");
const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const css = fs.readFileSync(path.join(root, "src", "idu-plus.css"), "utf8");
const js = fs.readFileSync(path.join(root, "src", "idu-plus.js"), "utf8");

assert(
  js.includes('!candidate.matches("#new_message_form")') &&
    js.includes('!candidate.querySelector("textarea, .ckeditor, .cke")'),
  "The compose form must never be classified as a message search form"
);

assert(
  js.includes("const enhanceMessageCompose") &&
    js.includes('form.classList.remove("idu-messages-search")') &&
    js.includes('delete form.dataset.iduMessagesSearch') &&
    js.includes('form.classList.add("idu-message-compose")'),
  "Compose enhancement should repair stale search classes and apply its own layout hook"
);

assert(
  js.includes('receiverField?.classList.add("idu-message-compose-receivers")') &&
    js.includes('bodyField?.classList.add("idu-message-compose-body")') &&
    js.includes('actions?.classList.add("idu-message-compose-actions")') &&
    js.includes('receiverInput.setAttribute("placeholder"'),
  "Compose enhancement should identify all functional regions without replacing native controls"
);

assert(
  /html\.idu-plus\.idu-messages-page #content > \.idu-message-compose-module[\s\S]*grid-column:\s*1 \/ -1;/.test(css) &&
    /html\.idu-plus \.idu-message-compose\s*\{[\s\S]*grid-template-columns:\s*minmax\(0, 1\.35fr\) minmax\(260px, 0\.65fr\);/.test(css),
  "The desktop composer should span the messages workspace and keep recipient and subject aligned"
);

assert(
  /html\.idu-plus \.idu-message-compose #message_receiver_ids[\s\S]*display:\s*none\s*!important;/.test(css) &&
    /html\.idu-plus \.idu-message-compose \.token-input-list-facebook[\s\S]*width:\s*100%\s*!important;/.test(css),
  "The hidden recipient source input should stay hidden while the token input fills the field"
);

assert(
  /html\.idu-plus \.idu-message-compose-body\s*\{[\s\S]*gap:\s*5px\s*!important;/.test(css) &&
    /html\.idu-plus \.idu-message-compose-body #message_body[\s\S]*display:\s*none\s*!important;/.test(css),
  "The replaced CKEditor textarea should not create a large blank gap above the editor"
);

assert(
  /html\.idu-plus \.idu-message-compose-body > \.cke[\s\S]*width:\s*100%\s*!important;/.test(css) &&
    /html\.idu-plus \.idu-message-compose-body \.cke_toolbox[\s\S]*display:\s*flex\s*!important;[\s\S]*width:\s*max-content;/.test(css) &&
    /html\.idu-plus \.idu-message-compose-body \.cke_wysiwyg_frame[\s\S]*width:\s*100%\s*!important;/.test(css),
  "CKEditor should be full width with a single horizontally scrollable toolbar lane"
);

assert(
  js.includes("function syncMessageEditorTheme") &&
    js.includes('editorDocument.getElementById("idu-plus-ckeditor-theme")') &&
    js.includes('frame.addEventListener("load", applyTheme)') &&
    js.includes("syncMessageEditorTheme();") &&
    /html\.idu-plus\[data-idu-theme="dark"\] \.idu-message-compose-body \.cke_button_icon[\s\S]*filter:\s*invert\(0\.92\) grayscale\(1\);/.test(css),
  "Dark mode should theme both the CKEditor shell and its same-origin editing document"
);

assert(
  /@media \(max-width:\s*760px\)[\s\S]*html\.idu-plus \.idu-message-compose\s*\{[\s\S]*grid-template-columns:\s*minmax\(0, 1fr\);/.test(css) &&
    /@media \(max-width:\s*760px\)[\s\S]*html\.idu-plus \.idu-message-compose-actions[\s\S]*justify-content:\s*stretch;/.test(css),
  "The composer should collapse to one column with usable mobile actions"
);

console.log("message compose contract ok");
