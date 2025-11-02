import { useState } from 'react';
import ChampionSearchInput from './ChampionSearchInput.jsx';

export default function AddChampionForm({
  onAdd,
  roster,
  isSubmitting
}) {
  const [selectedChampion, setSelectedChampion] = useState(null);
  const [level, setLevel] = useState(1);
  const [feedback, setFeedback] = useState(null);

  const resetForm = () => {
    setSelectedChampion(null);
    setLevel(1);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!selectedChampion) {
      setFeedback({ type: 'error', message: 'Select a champion from the list before adding.' });
      return;
    }

    if (roster.some((entry) => entry.championId === selectedChampion.id)) {
      setFeedback({ type: 'error', message: 'That champion is already in your roster.' });
      return;
    }

    const numericLevel = Number(level);
    if (Number.isNaN(numericLevel) || numericLevel < 1 || numericLevel > 60) {
      setFeedback({ type: 'error', message: 'Level must be between 1 and 60.' });
      return;
    }

    const result = await onAdd({
      champion: selectedChampion,
      level: Math.round(numericLevel)
    });

    if (result?.success) {
      setFeedback({ type: 'success', message: `${selectedChampion.name} added to your roster.` });
      resetForm();
    } else if (result?.error) {
      setFeedback({ type: 'error', message: result.error });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <ChampionSearchInput
        disabled={isSubmitting}
        selectedChampion={selectedChampion}
        onSelect={(champion) => {
          setSelectedChampion(champion);
          setFeedback(null);
        }}
        onClear={() => {
          setSelectedChampion(null);
        }}
      />
      {selectedChampion ? (
        <div className="grid gap-4 rounded-2xl border border-slate-200 bg-white/60 p-4 dark:border-slate-800 dark:bg-slate-900/40">
          <div className="flex items-center gap-3">
            {selectedChampion.image_url ? (
              <img
                src={selectedChampion.image_url}
                alt=""
                className="h-16 w-16 rounded-xl object-cover"
              />
            ) : (
              <div className="flex h-16 w-16 items-center justify-center rounded-xl bg-slate-200 text-lg font-semibold uppercase text-slate-500 dark:bg-slate-800 dark:text-slate-200">
                {selectedChampion.name.slice(0, 2)}
              </div>
            )}
            <div>
              <p className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                {selectedChampion.name}
              </p>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                {selectedChampion.faction} • {selectedChampion.type}
              </p>
              <div className="mt-2 flex flex-wrap items-center gap-2 text-xs font-semibold uppercase text-slate-500 dark:text-slate-300">
                {selectedChampion.affinity ? (
                  <span className="rounded-full bg-slate-200 px-2 py-1 dark:bg-slate-800">
                    {selectedChampion.affinity}
                  </span>
                ) : null}
                {selectedChampion.rarity ? (
                  <span className="rounded-full bg-primary/10 px-2 py-1 text-primary dark:bg-primary/20 dark:text-primary/90">
                    {selectedChampion.rarity}
                  </span>
                ) : null}
              </div>
            </div>
          </div>
          <div>
            <label className="text-sm font-semibold text-slate-600 dark:text-slate-300">
              Level
            </label>
            <input
              type="number"
              min="1"
              max="60"
              value={level}
              onChange={(event) => setLevel(event.target.value)}
              className="mt-1 h-11 w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
            />
          </div>
        </div>
      ) : null}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <button
          type="submit"
          disabled={!selectedChampion || isSubmitting}
          className="rounded-xl bg-primary px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-primary/30 transition hover:bg-primary/90 disabled:cursor-not-allowed disabled:bg-primary/40"
        >
          {isSubmitting ? 'Saving…' : 'Add Champion'}
        </button>
        {!selectedChampion ? (
          <span className="text-sm text-slate-500 dark:text-slate-400">
            Start typing a champion name to search the Supabase catalog.
          </span>
        ) : null}
      </div>
      {feedback ? (
        <p
          className={`rounded-xl border px-4 py-3 text-sm ${
            feedback.type === 'success'
              ? 'border-emerald-300 bg-emerald-50 text-emerald-700 dark:border-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300'
              : 'border-rose-300 bg-rose-50 text-rose-600 dark:border-rose-700 dark:bg-rose-900/40 dark:text-rose-300'
          }`}
        >
          {feedback.message}
        </p>
      ) : null}
    </form>
  );
}
