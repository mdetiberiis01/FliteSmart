'use client';

interface Props {
  value: number;
  onChange: (v: number) => void;
}

export function BudgetSlider({ value, onChange }: Props) {
  const label = value === 0 ? 'Any price' : `Up to $${value.toLocaleString()}`;

  return (
    <div className="pt-4 border-t border-slate-100 dark:border-white/8">
      <div className="flex justify-between items-center mb-2">
        <span className="text-sm font-medium text-slate-700 dark:text-white/70">Max budget</span>
        <span className="text-sm font-semibold text-sky-600 dark:text-sky-400">{label}</span>
      </div>
      <input
        type="range"
        min={0}
        max={5000}
        step={50}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full accent-sky-500 cursor-pointer"
      />
      <div className="flex justify-between text-xs text-slate-400 dark:text-white/30 mt-1">
        <span>Any</span>
        <span>$1k</span>
        <span>$2k</span>
        <span>$3k</span>
        <span>$5k+</span>
      </div>
    </div>
  );
}
