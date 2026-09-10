const WENDY_PATH = '/companions/wendy.webp?v=wendy-original-2';
let wendy: HTMLImageElement | undefined;
let loading: Promise<void> | undefined;

export function loadWendyArt() {
  loading ??= new Promise<void>((resolve, reject) => {
    const image = new Image();
    image.onload = () => {
      wendy = image;
      resolve();
    };
    image.onerror = () => reject(new Error(`Cannot load Wendy ${WENDY_PATH}`));
    image.src = WENDY_PATH;
  });
  return loading;
}

export function drawWendy(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  size: number,
  time: number,
  speaking = false,
) {
  if (!wendy?.complete || !wendy.naturalWidth) return false;
  const blink = Math.sin(time * 0.73 + 1.4) > 0.965,
    talk = speaking && Math.sin(time * 13) > -0.2,
    breathe = Math.sin(time * 2.1) * 0.012;
  ctx.save();
  ctx.translate(x, y + Math.sin(time * 2.4) * size * 0.025);
  ctx.rotate(Math.sin(time * 1.35) * 0.075);
  ctx.scale(1 - breathe, 1 + breathe);
  ctx.imageSmoothingEnabled = true;
  ctx.shadowColor = '#f7d66d88';
  ctx.shadowBlur = 6;
  ctx.drawImage(wendy, -size / 2, -size / 2, size, size);
  ctx.shadowBlur = 0;

  if (blink) {
    ctx.fillStyle = '#fff';
    ctx.strokeStyle = '#111';
    ctx.lineWidth = Math.max(1, size * 0.008);
    for (const eye of [
      { x: -size * 0.055, y: -size * 0.115 },
      { x: size * 0.095, y: -size * 0.115 },
    ]) {
      ctx.beginPath();
      ctx.ellipse(eye.x, eye.y, size * 0.052, size * 0.068, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(eye.x, eye.y + size * 0.006, size * 0.025, Math.PI, 0);
      ctx.stroke();
    }
  }

  if (speaking) {
    ctx.fillStyle = '#ff3b35';
    ctx.beginPath();
    ctx.roundRect(
      -size * 0.052,
      size * 0.005,
      size * 0.105,
      size * 0.09,
      size * 0.025,
    );
    ctx.fill();
    ctx.fillStyle = '#fff0ee';
    ctx.strokeStyle = '#111';
    ctx.lineWidth = Math.max(1, size * 0.008);
    ctx.beginPath();
    ctx.ellipse(
      0,
      size * 0.045,
      size * 0.036,
      talk ? size * 0.038 : size * 0.012,
      0,
      0,
      Math.PI * 2,
    );
    ctx.fill();
    ctx.stroke();
  }
  ctx.restore();
  return true;
}
