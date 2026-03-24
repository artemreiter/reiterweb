import { useEffect, useRef, useState } from 'react';

interface Milestone {
  progress: number;
  label: string;
  value: string;
  color: string;
}

const MILESTONES: Milestone[] = [
  { progress: 0.05, label: 'Broken tracking', value: '12%', color: '#EF4444' },
  { progress: 0.15, label: 'Analytics Audit', value: '18%', color: '#F59E0B' },
  { progress: 0.28, label: 'Added GTM', value: '31%', color: '#F59E0B' },
  { progress: 0.42, label: 'Server-side Tagging', value: '52%', color: '#0066FF' },
  { progress: 0.56, label: 'Attribution Model', value: '78%', color: '#0066FF' },
  { progress: 0.72, label: 'Custom Dashboards', value: '112%', color: '#10B981' },
  { progress: 0.88, label: 'Full Optimization', value: '147%', color: '#10B981' },
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
  const [progress, setProgress] = useState(0.08);
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
      const heroHeight = window.innerHeight;
      const raw = window.scrollY / heroHeight;
      setProgress(Math.max(0.08, Math.min(1, raw)));
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
            <stop offset="0%" stopColor="#0066FF" stopOpacity="0.12" />
            <stop offset="60%" stopColor="#0066FF" stopOpacity="0.04" />
            <stop offset="100%" stopColor="#0066FF" stopOpacity="0" />
          </linearGradient>
          <linearGradient id="hero-line" x1="0" x2="1" y1="0" y2="0">
            <stop offset="0%" stopColor="#EF4444" />
            <stop offset="25%" stopColor="#F59E0B" />
            <stop offset="55%" stopColor="#0066FF" />
            <stop offset="100%" stopColor="#10B981" />
          </linearGradient>
        </defs>

        {/* Subtle grid lines */}
        {[0.25, 0.5, 0.75].map(y => (
          <line key={`h${y}`} x1={0} y1={h * y} x2={w} y2={h * y} stroke="#E5E5EA" strokeWidth="1" strokeDasharray="4 8" opacity="0.8" />
        ))}
        {[0.2, 0.4, 0.6, 0.8].map(x => (
          <line key={`v${x}`} x1={w * x} y1={0} x2={w * x} y2={h} stroke="#E5E5EA" strokeWidth="1" strokeDasharray="4 8" opacity="0.5" />
        ))}

        {/* Area fill */}
        {areaPath && <path d={areaPath} fill="url(#hero-area)" />}

        {/* Main line — no glow filter on light theme */}
        {linePath && (
          <path d={linePath} fill="none" stroke="url(#hero-line)" strokeWidth="3" strokeLinecap="round" />
        )}

        {/* Milestone dots */}
        {visibleMilestones.map((m, i) => {
          const pos = getMilestonePos(m);
          return (
            <g key={i}>
              <line x1={pos.x} y1={pos.y} x2={pos.x} y2={h} stroke={m.color} strokeWidth="1" strokeDasharray="4 8" opacity="0.2" />
              <circle cx={pos.x} cy={pos.y} r="20" fill={m.color} opacity="0.06" />
              <circle cx={pos.x} cy={pos.y} r="6" fill="white" stroke={m.color} strokeWidth="2.5" />
            </g>
          );
        })}
      </svg>

      {/* Milestone labels */}
      {visibleMilestones.map((m, i) => {
        const pos = getMilestonePos(m);
        const xPct = (pos.x / w) * 100;
        const clampedX = Math.max(5, Math.min(95, xPct));
        const isAbove = i % 2 === 0;

        return (
          <div
            key={i}
            className="absolute pointer-events-none transition-opacity duration-700"
            style={{
              left: `${clampedX}%`,
              top: isAbove ? `${pos.y - 56}px` : `${pos.y + 16}px`,
              transform: 'translateX(-50%)',
              opacity: progress >= m.progress ? 0.95 : 0,
            }}
          >
            <div className="bg-white shadow-[0_1px_3px_rgba(0,0,0,0.08),0_4px_12px_rgba(0,0,0,0.04)] border border-[#E5E5EA] rounded-lg px-3 py-2 text-center whitespace-nowrap">
              <span className="font-mono text-xs font-bold" style={{ color: m.color }}>{m.value}</span>
              <span className="block text-[11px] font-mono text-[#8E8E93] uppercase tracking-wider">{m.label}</span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
