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

  const getFromStorage = (storage, defaults) =>
    new Promise((resolve) => {
      try {
        if (!storage?.local?.get) {
          resolve(defaults);
          return;
        }

        storage.local.get(defaults, (result) => resolve(result || defaults));
      } catch (_error) {
        resolve(defaults);
      }
    });

  const setInStorage = (storage, values) =>
    new Promise((resolve) => {
      try {
        if (!storage?.local?.set) {
          resolve();
          return;
        }

        storage.local.set(values, () => resolve());
      } catch (_error) {
        resolve();
      }
    });

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
    crypto,
    now = () => new Date()
  }) => {
    try {
      if (!runtime?.getManifest || !fetchRef || !/^https:\/\//i.test(endpoint || "")) {
        return { sent: false, reason: "unavailable" };
      }

      const fullName = detectDisplayedFullName(documentRef);

      if (!fullName) {
        return { sent: false, reason: "no-user" };
      }

      const currentTime = now();
      const stored = await getFromStorage(storage, {
        [INSTALL_ID_KEY]: null,
        [REPORTS_KEY]: {}
      });
      const reports = normalizeReports(stored[REPORTS_KEY]);
      const reportKey = normalizeReportKey(fullName);

      // Kazdy stary wpis daty i nowy znacznik oznaczaja, ze ta osoba zostala
      // juz zgloszona z tej instalacji. Nie wysylamy jej ponownie.
      if (reports[reportKey]) {
        return { sent: false, reason: "already-reported" };
      }

      const installId = cleanText(stored[INSTALL_ID_KEY]) || generateInstallId(crypto);

      if (!installId) {
        return { sent: false, reason: "no-install-id" };
      }

      if (!cleanText(stored[INSTALL_ID_KEY])) {
        await setInStorage(storage, {
          [INSTALL_ID_KEY]: installId
        });
      }

      const event = {
        fullName,
        extensionVersion: cleanText(runtime.getManifest()?.version) || "unknown",
        browser: detectBrowserName(navigatorRef),
        host: cleanText(locationRef?.host),
        installId,
        timestamp: currentTime.toISOString()
      };

      const response = await fetchRef(endpoint, {
        method: "POST",
        headers: {
          "content-type": "application/json"
        },
        body: JSON.stringify(event),
        credentials: "omit",
        keepalive: true
      });

      if (!response?.ok) {
        return { sent: false, reason: "failed" };
      }

      reports[reportKey] = true;
      await setInStorage(storage, {
        [INSTALL_ID_KEY]: installId,
        [REPORTS_KEY]: reports
      });

      return { sent: true, reason: "sent" };
    } catch (_error) {
      return { sent: false, reason: "failed" };
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
