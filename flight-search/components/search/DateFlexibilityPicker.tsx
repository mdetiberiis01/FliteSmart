'use client';

import { SearchParams } from '@/types/search';
import { motion } from 'framer-motion';

type Flexibility = SearchParams['flexibility'];

const OPTIONS: { value: Flexibility; label: string }[] = [
  { value: 'anytime', label: 'Anytime' },
  { value: 'spring', label: 'Spring' },
  { value: 'summer', label: 'Summer' },
  { value: 'fall', label: 'Fall' },
  { value: 'winter', label: 'Winter' },
  { value: 'custom', label: 'Custom' },
];

interface Props {
  value: Flexibility;
  customStart?: string;
  customEnd?: string;
  onChange: (flexibility: Flexibility, start?: string, end?: string) => void;
}

export function DateFlexibilityPicker({ value, customStart, customEnd, onChange }: Props) {
  return (
    <div>
      <label className="block text-sm text-black/60 dark:text-white/60 mb-2">When?</label>
      <div className="flex flex-wrap gap-2">
        {OPTIONS.map((opt) => (
          <motion.button
            key={opt.value}
            type="button"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => onChange(opt.value)}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-all border ${
              value === opt.value
                ? 'bg-black border-black text-white shadow-lg shadow-black/10 dark:bg-white dark:border-white dark:text-black dark:shadow-white/10'
                : 'bg-black/5 border-black/20 text-black/70 hover:bg-black/10 hover:text-black dark:bg-white/5 dark:border-white/20 dark:text-white/70 dark:hover:bg-white/10 dark:hover:text-white'
            }`}
          >
            {opt.label}
          </motion.button>
        ))}
      </div>

      {value === 'custom' && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="mt-3 grid grid-cols-2 gap-3"
        >
          <div>
            <label className="block text-xs text-black/50 dark:text-white/50 mb-1">From</label>
            <input
              type="date"
              value={customStart || ''}
              onChange={(e) => onChange('custom', e.target.value, customEnd)}
              className="w-full bg-black/5 dark:bg-white/10 border border-black/20 dark:border-white/20 rounded-xl px-3 py-2 text-black dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-black/30 dark:focus:ring-white/50"
            />
          </div>
          <div>
            <label className="block text-xs text-black/50 dark:text-white/50 mb-1">To</label>
            <input
              type="date"
              value={customEnd || ''}
              onChange={(e) => onChange('custom', customStart, e.target.value)}
              className="w-full bg-black/5 dark:bg-white/10 border border-black/20 dark:border-white/20 rounded-xl px-3 py-2 text-black dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-black/30 dark:focus:ring-white/50"
            />
          </div>
        </motion.div>
      )}
    </div>
  );
}
