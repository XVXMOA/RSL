import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { useRSLStore } from '../../store/useRSLStore.js';

// Predefined dashboard tiles make it easy to expand with more KPIs later.
const statTiles = [
  { key: 'totalChampions', label: 'Total Champions', icon: '🛡️' },
  { key: 'totalSixStar', label: '6★ Champions', icon: '⭐' }
];

export default function DashboardOverview() {
  const stats = useRSLStore((state) => state.stats);
  const updateStats = useRSLStore((state) => state.updateStats);
  const resources = useRSLStore((state) => state.resources);
  const updateResources = useRSLStore((state) => state.updateResources);

  const [editingKey, setEditingKey] = useState(null);
  const [tempValue, setTempValue] = useState('');

  const startEdit = (key, value) => {
    setEditingKey(key);
    setTempValue(String(value));
  };

  const saveEdit = () => {
    if (!editingKey) return;
    const numericValue = Number(tempValue);
    if (!Number.isNaN(numericValue)) {
      updateStats({ [editingKey]: numericValue });
    }
    setEditingKey(null);
  };

  const resourceEntries = useMemo(() => Object.entries(resources), [resources]);

  const handleResourceChange = (key) => (event) => {
    const numericValue = Number(event.target.value);
    if (Number.isNaN(numericValue) || numericValue < 0) {
      updateResources({ [key]: 0 });
      return;
    }
    updateResources({ [key]: Math.round(numericValue) });
  };

  return (
    <section className="grid gap-6 lg:grid-cols-3">
      <motion.div
        layout
        className="col-span-2 space-y-6 rounded-2xl border border-slate-200 bg-white/70 p-6 shadow-sm backdrop-blur dark:border-slate-800 dark:bg-slate-900/60"
      >
        <header className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold">Account Overview</h2>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Update your high-level stats to keep the dashboard accurate.
            </p>
          </div>
        </header>
        <div className="grid gap-4 sm:grid-cols-2">
          {statTiles.map(({ key, label, icon }) => (
            <motion.div
              key={key}
              layout
              className="flex items-center justify-between rounded-xl bg-slate-100/80 p-4 dark:bg-slate-800/50"
            >
              <div>
                <p className="text-sm text-slate-500 dark:text-slate-400">{label}</p>
                {editingKey === key ? (
                  <div className="mt-2 flex items-center gap-2">
                    <input
                      className="w-24 rounded-lg border border-slate-300 bg-white px-2 py-1 text-right text-lg font-semibold dark:border-slate-700 dark:bg-slate-900"
                      value={tempValue}
                      onChange={(event) => setTempValue(event.target.value)}
                      type="number"
                    />
                    <button
                      type="button"
                      className="rounded-lg bg-primary px-3 py-1 text-sm font-semibold text-white"
                      onClick={saveEdit}
                    >
                      Save
                    </button>
                  </div>
                ) : (
                  <p className="mt-2 text-2xl font-bold">{stats[key]}</p>
                )}
              </div>
              <button
                type="button"
                onClick={() => startEdit(key, stats[key])}
                className="flex h-12 w-12 items-center justify-center rounded-full bg-white text-2xl shadow-inner dark:bg-slate-900"
              >
                {icon}
              </button>
            </motion.div>
          ))}
        </div>
      </motion.div>
      <motion.div
        layout
        className="space-y-4 rounded-2xl border border-slate-200 bg-white/70 p-6 shadow-sm backdrop-blur dark:border-slate-800 dark:bg-slate-900/60"
      >
        <h3 className="text-lg font-semibold">Resource Ledger</h3>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Fine-tune your consumables so the dashboard stays accurate between sessions.
        </p>
        <div className="grid gap-3 sm:grid-cols-2">
          {resourceEntries.map(([key, value]) => (
            <label key={key} className="space-y-1 text-sm font-medium text-slate-600 dark:text-slate-300">
              <span className="block capitalize">{key.replace(/([A-Z])/g, ' $1')}</span>
              <input
                type="number"
                min="0"
                value={value}
                onChange={handleResourceChange(key)}
                className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-right text-base font-semibold text-slate-900 shadow-sm dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
              />
            </label>
          ))}
        </div>
      </motion.div>
    </section>
  );
}
