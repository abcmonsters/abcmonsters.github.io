export type MonPose = {
  speed: number;
  grounded: boolean;
  vy: number;
  hurt: number;
  landing: number;
  stride: number;
  speaking?: boolean;
};
export function monExpression(time: number, pose: MonPose) {
  const run = Math.min(1, Math.abs(pose.speed) / 240);
  // A slow resting breath, with a faster cycle under effort. Feet stay anchored.
  const breath =
    Math.sin((time * Math.PI * 2) / (3.8 - run * 1.8)) * (0.012 + run * 0.005);
  const blinkPulse = (start: number) => {
    const d = time - start;
    if (d < 0 || d > 0.19) return 0;
    return d < 0.065
      ? Math.sin(((d / 0.065) * Math.PI) / 2)
      : Math.cos((((d - 0.065) / 0.125) * Math.PI) / 2);
  };
  const cycle = Math.floor(time / 4.7),
    start = cycle * 4.7 + 1.25;
  let blink = Math.max(
    blinkPulse(start),
    cycle % 3 === 2 ? blinkPulse(start + 0.34) : 0,
  );
  if (pose.landing > 0.06) blink = Math.max(blink, 0.4);
  if (pose.hurt > 1.35) blink = Math.max(blink, 0.78);
  const talk = pose.speaking
    ? 0.48 + 0.35 * (0.5 + 0.5 * Math.sin(time * 21) * Math.sin(time * 9))
    : 0;
  const mouth =
    pose.hurt > 1.35
      ? 0.3
      : talk ||
        (!pose.grounded
          ? pose.vy < 0
            ? 0.94
            : 0.78
          : 0.39 +
            run * 0.2 +
            (Math.sin(time * (run ? 8 : 1.65)) * 0.5 + 0.5) *
              (0.04 + run * 0.12));
  return { blink: Math.max(0, Math.min(1, blink)), mouth, breath, run };
}
// The original raster remains intact. This is a runtime facial rig: original
// eye/mouth pixels are compressed inside their masks, like eyelids and a jaw.
export function drawMonSprite(
  ctx: CanvasRenderingContext2D,
  sprite: HTMLImageElement,
  time: number,
  pose: MonPose,
) {
  const { blink, mouth } = monExpression(time, pose),
    N = 1254;
  ctx.drawImage(sprite, 0, 0, N, N);
  const patch = (
    points: number[][],
    x: number,
    y: number,
    w: number,
    h: number,
    openness: number,
  ) => {
    ctx.save();
    ctx.beginPath();
    points.forEach(([px, py], i) =>
      i ? ctx.lineTo(px, py) : ctx.moveTo(px, py),
    );
    ctx.closePath();
    ctx.clip();
    const skin = ctx.createLinearGradient(x, y, x + w, y + h);
    skin.addColorStop(0, '#ffe900');
    skin.addColorStop(0.55, '#ffe300');
    skin.addColorStop(1, '#ffdc00');
    ctx.fillStyle = skin;
    ctx.fillRect(x - 15, y - 15, w + 30, h + 30);
    const newH = Math.max(9, h * openness),
      sy = sprite.naturalHeight / N,
      sx = sprite.naturalWidth / N;
    ctx.drawImage(
      sprite,
      x * sx,
      y * sy,
      w * sx,
      h * sy,
      x,
      y + (h - newH) * 0.5,
      w,
      newH,
    );
    ctx.restore();
  };
  if (blink > 0.01) {
    patch(
      [
        [424, 380],
        [442, 350],
        [474, 312],
        [530, 270],
        [562, 238],
        [690, 238],
        [731, 275],
        [770, 311],
        [803, 355],
        [822, 387],
        [822, 499],
        [800, 544],
        [772, 585],
        [718, 624],
        [688, 644],
        [562, 644],
        [519, 619],
        [475, 581],
        [445, 538],
        [424, 505],
      ],
      424,
      238,
      398,
      406,
      1 - blink * 0.98,
    );
  }
  patch(
    [
      [496, 650],
      [763, 650],
      [763, 666],
      [795, 683],
      [822, 697],
      [822, 752],
      [805, 781],
      [775, 811],
      [747, 828],
      [687, 861],
      [566, 861],
      [530, 843],
      [491, 814],
      [460, 787],
      [429, 756],
      [429, 695],
      [461, 678],
      [496, 665],
    ],
    429,
    650,
    393,
    211,
    mouth,
  );
}
