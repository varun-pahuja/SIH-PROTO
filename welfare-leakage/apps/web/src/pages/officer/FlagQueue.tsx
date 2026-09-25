import { useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Badge, SLAChip } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { STATE_NAMES, formatDateTime, maskAadhaar } from '@/utils/constants';
import type { Flag } from '@/types';

const mockFlags: Flag[] = [
  { id: 'f1', beneficiaryId: 'b1', beneficiaryName: 'Ramesh Kumar Sharma', aadhaarLast4: '4821', stateCode: 'MH', schemeName: 'PM-KISAN', flagType: 'income_mismatch', anomalyScore: 92.4, confidence: 0.94, reasons: [], status: 'under_review', severity: 'high', assignedTo: null, assignedToName: 'You', resolutionNote: null, resolvedBy: null, resolvedAt: null, slaDeadline: new Date(Date.now() + 18 * 3600000).toISOString(), createdAt: new Date(Date.now() - 7200000).toISOString(), updatedAt: new Date().toISOString() },
  { id: 'f2', beneficiaryId: 'b2', beneficiaryName: 'Sunita Devi', aadhaarLast4: '1156', stateCode: 'UP', schemeName: 'NSAP', flagType: 'duplicate_aadhaar', anomalyScore: 87.1, confidence: 0.91, reasons: [], status: 'confirmed', severity: 'high', assignedTo: null, assignedToName: 'You', resolutionNote: null, resolvedBy: null, resolvedAt: null, slaDeadline: new Date(Date.now() + 6 * 3600000).toISOString(), createdAt: new Date(Date.now() - 14400000).toISOString(), updatedAt: new Date().toISOString() },
  { id: 'f3', beneficiaryId: 'b3', beneficiaryName: 'Arjun Patel', aadhaarLast4: '9903', stateCode: 'GJ', schemeName: 'Ayushman Bharat', flagType: 'dead_beneficiary', anomalyScore: 95.8, confidence: 0.97, reasons: [], status: 'under_review', severity: 'high', assignedTo: null, assignedToName: null, resolutionNote: null, resolvedBy: null, resolvedAt: null, slaDeadline: new Date(Date.now() - 2 * 3600000).toISOString(), createdAt: new Date(Date.now() - 28800000).toISOString(), updatedAt: new Date().toISOString() },
  { id: 'f4', beneficiaryId: 'b4', beneficiaryName: 'Lakshmi Reddy', aadhaarLast4: '7742', stateCode: 'AP', schemeName: 'PM-KISAN', flagType: 'geo_anomaly', anomalyScore: 64.3, confidence: 0.78, reasons: [], status: 'resolved', severity: 'medium', assignedTo: null, assignedToName: 'You', resolutionNote: 'Verified with district officer — beneficiary relocated, records updated.', resolvedBy: 'officer-1', resolvedAt: new Date(Date.now() - 3600000).toISOString(), slaDeadline: new Date(Date.now() - 7200000).toISOString(), createdAt: new Date(Date.now() - 86400000).toISOString(), updatedAt: new Date(Date.now() - 3600000).toISOString() },
  { id: 'f5', beneficiaryId: 'b5', beneficiaryName: 'Mohammed Irfan', aadhaarLast4: '3309', stateCode: 'BR', schemeName: 'Mid-Day Meal', flagType: 'multiple_accounts', anomalyScore: 78.9, confidence: 0.85, reasons: [], status: 'confirmed', severity: 'medium', assignedTo: null, assignedToName: null, resolutionNote: null, resolvedBy: null, resolvedAt: null, slaDeadline: new Date(Date.now() + 48 * 3600000).toISOString(), createdAt: new Date(Date.now() - 43200000).toISOString(), updatedAt: new Date().toISOString() },
  { id: 'f6', beneficiaryId: 'b6', beneficiaryName: 'Priya Singh', aadhaarLast4: '6612', stateCode: 'RJ', schemeName: 'Ayushman Bharat', flagType: 'ineligible_category', anomalyScore: 71.2, confidence: 0.82, reasons: [], status: 'under_review', severity: 'medium', assignedTo: null, assignedToName: null, resolutionNote: null, resolvedBy: null, resolvedAt: null, slaDeadline: new Date(Date.now() + 30 * 3600000).toISOString(), createdAt: new Date(Date.now() - 21600000).toISOString(), updatedAt: new Date().toISOString() },
  { id: 'f7', beneficiaryId: 'b7', beneficiaryName: 'Vijay Yadav', aadhaarLast4: '2247', stateCode: 'UP', schemeName: 'PM-KISAN', flagType: 'income_mismatch', anomalyScore: 88.5, confidence: 0.89, reasons: [], status: 'resolved', severity: 'high', assignedTo: null, assignedToName: 'You', resolutionNote: 'Confirmed leakage — amount recovered from account.', resolvedBy: 'officer-1', resolvedAt: new Date(Date.now() - 7200000).toISOString(), slaDeadline: new Date(Date.now() - 14400000).toISOString(), createdAt: new Date(Date.now() - 172800000).toISOString(), updatedAt: new Date(Date.now() - 7200000).toISOString() },
];

const COLUMNS = [
  { key: 'under_review' as const, label: 'Under Review', accent: '#C47D00' },
  { key: 'confirmed' as const, label: 'Confirmed', accent: '#DB372D' },
  { key: 'resolved' as const, label: 'Resolved', accent: '#128937' },
];

export function FlagQueue() {
  const [flags, setFlags] = useState<Flag[]>(mockFlags);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [dragId, setDragId] = useState<string | null>(null);

  const moveFlag = (flagId: string, newStatus: Flag['status']) => {
    setFlags((prev) =>
      prev.map((f) =>
        f.id === flagId
          ? { ...f, status: newStatus, updatedAt: new Date().toISOString() }
          : f
      )
    );
  };

  const bulkMove = (newStatus: Flag['status']) => {
    setFlags((prev) =>
      prev.map((f) =>
        selected.has(f.id) ? { ...f, status: newStatus, updatedAt: new Date().toISOString() } : f
      )
    );
    setSelected(new Set());
  };

  const toggleSelect = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-neutral-900">Flag Queue</h1>
          <p className="mt-1 text-neutral-500">
            Review, confirm, and resolve anomaly flags — {flags.length} total
          </p>
        </div>
        {selected.size > 0 && (
          <div className="flex gap-2">
            <span className="flex items-center text-sm text-neutral-500">{selected.size} selected</span>
            <Button size="sm" variant="secondary" onClick={() => bulkMove('confirmed')}>Confirm All</Button>
            <Button size="sm" onClick={() => bulkMove('resolved')}>Resolve All</Button>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        {COLUMNS.map((col) => {
          const colFlags = flags.filter((f) => f.status === col.key);
          return (
            <div
              key={col.key}
              className="flex min-h-[400px] flex-col rounded-card border border-neutral-200 bg-neutral-100"
              onDragOver={(e) => e.preventDefault()}
              onDrop={() => {
                if (dragId) moveFlag(dragId, col.key);
                setDragId(null);
              }}
            >
              <div className="flex items-center justify-between border-b border-neutral-200 px-4 py-3">
                <div className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full" style={{ backgroundColor: col.accent }} aria-hidden />
                  <h2 className="text-sm font-semibold text-neutral-800">{col.label}</h2>
                </div>
                <span className="rounded-full bg-neutral-200 px-2 py-0.5 text-xs font-medium text-neutral-600">
                  {colFlags.length}
                </span>
              </div>
              <div className="flex-1 space-y-3 p-3">
                {colFlags.map((f) => (
                  <div
                    key={f.id}
                    draggable
                    onDragStart={() => setDragId(f.id)}
                    onDragEnd={() => setDragId(null)}
                    className={`cursor-grab rounded-card border bg-white p-4 shadow-sm transition-shadow hover:shadow-md active:cursor-grabbing ${
                      selected.has(f.id) ? 'border-brand-purple ring-1 ring-brand-purple' : 'border-neutral-200'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <label className="flex cursor-pointer items-center gap-2">
                        <input
                          type="checkbox"
                          checked={selected.has(f.id)}
                          onChange={() => toggleSelect(f.id)}
                          className="h-4 w-4 rounded border-neutral-300 accent-[#4A2BC2]"
                          aria-label={`Select ${f.beneficiaryName}`}
                        />
                        <span className="text-sm font-medium text-neutral-800">{f.beneficiaryName}</span>
                      </label>
                      <Badge variant={f.severity === 'high' ? 'high' : f.severity === 'medium' ? 'medium' : 'low'}>
                        {f.severity}
                      </Badge>
                    </div>
                    <p className="mt-1 font-mono text-xs text-neutral-500">
                      {maskAadhaar(f.aadhaarLast4)} · {STATE_NAMES[f.stateCode]}
                    </p>
                    <p className="mt-1 text-xs text-neutral-600">
                      {f.flagType.replace(/_/g, ' ')} · {f.schemeName}
                    </p>
                    <div className="mt-2 flex items-center justify-between">
                      <span className="font-mono text-xs font-bold" style={{ color: f.anomalyScore >= 80 ? '#DB372D' : '#C47D00' }}>
                        {f.anomalyScore.toFixed(1)}
                      </span>
                      <SLAChip deadline={f.slaDeadline} />
                    </div>
                    <p className="mt-1 text-xs text-neutral-400">{formatDateTime(f.createdAt)}</p>
                  </div>
                ))}
                {colFlags.length === 0 && (
                  <p className="py-8 text-center text-sm text-neutral-400">Drop cards here</p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
