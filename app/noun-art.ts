import { VOCABULARY } from './lesson-data';
const images = new Map<string, HTMLImageElement>();
let loading: Promise<void> | undefined;
const bottomPadding: Record<string, number> = {
  Alligator: 0.1088,
  Apple: 0.0417,
  Butterfly: 0.0856,
  Car: 0.1227,
  Cat: 0.0486,
  Crab: 0.0787,
  Dog: 0.0324,
  Eagle: 0.0208,
  Egg: 0.0301,
  Elephant: 0.0486,
  Fish: 0.0463,
  Hat: 0.0486,
  Helicopter: 0.0208,
  Igloo: 0.1042,
  Insect: 0.0347,
  Jacket: 0.0417,
  Ladybug: 0.0255,
  Nest: 0.0556,
  Octopus: 0.037,
  Penguin: 0.0556,
  Snake: 0.0579,
  Train: 0.0417,
  Turtle: 0.0671,
  'X-ray fish': 0.037,
  Xylophone: 0.0278,
  Yak: 0.0324,
  Yarn: 0.0995,
};

export function nounFootInset(word: string, drawnHeight: number) {
  return (bottomPadding[word] ?? 0) * drawnHeight;
}
export function nounArtPath(word: string) {
  return (
    '/enemies-raster/' +
    word.toLowerCase().replace(/[^a-z0-9]+/g, '-') +
    '.png?v=ai-raster-1'
  );
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
  _time = 0,
  vx = 0,
) {
  const img = images.get(word);
  if (!img) return;
  ctx.save();
  ctx.translate(x + w / 2, y + h / 2);
  if (vx < -5) ctx.scale(-1, 1);
  ctx.drawImage(img, -w / 2, -h / 2, w, h);
  ctx.restore();
}
