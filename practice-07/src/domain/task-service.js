export function validateTaskDraft(draft, categories) {
  const title = typeof draft.title === 'string' ? draft.title.trim() : '';
  const categoryId = Number(draft.categoryId);
  const errors = {};
  if (!title || title.length > 100) errors.title = 'Введите название от 1 до 100 символов.';
  if (!['low', 'medium', 'high'].includes(draft.priority)) errors.priority = 'Выберите приоритет.';
  if (!Number.isInteger(categoryId) || !categories.some(c => c.id === categoryId)) errors.categoryId = 'Выберите существующую категорию.';
  return { valid: !Object.keys(errors).length, value: { title, priority: draft.priority, categoryId }, errors };
}
export function selectTasks(tasks, filters) {
  const q = filters.q.trim().toLocaleLowerCase('ru-RU');
  return tasks.filter(t => (!q || t.title.toLocaleLowerCase('ru-RU').includes(q))
    && (filters.completed === '' || t.completed === (filters.completed === 'true'))
    && (!filters.priority || t.priority === filters.priority)
    && (!filters.categoryId || t.categoryId === Number(filters.categoryId)));
}
export function getTaskStats(tasks) {
  const completed = tasks.filter(t => t.completed).length;
  return { total: tasks.length, completed, active: tasks.length - completed };
}
export function addTask(tasks, value, id) {
  if (!Number.isSafeInteger(id) || id <= 0 || tasks.some(t => t.id === id)) throw new Error('Некорректный или повторяющийся id.');
  return [...tasks, { id, title: value.title, priority: value.priority, categoryId: value.categoryId, completed: false }];
}
export function updateTask(tasks, id, value) {
  return tasks.map(t => t.id === id ? { ...t, title: value.title, priority: value.priority, categoryId: value.categoryId } : t);
}
export function toggleTask(tasks, id) {
  return tasks.map(t => t.id === id ? { ...t, completed: !t.completed } : t);
}
export function removeTask(tasks, id) {
  return tasks.filter(t => t.id !== id);
}
