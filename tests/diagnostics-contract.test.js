const assert = require("assert");
const fs = require("fs");
const path = require("path");
const { pathToFileURL } = require("url");

const root = path.resolve(__dirname, "..");
const diagnosticsPath = path.join(root, "src", "diagnostics.js");
const workerPath = path.join(root, "workers", "diagnostics-worker.mjs");
const wranglerPath = path.join(root, "workers", "wrangler.jsonc");

const readText = (relativePath) => fs.readFileSync(path.join(root, relativePath), "utf8");

function makeDocumentWithLogin(name) {
  return {
    querySelector(selector) {
      if (selector === "#login strong" && name) {
        return { textContent: name };
      }

      if (selector === "#login" && name) {
        return { textContent: `Witaj, ${name}` };
      }

      return null;
    }
  };
}

function makeStorage(initial = {}) {
  const store = { ...initial };

  return {
    store,
    api: {
      local: {
        get(defaults, callback) {
          const result = {};

          for (const [key, fallback] of Object.entries(defaults)) {
            result[key] = Object.prototype.hasOwnProperty.call(store, key) ? store[key] : fallback;
          }

          callback(result);
        },
        set(values, callback) {
          Object.assign(store, values);
          callback?.();
        }
      }
    }
  };
}

(async () => {
  const manifest = JSON.parse(readText("manifest.json"));
  const popupHtml = readText("popup.html");
  const popupCss = readText("src/popup.css");
  const contentJs = readText("src/idu-plus.js");
  const diagnosticsJs = readText("src/diagnostics.js");
  const privacyHtml = readText("docs/privacy.html");
  const webhookPathPattern = ["discord.com/api", "webhooks"].join("/");
  const repoText = [
    "manifest.json",
    "popup.html",
    "README.md",
    "docs/privacy.html",
    "src/idu-plus.js",
    "src/popup.js",
    "src/popup.css"
  ]
    .filter((relativePath) => fs.existsSync(path.join(root, relativePath)))
    .map(readText)
    .join("\n");

  assert(fs.existsSync(diagnosticsPath), "Extension diagnostics helper should exist");
  assert(fs.existsSync(workerPath), "Cloudflare diagnostics Worker should exist");
  assert(fs.existsSync(wranglerPath), "Cloudflare Worker Wrangler config should exist");

  assert(
    manifest.content_scripts?.[0]?.js?.[0] === "src/diagnostics.js" &&
      manifest.content_scripts?.[0]?.js?.[1] === "src/idu-plus.js",
    "Manifest should load diagnostics helper before the main content script"
  );
  assert.deepEqual(manifest.permissions, ["storage", "activeTab"], "Diagnostics should not add extra permissions");
  assert(!manifest.host_permissions, "Diagnostics should not add broad host permissions");
  assert(!repoText.includes(webhookPathPattern), "Repository files must not contain a Discord webhook URL");

  assert(
    !popupHtml.includes("diagnostics/privacy") && !popupHtml.includes("displayed full name"),
    "Popup should not render the removed diagnostics/privacy panel"
  );
  assert(!popupCss.includes(".privacy-note"), "Popup CSS should not retain styles for the removed panel");
  assert(
    privacyHtml.includes("displayed full name") &&
      privacyHtml.includes("basic technical diagnostics") &&
      privacyHtml.includes("does not collect passwords, cookies, grades, messages, page contents, or screenshots"),
    "Public privacy page should match the new diagnostics behavior"
  );
  assert(
    contentJs.includes("IDUPlusDiagnostics.reportActiveUser") &&
      contentJs.includes("DIAGNOSTICS_ENDPOINT"),
    "Content script should call diagnostics reporting without inlining webhook details"
  );
  assert(
    contentJs.includes("scheduleDiagnosticsReport") &&
      contentJs.includes("setTimeout") &&
      contentJs.includes("DIAGNOSTICS_RETRY_DELAYS_MS") &&
      contentJs.includes("diagnosticsPending"),
    "Content script should retry diagnostics briefly in case the logged-in user label renders late"
  );
  assert(
    diagnosticsJs.includes('reason: "already-reported"') &&
      diagnosticsJs.includes("reports[reportKey] = true") &&
      !diagnosticsJs.includes("reportDateKey"),
    "Diagnostics should persist one permanent successful report marker per displayed person"
  );
  assert(
    privacyHtml.includes("only once per installation") &&
      privacyHtml.includes("same person is not reported again"),
    "The privacy policy should describe one-time per-person diagnostics"
  );

  const diagnostics = require(diagnosticsPath);

  assert.equal(diagnostics.cleanText("  Jan   Kowalski  "), "Jan Kowalski");
  assert.equal(diagnostics.sanitizeFullName("  Jan   Kowalski  "), "Jan Kowalski");
  assert.equal(diagnostics.sanitizeFullName("Student"), null, "Placeholder labels should not be reported as names");
  assert.equal(diagnostics.sanitizeFullName("a".repeat(121)), null, "Overlong names should not be reported");
  assert.equal(
    diagnostics.detectDisplayedFullName(makeDocumentWithLogin("  Jan   Kowalski  ")),
    "Jan Kowalski",
    "Diagnostics should read only the displayed login name"
  );
  assert.equal(
    diagnostics.detectBrowserName({ userAgent: "Mozilla/5.0 Firefox/126.0" }),
    "Firefox",
    "Diagnostics should derive a simple browser name when available"
  );
  const storage = makeStorage();
  const fetchCalls = [];
  const result = await diagnostics.reportActiveUser({
    document: makeDocumentWithLogin("Jan Kowalski"),
    endpoint: "https://idu-plus-diagnostics.example.workers.dev/diagnostics",
    fetch: async (url, init) => {
      fetchCalls.push({ url, init });
      return { ok: true };
    },
    location: { host: "demo.idu.edu.pl" },
    navigator: { userAgent: "Mozilla/5.0 Chrome/126.0 Safari/537.36" },
    runtime: { getManifest: () => ({ version: "0.3.5" }) },
    storage: storage.api,
    crypto: { randomUUID: () => "11111111-1111-4111-8111-111111111111" },
    now: () => new Date("2026-06-25T09:00:00.000Z")
  });

  assert.equal(result.sent, true, "First valid login detection should send a diagnostics event");
  assert.equal(fetchCalls.length, 1, "First valid login detection should make one request");
  assert.equal(fetchCalls[0].url, "https://idu-plus-diagnostics.example.workers.dev/diagnostics");
  assert.equal(fetchCalls[0].init.method, "POST");
  assert.equal(fetchCalls[0].init.credentials, "omit");

  const payload = JSON.parse(fetchCalls[0].init.body);
  assert.deepEqual(Object.keys(payload).sort(), [
    "browser",
    "extensionVersion",
    "fullName",
    "host",
    "installId",
    "timestamp"
  ]);
  assert.equal(payload.fullName, "Jan Kowalski");
  assert.equal(payload.extensionVersion, "0.3.5");
  assert.equal(payload.browser, "Chrome");
  assert.equal(payload.host, "demo.idu.edu.pl");
  assert.equal(payload.installId, "idu-11111111-1111-4111-8111-111111111111");
  assert.equal(payload.timestamp, "2026-06-25T09:00:00.000Z");
  assert(!JSON.stringify(payload).match(/password|cookie|grade|message|html|screenshot/i));

  await diagnostics.reportActiveUser({
    document: makeDocumentWithLogin("Jan Kowalski"),
    endpoint: "https://idu-plus-diagnostics.example.workers.dev/diagnostics",
    fetch: async (url, init) => fetchCalls.push({ url, init }),
    location: { host: "demo.idu.edu.pl" },
    navigator: { userAgent: "Mozilla/5.0 Chrome/126.0 Safari/537.36" },
    runtime: { getManifest: () => ({ version: "0.3.5" }) },
    storage: storage.api,
    crypto: { randomUUID: () => "22222222-2222-4222-8222-222222222222" },
    now: () => new Date("2026-06-25T12:00:00.000Z")
  });
  assert.equal(fetchCalls.length, 1, "Same displayed name should report only once per installation");

  await diagnostics.reportActiveUser({
    document: makeDocumentWithLogin("Jan Kowalski"),
    endpoint: "https://idu-plus-diagnostics.example.workers.dev/diagnostics",
    fetch: async (url, init) => {
      fetchCalls.push({ url, init });
      return { ok: true };
    },
    location: { host: "demo.idu.edu.pl" },
    navigator: { userAgent: "Mozilla/5.0 Chrome/126.0 Safari/537.36" },
    runtime: { getManifest: () => ({ version: "0.3.5" }) },
    storage: storage.api,
    crypto: { randomUUID: () => "33333333-3333-4333-8333-333333333333" },
    now: () => new Date("2026-06-26T09:00:00.000Z")
  });
  assert.equal(fetchCalls.length, 1, "Same displayed name must not be reported again on a later day");
  assert.equal(
    storage.store.iduPlusDiagnosticsSuccessfulReports["jan kowalski"],
    true,
    "A successful first report should persist a permanent per-person marker"
  );

  const migratedStorage = makeStorage({
    iduPlusDiagnosticsInstallId: "idu-99999999-9999-4999-8999-999999999999",
    iduPlusDiagnosticsSuccessfulReports: { "jan kowalski": "2026-06-20" }
  });
  let migratedFetchCalls = 0;
  const migratedResult = await diagnostics.reportActiveUser({
    document: makeDocumentWithLogin("Jan Kowalski"),
    endpoint: "https://idu-plus-diagnostics.example.workers.dev/diagnostics",
    fetch: async () => {
      migratedFetchCalls += 1;
      return { ok: true };
    },
    location: { host: "demo.idu.edu.pl" },
    navigator: { userAgent: "Mozilla/5.0 Chrome/126.0 Safari/537.36" },
    runtime: { getManifest: () => ({ version: "0.3.5" }) },
    storage: migratedStorage.api,
    crypto: { randomUUID: () => "66666666-6666-4666-8666-666666666666" },
    now: () => new Date("2026-06-27T09:00:00.000Z")
  });
  assert.equal(migratedResult.reason, "already-reported", "Old daily report dates should migrate to one-time markers");
  assert.equal(migratedFetchCalls, 0, "A legacy successful report must prevent another diagnostics request");

  const failingStorage = makeStorage();
  const failingResult = await diagnostics.reportActiveUser({
    document: makeDocumentWithLogin("Jan Kowalski"),
    endpoint: "https://idu-plus-diagnostics.example.workers.dev/diagnostics",
    fetch: async () => {
      throw new Error("network down");
    },
    location: { host: "demo.idu.edu.pl" },
    navigator: { userAgent: "Mozilla/5.0 Firefox/126.0" },
    runtime: { getManifest: () => ({ version: "0.3.5" }) },
    storage: failingStorage.api,
    crypto: { randomUUID: () => "44444444-4444-4444-8444-444444444444" },
    now: () => new Date("2026-06-25T09:00:00.000Z")
  });
  assert.equal(failingResult.sent, false, "Diagnostics should fail silently when the endpoint is unavailable");
  assert.equal(failingResult.reason, "failed");

  const retryAfterFailureCalls = [];
  const retryAfterFailureResult = await diagnostics.reportActiveUser({
    document: makeDocumentWithLogin("Jan Kowalski"),
    endpoint: "https://idu-plus-diagnostics.example.workers.dev/diagnostics",
    fetch: async (url, init) => {
      retryAfterFailureCalls.push({ url, init });
      return { ok: true };
    },
    location: { host: "demo.idu.edu.pl" },
    navigator: { userAgent: "Mozilla/5.0 Firefox/126.0" },
    runtime: { getManifest: () => ({ version: "0.3.5" }) },
    storage: failingStorage.api,
    crypto: { randomUUID: () => "55555555-5555-4555-8555-555555555555" },
    now: () => new Date("2026-06-25T10:00:00.000Z")
  });
  assert.equal(retryAfterFailureResult.sent, true, "A failed diagnostics attempt should not throttle a later successful retry");
  assert.equal(retryAfterFailureCalls.length, 1, "Retry after failed diagnostics should make a fresh request");

  const worker = await import(pathToFileURL(workerPath).href);
  const validEvent = {
    fullName: "Jan Kowalski",
    extensionVersion: "0.3.5",
    browser: "Chrome",
    host: "demo.idu.edu.pl",
    installId: "idu-11111111-1111-4111-8111-111111111111",
    timestamp: "2026-06-25T09:00:00.000Z"
  };

  assert.equal(worker.validateDiagnosticsEvent(validEvent).ok, true, "Worker should accept a valid diagnostics event");
  assert.equal(
    worker.validateDiagnosticsEvent({ ...validEvent, host: "s19.idu.edu.pl" }).ok,
    true,
    "Worker should accept the real s19.idu.edu.pl IDU host"
  );
  assert.equal(worker.validateDiagnosticsEvent({ ...validEvent, grades: "6,6,6" }).ok, false, "Worker should reject extra fields");
  assert.equal(worker.validateDiagnosticsEvent({ ...validEvent, fullName: "" }).ok, false, "Worker should reject empty names");
  assert.equal(worker.validateDiagnosticsEvent({ ...validEvent, host: "not a host" }).ok, false, "Worker should reject invalid hosts");

  const discordPayload = worker.createDiscordPayload(validEvent);
  const fields = discordPayload.embeds[0].fields;
  assert(fields.some((field) => field.name === "Full name" && field.value === "Jan Kowalski"));
  assert(fields.some((field) => field.name === "Extension version" && field.value === "0.3.5"));
  assert(fields.some((field) => field.name === "Browser" && field.value === "Chrome"));
  assert(fields.some((field) => field.name === "IDU host" && field.value === "demo.idu.edu.pl"));
  assert(fields.some((field) => field.name === "Install ID" && field.value === "idu-11111111-1111-4111-8111-111111111111"));
  assert(fields.some((field) => field.name === "Timestamp" && field.value === "2026-06-25T09:00:00.000Z"));

  const discordCalls = [];
  const allowRateLimiter = { limit: async () => ({ success: true }) };
  const allowedWorkerEnv = {
    DISCORD_WEBHOOK_URL: "https://discord.invalid/webhook",
    DIAGNOSTICS_GLOBAL_RATE_LIMITER: allowRateLimiter,
    DIAGNOSTICS_CLIENT_RATE_LIMITER: allowRateLimiter
  };
  const response = await worker.handleDiagnosticsRequest(
    new Request("https://idu-plus-diagnostics.example.workers.dev/diagnostics", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        origin: "https://demo.idu.edu.pl"
      },
      body: JSON.stringify(validEvent)
    }),
    allowedWorkerEnv,
    {},
    {
      fetch: async (url, init) => {
        discordCalls.push({ url, init });
        return new Response(null, { status: 204 });
      }
    }
  );

  assert.equal(response.status, 202, "Worker should accept valid diagnostics requests");
  assert.equal(discordCalls.length, 1, "Worker should forward valid diagnostics to Discord once");
  assert.equal(discordCalls[0].url, "https://discord.invalid/webhook");
  assert.equal(JSON.parse(discordCalls[0].init.body).embeds[0].title, "IDU+ active user diagnostics");

  const malformed = await worker.handleDiagnosticsRequest(
    new Request("https://idu-plus-diagnostics.example.workers.dev/diagnostics", {
      method: "POST",
      headers: { "content-type": "application/json", origin: "https://demo.idu.edu.pl" },
      body: "{"
    }),
    allowedWorkerEnv,
    {},
    { fetch: async () => new Response("ok") }
  );
  assert.equal(malformed.status, 400, "Worker should reject malformed JSON without crashing");

  let rateLimitedDiscordCalls = 0;
  let clientRateLimitKey = null;
  const rateLimited = await worker.handleDiagnosticsRequest(
    new Request("https://idu-plus-diagnostics.example.workers.dev/diagnostics", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        origin: "https://demo.idu.edu.pl",
        "cf-connecting-ip": "203.0.113.42"
      },
      body: JSON.stringify(validEvent)
    }),
    {
      DISCORD_WEBHOOK_URL: "https://discord.invalid/webhook",
      DIAGNOSTICS_GLOBAL_RATE_LIMITER: allowRateLimiter,
      DIAGNOSTICS_CLIENT_RATE_LIMITER: {
        limit: async ({ key }) => {
          clientRateLimitKey = key;
          return { success: false };
        }
      }
    },
    {},
    {
      fetch: async () => {
        rateLimitedDiscordCalls += 1;
        return new Response(null, { status: 204 });
      }
    }
  );
  assert.equal(rateLimited.status, 429, "Worker should reject over-limit diagnostics server-side");
  assert.equal(rateLimited.headers.get("retry-after"), "60", "Rate-limited responses should advertise the retry window");
  assert.equal(clientRateLimitKey, "203.0.113.42", "Per-client limiting should use Cloudflare's client address");
  assert.equal(rateLimitedDiscordCalls, 0, "Rate-limited diagnostics must never reach Discord");

  const badOrigin = await worker.handleDiagnosticsRequest(
    new Request("https://idu-plus-diagnostics.example.workers.dev/diagnostics", {
      method: "POST",
      headers: { "content-type": "application/json", origin: "https://evil.example" },
      body: JSON.stringify(validEvent)
    }),
    allowedWorkerEnv,
    {},
    { fetch: async () => new Response("ok") }
  );
  assert.equal(badOrigin.status, 403, "Worker should reject browser requests from non-IDU origins");

  const workerSource = fs.readFileSync(workerPath, "utf8");
  const wranglerSource = fs.readFileSync(wranglerPath, "utf8");
  assert(!workerSource.includes(webhookPathPattern), "Worker source must not contain a real Discord webhook");
  assert(!wranglerSource.includes(webhookPathPattern), "Wrangler config must not contain a real Discord webhook");
  assert(wranglerSource.includes('"DISCORD_WEBHOOK_URL"'), "Wrangler config should declare the required secret name");
  assert(
    wranglerSource.includes('"DIAGNOSTICS_GLOBAL_RATE_LIMITER"') &&
      wranglerSource.includes('"DIAGNOSTICS_CLIENT_RATE_LIMITER"') &&
      wranglerSource.includes('"limit": 120') &&
      wranglerSource.includes('"limit": 6'),
    "Wrangler should configure global and per-client server-side rate limiting bindings"
  );

  console.log("diagnostics contract ok");
})();
