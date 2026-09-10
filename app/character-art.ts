export type CharacterId = 'mon' | 'mori' | 'rio' | 'sol';

export const CHARACTERS = [
  { id: 'mon', name: 'Mon', element: 'Thổ', image: '/mon-sprite.png' },
  { id: 'mori', name: 'Mori', element: 'Mộc', image: '/characters/mori.webp' },
  { id: 'rio', name: 'Rio', element: 'Thủy', image: '/characters/rio.webp' },
  { id: 'sol', name: 'Sol', element: 'Hỏa', image: '/characters/sol.webp' },
] as const satisfies readonly {
  id: CharacterId;
  name: string;
  element: string;
  image: string;
}[];

const heroArt = new Map<CharacterId, HTMLImageElement>();
let loading: Promise<void> | undefined;

export function loadCharacterArt() {
  loading ??= Promise.all(
    CHARACTERS.filter((character) => character.id !== 'mon').map(
      (character) =>
        new Promise<void>((resolve, reject) => {
          const image = new Image();
          image.onload = () => {
            heroArt.set(character.id, image);
            resolve();
          };
          image.onerror = () =>
            reject(new Error(`Cannot load character ${character.image}`));
          image.src = character.image;
        }),
    ),
  ).then(() => undefined);
  return loading;
}

export function drawCharacterArt(
  ctx: CanvasRenderingContext2D,
  id: CharacterId,
  size: number,
) {
  const image = heroArt.get(id);
  if (!image?.complete || !image.naturalWidth) return false;
  ctx.imageSmoothingEnabled = true;
  ctx.drawImage(image, -size / 2, -size, size, size);
  return true;
}
