import { drawMonSprite, monExpression } from './mon-animation';
import { VOCABULARY, WORLDS, type Noun } from './lesson-data';
export { WORDS, WORLDS, VOCABULARY } from './lesson-data';
export const WIDTH = 432,
  HEIGHT = 640,
  WORLD_WIDTH = 2720;
export type Rect = { x: number; y: number; w: number; h: number };
export type Platform = Rect & {
  ground?: boolean;
  baseX: number;
  baseY: number;
  moving?: boolean;
  dx: number;
};
export type Mode = 'ready' | 'playing' | 'paused' | 'quiz' | 'won' | 'lost';
export type GameEvent = {
  type: 'collect' | 'hurt' | 'stomp' | 'quiz' | 'encounter' | 'jump';
  index?: number;
  noun?: Noun;
};
export type Enemy = Rect & {
  origin: number;
  baseY: number;
  range: number;
  speed: number;
  behavior: 'walk' | 'hop' | 'float';
  noun: Noun;
  dead: boolean;
  seen: boolean;
  defeatedAt: number;
  phase: number;
};
export type Particle = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  color: string;
  size: number;
};
export type Game = {
  level: number;
  mode: Mode;
  time: number;
  camera: number;
  worldWidth: number;
  player: Rect & {
    vx: number;
    vy: number;
    grounded: boolean;
    facing: number;
    invincible: number;
    landing: number;
    stride: number;
  };
  hp: number;
  stars: number;
  score: number;
  combo: number;
  comboTime: number;
  learned: string[];
  difficulty: number;
  platforms: Platform[];
  pickups: { x: number; y: number; got: boolean }[];
  enemies: Enemy[];
  boss: Rect & {
    hp: number;
    maxHp: number;
    cooldown: number;
    origin: number;
    phase: number;
    warning: number;
    attackTimer: number;
  };
  shots: (Rect & { vx: number; life: number; noun: Noun })[];
  particles: Particle[];
  checkpoint: number;
  jumpBuffer: number;
  coyote: number;
  shake: number;
  events: GameEvent[];
};
export function createGame(level = 0): Game {
  level = Math.max(0, Math.min(25, Math.floor(level)));
  const difficulty = level / 25,
    worldWidth = WORLD_WIDTH + Math.floor(level / 5) * 160,
    gap = 82 + Math.floor(difficulty * 40),
    first = 635 + (level % 4) * 27,
    second = 1370 + (level % 3) * 31;
  const platforms: Platform[] = [];
  const add = (
    x: number,
    y: number,
    w: number,
    h: number,
    ground = false,
    moving = false,
  ) =>
    platforms.push({ x, y, w, h, ground, moving, baseX: x, baseY: y, dx: 0 });
  add(0, 550, first, 100, true);
  add(first + gap, 550, second - first - gap, 100, true);
  add(second + gap, 550, worldWidth - second - gap, 100, true);
  const rewardXs = [
    285 + (level % 3) * 24,
    first + gap + 175 + (level % 4) * 12,
    second + gap + 165 + (level % 5) * 13,
  ];
  const pickups = rewardXs.map((x, i) => {
    const y = 470 - ((level + i) % 3) * 12;
    add(x, y, 140 - difficulty * 22, 28, false, level >= 5 && i === 1);
    return { x: x + 57, y: y - 48, got: false };
  });
  add(first - 155, 456, 95, 28);
  add(second - 150, 456, 95, 28);
  add(worldWidth - 555, 478, 125, 28);
  add(worldWidth - 400, 478, 95, 28);
  if (level >= 10) add(second + gap + 395, 440, 95, 25, false, true);
  const count = 3 + Math.floor(level / 7),
    safeOrigins = [
      first - 165,
      second - 150,
      second + gap + 350,
      first + gap + 355,
      second + gap + 540,
      second + gap + 700,
    ];
  const enemies: Enemy[] = Array.from({ length: count }, (_, i) => ({
    x: safeOrigins[i],
    y: 506,
    w: 48,
    h: 44,
    origin: safeOrigins[i],
    baseY: 506,
    range: 32 + difficulty * 18,
    speed: 0.95 + difficulty * 0.85,
    behavior: i % 3 === 0 ? 'walk' : i % 3 === 1 ? 'hop' : 'float',
    noun: VOCABULARY[level][i % 3],
    dead: false,
    seen: false,
    defeatedAt: 0,
    phase: i * 2.1 + level * 0.3,
  }));
  const maxHp = 3 + Math.floor(level / 10);
  return {
    level,
    mode: 'ready',
    time: 0,
    camera: 0,
    worldWidth,
    player: {
      x: 60,
      y: 496,
      w: 42,
      h: 54,
      vx: 0,
      vy: 0,
      grounded: true,
      facing: 1,
      invincible: 0,
      landing: 0,
      stride: 0,
    },
    hp: 3,
    stars: 0,
    score: 0,
    combo: 0,
    comboTime: 0,
    learned: [],
    difficulty,
    platforms,
    pickups,
    enemies,
    boss: {
      x: worldWidth - 235,
      y: 440,
      w: 86,
      h: 110,
      hp: maxHp,
      maxHp,
      cooldown: 0,
      origin: worldWidth - 235,
      phase: 0,
      warning: 0,
      attackTimer: 2.8,
    },
    shots: [],
    particles: [],
    checkpoint: 60,
    jumpBuffer: 0,
    coyote: 0,
    shake: 0,
    events: [],
  };
}
export function overlaps(a: Rect, b: Rect) {
  return (
    a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y
  );
}
function burst(g: Game, x: number, y: number, color: string, n = 10) {
  for (let i = 0; i < n; i++) {
    const a = (i / n) * Math.PI * 2;
    g.particles.push({
      x,
      y,
      vx: Math.cos(a) * (45 + i * 7),
      vy: Math.sin(a) * 100 - 70,
      life: 0.55,
      maxLife: 0.55,
      color,
      size: 3 + (i % 3),
    });
  }
}
function learn(g: Game, noun: Noun, type: 'encounter' | 'stomp') {
  if (!g.learned.includes(noun[0])) g.learned.push(noun[0]);
  g.events.push({ type, noun });
}
export function hurt(g: Game, fall = false) {
  if (g.mode !== 'playing' || (g.player.invincible > 0 && !fall)) return;
  g.hp--;
  g.combo = 0;
  g.shake = 0.25;
  g.events.push({ type: 'hurt' });
  g.player.invincible = 1.7;
  burst(g, g.player.x + 21, g.player.y + 25, '#ed8a76');
  if (fall) {
    g.player.x = g.checkpoint;
    g.player.y = 410;
    g.player.vx = 0;
    g.player.vy = 0;
  } else {
    g.player.vy = -380;
    g.player.x = Math.max(0, g.player.x - 24);
  }
  if (g.hp <= 0) g.mode = 'lost';
}
export function updateGame(
  g: Game,
  dt: number,
  input: { left: boolean; right: boolean; jump: boolean },
) {
  if (g.mode !== 'playing') return;
  dt = Math.min(Math.max(dt, 0), 1 / 30);
  g.time += dt;
  g.events = [];
  const p = g.player;
  g.shake = Math.max(0, g.shake - dt);
  p.invincible = Math.max(0, p.invincible - dt);
  p.landing = Math.max(0, p.landing - dt);
  g.comboTime = Math.max(0, g.comboTime - dt);
  if (!g.comboTime) g.combo = 0;
  for (const q of g.particles) {
    q.life -= dt;
    q.x += q.vx * dt;
    q.y += q.vy * dt;
    q.vy += 400 * dt;
  }
  g.particles = g.particles.filter((q) => q.life > 0);
  for (const plat of g.platforms) {
    const oldX = plat.x;
    plat.dx = 0;
    if (plat.moving) {
      plat.x = plat.baseX + Math.sin(g.time * 1.25 + plat.baseX) * 26;
      plat.dx = plat.x - oldX;
      if (
        p.grounded &&
        Math.abs(p.y + p.h - plat.y) < 3 &&
        p.x + p.w > oldX &&
        p.x < oldX + plat.w
      )
        p.x += plat.dx;
    }
  }
  if (input.jump) g.jumpBuffer = 0.14;
  else g.jumpBuffer = Math.max(0, g.jumpBuffer - dt);
  if (p.grounded) g.coyote = 0.1;
  else g.coyote = Math.max(0, g.coyote - dt);
  const dir = Number(input.right) - Number(input.left),
    target = dir * 240;
  p.vx += (target - p.vx) * Math.min(1, dt * (dir ? 15 : 20));
  if (Math.abs(p.vx) < 1) p.vx = 0;
  if (dir) p.facing = dir;
  p.stride += Math.abs(p.vx) * dt * 0.065;
  if (g.jumpBuffer > 0 && g.coyote > 0) {
    p.vy = -650;
    p.grounded = false;
    g.coyote = 0;
    g.jumpBuffer = 0;
    burst(g, p.x + 21, p.y + p.h, '#ebefc1', 6);
    g.events.push({ type: 'jump' });
  }
  const oldBottom = p.y + p.h,
    wasGrounded = p.grounded;
  p.vy += 1600 * dt;
  p.x = Math.max(0, Math.min(g.worldWidth - p.w, p.x + p.vx * dt));
  p.y += p.vy * dt;
  p.grounded = false;
  for (const plat of g.platforms) {
    if (
      p.vy >= 0 &&
      p.x + p.w > plat.x + 3 &&
      p.x < plat.x + plat.w - 3 &&
      oldBottom <= plat.y + 4 &&
      p.y + p.h >= plat.y
    ) {
      if (!wasGrounded && p.vy > 250) {
        p.landing = 0.16;
        burst(g, p.x + 21, plat.y, '#ebefc1', 6);
      }
      p.y = plat.y - p.h;
      p.vy = 0;
      p.grounded = true;
      if (
        plat.ground &&
        p.x > plat.x + 40 &&
        p.x < plat.x + plat.w - 100 &&
        p.x < g.worldWidth - 600
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
      g.score += 100;
      burst(g, c.x, c.y, '#f9d656', 16);
      g.events.push({ type: 'collect', index });
    }
  });
  for (const e of g.enemies) {
    if (e.dead) continue;
    e.x = e.origin + Math.sin(g.time * e.speed + e.phase) * e.range;
    e.y =
      e.baseY -
      (e.behavior === 'hop'
        ? Math.max(0, Math.sin(g.time * (2 + g.difficulty) + e.phase)) * 58
        : e.behavior === 'float'
          ? 38 + Math.sin(g.time * 2 + e.phase) * 20
          : 0);
    if (!e.seen && Math.abs(e.x - p.x) < 180) {
      e.seen = true;
      learn(g, e.noun, 'encounter');
    }
    if (overlaps(p, e)) {
      if (p.vy > 0 && oldBottom < e.y + 19) {
        e.dead = true;
        e.defeatedAt = g.time;
        p.vy = -500;
        g.combo++;
        g.comboTime = 3;
        g.score += 50 * Math.min(g.combo, 5);
        burst(g, e.x + 24, e.y + 20, '#d5ef75', 14);
        learn(g, e.noun, 'stomp');
      } else hurt(g);
    }
  }
  if (g.mode !== 'playing') return;
  const b = g.boss;
  b.cooldown = Math.max(0, b.cooldown - dt);
  b.phase = g.time * (1.1 + g.difficulty * 0.7);
  b.x = b.origin + Math.sin(b.phase) * (30 + g.difficulty * 30);
  b.warning = 0;
  if (g.level >= 5 && p.x > g.worldWidth - 680 && b.hp > 0) {
    b.attackTimer -= dt;
    if (b.attackTimer < 0.8) b.warning = 0.8 - b.attackTimer;
    if (b.attackTimer <= 0) {
      const noun = VOCABULARY[g.level][Math.floor(g.time) % 3];
      g.shots.push({
        x: b.x,
        y: 517,
        w: 25,
        h: 25,
        vx: -(135 + g.difficulty * 65),
        life: 4,
        noun,
      });
      b.attackTimer = 3.2 - g.difficulty * 0.8;
    }
  }
  for (const s of g.shots) {
    s.x += s.vx * dt;
    s.life -= dt;
    if (overlaps(p, s)) {
      s.life = 0;
      hurt(g);
    }
  }
  g.shots = g.shots.filter((s) => s.life > 0 && s.x > g.worldWidth - 850);
  if (b.hp > 0 && overlaps(p, b)) {
    if (p.vy > 0 && oldBottom < b.y + 25 && b.cooldown <= 0) {
      b.hp--;
      b.cooldown = 0.62;
      p.vy = -660;
      p.landing = 0.08;
      g.score += 150;
      g.shake = 0.12;
      burst(g, b.x + 43, b.y + 45, '#f7d472', 20);
      g.events.push({ type: 'stomp' });
      if (b.hp === 0) {
        g.mode = 'quiz';
        g.shots = [];
        g.events.push({ type: 'quiz' });
      }
    } else if (b.cooldown <= 0) hurt(g);
  }
  const targetCamera = Math.max(
    0,
    Math.min(g.worldWidth - WIDTH, p.x - WIDTH * 0.34),
  );
  g.camera += (targetCamera - g.camera) * Math.min(1, dt * 9);
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
  animationTime = g.time,
  speaking = false,
) {
  const palette = WORLDS[g.level],
    t = g.time,
    cam = g.camera,
    night = ['night', 'space', 'crystal', 'volcano'].includes(palette.kind);
  ctx.imageSmoothingEnabled = false;
  ctx.save();
  if (g.shake > 0)
    ctx.translate(
      Math.sin(t * 89) * g.shake * 10,
      Math.cos(t * 71) * g.shake * 6,
    );
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
    font = 'monospace',
  ) => {
    ctx.font = `900 ${size}px ${font}`;
    ctx.fillStyle = c;
    ctx.textAlign = 'center';
    ctx.fillText(s, Math.round(x), Math.round(y));
  };
  const grad = ctx.createLinearGradient(0, 0, 0, HEIGHT);
  grad.addColorStop(0, palette.sky);
  grad.addColorStop(1, palette.light);
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, WIDTH, HEIGHT);
  // Every scene has its own silhouette, atmosphere, layout, and palette.
  if (night) {
    for (let i = 0; i < 36; i++) {
      const x = (i * 137 + g.level * 17) % WIDTH,
        y = (i * 71) % 315;
      ctx.globalAlpha = 0.4 + Math.sin(t * 1.5 + i) * 0.3;
      rect(x, y, 2 + (i % 2), 2 + (i % 2), '#ecf5ee');
    }
    ctx.globalAlpha = 1;
  }
  const sunX = 330 - cam * 0.025;
  rect(sunX, 98, 40, 40, night ? '#e8e9bb' : '#faf1ba');
  rect(sunX - 7, 107, 54, 23, night ? '#e8e9bb' : '#faf1ba');
  for (let i = -1; i < 9; i++) {
    const x = i * 115 - ((cam * 0.12) % 115),
      y = 315 + (i % 3) * 22;
    rect(x, y, 120, 240, palette.far);
    rect(x + 20, y - 35, 80, 45, palette.far);
    if (['mountain', 'snow', 'volcano', 'crystal'].includes(palette.kind)) {
      rect(x + 35, y - 65, 50, 34, palette.far);
      rect(
        x + 46,
        y - 85,
        28,
        25,
        palette.kind === 'snow' ? '#edf7e7' : palette.far,
      );
    }
  }
  if (!['space', 'crystal'].includes(palette.kind)) {
    for (let i = 0; i < 6; i++) {
      const x = ((((i * 139 - cam * 0.08 + t * 3) % 650) + 650) % 650) - 80,
        y = 140 + (i % 3) * 40;
      ctx.globalAlpha = 0.65;
      rect(x, y, 66, 16, '#f3f8dc');
      rect(x + 16, y - 12, 34, 15, '#f3f8dc');
      rect(x + 50, y + 4, 35, 12, '#f3f8dc');
    }
    ctx.globalAlpha = 1;
  }
  for (let i = 0; i < 18; i++) {
    const x = i * 177 - cam * 0.48 - 80,
      y = 355 + (i % 3) * 23;
    switch (palette.kind) {
      case 'city':
      case 'castle': {
        rect(x, y - 80, 90, 240, palette.tree);
        rect(x + 10, y - 102, 70, 30, palette.tree);
        if (palette.kind === 'castle') {
          for (let j = 0; j < 4; j++)
            rect(x + j * 25, y - 110, 15, 25, palette.tree);
        }
        for (let a = 15; a < 85; a += 24)
          for (let b = -60; b < 110; b += 36)
            rect(x + a, y + b, 10, 16, '#eadc9b70');
        break;
      }
      case 'water': {
        rect(x + 20, y + 30, 15, 180, palette.tree);
        for (let j = 0; j < 4; j++)
          rect(x + 5 + (j % 2) * 23, y + 20 + j * 25, 25, 14, palette.tree);
        ctx.strokeStyle = '#e2fbf777';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(
          x + 70,
          y - 80 - ((t * 15 + i * 7) % 120),
          6 + (i % 5),
          0,
          Math.PI * 2,
        );
        ctx.stroke();
        break;
      }
      case 'space': {
        rect(x, y, 80, 25, palette.tree);
        rect(x + 18, y - 20, 45, 22, palette.tree);
        rect(x + 30, y - 32, 20, 14, '#b7a0dc');
        break;
      }
      case 'desert': {
        rect(x + 30, y - 25, 18, 185, palette.tree);
        rect(x + 5, y + 12, 30, 15, palette.tree);
        rect(x + 5, y - 8, 12, 35, palette.tree);
        rect(x + 48, y + 50, 30, 12, palette.tree);
        rect(x + 65, y + 23, 13, 35, palette.tree);
        break;
      }
      case 'crystal': {
        ctx.fillStyle = palette.tree;
        ctx.beginPath();
        ctx.moveTo(x + 40, y - 90);
        ctx.lineTo(x + 75, y + 70);
        ctx.lineTo(x, y + 70);
        ctx.closePath();
        ctx.fill();
        rect(x + 35, y - 20, 5, 80, '#b8ebde77');
        break;
      }
      case 'sky': {
        rect(x, y, 90, 28, '#f4edfa');
        rect(x + 20, y - 18, 54, 22, '#f4edfa');
        break;
      }
      case 'volcano': {
        rect(x, y, 100, 180, palette.tree);
        rect(x + 15, y - 40, 70, 50, palette.tree);
        rect(x + 30, y - 70, 40, 35, palette.tree);
        rect(x + 43, y - 58, 10, 135, '#f1a068');
        break;
      }
      default: {
        const broad = palette.kind === 'savanna';
        rect(
          x + 39,
          y + 20,
          15,
          180,
          palette.kind === 'snow' ? '#75919e' : '#68794e',
        );
        const sway = Math.sin(t * 1.2 + i) * 2;
        rect(x + sway, y, broad ? 120 : 90, 45, palette.tree);
        rect(
          x + 15 + sway,
          y - (broad ? 15 : 35),
          broad ? 90 : 60,
          40,
          palette.tree,
        );
        if (!broad) rect(x + 28 + sway, y - 53, 35, 30, palette.tree);
        if (palette.kind === 'garden')
          text(i % 2 ? '🌸' : '🌼', x + 40, y + 7, 26, '#fff', 'sans-serif');
        if (g.level === 0) text('🍎', x + 20, y + 33, 18, '#fff', 'sans-serif');
      }
    }
  }
  // Ambient weather is deterministic and uses no per-frame allocations.
  if (['snow', 'night', 'volcano', 'garden', 'crystal'].includes(palette.kind))
    for (let i = 0; i < 24; i++) {
      const x = (((i * 79 - cam * 0.2 + t * 12) % WIDTH) + WIDTH) % WIDTH,
        y =
          (i * 47 +
            t * (palette.kind === 'snow' ? 22 : -12) +
            g.level * 20 +
            2000) %
          HEIGHT;
      ctx.globalAlpha = 0.3 + (i % 4) * 0.15;
      rect(
        x,
        y,
        3,
        3,
        palette.kind === 'volcano'
          ? '#f9b65c'
          : palette.kind === 'garden'
            ? '#ffdee8'
            : '#f2f4d1',
      );
    }
  ctx.globalAlpha = 1;
  for (const p of g.platforms) {
    const x = p.x - cam;
    if (x + p.w < 0 || x > WIDTH) continue;
    rect(x + 6, p.y + 7, p.w, p.h, '#35513044');
    rect(x, p.y, p.w, p.h, palette.soil);
    rect(x, p.y, p.w, 12, p.moving ? '#dbbb76' : palette.grass);
    rect(x, p.y + 12, p.w, 5, '#304b3340');
    for (let a = 0; a < p.w; a += 28) {
      rect(x + a, p.y + 5, 16, 5, '#f4f8d544');
      for (let b = 23; b < p.h; b += 25)
        rect(x + a + 4, p.y + b, 12, 7, '#3a343226');
    }
    if (p.moving) text('↔', x + p.w / 2, p.y + 25, 18, '#fcf0c4');
  }
  // A visible flag shows the latest safe respawn point.
  if (g.checkpoint > 200) {
    const x = g.checkpoint - cam;
    rect(x, 516, 3, 34, '#647442');
    rect(x + 3, 516, 17, 12, '#d5ef75');
  }
  for (let i = 0; i < g.pickups.length; i++) {
    const c = g.pickups[i];
    if (c.got) continue;
    const x = c.x - cam,
      y = c.y + Math.sin(t * 3 + i) * 5;
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(Math.sin(t * 2 + i) * 0.09);
    rect(-19, -18, 38, 38, '#aa7a30');
    rect(-19, -22, 34, 36, '#f6d75b');
    rect(-15, -18, 26, 5, '#fff2a1');
    text(
      i === 0
        ? String.fromCharCode(65 + g.level)
        : i === 1
          ? String.fromCharCode(97 + g.level)
          : '★',
      -2,
      5,
      23,
      '#795128',
    );
    ctx.restore();
  }
  for (const e of g.enemies) {
    const age = t - e.defeatedAt;
    if (e.dead && age > 0.45) continue;
    const x = e.x - cam;
    if (x < -100 || x > WIDTH + 100) continue;
    ctx.save();
    ctx.translate(x + e.w / 2, e.y + e.h);
    if (e.dead) {
      ctx.globalAlpha = 1 - age / 0.45;
      ctx.rotate(age * 5);
      ctx.scale(1 + age * 0.7, Math.max(0.1, 1 - age * 2));
    } else {
      const stride = Math.sin(t * e.speed * 9 + e.phase);
      ctx.rotate(
        e.behavior === 'float'
          ? Math.sin(t * 3 + e.phase) * 0.09
          : stride * 0.035,
      );
      ctx.scale(
        1 + (e.behavior === 'hop' ? 0.04 : 0.018) * stride,
        1 - 0.035 * stride,
      );
    }
    rect(
      -25,
      -43,
      50,
      43,
      e.behavior === 'walk'
        ? '#f4c476'
        : e.behavior === 'hop'
          ? '#c5dea0'
          : '#c4d5ed',
    );
    rect(-25, -43, 50, 4, '#fff6cf');
    rect(-25, -3, 50, 5, '#5c694e');
    text(
      e.noun[2],
      0,
      -8,
      31,
      '#fff',
      '"Apple Color Emoji","Segoe UI Emoji",sans-serif',
    );
    const foot = Math.sin(t * 12 + e.phase) * 3;
    rect(-20, 0, 12, 5 + foot, '#536346');
    rect(8, 0, 12, 5 - foot, '#536346');
    ctx.restore();
    if (!e.dead) {
      const labelW = Math.max(60, e.noun[0].length * 7 + 16);
      rect(x + 24 - labelW / 2, e.y - 23, labelW, 19, '#f8ffe9ee');
      text(e.noun[0], x + 24, e.y - 9, 12, '#374e34', 'Arial');
    }
  }
  const b = g.boss,
    bx = b.x - cam;
  if (b.hp > 0 && bx < WIDTH + 120) {
    ctx.save();
    ctx.translate(bx + 43, b.y + 110);
    const bounce = Math.sin(t * 3) * 0.025;
    ctx.scale(1 - bounce, 1 + bounce);
    if (b.cooldown > 0) ctx.globalAlpha = 0.6;
    text(String.fromCharCode(65 + g.level), 5, -11, 112, '#77513f');
    text(
      String.fromCharCode(65 + g.level),
      0,
      -16,
      112,
      b.warning > 0 ? '#ed8b5c' : '#eab557',
    );
    const blink = Math.sin(t * 2.2) > 0.985;
    rect(-26, -70, 15, blink ? 3 : 14, '#fff8d8');
    rect(10, -70, 15, blink ? 3 : 14, '#fff8d8');
    if (!blink) {
      rect(-22, -65, 6, 8, '#384937');
      rect(12, -65, 6, 8, '#384937');
    }
    rect(-29, -6, 24, 8, '#825735');
    rect(10, -6, 24, 8, '#825735');
    ctx.restore();
    text(
      'TRÙM ' + String.fromCharCode(65 + g.level),
      bx + 43,
      b.y - 30,
      13,
      night ? '#eff0ce' : '#47543b',
    );
    for (let i = 0; i < b.maxHp; i++)
      rect(
        bx + 2 + i * (82 / b.maxHp),
        b.y - 19,
        70 / b.maxHp,
        6,
        i < b.hp ? '#df765e' : '#9eac9466',
      );
    if (b.warning > 0) {
      text('! NHẢY !', bx + 35, b.y - 58, 18, '#fff5c8');
      rect(bx - 100, 543, 160, 4, '#e9b56b');
    }
  }
  for (const s of g.shots) {
    ctx.save();
    ctx.translate(s.x - cam + 12, s.y + 12);
    ctx.rotate(-t * 6);
    text(s.noun[2], 0, 10, 25, '#fff', 'sans-serif');
    ctx.restore();
  }
  const exit = g.worldWidth - 90;
  rect(exit - cam, 410, 12, 140, '#537853');
  rect(exit - cam, 410, 65, 12, '#537853');
  text('✦', exit + 34 - cam, 454, 28, '#d5ac40');
  const p = g.player,
    px = p.x - cam;
  ctx.fillStyle = '#20372d25';
  ctx.beginPath();
  ctx.ellipse(px + 21, Math.min(551, p.y + p.h + 7), 24, 5, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.globalAlpha = p.invincible > 0 && Math.floor(t * 12) % 2 === 0 ? 0.35 : 1;
  if (sprite?.complete && sprite.naturalWidth) {
    const run = Math.abs(p.vx) / 240,
      breath = monExpression(animationTime, {
        speed: p.vx,
        grounded: p.grounded,
        vy: p.vy,
        hurt: p.invincible,
        landing: p.landing,
        stride: p.stride,
      }).breath,
      bob = p.grounded
        ? Math.abs(Math.sin(p.stride)) * 3 * run
        : Math.sin(t * 8) * 1.2;
    let sx = 1 - breath,
      sy = 1 + breath;
    if (!p.grounded) {
      sx = 0.94;
      sy = 1.07;
    }
    if (p.landing > 0) {
      sx += p.landing * 1.1;
      sy -= p.landing * 1.2;
    }
    ctx.save();
    ctx.translate(px + 21, p.y + p.h - bob);
    ctx.rotate(
      p.grounded ? Math.sin(p.stride) * 0.045 * run : (p.vx / 240) * 0.09,
    );
    ctx.scale(sx * p.facing, sy);
    ctx.translate(-36, -65);
    ctx.scale(72 / 1254, 72 / 1254);
    drawMonSprite(ctx, sprite, animationTime, {
      speed: p.vx,
      grounded: p.grounded,
      vy: p.vy,
      hurt: p.invincible,
      landing: p.landing,
      stride: p.stride,
      speaking,
    });
    ctx.restore();
  }
  ctx.globalAlpha = 1;
  for (const q of g.particles) {
    ctx.globalAlpha = q.life / q.maxLife;
    rect(q.x - cam, q.y, q.size, q.size, q.color);
  }
  ctx.globalAlpha = 1;
  if (g.combo > 1 && g.comboTime > 0)
    text(`COMBO ×${Math.min(g.combo, 5)}`, px + 21, p.y - 18, 14, '#fff3b1');
  if (cam < 200) {
    text('→', 180 - cam, 501, 26, '#668d52');
    text(
      'NHẢY LÊN!',
      g.pickups[0].x - cam,
      g.pickups[0].y - 47,
      12,
      night ? '#edf0cc' : '#50794b',
    );
  }
  if (p.x > g.worldWidth - 650 && g.mode === 'playing')
    text(
      b.warning > 0
        ? 'Trùm sắp tấn công — nhảy lên!'
        : `Nhảy lên đầu trùm · ${b.hp}/${b.maxHp}`,
      WIDTH / 2,
      113,
      13,
      night ? '#eff5dd' : '#41613d',
    );
  ctx.restore();
}
