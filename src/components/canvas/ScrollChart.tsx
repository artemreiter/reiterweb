import { useEffect, useRef, useState } from 'react';

interface Milestone {
  progress: number; // 0-1, when this milestone appears
  label: string;
  value: string;
  color: string;
}

const MILESTONES: Milestone[] = [
  { progress: 0.08, label: 'Broken tracking', value: '12%', color: '#EF4444' },
  { progress: 0.2, label: 'Analytics Audit', value: '18%', color: '#FFB84C' },
  { progress: 0.35, label: 'Added GTM', value: '31%', color: '#FFB84C' },
  { progress: 0.48, label: 'Server-side Tagging', value: '52%', color: '#4C8CFF' },
  { progress: 0.6, label: 'Attribution Model', value: '78%', color: '#4C8CFF' },
  { progress: 0.75, label: 'Custom Dashboards', value: '112%', color: '#00E5A0' },
  { progress: 0.9, label: 'Full Optimization', value: '147%', color: '#00E5A0' },
];

// Generate a smooth upward curve with some realistic noise
function generatePath(width: number, height: number, progress: number): string {
  const points: [number, number][] = [];
  const steps = 100;
  const visibleSteps = Math.floor(steps * progress);

  for (let i = 0; i <= visibleSteps; i++) {
    const t = i / steps;
    // Exponential growth curve with some noise
    const baseY = Math.pow(t, 1.8);
    const noise = Math.sin(t * 15) * 0.02 + Math.sin(t * 7.3) * 0.015;
    const y = Math.min(1, baseY + noise);

    const px = t * width;
    const py = height - y * (height * 0.85) - height * 0.08;
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
  const steps = Math.floor(100 * progress);
  const lastX = (steps / 100) * width;
  return `${linePath} L ${lastX},${height} L 0,${height} Z`;
}

export function ScrollChart() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [progress, setProgress] = useState(0);
  const [dimensions, setDimensions] = useState({ width: 800, height: 400 });

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const updateDimensions = () => {
      const rect = container.getBoundingClientRect();
      setDimensions({ width: rect.width, height: Math.min(rect.width * 0.5, 450) });
    };

    updateDimensions();
    window.addEventListener('resize', updateDimensions);

    const handleScroll = () => {
      const rect = container.getBoundingClientRect();
      const viewH = window.innerHeight;
      // Start animating when section enters viewport, complete when it leaves
      const start = viewH * 0.8;
      const end = -rect.height * 0.3;
      const raw = (start - rect.top) / (start - end);
      setProgress(Math.max(0, Math.min(1, raw)));
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();

    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', updateDimensions);
    };
  }, []);

  const { width, height } = dimensions;
  const linePath = generatePath(width, height, progress);
  const areaPath = generateAreaPath(width, height, progress);

  // Calculate visible milestones
  const visibleMilestones = MILESTONES.filter(m => progress >= m.progress);

  // Get position for a milestone
  const getMilestonePos = (m: Milestone) => {
    const t = m.progress;
    const baseY = Math.pow(t, 1.8);
    const noise = Math.sin(t * 15) * 0.02 + Math.sin(t * 7.3) * 0.015;
    const y = Math.min(1, baseY + noise);
    return {
      x: t * width,
      y: height - y * (height * 0.85) - height * 0.08,
    };
  };

  return (
    <div ref={containerRef} className="relative w-full" style={{ height: `${height + 80}px` }}>
      <svg
        viewBox={`0 0 ${width} ${height}`}
        className="w-full"
        style={{ height: `${height}px` }}
        preserveAspectRatio="none"
      >
        <defs>
          {/* Area gradient */}
          <linearGradient id="chart-area-grad" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor="#00E5A0" stopOpacity="0.15" />
            <stop offset="100%" stopColor="#00E5A0" stopOpacity="0" />
          </linearGradient>
          {/* Line gradient */}
          <linearGradient id="chart-line-grad" x1="0" x2="1" y1="0" y2="0">
            <stop offset="0%" stopColor="#EF4444" />
            <stop offset="30%" stopColor="#FFB84C" />
            <stop offset="60%" stopColor="#4C8CFF" />
            <stop offset="100%" stopColor="#00E5A0" />
          </linearGradient>
          {/* Glow filter */}
          <filter id="chart-glow">
            <feGaussianBlur stdDeviation="4" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Grid lines */}
        {[0.2, 0.4, 0.6, 0.8].map(y => (
          <line
            key={y}
            x1={0}
            y1={height * y}
            x2={width}
            y2={height * y}
            stroke="#2A2A3A"
            strokeWidth="0.5"
            strokeDasharray="4 8"
          />
        ))}
        {[0.25, 0.5, 0.75].map(x => (
          <line
            key={x}
            x1={width * x}
            y1={0}
            x2={width * x}
            y2={height}
            stroke="#2A2A3A"
            strokeWidth="0.5"
            strokeDasharray="4 8"
          />
        ))}

        {/* Area fill */}
        {areaPath && (
          <path d={areaPath} fill="url(#chart-area-grad)" />
        )}

        {/* Main line with glow */}
        {linePath && (
          <>
            <path
              d={linePath}
              fill="none"
              stroke="url(#chart-line-grad)"
              strokeWidth="3"
              strokeLinecap="round"
              filter="url(#chart-glow)"
            />
            <path
              d={linePath}
              fill="none"
              stroke="url(#chart-line-grad)"
              strokeWidth="2"
              strokeLinecap="round"
            />
          </>
        )}

        {/* Milestone markers */}
        {visibleMilestones.map((m, i) => {
          const pos = getMilestonePos(m);
          return (
            <g key={i}>
              {/* Vertical dashed line */}
              <line
                x1={pos.x}
                y1={pos.y}
                x2={pos.x}
                y2={height}
                stroke={m.color}
                strokeWidth="0.5"
                strokeDasharray="3 6"
                opacity="0.4"
              />
              {/* Outer glow ring */}
              <circle cx={pos.x} cy={pos.y} r="8" fill={m.color} opacity="0.15" />
              {/* Dot */}
              <circle cx={pos.x} cy={pos.y} r="4" fill="#0A0A0F" stroke={m.color} strokeWidth="2" />
            </g>
          );
        })}
      </svg>

      {/* Milestone labels (HTML overlay for better text rendering) */}
      {visibleMilestones.map((m, i) => {
        const pos = getMilestonePos(m);
        const isAbove = i % 2 === 0;
        const xPercent = (pos.x / width) * 100;
        const yPixel = pos.y;

        return (
          <div
            key={i}
            className="absolute transition-all duration-500 ease-out"
            style={{
              left: `${xPercent}%`,
              top: isAbove ? `${yPixel - 60}px` : `${yPixel + 16}px`,
              transform: 'translateX(-50%)',
              opacity: progress >= m.progress ? 1 : 0,
            }}
          >
            <div className="glass rounded-lg px-3 py-1.5 text-center whitespace-nowrap">
              <div className="font-mono text-xs font-bold" style={{ color: m.color }}>
                {m.value}
              </div>
              <div className="text-[9px] font-mono text-muted uppercase tracking-wider mt-0.5">
                {m.label}
              </div>
            </div>
          </div>
        );
      })}

      {/* Y-axis labels */}
      <div className="absolute left-0 top-0 bottom-0 flex flex-col justify-between py-4 pointer-events-none" style={{ height: `${height}px` }}>
        {['150%', '100%', '50%', '0%'].map(label => (
          <span key={label} className="font-mono text-[9px] text-muted/40 -ml-1">{label}</span>
        ))}
      </div>
    </div>
  );
}
