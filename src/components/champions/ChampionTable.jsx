import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { useRSLStore } from '../../store/useRSLStore.js';

// Sorting helper ensures rarities appear in the expected end-game order.
const rarityOrder = ['Common', 'Uncommon', 'Rare', 'Epic', 'Legendary', 'Mythical'];

const initialForm = {
  name: '',
  faction: '',
  rarity: 'Rare',
  level: 1,
  rank: 1,
  gearSet: '',
  notes: ''
};

export default function ChampionTable() {
  const champions = useRSLStore((state) => state.champions);
  const addChampion = useRSLStore((state) => state.addChampion);
  const updateChampion = useRSLStore((state) => state.updateChampion);
  const deleteChampion = useRSLStore((state) => state.deleteChampion);

  const [form, setForm] = useState(initialForm);
  const [search, setSearch] = useState('');
  const [factionFilter, setFactionFilter] = useState('All');
  const [rarityFilter, setRarityFilter] = useState('All');
  const [levelFilter, setLevelFilter] = useState('All');
  const [editingId, setEditingId] = useState(null);

  const factions = useMemo(
    () => Array.from(new Set(champions.map((champion) => champion.faction))).sort(),
    [champions]
  );

  // Combine all filters and the search term before sorting to keep the UI fast.
  const filteredChampions = champions
    .filter((champion) =>
      champion.name.toLowerCase().includes(search.trim().toLowerCase())
    )
    .filter((champion) => (factionFilter === 'All' ? true : champion.faction === factionFilter))
    .filter((champion) => (rarityFilter === 'All' ? true : champion.rarity === rarityFilter))
    .filter((champion) =>
      levelFilter === 'All' ? true : champion.level >= Number(levelFilter)
    )
    .sort((a, b) =>
      rarityOrder.indexOf(b.rarity) - rarityOrder.indexOf(a.rarity) || b.level - a.level
    );

  const handleSubmit = (event) => {
    event.preventDefault();
    if (!form.name.trim() || !form.faction.trim()) return;
    addChampion({
      ...form,
      level: Number(form.level),
      rank: Number(form.rank)
    });
    setForm(initialForm);
  };

  const handleEdit = (id) => {
    setEditingId(id);
  };

  const saveChampion = (id, updates) => {
    updateChampion(id, updates);
    setEditingId(null);
  };

  return (
    <div className="space-y-6">
      <motion.section
        layout
        className="rounded-2xl border border-slate-200 bg-white/70 p-6 shadow-sm backdrop-blur dark:border-slate-800 dark:bg-slate-900/60"
      >
        <h3 className="text-lg font-semibold">Add Champion</h3>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Track anyone in your roster, from campaign farmers to arena nukers.
        </p>
        <form className="mt-4 grid gap-4 md:grid-cols-3" onSubmit={handleSubmit}>
          <input
            className="rounded-xl border border-slate-300 bg-white px-3 py-2 dark:border-slate-700 dark:bg-slate-900"
            placeholder="Name"
            value={form.name}
            onChange={(event) => setForm((prev) => ({ ...prev, name: event.target.value }))}
          />
          <input
            className="rounded-xl border border-slate-300 bg-white px-3 py-2 dark:border-slate-700 dark:bg-slate-900"
            placeholder="Faction"
            value={form.faction}
            onChange={(event) => setForm((prev) => ({ ...prev, faction: event.target.value }))}
          />
          <select
            className="rounded-xl border border-slate-300 bg-white px-3 py-2 dark:border-slate-700 dark:bg-slate-900"
            value={form.rarity}
            onChange={(event) => setForm((prev) => ({ ...prev, rarity: event.target.value }))}
          >
            {rarityOrder.map((rarity) => (
              <option key={rarity} value={rarity}>
                {rarity}
              </option>
            ))}
          </select>
          <input
            type="number"
            min="1"
            max="60"
            className="rounded-xl border border-slate-300 bg-white px-3 py-2 dark:border-slate-700 dark:bg-slate-900"
            placeholder="Level"
            value={form.level}
            onChange={(event) => setForm((prev) => ({ ...prev, level: event.target.value }))}
          />
          <input
            type="number"
            min="1"
            max="6"
            className="rounded-xl border border-slate-300 bg-white px-3 py-2 dark:border-slate-700 dark:bg-slate-900"
            placeholder="Rank"
            value={form.rank}
            onChange={(event) => setForm((prev) => ({ ...prev, rank: event.target.value }))}
          />
          <input
            className="rounded-xl border border-slate-300 bg-white px-3 py-2 dark:border-slate-700 dark:bg-slate-900"
            placeholder="Preferred Gear"
            value={form.gearSet}
            onChange={(event) => setForm((prev) => ({ ...prev, gearSet: event.target.value }))}
          />
          <textarea
            className="md:col-span-3 rounded-xl border border-slate-300 bg-white px-3 py-2 dark:border-slate-700 dark:bg-slate-900"
            placeholder="Notes"
            value={form.notes}
            onChange={(event) => setForm((prev) => ({ ...prev, notes: event.target.value }))}
          />
          <button
            type="submit"
            className="rounded-xl bg-primary px-6 py-3 font-semibold text-white shadow-lg shadow-primary/30 hover:bg-primary/90"
          >
            Add Champion
          </button>
        </form>
      </motion.section>
      <motion.section
        layout
        className="space-y-4 rounded-2xl border border-slate-200 bg-white/70 p-6 shadow-sm backdrop-blur dark:border-slate-800 dark:bg-slate-900/60"
      >
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div className="flex flex-1 flex-wrap gap-3">
            <input
              className="flex-1 rounded-xl border border-slate-300 bg-white px-3 py-2 dark:border-slate-700 dark:bg-slate-900"
              placeholder="Search by name"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />
            <select
              value={factionFilter}
              onChange={(event) => setFactionFilter(event.target.value)}
              className="rounded-xl border border-slate-300 bg-white px-3 py-2 dark:border-slate-700 dark:bg-slate-900"
            >
              <option value="All">All Factions</option>
              {factions.map((faction) => (
                <option key={faction} value={faction}>
                  {faction}
                </option>
              ))}
            </select>
            <select
              value={rarityFilter}
              onChange={(event) => setRarityFilter(event.target.value)}
              className="rounded-xl border border-slate-300 bg-white px-3 py-2 dark:border-slate-700 dark:bg-slate-900"
            >
              <option value="All">All Rarities</option>
              {rarityOrder.map((rarity) => (
                <option key={rarity} value={rarity}>
                  {rarity}
                </option>
              ))}
            </select>
            <select
              value={levelFilter}
              onChange={(event) => setLevelFilter(event.target.value)}
              className="rounded-xl border border-slate-300 bg-white px-3 py-2 dark:border-slate-700 dark:bg-slate-900"
            >
              <option value="All">Any Level</option>
              {[40, 50, 60].map((level) => (
                <option key={level} value={level}>
                  {`≥ ${level}`}
                </option>
              ))}
            </select>
          </div>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Showing {filteredChampions.length} of {champions.length} champions.
          </p>
        </div>
        <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-700">
          <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-700">
            <thead className="bg-slate-50 dark:bg-slate-800">
              <tr className="text-left text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                <th className="px-4 py-3">Name</th>
                <th className="px-4 py-3">Faction</th>
                <th className="px-4 py-3">Rarity</th>
                <th className="px-4 py-3">Level</th>
                <th className="px-4 py-3">Rank</th>
                <th className="px-4 py-3">Gear</th>
                <th className="px-4 py-3">Notes</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 bg-white text-sm dark:divide-slate-700 dark:bg-slate-900">
              {filteredChampions.map((champion) => (
                <motion.tr
                  layout
                  key={champion.id}
                  className="transition hover:bg-slate-100/70 dark:hover:bg-slate-800/40"
                >
                  <td className="px-4 py-3 font-semibold">{champion.name}</td>
                  <td className="px-4 py-3">{champion.faction}</td>
                  <td className="px-4 py-3">{champion.rarity}</td>
                  <td className="px-4 py-3">
                    {editingId === champion.id ? (
                      <input
                        type="number"
                        value={champion.level}
                        min="1"
                        max="60"
                        onChange={(event) =>
                          updateChampion(champion.id, {
                            level: Number(event.target.value)
                          })
                        }
                        className="w-20 rounded-lg border border-slate-300 bg-white px-2 py-1 text-right dark:border-slate-700 dark:bg-slate-950"
                      />
                    ) : (
                      champion.level
                    )}
                  </td>
                  <td className="px-4 py-3">
                    {editingId === champion.id ? (
                      <input
                        type="number"
                        value={champion.rank}
                        min="1"
                        max="6"
                        onChange={(event) =>
                          updateChampion(champion.id, {
                            rank: Number(event.target.value)
                          })
                        }
                        className="w-20 rounded-lg border border-slate-300 bg-white px-2 py-1 text-right dark:border-slate-700 dark:bg-slate-950"
                      />
                    ) : (
                      `${champion.rank}★`
                    )}
                  </td>
                  <td className="px-4 py-3">
                    {editingId === champion.id ? (
                      <input
                        value={champion.gearSet}
                        onChange={(event) =>
                          updateChampion(champion.id, { gearSet: event.target.value })
                        }
                        className="w-32 rounded-lg border border-slate-300 bg-white px-2 py-1 dark:border-slate-700 dark:bg-slate-950"
                      />
                    ) : (
                      champion.gearSet
                    )}
                  </td>
                  <td className="px-4 py-3">
                    {editingId === champion.id ? (
                      <textarea
                        value={champion.notes}
                        onChange={(event) =>
                          updateChampion(champion.id, { notes: event.target.value })
                        }
                        className="w-48 rounded-lg border border-slate-300 bg-white px-2 py-1 dark:border-slate-700 dark:bg-slate-950"
                      />
                    ) : (
                      <span className="text-slate-500 dark:text-slate-300">{champion.notes}</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-right">
                    {editingId === champion.id ? (
                      <div className="flex justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => saveChampion(champion.id, {})}
                          className="rounded-lg bg-primary px-3 py-1 text-xs font-semibold text-white"
                        >
                          Done
                        </button>
                        <button
                          type="button"
                          onClick={() => setEditingId(null)}
                          className="rounded-lg border border-slate-300 px-3 py-1 text-xs font-semibold dark:border-slate-700"
                        >
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <div className="flex justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => handleEdit(champion.id)}
                          className="rounded-lg border border-slate-300 px-3 py-1 text-xs font-semibold dark:border-slate-700"
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          onClick={() => deleteChampion(champion.id)}
                          className="rounded-lg bg-rose-500 px-3 py-1 text-xs font-semibold text-white"
                        >
                          Delete
                        </button>
                      </div>
                    )}
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.section>
    </div>
  );
}
