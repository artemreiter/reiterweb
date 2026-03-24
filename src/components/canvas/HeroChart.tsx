import { useEffect, useRef, useState } from 'react';

interface Milestone {
  progress: number;
  label: string;
  value: string;
  color: string;
}

const MILESTONES: Milestone[] = [
  { progress: 0.05, label: 'Broken tracking', value: '12%', color: '#EF4444' },
  { progress: 0.15, label: 'Analytics Audit', value: '18%', color: '#FFB84C' },
  { progress: 0.28, label: 'Added GTM', value: '31%', color: '#FFB84C' },
  { progress: 0.42, label: 'Server-side Tagging', value: '52%', color: '#4C8CFF' },
  { progress: 0.56, label: 'Attribution Model', value: '78%', color: '#4C8CFF' },
  { progress: 0.72, label: 'Custom Dashboards', value: '112%', color: '#00E5A0' },
  { progress: 0.88, label: 'Full Optimization', value: '147%', color: '#00E5A0' },
];

function generatePath(width: number, height: number, progress: number): string {
  const points: [number, number][] = [];
  const steps = 120;
  const visibleSteps = Math.floor(steps * progress);

  for (let i = 0; i <= visibleSteps; i++) {
    const t = i / steps;
    const baseY = Math.pow(t, 1.8);
    const noise = Math.sin(t * 15) * 0.018 + Math.sin(t * 7.3) * 0.012;
    const y = Math.min(1, baseY + noise);
    const px = t * width;
    const py = height - y * (height * 0.8) - height * 0.05;
    points.push([px, py]);
  }

  if (points.length < 2) return '';
  let d = `M ${points[0][0]},${points[0][1]}`;
  for (let i = 1; i < points.length; i++) {
    const prev = points[i - 1];
    const curr = points[i];
    const cpx = (prev[0] + curr[0]) / 2;
    d += ` C ${cpx},${prev[1]} ${cpx},${curr[1]} ${curr[0]},${curr[1]}`;
  }
  return d;
}

function generateAreaPath(width: number, height: number, progress: number): string {
  const linePath = generatePath(width, height, progress);
  if (!linePath) return '';
  const steps = Math.floor(120 * progress);
  const lastX = (steps / 120) * width;
  return `${linePath} L ${lastX},${height} L 0,${height} Z`;
}

export function HeroChart() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [progress, setProgress] = useState(0.02);
  const [dims, setDims] = useState({ w: 1200, h: 600 });

  useEffect(() => {
    const update = () => {
      const w = window.innerWidth;
      const h = window.innerHeight;
      setDims({ w, h });
    };
    update();
    window.addEventListener('resize', update);

    const handleScroll = () => {
      const scrollH = document.documentElement.scrollHeight - window.innerHeight;
      // Map first 60% of page scroll to chart progress
      const scrollRange = scrollH * 0.55;
      const raw = window.scrollY / scrollRange;
      // Start with a small initial progress so something is visible
      setProgress(Math.max(0.02, Math.min(1, raw)));
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();

    return () => {
      window.removeEventListener('resize', update);
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  const { w, h } = dims;
  const linePath = generatePath(w, h, progress);
  const areaPath = generateAreaPath(w, h, progress);
  const visibleMilestones = MILESTONES.filter(m => progress >= m.progress);

  const getMilestonePos = (m: Milestone) => {
    const t = m.progress;
    const baseY = Math.pow(t, 1.8);
    const noise = Math.sin(t * 15) * 0.018 + Math.sin(t * 7.3) * 0.012;
    const y = Math.min(1, baseY + noise);
    return {
      x: t * w,
      y: h - y * (h * 0.8) - h * 0.05,
    };
  };

  return (
    <div ref={containerRef} className="absolute inset-0 overflow-hidden" aria-hidden="true">
      <svg
        viewBox={`0 0 ${w} ${h}`}
        className="absolute inset-0 w-full h-full"
        preserveAspectRatio="none"
      >
        <defs>
          <linearGradient id="hero-area" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor="#00E5A0" stopOpacity="0.1" />
            <stop offset="100%" stopColor="#00E5A0" stopOpacity="0" />
          </linearGradient>
          <linearGradient id="hero-line" x1="0" x2="1" y1="0" y2="0">
            <stop offset="0%" stopColor="#EF4444" />
            <stop offset="25%" stopColor="#FFB84C" />
            <stop offset="55%" stopColor="#4C8CFF" />
            <stop offset="100%" stopColor="#00E5A0" />
          </linearGradient>
          <filter id="hero-glow">
            <feGaussianBlur stdDeviation="6" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Subtle grid */}
        {[0.25, 0.5, 0.75].map(y => (
          <line key={`h${y}`} x1={0} y1={h * y} x2={w} y2={h * y} stroke="#2A2A3A" strokeWidth="0.5" strokeDasharray="6 12" opacity="0.4" />
        ))}
        {[0.2, 0.4, 0.6, 0.8].map(x => (
          <line key={`v${x}`} x1={w * x} y1={0} x2={w * x} y2={h} stroke="#2A2A3A" strokeWidth="0.5" strokeDasharray="6 12" opacity="0.3" />
        ))}

        {/* Area */}
        {areaPath && <path d={areaPath} fill="url(#hero-area)" />}

        {/* Glow line */}
        {linePath && (
          <>
            <path d={linePath} fill="none" stroke="url(#hero-line)" strokeWidth="4" strokeLinecap="round" filter="url(#hero-glow)" opacity="0.6" />
            <path d={linePath} fill="none" stroke="url(#hero-line)" strokeWidth="2.5" strokeLinecap="round" />
          </>
        )}

        {/* Milestone dots */}
        {visibleMilestones.map((m, i) => {
          const pos = getMilestonePos(m);
          return (
            <g key={i}>
              <line x1={pos.x} y1={pos.y} x2={pos.x} y2={h} stroke={m.color} strokeWidth="0.5" strokeDasharray="4 8" opacity="0.25" />
              <circle cx={pos.x} cy={pos.y} r="10" fill={m.color} opacity="0.08" />
              <circle cx={pos.x} cy={pos.y} r="5" fill="#0A0A0F" stroke={m.color} strokeWidth="1.5" />
            </g>
          );
        })}
      </svg>

      {/* Milestone labels */}
      {visibleMilestones.map((m, i) => {
        const pos = getMilestonePos(m);
        const xPct = (pos.x / w) * 100;
        // Clamp so labels don't go off-screen
        const clampedX = Math.max(5, Math.min(95, xPct));
        const isAbove = i % 2 === 0;

        return (
          <div
            key={i}
            className="absolute pointer-events-none transition-opacity duration-700"
            style={{
              left: `${clampedX}%`,
              top: isAbove ? `${pos.y - 52}px` : `${pos.y + 14}px`,
              transform: 'translateX(-50%)',
              opacity: progress >= m.progress ? 0.9 : 0,
            }}
          >
            <div className="glass rounded-lg px-2.5 py-1 text-center whitespace-nowrap">
              <span className="font-mono text-[11px] font-bold" style={{ color: m.color }}>{m.value}</span>
              <span className="block text-[8px] font-mono text-[#6B6B80] uppercase tracking-wider">{m.label}</span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
