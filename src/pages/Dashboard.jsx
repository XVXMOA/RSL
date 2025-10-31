import DashboardOverview from '../components/dashboard/DashboardOverview.jsx';
import GearResourceTracker from '../components/gear/GearResourceTracker.jsx';

export default function DashboardPage() {
  return (
    <div className="space-y-10">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold">Command Center</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Stay on top of your account health, resources, and gear projects at a glance.
        </p>
      </div>
      <DashboardOverview />
      <GearResourceTracker />
    </div>
  );
}
