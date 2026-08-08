(() => {
  const root = document.documentElement;
  root.classList.add("idu-plus");

  const STORAGE_KEY = "iduPlusAppearance";
  const WORKSPACE_COLLAPSED_KEY = "iduPlusWorkspaceSidebarCollapsed";
  const LOGO_ASSET_PATH = "assets/idu-plus-logo.png";
  const MOBILE_VIEWPORT_CONTENT = "width=device-width, initial-scale=1, viewport-fit=cover";
  const USERSCRIPT_COMPACT_SCHOOL_NAME = "1SLO IB";
  const USERSCRIPT_THEME_DOCK_ID = "idu-plus-userscript-theme-dock";
  const STICKY_ACTIONS_ID = "idu-plus-sticky-actions";
  const DIAGNOSTICS_ENDPOINT = "https://idu-plus-diagnostics.jas-nowacki.workers.dev/diagnostics";
  const DIAGNOSTICS_RETRY_DELAYS_MS = Object.freeze([0, 1200, 3500, 8000]);
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
  const USERSCRIPT_THEME_OPTIONS = Object.freeze([
    ["light", "Light"],
    ["dark", "Dark"]
  ]);
  const USERSCRIPT_LAYOUT_OPTIONS = Object.freeze([
    ["glass", "Portal", "Classic IDU+"],
    ["workspace", "Sidebar", "Modern app shell"]
  ]);
  const USERSCRIPT_TITLE_FONT_OPTIONS = Object.freeze([
    ["aligra", "Aligra", "Elegant serif"],
    ["inter", "Inter", "Clean UI"],
    ["audex", "Audex", "Sharp serif"],
    ["otfits", "Otfits", "Grotesk"]
  ]);
  const USERSCRIPT_ACCENT_PRESETS = Object.freeze([
    ["#2f78b7", "IDU blue"],
    ["#2d9c8f", "Sea teal"],
    ["#6f63d9", "Soft violet"],
    ["#c4577d", "Rose"],
    ["#d0802e", "Amber"],
    ["#4e8f42", "Moss"]
  ]);
  const USERSCRIPT_TOPBAR_PRESETS = Object.freeze([
    ["#0b2f55", "IDU navy"],
    ["#111827", "Graphite"],
    ["#17324a", "Steel blue"],
    ["#243b2f", "Deep green"],
    ["#3a2440", "Aubergine"],
    ["#4a2d18", "Walnut"]
  ]);
  const TITLE_HEADING_SELECTOR =
    "#content h3, .module h3, .module-important h3, .action-module h3, #student-card h3, #subject-card h3, #message h3";
  const TOPBAR_LABELS = Object.freeze({
    pl: {
      templates: "Szablony",
      forum: "Forum",
      logout: "Wyloguj si\u0119",
      profile: "Tw\u00f3j profil",
      greeting: "Witaj,",
      messagesBefore: "Masz",
      messagesAfter: "nowe wiadomo\u015bci",
      newsBefore: "Pojawi\u0142y si\u0119",
      newsAfter: "nowe aktualno\u015bci"
    },
    en: {
      templates: "Templates",
      forum: "Forum",
      logout: "Logout",
      profile: "Your profile",
      greeting: "Hello,",
      messagesBefore: "You have",
      messagesAfter: "new messages",
      newsBefore: "There are",
      newsAfter: "new announcements"
    }
  });
  const WORKSPACE_LABELS = Object.freeze({
    pl: {
      dashboard: "Pulpit",
      messages: "Wiadomo\u015bci",
      news: "Aktualno\u015bci",
      documents: "Dokumenty",
      forum: "Forum",
      templates: "Szablony",
      profile: "Profil",
      logout: "Wyloguj",
      footer: "Uk\u0142ad workspace",
      home: "IDU+ strona g\u0142\u00f3wna",
      main: "G\u0142\u00f3wne",
      toggle: "Prze\u0142\u0105cz sidebar",
      expand: "Rozwi\u0144 sidebar",
      collapse: "Zwi\u0144 sidebar",
      openProfile: "Otw\u00f3rz profil"
    },
    en: {
      dashboard: "Dashboard",
      messages: "Messages",
      news: "News",
      documents: "Documents",
      forum: "Forum",
      templates: "Templates",
      profile: "Profile",
      logout: "Logout",
      footer: "Workspace layout",
      home: "IDU+ home",
      main: "Main",
      toggle: "Toggle sidebar",
      expand: "Expand sidebar",
      collapse: "Collapse sidebar",
      openProfile: "Open your profile"
    }
  });
  const UI_TRANSLATIONS = Object.freeze({
    en: new Map([
      ["Semestr:", "Semester:"],
      ["Jeste\u015b tutaj:", "You are here:"],
      ["JesteÅ› tutaj:", "You are here:"],
      ["Hol szkolny", "School hall"],
      ["zwi\u0144", "Collapse"],
      ["zwiÅ„", "Collapse"],
      ["rozwi\u0144", "Expand"],
      ["rozwiÅ„", "Expand"],
      ["Zobacz wszystkie", "See all"],
      ["Nowa wiadomo\u015b\u0107", "New message"],
      ["Nowa wiadomoÅ›Ä‡", "New message"],
      ["Åadowanie ...", "Loading ..."],
      ["\u0141adowanie ...", "Loading ..."],
      ["Wyszukiwarka u\u017cytkownik\u00f3w", "User search"],
      ["Wyszukiwarka uÅ¼ytkownikÃ³w", "User search"],
      ["Imi\u0119 lub nazwisko", "First or last name"],
      ["ImiÄ™ lub nazwisko", "First or last name"],
      ["Aktualno\u015bci", "News"],
      ["AktualnoÅ›ci", "News"],
      ["Najbli\u017csze wydarzenia", "Upcoming events"],
      ["NajbliÅ¼sze wydarzenia", "Upcoming events"],
      ["Wydarzenia", "Events"],
      ["Ostatnie zadania domowe", "Recent homework"],
      ["Najbli\u017csze sprawdziany", "Upcoming tests"],
      ["NajbliÅ¼sze sprawdziany", "Upcoming tests"],
      ["Ostatnie obecno\u015bci", "Recent attendance"],
      ["Ostatnie obecnoÅ›ci", "Recent attendance"],
      ["Frekwencja ucznia", "Student attendance"],
      ["Przedmiot", "Subject"],
      ["Obecno\u015b\u0107", "Presence"],
      ["ObecnoÅ›Ä‡", "Presence"],
      ["Nieobecno\u015b\u0107", "Absence"],
      ["NieobecnoÅ›Ä‡", "Absence"],
      ["Sp\u00f3\u017anienie", "Lateness"],
      ["SpÃ³Åºnienie", "Lateness"],
      ["razem", "Total"],
      ["poka\u017c szczeg\u00f3\u0142y", "Show details"],
      ["pokaÅ¼ szczegÃ³Å‚y", "Show details"],
      ["w tym usprawiedliwione:", "justified:"],
      ["Odwo\u0142ana", "Canceled"],
      ["OdwoÅ‚ana", "Canceled"],
      ["kalendarz", "calendar"],
      ["zobacz sw\u00f3j kalendarz", "See your calendar"],
      ["zobacz swÃ³j kalendarz", "See your calendar"],
      ["zobacz kalendarz publiczny", "See public calendar"],
      ["aktywne do:", "active until:"],
      ["komentarze:", "comments:"],
      ["Aktualizacja:", "Updated:"],
      ["Niedziela", "Sunday"],
      ["Poniedzia\u0142ek", "Monday"],
      ["PoniedziaÅ‚ek", "Monday"],
      ["Wtorek", "Tuesday"],
      ["\u015aroda", "Wednesday"],
      ["Åšroda", "Wednesday"],
      ["Czwartek", "Thursday"],
      ["Pi\u0105tek", "Friday"],
      ["PiÄ…tek", "Friday"],
      ["Sobota", "Saturday"]
    ])
  });
  let currentAppearance = { ...DEFAULT_APPEARANCE };
  let lastAppliedAppearance = "";
  let diagnosticsComplete = false;
  let foldableAnimationsBound = false;
  let stickyActionsObserver = null;
  let stickyActionsScrollBound = false;
  let openSelectDropdown = null;
  let selectOutsideClickBound = false;
  let enhancedSelectCount = 0;

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

  const reportDiagnostics = () => {
    const api = getChromeApi();

    try {
      if (diagnosticsComplete || !window.IDUPlusDiagnostics?.reportActiveUser || !api?.runtime) {
        return;
      }

      void window.IDUPlusDiagnostics.reportActiveUser({
        document,
        endpoint: DIAGNOSTICS_ENDPOINT,
        fetch: window.fetch?.bind(window),
        location: window.location,
        navigator: window.navigator,
        runtime: api.runtime,
        storage: api.storage,
        crypto: window.crypto
      })
        .then((result) => {
          if (result?.sent || result?.reason === "throttled") {
            diagnosticsComplete = true;
          }
        })
        .catch(() => {});
    } catch (_error) {
      // Diagnostics must never affect the IDU+ visual layer.
    }
  };

  const scheduleDiagnosticsReport = () => {
    DIAGNOSTICS_RETRY_DELAYS_MS.forEach((delay) => {
      if (delay === 0) {
        reportDiagnostics();
        return;
      }

      window.setTimeout(reportDiagnostics, delay);
    });
  };

  const isMobileBrowser = () => {
    const userAgent = navigator.userAgent || "";
    const isPhone = /iPhone|iPod|Android.+Mobile|Windows Phone/i.test(userAgent);
    const isTouchTablet =
      /iPad/i.test(userAgent) ||
      (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1 && Math.min(screen.width, screen.height) <= 834);

    return isPhone || isTouchTablet;
  };

  const isUserscriptBuild = () =>
    Boolean(window.__IDU_PLUS_USERSCRIPT__) || root.classList.contains("idu-userscript-build");

  const shouldUseUserscriptMobileUX = () => isUserscriptBuild() && isMobileBrowser();

  const applyMobileViewport = () => {
    if (!isMobileBrowser()) {
      return;
    }

    root.classList.add("idu-mobile-web-app");

    const head = document.head || document.querySelector("head");

    if (!head) {
      return;
    }

    const existing = head.querySelector('meta[name="viewport"]');
    const viewport = existing || document.createElement("meta");

    viewport.setAttribute("name", "viewport");
    viewport.setAttribute("content", MOBILE_VIEWPORT_CONTENT);

    if (!existing) {
      head.prepend(viewport);
    }
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

  const readLocalAppearance = () => {
    try {
      return normalizeAppearance(JSON.parse(localStorage.getItem(STORAGE_KEY) || "null") || DEFAULT_APPEARANCE);
    } catch (_error) {
      return normalizeAppearance(DEFAULT_APPEARANCE);
    }
  };

  const writeLocalAppearance = (appearance) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(normalizeAppearance(appearance)));
    } catch (_error) {
      // Ignore restricted storage contexts; the current page still updates immediately.
    }
  };

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

      heading
        .querySelectorAll(":scope > :not(.toggle-switch):not(.idu-plus-ics-export):not(.idu-schedule-print-link)")
        .forEach((child) => {
          child.style.setProperty("font-family", "inherit", "important");
        });
    });
  };

  const applyAppearance = (appearance = DEFAULT_APPEARANCE) => {
    const nextAppearance = normalizeAppearance(appearance);
    const appearanceKey = [
      nextAppearance.theme,
      nextAppearance.layout,
      nextAppearance.accent,
      nextAppearance.topbar,
      nextAppearance.titleFont
    ].join("|");

    if (appearanceKey === lastAppliedAppearance) {
      return;
    }

    const accent = nextAppearance.accent;
    const topbar = nextAppearance.topbar;

    currentAppearance = nextAppearance;
    root.dataset.iduTheme = nextAppearance.theme;
    root.dataset.iduLayout = nextAppearance.layout;
    root.dataset.iduTitleFont = nextAppearance.titleFont;
    root.dataset.iduLogoTone = isVeryLightHex(topbar) ? "dark" : "light";
    root.classList.toggle("idu-layout-workspace", nextAppearance.layout === "workspace");
    root.style.setProperty("--idu-accent", accent);
    root.style.setProperty("--idu-accent-deep", mixHex(accent, "#000000", 0.22));
    root.style.setProperty("--idu-accent-soft", rgba(accent, nextAppearance.theme === "dark" ? 0.2 : 0.1));
    root.style.setProperty("--idu-accent-faint", rgba(accent, nextAppearance.theme === "dark" ? 0.14 : 0.08));
    root.style.setProperty("--idu-accent-border", rgba(accent, nextAppearance.theme === "dark" ? 0.28 : 0.18));
    root.style.setProperty(
      "--idu-accent-border-strong",
      rgba(accent, nextAppearance.theme === "dark" ? 0.42 : 0.34)
    );
    root.style.setProperty("--idu-focus-ring", rgba(accent, nextAppearance.theme === "dark" ? 0.32 : 0.18));
    root.style.setProperty("--idu-accent-shadow", `0 4px 12px ${rgba(accent, nextAppearance.theme === "dark" ? 0.22 : 0.16)}`);
    root.style.setProperty("--idu-topbar", topbar);
    root.style.setProperty("--idu-topbar-2", mixHex(topbar, "#ffffff", nextAppearance.theme === "dark" ? 0.08 : 0.14));
    root.style.setProperty("--idu-topbar-glow", rgba(mixHex(topbar, "#ffffff", 0.28), nextAppearance.theme === "dark" ? 0.18 : 0.24));
    root.style.setProperty("--idu-topbar-shadow", `0 6px 18px ${rgba(topbar, nextAppearance.theme === "dark" ? 0.24 : 0.15)}`);
    root.style.setProperty("--idu-title-font", TITLE_FONT_STACKS[nextAppearance.titleFont]);
    loadTitleFont(nextAppearance.titleFont);
    applyTitleFontToHeadings(nextAppearance.titleFont);
    applyPageLogos();
    syncUserscriptAppearanceDock();
    lastAppliedAppearance = appearanceKey;

    if (document.body && document.readyState !== "loading") {
      requestAnimationFrame(() => buildWorkspaceShell());
    }

  };

  const loadAppearance = () => {
    const api = getChromeApi();

    if (!api?.storage?.sync) {
      applyAppearance(readLocalAppearance());
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

  applyMobileViewport();
  document.addEventListener("DOMContentLoaded", applyMobileViewport, { once: true });
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

  // Podnosi pierwsza litere do wielkiej, zostawiajac reszte bez zmian, zeby
  // przyciski i etykiety akcji czytaly sie jak "Zwin", a nie "zwin".
  const capitalizeFirst = (value) => {
    const text = value || "";
    const first = text.match(/[^\s]/);

    if (!first) {
      return text;
    }

    const index = first.index;
    return text.slice(0, index) + first[0].toLocaleUpperCase() + text.slice(index + 1);
  };

  const getCurrentLocale = () => {
    const languageLink = document.querySelector('#change_language a[href*="locale="], #language a[href*="locale="]');
    const rawTarget =
      languageLink?.getAttribute("href")?.match(/[?&]locale=([a-z-]+)/i)?.[1]?.toLowerCase() ||
      cleanText(languageLink?.textContent).match(/\b(EN|PL)\b/i)?.[1]?.toLowerCase() ||
      "";

    if (rawTarget === "pl") {
      return "en";
    }

    if (rawTarget === "en") {
      return "pl";
    }

    return /^en\b/i.test(root.lang || document.documentElement.lang || navigator.language || "") ? "en" : "pl";
  };

  const getTopbarLabels = () => TOPBAR_LABELS[getCurrentLocale()] || TOPBAR_LABELS.pl;
  const getWorkspaceLabels = () => WORKSPACE_LABELS[getCurrentLocale()] || WORKSPACE_LABELS.pl;

  const translateUiText = (value, locale = getCurrentLocale()) => {
    const translations = UI_TRANSLATIONS[locale];
    const text = cleanText(value);

    if (!translations || !text) {
      return value;
    }

    if (translations.has(text)) {
      return translations.get(text);
    }

    let nextText = text;
    translations.forEach((replacement, source) => {
      if (nextText.includes(source)) {
        nextText = nextText.replaceAll(source, replacement);
      }
    });

    return nextText;
  };

  const translateTextNodes = (selector, locale = getCurrentLocale()) => {
    const translations = UI_TRANSLATIONS[locale];

    if (!translations) {
      return;
    }

    document.querySelectorAll(selector).forEach((element) => {
      Array.from(element.childNodes).forEach((node) => {
        if (node.nodeType !== Node.TEXT_NODE || !cleanText(node.nodeValue)) {
          return;
        }

        const translated = translateUiText(node.nodeValue, locale);

        if (translated !== cleanText(node.nodeValue)) {
          node.nodeValue = node.nodeValue.replace(cleanText(node.nodeValue), translated);
        }
      });
    });
  };

  const removeLogoutCountdown = () => {
    document.querySelectorAll("#change_language .logout-timer, #change_language .js-counter").forEach((element) => {
      const container = element.closest(".logout-timer") || element;
      container.remove();
    });
  };

  const moveLanguageControl = () => {
    const accountActions = document.querySelector("#account-actions");
    const languageControl = document.querySelector("#change_language");

    if (!accountActions || !languageControl || languageControl.parentElement === accountActions) {
      return;
    }

    accountActions.appendChild(languageControl);
  };

  const applyLocaleText = () => {
    const locale = getCurrentLocale();

    root.lang = locale;

    if (locale !== "en") {
      return;
    }

    translateTextNodes(
      [
        "#top-selection label",
        "#breadcrumbs",
        "#breadcrumbs a",
        ".module h3",
        ".module h4",
        ".toggle-switch a",
        ".see-more a",
        ".profile-event > span",
        ".profile-event > a",
        ".presence-table th",
        ".presence-table td",
        ".presences_table th",
        ".presences_table td",
        "#last_internal_messages .header",
        "#unread_forum_posts"
      ].join(", "),
      locale
    );
  };

  // Linki "zobacz ..." w .see-more IDU wyswietla natywnie mala litera obok
  // "Zobacz wszystkie" z wielkiej. Wyrownujemy je do wielkiej w kazdym jezyku,
  // zeby akcje czytaly sie spojnie (w EN tekst jest juz przetlumaczony wyzej).
  const capitalizeActionLinks = () => {
    document.querySelectorAll(".see-more a").forEach((link) => {
      Array.from(link.childNodes).forEach((node) => {
        if (node.nodeType !== Node.TEXT_NODE) {
          return;
        }

        const raw = node.nodeValue;
        const capitalized = capitalizeFirst(raw);

        if (capitalized !== raw) {
          node.nodeValue = capitalized;
        }
      });
    });
  };

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

  const normalizeLegacyTopbarLabels = () => {
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

  const setLinkText = (selector, label) => {
    const link = document.querySelector(selector);

    if (link && cleanText(link.textContent) !== label) {
      link.textContent = label;
    }
  };

  const normalizeCountLink = (containerSelector, beforeText, afterText) => {
    const container = document.querySelector(containerSelector);
    const link = container?.querySelector("a");
    const count = link?.querySelector("strong");

    if (!container || !link || !count) {
      return;
    }

    link.replaceChildren(count, document.createTextNode(` ${afterText}`));
    container.replaceChildren(document.createTextNode(`${beforeText} `), link);
  };

  const normalizeTopbarLabels = () => {
    const labels = getTopbarLabels();
    const login = document.querySelector("#login");
    const loginName = login?.querySelector("strong");
    const languageLink = document.querySelector("#change_language a");

    setLinkText("#open_user_templates", labels.templates);
    setLinkText("#link_to_unread_forum_posts", labels.forum);
    setLinkText("#logout a", labels.logout);
    setLinkText("#account a", labels.profile);
    normalizeCountLink("#messages", labels.messagesBefore, labels.messagesAfter);
    normalizeCountLink("#news", labels.newsBefore, labels.newsAfter);

    if (login && loginName) {
      login.replaceChildren(document.createTextNode(`${labels.greeting} `), loginName);
    }

    if (languageLink) {
      const targetLocale = getCurrentLocale() === "en" ? "PL" : "EN";
      languageLink.textContent = `Change language: ${targetLocale}`;
    }
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

  const compactUserscriptSchoolName = () => {
    const schoolName = document.querySelector("#school-name");

    if (!schoolName) {
      return;
    }

    if (!schoolName.dataset.iduOriginalSchoolName) {
      schoolName.dataset.iduOriginalSchoolName = schoolName.textContent || "";
    }

    if (shouldUseUserscriptMobileUX()) {
      schoolName.textContent = USERSCRIPT_COMPACT_SCHOOL_NAME;
      schoolName.setAttribute("title", schoolName.dataset.iduOriginalSchoolName);
      return;
    }

    if (schoolName.dataset.iduOriginalSchoolName) {
      schoolName.textContent = schoolName.dataset.iduOriginalSchoolName;
      schoolName.removeAttribute("title");
    }
  };

  function syncUserscriptAppearanceDock() {
    const dock = document.querySelector(`#${USERSCRIPT_THEME_DOCK_ID}`);

    if (!dock) {
      return;
    }

    dock.querySelectorAll("[data-idu-userscript-theme]").forEach((button) => {
      const selected = button.dataset.iduUserscriptTheme === currentAppearance.theme;
      button.setAttribute("aria-pressed", String(selected));
    });

    dock.querySelectorAll("[data-idu-userscript-layout]").forEach((button) => {
      const selected = button.dataset.iduUserscriptLayout === currentAppearance.layout;
      button.setAttribute("aria-pressed", String(selected));
    });

    dock.querySelectorAll("[data-idu-userscript-title-font]").forEach((button) => {
      const selected = button.dataset.iduUserscriptTitleFont === currentAppearance.titleFont;
      button.setAttribute("aria-pressed", String(selected));
    });

    dock.querySelectorAll("[data-idu-userscript-accent-preset]").forEach((button) => {
      const selected = normalizeHex(button.dataset.iduUserscriptAccentPreset) === currentAppearance.accent;
      button.setAttribute("aria-pressed", String(selected));
    });

    dock.querySelectorAll("[data-idu-userscript-topbar-preset]").forEach((button) => {
      const selected = normalizeHex(button.dataset.iduUserscriptTopbarPreset, DEFAULT_APPEARANCE.topbar) === currentAppearance.topbar;
      button.setAttribute("aria-pressed", String(selected));
    });

    const accentColor = dock.querySelector("[data-idu-userscript-accent-color]");
    const accentHex = dock.querySelector("[data-idu-userscript-accent-hex]");
    const topbarColor = dock.querySelector("[data-idu-userscript-topbar-color]");
    const topbarHex = dock.querySelector("[data-idu-userscript-topbar-hex]");

    if (accentColor) {
      accentColor.value = currentAppearance.accent;
    }

    if (accentHex) {
      accentHex.value = currentAppearance.accent;
    }

    if (topbarColor) {
      topbarColor.value = currentAppearance.topbar;
    }

    if (topbarHex) {
      topbarHex.value = currentAppearance.topbar;
    }
  }

  function setUserscriptAppearance(patch) {
    const nextAppearance = normalizeAppearance({
      ...currentAppearance,
      ...patch
    });

    writeLocalAppearance(nextAppearance);
    applyAppearance(nextAppearance);
  }

  function createUserscriptControlGroup(title, description) {
    const section = document.createElement("section");
    const heading = document.createElement("div");
    const titleElement = document.createElement("strong");
    const descriptionElement = document.createElement("p");

    section.className = "idu-userscript-control-group";
    heading.className = "idu-userscript-control-heading";
    titleElement.textContent = title;
    descriptionElement.textContent = description;
    heading.append(titleElement, descriptionElement);
    section.appendChild(heading);

    return section;
  }

  function createUserscriptOption(dataKey, value, label, detail = "") {
    const button = document.createElement("button");
    const labelElement = document.createElement("strong");

    button.type = "button";
    button.className = "idu-userscript-option";
    button.dataset[dataKey] = value;
    button.setAttribute("aria-pressed", "false");
    labelElement.textContent = label;
    button.appendChild(labelElement);

    if (detail) {
      const detailElement = document.createElement("small");
      detailElement.textContent = detail;
      button.appendChild(detailElement);
    }

    return button;
  }

  function createUserscriptSwatch(dataKey, value, label) {
    const button = document.createElement("button");

    button.type = "button";
    button.className = "idu-userscript-swatch";
    button.dataset[dataKey] = value;
    button.style.setProperty("--swatch", value);
    button.setAttribute("aria-label", label);
    button.setAttribute("aria-pressed", "false");

    return button;
  }

  function createUserscriptCustomColor(label, key) {
    const wrapper = document.createElement("label");
    const labelElement = document.createElement("span");
    const color = document.createElement("input");
    const hex = document.createElement("input");

    wrapper.className = "idu-userscript-custom-color";
    labelElement.textContent = label;
    color.type = "color";
    color.dataset[`iduUserscript${key}Color`] = "true";
    color.setAttribute("aria-label", `Custom ${label.toLowerCase()} color`);
    hex.type = "text";
    hex.maxLength = 7;
    hex.spellcheck = false;
    hex.dataset[`iduUserscript${key}Hex`] = "true";
    hex.setAttribute("aria-label", `${label} hex value`);
    wrapper.append(labelElement, color, hex);

    return wrapper;
  }

  function bindUserscriptColorControl(dock, key, appearanceKey) {
    dock.querySelector(`[data-idu-userscript-${key}-color]`)?.addEventListener("input", (event) => {
      setUserscriptAppearance({ [appearanceKey]: event.currentTarget.value });
    });

    dock.querySelector(`[data-idu-userscript-${key}-hex]`)?.addEventListener("input", (event) => {
      const value = event.currentTarget.value.trim();

      if (/^#[0-9a-f]{6}$/i.test(value) || /^#[0-9a-f]{3}$/i.test(value)) {
        setUserscriptAppearance({ [appearanceKey]: value });
      }
    });
  }

  function buildUserscriptAppearanceDock() {
    if (!document.body || !isUserscriptBuild()) {
      document.querySelector(`#${USERSCRIPT_THEME_DOCK_ID}`)?.remove();
      return;
    }

    let dock = document.querySelector(`#${USERSCRIPT_THEME_DOCK_ID}`);

    if (dock && !dock.classList.contains("idu-userscript-appearance-dock")) {
      dock.remove();
      dock = null;
    }

    if (!dock) {
      dock = document.createElement("details");
      const summary = document.createElement("summary");
      const summaryText = document.createElement("span");
      const summaryTitle = document.createElement("strong");
      const summaryHint = document.createElement("small");
      const body = document.createElement("div");
      const themeGroup = createUserscriptControlGroup("Theme", "Choose the portal mood.");
      const themeSwitch = document.createElement("div");
      const layoutGroup = createUserscriptControlGroup("Layout", "Choose the page structure.");
      const layoutSwitch = document.createElement("div");
      const fontGroup = createUserscriptControlGroup("Title Font", "Controls headings across IDU+.");
      const fontSwitch = document.createElement("div");
      const accentGroup = createUserscriptControlGroup("Accent", "Controls links, chips, focus, and buttons.");
      const accentGrid = document.createElement("div");
      const topbarGroup = createUserscriptControlGroup("Topbar", "Controls the main header bar.");
      const topbarGrid = document.createElement("div");
      const footer = document.createElement("div");
      const reset = document.createElement("button");

      dock.id = USERSCRIPT_THEME_DOCK_ID;
      dock.className = "idu-userscript-theme-dock idu-userscript-appearance-dock";
      dock.setAttribute("aria-label", "IDU+ appearance");
      dock.open = false;

      summaryText.className = "idu-userscript-appearance-summary-text";
      summaryTitle.textContent = "IDU+ Appearance";
      summaryHint.textContent = "Open settings";
      summaryText.append(summaryTitle, summaryHint);
      summary.appendChild(summaryText);
      body.className = "idu-userscript-appearance-body";

      themeSwitch.className = "idu-userscript-theme-switch";
      themeSwitch.setAttribute("role", "group");
      themeSwitch.setAttribute("aria-label", "Theme");
      USERSCRIPT_THEME_OPTIONS.forEach(([theme, label]) => {
        const button = createUserscriptOption("iduUserscriptTheme", theme, label);
        const icon = document.createElement("span");

        button.classList.add("idu-userscript-theme-option");
        icon.className = `idu-userscript-theme-icon ${theme === "dark" ? "moon" : "sun"}`;
        icon.setAttribute("aria-hidden", "true");
        button.prepend(icon);
        button.addEventListener("click", () => setUserscriptAppearance({ theme }));
        themeSwitch.appendChild(button);
      });
      themeGroup.appendChild(themeSwitch);

      layoutSwitch.className = "idu-userscript-layout-switch";
      layoutSwitch.setAttribute("role", "group");
      layoutSwitch.setAttribute("aria-label", "Layout");
      USERSCRIPT_LAYOUT_OPTIONS.forEach(([layout, label, detail]) => {
        const button = createUserscriptOption("iduUserscriptLayout", layout, label, detail);
        button.addEventListener("click", () => setUserscriptAppearance({ layout }));
        layoutSwitch.appendChild(button);
      });
      layoutGroup.appendChild(layoutSwitch);

      fontSwitch.className = "idu-userscript-title-font-switch";
      fontSwitch.setAttribute("role", "group");
      fontSwitch.setAttribute("aria-label", "Title font");
      USERSCRIPT_TITLE_FONT_OPTIONS.forEach(([titleFont, label, detail]) => {
        const button = createUserscriptOption("iduUserscriptTitleFont", titleFont, label, detail);
        button.style.setProperty("--sample-font", TITLE_FONT_STACKS[titleFont]);
        button.addEventListener("click", () => setUserscriptAppearance({ titleFont }));
        fontSwitch.appendChild(button);
      });
      fontGroup.appendChild(fontSwitch);

      accentGrid.className = "idu-userscript-swatch-grid";
      accentGrid.setAttribute("role", "group");
      accentGrid.setAttribute("aria-label", "Accent color presets");
      USERSCRIPT_ACCENT_PRESETS.forEach(([accent, label]) => {
        const button = createUserscriptSwatch("iduUserscriptAccentPreset", accent, label);
        button.addEventListener("click", () => setUserscriptAppearance({ accent }));
        accentGrid.appendChild(button);
      });
      accentGroup.append(accentGrid, createUserscriptCustomColor("Accent", "Accent"));

      topbarGrid.className = "idu-userscript-swatch-grid";
      topbarGrid.setAttribute("role", "group");
      topbarGrid.setAttribute("aria-label", "Topbar color presets");
      USERSCRIPT_TOPBAR_PRESETS.forEach(([topbar, label]) => {
        const button = createUserscriptSwatch("iduUserscriptTopbarPreset", topbar, label);
        button.addEventListener("click", () => setUserscriptAppearance({ topbar }));
        topbarGrid.appendChild(button);
      });
      topbarGroup.append(topbarGrid, createUserscriptCustomColor("Topbar", "Topbar"));

      footer.className = "idu-userscript-appearance-footer";
      reset.type = "button";
      reset.className = "idu-userscript-reset-button";
      reset.textContent = "Reset";
      reset.addEventListener("click", () => setUserscriptAppearance(DEFAULT_APPEARANCE));
      footer.appendChild(reset);

      body.append(themeGroup, layoutGroup, fontGroup, accentGroup, topbarGroup, footer);
      dock.append(summary, body);
      bindUserscriptColorControl(dock, "accent", "accent");
      bindUserscriptColorControl(dock, "topbar", "topbar");
      document.body.appendChild(dock);
    }

    syncUserscriptAppearanceDock();
  }

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

  const enhanceProfileDetails = () => {
    const row = document.querySelector("#student-data > table > tbody > tr");

    if (!root.classList.contains("idu-profile-page") || !row || row.dataset.iduProfileGrid === "true") {
      return;
    }

    const panels = [
      ["parents", "parents"],
      ["contact-data", "contact"],
      ["messengers", "details"],
      ["social-media", "social"]
    ];

    panels.forEach(([id, area]) => {
      const panel = document.getElementById(id);
      const cell = panel?.closest("td");

      if (!panel || !cell) {
        return;
      }

      panel.classList.add("idu-profile-panel");
      cell.classList.add("idu-profile-cell", `idu-profile-cell-${area}`);

      if (["contact-data", "messengers"].includes(id)) {
        Array.from(panel.children).forEach((label) => {
          const value = label.matches("p") ? label.nextElementSibling : null;

          if (!value?.classList.contains("data")) {
            return;
          }

          const field = document.createElement("div");
          field.className = "idu-profile-field";
          field.classList.toggle("is-empty", !cleanText(value.textContent) && !value.querySelector("a, img"));
          panel.insertBefore(field, label);
          field.append(label, value);
        });
      }
    });

    const socialPanel = document.getElementById("social-media");
    const socialHasData = Boolean(
      socialPanel &&
        Array.from(socialPanel.children).some(
          (child) => !child.matches("p") && (cleanText(child.textContent) || child.querySelector("a, img"))
        )
    );

    row.classList.add("idu-profile-details-grid");
    row.classList.toggle("idu-profile-no-social", !socialHasData);
    socialPanel?.closest("td")?.classList.toggle("idu-profile-cell-empty", !socialHasData);
    row.dataset.iduProfileGrid = "true";
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

      if (/kategoria|category/i.test(labelText)) {
        field.classList.add("idu-plus-removed");
        field.remove();
        return;
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

  const closeSelectDropdown = (wrapper = openSelectDropdown) => {
    if (!wrapper) {
      return;
    }

    wrapper.classList.remove("is-open", "opens-up");
    wrapper.querySelector(".idu-select-button")?.setAttribute("aria-expanded", "false");

    if (openSelectDropdown === wrapper) {
      openSelectDropdown = null;
    }
  };

  const syncSelectDropdown = (select, wrapper) => {
    const buttonLabel = wrapper.querySelector(".idu-select-label");
    const menu = wrapper.querySelector(".idu-select-menu");
    const fragment = document.createDocumentFragment();
    let currentGroup = null;

    if (!buttonLabel || !menu) {
      return;
    }

    buttonLabel.textContent = cleanText(select.selectedOptions?.[0]?.textContent) || "Wybierz…";
    menu.replaceChildren();

    Array.from(select.options).forEach((option) => {
      const group = option.parentElement?.tagName === "OPTGROUP" ? option.parentElement : null;

      if (group && group !== currentGroup) {
        const groupLabel = document.createElement("div");
        groupLabel.className = "idu-select-group";
        groupLabel.textContent = group.label;
        fragment.appendChild(groupLabel);
      }

      currentGroup = group;

      const item = document.createElement("button");
      item.type = "button";
      item.className = "idu-select-option";
      item.dataset.optionIndex = String(option.index);
      item.textContent = cleanText(option.textContent) || "—";
      item.disabled = option.disabled || Boolean(group?.disabled);
      item.setAttribute("role", "option");
      item.setAttribute("aria-selected", String(option.selected));
      item.classList.toggle("is-selected", option.selected);
      fragment.appendChild(item);
    });

    menu.appendChild(fragment);
  };

  const openDropdown = (select, wrapper) => {
    if (openSelectDropdown && openSelectDropdown !== wrapper) {
      closeSelectDropdown(openSelectDropdown);
    }

    syncSelectDropdown(select, wrapper);
    wrapper.classList.add("is-open");
    wrapper.querySelector(".idu-select-button")?.setAttribute("aria-expanded", "true");
    openSelectDropdown = wrapper;

    requestAnimationFrame(() => {
      const menu = wrapper.querySelector(".idu-select-menu");
      const menuHeight = menu?.getBoundingClientRect().height || 0;
      const roomBelow = window.innerHeight - wrapper.getBoundingClientRect().bottom;
      wrapper.classList.toggle("opens-up", roomBelow < menuHeight + 12);
    });
  };

  const enhanceSelect = (select) => {
    const inlineStyle = (select.getAttribute("style") || "").replace(/\s+/g, "").toLowerCase();

    if (
      select.dataset.iduEnhancedSelect === "true" ||
      inlineStyle.includes("display:none") ||
      select.multiple ||
      Number(select.getAttribute("size") || 1) > 1 ||
      select.closest(".ui-datepicker") ||
      select.nextElementSibling?.classList.contains("chosen-container")
    ) {
      return;
    }

    const wrapper = document.createElement("div");
    const button = document.createElement("button");
    const label = document.createElement("span");
    const menu = document.createElement("div");
    const controlId = select.id || `idu-select-${++enhancedSelectCount}`;
    const sourceLabel = select.id
      ? Array.from(document.querySelectorAll("label[for]")).find((candidate) => candidate.htmlFor === select.id)
      : null;

    wrapper.className = "idu-select";
    button.type = "button";
    button.className = "idu-select-button";
    button.id = `${controlId}-button`;
    button.disabled = select.disabled;
    button.setAttribute("aria-haspopup", "listbox");
    button.setAttribute("aria-expanded", "false");
    button.setAttribute("aria-controls", `${controlId}-menu`);
    label.className = "idu-select-label";
    menu.className = "idu-select-menu";
    menu.id = `${controlId}-menu`;
    menu.setAttribute("role", "listbox");
    button.appendChild(label);
    wrapper.append(button, menu);
    select.insertAdjacentElement("afterend", wrapper);
    select.classList.add("idu-select-source");
    select.dataset.iduEnhancedSelect = "true";

    if (sourceLabel) {
      sourceLabel.htmlFor = button.id;
    } else {
      button.setAttribute("aria-label", select.name || "Wybierz opcję");
    }

    syncSelectDropdown(select, wrapper);

    button.addEventListener("click", () => {
      if (wrapper.classList.contains("is-open")) {
        closeSelectDropdown(wrapper);
      } else {
        openDropdown(select, wrapper);
      }
    });

    button.addEventListener("keydown", (event) => {
      if (!['ArrowDown', 'ArrowUp'].includes(event.key)) {
        return;
      }

      event.preventDefault();
      openDropdown(select, wrapper);
      requestAnimationFrame(() => {
        const target = wrapper.querySelector(".idu-select-option.is-selected:not(:disabled)") ||
          wrapper.querySelector(".idu-select-option:not(:disabled)");
        target?.focus();
      });
    });

    menu.addEventListener("click", (event) => {
      const item = event.target.closest(".idu-select-option");

      if (!item || item.disabled) {
        return;
      }

      select.selectedIndex = Number(item.dataset.optionIndex);
      select.dispatchEvent(new Event("input", { bubbles: true }));
      select.dispatchEvent(new Event("change", { bubbles: true }));
      syncSelectDropdown(select, wrapper);
      closeSelectDropdown(wrapper);
      button.focus();
    });

    menu.addEventListener("keydown", (event) => {
      if (event.key === "Escape") {
        event.preventDefault();
        closeSelectDropdown(wrapper);
        button.focus();
        return;
      }

      if (!["ArrowDown", "ArrowUp", "Home", "End"].includes(event.key)) {
        return;
      }

      event.preventDefault();
      const options = Array.from(menu.querySelectorAll(".idu-select-option:not(:disabled)"));
      const currentIndex = options.indexOf(document.activeElement);
      const nextIndex =
        event.key === "Home"
          ? 0
          : event.key === "End"
            ? options.length - 1
            : event.key === "ArrowUp"
              ? Math.max(0, currentIndex - 1)
              : Math.min(options.length - 1, currentIndex + 1);
      options[nextIndex]?.focus();
    });

    select.addEventListener("change", () => syncSelectDropdown(select, wrapper));
    select.form?.addEventListener("reset", () => window.setTimeout(() => syncSelectDropdown(select, wrapper)));
  };

  const enhanceSelects = () => {
    document.querySelectorAll("select").forEach(enhanceSelect);

    if (selectOutsideClickBound) {
      return;
    }

    selectOutsideClickBound = true;
    document.addEventListener("click", (event) => {
      if (openSelectDropdown && !openSelectDropdown.contains(event.target)) {
        closeSelectDropdown(openSelectDropdown);
      }
    });
  };

  const enhanceScheduleForms = () => {
    const locale = getCurrentLocale();
    const rangeLabels = locale === "en" ? ["From", "To"] : ["Od", "Do"];

    document.querySelectorAll("form.schedule-form").forEach((form) => {
      if (form.dataset.iduScheduleForm === "true") {
        return;
      }

      const foldable = form.closest(".foldable");
      const precedingModule = foldable?.previousElementSibling;

      if (
        foldable &&
        !foldable.closest(".module, .module-important") &&
        precedingModule?.matches(".module, .module-important") &&
        /szczeg/i.test(cleanText(precedingModule.querySelector("h3")?.textContent))
      ) {
        precedingModule.appendChild(foldable);
      }

      form.querySelectorAll(":scope > .datepicker").forEach((datepicker, index) => {
        datepicker.dataset.iduRangeLabel = rangeLabels[index] || rangeLabels[1];
      });

      form.querySelectorAll(":scope > div").forEach((wrapper) => {
        const children = Array.from(wrapper.children);

        if (children.length && children.every((child) => child.matches('input[type="hidden"]'))) {
          wrapper.classList.add("idu-schedule-hidden-fields");
        }
      });

      const submit = form.querySelector('input[type="submit"], button[type="submit"]');

      if (submit && !cleanText(submit.value || submit.textContent)) {
        submit.value = locale === "en" ? "Show" : "Pokaż";
      }

      form.querySelectorAll('[style*="clear"]').forEach((clear) => clear.remove());
      form.dataset.iduScheduleForm = "true";
    });

    document.querySelectorAll('a[href*="/lesson_plan"]').forEach((link) => {
      const module = link.closest(".module, .module-important");
      const heading = module?.querySelector(":scope > h3");

      link.classList.add("idu-schedule-print-link");

      if (heading && link.parentElement !== heading) {
        const toggle = heading.querySelector(".toggle-switch");
        toggle ? toggle.before(link) : heading.appendChild(link);
      }
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
      const labels = getWorkspaceLabels();
      toggle.setAttribute("title", collapsed ? labels.expand : labels.collapse);
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
    const labels = getWorkspaceLabels();
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
      { label: labels.dashboard, icon: "dashboard", href: "/" },
      { label: labels.messages, icon: "mail", href: messageLink.href, count: messageCount, sourceLink: messageLink },
      { label: labels.news, icon: "news", href: newsLink.href, count: newsCount, sourceLink: newsLink },
      { label: labels.documents, icon: "documents", href: documentsLink.href, sourceLink: documentsLink },
      { label: labels.forum, icon: "forum", href: forumLink.href, sourceLink: forumLink },
      { label: labels.templates, icon: "templates", href: templatesLink.href, sourceLink: templatesLink },
      { label: labels.profile, icon: "profile", href: accountLink.href, sourceLink: accountLink },
      { label: labels.logout, icon: "logout", href: logoutLink.href, sourceLink: logoutLink }
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
    const labels = getWorkspaceLabels();
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
    const toggle = shell.querySelector(".idu-workspace-sidebar-toggle");
    const logoLink = shell.querySelector(".idu-workspace-logo");
    const footerText = shell.querySelector(".idu-workspace-footer span:last-child");

    applyLogoAsset(logoImage);
    logoLink?.setAttribute("aria-label", labels.home);
    nav?.setAttribute("aria-label", labels.main);
    toggle?.setAttribute("aria-label", labels.toggle);

    if (toggle) {
      toggle.setAttribute(
        "title",
        root.classList.contains("idu-workspace-sidebar-collapsed") ? labels.expand : labels.collapse
      );
    }

    if (footerText) {
      footerText.textContent = labels.footer;
    }

    if (profileLink && userCard) {
      userCard.href = profileLink.href;
      userCard.setAttribute("aria-label", `${labels.openProfile}: ${userName}`);
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

      const brand = document.createElement("div");
      const logo = document.createElement("a");
      const logoImage = document.createElement("img");
      const toggle = document.createElement("button");
      const toggleIcon = document.createElement("span");
      const userCard = document.createElement("a");
      const avatar = document.createElement("span");
      const avatarImage = document.createElement("img");
      const userDetails = document.createElement("div");
      const userName = document.createElement("strong");
      const school = document.createElement("span");
      const nav = document.createElement("nav");
      const footer = document.createElement("div");
      const footerDot = document.createElement("span");
      const footerText = document.createElement("span");

      brand.className = "idu-workspace-brand";
      logo.className = "idu-workspace-logo";
      logo.href = "/";
      logo.setAttribute("aria-label", getWorkspaceLabels().home);
      logoImage.alt = "IDU+";
      logoImage.src = getExtensionAssetUrl(LOGO_ASSET_PATH);
      logo.appendChild(logoImage);

      toggle.className = "idu-workspace-sidebar-toggle";
      toggle.type = "button";
      toggle.setAttribute("aria-label", getWorkspaceLabels().toggle);
      toggle.setAttribute("aria-expanded", "true");
      toggle.setAttribute("title", "Collapse sidebar");
      toggleIcon.setAttribute("aria-hidden", "true");
      toggle.appendChild(toggleIcon);
      brand.append(logo, toggle);

      userCard.className = "idu-workspace-user";
      userCard.href = "#";
      userCard.setAttribute("aria-label", getWorkspaceLabels().openProfile);
      avatar.className = "idu-workspace-avatar";
      avatar.setAttribute("aria-hidden", "true");
      avatarImage.alt = "";
      avatar.appendChild(avatarImage);
      userName.className = "idu-workspace-user-name";
      userName.textContent = "Student";
      school.className = "idu-workspace-school";
      school.textContent = "IDU workspace";
      userDetails.append(userName, school);
      userCard.append(avatar, userDetails);

      nav.className = "idu-workspace-nav";
      nav.setAttribute("aria-label", getWorkspaceLabels().main);

      footer.className = "idu-workspace-footer";
      footerDot.className = "idu-workspace-footer-dot";
      footerDot.setAttribute("aria-hidden", "true");
      footerText.textContent = getWorkspaceLabels().footer;
      footer.append(footerDot, footerText);

      shell.append(brand, userCard, nav, footer);
      document.body.prepend(shell);
      shell.querySelector(".idu-workspace-sidebar-toggle")?.addEventListener("click", () => toggleWorkspaceSidebar());
    }

    syncWorkspaceShell(shell);
    toggleWorkspaceSidebar(readWorkspaceCollapsedState());
  }

  const findFoldableForToggle = (toggleLink) => {
    const heading = toggleLink.closest("h3, h4");
    let candidate = heading?.nextElementSibling || null;

    while (candidate && !candidate.classList.contains("foldable")) {
      candidate = candidate.nextElementSibling;
    }

    return candidate;
  };

  const setFoldableToggleState = (toggleLink, collapsed) => {
    if (!toggleLink) {
      return;
    }

    const label = capitalizeFirst(translateUiText(collapsed ? "rozwi\u0144" : "zwi\u0144"));
    toggleLink.classList.toggle("show-me", collapsed);
    toggleLink.classList.toggle("hide-me", !collapsed);
    toggleLink.classList.add("idu-fold-toggle");
    toggleLink.textContent = "";
    toggleLink.setAttribute("role", "button");
    toggleLink.setAttribute("aria-expanded", String(!collapsed));
    toggleLink.setAttribute("aria-label", label);
    toggleLink.setAttribute("title", label);
  };

  const finishFoldableAnimation = (foldable, collapsed) => {
    foldable.classList.remove("idu-foldable-animating");
    foldable.classList.toggle("idu-foldable-collapsed", collapsed);
    foldable.style.removeProperty("height");
    foldable.style.removeProperty("opacity");
    foldable.style.removeProperty("overflow");
  };

  const animateFoldable = (foldable, collapsed, toggleLink) => {
    if (!foldable || foldable.dataset.iduFoldableAnimating === "true") {
      return;
    }

    foldable.dataset.iduFoldableAnimating = "true";
    foldable.classList.remove("idu-foldable-collapsed");
    foldable.classList.add("idu-foldable-animating");
    foldable.style.overflow = "hidden";
    setFoldableToggleState(toggleLink, collapsed);

    const finish = () => {
      delete foldable.dataset.iduFoldableAnimating;
      finishFoldableAnimation(foldable, collapsed);
    };

    window.setTimeout(finish, 230);

    if (collapsed) {
      foldable.style.height = `${foldable.scrollHeight}px`;
      foldable.style.opacity = "1";

      requestAnimationFrame(() => {
        foldable.style.height = "0px";
        foldable.style.opacity = "0";
      });
      return;
    }

    foldable.style.display = "";

    if (getComputedStyle(foldable).display === "none") {
      foldable.style.display = "block";
    }

    foldable.style.height = "0px";
    foldable.style.opacity = "0";

    requestAnimationFrame(() => {
      foldable.style.height = `${foldable.scrollHeight}px`;
      foldable.style.opacity = "1";
    });
  };

  const syncInitialFoldableStates = () => {
    document.querySelectorAll(".toggle-switch a").forEach((toggleLink) => {
      const foldable = findFoldableForToggle(toggleLink);

      if (!foldable) {
        return;
      }

      const collapsed = toggleLink.classList.contains("show-me") || foldable.style.display === "none";
      foldable.classList.toggle("idu-foldable-collapsed", collapsed);
      setFoldableToggleState(toggleLink, collapsed);
    });
  };

  const bindFoldableAnimations = () => {
    syncInitialFoldableStates();

    if (foldableAnimationsBound) {
      return;
    }

    foldableAnimationsBound = true;
    document.addEventListener(
      "click",
      (event) => {
        const toggleLink = event.target?.closest?.(".toggle-switch a");

        if (!toggleLink) {
          return;
        }

        const foldable = findFoldableForToggle(toggleLink);

        if (!foldable) {
          return;
        }

        event.preventDefault();
        event.stopPropagation();
        event.stopImmediatePropagation();

        const currentlyCollapsed =
          foldable.classList.contains("idu-foldable-collapsed") || getComputedStyle(foldable).display === "none";
        animateFoldable(foldable, !currentlyCollapsed, toggleLink);
      },
      true
    );
  };

  const sanitizeStickyClone = (clone, source) => {
    const sourceId = source.id || "";
    clone.removeAttribute("id");

    if (sourceId) {
      clone.setAttribute("data-sticky-action", sourceId);
    }

    clone.querySelectorAll("[id]").forEach((element) => element.removeAttribute("id"));

    const sourceLink = source.querySelector("a");
    const cloneLink = clone.querySelector("a");

    if (sourceLink && cloneLink) {
      cloneLink.addEventListener("click", (event) => {
        event.preventDefault();
        sourceLink.click();
      });
    }
  };

  const buildStickyActionBar = () => {
    const sourceActions = document.querySelector("#account-actions");
    const topbar = document.querySelector("#top");

    if (!document.body || !sourceActions || !topbar) {
      document.querySelector(`#${STICKY_ACTIONS_ID}`)?.remove();
      return;
    }

    let sticky = document.querySelector(`#${STICKY_ACTIONS_ID}`);

    if (!sticky) {
      sticky = document.createElement("div");
      sticky.id = STICKY_ACTIONS_ID;
      sticky.className = "idu-sticky-actions";
      sticky.setAttribute("aria-label", "Sticky topbar actions");
      sticky.setAttribute("aria-hidden", "true");
      document.body.appendChild(sticky);
    }

    const row = document.createElement("div");
    row.className = "idu-sticky-actions-row";

    Array.from(sourceActions.children).forEach((child) => {
      if (
        child.id === "last_internal_messages" ||
        child.id === "unread_forum_posts" ||
        child.hidden ||
        child.offsetParent === null
      ) {
        return;
      }

      const clone = child.cloneNode(true);
      sanitizeStickyClone(clone, child);
      row.appendChild(clone);
    });

    sticky.replaceChildren(row);

    const setStickyVisibility = (visible) => {
      sticky.classList.toggle("is-visible", visible);
      sticky.setAttribute("aria-hidden", String(!visible));
    };

    if ("IntersectionObserver" in window) {
      stickyActionsObserver?.disconnect();
      stickyActionsObserver = new IntersectionObserver(([entry]) => {
        setStickyVisibility(!entry.isIntersecting && window.scrollY > 24);
      });
      stickyActionsObserver.observe(topbar);
      return;
    }

    if (!stickyActionsScrollBound) {
      stickyActionsScrollBound = true;
      window.addEventListener(
        "scroll",
        () => {
          const bottom = topbar.getBoundingClientRect().bottom;
          setStickyVisibility(bottom <= 0 && window.scrollY > 24);
        },
        { passive: true }
      );
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

  const SCHEDULE_EXPORT_CLASS = "idu-plus-ics-export";
  const SCHEDULE_TIMEZONE = "Europe/Warsaw";
  const SCHEDULE_ICS_WEEKDAYS = Object.freeze(["SU", "MO", "TU", "WE", "TH", "FR", "SA"]);

  // Wiersze planu to pojedyncze lekcje po 45 minut, a blok to dwie sasiadujace
  // lekcje rozdzielone 5-minutowa przerwa:
  //   blok 0  08:00-08:40      blok 1  08:45-10:20      blok 2  10:35-12:10
  //   blok 3  12:30-14:05      blok 4  14:35-16:10      blok 5  16:20-17:50
  const SCHEDULE_LESSON_SLOTS = Object.freeze({
    0: Object.freeze({ start: "08:00", end: "08:40", block: 0 }),
    1: Object.freeze({ start: "08:45", end: "09:30", block: 1 }),
    2: Object.freeze({ start: "09:35", end: "10:20", block: 1 }),
    3: Object.freeze({ start: "10:35", end: "11:20", block: 2 }),
    4: Object.freeze({ start: "11:25", end: "12:10", block: 2 }),
    5: Object.freeze({ start: "12:30", end: "13:15", block: 3 }),
    6: Object.freeze({ start: "13:20", end: "14:05", block: 3 }),
    7: Object.freeze({ start: "14:35", end: "15:20", block: 4 }),
    8: Object.freeze({ start: "15:25", end: "16:10", block: 4 }),
    9: Object.freeze({ start: "16:20", end: "17:05", block: 5 }),
    10: Object.freeze({ start: "17:10", end: "17:50", block: 5 })
  });

  const SCHEDULE_VTIMEZONE = Object.freeze([
    "BEGIN:VTIMEZONE",
    `TZID:${SCHEDULE_TIMEZONE}`,
    `X-LIC-LOCATION:${SCHEDULE_TIMEZONE}`,
    "BEGIN:DAYLIGHT",
    "TZOFFSETFROM:+0100",
    "TZOFFSETTO:+0200",
    "TZNAME:CEST",
    "DTSTART:19700329T020000",
    "RRULE:FREQ=YEARLY;BYMONTH=3;BYDAY=-1SU",
    "END:DAYLIGHT",
    "BEGIN:STANDARD",
    "TZOFFSETFROM:+0200",
    "TZOFFSETTO:+0100",
    "TZNAME:CET",
    "DTSTART:19701025T030000",
    "RRULE:FREQ=YEARLY;BYMONTH=10;BYDAY=-1SU",
    "END:STANDARD",
    "END:VTIMEZONE"
  ]);

  const SCHEDULE_EXPORT_LABELS = Object.freeze({
    pl: Object.freeze({
      idle: "Do kalendarza",
      busy: "Tworz\u0119 plik\u2026",
      done: "Pobrano \u2713",
      empty: "Brak lekcji",
      failed: "B\u0142\u0105d eksportu",
      calendarName: "Plan lekcji (IDU+)",
      hint: "Pobierz plan jako plik .ics i zaimportuj go w Google Calendar"
    }),
    en: Object.freeze({
      idle: "Add to calendar",
      busy: "Building file\u2026",
      done: "Downloaded \u2713",
      empty: "No lessons",
      failed: "Export failed",
      calendarName: "Timetable (IDU+)",
      hint: "Download the timetable as an .ics file and import it into Google Calendar"
    })
  });

  const SCHEDULE_DAY_INDEX = new Map([
    ["niedziela", 0],
    ["poniedzialek", 1],
    ["wtorek", 2],
    ["sroda", 3],
    ["czwartek", 4],
    ["piatek", 5],
    ["sobota", 6],
    ["sunday", 0],
    ["monday", 1],
    ["tuesday", 2],
    ["wednesday", 3],
    ["thursday", 4],
    ["friday", 5],
    ["saturday", 6]
  ]);

  const getScheduleExportLabels = () =>
    SCHEDULE_EXPORT_LABELS[getCurrentLocale()] || SCHEDULE_EXPORT_LABELS.pl;

  // "Poniedziałek" -> "poniedzialek". NFD nie rozklada ł, wiec idzie osobno.
  const foldDiacritics = (value) =>
    cleanText(value)
      .toLowerCase()
      .replace(/\u0142/g, "l")
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "");

  const pad2 = (value) => String(value).padStart(2, "0");

  const toIcsDateStamp = (date) =>
    `${date.getFullYear()}${pad2(date.getMonth() + 1)}${pad2(date.getDate())}`;

  const toIcsLocalStamp = (date, time) => `${toIcsDateStamp(date)}T${time.replace(":", "")}00`;

  const toIcsUtcStamp = (date) =>
    `${date.getUTCFullYear()}${pad2(date.getUTCMonth() + 1)}${pad2(date.getUTCDate())}T` +
    `${pad2(date.getUTCHours())}${pad2(date.getUTCMinutes())}${pad2(date.getUTCSeconds())}Z`;

  const escapeIcsText = (value) =>
    String(value ?? "")
      .replace(/\\/g, "\\\\")
      .replace(/;/g, "\\;")
      .replace(/,/g, "\\,")
      .replace(/\r?\n/g, "\\n");

  // RFC 5545: linia moze miec najwyzej 75 oktetow, kontynuacja zaczyna sie spacja.
  const foldIcsLine = (line) => {
    const encoder = new TextEncoder();

    if (encoder.encode(line).length <= 75) {
      return line;
    }

    const chunks = [];
    let current = "";
    let currentBytes = 0;

    Array.from(line).forEach((character) => {
      const size = encoder.encode(character).length;
      const limit = chunks.length ? 74 : 75;

      if (currentBytes + size > limit) {
        chunks.push(current);
        current = "";
        currentBytes = 0;
      }

      current += character;
      currentBytes += size;
    });

    if (current) {
      chunks.push(current);
    }

    return chunks.join("\r\n ");
  };

  const readScheduleWeekStart = (schedule) => {
    for (const node of Array.from(schedule.childNodes)) {
      if (isElement(node, "TABLE")) {
        break;
      }

      const match = cleanText(node.textContent).match(/(\d{4})-(\d{2})-(\d{2})/);

      if (match) {
        return new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3]));
      }
    }

    const today = new Date();
    const monday = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    monday.setDate(monday.getDate() - ((monday.getDay() + 6) % 7));

    return monday;
  };

  const readScheduleDayOffsets = (table, weekStart) => {
    let names = [];

    table.querySelectorAll("thead tr").forEach((row) => {
      const cells = Array.from(row.querySelectorAll("th"))
        .slice(1)
        .map((cell) => cleanText(cell.textContent));

      if (cells.some(Boolean)) {
        names = cells;
      }
    });

    return names.map((name, index) => {
      const dayIndex = SCHEDULE_DAY_INDEX.get(foldDiacritics(name));

      if (typeof dayIndex !== "number") {
        return index;
      }

      return (dayIndex - weekStart.getDay() + 7) % 7;
    });
  };

  const readScheduleCell = (cell) => {
    const box = cell.querySelector(".lesson-cell") || cell;
    const subjectLink = box.querySelector(".subject a");
    const subject = cleanText(subjectLink?.textContent || box.querySelector(".subject")?.textContent);

    if (!subject) {
      return null;
    }

    return {
      subject,
      url: subjectLink?.href || "",
      room: cleanText(box.querySelector(".location a")?.textContent),
      teacher: cleanText(box.querySelector(".teacher")?.textContent),
      klass: cleanText(box.querySelector(".klass")?.textContent)
    };
  };

  // Plan konczy sie 30 czerwca; od sierpnia liczymy juz nastepny rok szkolny.
  const readSchoolYearEnd = (weekStart) => {
    let year = weekStart.getMonth() >= 7 ? weekStart.getFullYear() + 1 : weekStart.getFullYear();

    if (new Date(year, 5, 30) < weekStart) {
      year += 1;
    }

    return new Date(Date.UTC(year, 5, 30, 21, 59, 59));
  };

  const parseSchedule = (schedule) => {
    const table = schedule.querySelector("table");

    if (!table) {
      return null;
    }

    const weekStart = readScheduleWeekStart(schedule);
    const dayOffsets = readScheduleDayOffsets(table, weekStart);
    const columns = new Map();
    let skippedLessons = 0;

    table.querySelectorAll("tbody tr").forEach((row) => {
      const cells = Array.from(row.children).filter((cell) => isElement(cell, "TD"));

      if (cells.length < 2) {
        return;
      }

      const lessonNumber = Number(cleanText(cells[0].textContent));

      if (!Number.isInteger(lessonNumber)) {
        return;
      }

      const slot = SCHEDULE_LESSON_SLOTS[lessonNumber];

      cells.slice(1).forEach((cell, columnIndex) => {
        const lesson = readScheduleCell(cell);

        if (!lesson) {
          return;
        }

        // Wiersze bez znanych godzin (np. 11-12) pomijamy zamiast zgadywac.
        if (!slot) {
          skippedLessons += 1;
          return;
        }

        if (!columns.has(columnIndex)) {
          columns.set(columnIndex, []);
        }

        columns.get(columnIndex).push({ ...lesson, lessonNumber, ...slot });
      });
    });

    const events = [];

    Array.from(columns.keys())
      .sort((a, b) => a - b)
      .forEach((columnIndex) => {
        const offset = dayOffsets[columnIndex] ?? columnIndex;
        const date = new Date(
          weekStart.getFullYear(),
          weekStart.getMonth(),
          weekStart.getDate() + offset
        );
        const entries = columns.get(columnIndex).sort((a, b) => a.lessonNumber - b.lessonNumber);
        let current = null;

        entries.forEach((entry) => {
          // Dwie lekcje tego samego bloku i przedmiotu to jedno wydarzenie,
          // ale pol-bloki (druga polowa pusta) zostaja 45-minutowe.
          const mergeable =
            current &&
            current.block === entry.block &&
            current.subject === entry.subject &&
            current.room === entry.room &&
            entry.lessonNumber === current.lastLesson + 1;

          if (mergeable) {
            current.end = entry.end;
            current.lastLesson = entry.lessonNumber;
            return;
          }

          current = { ...entry, lastLesson: entry.lessonNumber, date };
          events.push(current);
        });
      });

    return { events, weekStart, skippedLessons, schoolYearEnd: readSchoolYearEnd(weekStart) };
  };

  const buildScheduleIcs = (parsed) => {
    const labels = getScheduleExportLabels();
    const stamp = toIcsUtcStamp(new Date());
    const until = toIcsUtcStamp(parsed.schoolYearEnd);
    const lines = [
      "BEGIN:VCALENDAR",
      "VERSION:2.0",
      "PRODID:-//IDU+//Plan lekcji//PL",
      "CALSCALE:GREGORIAN",
      "METHOD:PUBLISH",
      `X-WR-CALNAME:${escapeIcsText(labels.calendarName)}`,
      `X-WR-TIMEZONE:${SCHEDULE_TIMEZONE}`,
      ...SCHEDULE_VTIMEZONE
    ];

    parsed.events.forEach((event) => {
      const weekday = SCHEDULE_ICS_WEEKDAYS[event.date.getDay()];
      const slug = foldDiacritics(event.subject).replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
      const description = [event.teacher, event.klass].filter(Boolean).join("\n");

      lines.push(
        "BEGIN:VEVENT",
        `UID:idu-plus-${weekday}-${event.lessonNumber}-${slug || "lekcja"}@idu.edu.pl`,
        `DTSTAMP:${stamp}`,
        `DTSTART;TZID=${SCHEDULE_TIMEZONE}:${toIcsLocalStamp(event.date, event.start)}`,
        `DTEND;TZID=${SCHEDULE_TIMEZONE}:${toIcsLocalStamp(event.date, event.end)}`,
        `RRULE:FREQ=WEEKLY;BYDAY=${weekday};UNTIL=${until}`,
        `SUMMARY:${escapeIcsText(event.subject)}`
      );

      if (event.room) {
        lines.push(`LOCATION:${escapeIcsText(event.room)}`);
      }

      if (description) {
        lines.push(`DESCRIPTION:${escapeIcsText(description)}`);
      }

      if (event.url) {
        lines.push(`URL:${escapeIcsText(event.url)}`);
      }

      lines.push("TRANSP:OPAQUE", "END:VEVENT");
    });

    lines.push("END:VCALENDAR");

    return `${lines.map(foldIcsLine).join("\r\n")}\r\n`;
  };

  const downloadIcsFile = (fileName, content) => {
    const blob = new Blob([content], { type: "text/calendar;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = fileName;
    link.rel = "noopener";
    link.style.display = "none";
    document.body.appendChild(link);
    link.click();
    link.remove();

    window.setTimeout(() => URL.revokeObjectURL(url), 4000);
  };

  const flashScheduleExportButton = (button, text) => {
    const labels = getScheduleExportLabels();

    button.textContent = text;
    window.clearTimeout(Number(button.dataset.iduResetTimer) || 0);
    button.dataset.iduResetTimer = String(
      window.setTimeout(() => {
        button.textContent = labels.idle;
      }, 2600)
    );
  };

  const exportScheduleToIcs = (schedule, button) => {
    const labels = getScheduleExportLabels();

    try {
      const parsed = parseSchedule(schedule);

      if (!parsed || !parsed.events.length) {
        flashScheduleExportButton(button, labels.empty);
        return;
      }

      if (parsed.skippedLessons) {
        console.warn(
          `IDU+: pominieto ${parsed.skippedLessons} lekcji bez znanych godzin (wiersze spoza blokow 0-5).`
        );
      }

      const weekStamp = `${parsed.weekStart.getFullYear()}-${pad2(parsed.weekStart.getMonth() + 1)}-${pad2(
        parsed.weekStart.getDate()
      )}`;

      downloadIcsFile(`plan-lekcji-${weekStamp}.ics`, buildScheduleIcs(parsed));
      flashScheduleExportButton(button, labels.done);
    } catch (error) {
      console.error("IDU+: eksport planu do .ics nie powiodl sie.", error);
      flashScheduleExportButton(button, labels.failed);
    }
  };

  const buildScheduleExportButton = (schedule) => {
    if (schedule.dataset.iduScheduleExport === "true") {
      return;
    }

    const container = schedule.closest(".module, .module-important, #subject-card, #student-card");
    const heading = container?.querySelector(":scope > h3") || container?.querySelector("h3, h4");

    if (!heading || heading.querySelector(`.${SCHEDULE_EXPORT_CLASS}`)) {
      return;
    }

    const labels = getScheduleExportLabels();
    const button = document.createElement("button");

    button.type = "button";
    button.className = SCHEDULE_EXPORT_CLASS;
    button.textContent = labels.idle;
    button.title = labels.hint;
    button.addEventListener("click", (event) => {
      event.preventDefault();
      exportScheduleToIcs(schedule, button);
    });

    schedule.dataset.iduScheduleExport = "true";

    const toggle = heading.querySelector(".toggle-switch");

    if (toggle) {
      toggle.before(button);
      return;
    }

    heading.appendChild(button);
  };

  const buildScheduleExportButtons = () => {
    document.querySelectorAll(".schedule").forEach(buildScheduleExportButton);
  };

  const enhancePage = () => {
    markPageType();
    applyPageLogos();
    compactUserscriptSchoolName();
    removeLogoutCountdown();
    moveLanguageControl();
    normalizeTopbarLabels();
    enhanceLoginForm();
    enhanceProfileDetails();
    hideEmptyFlashSection();
    moveDocumentsAction();
    enhanceDocumentsSearch();
    enhanceMessagesSearch();
    enhanceScheduleForms();
    enhanceSelects();
    document.querySelectorAll(".module").forEach(enhanceSubjectModule);
    buildScheduleExportButtons();
    buildWorkspaceShell();
    buildUserscriptAppearanceDock();
    applyLocaleText();
    capitalizeActionLinks();
    bindFoldableAnimations();
    buildStickyActionBar();
    highlightProgrammeTokens();
    applyTitleFontToHeadings(root.dataset.iduTitleFont);
  };

  onReady(() => {
    enhancePage();
    scheduleDiagnosticsReport();
  });
})();
