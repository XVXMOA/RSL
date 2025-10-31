import ToDoBoard from '../components/todo/ToDoBoard.jsx';

export default function TodoPage() {
  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold">Daily Directives</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Organize your farming plans, fusion steps, and clan goals using a flexible kanban board.
        </p>
      </div>
      <ToDoBoard />
    </div>
  );
}
