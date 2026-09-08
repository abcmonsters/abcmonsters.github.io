import { VOCABULARY } from './lesson-data';
const images = new Map<string, HTMLImageElement>();
let loading: Promise<void> | undefined;
export function nounArtPath(word: string) {
  return '/enemies/' + word.toLowerCase().replace(/[^a-z0-9]+/g, '-') + '.svg';
}
export function loadNounArt(): Promise<void> {
  loading ??= Promise.all(
    VOCABULARY.flat().map(
      ([word]) =>
        new Promise<void>((resolve, reject) => {
          const img = new Image();
          img.onload = () => {
            images.set(word, img);
            resolve();
          };
          img.onerror = () =>
            reject(new Error('Cannot load enemy artwork: ' + word));
          img.src = nounArtPath(word);
        }),
    ),
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
) {
  const img = images.get(word);
  if (img) ctx.drawImage(img, x, y, w, h);
}
