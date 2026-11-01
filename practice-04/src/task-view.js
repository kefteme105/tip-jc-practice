import { getTaskStats } from "./task-service.js";

// Перенести реализацию ПР3 и расширить карточку действием edit.
// Здесь создаётся DOM, но не изменяются данные и localStorage.
export function createTaskElement(task) {
  const item = document.createElement("li");
  item.className = `task-card${task.completed ? " is-completed" : ""}`;
  item.dataset.taskId = String(task.id);
  const title = document.createElement("h3");
  title.className = "task-title";
  title.textContent = task.title;
  const status = document.createElement("div");
  status.className = "task-status";
  status.textContent = task.completed ? "Выполнена" : "В работе";
  const priority = document.createElement("div");
  priority.className = "task-priority";
  priority.textContent = { low: "Низкий", medium: "Средний", high: "Высокий" }[task.priority];
  const actions = document.createElement("div");
  actions.className = "task-actions";
  for (const [action, label] of [["toggle", "Выполнена"], ["edit", "Изменить"], ["delete", "Удалить"]]) {
    const button = document.createElement("button");
    button.type = "button";
    button.dataset.action = action;
    if (action === "toggle") button.setAttribute("aria-pressed", String(task.completed));
    const span = document.createElement("span");
    span.className = "action-label";
    span.textContent = label;
    button.append(span);
    actions.append(button);
  }
  item.append(title, status, priority, actions);
  return item;
}

export function renderTaskList(listElement, tasks) {
  listElement.replaceChildren(...tasks.map(createTaskElement));
}

export function renderSummary(summaryElement, tasks, visibleCount) {
  const stats = getTaskStats(tasks);
  for (const [name, value] of Object.entries({ ...stats, progress: `${stats.progress.toFixed(1)}%`, visible: visibleCount })) {
    summaryElement.querySelector(`[data-stat="${name}"]`).textContent = String(value);
  }
}

export function renderEmptyState(messageElement, total, visibleCount) {
  messageElement.hidden = visibleCount > 0;
  messageElement.textContent = total === 0 ? "Список задач пуст." : "Нет задач по выбранному фильтру.";
}
