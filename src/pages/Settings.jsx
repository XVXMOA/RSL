import { useState } from 'react';
import { motion } from 'framer-motion';
import { useRSLStore } from '../store/useRSLStore.js';

export default function SettingsPage() {
  const resetAll = useRSLStore((state) => state.resetAll);
  const storeState = useRSLStore();
  const [importValue, setImportValue] = useState('');
  const [statusMessage, setStatusMessage] = useState('');

  // Create a simple JSON export so players can keep manual backups or move data
  // between browsers.
  const handleExport = () => {
    const dataStr = JSON.stringify(storeState, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'rsl-companion-export.json';
    link.click();
    URL.revokeObjectURL(url);
    setStatusMessage('Exported current data to rsl-companion-export.json');
  };

  // Import merges only the collections we know about so accidental keys do not
  // break the store shape.
  const handleImport = () => {
    try {
      const parsed = JSON.parse(importValue);
      const allowedKeys = ['stats', 'champions', 'resources', 'tasks', 'milestones', 'settings'];
      const payload = {};
      allowedKeys.forEach((key) => {
        if (parsed[key]) {
          payload[key] = parsed[key];
        }
      });
      useRSLStore.setState(payload);
      setStatusMessage('Import successful! Data has been merged into the current session.');
    } catch (error) {
      setStatusMessage('Import failed. Please ensure the JSON is valid.');
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold">Settings & Data</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Manage data backups, resets, and configuration for your companion hub.
        </p>
      </div>
      <motion.section
        layout
        className="space-y-4 rounded-2xl border border-slate-200 bg-white/70 p-6 shadow-sm backdrop-blur dark:border-slate-800 dark:bg-slate-900/60"
      >
        <h2 className="text-lg font-semibold">Data Controls</h2>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Export your current planning data or reset to the starter sample data.
        </p>
        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            onClick={handleExport}
            className="rounded-xl border border-primary px-4 py-2 font-semibold text-primary hover:bg-primary hover:text-white"
          >
            Export JSON
          </button>
          <button
            type="button"
            onClick={resetAll}
            className="rounded-xl bg-rose-500 px-4 py-2 font-semibold text-white"
          >
            Reset to Sample Data
          </button>
        </div>
        <div className="space-y-2">
          <label className="text-sm font-semibold text-slate-600 dark:text-slate-300">
            Import JSON
          </label>
          <textarea
            value={importValue}
            onChange={(event) => setImportValue(event.target.value)}
            placeholder="Paste exported JSON here to restore your plan."
            className="h-40 w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs font-mono dark:border-slate-700 dark:bg-slate-900"
          />
          <button
            type="button"
            onClick={handleImport}
            className="rounded-xl bg-primary px-4 py-2 font-semibold text-white"
          >
            Import Data
          </button>
        </div>
        {statusMessage && (
          <p className="text-sm text-emerald-500 dark:text-emerald-400">{statusMessage}</p>
        )}
      </motion.section>
      <motion.section
        layout
        className="rounded-2xl border border-slate-200 bg-white/70 p-6 shadow-sm backdrop-blur dark:border-slate-800 dark:bg-slate-900/60"
      >
        <h2 className="text-lg font-semibold">What to Customize Next?</h2>
        <ul className="mt-3 list-disc space-y-2 pl-5 text-sm text-slate-500 dark:text-slate-400">
          <li>Connect Firebase or Supabase for cross-device sync.</li>
          <li>Integrate official Raid Shadow Legends API when it becomes available.</li>
          <li>Wrap these components with Expo Router for a mobile build.</li>
          <li>Add notifications for energy refills, clan boss resets, or fusion deadlines.</li>
        </ul>
      </motion.section>
    </div>
  );
}
