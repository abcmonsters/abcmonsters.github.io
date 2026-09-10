import type { CharacterId } from './character-art';

const PATHS: Partial<Record<CharacterId, string>> = {
  mori: '/abilities/mori-log.webp?v=element-skills-1',
  rio: '/abilities/rio-water.webp?v=element-skills-1',
  sol: '/abilities/sol-fire.webp?v=element-skills-1',
};
const art = new Map<CharacterId, HTMLImageElement>();
let loading: Promise<void> | undefined;

export function loadElementArt() {
  loading ??= Promise.all(
    Object.entries(PATHS).map(
      ([id, src]) =>
        new Promise<void>((resolve, reject) => {
          const image = new Image();
          image.onload = () => {
            art.set(id as CharacterId, image);
            resolve();
          };
          image.onerror = () =>
            reject(new Error(`Cannot load skill art ${src}`));
          image.src = src;
        }),
    ),
  ).then(() => undefined);
  return loading;
}

export function drawElementProjectile(
  ctx: CanvasRenderingContext2D,
  id: CharacterId,
  x: number,
  y: number,
  size: number,
  rotation: number,
) {
  const image = art.get(id);
  if (!image?.complete || !image.naturalWidth) return false;
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(rotation);
  ctx.imageSmoothingEnabled = true;
  ctx.shadowColor =
    id === 'rio' ? '#74e8ff' : id === 'sol' ? '#ff9a38' : '#a8d867';
  ctx.shadowBlur = 7;
  ctx.drawImage(image, -size / 2, -size / 2, size, size);
  ctx.restore();
  return true;
}
