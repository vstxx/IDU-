const assert = require("assert");
const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const popupHtml = fs.readFileSync(path.join(root, "popup.html"), "utf8");
const popupCss = fs.readFileSync(path.join(root, "src", "popup.css"), "utf8");
const popupJs = fs.readFileSync(path.join(root, "src", "popup.js"), "utf8");
const contentJs = fs.readFileSync(path.join(root, "src", "idu-plus.js"), "utf8");
const contentCss = fs.readFileSync(path.join(root, "src", "idu-plus.css"), "utf8");

assert(
  popupHtml.includes('data-layout-option="glass"') &&
    popupHtml.includes('data-layout-option="workspace"') &&
    popupHtml.includes('id="layoutHeading"') &&
    popupHtml.includes("<strong>Portal</strong>") &&
    popupHtml.includes("<strong>Sidebar</strong>") &&
    popupHtml.includes("Modern app shell"),
  "Popup should expose logically named Portal/Sidebar layout choices"
);

assert(
  popupJs.includes('layout: "glass"') &&
    popupJs.includes("normalizeLayout") &&
    popupJs.includes("data-layout-option") &&
    popupJs.includes("nextAppearance.layout"),
  "Popup JS should persist and render the selected layout mode"
);

assert(
  popupCss.includes(".layout-switch") &&
    popupCss.includes(".layout-option[aria-pressed=\"true\"]") &&
    popupCss.includes('body[data-layout="workspace"] .preview-card'),
  "Popup CSS should style layout choices and the workspace preview state"
);

assert(
  contentJs.includes('layout: "glass"') &&
    contentJs.includes("normalizeLayout") &&
    contentJs.includes("root.dataset.iduLayout") &&
    contentJs.includes("idu-layout-workspace") &&
    contentJs.includes("buildWorkspaceShell") &&
    contentJs.includes("toggleWorkspaceSidebar") &&
    contentJs.includes(".idu-workspace-logo") &&
    contentJs.includes("applyLogoAsset") &&
    contentJs.includes("findWorkspacePhoto") &&
    contentJs.includes('getAttribute("src")') &&
    contentJs.includes(".idu-workspace-user") &&
    contentJs.includes(".idu-workspace-avatar img"),
  "Content script should apply layout mode and build an expandable workspace shell"
);

assert(
  /html\.idu-plus\[data-idu-layout="workspace"\]\s*\{[\s\S]*--idu-ws-sidebar-width:\s*272px;/.test(contentCss) &&
    /html\.idu-plus\[data-idu-layout="workspace"\]\.idu-workspace-sidebar-collapsed\s*\{[\s\S]*--idu-ws-sidebar-width:\s*82px;/.test(contentCss),
  "Workspace CSS should define expanded and collapsed sidebar widths"
);

assert(
  contentCss.includes(".idu-workspace-sidebar") &&
    contentCss.includes(".idu-workspace-sidebar-toggle") &&
    contentCss.includes(".idu-workspace-logo img") &&
    contentCss.includes('html.idu-plus[data-idu-logo-tone="dark"] .idu-workspace-logo img') &&
    !contentCss.includes(".idu-workspace-logo::after") &&
    contentCss.includes(".idu-workspace-nav-link") &&
    /html\.idu-plus\[data-idu-layout="workspace"\] #top[\s\S]*position:\s*sticky/.test(contentCss) &&
    /html\.idu-plus\[data-idu-layout="workspace"\]:not\(\.idu-login-page\) body[\s\S]*padding-left:\s*var\(--idu-ws-sidebar-width\)\s*!important;/.test(contentCss) &&
    /html\.idu-plus\[data-idu-layout="workspace"\] \.container[\s\S]*margin:\s*0 var\(--idu-ws-gutter\)\s*!important;/.test(contentCss),
  "Workspace CSS should move the portal into an app-shell layout"
);

const sidebarRule = (contentCss.match(
  /html\.idu-plus\[data-idu-layout="workspace"\] \.idu-workspace-sidebar\s*\{([\s\S]*?)\}/
) || [])[1];
const navIconRule = (contentCss.match(
  /html\.idu-plus\[data-idu-layout="workspace"\] \.idu-workspace-nav-icon\s*\{([\s\S]*?)\}/
) || [])[1];
const sidebarToggleRule = (contentCss.match(
  /html\.idu-plus\[data-idu-layout="workspace"\] \.idu-workspace-sidebar-toggle\s*\{([\s\S]*?)\}/
) || [])[1];
const avatarRule = (contentCss.match(
  /html\.idu-plus\[data-idu-layout="workspace"\] \.idu-workspace-avatar\s*\{([\s\S]*?)\}/
) || [])[1];

assert(
  sidebarRule &&
    /font-family:\s*"InterVariable"/.test(sidebarRule) &&
    /background:\s*var\(--idu-glass-sidebar-surface\)/.test(sidebarRule) &&
    /box-shadow:\s*var\(--idu-glass-shadow-soft\)/.test(sidebarRule),
  "Workspace sidebar should use clean Inter typography and the restrained shared Frost material"
);

assert(
  navIconRule && /border:\s*0;/.test(navIconRule) && /background:\s*transparent;/.test(navIconRule),
  "Workspace navigation icons should stand alone without bordered tiles"
);

assert(
  sidebarToggleRule &&
    /border:\s*0\s*!important;/.test(sidebarToggleRule) &&
    /background:\s*transparent\s*!important;/.test(sidebarToggleRule) &&
    /box-shadow:\s*none\s*!important;/.test(sidebarToggleRule),
  "Workspace collapse button should stay minimal until hover or focus"
);

assert(
  avatarRule && /border-radius:\s*50%;/.test(avatarRule),
  "Workspace profile photo and its accent placeholder should be circular"
);

assert(
  !/html\.idu-plus\[data-idu-layout="workspace"\] \.module,[\s\S]*color-mix\(in srgb, var\(--idu-surface-strong\)/.test(contentCss) &&
    !/html\.idu-plus\[data-idu-layout="workspace"\] \.module h3,[\s\S]*font-family:\s*var\(--idu-font\)/.test(contentCss),
  "Workspace mode should keep body modules visually aligned with the shared glassy layout"
);

assert(
  contentJs.includes('userCard.className = "idu-workspace-user"') &&
    contentJs.includes('userCard.href = "#"') &&
    /userCard\.href\s*=\s*profileLink\.href/.test(contentJs) &&
    /avatar\.classList\.toggle\("has-image"/.test(contentJs),
  "Workspace sidebar user card should link to the profile and display a photo when IDU exposes one"
);

assert(
  contentJs.includes('root.dataset.iduLayout !== "workspace"') &&
    contentJs.includes('root.classList.contains("idu-login-page")') &&
    contentJs.includes("shell?.remove()"),
  "Workspace sidebar should only exist in Sidebar layout on logged-in portal pages"
);

console.log("workspace layout contract ok");
