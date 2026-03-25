import { useEffect, useRef } from 'react';

/**
 * HeroKinetic — Kinetic typography hero with animated particle-to-signal background.
 * Particles start chaotic and organize into a growth line on scroll.
 */

const PARTICLE_COUNT = 80;

interface Particle {
  x: number;
  y: number;
  targetX: number;
  targetY: number;
  vx: number;
  vy: number;
  size: number;
  alpha: number;
}

function generateCurvePoint(t: number, w: number, h: number): [number, number] {
  const baseY = Math.pow(t, 1.6);
  const noise = Math.sin(t * 12) * 0.015;
  const y = Math.min(1, baseY + noise);
  return [t * w, h * 0.85 - y * h * 0.7];
}

export function HeroBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particlesRef = useRef<Particle[]>([]);
  const progressRef = useRef(0);
  const rafRef = useRef(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resize = () => {
      canvas.width = window.innerWidth * window.devicePixelRatio;
      canvas.height = window.innerHeight * window.devicePixelRatio;
      canvas.style.width = `${window.innerWidth}px`;
      canvas.style.height = `${window.innerHeight}px`;
      ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
      initParticles();
    };

    const initParticles = () => {
      const w = window.innerWidth;
      const h = window.innerHeight;
      const particles: Particle[] = [];

      for (let i = 0; i < PARTICLE_COUNT; i++) {
        const t = i / (PARTICLE_COUNT - 1);
        const [tx, ty] = generateCurvePoint(t, w, h);
        particles.push({
          x: Math.random() * w,
          y: Math.random() * h,
          targetX: tx,
          targetY: ty,
          vx: (Math.random() - 0.5) * 0.8,
          vy: (Math.random() - 0.5) * 0.8,
          size: 1.5 + Math.random() * 1.5,
          alpha: 0.2 + Math.random() * 0.4,
        });
      }
      particlesRef.current = particles;
    };

    const handleScroll = () => {
      const raw = window.scrollY / (window.innerHeight * 0.8);
      progressRef.current = Math.max(0, Math.min(1, raw));
    };

    const draw = () => {
      const w = window.innerWidth;
      const h = window.innerHeight;
      const p = progressRef.current;

      ctx.clearRect(0, 0, w, h);

      const particles = particlesRef.current;

      // Update & draw particles
      particles.forEach((pt) => {
        // Lerp toward target based on progress
        const lerpStrength = p * 0.08;
        pt.x += pt.vx * (1 - p * 0.9);
        pt.y += pt.vy * (1 - p * 0.9);
        pt.x += (pt.targetX - pt.x) * lerpStrength;
        pt.y += (pt.targetY - pt.y) * lerpStrength;

        // Wrap around when chaotic
        if (p < 0.5) {
          if (pt.x < 0) pt.x = w;
          if (pt.x > w) pt.x = 0;
          if (pt.y < 0) pt.y = h;
          if (pt.y > h) pt.y = 0;
        }

        // Draw particle
        const alpha = pt.alpha * (0.3 + p * 0.7);
        ctx.beginPath();
        ctx.arc(pt.x, pt.y, pt.size * (1 - p * 0.3), 0, Math.PI * 2);
        ctx.fillStyle = `rgba(0, 255, 209, ${alpha})`;
        ctx.fill();
      });

      // Draw connecting line when organized
      if (p > 0.3) {
        const lineAlpha = Math.min(1, (p - 0.3) * 2);
        ctx.beginPath();
        const steps = 100;
        for (let i = 0; i <= steps; i++) {
          const t = i / steps;
          const [px, py] = generateCurvePoint(t, w, h);
          if (i === 0) ctx.moveTo(px, py);
          else ctx.lineTo(px, py);
        }
        ctx.strokeStyle = `rgba(0, 255, 209, ${lineAlpha * 0.6})`;
        ctx.lineWidth = 2;
        ctx.stroke();

        // Area fill
        if (p > 0.5) {
          const areaAlpha = Math.min(1, (p - 0.5) * 2) * 0.08;
          ctx.lineTo(w, h * 0.85);
          ctx.lineTo(0, h * 0.85);
          ctx.closePath();
          ctx.fillStyle = `rgba(0, 255, 209, ${areaAlpha})`;
          ctx.fill();
        }
      }

      // Grid lines (always visible, subtle)
      ctx.strokeStyle = 'rgba(255,255,255,0.03)';
      ctx.lineWidth = 1;
      for (let i = 1; i < 4; i++) {
        ctx.beginPath();
        ctx.moveTo(0, (h * i) / 4);
        ctx.lineTo(w, (h * i) / 4);
        ctx.stroke();
      }

      rafRef.current = requestAnimationFrame(draw);
    };

    resize();
    window.addEventListener('resize', resize);
    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    rafRef.current = requestAnimationFrame(draw);

    return () => {
      window.removeEventListener('resize', resize);
      window.removeEventListener('scroll', handleScroll);
      cancelAnimationFrame(rafRef.current);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full"
      aria-hidden="true"
    />
  );
}
