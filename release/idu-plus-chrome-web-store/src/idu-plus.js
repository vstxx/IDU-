(() => {
  const root = document.documentElement;
  root.classList.add("idu-plus");

  const STORAGE_KEY = "iduPlusAppearance";
  const WORKSPACE_COLLAPSED_KEY = "iduPlusWorkspaceSidebarCollapsed";
  const LOGO_ASSET_PATH = "assets/idu-plus-logo.png";
  const DEFAULT_APPEARANCE = Object.freeze({
    theme: "light",
    layout: "glass",
    accent: "#2f78b7",
    topbar: "#0b2f55",
    titleFont: "aligra"
  });

  const TITLE_FONT_STACKS = Object.freeze({
    aligra: '"Aligra", Georgia, serif',
    inter: '"InterVariable", Inter, "Segoe UI", Arial, sans-serif',
    audex: '"Audex", Georgia, serif',
    otfits: '"Otfits", "InterVariable", Inter, "Segoe UI", Arial, sans-serif'
  });
  const TITLE_FONT_FAMILIES = Object.freeze({
    aligra: '"Aligra"',
    inter: '"InterVariable"',
    audex: '"Audex"',
    otfits: '"Otfits"'
  });
  const TITLE_HEADING_SELECTOR =
    "#content h3, .module h3, .module-important h3, .action-module h3, #student-card h3, #subject-card h3, #message h3";

  const getChromeApi = () => {
    if (typeof chrome === "undefined") {
      return null;
    }

    return chrome;
  };

  const getExtensionAssetUrl = (path) => {
    const api = getChromeApi();

    return api?.runtime?.getURL ? api.runtime.getURL(path) : path;
  };

  const normalizeTheme = (theme) => (theme === "dark" ? "dark" : "light");
  const normalizeLayout = (layout) => (layout === "workspace" ? "workspace" : "glass");
  const normalizeTitleFont = (titleFont) =>
    Object.prototype.hasOwnProperty.call(TITLE_FONT_STACKS, titleFont) ? titleFont : DEFAULT_APPEARANCE.titleFont;

  const normalizeHex = (value, fallback = DEFAULT_APPEARANCE.accent) => {
    const raw = String(value || "").trim();
    const shortMatch = raw.match(/^#([0-9a-f]{3})$/i);

    if (shortMatch) {
      return `#${shortMatch[1]
        .split("")
        .map((char) => `${char}${char}`)
        .join("")}`.toLowerCase();
    }

    if (/^#[0-9a-f]{6}$/i.test(raw)) {
      return raw.toLowerCase();
    }

    return fallback;
  };

  const hexToRgb = (hex) => {
    const clean = normalizeHex(hex).slice(1);

    return {
      r: parseInt(clean.slice(0, 2), 16),
      g: parseInt(clean.slice(2, 4), 16),
      b: parseInt(clean.slice(4, 6), 16)
    };
  };

  const isVeryLightHex = (hex) => {
    const { r, g, b } = hexToRgb(hex);
    const luminance = (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255;

    return luminance >= 0.72;
  };

  const applyLogoAsset = (image) => {
    if (!image) {
      return;
    }

    image.src = getExtensionAssetUrl(LOGO_ASSET_PATH);
    image.alt = "IDU+";
    image.decoding = "async";
  };

  const applyPageLogos = () => {
    document.querySelectorAll("#logo img, .idu-workspace-logo img").forEach(applyLogoAsset);
  };

  const mixChannel = (from, to, amount) => Math.round(from + (to - from) * amount);

  const mixHex = (hex, target, amount) => {
    const from = hexToRgb(hex);
    const to = hexToRgb(target);

    return `#${[mixChannel(from.r, to.r, amount), mixChannel(from.g, to.g, amount), mixChannel(from.b, to.b, amount)]
      .map((channel) => channel.toString(16).padStart(2, "0"))
      .join("")}`;
  };

  const rgba = (hex, alpha) => {
    const { r, g, b } = hexToRgb(hex);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  };

  const normalizeAppearance = (appearance = {}) => ({
    theme: normalizeTheme(appearance.theme),
    layout: normalizeLayout(appearance.layout),
    accent: normalizeHex(appearance.accent),
    topbar: normalizeHex(appearance.topbar || DEFAULT_APPEARANCE.topbar, DEFAULT_APPEARANCE.topbar),
    titleFont: normalizeTitleFont(appearance.titleFont)
  });

  const loadTitleFont = (titleFont) => {
    const family = TITLE_FONT_FAMILIES[normalizeTitleFont(titleFont)];

    if (!document.fonts?.load || !family) {
      return;
    }

    document.fonts.load(`22px ${family}`).catch(() => {});
  };

  const applyTitleFontToHeadings = (titleFont) => {
    const normalizedTitleFont = normalizeTitleFont(titleFont);
    const stack = TITLE_FONT_STACKS[normalizedTitleFont];

    if (!document.body || !stack) {
      return;
    }

    document.querySelectorAll(TITLE_HEADING_SELECTOR).forEach((heading) => {
      heading.dataset.iduTitleFont = normalizedTitleFont;
      heading.style.setProperty("font-family", stack, "important");

      heading.querySelectorAll(":scope > :not(.toggle-switch)").forEach((child) => {
        child.style.setProperty("font-family", "inherit", "important");
      });
    });
  };

  const applyAppearance = (appearance = DEFAULT_APPEARANCE) => {
    const nextAppearance = normalizeAppearance(appearance);
    const accent = nextAppearance.accent;
    const topbar = nextAppearance.topbar;

    root.dataset.iduTheme = nextAppearance.theme;
    root.dataset.iduLayout = nextAppearance.layout;
    root.dataset.iduTitleFont = nextAppearance.titleFont;
    root.dataset.iduLogoTone = isVeryLightHex(topbar) ? "dark" : "light";
    root.classList.toggle("idu-layout-workspace", nextAppearance.layout === "workspace");
    root.style.setProperty("--idu-accent", accent);
    root.style.setProperty("--idu-accent-2", mixHex(accent, "#ffffff", 0.16));
    root.style.setProperty("--idu-accent-deep", mixHex(accent, "#000000", 0.22));
    root.style.setProperty("--idu-accent-soft", rgba(accent, nextAppearance.theme === "dark" ? 0.2 : 0.1));
    root.style.setProperty("--idu-accent-faint", rgba(accent, nextAppearance.theme === "dark" ? 0.14 : 0.08));
    root.style.setProperty("--idu-accent-border", rgba(accent, nextAppearance.theme === "dark" ? 0.28 : 0.18));
    root.style.setProperty(
      "--idu-accent-border-strong",
      rgba(accent, nextAppearance.theme === "dark" ? 0.42 : 0.34)
    );
    root.style.setProperty("--idu-focus-ring", rgba(accent, nextAppearance.theme === "dark" ? 0.32 : 0.18));
    root.style.setProperty("--idu-accent-shadow", `0 10px 24px ${rgba(accent, nextAppearance.theme === "dark" ? 0.26 : 0.2)}`);
    root.style.setProperty("--idu-topbar", topbar);
    root.style.setProperty("--idu-topbar-2", mixHex(topbar, "#ffffff", nextAppearance.theme === "dark" ? 0.08 : 0.14));
    root.style.setProperty("--idu-topbar-glow", rgba(mixHex(topbar, "#ffffff", 0.28), nextAppearance.theme === "dark" ? 0.18 : 0.24));
    root.style.setProperty("--idu-topbar-shadow", `0 18px 50px ${rgba(topbar, nextAppearance.theme === "dark" ? 0.28 : 0.2)}`);
    root.style.setProperty("--idu-title-font", TITLE_FONT_STACKS[nextAppearance.titleFont]);
    loadTitleFont(nextAppearance.titleFont);
    applyTitleFontToHeadings(nextAppearance.titleFont);
    applyPageLogos();

    if (document.body && document.readyState !== "loading") {
      requestAnimationFrame(() => buildWorkspaceShell());
    }

  };

  const loadAppearance = () => {
    const api = getChromeApi();

    if (!api?.storage?.sync) {
      applyAppearance(DEFAULT_APPEARANCE);
      return;
    }

    api.storage.sync.get({ [STORAGE_KEY]: DEFAULT_APPEARANCE }, (result) => {
      applyAppearance(result?.[STORAGE_KEY]);
    });
  };

  const bindAppearanceUpdates = () => {
    const api = getChromeApi();

    if (!api) {
      return;
    }

    api.storage?.onChanged?.addListener((changes, areaName) => {
      if (areaName === "sync" && changes?.[STORAGE_KEY]) {
        applyAppearance(changes[STORAGE_KEY].newValue);
      }
    });

    api.runtime?.onMessage?.addListener((message) => {
      if (message?.type === "IDU_PLUS_APPEARANCE_CHANGED") {
        applyAppearance(message.appearance);
      }
    });
  };

  applyAppearance(DEFAULT_APPEARANCE);
  loadAppearance();
  bindAppearanceUpdates();

  const onReady = (callback) => {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback, { once: true });
      return;
    }

    callback();
  };

  const cleanText = (value) => (value || "").replace(/\s+/g, " ").trim();

  const isElement = (node, tagName) =>
    node && node.nodeType === Node.ELEMENT_NODE && node.tagName === tagName;

  const removeEmptyLinks = (container) => {
    container.querySelectorAll("a").forEach((link) => {
      if (!cleanText(link.textContent)) {
        link.remove();
      }
    });
  };

  const iduProgrammePattern = /\b(MYP5|MYP4|DP1|DP2)\b/g;
  const programmeClassNames = Object.freeze({
    MYP5: "idu-programme-myp5",
    MYP4: "idu-programme-myp4",
    DP1: "idu-programme-dp1",
    DP2: "idu-programme-dp2"
  });
  const highlightSkipTags = new Set(["SCRIPT", "STYLE", "TEXTAREA", "INPUT", "SELECT", "OPTION"]);

  const shouldSkipProgrammeNode = (node) => {
    const parent = node.parentElement;

    return (
      !parent ||
      highlightSkipTags.has(parent.tagName) ||
      parent.closest(".idu-programme-badge") ||
      parent.isContentEditable
    );
  };

  const highlightProgrammeTokens = (container = document.body) => {
    if (!container) {
      return;
    }

    const walker = document.createTreeWalker(container, NodeFilter.SHOW_TEXT, {
      acceptNode(node) {
        if (shouldSkipProgrammeNode(node) || !iduProgrammePattern.test(node.nodeValue || "")) {
          iduProgrammePattern.lastIndex = 0;
          return NodeFilter.FILTER_REJECT;
        }

        iduProgrammePattern.lastIndex = 0;
        return NodeFilter.FILTER_ACCEPT;
      }
    });
    const textNodes = [];

    while (walker.nextNode()) {
      textNodes.push(walker.currentNode);
    }

    textNodes.forEach((node) => {
      const fragment = document.createDocumentFragment();
      const text = node.nodeValue || "";
      let cursor = 0;

      text.replace(iduProgrammePattern, (match, programme, offset) => {
        if (offset > cursor) {
          fragment.appendChild(document.createTextNode(text.slice(cursor, offset)));
        }

        const badge = document.createElement("span");
        badge.className = `idu-programme-badge ${programmeClassNames[programme]}`;
        badge.textContent = programme;
        fragment.appendChild(badge);
        cursor = offset + match.length;
        return match;
      });

      if (cursor < text.length) {
        fragment.appendChild(document.createTextNode(text.slice(cursor)));
      }

      node.replaceWith(fragment);
    });
  };

  const normalizeTopbarLabels = () => {
    const labels = [
      ["#open_user_templates", "Szablony"],
      ["#link_to_unread_forum_posts", "Forum"],
      ["#logout a", "Wyloguj się"]
    ];

    labels.forEach(([selector, label]) => {
      const link = document.querySelector(selector);

      if (link && cleanText(link.textContent) !== label) {
        link.textContent = label;
      }
    });
  };

  const markPageType = () => {
    const loginForm = document.querySelector(
      '#new_user[action*="/users/sign_in"], form.new_user[action*="/users/sign_in"]'
    );
    const dashboardShell = document.querySelector("#site-content.no-menu #content");
    const dashboardSearch = document.querySelector("#user_search");
    const profileCard = document.querySelector("#student-card #student-data");
    const documentsModule = findDocumentsModule();
    const messagesModule = findMessagesModule();

    root.classList.toggle("idu-login-page", Boolean(loginForm));
    root.classList.toggle("idu-dashboard-page", Boolean(dashboardShell && dashboardSearch));
    root.classList.toggle("idu-profile-page", Boolean(profileCard));
    root.classList.toggle("idu-documents-page", Boolean(documentsModule));
    root.classList.toggle("idu-messages-page", Boolean(messagesModule));
  };

  const findDocumentsModule = () =>
    Array.from(document.querySelectorAll(".module, .module-important")).find((module) =>
      /dokumenty szkolne/i.test(cleanText(module.querySelector(":scope > h3")?.textContent))
    ) || null;

  const findMessagesModule = () =>
    Array.from(document.querySelectorAll(".module, .module-important")).find((module) => {
      const title = cleanText(module.querySelector(":scope > h3")?.textContent);
      const form = module.querySelector("form");
      const searchableInputs = form?.querySelectorAll('input[type="text"], input[type="search"]').length || 0;

      return /wiadomo/i.test(title) && searchableInputs >= 2;
    }) || null;

  const hideEmptyFlashSection = () => {
    const flash = document.querySelector("#flash-messages-section");

    if (!flash) {
      return;
    }

    const hasMessageNode = flash.querySelector(".notice, .alert, .success-info, #error_explanation");
    const hasText = cleanText(flash.textContent).length > 0;

    if (!hasMessageNode && !hasText) {
      flash.classList.add("idu-plus-empty");
      flash.setAttribute("aria-hidden", "true");
      flash.remove();
    }
  };

  const enhanceLoginForm = () => {
    if (!root.classList.contains("idu-login-page")) {
      return;
    }

    const submit = document.querySelector('#new_user input[type="submit"], form.new_user input[type="submit"]');
    const loginInput = document.querySelector('#new_user input[name="user[login]"], form.new_user input[name="user[login]"]');
    const passwordInput = document.querySelector(
      '#new_user input[name="user[password]"], form.new_user input[name="user[password]"]'
    );
    applyLogoAsset(document.querySelector("#container #logo img, #container-low #logo img"));

    if (loginInput && !loginInput.getAttribute("placeholder")) {
      loginInput.setAttribute("placeholder", "Login");
    }

    if (passwordInput && !passwordInput.getAttribute("placeholder")) {
      passwordInput.setAttribute("placeholder", "Hasło");
    }

    if (submit && !cleanText(submit.value)) {
      submit.value = "Zaloguj";
    }
  };

  const moveDocumentsAction = () => {
    const toolbar = document.querySelector("#top-selection");
    const documentLink = document.querySelector(
      '.action-module .action-button a[href*="/documents/attachments"]'
    );

    if (!toolbar || !documentLink || toolbar.querySelector(".idu-toolbar-actions")) {
      return;
    }

    const sourceButton = documentLink.closest(".action-button") || documentLink;
    const sourceModule = documentLink.closest(".action-module");
    const sourceSection = sourceModule?.closest(".double-column") || sourceModule;
    const toolbarActions = document.createElement("div");

    toolbarActions.className = "idu-toolbar-actions";
    sourceButton.classList.add("idu-documents-action");
    toolbarActions.appendChild(sourceButton);
    toolbar.appendChild(toolbarActions);

    if (sourceSection) {
      sourceSection.classList.add("idu-plus-removed");
      sourceSection.remove();
    }
  };

  const enhanceDocumentsSearch = () => {
    const module = findDocumentsModule();
    const form = module?.querySelector("form");

    if (!module || !form || form.dataset.iduDocumentsSearch === "true") {
      return;
    }

    module.classList.add("idu-documents-module");
    form.classList.add("idu-documents-search");
    form.dataset.iduDocumentsSearch = "true";

    form.querySelectorAll("div.field, .field").forEach((field) => {
      const labelText = cleanText(field.querySelector("label")?.textContent);

      if (/kategoria/i.test(labelText)) {
        field.classList.add("idu-documents-category-field");
      }

      if (/nazwa/i.test(labelText)) {
        field.classList.add("idu-documents-name-field");
      }
    });

    form.querySelectorAll("select").forEach((select) => {
      if (select.nextElementSibling?.classList.contains("chosen-container")) {
        select.classList.add("idu-chosen-source");
      }
    });

    form.querySelectorAll('input[type="submit"], button[type="submit"]').forEach((submit) => {
      const wrapper = submit.closest(".actions, .field, div") || submit.parentElement;
      wrapper?.classList.add("idu-documents-actions-field");
    });
  };

  const enhanceMessagesSearch = () => {
    const module = findMessagesModule();
    const form = module?.querySelector("form");

    if (!module || !form || form.dataset.iduMessagesSearch === "true") {
      return;
    }

    module.classList.add("idu-messages-module");
    form.classList.add("idu-messages-search");
    form.dataset.iduMessagesSearch = "true";

    form.querySelectorAll("div.field, .field").forEach((field) => {
      const label = field.querySelector("label");
      const labelText = cleanText(label?.textContent);
      const input = field.querySelector('input[type="text"], input[type="search"]');

      if (!labelText || !input) {
        return;
      }

      field.classList.add("idu-messages-search-field");
      input.setAttribute("placeholder", labelText);

      if (!input.getAttribute("aria-label")) {
        input.setAttribute("aria-label", labelText);
      }
    });

    form.querySelectorAll('input[type="submit"], button[type="submit"]').forEach((submit) => {
      const wrapper = submit.closest(".actions, .field, div") || submit.parentElement;
      wrapper?.classList.add("idu-messages-actions-field");
    });
  };

  function readWorkspaceCollapsedState() {
    try {
      return localStorage.getItem(WORKSPACE_COLLAPSED_KEY) === "true";
    } catch (_error) {
      return false;
    }
  }

  function writeWorkspaceCollapsedState(collapsed) {
    try {
      localStorage.setItem(WORKSPACE_COLLAPSED_KEY, String(collapsed));
    } catch (_error) {
      // Ignore restricted storage contexts; the visual state still updates for this page.
    }
  }

  function toggleWorkspaceSidebar(forceCollapsed) {
    const collapsed =
      typeof forceCollapsed === "boolean"
        ? forceCollapsed
        : !root.classList.contains("idu-workspace-sidebar-collapsed");
    const toggle = document.querySelector(".idu-workspace-sidebar-toggle");

    root.classList.toggle("idu-workspace-sidebar-collapsed", collapsed);
    writeWorkspaceCollapsedState(collapsed);

    if (toggle) {
      toggle.setAttribute("aria-expanded", String(!collapsed));
      toggle.setAttribute("title", collapsed ? "Expand sidebar" : "Collapse sidebar");
    }
  }

  function pickLink(selectors, fallbackHref = "#") {
    for (const selector of selectors) {
      const link = document.querySelector(selector);

      if (link?.getAttribute("href")) {
        return link;
      }
    }

    const fallback = document.createElement("a");
    fallback.href = fallbackHref;
    return fallback;
  }

  function createWorkspaceNavLink(item) {
    const link = document.createElement("a");
    const icon = document.createElement("span");
    const text = document.createElement("span");

    link.className = "idu-workspace-nav-link";
    link.href = item.href || "#";
    link.dataset.iduWorkspaceIcon = item.icon;
    icon.className = "idu-workspace-nav-icon";
    icon.setAttribute("aria-hidden", "true");
    text.className = "idu-workspace-nav-text";
    text.textContent = item.label;
    link.append(icon, text);

    if (item.count) {
      const count = document.createElement("span");
      count.className = "idu-workspace-nav-count";
      count.textContent = item.count;
      link.appendChild(count);
    }

    if (item.sourceLink && item.sourceLink.getAttribute("href") === "#") {
      link.addEventListener("click", (event) => {
        event.preventDefault();
        item.sourceLink.click();
      });
    }

    return link;
  }

  function getWorkspaceItems() {
    const messageLink = pickLink(["#toggle_last_internal_messages", '#messages a[href*="/internal_messages"]'], "/internal_messages");
    const newsLink = pickLink(['#news a[href*="/informations"]'], "/informations");
    const templatesLink = pickLink(["#open_user_templates"], "#");
    const forumLink = pickLink(["#link_to_unread_forum_posts", '#forums_path a[href*="/forums"]'], "/forums");
    const accountLink = pickLink(['#account a[href*="/students/"]'], "/students");
    const logoutLink = pickLink(['#logout a[href*="/users/sign_out"]'], "/users/sign_out");
    const documentsLink = pickLink(['.idu-documents-action a[href*="/documents/attachments"]', 'a[href*="/documents/attachments"]'], "/documents/attachments");
    const messageCount = cleanText(document.querySelector("#messages strong")?.textContent);
    const newsCount = cleanText(document.querySelector("#news strong")?.textContent);

    return [
      { label: "Dashboard", icon: "dashboard", href: "/" },
      { label: "Messages", icon: "mail", href: messageLink.href, count: messageCount, sourceLink: messageLink },
      { label: "News", icon: "news", href: newsLink.href, count: newsCount, sourceLink: newsLink },
      { label: "Documents", icon: "documents", href: documentsLink.href, sourceLink: documentsLink },
      { label: "Forum", icon: "forum", href: forumLink.href, sourceLink: forumLink },
      { label: "Templates", icon: "templates", href: templatesLink.href, sourceLink: templatesLink },
      { label: "Profile", icon: "profile", href: accountLink.href, sourceLink: accountLink },
      { label: "Logout", icon: "logout", href: logoutLink.href, sourceLink: logoutLink }
    ];
  }

  function findWorkspacePhoto() {
    const candidates = [
      "#student-card #photo img",
      "#photo img",
      ".student-photo img",
      ".profile-photo img",
      'img[alt*="Student photo"]'
    ];

    for (const selector of candidates) {
      const image = document.querySelector(selector);
      const source = image?.getAttribute("src") || "";

      if (image && source.trim()) {
        return image;
      }
    }

    return null;
  }

  function syncWorkspaceShell(shell) {
    const nav = shell.querySelector(".idu-workspace-nav");
    const userName = cleanText(document.querySelector("#login strong")?.textContent) || "Student";
    const schoolName = cleanText(document.querySelector("#school-name")?.textContent) || "IDU workspace";
    const logoImage = shell.querySelector(".idu-workspace-logo img");
    const profileLink = document.querySelector('#account a[href*="/students/"]');
    const userCard = shell.querySelector(".idu-workspace-user");
    const avatar = shell.querySelector(".idu-workspace-avatar");
    const avatarImage = shell.querySelector(".idu-workspace-avatar img");
    const sourcePhoto = findWorkspacePhoto();
    const user = shell.querySelector(".idu-workspace-user-name");
    const subtitle = shell.querySelector(".idu-workspace-school");

    applyLogoAsset(logoImage);

    if (profileLink && userCard) {
      userCard.href = profileLink.href;
      userCard.setAttribute("aria-label", `Open profile for ${userName}`);
    }

    if (avatar && avatarImage) {
      const rawPhotoSource = sourcePhoto?.getAttribute("src") || "";
      const photoSource = rawPhotoSource.trim() ? sourcePhoto.currentSrc || sourcePhoto.src || rawPhotoSource : "";
      avatar.classList.toggle("has-image", Boolean(photoSource.trim()));

      if (photoSource.trim()) {
        avatarImage.src = photoSource;
        avatarImage.alt = sourcePhoto.alt || userName;
      } else {
        avatarImage.removeAttribute("src");
        avatarImage.alt = "";
      }
    }

    if (user) {
      user.textContent = userName;
    }

    if (subtitle) {
      subtitle.textContent = schoolName;
    }

    if (nav) {
      nav.replaceChildren(...getWorkspaceItems().map(createWorkspaceNavLink));
    }
  }

  function buildWorkspaceShell() {
    if (!document.body) {
      return;
    }

    let shell = document.querySelector(".idu-workspace-sidebar");

    if (root.dataset.iduLayout !== "workspace" || root.classList.contains("idu-login-page")) {
      shell?.remove();
      return;
    }

    if (!shell) {
      shell = document.createElement("aside");
      shell.className = "idu-workspace-sidebar";
      shell.setAttribute("aria-label", "IDU+ workspace navigation");
      shell.innerHTML = `
        <div class="idu-workspace-brand">
          <a class="idu-workspace-logo" href="/" aria-label="IDU+ home"><img alt="IDU+" src="${getExtensionAssetUrl(LOGO_ASSET_PATH)}"></a>
          <button class="idu-workspace-sidebar-toggle" type="button" aria-label="Toggle sidebar" aria-expanded="true" title="Collapse sidebar">
            <span aria-hidden="true"></span>
          </button>
        </div>
        <a class="idu-workspace-user" href="#" aria-label="Open your profile">
          <span class="idu-workspace-avatar" aria-hidden="true"><img alt=""></span>
          <div>
            <strong class="idu-workspace-user-name">Student</strong>
            <span class="idu-workspace-school">IDU workspace</span>
          </div>
        </a>
        <nav class="idu-workspace-nav" aria-label="Main"></nav>
        <div class="idu-workspace-footer">
          <span class="idu-workspace-footer-dot" aria-hidden="true"></span>
          <span>Workspace layout</span>
        </div>
      `;
      document.body.prepend(shell);
      shell.querySelector(".idu-workspace-sidebar-toggle")?.addEventListener("click", () => toggleWorkspaceSidebar());
    }

    syncWorkspaceShell(shell);
    toggleWorkspaceSidebar(readWorkspaceCollapsedState());
  }

  const enhanceSubjectModule = (module) => {
    const heading = module.querySelector(":scope > h3");
    const foldable = module.querySelector(":scope > .foldable");

    if (!heading || !foldable || foldable.dataset.iduPlusSubjects === "true") {
      return;
    }

    if (!/przedmioty/i.test(cleanText(heading.textContent))) {
      return;
    }

    const subjectHeader = Array.from(foldable.querySelectorAll(":scope > h4")).find((h4) =>
      /przedmioty/i.test(cleanText(h4.textContent))
    );

    if (!subjectHeader) {
      return;
    }

    foldable.dataset.iduPlusSubjects = "true";
    foldable.classList.add("idu-subjects-content");

    const firstHeader = foldable.querySelector(":scope > h4");
    if (firstHeader && firstHeader !== subjectHeader) {
      const summary = document.createElement("div");
      summary.className = "idu-class-summary";

      let cursor = firstHeader.nextSibling;
      while (cursor && cursor !== subjectHeader) {
        const next = cursor.nextSibling;
        summary.appendChild(cursor);
        cursor = next;
      }

      firstHeader.after(summary);
    }

    const rows = [];
    let cursor = subjectHeader.nextSibling;

    while (cursor) {
      const next = cursor.nextSibling;

      if (isElement(cursor, "B")) {
        const row = document.createElement("div");
        const name = document.createElement("div");
        const actions = document.createElement("div");

        row.className = "idu-subject-row";
        name.className = "idu-subject-name";
        actions.className = "idu-subject-actions";

        name.appendChild(cursor);
        removeEmptyLinks(name);

        cursor = next;

        while (cursor) {
          const actionNext = cursor.nextSibling;

          if (isElement(cursor, "BR")) {
            cursor.remove();
            cursor = actionNext;
            break;
          }

          if (isElement(cursor, "A") && cleanText(cursor.textContent)) {
            actions.appendChild(cursor);
          } else {
            cursor.remove();
          }

          cursor = actionNext;
        }

        row.append(name, actions);
        rows.push(row);
        continue;
      }

      if (cursor.nodeType === Node.TEXT_NODE || isElement(cursor, "BR")) {
        cursor.remove();
      }

      cursor = next;
    }

    if (rows.length) {
      const list = document.createElement("div");
      list.className = "idu-subject-list";
      rows.forEach((row) => list.appendChild(row));
      subjectHeader.after(list);
    }
  };

  const enhancePage = () => {
    markPageType();
    applyPageLogos();
    normalizeTopbarLabels();
    enhanceLoginForm();
    hideEmptyFlashSection();
    moveDocumentsAction();
    enhanceDocumentsSearch();
    enhanceMessagesSearch();
    document.querySelectorAll(".module").forEach(enhanceSubjectModule);
    buildWorkspaceShell();
    highlightProgrammeTokens();
    applyTitleFontToHeadings(root.dataset.iduTitleFont);
  };

  onReady(enhancePage);
})();
