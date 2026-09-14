import {
  enemyHabitat,
  enemyMotion,
  enemyPace,
  enemySkill,
  enemySkillCounter,
  enemySkillHint,
  enemySkillLabel,
  enemySkillPhysics,
  enemyCounterName,
  airborne,
  type EnemyHabitat,
  type EnemyMotion,
  type EnemySkill,
} from './enemy-traits';
import { drawNounEnemy, nounFootInset } from './noun-art';
import { drawCloudArt, drawSceneArt } from './scene-art';
import { drawEarthRock } from './earth-art';
import { drawCharacterArt, type CharacterId } from './character-art';
import { drawElementProjectile } from './element-art';
import { drawWendy } from './wendy-art';
import { drawPlatformArt } from './platform-art';
import { drawMonSprite, monExpression } from './mon-animation';
import { drawVietnamScene, drawVietnamFood } from './vietnam-scene';
import { VOCABULARY, WORLDS, VIET_FOODS, type Noun } from './lesson-data';
export { WORDS, WORLDS, VOCABULARY } from './lesson-data';
export const WIDTH = 432,
  HEIGHT = 640,
  WORLD_WIDTH = 4700;
const BOSS_PATTERN_NAMES = [
  'NGẮM BẮN',
  'ZÍC ZẮC',
  'QUẠT TỪ',
  'QUÉT NGANG',
  'BÃO CHỮ',
  'BÃO CHỮ',
] as const;
function difficultyProfile(level: number) {
  const tier = Math.floor(level / 5);
  return {
    enemyCount: 6 + tier,
    activeLimit: level < 9 ? 1 : level < 20 ? 2 : 3,
    zoneBehind: 230 + tier * 14,
    zoneAhead: 285 + tier * 18,
    pursuitSpeed: 105 + level * 3.2,
    shotSpeed: 108 + level * 3.1,
    shotCooldown: 3.7 - level * 0.044,
    shotCap: 3 + tier,
    bossHp: 4 + tier,
  };
}
export type Rect = { x: number; y: number; w: number; h: number };
export type Platform = Rect & {
  ground?: boolean;
  baseX: number;
  baseY: number;
  moving?: boolean;
  dx: number;
  dy: number;
  motion: 'static' | 'horizontal' | 'vertical' | 'water' | 'fall' | 'spring';
  motionPhase: number;
  fallDelay: number;
  falling: boolean;
  resetTimer: number;
};
export type Mode = 'ready' | 'playing' | 'paused' | 'quiz' | 'won' | 'lost';
export type GameEvent = {
  type:
    | 'collect'
    | 'hurt'
    | 'stomp'
    | 'quiz'
    | 'encounter'
    | 'jump'
    | 'heal'
    | 'earth'
    | 'earthHit'
    | 'counter'
    | 'enemySkill';
  food?: string;
  index?: number;
  noun?: Noun;
  hero?: CharacterId;
  skillLabel?: string;
};
export type Enemy = Rect & {
  rockHp: number;
  vx: number;
  alert: boolean;
  activated: boolean;
  zoneStart: number;
  zoneEnd: number;
  fireTimer: number;
  warning: number;
  wakeTimer: number;
  slowUntil: number;
  burnUntil: number;
  burnTickAt: number;
  origin: number;
  baseY: number;
  platformIndex: number;
  range: number;
  speed: number;
  behavior: EnemyMotion;
  habitat: EnemyHabitat;
  dropClock: number;
  dropState: 'ready' | 'fall' | 'rest';
  vy: number;
  noun: Noun;
  dead: boolean;
  seen: boolean;
  defeatedAt: number;
  phase: number;
  skill: EnemySkill;
  skillTimer: number;
  skillActive: number;
  skillWindup: number;
  skillSeen: boolean;
  skillPower: number;
  skillDuration: number;
  skillCooldown: number;
  skillVariant: 0 | 1 | 2;
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
  hero: CharacterId;
  level: number;
  sky: boolean;
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
  damageTaken: number;
  stars: number;
  score: number;
  combo: number;
  comboTime: number;
  learned: string[];
  difficulty: number;
  platforms: Platform[];
  foods: (Rect & { name: string; kind: number; eaten: boolean })[];
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
    dash: number;
    direction: number;
    announcedStage: number;
  };
  shots: (Rect & {
    vx: number;
    vy: number;
    life: number;
    noun: Noun;
    effect?: 'freeze' | 'gust' | 'snare';
    power?: number;
  })[];
  icePatches: (Rect & { life: number; maxLife: number; noun: Noun })[];
  earthShots: (Rect & {
    vx: number;
    vy: number;
    life: number;
    spin: number;
    gravity: number;
    hero: CharacterId;
  })[];
  earthCooldown: number;
  wendyMessage: string;
  wendyMessageUntil: number;
  wendyNextHint: number;
  wendyX: number;
  wendyY: number;
  wendyGuideUntil: number;
  idleTime: number;
  lastProgressX: number;
  recentFalls: number;
  wendyLastTarget: string;
  particles: Particle[];
  checkpoint: number;
  checkpointY: number;
  checkpointTarget: number;
  checkpointReached: boolean;
  checkpointPlatformIndex: number;
  checkpointOffset: number;
  jumpBuffer: number;
  coyote: number;
  doubleJumpUnlocked: boolean;
  doubleJumpReady: boolean;
  slipperyUntil: number;
  slowedUntil: number;
  shake: number;
  events: GameEvent[];
};
export function createGame(level = 0, hero: CharacterId = 'mon'): Game {
  level = Math.max(0, Math.min(25, Math.floor(level)));
  const difficulty = level / 25,
    profile = difficultyProfile(level),
    worldWidth = level === 0 ? 5600 : WORLD_WIDTH + Math.floor(level / 3) * 190,
    gap = 300 + Math.floor(difficulty * 20),
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
    platforms.push({
      x,
      y,
      w,
      h,
      ground,
      moving,
      baseX: x,
      baseY: y,
      dx: 0,
      dy: 0,
      motion: moving ? 'horizontal' : 'static',
      motionPhase: x * 0.013 + y * 0.007,
      fallDelay: -1,
      falling: false,
      resetTimer: 0,
    });
  add(0, 550, first, 100, true);
  add(first + gap, 550, second - first - gap, 100, true);
  let routeX = second + gap;
  let island = 0;
  while (routeX < worldWidth - 700) {
    const islandWidth = 300 + ((level * 37 + island * 71) % 150);
    add(
      routeX,
      550,
      Math.min(islandWidth, worldWidth - 700 - routeX),
      100,
      true,
    );
    const gapWidth = 120 + ((level + island) % 3) * 14;
    add(routeX + islandWidth + 28, 458 - (island % 2) * 38, 76, 23);
    routeX += islandWidth + gapWidth;
    island++;
  }
  add(worldWidth - 650, 550, 650, 100, true);
  const rewardXs = [
    Math.floor(worldWidth * 0.2) + (level % 3) * 18,
    Math.floor(worldWidth * 0.5) + (level % 4) * 14,
    Math.floor(worldWidth * 0.78) + (level % 5) * 11,
  ];
  const pickups = rewardXs.map((x, i) => {
    const y = 470 - ((level + i) % 3) * 12;
    add(x, y, 140 - difficulty * 22, 28, false, level >= 5 && i === 1);
    return { x: x + 57, y: y - 48, got: false };
  });
  // Two river crossings require climbing and descending steps in either direction.
  for (const bank of [first, second]) {
    add(bank - 120, 480, 100, 24);
    add(bank + 40, 412, 105, 24);
    add(bank + 190, 478, 100, 24);
  }
  const foodPositions = [
    { x: Math.floor(worldWidth * 0.3), y: 443 },
    { x: Math.floor(worldWidth * 0.61), y: 405 },
    { x: worldWidth - 505, y: 441 },
  ];
  const foods = foodPositions.map((pos, i) => {
    const kind = (level + i) % VIET_FOODS.length;
    return {
      ...pos,
      w: 34,
      h: 34,
      name: VIET_FOODS[kind][0],
      kind,
      eaten: false,
    };
  });
  add(worldWidth - 555, 478, 125, 28);
  add(worldWidth - 400, 478, 95, 28);
  if (level >= 10) add(second + gap + 395, 440, 95, 25, false, true);
  const levelMotions = VOCABULARY[level].map(([word]) => enemyMotion(word));
  const levelHabitats = VOCABULARY[level].map(([word]) => enemyHabitat(word));
  if (levelHabitats.includes('sky') || levelMotions.includes('hover')) {
    const start = Math.floor(worldWidth * 0.34);
    [430, 365, 300, 245, 300, 365, 430].forEach((y, i) =>
      add(start + i * 145, y, 108 - difficulty * 15, 22, false, i === 3),
    );
  }
  if (levelHabitats.includes('water')) {
    const start = Math.floor(worldWidth * 0.48);
    for (let i = 0; i < 6; i++)
      add(start + i * 150, 442 + (i % 2) * 35, 92, 20, false, i === 2);
  }
  // Habitat, reward and river routes are generated independently. Resolve
  // their illustrated footprints here so two platform paintings never stack
  // on top of each other. Reward carriers win; ordinary duplicate steps are
  // removed, while colliding reward carriers are moved into a nearby free
  // stair position together with their pickup/food.
  const sanitizePlatforms = () => {
    const payloadsFor = (platform: Platform) => ({
        pickups: pickups.filter(
          (pickup) =>
            pickup.x >= platform.x &&
            pickup.x <= platform.x + platform.w &&
            Math.abs(pickup.y + 48 - platform.y) < 12,
        ),
        foods: foods.filter(
          (food) =>
            food.x + food.w / 2 >= platform.x &&
            food.x + food.w / 2 <= platform.x + platform.w &&
            Math.abs(food.y + food.h - platform.y) < 18,
        ),
      }),
      platformPriority = (platform: Platform) => {
        const payload = payloadsFor(platform);
        return payload.pickups.length ? 3 : payload.foods.length ? 2 : 1;
      },
      overlapsPlatformArt = (a: Platform, b: Platform) => {
        const horizontal =
          Math.min(a.x + a.w + 6, b.x + b.w + 6) - Math.max(a.x - 6, b.x - 6);
        return horizontal > 14 && Math.abs(a.y - b.y) < 56;
      };
    const groundPlatforms = platforms.filter((platform) => platform.ground),
      floatingPlatforms = platforms
        .filter((platform) => !platform.ground)
        .sort(
          (a, b) =>
            platformPriority(b) - platformPriority(a) || a.x - b.x || a.y - b.y,
        ),
      keptPlatforms: Platform[] = [];
    for (const platform of floatingPlatforms) {
      if (
        !keptPlatforms.some((other) => overlapsPlatformArt(platform, other))
      ) {
        keptPlatforms.push(platform);
        continue;
      }
      if (platformPriority(platform) === 1) continue;
      const payload = payloadsFor(platform),
        originalX = platform.x,
        originalY = platform.y,
        alternatives = [
          { x: 0, y: -68 },
          { x: 92, y: 0 },
          { x: -92, y: 0 },
          { x: 76, y: -68 },
          { x: -76, y: -68 },
          { x: 0, y: 68 },
        ],
        freePosition = alternatives.find(({ x, y }) => {
          platform.x = originalX + x;
          platform.y = Math.max(270, Math.min(492, originalY + y));
          return (
            platform.x > 20 &&
            platform.x + platform.w < worldWidth - 20 &&
            !keptPlatforms.some((other) => overlapsPlatformArt(platform, other))
          );
        });
      if (!freePosition) {
        platform.x = originalX;
        platform.y = originalY;
        continue;
      }
      const dx = platform.x - originalX,
        dy = platform.y - originalY;
      platform.baseX = platform.x;
      platform.baseY = platform.y;
      payload.pickups.forEach((pickup) => {
        pickup.x += dx;
        pickup.y += dy;
      });
      payload.foods.forEach((food) => {
        food.x += dx;
        food.y += dy;
      });
      keptPlatforms.push(platform);
    }
    platforms.splice(
      0,
      platforms.length,
      ...[...groundPlatforms, ...keptPlatforms].sort(
        (a, b) => a.x - b.x || a.y - b.y,
      ),
    );
  };
  if (level !== 0) sanitizePlatforms();
  if (level >= 3) {
    const movingEvery = Math.max(4, 7 - Math.floor(level / 6));
    platforms
      .filter(
        (platform) =>
          !platform.ground && platform.x > 650 && platform.x < worldWidth - 800,
      )
      .forEach((platform, index) => {
        if ((index + level) % movingEvery === 0) platform.moving = true;
      });
  }
  const count = profile.enemyCount;
  const routePlatforms = platforms.filter(
    (platform) =>
      platform.x > 330 && platform.x < worldWidth - 600 && platform.w > 70,
  );
  const landPlatforms = routePlatforms.filter((platform) => platform.ground),
    skyPlatforms = routePlatforms.filter(
      (platform) => !platform.ground && platform.y < 440,
    ),
    waterPlatforms = routePlatforms.filter(
      (platform) => !platform.ground && platform.y >= 440,
    );
  const usedSpawnXs: number[] = [];
  const enemies: Enemy[] = Array.from({ length: count }, (_, i) => {
    const noun = VOCABULARY[level][i % 3];
    const behavior = enemyMotion(noun[0]);
    const habitat = enemyHabitat(noun[0]);
    const preferredPlatforms =
        habitat === 'land'
          ? landPlatforms
          : habitat === 'sky'
            ? skyPlatforms
            : habitat === 'water'
              ? waterPlatforms
              : routePlatforms,
      eligiblePlatforms = preferredPlatforms.length
        ? preferredPlatforms
        : routePlatforms;
    // Divide every valid habitat route into encounter slots, then choose the
    // slot nearest this encounter's evenly spaced map sector.
    const slots = eligiblePlatforms.flatMap((platform) => {
        const slotCount = platform.ground
          ? Math.max(1, Math.floor((platform.w - 52) / 180))
          : 1;
        return Array.from({ length: slotCount }, (_, slot) => ({
          platform,
          x:
            platform.x +
            26 +
            ((platform.w - 52) * (slot + 1)) / (slotCount + 1),
        }));
      }),
      encounterCenter = 560 + ((worldWidth - 1320) * (i + 1)) / (count + 1),
      orderedSlots = [...slots].sort(
        (a, b) =>
          Math.abs(a.x - encounterCenter) - Math.abs(b.x - encounterCenter),
      ),
      slot =
        orderedSlots.find((candidate) =>
          usedSpawnXs.every((usedX) => Math.abs(candidate.x - usedX) >= 260),
        ) ??
        orderedSlots.reduce((best, candidate) => {
          const clearance = (x: number) =>
            Math.min(...usedSpawnXs.map((usedX) => Math.abs(x - usedX)));
          return clearance(candidate.x) > clearance(best.x) ? candidate : best;
        }, orderedSlots[0]),
      host = slot?.platform ?? routePlatforms[0],
      origin = slot?.x ?? host.x + host.w / 2;
    usedSpawnXs.push(origin);
    const baseY =
        behavior === 'fly' || behavior === 'hover'
          ? 300 + (i % 3) * 48
          : behavior === 'swim'
            ? 492 + (i % 2) * 34
            : host.y - 44,
      skillPhysics = enemySkillPhysics(noun[0]);
    return {
      vx: 0,
      alert: false,
      activated: false,
      zoneStart: Math.max(0, origin - profile.zoneBehind),
      zoneEnd: Math.min(worldWidth, origin + profile.zoneAhead),
      fireTimer: profile.shotCooldown + 0.7 + (i % 3) * 0.35,
      warning: 0,
      wakeTimer: 0,
      slowUntil: 0,
      burnUntil: 0,
      burnTickAt: 0,
      x: origin,
      y: baseY,
      w: 48,
      h: 44,
      origin,
      baseY,
      platformIndex: platforms.indexOf(host),
      range: 32 + difficulty * 18,
      speed: 0.95 + difficulty * 0.85,
      behavior,
      habitat,
      dropClock: 1.4 + i * 0.2,
      dropState: 'ready',
      vy: 0,
      noun,
      rockHp: 3,
      dead: false,
      seen: false,
      defeatedAt: 0,
      phase: i * 2.1 + level * 0.3,
      skill: enemySkill(noun[0]),
      skillTimer: 4.8 + (i % 3) * 1.1,
      skillActive: 0,
      skillWindup: 0,
      skillSeen: false,
      skillPower: skillPhysics.power,
      skillDuration: skillPhysics.duration,
      skillCooldown: skillPhysics.cooldown,
      skillVariant: skillPhysics.variant,
    };
  });
  if (level === 0) {
    platforms.length = 0;
    add(0, 550, 350, 100, true);
    const heights = [480, 412, 350, 412, 478, 420, 360];
    for (let i = 0; i < 24; i++)
      add(
        430 + i * 200,
        heights[i % heights.length],
        i < 14 ? 126 : 112,
        25,
        false,
        [5, 12, 20].includes(i),
      );
    add(5160, 450, 110, 25);
    add(5200, 550, 400, 100, true);
    // Two broad rest islands divide the long sky route into fair sections.
    add(1960, 522, 300, 128, true);
    add(3700, 510, 320, 140, true);
    add(5260, 472, 105, 25);
    add(5410, 472, 105, 25);
    pickups.splice(
      0,
      pickups.length,
      ...[3, 12, 21].map((i) => ({
        x: 430 + i * 200 + 48,
        y: heights[i % heights.length] - 48,
        got: false,
      })),
    );
    foods.splice(
      0,
      foods.length,
      ...[6, 15, 22].map((i, j) => ({
        x: 430 + i * 200 + 38,
        y: heights[i % heights.length] - 36,
        w: 34,
        h: 34,
        name: VIET_FOODS[j][0],
        kind: j,
        eaten: false,
      })),
    );
    sanitizePlatforms();
    const sample = enemies.map((e) => ({ ...e }));
    const aLandPlatforms = platforms.filter(
        (platform) => platform.ground && platform.x > 300,
      ),
      aLandSlots = aLandPlatforms.flatMap((platform) => {
        const slotCount = Math.max(1, Math.floor((platform.w - 52) / 180));
        return Array.from({ length: slotCount }, (_, slot) => ({
          platform,
          x:
            platform.x +
            26 +
            ((platform.w - 52) * (slot + 1)) / (slotCount + 1),
        }));
      });
    enemies.splice(
      0,
      enemies.length,
      ...[1, 4, 7, 10, 13, 17, 21].map((step, i) => {
        const noun = VOCABULARY[0][i % 3],
          behavior = enemyMotion(noun[0]),
          habitat = enemyHabitat(noun[0]),
          skyHost = platforms.find(
            (platform) =>
              !platform.ground && Math.abs(platform.x - (430 + step * 200)) < 4,
          ),
          landOrder = Array.from({ length: i }, (_, previous) =>
            enemyHabitat(VOCABULARY[0][previous % 3][0]),
          ).filter((previousHabitat) => previousHabitat === 'land').length,
          landSlot = aLandSlots[landOrder % aLandSlots.length],
          host =
            habitat === 'land'
              ? landSlot.platform
              : (skyHost ?? aLandPlatforms[i % aLandPlatforms.length]),
          x =
            habitat === 'land'
              ? landSlot.x
              : host.x + Math.min(host.w - 54, 35 + (i % 2) * 42),
          baseY = host.y - 44;
        return {
          ...sample[i % 3],
          x,
          origin: x,
          y: behavior === 'drop' ? baseY - 150 : baseY,
          baseY,
          platformIndex: platforms.indexOf(host),
          range: Math.min(70, Math.max(22, host.w / 2 - 35)),
          phase: i * 1.3,
          fireTimer: profile.shotCooldown + 0.7 + (i % 3) * 0.35,
          noun,
          behavior,
          habitat,
          activated: false,
          zoneStart: Math.max(0, x - profile.zoneBehind),
          zoneEnd: Math.min(worldWidth, x + profile.zoneAhead),
        };
      }),
    );
  }
  const interactivePlatforms = platforms.filter(
    (platform) =>
      !platform.ground && platform.x > 700 && platform.x < worldWidth - 700,
  );
  interactivePlatforms.forEach((platform, index) => {
    const isWaterRoute =
        levelHabitats.includes('water') && platform.baseY >= 440,
      isSkyRoute =
        (levelHabitats.includes('sky') || levelMotions.includes('hover')) &&
        platform.baseY < 440,
      isSpringRoute =
        !isWaterRoute &&
        !isSkyRoute &&
        (levelMotions.includes('hop') ||
          ['forest', 'garden', 'jungle', 'savanna'].includes(
            WORLDS[level].kind,
          )) &&
        (index + level) % 7 === 2;
    if (platform.moving) {
      const cycle = level === 0 ? index % 3 : (index + level) % 4;
      platform.motion = isWaterRoute
        ? 'water'
        : cycle === 0
          ? 'horizontal'
          : cycle === 1
            ? 'vertical'
            : 'fall';
    } else if (isSpringRoute) {
      platform.motion = 'spring';
    } else if (
      level >= 4 &&
      !isWaterRoute &&
      (isSkyRoute || (index + level) % 2 === 0) &&
      (index + level * 2) % 11 === 0
    ) {
      platform.moving = true;
      platform.motion = 'fall';
    }
  });
  // A moving platform may have a clear resting position but sweep through a
  // neighbouring step. Keep the richer layout and make only that conflicting
  // platform static, so illustrated blocks never pass through each other.
  const motionEnvelope = (platform: Platform) => {
      const horizontal = platform.motion === 'horizontal' ? 40 : 0,
        vertical =
          platform.motion === 'vertical'
            ? 54
            : platform.motion === 'water'
              ? 9
              : 0;
      return {
        left: platform.baseX - horizontal - 6,
        right: platform.baseX + platform.w + horizontal + 6,
        top: platform.baseY - vertical - 28,
        bottom: platform.baseY + vertical + 28,
      };
    },
    envelopesOverlap = (a: Platform, b: Platform) => {
      const ea = motionEnvelope(a),
        eb = motionEnvelope(b);
      return (
        Math.min(ea.right, eb.right) - Math.max(ea.left, eb.left) > 14 &&
        Math.min(ea.bottom, eb.bottom) - Math.max(ea.top, eb.top) > 8
      );
    };
  interactivePlatforms.forEach((platform) => {
    if (
      platform.moving &&
      platforms.some(
        (other) =>
          other !== platform &&
          !other.ground &&
          envelopesOverlap(platform, other),
      )
    ) {
      platform.moving = false;
      platform.motion = 'static';
      platform.x = platform.baseX;
      platform.y = platform.baseY;
    }
  });
  for (const e of enemies) if (e.behavior === 'drop') e.y = e.baseY - 150;
  const maxHp = profile.bossHp;
  return {
    level,
    hero,
    sky: level === 0,
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
    damageTaken: 0,
    stars: 0,
    score: 0,
    combo: 0,
    comboTime: 0,
    learned: [],
    difficulty,
    platforms,
    pickups,
    foods,
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
      dash: 0,
      direction: -1,
      announcedStage: 1,
    },
    shots: [],
    icePatches: [],
    earthShots: [],
    earthCooldown: 0,
    wendyMessage: 'Wendy báo danh! Tớ bay, cậu chạy nhé!',
    wendyMessageUntil: 3.8,
    wendyNextHint: 8,
    wendyX: 72,
    wendyY: 245,
    wendyGuideUntil: 0,
    idleTime: 0,
    lastProgressX: 60,
    recentFalls: 0,
    wendyLastTarget: '',
    particles: [],
    checkpoint: 60,
    checkpointY: 496,
    checkpointTarget: worldWidth * 0.5,
    checkpointReached: false,
    checkpointPlatformIndex: -1,
    checkpointOffset: 0,
    jumpBuffer: 0,
    coyote: 0,
    doubleJumpUnlocked: false,
    doubleJumpReady: false,
    slipperyUntil: 0,
    slowedUntil: 0,
    shake: 0,
    events: [],
  };
}

function wendySay(g: Game, message: string, duration = 2.5) {
  g.wendyMessage = message;
  g.wendyMessageUntil = g.time + duration;
  g.wendyNextHint = Math.max(g.wendyNextHint, g.time + duration + 7);
}

function wendyGuide(g: Game, message: string, duration = 2.8) {
  wendySay(g, message, duration);
  g.wendyGuideUntil = g.time + duration + 2.2;
}

function wendyObjective(g: Game) {
  const missed = wendyMissedObjective(g);
  if (missed) return missed;
  if (g.player.x > g.worldWidth - 720 && g.boss.hp > 0)
    return {
      x: g.boss.x + g.boss.w / 2,
      y: g.boss.y,
      message: `Trùm chữ ${String.fromCharCode(65 + g.level)} ở đây—tấn công nào!`,
    };
  const pickup = g.pickups.find(
    (item) => !item.got && Math.abs(item.x - g.player.x) < 950,
  );
  if (pickup && Math.floor(g.time / 12) % 2 === 0)
    return {
      x: pickup.x,
      y: pickup.y,
      message: 'Chữ cái ở đây! Lấy đủ chữ thường và chữ hoa nhé!',
    };
  const enemy = g.enemies
    .filter((item) => !item.dead)
    .sort((a, b) => Math.abs(a.x - g.player.x) - Math.abs(b.x - g.player.x))[0];
  if (enemy)
    return {
      x: enemy.x + enemy.w / 2,
      y: enemy.y,
      message: `${enemy.noun[0]} ở đây! Mau tiêu diệt nó!`,
    };
  if (pickup)
    return {
      x: pickup.x,
      y: pickup.y,
      message: 'Bay theo tớ—chữ cái đang chờ phía trước!',
    };
  return {
    x: g.boss.x + g.boss.w / 2,
    y: g.boss.y,
    message: `Đến trùm chữ ${String.fromCharCode(65 + g.level)} thôi!`,
  };
}

function wendyMissedObjective(g: Game) {
  const missedPickup = g.pickups
    .map((item, index) => ({ ...item, index }))
    .filter((item) => !item.got && item.x < g.player.x - 260)
    .sort((a, b) => b.x - a.x)[0];
  if (missedPickup)
    return {
      key: `letter-${missedPickup.index}`,
      x: missedPickup.x,
      y: missedPickup.y,
      label: 'CHỮ CÁI',
      message: 'Khoan! Cậu vừa bỏ sót một chữ cái ở phía sau!',
    };
  const missedEnemy = g.enemies
    .map((enemy, index) => ({ enemy, index }))
    .filter(({ enemy }) => !enemy.dead && enemy.x < g.player.x - 320)
    .sort((a, b) => b.enemy.x - a.enemy.x)[0];
  if (missedEnemy)
    return {
      key: `enemy-${missedEnemy.index}`,
      x: missedEnemy.enemy.x + missedEnemy.enemy.w / 2,
      y: missedEnemy.enemy.y,
      label: missedEnemy.enemy.noun[0].toUpperCase(),
      message: `${missedEnemy.enemy.noun[0]} vẫn còn ở phía sau—quay lại nào!`,
    };
  return null;
}

export function earthAbilityReady(g: Game) {
  return Boolean(g.pickups[0]?.got && g.pickups[1]?.got);
}

export function activateEarthSkill(g: Game) {
  if (g.mode !== 'playing' || !earthAbilityReady(g) || g.earthCooldown > 0)
    return false;
  const direction = g.player.facing || 1,
    vertical = g.hero === 'mori',
    backward = g.hero === 'sol',
    arcing = g.hero === 'rio',
    largeProjectile = g.hero !== 'mon',
    velocityX = vertical
      ? 0
      : backward
        ? -direction * 430
        : direction * (arcing ? 285 : 430),
    velocityY = vertical ? -590 : arcing ? -430 : 0;
  g.earthShots.push({
    x: vertical
      ? g.player.x + g.player.w / 2 - 9
      : g.player.x +
        (velocityX > 0 ? g.player.w - 2 : -(largeProjectile ? 18 : 12)),
    y: g.player.y + (vertical || arcing ? 7 : 24),
    w: largeProjectile ? 18 : 12,
    h: largeProjectile ? 18 : 12,
    vx: velocityX,
    vy: velocityY,
    life: 2.2,
    spin: backward && velocityX < 0 ? Math.PI : 0,
    gravity: vertical || arcing ? 980 : 0,
    hero: g.hero,
  });
  g.earthCooldown = 0.72;
  g.events.push({ type: 'earth', hero: g.hero });
  wendySay(
    g,
    g.hero === 'mori'
      ? 'Củi lên trời! Coi chừng rơi nha!'
      : g.hero === 'rio'
        ? 'Nước tới đây—khỏi cần ô!'
        : g.hero === 'sol'
          ? 'Phía sau nóng lắm đó!'
          : 'Đá bay! Enemy né không kịp đâu!',
  );
  burst(
    g,
    vertical ? g.player.x + 21 : g.player.x + 21 + Math.sign(velocityX) * 22,
    vertical ? g.player.y + 5 : g.player.y + 30,
    '#d9a441',
    9,
  );
  return true;
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
  g.hp = fall && g.sky ? 0 : g.hp - 1;
  g.damageTaken++;
  g.combo = 0;
  g.shake = 0.25;
  g.events.push({ type: 'hurt' });
  if (fall) g.recentFalls++;
  wendySay(
    g,
    fall
      ? g.recentFalls >= 3
        ? 'Đợi bệ tới gần rồi mới nhảy—chậm một nhịp thôi!'
        : g.recentFalls === 2
          ? 'Tớ bật hỗ trợ nhảy nhé—mép bệ sẽ dễ đáp hơn!'
          : 'Ơ kìa, đất ở dưới mà!'
      : 'Tim của cậu đau, tớ vẫn ổn!',
    2.8,
  );
  g.player.invincible = 1.7;
  burst(g, g.player.x + 21, g.player.y + 25, '#ed8a76');
  if (fall) {
    const checkpointPlatform = g.platforms[g.checkpointPlatformIndex];
    if (checkpointPlatform && !checkpointPlatform.resetTimer) {
      g.player.x = Math.max(
        checkpointPlatform.x + 5,
        Math.min(
          checkpointPlatform.x + checkpointPlatform.w - g.player.w - 5,
          checkpointPlatform.x + g.checkpointOffset,
        ),
      );
      g.player.y = checkpointPlatform.y - g.player.h;
    } else {
      g.player.x = g.checkpoint;
      g.player.y = g.checkpointY;
    }
    g.player.vx = 0;
    g.player.vy = 0;
    g.doubleJumpReady = g.doubleJumpUnlocked;
  } else {
    g.player.vy = -380;
    g.player.x = Math.max(0, g.player.x - 24);
  }
  if (g.hp <= 0) g.mode = 'lost';
}
export function updateGame(
  g: Game,
  dt: number,
  input: { left: boolean; right: boolean; jump: boolean; earth: boolean },
) {
  if (g.mode !== 'playing') return;
  dt = Math.min(Math.max(dt, 0), 1 / 30);
  g.time += dt;
  g.events = [];
  const p = g.player,
    profile = difficultyProfile(g.level);
  const makingProgress =
    Math.abs(p.vx) > 18 || !p.grounded || Math.abs(p.x - g.lastProgressX) > 5;
  if (makingProgress) {
    g.idleTime = 0;
    if (p.x > g.lastProgressX + 160) g.recentFalls = 0;
    g.lastProgressX = Math.max(g.lastProgressX, p.x);
  } else if (!input.left && !input.right && !input.jump) g.idleTime += dt;
  else g.idleTime = 0;
  if (
    g.idleTime >= 4.5 &&
    g.time >= g.wendyNextHint &&
    g.time >= g.wendyMessageUntil
  ) {
    const objective = wendyObjective(g);
    wendyGuide(
      g,
      earthAbilityReady(g)
        ? 'Kỹ năng đã sáng—bấm nút kỹ năng để tấn công!'
        : objective.message,
    );
    g.idleTime = 0;
  }
  const missedObjective = wendyMissedObjective(g);
  if (
    missedObjective &&
    missedObjective.key !== g.wendyLastTarget &&
    p.grounded &&
    g.time >= g.wendyNextHint &&
    g.time >= g.wendyMessageUntil
  ) {
    g.wendyLastTarget = missedObjective.key;
    wendyGuide(g, missedObjective.message, 3);
  }
  g.shake = Math.max(0, g.shake - dt);
  g.earthCooldown = Math.max(0, g.earthCooldown - dt);
  if (input.earth) activateEarthSkill(g);
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
  for (const patch of g.icePatches) {
    patch.life -= dt;
    if (
      p.grounded &&
      p.x + p.w > patch.x &&
      p.x < patch.x + patch.w &&
      Math.abs(p.y + p.h - patch.y) < 18
    )
      g.slipperyUntil = Math.max(g.slipperyUntil, g.time + 0.16);
  }
  g.icePatches = g.icePatches.filter((patch) => patch.life > 0);
  for (const plat of g.platforms) {
    const oldX = plat.x,
      oldY = plat.y,
      wasRiding =
        p.grounded &&
        Math.abs(p.y + p.h - oldY) < 4 &&
        p.x + p.w > oldX &&
        p.x < oldX + plat.w;
    plat.dx = 0;
    plat.dy = 0;
    if (plat.motion === 'horizontal') {
      plat.x = plat.baseX + Math.sin(g.time * 1.25 + plat.motionPhase) * 34;
    } else if (plat.motion === 'vertical') {
      plat.y = plat.baseY + Math.sin(g.time * 1.12 + plat.motionPhase) * 54;
    } else if (plat.motion === 'water') {
      plat.x = plat.baseX + Math.sin(g.time * 0.72 + plat.motionPhase) * 24;
      plat.y = plat.baseY + Math.sin(g.time * 1.85 + plat.motionPhase) * 9;
    } else if (plat.motion === 'fall') {
      if (wasRiding && plat.fallDelay < 0 && !plat.falling && !plat.resetTimer)
        plat.fallDelay = 0.7;
      if (plat.fallDelay > 0) {
        plat.fallDelay -= dt;
        plat.y = plat.baseY + Math.sin(g.time * 28) * 2;
        if (plat.fallDelay <= 0) plat.falling = true;
      } else if (plat.falling) {
        plat.y += 330 * dt;
        if (plat.y > HEIGHT + 80) {
          plat.falling = false;
          plat.resetTimer = 1.7;
        }
      } else if (plat.resetTimer > 0) {
        plat.resetTimer = Math.max(0, plat.resetTimer - dt);
        if (!plat.resetTimer) {
          plat.x = plat.baseX;
          plat.y = plat.baseY;
          plat.fallDelay = -1;
        }
      }
    }
    plat.dx = plat.x - oldX;
    plat.dy = plat.y - oldY;
    if (wasRiding && !plat.resetTimer) {
      p.x += plat.dx;
      p.y += plat.dy;
    }
  }
  const jumpAssist = g.recentFalls >= 2;
  if (input.jump) g.jumpBuffer = jumpAssist ? 0.2 : 0.14;
  else g.jumpBuffer = Math.max(0, g.jumpBuffer - dt);
  if (p.grounded) g.coyote = jumpAssist ? 0.18 : 0.1;
  else g.coyote = Math.max(0, g.coyote - dt);
  const dir = Number(input.right) - Number(input.left),
    slippery = g.slipperyUntil > g.time,
    slowed = g.slowedUntil > g.time,
    target = dir * (slowed ? 145 : 240),
    traction = slippery ? (dir ? 2.4 : 1.15) : dir ? 15 : 20;
  p.vx += (target - p.vx) * Math.min(1, dt * traction);
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
  } else if (
    g.jumpBuffer > 0 &&
    g.doubleJumpUnlocked &&
    g.doubleJumpReady &&
    !p.grounded
  ) {
    p.vy = -590;
    g.doubleJumpReady = false;
    g.jumpBuffer = 0;
    burst(g, p.x + 21, p.y + p.h / 2, '#f9d656', 12);
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
      p.x + p.w > plat.x + (jumpAssist ? -7 : 3) &&
      p.x < plat.x + plat.w - (jumpAssist ? -7 : 3) &&
      oldBottom <= plat.y + (jumpAssist ? 10 : 4) &&
      p.y + p.h >= plat.y
    ) {
      const springLanding = plat.motion === 'spring';
      if (!wasGrounded && p.vy > 250) {
        p.landing = 0.16;
        burst(g, p.x + 21, plat.y, '#ebefc1', 6);
      }
      p.y = plat.y - p.h;
      p.vy = springLanding ? -820 : 0;
      p.grounded = !springLanding;
      g.doubleJumpReady = g.doubleJumpUnlocked;
      if (springLanding) {
        g.coyote = 0;
        burst(g, p.x + 21, plat.y, '#8fdb69', 13);
        wendySay(g, 'Bệ lá bật cao! Giữ hướng để chọn chỗ đáp.', 1.8);
      }
      if (
        !g.checkpointReached &&
        p.x >= g.checkpointTarget &&
        p.x < g.worldWidth - 600
      ) {
        const safePlatform = ['fall', 'spring'].includes(plat.motion)
          ? ([...g.platforms]
              .filter((candidate) => candidate.ground && candidate.x <= p.x)
              .sort((a, b) => b.x - a.x)[0] ?? plat)
          : plat;
        g.checkpoint = Math.max(
          safePlatform.x + 5,
          Math.min(p.x, safePlatform.x + safePlatform.w - p.w - 5),
        );
        g.checkpointY = safePlatform.y - p.h;
        g.checkpointReached = true;
        g.checkpointPlatformIndex = g.platforms.indexOf(safePlatform);
        g.checkpointOffset = g.checkpoint - safePlatform.x;
        g.recentFalls = 0;
        if (g.hp < 3) g.hp++;
        burst(g, p.x + p.w / 2, plat.y - 20, '#d8ef72', 18);
        wendySay(
          g,
          'Đã lưu điểm và hồi một tim! Rơi cũng không phải đi lại từ đầu.',
          2.9,
        );
      }
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
      if (index === 2) {
        g.doubleJumpUnlocked = true;
        g.doubleJumpReady = true;
      }
      wendySay(
        g,
        index === 0
          ? 'Chữ hoa bắt được rồi!'
          : index === 1
            ? 'Chữ thường đủ bộ—mở phép!'
            : 'Có nhảy đôi rồi! Đang bay thì bấm Nhảy thêm lần nữa!',
      );
    }
  });
  for (const food of g.foods) {
    if (!food.eaten && g.hp < 3 && overlaps(p, food)) {
      food.eaten = true;
      g.hp = Math.min(3, g.hp + 1);
      g.score += 30;
      burst(g, food.x + 17, food.y + 17, '#b6ef8b', 14);
      g.events.push({ type: 'heal', food: food.name });
      wendySay(g, `${food.name} ngon quá—tim đầy lên!`);
    }
  }
  const engagedEnemies = new Set(
    g.enemies
      .filter((enemy) => enemy.activated && !enemy.dead)
      .sort(
        (a, b) =>
          Math.abs(a.x - p.x) - Math.abs(b.x - p.x) || a.origin - b.origin,
      )
      .slice(0, profile.activeLimit),
  );
  for (const e of g.enemies) {
    if (e.dead) continue;
    e.skillActive = Math.max(0, e.skillActive - dt);
    if (e.burnTickAt > 0 && g.time >= e.burnTickAt) {
      e.burnTickAt = 0;
      e.rockHp = Math.max(0, e.rockHp - 1);
      burst(g, e.x + e.w / 2, e.y + e.h / 2, '#ff7a35', 10);
      if (e.rockHp <= 0) {
        e.dead = true;
        e.defeatedAt = g.time;
        g.combo++;
        g.comboTime = 3;
        g.score += 50 * Math.min(g.combo, 5);
        learn(g, e.noun, 'stomp');
        wendySay(g, `${e.noun[0]} bị lửa hạ rồi!`);
        continue;
      }
    }
    const ground = g.platforms[e.platformIndex];
    if (ground && !['fly', 'swim', 'hover'].includes(e.behavior)) {
      e.origin += ground.dx;
      e.zoneStart += ground.dx;
      e.zoneEnd += ground.dx;
      e.baseY = ground.y - e.h;
      if (e.behavior === 'drop' && e.dropState === 'ready') e.y = e.baseY - 150;
    }
    if (!e.activated) {
      const enteredZone = p.x + p.w >= e.zoneStart && p.x <= e.zoneEnd,
        nearbyAttackers = g.enemies.filter(
          (other) =>
            other !== e &&
            other.activated &&
            !other.dead &&
            Math.abs(other.x - p.x) < 680,
        ).length,
        attackerLimit = profile.activeLimit;
      if (enteredZone && nearbyAttackers < attackerLimit) {
        e.activated = true;
        e.alert = true;
        e.wakeTimer = Math.max(0.55, 0.9 - g.difficulty * 0.25);
        e.fireTimer = Math.max(1.15, e.fireTimer);
        if (!e.seen) {
          e.seen = true;
          learn(g, e.noun, 'encounter');
        }
      } else {
        e.vx = 0;
        e.warning = 0;
        if (!airborne(e.behavior) && e.behavior !== 'drop')
          e.y += (e.baseY - e.y) * Math.min(1, dt * 8);
        continue;
      }
    }
    if (e.wakeTimer > 0) {
      e.wakeTimer = Math.max(0, e.wakeTimer - dt);
      e.vx = 0;
      e.warning = 0;
      continue;
    }
    const distance = p.x + p.w / 2 - (e.x + e.w / 2);
    e.alert = engagedEnemies.has(e);
    if (e.alert) {
      if (e.skillWindup > 0) {
        e.skillWindup = Math.max(0, e.skillWindup - dt);
        if (e.skillWindup === 0) {
          e.skillActive =
            e.skill === 'grow' ? e.skillDuration * 2.1 : e.skillDuration;
          if (e.skill === 'freeze' || e.skill === 'gust' || e.skill === 'snare')
            e.fireTimer = Math.min(e.fireTimer, 0.55);
          if (e.skill === 'freeze') {
            const icePlatform = g.platforms
                .filter(
                  (platform) =>
                    p.x + p.w / 2 >= platform.x - 30 &&
                    p.x + p.w / 2 <= platform.x + platform.w + 30 &&
                    platform.y >= p.y + p.h - 20,
                )
                .sort((a, b) => a.y - b.y)[0],
              patchWidth = 120 + e.skillVariant * 34;
            if (icePlatform)
              g.icePatches.push({
                x: Math.max(
                  icePlatform.x,
                  Math.min(
                    icePlatform.x + icePlatform.w - patchWidth,
                    p.x - patchWidth / 2,
                  ),
                ),
                y: icePlatform.y - 7,
                w: Math.min(patchWidth, icePlatform.w),
                h: 9,
                life: 3.2 + e.skillPower,
                maxLife: 3.2 + e.skillPower,
                noun: e.noun,
              });
          }
        }
      } else {
        e.skillTimer -= dt;
      }
      if (e.skillTimer <= 0 && e.skillWindup === 0 && e.skillActive === 0) {
        e.skillWindup = Math.max(
          0.65,
          1.15 - g.difficulty * 0.32 + e.skillVariant * 0.08,
        );
        e.skillTimer =
          Math.max(4.1, e.skillCooldown - g.difficulty * 0.75) +
          (e.phase % 0.7);
        g.events.push({
          type: 'enemySkill',
          noun: e.noun,
          skillLabel: enemySkillLabel(e.noun[0]),
        });
        if (!e.skillSeen) wendySay(g, enemySkillHint(e.noun[0], e.skill), 3.2);
        e.skillSeen = true;
      }
    }
    // Ground enemies defend their island; flyers can pursue across gaps.
    const low = airborne(e.behavior)
      ? 20
      : (ground?.x ?? e.origin - e.range) + 8;
    const high = airborne(e.behavior)
      ? g.worldWidth - e.w - 30
      : (ground ? ground.x + ground.w : e.origin + e.range + e.w) - e.w - 8;
    const targetX = e.alert
      ? p.x + p.vx * (e.behavior === 'hop' ? 0.28 : 0.12)
      : e.origin + Math.sin(g.time * e.speed + e.phase) * e.range;
    const direction = Math.sign(targetX - e.x);
    const slowed = e.slowUntil > g.time,
      pace =
        profile.pursuitSpeed *
        enemyPace(e.noun[0]) *
        (slowed ? 0.42 : 1) *
        (e.skill === 'charge' && e.skillActive > 0
          ? 1.65 + e.skillPower * 0.72
          : 1);
    if (e.behavior === 'drop') {
      e.vx = 0;
      e.dropClock -= dt;
      if (e.dropState === 'ready') {
        e.y = e.baseY - 150;
        // A short sway at the source warns of the next falling fruit.
        e.x = Math.max(
          low,
          Math.min(high, e.origin + Math.sin(g.time * 8) * 3),
        );
        if (e.dropClock <= 0) {
          e.dropState = 'fall';
          e.vy = 0;
        }
      } else if (e.dropState === 'fall') {
        e.vy += 820 * dt;
        e.y = Math.min(e.baseY, e.y + e.vy * dt);
        if (e.y >= e.baseY) {
          e.dropState = 'rest';
          e.dropClock = 2.2;
          e.vy = 0;
        }
      } else if (e.dropClock <= 0 && Math.abs(p.y - (e.baseY - 150)) > 60) {
        e.dropState = 'ready';
        e.dropClock = 1.1;
      }
    } else {
      const moving = e.behavior !== 'guard';
      e.vx += ((moving ? direction * pace : 0) - e.vx) * Math.min(1, dt * 8);
      e.x = Math.max(low, Math.min(high, e.x + e.vx * dt));
      if (airborne(e.behavior)) {
        if (e.behavior === 'swim') {
          const wave = Math.sin(g.time * 2.25 + e.phase);
          const leap = Math.pow(Math.max(0, wave), 1.7) * 88;
          const dive = Math.min(0, wave) * -20;
          const waterY = 500 - leap + dive;
          e.y += (waterY - e.y) * Math.min(1, dt * 2.8);
        } else {
          const clearance = e.behavior === 'fly' ? 65 : 35;
          const diving =
            e.behavior === 'fly' &&
            e.alert &&
            Math.sin(g.time * 1.8 + e.phase) > 0.15;
          const targetY = diving
            ? e.baseY - 8
            : e.alert
              ? Math.max(190, Math.min(e.baseY, p.y + 12 - clearance))
              : e.baseY - clearance + Math.sin(g.time * 2 + e.phase) * 18;
          // Alternating low swoops keep flying enemies reachable with a jump.
          e.y += (Math.min(e.baseY, targetY) - e.y) * Math.min(1, dt * 2.5);
        }
      } else {
        const groundMotion = ['walk', 'hop', 'slither'].includes(e.behavior);
        const jump = Math.max(
          0,
          Math.sin(g.time * (e.alert ? 3.1 : 2.15) + e.phase),
        );
        const amplitude =
          e.behavior === 'hop'
            ? e.alert
              ? e.skill === 'leap' && e.skillActive > 0
                ? 118 + e.skillPower * 42
                : 100
              : 56
            : e.behavior === 'walk'
              ? 4
              : e.behavior === 'slither'
                ? 1.5
                : 0;
        const targetY = e.baseY - (groundMotion ? jump * amplitude : 0);
        e.y += Math.max(-200 * dt, Math.min(200 * dt, targetY - e.y));
      }
    }
    e.warning = 0;
    // Fire only within the visible encounter, with time to read and dodge the word.
    if (
      e.alert &&
      e.skillWindup === 0 &&
      (e.behavior !== 'drop' || e.dropState === 'rest') &&
      Math.abs(distance) < 360 &&
      Math.abs(p.y - e.y) < 250
    ) {
      e.fireTimer -= dt;
      e.warning = e.fireTimer < 0.65 ? 0.65 - e.fireTimer : 0;
      if (e.fireTimer <= 0 && g.shots.length < profile.shotCap) {
        const width = Math.max(40, e.noun[0].length * 7 + 12);
        const dx = p.x + p.w / 2 + p.vx * 0.22 - (e.x + e.w / 2);
        const dy = p.y + p.h / 2 - (e.y + e.h / 2);
        const length = Math.max(1, Math.hypot(dx, dy));
        const speed = profile.shotSpeed;
        const effect =
            e.skillActive > 0 &&
            (e.skill === 'freeze' || e.skill === 'gust' || e.skill === 'snare')
              ? e.skill
              : undefined,
          skillShot = {
            x: e.x + e.w / 2 - width / 2,
            y: e.y + 12,
            w: width,
            h: 20,
            vx: (dx / length) * speed,
            vy: (dy / length) * speed,
            life: 3.2,
            noun: e.noun,
            effect,
            power: e.skillPower,
          };
        g.shots.push(skillShot);
        if (effect && e.skillVariant > 0)
          for (let spread = 1; spread <= e.skillVariant; spread++)
            g.shots.push({
              ...skillShot,
              vx: skillShot.vx * (1 - spread * 0.06),
              vy: skillShot.vy + (spread % 2 ? -1 : 1) * (42 + spread * 18),
              life: skillShot.life - spread * 0.12,
            });
        e.fireTimer = profile.shotCooldown + (e.phase % 0.45);
      }
    } else e.fireTimer = Math.max(0.8, e.fireTimer);
    const giant = e.skill === 'grow' && e.skillActive > 0,
      giantExtra = giant ? 16 + e.skillPower * 14 : 0,
      enemyBody: Rect = giant
        ? {
            x: e.x - giantExtra / 2,
            y: e.y - giantExtra,
            w: e.w + giantExtra,
            h: e.h + giantExtra,
          }
        : e;
    if (overlaps(p, enemyBody)) {
      if (p.vy > 0 && oldBottom < enemyBody.y + 19) {
        e.dead = true;
        e.defeatedAt = g.time;
        p.vy = -500;
        g.combo++;
        g.comboTime = 3;
        g.score += 50 * Math.min(g.combo, 5);
        burst(g, e.x + 24, e.y + 20, '#d5ef75', 14);
        learn(g, e.noun, 'stomp');
        wendySay(g, 'Bẹp! Cú nhảy đẹp đó!');
      } else {
        if (e.skill === 'charge' && e.skillActive > 0)
          p.vx += Math.sign(e.vx || distance) * (150 + e.skillPower * 100);
        hurt(g);
      }
    }
  }
  if (g.mode !== 'playing') return;
  const b = g.boss;
  b.cooldown = Math.max(0, b.cooldown - dt);
  b.phase = g.time * (1.1 + g.difficulty * 0.7);
  b.warning = 0;
  const engaged = p.x > g.worldWidth - 780 && b.hp > 0,
    bossTier = Math.min(5, Math.floor(g.level / 5));
  if (engaged) {
    b.attackTimer -= dt;
    const bossStage =
      b.hp <= Math.ceil(b.maxHp / 3)
        ? 3
        : b.hp <= Math.ceil((b.maxHp * 2) / 3)
          ? 2
          : 1;
    if (bossStage > b.announcedStage) {
      b.announcedStage = bossStage;
      wendySay(
        g,
        bossStage === 3
          ? 'Giai đoạn cuối! Trùm bắn nhanh hơn—đừng đứng yên!'
          : 'Trùm đổi chiêu rồi! Cẩn thận đạn bắn thành chùm!',
        3,
      );
    }
    const enraged = bossStage >= 2;
    if (b.dash > 0) {
      b.dash = Math.max(0, b.dash - dt);
      b.x += b.direction * (240 + g.difficulty * 65) * dt;
    } else if (b.attackTimer > 0.8) {
      b.x += Math.sign(p.x - b.x) * (45 + g.difficulty * 35) * dt;
    } else {
      b.warning = 0.8 - b.attackTimer;
      // Commit after a visible wind-up: the player can dodge the charge.
      b.direction = Math.sign(p.x + p.vx * 0.25 - b.x) || -1;
    }
    if (b.attackTimer <= 0) {
      const noun = VOCABULARY[g.level][Math.floor(g.time) % 3];
      const dx = p.x + p.w / 2 + p.vx * 0.25 - (b.x + b.w / 2);
      const dy = p.y + p.h / 2 - (b.y + 60);
      const length = Math.max(1, Math.hypot(dx, dy));
      const speed = 140 + g.difficulty * 65;
      const spread = bossStage === 3 ? 0.28 : 0.19,
        alternatingTurn = Math.floor(g.time * 1.7) % 2 ? 0.2 : -0.2,
        attackAngles =
          bossTier === 0
            ? bossStage === 1
              ? [0]
              : bossStage === 2
                ? [-spread, spread]
                : [-spread, 0, spread]
            : bossTier === 1
              ? bossStage === 1
                ? [alternatingTurn]
                : [alternatingTurn - spread, alternatingTurn + spread]
              : bossTier === 2
                ? bossStage === 1
                  ? [0]
                  : bossStage === 2
                    ? [-spread, 0, spread]
                    : [-0.36, -0.18, 0, 0.18, 0.36]
                : bossTier === 3
                  ? bossStage === 1
                    ? [alternatingTurn]
                    : [
                        -0.3 + alternatingTurn * 0.4,
                        alternatingTurn * 0.4,
                        0.3 + alternatingTurn * 0.4,
                      ]
                  : bossStage === 1
                    ? [-0.2, 0.2]
                    : bossStage === 2
                      ? [-0.32, 0, 0.32]
                      : [-0.4, -0.2, 0, 0.2, 0.4];
      for (const turn of attackAngles) {
        const cos = Math.cos(turn),
          sin = Math.sin(turn),
          shotVx = (dx / length) * speed,
          shotVy = (dy / length) * speed;
        g.shots.push({
          x: b.x + b.w / 2,
          y: b.y + 60,
          w: Math.max(40, noun[0].length * 7 + 12),
          h: 20,
          vx: shotVx * cos - shotVy * sin,
          vy: shotVx * sin + shotVy * cos,
          life: 4,
          noun,
        });
      }
      b.dash = 0.48;
      b.attackTimer =
        (bossStage === 3 ? 2.05 : enraged ? 2.55 : 3.35) - g.difficulty * 0.6;
    }
    b.x = Math.max(
      g.worldWidth - (g.sky ? 400 : 650),
      Math.min(g.worldWidth - 140, b.x),
    );
  }
  for (const s of g.shots) {
    s.x += s.vx * dt;
    s.y += s.vy * dt;
    s.life -= dt;
    if (overlaps(p, s)) {
      s.life = 0;
      if (s.effect === 'freeze')
        g.slipperyUntil = g.time + 2.5 + (s.power ?? 1);
      if (s.effect === 'snare') g.slowedUntil = g.time + 1.6 + (s.power ?? 1);
      if (s.effect === 'gust')
        p.vx += Math.sign(s.vx) * (190 + (s.power ?? 1) * 85);
      hurt(g);
    }
  }
  g.shots = g.shots.filter(
    (s) =>
      s.life > 0 && s.x > 0 && s.x < g.worldWidth && s.y > 0 && s.y < HEIGHT,
  );
  for (const rock of g.earthShots) {
    rock.x += rock.vx * dt;
    rock.y += rock.vy * dt;
    rock.vy += rock.gravity * dt;
    if (rock.hero !== 'sol')
      rock.spin += (rock.hero === 'mori' ? 1 : Math.sign(rock.vx)) * dt * 9;
    rock.life -= dt;
    for (const e of g.enemies) {
      if (!e.dead && overlaps(rock, e)) {
        e.rockHp = Math.max(0, e.rockHp - 2);
        if (rock.hero === 'rio') e.slowUntil = g.time + 2.6;
        if (rock.hero === 'sol' && e.rockHp > 0) {
          e.burnUntil = g.time + 1.2;
          e.burnTickAt = g.time + 0.72;
        }
        if (rock.hero === 'mori' && e.rockHp > 0)
          e.wakeTimer = Math.max(e.wakeTimer, 0.45);
        if (rock.hero === 'mon')
          e.vx += Math.sign(rock.vx || g.player.facing) * 230;
        rock.life = 0;
        const defeated = e.rockHp <= 0;
        if (defeated) {
          g.combo++;
          g.comboTime = 3;
        }
        g.score += defeated ? 50 * Math.min(g.combo, 5) : 15;
        g.shake = 0.1;
        burst(g, e.x + e.w / 2, e.y + e.h / 2, '#e0b04e', defeated ? 18 : 9);
        if (defeated) {
          e.dead = true;
          e.defeatedAt = g.time;
          learn(g, e.noun, 'stomp');
          wendySay(g, `${e.noun[0]} hết đường chạy nhé!`);
        } else {
          const counterHero = enemySkillCounter(e.noun[0], e.skill),
            countered =
              (e.skillActive > 0 || e.skillWindup > 0) &&
              rock.hero === counterHero;
          if (countered) {
            e.skillActive = 0;
            e.skillWindup = 0;
            e.skillTimer = Math.max(e.skillTimer, 3.2);
            for (const shot of g.shots)
              if (shot.noun[0] === e.noun[0]) shot.life = 0;
            for (const patch of g.icePatches)
              if (patch.noun[0] === e.noun[0]) patch.life = 0;
            g.score += 100;
            burst(g, e.x + e.w / 2, e.y + e.h / 2, '#f7eb8c', 22);
            g.events.push({
              type: 'counter',
              noun: e.noun,
              hero: rock.hero,
              skillLabel: enemySkillLabel(e.noun[0]),
            });
          }
          wendySay(
            g,
            countered
              ? `Phản công chính xác: ${e.noun[0]}!`
              : rock.hero === 'rio'
                ? `Nước làm ${e.noun[0]} chậm lại rồi!`
                : rock.hero === 'sol'
                  ? `${e.noun[0]} đang bốc cháy!`
                  : rock.hero === 'mori'
                    ? `Khúc cây làm ${e.noun[0]} choáng rồi!`
                    : `Đá đẩy lùi ${e.noun[0]}—còn ${e.rockHp} máu!`,
            1.7,
          );
        }
        g.events.push({ type: 'earthHit', noun: e.noun });
        break;
      }
    }
    if (rock.life > 0 && b.hp > 0 && overlaps(rock, b) && b.cooldown <= 0) {
      b.hp--;
      b.cooldown = 0.62;
      rock.life = 0;
      g.score += 150;
      g.shake = 0.15;
      burst(g, b.x + b.w / 2, b.y + 45, '#f2bd42', 22);
      g.events.push({ type: 'earthHit' });
      if (b.hp === 0) {
        g.shots = [];
        b.dash = 0;
      }
    }
    if (
      rock.life > 0 &&
      rock.hero !== 'mon' &&
      rock.vy > 0 &&
      g.platforms.some((platform) => overlaps(rock, platform))
    ) {
      rock.life = 0;
      burst(g, rock.x + rock.w / 2, rock.y + rock.h / 2, '#d8c27a', 6);
    }
  }
  g.earthShots = g.earthShots.filter(
    (rock) =>
      rock.life > 0 &&
      rock.x > -60 &&
      rock.x < g.worldWidth + 60 &&
      rock.y < HEIGHT + 50,
  );
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
        g.shots = [];
        b.dash = 0;
      }
    } else if (b.cooldown <= 0) hurt(g);
  }
  if (g.mode === 'playing' && b.hp === 0 && g.enemies.every((e) => e.dead)) {
    g.mode = 'quiz';
    g.shots = [];
    g.events.push({ type: 'quiz' });
  }
  const targetCamera = Math.max(
    0,
    Math.min(g.worldWidth - WIDTH, p.x - WIDTH * 0.34),
  );
  g.camera += (targetCamera - g.camera) * Math.min(1, dt * 9);
  const guidePhase = g.time < g.wendyGuideUntil,
    objective = wendyObjective(g),
    desiredX = guidePhase
      ? Math.max(35, Math.min(WIDTH - 35, objective.x - g.camera))
      : 92 + Math.sin(g.time * 0.46) * 55,
    desiredY = guidePhase
      ? Math.max(105, Math.min(330, objective.y - 82))
      : 170 + Math.sin(g.time * 0.72 + 1.1) * 42,
    follow = 1 - Math.exp(-dt * (guidePhase ? 2.4 : 1.7));
  g.wendyX += (desiredX - g.wendyX) * follow;
  g.wendyY += (desiredY - g.wendyY) * follow;
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
    night = ['night', 'space', 'crystal', 'volcano'].includes(palette.kind),
    hasWaterEnemies = VOCABULARY[g.level].some(
      ([word]) => enemyHabitat(word) === 'water',
    ),
    hasSkyEnemies = VOCABULARY[g.level].some(
      ([word]) => enemyHabitat(word) === 'sky',
    );
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
  const hasPaintedScene = drawSceneArt(ctx, g.level, cam, g.worldWidth);
  if (hasPaintedScene) {
    ctx.fillStyle = night ? '#17283a28' : '#f6f2d318';
    ctx.fillRect(0, 0, WIDTH, HEIGHT);
  }
  // Every scene has its own silhouette, atmosphere, layout, and palette.
  if (night && !hasPaintedScene) {
    for (let i = 0; i < 36; i++) {
      const x = (i * 137 + g.level * 17) % WIDTH,
        y = (i * 71) % 315;
      ctx.globalAlpha = 0.4 + Math.sin(t * 1.5 + i) * 0.3;
      rect(x, y, 2 + (i % 2), 2 + (i % 2), '#ecf5ee');
    }
    ctx.globalAlpha = 1;
  }
  const sunX = 330 - cam * 0.025;
  if (!hasPaintedScene) {
    rect(sunX, 98, 40, 40, night ? '#e8e9bb' : '#faf1ba');
    rect(sunX - 7, 107, 54, 23, night ? '#e8e9bb' : '#faf1ba');
  }
  if (!hasPaintedScene)
    for (let i = -1; i < 9; i++) {
      const x = i * 115 - ((cam * 0.12) % 115),
        y = 315 + (i % 3) * 22;
      rect(x, y, 120, 240, palette.far);
      rect(x + 20, y - 35, 80, 45, palette.far);
      if (['mountain', 'snow', 'volcano', 'crystal'].includes(palette.kind)) {
        rect(x + 35, y - 65, 50, 34, palette.far);
        rect(x + 46, y - 85, 28, 25, palette.far);
      }
    }
  if (!hasPaintedScene && !['space', 'crystal'].includes(palette.kind)) {
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
  if (g.sky && !hasPaintedScene) {
    // Distant northern mountains and drifting clouds under the narrow sky path.
    for (let i = -1; i < 8; i++) {
      const x = i * 110 - ((cam * 0.16) % 110);
      rect(x, 522 + (i % 2) * 18, 115, 90, '#c8dfd5');
      rect(x + 20, 504 + (i % 2) * 18, 65, 24, '#e9f1df');
    }
  } else if (!hasPaintedScene) drawVietnamScene(ctx, g.level, cam, t);
  if (hasSkyEnemies) drawCloudArt(ctx, g.level, cam, t, night);
  if (hasWaterEnemies) {
    const surfaceY = 455;
    const water = ctx.createLinearGradient(0, 455, 0, HEIGHT);
    water.addColorStop(0, '#8debf0a8');
    water.addColorStop(0.35, '#25b9d3b8');
    water.addColorStop(1, '#076b9ae8');
    ctx.fillStyle = water;
    ctx.fillRect(0, surfaceY, WIDTH, HEIGHT - surfaceY);
    ctx.save();
    ctx.beginPath();
    ctx.rect(0, surfaceY - 12, WIDTH, HEIGHT - surfaceY + 12);
    ctx.clip();
    for (let layer = 0; layer < 4; layer++) {
      ctx.beginPath();
      const baseY = surfaceY + layer * 20;
      for (let x = -12; x <= WIDTH + 12; x += 8) {
        const y =
          baseY +
          Math.sin(
            x * (0.032 + layer * 0.006) + t * (2.2 - layer * 0.2) - cam * 0.012,
          ) *
            (5 - layer * 0.55) +
          Math.sin(x * 0.078 - t * 1.25 + layer) * 1.8;
        if (x === -12) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.strokeStyle = ['#efffffe8', '#b9f7f0a8', '#75e2eab0', '#37c6d6a0'][
        layer
      ];
      ctx.lineWidth = layer === 0 ? 4 : 2;
      ctx.stroke();
    }
    for (let i = 0; i < 12; i++) {
      const x = ((((i * 79 - cam * 0.18 + t * 13) % 560) + 560) % 560) - 64;
      const y = surfaceY + 35 + ((i * 47 + g.level * 13) % 128);
      ctx.globalAlpha = 0.18 + (i % 3) * 0.08;
      ctx.strokeStyle = '#e2ffff';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.ellipse(x, y, 18 + (i % 4) * 7, 3, -0.08, 0, Math.PI * 1.55);
      ctx.stroke();
    }
    ctx.restore();
    ctx.globalAlpha = 1;
  }
  // Ambient weather is deterministic and uses no per-frame allocations.
  if (['snow', 'night', 'volcano', 'garden', 'crystal'].includes(palette.kind))
    for (let i = 0; i < 24; i++) {
      const x = (((i * 79 - cam * 0.2 + t * 12) % WIDTH) + WIDTH) % WIDTH,
        y = (i * 47 + t * -12 + g.level * 20 + 2000) % HEIGHT;
      ctx.globalAlpha = 0.3 + (i % 4) * 0.15;
      rect(x, y, 3, 3, palette.kind === 'garden' ? '#ffdee8' : '#f2f4d1');
    }
  ctx.globalAlpha = 1;
  for (const p of g.platforms) {
    const x = p.x - cam;
    if (x + p.w < 0 || x > WIDTH) continue;
    const platformTop =
      p.motion === 'water'
        ? '#74dbe2'
        : p.motion === 'fall' && p.fallDelay >= 0
          ? '#e98b67'
          : p.moving
            ? '#dbbb76'
            : g.sky
              ? '#f4f4df'
              : palette.grass;
    const painted = drawPlatformArt(ctx, p, x, palette.kind);
    if (!painted) {
      rect(x + 6, p.y + 7, p.w, p.h, '#35513044');
      rect(
        x,
        p.y,
        p.w,
        p.h,
        p.motion === 'water'
          ? '#2e9aaa'
          : g.sky && !p.ground
            ? '#86a4a1'
            : palette.soil,
      );
      rect(x, p.y, p.w, 12, platformTop);
      rect(x, p.y + 12, p.w, 5, '#304b3340');
      for (let a = 0; a < p.w; a += 28) {
        rect(x + a, p.y + 5, 16, 5, '#f4f8d544');
        for (let b = 23; b < p.h; b += 25)
          rect(x + a + 4, p.y + b, 12, 7, '#3a343226');
      }
    }
    if (p.motion === 'horizontal')
      text('↔', x + p.w / 2, p.y + 25, 18, '#fcf0c4');
    if (p.motion === 'vertical')
      text('↕', x + p.w / 2, p.y + 25, 18, '#fcf0c4');
    if (p.motion === 'water') {
      text('≈', x + p.w / 2, p.y + 25, 21, '#e9ffff');
      ctx.strokeStyle = '#d9ffffb8';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.ellipse(x + p.w / 2, p.y + p.h + 7, p.w * 0.4, 4, 0, 0, Math.PI * 2);
      ctx.stroke();
    }
    if (p.motion === 'spring') {
      const pulse = 2 + Math.sin(t * 5 + p.motionPhase) * 2;
      ctx.strokeStyle = '#eaffac';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.ellipse(
        x + p.w / 2,
        p.y + 7,
        Math.max(16, p.w * 0.28) + pulse,
        5 + pulse * 0.3,
        0,
        0,
        Math.PI * 2,
      );
      ctx.stroke();
      text('↑', x + p.w / 2, p.y + 27, 19, '#f3ffd0');
    }
    if (p.motion === 'fall') {
      ctx.strokeStyle = p.fallDelay >= 0 ? '#8b302b' : '#695145';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(x + p.w * 0.3, p.y + 3);
      ctx.lineTo(x + p.w * 0.43, p.y + 10);
      ctx.lineTo(x + p.w * 0.52, p.y + 4);
      ctx.lineTo(x + p.w * 0.64, p.y + 12);
      ctx.stroke();
      if (p.fallDelay >= 0 && !p.falling)
        text('!', x + p.w / 2, p.y - 8, 17, '#9c392e');
    }
  }
  for (const patch of g.icePatches) {
    const x = patch.x - cam,
      fade = Math.min(1, patch.life) * 0.78;
    if (x + patch.w < 0 || x > WIDTH) continue;
    ctx.save();
    ctx.globalAlpha = fade;
    const ice = ctx.createLinearGradient(x, patch.y, x, patch.y + patch.h);
    ice.addColorStop(0, '#e9ffff');
    ice.addColorStop(1, '#5fc6e8');
    ctx.fillStyle = ice;
    ctx.fillRect(x, patch.y, patch.w, patch.h);
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 1.5;
    for (let crack = 18; crack < patch.w; crack += 31) {
      ctx.beginPath();
      ctx.moveTo(x + crack, patch.y + 1);
      ctx.lineTo(x + crack + 7, patch.y + 5);
      ctx.lineTo(x + crack + 2, patch.y + 8);
      ctx.stroke();
    }
    ctx.restore();
  }
  // A visible flag shows the latest safe respawn point.
  if (g.checkpoint > 200) {
    const checkpointPlatform = g.platforms[g.checkpointPlatformIndex],
      x =
        (checkpointPlatform
          ? checkpointPlatform.x + g.checkpointOffset
          : g.checkpoint) - cam,
      flagBottom = checkpointPlatform?.y ?? g.checkpointY + g.player.h,
      pulse = 0.6 + Math.sin(t * 4) * 0.2;
    ctx.save();
    ctx.globalAlpha = pulse;
    ctx.fillStyle = '#dff477';
    ctx.beginPath();
    ctx.arc(x + 2, flagBottom - 35, 16, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalAlpha = 1;
    rect(x, flagBottom - 38, 3, 38, '#647442');
    rect(x + 3, flagBottom - 38, 20, 13, '#d5ef75');
    text('✓', x + 12, flagBottom - 28, 11, '#315236', 'Arial');
    text('ĐÃ LƯU', x + 11, flagBottom - 47, 8, '#fff7c7', 'Arial');
    ctx.restore();
  }
  for (const food of g.foods) {
    if (food.eaten || food.x - cam < -60 || food.x - cam > WIDTH + 60) continue;
    drawVietnamFood(
      ctx,
      food.x - cam + 17,
      food.y + 17 + Math.sin(t * 3) * 3,
      food.kind,
    );
    text('+1 ♥', food.x - cam + 17, food.y - 13, 12, '#38794c', 'Arial');
    text(
      food.name,
      food.x - cam + 17,
      food.y + 52,
      10,
      night ? '#f5edcf' : '#3b5e43',
      'Arial',
    );
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
    if (!e.dead && e.behavior === 'drop') {
      ctx.fillStyle = '#a54f3e30';
      ctx.beginPath();
      ctx.ellipse(x + 24, e.baseY + e.h, 19, 4, 0, 0, Math.PI * 2);
      ctx.fill();
      if (e.dropState === 'ready') text('↓', x + 24, e.y - 7, 19, '#a74b37');
    }
    if (!e.dead && e.habitat === 'water') {
      const ripple = 17 + Math.sin(t * 4 + e.phase) * 5;
      ctx.strokeStyle = '#e8ffffb8';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.ellipse(x + e.w / 2, 457, ripple, 4, 0, 0, Math.PI * 2);
      ctx.stroke();
      ctx.globalAlpha = 0.6;
      for (let bubble = 0; bubble < 3; bubble++) {
        ctx.strokeStyle = '#d9fbff';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(
          x + 8 + bubble * 13,
          e.y + 38 + ((bubble * 17 + t * 18) % 42),
          2 + bubble,
          0,
          Math.PI * 2,
        );
        ctx.stroke();
      }
      ctx.globalAlpha = 1;
    }
    if (x < -100 || x > WIDTH + 100) continue;
    ctx.save();
    // Raster enemies contain a small transparent foot margin. Sink grounded
    // artwork into the illustrated surface while keeping collision geometry
    // unchanged, so paws/feet visually meet the grass or platform edge.
    const contactDepth = nounFootInset(e.noun[0], 46) + 1.25,
      enemyFootOffset = airborne(e.behavior)
        ? 0
        : Math.max(0, contactDepth * (1 - Math.min(1, (e.baseY - e.y) / 28)));
    ctx.translate(x + e.w / 2, e.y + e.h + enemyFootOffset);
    if (e.skill === 'grow' && e.skillActive > 0) {
      const grow = 1 + Math.min(0.62, (e.skillActive / 0.45) * 0.62);
      ctx.scale(grow, grow);
    }
    if (e.dead) {
      ctx.globalAlpha = 1 - age / 0.45;
      ctx.rotate(age * 5);
      ctx.scale(1 + age * 0.7, Math.max(0.1, 1 - age * 2));
    } else {
      const stride = Math.sin(t * e.speed * 9 + e.phase);
      ctx.rotate(
        airborne(e.behavior)
          ? Math.sin(t * 3 + e.phase) * 0.09
          : stride * 0.035,
      );
      ctx.scale(
        1 + (e.behavior === 'hop' ? 0.04 : 0.018) * stride,
        1 - 0.035 * stride,
      );
    }
    if (e.behavior === 'roll' && !['Car', 'Train'].includes(e.noun[0])) {
      ctx.translate(0, -23);
      ctx.rotate(e.x / 28);
      ctx.translate(0, 23);
    }
    if (e.behavior === 'slither') ctx.rotate(Math.sin(t * 9 + e.phase) * 0.1);
    drawNounEnemy(ctx, e.noun[0], -25, -46, 50, 46, t + e.phase, e.vx);

    ctx.restore();
    if (!e.dead) {
      if (e.skillActive > 0 || e.skillWindup > 0) {
        const skillColor =
          e.skill === 'freeze'
            ? '#7ee9ff'
            : e.skill === 'gust'
              ? '#d9ffa4'
              : e.skill === 'snare'
                ? '#e7b5ff'
                : e.skill === 'grow'
                  ? '#ffd16f'
                  : '#ff9d75';
        ctx.globalAlpha =
          e.skillWindup > 0
            ? 0.42 + Math.sin(t * 18) * 0.25
            : 0.5 + Math.sin(t * 12) * 0.18;
        ctx.strokeStyle = skillColor;
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.ellipse(x + e.w / 2, e.y + e.h + 7, 27, 7, 0, 0, Math.PI * 2);
        ctx.stroke();
        ctx.globalAlpha = 1;
        text(
          `${e.skillWindup > 0 ? '!' : ''}${enemySkillLabel(e.noun[0])}${e.skillWindup > 0 ? '!' : ''}`,
          x + e.w / 2,
          e.y - 35,
          7,
          skillColor,
          'Arial',
        );
        text(
          `ĐIỂM YẾU: ${enemyCounterName(enemySkillCounter(e.noun[0], e.skill)).toUpperCase()}`,
          x + e.w / 2,
          e.y - 25,
          6,
          '#fff8c8',
          'Arial',
        );
        if (e.skillWindup > 0) {
          const windupRatio = Math.max(0, Math.min(1, e.skillWindup / 1.25));
          rect(x + 4, e.y - 20, e.w - 8, 3, '#243a31aa');
          rect(x + 4, e.y - 20, (e.w - 8) * windupRatio, 3, skillColor);
        }
      }
      if (e.slowUntil > g.time) {
        ctx.strokeStyle = '#64dff4';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.ellipse(
          x + e.w / 2,
          e.y + e.h + 5,
          21 + Math.sin(t * 5) * 3,
          5,
          0,
          0,
          Math.PI * 2,
        );
        ctx.stroke();
      }
      if (e.burnUntil > g.time) {
        ctx.fillStyle = '#ff7a3570';
        ctx.beginPath();
        ctx.arc(x + e.w / 2, e.y + 8, 9 + Math.sin(t * 11) * 2, 0, Math.PI * 2);
        ctx.fill();
        text('♨', x + e.w / 2, e.y + 12, 13, '#ffdb72', 'Arial');
      }
      if (e.rockHp < 3) {
        rect(x + 5, e.y - 28, 42, 8, '#1f2e25cc');
        for (let hit = 0; hit < 3; hit++)
          rect(
            x + 8 + hit * 12,
            e.y - 26,
            9,
            4,
            hit < e.rockHp ? '#f0c459' : '#593c2f88',
          );
      }
      // Vocabulary appears when encountered; the enemy itself is only the object.
      if (e.alert) {
        if (e.wakeTimer > 0) {
          ctx.fillStyle = '#fff2b8';
          ctx.beginPath();
          ctx.arc(
            x + e.w / 2,
            e.y - 13,
            13 + Math.sin(t * 14) * 2,
            0,
            Math.PI * 2,
          );
          ctx.fill();
          text('!', x + e.w / 2, e.y - 7, 18, '#b84f38', 'Arial');
        } else {
          text(
            e.warning > 0 ? e.noun[0] + ' !' : '!',
            x + e.w / 2,
            e.y - 9,
            e.warning > 0 ? 12 : 17,
            '#b84f38',
            'Arial',
          );
        }
      }
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
    const bossStage =
      b.hp <= Math.ceil(b.maxHp / 3)
        ? 3
        : b.hp <= Math.ceil((b.maxHp * 2) / 3)
          ? 2
          : 1;
    text(
      `GIAI ĐOẠN ${bossStage}/3`,
      bx + 43,
      b.y - 44,
      9,
      night ? '#ffe59a' : '#715239',
      'Arial',
    );
    text(
      BOSS_PATTERN_NAMES[Math.min(5, Math.floor(g.level / 5))],
      bx + 43,
      b.y - 55,
      8,
      night ? '#bcecff' : '#587c66',
      'Arial',
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
  for (const shot of g.shots) {
    const x = shot.x - cam;
    ctx.save();
    ctx.shadowColor = '#fff6dc';
    ctx.shadowBlur = 5;
    ctx.font = 'bold 13px Arial';
    ctx.textAlign = 'center';
    ctx.lineWidth = 3;
    ctx.strokeStyle =
      shot.effect === 'freeze'
        ? '#d8fbff'
        : shot.effect === 'gust'
          ? '#efffd2'
          : shot.effect === 'snare'
            ? '#f1d6ff'
            : '#fff2cc';
    ctx.strokeText(shot.noun[0], x + shot.w / 2, shot.y + 15);
    ctx.fillStyle =
      shot.effect === 'freeze'
        ? '#2789b8'
        : shot.effect === 'gust'
          ? '#4c843e'
          : shot.effect === 'snare'
            ? '#75519a'
            : '#9d392d';
    ctx.fillText(shot.noun[0], x + shot.w / 2, shot.y + 15);
    ctx.restore();
  }
  for (const rock of g.earthShots) {
    const x = rock.x - cam + rock.w / 2;
    const size = rock.hero === 'mon' ? 11.25 : 23;
    if (
      !(rock.hero === 'mon'
        ? drawEarthRock(ctx, x, rock.y + rock.h / 2, size, rock.spin)
        : drawElementProjectile(
            ctx,
            rock.hero,
            x,
            rock.y + rock.h / 2,
            size,
            rock.spin,
          ))
    ) {
      ctx.fillStyle = '#9b6a36';
      ctx.beginPath();
      ctx.arc(x, rock.y + rock.h / 2, 5.5, 0, Math.PI * 2);
      ctx.fill();
    }
  }
  const exit = g.worldWidth - 90;
  rect(exit - cam, 410, 12, 140, '#537853');
  rect(exit - cam, 410, 65, 12, '#537853');
  const remaining = g.enemies.filter((e) => !e.dead);
  text(
    remaining.length || b.hp > 0 ? '🔒' : '✦',
    exit + 34 - cam,
    454,
    28,
    '#d5ac40',
  );
  if (g.mode === 'playing') {
    rect(WIDTH / 2 - 73, 76, 146, 22, '#173126bd');
    text(
      `ĐÃ HẠ ${g.enemies.length - remaining.length}/${g.enemies.length}`,
      WIDTH / 2,
      91,
      12,
      '#fff7ce',
      'Arial',
    );
    if (b.hp === 0 && remaining.length) {
      const nearest = [...remaining].sort(
        (a, b) => Math.abs(a.x - g.player.x) - Math.abs(b.x - g.player.x),
      )[0];
      text(
        `${nearest.x < g.player.x ? '←' : '→'} Còn ${remaining.length} enemy · ${nearest.noun[0]}`,
        WIDTH / 2,
        113,
        14,
        night ? '#fff1c1' : '#694831',
        'Arial',
      );
    }
    const missedObjective = wendyMissedObjective(g);
    if (missedObjective) {
      const targetScreenX = missedObjective.x - cam;
      if (targetScreenX < -20 || targetScreenX > WIDTH + 20) {
        const pointsLeft = targetScreenX < 0,
          markerX = pointsLeft ? 13 : WIDTH - 13,
          markerY = 168;
        ctx.save();
        ctx.fillStyle = '#173126e8';
        ctx.strokeStyle = '#f4cf5f';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.roundRect(pointsLeft ? 3 : WIDTH - 83, markerY - 18, 80, 36, 10);
        ctx.fill();
        ctx.stroke();
        text(
          pointsLeft ? '‹' : '›',
          markerX,
          markerY + 7,
          25,
          '#fff2a6',
          'Arial',
        );
        text(
          missedObjective.label,
          pointsLeft ? 46 : WIDTH - 46,
          markerY + 4,
          9,
          '#fff7d5',
          'Arial',
        );
        ctx.restore();
      }
    }
  }
  const p = g.player,
    px = p.x - cam,
    heroVisualSize =
      g.hero === 'rio'
        ? 104
        : g.hero === 'sol'
          ? 44
          : g.hero === 'mori'
            ? 64
            : 72,
    wendySize = 36,
    wendyX = Math.max(
      wendySize / 2 + 4,
      Math.min(WIDTH - wendySize / 2 - 4, g.wendyX),
    ),
    wendyY = g.wendyY + Math.sin(t * 2.6) * 4;
  if (g.slipperyUntil > g.time)
    text('❄ ĐƯỜNG TRƠN', px + 21, p.y - 34, 10, '#d9fbff', 'Arial');
  else if (g.slowedUntil > g.time)
    text('TRÓI CHẬM', px + 21, p.y - 34, 10, '#f1d6ff', 'Arial');
  drawWendy(
    ctx,
    wendyX,
    wendyY,
    wendySize,
    t,
    g.mode === 'playing' && g.time < g.wendyMessageUntil,
  );
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
    // The source character sprites have transparent pixels below their feet.
    // Apply the correction only while grounded so jump height remains honest.
    const heroFootOffset = p.grounded
      ? g.hero === 'mon'
        ? 8.25
        : g.hero === 'sol'
          ? 0.7
          : 0
      : 0;
    ctx.translate(px + 21, p.y + p.h - bob + heroFootOffset);
    ctx.rotate(
      p.grounded ? Math.sin(p.stride) * 0.045 * run : (p.vx / 240) * 0.09,
    );
    ctx.scale(sx * p.facing, sy);
    if (g.hero === 'mon') {
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
    } else {
      drawCharacterArt(ctx, g.hero, heroVisualSize, animationTime, {
        speed: p.vx,
        grounded: p.grounded,
        vy: p.vy,
        hurt: p.invincible,
        speaking,
      });
    }
    ctx.restore();
  }
  ctx.globalAlpha = 1;
  if (g.mode === 'playing' && g.doubleJumpUnlocked) {
    const label = g.doubleJumpReady
      ? '✦ NHẢY ĐÔI SẴN SÀNG'
      : '✦ CHẠM BỆ ĐỂ NẠP';
    ctx.save();
    ctx.fillStyle = g.doubleJumpReady ? '#173d30dc' : '#26342ed0';
    ctx.beginPath();
    ctx.roundRect(WIDTH / 2 - 80, 14, 160, 30, 15);
    ctx.fill();
    text(label, WIDTH / 2, 34, 10, '#fff3a8', 'Arial');
    ctx.restore();
  }
  if (g.mode === 'playing' && g.time < g.wendyMessageUntil) {
    const words = `Wendy: “${g.wendyMessage}”`.split(' '),
      lines: string[] = [];
    let line = '';
    for (const word of words) {
      const next = line ? `${line} ${word}` : word;
      if (next.length > 30 && line) {
        lines.push(line);
        line = word;
      } else line = next;
    }
    if (line) lines.push(line);
    const visibleLines = lines.slice(0, 3),
      subtitleHeight = 26 + visibleLines.length * 16,
      subtitleX = 10,
      subtitleY = 62,
      subtitleWidth = 282;
    ctx.save();
    ctx.fillStyle = '#17251ee8';
    ctx.strokeStyle = '#f4cf5f';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.roundRect(subtitleX, subtitleY, subtitleWidth, subtitleHeight, 10);
    ctx.fill();
    ctx.stroke();
    visibleLines.forEach((messageLine, index) =>
      text(
        messageLine,
        subtitleX + subtitleWidth / 2,
        subtitleY + 21 + index * 16,
        12,
        '#fff4bf',
        'Arial',
      ),
    );
    ctx.restore();
  }
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
  if (p.x > g.worldWidth - 650 && g.mode === 'playing' && b.hp > 0)
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
