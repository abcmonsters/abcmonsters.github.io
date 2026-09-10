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
  time: number,
  pose: {
    speed: number;
    grounded: boolean;
    vy: number;
    hurt: number;
    speaking: boolean;
  },
) {
  const image = heroArt.get(id);
  if (!image?.complete || !image.naturalWidth) return false;
  const offsetX = -size / 2,
    offsetY = -size,
    scale = size / 512;
  ctx.imageSmoothingEnabled = true;
  ctx.drawImage(image, offsetX, offsetY, size, size);

  const feature = (
    source: [number, number, number, number],
    openness: number,
    skin: string,
  ) => {
    const [sx, sy, sw, sh] = source,
      x = offsetX + sx * scale,
      y = offsetY + sy * scale,
      w = sw * scale,
      h = sh * scale,
      visibleHeight = Math.max(1.5, h * openness);
    ctx.save();
    ctx.beginPath();
    ctx.ellipse(x + w / 2, y + h / 2, w / 2, h / 2, 0, 0, Math.PI * 2);
    ctx.clip();
    ctx.fillStyle = skin;
    ctx.fillRect(x - 2, y - 2, w + 4, h + 4);
    ctx.drawImage(
      image,
      sx,
      sy,
      sw,
      sh,
      x,
      y + (h - visibleHeight) / 2,
      w,
      visibleHeight,
    );
    ctx.restore();
  };
  const blinkPhase =
    (time + (id === 'sol' ? 0.45 : id === 'rio' ? 0.2 : 0)) % 4.6;
  const blink =
    blinkPhase > 1.25 && blinkPhase < 1.48
      ? Math.sin(((blinkPhase - 1.25) / 0.23) * Math.PI)
      : pose.hurt > 1.35
        ? 0.65
        : 0;
  const eyeOpen = Math.max(0.05, 1 - blink * 0.96);
  const effort = Math.min(1, Math.abs(pose.speed) / 240);
  const mouthOpen = pose.speaking
    ? 0.58 + Math.abs(Math.sin(time * 12)) * 0.42
    : !pose.grounded
      ? pose.vy < 0
        ? 1
        : 0.82
      : 0.7 + effort * 0.18 + Math.sin(time * 2) * 0.05;

  if (id === 'mori') {
    feature([159, 134, 67, 102], eyeOpen, '#5abe58');
    feature([287, 134, 67, 102], eyeOpen, '#5abe58');
  } else if (id === 'rio') {
    feature([216, 13, 82, 105], eyeOpen, '#48a7ea');
    feature([201, 276, 111, 70], mouthOpen, '#49a8eb');
  } else if (id === 'sol') {
    feature([213, 49, 88, 120], eyeOpen, '#ff3639');
    feature([91, 169, 91, 123], eyeOpen, '#ff3639');
    feature([329, 169, 91, 123], eyeOpen, '#ff3639');
    feature([198, 290, 119, 111], mouthOpen, '#ff3639');
  }
  return true;
}
