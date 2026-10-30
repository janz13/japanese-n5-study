export type Exercise =
  | { type: 'mcq'; prompt: string; en: string; options: string[]; answer: number }
  | { type: 'order'; en: string; tokens: string[] }; // tokens in correct order

export interface GrammarPoint {
  pattern: string;
  meaning: string;
  explain: string;
  examples: { jp: string; en: string }[];
}

export interface Lesson {
  id: string;
  /** Story chapter this lesson unlocks. */
  chapter: number;
  title: string;
  points: GrammarPoint[];
  exercises: Exercise[];
}

export const LESSONS: Lesson[] = [
  {
    id: 'g1',
    chapter: 1,
    title: 'Introducing yourself',
    points: [
      {
        pattern: 'A は B です',
        meaning: 'A is B',
        explain: 'は (read "wa") marks the topic. です makes the sentence polite. Negative: じゃないです / ではありません.',
        examples: [
          { jp: 'わたしは アナです。', en: 'I am Ana.' },
          { jp: 'これは ほんです。', en: 'This is a book.' },
        ],
      },
      {
        pattern: '〜から',
        meaning: 'from (place / time)',
        explain: 'Placed after a noun to show the starting point.',
        examples: [{ jp: 'アメリカから 来ました。', en: 'I came from America.' }],
      },
      {
        pattern: '〜に 着きます / 乗ります',
        meaning: 'arrive at / get on',
        explain: 'に marks the destination or the thing you get onto.',
        examples: [
          { jp: '東京に 着きました。', en: 'I arrived in Tokyo.' },
          { jp: '電車に 乗ります。', en: 'I ride the train.' },
        ],
      },
      {
        pattern: '〜ました / 〜でした',
        meaning: 'polite past',
        explain: 'Verb ます → ました. です → でした.',
        examples: [
          { jp: 'きれいでした。', en: 'It was pretty.' },
          { jp: '見ました。', en: 'I saw (it).' },
        ],
      },
    ],
    exercises: [
      { type: 'mcq', prompt: 'わたし（　）がくせいです。', en: 'I am a student.', options: ['は', 'を', 'に'], answer: 0 },
      { type: 'mcq', prompt: 'にほん（　）来ました。', en: 'I came from Japan.', options: ['に', 'から', 'を'], answer: 1 },
      { type: 'mcq', prompt: 'えきに（　）。', en: 'I arrived at the station.', options: ['着きます', '着きました', '着きません'], answer: 1 },
      { type: 'mcq', prompt: 'やまは きれい（　）。', en: 'The mountain was pretty.', options: ['です', 'でした', 'ました'], answer: 1 },
      { type: 'order', en: 'I came from America.', tokens: ['アメリカ', 'から', '来ました'] },
      { type: 'order', en: 'I rode the train.', tokens: ['電車', 'に', '乗りました'] },
    ],
  },
  {
    id: 'g2',
    chapter: 2,
    title: 'Ordering & shopping',
    points: [
      {
        pattern: 'N を ください',
        meaning: 'Please give me N',
        explain: 'を marks the object. ください is a polite request.',
        examples: [{ jp: 'みずを ください。', en: 'Water, please.' }],
      },
      {
        pattern: 'N を 一つ / 二つ',
        meaning: 'counting things',
        explain: 'Generic counter: 一つ ひとつ, 二つ ふたつ, 三つ みっつ. Goes after を.',
        examples: [{ jp: 'りんごを 二つ ください。', en: 'Two apples, please.' }],
      },
      {
        pattern: 'A ですが、B',
        meaning: 'A, but B',
        explain: 'が after a clause means "but".',
        examples: [{ jp: '高いですが、おいしいです。', en: "It's expensive, but tasty." }],
      },
      {
        pattern: 'いくらですか',
        meaning: 'How much is it?',
        explain: 'Price: 百 ひゃく, 三百 さんびゃく, 千 せん, 円 えん.',
        examples: [{ jp: 'これは いくらですか。', en: 'How much is this?' }],
      },
    ],
    exercises: [
      { type: 'mcq', prompt: 'コーヒー（　）ください。', en: 'Coffee, please.', options: ['は', 'を', 'が'], answer: 1 },
      { type: 'mcq', prompt: 'ケーキを（　）ください。', en: 'One cake, please.', options: ['一つ', '一人', '一回'], answer: 0 },
      { type: 'mcq', prompt: 'やすいです（　）、おいしくないです。', en: "It's cheap, but not tasty.", options: ['から', 'が', 'を'], answer: 1 },
      { type: 'mcq', prompt: '300円 is read…', en: '300 yen', options: ['さんひゃくえん', 'さんびゃくえん', 'さんぴゃくえん'], answer: 1 },
      { type: 'order', en: 'One coffee, please.', tokens: ['コーヒー', 'を', '一つ', 'ください'] },
      { type: 'order', en: 'How much is this?', tokens: ['これは', 'いくら', 'ですか'] },
    ],
  },
];
