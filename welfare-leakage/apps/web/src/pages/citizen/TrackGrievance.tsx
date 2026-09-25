import { useState, FormEvent } from 'react';
import { Search, CheckCircle, Clock, AlertCircle, FileText } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';

interface TimelineEvent {
  status: string;
  timestamp: string;
  note: string;
}

interface TrackedGrievance {
  trackingId: string;
  schemeName: string;
  issueType: string;
  status: 'submitted' | 'under_review' | 'resolved';
  createdAt: string;
  timeline: TimelineEvent[];
}

const MOCK_RESULT: TrackedGrievance = {
  trackingId: 'GRV-2026-48291',
  schemeName: 'PM-KISAN',
  issueType: 'Payment Not Received',
  status: 'under_review',
  createdAt: '2026-09-20T10:30:00Z',
  timeline: [
    { status: 'submitted', timestamp: '2026-09-20T10:30:00Z', note: 'Grievance received and assigned tracking ID' },
    { status: 'under_review', timestamp: '2026-09-22T14:15:00Z', note: 'Assigned to district welfare officer for verification' },
  ],
};

const STATUS_CONFIG: Record<string, { icon: typeof CheckCircle; color: string; bg: string; label: string }> = {
  submitted: { icon: FileText, color: '#13C2C2', bg: '#E6FCFC', label: 'Submitted' },
  under_review: { icon: Clock, color: '#C47D00', bg: '#FFF8E7', label: 'Under Review' },
  resolved: { icon: CheckCircle, color: '#128937', bg: '#E8F5ED', label: 'Resolved' },
};

export function TrackGrievance() {
  const [trackingId, setTrackingId] = useState('');
  const [aadhaarLast4, setAadhaarLast4] = useState('');
  const [result, setResult] = useState<TrackedGrievance | null>(null);
  const [notFound, setNotFound] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSearch = async (e: FormEvent) => {
    e.preventDefault();
    if (!trackingId || !/^\d{4}$/.test(aadhaarLast4)) {
      return;
    }
    setLoading(true);
    setNotFound(false);
    setResult(null);

    try {
      const { default: api } = await import('@/utils/api');
      const { data } = await api.get('/citizen/grievance', {
        params: { trackingId, aadhaarLast4 },
      });
      setResult(data);
    } catch {
      // Demo: return mock result for any valid-looking input
      if (trackingId.startsWith('GRV-')) {
        setResult({ ...MOCK_RESULT, trackingId });
      } else {
        setNotFound(true);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-neutral-900">Track Grievance</h1>
        <p className="mt-1 text-sm text-neutral-500">
          Enter your tracking ID and Aadhaar last-4 to check status
        </p>
      </div>

      <Card>
        <form onSubmit={handleSearch} className="flex flex-col gap-4 sm:flex-row sm:items-end">
          <div className="flex-1">
            <Input
              label="Tracking ID"
              value={trackingId}
              onChange={(e) => setTrackingId(e.target.value.toUpperCase())}
              placeholder="GRV-2026-XXXXX"
              className="font-mono"
              required
            />
          </div>
          <div className="w-40">
            <Input
              label="Aadhaar Last-4"
              value={aadhaarLast4}
              onChange={(e) => setAadhaarLast4(e.target.value.replace(/\D/g, '').slice(0, 4))}
              placeholder="0000"
              maxLength={4}
              inputMode="numeric"
              className="font-mono tracking-widest"
              required
            />
          </div>
          <Button type="submit" disabled={loading}>
            <Search size={16} />
            {loading ? 'Searching…' : 'Track'}
          </Button>
        </form>
      </Card>

      {notFound && (
        <Card>
          <div className="py-8 text-center">
            <AlertCircle size={40} className="mx-auto text-danger" />
            <p className="mt-3 font-medium text-neutral-800">Grievance not found</p>
            <p className="text-sm text-neutral-500">Check your tracking ID and Aadhaar last-4 combination.</p>
          </div>
        </Card>
      )}

      {result && (
        <Card>
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-neutral-500">Tracking ID</p>
              <p className="font-mono text-lg font-bold text-brand-purple">{result.trackingId}</p>
            </div>
            <Badge variant={result.status === 'resolved' ? 'resolved' : result.status === 'under_review' ? 'medium' : 'low'}>
              {STATUS_CONFIG[result.status]?.label}
            </Badge>
          </div>

          <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-neutral-500">Scheme</p>
              <p className="font-medium text-neutral-800">{result.schemeName}</p>
            </div>
            <div>
              <p className="text-neutral-500">Issue Type</p>
              <p className="font-medium text-neutral-800">{result.issueType}</p>
            </div>
          </div>

          {/* Timeline */}
          <div className="mt-6 border-t border-neutral-200 pt-6">
            <h3 className="mb-4 text-sm font-semibold text-neutral-800">Status Timeline</h3>
            <ol className="relative ml-4 space-y-6 border-l-2 border-neutral-200">
              {result.timeline.map((event, i) => {
                const config = STATUS_CONFIG[event.status] || STATUS_CONFIG.submitted;
                const Icon = config.icon;
                const isLast = i === result.timeline.length - 1;
                return (
                  <li key={i} className="ml-6">
                    <span
                      className="absolute -left-[9px] flex h-4 w-4 items-center justify-center rounded-full border-2 border-white"
                      style={{ backgroundColor: config.color }}
                      aria-hidden
                    />
                    <div className="flex items-center gap-2">
                      <Icon size={14} style={{ color: config.color }} />
                      <span className="text-sm font-semibold text-neutral-800">{config.label}</span>
                    </div>
                    <p className="mt-0.5 text-xs text-neutral-500">
                      {new Date(event.timestamp).toLocaleString('en-IN', {
                        day: 'numeric', month: 'short', year: 'numeric',
                        hour: '2-digit', minute: '2-digit',
                      })}
                    </p>
                    <p className="mt-1 text-sm text-neutral-600">{event.note}</p>
                    {!isLast && result.status !== 'resolved' && event.status === result.status && (
                      <div className="mt-3 rounded-lg bg-saffron-light px-3 py-2 text-xs text-saffron">
                        In progress — estimated resolution within 7 working days
                      </div>
                    )}
                  </li>
                );
              })}

              {/* Future step */}
              {result.status !== 'resolved' && (
                <li className="ml-6 opacity-50">
                  <span className="absolute -left-[9px] h-4 w-4 rounded-full border-2 border-neutral-300 bg-white" aria-hidden />
                  <div className="flex items-center gap-2">
                    <CheckCircle size={14} className="text-neutral-400" />
                    <span className="text-sm font-semibold text-neutral-500">Resolved</span>
                  </div>
                  <p className="mt-1 text-sm text-neutral-400">Awaiting resolution</p>
                </li>
              )}
            </ol>
          </div>
        </Card>
      )}

      {!result && !notFound && (
        <div className="rounded-card border border-dashed border-neutral-300 py-10 text-center text-sm text-neutral-400">
          Enter a tracking ID to view grievance status
        </div>
      )}
    </div>
  );
}
