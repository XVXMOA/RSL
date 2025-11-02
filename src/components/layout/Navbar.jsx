import { NavLink } from 'react-router-dom';

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
    <header className="sticky top-0 z-40 w-full border-b border-slate-200 bg-slate-50/80 backdrop-blur-md transition-colors dark:border-slate-800 dark:bg-slate-900/80">
      <div className="mx-auto flex max-w-6xl flex-col gap-2 px-4 py-3 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-3">
          <img
            src="/rsl-logo.svg"
            alt="Raid Planner logo"
            className="h-10 w-10 rounded-xl border border-slate-200 bg-white object-cover p-1 shadow-sm dark:border-slate-700 dark:bg-slate-900"
          />
          <div>
            <h1 className="text-xl font-semibold text-slate-900 dark:text-slate-100">Raid Planner</h1>
            <p className="text-xs text-slate-500 dark:text-slate-400">Plan. Track. Dominate Teleria.</p>
          </div>
        </div>
        <div className="flex flex-1 flex-wrap items-center justify-between gap-2 md:flex-none md:justify-end">
          <nav className="flex flex-wrap items-center gap-2">
            {navItems.map((item) => (
              <NavLink key={item.path} to={item.path} className={linkClasses} end>
                {item.label}
              </NavLink>
            ))}
          </nav>
          <span className="hidden text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400 md:inline-flex">
            System Dark Mode
          </span>
        </div>
      </div>
    </header>
  );
}
