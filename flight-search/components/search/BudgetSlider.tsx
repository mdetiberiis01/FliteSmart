'use client';

interface Props {
  value: number;
  onChange: (v: number) => void;
}

export function BudgetSlider({ value, onChange }: Props) {
  const label = value === 0 ? 'Any price' : `Up to $${value.toLocaleString()}`;
  const pct = (value / 5000) * 100;

  return (
    <div className="pt-4 border-t border-slate-100 dark:border-white/8">
      <div className="flex justify-between items-center mb-3">
        <span className="text-sm font-medium text-slate-700 dark:text-white/70">Max budget</span>
        <span className="text-sm font-semibold text-sky-600 dark:text-sky-400 tabular-nums">{label}</span>
      </div>

      <div className="relative h-5 flex items-center">
        {/* Track background */}
        <div className="absolute inset-0 flex items-center pointer-events-none">
          <div className="w-full h-1.5 rounded-full bg-black/8 dark:bg-white/10 overflow-hidden">
            <div
              className="h-full rounded-full bg-sky-500 transition-all duration-75"
              style={{ width: `${pct}%` }}
            />
          </div>
        </div>
        <input
          type="range"
          min={0}
          max={5000}
          step={50}
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          className="relative w-full h-5 appearance-none bg-transparent cursor-pointer
            [&::-webkit-slider-thumb]:appearance-none
            [&::-webkit-slider-thumb]:w-4
            [&::-webkit-slider-thumb]:h-4
            [&::-webkit-slider-thumb]:rounded-full
            [&::-webkit-slider-thumb]:bg-white
            [&::-webkit-slider-thumb]:border-2
            [&::-webkit-slider-thumb]:border-sky-500
            [&::-webkit-slider-thumb]:shadow-sm
            [&::-webkit-slider-thumb]:shadow-black/20
            [&::-webkit-slider-thumb]:transition-transform
            [&::-webkit-slider-thumb]:hover:scale-110
            [&::-moz-range-thumb]:w-4
            [&::-moz-range-thumb]:h-4
            [&::-moz-range-thumb]:rounded-full
            [&::-moz-range-thumb]:bg-white
            [&::-moz-range-thumb]:border-2
            [&::-moz-range-thumb]:border-sky-500
            [&::-moz-range-thumb]:shadow-sm
            [&::-moz-range-thumb]:cursor-pointer
            [&::-moz-range-track]:bg-transparent"
        />
      </div>

      <div className="flex justify-between text-xs text-slate-400 dark:text-white/30 mt-1.5">
        <span>Any</span>
        <span>$1k</span>
        <span>$2k</span>
        <span>$3k</span>
        <span>$5k+</span>
      </div>
    </div>
  );
}
