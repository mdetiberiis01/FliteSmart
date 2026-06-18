'use client';

function formatStopDuration(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m > 0 ? `${h}h ${m}m` : `${h}h`;
}

interface Props {
  from: string;
  to: string;
  stops: number;
  layovers?: string[];
  layoverDurations?: number[];
  fromDate?: string;
  toDate?: string;
}

export function RouteBar({ from, to, stops, layovers, layoverDurations, fromDate, toDate }: Props) {
  const allDots: (string | null)[] =
    layovers && layovers.length > 0 ? layovers : Array(stops).fill(null);

  const hasDate = !!fromDate || !!toDate;

  return (
    <div className="flex-1 min-w-0 flex items-center gap-1">

      {/* Origin */}
      <div className="flex flex-col items-center shrink-0 gap-[2px]">
        <span className="text-[9px] text-slate-400 leading-none tabular-nums whitespace-nowrap h-[11px] flex items-center">
          {fromDate ?? ''}
        </span>
        <span className="w-[7px] h-[7px] rounded-full bg-slate-500 block" />
        <span className="text-[10px] font-bold text-slate-700 leading-none">{from}</span>
      </div>

      {/* Line + stop dots */}
      <div className="flex-1 flex items-center min-w-0">
        {allDots.length === 0 ? (
          <div className="flex-1 h-px bg-slate-300" />
        ) : (
          allDots.map((label, i) => (
            <div key={i} className="contents">
              <div className="flex-1 h-px bg-slate-300" />
              <div className="flex flex-col items-center shrink-0 gap-[2px]">
                <span className="h-[11px] block" />
                <span className="w-[6px] h-[6px] rounded-full bg-slate-400 block" />
                {label && (
                  <span className="hidden sm:block text-[9px] leading-none text-slate-400 font-medium whitespace-nowrap">
                    {label}
                  </span>
                )}
                {layoverDurations?.[i] != null && (
                  <span className="hidden sm:block text-[8px] leading-none text-slate-400 whitespace-nowrap tabular-nums">
                    {formatStopDuration(layoverDurations[i])}
                  </span>
                )}
              </div>
            </div>
          ))
        )}
        {allDots.length > 0 && <div className="flex-1 h-px bg-slate-300" />}
      </div>

      {/* Destination */}
      <div className="flex flex-col items-center shrink-0 gap-[2px]">
        <span className="text-[9px] text-slate-400 leading-none tabular-nums whitespace-nowrap h-[11px] flex items-center">
          {toDate ?? ''}
        </span>
        <span className="w-[7px] h-[7px] rounded-full bg-slate-500 block" />
        <span className="text-[10px] font-bold text-slate-700 leading-none">{to}</span>
      </div>

    </div>
  );
}
