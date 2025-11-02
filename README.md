# Raid Shadow Legends Companion

A modern, mobile-responsive planner for Raid Shadow Legends built with React, Tailwind CSS, Zustand, and Framer Motion. The app runs entirely on the client using local storage for persistence so you can prototype strategies, track gear, and manage long-term goals without a backend.

## Features

- **Dashboard Overview**: quick account snapshot with editable stats, resource rollups, and highlighted gear.
- **Champion Tracker**: searchable, filterable roster list with inline editing and notes.
- **Gear & Resource Planner**: update inventory counts and use handy calculators for ranking and upgrades.
- **To-Do Kanban Board**: drag-and-drop tasks between To Do, In Progress, and Complete lanes.
- **Goal Timeline**: visualize milestones with progress tracking and upcoming target dates.
- **Dark Mode & Responsive Layout**: works on desktop, tablet, and mobile.
- **Data Persistence**: state is stored locally using Zustand + localStorage with manual export/import controls.

## Getting Started

```bash
npm install
npm run dev
```

Open http://localhost:5173 to view the app. Sample data is preloaded to demonstrate the layout; use the Settings page to reset or import your own data.

## Project Structure

```
src/
  components/
    champions/      # Champion table and filters
    dashboard/      # Dashboard overview cards
    gear/           # Gear & resource planner
    layout/         # Navbar, dark mode toggle
    timeline/       # Goal timeline visualizations
    todo/           # Kanban board
  pages/            # Route-level pages
  store/            # Zustand store with persistence
  utils/            # Helpers (lightweight nanoid)
```

Tailwind configuration lives in `tailwind.config.js`, and Vite powers the development tooling. The codebase is modular so components can be reused in React Native or Expo projects.
