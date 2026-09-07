export const WORDS = [
  ['Apple', 'Quả táo', '🍎'],
  ['Ball', 'Quả bóng', '⚽'],
  ['Cat', 'Con mèo', '🐱'],
  ['Dog', 'Con chó', '🐶'],
  ['Elephant', 'Con voi', '🐘'],
  ['Fish', 'Con cá', '🐟'],
  ['Grapes', 'Nho', '🍇'],
  ['Hat', 'Cái mũ', '🎩'],
  ['Ice cream', 'Kem', '🍦'],
  ['Juice', 'Nước ép', '🧃'],
  ['Kite', 'Cái diều', '🪁'],
  ['Lion', 'Sư tử', '🦁'],
  ['Moon', 'Mặt trăng', '🌙'],
  ['Nest', 'Tổ chim', '🪺'],
  ['Orange', 'Quả cam', '🍊'],
  ['Penguin', 'Chim cánh cụt', '🐧'],
  ['Queen', 'Nữ hoàng', '👑'],
  ['Rabbit', 'Con thỏ', '🐰'],
  ['Sun', 'Mặt trời', '☀️'],
  ['Turtle', 'Rùa', '🐢'],
  ['Umbrella', 'Cái ô', '☂️'],
  ['Violin', 'Đàn vĩ cầm', '🎻'],
  ['Whale', 'Cá voi', '🐳'],
  ['Xylophone', 'Đàn phiến gỗ', '🎵'],
  ['Yo-yo', 'Con quay yo-yo', '🪀'],
  ['Zebra', 'Ngựa vằn', '🦓'],
];
export const WORLDS = [
  {
    name: 'Khu rừng',
    title: 'Khu rừng chữ cái',
    sky: '#b6dfce',
    light: '#e4efbb',
    far: '#8ebe9c',
    tree: '#5c9a6b',
    grass: '#90bd53',
    soil: '#a47d52',
  },
  {
    name: 'Bờ biển',
    title: 'Bờ biển kỳ diệu',
    sky: '#a9dfea',
    light: '#eaf7d2',
    far: '#73b9bf',
    tree: '#459c8b',
    grass: '#e8d783',
    soil: '#be9b60',
  },
  {
    name: 'Vườn mây',
    title: 'Vườn mây cầu vồng',
    sky: '#c8c4ed',
    light: '#f7dbe5',
    far: '#afa5cd',
    tree: '#a482b9',
    grass: '#c4a7d9',
    soil: '#91739f',
  },
  {
    name: 'Thung lũng',
    title: 'Thung lũng hoàng hôn',
    sky: '#f0c09e',
    light: '#f5e7b9',
    far: '#cdaa83',
    tree: '#b98867',
    grass: '#d9b360',
    soil: '#a47951',
  },
  {
    name: 'Xứ tuyết',
    title: 'Xứ tuyết lấp lánh',
    sky: '#bfdfea',
    light: '#ecf7f4',
    far: '#98c5d1',
    tree: '#7babbb',
    grass: '#edf9ee',
    soil: '#8fadb6',
  },
];
export const WIDTH = 432,
  HEIGHT = 640,
  WORLD_WIDTH = 2440;
export type Rect = { x: number; y: number; w: number; h: number };
export type Platform = Rect & { ground?: boolean };
export type Mode = 'ready' | 'playing' | 'paused' | 'quiz' | 'won' | 'lost';
export type GameEvent = {
  type: 'collect' | 'hurt' | 'stomp' | 'quiz';
  index?: number;
};
export type Game = {
  level: number;
  mode: Mode;
  time: number;
  camera: number;
  player: Rect & {
    vx: number;
    vy: number;
    grounded: boolean;
    facing: number;
    invincible: number;
  };
  hp: number;
  stars: number;
  platforms: Platform[];
  pickups: { x: number; y: number; got: boolean }[];
  enemies: (Rect & { origin: number; dead: boolean })[];
  boss: Rect & { hp: number; cooldown: number };
  checkpoint: number;
  jumpBuffer: number;
  coyote: number;
  events: GameEvent[];
};
export function createGame(level = 0): Game {
  return {
    level,
    mode: 'ready',
    time: 0,
    camera: 0,
    player: {
      x: 60,
      y: 485,
      w: 42,
      h: 54,
      vx: 0,
      vy: 0,
      grounded: false,
      facing: 1,
      invincible: 0,
    },
    hp: 3,
    stars: 0,
    platforms: [
      { x: 0, y: 550, w: 680, h: 100, ground: true },
      { x: 770, y: 550, w: 590, h: 100, ground: true },
      { x: 1460, y: 550, w: 980, h: 100, ground: true },
      { x: 280, y: 470, w: 145, h: 30 },
      { x: 510, y: 450, w: 96, h: 30 },
      { x: 960, y: 475, w: 160, h: 30 },
      { x: 1210, y: 455, w: 105, h: 30 },
      { x: 1585, y: 465, w: 150, h: 30 },
      { x: 1850, y: 480, w: 120, h: 30 },
      { x: 2000, y: 475, w: 70, h: 30 },
    ],
    pickups: [
      { x: 346, y: 420, got: false },
      { x: 1030, y: 425, got: false },
      { x: 1650, y: 415, got: false },
    ],
    enemies: [
      { x: 490, y: 522, w: 30, h: 28, origin: 500, dead: false },
      { x: 1160, y: 522, w: 30, h: 28, origin: 1160, dead: false },
      { x: 1760, y: 522, w: 30, h: 28, origin: 1780, dead: false },
    ],
    boss: { x: 2200, y: 440, w: 86, h: 110, hp: 3, cooldown: 0 },
    checkpoint: 60,
    jumpBuffer: 0,
    coyote: 0,
    events: [],
  };
}
export function overlaps(a: Rect, b: Rect) {
  return (
    a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y
  );
}
export function hurt(g: Game, fall = false) {
  if (g.player.invincible > 0 && !fall) return;
  g.hp--;
  g.events.push({ type: 'hurt' });
  g.player.invincible = 1.7;
  if (fall) {
    g.player.x = g.checkpoint;
    g.player.y = 420;
    g.player.vx = 0;
    g.player.vy = 0;
  } else {
    g.player.vy = -360;
    g.player.x = Math.max(0, g.player.x - 35);
  }
  if (g.hp <= 0) g.mode = 'lost';
}
export function updateGame(
  g: Game,
  dt: number,
  input: { left: boolean; right: boolean; jump: boolean },
) {
  if (g.mode !== 'playing') return;
  dt = Math.min(dt, 0.025);
  g.time += dt;
  const p = g.player;
  g.events = [];
  p.invincible = Math.max(0, p.invincible - dt);
  g.boss.cooldown = Math.max(0, g.boss.cooldown - dt);
  if (input.jump) g.jumpBuffer = 0.13;
  else g.jumpBuffer = Math.max(0, g.jumpBuffer - dt);
  if (p.grounded) g.coyote = 0.1;
  else g.coyote = Math.max(0, g.coyote - dt);
  p.vx = ((input.right ? 1 : 0) - (input.left ? 1 : 0)) * 225;
  if (p.vx) p.facing = Math.sign(p.vx);
  if (g.jumpBuffer > 0 && g.coyote > 0) {
    p.vy = -635;
    p.grounded = false;
    g.coyote = 0;
    g.jumpBuffer = 0;
  }
  const oldBottom = p.y + p.h;
  p.vy += 1600 * dt;
  p.x = Math.max(0, Math.min(WORLD_WIDTH - p.w, p.x + p.vx * dt));
  p.y += p.vy * dt;
  p.grounded = false;
  for (const plat of g.platforms) {
    if (
      p.vy >= 0 &&
      p.x + p.w > plat.x + 2 &&
      p.x < plat.x + plat.w - 2 &&
      oldBottom <= plat.y + 4 &&
      p.y + p.h >= plat.y
    ) {
      p.y = plat.y - p.h;
      p.vy = 0;
      p.grounded = true;
      if (
        plat.ground &&
        p.x > plat.x + 25 &&
        p.x < plat.x + plat.w - 80 &&
        p.x < 2000
      )
        g.checkpoint = p.x;
    }
  }
  if (p.y > HEIGHT + 70) {
    hurt(g, true);
    return;
  }
  g.pickups.forEach((c, index) => {
    if (!c.got && overlaps(p, { x: c.x - 19, y: c.y - 19, w: 38, h: 38 })) {
      c.got = true;
      g.stars++;
      g.events.push({ type: 'collect', index });
    }
  });
  for (const e of g.enemies) {
    if (e.dead) continue;
    e.x = e.origin + Math.sin(g.time * 1.7 + e.origin) * 42;
    if (overlaps(p, e)) {
      if (p.vy > 0 && oldBottom < e.y + 15) {
        e.dead = true;
        p.vy = -440;
        g.events.push({ type: 'stomp' });
      } else hurt(g);
    }
  }
  const b = g.boss;
  b.x = 2200 + Math.sin(g.time * 1.3) * 40;
  if (b.hp > 0 && overlaps(p, b)) {
    if (p.vy > 0 && oldBottom < b.y + 25 && b.cooldown <= 0) {
      b.hp--;
      b.cooldown = 0.65;
      p.vy = -655;
      g.events.push({ type: 'stomp' });
      if (b.hp === 0) {
        g.mode = 'quiz';
        g.events.push({ type: 'quiz' });
      }
    } else if (b.cooldown <= 0) hurt(g);
  }
  g.camera = Math.max(0, Math.min(WORLD_WIDTH - WIDTH, p.x - WIDTH * 0.34));
}
export function quizChoices(level: number) {
  return [level, (level + 7) % 26, (level + 17) % 26].sort(
    (a, b) => ((a * 13 + level * 7) % 29) - ((b * 13 + level * 7) % 29),
  );
}
export function drawGame(
  ctx: CanvasRenderingContext2D,
  g: Game,
  sprite: HTMLImageElement | null,
) {
  const palette = WORLDS[Math.min(4, Math.floor(g.level / 6))],
    t = g.time,
    cam = g.camera;
  ctx.imageSmoothingEnabled = false;
  const rect = (x: number, y: number, w: number, h: number, c: string) => {
    ctx.fillStyle = c;
    ctx.fillRect(Math.round(x), Math.round(y), w, h);
  };
  const text = (
    s: string,
    x: number,
    y: number,
    size: number,
    c: string,
    align: CanvasTextAlign = 'center',
  ) => {
    ctx.font = `900 ${size}px monospace`;
    ctx.fillStyle = c;
    ctx.textAlign = align;
    ctx.fillText(s, Math.round(x), Math.round(y));
  };
  const grad = ctx.createLinearGradient(0, 0, 0, HEIGHT);
  grad.addColorStop(0, palette.sky);
  grad.addColorStop(1, palette.light);
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, WIDTH, HEIGHT);
  rect(324 - cam * 0.04, 95, 48, 48, '#f7f4cb');
  rect(316 - cam * 0.04, 105, 64, 28, '#f7f4cb');
  for (let i = -1; i < 9; i++) {
    const x = i * 115 - ((cam * 0.12) % 115);
    rect(x, 303 + (i % 3) * 22, 120, 230, palette.far);
    rect(x + 19, 271 + (i % 3) * 22, 80, 60, palette.far);
  }
  for (let i = 0; i < 6; i++) {
    const x = ((((i * 139 - cam * 0.08) % 650) + 650) % 650) - 80,
      y = 112 + (i % 3) * 55;
    rect(x, y, 66, 16, '#f3f8dc');
    rect(x + 16, y - 12, 34, 15, '#f3f8dc');
    rect(x + 50, y + 4, 35, 12, '#f3f8dc');
  }
  for (let i = 0; i < 14; i++) {
    const x = i * 207 - cam * 0.47 - 80,
      y = 325 + (i % 3) * 28;
    rect(x + 39, y + 36, 20, 220, '#678c65');
    rect(x - 10, y, 115, 74, palette.tree);
    rect(x + 9, y - 36, 77, 47, palette.tree);
    rect(x + 25, y - 54, 46, 32, palette.tree);
    rect(x + 3, y + 5, 88, 12, '#ffffff12');
  }
  for (const p of g.platforms) {
    const x = p.x - cam;
    if (x + p.w < 0 || x > WIDTH) continue;
    rect(x + 6, p.y + 7, p.w, p.h, '#48683b55');
    rect(x, p.y, p.w, p.h, palette.soil);
    rect(x, p.y, p.w, 12, palette.grass);
    rect(x, p.y + 12, p.w, 5, '#49652b60');
    for (let a = 0; a < p.w; a += 28) {
      rect(x + a, p.y + 5, 16, 5, '#eff8a842');
      for (let b = 23; b < p.h; b += 25)
        rect(x + a + 4, p.y + b, 12, 7, '#52392b25');
    }
    rect(x, p.y + 17, 5, p.h - 17, '#ffffff15');
  }
  for (let i = 0; i < 30; i++) {
    const x = i * 82 + 21;
    if ((x > 670 && x < 780) || (x > 1350 && x < 1470)) continue;
    rect(x - cam, 542, 4, 8, palette.tree);
    rect(x - cam - 4, 538, 4, 6, palette.grass);
  }
  for (let i = 0; i < g.pickups.length; i++) {
    const c = g.pickups[i];
    if (c.got) continue;
    const x = c.x - cam,
      y = c.y + Math.sin(t * 3 + i) * 5;
    rect(x - 19, y - 18, 38, 38, '#aa7a30');
    rect(x - 19, y - 22, 34, 36, '#f6d75b');
    rect(x - 15, y - 18, 26, 5, '#fff2a1');
    text(
      i === 0
        ? String.fromCharCode(65 + g.level)
        : i === 1
          ? String.fromCharCode(97 + g.level)
          : '★',
      x - 2,
      y + 5,
      23,
      '#795128',
    );
  }
  for (const e of g.enemies) {
    if (e.dead) continue;
    const x = e.x - cam;
    rect(x + 3, e.y - 5, e.w - 6, 6, '#ac594a');
    rect(x, e.y, e.w, e.h - 5, '#d97d65');
    rect(x + 4, e.y + 5, 8, 8, '#fff8df');
    rect(x + 19, e.y + 5, 8, 8, '#fff8df');
    rect(x + 8, e.y + 8, 4, 5, '#4c4334');
    rect(x + 19, e.y + 8, 4, 5, '#4c4334');
    rect(x - 3, e.y + 23, 12, 5, '#795648');
    rect(x + 22, e.y + 23, 12, 5, '#795648');
  }
  const b = g.boss,
    bx = b.x - cam;
  if (b.hp > 0 && bx < WIDTH + 120) {
    ctx.globalAlpha = b.cooldown > 0 ? 0.55 : 1;
    text(
      String.fromCharCode(65 + g.level),
      bx + b.w / 2 + 5,
      b.y + 99,
      112,
      '#7e503d',
    );
    text(
      String.fromCharCode(65 + g.level),
      bx + b.w / 2,
      b.y + 94,
      112,
      '#eab557',
    );
    rect(bx + 17, b.y + 40, 15, 14, '#fff8d8');
    rect(bx + 53, b.y + 40, 15, 14, '#fff8d8');
    rect(bx + 21, b.y + 45, 6, 8, '#384937');
    rect(bx + 55, b.y + 45, 6, 8, '#384937');
    rect(bx + 15, b.y + 104, 24, 8, '#825735');
    rect(bx + 53, b.y + 104, 24, 8, '#825735');
    text(
      'TRÙM ' + String.fromCharCode(65 + g.level),
      bx + 43,
      b.y - 27,
      13,
      '#47543b',
    );
    for (let i = 0; i < 3; i++)
      rect(
        bx + 9 + i * 24,
        b.y - 17,
        20,
        6,
        i < b.hp ? '#db7157' : '#aabb9166',
      );
    ctx.globalAlpha = 1;
  }
  rect(2360 - cam, 410, 12, 140, '#537853');
  rect(2360 - cam, 410, 65, 12, '#537853');
  text('✦', 2394 - cam, 454, 28, '#d5ac40');
  const p = g.player,
    px = p.x - cam;
  ctx.globalAlpha = p.invincible > 0 && Math.floor(t * 12) % 2 === 0 ? 0.35 : 1;
  if (sprite?.complete && sprite.naturalWidth) {
    const bob = p.grounded && p.vx ? Math.sin(t * 22) * 2 : 0;
    ctx.save();
    ctx.translate(px + p.w / 2, p.y + p.h / 2 + bob);
    ctx.scale(p.facing, 1);
    ctx.drawImage(sprite, -36, -34, 72, 72);
    ctx.restore();
  } else text('●', px + 21, p.y + 44, 48, '#ffd928');
  ctx.globalAlpha = 1;
  if (cam < 220) {
    text('→', 180 - cam, 501, 26, '#668d52');
    text('NHẢY LÊN!', 340 - cam, 371, 12, '#50794b');
  }
  if (cam > 1550 && g.mode === 'playing')
    text('Nhảy lên đầu trùm 3 lần!', WIDTH / 2, 111, 14, '#41613d');
}
