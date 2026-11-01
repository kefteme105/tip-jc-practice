import { ApiError } from "./api-client.js";
import { validateTaskDraft } from "./form-validation.js";

export function messageForError(error) {
  if (!(error instanceof ApiError)) return "Не удалось выполнить операцию.";
  if (error.kind === "timeout") return "Сервер не ответил вовремя. Попробуйте ещё раз.";
  if (error.kind === "network") return "Нет соединения с учебным API. Проверьте, запущен ли npm start.";
  if (error.kind === "invalid-response") return "Сервер вернул ответ неожиданного формата.";
  if (error.kind === "http" && error.status === 404) return "Запись уже отсутствует на сервере. Обновите список.";
  if (error.kind === "http") return error.message || `Сервер вернул ошибку ${error.status}.`;
  return "Не удалось выполнить операцию.";
}

// view — адаптер из dom-app.js. Контроллер не должен обращаться к document.
// Обязательные методы результата:
// start, applyFilters, refresh, submit, beginEdit, cancelEdit,
// toggleTask, deleteTask, resetData и destroy.
export function createAppController({ api, view, validateDraft = validateTaskDraft } = {}) {
  if (!api || !view || typeof validateDraft !== "function"
    || ["loadInitialData", "getTasks", "createTask", "updateTask", "setTaskCompleted", "deleteTask", "resetDemoData"].some((name) => typeof api[name] !== "function")
    || ["setListState", "setTasks", "setCategories", "setTotal", "setFormTask", "showFormErrors", "setMutationPending", "notify"].some((name) => typeof view[name] !== "function")) {
    throw new TypeError("Неверные зависимости контроллера");
  }
  let tasks = [];
  let categories = null;
  let filters = {};
  let editingId = null;
  let currentLoad = null;
  let generation = 0;
  let destroyed = false;

  async function load() {
    currentLoad?.abort();
    const controller = new AbortController();
    currentLoad = controller;
    const request = ++generation;
    view.setListState("loading");
    try {
      const result = categories
        ? await api.getTasks(filters, { signal: controller.signal })
        : await api.loadInitialData(filters, { signal: controller.signal });
      if (destroyed || request !== generation || controller.signal.aborted) return;
      if (!categories) {
        categories = result.categories;
        view.setCategories(categories);
      }
      tasks = result.tasks;
      view.setTasks(tasks, categories);
      view.setTotal(result.meta.total);
      view.setListState(tasks.length ? "ready" : "empty");
    } catch (error) {
      if (destroyed || request !== generation || controller.signal.aborted || (error instanceof ApiError && error.kind === "aborted")) return;
      view.setListState("error", messageForError(error));
    }
  }

  async function mutate(operation, success, clearForm = false) {
    view.setMutationPending(true);
    view.notify("");
    try {
      await operation();
      if (clearForm) {
        editingId = null;
        view.setFormTask(null);
        view.showFormErrors({});
      }
      await load();
      view.notify(success, "success");
    } catch (error) {
      if (!(error instanceof ApiError && error.kind === "aborted")) view.notify(messageForError(error), "error");
    } finally {
      view.setMutationPending(false);
    }
  }

  return {
    start(initialFilters = {}) { filters = { ...initialFilters }; return load(); },
    applyFilters(nextFilters = {}) { filters = { ...nextFilters }; return load(); },
    refresh() { return load(); },
    async submit(draft) {
      const result = validateDraft(draft, categories ?? []);
      view.showFormErrors(result.errors);
      if (!result.valid) return;
      const id = editingId;
      return mutate(() => id === null ? api.createTask(result.value) : api.updateTask(id, result.value),
        id === null ? "Задача добавлена." : "Изменения сохранены.", true);
    },
    beginEdit(id) {
      const task = tasks.find((item) => item.id === id);
      if (!task) return;
      editingId = id;
      view.setFormTask(task);
      view.showFormErrors({});
    },
    cancelEdit() { editingId = null; view.setFormTask(null); view.showFormErrors({}); },
    toggleTask(id) {
      const task = tasks.find((item) => item.id === id);
      if (!task) return;
      return mutate(() => api.setTaskCompleted(id, !task.completed), "Статус задачи изменён.");
    },
    deleteTask(id) { return mutate(() => api.deleteTask(id), "Задача удалена."); },
    resetData() { return mutate(() => api.resetDemoData(), "Исходные данные восстановлены."); },
    destroy() { destroyed = true; currentLoad?.abort(); generation += 1; },
  };
}
