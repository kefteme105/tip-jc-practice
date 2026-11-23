import { useState } from 'react';
import { validateTaskDraft } from '../domain/task-service.js';
export default function TaskForm({ categories, initialTask = null, onSave, onCancel }) {
  const empty = () => ({ title: '', priority: 'medium', categoryId: String(categories[0]?.id ?? '') });
  const [draft, setDraft] = useState(() => initialTask
    ? { title: initialTask.title, priority: initialTask.priority, categoryId: String(initialTask.categoryId) } : empty());
  const [errors, setErrors] = useState({});
  const [notice, setNotice] = useState('');
  const change = e => setDraft(prev => ({ ...prev, [e.target.name]: e.target.value }));
  function submit(e) {
    e.preventDefault();
    const result = validateTaskDraft(draft, categories);
    setErrors(result.errors); setNotice('');
    if (!result.valid) return;
    if (onSave(result.value) === true) { setDraft(empty()); setNotice('Сохранено.'); }
    else setNotice('Не удалось сохранить. Черновик сохранён в форме.');
  }
  return <section aria-label="Форма задачи"><h2>{initialTask ? 'Редактирование задачи' : 'Новая задача'}</h2>
    <form onSubmit={submit} noValidate>
      <label>Название <input name="title" value={draft.title} onChange={change} aria-invalid={!!errors.title} /></label>
      {errors.title && <p role="alert">{errors.title}</p>}
      <label>Приоритет <select name="priority" value={draft.priority} onChange={change}>
        <option value="low">Низкий</option><option value="medium">Средний</option><option value="high">Высокий</option></select></label>
      {errors.priority && <p role="alert">{errors.priority}</p>}
      <label>Категория <select name="categoryId" value={draft.categoryId} onChange={change}>
        {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}</select></label>
      {errors.categoryId && <p role="alert">{errors.categoryId}</p>}
      <button type="submit">Сохранить</button>{initialTask && <button type="button" onClick={onCancel}>Отмена</button>}
      <p role="status">{notice}</p>
    </form></section>;
}
