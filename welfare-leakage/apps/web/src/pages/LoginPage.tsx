import { useState, FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuth } from '@/hooks/useAuth';
import { getApiErrorMessage } from '@/utils/api';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';

export function LoginPage() {
  const [email, setEmail] = useState('officer@welfare.gov.in');
  const [password, setPassword] = useState('Officer@2026');
  const [role, setRole] = useState<'officer' | 'admin' | 'citizen'>('officer');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (role === 'citizen') {
        navigate('/citizen');
        return;
      }
      const user = await login(email, password);
      toast.success(`Welcome, ${user.fullName}`);
      navigate('/officer');
    } catch (err) {
      toast.error(getApiErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-neutral-50 px-4">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-xl bg-brand-purple text-2xl text-white">
            🇮🇳
          </div>
          <h1 className="text-2xl font-bold text-neutral-900">Welfare Leakage Detection</h1>
          <p className="mt-1 text-sm text-neutral-500">
            Beneficiary Verification System — MeitY / NIC
          </p>
        </div>

        <div className="card p-8">
          <div className="mb-6 grid grid-cols-3 gap-1 rounded-lg bg-neutral-100 p-1" role="tablist" aria-label="Role selector">
            {(['officer', 'admin', 'citizen'] as const).map((r) => (
              <button
                key={r}
                role="tab"
                aria-selected={role === r}
                onClick={() => setRole(r)}
                className={`rounded-md px-3 py-2 text-sm font-medium capitalize transition-colors ${
                  role === r ? 'bg-white text-brand-purple shadow-sm' : 'text-neutral-500 hover:text-neutral-700'
                }`}
              >
                {r}
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {role !== 'citizen' && (
              <>
                <Input
                  label="Email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="officer@welfare.gov.in"
                  required
                  autoComplete="email"
                />
                <Input
                  label="Password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  autoComplete="current-password"
                />
              </>
            )}

            {role === 'citizen' && (
              <p className="rounded-lg bg-info-cyan-light p-3 text-sm text-info-cyan">
                Citizens don't need to sign in. You'll be redirected to the grievance portal.
              </p>
            )}

            <Button type="submit" disabled={loading} className="w-full">
              {loading ? 'Signing in…' : role === 'citizen' ? 'Continue as Citizen' : `Sign In as ${role === 'admin' ? 'Admin' : 'Officer'}`}
            </Button>
          </form>

          <div className="mt-6 rounded-lg bg-neutral-100 p-3 text-xs text-neutral-500">
            <p className="font-medium text-neutral-600">Demo credentials</p>
            <p className="mt-1">officer@welfare.gov.in / Officer@2026</p>
            <p>admin@welfare.gov.in / Admin@2026</p>
            <p className="mt-1 text-neutral-400">Citizen — no login required</p>
          </div>
        </div>
      </div>
    </div>
  );
}
