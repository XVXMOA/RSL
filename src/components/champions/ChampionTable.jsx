import { useCallback, useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import AddChampionForm from './AddChampionForm.jsx';
import StarSelector from './StarSelector.jsx';
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

const sanitizeStars = (value) => {
  const numeric = Math.round(Number(value));
  if (Number.isNaN(numeric)) return 0;
  return Math.min(6, Math.max(0, numeric));
};

const StarDisplay = ({ label, value }) => (
  <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
    <span>{label}</span>
    <div className="flex items-center gap-1">
      {Array.from({ length: 6 }, (_, index) => index + 1).map((star) => (
        <svg
          key={star}
          viewBox="0 0 20 20"
          fill="currentColor"
          className={`h-4 w-4 ${star <= value ? 'text-yellow-400' : 'text-slate-400 dark:text-slate-600'}`}
          aria-hidden="true"
        >
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
    </div>
  </div>
);

export default function ChampionTable() {
  const [roster, setRoster] = useState([]);
  const [loadingRoster, setLoadingRoster] = useState(true);
  const [rosterError, setRosterError] = useState(null);
  const [processing, setProcessing] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [editingLevel, setEditingLevel] = useState(1);
  const [editingAscension, setEditingAscension] = useState(0);
  const [editingSoul, setEditingSoul] = useState(0);
  const [statusMessage, setStatusMessage] = useState(null);

  const fetchRoster = useCallback(async () => {
    try {
      setLoadingRoster(true);
      setRosterError(null);

      const { data: userChampions, error } = await supabase
        .from('user_champions')
        .select('id, champion_id, level, ascension_level, soul_level, rarity, timestamp, updated_at, created_at')
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
            ascensionLevel: sanitizeStars(entry.ascension_level ?? 0),
            soulLevel: sanitizeStars(entry.soul_level ?? 0),
            rarity: entry.rarity ?? champion.rarity ?? 'Unknown',
            updatedAt: entry.updated_at ?? entry.timestamp ?? entry.created_at,
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
    async ({ champion, level, ascensionLevel, soulLevel }) => {
      try {
        setProcessing(true);
        setStatusMessage(null);

        const sanitizedLevel = sanitizeLevel(level);
        const sanitizedAscension = sanitizeStars(ascensionLevel);
        const sanitizedSoul = sanitizeStars(soulLevel);
        const rarity = champion.rarity ?? 'Unknown';

        const { error } = await supabase
          .from('user_champions')
          .upsert(
            [
              {
                champion_id: champion.id,
                level: sanitizedLevel,
                ascension_level: sanitizedAscension,
                soul_level: sanitizedSoul,
                rarity,
                timestamp: new Date().toISOString(),
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
    setEditingAscension(champion.ascensionLevel);
    setEditingSoul(champion.soulLevel);
  };

  const cancelEditing = () => {
    setEditingId(null);
    setEditingLevel(1);
    setEditingAscension(0);
    setEditingSoul(0);
  };

  const saveEditing = async (championId) => {
    try {
      setProcessing(true);
      const sanitizedLevel = sanitizeLevel(editingLevel);
      const sanitizedAscension = sanitizeStars(editingAscension);
      const sanitizedSoul = sanitizeStars(editingSoul);
      const { error } = await supabase
        .from('user_champions')
        .update({
          level: sanitizedLevel,
          ascension_level: sanitizedAscension,
          soul_level: sanitizedSoul,
          timestamp: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('champion_id', championId);

      if (error) {
        throw error;
      }

      setStatusMessage({ type: 'success', text: 'Champion updated.' });
      setEditingId(null);
      setEditingLevel(1);
      setEditingAscension(0);
      setEditingSoul(0);
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
                  <div className="mt-4 space-y-4">
                    {editingId === champion.championId ? (
                      <div className="grid gap-4 sm:grid-cols-3">
                        <div className="flex items-center gap-2 sm:col-span-1">
                          <label className="text-sm text-slate-500 dark:text-slate-400">Level</label>
                          <input
                            type="number"
                            min="1"
                            max="60"
                            value={editingLevel}
                            onChange={(event) => setEditingLevel(event.target.value)}
                            disabled={processing}
                            className="w-20 rounded-lg border border-slate-300 bg-white px-2 py-1 text-right dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
                          />
                        </div>
                        <StarSelector
                          label="Ascension"
                          value={editingAscension}
                          onChange={setEditingAscension}
                          className="sm:col-span-1"
                          disabled={processing}
                        />
                        <StarSelector
                          label="Soul Level"
                          value={editingSoul}
                          onChange={setEditingSoul}
                          className="sm:col-span-1"
                          disabled={processing}
                        />
                      </div>
                    ) : (
                      <div className="flex flex-wrap items-center gap-4">
                        <div className="flex items-baseline gap-2">
                          <span className="text-sm text-slate-500 dark:text-slate-400">Level</span>
                          <span className="text-xl font-bold text-slate-900 dark:text-slate-100">{champion.level}</span>
                        </div>
                        <StarDisplay label="Ascension" value={champion.ascensionLevel} />
                        <StarDisplay label="Soul" value={champion.soulLevel} />
                      </div>
                    )}
                    <div className="flex justify-end gap-2">
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
