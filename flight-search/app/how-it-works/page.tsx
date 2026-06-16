import Link from 'next/link';
import { CalendarDays, TrendingUp, Tag, Bell } from 'lucide-react';
import { Nav } from '@/components/ui/Nav';
import { Footer } from '@/components/ui/Footer';

const SECTIONS = [
  {
    Icon: CalendarDays,
    title: 'Flexible Date Search',
    desc: 'Search by season (Spring, Summer, Fall, Winter) or Anytime — no need to lock in exact dates to discover great prices. We scan the full window and surface the cheapest results.',
  },
  {
    Icon: TrendingUp,
    title: '12-Month Price History',
    desc: 'Every result shows a sparkline of prices over the past year. You can instantly see if a price is a genuine low or just average.',
  },
  {
    Icon: Tag,
    title: 'Deal Ratings',
    desc: "We compare each price to its 12-month average and label it: Great, Good, Fair, or High. No guessing whether you're getting a deal.",
  },
  {
    Icon: Bell,
    title: 'Price Alerts',
    desc: "Set a max price for any route. We'll email you when prices drop below it, or when we spot an unusually cheap deal.",
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
            Four features that help you find cheaper flights, faster.
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
