import Link from 'next/link';

export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-slate-200 bg-white">
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-10">

          {/* Brand */}
          <div className="md:col-span-2">
            <Link href="/" className="flex items-center gap-2 font-bold text-base text-slate-900 mb-3">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-brand" aria-hidden="true">
                <path d="M17.8 19.2 16 11l3.5-3.5C21 6 21 4 19 2c-2-2-4-2-5.5-.5L10 5 1.8 6.2c-.5.1-.9.5-.7 1l2.3 4c.3.5.9.7 1.5.5L9 10.5 11 13l-2 3.5c-.3.5-.1 1.1.4 1.4l4 2.3c.5.2 1 0 1-.5z" />
              </svg>
              FliteSmart
            </Link>
            <p className="text-slate-400 text-sm leading-relaxed max-w-xs">
              Flexible date search, real price history, and deal ratings. Find cheaper flights without the guesswork.
            </p>
          </div>

          {/* Product */}
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-widest text-slate-400 mb-4">Product</h3>
            <ul className="space-y-2.5 text-sm text-slate-500">
              <li><Link href="/" className="hover:text-slate-900 transition">Search flights</Link></li>
              <li><Link href="/alerts" className="hover:text-slate-900 transition">Price alerts</Link></li>
              <li><Link href="/how-it-works" className="hover:text-slate-900 transition">How it works</Link></li>
            </ul>
          </div>

          {/* Company */}
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-widest text-slate-400 mb-4">Company</h3>
            <ul className="space-y-2.5 text-sm text-slate-500">
              <li><span className="cursor-default">Privacy policy</span></li>
              <li><span className="cursor-default">Terms of service</span></li>
              <li>
                <a href="mailto:hello@flitesmart.com" className="hover:text-slate-900 transition">
                  Contact
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-slate-200 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-400">
          <span>© {year} FliteSmart. All rights reserved.</span>
          <span>Prices from 750+ airlines · No booking fees · Not affiliated with any airline</span>
        </div>
      </div>
    </footer>
  );
}
