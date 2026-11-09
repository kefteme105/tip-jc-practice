import { ApiError } from "./api-client.js";

const ALLOWED_PRIORITIES = new Set(["low", "medium", "high"]);
const ALLOWED_FILTERS = new Set(["completed", "priority", "categoryId", "q"]);

function invalidResponse(message) {
  return new ApiError(message, { kind: "invalid-response" });
}

function isPositiveSafeInteger(value) {
  return Number.isSafeInteger(value) && value > 0;
}

export function isTask(value) {
  return Boolean(
    value
    && typeof value === "object"
    && isPositiveSafeInteger(value.id)
    && typeof value.title === "string"
    && value.title.trim().length >= 1
    && value.title.trim().length <= 100
    && typeof value.completed === "boolean"
    && ALLOWED_PRIORITIES.has(value.priority)
    && isPositiveSafeInteger(value.categoryId),
  );
}

export function isCategory(value) {
  return Boolean(
    value
    && typeof value === "object"
    && isPositiveSafeInteger(value.id)
    && typeof value.name === "string"
    && value.name.trim().length >= 1
    && value.name.trim().length <= 100,
  );
}


export function createTaskApi(client) {
  if (typeof client?.requestJson !== "function") throw new TypeError("Нужен HTTP-клиент");
  function normalize(filters) {
    if (!filters || typeof filters !== "object" || Array.isArray(filters)) throw new TypeError("Неверные фильтры");
    const query = {};
    for (const [key, value] of Object.entries(filters)) {
      if (!ALLOWED_FILTERS.has(key)) throw new TypeError("Неизвестный фильтр");
      if (value === undefined || value === null || value === "") continue;
      if (key === "completed" && typeof value !== "boolean") throw new TypeError("Неверный статус");
      if (key === "priority" && !ALLOWED_PRIORITIES.has(value)) throw new TypeError("Неверный приоритет");
      if (key === "categoryId" && !isPositiveSafeInteger(value)) throw new TypeError("Неверная категория");
      if (key === "q" && (typeof value !== "string" || value.trim().length > 100)) throw new TypeError("Неверный поиск");
      if (key !== "q" || value.trim()) query[key] = key === "q" ? value.trim() : value;
    }
    return query;
  }
  function list(data, valid) {
    if (!Array.isArray(data) || !data.every(valid) || new Set(data.map(x => x.id)).size !== data.length) throw invalidResponse("Неверный список");
    return data;
  }
  const idPath = id => {
    if (!isPositiveSafeInteger(id)) throw new TypeError("Неверный id");
    return `/tasks/${id}`;
  };
  async function taskRequest(path, options) {
    const result = await client.requestJson(path, options);
    if (!isTask(result?.data)) throw invalidResponse("Неверная задача");
    return result.data;
  }
  const api = {
    async getTasks(filters = {}, { signal } = {}) {
      const query = normalize(filters);
      const result = await client.requestJson("/tasks", { query, ...(signal ? { signal } : {}) });
      const tasks = list(result?.data, isTask);
      if (!Number.isSafeInteger(result?.meta?.total) || result.meta.total !== tasks.length) throw invalidResponse("Неверное total");
      return { tasks, meta: result.meta };
    },
    async getTaskById(id, { signal } = {}) { return taskRequest(idPath(id), signal ? { signal } : undefined); },
    async getCategories({ signal } = {}) {
      const result = await client.requestJson("/categories", signal ? { signal } : undefined);
      return list(result?.data, isCategory);
    },
    async loadInitialData(filters = {}, options = {}) {
      const [result, categories] = await Promise.all([api.getTasks(filters, options), api.getCategories(options)]);
      return { ...result, categories };
    },
    async createTask(draft, { signal } = {}) { return taskRequest("/tasks", { method: "POST", body: draft, signal }); },
    async updateTask(id, changes, { signal } = {}) { return taskRequest(idPath(id), { method: "PATCH", body: changes, signal }); },
    async setTaskCompleted(id, completed, options = {}) {
      if (typeof completed !== "boolean") throw new TypeError("Неверный статус");
      return api.updateTask(id, { completed }, options);
    },
    async deleteTask(id, { signal } = {}) {
      const result = await client.requestJson(idPath(id), { method: "DELETE", signal });
      if (result !== null) throw invalidResponse("Ожидался пустой ответ");
      return null;
    },
    async resetDemoData({ signal } = {}) {
      const result = await client.requestJson("/debug/reset", { method: "POST", signal });
      if (result?.data?.reset !== true || !Number.isSafeInteger(result.data.total)) throw invalidResponse("Нет подтверждения сброса");
      return result.data;
    },
  };
  return api;
}
