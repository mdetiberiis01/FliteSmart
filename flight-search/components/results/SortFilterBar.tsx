'use client';

export type SortKey = 'price' | 'date' | 'duration' | 'stops' | 'deal';
export type SortDir = 'asc' | 'desc';
export type ViewMode = 'tiles' | 'list';

interface Props {
  sortBy: SortKey;
  sortDir: SortDir;
  onSortChange: (key: SortKey, dir: SortDir) => void;
  viewMode: ViewMode;
  onViewModeChange: (mode: ViewMode) => void;
}

const SORT_OPTIONS: { key: SortKey; labelAsc: string; labelDesc: string; bidirectional: boolean }[] = [
  { key: 'price',    labelAsc: 'Price ↑',   labelDesc: 'Price ↓',  bidirectional: true },
  { key: 'date',     labelAsc: 'Date ↑',    labelDesc: 'Date ↓',   bidirectional: true },
  { key: 'duration', labelAsc: 'Shortest',  labelDesc: 'Longest',  bidirectional: false },
  { key: 'stops',    labelAsc: 'Fewest stops', labelDesc: 'Fewest stops', bidirectional: false },
  { key: 'deal',     labelAsc: 'Best deal', labelDesc: 'Best deal', bidirectional: false },
];

export function SortFilterBar({
  sortBy,
  sortDir,
  onSortChange,
  viewMode,
  onViewModeChange,
}: Props) {
  function handleSortClick(key: SortKey, bidirectional: boolean) {
    if (sortBy === key && bidirectional) {
      onSortChange(key, sortDir === 'asc' ? 'desc' : 'asc');
    } else {
      onSortChange(key, 'asc');
    }
  }

  return (
    <div className="flex flex-wrap items-center gap-x-4 gap-y-2 mb-6">
      {/* Sort */}
      <div className="flex flex-wrap items-center gap-1.5">
        <span className="text-slate-400 text-xs shrink-0">Sort:</span>
        {SORT_OPTIONS.map(({ key, labelAsc, labelDesc, bidirectional }) => {
          const isActive = sortBy === key;
          const label = isActive && bidirectional && sortDir === 'desc' ? labelDesc : labelAsc;
          return (
            <button
              key={key}
              onClick={() => handleSortClick(key, bidirectional)}
              className={`px-2.5 py-1 rounded-full text-xs font-medium transition-all ${
                isActive
                  ? 'bg-brand text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900'
              }`}
            >
              {label}
            </button>
          );
        })}
      </div>

      {/* View mode toggle */}
      <div className="ml-auto flex items-center gap-1.5">
        <span className="text-slate-400 text-xs">View:</span>
        <button
          onClick={() => onViewModeChange('tiles')}
          aria-label="Tile view"
          className={`p-1.5 rounded-lg transition-all ${
            viewMode === 'tiles' ? 'bg-brand text-white' : 'text-slate-400 hover:text-brand hover:bg-brand-50'
          }`}
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
            <rect x="1" y="1" width="6" height="6" rx="1" />
            <rect x="9" y="1" width="6" height="6" rx="1" />
            <rect x="1" y="9" width="6" height="6" rx="1" />
            <rect x="9" y="9" width="6" height="6" rx="1" />
          </svg>
        </button>
        <button
          onClick={() => onViewModeChange('list')}
          aria-label="List view"
          className={`p-1.5 rounded-lg transition-all ${
            viewMode === 'list' ? 'bg-brand text-white' : 'text-slate-400 hover:text-brand hover:bg-brand-50'
          }`}
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
            <rect x="1" y="2" width="14" height="2.5" rx="1" />
            <rect x="1" y="6.75" width="14" height="2.5" rx="1" />
            <rect x="1" y="11.5" width="14" height="2.5" rx="1" />
          </svg>
        </button>
      </div>
    </div>
  );
}
