import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from '@/hooks/useAuth';
import { OfficerLayout } from '@/layouts/OfficerLayout';
import { CitizenLayout } from '@/layouts/CitizenLayout';
import type { ReactNode } from 'react';

// Lazy import pages once they exist
import { LoginPage } from '@/pages/LoginPage';
import { OfficerDashboard } from '@/pages/officer/Dashboard';
import { BeneficiarySearch } from '@/pages/officer/BeneficiarySearch';
import { BeneficiaryDetailPage } from '@/pages/officer/BeneficiaryDetail';
import { FlagQueue } from '@/pages/officer/FlagQueue';
import { Heatmap } from '@/pages/officer/Heatmap';
import { MLInsights } from '@/pages/officer/MLInsights';
import { Reports } from '@/pages/officer/Reports';
import { CitizenHome } from '@/pages/citizen/CitizenHome';
import { SubmitGrievance } from '@/pages/citizen/SubmitGrievance';
import { TrackGrievance } from '@/pages/citizen/TrackGrievance';

function RequireAuth({ children, roles }: { children: ReactNode; roles?: string[] }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="flex min-h-screen items-center justify-center text-neutral-500">Loading…</div>;
  if (!user) return <Navigate to="/login" replace />;
  if (roles && !roles.includes(user.role)) return <Navigate to="/" replace />;
  return <>{children}</>;
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Toaster
          position="top-right"
          toastOptions={{
            style: { borderRadius: 8, fontSize: 14 },
            success: { iconTheme: { primary: '#128937', secondary: '#fff' } },
            error: { iconTheme: { primary: '#DB372D', secondary: '#fff' } },
          }}
        />
        <Routes>
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="/login" element={<LoginPage />} />

          {/* Citizen Portal */}
          <Route path="/citizen" element={<CitizenLayout />}>
            <Route index element={<CitizenHome />} />
            <Route path="submit" element={<SubmitGrievance />} />
            <Route path="track" element={<TrackGrievance />} />
          </Route>

          {/* Officer Portal */}
          <Route
            path="/officer"
            element={
              <RequireAuth roles={['officer', 'admin']}>
                <OfficerLayout />
              </RequireAuth>
            }
          >
            <Route index element={<OfficerDashboard />} />
            <Route path="beneficiaries" element={<BeneficiarySearch />} />
            <Route path="beneficiaries/:id" element={<BeneficiaryDetailPage />} />
            <Route path="flags" element={<FlagQueue />} />
            <Route path="heatmap" element={<Heatmap />} />
            <Route path="ml-insights" element={<MLInsights />} />
            <Route path="reports" element={<Reports />} />
            <Route path="audit" element={<AuditLog />} />
          </Route>

          <Route path="*" element={<div className="flex min-h-screen items-center justify-center text-2xl">404 — Page Not Found</div>} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

// Inline placeholder — real page comes in next file
function AuditLog() {
  return (
    <div>
      <h1 className="text-3xl font-bold text-neutral-900">Audit Log</h1>
      <p className="mt-2 text-neutral-500">Immutable record of all officer actions.</p>
    </div>
  );
}
