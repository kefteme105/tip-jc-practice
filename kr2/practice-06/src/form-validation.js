export function validateTaskDraft(draft, categories) {
  const errors = {};
  const title = typeof draft.title === "string" ? draft.title.trim() : "";
  if (!title || title.length > 100) errors.title = "Название от 1 до 100 символов.";
  const priority = draft.priority;
  if (!["low", "medium", "high"].includes(priority)) errors.priority = "Неверный приоритет.";
  const categoryId = Number(draft.categoryId);
  if (!Number.isSafeInteger(categoryId) || !categories.some(x => x.id === categoryId)) errors.categoryId = "Выберите категорию.";
  return { valid: !Object.keys(errors).length, value: { title, priority, categoryId }, errors };
}
