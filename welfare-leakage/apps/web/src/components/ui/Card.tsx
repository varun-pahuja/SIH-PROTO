import { ReactNode } from 'react';

interface CardProps {
  children: ReactNode;
  className?: string;
  title?: string;
  action?: ReactNode;
}

export function Card({ children, className = '', title, action }: CardProps) {
  return (
    <div className={`rounded-card border border-neutral-200 bg-white ${className}`}>
      {(title || action) && (
        <div className="flex items-center justify-between border-b border-neutral-200 px-6 py-4">
          {title && <h3 className="text-lg font-semibold text-neutral-800">{title}</h3>}
          {action}
        </div>
      )}
      <div className="p-6">{children}</div>
    </div>
  );
}
