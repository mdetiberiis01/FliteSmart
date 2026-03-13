'use client';

import { SearchParams } from '@/types/search';
import { motion } from 'framer-motion';

type Flexibility = SearchParams['flexibility'];

const OPTIONS: { value: Flexibility; label: string; emoji: string }[] = [
  { value: 'anytime', label: 'Anytime', emoji: '🗓️' },
  { value: 'spring', label: 'Spring', emoji: '🌸' },
  { value: 'summer', label: 'Summer', emoji: '☀️' },
  { value: 'fall', label: 'Fall', emoji: '🍂' },
  { value: 'winter', label: 'Winter', emoji: '❄️' },
  { value: 'custom', label: 'Custom', emoji: '📅' },
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
      <label className="block text-sm text-white/60 mb-2">When?</label>
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
                ? 'bg-teal-500 border-teal-400 text-white shadow-lg shadow-teal-500/20'
                : 'bg-white/5 border-white/20 text-white/70 hover:bg-white/10 hover:text-white'
            }`}
          >
            {opt.emoji} {opt.label}
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
            <label className="block text-xs text-white/50 mb-1">From</label>
            <input
              type="date"
              value={customStart || ''}
              onChange={(e) => onChange('custom', e.target.value, customEnd)}
              className="w-full bg-white/10 border border-white/20 rounded-xl px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
          </div>
          <div>
            <label className="block text-xs text-white/50 mb-1">To</label>
            <input
              type="date"
              value={customEnd || ''}
              onChange={(e) => onChange('custom', customStart, e.target.value)}
              className="w-full bg-white/10 border border-white/20 rounded-xl px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
          </div>
        </motion.div>
      )}
    </div>
  );
}
