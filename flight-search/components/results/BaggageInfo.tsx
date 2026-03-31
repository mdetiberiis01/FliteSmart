'use client';

// Carry-on bag SVG (small bag with handle)
function CarryOnIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden
    >
      {/* handle */}
      <path d="M9 7V5a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
      {/* bag body */}
      <rect x="4" y="7" width="16" height="13" rx="2" />
      {/* centre divider line */}
      <line x1="12" y1="7" x2="12" y2="20" />
    </svg>
  );
}

// Checked / roller bag SVG (taller bag with wheels)
function CheckedBagIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden
    >
      {/* telescopic handle */}
      <path d="M9.5 2h5v4h-5z" />
      {/* bag body */}
      <rect x="3" y="6" width="18" height="14" rx="2" />
      {/* wheels */}
      <circle cx="8" cy="22" r="1.25" />
      <circle cx="16" cy="22" r="1.25" />
      {/* centre divider */}
      <line x1="12" y1="6" x2="12" y2="20" />
    </svg>
  );
}

interface Props {
  /** Number of personal item / carry-on bags included (default 1) */
  carryOn?: number;
  /** Number of checked bags included (default 0) */
  checked?: number;
}

export function BaggageInfo({ carryOn = 1, checked = 0 }: Props) {
  return (
    <div className="flex items-center gap-2" title="Baggage included (economy standard)">
      {/* Carry-on */}
      <div
        className={`flex items-center gap-1 px-2 py-1 rounded-md border text-xs font-medium
          ${carryOn > 0
            ? 'border-black/20 dark:border-white/20 text-black/70 dark:text-white/70'
            : 'border-black/10 dark:border-white/10 text-black/30 dark:text-white/30'
          }`}
      >
        <CarryOnIcon className="w-4 h-4" />
        <span>{carryOn}</span>
      </div>

      {/* Checked bag */}
      <div
        className={`flex items-center gap-1 px-2 py-1 rounded-md border text-xs font-medium
          ${checked > 0
            ? 'border-black/20 dark:border-white/20 text-black/70 dark:text-white/70'
            : 'border-black/10 dark:border-white/10 text-black/30 dark:text-white/30'
          }`}
      >
        <CheckedBagIcon className="w-4 h-4" />
        <span>{checked}</span>
      </div>
    </div>
  );
}
