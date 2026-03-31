'use client';

import { motion } from 'framer-motion';

interface Props {
  isLoading: boolean;
}

export function SearchButton({ isLoading }: Props) {
  return (
    <motion.button
      type="submit"
      disabled={isLoading}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className="px-10 py-3 rounded-xl font-semibold text-white bg-black hover:bg-black/85 disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-lg shadow-black/10 text-base dark:text-black dark:bg-white dark:hover:bg-white/85 dark:shadow-white/10"
    >
      {isLoading ? (
        <span className="flex items-center gap-2">
          <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
          Searching…
        </span>
      ) : (
        'Search Flights →'
      )}
    </motion.button>
  );
}
