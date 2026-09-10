const SCENE_PATHS = Array.from(
  { length: 26 },
  (_, level) =>
    `/scenes-v3/level-${String.fromCharCode(97 + level)}.webp?v=unique-scenes-1`,
);
const CLOUD_PATHS = Array.from(
  { length: 6 },
  (_, index) => `/scenery/clouds-v1/cloud-${index + 1}.webp?v=painted-clouds-1`,
);

const scenes: HTMLImageElement[] = [];
const clouds: HTMLImageElement[] = [];
let loading: Promise<void> | undefined;

function loadImages(paths: string[], destination: HTMLImageElement[]) {
  return Promise.all(
    paths.map(
      (src, index) =>
        new Promise<void>((resolve, reject) => {
          const image = new Image();
          image.onload = () => {
            destination[index] = image;
            resolve();
          };
          image.onerror = () => reject(new Error(`Cannot load artwork ${src}`));
          image.src = src;
        }),
    ),
  );
}

export function loadSceneArt(): Promise<void> {
  loading ??= Promise.all([
    loadImages(SCENE_PATHS, scenes),
    loadImages(CLOUD_PATHS, clouds),
  ]).then(() => undefined);
  return loading;
}

export function drawCloudArt(
  ctx: CanvasRenderingContext2D,
  level: number,
  camera: number,
  time: number,
  night: boolean,
) {
  if (!clouds.length) return;
  ctx.save();
  ctx.imageSmoothingEnabled = true;
  for (let i = 0; i < 7; i++) {
    const image = clouds[(level * 2 + i) % clouds.length];
    if (!image?.complete || !image.naturalWidth) continue;
    const width = 92 + ((level * 19 + i * 31) % 70);
    const height = width * (image.naturalHeight / image.naturalWidth);
    const drift = camera * (0.055 + (i % 3) * 0.025) - time * (2.2 + i * 0.35);
    const x = ((((i * 151 + level * 43 - drift) % 680) + 680) % 680) - 145;
    const y = 126 + ((i * 71 + level * 29) % 245);
    ctx.globalAlpha = night ? 0.38 : 0.58 + (i % 3) * 0.09;
    ctx.drawImage(image, x, y, width, height);
  }
  ctx.restore();
}

export function drawSceneArt(
  ctx: CanvasRenderingContext2D,
  level: number,
  camera: number,
  worldWidth: number,
) {
  const image = scenes[level];
  if (!image?.complete || !image.naturalWidth) return false;
  const sourceHeight = image.naturalHeight;
  const sourceWidth = sourceHeight * (432 / 640);
  const travel = Math.max(0, image.naturalWidth - sourceWidth);
  const progress = camera / Math.max(1, worldWidth - 432);
  const sourceX = Math.max(0, Math.min(travel, progress * travel));
  ctx.save();
  ctx.imageSmoothingEnabled = true;
  ctx.globalAlpha = 0.9;
  ctx.drawImage(image, sourceX, 0, sourceWidth, sourceHeight, 0, 0, 432, 640);
  ctx.restore();
  return true;
}
