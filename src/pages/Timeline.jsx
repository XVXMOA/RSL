import GoalTimeline from '../components/timeline/GoalTimeline.jsx';

export default function TimelinePage() {
  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold">Progress Roadmap</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Lay out the legendary milestones you want to conquer and track your climb.
        </p>
      </div>
      <GoalTimeline />
    </div>
  );
}
