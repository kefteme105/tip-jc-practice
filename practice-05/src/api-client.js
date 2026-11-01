export class ApiError extends Error {
  constructor(message, {
    kind,
    status = null,
    code = null,
    details = null,
    url = null,
    cause,
  } = {}) {
    super(message, cause === undefined ? undefined : { cause });
    this.name = "ApiError";
    this.kind = kind;
    this.status = status;
    this.code = code;
    this.details = details;
    this.url = url;
  }
}

// Создаёт URL относительно baseUrl и добавляет непустые параметры query.
// Значения кодируются средствами URL и URLSearchParams, а не вручную.
export function buildUrl(baseUrl, path, query = {}) {
  const base = new URL(baseUrl);
  if (!["http:", "https:"].includes(base.protocol) || base.search || base.hash) throw new TypeError("Неверный baseUrl");
  if (typeof path !== "string" || !path.trim() || !query || typeof query !== "object" || Array.isArray(query)) {
    throw new TypeError("Неверный путь или query");
  }
  base.pathname = `${base.pathname.replace(/\/+$/, "")}/${path.replace(/^\/+/, "")}`;
  for (const [name, value] of Object.entries(query)) {
    if (value !== undefined && value !== null && value !== "") base.searchParams.set(name, String(value));
  }
  return base.href;
}

// fetchFn передаётся явно, чтобы модуль можно было проверить без реальной сети.
// Возвращаемый объект: { requestJson(path, { query, signal, timeoutMs } = {}) }.
export function createApiClient({
  baseUrl,
  fetchFn = globalThis.fetch,
  timeoutMs = 2000,
} = {}) {
  try { buildUrl(baseUrl, "tasks"); } catch { throw new TypeError("Неверный baseUrl"); }
  if (typeof fetchFn !== "function" || !Number.isSafeInteger(timeoutMs) || timeoutMs <= 0) {
    throw new TypeError("Неверная конфигурация клиента");
  }
  return {
    async requestJson(path, { query, signal, timeoutMs: override } = {}) {
      const url = buildUrl(baseUrl, path, query);
      const limit = override ?? timeoutMs;
      if (!Number.isSafeInteger(limit) || limit <= 0) throw new TypeError("Неверный timeoutMs");
      const timer = AbortSignal.timeout(limit);
      const combined = signal ? AbortSignal.any([signal, timer]) : timer;
      let response;
      try {
        response = await fetchFn(url, { method: "GET", headers: { Accept: "application/json" }, signal: combined });
      } catch (cause) {
        const kind = signal?.aborted ? "aborted" : timer.aborted ? "timeout" : "network";
        const message = kind === "timeout" ? "Превышено время ожидания ответа." : kind === "aborted" ? "Запрос отменён." : "Сетевая ошибка.";
        throw new ApiError(message, { kind, url, cause });
      }
      if (!(response instanceof Response)) throw new ApiError("Ответ не является Response.", { kind: "invalid-response", url });
      if (!response.ok) {
        let payload = null;
        try { payload = await response.json(); } catch { /* Тело ошибки может не быть JSON. */ }
        const item = payload?.error;
        throw new ApiError(item?.message || `HTTP ${response.status}`, {
          kind: "http", status: response.status, code: item?.code ?? null,
          details: item?.details ?? null, url,
        });
      }
      if (response.status === 204) return null;
      if (!response.headers.get("content-type")?.toLowerCase().includes("application/json")) {
        throw new ApiError("Неверный Content-Type.", { kind: "invalid-response", url });
      }
      try { return await response.json(); }
      catch (cause) { throw new ApiError("Некорректный JSON.", { kind: "invalid-response", url, cause }); }
    },
  };
}
