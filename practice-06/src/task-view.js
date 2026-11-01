const PRIORITY_LABELS = Object.freeze({
  low: "Низкий",
  medium: "Средний",
  high: "Высокий",
});

export function createTaskElement(task, category) {
  const item = document.createElement("li");
  item.className = `task-card${task.completed ? " is-completed" : ""}`;
  item.dataset.taskId = String(task.id);
  const heading = document.createElement("strong");
  heading.className = "task-title";
  heading.textContent = task.title;
  const info = document.createElement("p");
  info.className = "task-meta";
  const label = document.createElement("span");
  label.className = "task-category";
  label.textContent = category?.name ?? "Неизвестная категория";
  const priority = document.createElement("span");
  priority.className = "task-priority";
  priority.textContent = PRIORITY_LABELS[task.priority];
  info.append(label, priority);
  const actions = document.createElement("div");
  actions.className = "task-actions";
  for (const [action, text] of [["toggle", task.completed ? "Вернуть" : "Выполнить"], ["edit", "Изменить"], ["delete", "Удалить"]]) {
    const button = document.createElement("button");
    button.type = "button";
    button.dataset.action = action;
    const span = document.createElement("span");
    span.className = "action-label";
    span.textContent = text;
    button.append(span);
    actions.append(button);
  }
  item.append(heading, info, actions);
  return item;
}

export function renderTaskList(list, tasks, categories) {
  const byId = new Map(categories.map((category) => [category.id, category]));
  list.replaceChildren(...tasks.map((task) => createTaskElement(task, byId.get(task.categoryId))));
}
