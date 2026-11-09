export const STORAGE_VERSION = 1;
const copy = tasks => tasks.map(task => ({ ...task }));
export function isValidTaskList(value) {
  return Array.isArray(value) && value.every(task => task &&
    Number.isSafeInteger(task.id) && task.id > 0 &&
    typeof task.title === "string" && task.title.trim().length >= 1 &&
    task.title.trim().length <= 100 && typeof task.completed === "boolean" &&
    ["low", "medium", "high"].includes(task.priority)) &&
    new Set(value.map(task => task.id)).size === value.length;
}
export function loadTasks(storage, key, fallbackTasks) {
  try {
    const raw = storage.getItem(key);
    if (raw === null) return { ok: true, source: "initial", tasks: copy(fallbackTasks) };
    const data = JSON.parse(raw);
    if (data?.version !== STORAGE_VERSION || !isValidTaskList(data.tasks)) {
      throw new Error("Некорректная версия или структура данных");
    }
    return { ok: true, source: "storage", tasks: copy(data.tasks) };
  } catch (error) {
    return { ok: false, source: "fallback", tasks: copy(fallbackTasks),
      error: `Не удалось восстановить задачи: ${error.message}` };
  }
}
export function saveTasks(storage, key, tasks) {
  try {
    if (!isValidTaskList(tasks)) throw new Error("Некорректный список задач");
    storage.setItem(key, JSON.stringify({ version: STORAGE_VERSION, tasks }));
    return { ok: true };
  } catch (error) {
    return { ok: false, error: `Не удалось сохранить задачи: ${error.message}` };
  }
}
export function removeSavedTasks(storage, key) {
  try { storage.removeItem(key); return { ok: true }; }
  catch (error) { return { ok: false, error: `Ошибка удаления: ${error.message}` }; }
}
