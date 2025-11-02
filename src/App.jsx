import { useEffect } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import Navbar from './components/layout/Navbar.jsx';
import DashboardPage from './pages/Dashboard.jsx';
import ChampionsPage from './pages/Champions.jsx';
import TodoPage from './pages/Todo.jsx';
import TimelinePage from './pages/Timeline.jsx';
import SettingsPage from './pages/Settings.jsx';

// Generic wrapper that adds a consistent entrance animation to pages so the
// transitions feel polished without extra boilerplate in each route component.
const PageWrapper = ({ children }) => (
  <motion.main
    className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-6 px-4 pb-12 pt-8"
    initial={{ opacity: 0, y: 24 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -24 }}
    transition={{ duration: 0.3 }}
  >
    {children}
  </motion.main>
);

export default function App() {
  const location = useLocation();

  useEffect(() => {
    const root = window.document.documentElement;
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

    const applyScheme = (isDark) => {
      if (isDark) {
        root.classList.add('dark');
      } else {
        root.classList.remove('dark');
      }
    };

    applyScheme(mediaQuery.matches);

    const handler = (event) => {
      applyScheme(event.matches);
    };

    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener('change', handler);
      return () => mediaQuery.removeEventListener('change', handler);
    }

    mediaQuery.addListener(handler);
    return () => mediaQuery.removeListener(handler);
  }, []);

  return (
    <div className="flex min-h-screen flex-col bg-slate-100 text-slate-900 transition-colors duration-300 dark:bg-slate-950 dark:text-slate-100">
      <Navbar />
      <AnimatePresence mode="wait">
        <Routes location={location} key={location.pathname}>
          <Route
            path="/"
            element={
              <PageWrapper>
                <DashboardPage />
              </PageWrapper>
            }
          />
          <Route
            path="/champions"
            element={
              <PageWrapper>
                <ChampionsPage />
              </PageWrapper>
            }
          />
          <Route
            path="/todo"
            element={
              <PageWrapper>
                <TodoPage />
              </PageWrapper>
            }
          />
          <Route
            path="/timeline"
            element={
              <PageWrapper>
                <TimelinePage />
              </PageWrapper>
            }
          />
          <Route
            path="/settings"
            element={
              <PageWrapper>
                <SettingsPage />
              </PageWrapper>
            }
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AnimatePresence>
    </div>
  );
}
