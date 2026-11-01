const ALLOWED_PRIORITIES = new Set(["low", "medium", "high"]);

// Возвращает { valid, value, errors }.
// value содержит нормализованные title, priority и числовой categoryId.
export function validateTaskDraft(draft, categories) {
  const errors = {};
  const title = typeof draft?.title === "string" ? draft.title.trim() : "";
  const priority = draft?.priority;
  const categoryId = Number(draft?.categoryId);
  if (!title || title.length > 100) errors.title = "Введите название от 1 до 100 символов.";
  if (!ALLOWED_PRIORITIES.has(priority)) errors.priority = "Выберите приоритет.";
  if (!Number.isSafeInteger(categoryId) || categoryId <= 0 || !Array.isArray(categories)
    || !categories.some((item) => item.id === categoryId)) errors.categoryId = "Выберите категорию.";
  return { valid: Object.keys(errors).length === 0, value: { title, priority, categoryId }, errors };
}
