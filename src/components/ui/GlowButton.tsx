import { type ReactNode } from 'react';

interface Props {
  children: ReactNode;
  href?: string;
  variant?: 'primary' | 'ghost';
  className?: string;
}

export function GlowButton({ children, href = '#', variant = 'primary', className = '' }: Props) {
  const base = 'inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-full font-mono text-sm font-bold transition-all duration-300';

  const variants = {
    primary: `${base} bg-accent text-void hover:bg-accent-hover hover:shadow-[0_0_20px_rgba(0,255,209,0.3)]`,
    ghost: `${base} text-white border border-border hover:border-accent/40 hover:text-accent`,
  };

  return (
    <a href={href} className={`${variants[variant]} ${className}`}>
      {children}
    </a>
  );
}
