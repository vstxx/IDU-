(() => {
  const STORAGE_KEY = "iduPlusAppearance";
  const SETTINGS_WRITE_DEBOUNCE_MS = 180;
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

  const state = {
    appearance: { ...DEFAULT_APPEARANCE },
    saveTimer: null,
    persistTimer: null,
    persistRevision: 0
  };

  const controls = Object.freeze({
    themes: document.querySelectorAll("[data-theme-option]"),
    layouts: document.querySelectorAll("[data-layout-option]"),
    titleFonts: document.querySelectorAll("[data-title-font-option]"),
    accents: document.querySelectorAll("[data-accent-preset]"),
    topbars: document.querySelectorAll("[data-topbar-preset]")
  });

  const getChromeApi = () => {
    if (typeof chrome === "undefined") {
      return null;
    }

    return chrome;
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

  const readAppearance = () =>
    new Promise((resolve) => {
      const api = getChromeApi();

      if (!api?.storage?.sync) {
        const stored = JSON.parse(localStorage.getItem(STORAGE_KEY) || "null");
        resolve(normalizeAppearance(stored || DEFAULT_APPEARANCE));
        return;
      }

      api.storage.sync.get({ [STORAGE_KEY]: DEFAULT_APPEARANCE }, (result) => {
        resolve(normalizeAppearance(result?.[STORAGE_KEY]));
      });
    });

  const writeAppearance = (appearance) =>
    new Promise((resolve) => {
      const api = getChromeApi();
      const nextAppearance = normalizeAppearance(appearance);

      if (!api?.storage?.sync) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(nextAppearance));
        resolve();
        return;
      }

      api.storage.sync.set({ [STORAGE_KEY]: nextAppearance }, resolve);
    });

  const notifyActiveTab = (appearance) => {
    const api = getChromeApi();

    if (!api?.tabs?.query) {
      return;
    }

    api.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      const tab = tabs?.[0];

      if (!tab?.id || (tab.url && !/^https:\/\/[^/]+\.idu\.edu\.pl\//i.test(tab.url))) {
        return;
      }

      api.tabs.sendMessage(
        tab.id,
        {
          type: "IDU_PLUS_APPEARANCE_CHANGED",
          appearance: normalizeAppearance(appearance)
        },
        () => {
          void api.runtime?.lastError;
        }
      );
    });
  };

  const setSaveStatus = (text) => {
    const status = document.querySelector("#saveStatus");

    if (!status) {
      return;
    }

    status.textContent = text;
  };

  const applyPreview = (appearance) => {
    const nextAppearance = normalizeAppearance(appearance);
    const root = document.documentElement;

    document.body.dataset.theme = nextAppearance.theme;
    document.body.dataset.layout = nextAppearance.layout;
    document.body.dataset.titleFont = nextAppearance.titleFont;
    document.body.dataset.logoTone = isVeryLightHex(nextAppearance.topbar) ? "dark" : "light";
    root.style.setProperty("--accent", nextAppearance.accent);
    root.style.setProperty("--accent-deep", mixHex(nextAppearance.accent, "#000000", 0.22));
    root.style.setProperty("--accent-soft", rgba(nextAppearance.accent, nextAppearance.theme === "dark" ? 0.22 : 0.14));
    root.style.setProperty("--topbar", nextAppearance.topbar);
    root.style.setProperty("--topbar-2", mixHex(nextAppearance.topbar, "#ffffff", nextAppearance.theme === "dark" ? 0.08 : 0.16));
    root.style.setProperty("--title-font", TITLE_FONT_STACKS[nextAppearance.titleFont]);
  };

  const syncControls = (appearance) => {
    const nextAppearance = normalizeAppearance(appearance);

    controls.themes.forEach((button) => {
      const selected = button.dataset.themeOption === nextAppearance.theme;
      button.setAttribute("aria-pressed", String(selected));
    });

    controls.layouts.forEach((button) => {
      const selected = button.dataset.layoutOption === nextAppearance.layout;
      button.setAttribute("aria-pressed", String(selected));
    });

    controls.titleFonts.forEach((button) => {
      const selected = button.dataset.titleFontOption === nextAppearance.titleFont;
      button.setAttribute("aria-pressed", String(selected));
    });

    controls.accents.forEach((button) => {
      const selected = normalizeHex(button.dataset.accentPreset) === nextAppearance.accent;
      button.setAttribute("aria-pressed", String(selected));
    });

    controls.topbars.forEach((button) => {
      const selected = normalizeHex(button.dataset.topbarPreset) === nextAppearance.topbar;
      button.setAttribute("aria-pressed", String(selected));
    });

    const colorInput = document.querySelector("#accentColor");
    const hexInput = document.querySelector("#accentHex");
    const topbarColorInput = document.querySelector("#topbarColor");
    const topbarHexInput = document.querySelector("#topbarHex");

    if (colorInput) {
      colorInput.value = nextAppearance.accent;
    }

    if (hexInput) {
      hexInput.value = nextAppearance.accent;
    }

    if (topbarColorInput) {
      topbarColorInput.value = nextAppearance.topbar;
    }

    if (topbarHexInput) {
      topbarHexInput.value = nextAppearance.topbar;
    }
  };

  const render = (appearance) => {
    state.appearance = normalizeAppearance(appearance);
    applyPreview(state.appearance);
    syncControls(state.appearance);
  };

  const persistAppearance = async (appearance, revision) => {
    await writeAppearance(appearance);

    if (revision !== state.persistRevision) {
      return;
    }

    setSaveStatus("Saved");
    clearTimeout(state.saveTimer);
    state.saveTimer = setTimeout(() => setSaveStatus("Saved"), 900);
  };

  const save = (patch, { debounceWrite = false } = {}) => {
    const nextAppearance = normalizeAppearance({
      ...state.appearance,
      ...patch
    });
    const revision = ++state.persistRevision;

    render(nextAppearance);
    notifyActiveTab(nextAppearance);
    setSaveStatus("Saving");
    clearTimeout(state.persistTimer);

    if (debounceWrite) {
      state.persistTimer = setTimeout(() => {
        state.persistTimer = null;
        void persistAppearance(nextAppearance, revision);
      }, SETTINGS_WRITE_DEBOUNCE_MS);
      return;
    }

    state.persistTimer = null;
    void persistAppearance(nextAppearance, revision);
  };

  const bindEvents = () => {
    document.addEventListener("click", (event) => {
      const option = event.target.closest(
        "[data-theme-option], [data-layout-option], [data-title-font-option], [data-accent-preset], [data-topbar-preset]"
      );

      if (!option) {
        return;
      }

      if (option.dataset.themeOption) {
        save({ theme: option.dataset.themeOption });
      } else if (option.dataset.layoutOption) {
        save({ layout: option.dataset.layoutOption });
      } else if (option.dataset.titleFontOption) {
        save({ titleFont: option.dataset.titleFontOption });
      } else if (option.dataset.accentPreset) {
        save({ accent: option.dataset.accentPreset });
      } else if (option.dataset.topbarPreset) {
        save({ topbar: option.dataset.topbarPreset });
      }
    });

    document.querySelector("#accentColor")?.addEventListener("input", (event) => {
      save({ accent: event.currentTarget.value }, { debounceWrite: true });
    });

    document.querySelector("#accentColor")?.addEventListener("change", (event) => {
      save({ accent: event.currentTarget.value });
    });

    document.querySelector("#accentHex")?.addEventListener("input", (event) => {
      const value = event.currentTarget.value.trim();

      if (/^#[0-9a-f]{6}$/i.test(value) || /^#[0-9a-f]{3}$/i.test(value)) {
        save({ accent: value }, { debounceWrite: true });
      }
    });

    document.querySelector("#accentHex")?.addEventListener("change", (event) => {
      const value = event.currentTarget.value.trim();

      if (/^#[0-9a-f]{6}$/i.test(value) || /^#[0-9a-f]{3}$/i.test(value)) {
        save({ accent: value });
      }
    });

    document.querySelector("#topbarColor")?.addEventListener("input", (event) => {
      save({ topbar: event.currentTarget.value }, { debounceWrite: true });
    });

    document.querySelector("#topbarColor")?.addEventListener("change", (event) => {
      save({ topbar: event.currentTarget.value });
    });

    document.querySelector("#topbarHex")?.addEventListener("input", (event) => {
      const value = event.currentTarget.value.trim();

      if (/^#[0-9a-f]{6}$/i.test(value) || /^#[0-9a-f]{3}$/i.test(value)) {
        save({ topbar: value }, { debounceWrite: true });
      }
    });

    document.querySelector("#topbarHex")?.addEventListener("change", (event) => {
      const value = event.currentTarget.value.trim();

      if (/^#[0-9a-f]{6}$/i.test(value) || /^#[0-9a-f]{3}$/i.test(value)) {
        save({ topbar: value });
      }
    });

    document.querySelector("#resetButton")?.addEventListener("click", () => {
      save(DEFAULT_APPEARANCE);
    });

    window.addEventListener("pagehide", () => {
      if (!state.persistTimer) {
        return;
      }

      clearTimeout(state.persistTimer);
      state.persistTimer = null;
      void writeAppearance(state.appearance);
    });
  };

  const init = async () => {
    render(await readAppearance());
    bindEvents();
  };

  init();
})();
