import { ReactNode } from 'react';
import { useCountUp } from '@/hooks/useCountUp';

interface KPICardProps {
  label: string;
  value: number;
  sparklineData: number[];
  delta?: number;
  deltaLabel?: string;
  /** true when a falling number is good news (e.g. flagged-down = fewer new anomalies) */
  invertDelta?: boolean;
  icon?: ReactNode;
  accent?: string;
  variant?: 'hero' | 'standard';
  /** delay for staggered entrance, ms */
  delay?: number;
  formatter?: (n: number) => string;
}

function formatDefault(n: number): string {
  return n.toLocaleString('en-IN');
}

/** Area+line sparkline that draws itself in. Pure SVG, no chart lib. */
function AreaChart({ data, accent, id, animate }: { data: number[]; accent: string; id: string; animate: boolean }) {
  const w = 240;
  const h = 56;
  const max = Math.max(...data, 1);
  const min = Math.min(...data, 0);
  const range = max - min || 1;

  const points = data.map((v, i) => ({
    x: (i / Math.max(data.length - 1, 1)) * w,
    y: h - ((v - min) / range) * (h - 6) - 3,
  }));

  // Catmull-Rom → bezier for a natural curve (not Recharts' default monotone look)
  let d = `M ${points[0].x},${points[0].y}`;
  for (let i = 0; i < points.length - 1; i++) {
    const p0 = points[Math.max(i - 1, 0)];
    const p1 = points[i];
    const p2 = points[i + 1];
    const p3 = points[Math.min(i + 2, points.length - 1)];
    const c1x = p1.x + (p2.x - p0.x) / 6;
    const c1y = p1.y + (p2.y - p0.y) / 6;
    const c2x = p2.x - (p3.x - p1.x) / 6;
    const c2y = p2.y - (p3.y - p1.y) / 6;
    d += ` C ${c1x},${c1y} ${c2x},${c2y} ${p2.x},${p2.y}`;
  }

  const area = `${d} L ${w},${h} L 0,${h} Z`;

  return (
    <svg
      viewBox={`0 0 ${w} ${h}`}
      className="h-full w-full"
      preserveAspectRatio="none"
      aria-hidden="true"
      focusable="false"
    >
      <defs>
        <linearGradient id={`grad-${id}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={accent} stopOpacity="0.16" />
          <stop offset="100%" stopColor={accent} stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={area} fill={`url(#grad-${id})`} className={animate ? 'chart-area' : ''} />
      <path
        d={d}
        fill="none"
        stroke={accent}
        strokeWidth="1.75"
        strokeLinecap="round"
        className={animate ? 'chart-draw' : ''}
        style={animate ? ({ '--path-length': 700 } as React.CSSProperties) : undefined}
      />
      <circle
        cx={points[points.length - 1].x}
        cy={points[points.length - 1].y}
        r="2.5"
        fill={accent}
        className={animate ? 'chart-area' : ''}
      />
    </svg>
  );
}

function Delta({ delta, label, invert }: { delta?: number; label?: string; invert?: boolean }) {
  if (delta === undefined) return null;
  const up = delta >= 0;
  // For "bad" metrics (flagged), down is good. For "good" metrics (resolved), up is good.
  const isGood = invert ? !up : up;
  const color = isGood ? 'text-india-green' : 'text-danger';
  return (
    <span className={`inline-flex items-center gap-1 text-xs font-semibold ${color}`}>
      <svg width="10" height="10" viewBox="0 0 10 10" aria-hidden="true" focusable="false">
        <path
          d={up ? 'M5 1.5 L8.5 7 L1.5 7 Z' : 'M5 8.5 L1.5 3 L8.5 3 Z'}
          fill="currentColor"
        />
      </svg>
      {Math.abs(delta)}%
      <span className="font-normal text-neutral-500">{label}</span>
    </span>
  );
}

export function KPICard({
  label,
  value,
  sparklineData,
  delta,
  deltaLabel,
  invertDelta,
  icon,
  accent = '#4A2BC2',
  variant = 'standard',
  delay = 0,
  formatter = formatDefault,
}: KPICardProps) {
  const animated = useCountUp(value, 750);
  const isHero = variant === 'hero';
  const id = label.replace(/\W+/g, '-').toLowerCase();

  return (
    <div
      className={`card-hover animate-rise relative overflow-hidden bg-white ${
        isHero ? 'p-6 pb-0 md:p-7 md:pb-0' : 'p-5'
      }`}
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className={isHero ? 'relative z-10' : ''}>
        <div className="flex items-start justify-between gap-3">
          <p className="text-[11px] font-semibold uppercase tracking-[0.1em] text-neutral-500">
            {label}
          </p>
          {icon && (
            <span className="mt-0.5 shrink-0" style={{ color: accent }} aria-hidden="true">
              {icon}
            </span>
          )}
        </div>

        <div className={`mt-2 flex items-end gap-3 ${isHero ? 'md:mt-3' : ''}`}>
          <span
            className={`font-mono font-bold tabular-nums leading-none text-neutral-900 ${
              isHero ? 'text-[2.75rem] md:text-6xl' : 'text-3xl'
            }`}
          >
            {formatter(animated)}
          </span>
        </div>

        {delta !== undefined && (
          <div className="mt-2">
            <Delta delta={delta} label={deltaLabel} invert={invertDelta} />
          </div>
        )}
      </div>

      {/* Chart: bleeds to bottom edge on hero, contained on standard */}
      <div className={`${isHero ? 'mt-4 h-16 md:h-20' : 'mt-3 h-10'}`}>
        <AreaChart data={sparklineData} accent={accent} id={id} animate />
      </div>
    </div>
  );
}
