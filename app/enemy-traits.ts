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
type EnemySkillProfile = readonly [skill: EnemySkill, label: string];
export type EnemySkillPhysics = {
  power: number;
  duration: number;
  cooldown: number;
  variant: 0 | 1 | 2;
};
export type EnemyCounter = 'mon' | 'mori' | 'rio' | 'sol';
const skillProfiles: Record<string, EnemySkillProfile> = {
  Apple: ['grow', 'TÁO KHỔNG LỒ'],
  Ant: ['charge', 'ĐÀN KIẾN XUNG PHONG'],
  Alligator: ['charge', 'CÚ NGOẠM ĐẦM LẦY'],
  Ball: ['charge', 'BÓNG LĂN SIÊU TỐC'],
  Bee: ['gust', 'CÁNH ONG LỐC XOÁY'],
  Butterfly: ['gust', 'BỤI CÁNH BƯỚM'],
  Cat: ['charge', 'MÈO VỒ CHỚP NHOÁNG'],
  Car: ['charge', 'Ô TÔ TĂNG TỐC'],
  Crab: ['snare', 'CÀNG CUA KẸP CHẬM'],
  Dog: ['charge', 'CHÓ RƯỢT ĐUỔI'],
  Duck: ['gust', 'VỊT VỖ CÁNH NƯỚC'],
  Dinosaur: ['grow', 'KHỦNG LONG KHỔNG LỒ'],
  Elephant: ['grow', 'VOI DẬM ĐẤT'],
  Egg: ['grow', 'TRỨNG NỞ BẤT NGỜ'],
  Eagle: ['gust', 'ĐẠI BÀNG BỔ NHÀO'],
  Fish: ['snare', 'CÁ QUẤT SÓNG'],
  Frog: ['leap', 'ẾCH NHẢY VỌT'],
  Fox: ['charge', 'CÁO LAO LẮT LÉO'],
  Grapes: ['grow', 'CHÙM NHO PHÌNH TO'],
  Goat: ['charge', 'DÊ HÚC SƯỜN ĐỒI'],
  Giraffe: ['grow', 'HƯƠU CAO VƯƠN CỔ'],
  Hat: ['gust', 'MŨ XOAY GIÓ'],
  Horse: ['charge', 'NGỰA PHI NƯỚC ĐẠI'],
  Helicopter: ['gust', 'TRỰC THĂNG QUẠT GIÓ'],
  'Ice cream': ['freeze', 'KEM ĐÔNG LẠNH'],
  Igloo: ['freeze', 'NHÀ TUYẾT BĂNG GIÁ'],
  Insect: ['charge', 'CÔN TRÙNG BÒ NHANH'],
  Juice: ['snare', 'NƯỚC ÉP SÓNG SÁNH'],
  Jellyfish: ['snare', 'SỨA PHÓNG XÚC TU'],
  Jacket: ['gust', 'ÁO KHOÁC CUỐN GIÓ'],
  Kite: ['gust', 'DIỀU GIẬT DÂY'],
  Key: ['charge', 'CHÌA KHÓA XOAY TÍT'],
  Kangaroo: ['leap', 'CHUỘT TÚI BẬT XA'],
  Lion: ['charge', 'SƯ TỬ VỒ MỒI'],
  Lemon: ['grow', 'CHANH CHUA PHÌNH TO'],
  Ladybug: ['charge', 'BỌ RÙA LƯỚT NHANH'],
  Moon: ['gust', 'TRĂNG KÉO THỦY TRIỀU'],
  Monkey: ['leap', 'KHỈ NHẢY CHUYỀN CÀNH'],
  Mushroom: ['grow', 'NẤM MỌC KHỔNG LỒ'],
  Nest: ['snare', 'TỔ CHIM GIĂNG CÀNH'],
  Nose: ['gust', 'MŨI HẮT HƠI'],
  Nut: ['grow', 'HẠT NẢY MẦM LỚN'],
  Orange: ['grow', 'CAM TRÒN KHỔNG LỒ'],
  Octopus: ['snare', 'BẠCH TUỘC QUẤN CHẶT'],
  Owl: ['gust', 'CÚ MÈO LẶN ĐÊM'],
  Penguin: ['freeze', 'CÁNH CỤT ĐÓNG BĂNG'],
  Panda: ['charge', 'GẤU TRÚC LĂN TRÒN'],
  Pineapple: ['grow', 'DỨA GAI KHỔNG LỒ'],
  Queen: ['charge', 'NỮ HOÀNG RA LỆNH'],
  Quail: ['gust', 'CHIM CÚT BAY VỤT'],
  Quilt: ['snare', 'CHĂN BÔNG TRÙM KÍN'],
  Rabbit: ['leap', 'THỎ BẬT TAI DÀI'],
  Rocket: ['gust', 'TÊN LỬA PHỤT KHÓI'],
  Robot: ['charge', 'ROBOT TĂNG TỐC'],
  Sun: ['gust', 'MẶT TRỜI THỔI NÓNG'],
  Snake: ['snare', 'RẮN CUỘN SIẾT'],
  Strawberry: ['grow', 'DÂU TÂY PHÌNH TO'],
  Turtle: ['charge', 'RÙA XOAY MAI'],
  Tiger: ['charge', 'HỔ VỒ TỐC ĐỘ'],
  Train: ['charge', 'TÀU HỎA LAO ĐƯỜNG RAY'],
  Umbrella: ['gust', 'Ô BẬT GIÓ NGƯỢC'],
  Unicorn: ['charge', 'KỲ LÂN HÚC SÁNG'],
  Urn: ['snare', 'BÌNH LỚN HÚT GIÓ'],
  Violin: ['snare', 'VĨ CẦM GIỮ NHỊP'],
  Volcano: ['gust', 'NÚI LỬA PHUN TRÀO'],
  Vase: ['snare', 'BÌNH HOA QUẤN DÂY'],
  Whale: ['grow', 'CÁ VOI TẠO SÓNG LỚN'],
  Watermelon: ['charge', 'DƯA HẤU LĂN ẦM ẦM'],
  Wolf: ['charge', 'SÓI SĂN THEO DẤU'],
  Xylophone: ['snare', 'ĐÀN GỖ GIỮ NHỊP'],
  'X-ray': ['freeze', 'TIA X-QUANG ĐÓNG KHUNG'],
  'X-ray fish': ['snare', 'CÁ THỦY TINH PHÓNG SÓNG'],
  'Yo-yo': ['charge', 'YO-YO BẬT NGƯỢC'],
  Yak: ['charge', 'BÒ TÂY TẠNG HÚC TUYẾT'],
  Yarn: ['snare', 'SỢI LEN QUẤN CHÂN'],
  Zebra: ['charge', 'NGỰA VẰN PHI NHANH'],
  Zipper: ['snare', 'KHÓA KÉO KHÓA CHÂN'],
  Zucchini: ['grow', 'BÍ NGÒI DÀI KHỔNG LỒ'],
};
function skillProfile(word: string) {
  const profile = skillProfiles[word];
  if (!profile) throw new Error('Missing enemy skill: ' + word);
  return profile;
}
export function enemySkill(word: string): EnemySkill {
  return skillProfile(word)[0];
}
export function enemySkillLabel(word: string) {
  return skillProfile(word)[1];
}
export function enemySkillPhysics(word: string): EnemySkillPhysics {
  const words = Object.keys(skillProfiles),
    index = words.indexOf(word);
  if (index < 0) throw new Error('Missing enemy skill physics: ' + word);
  return {
    power: 0.88 + (index % 7) * 0.07,
    duration: 0.9 + (index % 5) * 0.14,
    cooldown: 5.8 + (index % 4) * 0.45,
    variant: (index % 3) as 0 | 1 | 2,
  };
}
export function enemySkillCounter(
  word: string,
  skill = enemySkill(word),
): EnemyCounter {
  if (['Sun', 'Volcano', 'Rocket'].includes(word)) return 'rio';
  if (['Yarn', 'Nest', 'Quilt', 'Jacket', 'Mushroom'].includes(word))
    return 'sol';
  if (['Whale', 'Fish', 'Duck', 'Juice', 'Jellyfish'].includes(word))
    return 'mori';
  const counters: Record<EnemySkill, EnemyCounter> = {
    grow: 'mori',
    freeze: 'sol',
    charge: 'mon',
    leap: 'rio',
    gust: 'mori',
    snare: 'sol',
  };
  return counters[skill];
}
export function enemyCounterName(counter: EnemyCounter) {
  return { mon: 'Mon', mori: 'Mori', rio: 'Rio', sol: 'Sol' }[counter];
}
export function enemySkillHint(word: string, skill: EnemySkill) {
  const label = enemySkillLabel(word).toLocaleLowerCase('vi'),
    counter = enemyCounterName(enemySkillCounter(word, skill));
  return {
    grow: `${word} dùng ${label}—giữ khoảng cách! ${counter} có thể phá chiêu.`,
    freeze: `${word} dùng ${label}—đường sẽ trượt! ${counter} có thể phá băng.`,
    charge: `${word} dùng ${label}—nhảy qua đầu! ${counter} có thể chặn lại.`,
    leap: `${word} dùng ${label}—đừng đứng yên! ${counter} có thể hạ nó.`,
    gust: `${word} dùng ${label}—né chữ xanh! ${counter} có thể chắn gió.`,
    snare: `${word} dùng ${label}—né chữ tím! ${counter} có thể phá trói.`,
  }[skill];
}
export function airborne(motion: EnemyMotion) {
  return motion === 'fly' || motion === 'swim' || motion === 'hover';
}
