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
      <label className="block text-sm text-slate-600 mb-2">When?</label>
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
                ? 'bg-slate-900 border-slate-900 text-white shadow-lg shadow-slate-900/10'
                : 'bg-slate-100 border-slate-200 text-slate-600 hover:bg-slate-200 hover:text-slate-900'
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
            <label className="block text-xs text-slate-500 mb-1">From</label>
            <input
              type="date"
              value={customStart || ''}
              onChange={(e) => onChange('custom', e.target.value, customEnd)}
              className="w-full bg-slate-100 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-brand"
            />
          </div>
          <div>
            <label className="block text-xs text-slate-500 mb-1">To</label>
            <input
              type="date"
              value={customEnd || ''}
              onChange={(e) => onChange('custom', customStart, e.target.value)}
              className="w-full bg-slate-100 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-brand"
            />
          </div>
        </motion.div>
      )}
    </div>
  );
}
