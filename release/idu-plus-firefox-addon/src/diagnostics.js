(function attachDiagnostics(globalScope, factory) {
  const diagnostics = factory();

  if (typeof module !== "undefined" && module.exports) {
    module.exports = diagnostics;
    return;
  }

  globalScope.IDUPlusDiagnostics = diagnostics;
})(typeof globalThis !== "undefined" ? globalThis : this, function createDiagnostics() {
  "use strict";

  const INSTALL_ID_KEY = "iduPlusDiagnosticsInstallId";
  const REPORTS_KEY = "iduPlusDiagnosticsSuccessfulReports";
  const FALLBACK_STORAGE_KEY = "iduPlusDiagnosticsState";
  const MAX_NAME_LENGTH = 120;
  const PLACEHOLDER_NAMES = new Set(["student", "user", "uczen", "uczeń", "uzytkownik", "użytkownik"]);

  const cleanText = (value) => String(value || "").replace(/\s+/g, " ").trim();

  const sanitizeFullName = (value) => {
    const cleaned = cleanText(value).replace(/^witaj,?\s*/i, "");
    const normalized = cleaned.toLocaleLowerCase("pl-PL");

    if (!cleaned || cleaned.length < 2 || cleaned.length > MAX_NAME_LENGTH) {
      return null;
    }

    if (PLACEHOLDER_NAMES.has(normalized)) {
      return null;
    }

    if (!/[A-Za-zÀ-ž]/.test(cleaned)) {
      return null;
    }

    return cleaned;
  };

  const detectDisplayedFullName = (documentRef) => {
    if (!documentRef?.querySelector) {
      return null;
    }

    const directName = sanitizeFullName(documentRef.querySelector("#login strong")?.textContent);

    if (directName) {
      return directName;
    }

    return sanitizeFullName(documentRef.querySelector("#login")?.textContent);
  };

  const detectBrowserName = (navigatorRef) => {
    const brands = navigatorRef?.userAgentData?.brands || navigatorRef?.userAgentData?.fullVersionList || [];
    const brand = brands
      .map((item) => cleanText(item.brand))
      .find((item) => item && !/chromium|not[ .]?a[ .]?brand/i.test(item));

    if (brand) {
      return brand;
    }

    const userAgent = navigatorRef?.userAgent || "";

    if (/Firefox\//i.test(userAgent)) {
      return "Firefox";
    }

    if (/Edg\//i.test(userAgent)) {
      return "Edge";
    }

    if (/OPR\//i.test(userAgent)) {
      return "Opera";
    }

    if (/Chrome\/|CriOS\//i.test(userAgent)) {
      return "Chrome";
    }

    if (/Safari\//i.test(userAgent)) {
      return "Safari";
    }

    return "Unknown";
  };

  const normalizeReportKey = (fullName) => cleanText(fullName).toLocaleLowerCase("pl-PL");

  const readExtensionStorage = (storage, runtime, defaults) =>
    new Promise((resolve) => {
      let settled = false;
      const finish = (value, ok = true) => {
        if (settled) {
          return;
        }

        settled = true;
        resolve({ ok, value: value || defaults, source: "extension" });
      };

      try {
        if (!storage?.local?.get) {
          finish(defaults, false);
          return;
        }

        const callback = (result) => finish(result, !runtime?.lastError);
        const pending = storage.local.get(defaults, callback);
        pending?.then?.((result) => finish(result), () => finish(defaults, false));
      } catch (_error) {
        finish(defaults, false);
      }
    });

  const writeExtensionStorage = (storage, runtime, values) =>
    new Promise((resolve) => {
      let settled = false;
      const finish = (ok = true) => {
        if (settled) {
          return;
        }

        settled = true;
        resolve(ok);
      };

      try {
        if (!storage?.local?.set) {
          finish(false);
          return;
        }

        const callback = () => finish(!runtime?.lastError);
        const pending = storage.local.set(values, callback);
        pending?.then?.(() => finish(true), () => finish(false));
      } catch (_error) {
        finish(false);
      }
    });

  const readFallbackStorage = (fallbackStorage, defaults) => {
    try {
      if (!fallbackStorage?.getItem) {
        return { ok: false, value: defaults, source: "none" };
      }

      const value = JSON.parse(fallbackStorage.getItem(FALLBACK_STORAGE_KEY) || "null");
      return {
        ok: true,
        value: value && typeof value === "object" && !Array.isArray(value) ? { ...defaults, ...value } : defaults,
        source: "local"
      };
    } catch (_error) {
      return { ok: false, value: defaults, source: "none" };
    }
  };

  const writeFallbackStorage = (fallbackStorage, values) => {
    try {
      if (!fallbackStorage?.setItem) {
        return false;
      }

      const current = readFallbackStorage(fallbackStorage, {}).value;
      fallbackStorage.setItem(FALLBACK_STORAGE_KEY, JSON.stringify({ ...current, ...values }));
      return true;
    } catch (_error) {
      return false;
    }
  };

  const getFromStorage = async (storage, runtime, fallbackStorage, defaults) => {
    const extensionResult = await readExtensionStorage(storage, runtime, defaults);
    return extensionResult.ok ? extensionResult : readFallbackStorage(fallbackStorage, defaults);
  };

  const setInStorage = async (storage, runtime, fallbackStorage, source, values) => {
    if (source === "extension" && (await writeExtensionStorage(storage, runtime, values))) {
      return true;
    }

    return writeFallbackStorage(fallbackStorage, values);
  };

  const generateInstallId = (cryptoRef) => {
    if (cryptoRef?.randomUUID) {
      return `idu-${cryptoRef.randomUUID()}`;
    }

    if (!cryptoRef?.getRandomValues) {
      return null;
    }

    const bytes = new Uint8Array(16);
    cryptoRef.getRandomValues(bytes);
    bytes[6] = (bytes[6] & 0x0f) | 0x40;
    bytes[8] = (bytes[8] & 0x3f) | 0x80;

    const hex = Array.from(bytes, (byte) => byte.toString(16).padStart(2, "0")).join("");
    return `idu-${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
  };

  const normalizeReports = (reports) => (reports && typeof reports === "object" && !Array.isArray(reports) ? reports : {});

  const reportActiveUser = async ({
    document: documentRef,
    endpoint,
    fetch: fetchRef,
    location: locationRef,
    navigator: navigatorRef,
    runtime,
    storage,
    fallbackStorage,
    extensionVersion,
    crypto,
    log,
    now = () => new Date()
  }) => {
    const reportStage = (stage, details) => {
      try {
        log?.(stage, details);
      } catch (_error) {
        // Diagnostics logging must never affect delivery.
      }
    };

    try {
      let detectedVersion = cleanText(extensionVersion);

      if (!detectedVersion && runtime?.getManifest) {
        try {
          detectedVersion = cleanText(runtime.getManifest()?.version);
        } catch (_error) {
          reportStage("runtime-unavailable");
        }
      }

      if (!detectedVersion) {
        reportStage("runtime-unavailable");
        return { sent: false, reason: "runtime-unavailable" };
      }

      reportStage("runtime-ready");

      if (!fetchRef || !/^https:\/\//i.test(endpoint || "")) {
        reportStage("fetch-unavailable");
        return { sent: false, reason: "fetch-unavailable" };
      }

      const fullName = detectDisplayedFullName(documentRef);

      if (!fullName) {
        reportStage("no-user");
        return { sent: false, reason: "no-user" };
      }

      reportStage("user-detected");

      const currentTime = now();
      const storedResult = await getFromStorage(storage, runtime, fallbackStorage, {
        [INSTALL_ID_KEY]: null,
        [REPORTS_KEY]: {}
      });
      const stored = storedResult.value;

      if (!storedResult.ok) {
        reportStage("storage-failure");
        return { sent: false, reason: "storage-failure" };
      }

      reportStage(storedResult.source === "extension" ? "storage-extension" : "storage-local");

      const reports = normalizeReports(stored[REPORTS_KEY]);
      const reportKey = normalizeReportKey(fullName);

      // Kazdy stary wpis daty i nowy znacznik oznaczaja, ze ta osoba zostala
      // juz zgloszona z tej instalacji. Nie wysylamy jej ponownie.
      if (reports[reportKey]) {
        reportStage("already-reported");
        return { sent: false, reason: "already-reported" };
      }

      const installId = cleanText(stored[INSTALL_ID_KEY]) || generateInstallId(crypto);

      if (!installId) {
        reportStage("install-id-unavailable");
        return { sent: false, reason: "no-install-id" };
      }

      if (!cleanText(stored[INSTALL_ID_KEY])) {
        const installIdStored = await setInStorage(storage, runtime, fallbackStorage, storedResult.source, {
          [INSTALL_ID_KEY]: installId
        });

        if (!installIdStored) {
          reportStage("storage-failure");
          return { sent: false, reason: "storage-failure" };
        }
      }

      const event = {
        fullName,
        extensionVersion: detectedVersion,
        browser: detectBrowserName(navigatorRef),
        host: cleanText(locationRef?.host),
        installId,
        timestamp: currentTime.toISOString()
      };

      reportStage("payload-created");
      reportStage("request-attempted");

      let response;

      try {
        response = await fetchRef(endpoint, {
          method: "POST",
          headers: {
            "content-type": "application/json"
          },
          body: JSON.stringify(event),
          credentials: "omit",
          keepalive: true
        });
      } catch (_error) {
        reportStage("network-or-cors-error");
        return { sent: false, reason: "network-or-cors-error" };
      }

      if (!response?.ok) {
        const status = Number(response?.status) || 0;
        const reason =
          status === 429
            ? "rate-limit-error"
            : status === 502
              ? "discord-webhook-failure"
              : status === 503
                ? "worker-configuration-error"
                : "http-error";
        reportStage(reason, { status });
        return { sent: false, reason, status };
      }

      reports[reportKey] = true;
      const reportStored = await setInStorage(storage, runtime, fallbackStorage, storedResult.source, {
        [INSTALL_ID_KEY]: installId,
        [REPORTS_KEY]: reports
      });

      if (!reportStored) {
        reportStage("storage-failure-after-success");
      }

      reportStage("success");
      return { sent: true, reason: "sent", storagePersisted: reportStored };
    } catch (_error) {
      reportStage("unexpected-client-error");
      return { sent: false, reason: "unexpected-client-error" };
    }
  };

  return {
    cleanText,
    detectBrowserName,
    detectDisplayedFullName,
    generateInstallId,
    reportActiveUser,
    sanitizeFullName
  };
});
