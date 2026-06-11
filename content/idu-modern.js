(() => {
  "use strict";

  const DEFAULTS = {
    enabled: true,
    density: "compact",
    mobileCards: true
  };

  const STORAGE_KEY = "iduPlusSettings";
  const root = document.documentElement;
  let settings = { ...DEFAULTS };
  let observer = null;
  let scheduled = false;

  function storageAvailable() {
    return typeof chrome !== "undefined" && chrome.storage && chrome.storage.sync;
  }

  function readSettings(callback) {
    if (storageAvailable()) {
      chrome.storage.sync.get({ [STORAGE_KEY]: DEFAULTS }, (result) => {
        const stored = result && result[STORAGE_KEY] ? result[STORAGE_KEY] : {};
        callback({ ...DEFAULTS, ...stored });
      });
      return;
    }

    try {
      const stored = JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}");
      callback({ ...DEFAULTS, ...stored });
    } catch {
      callback({ ...DEFAULTS });
    }
  }

  function applyRootState(nextSettings) {
    settings = { ...DEFAULTS, ...nextSettings };

    root.classList.toggle("idu-modern-enabled", Boolean(settings.enabled));
    root.classList.toggle("idu-mobile-cards", Boolean(settings.mobileCards));

    root.classList.remove("idu-density-comfortable", "idu-density-compact");
    root.classList.add(settings.density === "compact" ? "idu-density-compact" : "idu-density-comfortable");

    root.dataset.iduPlus = settings.enabled ? "enabled" : "disabled";
  }

  function ensureViewportMeta() {
    const head = document.head || document.getElementsByTagName("head")[0];
    if (!head) return;

    let viewport = document.querySelector('meta[name="viewport"]');
    if (!viewport) {
      viewport = document.createElement("meta");
      viewport.setAttribute("name", "viewport");
      head.appendChild(viewport);
    }

    viewport.setAttribute("content", "width=device-width, initial-scale=1, viewport-fit=cover");
  }

  function normalize(text) {
    return (text || "")
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "");
  }

  function visibleTitleFromHeading(h3) {
    if (!h3) return "";
    const clone = h3.cloneNode(true);
    clone.querySelectorAll(".toggle-switch, .hide-me").forEach((node) => node.remove());
    return clone.textContent.trim();
  }

  function tagModules() {
    document.querySelectorAll(".module").forEach((module) => {
      if (module.dataset.iduPlusTagged === "true") return;

      const h3 = module.querySelector(":scope > h3");
      const title = visibleTitleFromHeading(h3);

      if (title) {
        module.dataset.iduTitle = title;
        const slug = normalize(title);
        module.classList.add(`idu-module-${slug}`);

        if (/wyszukiwarka|search/i.test(title)) module.classList.add("idu-module-search");
        if (/profil/i.test(title)) module.classList.add("idu-module-profile");
        if (/plan/i.test(title)) module.classList.add("idu-module-schedule");
        if (/oceny|grade|mark/i.test(title)) module.classList.add("idu-module-grades");
        if (/aktualności|aktualnosci|news/i.test(title)) module.classList.add("idu-module-news");
        if (/obecności|obecnosci|frekwencja|presence|attendance/i.test(title)) module.classList.add("idu-module-attendance");
        if (/dokument|plik|attachment/i.test(title)) module.classList.add("idu-module-documents");
        if (/wiadomości|wiadomosci|messages/i.test(title)) module.classList.add("idu-module-messages");
        if (/forum|fora/i.test(title)) module.classList.add("idu-module-forum");
      }

      if (module.querySelector(".schedule")) module.classList.add("idu-module-schedule");
      if (module.querySelector("#student-card")) module.classList.add("idu-module-profile");
      if (module.querySelector('form[action*="internal_messages"], a[href*="/internal_messages"]')) {
        module.classList.add("idu-module-messages");
      }
      if (module.querySelector('a[href*="/documents/attachments"]')) {
        module.classList.add("idu-module-documents");
      }
      if (module.querySelector('a[href*="/forums"]')) {
        module.classList.add("idu-module-forum");
      }

      module.dataset.iduPlusTagged = "true";
    });
  }

  function tagEvents() {
    document.querySelectorAll(".profile-event").forEach((event) => {
      if (event.dataset.iduPlusTagged === "true") return;

      const name = event.querySelector(".name");
      const date = event.querySelector(".date");

      if (name) event.dataset.eventName = name.textContent.trim();
      if (date) event.dataset.eventDate = date.textContent.trim();

      event.dataset.iduPlusTagged = "true";
    });
  }

  function improveExternalOldInlineStyles() {
    // The legacy layout uses old fixed-width inline styles in popups/dropdowns.
    // Keep the behaviour, but make them safer on small screens.
    document.querySelectorAll("#last_internal_messages, #unread_forum_posts").forEach((panel) => {
      panel.style.maxWidth = "calc(100vw - 40px)";
    });
  }



  function tagLayoutBlocks() {
    const content = document.querySelector('#content');
    if (!content || content.dataset.iduPlusLayoutTagged === 'true') return;

    Array.from(content.children).forEach((child) => {
      if (child.matches('.double-column') && child.querySelector('.action-module')) {
        child.classList.add('idu-action-strip');
      }
      if (child.matches('.left-column, .right-column')) {
        child.classList.add('idu-dashboard-column');
      }
    });

    content.dataset.iduPlusLayoutTagged = 'true';
  }

  function cleanSubjectRowNodes(row) {
    Array.from(row.childNodes).forEach((node) => {
      if (node.nodeType === Node.TEXT_NODE) {
        const text = node.textContent || '';
        if (/^[\s,\-–—:;&nbsp;]+$/i.test(text.replace(/\u00a0/g, ' '))) {
          const span = document.createElement('span');
          span.className = 'idu-separator-text';
          span.textContent = text;
          node.replaceWith(span);
        }
      }
    });
  }

  function enhanceSubjectLists() {
    document.querySelectorAll('.module').forEach((module) => {
      if (module.dataset.iduPlusSubjects === 'true') return;

      const title = module.dataset.iduTitle || visibleTitleFromHeading(module.querySelector(':scope > h3'));
      if (!/twoja klasa i przedmioty/i.test(title)) return;

      const foldable = module.querySelector(':scope > .foldable, :scope > div[id^="unique-id"]');
      if (!foldable) return;

      const headings = Array.from(foldable.querySelectorAll(':scope > h4'));
      const subjectsHeading = headings.find((h) => /twoje przedmioty/i.test(h.textContent || ''));
      const classHeading = headings.find((h) => /twoja klasa/i.test(h.textContent || ''));

      if (classHeading && !foldable.querySelector('.idu-class-card')) {
        const classCard = document.createElement('div');
        classCard.className = 'idu-class-card';
        let node = classHeading.nextSibling;
        const toMove = [];
        while (node && node !== subjectsHeading) {
          const next = node.nextSibling;
          if (!(node.nodeType === Node.TEXT_NODE && !node.textContent.trim())) {
            toMove.push(node);
          }
          node = next;
        }
        toMove.forEach((n) => classCard.appendChild(n));
        classHeading.insertAdjacentElement('afterend', classCard);
      }

      if (!subjectsHeading || foldable.querySelector('.idu-subject-list')) {
        module.dataset.iduPlusSubjects = 'true';
        return;
      }

      const list = document.createElement('div');
      list.className = 'idu-subject-list';

      let currentRow = null;
      let node = subjectsHeading.nextSibling;
      const nodes = [];
      while (node) {
        const next = node.nextSibling;
        nodes.push(node);
        node = next;
      }

      function finishRow() {
        if (!currentRow) return;
        const hasContent = currentRow.textContent.replace(/[\s,\-–—:]+/g, '').length > 0;
        if (hasContent) {
          cleanSubjectRowNodes(currentRow);
          list.appendChild(currentRow);
        }
        currentRow = null;
      }

      nodes.forEach((n) => {
        if (n.nodeType === Node.ELEMENT_NODE && n.tagName === 'BR') {
          finishRow();
          n.remove();
          return;
        }

        const textOnlyEmpty = n.nodeType === Node.TEXT_NODE && !n.textContent.trim();
        if (!currentRow && textOnlyEmpty) {
          n.remove();
          return;
        }

        if (!currentRow) {
          currentRow = document.createElement('div');
          currentRow.className = 'idu-subject-row';
        }
        currentRow.appendChild(n);
      });

      finishRow();
      subjectsHeading.insertAdjacentElement('afterend', list);
      module.dataset.iduPlusSubjects = 'true';
    });
  }

  function enhanceProfileLayout() {
    const card = document.querySelector("#student-card");
    if (!card || card.dataset.iduPlusProfile === "true") return;

    card.classList.add("idu-profile-card");

    const mainCells = card.querySelectorAll(":scope > table > tbody > tr > td");
    mainCells[0]?.classList.add("idu-profile-photo-cell");
    mainCells[1]?.classList.add("idu-profile-data-cell");

    document
      .querySelectorAll("#student-data > table > tbody > tr > td")
      .forEach((cell, index) => {
        cell.classList.add("idu-profile-detail-card", `idu-profile-detail-card-${index + 1}`);
      });

    card.dataset.iduPlusProfile = "true";
  }

  function wrapDataTables() {
    document.querySelectorAll("table").forEach((table) => {
      if (table.dataset.iduPlusWrapped === "true") return;
      if (table.closest("#student-card, #student-data, .schedule, .idu-table-scroll")) return;

      const wrapper = document.createElement("div");
      wrapper.className = "idu-table-scroll";
      table.before(wrapper);
      wrapper.appendChild(table);
      table.dataset.iduPlusWrapped = "true";

      const module = wrapper.closest(".module");
      if (module) module.classList.add("idu-module-table-scroll");
    });
  }


  function tagPageType() {
    const path = window.location.pathname || "";
    const title = document.title || "";
    const hasStudentCard = Boolean(document.querySelector("#student-card"));
    const hasLoginForm = Boolean(
      document.querySelector('form[action*="/users/sign_in"], form#new_user, form.new_user, input[type="password"]') &&
      /sign_in|users\/sign_in|logowanie|zaloguj|idu/i.test(path + " " + title + " " + document.body?.textContent?.slice(0, 500))
    );
    const hasDashboard = Boolean(document.querySelector(".idu-module-twoja-klasa-i-przedmioty, .left-column, .right-column"));
    const hasStudentRoute = /^\/students\/\d+/.test(path);

    root.classList.toggle("idu-page-login", hasLoginForm || /\/users\/sign_in/.test(path));
    root.classList.toggle("idu-page-profile", hasStudentCard);
    root.classList.toggle("idu-page-student", hasStudentRoute);
    root.classList.toggle("idu-page-student-grades", /^\/students\/\d+\/grades/.test(path));
    root.classList.toggle("idu-page-attendance", /^\/students\/\d+\/presences/.test(path));
    root.classList.toggle("idu-page-documents", /^\/documents\//.test(path));
    root.classList.toggle("idu-page-subject", /^\/subjects\/\d+/.test(path));
    root.classList.toggle("idu-page-class", /^\/klasses\/\d+/.test(path));
    root.classList.toggle("idu-page-forum", /^\/forums/.test(path));
    root.classList.toggle("idu-page-messages", /^\/internal_messages/.test(path));
    root.classList.toggle("idu-page-dashboard", hasDashboard || path === "/");
  }

  function enhance() {
    if (!settings.enabled) return;
    ensureViewportMeta();
    tagModules();
    tagPageType();
    tagLayoutBlocks();
    enhanceProfileLayout();
    enhanceSubjectLists();
    wrapDataTables();
    tagEvents();
    improveExternalOldInlineStyles();
  }

  function scheduleEnhance() {
    if (scheduled) return;
    scheduled = true;
    requestAnimationFrame(() => {
      scheduled = false;
      enhance();
    });
  }

  function startObserver() {
    if (observer || !document.body) return;

    observer = new MutationObserver((mutations) => {
      const relevant = mutations.some((mutation) => {
        if (mutation.type !== "childList") return false;
        return Array.from(mutation.addedNodes).some((node) => node.nodeType === Node.ELEMENT_NODE);
      });

      if (relevant) scheduleEnhance();
    });

    observer.observe(document.body, { childList: true, subtree: true });
  }

  function init() {
    readSettings((loaded) => {
      applyRootState(loaded);
      ensureViewportMeta();

      if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", () => {
          enhance();
          startObserver();
        }, { once: true });
      } else {
        enhance();
        startObserver();
      }
    });
  }

  if (storageAvailable() && chrome.storage.onChanged) {
    chrome.storage.onChanged.addListener((changes, areaName) => {
      if (areaName !== "sync" || !changes[STORAGE_KEY]) return;
      applyRootState(changes[STORAGE_KEY].newValue || DEFAULTS);
      scheduleEnhance();
    });
  }

  init();
})();
