export type Exercise =
  | { type: 'mcq'; prompt: string; en: string; options: string[]; answer: number }
  | { type: 'order'; en: string; tokens: string[] }; // tokens in correct order

export interface GrammarPoint {
  pattern: string;
  meaning: string;
  explain: string;
  /** `audio` = optional kana override for TTS when kanji readings are ambiguous (e.g. 三階). */
  examples: { jp: string; en: string; audio?: string }[];
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
  {
    id: 'g3',
    chapter: 3,
    title: 'Existence & connecting actions',
    points: [
      {
        pattern: 'N が あります / います',
        meaning: 'There is / are N',
        explain: 'Use あります for inanimate objects (gates, buildings) and います for living beings (people, animals).',
        examples: [
          { jp: '駅の 前に 門が あります。', en: 'There is a gate in front of the station.' },
          { jp: '人が たくさん いました。', en: 'There were many people.' },
        ],
      },
      {
        pattern: 'V-て、V-ます',
        meaning: 'do A, and then do B',
        explain: 'Connect actions in sequence using the て-form (撮ります → 撮って).',
        examples: [{ jp: '写真を 撮って、おかしを 食べました。', en: 'We took photos and ate sweets.' }],
      },
      {
        pattern: 'い-adj past: 〜かったです',
        meaning: 'was [adjective]',
        explain: 'Drop final い and add かったです (たのしい → たのしかったです).',
        examples: [{ jp: 'とても たのしかったです。', en: 'It was very fun.' }],
      },
    ],
    exercises: [
      { type: 'mcq', prompt: 'あそこに 人が たくさん（　）。', en: 'There are many people over there.', options: ['あります', 'います', 'します'], answer: 1 },
      { type: 'mcq', prompt: '駅の 前に 赤い 門が（　）。', en: 'There is a red gate in front of the station.', options: ['あります', 'います', 'きます'], answer: 0 },
      { type: 'mcq', prompt: 'きのうは とても（　）です。', en: 'Yesterday was very fun.', options: ['たのしい', 'たのしかった', 'たのしくて'], answer: 1 },
      { type: 'order', en: 'I went with my friend Sakura.', tokens: ['友だちの', 'さくらと', '行きました'] },
    ],
  },
  {
    id: 'g4',
    chapter: 4,
    title: 'Desires & listing activities',
    points: [
      {
        pattern: 'V-たいです',
        meaning: 'want to do V',
        explain: 'Replace ます with たいです to express what you want to do (行きます → 行きたいです).',
        examples: [{ jp: '京都へ 行きたいです。', en: 'I want to go to Kyoto.' }],
      },
      {
        pattern: 'V-たり、V-たり します',
        meaning: 'do things like A and B',
        explain: 'Use the たり-form (past plain + り) to give representative examples of actions.',
        examples: [{ jp: 'お寺を 見たり、抹茶を 飲んだり したいです。', en: 'I want to see temples, drink matcha, etc.' }],
      },
      {
        pattern: '手段の で (by means of)',
        meaning: 'by (transport / tool)',
        explain: 'Use で after a vehicle to show how you travel.',
        examples: [{ jp: '新幹線で 京都へ 行きます。', en: 'I go to Kyoto by bullet train.' }],
      },
    ],
    exercises: [
      { type: 'mcq', prompt: '京都へ（　）です。', en: 'I want to go to Kyoto.', options: ['行く', '行きたい', '行った'], answer: 1 },
      { type: 'mcq', prompt: '新幹線（　）行きます。', en: 'I will go by bullet train.', options: ['に', 'を', 'で'], answer: 2 },
      { type: 'mcq', prompt: '映画を（　）、本を 読んだり します。', en: 'I do things like watch movies and read books.', options: ['見たり', '見て', '見る'], answer: 0 },
      { type: 'order', en: 'Tonight I will buy a ticket.', tokens: ['今晩', 'きっぷを', '買います'] },
    ],
  },
  {
    id: 'g5',
    chapter: 5,
    title: 'Requests & permission',
    points: [
      {
        pattern: 'V-て ください',
        meaning: 'please do V',
        explain: 'Use the て-form + ください to politely ask someone to do something (待つ → 待って ください).',
        examples: [{ jp: 'ちょっと 待って ください。', en: 'Please wait a moment.' }],
      },
      {
        pattern: 'V-ても いいですか',
        meaning: 'may I do V?',
        explain: 'て-form + も いいですか asks for permission (開ける → 開けても いいですか).',
        examples: [{ jp: '窓を 開けても いいですか。', en: 'May I open the window?' }],
      },
      {
        pattern: '〜と 言いました / 聞きました',
        meaning: 'said / asked "~"',
        explain: 'Put a quote in 「 」 followed by と to report what someone said or asked.',
        examples: [{ jp: '「どうぞ」と 言いました。', en: 'He said "please go ahead".' }],
      },
    ],
    exercises: [
      { type: 'mcq', prompt: 'ここに 名前を（　）ください。', en: 'Please write your name here.', options: ['書いて', '書き', '書く'], answer: 0 },
      { type: 'mcq', prompt: '写真を 撮っても（　）。', en: 'May I take a photo?', options: ['いいですか', 'くださいか', 'ありますか'], answer: 0 },
      { type: 'mcq', prompt: '「すみません」（　）言いました。', en: 'I said "excuse me".', options: ['と', 'を', 'で'], answer: 0 },
      { type: 'order', en: 'Please open the window.', tokens: ['窓を', '開けて', 'ください'] },
    ],
  },
  {
    id: 'g6',
    chapter: 6,
    title: 'Prices, floors & comparisons',
    points: [
      {
        pattern: '〜は いくらですか',
        meaning: 'how much is ~?',
        explain: 'いくら asks the price. Answer with number + 円 (三万円 = さんまんえん).',
        examples: [{ jp: 'この カメラは いくらですか。', en: 'How much is this camera?' }],
      },
      {
        pattern: 'Number + 階',
        meaning: '~th floor',
        explain: '階 counts floors. Watch the sound changes: 一階 いっかい, 三階 さんがい, 何階 なんがい.',
        examples: [{ jp: 'トイレは 三階に あります。', en: 'The restroom is on the 3rd floor.', audio: 'トイレは、さんがいに あります。' }],
      },
      {
        pattern: 'A の ほうが B より 〜',
        meaning: 'A is more ~ than B',
        explain: 'ほうが marks the winner of the comparison; より marks what it is compared against.',
        examples: [{ jp: '黒い ほうが 白い のより 軽いです。', en: 'The black one is lighter than the white one.' }],
      },
    ],
    exercises: [
      { type: 'mcq', prompt: 'この かばんは（　）ですか。', en: 'How much is this bag?', options: ['いくら', 'どこ', 'だれ'], answer: 0 },
      { type: 'mcq', prompt: 'カメラ売り場は 五（　）です。', en: 'The camera section is on the 5th floor.', options: ['階', '枚', '本'], answer: 0 },
      { type: 'mcq', prompt: '電車の（　）が バスより 速いです。', en: 'The train is faster than the bus.', options: ['ほう', 'より', 'まで'], answer: 0 },
      { type: 'order', en: 'Tokyo is bigger than Kyoto.', tokens: ['東京の ほうが', '京都より', '大きいです'] },
    ],
  },
];
