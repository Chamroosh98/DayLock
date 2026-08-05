import React, { useEffect, useRef } from 'react';

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  color: string;
  alpha: number;
  decay: number;
  gravity: number;
  friction: number;
  wobble: number;
  wobbleSpeed: number;
  wobbleWeight: number;
  drift: number;
}

export const ExplosionOverlay: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const particlesRef = useRef<Particle[]>([]);
  const animationFrameRef = useRef<number | null>(null);

  // Resize canvas to cover whole viewport
  const resizeCanvas = () => {
    const canvas = canvasRef.current;
    if (canvas) {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    }
  };

  useEffect(() => {
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    return () => {
      window.removeEventListener('resize', resizeCanvas);
    };
  }, []);

  const createExplosion = (
    rect: { x: number; y: number; width: number; height: number },
    colors: string[],
    particleCount = 550
  ) => {
    const isDark = document.documentElement.classList.contains('dark');
    const effectiveColors = colors.map(c => 
      c.toLowerCase() === '#ffffff' || c.toLowerCase() === '#fff'
        ? (isDark ? '#ffffff' : '#1e293b')
        : c
    );
    const particles = particlesRef.current;
    const centerX = rect.x + rect.width / 2;
    const centerY = rect.y + rect.height / 2;

    // Adjust counts based on screen size (keep it dense but performant)
    const finalCount = window.innerWidth < 768 ? Math.min(particleCount, 250) : particleCount;

    for (let i = 0; i < finalCount; i++) {
      // Pick random starting point uniformly inside the bounding rectangle of the card
      const x = rect.x + Math.random() * rect.width;
      const y = rect.y + Math.random() * rect.height;

      // Calculate direction from center to add a subtle outward pop
      const dx = x - centerX;
      const dy = y - centerY;
      const dist = Math.sqrt(dx * dx + dy * dy) || 1;

      // Base upward pop + slight radial explosion push
      const radialPush = 0.5 + Math.random() * 2.0;
      const vx = (dx / dist) * radialPush + (Math.random() - 0.5) * 2.0;
      const vy = -1.5 - Math.random() * 3.5; // Upward liftoff velocity

      // Elegant, fine-grained sand size (Telegram style)
      const size = 0.8 + Math.random() * 1.8;
      
      // Select from custom theme colors
      const color = effectiveColors[Math.floor(Math.random() * effectiveColors.length)];

      particles.push({
        x,
        y,
        vx,
        vy,
        size,
        color,
        alpha: 1.0,
        decay: 0.008 + Math.random() * 0.012, // Lasts ~1.5 seconds for elegant drift
        gravity: 0.05 + Math.random() * 0.06,  // Slow, floating descent
        friction: 0.96 + Math.random() * 0.02, // Natural drag
        wobble: Math.random() * Math.PI * 2,
        wobbleSpeed: 0.05 + Math.random() * 0.08,
        wobbleWeight: 0.3 + Math.random() * 0.7,
        drift: 0.2 + Math.random() * 0.4, // Constant gentle wind to the right
      });
    }

    // Spawn high-energy bright/white micro sparkles strictly from the center
    const sparkCount = Math.floor(finalCount / 5);
    const sparkColor = isDark ? '#ffffff' : '#f59e0b';
    for (let i = 0; i < sparkCount; i++) {
      const angle = Math.random() * Math.PI * 2;
      const force = 3 + Math.random() * 5;
      particles.push({
        x: centerX + (Math.random() - 0.5) * 30,
        y: centerY + (Math.random() - 0.5) * 30,
        vx: Math.cos(angle) * force,
        vy: Math.sin(angle) * force - 1,
        size: 0.6 + Math.random() * 1.0,
        color: sparkColor, // sharp amber-gold spark in light mode
        alpha: 1.0,
        decay: 0.02 + Math.random() * 0.02, // very fast fade
        gravity: 0.02,
        friction: 0.92,
        wobble: 0,
        wobbleSpeed: 0,
        wobbleWeight: 0,
        drift: 0.1,
      });
    }

    // Start tick loop if not currently active
    if (!animationFrameRef.current) {
      tick();
    }
  };

  const tick = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear with transparent canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const particles = particlesRef.current;

    for (let i = particles.length - 1; i >= 0; i--) {
      const p = particles[i];

      // Update positions with physics
      p.vx *= p.friction;
      p.vy += p.gravity;
      
      // Apply wind drift and horizontal sinusoidal wobble for natural floating noise
      p.wobble += p.wobbleSpeed;
      const wobbleOffset = Math.sin(p.wobble) * p.wobbleWeight;

      p.x += p.vx + p.drift + wobbleOffset;
      p.y += p.vy;
      p.alpha -= p.decay;

      // Remove out-of-bounds or faded particles
      if (p.alpha <= 0 || p.x < -100 || p.x > canvas.width + 100 || p.y > canvas.height + 100) {
        particles.splice(i, 1);
        continue;
      }

      // Render sand particle
      ctx.save();
      ctx.globalAlpha = p.alpha;
      ctx.fillStyle = p.color;

      // Render small glow for primary highlight colors or pure whites
      if (p.color === '#ffffff' || p.color === '#f59e0b' || p.color.includes('400') || p.color.includes('500') || p.color.startsWith('#10b981') || p.color.startsWith('#6366f1') || p.color.startsWith('#ef4444')) {
        ctx.shadowBlur = 4;
        ctx.shadowColor = p.color;
      }

      ctx.beginPath();
      // Draw as a circular grain of sand/ash
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }

    if (particles.length > 0) {
      animationFrameRef.current = requestAnimationFrame(tick);
    } else {
      animationFrameRef.current = null;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
  };

  useEffect(() => {
    const handleTrigger = (e: Event) => {
      const customEvent = e as CustomEvent<{
        rect: DOMRect | { x: number; y: number; width: number; height: number };
        colors: string[];
        particleCount?: number;
      }>;
      if (customEvent.detail && customEvent.detail.rect) {
        createExplosion(
          customEvent.detail.rect,
          customEvent.detail.colors || ['#10b981', '#34d399', '#059669', document.documentElement.classList.contains('dark') ? '#ffffff' : '#1e293b'],
          customEvent.detail.particleCount
        );
      }
    };

    window.addEventListener('trigger-session-explosion', handleTrigger);
    return () => {
      window.removeEventListener('trigger-session-explosion', handleTrigger);
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 w-full h-full pointer-events-none z-[9999]"
      style={{ mixBlendMode: 'screen' }}
    />
  );
};
