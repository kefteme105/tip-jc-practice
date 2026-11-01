const validId = (id) => Number.isSafeInteger(id) && id > 0;
const validTitle = (title) => typeof title === "string" && title.trim().length >= 1 && title.trim().length <= 100;
const validPriority = (priority) => ["low", "medium", "high"].includes(priority);
const failure = (error) => ({ ok: false, error });

export function createTask(id, title, priority = "medium") {
  if (!validId(id)) return failure("Некорректный id");
  if (!validTitle(title)) return failure("Некорректное название");
  if (!validPriority(priority)) return failure("Некорректный приоритет");
  return { ok: true, task: { id, title: title.trim(), completed: false, priority } };
}

export function findTaskById(tasks, id) {
  return tasks.find((task) => task.id === id);
}

export function getPendingTasks(tasks) {
  return tasks.filter((task) => task.completed === false);
}

export function getTaskTitles(tasks) {
  return tasks.map((task) => task.title);
}

export function getTaskStats(tasks) {
  const total = tasks.length;
  const completed = tasks.filter((task) => task.completed === true).length;
  return { total, completed, pending: total - completed, progress: total ? completed / total * 100 : 0 };
}

export function addTask(tasks, id, title, priority = "medium") {
  const result = createTask(id, title, priority);
  if (!result.ok) return result;
  if (findTaskById(tasks, id)) return failure("Задача с таким id уже существует");
  return { ok: true, tasks: [...tasks, result.task] };
}

export function setTaskCompleted(tasks, id, completed) {
  if (!validId(id) || typeof completed !== "boolean") return failure("Некорректные аргументы");
  if (!findTaskById(tasks, id)) return failure("Задача не найдена");
  return { ok: true, tasks: tasks.map((task) => task.id === id ? { ...task, completed } : task) };
}

export function renameTask(tasks, id, title) {
  if (!validId(id) || !validTitle(title)) return failure("Некорректные аргументы");
  if (!findTaskById(tasks, id)) return failure("Задача не найдена");
  return { ok: true, tasks: tasks.map((task) => task.id === id ? { ...task, title: title.trim() } : task) };
}

export function removeTask(tasks, id) {
  if (!validId(id) || !findTaskById(tasks, id)) return failure("Задача не найдена");
  return { ok: true, tasks: tasks.filter((task) => task.id !== id) };
}

export function updateTask(tasks, id, title, priority) {
  if (!validId(id) || !findTaskById(tasks, id)) return failure("Задача не найдена");
  if (!validTitle(title) || !validPriority(priority)) return failure("Некорректные поля задачи");
  return { ok: true, tasks: tasks.map((task) => task.id === id
    ? { ...task, title: title.trim(), priority }
    : task) };
}
