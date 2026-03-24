import { type ReactNode } from 'react';

interface Props {
  children: ReactNode;
  href?: string;
  variant?: 'primary' | 'amber' | 'outline';
  className?: string;
  onClick?: () => void;
}

const variants = {
  primary: 'bg-accent text-white hover:bg-accent-hover shadow-[0_4px_14px_rgba(0,102,255,0.25)] hover:shadow-[0_6px_20px_rgba(0,102,255,0.3)]',
  amber: 'bg-amber text-white hover:brightness-90 shadow-[0_4px_14px_rgba(255,107,44,0.25)] hover:shadow-[0_6px_20px_rgba(255,107,44,0.3)]',
  outline: 'border border-border text-heading hover:border-accent hover:text-accent bg-transparent',
};

export function GlowButton({ children, href, variant = 'primary', className = '', onClick }: Props) {
  const base = 'inline-flex items-center gap-2 px-7 py-3.5 rounded-full font-display font-semibold text-sm tracking-wide transition-all duration-300 hover:-translate-y-0.5 active:translate-y-0';
  const cls = `${base} ${variants[variant]} ${className}`;

  if (href) {
    return <a href={href} className={cls}>{children}</a>;
  }
  return <button onClick={onClick} className={cls}>{children}</button>;
}
