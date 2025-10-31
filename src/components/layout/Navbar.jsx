import { NavLink } from 'react-router-dom';
import DarkModeToggle from './DarkModeToggle.jsx';

const navItems = [
  { path: '/', label: 'Dashboard' },
  { path: '/champions', label: 'Champions' },
  { path: '/todo', label: 'To-Do' },
  { path: '/timeline', label: 'Timeline' },
  { path: '/settings', label: 'Settings' }
];

const linkClasses = ({ isActive }) =>
  `rounded-full px-4 py-2 text-sm font-semibold transition-colors md:text-base ${
    isActive
      ? 'bg-primary text-white shadow-lg shadow-primary/40'
      : 'text-slate-600 hover:bg-slate-200 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white'
  }`;

export default function Navbar() {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-200 bg-slate-50/80 backdrop-blur-md dark:border-slate-800 dark:bg-slate-900/80">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-white shadow-lg shadow-primary/30">
            <span className="text-lg font-bold">RSL</span>
          </div>
          <div>
            <p className="text-lg font-semibold">Raid Companion</p>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Plan. Track. Dominate Teleria.
            </p>
          </div>
        </div>
        <nav className="hidden items-center gap-2 md:flex">
          {navItems.map((item) => (
            <NavLink key={item.path} to={item.path} className={linkClasses} end>
              {item.label}
            </NavLink>
          ))}
        </nav>
        <div className="flex items-center gap-3">
          <DarkModeToggle />
          <button
            type="button"
            className="inline-flex rounded-full border border-primary/40 px-3 py-2 text-xs font-semibold text-primary transition hover:border-primary hover:bg-primary hover:text-white"
          >
            Save Snapshot
          </button>
        </div>
      </div>
      <nav className="flex flex-wrap gap-2 border-t border-slate-200 px-4 py-2 md:hidden dark:border-slate-800">
        {navItems.map((item) => (
          <NavLink key={item.path} to={item.path} className={linkClasses} end>
            {item.label}
          </NavLink>
        ))}
      </nav>
    </header>
  );
}
