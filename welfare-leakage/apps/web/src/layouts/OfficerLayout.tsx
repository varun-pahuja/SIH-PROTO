import { NavLink, Outlet } from 'react-router-dom';
import { Header } from '@/components/shared/Header';
import { Footer } from '@/components/shared/Footer';
import { useAuth } from '@/hooks/useAuth';

interface NavSection {
  label: string;
  items: { to: string; label: string; end?: boolean; adminOnly?: boolean }[];
}

const NAV: NavSection[] = [
  {
    label: 'Monitor',
    items: [
      { to: '/officer', label: 'Dashboard', end: true },
      { to: '/officer/beneficiaries', label: 'Beneficiaries' },
      { to: '/officer/flags', label: 'Flag Queue' },
    ],
  },
  {
    label: 'Analysis',
    items: [
      { to: '/officer/heatmap', label: 'Heatmap' },
      { to: '/officer/ml-insights', label: 'ML Insights' },
    ],
  },
  {
    label: 'Output',
    items: [
      { to: '/officer/reports', label: 'Reports' },
      { to: '/officer/audit', label: 'Audit Log', adminOnly: true },
    ],
  },
];

export function OfficerLayout() {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';

  return (
    <div className="flex min-h-screen flex-col">
      <a href="#main-content" className="skip-link">
        Skip to main content
      </a>
      <Header />
      <div className="flex flex-1">
        <aside
          className="hidden w-sidebar shrink-0 border-r border-neutral-200 bg-white lg:block"
          aria-label="Main navigation"
        >
          <nav className="flex flex-col gap-7 py-6 pl-4 pr-3">
            {NAV.map((section) => {
              const visible = section.items.filter((i) => !i.adminOnly || isAdmin);
              if (visible.length === 0) return null;
              return (
                <div key={section.label}>
                  <p className="mb-1.5 pl-4 text-[10px] font-bold uppercase tracking-[0.14em] text-neutral-400">
                    {section.label}
                  </p>
                  <ul className="space-y-0.5">
                    {visible.map((item) => (
                      <li key={item.to}>
                        <NavLink
                          to={item.to}
                          end={item.end}
                          className={({ isActive }) =>
                            `nav-item block rounded-r-md py-2 pl-4 pr-3 text-sm transition-colors ${
                              isActive
                                ? 'active font-semibold text-brand-purple'
                                : 'font-medium text-neutral-600 hover:text-neutral-900'
                            }`
                          }
                        >
                          {item.label}
                        </NavLink>
                      </li>
                    ))}
                  </ul>
                </div>
              );
            })}
          </nav>

          {isAdmin && (
            <div className="mx-4 mt-2 rounded-lg border border-brand-purple/15 bg-brand-purple-light/50 p-3.5">
              <p className="text-[11px] font-bold uppercase tracking-[0.1em] text-brand-purple">
                Admin mode
              </p>
              <p className="mt-1 text-xs leading-relaxed text-neutral-600">
                Full system access — audit log, officer management, configuration.
              </p>
            </div>
          )}
        </aside>

        <main id="main-content" className="min-w-0 flex-1 p-6 lg:p-8" tabIndex={-1}>
          <div className="mx-auto max-w-[1200px]">
            <Outlet />
          </div>
        </main>
      </div>
      <Footer />
    </div>
  );
}
