export interface DateRange {
  start: string; // YYYY-MM-DD
  end: string;
  month: string; // YYYY-MM (for API calls)
}

const SEASONS = {
  spring: [3, 4, 5],   // March, April, May
  summer: [6, 7, 8],   // June, July, August
  fall: [9, 10, 11],   // September, October, November
  winter: [12, 1, 2],  // December, January, February
};

/**
 * Generates weekly departure dates (Tuesdays) across the full flexibility window.
 * Tuesdays are typically the cheapest day to fly.
 */
export function generateSearchDates(
  flexibility: string,
  customDateStart?: string,
  customDateEnd?: string,
  intervalDays = 7
): string[] {
  const ranges = getDateRanges(flexibility, customDateStart, customDateEnd);
  if (!ranges.length) return [];

  const rangeStart = new Date(ranges[0].start + 'T00:00:00');
  const rangeEnd = new Date(ranges[ranges.length - 1].end + 'T00:00:00');

  // Must be at least 3 days out
  const earliest = new Date();
  earliest.setDate(earliest.getDate() + 3);
  const start = new Date(Math.max(rangeStart.getTime(), earliest.getTime()));

  // Snap forward to nearest Tuesday (day 2)
  const daysUntilTue = (2 - start.getDay() + 7) % 7;
  start.setDate(start.getDate() + (daysUntilTue === 0 ? 7 : daysUntilTue));

  const dates: string[] = [];
  const cur = new Date(start);
  while (cur <= rangeEnd) {
    dates.push(cur.toISOString().split('T')[0]);
    cur.setDate(cur.getDate() + intervalDays);
  }
  return dates;
}

export function getDateRanges(
  flexibility: string,
  customStart?: string,
  customEnd?: string
): DateRange[] {
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth() + 1; // 1-indexed

  if (flexibility === 'custom' && customStart && customEnd) {
    const start = new Date(customStart);
    const end = new Date(customEnd);
    const ranges: DateRange[] = [];

    let current = new Date(start.getFullYear(), start.getMonth(), 1);
    while (current <= end) {
      const year = current.getFullYear();
      const month = current.getMonth() + 1;
      ranges.push({
        start: `${year}-${String(month).padStart(2, '0')}-01`,
        end: new Date(year, month, 0).toISOString().split('T')[0],
        month: `${year}-${String(month).padStart(2, '0')}`,
      });
      current.setMonth(current.getMonth() + 1);
    }
    return ranges;
  }

  if (flexibility === 'anytime') {
    // Next 12 months — truly anytime
    const ranges: DateRange[] = [];
    for (let i = 1; i <= 12; i++) {
      let month = currentMonth + i;
      let year = currentYear;
      if (month > 12) {
        month -= 12;
        year += 1;
      }
      ranges.push({
        start: `${year}-${String(month).padStart(2, '0')}-01`,
        end: new Date(year, month, 0).toISOString().split('T')[0],
        month: `${year}-${String(month).padStart(2, '0')}`,
      });
    }
    return ranges;
  }

  // Season-based
  const seasonMonths = SEASONS[flexibility as keyof typeof SEASONS] || SEASONS.spring;

  // Anchor the year off the LAST month of the season so all months stay consistent.
  // Using the first month breaks when searched mid-season (e.g. June 22 with summer:
  // firstMonth===currentMonth && day>15 → June→2027, but July/Aug stay 2026, inverting
  // the range and generating zero dates). The last month never has this issue.
  const lastSeasonMonth = seasonMonths[seasonMonths.length - 1];
  const baseYear = lastSeasonMonth < currentMonth ? currentYear + 1 : currentYear;

  const ranges: DateRange[] = [];
  for (const month of seasonMonths) {
    // Winter spans a year boundary: Dec belongs to the year before Jan/Feb
    const year = (flexibility === 'winter' && month === 12) ? baseYear - 1 : baseYear;
    ranges.push({
      start: `${year}-${String(month).padStart(2, '0')}-01`,
      end: new Date(year, month, 0).toISOString().split('T')[0],
      month: `${year}-${String(month).padStart(2, '0')}`,
    });
  }

  // Extend ±2 weeks around the season edges
  if (ranges.length > 0) {
    const firstStart = new Date(ranges[0].start + 'T00:00:00');
    firstStart.setDate(firstStart.getDate() - 14);
    ranges[0] = { ...ranges[0], start: firstStart.toISOString().split('T')[0] };

    const lastEnd = new Date(ranges[ranges.length - 1].end + 'T00:00:00');
    lastEnd.setDate(lastEnd.getDate() + 14);
    ranges[ranges.length - 1] = { ...ranges[ranges.length - 1], end: lastEnd.toISOString().split('T')[0] };
  }

  return ranges;
}
