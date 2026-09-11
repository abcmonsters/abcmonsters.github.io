import type { Platform } from './game-engine';

const PATHS = {
  cloud: '/platforms/cloud-platform-v1.png',
  bamboo: '/platforms/bamboo-platform-v1.png',
  lotus: '/platforms/lotus-platform-v1.png',
} as const;

const images = new Map<keyof typeof PATHS, HTMLImageElement>();
let loading: Promise<void> | undefined;

export function loadPlatformArt() {
  loading ??= Promise.all(
    (Object.entries(PATHS) as [keyof typeof PATHS, string][]).map(
      ([kind, src]) =>
        new Promise<void>((resolve, reject) => {
          const image = new Image();
          image.onload = () => {
            images.set(kind, image);
            resolve();
          };
          image.onerror = () =>
            reject(new Error(`Cannot load platform ${src}`));
          image.src = src;
        }),
    ),
  ).then(() => undefined);
  return loading;
}

export function drawPlatformArt(
  ctx: CanvasRenderingContext2D,
  platform: Platform,
  screenX: number,
  sky: boolean,
) {
  if (platform.ground || platform.motion === 'static') return false;
  const kind = platform.motion === 'water' ? 'lotus' : sky ? 'cloud' : 'bamboo';
  const image = images.get(kind);
  if (!image?.complete || !image.naturalWidth) return false;
  const height = kind === 'lotus' ? 48 : kind === 'cloud' ? 44 : 38;
  ctx.save();
  ctx.imageSmoothingEnabled = true;
  if (platform.motion === 'fall' && platform.fallDelay >= 0)
    ctx.globalAlpha = 0.9;
  ctx.drawImage(image, screenX - 6, platform.y - 8, platform.w + 12, height);
  ctx.restore();
  return true;
}
