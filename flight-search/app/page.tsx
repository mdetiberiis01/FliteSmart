import { SearchForm } from '@/components/search/SearchForm';

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center px-4 py-16">
      {/* Hero */}
      <div className="text-center mb-12">
        <div className="text-6xl mb-4">✈️</div>
        <h1 className="text-5xl md:text-6xl font-bold text-white mb-4 tracking-tight">
          Find your next{' '}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-teal-600">
            adventure
          </span>
        </h1>
        <p className="text-white/60 text-xl max-w-xl mx-auto">
          Search flexible dates — Spring, Summer, or Anytime. We show you the real deal with
          12-month price history.
        </p>
      </div>

      {/* Search form */}
      <SearchForm />

      {/* Features */}
      <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-6 max-w-3xl w-full px-4">
        {[
          {
            icon: '📊',
            title: 'Price History',
            desc: "12-month sparklines so you know if it's a real deal",
          },
          {
            icon: '🗓️',
            title: 'Flexible Dates',
            desc: 'Search by season or anytime — no specific dates needed',
          },
          {
            icon: '🌍',
            title: 'Region Search',
            desc: 'Say "Southeast Asia" or "Europe" and we find the best prices',
          },
        ].map((feature) => (
          <div
            key={feature.title}
            className="glass-card rounded-xl p-5 border border-white/10 text-center"
          >
            <div className="text-3xl mb-3">{feature.icon}</div>
            <h3 className="text-white font-semibold mb-1">{feature.title}</h3>
            <p className="text-white/50 text-sm">{feature.desc}</p>
          </div>
        ))}
      </div>
    </main>
  );
}
