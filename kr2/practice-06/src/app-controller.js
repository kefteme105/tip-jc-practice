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


export function createAppController({ api, view, validateDraft = validateTaskDraft } = {}) {
  if (typeof api?.loadInitialData !== "function" || typeof view?.setTasks !== "function") throw new TypeError("Неверные зависимости");
  let tasks = [], categories = [], filters = {}, editingId = null;
  let loaded = false, sequence = 0, request, pending = false, destroyed = false;
  async function refresh() {
    if (destroyed) return;
    request?.abort();
    request = new AbortController();
    const token = ++sequence;
    view.setListState("loading");
    try {
      const options = { signal: request.signal };
      const result = loaded ? await api.getTasks(filters, options)
        : await api.loadInitialData(filters, options);
      if (token !== sequence || destroyed) return;
      if (result.categories) { categories = result.categories; loaded = true; view.setCategories(categories); }
      tasks = result.tasks;
      view.setTasks(tasks, categories);
      view.setTotal(result.meta.total);
      view.setListState(tasks.length ? "ready" : "empty");
    } catch (error) {
      if (token === sequence && !destroyed && error.kind !== "aborted") view.setListState("error", messageForError(error));
    }
  }
  function cancelEdit() { editingId = null; view.setFormTask(null); view.showFormErrors({}); }
  async function mutate(action) {
    if (pending || destroyed) return;
    pending = true; view.setMutationPending(true); view.notify("");
    try {
      await action();
      cancelEdit();
      await refresh();
      view.notify("Изменения сохранены на сервере.", "success");
    } catch (error) { if (error.kind !== "aborted") view.notify(messageForError(error), "error"); }
    finally { pending = false; view.setMutationPending(false); }
  }
  async function toggleTask(id) {
    const task = tasks.find(task => task.id === id);
    if (!task) { view.notify("Задача не найдена.", "error"); return; }
    await mutate(() => api.setTaskCompleted(id, !task.completed));
  }
  return {
    start(initial = {}) { filters = { ...initial }; return refresh(); },
    applyFilters(next) { filters = { ...next }; return refresh(); },
    refresh, cancelEdit, toggleTask,
    beginEdit(id) { const task = tasks.find(task => task.id === id); if (task) { editingId = id; view.setFormTask(task); } },
    async submit(draft) {
      const checked = validateDraft(draft, categories);
      view.showFormErrors(checked.errors);
      if (!checked.valid) return;
      await mutate(() => editingId === null ? api.createTask(checked.value) : api.updateTask(editingId, checked.value));
    },
    deleteTask(id) { return mutate(() => api.deleteTask(id)); },
    resetData() { return mutate(() => api.resetDemoData()); },
    destroy() { destroyed = true; ++sequence; request?.abort(); },
  };
}
