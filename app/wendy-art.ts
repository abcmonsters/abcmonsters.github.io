export function loadWendyArt() {
  return Promise.resolve();
}

function limb(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  length: number,
  angle: number,
) {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(angle);
  ctx.strokeStyle = '#151515';
  ctx.lineWidth = 4;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.lineTo(0, length);
  ctx.stroke();
  ctx.fillStyle = '#fff19a';
  ctx.beginPath();
  ctx.ellipse(0, length + 3, 8, 6, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();
  ctx.restore();
}

export function drawWendy(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  size: number,
  time: number,
  speaking = false,
) {
  const blink = Math.sin(time * 0.73 + 1.4) > 0.965,
    wave = Math.sin(time * 3.1),
    kick = Math.sin(time * 2.25 + 0.8),
    mouthOpen = speaking && Math.sin(time * 13) > -0.25;
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(Math.sin(time * 1.35) * 0.075);
  ctx.scale(size / 100, size / 100);
  ctx.shadowColor = '#f7d66d77';
  ctx.shadowBlur = 7;
  limb(ctx, -19, -4, 31, -1.05 + wave * 0.24);
  limb(ctx, 19, -4, 31, 1.05 - wave * 0.3);
  limb(ctx, -11, 32, 29, -0.45 + kick * 0.2);
  limb(ctx, 11, 32, 29, 0.45 - kick * 0.2);
  ctx.shadowBlur = 0;
  ctx.fillStyle = '#ff3b35';
  ctx.strokeStyle = '#111';
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.roundRect(-19, -31, 38, 67, 9);
  ctx.fill();
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(-11, -31);
  ctx.lineTo(-3, -48);
  ctx.lineTo(17, -29);
  ctx.closePath();
  ctx.fillStyle = '#111';
  ctx.fill();
  ctx.fillStyle = '#fff19a';
  ctx.beginPath();
  ctx.moveTo(-11, -31);
  ctx.lineTo(-5, -42);
  ctx.lineTo(10, -29);
  ctx.quadraticCurveTo(1, -20, -11, -31);
  ctx.fill();
  ctx.strokeStyle = '#111';
  ctx.lineWidth = 3;
  ctx.fillStyle = '#fff';
  for (const eyeX of [-10, 10]) {
    ctx.beginPath();
    ctx.ellipse(eyeX, -13, 10, blink ? 2 : 12, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    if (!blink) {
      ctx.fillStyle = '#161616';
      ctx.beginPath();
      ctx.arc(eyeX + Math.sin(time * 0.8) * 1.5, -11, 2.4, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#fff';
    }
  }
  ctx.fillStyle = '#fff0ee';
  ctx.beginPath();
  if (mouthOpen) ctx.ellipse(0, 8, 8, 9, 0, 0, Math.PI * 2);
  else ctx.roundRect(-8, 3, 16, 10, 5);
  ctx.fill();
  ctx.stroke();
  if (mouthOpen) {
    ctx.fillStyle = '#ff8585';
    ctx.beginPath();
    ctx.ellipse(0, 12, 5, 2.5, 0, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.fillStyle = '#c7c7c7';
  ctx.fillRect(-18, 21, 36, 9);
  ctx.strokeRect(-18, 21, 36, 9);
  ctx.restore();
  return true;
}
