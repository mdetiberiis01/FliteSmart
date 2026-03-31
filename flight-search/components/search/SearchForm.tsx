'use client';

import { useSearchForm } from '@/hooks/useSearchForm';
import { OriginInput } from './OriginInput';
import { DestinationInput } from './DestinationInput';
import { DateFlexibilityPicker } from './DateFlexibilityPicker';
import { SearchButton } from './SearchButton';
import { motion } from 'framer-motion';

const TRIP_DAY_PRESETS = [3, 5, 7, 10, 14, 21];

export function SearchForm() {
  const { form, updateField, handleSubmit, isLoading, error } = useSearchForm();

  return (
    <motion.form
      onSubmit={handleSubmit}
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="bg-white dark:bg-[#111] border border-black/10 dark:border-white/10 rounded-2xl shadow-xl shadow-black/5 dark:shadow-black/40 p-6 md:p-8 w-full max-w-5xl mx-auto"
    >
      {/* Row 1: From / To */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-5">
        <OriginInput
          value={form.origin}
          displayName={form.originName || ''}
          onChange={(code, name) => {
            updateField('origin', code);
            updateField('originName', name);
          }}
        />
        <DestinationInput
          value={form.destination}
          onChange={(value) => updateField('destination', value)}
        />
      </div>

      {/* Row 2: When / Trip length */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6 pb-6 border-b border-black/8 dark:border-white/8">
        <DateFlexibilityPicker
          value={form.flexibility}
          customStart={form.customDateStart}
          customEnd={form.customDateEnd}
          onChange={(flexibility, start, end) => {
            updateField('flexibility', flexibility);
            if (start) updateField('customDateStart', start);
            if (end) updateField('customDateEnd', end);
          }}
        />

        {/* Trip duration */}
        <div>
          <label className="block text-sm text-black/60 dark:text-white/60 mb-2">Trip length</label>
          <div className="flex flex-wrap items-center gap-2">
            {TRIP_DAY_PRESETS.map((days) => (
              <motion.button
                key={days}
                type="button"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => updateField('tripDays', days)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all border ${
                  form.tripDays === days
                    ? 'bg-black border-black text-white shadow-lg shadow-black/10 dark:bg-white dark:border-white dark:text-black dark:shadow-white/10'
                    : 'bg-black/5 border-black/20 text-black/70 hover:bg-black/10 hover:text-black dark:bg-white/5 dark:border-white/20 dark:text-white/70 dark:hover:bg-white/10 dark:hover:text-white'
                }`}
              >
                {days}d
              </motion.button>
            ))}
            <div className="flex items-center gap-1.5 bg-black/5 dark:bg-white/5 border border-black/20 dark:border-white/20 rounded-full px-3 py-1.5">
              <input
                type="number"
                min={1}
                max={90}
                value={TRIP_DAY_PRESETS.includes(form.tripDays ?? 7) ? '' : (form.tripDays ?? '')}
                onChange={(e) => {
                  const v = parseInt(e.target.value);
                  if (!isNaN(v) && v >= 1 && v <= 90) updateField('tripDays', v);
                }}
                placeholder="Custom"
                className="w-16 bg-transparent text-black/70 dark:text-white/70 text-sm focus:outline-none placeholder-black/30 dark:placeholder-white/30 text-center"
              />
              <span className="text-black/40 dark:text-white/40 text-xs">days</span>
            </div>
          </div>
        </div>
      </div>

      {error && <p className="text-red-500 text-sm mb-4">{error}</p>}

      {/* Row 3: Search button */}
      <div className="flex justify-end">
        <SearchButton isLoading={isLoading} />
      </div>
    </motion.form>
  );
}
