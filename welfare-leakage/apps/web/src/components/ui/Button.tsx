import { ButtonHTMLAttributes, forwardRef } from 'react';

type Variant = 'primary' | 'secondary' | 'danger' | 'ghost';
type Size = 'sm' | 'md';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
}

const variantClass: Record<Variant, string> = {
  primary: 'bg-saffron text-white hover:bg-saffron-hover focus-visible:outline-saffron',
  secondary: 'border border-brand-purple text-brand-purple hover:bg-brand-purple-light focus-visible:outline-brand-purple',
  danger: 'bg-danger text-white hover:bg-danger-hover focus-visible:outline-danger',
  ghost: 'text-neutral-600 hover:bg-neutral-100 hover:text-neutral-800 focus-visible:outline-neutral-500',
};

const sizeClass: Record<Size, string> = {
  sm: 'h-8 px-3 text-xs',
  md: 'h-10 px-5 text-sm',
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = 'primary', size = 'md', className = '', ...props }, ref) => (
    <button
      ref={ref}
      className={`inline-flex items-center justify-center gap-2 rounded font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${variantClass[variant]} ${sizeClass[size]} ${className}`}
      {...props}
    />
  )
);
Button.displayName = 'Button';
