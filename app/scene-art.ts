const SCENE_PATHS = Array.from(
  { length: 26 },
  (_, level) =>
    `/scenes-v3/level-${String.fromCharCode(97 + level)}.webp?v=unique-scenes-1`,
);

const scenes: HTMLImageElement[] = [];
let loading: Promise<void> | undefined;

export function loadSceneArt(): Promise<void> {
  loading ??= Promise.all(
    SCENE_PATHS.map(
      (src, index) =>
        new Promise<void>((resolve, reject) => {
          const image = new Image();
          image.onload = () => {
            scenes[index] = image;
            resolve();
          };
          image.onerror = () => reject(new Error(`Cannot load scene ${src}`));
          image.src = src;
        }),
    ),
  ).then(() => undefined);
  return loading;
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
