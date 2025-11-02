import { useCallback, useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import AddChampionForm from './AddChampionForm.jsx';
import { supabase } from '../../lib/supabaseClient.js';

const rarityStyles = {
  Common: 'bg-slate-300 text-slate-800',
  Uncommon: 'bg-emerald-200 text-emerald-900',
  Rare: 'bg-sky-200 text-sky-900',
  Epic: 'bg-purple-200 text-purple-900',
  Legendary: 'bg-amber-200 text-amber-900',
  Mythical: 'bg-rose-200 text-rose-900'
};

const sanitizeLevel = (value) => {
  const numeric = Math.round(Number(value));
  if (Number.isNaN(numeric)) return 1;
  return Math.min(60, Math.max(1, numeric));
};

export default function ChampionTable() {
  const [roster, setRoster] = useState([]);
  const [loadingRoster, setLoadingRoster] = useState(true);
  const [rosterError, setRosterError] = useState(null);
  const [processing, setProcessing] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [editingLevel, setEditingLevel] = useState(1);
  const [statusMessage, setStatusMessage] = useState(null);

  const fetchRoster = useCallback(async () => {
    try {
      setLoadingRoster(true);
      setRosterError(null);

      const { data: userChampions, error } = await supabase
        .from('user_champions')
        .select('id, champion_id, level, rarity, updated_at, created_at')
        .order('updated_at', { ascending: false });

      if (error) {
        throw error;
      }

      if (!userChampions?.length) {
        setRoster([]);
        return;
      }

      const championIds = userChampions.map((entry) => entry.champion_id);
      const { data: champions, error: championError } = await supabase
        .from('champions')
        .select('id, name, faction, type, affinity, rarity, image_url')
        .in('id', championIds);

      if (championError) {
        throw championError;
      }

      const championMap = new Map((champions ?? []).map((champion) => [champion.id, champion]));
      const merged = userChampions
        .map((entry) => {
          const champion = championMap.get(entry.champion_id);
          if (!champion) return null;
          return {
            recordId: entry.id,
            championId: entry.champion_id,
            level: sanitizeLevel(entry.level ?? 1),
            rarity: entry.rarity ?? champion.rarity ?? 'Unknown',
            updatedAt: entry.updated_at ?? entry.created_at,
            ...champion
          };
        })
        .filter(Boolean)
        .sort((a, b) => a.name.localeCompare(b.name));

      setRoster(merged);
    } catch (error) {
      console.error('Failed to fetch roster', error);
      setRosterError('Unable to load your champion roster from Supabase.');
    } finally {
      setLoadingRoster(false);
    }
  }, []);

  useEffect(() => {
    fetchRoster();
  }, [fetchRoster]);

  const handleAddChampion = useCallback(
    async ({ champion, level }) => {
      try {
        setProcessing(true);
        setStatusMessage(null);

        const sanitizedLevel = sanitizeLevel(level);
        const rarity = champion.rarity ?? 'Unknown';

        const { error } = await supabase
          .from('user_champions')
          .upsert(
            [
              {
                champion_id: champion.id,
                level: sanitizedLevel,
                rarity,
                updated_at: new Date().toISOString()
              }
            ],
            { onConflict: 'champion_id' }
          );

        if (error) {
          throw error;
        }

        setStatusMessage({ type: 'success', text: `${champion.name} saved to your roster.` });
        await fetchRoster();
        return { success: true };
      } catch (error) {
        console.error('Failed to add champion', error);
        const message = 'Unable to save champion. Please try again.';
        setStatusMessage({ type: 'error', text: message });
        return { error: message };
      } finally {
        setProcessing(false);
      }
    },
    [fetchRoster]
  );

  const startEditing = (champion) => {
    setEditingId(champion.championId);
    setEditingLevel(champion.level);
  };

  const cancelEditing = () => {
    setEditingId(null);
    setEditingLevel(1);
  };

  const saveEditing = async (championId) => {
    try {
      setProcessing(true);
      const sanitizedLevel = sanitizeLevel(editingLevel);
      const { error } = await supabase
        .from('user_champions')
        .update({ level: sanitizedLevel, updated_at: new Date().toISOString() })
        .eq('champion_id', championId);

      if (error) {
        throw error;
      }

      setStatusMessage({ type: 'success', text: 'Champion updated.' });
      setEditingId(null);
      setEditingLevel(1);
      await fetchRoster();
    } catch (error) {
      console.error('Failed to update champion', error);
      setStatusMessage({ type: 'error', text: 'Unable to update champion level.' });
    } finally {
      setProcessing(false);
    }
  };

  const deleteChampion = async (championId) => {
    try {
      setProcessing(true);
      const { error } = await supabase
        .from('user_champions')
        .delete()
        .eq('champion_id', championId);

      if (error) {
        throw error;
      }

      setStatusMessage({ type: 'success', text: 'Champion removed from your roster.' });
      await fetchRoster();
    } catch (error) {
      console.error('Failed to delete champion', error);
      setStatusMessage({ type: 'error', text: 'Unable to remove champion.' });
    } finally {
      setProcessing(false);
    }
  };

  const rosterEmpty = useMemo(() => roster.length === 0, [roster.length]);

  return (
    <div className="grid gap-6 lg:grid-cols-[420px,1fr]">
      <motion.section
        layout
        className="space-y-6 rounded-2xl border border-slate-200 bg-white/70 p-6 shadow-sm backdrop-blur dark:border-slate-800 dark:bg-slate-900/60"
      >
        <div className="flex flex-col gap-2">
          <h2 className="text-xl font-semibold">Add a Champion</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Search the official Supabase catalog and add champions directly to your roster.
          </p>
        </div>
        <AddChampionForm onAdd={handleAddChampion} roster={roster} isSubmitting={processing} />
        {statusMessage ? (
          <div
            className={`rounded-xl border px-4 py-3 text-sm ${
              statusMessage.type === 'success'
                ? 'border-emerald-300 bg-emerald-50 text-emerald-700 dark:border-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300'
                : 'border-rose-300 bg-rose-50 text-rose-600 dark:border-rose-700 dark:bg-rose-900/40 dark:text-rose-300'
            }`}
          >
            {statusMessage.text}
          </div>
        ) : null}
      </motion.section>

      <motion.section
        layout
        className="space-y-4 rounded-2xl border border-slate-200 bg-white/70 p-6 shadow-sm backdrop-blur dark:border-slate-800 dark:bg-slate-900/60"
      >
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">Tracked Champions</h3>
          <span className="text-sm text-slate-500 dark:text-slate-400">
            {loadingRoster ? 'Loading…' : `${roster.length} champion${roster.length === 1 ? '' : 's'}`}
          </span>
        </div>
        {rosterError ? (
          <p className="rounded-xl border border-rose-300 bg-rose-50 px-4 py-3 text-sm text-rose-600 dark:border-rose-700 dark:bg-rose-900/40 dark:text-rose-300">
            {rosterError}
          </p>
        ) : null}
        <AnimatePresence mode="popLayout">
          {loadingRoster ? (
            <motion.div
              key="loading-roster"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              className="rounded-xl border border-dashed border-slate-300 bg-white/70 p-6 text-center text-sm text-slate-500 dark:border-slate-700 dark:bg-slate-900/60 dark:text-slate-400"
            >
              Fetching your champions…
            </motion.div>
          ) : rosterEmpty ? (
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
                  key={champion.championId}
                  layout
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="flex flex-col justify-between rounded-2xl border border-slate-200 bg-white/80 p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-lg dark:border-slate-800 dark:bg-slate-900/70"
                >
                  <div>
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        {champion.image_url ? (
                          <img
                            src={champion.image_url}
                            alt=""
                            className="h-14 w-14 rounded-xl object-cover"
                          />
                        ) : (
                          <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-slate-200 text-sm font-semibold uppercase text-slate-500 dark:bg-slate-800 dark:text-slate-300">
                            {champion.name.slice(0, 2)}
                          </div>
                        )}
                        <div>
                          <h4 className="text-lg font-semibold text-slate-900 dark:text-slate-100">{champion.name}</h4>
                          <p className="text-sm text-slate-500 dark:text-slate-400">
                            {champion.faction} • {champion.type}
                          </p>
                          {champion.affinity ? (
                            <p className="mt-1 text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">
                              {champion.affinity}
                            </p>
                          ) : null}
                        </div>
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
                    {editingId === champion.championId ? (
                      <div className="flex items-center gap-2">
                        <label className="text-sm text-slate-500 dark:text-slate-400">Level</label>
                        <input
                          type="number"
                          min="1"
                          max="60"
                          value={editingLevel}
                          onChange={(event) => setEditingLevel(event.target.value)}
                          className="w-20 rounded-lg border border-slate-300 bg-white px-2 py-1 text-right dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
                        />
                      </div>
                    ) : (
                      <div className="flex items-baseline gap-2">
                        <span className="text-sm text-slate-500 dark:text-slate-400">Level</span>
                        <span className="text-xl font-bold text-slate-900 dark:text-slate-100">{champion.level}</span>
                      </div>
                    )}
                    <div className="flex gap-2">
                      {editingId === champion.championId ? (
                        <>
                          <button
                            type="button"
                            onClick={() => saveEditing(champion.championId)}
                            className="rounded-lg bg-primary px-3 py-1 text-xs font-semibold text-white"
                            disabled={processing}
                          >
                            Save
                          </button>
                          <button
                            type="button"
                            onClick={cancelEditing}
                            className="rounded-lg border border-slate-300 px-3 py-1 text-xs font-semibold dark:border-slate-700 dark:text-slate-200"
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
                            onClick={() => deleteChampion(champion.championId)}
                            className="rounded-lg border border-rose-300 px-3 py-1 text-xs font-semibold text-rose-600 hover:bg-rose-50 dark:border-rose-700 dark:text-rose-300 dark:hover:bg-rose-900/40"
                            disabled={processing}
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
