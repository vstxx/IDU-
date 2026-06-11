(() => {
  "use strict";

  const DEFAULTS = {
    enabled: true,
    density: "compact",
    mobileCards: true
  };

  const STORAGE_KEY = "iduPlusSettings";

  const enabled = document.getElementById("enabled");
  const density = document.getElementById("density");
  const mobileCards = document.getElementById("mobileCards");
  const reset = document.getElementById("reset");
  const status = document.getElementById("status");

  function read(callback) {
    chrome.storage.sync.get({ [STORAGE_KEY]: DEFAULTS }, (result) => {
      callback({ ...DEFAULTS, ...(result[STORAGE_KEY] || {}) });
    });
  }

  function write(settings) {
    chrome.storage.sync.set({ [STORAGE_KEY]: settings }, () => {
      status.textContent = "Zapisano";
      setTimeout(() => (status.textContent = ""), 900);
    });
  }

  function currentSettings() {
    return {
      enabled: enabled.checked,
      density: density.value,
      mobileCards: mobileCards.checked
    };
  }

  function render(settings) {
    enabled.checked = Boolean(settings.enabled);
    density.value = settings.density || "compact";
    mobileCards.checked = Boolean(settings.mobileCards);
  }

  [enabled, density, mobileCards].forEach((control) => {
    control.addEventListener("change", () => write(currentSettings()));
  });

  reset.addEventListener("click", () => {
    render(DEFAULTS);
    write(DEFAULTS);
  });

  read(render);
})();
