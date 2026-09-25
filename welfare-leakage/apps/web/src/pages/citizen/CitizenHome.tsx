import { Link } from 'react-router-dom';
import { FileText, Search, Shield, Landmark } from 'lucide-react';

export function CitizenHome() {
  return (
    <div className="space-y-8">
      <div className="text-center">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-brand-purple text-3xl text-white">
          🇮🇳
        </div>
        <h1 className="text-3xl font-bold text-neutral-900">
          Welfare Grievance Portal
        </h1>
        <p className="mx-auto mt-2 max-w-md text-neutral-600">
          Report issues with welfare scheme payments and track your grievance resolution status.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Link
          to="/citizen/submit"
          className="group rounded-card border-2 border-neutral-200 bg-white p-6 transition-all hover:border-saffron hover:shadow-md"
        >
          <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-saffron-light text-saffron transition-colors group-hover:bg-saffron group-hover:text-white">
            <FileText size={24} />
          </div>
          <h2 className="text-lg font-semibold text-neutral-900">Submit Grievance</h2>
          <p className="mt-1 text-sm text-neutral-500">
            Report payment issues, wrong amounts, or suspicious beneficiary entries
          </p>
          <span className="mt-3 inline-block text-sm font-medium text-brand-purple">
            File a complaint →
          </span>
        </Link>

        <Link
          to="/citizen/track"
          className="group rounded-card border-2 border-neutral-200 bg-white p-6 transition-all hover:border-info-cyan hover:shadow-md"
        >
          <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-info-cyan-light text-info-cyan transition-colors group-hover:bg-info-cyan group-hover:text-white">
            <Search size={24} />
          </div>
          <h2 className="text-lg font-semibold text-neutral-900">Track Grievance</h2>
          <p className="mt-1 text-sm text-neutral-500">
            Check the status of a previously submitted grievance using your tracking ID
          </p>
          <span className="mt-3 inline-block text-sm font-medium text-brand-purple">
            Check status →
          </span>
        </Link>
      </div>

      <div className="rounded-card border border-neutral-200 bg-neutral-50 p-6">
        <h2 className="text-sm font-semibold text-neutral-700">Supported Schemes</h2>
        <div className="mt-3 grid grid-cols-2 gap-3 text-sm sm:grid-cols-3">
          {['PM-KISAN', 'Ayushman Bharat', 'NSAP Pension', 'Mid-Day Meal', 'PM-Jal Jeevan', 'Ujjwala Yojana'].map((s) => (
            <div key={s} className="flex items-center gap-2 rounded-lg bg-white px-3 py-2 text-neutral-600">
              <Landmark size={14} className="text-brand-purple" />
              {s}
            </div>
          ))}
        </div>
      </div>

      <div className="flex items-start gap-3 rounded-card border border-info-cyan-light bg-info-cyan-light p-4 text-sm text-neutral-700">
        <Shield size={18} className="mt-0.5 shrink-0 text-info-cyan" />
        <div>
          <p className="font-medium text-neutral-800">Your privacy is protected</p>
          <p className="mt-0.5 text-neutral-600">
            We only ask for the last 4 digits of your Aadhaar number. Full Aadhaar numbers are never stored or transmitted through this portal.
          </p>
        </div>
      </div>
    </div>
  );
}
