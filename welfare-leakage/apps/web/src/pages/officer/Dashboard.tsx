import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Users, AlertTriangle, CheckCircle, MessageSquare,
  ShieldCheck, ScrollText, ArrowRight,
} from 'lucide-react';
import { KPICard } from '@/components/shared/KPICard';
import { useAuth } from '@/hooks/useAuth';
import api from '@/utils/api';
import { formatDate, STATE_NAMES, maskAadhaar } from '@/utils/constants';
import type { DashboardKPIs, Flag } from '@/types';

const mockKPIs: DashboardKPIs = {
  totalBeneficiaries: 48720,
  flaggedToday: 23,
  resolvedThisWeek: 67,
  pendingGrievances: 14,
  sparklineFlagged: [12, 18, 15, 22, 19, 25, 23],
  sparklineResolved: [8, 12, 14, 11, 16, 20, 18],
  sparklineGrievances: [5, 8, 6, 9, 7, 12, 14],
};

const mockRecentFlags: Partial<Flag>[] = [
  { id: '1', beneficiaryName: 'Ramesh Kumar', aadhaarLast4: '4821', stateCode: 'MH', flagType: 'income_mismatch', anomalyScore: 92.4, status: 'under_review', severity: 'high', createdAt: new Date().toISOString() },
  { id: '2', beneficiaryName: 'Sunita Devi', aadhaarLast4: '1156', stateCode: 'UP', flagType: 'duplicate_aadhaar', anomalyScore: 87.1, status: 'confirmed', severity: 'high', createdAt: new Date(Date.now() - 3600000).toISOString() },
  { id: '3', beneficiaryName: 'Arjun Patel', aadhaarLast4: '9903', stateCode: 'GJ', flagType: 'dead_beneficiary', anomalyScore: 95.8, status: 'under_review', severity: 'high', createdAt: new Date(Date.now() - 7200000).toISOString() },
  { id: '4', beneficiaryName: 'Lakshmi Reddy', aadhaarLast4: '7742', stateCode: 'AP', flagType: 'geo_anomaly', anomalyScore: 64.3, status: 'resolved', severity: 'medium', createdAt: new Date(Date.now() - 14400000).toISOString() },
  { id: '5', beneficiaryName: 'Mohammed Irfan', aadhaarLast4: '3309', stateCode: 'BR', flagType: 'multiple_accounts', anomalyScore: 78.9, status: 'confirmed', severity: 'medium', createdAt: new Date(Date.now() - 21600000).toISOString() },
];

const FLAG_LABELS: Record<string, string> = {
  duplicate_aadhaar: 'Duplicate Aadhaar',
  dead_beneficiary: 'Dead Beneficiary',
  income_mismatch: 'Income Mismatch',
  geo_anomaly: 'Geo Anomaly',
  multiple_accounts: 'Multiple Accounts',
  ineligible_category: 'Ineligible Category',
};

const STATUS_STYLE: Record<string, { dot: string; text: string }> = {
  under_review: { dot: 'bg-saffron', text: 'text-saffron' },
  confirmed: { dot: 'bg-danger', text: 'text-danger' },
  resolved: { dot: 'bg-india-green', text: 'text-india-green' },
};

function severityColor(score: number): string {
  if (score >= 80) return '#DB372D';
  if (score >= 60) return '#C47D00';
  return '#13C2C2';
}

/** Mini horizontal bar for the score column — data texture instead of colored text. */
function ScoreBar({ score }: { score: number }) {
  const color = severityColor(score);
  return (
    <div className="flex items-center gap-2.5" title={`Anomaly score ${score.toFixed(1)} / 100`}>
      <div className="h-1.5 w-16 overflow-hidden rounded-full bg-neutral-100">
        <div
          className="h-full rounded-full transition-[width] duration-700 ease-out"
          style={{ width: `${score}%`, backgroundColor: color }}
        />
      </div>
      <span className="w-9 text-right font-mono text-xs font-bold tabular-nums" style={{ color }}>
        {score.toFixed(0)}
      </span>
    </div>
  );
}

export function OfficerDashboard() {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';
  const [kpis, setKpis] = useState<DashboardKPIs>(mockKPIs);
  const [recentFlags, setRecentFlags] = useState(mockRecentFlags);

  useEffect(() => {
    api.get('/officer/dashboard')
      .then(({ data }) => setKpis(data))
      .catch(() => {});
    api.get('/officer/flags?limit=5')
      .then(({ data }) => setRecentFlags(data.data || data))
      .catch(() => {});
  }, []);

  return (
    <div className="space-y-8">
      {/* Page head — left-aligned, no generic subtitle pattern */}
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-brand-purple">
            {isAdmin ? 'Administration' : 'Operations'}
          </p>
          <h1 className="mt-1 text-3xl font-bold tracking-tight text-neutral-900">
            {isAdmin ? 'System Overview' : 'Detection Dashboard'}
          </h1>
        </div>
        <Link
          to="/officer/flags"
          className="group inline-flex items-center gap-1.5 text-sm font-semibold text-brand-purple hover:underline"
        >
          Open flag queue
          <ArrowRight size={14} className="transition-transform group-hover:translate-x-0.5" />
        </Link>
      </div>

      {/* Asymmetric KPI grid: hero spans 5, standards span 3/4 — not 4 equal columns */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-12">
        <div className="lg:col-span-5">
          <KPICard
            variant="hero"
            label="Flagged today"
            value={kpis.flaggedToday}
            sparklineData={kpis.sparklineFlagged}
            delta={12}
            deltaLabel="vs yesterday"
            invertDelta
            icon={<AlertTriangle size={18} strokeWidth={2} />}
            accent="#DB372D"
            delay={0}
          />
        </div>
        <div className="lg:col-span-3">
          <KPICard
            label="Resolved this week"
            value={kpis.resolvedThisWeek}
            sparklineData={kpis.sparklineResolved}
            delta={18}
            deltaLabel="vs last week"
            icon={<CheckCircle size={16} strokeWidth={2} />}
            accent="#128937"
            delay={70}
          />
        </div>
        <div className="lg:col-span-4">
          <KPICard
            label="Pending grievances"
            value={kpis.pendingGrievances}
            sparklineData={kpis.sparklineGrievances}
            delta={5}
            deltaLabel="vs last week"
            invertDelta
            icon={<MessageSquare size={16} strokeWidth={2} />}
            accent="#C47D00"
            delay={140}
          />
        </div>

        {/* Second row — shared + admin-only */}
        <div className="sm:col-span-2 lg:col-span-7">
          <KPICard
            label="Registered beneficiaries"
            value={kpis.totalBeneficiaries}
            sparklineData={kpis.sparklineFlagged.map((v) => v * 180 + 46000)}
            delta={2.4}
            deltaLabel="vs last week"
            icon={<Users size={16} strokeWidth={2} />}
            accent="#4A2BC2"
            delay={210}
          />
        </div>

        {isAdmin && (
          <div className="sm:col-span-2 lg:col-span-5">
            <div
              className="animate-rise grid grid-cols-2 divide-x divide-neutral-200 overflow-hidden rounded-card border border-neutral-200 bg-white"
              style={{ animationDelay: '280ms' }}
            >
              <div className="p-5">
                <div className="flex items-center gap-2 text-neutral-500">
                  <ShieldCheck size={14} strokeWidth={2} />
                  <p className="text-[11px] font-semibold uppercase tracking-[0.1em]">
                    Active officers
                  </p>
                </div>
                <p className="mt-2 font-mono text-3xl font-bold tabular-nums text-neutral-900">34</p>
                <p className="mt-1 text-xs text-neutral-500">across 12 districts</p>
              </div>
              <div className="p-5">
                <div className="flex items-center gap-2 text-neutral-500">
                  <ScrollText size={14} strokeWidth={2} />
                  <p className="text-[11px] font-semibold uppercase tracking-[0.1em]">
                    Audit events
                  </p>
                </div>
                <p className="mt-2 font-mono text-3xl font-bold tabular-nums text-neutral-900">1,284</p>
                <p className="mt-1 text-xs text-neutral-500">last 7 days</p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Recent flags — unboxed table, score as bar, status as dot+label */}
      <section
        className="animate-rise"
        style={{ animationDelay: '350ms' }}
        aria-labelledby="recent-flags-heading"
      >
        <div className="mb-3 flex items-baseline justify-between">
          <h2 id="recent-flags-heading" className="text-base font-semibold text-neutral-900">
            Recent anomaly flags
          </h2>
          <Link
            to="/officer/flags"
            className="text-sm font-medium text-brand-purple hover:underline"
          >
            View all
          </Link>
        </div>

        <div className="overflow-hidden rounded-card border border-neutral-200 bg-white">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-neutral-200 bg-neutral-50/60 text-left">
                  <th scope="col" className="px-5 py-3 text-[11px] font-semibold uppercase tracking-[0.08em] text-neutral-500">
                    Beneficiary
                  </th>
                  <th scope="col" className="px-3 py-3 text-[11px] font-semibold uppercase tracking-[0.08em] text-neutral-500">
                    State
                  </th>
                  <th scope="col" className="px-3 py-3 text-[11px] font-semibold uppercase tracking-[0.08em] text-neutral-500">
                    Flag type
                  </th>
                  <th scope="col" className="px-3 py-3 text-[11px] font-semibold uppercase tracking-[0.08em] text-neutral-500">
                    Score
                  </th>
                  <th scope="col" className="px-3 py-3 text-[11px] font-semibold uppercase tracking-[0.08em] text-neutral-500">
                    Status
                  </th>
                  <th scope="col" className="px-5 py-3 text-right text-[11px] font-semibold uppercase tracking-[0.08em] text-neutral-500">
                    Detected
                  </th>
                </tr>
              </thead>
              <tbody>
                {recentFlags.map((f) => {
                  const st = STATUS_STYLE[f.status!] || STATUS_STYLE.under_review;
                  return (
                    <tr
                      key={f.id}
                      className="group border-b border-neutral-100 last:border-0 transition-colors hover:bg-neutral-50/70"
                    >
                      <td className="px-5 py-3.5">
                        <div className="font-medium text-neutral-900 group-hover:text-brand-purple transition-colors">
                          {f.beneficiaryName}
                        </div>
                        <div className="font-mono text-[11px] text-neutral-400">
                          {maskAadhaar(f.aadhaarLast4!)}
                        </div>
                      </td>
                      <td className="px-3 py-3.5 text-neutral-600">
                        {STATE_NAMES[f.stateCode!] || f.stateCode}
                      </td>
                      <td className="px-3 py-3.5 text-neutral-600">
                        {FLAG_LABELS[f.flagType!] || f.flagType}
                      </td>
                      <td className="px-3 py-3.5">
                        <ScoreBar score={f.anomalyScore!} />
                      </td>
                      <td className="px-3 py-3.5">
                        <span className={`inline-flex items-center gap-1.5 text-xs font-medium ${st.text}`}>
                          <span className={`h-1.5 w-1.5 rounded-full ${st.dot}`} aria-hidden="true" />
                          {(f.status || '').replace('_', ' ')}
                        </span>
                      </td>
                      <td className="px-5 py-3.5 text-right text-xs text-neutral-500 whitespace-nowrap">
                        {formatDate(f.createdAt!)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </section>
    </div>
  );
}
