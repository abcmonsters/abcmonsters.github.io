import type { Platform } from './game-engine';

const PATHS = {
  cloud: '/platforms/cloud-platform-v1.png',
  bamboo: '/platforms/bamboo-platform-v1.png',
  lotus: '/platforms/lotus-platform-v1.png',
  mountain: '/platforms/mountain-platform-v1.png',
  ceramic: '/platforms/ceramic-platform-v1.png',
  earth: '/platforms/earth-platform-v1.png',
  lantern: '/platforms/lantern-platform-v1.png',
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
  worldKind: string,
) {
  const kind =
    platform.motion === 'water'
      ? 'lotus'
      : platform.motion === 'fall'
        ? 'bamboo'
        : worldKind === 'mountain'
          ? 'mountain'
          : ['city', 'castle'].includes(worldKind)
            ? 'ceramic'
            : worldKind === 'night'
              ? 'lantern'
              : ['garden', 'forest', 'savanna'].includes(worldKind)
                ? 'earth'
                : worldKind === 'water'
                  ? platform.ground
                    ? 'ceramic'
                    : 'lotus'
                  : 'cloud';
  const image = images.get(kind);
  if (!image?.complete || !image.naturalWidth) return false;
  const height = platform.ground
    ? Math.max(54, platform.h + 28)
    : kind === 'lotus'
      ? 48
      : kind === 'cloud'
        ? 44
        : kind === 'lantern'
          ? 54
          : 42;
  ctx.save();
  ctx.imageSmoothingEnabled = true;
  if (platform.motion === 'fall' && platform.fallDelay >= 0)
    ctx.globalAlpha = 0.9;
  ctx.drawImage(
    image,
    screenX - (platform.ground ? 0 : 6),
    platform.y - (platform.ground ? 28 : 8),
    platform.w + (platform.ground ? 0 : 12),
    height,
  );
  ctx.restore();
  return true;
}
