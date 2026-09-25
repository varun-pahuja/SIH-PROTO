import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Download } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Badge, SLAChip } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import api from '@/utils/api';
import { STATE_NAMES, maskAadhaar, formatCurrency, formatDate, formatDateTime, getScoreZone } from '@/utils/constants';
import type { BeneficiaryDetail } from '@/types';

// Mock data for demo when API not available
const mockDetail: BeneficiaryDetail = {
  id: 'b1',
  aadhaarLast4: '4821',
  fullName: 'Ramesh Kumar Sharma',
  gender: 'M',
  dateOfBirth: '1978-03-15',
  stateCode: 'MH',
  district: 'Pune',
  schemeId: 'pm-kisan',
  schemeName: 'PM-KISAN',
  annualIncome: 1200000,
  category: 'general',
  bankAccountLast4: '7834',
  ifsc: 'HDFC0001234',
  isActive: true,
  flagCount: 2,
  maxAnomalyScore: 92.4,
  createdAt: '2023-06-15T10:00:00Z',
  dbtTransactions: [
    { id: 't1', instalmentNo: 12, amount: 2000, status: 'success', utrNumber: 'UTR20260912001', disbursedAt: '2026-08-15T00:00:00Z' },
    { id: 't2', instalmentNo: 11, amount: 2000, status: 'success', utrNumber: 'UTR20260512001', disbursedAt: '2026-05-15T00:00:00Z' },
    { id: 't3', instalmentNo: 10, amount: 2000, status: 'failed', utrNumber: 'UTR20260212001', disbursedAt: '2026-02-15T00:00:00Z' },
    { id: 't4', instalmentNo: 9, amount: 2000, status: 'success', utrNumber: 'UTR20251112001', disbursedAt: '2025-11-15T00:00:00Z' },
    { id: 't5', instalmentNo: 8, amount: 2000, status: 'success', utrNumber: 'UTR20250812001', disbursedAt: '2025-08-15T00:00:00Z' },
  ],
  flags: [
    {
      id: 'f1', beneficiaryId: 'b1', beneficiaryName: '', aadhaarLast4: '4821', stateCode: 'MH',
      schemeName: 'PM-KISAN', flagType: 'income_mismatch', anomalyScore: 92.4, confidence: 0.94,
      reasons: [],
      status: 'under_review', severity: 'high',
      assignedTo: null, assignedToName: null, resolutionNote: null,
      resolvedBy: null, resolvedAt: null,
      slaDeadline: new Date(Date.now() + 18 * 3600000).toISOString(),
      createdAt: new Date(Date.now() - 7200000).toISOString(),
      updatedAt: new Date(Date.now() - 7200000).toISOString(),
    },
    {
      id: 'f2', beneficiaryId: 'b1', beneficiaryName: '', aadhaarLast4: '4821', stateCode: 'MH',
      schemeName: 'PM-KISAN', flagType: 'geo_anomaly', anomalyScore: 64.3, confidence: 0.78,
      reasons: [],
      status: 'confirmed', severity: 'medium',
      assignedTo: null, assignedToName: null, resolutionNote: null,
      resolvedBy: null, resolvedAt: null,
      slaDeadline: new Date(Date.now() + 40 * 3600000).toISOString(),
      createdAt: new Date(Date.now() - 14400000).toISOString(),
      updatedAt: new Date(Date.now() - 14400000).toISOString(),
    },
  ],
  reasons: [
    { feature: 'Annual income', contribution: 0.34, explanation: 'Reported annual income ₹12,00,000 but availing category-based benefits for income < ₹80,000' },
    { feature: 'Geo location', contribution: 0.21, explanation: 'IP login geolocation (Karnataka) differs from registered state (Maharashtra) — 3 consecutive sessions' },
    { feature: 'Account age', contribution: 0.18, explanation: 'Bank account seeded only 15 days before first DBT credit — unusual pattern' },
    { feature: 'Transaction pattern', contribution: 0.15, explanation: 'Received full instalment amount within 2 hours of credit — immediate transfer detected' },
    { feature: 'Duplicate mobile', contribution: 0.12, explanation: 'Same mobile number linked to 3 other beneficiaries in same district' },
  ],
};

function AnomalyGauge({ score }: { score: number }) {
  const zone = getScoreZone(score);
  const circumference = 2 * Math.PI * 70;
  const offset = circumference - (score / 100) * circumference;

  return (
    <div className="flex flex-col items-center">
      <svg width="180" height="180" viewBox="0 0 180 180" role="img" aria-label={`Anomaly score ${score.toFixed(1)} out of 100 — ${zone.label}`}>
        <circle cx="90" cy="90" r="70" fill="none" stroke="#E9ECEF" strokeWidth="14" />
        <circle
          cx="90" cy="90" r="70" fill="none"
          stroke={zone.color}
          strokeWidth="14"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          transform="rotate(-90 90 90)"
          style={{ transition: 'stroke-dashoffset 1s ease' }}
        />
        <text x="90" y="85" textAnchor="middle" className="font-mono" fontSize="32" fontWeight="700" fill="#212529">
          {score.toFixed(1)}
        </text>
        <text x="90" y="110" textAnchor="middle" fontSize="12" fill={zone.color} fontWeight="600">
          {zone.label.toUpperCase()}
        </text>
      </svg>
      <p className="text-xs text-neutral-500">Anomaly Score (0–100)</p>
    </div>
  );
}

export function BeneficiaryDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [detail, setDetail] = useState<BeneficiaryDetail | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get(`/officer/beneficiaries/${id}`)
      .then(({ data }) => setDetail(data))
      .catch(() => setDetail(mockDetail))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="h-8 w-64 animate-pulse rounded bg-neutral-100" />
        <div className="h-96 animate-pulse rounded-card bg-neutral-100" />
      </div>
    );
  }

  if (!detail) return <p className="text-neutral-500">Beneficiary not found.</p>;

  const maxScore = detail.flags.reduce((m, f) => Math.max(m, f.anomalyScore), 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" onClick={() => navigate('/officer/beneficiaries')}>
            <ArrowLeft size={16} /> Back
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-neutral-900">{detail.fullName}</h1>
            <p className="text-sm text-neutral-500">
              {maskAadhaar(detail.aadhaarLast4)} · {STATE_NAMES[detail.stateCode]} · {detail.district}
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="secondary" size="sm">
            <Download size={14} /> Export
          </Button>
          <Button variant="danger" size="sm">Flag Beneficiary</Button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Left: Profile */}
        <div className="space-y-6">
          <Card title="Profile">
            <dl className="space-y-3 text-sm">
              {[
                ['Gender', detail.gender === 'M' ? 'Male' : detail.gender === 'F' ? 'Female' : 'Other'],
                ['Date of Birth', formatDate(detail.dateOfBirth)],
                ['Aadhaar', maskAadhaar(detail.aadhaarLast4)],
                ['Category', detail.category.toUpperCase()],
                ['Annual Income', formatCurrency(detail.annualIncome)],
                ['Scheme', detail.schemeName],
                ['Bank A/C', `XXXX-${detail.bankAccountLast4}`],
                ['IFSC', detail.ifsc],
                ['Status', detail.isActive ? 'Active' : 'Inactive'],
              ].map(([k, v]) => (
                <div key={k} className="flex justify-between border-b border-neutral-100 pb-2">
                  <dt className="text-neutral-500">{k}</dt>
                  <dd className={`font-medium text-neutral-800 ${k === 'Aadhaar' || k === 'Bank A/C' || k === 'IFSC' ? 'font-mono' : ''}`}>{v}</dd>
                </div>
              ))}
            </dl>
          </Card>
        </div>

        {/* Center: Anomaly Gauge + Reasons */}
        <div className="space-y-6 lg:col-span-2">
          <Card title="Anomaly Analysis">
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <AnomalyGauge score={maxScore} />
              <div className="space-y-3">
                <p className="text-sm font-medium text-neutral-700">Explainable Flag Reasons</p>
                {detail.reasons.map((r, i) => (
                  <div key={i} className="rounded-lg border border-neutral-200 p-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-neutral-800">{r.feature}</span>
                      <span className="font-mono text-xs font-semibold text-brand-purple">
                        {(r.contribution * 100).toFixed(0)}%
                      </span>
                    </div>
                    <div className="mt-1 h-1.5 rounded-full bg-neutral-100">
                      <div
                        className="h-1.5 rounded-full bg-brand-purple"
                        style={{ width: `${r.contribution * 100}%` }}
                      />
                    </div>
                    <p className="mt-1.5 text-xs text-neutral-600">{r.explanation}</p>
                  </div>
                ))}
              </div>
            </div>
          </Card>

          {/* Active Flags */}
          <Card title={`Active Flags (${detail.flags.length})`}>
            <div className="space-y-3">
              {detail.flags.map((f) => (
                <div key={f.id} className="flex items-center justify-between rounded-lg border border-neutral-200 p-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <Badge variant={f.severity === 'high' ? 'high' : f.severity === 'medium' ? 'medium' : 'low'}>
                        {f.severity}
                      </Badge>
                      <span className="font-medium text-neutral-800">
                        {f.flagType.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())}
                      </span>
                    </div>
                    <p className="mt-1 text-xs text-neutral-500">
                      Score: <span className="font-mono font-semibold">{f.anomalyScore.toFixed(1)}</span> ·
                      Confidence: <span className="font-mono">{(f.confidence * 100).toFixed(0)}%</span> ·
                      Detected: {formatDateTime(f.createdAt)}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <SLAChip deadline={f.slaDeadline} />
                    <Badge variant={f.status === 'resolved' ? 'resolved' : f.status === 'confirmed' ? 'high' : 'medium'}>
                      {f.status.replace('_', ' ')}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* DBT History */}
          <Card title="DBT Transaction History">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-neutral-200 text-left text-xs font-medium uppercase tracking-wide text-neutral-500">
                    <th className="pb-3 pr-4">#</th>
                    <th className="pb-3 pr-4">Amount</th>
                    <th className="pb-3 pr-4">Status</th>
                    <th className="pb-3 pr-4">UTR</th>
                    <th className="pb-3">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {detail.dbtTransactions.map((t) => (
                    <tr key={t.id} className="border-b border-neutral-100 hover:bg-neutral-50">
                      <td className="py-3 pr-4 text-neutral-600">#{t.instalmentNo}</td>
                      <td className="py-3 pr-4 font-medium text-neutral-800">{formatCurrency(t.amount)}</td>
                      <td className="py-3 pr-4">
                        <Badge variant={t.status === 'success' ? 'resolved' : t.status === 'failed' ? 'high' : 'medium'}>
                          {t.status}
                        </Badge>
                      </td>
                      <td className="py-3 pr-4 font-mono text-xs text-neutral-500">{t.utrNumber}</td>
                      <td className="py-3 text-neutral-600">{formatDate(t.disbursedAt)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
