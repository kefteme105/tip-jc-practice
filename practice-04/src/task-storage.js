export const STORAGE_VERSION = 1;
const priorities = new Set(["low", "medium", "high"]);
const copy = (tasks) => tasks.map((task) => ({ ...task }));

// Все функции принимают объект storage явно, чтобы их можно было проверить
// без обращения к глобальному window.localStorage.

export function isValidTaskList(value) {
  if (!Array.isArray(value)) return false;
  const ids = new Set();
  for (const task of value) {
    if (!task || typeof task !== "object" || !Number.isSafeInteger(task.id) || task.id <= 0
      || ids.has(task.id) || typeof task.title !== "string" || task.title.trim() !== task.title
      || task.title.length < 1 || task.title.length > 100 || typeof task.completed !== "boolean"
      || !priorities.has(task.priority)) return false;
    ids.add(task.id);
  }
  return true;
}

export function loadTasks(storage, key, fallbackTasks) {
  try {
    const raw = storage.getItem(key);
    if (raw === null) return { ok: true, source: "initial", tasks: copy(fallbackTasks) };
    const record = JSON.parse(raw);
    if (!record || record.version !== STORAGE_VERSION || !isValidTaskList(record.tasks)) {
      throw new Error("Неверная версия или схема сохранённых задач.");
    }
    return { ok: true, source: "storage", tasks: copy(record.tasks) };
  } catch (error) {
    return { ok: false, source: "fallback", tasks: copy(fallbackTasks), error: `Данные не восстановлены: ${error.message}` };
  }
}

export function saveTasks(storage, key, tasks) {
  if (!isValidTaskList(tasks)) return { ok: false, error: "Некорректный список задач." };
  try {
    storage.setItem(key, JSON.stringify({ version: STORAGE_VERSION, tasks }));
    return { ok: true };
  } catch (error) {
    return { ok: false, error: `Не удалось сохранить данные: ${error.message}` };
  }
}

export function removeSavedTasks(storage, key) {
  try { storage.removeItem(key); return { ok: true }; }
  catch (error) { return { ok: false, error: `Не удалось сбросить данные: ${error.message}` }; }
}
