'use client';

import { useEffect, useRef } from 'react';
import {
  drawCharacterArt,
  loadCharacterArt,
  type CharacterId,
} from './character-art';
import { drawMonSprite, monExpression } from './mon-animation';

export default function CharacterChoicePortrait({
  character,
  label,
}: {
  character: CharacterId;
  label: string;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    let frame = 0;
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;

    const mon = new window.Image();
    mon.src = '/mon-sprite.png';
    void loadCharacterArt();
    const startedAt = performance.now();

    const draw = (now: number) => {
      const time = (now - startedAt) / 1000;
      const pose = {
        speed: 0,
        grounded: true,
        vy: 0,
        hurt: 0,
        landing: 0,
        stride: 0,
        speaking: true,
      };
      ctx.clearRect(0, 0, 180, 180);
      ctx.save();
      const float = Math.sin(time * 2.2) * 4;
      ctx.translate(90, 168 + float);
      ctx.rotate(Math.sin(time * 1.7) * 0.025);

      if (character === 'mon' && mon.complete && mon.naturalWidth) {
        const { breath } = monExpression(time, pose);
        ctx.scale((1 - breath) * 0.132, (1 + breath) * 0.132);
        ctx.translate(-627, -1140);
        drawMonSprite(ctx, mon, time, pose);
      } else {
        const size =
          character === 'rio' ? 174 : character === 'sol' ? 130 : 150;
        drawCharacterArt(ctx, character, size, time, pose);
        if (character === 'mori') {
          const mouthOpen = 2.5 + Math.abs(Math.sin(time * 8)) * 3;
          ctx.beginPath();
          ctx.ellipse(0, -54, 8, mouthOpen, 0, 0, Math.PI);
          ctx.strokeStyle = '#244b2c';
          ctx.lineWidth = 2.5;
          ctx.lineCap = 'round';
          ctx.stroke();
        }
      }
      ctx.restore();
      frame = requestAnimationFrame(draw);
    };
    frame = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(frame);
  }, [character]);

  return (
    <canvas
      ref={canvasRef}
      width={180}
      height={180}
      className="character-choice-canvas"
      aria-label={`${label} đang chuyển động`}
    />
  );
}
