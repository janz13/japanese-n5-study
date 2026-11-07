export interface LayeredClozeHint {
  layer1Nuance: string;
  layer2Pattern: string;
  layer3Rule: string;
  layer4FullGrammar: string;
}

export interface NearMissWarning {
  input: string;
  warning: string;
}

export interface LayeredClozeExercise {
  type: 'cloze';
  id: string;
  sentencePre: string;
  sentencePost: string;
  rootPrompt: string;
  acceptableAnswers: string[];
  hints: LayeredClozeHint;
  nearMisses?: NearMissWarning[];
  en?: string;
  audioText?: string;
}

export type Exercise =
  | { type: 'mcq'; prompt: string; en: string; options: string[]; answer: number }
  | { type: 'order'; en: string; tokens: string[] }
  | LayeredClozeExercise;

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
      {
        type: 'cloze',
        id: 'cloze-g1-1',
        sentencePre: '私は アメリカ',
        sentencePost: '来ました。',
        rootPrompt: 'から (from: origin point)',
        acceptableAnswers: ['から', 'kara'],
        hints: {
          layer1Nuance: 'Origin point: indicating where someone came from',
          layer2Pattern: 'Noun + から',
          layer3Rule: 'Attach から directly after the country noun',
          layer4FullGrammar: 'から marks the starting point in space or time. Here: "from America". (Lesson g1)',
        },
        nearMisses: [
          { input: 'に', warning: 'に indicates destination or arrival. For the starting origin, use から!' },
          { input: 'で', warning: 'で marks means or location. To say "from", use から!' },
        ],
        en: 'I came from America.',
        audioText: 'わたしは アメリカから きました。',
      },
      {
        type: 'cloze',
        id: 'cloze-g1-2',
        sentencePre: 'きのう、東京に',
        sentencePost: '。',
        rootPrompt: '着く (arrive: polite past)',
        acceptableAnswers: ['着きました', 'つきました', 'tsukimashita'],
        hints: {
          layer1Nuance: 'Past event: polite statement of arrival yesterday',
          layer2Pattern: 'Verb Stem + ました (Polite Past)',
          layer3Rule: 'Godan verb 着く (tsuku) -> i-stem 着き (tsuki) + ました -> 着きました',
          layer4FullGrammar: 'Polite past inflection for Group 1 verbs: u -> i + ました. (Lesson g1)',
        },
        nearMisses: [
          { input: '着きます', warning: 'This happened yesterday (きのう)! Use polite past -ました.' },
          { input: '着いた', warning: '着いた is casual past. The polite sentence requires 着きました!' },
        ],
        en: 'Yesterday, I arrived in Tokyo.',
        audioText: 'きのう、とうきょうに つきました。',
      },
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
      {
        type: 'cloze',
        id: 'cloze-g2-1',
        sentencePre: 'りんごを 二つ',
        sentencePost: '。',
        rootPrompt: 'ください (please give me)',
        acceptableAnswers: ['ください', 'kudasai'],
        hints: {
          layer1Nuance: 'Polite request: asking for items at a store',
          layer2Pattern: 'Item + を + Counter + ください',
          layer3Rule: 'Place ください directly after the counter word',
          layer4FullGrammar: 'Standard store request pattern: [Noun] を [Quantity] ください. (Lesson g2)',
        },
        nearMisses: [
          { input: 'お願いします', warning: 'お願いします is polite, but with counters the standard request uses ください.' },
        ],
        en: 'Two apples, please.',
        audioText: 'りんごを ふたつ ください。',
      },
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
      {
        type: 'cloze',
        id: 'cloze-g3-1',
        sentencePre: '駅の 前に 赤い 門が',
        sentencePost: '。',
        rootPrompt: 'ある (inanimate existence: polite non-past)',
        acceptableAnswers: ['あります', 'arimasu'],
        hints: {
          layer1Nuance: 'Existence: stating that an inanimate object (gate) exists',
          layer2Pattern: 'Inanimate Noun + が あります',
          layer3Rule: 'Use あります for non-living objects (versus います for living things)',
          layer4FullGrammar: 'あります is used for inanimate things (buildings, gates, items). (Lesson g3)',
        },
        nearMisses: [
          { input: 'います', warning: 'A gate is inanimate! Use あります for objects, います for living beings.' },
        ],
        en: 'There is a red gate in front of the station.',
        audioText: 'えきの まえに あかい もんが あります。',
      },
      {
        type: 'cloze',
        id: 'cloze-g3-2',
        sentencePre: 'きのうの 旅行は とても',
        sentencePost: 'です。',
        rootPrompt: 'たのしい (fun/pleasant: past plain stem)',
        acceptableAnswers: ['たのしかった', 'tanoshikatta', '楽しかった'],
        hints: {
          layer1Nuance: 'Past quality: describing how fun yesterday\'s trip was',
          layer2Pattern: 'い-adj stem + かったです',
          layer3Rule: 'Drop final い from たのしい and attach かったです',
          layer4FullGrammar: 'い-adjective past polite: drop い + かったです. (Lesson g3)',
        },
        nearMisses: [
          { input: 'たのしい', warning: 'This happened yesterday (きのう)! Use past tense: drop い and add かったです.' },
          { input: 'たのしでした', warning: 'Never say [い-adj]でした! Drop い and add かったです.' },
        ],
        en: 'Yesterday\'s trip was very fun.',
        audioText: 'きのうの りょこうは とても たのしかったです。',
      },
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
      {
        type: 'cloze',
        id: 'cloze-g4-1',
        sentencePre: '京都へ',
        sentencePost: 'です。',
        rootPrompt: '行く (to go: speaker desire)',
        acceptableAnswers: ['行きたい', 'いきたい', 'ikitai'],
        hints: {
          layer1Nuance: 'Speaker desire: expressing wanting to go to Kyoto',
          layer2Pattern: 'Verb Stem + たいです',
          layer3Rule: 'Godan verb 行く: shift u -> i (行き) + たい -> 行きたい',
          layer4FullGrammar: '〜たい replaces ます to express first-person desire. (Lesson g4)',
        },
        nearMisses: [
          { input: '行く', warning: 'Do not use plain dictionary form with です for desire! Use 行きたい.' },
        ],
        en: 'I want to go to Kyoto.',
        audioText: 'きょうとへ いきたいです。',
      },
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
      {
        type: 'cloze',
        id: 'cloze-g5-1',
        sentencePre: 'ここで 写真を',
        sentencePost: 'も いいですか。',
        rootPrompt: '撮る (to take photo: permission te-form)',
        acceptableAnswers: ['撮って', 'とって', 'totte'],
        hints: {
          layer1Nuance: 'Asking permission: politely inquiring if it is okay to take photos',
          layer2Pattern: 'Verb て-form + も いいですか',
          layer3Rule: 'Godan verb ending in る (toru) becomes って (totte)',
          layer4FullGrammar: 'V-てもいいですか asks for permission. Te-form of 撮る is 撮って. (Lesson g5)',
        },
        nearMisses: [
          { input: '撮る', warning: 'You must use the て-form before もいいですか!' },
        ],
        en: 'May I take a photo here?',
        audioText: 'ここで しゃしんを とっても いいですか。',
      },
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
      {
        type: 'cloze',
        id: 'cloze-g6-1',
        sentencePre: '電車の',
        sentencePost: 'が バスより 速いです。',
        rootPrompt: 'ほう (comparison: chosen alternative)',
        acceptableAnswers: ['ほう', 'hou'],
        hints: {
          layer1Nuance: 'Comparative choice: designating which item is superior in speed',
          layer2Pattern: 'Option A の ほうが + Option B より + Adjective',
          layer3Rule: 'Attach ほう (direction/alternative) after noun + の',
          layer4FullGrammar: 'A の ほうが B より expresses "A is more ... than B". (Lesson g6)',
        },
        nearMisses: [
          { input: 'より', warning: 'より marks the thing being compared against. The winner takes ほう!' },
        ],
        en: 'The train is faster than the bus.',
        audioText: 'でんしゃの ほうが バスより はやいです。',
      },
    ],
  },
  {
    id: 'g7',
    chapter: 7,
    title: 'N4 · Experience, plans & rules',
    points: [
      {
        pattern: 'V-た ことが あります',
        meaning: 'have (ever) done V',
        explain: 'Plain past + ことが あります talks about life experience (行く → 行った ことが あります).',
        examples: [{ jp: '富士山に 登った ことが あります。', en: 'I have climbed Mt. Fuji.', audio: 'ふじさんに、のぼった ことが あります。' }],
      },
      {
        pattern: 'V-る つもりです',
        meaning: 'intend / plan to V',
        explain: 'Dictionary form + つもりです states a firm plan (行く つもりです).',
        examples: [{ jp: '来年 日本に 行く つもりです。', en: 'I plan to go to Japan next year.', audio: 'らいねん、にほんに いく つもりです。' }],
      },
      {
        pattern: 'V-なければ なりません / V-ては いけません',
        meaning: 'must V / must not V',
        explain: 'Negative stem + なければ なりません = obligation. て-form + は いけません = prohibition.',
        examples: [{ jp: 'ここで たばこを 吸っては いけません。', en: 'You must not smoke here.' }],
      },
      {
        pattern: 'V-る 前に / V-た 後で',
        meaning: 'before V-ing / after V-ing',
        explain: 'Dictionary form + 前に, past form + 後で order two actions.',
        examples: [{ jp: '寝る 前に 歯を みがきます。', en: 'I brush my teeth before sleeping.', audio: 'ねる まえに、はを みがきます。' }],
      },
    ],
    exercises: [
      { type: 'mcq', prompt: 'すしを（　）ことが ありますか。', en: 'Have you ever eaten sushi?', options: ['食べた', '食べる', '食べて'], answer: 0 },
      { type: 'mcq', prompt: '明日は 早く 起き（　）なりません。', en: 'Tomorrow I must get up early.', options: ['なければ', 'ては', 'たら'], answer: 0 },
      { type: 'mcq', prompt: 'ここで 写真を 撮っては（　）。', en: 'You must not take photos here.', options: ['いけません', 'いいです', 'あります'], answer: 0 },
      { type: 'order', en: 'I plan to study Japanese.', tokens: ['日本語を', '勉強する', 'つもりです'] },
      {
        type: 'cloze',
        id: 'cloze-g7-1',
        sentencePre: '富士山に',
        sentencePost: 'ことが あります。',
        rootPrompt: '登る (to climb: experience past plain)',
        acceptableAnswers: ['登った', 'のぼった', 'nobotta'],
        hints: {
          layer1Nuance: 'Lifetime experience: stating you have climbed Mt. Fuji before',
          layer2Pattern: 'Verb Plain Past (た-form) + ことがある',
          layer3Rule: 'Godan verb 登る (noboru) takes small-tsu past: 登った',
          layer4FullGrammar: 'V-た + ことがある expresses past experience. (Lesson g7)',
        },
        nearMisses: [
          { input: '登る', warning: 'Use the plain past (た-form) before ことがある, not dictionary form!' },
        ],
        en: 'I have climbed Mt. Fuji.',
        audioText: 'ふじさんに のぼった ことが あります。',
      },
    ],
  },
  {
    id: 'g8',
    chapter: 8,
    title: 'N4 · Ability, change & giving',
    points: [
      {
        pattern: 'Potential form (話せる / 食べられる)',
        meaning: 'can V',
        explain: 'Godan: う-row → え-row + る (話す → 話せる). Ichidan: る → られる (食べる → 食べられる). する → できる.',
        examples: [{ jp: '日本語が 少し 話せます。', en: 'I can speak a little Japanese.' }],
      },
      {
        pattern: 'V-る ように なりました',
        meaning: 'have come to be able to V',
        explain: 'Potential/dictionary form + ように なる shows a gradual change in ability or habit.',
        examples: [{ jp: '漢字が 読める ように なりました。', en: 'I have become able to read kanji.' }],
      },
      {
        pattern: 'あげる / くれる / もらう',
        meaning: 'give (away) / give (to me) / receive',
        explain: 'あげる = I/others give outward; くれる = someone gives to me/my group; もらう = receive from (に/から).',
        examples: [{ jp: '友だちが 私に 本を くれました。', en: 'My friend gave me a book.' }],
      },
      {
        pattern: 'V-て みたい',
        meaning: 'want to try V-ing',
        explain: 'て-form + みる = try doing; + たい = want to try.',
        examples: [{ jp: '着物を 着て みたいです。', en: 'I want to try wearing a kimono.' }],
      },
    ],
    exercises: [
      { type: 'mcq', prompt: '私は ピアノが（　）。', en: 'I can play the piano.', options: ['ひけます', 'ひきます', 'ひいて'], answer: 0 },
      { type: 'mcq', prompt: '母が 私に セーターを（　）。', en: 'My mother gave me a sweater.', options: ['くれました', 'あげました', 'もらいました'], answer: 0 },
      { type: 'mcq', prompt: '泳げる（　）なりました。', en: 'I have become able to swim.', options: ['ように', 'ために', 'ことが'], answer: 0 },
      { type: 'order', en: 'I want to try eating natto.', tokens: ['なっとうを', '食べて', 'みたいです'] },
      {
        type: 'cloze',
        id: 'cloze-g8-1',
        sentencePre: '母が 私に セーターを',
        sentencePost: '。',
        rootPrompt: 'くれる (give to me: polite past)',
        acceptableAnswers: ['くれました', 'kuremashita'],
        hints: {
          layer1Nuance: 'Inward giving: mother gives something to ME (the speaker)',
          layer2Pattern: 'Giver が Me に くれる / くれます',
          layer3Rule: 'Ichidan くれる -> くれ + ました -> くれました',
          layer4FullGrammar: 'くれる is used when someone gives to the speaker. (Lesson g8)',
        },
        nearMisses: [
          { input: 'あげました', warning: 'あげる is when YOU give outward. Mother gave to YOU, so use くれました!' },
        ],
        en: 'My mother gave me a sweater.',
        audioText: 'ははが わたしに セーターを くれました。',
      },
    ],
  },
  {
    id: 'g9',
    chapter: 9,
    title: 'N4 · Conditionals (〜たら・〜なら・〜ば・〜と)',
    points: [
      {
        pattern: 'V-たら / Adj-かったら',
        meaning: 'if / when (after V happens)',
        explain: 'Past plain (た-form) + ら. The most versatile conditional: works for one-time future events ("when you arrive") and hypotheticals.',
        examples: [{ jp: '駅に 着いたら、電話して ください。', en: 'When you arrive at the station, please call me.', audio: 'えきに ついたら、でんわして ください。' }],
      },
      {
        pattern: 'N / V なら',
        meaning: 'if it is the case that / regarding',
        explain: 'Responds to context someone else just brought up ("If you are going to Kyoto, go by Shinkansen").',
        examples: [{ jp: '京都へ 行くなら、新幹線が 便利です。', en: 'If you are going to Kyoto, the Shinkansen is convenient.', audio: 'きょうとへ いくなら、しんかんせんが べんりです。' }],
      },
      {
        pattern: 'V-えば / い-Adj-ければ',
        meaning: 'if (general condition)',
        explain: 'Godan: う-row → え-row + ば (行く → 行けば). Ichidan: る → れば (食べる → 食べれば). い-Adj: い → ければ (安い → 安ければ).',
        examples: [{ jp: '天気が よければ、富士山が 見えます。', en: 'If the weather is good, you can see Mt. Fuji.', audio: 'てんきが よければ、ふじさんが みえます。' }],
      },
      {
        pattern: 'V-る と',
        meaning: 'whenever / automatically when',
        explain: 'Dictionary/negative form + と expresses natural results, machine operations, or directions (cannot be followed by requests/commands).',
        examples: [{ jp: 'この ボタンを 押すと、きっぷが 出ます。', en: 'When you press this button, a ticket comes out.', audio: 'この ボタンを おすと、きっぷが でます。' }],
      },
    ],
    exercises: [
      { type: 'mcq', prompt: '雨が（　）、ピクニックは 行きません。', en: 'If it rains, we will not go on the picnic.', options: ['降ったら', '降ると', '降るなら'], answer: 0 },
      { type: 'mcq', prompt: 'カメラを 買う（　）、秋葉原の 店が いいですよ。', en: 'If you are buying a camera, the shops in Akihabara are good.', options: ['なら', 'たら', 'と'], answer: 0 },
      { type: 'mcq', prompt: '春に なる（　）、さくらが 咲きます。', en: 'Whenever spring comes, the cherry blossoms bloom.', options: ['と', 'なら', 'たらば'], answer: 0 },
      { type: 'order', en: 'When you arrive at the station, please call me.', tokens: ['駅に', '着いたら', '電話して', 'ください'] },
      {
        type: 'cloze',
        id: 'cloze-g9-1',
        sentencePre: '駅に',
        sentencePost: '、電話して ください。',
        rootPrompt: '着く (arrive: conditional "when/if you arrive")',
        acceptableAnswers: ['着いたら', 'ついたら', 'tsuitara'],
        hints: {
          layer1Nuance: 'Sequential conditional: when an event occurs in the future, perform the request',
          layer2Pattern: 'Verb Plain Past (た-form) + ら',
          layer3Rule: 'Godan verb 着く (tsuku) -> past 着いた (tsuita) + ら -> 着いたら',
          layer4FullGrammar: '〜たら expresses "when / if" and can precede requests or suggestions. (Lesson g9)',
        },
        nearMisses: [
          { input: '着くと', warning: '〜と cannot be followed by a request (〜てください). Use 〜たら!' },
        ],
        en: 'When you arrive at the station, please call me.',
        audioText: 'えきに ついたら、でんわして ください。',
      },
    ],
  },
  {
    id: 'g10',
    chapter: 10,
    title: 'N4 · Keigo & Polite Requests (敬語)',
    points: [
      {
        pattern: 'いらっしゃいます / ご覧になります',
        meaning: 'be / go / come / see (Honorific 尊敬語)',
        explain: 'Elevates the listener/customer or respected person’s actions: 行く・来る・いる → いらっしゃいます; 見る → ご覧に なります; 食べる・飲む → 召し上がります.',
        examples: [{ jp: '先生は もう いらっしゃいましたか。', en: 'Has the teacher arrived yet?', audio: 'せんせいは もう いらっしゃいましたか。' }],
      },
      {
        pattern: 'お + V-stem + に なります',
        meaning: 'honorific verb pattern (尊敬語)',
        explain: 'お + masu-stem + に なります politely elevates a customer’s or superior’s action (お待ちに なる, お読みに なる).',
        examples: [{ jp: 'カードを お使いに なりますか。', en: 'Will you be using a card?', audio: 'カードを おつかいに なりますか。' }],
      },
      {
        pattern: '参ります / 申します / いたします',
        meaning: 'go/come / be called / do (Humble 謙譲語)',
        explain: 'Lowers your own action to show respect: 行く・来る → 参ります (まいります); 言う → 申します (もうします); する → いたします.',
        examples: [{ jp: '私が ご案内いたします。', en: 'I will guide you.', audio: 'わたしが ごあんない いたします。' }],
      },
      {
        pattern: 'V-て いただけますか / 〜でございます',
        meaning: 'could you kindly V? / polite copula (丁寧語)',
        explain: 'て-form + いただけますか is much softer and more polite than 〜てください. でございます is the super-polite form of です heard in hotels and shops.',
        examples: [{ jp: 'お名前を 書いて いただけますか。', en: 'Could you kindly write your name?', audio: 'おなまえを かいて いただけますか。' }],
      },
    ],
    exercises: [
      { type: 'mcq', prompt: '社長は 今 会議室に（　）。', en: 'The company president is in the meeting room now (Honorific).', options: ['いらっしゃいます', '参ります', '申します'], answer: 0 },
      { type: 'mcq', prompt: '少し ゆっくり 話して（　）。', en: 'Could you kindly speak a little more slowly?', options: ['いただけますか', 'いたしますか', 'ございますか'], answer: 0 },
      { type: 'mcq', prompt: 'こちらは 案内所で（　）。', en: 'This is the information desk (Super-polite).', options: ['ございます', 'いらっしゃいます', '申します'], answer: 0 },
      { type: 'order', en: 'I will guide you (Humble).', tokens: ['私が', 'ご案内', 'いたします'] },
      {
        type: 'cloze',
        id: 'cloze-g10-1',
        sentencePre: '私が ご案内',
        sentencePost: '。',
        rootPrompt: 'する (humble kenjougo: "I will guide you")',
        acceptableAnswers: ['いたします', 'itashimasu'],
        hints: {
          layer1Nuance: 'Humble action: speaker humbling their own action of guiding',
          layer2Pattern: 'ご + Sino-noun + いたす / いたします',
          layer3Rule: 'Humble equivalent of します is いたします',
          layer4FullGrammar: 'Kenjougo (Humble) lowers speaker actions to elevate the listener. (Lesson g10)',
        },
        nearMisses: [
          { input: 'なさいます', warning: 'なさいます is Honorific (Sonkeigo)! For your own humble actions, use いたします.' },
          { input: 'します', warning: 'Use humble keigo: する becomes いたします.' },
        ],
        en: 'I will guide you (Humble).',
        audioText: 'わたしが ごあんない いたします。',
      },
    ],
  },
  {
    id: 'g11',
    chapter: 11,
    title: 'N4 · Passive & Causative (受身・使役)',
    points: [
      {
        pattern: 'V-られる / V-(あ)れる (受身形)',
        meaning: 'passive voice (be done to / suffered from)',
        explain:
          'Expresses actions received from someone else. Group 1: u → a + れる (書く → 書かれる, 叱る → 叱られる). Group 2: drop る + られる (食べる → 食べられる). Group 3: する → される, くる → こられる. Also expresses "suffering passive" (迷惑の受身): 雨に降られた (I was rained on).',
        examples: [
          { jp: '先生に 褒められました。', en: 'I was praised by my teacher.', audio: 'せんせいに ほめられました。' },
          { jp: '電車で 足を 踏まれました。', en: 'My foot was stepped on on the train.', audio: 'でんしゃで あしを ふまれました。' },
        ],
      },
      {
        pattern: 'V-させる / V-(あ)せる (使役形)',
        meaning: 'causative voice (make / let someone do)',
        explain:
          'Expresses making or letting someone do something. Group 1: u → a + せる (読む → 読ませる, 行く → 行かせる). Group 2: drop る + させる (食べる → 食べさせる). Group 3: する → させる, くる → こさせる. Person directed is marked with に (or を for intransitive verbs).',
        examples: [
          { jp: '母は 子供に 野菜を 食べさせます。', en: 'The mother makes her child eat vegetables.', audio: 'ははは こどもに やさいを たべさせます。' },
          { jp: '先生は 学生を 走らせました。', en: 'The teacher made the students run.', audio: 'せんせいは がくせいを はしらせました。' },
        ],
      },
      {
        pattern: 'V-させられる / V-(あ)せられる (使役受身)',
        meaning: 'causative-passive (be made/forced to do)',
        explain:
          'Combines causative + passive: "forced to do something against one’s will". Group 1 contracted form is common: 行かされる, 歌わされる. Group 2: 食べさせられる. Group 3: させられる, こさせられる.',
        examples: [
          { jp: 'カラオケで 歌を 歌わせられました。', en: 'I was made to sing a song at karaoke.', audio: 'カラオケで うたを うたわせられました。' },
        ],
      },
    ],
    exercises: [
      {
        type: 'mcq',
        prompt: '昨日、雨に（　）大変でした。',
        en: 'Yesterday, I got rained on and had a tough time (Suffering passive).',
        options: ['降られて', '降らせて', '降って'],
        answer: 0,
      },
      {
        type: 'mcq',
        prompt: '部長に 英語の 資料を（　）。',
        en: 'The manager made me prepare English documents (Causative).',
        options: ['作らされました', '作らせられました', '作られました'],
        answer: 1,
      },
      {
        type: 'mcq',
        prompt: '母に 部屋の 掃除を（　）。',
        en: 'I was forced by my mom to clean the room (Causative-Passive).',
        options: ['させられました', 'されました', 'させました'],
        answer: 0,
      },
      {
        type: 'order',
        en: 'I was praised by the teacher.',
        tokens: ['先生に', 'たくさん', '褒められました'],
      },
      {
        type: 'cloze',
        id: 'cloze-g11-1',
        sentencePre: '先生に たくさん',
        sentencePost: 'ました。',
        rootPrompt: '褒める (to praise: passive stem "was praised")',
        acceptableAnswers: ['褒められ', 'ほめられ', 'homerare'],
        hints: {
          layer1Nuance: 'Passive recipient: speaker was praised by the teacher',
          layer2Pattern: 'Group 2 Verb: drop る + られる',
          layer3Rule: '褒める -> 褒められる -> stem before ました is 褒められ',
          layer4FullGrammar: 'Ichidan passive: drop る + られる. In polite past: 褒められました. (Lesson g11)',
        },
        nearMisses: [
          { input: '褒めさせ', warning: '褒めさせる is Causative ("made praise"). You were praised, so use Passive (褒められ)!' },
        ],
        en: 'I was praised a lot by the teacher.',
        audioText: 'せんせいに たくさん ほめられました。',
      },
    ],
  },
];
