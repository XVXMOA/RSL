# Raid Shadow Legends Companion

A modern, mobile-responsive planner for Raid Shadow Legends built with React, Tailwind CSS, Zustand, and Framer Motion. Champion management now connects to Supabase for secure roster validation while the rest of the experience remains client-driven for rapid planning.

## Features

- **Dashboard Overview**: quick account snapshot with editable stats, resource rollups, and highlighted gear.
- **Champion Tracker**: searchable Supabase-powered roster with validation, inline editing, and secure storage.
- **Gear & Resource Planner**: update inventory counts and use handy calculators for ranking and upgrades.
- **To-Do Kanban Board**: drag-and-drop tasks between To Do, In Progress, and Complete lanes.
- **Goal Timeline**: visualize milestones with progress tracking and upcoming target dates.
- **Dark Mode & Responsive Layout**: honors system dark mode automatically and works on desktop, tablet, and mobile.
- **Data Persistence**: state is stored locally using Zustand + localStorage with manual export/import controls.

## Getting Started

1. Copy `.env.local.example` to `.env.local` and provide your Supabase credentials:

   ```bash
   VITE_SUPABASE_URL=https://<your-project>.supabase.co
   VITE_SUPABASE_KEY=public-anon-key
   ```

   > **Note:** Never commit real credentials. The production project URL and key should remain in `.env.local` only.

2. Install dependencies and start the Vite dev server:

   ```bash
   npm install
   npm run dev
   ```

Open http://localhost:5173 to view the app. Sample data is preloaded for non-Supabase features; use the Settings page to reset or import your own data.

## Project Structure

```
src/
  components/
    champions/      # Supabase-backed roster management
    dashboard/      # Dashboard overview cards
    gear/           # Gear & resource planner
    layout/         # Navbar, shared layout components
    timeline/       # Goal timeline visualizations
    todo/           # Kanban board
  pages/            # Route-level pages
  store/            # Zustand store with persistence (non-Supabase data)
  utils/            # Helpers (lightweight nanoid)
```

Tailwind configuration lives in `tailwind.config.js`, and Vite powers the development tooling. The codebase is modular so components can be reused in React Native or Expo projects.
