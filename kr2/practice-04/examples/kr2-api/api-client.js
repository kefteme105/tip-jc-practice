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


export function buildUrl(baseUrl, path, query = {}) {
  const url = new URL(baseUrl.replace(/\/$/, "") + "/" + path.replace(/^\//, ""));
  if (!["http:", "https:"].includes(url.protocol)) throw new TypeError("Неверный URL");
  for (const [key, value] of Object.entries(query)) {
    if (value !== undefined && value !== null && value !== "") url.searchParams.set(key, String(value));
  }
  return url.href;
}
export function createApiClient({ baseUrl, fetchFn = globalThis.fetch, timeoutMs = 3000 } = {}) {
  if (typeof baseUrl !== "string" || typeof fetchFn !== "function" || !Number.isSafeInteger(timeoutMs) || timeoutMs <= 0) throw new TypeError("Неверная конфигурация");
  const configUrl = new URL(baseUrl);
  if (configUrl.username || configUrl.password || configUrl.search || configUrl.hash) throw new TypeError("Неверный адрес API");
  buildUrl(baseUrl, "");
  return { async requestJson(path, options = {}) {
    const { query, body, signal, timeoutMs: limit = timeoutMs } = options;
    const method = (options.method ?? "GET").toUpperCase();
    if (!["GET", "POST", "PATCH", "DELETE"].includes(method) || (method === "GET" && body !== undefined)) throw new TypeError("Неверный метод или тело");
    const url = buildUrl(baseUrl, path, query);
    const controller = new AbortController();
    let timedOut = false;
    const abort = () => controller.abort();
    if (signal?.aborted) abort();
    else signal?.addEventListener("abort", abort, { once: true });
    const timer = setTimeout(() => { timedOut = true; controller.abort(); }, limit);
    const headers = { Accept: "application/json" };
    if (body !== undefined) headers["Content-Type"] = "application/json";
    try {
      const response = await fetchFn(url, { method, headers, signal: controller.signal,
        ...(body === undefined ? {} : { body: JSON.stringify(body) }) });
      if (!response || typeof response.ok !== "boolean" || typeof response.json !== "function") throw new ApiError("Некорректный ответ", { kind: "invalid-response", url });
      if (!response.ok) {
        let payload;
        try { payload = await response.json(); } catch { /* HTTP-статус сохраняется */ }
        throw new ApiError(payload?.error?.message ?? `HTTP ${response.status}`, {
          kind: "http", status: response.status, code: payload?.error?.code ?? null,
          details: payload?.error?.details ?? null, url,
        });
      }
      if (response.status === 204) return null;
      if (!response.headers.get("content-type")?.includes("application/json")) {
        throw new ApiError("Ожидался JSON", { kind: "invalid-response", url });
      }
      try { return await response.json(); }
      catch (cause) { throw new ApiError("Некорректный JSON", { kind: "invalid-response", url, cause }); }
    } catch (cause) {
      if (timedOut || signal?.aborted) throw new ApiError(timedOut ? "Превышено время запроса" : "Запрос отменён", { kind: timedOut ? "timeout" : "aborted", url, cause });
      if (cause instanceof ApiError) throw cause;
      throw new ApiError("Ошибка сети", { kind: "network", url, cause });
    } finally {
      clearTimeout(timer);
      signal?.removeEventListener("abort", abort);
    }
  } };
}
