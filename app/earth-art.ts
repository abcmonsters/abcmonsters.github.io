const ROCK_PATH = '/abilities/earth-rock.webp?v=earth-skill-1';
let rock: HTMLImageElement | undefined;
let loading: Promise<void> | undefined;

export function loadEarthArt() {
  loading ??= new Promise<void>((resolve, reject) => {
    const image = new Image();
    image.onload = () => {
      rock = image;
      resolve();
    };
    image.onerror = () =>
      reject(new Error(`Cannot load earth art ${ROCK_PATH}`));
    image.src = ROCK_PATH;
  });
  return loading;
}

export function drawEarthRock(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  size: number,
  rotation: number,
) {
  if (!rock?.complete || !rock.naturalWidth) return false;
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(rotation);
  ctx.imageSmoothingEnabled = true;
  ctx.shadowColor = '#f2bd42';
  ctx.shadowBlur = 8;
  ctx.drawImage(rock, -size / 2, -size / 2, size, size);
  ctx.restore();
  return true;
}
