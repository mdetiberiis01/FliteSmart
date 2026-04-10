'use client';

import { useSearchForm } from '@/hooks/useSearchForm';
import { OriginInput } from './OriginInput';
import { DestinationInput } from './DestinationInput';
import { DateFlexibilityPicker } from './DateFlexibilityPicker';
import { SearchButton } from './SearchButton';
import { TripOptionsBar } from './TripOptionsBar';
import { BudgetSlider } from './BudgetSlider';
import { motion } from 'framer-motion';

const TRIP_DAY_PRESETS = [3, 5, 7, 10, 14, 21];

interface Props {
  hook?: ReturnType<typeof useSearchForm>;
}

export function SearchForm({ hook: externalHook }: Props) {
  const internalHook = useSearchForm();
  const { form, updateField, handleSubmit, isLoading, error } = externalHook ?? internalHook;

  return (
    <motion.form
      onSubmit={handleSubmit}
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="bg-white dark:bg-[#111] border border-slate-200 dark:border-white/10 rounded-2xl shadow-xl shadow-slate-200/60 dark:shadow-black/40 p-6 md:p-8 w-full"
    >
      {/* Trip options bar */}
      <TripOptionsBar
        tripType={form.tripType ?? 'roundtrip'}
        travelers={form.travelers ?? 1}
        cabinClass={form.cabinClass ?? 'economy'}
        onChange={(field, value) => updateField(field as keyof typeof form, value as never)}
      />

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
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-5 pb-5 border-b border-slate-100 dark:border-white/8">
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
          <label className="block text-sm text-slate-600 dark:text-white/60 mb-2">Trip length</label>
          <div className="flex flex-wrap items-center gap-2">
            {TRIP_DAY_PRESETS.map((days) => (
              <motion.button
                key={days}
                type="button"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => updateField('tripDays', days)}
                className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all border ${
                  form.tripDays === days
                    ? 'bg-sky-500 border-sky-500 text-white shadow-md shadow-sky-500/20'
                    : 'bg-slate-100 border-slate-200 text-slate-600 hover:bg-slate-200 dark:bg-white/5 dark:border-white/10 dark:text-white/60 dark:hover:bg-white/10'
                }`}
              >
                {days}d
              </motion.button>
            ))}
            <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-full px-3 py-1.5">
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
                className="w-14 bg-transparent text-slate-700 dark:text-white/70 text-sm focus:outline-none placeholder-slate-400 dark:placeholder-white/30 text-center"
              />
              <span className="text-slate-400 dark:text-white/40 text-xs">days</span>
            </div>
          </div>
        </div>
      </div>

      {/* Budget slider */}
      <BudgetSlider
        value={form.maxBudget ?? 0}
        onChange={(v) => updateField('maxBudget', v)}
      />

      {error && <p className="text-red-500 text-sm mt-4">{error}</p>}

      {/* Search button */}
      <div className="flex justify-end mt-5">
        <SearchButton isLoading={isLoading} />
      </div>
    </motion.form>
  );
}
