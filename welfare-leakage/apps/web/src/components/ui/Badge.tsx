import { ReactNode } from 'react';

interface BadgeProps {
  children: ReactNode;
  variant?: 'high' | 'medium' | 'low' | 'resolved' | 'neutral';
  className?: string;
}

const variantClass: Record<string, string> = {
  high: 'bg-danger-light text-danger',
  medium: 'bg-saffron-light text-saffron',
  low: 'bg-info-cyan-light text-info-cyan',
  resolved: 'bg-india-green-light text-india-green',
  neutral: 'bg-neutral-100 text-neutral-600',
};

export function Badge({ children, variant = 'neutral', className = '' }: BadgeProps) {
  return (
    <span className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-medium uppercase tracking-wide ${variantClass[variant]} ${className}`}>
      {children}
    </span>
  );
}

interface SLAChipProps {
  deadline: string;
}

export function SLAChip({ deadline }: SLAChipProps) {
  const now = Date.now();
  const dl = new Date(deadline).getTime();
  const hoursLeft = (dl - now) / (1000 * 60 * 60);

  let variant = 'sla-ok';
  let text = 'On Track';
  if (hoursLeft < 0) {
    variant = 'sla-breach';
    text = 'SLA Breached';
  } else if (hoursLeft < 24) {
    variant = 'sla-warning';
    text = `${Math.floor(hoursLeft)}h left`;
  }

  return (
    <span className={`inline-flex items-center gap-1 rounded px-2 py-0.5 text-xs font-medium ${variant}`}>
      {text}
    </span>
  );
}
