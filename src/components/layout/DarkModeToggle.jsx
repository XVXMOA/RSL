import { motion } from 'framer-motion';
import { useRSLStore } from '../../store/useRSLStore.js';

export default function DarkModeToggle() {
  const darkMode = useRSLStore((state) => state.settings.darkMode);
  const toggleDarkMode = useRSLStore((state) => state.toggleDarkMode);

  return (
    <button
      type="button"
      onClick={toggleDarkMode}
      className="relative flex h-10 w-20 items-center rounded-full border border-slate-300 bg-slate-200 px-1 transition dark:border-slate-700 dark:bg-slate-800"
      aria-label="Toggle dark mode"
    >
      <motion.span
        layout
        transition={{ type: 'spring', stiffness: 300, damping: 20 }}
        className={`flex h-8 w-8 items-center justify-center rounded-full text-xl shadow-md ${
          darkMode ? 'translate-x-8 bg-slate-900 text-yellow-400' : 'bg-white text-primary'
        }`}
      >
        {darkMode ? '🌙' : '☀️'}
      </motion.span>
    </button>
  );
}
