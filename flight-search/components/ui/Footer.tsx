import Link from 'next/link';

export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-black/8 dark:border-white/8 bg-white dark:bg-[#0a0a0a]">
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-10">

          {/* Brand */}
          <div className="md:col-span-2">
            <Link href="/" className="flex items-center gap-2 font-bold text-base text-black dark:text-white mb-3">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-sky-500" aria-hidden="true">
                <path d="M17.8 19.2 16 11l3.5-3.5C21 6 21 4 19 2c-2-2-4-2-5.5-.5L10 5 1.8 6.2c-.5.1-.9.5-.7 1l2.3 4c.3.5.9.7 1.5.5L9 10.5 11 13l-2 3.5c-.3.5-.1 1.1.4 1.4l4 2.3c.5.2 1 0 1-.5z" />
              </svg>
              FliteSmart
            </Link>
            <p className="text-black/45 dark:text-white/45 text-sm leading-relaxed max-w-xs">
              Flexible date search, real price history, and deal ratings. Find cheaper flights without the guesswork.
            </p>
          </div>

          {/* Product */}
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-widest text-black/35 dark:text-white/35 mb-4">Product</h3>
            <ul className="space-y-2.5 text-sm text-black/55 dark:text-white/55">
              <li><Link href="/" className="hover:text-black dark:hover:text-white transition">Search flights</Link></li>
              <li><Link href="/alerts" className="hover:text-black dark:hover:text-white transition">Price alerts</Link></li>
              <li><Link href="/how-it-works" className="hover:text-black dark:hover:text-white transition">How it works</Link></li>
            </ul>
          </div>

          {/* Company */}
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-widest text-black/35 dark:text-white/35 mb-4">Company</h3>
            <ul className="space-y-2.5 text-sm text-black/55 dark:text-white/55">
              <li><span className="cursor-default">Privacy policy</span></li>
              <li><span className="cursor-default">Terms of service</span></li>
              <li>
                <a href="mailto:hello@flitesmart.com" className="hover:text-black dark:hover:text-white transition">
                  Contact
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-black/8 dark:border-white/8 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-black/35 dark:text-white/35">
          <span>© {year} FliteSmart. All rights reserved.</span>
          <span>Prices from 750+ airlines · No booking fees · Not affiliated with any airline</span>
        </div>
      </div>
    </footer>
  );
}
