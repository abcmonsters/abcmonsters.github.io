export type EnemyMotion =
  | 'walk'
  | 'hop'
  | 'fly'
  | 'swim'
  | 'drop'
  | 'roll'
  | 'slither'
  | 'hover'
  | 'guard';
export type EnemyHabitat = 'land' | 'water' | 'sky' | 'flex';
export type EnemySkill =
  | 'grow'
  | 'freeze'
  | 'charge'
  | 'leap'
  | 'gust'
  | 'snare';
const groups: Record<EnemyMotion, string[]> = {
  walk: [
    'Ant',
    'Alligator',
    'Cat',
    'Crab',
    'Dog',
    'Dinosaur',
    'Elephant',
    'Fox',
    'Goat',
    'Giraffe',
    'Horse',
    'Insect',
    'Lion',
    'Ladybug',
    'Monkey',
    'Penguin',
    'Panda',
    'Queen',
    'Robot',
    'Tiger',
    'Turtle',
    'Unicorn',
    'Wolf',
    'Yak',
    'Zebra',
  ],
  hop: ['Frog', 'Kangaroo', 'Rabbit'],
  fly: [
    'Bee',
    'Butterfly',
    'Duck',
    'Eagle',
    'Helicopter',
    'Kite',
    'Owl',
    'Quail',
    'Rocket',
  ],
  swim: ['Fish', 'Jellyfish', 'Octopus', 'Whale', 'X-ray fish'],
  drop: [
    'Apple',
    'Egg',
    'Grapes',
    'Lemon',
    'Nut',
    'Orange',
    'Pineapple',
    'Strawberry',
    'Zucchini',
  ],
  roll: ['Ball', 'Car', 'Train', 'Watermelon', 'Yo-yo', 'Yarn'],
  slither: ['Snake'],
  hover: ['Hat', 'Jacket', 'Moon', 'Sun', 'Umbrella'],
  guard: [
    'Ice cream',
    'Igloo',
    'Juice',
    'Key',
    'Mushroom',
    'Nest',
    'Nose',
    'Quilt',
    'Urn',
    'Violin',
    'Volcano',
    'Vase',
    'Xylophone',
    'X-ray',
    'Zipper',
  ],
};
export function enemyMotion(word: string): EnemyMotion {
  const match = (Object.entries(groups) as [EnemyMotion, string[]][]).find(
    ([, words]) => words.includes(word),
  );
  if (!match) throw new Error('Missing enemy motion: ' + word);
  return match[0];
}
export function enemyHabitat(word: string): EnemyHabitat {
  const motion = enemyMotion(word);
  if (motion === 'swim') return 'water';
  if (motion === 'fly') return 'sky';
  if (motion === 'walk' || motion === 'hop' || motion === 'slither')
    return 'land';
  return 'flex';
}
export function enemyPace(word: string) {
  return ['Turtle', 'Elephant', 'Penguin'].includes(word)
    ? 0.65
    : ['Cat', 'Fox', 'Wolf', 'Horse', 'Ant'].includes(word)
      ? 1.15
      : 1;
}
export function enemySkill(word: string): EnemySkill {
  if (['Penguin', 'Ice cream', 'Igloo'].includes(word)) return 'freeze';
  const motion = enemyMotion(word);
  if (motion === 'drop' || ['Elephant', 'Dinosaur', 'Whale'].includes(word))
    return 'grow';
  if (motion === 'hop') return 'leap';
  if (motion === 'fly' || motion === 'hover') return 'gust';
  if (motion === 'swim' || ['Snake', 'Yarn', 'Quilt', 'Zipper'].includes(word))
    return 'snare';
  return 'charge';
}
export function enemySkillLabel(skill: EnemySkill) {
  return {
    grow: 'HÓA KHỔNG LỒ',
    freeze: 'ĐÓNG BĂNG',
    charge: 'LAO TỚI',
    leap: 'NHẢY VỌT',
    gust: 'GIÓ ĐẨY',
    snare: 'TRÓI CHẬM',
  }[skill];
}
export function enemySkillHint(word: string, skill: EnemySkill) {
  return {
    grow: `${word} sắp hóa khổng lồ—giữ khoảng cách rồi nhảy lên!`,
    freeze: `${word} làm đường đóng băng—đổi hướng sẽ bị trượt!`,
    charge: `${word} sắp lao nhanh—hãy nhảy qua đầu!`,
    leap: `${word} có thể nhảy rất cao—đừng đứng yên!`,
    gust: `${word} tạo gió đẩy—né chữ đang bay tới!`,
    snare: `${word} làm cậu chậm lại—né chữ màu tím nhé!`,
  }[skill];
}
export function airborne(motion: EnemyMotion) {
  return motion === 'fly' || motion === 'swim' || motion === 'hover';
}
