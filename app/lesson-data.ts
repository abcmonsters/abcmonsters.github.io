export type Noun = readonly [word: string, meaning: string, icon: string];
export const VOCABULARY: readonly (readonly Noun[])[] = [
  [
    ['Apple', 'Quả táo', '🍎'],
    ['Ant', 'Con kiến', '🐜'],
    ['Alligator', 'Cá sấu Mỹ', '🐊'],
  ],
  [
    ['Ball', 'Quả bóng', '⚽'],
    ['Bee', 'Con ong', '🐝'],
    ['Butterfly', 'Bướm', '🦋'],
  ],
  [
    ['Cat', 'Con mèo', '🐱'],
    ['Car', 'Ô tô', '🚗'],
    ['Crab', 'Con cua', '🦀'],
  ],
  [
    ['Dog', 'Con chó', '🐶'],
    ['Duck', 'Con vịt', '🦆'],
    ['Dinosaur', 'Khủng long', '🦕'],
  ],
  [
    ['Elephant', 'Con voi', '🐘'],
    ['Egg', 'Quả trứng', '🥚'],
    ['Eagle', 'Đại bàng', '🦅'],
  ],
  [
    ['Fish', 'Con cá', '🐟'],
    ['Frog', 'Con ếch', '🐸'],
    ['Fox', 'Cáo', '🦊'],
  ],
  [
    ['Grapes', 'Nho', '🍇'],
    ['Goat', 'Con dê', '🐐'],
    ['Giraffe', 'Hươu cao cổ', '🦒'],
  ],
  [
    ['Hat', 'Cái mũ', '🎩'],
    ['Horse', 'Con ngựa', '🐴'],
    ['Helicopter', 'Trực thăng', '🚁'],
  ],
  [
    ['Ice cream', 'Kem', '🍦'],
    ['Igloo', 'Nhà tuyết', '🧊'],
    ['Insect', 'Côn trùng', '🐞'],
  ],
  [
    ['Juice', 'Nước ép', '🧃'],
    ['Jellyfish', 'Sứa', '🪼'],
    ['Jacket', 'Áo khoác', '🧥'],
  ],
  [
    ['Kite', 'Cái diều', '🪁'],
    ['Key', 'Chìa khóa', '🔑'],
    ['Kangaroo', 'Chuột túi', '🦘'],
  ],
  [
    ['Lion', 'Sư tử', '🦁'],
    ['Lemon', 'Quả chanh vàng', '🍋'],
    ['Ladybug', 'Bọ rùa', '🐞'],
  ],
  [
    ['Moon', 'Mặt trăng', '🌙'],
    ['Monkey', 'Con khỉ', '🐒'],
    ['Mushroom', 'Nấm', '🍄'],
  ],
  [
    ['Nest', 'Tổ chim', '🪺'],
    ['Nose', 'Mũi', '👃'],
    ['Nut', 'Hạt', '🌰'],
  ],
  [
    ['Orange', 'Quả cam', '🍊'],
    ['Octopus', 'Bạch tuộc', '🐙'],
    ['Owl', 'Cú mèo', '🦉'],
  ],
  [
    ['Penguin', 'Chim cánh cụt', '🐧'],
    ['Panda', 'Gấu trúc', '🐼'],
    ['Pineapple', 'Quả dứa', '🍍'],
  ],
  [
    ['Queen', 'Nữ hoàng', '👑'],
    ['Quail', 'Chim cút', '🐦'],
    ['Quilt', 'Chăn bông', '🛏️'],
  ],
  [
    ['Rabbit', 'Con thỏ', '🐰'],
    ['Rocket', 'Tên lửa', '🚀'],
    ['Robot', 'Người máy', '🤖'],
  ],
  [
    ['Sun', 'Mặt trời', '☀️'],
    ['Snake', 'Con rắn', '🐍'],
    ['Strawberry', 'Dâu tây', '🍓'],
  ],
  [
    ['Turtle', 'Rùa', '🐢'],
    ['Tiger', 'Con hổ', '🐯'],
    ['Train', 'Tàu hỏa', '🚂'],
  ],
  [
    ['Umbrella', 'Cái ô', '☂️'],
    ['Unicorn', 'Kỳ lân', '🦄'],
    ['Urn', 'Bình lớn', '🏺'],
  ],
  [
    ['Violin', 'Đàn vĩ cầm', '🎻'],
    ['Volcano', 'Núi lửa', '🌋'],
    ['Vase', 'Bình hoa', '🏺'],
  ],
  [
    ['Whale', 'Cá voi', '🐳'],
    ['Watermelon', 'Dưa hấu', '🍉'],
    ['Wolf', 'Chó sói', '🐺'],
  ],
  [
    ['Xylophone', 'Đàn phiến gỗ', '🎵'],
    ['X-ray', 'Ảnh X-quang', '🩻'],
    ['X-ray fish', 'Cá thủy tinh', '🐟'],
  ],
  [
    ['Yo-yo', 'Con quay yo-yo', '🪀'],
    ['Yak', 'Bò Tây Tạng', '🐂'],
    ['Yarn', 'Sợi len', '🧶'],
  ],
  [
    ['Zebra', 'Ngựa vằn', '🦓'],
    ['Zipper', 'Khóa kéo', '🤐'],
    ['Zucchini', 'Bí ngòi', '🥒'],
  ],
];
export const WORDS = VOCABULARY.map((words) => words[0]);
export const SCENES = [
  ['Phố cổ Hà Nội', 'city'],
  ['Làng gốm Bát Tràng', 'garden'],
  ['Ruộng bậc thang Mù Cang Chải', 'mountain'],
  ['Phố đèn lồng Hội An', 'city'],
  ['Chợ nổi Cái Răng', 'water'],
  ['Vịnh Hạ Long', 'water'],
  ['Hoàng thành Huế', 'castle'],
  ['Đồi chè Mộc Châu', 'mountain'],
  ['Làng sen xứ Nghệ', 'garden'],
  ['Bến Tre xanh', 'water'],
  ['Nhà rông Tây Nguyên', 'savanna'],
  ['Tràng An mùa lúa', 'mountain'],
  ['Hà Nội đêm trăng', 'night'],
  ['Bát Tràng mùa hội', 'garden'],
  ['Mù Cang Chải mùa vàng', 'mountain'],
  ['Hội An đêm rằm', 'night'],
  ['Cái Răng bình minh', 'water'],
  ['Hạ Long hoàng hôn', 'water'],
  ['Huế bên sông Hương', 'castle'],
  ['Mộc Châu mùa hoa', 'garden'],
  ['Làng sen mùa hạ', 'garden'],
  ['Bến Tre mùa nước', 'water'],
  ['Tây Nguyên nắng vàng', 'savanna'],
  ['Tràng An sương sớm', 'mountain'],
  ['Đường tre làng Việt', 'forest'],
  ['Hội làng Việt Nam', 'garden'],
] as const;
export const PALETTES: Record<
  string,
  {
    sky: string;
    light: string;
    far: string;
    tree: string;
    grass: string;
    soil: string;
  }
> = {
  forest: {
    sky: '#b6dfce',
    light: '#e4efbb',
    far: '#8ebe9c',
    tree: '#5c9a6b',
    grass: '#90bd53',
    soil: '#a47d52',
  },
  garden: {
    sky: '#bbdeec',
    light: '#f9e8d5',
    far: '#c3d8ac',
    tree: '#eaa5bc',
    grass: '#a6c967',
    soil: '#b88a65',
  },
  city: {
    sky: '#b7d8ed',
    light: '#eddfb9',
    far: '#91afbb',
    tree: '#567c94',
    grass: '#e4cc74',
    soil: '#738491',
  },
  jungle: {
    sky: '#a8d6b8',
    light: '#dcebc0',
    far: '#74ad80',
    tree: '#347751',
    grass: '#87bd49',
    soil: '#94724a',
  },
  mountain: {
    sky: '#b9dcec',
    light: '#f6edce',
    far: '#a5bcc5',
    tree: '#7e96ab',
    grass: '#bdd298',
    soil: '#8e9696',
  },
  water: {
    sky: '#96d9ea',
    light: '#d1f0e7',
    far: '#65b8c7',
    tree: '#4298aa',
    grass: '#ebdca0',
    soil: '#ad9670',
  },
  savanna: {
    sky: '#e6dab1',
    light: '#f9e8bc',
    far: '#c6c18b',
    tree: '#80934f',
    grass: '#d8c266',
    soil: '#b79455',
  },
  snow: {
    sky: '#bcdde9',
    light: '#ecf7f4',
    far: '#96c4d2',
    tree: '#78aabb',
    grass: '#f3fcf7',
    soil: '#8eabb9',
  },
  sky: {
    sky: '#c6c4ec',
    light: '#f7dce5',
    far: '#b8afd8',
    tree: '#a88fc4',
    grass: '#e3d4f6',
    soil: '#a093bd',
  },
  night: {
    sky: '#263d5a',
    light: '#638282',
    far: '#3d6370',
    tree: '#30565f',
    grass: '#839f75',
    soil: '#697864',
  },
  castle: {
    sky: '#d4c8e8',
    light: '#f4e1dc',
    far: '#b6a4c4',
    tree: '#8f799e',
    grass: '#e5bbca',
    soil: '#a594ad',
  },
  space: {
    sky: '#1d274b',
    light: '#565280',
    far: '#464675',
    tree: '#6e65a1',
    grass: '#bbacd6',
    soil: '#76658f',
  },
  desert: {
    sky: '#edc5a1',
    light: '#f7e7b6',
    far: '#ddbb80',
    tree: '#bb934f',
    grass: '#edd28a',
    soil: '#c69d58',
  },
  volcano: {
    sky: '#533c58',
    light: '#da8870',
    far: '#805767',
    tree: '#704951',
    grass: '#e7a368',
    soil: '#745a62',
  },
  crystal: {
    sky: '#363b65',
    light: '#8ba7c0',
    far: '#53608e',
    tree: '#8186bc',
    grass: '#addfd8',
    soil: '#7f85a7',
  },
};
export const WORLDS = SCENES.map(([name, kind], level) => ({
  name,
  title: name,
  kind,
  ...PALETTES[kind],
  level,
}));

export const VIET_FOODS = [
  ['Phở', '🍜'],
  ['Bánh mì', '🥖'],
  ['Bánh chưng', '🟩'],
  ['Gỏi cuốn', '🥬'],
  ['Bún bò Huế', '🍜'],
  ['Bánh xèo', '🥟'],
] as const;
