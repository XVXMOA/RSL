import { useState } from 'react';
import { motion } from 'framer-motion';
import { useRSLStore } from '../../store/useRSLStore.js';

// Form defaults for creating milestones so inputs remain controlled.
const initialMilestone = {
  name: '',
  description: '',
  targetDate: '',
  progress: 0
};

export default function GoalTimeline() {
  const milestones = useRSLStore((state) => state.milestones);
  const addMilestone = useRSLStore((state) => state.addMilestone);
  const updateMilestone = useRSLStore((state) => state.updateMilestone);
  const deleteMilestone = useRSLStore((state) => state.deleteMilestone);

  const [form, setForm] = useState(initialMilestone);

  // Basic client-side validation keeps the experience smooth while still allowing
  // optional fields to remain blank.
  const handleSubmit = (event) => {
    event.preventDefault();
    if (!form.name.trim()) return;
    addMilestone({ ...form, progress: Number(form.progress) });
    setForm(initialMilestone);
  };

  return (
    <div className="space-y-6">
      <motion.form
        layout
        onSubmit={handleSubmit}
        className="grid gap-4 rounded-2xl border border-slate-200 bg-white/70 p-6 shadow-sm backdrop-blur md:grid-cols-4 dark:border-slate-800 dark:bg-slate-900/60"
      >
        <div className="space-y-2 md:col-span-2">
          <label className="text-sm font-semibold text-slate-600 dark:text-slate-300">Milestone Name</label>
          <input
            value={form.name}
            onChange={(event) => setForm((prev) => ({ ...prev, name: event.target.value }))}
            className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 dark:border-slate-700 dark:bg-slate-900"
            placeholder="Example: Complete Hard Doom Tower"
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-semibold text-slate-600 dark:text-slate-300">Target Date</label>
          <input
            type="date"
            value={form.targetDate}
            onChange={(event) => setForm((prev) => ({ ...prev, targetDate: event.target.value }))}
            className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 dark:border-slate-700 dark:bg-slate-900"
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-semibold text-slate-600 dark:text-slate-300">Progress %</label>
          <input
            type="number"
            min="0"
            max="100"
            value={form.progress}
            onChange={(event) => setForm((prev) => ({ ...prev, progress: event.target.value }))}
            className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 dark:border-slate-700 dark:bg-slate-900"
          />
        </div>
        <div className="md:col-span-4 space-y-2">
          <label className="text-sm font-semibold text-slate-600 dark:text-slate-300">Details</label>
          <textarea
            value={form.description}
            onChange={(event) => setForm((prev) => ({ ...prev, description: event.target.value }))}
            className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 dark:border-slate-700 dark:bg-slate-900"
            placeholder="Outline key steps, teams, or dungeon requirements."
          />
        </div>
        <button
          type="submit"
          className="md:col-span-4 rounded-xl bg-primary px-6 py-3 font-semibold text-white shadow-lg shadow-primary/30 hover:bg-primary/90"
        >
          Add Milestone
        </button>
      </motion.form>
      <section className="relative">
        <div className="absolute left-4 top-0 bottom-0 hidden w-1 rounded-full bg-gradient-to-b from-primary to-accent md:block" />
        <div className="space-y-4">
          {milestones.map((milestone, index) => (
            <motion.article
              key={milestone.id}
              layout
              className="relative rounded-2xl border border-slate-200 bg-white/80 p-6 shadow-sm backdrop-blur transition hover:border-primary/60 hover:shadow-lg dark:border-slate-800 dark:bg-slate-900/60"
            >
              <div className="md:absolute md:left-0 md:top-1/2 md:-ml-8 md:flex md:h-12 md:w-12 md:-translate-x-1/2 md:-translate-y-1/2 md:items-center md:justify-center">
                <span className="hidden h-12 w-12 items-center justify-center rounded-full bg-primary text-lg font-bold text-white shadow-md md:flex">
                  {index + 1}
                </span>
              </div>
              <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                <div className="flex-1 space-y-2">
                  <h3 className="text-xl font-semibold">{milestone.name}</h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400">{milestone.description}</p>
                  <div className="text-xs uppercase text-slate-500 dark:text-slate-400">
                    Target Date: <strong>{milestone.targetDate || 'TBD'}</strong>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                      <span>Progress</span>
                      <span>{milestone.progress}%</span>
                    </div>
                    <div className="h-3 w-full overflow-hidden rounded-full bg-slate-200 dark:bg-slate-800">
                      <motion.div
                        layout
                        initial={false}
                        animate={{ width: `${milestone.progress}%` }}
                        className="h-full rounded-full bg-gradient-to-r from-primary to-accent"
                      />
                    </div>
                  </div>
                </div>
                <div className="flex flex-col gap-2">
                  <button
                    type="button"
                    onClick={() =>
                      updateMilestone(milestone.id, {
                        progress: Math.min(100, milestone.progress + 5)
                      })
                    }
                    className="rounded-lg border border-primary px-4 py-2 text-xs font-semibold text-primary hover:bg-primary hover:text-white"
                  >
                    +5% Progress
                  </button>
                  <button
                    type="button"
                    onClick={() => deleteMilestone(milestone.id)}
                    className="rounded-lg bg-rose-500 px-4 py-2 text-xs font-semibold text-white"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </motion.article>
          ))}
          {milestones.length === 0 && (
            <div className="rounded-2xl border border-dashed border-slate-200 p-6 text-center text-slate-500 dark:border-slate-700 dark:text-slate-400">
              No milestones yet. Use the form above to define your long-term goals.
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
