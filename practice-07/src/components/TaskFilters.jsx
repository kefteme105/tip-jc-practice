export default function TaskFilters({ filters, categories, onChange }) {
  const change = e => onChange({ ...filters, [e.target.name]: e.target.value });
  return <section aria-label="Фильтры"><h2>Фильтры</h2>
    <div className="status-filters" aria-label="Статус задачи">
      {[['', 'Все'], ['false', 'В работе'], ['true', 'Завершенные']].map(([value, label]) =>
        <button type="button" key={value} aria-pressed={filters.completed === value}
          onClick={() => onChange({ ...filters, completed: value })}>{label}</button>)}
    </div>
    <label>Поиск <input name="q" value={filters.q} onChange={change} /></label>
    <label>Статус <select name="completed" value={filters.completed} onChange={change}>
      <option value="">Все</option><option value="false">В работе</option><option value="true">Выполнено</option></select></label>
    <label>Приоритет <select name="priority" value={filters.priority} onChange={change}>
      <option value="">Все</option><option value="low">Низкий</option><option value="medium">Средний</option><option value="high">Высокий</option></select></label>
    <label>Категория <select name="categoryId" value={filters.categoryId} onChange={change}>
      <option value="">Все</option>{categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}</select></label>
    <button type="button" onClick={() => onChange({ q: '', completed: '', priority: '', categoryId: '' })}>Сбросить фильтры</button>
  </section>;
}
