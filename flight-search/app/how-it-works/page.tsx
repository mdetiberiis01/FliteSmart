import Link from 'next/link';
import { CalendarDays, TrendingUp, Tag, Bell, SlidersHorizontal, Globe, ArrowLeftRight, ExternalLink } from 'lucide-react';
import { Nav } from '@/components/ui/Nav';
import { Footer } from '@/components/ui/Footer';

const SECTIONS = [
  {
    Icon: CalendarDays,
    title: 'Flexible Date Search',
    desc: 'No fixed dates needed. Search by Spring, Summer, Fall, Winter, or Anytime and we scan the full window to surface the cheapest departure dates. Prefer exact dates? Use the custom date range picker.',
  },
  {
    Icon: ArrowLeftRight,
    title: 'One-Way & Round-Trip',
    desc: 'Choose one-way or round-trip before you search. Set your trip length with presets (3, 5, 7, 10, 14, 21 days) or enter any custom length. One-way searches hide the return leg and price accordingly.',
  },
  {
    Icon: Globe,
    title: 'Region & Anywhere Search',
    desc: 'Not sure where you want to go? Type "Southeast Asia", "Europe", or "Anywhere" as your destination. We spread searches across the best airports in that region and return one result per destination so you can compare.',
  },
  {
    Icon: SlidersHorizontal,
    title: 'Filters & Sort',
    desc: 'A Kayak-style filter sidebar lets you narrow results by number of stops, departure and arrival time window, max price, max duration, and airline. Departure and arrival time sliders are linked — the arrival window automatically enforces a minimum gap based on the shortest flight in your results so you never filter yourself into zero results. Sort by price, date, duration, fewest stops, or best deal.',
  },
  {
    Icon: TrendingUp,
    title: '12-Month Price History',
    desc: 'Every result card shows a sparkline of prices over the past year pulled from real booking data. You can instantly see whether today\'s price is a seasonal low, a spike, or just average — without having to remember what you paid last time.',
  },
  {
    Icon: Tag,
    title: 'Deal Ratings',
    desc: 'We compare each price to its 12-month historical average and label it Great, Good, Fair, or Above Average. The deal percentage tells you exactly how far above or below the average the price sits.',
  },
  {
    Icon: ExternalLink,
    title: 'Book Direct on Google Flights',
    desc: 'Every result links directly to Google Flights for that exact route and date — no middleman, no booking fees. You compare here and book there.',
  },
  {
    Icon: Bell,
    title: 'Price Alerts',
    desc: 'Set a target price for any route and we\'ll email you when fares drop below it. Alerts run daily so you\'re notified quickly without having to check back manually.',
  },
];

export default function HowItWorksPage() {
  return (
    <div className="min-h-screen flex flex-col bg-white">

      <Nav activePage="how-it-works" />

      {/* Hero */}
      <section className="bg-slate-50 border-b border-slate-200 pt-16 pb-20 px-6">
        <div className="max-w-2xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-slate-900 mb-4 tracking-tight">
            How FliteSmart works
          </h1>
          <p className="text-slate-500 text-lg">
            Everything you need to find the right flight at the right price.
          </p>
        </div>
      </section>

      {/* Sections */}
      <section className="bg-white py-16 px-6 flex-1">
        <div className="max-w-3xl mx-auto space-y-4">
          {SECTIONS.map((s, i) => (
            <div
              key={s.title}
              className="flex gap-6 p-7 rounded-2xl border border-slate-200 bg-white hover:border-slate-300 transition"
            >
              <div className="shrink-0 mt-0.5 w-12 h-12 rounded-xl bg-brand-50 flex items-center justify-center">
                <s.Icon className="w-6 h-6 text-brand" strokeWidth={1.75} />
              </div>
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-xs font-mono text-slate-300">{String(i + 1).padStart(2, '0')}</span>
                  <h2 className="font-semibold text-lg text-slate-900">{s.title}</h2>
                </div>
                <p className="text-slate-500 text-sm leading-relaxed">{s.desc}</p>
              </div>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="max-w-3xl mx-auto mt-16 text-center">
          <p className="text-slate-500 mb-5 text-sm">Ready to find a deal?</p>
          <Link
            href="/"
            className="inline-block px-8 py-3 rounded-full bg-brand text-white font-semibold text-sm hover:bg-brand-dark transition"
          >
            Search flights
          </Link>
        </div>
      </section>

      <Footer />
    </div>
  );
}
