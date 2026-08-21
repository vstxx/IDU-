const MAX_BODY_BYTES = 4096;
const RATE_LIMIT_WINDOW_SECONDS = 60;
const REQUIRED_KEYS = Object.freeze(["browser", "extensionVersion", "fullName", "host", "installId", "timestamp"]);

const jsonResponse = (body, status = 200, origin = null, extraHeaders = {}) =>
  new Response(JSON.stringify(body), {
    status,
    headers: {
      "content-type": "application/json; charset=utf-8",
      ...corsHeaders(origin),
      ...extraHeaders
    }
  });

const corsHeaders = (origin) => ({
  "access-control-allow-origin": origin || "null",
  "access-control-allow-methods": "POST, OPTIONS",
  "access-control-allow-headers": "content-type",
  "access-control-max-age": "86400",
  vary: "Origin"
});

const isAllowedOrigin = (origin) => {
  if (!origin) {
    return true;
  }

  try {
    const url = new URL(origin);
    return url.protocol === "https:" && isValidIduHost(url.hostname);
  } catch (_error) {
    return false;
  }
};

const allowedCorsOrigin = (request) => {
  const origin = request.headers.get("origin");
  return isAllowedOrigin(origin) ? origin : null;
};

const isSafeString = (value, minLength, maxLength) =>
  typeof value === "string" && value.length >= minLength && value.length <= maxLength && !/[\u0000-\u001f\u007f]/.test(value);

const isValidIduHost = (host) => {
  if (!isSafeString(host, 1, 253) || /\s/.test(host)) {
    return false;
  }

  const normalized = host.toLowerCase();
  return normalized.endsWith(".idu.edu.pl") && normalized.split(".").every((part) => /^[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?$/.test(part));
};

const isIsoTimestamp = (value) =>
  isSafeString(value, 20, 40) && !Number.isNaN(Date.parse(value)) && new Date(value).toISOString() === value;

export const validateDiagnosticsEvent = (payload) => {
  if (!payload || typeof payload !== "object" || Array.isArray(payload)) {
    return { ok: false, error: "Expected a JSON object." };
  }

  const keys = Object.keys(payload).sort();

  if (keys.length !== REQUIRED_KEYS.length || keys.some((key, index) => key !== REQUIRED_KEYS[index])) {
    return { ok: false, error: "Unexpected diagnostics fields." };
  }

  if (!isSafeString(payload.fullName, 2, 120)) {
    return { ok: false, error: "Invalid full name." };
  }

  if (!isSafeString(payload.extensionVersion, 1, 32) || !/^[0-9A-Za-z][0-9A-Za-z._+-]{0,31}$/.test(payload.extensionVersion)) {
    return { ok: false, error: "Invalid extension version." };
  }

  if (!isSafeString(payload.browser, 1, 80)) {
    return { ok: false, error: "Invalid browser." };
  }

  if (!isValidIduHost(payload.host)) {
    return { ok: false, error: "Invalid IDU host." };
  }

  if (!/^idu-[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(payload.installId)) {
    return { ok: false, error: "Invalid install ID." };
  }

  if (!isIsoTimestamp(payload.timestamp)) {
    return { ok: false, error: "Invalid timestamp." };
  }

  return { ok: true, event: payload };
};

const field = (name, value, inline = false) => ({
  name,
  value: String(value || "Unknown").slice(0, 1024),
  inline
});

export const createDiscordPayload = (event) => ({
  username: "IDU+ Diagnostics",
  embeds: [
    {
      title: "IDU+ active user diagnostics",
      color: 0x2f78b7,
      timestamp: event.timestamp,
      fields: [
        field("Full name", event.fullName, true),
        field("Extension version", event.extensionVersion, true),
        field("Browser", event.browser, true),
        field("IDU host", event.host, true),
        field("Install ID", event.installId, false),
        field("Timestamp", event.timestamp, false)
      ]
    }
  ]
});

const readLimitedJson = async (request) => {
  const contentLength = Number(request.headers.get("content-length") || "0");

  if (contentLength > MAX_BODY_BYTES) {
    return { ok: false, status: 413, error: "Payload too large." };
  }

  if (!request.body) {
    return { ok: false, status: 400, error: "Missing request body." };
  }

  const reader = request.body.getReader();
  const decoder = new TextDecoder();
  let bytes = 0;
  let text = "";

  while (true) {
    const { done, value } = await reader.read();

    if (done) {
      break;
    }

    bytes += value.byteLength;

    if (bytes > MAX_BODY_BYTES) {
      return { ok: false, status: 413, error: "Payload too large." };
    }

    text += decoder.decode(value, { stream: true });
  }

  text += decoder.decode();

  try {
    return { ok: true, payload: JSON.parse(text) };
  } catch (_error) {
    return { ok: false, status: 400, error: "Malformed JSON." };
  }
};

const enforceRateLimit = async (binding, key) => {
  if (!binding?.limit) {
    return { ok: false, status: 503, error: "Diagnostics rate limiting is not configured." };
  }

  try {
    const result = await binding.limit({ key });

    if (!result?.success) {
      return { ok: false, status: 429, error: "Too many diagnostics requests." };
    }

    return { ok: true };
  } catch (_error) {
    return { ok: false, status: 503, error: "Diagnostics rate limiting is unavailable." };
  }
};

const rateLimitResponse = (result, corsOrigin) =>
  jsonResponse(
    { error: result.error },
    result.status,
    corsOrigin,
    result.status === 429 ? { "retry-after": String(RATE_LIMIT_WINDOW_SECONDS) } : {}
  );

export const handleDiagnosticsRequest = async (request, env, _ctx, options = {}) => {
  const url = new URL(request.url);
  const origin = request.headers.get("origin");
  const corsOrigin = allowedCorsOrigin(request);

  if (url.pathname !== "/diagnostics") {
    return jsonResponse({ error: "Not found." }, 404, corsOrigin);
  }

  if (!isAllowedOrigin(origin)) {
    return jsonResponse({ error: "Forbidden origin." }, 403, null);
  }

  if (request.method === "OPTIONS") {
    return new Response(null, {
      status: 204,
      headers: corsHeaders(corsOrigin)
    });
  }

  if (request.method !== "POST") {
    return jsonResponse({ error: "Method not allowed." }, 405, corsOrigin);
  }

  if (!request.headers.get("content-type")?.toLowerCase().includes("application/json")) {
    return jsonResponse({ error: "Expected application/json." }, 415, corsOrigin);
  }

  if (!env?.DISCORD_WEBHOOK_URL) {
    return jsonResponse({ error: "Diagnostics webhook is not configured." }, 503, corsOrigin);
  }

  const globalLimit = await enforceRateLimit(env.DIAGNOSTICS_GLOBAL_RATE_LIMITER, "diagnostics");

  if (!globalLimit.ok) {
    return rateLimitResponse(globalLimit, corsOrigin);
  }

  const parsed = await readLimitedJson(request);

  if (!parsed.ok) {
    return jsonResponse({ error: parsed.error }, parsed.status, corsOrigin);
  }

  const validation = validateDiagnosticsEvent(parsed.payload);

  if (!validation.ok) {
    return jsonResponse({ error: validation.error }, 400, corsOrigin);
  }

  const clientAddress = request.headers.get("cf-connecting-ip") || "unknown-client";
  const clientLimit = await enforceRateLimit(env.DIAGNOSTICS_CLIENT_RATE_LIMITER, clientAddress);

  if (!clientLimit.ok) {
    return rateLimitResponse(clientLimit, corsOrigin);
  }

  try {
    const fetchImpl = options.fetch || fetch;
    const discordResponse = await fetchImpl(env.DISCORD_WEBHOOK_URL, {
      method: "POST",
      headers: {
        "content-type": "application/json"
      },
      body: JSON.stringify(createDiscordPayload(validation.event))
    });

    if (!discordResponse.ok) {
      return jsonResponse({ error: "Discord rejected diagnostics event." }, 502, corsOrigin);
    }

    return jsonResponse({ ok: true }, 202, corsOrigin);
  } catch (_error) {
    return jsonResponse({ error: "Diagnostics forwarding failed." }, 502, corsOrigin);
  }
};

export default {
  fetch(request, env, ctx) {
    return handleDiagnosticsRequest(request, env, ctx);
  }
};
