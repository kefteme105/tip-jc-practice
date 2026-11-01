const ALLOWED_PRIORITIES = new Set(["low", "medium", "high"]);

// Чистая проверка данных формы. DOM и показ сообщений выполняются в main.js.
// draft: { id, title, priority }; editingId: null либо id редактируемой задачи.
export function validateTaskDraft(draft, tasks, editingId = null) {
  const errors = {};
  const id = editingId === null ? Number(draft.id) : editingId;
  if (editingId === null) {
    if (draft.id === "" || !Number.isSafeInteger(id) || id <= 0) errors.id = "Введите положительный целый id.";
    else if (tasks.some((task) => task.id === id)) errors.id = "Такой id уже существует.";
  } else if (!Number.isSafeInteger(id) || id <= 0 || !tasks.some((task) => task.id === id)) {
    errors.id = "Задача для редактирования не найдена.";
  }
  const title = typeof draft.title === "string" ? draft.title.trim() : "";
  if (typeof draft.title !== "string" || title.length < 1 || title.length > 100) {
    errors.title = "Название должно содержать от 1 до 100 символов после trim().";
  }
  if (!ALLOWED_PRIORITIES.has(draft.priority)) errors.priority = "Выберите допустимый приоритет.";
  return Object.keys(errors).length ? { ok: false, errors } : { ok: true, value: { id, title, priority: draft.priority } };
}
