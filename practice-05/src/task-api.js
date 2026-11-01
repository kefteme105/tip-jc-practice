import { ApiError } from "./api-client.js";

const ALLOWED_PRIORITIES = new Set(["low", "medium", "high"]);
const ALLOWED_FILTERS = new Set(["completed", "priority", "categoryId", "q"]);

function invalidResponse(message) {
  return new ApiError(message, { kind: "invalid-response" });
}

function isPositiveSafeInteger(value) {
  return Number.isSafeInteger(value) && value > 0;
}

function isTask(value) {
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

function isCategory(value) {
  return Boolean(
    value
    && typeof value === "object"
    && isPositiveSafeInteger(value.id)
    && typeof value.name === "string"
    && value.name.trim().length >= 1
    && value.name.trim().length <= 100,
  );
}

// client — объект, созданный createApiClient.
// Контракт результата:
// getTasks(filters) -> Promise<{ tasks, meta }>
// getTaskById(id) -> Promise<task>
// getCategories() -> Promise<category[]>
// loadInitialData(filters) -> Promise<{ tasks, categories, meta }>
export function createTaskApi(client) {
  if (!client || typeof client.requestJson !== "function") throw new TypeError("Нужен HTTP-клиент");
  const uniqueIds = (items) => new Set(items.map((item) => item.id)).size === items.length;
  const collection = (payload, validator) => {
    if (!payload || !Array.isArray(payload.data) || !payload.data.every(validator)
      || !uniqueIds(payload.data) || !payload.meta || payload.meta.total !== payload.data.length) {
      throw invalidResponse("Неверная схема коллекции.");
    }
    return payload;
  };
  const normalize = (filters) => {
    if (!filters || typeof filters !== "object" || Array.isArray(filters)) throw new TypeError("Неверные фильтры");
    const result = {};
    for (const [key, value] of Object.entries(filters)) {
      if (!ALLOWED_FILTERS.has(key)) throw new TypeError("Неизвестный фильтр");
      if (key === "completed" && typeof value !== "boolean") throw new TypeError("Неверный completed");
      if (key === "priority" && !ALLOWED_PRIORITIES.has(value)) throw new TypeError("Неверный priority");
      if (key === "categoryId" && !isPositiveSafeInteger(value)) throw new TypeError("Неверный categoryId");
      if (key === "q" && (typeof value !== "string" || value.trim().length > 100)) throw new TypeError("Неверный q");
      result[key] = key === "q" ? value.trim() : value;
    }
    return result;
  };
  const api = {
    async getTasks(filters = {}) {
      const query = normalize(filters);
      const payload = collection(await client.requestJson("/tasks", { query }), isTask);
      return { tasks: payload.data, meta: payload.meta };
    },
    async getTaskById(id) {
      if (!isPositiveSafeInteger(id)) throw new TypeError("Неверный id");
      const payload = await client.requestJson(`/tasks/${id}`);
      if (!payload || !isTask(payload.data)) throw invalidResponse("Неверная схема задачи.");
      return payload.data;
    },
    async getCategories() {
      return collection(await client.requestJson("/categories"), isCategory).data;
    },
    async loadInitialData(filters = {}) {
      const tasksPromise = api.getTasks(filters);
      const categoriesPromise = api.getCategories();
      const [taskResult, categories] = await Promise.all([tasksPromise, categoriesPromise]);
      return { tasks: taskResult.tasks, categories, meta: taskResult.meta };
    },
  };
  return api;
}
