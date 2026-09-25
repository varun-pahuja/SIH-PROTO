import { Link } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';

/** Stylised Ashoka-chakra-inspired mark — replaces the emoji flag. */
function EmblemMark() {
  return (
    <svg width="32" height="32" viewBox="0 0 32 32" aria-hidden="true" focusable="false">
      <circle cx="16" cy="16" r="15" fill="#4A2BC2" />
      <circle cx="16" cy="16" r="10.5" fill="none" stroke="#fff" strokeOpacity="0.9" strokeWidth="1" />
      <circle cx="16" cy="16" r="2.4" fill="#fff" />
      {Array.from({ length: 24 }, (_, i) => {
        const a = (i * 15 * Math.PI) / 180;
        const x1 = 16 + Math.cos(a) * 4;
        const y1 = 16 + Math.sin(a) * 4;
        const x2 = 16 + Math.cos(a) * 10.5;
        const y2 = 16 + Math.sin(a) * 10.5;
        return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke="#fff" strokeWidth="1" strokeOpacity="0.85" />;
      })}
    </svg>
  );
}

const ROLE_STYLES: Record<string, string> = {
  admin: 'bg-brand-purple-light text-brand-purple',
  officer: 'bg-saffron-light text-saffron',
  citizen: 'bg-info-cyan-light text-info-cyan',
};

export function Header() {
  const { user, logout } = useAuth();

  return (
    <header className="sticky top-0 z-40 flex h-16 items-center justify-between border-b border-neutral-200 bg-white/95 px-6 backdrop-blur-sm">
      <Link to="/" className="flex items-center gap-3" aria-label="Welfare Leakage Detection — Home">
        <EmblemMark />
        <div className="hidden sm:block leading-tight">
          <p className="text-[13px] font-bold tracking-tight text-neutral-900">
            Welfare Leakage Detection
          </p>
          <p className="text-[11px] text-neutral-500">
            Ministry of Electronics & Information Technology
          </p>
        </div>
      </Link>

      <nav className="flex items-center gap-3" aria-label="User menu">
        {user ? (
          <>
            <span
              className={`hidden rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-[0.1em] sm:inline ${ROLE_STYLES[user.role] || ROLE_STYLES.officer}`}
            >
              {user.role}
            </span>
            <div className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-neutral-900 text-xs font-bold text-white" aria-hidden="true">
                {user.fullName.charAt(0)}
              </div>
              <span className="hidden text-sm font-medium text-neutral-700 md:inline">
                {user.fullName}
              </span>
            </div>
            <button
              onClick={logout}
              className="rounded px-2 py-1 text-sm font-medium text-neutral-500 transition-colors hover:text-danger focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-saffron"
            >
              Sign out
            </button>
          </>
        ) : (
          <Link
            to="/login"
            className="rounded px-3 py-1.5 text-sm font-semibold text-brand-purple hover:bg-brand-purple-light"
          >
            Sign in
          </Link>
        )}
      </nav>
    </header>
  );
}
