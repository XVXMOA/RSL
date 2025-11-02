import { useState } from 'react';
import { motion } from 'framer-motion';
import { useRSLStore } from '../../store/useRSLStore.js';

// Rough estimates based on campaign farming energy requirements per rank.
const energyPerRank = {
  4: 640,
  5: 1280,
  6: 2560
};

// Upgrade cost assumptions for quick planning (values can be tweaked later).
const silverPerUpgrade = {
  '+12': 350000,
  '+16': 1200000
};

export default function GearResourceTracker() {
  const gear = useRSLStore((state) => state.gear);
  const updateGear = useRSLStore((state) => state.updateGear);
  const resources = useRSLStore((state) => state.resources);
  const updateResources = useRSLStore((state) => state.updateResources);

  const [rankTarget, setRankTarget] = useState(6);
  const [championCount, setChampionCount] = useState(1);
  const [upgradeTarget, setUpgradeTarget] = useState('+16');
  const [pieces, setPieces] = useState(1);

  const energyNeeded = energyPerRank[rankTarget] * championCount;
  const silverNeeded = silverPerUpgrade[upgradeTarget] * pieces;

  const handleFieldChange = (collectionUpdater, key) => (event) => {
    collectionUpdater({ [key]: Number(event.target.value) });
  };

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <motion.section
        layout
        className="rounded-2xl border border-slate-200 bg-white/70 p-6 shadow-sm backdrop-blur dark:border-slate-800 dark:bg-slate-900/60"
      >
        <h3 className="text-lg font-semibold">Gear Inventory</h3>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Keep tabs on essential sets and accessories you plan to build.
        </p>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          {Object.entries(gear).map(([key, value]) => (
            <label key={key} className="space-y-2">
              <span className="block text-sm font-medium capitalize">
                {key.replace(/([A-Z])/g, ' $1')}
              </span>
              <input
                type="number"
                min="0"
                value={value}
                onChange={handleFieldChange(updateGear, key)}
                className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-right font-semibold dark:border-slate-700 dark:bg-slate-900"
              />
            </label>
          ))}
        </div>
      </motion.section>
      <motion.section
        layout
        className="space-y-6 rounded-2xl border border-slate-200 bg-white/70 p-6 shadow-sm backdrop-blur dark:border-slate-800 dark:bg-slate-900/60"
      >
        <div>
          <h3 className="text-lg font-semibold">Resource Planner</h3>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Adjust resource counts as you spend or earn them.
          </p>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            {Object.entries(resources).map(([key, value]) => (
              <label key={key} className="space-y-2">
                <span className="block text-sm font-medium capitalize">
                  {key.replace(/([A-Z])/g, ' $1')}
                </span>
                <input
                  type="number"
                  min="0"
                  value={value}
                  onChange={handleFieldChange(updateResources, key)}
                  className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-right font-semibold dark:border-slate-700 dark:bg-slate-900"
                />
              </label>
            ))}
          </div>
        </div>
        <div className="rounded-xl border border-slate-200 bg-slate-50/60 p-4 dark:border-slate-700 dark:bg-slate-900/40">
          <h4 className="text-base font-semibold">Energy Calculator</h4>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Estimate how much energy you need to rank champions.
          </p>
          <div className="mt-3 grid gap-3 sm:grid-cols-3">
            <label className="space-y-1 text-xs uppercase text-slate-500 dark:text-slate-400">
              Rank Target
              <select
                value={rankTarget}
                onChange={(event) => setRankTarget(Number(event.target.value))}
                className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-2 py-2 text-sm font-semibold dark:border-slate-700 dark:bg-slate-900"
              >
                {Object.keys(energyPerRank).map((rank) => (
                  <option key={rank} value={rank}>
                    {rank}★
                  </option>
                ))}
              </select>
            </label>
            <label className="space-y-1 text-xs uppercase text-slate-500 dark:text-slate-400">
              Champions
              <input
                type="number"
                min="1"
                value={championCount}
                onChange={(event) => setChampionCount(Number(event.target.value))}
                className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-2 py-2 text-sm font-semibold dark:border-slate-700 dark:bg-slate-900"
              />
            </label>
            <div className="flex flex-col justify-end">
              <p className="text-xs uppercase text-slate-500 dark:text-slate-400">Energy Needed</p>
              <p className="text-lg font-bold text-primary">{energyNeeded.toLocaleString()}</p>
            </div>
          </div>
        </div>
        <div className="rounded-xl border border-slate-200 bg-slate-50/60 p-4 dark:border-slate-700 dark:bg-slate-900/40">
          <h4 className="text-base font-semibold">Silver Calculator</h4>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Estimate the silver required for upgrades.
          </p>
          <div className="mt-3 grid gap-3 sm:grid-cols-3">
            <label className="space-y-1 text-xs uppercase text-slate-500 dark:text-slate-400">
              Upgrade Target
              <select
                value={upgradeTarget}
                onChange={(event) => setUpgradeTarget(event.target.value)}
                className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-2 py-2 text-sm font-semibold dark:border-slate-700 dark:bg-slate-900"
              >
                {Object.keys(silverPerUpgrade).map((key) => (
                  <option key={key} value={key}>
                    {key}
                  </option>
                ))}
              </select>
            </label>
            <label className="space-y-1 text-xs uppercase text-slate-500 dark:text-slate-400">
              Pieces
              <input
                type="number"
                min="1"
                value={pieces}
                onChange={(event) => setPieces(Number(event.target.value))}
                className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-2 py-2 text-sm font-semibold dark:border-slate-700 dark:bg-slate-900"
              />
            </label>
            <div className="flex flex-col justify-end">
              <p className="text-xs uppercase text-slate-500 dark:text-slate-400">Silver Needed</p>
              <p className="text-lg font-bold text-primary">{silverNeeded.toLocaleString()}</p>
            </div>
          </div>
        </div>
      </motion.section>
    </div>
  );
}
