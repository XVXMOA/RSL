import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import fallbackChampionCatalog from '../data/hellhades-champions.json';
import { nanoid } from '../utils/nanoid.js';

// Centralized app state using Zustand with localStorage persistence. The store keeps
// sample data that doubles as a demo for first-time users and provides helper
// actions for mutating each data collection.

const sampleChampions = [
  {
    id: 'champ-1',
    name: 'Arbiter',
    faction: 'High Elves',
    type: 'Support',
    rarity: 'Legendary',
    level: 60
  },
  {
    id: 'champ-2',
    name: 'Kael',
    faction: 'Dark Elves',
    type: 'Attack',
    rarity: 'Rare',
    level: 60
  },
  {
    id: 'champ-3',
    name: 'Bad-el-Kazar',
    faction: 'Undead Hordes',
    type: 'Support',
    rarity: 'Legendary',
    level: 60
  }
];

const sampleGear = {
  speedBoots: 8,
  perceptionSets: 4,
  lifestealSets: 3,
  savageSets: 2,
  resistanceAccessories: 6
};

const sampleResources = {
  energy: 325,
  gems: 1400,
  silver: 2800000,
  ancientShards: 24,
  voidShards: 4,
  sacredShards: 1,
  arcanePotions: 45
};

const sampleTasks = [
  {
    id: 'task-1',
    title: 'Farm Dragon 20',
    description: 'Target: 100 runs for artifacts.',
    priority: 'High',
    dueDate: '2024-06-01',
    status: 'todo'
  },
  {
    id: 'task-2',
    title: 'Upgrade Kael gear',
    description: 'Take gloves and chest to +16.',
    priority: 'Medium',
    dueDate: '2024-05-25',
    status: 'in-progress'
  },
  {
    id: 'task-3',
    title: 'Faction Wars: High Elves',
    description: 'Complete stage 21 with 3 stars.',
    priority: 'High',
    dueDate: '2024-06-15',
    status: 'complete'
  }
];

const sampleMilestones = [
  {
    id: 'goal-1',
    name: 'Unlock Arbiter',
    description: 'Finish all missions leading to Arbiter unlock.',
    targetDate: '2024-08-30',
    progress: 55
  },
  {
    id: 'goal-2',
    name: 'Faction Wars Completion',
    description: 'Reach 3 stars on all faction crypts.',
    targetDate: '2024-12-01',
    progress: 32
  },
  {
    id: 'goal-3',
    name: 'Gear Upgrade Project',
    description: 'Upgrade 20 artifact pieces to +16.',
    targetDate: '2024-07-15',
    progress: 75
  }
];

const sampleStats = {
  totalChampions: sampleChampions.length,
  totalSixStar: sampleChampions.filter((champ) => champ.level === 60).length
};

export const useRSLStore = create(
  persist(
    (set, get) => ({
      stats: sampleStats,
      champions: sampleChampions,
      gear: sampleGear,
      resources: sampleResources,
      tasks: sampleTasks,
      milestones: sampleMilestones,
      settings: {
        darkMode: false
      },
      hellHadesChampions: fallbackChampionCatalog,
      hellHadesLastFetched: null,
      addChampion: (champion) => {
        const normalizedName = champion.name?.trim();
        if (!normalizedName) {
          return { success: false, reason: 'invalid' };
        }

        const duplicate = get()
          .champions.some((existing) => existing.name.toLowerCase() === normalizedName.toLowerCase());

        if (duplicate) {
          return { success: false, reason: 'duplicate' };
        }

        const numericLevel = Math.round(Number(champion.level));
        const sanitizedLevel = Number.isNaN(numericLevel)
          ? 1
          : Math.min(60, Math.max(1, numericLevel));

        const newChampion = {
          id: nanoid(),
          name: normalizedName,
          faction: champion.faction,
          type: champion.type,
          rarity: champion.rarity,
          level: sanitizedLevel
        };

        set((state) => ({
          champions: [...state.champions, newChampion]
        }));

        return { success: true, champion: newChampion };
      },
      updateChampion: (id, updates) => {
        const sanitizedUpdates = { ...updates };
        if (sanitizedUpdates.level !== undefined) {
          const numericLevel = Math.round(Number(sanitizedUpdates.level));
          if (Number.isNaN(numericLevel)) {
            delete sanitizedUpdates.level;
          } else {
            sanitizedUpdates.level = Math.min(60, Math.max(1, numericLevel));
          }
        }

        set((state) => ({
          champions: state.champions.map((champ) =>
            champ.id === id ? { ...champ, ...sanitizedUpdates } : champ
          )
        }));
      },
      deleteChampion: (id) =>
        set((state) => ({
          champions: state.champions.filter((champ) => champ.id !== id)
        })),
      setHellHadesChampions: ({ data, fetchedAt }) =>
        set(() => ({
          hellHadesChampions: data,
          hellHadesLastFetched:
            fetchedAt === undefined ? new Date().toISOString() : fetchedAt
        })),
      clearHellHadesChampions: () =>
        set(() => ({
          hellHadesChampions: fallbackChampionCatalog,
          hellHadesLastFetched: null
        })),
      updateStats: (updates) =>
        set((state) => ({
          stats: { ...state.stats, ...updates }
        })),
      updateGear: (updates) =>
        set((state) => ({
          gear: { ...state.gear, ...updates }
        })),
      updateResources: (updates) =>
        set((state) => ({
          resources: { ...state.resources, ...updates }
        })),
      addTask: (task) =>
        set((state) => ({
          tasks: [
            ...state.tasks,
            {
              id: nanoid(),
              status: 'todo',
              ...task
            }
          ]
        })),
      updateTask: (id, updates) =>
        set((state) => ({
          tasks: state.tasks.map((task) =>
            task.id === id ? { ...task, ...updates } : task
          )
        })),
      deleteTask: (id) =>
        set((state) => ({
          tasks: state.tasks.filter((task) => task.id !== id)
        })),
      moveTask: (id, status) =>
        set((state) => ({
          tasks: state.tasks.map((task) =>
            task.id === id ? { ...task, status } : task
          )
        })),
      addMilestone: (milestone) =>
        set((state) => ({
          milestones: [
            ...state.milestones,
            {
              id: nanoid(),
              ...milestone
            }
          ]
        })),
      updateMilestone: (id, updates) =>
        set((state) => ({
          milestones: state.milestones.map((milestone) =>
            milestone.id === id ? { ...milestone, ...updates } : milestone
          )
        })),
      deleteMilestone: (id) =>
        set((state) => ({
          milestones: state.milestones.filter((milestone) => milestone.id !== id)
        })),
      toggleDarkMode: () =>
        set((state) => ({
          settings: { ...state.settings, darkMode: !state.settings.darkMode }
        })),
      resetAll: () =>
        set({
          stats: sampleStats,
          champions: sampleChampions,
          gear: sampleGear,
          resources: sampleResources,
          tasks: sampleTasks,
          milestones: sampleMilestones,
          settings: { darkMode: false },
          hellHadesChampions: fallbackChampionCatalog,
          hellHadesLastFetched: null
        })
    }),
    {
      name: 'rsl-companion-store'
    }
  )
);
