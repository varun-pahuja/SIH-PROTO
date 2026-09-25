import { useState, FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Upload, X, CheckCircle, Shield } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input, Select, Textarea } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import { getApiErrorMessage } from '@/utils/api';

const STEPS = ['Details', 'Documents', 'OTP Verify', 'Confirm'];

const SCHEME_OPTIONS = [
  { value: '', label: 'Select a scheme' },
  { value: 'pm-kisan', label: 'PM-KISAN' },
  { value: 'ayushman', label: 'Ayushman Bharat' },
  { value: 'nsgpy', label: 'NSAP — Old Age Pension' },
  { value: 'midday', label: 'Mid-Day Meal' },
  { value: 'jaljeevan', label: 'PM-Jal Jeevan Mission' },
  { value: 'ujjwala', label: 'Ujjwala Yojana' },
];

const ISSUE_OPTIONS = [
  { value: '', label: 'Select issue type' },
  { value: 'not_received', label: 'Payment Not Received' },
  { value: 'wrong_amount', label: 'Wrong Amount Credited' },
  { value: 'dead_person', label: 'Deceased Person Receiving Benefits' },
  { value: 'duplicate', label: 'Duplicate / Multiple Entries' },
  { value: 'other', label: 'Other Issue' },
];

export function SubmitGrievance() {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [trackingId, setTrackingId] = useState('');

  // Form state
  const [aadhaarLast4, setAadhaarLast4] = useState('');
  const [schemeId, setSchemeId] = useState('');
  const [issueType, setIssueType] = useState('');
  const [description, setDescription] = useState('');
  const [files, setFiles] = useState<File[]>([]);
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [otpTimer, setOtpTimer] = useState(0);

  const sendOtp = () => {
    if (!/^\d{4}$/.test(aadhaarLast4)) {
      toast.error('Enter a valid 4-digit Aadhaar last-4');
      return;
    }
    setOtpSent(true);
    setOtpTimer(30);
    toast.success('OTP sent! Use 123456 for demo');
    const interval = setInterval(() => {
      setOtpTimer((t) => {
        if (t <= 1) clearInterval(interval);
        return t - 1;
      });
    }, 1000);
  };

  const validateStep = (): boolean => {
    if (step === 0) {
      if (!/^\d{4}$/.test(aadhaarLast4)) { toast.error('Aadhaar last-4 must be exactly 4 digits'); return false; }
      if (!schemeId) { toast.error('Select a scheme'); return false; }
      if (!issueType) { toast.error('Select an issue type'); return false; }
      if (description.length < 10) { toast.error('Description must be at least 10 characters'); return false; }
    }
    if (step === 2) {
      if (!/^\d{6}$/.test(otp)) { toast.error('Enter the 6-digit OTP'); return false; }
      if (otp !== '123456') { toast.error('Invalid OTP. Demo code is 123456'); return false; }
    }
    return true;
  };

  const handleNext = () => {
    if (validateStep()) setStep((s) => s + 1);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      // Try API first, fall back to mock success
      const { default: api } = await import('@/utils/api');
      const formData = new FormData();
      formData.append('aadhaarLast4', aadhaarLast4);
      formData.append('schemeId', schemeId);
      formData.append('issueType', issueType);
      formData.append('description', description);
      formData.append('otp', otp);
      files.forEach((f) => formData.append('documents', f));

      const { data } = await api.post('/citizen/grievance', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setTrackingId(data.trackingId);
    } catch {
      // Demo fallback
      setTrackingId(`GRV-2026-${String(Math.floor(10000 + Math.random() * 90000))}`);
    } finally {
      setSubmitting(false);
    }
    setStep(3);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-neutral-900">Submit Grievance</h1>
        <p className="mt-1 text-sm text-neutral-500">
          Fill in the details below. Only the last 4 digits of your Aadhaar are required.
        </p>
      </div>

      {/* Progress Stepper */}
      <ol className="flex items-center gap-2" aria-label="Form progress">
        {STEPS.map((label, i) => (
          <li key={label} className="flex flex-1 items-center gap-2" aria-current={i === step ? 'step' : undefined}>
            <span
              className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
                i < step
                  ? 'bg-india-green text-white'
                  : i === step
                    ? 'bg-saffron text-white'
                    : 'bg-neutral-200 text-neutral-500'
              }`}
            >
              {i < step ? <CheckCircle size={16} /> : i + 1}
            </span>
            <span className={`hidden text-xs font-medium sm:inline ${i <= step ? 'text-neutral-800' : 'text-neutral-400'}`}>
              {label}
            </span>
            {i < STEPS.length - 1 && <div className={`h-px flex-1 ${i < step ? 'bg-india-green' : 'bg-neutral-200'}`} />}
          </li>
        ))}
      </ol>

      <Card>
        {step === 0 && (
          <form onSubmit={(e) => { e.preventDefault(); handleNext(); }} className="space-y-4">
            <Input
              label="Aadhaar Last 4 Digits"
              value={aadhaarLast4}
              onChange={(e) => setAadhaarLast4(e.target.value.replace(/\D/g, '').slice(0, 4))}
              placeholder="e.g. 4821"
              maxLength={4}
              inputMode="numeric"
              pattern="\d{4}"
              required
              className="font-mono text-lg tracking-[0.3em]"
            />
            <p className="flex items-center gap-1.5 text-xs text-neutral-500">
              <Shield size={12} className="text-info-cyan" />
              We only need the last 4 digits. Your full Aadhaar is never requested or stored.
            </p>
            <Select label="Scheme" options={SCHEME_OPTIONS} value={schemeId} onChange={(e) => setSchemeId(e.target.value)} />
            <Select label="Issue Type" options={ISSUE_OPTIONS} value={issueType} onChange={(e) => setIssueType(e.target.value)} />
            <Textarea
              label="Describe the Issue"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Provide details about the problem you're facing with this scheme payment…"
              required
              rows={5}
            />
            <div className="flex justify-end">
              <Button type="submit">Next: Upload Documents</Button>
            </div>
          </form>
        )}

        {step === 1 && (
          <div className="space-y-4">
            <p className="text-sm text-neutral-600">
              Upload supporting documents (optional). Accepted: PDF, JPG, PNG (max 5MB each).
            </p>
            <label className="flex cursor-pointer flex-col items-center gap-2 rounded-card border-2 border-dashed border-neutral-300 p-8 text-center transition-colors hover:border-saffron hover:bg-saffron-light">
              <Upload size={32} className="text-neutral-400" />
              <span className="text-sm font-medium text-neutral-700">Click to upload or drag and drop</span>
              <span className="text-xs text-neutral-400">PDF, JPG, PNG up to 5MB</span>
              <input
                type="file"
                multiple
                accept=".pdf,.jpg,.jpeg,.png"
                className="hidden"
                onChange={(e) => {
                  const newFiles = Array.from(e.target.files || []);
                  const valid = newFiles.filter((f) => f.size <= 5 * 1024 * 1024);
                  if (valid.length < newFiles.length) toast.error('Some files exceeded 5MB and were skipped');
                  setFiles((prev) => [...prev, ...valid]);
                }}
              />
            </label>

            {files.length > 0 && (
              <ul className="space-y-2">
                {files.map((f, i) => (
                  <li key={i} className="flex items-center justify-between rounded-lg bg-neutral-50 px-4 py-2.5">
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-medium text-neutral-700">{f.name}</span>
                      <Badge variant="neutral">{(f.size / 1024).toFixed(0)} KB</Badge>
                    </div>
                    <button
                      type="button"
                      onClick={() => setFiles(files.filter((_, j) => j !== i))}
                      className="text-neutral-400 hover:text-danger"
                      aria-label={`Remove ${f.name}`}
                    >
                      <X size={16} />
                    </button>
                  </li>
                ))}
              </ul>
            )}

            <div className="flex justify-between">
              <Button variant="ghost" onClick={() => setStep(0)}>Back</Button>
              <Button onClick={() => setStep(2)}>Next: OTP Verification</Button>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-4">
            <div className="rounded-lg bg-neutral-50 p-4 text-sm text-neutral-600">
              <p className="font-medium text-neutral-800">Verify your identity</p>
              <p className="mt-1">We'll send a one-time password to verify this request for Aadhaar ending <span className="font-mono font-semibold">{aadhaarLast4}</span>.</p>
            </div>

            {!otpSent ? (
              <Button onClick={sendOtp}>Send OTP</Button>
            ) : (
              <div className="space-y-4">
                <label className="block text-sm font-medium text-neutral-700" htmlFor="otp-input">
                  Enter 6-digit OTP
                </label>
                <input
                  id="otp-input"
                  type="text"
                  inputMode="numeric"
                  maxLength={6}
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                  placeholder="000000"
                  className="h-14 w-full rounded border border-neutral-300 text-center font-mono text-2xl tracking-[0.5em] focus:border-saffron focus:outline-none focus:ring-1 focus:ring-saffron"
                />
                <div className="flex items-center justify-between">
                  <button
                    type="button"
                    onClick={sendOtp}
                    disabled={otpTimer > 0}
                    className="text-sm font-medium text-brand-purple hover:underline disabled:text-neutral-400 disabled:no-underline"
                  >
                    {otpTimer > 0 ? `Resend in ${otpTimer}s` : 'Resend OTP'}
                  </button>
                  <p className="text-xs text-neutral-400">Demo OTP: 123456</p>
                </div>
              </div>
            )}

            <div className="flex justify-between pt-2">
              <Button variant="ghost" onClick={() => setStep(1)}>Back</Button>
              <Button onClick={handleNext} disabled={!otpSent}>Verify & Review</Button>
            </div>
          </div>
        )}

        {step === 2.5 || (step === 3 && !trackingId) ? (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="rounded-lg border border-neutral-200 p-4 text-sm">
              <p className="mb-3 font-semibold text-neutral-800">Review Your Grievance</p>
              <dl className="space-y-2">
                <div className="flex justify-between"><dt className="text-neutral-500">Aadhaar</dt><dd className="font-mono">XXXX-XXXX-{aadhaarLast4}</dd></div>
                <div className="flex justify-between"><dt className="text-neutral-500">Scheme</dt><dd>{SCHEME_OPTIONS.find(s => s.value === schemeId)?.label}</dd></div>
                <div className="flex justify-between"><dt className="text-neutral-500">Issue</dt><dd>{ISSUE_OPTIONS.find(s => s.value === issueType)?.label}</dd></div>
                <div className="flex justify-between"><dt className="text-neutral-500">Documents</dt><dd>{files.length} file(s)</dd></div>
              </dl>
            </div>
            <div className="flex justify-between">
              <Button variant="ghost" type="button" onClick={() => setStep(2)}>Back</Button>
              <Button type="submit" disabled={submitting}>{submitting ? 'Submitting…' : 'Submit Grievance'}</Button>
            </div>
          </form>
        ) : null}

        {step === 3 && trackingId && (
          <div className="py-8 text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-india-green-light">
              <CheckCircle size={32} className="text-india-green" />
            </div>
            <h2 className="text-xl font-bold text-neutral-900">Grievance Submitted</h2>
            <p className="mt-2 text-sm text-neutral-500">Save your tracking ID to check status later.</p>
            <p className="mt-4 inline-block rounded-lg bg-neutral-100 px-6 py-3 font-mono text-lg font-bold text-brand-purple">
              {trackingId}
            </p>
            <div className="mt-6 flex justify-center gap-3">
              <Button variant="secondary" onClick={() => navigate('/citizen/track')}>Track Grievance</Button>
              <Button variant="ghost" onClick={() => navigate('/citizen')}>Back to Home</Button>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}
