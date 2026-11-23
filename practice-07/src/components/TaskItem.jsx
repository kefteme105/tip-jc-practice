const priorities = { low: 'Низкий', medium: 'Средний', high: 'Высокий' };
export default function TaskItem({ task, categoryName, onToggle, onEdit, onDelete }) {
  return <li><strong>{task.title}</strong>
    <p>№ {task.id} · {categoryName} · {priorities[task.priority]} · {task.completed ? 'Выполнено' : 'В работе'}</p>
    <div className="actions">
      <button type="button" onClick={() => onToggle(task.id)}>{task.completed ? 'Вернуть в работу' : 'Выполнить'}</button>
      <button type="button" onClick={() => onEdit(task.id)}>Редактировать</button>
      <button type="button" onClick={() => onDelete(task.id)}>Удалить</button>
    </div></li>;
}
