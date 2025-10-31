import { useCallback, useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useRSLStore } from '../../store/useRSLStore.js';
import fallbackChampionCatalog from '../../data/hellhades-champions.json';

const HELLHADES_ENDPOINT =
  'https://hellhades.com/wp-json/wp/v2/champions?per_page=500&_fields=title,acf';
const HELLHADES_PROXY_ENDPOINT =
  `https://cors.isomorphic-git.org/${HELLHADES_ENDPOINT}`;

let sessionCatalogFetchAttempted = false;

const rarityStyles = {
  Common: 'bg-slate-300 text-slate-800',
  Uncommon: 'bg-emerald-200 text-emerald-900',
  Rare: 'bg-sky-200 text-sky-900',
  Epic: 'bg-purple-200 text-purple-900',
  Legendary: 'bg-amber-200 text-amber-900',
  Mythical: 'bg-rose-200 text-rose-900'
};

const cleanText = (value) =>
  typeof value === 'string'
    ? value
        .replace(/&#039;/g, "'")
        .replace(/&amp;/g, '&')
        .replace(/&quot;/g, '"')
        .trim()
    : '';

const normaliseChampionEntry = (entry) => {
  if (!entry) return null;

  const name =
    entry.name ??
    entry.title?.rendered ??
    entry.title ??
    entry.fullName ??
    entry.champion;

  const faction =
    entry.faction ??
    entry.factions ??
    entry.acf?.faction ??
    entry.acf?.faction_full ??
    entry.meta?.faction;

  const role =
    entry.type ??
    entry.role ??
    entry.class ??
    entry.acf?.type ??
    entry.acf?.role ??
    entry.meta?.type;

  const rarity =
    entry.rarity ??
    entry.rank ??
    entry.acf?.rarity ??
    entry.meta?.rarity;

  if (!name || !faction || !rarity) return null;

  return {
    name: cleanText(name),
    faction: cleanText(faction),
    type: cleanText(role) || 'Unknown',
    rarity: cleanText(rarity)
  };
};

const dedupeAndSort = (collection) => {
  const map = new Map();
  collection.forEach((champion) => {
    if (!champion?.name) return;
    const key = champion.name.toLowerCase();
    if (!map.has(key)) {
      map.set(key, champion);
    }
  });
  return Array.from(map.values()).sort((a, b) => a.name.localeCompare(b.name));
};

const fetchHellHadesChampionCatalog = async () => {
  const sources = [HELLHADES_ENDPOINT, HELLHADES_PROXY_ENDPOINT];
  let lastError = null;

  for (const source of sources) {
    try {
      const response = await fetch(source, {
        headers: {
          Accept: 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`HellHades responded with ${response.status}`);
      }

      const payload = await response.json();
      const rawCollection = Array.isArray(payload)
        ? payload
        : Array.isArray(payload?.data)
          ? payload.data
          : [];

      const normalised = rawCollection
        .map(normaliseChampionEntry)
        .filter((entry) => entry && entry.name && entry.faction && entry.rarity);

      if (normalised.length) {
        return dedupeAndSort(normalised);
      }
    } catch (error) {
      lastError = error;
    }
  }

  if (lastError) {
    throw lastError;
  }

  return dedupeAndSort(fallbackChampionCatalog);
};

export default function ChampionTable() {
  const champions = useRSLStore((state) => state.champions);
  const addChampion = useRSLStore((state) => state.addChampion);
  const updateChampion = useRSLStore((state) => state.updateChampion);
  const deleteChampion = useRSLStore((state) => state.deleteChampion);
  const catalog = useRSLStore((state) => state.hellHadesChampions);
  const setCatalog = useRSLStore((state) => state.setHellHadesChampions);
  const lastFetched = useRSLStore((state) => state.hellHadesLastFetched);

  const [query, setQuery] = useState('');
  const [selectedChampion, setSelectedChampion] = useState(null);
  const [level, setLevel] = useState(1);
  const [formFeedback, setFormFeedback] = useState(null);
  const [catalogStatus, setCatalogStatus] = useState('');
  const [catalogStatusType, setCatalogStatusType] = useState('info');
  const [loadingCatalog, setLoadingCatalog] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [editingLevel, setEditingLevel] = useState(1);

  const refreshCatalog = useCallback(
    async ({ silent = false } = {}) => {
      setLoadingCatalog(true);
      if (!silent) {
        setCatalogStatus('');
        setCatalogStatusType('info');
      }
      try {
        const freshCatalog = await fetchHellHadesChampionCatalog();
        setCatalog({ data: freshCatalog, fetchedAt: new Date().toISOString() });
        if (!silent) {
          setCatalogStatus('Champion list updated from HellHades.');
          setCatalogStatusType('success');
        }
      } catch (error) {
        console.error('Failed to update HellHades champion list', error);
        if (!catalog.length) {
          setCatalog({ data: dedupeAndSort(fallbackChampionCatalog), fetchedAt: null });
        }
        const message =
          'Unable to reach HellHades. Using the cached champion list instead.';
        setCatalogStatus(message);
        setCatalogStatusType('warning');
        if (!silent) {
          setFormFeedback({ type: 'error', text: message });
        }
      } finally {
        setLoadingCatalog(false);
      }
    },
    [catalog.length, setCatalog]
  );

  useEffect(() => {
    if (sessionCatalogFetchAttempted) return;
    sessionCatalogFetchAttempted = true;
    refreshCatalog({ silent: true });
  }, [refreshCatalog]);

  useEffect(() => {
    if (!query.trim()) {
      setSelectedChampion(null);
      return;
    }
    const match = catalog.find(
      (champion) => champion.name.toLowerCase() === query.trim().toLowerCase()
    );
    setSelectedChampion(match ?? null);
  }, [catalog, query]);

  const suggestionList = useMemo(() => {
    const trimmed = query.trim().toLowerCase();
    if (!trimmed) {
      return [];
    }
    return catalog
      .filter((champion) => champion.name.toLowerCase().includes(trimmed))
      .slice(0, 8);
  }, [catalog, query]);

  const shouldShowSuggestions =
    suggestionList.length > 0 &&
    query.trim().length > 0 &&
    selectedChampion?.name.toLowerCase() !== query.trim().toLowerCase();

  const roster = useMemo(
    () =>
      [...champions].sort((a, b) =>
        a.name.localeCompare(b.name, undefined, { sensitivity: 'base' })
      ),
    [champions]
  );

  const handleSelectSuggestion = (champion) => {
    setQuery(champion.name);
    setSelectedChampion(champion);
    setFormFeedback(null);
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    setFormFeedback(null);

    if (!selectedChampion) {
      setFormFeedback({ type: 'error', text: 'Champion not found. Please select a valid champion.' });
      return;
    }

    const numericLevel = Math.round(Number(level));
    if (Number.isNaN(numericLevel) || numericLevel < 1 || numericLevel > 60) {
      setFormFeedback({ type: 'error', text: 'Level must be between 1 and 60.' });
      return;
    }

    const result = addChampion({
      ...selectedChampion,
      level: numericLevel
    });

    if (!result.success) {
      const message =
        result.reason === 'duplicate'
          ? `${selectedChampion.name} is already in your roster.`
          : 'Unable to add champion. Please try again.';
      setFormFeedback({ type: 'error', text: message });
      return;
    }

    setFormFeedback({
      type: 'success',
      text: `${selectedChampion.name} added to your roster.`
    });
    setQuery('');
    setSelectedChampion(null);
    setLevel(1);
  };

  const startEditing = (champion) => {
    setEditingId(champion.id);
    setEditingLevel(champion.level);
  };

  const cancelEditing = () => {
    setEditingId(null);
  };

  const saveEditing = (id) => {
    updateChampion(id, { level: editingLevel });
    setEditingId(null);
    setFormFeedback({ type: 'success', text: 'Champion updated.' });
  };

  const removeChampion = (id, name) => {
    deleteChampion(id);
    setFormFeedback({ type: 'success', text: `${name} removed from your roster.` });
  };

  const lastFetchedLabel = lastFetched
    ? new Date(lastFetched).toLocaleString()
    : 'Cached offline list';

  return (
    <div className="space-y-6">
      <motion.section
        layout
        className="rounded-2xl border border-slate-200 bg-white/70 p-6 shadow-sm backdrop-blur dark:border-slate-800 dark:bg-slate-900/60"
      >
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h3 className="text-lg font-semibold">Champion Management</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Validate recruits against the HellHades roster and auto-fill their details.
            </p>
          </div>
          <div className="flex flex-col items-start gap-2 md:items-end">
            <button
              type="button"
              onClick={() => refreshCatalog()}
              disabled={loadingCatalog}
              className="rounded-xl border border-primary px-4 py-2 text-sm font-semibold text-primary transition hover:bg-primary hover:text-white disabled:cursor-not-allowed disabled:border-slate-300 disabled:text-slate-400 dark:disabled:border-slate-700 dark:disabled:text-slate-500"
            >
              {loadingCatalog ? 'Updating…' : 'Refresh HellHades List'}
            </button>
            <span className="text-xs text-slate-500 dark:text-slate-400">Last update: {lastFetchedLabel}</span>
            {catalogStatus && (
              <span
                className={`max-w-xs text-xs ${
                  catalogStatusType === 'success'
                    ? 'text-emerald-600 dark:text-emerald-400'
                    : 'text-amber-600 dark:text-amber-400'
                }`}
              >
                {catalogStatus}
              </span>
            )}
          </div>
        </div>
        <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <div className="md:col-span-2">
              <label className="text-sm font-semibold text-slate-600 dark:text-slate-300">Champion</label>
              <div className="relative mt-1">
                <input
                  className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 dark:border-slate-700 dark:bg-slate-900"
                  placeholder="Start typing to search HellHades champions"
                  value={query}
                  onChange={(event) => {
                    setQuery(event.target.value);
                    setFormFeedback(null);
                  }}
                />
                {shouldShowSuggestions && (
                  <div className="absolute z-20 mt-2 max-h-48 w-full overflow-y-auto rounded-xl border border-slate-200 bg-white shadow-lg dark:border-slate-700 dark:bg-slate-900">
                    {suggestionList.map((champion) => (
                      <button
                        key={champion.name}
                        type="button"
                        onMouseDown={(event) => {
                          event.preventDefault();
                          handleSelectSuggestion(champion);
                        }}
                        className="flex w-full items-center justify-between px-3 py-2 text-left text-sm hover:bg-slate-100 dark:hover:bg-slate-800"
                      >
                        <span>{champion.name}</span>
                        <span className="text-xs text-slate-500 dark:text-slate-400">{champion.faction}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
            <div>
              <label className="text-sm font-semibold text-slate-600 dark:text-slate-300">Faction</label>
              <input
                className="mt-1 w-full rounded-xl border border-slate-300 bg-slate-100 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-800"
                value={selectedChampion?.faction ?? ''}
                readOnly
                placeholder="Auto-filled"
              />
            </div>
            <div>
              <label className="text-sm font-semibold text-slate-600 dark:text-slate-300">Role / Type</label>
              <input
                className="mt-1 w-full rounded-xl border border-slate-300 bg-slate-100 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-800"
                value={selectedChampion?.type ?? ''}
                readOnly
                placeholder="Auto-filled"
              />
            </div>
            <div>
              <label className="text-sm font-semibold text-slate-600 dark:text-slate-300">Rarity</label>
              <input
                className="mt-1 w-full rounded-xl border border-slate-300 bg-slate-100 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-800"
                value={selectedChampion?.rarity ?? ''}
                readOnly
                placeholder="Auto-filled"
              />
            </div>
            <div>
              <label className="text-sm font-semibold text-slate-600 dark:text-slate-300">Level</label>
              <input
                type="number"
                min="1"
                max="60"
                className="mt-1 w-full rounded-xl border border-slate-300 bg-white px-3 py-2 dark:border-slate-700 dark:bg-slate-900"
                value={level}
                onChange={(event) => setLevel(event.target.value)}
              />
            </div>
          </div>
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <button
              type="submit"
              className="rounded-xl bg-primary px-6 py-3 font-semibold text-white shadow-lg shadow-primary/30 transition hover:bg-primary/90"
            >
              Add Champion
            </button>
            {selectedChampion ? (
              <span className="text-sm text-emerald-600 dark:text-emerald-400">
                {selectedChampion.name} found in HellHades list.
              </span>
            ) : query ? (
              <span className="text-sm text-rose-500 dark:text-rose-400">Champion not validated yet.</span>
            ) : null}
          </div>
        </form>
        {formFeedback && (
          <div
            className={`mt-4 rounded-xl border px-4 py-3 text-sm ${
              formFeedback.type === 'success'
                ? 'border-emerald-300 bg-emerald-50 text-emerald-700 dark:border-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300'
                : 'border-rose-300 bg-rose-50 text-rose-700 dark:border-rose-800 dark:bg-rose-900/40 dark:text-rose-300'
            }`}
          >
            {formFeedback.text}
          </div>
        )}
      </motion.section>

      <motion.section
        layout
        className="space-y-4 rounded-2xl border border-slate-200 bg-white/70 p-6 shadow-sm backdrop-blur dark:border-slate-800 dark:bg-slate-900/60"
      >
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">Tracked Champions</h3>
          <span className="text-sm text-slate-500 dark:text-slate-400">
            {roster.length} champion{roster.length === 1 ? '' : 's'} tracked
          </span>
        </div>
        <AnimatePresence mode="popLayout">
          {roster.length === 0 ? (
            <motion.div
              key="empty-state"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              className="rounded-xl border border-dashed border-slate-300 bg-white/70 p-6 text-center text-sm text-slate-500 dark:border-slate-700 dark:bg-slate-900/60 dark:text-slate-400"
            >
              Add champions above to start tracking their progress.
            </motion.div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {roster.map((champion) => (
                <motion.div
                  key={champion.id}
                  layout
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="flex flex-col justify-between rounded-2xl border border-slate-200 bg-white/80 p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-lg dark:border-slate-800 dark:bg-slate-900/70"
                >
                  <div>
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <h4 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                          {champion.name}
                        </h4>
                        <p className="text-sm text-slate-500 dark:text-slate-400">
                          {champion.faction} • {champion.type}
                        </p>
                      </div>
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-semibold ${
                          rarityStyles[champion.rarity] ?? 'bg-slate-200 text-slate-800'
                        }`}
                      >
                        {champion.rarity}
                      </span>
                    </div>
                  </div>
                  <div className="mt-4 flex items-center justify-between gap-3">
                    {editingId === champion.id ? (
                      <div className="flex items-center gap-2">
                        <label className="text-sm text-slate-500 dark:text-slate-400">Level</label>
                        <input
                          type="number"
                          min="1"
                          max="60"
                          value={editingLevel}
                          onChange={(event) => setEditingLevel(event.target.value)}
                          className="w-20 rounded-lg border border-slate-300 bg-white px-2 py-1 text-right dark:border-slate-700 dark:bg-slate-950"
                        />
                      </div>
                    ) : (
                      <div className="flex items-baseline gap-2">
                        <span className="text-sm text-slate-500 dark:text-slate-400">Level</span>
                        <span className="text-xl font-bold text-slate-900 dark:text-slate-100">{champion.level}</span>
                      </div>
                    )}
                    <div className="flex gap-2">
                      {editingId === champion.id ? (
                        <>
                          <button
                            type="button"
                            onClick={() => saveEditing(champion.id)}
                            className="rounded-lg bg-primary px-3 py-1 text-xs font-semibold text-white"
                          >
                            Save
                          </button>
                          <button
                            type="button"
                            onClick={cancelEditing}
                            className="rounded-lg border border-slate-300 px-3 py-1 text-xs font-semibold dark:border-slate-700"
                          >
                            Cancel
                          </button>
                        </>
                      ) : (
                        <>
                          <button
                            type="button"
                            onClick={() => startEditing(champion)}
                            className="rounded-lg border border-slate-300 px-3 py-1 text-xs font-semibold hover:bg-slate-100 dark:border-slate-700 dark:hover:bg-slate-800"
                          >
                            Edit
                          </button>
                          <button
                            type="button"
                            onClick={() => removeChampion(champion.id, champion.name)}
                            className="rounded-lg bg-rose-500 px-3 py-1 text-xs font-semibold text-white hover:bg-rose-600"
                          >
                            Delete
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </AnimatePresence>
      </motion.section>
    </div>
  );
}
