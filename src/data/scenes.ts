export interface Line {
  who: 'npc' | 'you';
  name?: string;
  jp: string;
  /** Kana reading used for pronunciation matching. */
  kana: string;
  en: string;
}

export interface Scene {
  id: string;
  chapter: number;
  title: string;
  setting: string;
  lines: Line[];
}

export const SCENES: Scene[] = [
  {
    id: 's1',
    chapter: 1,
    title: '自己紹介',
    setting: 'Meeting your host family at the station.',
    lines: [
      { who: 'npc', name: 'たなかさん', jp: 'はじめまして。たなかです。', kana: 'はじめまして。たなかです。', en: 'Nice to meet you. I am Tanaka.' },
      { who: 'you', jp: 'はじめまして。アナです。', kana: 'はじめまして。あなです。', en: 'Nice to meet you. I am Ana.' },
      { who: 'npc', name: 'たなかさん', jp: 'どこから 来ましたか。', kana: 'どこから きましたか。', en: 'Where did you come from?' },
      { who: 'you', jp: 'アメリカから 来ました。', kana: 'あめりかから きました。', en: 'I came from America.' },
      { who: 'npc', name: 'たなかさん', jp: 'そうですか。よろしく おねがいします。', kana: 'そうですか。よろしく おねがいします。', en: 'I see. Nice to meet you.' },
      { who: 'you', jp: 'よろしく おねがいします。', kana: 'よろしく おねがいします。', en: 'Nice to meet you too.' },
    ],
  },
  {
    id: 's2',
    chapter: 2,
    title: 'きっさてんで',
    setting: 'Ordering at a café counter.',
    lines: [
      { who: 'npc', name: '店員', jp: 'いらっしゃいませ。', kana: 'いらっしゃいませ。', en: 'Welcome.' },
      { who: 'you', jp: 'コーヒーを 一つ ください。', kana: 'こーひーを ひとつ ください。', en: 'One coffee, please.' },
      { who: 'npc', name: '店員', jp: 'はい。三百円です。', kana: 'はい。さんびゃくえんです。', en: 'Sure. That is 300 yen.' },
      { who: 'you', jp: 'はい、どうぞ。', kana: 'はい、どうぞ。', en: 'Here you go.' },
      { who: 'npc', name: '店員', jp: 'ありがとうございます。', kana: 'ありがとうございます。', en: 'Thank you.' },
    ],
  },
];
