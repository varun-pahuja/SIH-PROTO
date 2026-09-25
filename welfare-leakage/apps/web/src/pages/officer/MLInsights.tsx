import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import api from '@/utils/api';
import { formatDateTime, STATE_NAMES } from '@/utils/constants';
import type { MLInsights } from '@/types';

const mockInsights: MLInsights = {
  featureImportance: [
    { feature: 'Income Mismatch', importance: 0.34 },
    { feature: 'Geo Anomaly', importance: 0.21 },
    { feature: 'Duplicate Aadhaar', importance: 0.18 },
    { feature: 'Account Age', importance: 0.12 },
    { feature: 'Transaction Pattern', importance: 0.08 },
    { feature: 'Category Eligibility', importance: 0.07 },
  ],
  metrics: {
    precision: 0.91,
    recall: 0.87,
    f1: 0.89,
    auc: 0.94,
    samplesTrained: 48720,
  },
  recentDetections: [
    { id: 'd1', beneficiaryName: 'Arjun Patel', flagType: 'dead_beneficiary', score: 95.8, detectedAt: new Date(Date.now() - 3600000).toISOString() },
    { id: 'd2', beneficiaryName: 'Ramesh Kumar', flagType: 'income_mismatch', score: 92.4, detectedAt: new Date(Date.now() - 7200000).toISOString() },
    { id: 'd3', beneficiaryName: 'Vijay Yadav', flagType: 'income_mismatch', score: 88.5, detectedAt: new Date(Date.now() - 14400000).toISOString() },
    { id: 'd4', beneficiaryName: 'Sunita Devi', flagType: 'duplicate_aadhaar', score: 87.1, detectedAt: new Date(Date.now() - 21600000).toISOString() },
    { id: 'd5', beneficiaryName: 'Mohammed Irfan', flagType: 'multiple_accounts', score: 78.9, detectedAt: new Date(Date.now() - 43200000).toISOString() },
  ],
};

const METRIC_LABELS: Record<string, string> = {
  precision: 'Precision',
  recall: 'Recall',
  f1: 'F1 Score',
  auc: 'AUC-ROC',
};

export function MLInsights() {
  const [insights, setInsights] = useState(mockInsights);

  useEffect(() => {
    api.get('/officer/ml-insights')
      .then(({ data }) => setInsights(data))
      .catch(() => {});
  }, []);

  const maxImportance = Math.max(...insights.featureImportance.map((f) => f.importance));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-neutral-900">ML Model Insights</h1>
        <p className="mt-1 text-neutral-500">
          Isolation Forest anomaly detection — feature importance and model performance
        </p>
      </div>

      {/* Metrics tiles */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {Object.entries(insights.metrics)
          .filter(([k]) => k !== 'samplesTrained')
          .map(([key, value]) => (
            <div key={key} className="rounded-card border border-neutral-200 bg-white p-5 text-center">
              <p className="text-xs font-medium uppercase tracking-wide text-neutral-500">
                {METRIC_LABELS[key] || key}
              </p>
              <p className="mt-2 font-mono text-3xl font-bold text-brand-purple">
                {(value * 100).toFixed(0)}%
              </p>
              <div className="mx-auto mt-2 h-1.5 w-24 rounded-full bg-neutral-100">
                <div
                  className="h-1.5 rounded-full bg-brand-purple"
                  style={{ width: `${value * 100}%` }}
                />
              </div>
            </div>
          ))}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Feature Importance */}
        <Card title="Feature Importance">
          <div className="space-y-4">
            {insights.featureImportance.map((f) => (
              <div key={f.feature}>
                <div className="flex justify-between text-sm">
                  <span className="font-medium text-neutral-700">{f.feature}</span>
                  <span className="font-mono text-brand-purple">{f.importance.toFixed(2)}</span>
                </div>
                <div className="mt-1 h-3 rounded-full bg-neutral-100">
                  <div
                    className="h-3 rounded-full transition-all duration-700"
                    style={{
                      width: `${(f.importance / maxImportance) * 100}%`,
                      backgroundColor: '#4A2BC2',
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
          <p className="mt-4 text-xs text-neutral-400">
            Trained on {insights.metrics.samplesTrained.toLocaleString()} synthetic beneficiary records.
            Model: Isolation Forest (scikit-learn) — scores pre-computed for prototype.
          </p>
        </Card>

        {/* Recent Detections */}
        <Card title="Recent Detections">
          <div className="space-y-3">
            {insights.recentDetections.map((d) => (
              <div key={d.id} className="flex items-center justify-between rounded-lg border border-neutral-200 p-3">
                <div>
                  <p className="text-sm font-medium text-neutral-800">{d.beneficiaryName}</p>
                  <p className="text-xs text-neutral-500">
                    {d.flagType.replace(/_/g, ' ')} · {formatDateTime(d.detectedAt)}
                  </p>
                </div>
                <span
                  className="font-mono text-lg font-bold"
                  style={{ color: d.score >= 80 ? '#DB372D' : '#C47D00' }}
                >
                  {d.score.toFixed(1)}
                </span>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Detection Log */}
      <Card title="Detection Methodology">
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 text-sm text-neutral-600">
          <div>
            <h4 className="mb-2 font-semibold text-neutral-800">Algorithm</h4>
            <ul className="space-y-1 list-disc list-inside">
              <li>Isolation Forest (unsupervised anomaly detection)</li>
              <li>6 features: income, geo, Aadhaar dup, account age, txn pattern, category</li>
              <li>Contamination parameter: 0.05 (5% expected anomaly rate)</li>
              <li>Anomaly score normalized to 0–100 scale</li>
            </ul>
          </div>
          <div>
            <h4 className="mb-2 font-semibold text-neutral-800">Flag Decision Logic</h4>
            <ul className="space-y-1 list-disc list-inside">
              <li>Score ≥ 80: <strong className="text-danger">High</strong> — immediate review</li>
              <li>Score 60–79: <strong className="text-saffron">Medium</strong> — queue review</li>
              <li>Score 40–59: <strong className="text-info-cyan">Low</strong> — monitor</li>
              <li>Confidence = model certainty (tree agreement)</li>
            </ul>
          </div>
        </div>
      </Card>
    </div>
  );
}
