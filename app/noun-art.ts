import { enemyMotion } from './enemy-traits';
import { VOCABULARY } from './lesson-data';
const images = new Map<string, HTMLImageElement>();
let loading: Promise<void> | undefined;
export function nounArtPath(word: string) {
  return (
    '/enemies/' +
    word.toLowerCase().replace(/[^a-z0-9]+/g, '-') +
    '.svg?v=full-body-1'
  );
}
export function loadNounArt(): Promise<void> {
  loading ??= Promise.all(
    VOCABULARY.flat()
      .map(([word]) =>
        [0, 1].map(
          (frame) =>
            new Promise<void>((resolve, reject) => {
              const img = new Image();
              img.onload = () => {
                images.set(word + frame, img);
                resolve();
              };
              img.onerror = () =>
                reject(new Error('Cannot load enemy artwork: ' + word));
              img.src = nounArtPath(word).replace(
                '.svg',
                frame ? '-alt.svg' : '.svg',
              );
            }),
        ),
      )
      .flat(),
  )
    .then(() => undefined)
    .catch((error) => {
      loading = undefined;
      throw error;
    });
  return loading;
}
export function drawNounEnemy(
  ctx: CanvasRenderingContext2D,
  word: string,
  x: number,
  y: number,
  w: number,
  h: number,
  time = 0,
  vx = 0,
) {
  const motion = enemyMotion(word);
  const animate =
    ['fly', 'swim', 'hop', 'slither'].includes(motion) || Math.abs(vx) > 5;
  const frame = animate ? Math.floor(time * (motion === 'fly' ? 7 : 5)) % 2 : 0;
  const img = images.get(word + frame);
  if (!img) return;
  ctx.save();
  ctx.translate(x + w / 2, y + h / 2);
  if (vx < -5 && !['drop', 'roll', 'guard', 'hover'].includes(motion))
    ctx.scale(-1, 1);
  ctx.drawImage(img, -w / 2, -h / 2, w, h);
  ctx.restore();
}
