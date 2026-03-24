import { type ReactNode } from 'react';

interface Props {
  children: ReactNode;
  href?: string;
  variant?: 'primary' | 'amber' | 'outline';
  className?: string;
  onClick?: () => void;
}

const variants = {
  primary: 'bg-accent text-void hover:bg-accent-hover shadow-[0_0_30px_var(--color-accent-dim)]',
  amber: 'bg-amber text-void hover:brightness-110 shadow-[0_0_30px_var(--color-amber-dim)]',
  outline: 'border border-border text-heading hover:border-accent hover:text-accent bg-transparent',
};

export function GlowButton({ children, href, variant = 'primary', className = '', onClick }: Props) {
  const base = 'inline-flex items-center gap-2 px-7 py-3.5 rounded-full font-display font-semibold text-sm tracking-wide transition-all duration-300 hover:scale-[1.03] active:scale-[0.98]';
  const cls = `${base} ${variants[variant]} ${className}`;

  if (href) {
    return <a href={href} className={cls}>{children}</a>;
  }
  return <button onClick={onClick} className={cls}>{children}</button>;
}
