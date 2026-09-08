'use client';
import { useEffect, useRef } from 'react';
import { voiceSpeaking } from './recorded-speech';
import { drawMonSprite, monExpression, type MonPose } from './mon-animation';
export default function MonPortrait({
  className = '',
  label = 'Mon',
  happy = false,
}: {
  className?: string;
  label?: string;
  happy?: boolean;
}) {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const ctx = ref.current?.getContext('2d');
    if (!ctx) return;
    const img = new window.Image();
    img.src = '/mon-sprite.png';
    let frame = 0;
    const start = performance.now();
    const tick = (now: number) => {
      if (img.complete && img.naturalWidth) {
        const t = (now - start) / 1000;
        const pose: MonPose = {
          speed: 0,
          grounded: true,
          vy: 0,
          hurt: 0,
          landing: 0,
          stride: 0,
          speaking: voiceSpeaking(),
        };
        const { breath } = monExpression(t, pose);
        ctx.clearRect(0, 0, 328, 328);
        ctx.imageSmoothingEnabled = false;
        ctx.save();
        ctx.translate(164, 306);
        ctx.scale((1 - breath) * 0.246, (1 + breath) * 0.246);
        ctx.translate(-627, -1140);
        if (happy) ctx.rotate(Math.sin(t * 2) * 0.014);
        drawMonSprite(ctx, img, t, pose);
        ctx.restore();
      }
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [happy]);
  return (
    <canvas
      ref={ref}
      width={328}
      height={328}
      className={`mon-portrait ${className}`}
      aria-label={label}
    />
  );
}
