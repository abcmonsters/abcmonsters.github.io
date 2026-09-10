const WENDY_PATH = '/companions/wendy.webp?v=wendy-1';
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
) {
  if (!wendy?.complete || !wendy.naturalWidth) return false;
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(Math.sin(time * 2.7) * 0.08);
  ctx.imageSmoothingEnabled = true;
  ctx.shadowColor = '#f7d66d88';
  ctx.shadowBlur = 6;
  ctx.drawImage(wendy, -size / 2, -size / 2, size, size);
  ctx.restore();
  return true;
}
