import { ApiError } from './errors.js';
export function parsePositiveId(raw) {
  if (typeof raw !== 'string' || !/^[1-9]\d*$/.test(raw)) return null;
  const value = Number(raw);
  return Number.isSafeInteger(value) ? value : null;
}
export function parseFilters(searchParams) {
  const allowed = ['completed', 'priority', 'categoryId', 'q'];
  const invalid = () => { throw new ApiError(400, 'INVALID_QUERY', 'Недопустимые параметры фильтрации.'); };
  for (const key of searchParams.keys()) if (!allowed.includes(key) || searchParams.getAll(key).length !== 1) invalid();
  const result = { completed: null, priority: null, categoryId: null, q: '' };
  if (searchParams.has('completed')) {
    const raw = searchParams.get('completed');
    if (raw !== 'true' && raw !== 'false') invalid();
    result.completed = raw === 'true';
  }
  if (searchParams.has('priority')) {
    const raw = searchParams.get('priority');
    if (!['low', 'medium', 'high'].includes(raw)) invalid();
    result.priority = raw;
  }
  if (searchParams.has('categoryId')) {
    result.categoryId = parsePositiveId(searchParams.get('categoryId'));
    if (result.categoryId === null) invalid();
  }
  if (searchParams.has('q')) {
    result.q = searchParams.get('q').trim();
    if (result.q.length > 100) invalid();
  }
  return result;
}
