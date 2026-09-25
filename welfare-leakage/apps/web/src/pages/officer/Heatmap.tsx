import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/Card';
import api from '@/utils/api';
import { STATE_NAMES } from '@/utils/constants';
import type { HeatmapEntry } from '@/types';

const mockHeatmap: HeatmapEntry[] = [
  { stateCode: 'UP', stateName: 'Uttar Pradesh', flagCount: 47, avgAnomalyScore: 78.2, beneficiaries: 8420, leakRate: 0.56 },
  { stateCode: 'MH', stateName: 'Maharashtra', flagCount: 38, avgAnomalyScore: 74.5, beneficiaries: 7180, leakRate: 0.53 },
  { stateCode: 'BR', stateName: 'Bihar', flagCount: 34, avgAnomalyScore: 81.3, beneficiaries: 6540, leakRate: 0.52 },
  { stateCode: 'MP', stateName: 'Madhya Pradesh', flagCount: 29, avgAnomalyScore: 72.1, beneficiaries: 5890, leakRate: 0.49 },
  { stateCode: 'RJ', stateName: 'Rajasthan', flagCount: 25, avgAnomalyScore: 69.8, beneficiaries: 5120, leakRate: 0.49 },
  { stateCode: 'WB', stateName: 'West Bengal', flagCount: 22, avgAnomalyScore: 66.4, beneficiaries: 4780, leakRate: 0.46 },
  { stateCode: 'TN', stateName: 'Tamil Nadu', flagCount: 18, avgAnomalyScore: 58.9, beneficiaries: 4210, leakRate: 0.43 },
  { stateCode: 'GJ', stateName: 'Gujarat', flagCount: 16, avgAnomalyScore: 63.2, beneficiaries: 3860, leakRate: 0.41 },
  { stateCode: 'AP', stateName: 'Andhra Pradesh', flagCount: 14, avgAnomalyScore: 61.7, beneficiaries: 3450, leakRate: 0.41 },
  { stateCode: 'KA', stateName: 'Karnataka', flagCount: 12, avgAnomalyScore: 57.3, beneficiaries: 3120, leakRate: 0.38 },
  { stateCode: 'JH', stateName: 'Jharkhand', flagCount: 11, avgAnomalyScore: 74.6, beneficiaries: 2840, leakRate: 0.39 },
  { stateCode: 'OD', stateName: 'Odisha', flagCount: 9, avgAnomalyScore: 55.1, beneficiaries: 2560, leakRate: 0.35 },
  { stateCode: 'CG', stateName: 'Chhattisgarh', flagCount: 8, avgAnomalyScore: 68.4, beneficiaries: 2180, leakRate: 0.37 },
  { stateCode: 'KL', stateName: 'Kerala', flagCount: 5, avgAnomalyScore: 48.2, beneficiaries: 1940, leakRate: 0.26 },
  { stateCode: 'TS', stateName: 'Telangana', flagCount: 7, avgAnomalyScore: 52.6, beneficiaries: 1870, leakRate: 0.37 },
];

function getBarColor(rate: number): string {
  if (rate >= 0.5) return '#DB372D';
  if (rate >= 0.45) return '#C47D00';
  if (rate >= 0.4) return '#E8A800';
  return '#128937';
}

export function Heatmap() {
  const [data, setData] = useState(mockHeatmap);
  const [metric, setMetric] = useState<'leakRate' | 'flagCount' | 'avgAnomalyScore'>('leakRate');

  useEffect(() => {
    api.get('/officer/heatmap')
      .then(({ data: res }) => {
        if (Array.isArray(res) && res.length > 0) setData(res);
      })
      .catch(() => {});
  }, []);

  const maxValue = Math.max(...data.map((d) => d[metric]));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-neutral-900">Anomaly Heatmap</h1>
          <p className="mt-1 text-neutral-500">State-wise welfare leakage density</p>
        </div>
        <div className="flex gap-1 rounded-lg bg-neutral-100 p-1" role="tablist" aria-label="Metric selector">
          {([
            ['leakRate', 'Leak Rate'],
            ['flagCount', 'Flag Count'],
            ['avgAnomalyScore', 'Avg Score'],
          ] as const).map(([key, label]) => (
            <button
              key={key}
              role="tab"
              aria-selected={metric === key}
              onClick={() => setMetric(key)}
              className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
                metric === key ? 'bg-white text-brand-purple shadow-sm' : 'text-neutral-500 hover:text-neutral-700'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      <Card>
        <div className="space-y-2" role="list" aria-label="State leakage density chart">
          {data
            .sort((a, b) => b[metric] - a[metric])
            .map((entry) => {
              const value = entry[metric];
              const pct = (value / maxValue) * 100;
              const displayValue =
                metric === 'leakRate'
                  ? `${(entry.leakRate * 100).toFixed(1)}%`
                  : metric === 'avgAnomalyScore'
                    ? entry.avgAnomalyScore.toFixed(1)
                    : String(entry.flagCount);

              return (
                <div key={entry.stateCode} className="flex items-center gap-3" role="listitem">
                  <span className="w-36 shrink-0 text-right text-sm font-medium text-neutral-700">
                    {entry.stateName}
                  </span>
                  <div className="relative h-8 flex-1 rounded bg-neutral-100" aria-label={`${entry.stateName}: ${displayValue}`}>
                    <div
                      className="absolute left-0 top-0 flex h-8 items-center rounded transition-all duration-500"
                      style={{
                        width: `${Math.max(pct, 3)}%`,
                        backgroundColor: metric === 'leakRate' ? getBarColor(entry.leakRate) : '#4A2BC2',
                      }}
                    >
                      <span className="ml-2 text-xs font-semibold text-white">{displayValue}</span>
                    </div>
                  </div>
                  <span className="w-20 shrink-0 text-xs text-neutral-500">
                    {entry.beneficiaries.toLocaleString()} ben.
                  </span>
                </div>
              );
            })}
        </div>

        <div className="mt-6 flex items-center gap-4 text-xs text-neutral-500" aria-label="Legend">
          <span className="font-medium text-neutral-600">Legend:</span>
          <span className="flex items-center gap-1"><span className="h-3 w-3 rounded" style={{ backgroundColor: '#DB372D' }} /> Critical (≥50%)</span>
          <span className="flex items-center gap-1"><span className="h-3 w-3 rounded" style={{ backgroundColor: '#C47D00' }} /> High (45–50%)</span>
          <span className="flex items-center gap-1"><span className="h-3 w-3 rounded" style={{ backgroundColor: '#E8A800' }} /> Medium (40–45%)</span>
          <span className="flex items-center gap-1"><span className="h-3 w-3 rounded" style={{ backgroundColor: '#128937' }} /> Low (&lt;40%)</span>
        </div>
      </Card>
    </div>
  );
}
