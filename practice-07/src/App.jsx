import { useState } from 'react';
import { tasks as initialTasks, categories } from './data.js';
import { createInitialFilters } from './variant.js';
import { selectTasks, getTaskStats, addTask, updateTask, toggleTask, removeTask } from './domain/task-service.js';
import TaskForm from './components/TaskForm.jsx';
import TaskFilters from './components/TaskFilters.jsx';
import TaskList from './components/TaskList.jsx';
import TaskStats from './components/TaskStats.jsx';

export default function App() {
  const [tasks, setTasks] = useState(() => initialTasks.map(task => ({ ...task })));
  const [filters, setFilters] = useState(createInitialFilters);
  const [editingId, setEditingId] = useState(null);
  const visibleTasks = selectTasks(tasks, filters);
  const stats = getTaskStats(tasks);
  const editingTask = tasks.find(t => t.id === editingId) ?? null;
  function save(value) {
    if (editingId !== null) {
      if (!tasks.some(t => t.id === editingId)) return false;
      setTasks(previous => updateTask(previous, editingId, value));
      setEditingId(null);
    } else {
      // Чистое вычисление по актуальному массиву безопасно при повторе StrictMode.
      setTasks(previous => addTask(previous, value, Math.max(0, ...previous.map(t => t.id)) + 1));
    }
    return true;
  }
  function remove(id) {
    const task = tasks.find(t => t.id === id);
    if (!task || !window.confirm('Удалить «' + task.title + '»?')) return;
    setTasks(previous => removeTask(previous, id));
    if (editingId === id) setEditingId(null);
  }
  return <main><h1>Задачи на React — КР3, ПР7</h1>
    <p>Хамидов Дамир Маъруфович · ЭФБО-17-25 · Вариант 8</p>
    <p>Данные в памяти. Обновление страницы восстанавливает исходный набор.</p>
    <TaskStats stats={stats} />
    <TaskFilters filters={filters} categories={categories} onChange={setFilters} />
    <TaskForm key={editingId ?? 'new'} categories={categories} initialTask={editingTask} onSave={save} onCancel={() => setEditingId(null)} />
    <TaskList tasks={visibleTasks} categories={categories} onToggle={id => setTasks(previous => toggleTask(previous, id))} onEdit={setEditingId} onDelete={remove} />
  </main>;
}
