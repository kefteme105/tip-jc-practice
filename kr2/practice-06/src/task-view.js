export function createTaskElement(task, category) {
  const item = document.createElement("li");
  item.className = "task-card";
  item.dataset.taskId = String(task.id);
  if (task.completed) item.classList.add("is-completed");
  const title = document.createElement("h3");
  title.className = "task-title"; title.textContent = task.title;
  const details = document.createElement("p");
  details.textContent = `№ ${task.id} · ${task.completed ? "Выполнена" : "В работе"} · ${task.priority} · ${category?.name ?? ""}`;
  const actions = document.createElement("div"); actions.className = "task-actions";
  for (const [action, label] of [["toggle", task.completed ? "Вернуть в работу" : "Выполнить"], ["edit", "Изменить"], ["delete", "Удалить"]]) {
    const button = document.createElement("button"); button.type = "button"; button.dataset.action = action;
    const span = document.createElement("span"); span.className = "action-label"; span.textContent = label;
    button.append(span); actions.append(button);
  }
  item.append(title, details, actions); return item;
}
export function renderTaskList(list, tasks, categories) {
  list.replaceChildren(...tasks.map(task => createTaskElement(task, categories.find(c => c.id === task.categoryId))));
}
