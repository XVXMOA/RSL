import { useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { supabase } from '../../lib/supabaseClient.js';

const initialState = {
  data: [],
  loading: false,
  error: null
};

export default function ChampionSearchInput({
  disabled,
  onSelect,
  selectedChampion,
  onClear
}) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState(initialState);
  const [touched, setTouched] = useState(false);

  const isLocked = Boolean(selectedChampion);
  const inputDisabled = disabled || isLocked;

  useEffect(() => {
    if (selectedChampion) {
      setQuery(selectedChampion.name);
    }
  }, [selectedChampion]);

  useEffect(() => {
    if (isLocked) {
      setResults(initialState);
      return undefined;
    }

    if (!query.trim()) {
      setResults(initialState);
      return undefined;
    }

    setResults((prev) => ({ ...prev, loading: true }));
    const handler = setTimeout(async () => {
      try {
        const { data, error } = await supabase
          .from('champions')
          .select('id, name, faction, type, affinity, rarity, image_url')
          .ilike('name', `%${query.trim()}%`)
          .limit(10);

        if (error) {
          throw error;
        }

        setResults({ data: data ?? [], loading: false, error: null });
      } catch (error) {
        console.error('Failed to search champions', error);
        setResults({ data: [], loading: false, error: 'Unable to load champions.' });
      }
    }, 300);

    return () => {
      clearTimeout(handler);
    };
  }, [isLocked, query]);

  const showNotFound = useMemo(
    () =>
      !results.loading &&
      touched &&
      !isLocked &&
      query.trim().length > 0 &&
      results.data.length === 0 &&
      !results.error,
    [isLocked, query, results.data.length, results.error, results.loading, touched]
  );

  return (
    <div className="relative">
      <label className="text-sm font-semibold text-slate-600 dark:text-slate-300">
        Champion
      </label>
      <div className="mt-1 flex gap-2">
        <input
          type="text"
          value={query}
          onChange={(event) => {
            setQuery(event.target.value);
            setTouched(true);
          }}
          disabled={inputDisabled}
          placeholder="Search Raid champions"
          className="h-11 flex-1 rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20 disabled:cursor-not-allowed disabled:bg-slate-200 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
        />
        {isLocked ? (
          <button
            type="button"
            onClick={() => {
              onClear();
              setQuery('');
              setTouched(false);
            }}
            className="shrink-0 rounded-xl border border-slate-300 px-3 py-2 text-xs font-semibold text-slate-600 transition hover:bg-slate-100 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
          >
            Change
          </button>
        ) : null}
      </div>
      <div className="relative mt-2">
        <AnimatePresence>
          {results.loading && !isLocked ? (
            <motion.div
              key="loading"
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              className="rounded-xl border border-slate-200 bg-white/80 px-4 py-3 text-sm text-slate-500 shadow-lg dark:border-slate-700 dark:bg-slate-900/80 dark:text-slate-300"
            >
              Searching champions…
            </motion.div>
          ) : null}
        </AnimatePresence>
        <AnimatePresence>
          {!results.loading && !isLocked && results.data.length > 0 ? (
            <motion.ul
              key="results"
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              className="absolute z-20 mt-1 max-h-64 w-full overflow-y-auto rounded-xl border border-slate-200 bg-white shadow-xl dark:border-slate-700 dark:bg-slate-900"
            >
              {results.data.map((champion) => (
                <li key={champion.id}>
                  <button
                    type="button"
                    className="flex w-full items-center gap-3 px-4 py-3 text-left text-sm text-slate-700 transition hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800"
                    onClick={() => {
                      onSelect(champion);
                    }}
                  >
                    {champion.image_url ? (
                      <img
                        src={champion.image_url}
                        alt=""
                        className="h-10 w-10 rounded-lg object-cover"
                      />
                    ) : (
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-200 text-xs font-semibold uppercase text-slate-500 dark:bg-slate-800 dark:text-slate-300">
                        {champion.name.slice(0, 2)}
                      </div>
                    )}
                    <div className="flex flex-col">
                      <span className="font-semibold text-slate-900 dark:text-slate-100">
                        {champion.name}
                      </span>
                      <span className="text-xs text-slate-500 dark:text-slate-400">
                        {champion.faction} • {champion.type}
                      </span>
                    </div>
                    {champion.affinity ? (
                      <span className="ml-auto rounded-full bg-slate-100 px-2 py-1 text-[10px] font-semibold uppercase tracking-wide text-slate-500 dark:bg-slate-800 dark:text-slate-300">
                        {champion.affinity}
                      </span>
                    ) : null}
                  </button>
                </li>
              ))}
            </motion.ul>
          ) : null}
        </AnimatePresence>
        <AnimatePresence>
          {showNotFound ? (
            <motion.div
              key="not-found"
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              className="rounded-xl border border-rose-300 bg-rose-50 px-4 py-3 text-sm font-medium text-rose-600 dark:border-rose-700 dark:bg-rose-900/40 dark:text-rose-300"
            >
              Champion not found.
            </motion.div>
          ) : null}
        </AnimatePresence>
        {results.error ? (
          <p className="rounded-xl border border-rose-300 bg-rose-50 px-4 py-3 text-sm text-rose-600 dark:border-rose-700 dark:bg-rose-900/40 dark:text-rose-300">
            {results.error}
          </p>
        ) : null}
      </div>
    </div>
  );
}
