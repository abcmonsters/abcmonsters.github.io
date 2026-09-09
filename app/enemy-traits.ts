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
export function airborne(motion: EnemyMotion) {
  return motion === 'fly' || motion === 'swim' || motion === 'hover';
}
