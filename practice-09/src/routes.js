import { Router } from 'express';
import { ApiError } from './errors.js';
import { parsePositiveId, parseFilters, parseTaskDraft } from './validation.js';
export function createRouter(store, enableTaskCreation = false) {
  const router = Router({ caseSensitive: true });
  router.get('/health', (req, res) => res.json({ data: { status: 'ok' } }));
  router.get('/categories', (req, res) => {
    const data = store.listCategories();
    res.json({ data, meta: { total: data.length } });
  });
  router.get('/tasks', (req, res) => {
    const filters = parseFilters(new URL(req.originalUrl, 'http://localhost').searchParams);
    const data = store.listTasks(filters);
    res.json({ data, meta: { total: data.length, filters } });
  });
  router.get('/tasks/:id', (req, res) => {
    const id = parsePositiveId(req.params.id);
    if (id === null) throw new ApiError(400, 'INVALID_ID', 'Некорректный id.');
    const task = store.getTask(id);
    if (!task) throw new ApiError(404, 'TASK_NOT_FOUND', 'Задача не найдена.', { id });
    res.json({ data: task });
  });
  if (enableTaskCreation) router.post('/tasks', (req, res) => {
    const value = parseTaskDraft(req.body, store.listCategories());
    const data = store.createTask(value);
    res.status(201).location('/api/tasks/' + data.id).json({ data });
  });
  router.all(['/health', '/categories', '/tasks', '/tasks/:id'], (req, res, next) => {
    res.set('Allow', enableTaskCreation && req.path === '/tasks' ? 'GET, HEAD, OPTIONS, POST' : 'GET, HEAD, OPTIONS');
    next(new ApiError(405, 'METHOD_NOT_ALLOWED', 'Разрешены GET, HEAD и OPTIONS.'));
  });
  return router;
}
