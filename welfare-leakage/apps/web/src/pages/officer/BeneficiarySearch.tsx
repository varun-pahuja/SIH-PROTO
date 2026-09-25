import { useEffect, useState, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Search, ChevronLeft, ChevronRight } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Input, Select } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import api from '@/utils/api';
import { STATE_NAMES, maskAadhaar, formatCurrency } from '@/utils/constants';
import type { Beneficiary, Paginated } from '@/types';

const FLAG_TYPES = [
  { value: '', label: 'All Flag Types' },
  { value: 'duplicate_aadhaar', label: 'Duplicate Aadhaar' },
  { value: 'dead_beneficiary', label: 'Dead Beneficiary' },
  { value: 'income_mismatch', label: 'Income Mismatch' },
  { value: 'geo_anomaly', label: 'Geo Anomaly' },
  { value: 'multiple_accounts', label: 'Multiple Accounts' },
  { value: 'ineligible_category', label: 'Ineligible Category' },
];

const STATES = [
  { value: '', label: 'All States' },
  ...Object.entries(STATE_NAMES).map(([code, name]) => ({ value: code, label: name })),
];

const SCHEMES = [
  { value: '', label: 'All Schemes' },
  { value: 'pm-kisan', label: 'PM-KISAN' },
  { value: 'pmsby', label: 'PM-Jal Jeevan' },
  { value: 'ayushman', label: 'Ayushman Bharat' },
  { value: 'nsgpy', label: 'NSAP — Old Age Pension' },
  { value: 'midday', label: 'Mid-Day Meal' },
];

export function BeneficiarySearch() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [data, setData] = useState<Paginated<Beneficiary> | null>(null);
  const [loading, setLoading] = useState(true);

  const [query, setQuery] = useState(searchParams.get('q') || '');
  const [state, setState] = useState(searchParams.get('state') || '');
  const [scheme, setScheme] = useState(searchParams.get('scheme') || '');
  const [flagType, setFlagType] = useState(searchParams.get('flagType') || '');
  const page = parseInt(searchParams.get('page') || '1');

  const fetchBeneficiaries = useCallback(async () => {
    setLoading(true);
    try {
      const params: Record<string, string> = { page: String(page), pageSize: '20' };
      if (query) params.q = query;
      if (state) params.state = state;
      if (scheme) params.scheme = scheme;
      if (flagType) params.flagType = flagType;

      const { data: res } = await api.get('/officer/beneficiaries', { params });
      setData(res);
    } catch {
      setData({ data: [], total: 0, page: 1, pageSize: 20, totalPages: 0 });
    } finally {
      setLoading(false);
    }
  }, [query, state, scheme, flagType, page]);

  useEffect(() => {
    fetchBeneficiaries();
  }, [fetchBeneficiaries]);

  const updateParams = (updates: Record<string, string>) => {
    const next = new URLSearchParams(searchParams);
    Object.entries(updates).forEach(([k, v]) => {
      if (v) next.set(k, v);
      else next.delete(k);
    });
    if (!('page' in updates)) next.set('page', '1');
    setSearchParams(next);
  };

  const totalPages = data?.totalPages || 0;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-neutral-900">Beneficiaries</h1>
        <p className="mt-1 text-neutral-500">
          Search and filter welfare beneficiaries across states and schemes
        </p>
      </div>

      <Card>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
          <div className="md:col-span-1">
            <label htmlFor="search" className="mb-1.5 block text-sm font-medium text-neutral-700">Search</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" aria-hidden />
              <input
                id="search"
                type="search"
                placeholder="Name or Aadhaar last-4…"
                value={query}
                onChange={(e) => updateParams({ q: e.target.value })}
                className="h-10 w-full rounded border border-neutral-300 bg-white pl-9 pr-3 text-sm focus:border-saffron focus:outline-none focus:ring-1 focus:ring-saffron"
              />
            </div>
          </div>
          <Select label="State" options={STATES} value={state} onChange={(e) => updateParams({ state: e.target.value })} />
          <Select label="Scheme" options={SCHEMES} value={scheme} onChange={(e) => updateParams({ scheme: e.target.value })} />
          <Select label="Flag Type" options={FLAG_TYPES} value={flagType} onChange={(e) => updateParams({ flagType: e.target.value })} />
        </div>
      </Card>

      <Card>
        {loading ? (
          <div className="space-y-3">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="h-12 animate-pulse rounded bg-neutral-100" />
            ))}
          </div>
        ) : data && data.data.length > 0 ? (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-neutral-200 text-left text-xs font-medium uppercase tracking-wide text-neutral-500">
                    <th className="pb-3 pr-4">Name</th>
                    <th className="pb-3 pr-4">Aadhaar</th>
                    <th className="pb-3 pr-4">State</th>
                    <th className="pb-3 pr-4">Scheme</th>
                    <th className="pb-3 pr-4">Income</th>
                    <th className="pb-3 pr-4">Flags</th>
                    <th className="pb-3 pr-4">Max Score</th>
                    <th className="pb-3">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {data.data.map((b) => (
                    <tr
                      key={b.id}
                      className="cursor-pointer border-b border-neutral-100 transition-colors hover:bg-neutral-50"
                      onClick={() => navigate(`/officer/beneficiaries/${b.id}`)}
                      tabIndex={0}
                      onKeyDown={(e) => e.key === 'Enter' && navigate(`/officer/beneficiaries/${b.id}`)}
                    >
                      <td className="py-3 pr-4 font-medium text-neutral-800">{b.fullName}</td>
                      <td className="py-3 pr-4 font-mono text-xs text-neutral-600">{maskAadhaar(b.aadhaarLast4)}</td>
                      <td className="py-3 pr-4 text-neutral-600">{STATE_NAMES[b.stateCode] || b.stateCode}</td>
                      <td className="py-3 pr-4 text-neutral-600">{b.schemeName}</td>
                      <td className="py-3 pr-4 text-neutral-600">{formatCurrency(b.annualIncome)}</td>
                      <td className="py-3 pr-4">
                        {b.flagCount > 0 ? (
                          <Badge variant="high">{b.flagCount}</Badge>
                        ) : (
                          <span className="text-neutral-400">—</span>
                        )}
                      </td>
                      <td className="py-3 pr-4">
                        {b.maxAnomalyScore > 0 ? (
                          <span className="font-mono font-semibold" style={{ color: b.maxAnomalyScore >= 80 ? '#DB372D' : b.maxAnomalyScore >= 60 ? '#C47D00' : '#13C2C2' }}>
                            {b.maxAnomalyScore.toFixed(1)}
                          </span>
                        ) : (
                          <span className="text-neutral-400">—</span>
                        )}
                      </td>
                      <td className="py-3">
                        <Badge variant={b.isActive ? 'resolved' : 'neutral'}>
                          {b.isActive ? 'Active' : 'Inactive'}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="mt-4 flex items-center justify-between text-sm text-neutral-500">
              <p>
                Showing {(page - 1) * data.pageSize + 1}–{Math.min(page * data.pageSize, data.total)} of {data.total.toLocaleString()}
              </p>
              <div className="flex gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  disabled={page <= 1}
                  onClick={() => updateParams({ page: String(page - 1) })}
                >
                  <ChevronLeft size={16} /> Prev
                </Button>
                <span className="flex items-center px-2 text-neutral-600">
                  {page} / {totalPages}
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  disabled={page >= totalPages}
                  onClick={() => updateParams({ page: String(page + 1) })}
                >
                  Next <ChevronRight size={16} />
                </Button>
              </div>
            </div>
          </>
        ) : (
          <div className="py-12 text-center text-neutral-500">
            <p className="text-lg font-medium text-neutral-700">No beneficiaries found</p>
            <p className="mt-1 text-sm">Try adjusting your search filters</p>
          </div>
        )}
      </Card>
    </div>
  );
}
