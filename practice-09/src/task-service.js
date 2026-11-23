export function selectTasks(tasks, filters) {
  const q = filters.q.toLocaleLowerCase('ru-RU');
  return tasks.filter(t => (filters.completed === null || t.completed === filters.completed)
    && (filters.priority === null || t.priority === filters.priority)
    && (filters.categoryId === null || t.categoryId === filters.categoryId)
    && (!q || t.title.toLocaleLowerCase('ru-RU').includes(q)));
}
export function findTask(tasks, id) { return tasks.find(t => t.id === id) ?? null; }
