import TaskItem from './TaskItem.jsx';
export default function TaskList({ tasks, categories, onToggle, onEdit, onDelete }) {
  return <section aria-label="Список задач"><h2>Задачи ({tasks.length})</h2>
    {!tasks.length ? <p>По выбранным условиям задач нет.</p> : <ul>{tasks.map(task =>
      <TaskItem key={task.id} task={task} categoryName={categories.find(c => c.id === task.categoryId)?.name ?? 'Без категории'}
        onToggle={onToggle} onEdit={onEdit} onDelete={onDelete} />)}</ul>}</section>;
}
