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
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="glass-card rounded-2xl p-6 md:p-8 w-full max-w-3xl mx-auto space-y-4"
    >
      <h2 className="text-xl font-semibold text-white mb-2">Where to?</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
        <label className="block text-sm text-white/60 mb-2">Trip length</label>
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
                  ? 'bg-teal-500 border-teal-400 text-white shadow-lg shadow-teal-500/20'
                  : 'bg-white/5 border-white/20 text-white/70 hover:bg-white/10 hover:text-white'
              }`}
            >
              {days}d
            </motion.button>
          ))}

          {/* Custom number input */}
          <div className="flex items-center gap-1.5 bg-white/5 border border-white/20 rounded-full px-3 py-1.5">
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
              className="w-16 bg-transparent text-white/70 text-sm focus:outline-none placeholder-white/30 text-center"
            />
            <span className="text-white/40 text-xs">days</span>
          </div>
        </div>
      </div>

      {error && <p className="text-red-400 text-sm">{error}</p>}

      <SearchButton isLoading={isLoading} />
    </motion.form>
  );
}
