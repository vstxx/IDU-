(() => {
  const STORAGE_KEY = "iduPlusAppearance";
  const DEFAULT_APPEARANCE = Object.freeze({
    theme: "light",
    accent: "#2f78b7",
    topbar: "#0b2f55"
  });

  const state = {
    appearance: { ...DEFAULT_APPEARANCE },
    saveTimer: null
  };

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
    root.style.setProperty("--accent", nextAppearance.accent);
    root.style.setProperty("--accent-deep", mixHex(nextAppearance.accent, "#000000", 0.22));
    root.style.setProperty("--accent-soft", rgba(nextAppearance.accent, nextAppearance.theme === "dark" ? 0.22 : 0.14));
    root.style.setProperty("--topbar", nextAppearance.topbar);
    root.style.setProperty("--topbar-2", mixHex(nextAppearance.topbar, "#ffffff", nextAppearance.theme === "dark" ? 0.08 : 0.16));
    root.style.setProperty("--topbar-glow", rgba(mixHex(nextAppearance.topbar, "#ffffff", 0.32), nextAppearance.theme === "dark" ? 0.18 : 0.26));
  };

  const syncControls = (appearance) => {
    const nextAppearance = normalizeAppearance(appearance);

    document.querySelectorAll("[data-theme-option]").forEach((button) => {
      const selected = button.dataset.themeOption === nextAppearance.theme;
      button.setAttribute("aria-pressed", String(selected));
    });

    document.querySelectorAll("[data-accent-preset]").forEach((button) => {
      const selected = normalizeHex(button.dataset.accentPreset) === nextAppearance.accent;
      button.setAttribute("aria-pressed", String(selected));
    });

    document.querySelectorAll("[data-topbar-preset]").forEach((button) => {
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

  const save = async (patch) => {
    const nextAppearance = normalizeAppearance({
      ...state.appearance,
      ...patch
    });

    render(nextAppearance);
    setSaveStatus("Saving");
    await writeAppearance(nextAppearance);
    notifyActiveTab(nextAppearance);
    setSaveStatus("Saved");

    clearTimeout(state.saveTimer);
    state.saveTimer = setTimeout(() => setSaveStatus("Saved"), 900);
  };

  const bindEvents = () => {
    document.querySelectorAll("[data-theme-option]").forEach((button) => {
      button.addEventListener("click", () => {
        save({ theme: button.dataset.themeOption });
      });
    });

    document.querySelectorAll("[data-accent-preset]").forEach((button) => {
      button.addEventListener("click", () => {
        save({ accent: button.dataset.accentPreset });
      });
    });

    document.querySelectorAll("[data-topbar-preset]").forEach((button) => {
      button.addEventListener("click", () => {
        save({ topbar: button.dataset.topbarPreset });
      });
    });

    document.querySelector("#accentColor")?.addEventListener("input", (event) => {
      save({ accent: event.currentTarget.value });
    });

    document.querySelector("#accentHex")?.addEventListener("input", (event) => {
      const value = event.currentTarget.value.trim();

      if (/^#[0-9a-f]{6}$/i.test(value) || /^#[0-9a-f]{3}$/i.test(value)) {
        save({ accent: value });
      }
    });

    document.querySelector("#topbarColor")?.addEventListener("input", (event) => {
      save({ topbar: event.currentTarget.value });
    });

    document.querySelector("#topbarHex")?.addEventListener("input", (event) => {
      const value = event.currentTarget.value.trim();

      if (/^#[0-9a-f]{6}$/i.test(value) || /^#[0-9a-f]{3}$/i.test(value)) {
        save({ topbar: value });
      }
    });

    document.querySelector("#resetButton")?.addEventListener("click", () => {
      save(DEFAULT_APPEARANCE);
    });
  };

  const init = async () => {
    render(await readAppearance());
    bindEvents();
  };

  init();
})();
