import Link from 'next/link';

export default function ConfirmPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 px-4">
      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-10 max-w-md w-full text-center">

        <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-6">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-green-600">
            <path d="M20 6L9 17l-5-5" />
          </svg>
        </div>

        <h1 className="text-2xl font-bold text-slate-900 mb-2">Email confirmed!</h1>
        <p className="text-slate-500 text-sm mb-8">
          Your FliteSmart account is now active. Sign in to manage your price alerts.
        </p>

        <Link
          href="/login"
          className="inline-block w-full py-3 rounded-xl bg-brand text-white font-semibold text-sm hover:bg-brand-dark transition text-center"
        >
          Sign in
        </Link>

      </div>

      <p className="mt-6 text-xs text-slate-400">
        © {new Date().getFullYear()} FliteSmart
      </p>
    </div>
  );
}
