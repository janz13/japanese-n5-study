export interface VerbPair {
  id: string;
  patternRule: string;
  intransitive: {
    kanji: string;
    kana: string;
    en: string;
    exampleJp: string;
    exampleKana: string;
    exampleEn: string;
  };
  transitive: {
    kanji: string;
    kana: string;
    en: string;
    exampleJp: string;
    exampleKana: string;
    exampleEn: string;
  };
}

export const VERB_PAIRS: VerbPair[] = [
  {
    id: 'vp1',
    patternRule: '-u (自動詞) vs. -eru (他動詞)',
    intransitive: {
      kanji: '開く',
      kana: 'あく',
      en: 'to open (by itself)',
      exampleJp: '自動で ドアが 【開きます】。',
      exampleKana: 'じどうで ドアが あきます。',
      exampleEn: 'The door opens automatically.',
    },
    transitive: {
      kanji: '開ける',
      kana: 'あける',
      en: 'to open (something)',
      exampleJp: 'あついので、まどを 【開けます】。',
      exampleKana: 'あついので、まどを あけます。',
      exampleEn: 'Because it is hot, I open the window.',
    },
  },
  {
    id: 'vp2',
    patternRule: '-aru (自動詞) vs. -eru (他動詞)',
    intransitive: {
      kanji: '閉まる',
      kana: 'しまる',
      en: 'to close / be closed',
      exampleJp: 'エレベーターの ドアが 【閉まります】。',
      exampleKana: 'エレベーターの ドアが しまります。',
      exampleEn: 'The elevator door closes.',
    },
    transitive: {
      kanji: '閉める',
      kana: 'しめる',
      en: 'to close (something)',
      exampleJp: '寒いから、ドアを 【閉めて】ください。',
      exampleKana: 'さむいから、ドアを しめて ください。',
      exampleEn: 'Because it is cold, please close the door.',
    },
  },
  {
    id: 'vp3',
    patternRule: '-aru (自動詞) vs. -eru (他動詞)',
    intransitive: {
      kanji: '始まる',
      kana: 'はじまる',
      en: 'to begin (intransitive)',
      exampleJp: '九時に しけんが 【始まります】。',
      exampleKana: 'くじに しけんが はじまります。',
      exampleEn: 'The exam starts at 9:00.',
    },
    transitive: {
      kanji: '始める',
      kana: 'はじめる',
      en: 'to start / begin (something)',
      exampleJp: 'では、かいぎを 【始めましょう】。',
      exampleKana: 'では、かいぎを はじめましょう。',
      exampleEn: 'Well then, let us start the meeting.',
    },
  },
  {
    id: 'vp4',
    patternRule: '-u (自動詞) vs. -eru (他動詞)',
    intransitive: {
      kanji: 'つく',
      kana: 'つく',
      en: 'to turn on / be lit',
      exampleJp: 'へやの でんきが 【ついています】。',
      exampleKana: 'へやの でんきが ついて います。',
      exampleEn: 'The room light is on.',
    },
    transitive: {
      kanji: 'つける',
      kana: 'つける',
      en: 'to turn on / switch on',
      exampleJp: '暗いので、でんきを 【つけました】。',
      exampleKana: 'くらいので、でんきを つけました。',
      exampleEn: 'Because it was dark, I turned on the light.',
    },
  },
  {
    id: 'vp5',
    patternRule: '-eru (自動詞) vs. -su (他動詞)',
    intransitive: {
      kanji: '消える',
      kana: 'きえる',
      en: 'to go out / disappear',
      exampleJp: '風で ろうそくの 火が 【消えました】。',
      exampleKana: 'かぜで ろうそくの ひが きえました。',
      exampleEn: 'The candle flame went out in the wind.',
    },
    transitive: {
      kanji: '消す',
      kana: 'けす',
      en: 'to turn off / erase',
      exampleJp: 'ねる 前に、テレビを 【消します】。',
      exampleKana: 'ねる まえに、テレビを けします。',
      exampleEn: 'Before sleeping, I turn off the TV.',
    },
  },
  {
    id: 'vp6',
    patternRule: '-ru (自動詞) vs. -su (他動詞)',
    intransitive: {
      kanji: '出る',
      kana: 'でる',
      en: 'to go out / come out / depart',
      exampleJp: 'もうすぐ バスが 【出ます】。',
      exampleKana: 'もうすぐ バスが でます。',
      exampleEn: 'The bus will depart soon.',
    },
    transitive: {
      kanji: '出す',
      kana: 'だす',
      en: 'to take out / hand in / send',
      exampleJp: 'かばんから ノートを 【出しました】。',
      exampleKana: 'かばんから ノートを だしました。',
      exampleEn: 'I took the notebook out of my bag.',
    },
  },
  {
    id: 'vp7',
    patternRule: '-u (自動詞) vs. -eru (他動詞)',
    intransitive: {
      kanji: '入る',
      kana: 'はいる',
      en: 'to enter / go in',
      exampleJp: 'いぬが へやに 【入りました】。',
      exampleKana: 'いぬが へやに はいりました。',
      exampleEn: 'The dog entered the room.',
    },
    transitive: {
      kanji: '入れる',
      kana: 'いれる',
      en: 'to put in / insert / make (tea/coffee)',
      exampleJp: 'コーヒーに さとうを 【入れます】。',
      exampleKana: 'コーヒーに さとうを いれます。',
      exampleEn: 'I put sugar into the coffee.',
    },
  },
  {
    id: 'vp8',
    patternRule: '-aru (自動詞) vs. -eru (他動詞)',
    intransitive: {
      kanji: '止まる',
      kana: 'とまる',
      en: 'to stop (by itself)',
      exampleJp: '次の えきで でんしゃが 【止まります】。',
      exampleKana: 'つぎの えきで でんしゃが とまります。',
      exampleEn: 'The train stops at the next station.',
    },
    transitive: {
      kanji: '止める',
      kana: 'とめる',
      en: 'to stop / park (something)',
      exampleJp: 'ここに くるまを 【止めないで】ください。',
      exampleKana: 'ここに くるまを とめないで ください。',
      exampleEn: 'Please do not park your car here.',
    },
  },
  {
    id: 'vp9',
    patternRule: '-reru (自動詞) vs. -su (他動詞)',
    intransitive: {
      kanji: '壊れる',
      kana: 'こわれる',
      en: 'to break / be broken',
      exampleJp: 'パソコンが 【壊れて】しまいました。',
      exampleKana: 'パソコンが こわれて しまいました。',
      exampleEn: 'My computer broke down.',
    },
    transitive: {
      kanji: '壊す',
      kana: 'こわす',
      en: 'to break / smash (something)',
      exampleJp: 'おとうとが おもちゃを 【壊しました】。',
      exampleKana: 'おとうとが おもちゃを こわしました。',
      exampleEn: 'My younger brother broke the toy.',
    },
  },
  {
    id: 'vp10',
    patternRule: '-iru (自動詞) vs. -osu (他動詞)',
    intransitive: {
      kanji: '落ちる',
      kana: 'おちる',
      en: 'to fall / drop',
      exampleJp: '木から りんごが 【落ちました】。',
      exampleKana: 'きから りんごが おちました。',
      exampleEn: 'An apple fell from the tree.',
    },
    transitive: {
      kanji: '落とす',
      kana: 'おとす',
      en: 'to drop (something)',
      exampleJp: '道で さいふを 【落としました】。',
      exampleKana: 'みちで さいふを おとしました。',
      exampleEn: 'I dropped my wallet on the street.',
    },
  },
  {
    id: 'vp11',
    patternRule: '-aru (自動詞) vs. -eru (他動詞)',
    intransitive: {
      kanji: '集まる',
      kana: 'あつまる',
      en: 'to gather / assemble',
      exampleJp: '駅前に たくさんの 人が 【集まりました】。',
      exampleKana: 'えきまえに たくさんの ひとが あつまりました。',
      exampleEn: 'Many people gathered in front of the station.',
    },
    transitive: {
      kanji: '集める',
      kana: 'あつめる',
      en: 'to collect / gather (things)',
      exampleJp: '世界の 切手を 【集めています】。',
      exampleKana: 'せかいの きってを あつめて います。',
      exampleEn: 'I collect stamps from around the world.',
    },
  },
  {
    id: 'vp12',
    patternRule: '-aru (自動詞) vs. -eru (他動詞)',
    intransitive: {
      kanji: '決まる',
      kana: 'きまる',
      en: 'to be decided',
      exampleJp: 'りょこうの 日が 【決まりました】。',
      exampleKana: 'りょこうの ひが きまりました。',
      exampleEn: 'The date of the trip has been decided.',
    },
    transitive: {
      kanji: '決める',
      kana: 'きめる',
      en: 'to decide (something)',
      exampleJp: '将来の しごとを 【決めました】。',
      exampleKana: 'しょうらいの しごとを きめました。',
      exampleEn: 'I decided on my future job.',
    },
  },
];
