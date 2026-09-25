import { useState } from 'react';
import toast from 'react-hot-toast';
import { Download, FileText, Table } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input, Select } from '@/components/ui/Input';
import api from '@/utils/api';

export function Reports() {
  const [from, setFrom] = useState('2026-09-01');
  const [to, setTo] = useState('2026-09-25');
  const [format, setFormat] = useState('csv');
  const [exporting, setExporting] = useState(false);

  const handleExport = async () => {
    setExporting(true);
    try {
      const res = await api.get('/officer/reports/export', {
        params: { from, to, format },
        responseType: 'blob',
      });
      const url = URL.createObjectURL(res.data);
      const a = document.createElement('a');
      a.href = url;
      a.download = `welfare-report-${from}-to-${to}.${format}`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success('Report downloaded');
    } catch {
      // Fallback: generate a mock CSV client-side for demo
      const csv = generateMockCSV();
      const blob = new Blob([csv], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `welfare-report-${from}-to-${to}.csv`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success('Report downloaded (demo data)');
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-neutral-900">Reports & Export</h1>
        <p className="mt-1 text-neutral-500">Generate anomaly reports for the selected date range</p>
      </div>

      <Card title="Export Configuration">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
          <Input label="From Date" type="date" value={from} onChange={(e) => setFrom(e.target.value)} />
          <Input label="To Date" type="date" value={to} onChange={(e) => setTo(e.target.value)} />
          <Select
            label="Format"
            options={[
              { value: 'csv', label: 'CSV' },
              { value: 'pdf', label: 'PDF' },
            ]}
            value={format}
            onChange={(e) => setFormat(e.target.value)}
          />
          <div className="flex items-end">
            <Button onClick={handleExport} disabled={exporting} className="w-full">
              {exporting ? (
                'Generating…'
              ) : (
                <>
                  <Download size={16} /> Export
                </>
              )}
            </Button>
          </div>
        </div>
      </Card>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        <Card>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand-purple-light text-brand-purple">
              <Table size={20} />
            </div>
            <div>
              <p className="font-medium text-neutral-800">Anomaly Flags Report</p>
              <p className="text-xs text-neutral-500">All flags with scores and reasons</p>
            </div>
          </div>
          <p className="mt-3 text-xs text-neutral-400">Columns: Beneficiary, State, Flag Type, Score, Confidence, Status, Date</p>
        </Card>
        <Card>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-india-green-light text-india-green">
              <FileText size={20} />
            </div>
            <div>
              <p className="font-medium text-neutral-800">Resolution Summary</p>
              <p className="text-xs text-neutral-500">Resolved cases with recovery details</p>
            </div>
          </div>
          <p className="mt-3 text-xs text-neutral-400">Columns: Case ID, Beneficiary, Resolution, Officer, Date</p>
        </Card>
        <Card>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-saffron-light text-saffron">
              <Download size={20} />
            </div>
            <div>
              <p className="font-medium text-neutral-800">State-wise Summary</p>
              <p className="text-xs text-neutral-500">Aggregate metrics per state</p>
            </div>
          </div>
          <p className="mt-3 text-xs text-neutral-400">Columns: State, Total Ben., Flagged, Resolved, Leak Rate</p>
        </Card>
      </div>
    </div>
  );
}

function generateMockCSV(): string {
  const rows = [
    ['beneficiary_name', 'state', 'scheme', 'flag_type', 'anomaly_score', 'confidence', 'status', 'detected_at'],
    ['Ramesh Kumar', 'MH', 'PM-KISAN', 'income_mismatch', '92.4', '94%', 'under_review', '2026-09-23'],
    ['Sunita Devi', 'UP', 'NSAP', 'duplicate_aadhaar', '87.1', '91%', 'confirmed', '2026-09-23'],
    ['Arjun Patel', 'GJ', 'Ayushman Bharat', 'dead_beneficiary', '95.8', '97%', 'under_review', '2026-09-22'],
    ['Lakshmi Reddy', 'AP', 'PM-KISAN', 'geo_anomaly', '64.3', '78%', 'resolved', '2026-09-22'],
    ['Mohammed Irfan', 'BR', 'Mid-Day Meal', 'multiple_accounts', '78.9', '85%', 'confirmed', '2026-09-21'],
  ];
  return rows.map((r) => r.join(',')).join('\n');
}
