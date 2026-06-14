(() => {
  const root = document.documentElement;
  root.classList.add("idu-plus");

  const STORAGE_KEY = "iduPlusAppearance";
  const DEFAULT_APPEARANCE = Object.freeze({
    theme: "light",
    accent: "#2f78b7",
    topbar: "#0b2f55"
  });

  const getChromeApi = () => {
    if (typeof chrome === "undefined") {
      return null;
    }

    return chrome;
  };

  const normalizeTheme = (theme) => (theme === "dark" ? "dark" : "light");

  const normalizeHex = (value) => {
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

    return DEFAULT_APPEARANCE.accent;
  };

  const hexToRgb = (hex) => {
    const clean = normalizeHex(hex).slice(1);

    return {
      r: parseInt(clean.slice(0, 2), 16),
      g: parseInt(clean.slice(2, 4), 16),
      b: parseInt(clean.slice(4, 6), 16)
    };
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
    accent: normalizeHex(appearance.accent),
    topbar: normalizeHex(appearance.topbar || DEFAULT_APPEARANCE.topbar)
  });

  const applyAppearance = (appearance = DEFAULT_APPEARANCE) => {
    const nextAppearance = normalizeAppearance(appearance);
    const accent = nextAppearance.accent;
    const topbar = nextAppearance.topbar;

    root.dataset.iduTheme = nextAppearance.theme;
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

    root.classList.toggle("idu-login-page", Boolean(loginForm));
    root.classList.toggle("idu-dashboard-page", Boolean(dashboardShell && dashboardSearch));
    root.classList.toggle("idu-profile-page", Boolean(profileCard));
  };

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
    normalizeTopbarLabels();
    hideEmptyFlashSection();
    moveDocumentsAction();
    document.querySelectorAll(".module").forEach(enhanceSubjectModule);
    highlightProgrammeTokens();
  };

  onReady(enhancePage);
})();
