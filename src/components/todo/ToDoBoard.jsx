import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { useRSLStore } from '../../store/useRSLStore.js';

const columns = [
  { key: 'todo', label: 'To Do' },
  { key: 'in-progress', label: 'In Progress' },
  { key: 'complete', label: 'Complete' }
];

const initialTask = {
  title: '',
  description: '',
  priority: 'Medium',
  dueDate: ''
};

export default function ToDoBoard() {
  const tasks = useRSLStore((state) => state.tasks);
  const addTask = useRSLStore((state) => state.addTask);
  const updateTask = useRSLStore((state) => state.updateTask);
  const deleteTask = useRSLStore((state) => state.deleteTask);
  const moveTask = useRSLStore((state) => state.moveTask);

  const [taskForm, setTaskForm] = useState(initialTask);
  const [draggingId, setDraggingId] = useState(null);

  // Build simple lookups for each column so the UI can render quickly even when
  // the underlying task array grows large.
  const tasksByStatus = useMemo(() => {
    const grouped = {
      todo: [],
      'in-progress': [],
      complete: []
    };
    tasks.forEach((task) => {
      grouped[task.status]?.push(task);
    });
    return grouped;
  }, [tasks]);

  const handleSubmit = (event) => {
    event.preventDefault();
    if (!taskForm.title.trim()) return;
    addTask(taskForm);
    setTaskForm(initialTask);
  };

  // When a card finishes dragging, look for the lane underneath the pointer and
  // move the task into that status. Framer Motion handles the animation for us.
  const handleDragEnd = (event, info, taskId) => {
    setDraggingId(null);
    const point = {
      x: info.point.x,
      y: info.point.y
    };
    const element = document.elementFromPoint(point.x, point.y);
    const targetColumn = element?.closest('[data-column]')?.getAttribute('data-column');
    if (targetColumn && columns.some((column) => column.key === targetColumn)) {
      moveTask(taskId, targetColumn);
    }
  };

  return (
    <div className="space-y-6">
      <motion.form
        layout
        onSubmit={handleSubmit}
        className="grid gap-4 rounded-2xl border border-slate-200 bg-white/70 p-6 shadow-sm backdrop-blur md:grid-cols-5 dark:border-slate-800 dark:bg-slate-900/60"
      >
        <div className="md:col-span-2 space-y-2">
          <label className="text-sm font-medium text-slate-600 dark:text-slate-300">Title</label>
          <input
            value={taskForm.title}
            onChange={(event) => setTaskForm((prev) => ({ ...prev, title: event.target.value }))}
            className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 dark:border-slate-700 dark:bg-slate-900"
            placeholder="Example: Finish Doom Tower rotation"
          />
        </div>
        <div className="md:col-span-2 space-y-2">
          <label className="text-sm font-medium text-slate-600 dark:text-slate-300">Description</label>
          <input
            value={taskForm.description}
            onChange={(event) =>
              setTaskForm((prev) => ({ ...prev, description: event.target.value }))
            }
            className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 dark:border-slate-700 dark:bg-slate-900"
            placeholder="Add optional details or links"
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-600 dark:text-slate-300">Priority</label>
          <select
            value={taskForm.priority}
            onChange={(event) => setTaskForm((prev) => ({ ...prev, priority: event.target.value }))}
            className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 dark:border-slate-700 dark:bg-slate-900"
          >
            {['Low', 'Medium', 'High'].map((priority) => (
              <option key={priority} value={priority}>
                {priority}
              </option>
            ))}
          </select>
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-600 dark:text-slate-300">Due Date</label>
          <input
            type="date"
            value={taskForm.dueDate}
            onChange={(event) => setTaskForm((prev) => ({ ...prev, dueDate: event.target.value }))}
            className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 dark:border-slate-700 dark:bg-slate-900"
          />
        </div>
        <button
          type="submit"
          className="md:col-span-5 rounded-xl bg-primary px-6 py-3 font-semibold text-white shadow-lg shadow-primary/30 hover:bg-primary/90"
        >
          Add Task
        </button>
      </motion.form>
      <div className="grid gap-6 md:grid-cols-3">
        {columns.map((column) => (
          <motion.section
            key={column.key}
            data-column={column.key}
            layout
            className="flex min-h-[420px] flex-col gap-4 rounded-2xl border border-slate-200 bg-white/70 p-4 shadow-sm backdrop-blur dark:border-slate-800 dark:bg-slate-900/60"
          >
            <header className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">{column.label}</h3>
              <span className="rounded-full bg-slate-200 px-3 py-1 text-xs font-semibold text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                {tasksByStatus[column.key]?.length ?? 0}
              </span>
            </header>
            <div className="flex flex-1 flex-col gap-3">
              {tasksByStatus[column.key]?.map((task) => (
                <motion.article
                  key={task.id}
                  layout
                  drag
                  dragSnapToOrigin
                  dragMomentum={false}
                  onDragStart={() => setDraggingId(task.id)}
                  onDragEnd={(event, info) => handleDragEnd(event, info, task.id)}
                  className={`group cursor-grab rounded-xl border border-slate-200 bg-white p-4 text-sm shadow-md transition hover:shadow-lg active:cursor-grabbing dark:border-slate-700 dark:bg-slate-950 ${
                    draggingId === task.id ? 'ring-2 ring-primary/70' : ''
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="text-base font-semibold">{task.title}</h4>
                      <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                        {task.description || 'No description provided.'}
                      </p>
                    </div>
                    <span
                      className={`rounded-full px-2 py-1 text-xs font-semibold ${
                        task.priority === 'High'
                          ? 'bg-rose-200 text-rose-700 dark:bg-rose-500/40 dark:text-rose-100'
                          : task.priority === 'Medium'
                          ? 'bg-amber-200 text-amber-700 dark:bg-amber-500/40 dark:text-amber-100'
                          : 'bg-emerald-200 text-emerald-700 dark:bg-emerald-500/40 dark:text-emerald-100'
                      }`}
                    >
                      {task.priority}
                    </span>
                  </div>
                  <div className="mt-3 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                    <span>Due {task.dueDate || '—'}</span>
                    <div className="hidden gap-2 group-hover:flex">
                      <button
                        type="button"
                        onClick={() => updateTask(task.id, { status: column.key })}
                        className="rounded-lg border border-slate-300 px-2 py-1 font-semibold dark:border-slate-700"
                      >
                        Stay
                      </button>
                      <button
                        type="button"
                        onClick={() => deleteTask(task.id)}
                        className="rounded-lg bg-rose-500 px-2 py-1 font-semibold text-white"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </motion.article>
              ))}
              {tasksByStatus[column.key]?.length === 0 && (
                <div className="flex flex-1 items-center justify-center rounded-xl border border-dashed border-slate-200 p-4 text-sm text-slate-400 dark:border-slate-700 dark:text-slate-500">
                  Drag cards here to populate this lane.
                </div>
              )}
            </div>
          </motion.section>
        ))}
      </div>
    </div>
  );
}
