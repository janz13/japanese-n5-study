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
  {
    id: 's3',
    chapter: 3,
    title: '道を きく',
    setting: 'Asking for directions to Asakusa Station.',
    lines: [
      { who: 'you', jp: 'すみません。駅は どこですか。', kana: 'すみません。えきは どこですか。', en: 'Excuse me. Where is the station?' },
      { who: 'npc', name: '駅員', jp: 'あそこです。白い ビルの 前です。', kana: 'あそこです。しろい びるの まえです。', en: 'It is over there. In front of the white building.' },
      { who: 'you', jp: '歩いて 何分ぐらい ですか。', kana: 'あるいて なんぷんぐらい ですか。', en: 'About how many minutes is it on foot?' },
      { who: 'npc', name: '駅員', jp: '五分ぐらい です。', kana: 'ごふんぐらい です。', en: 'About five minutes.' },
      { who: 'you', jp: 'ありがとうございます。', kana: 'ありがとうございます。', en: 'Thank you very much.' },
    ],
  },
  {
    id: 's4',
    chapter: 4,
    title: '週末の 予定',
    setting: 'Inviting a friend to go to Kyoto on Sunday.',
    lines: [
      { who: 'npc', name: 'けん', jp: '日曜日は 何を しますか。', kana: 'にちようびは なにを しますか。', en: 'What will you do on Sunday?' },
      { who: 'you', jp: '京都へ 行きたいです。', kana: 'きょうとへ いきたいです。', en: 'I want to go to Kyoto.' },
      { who: 'npc', name: 'けん', jp: 'いいですね。いっしょに 行きましょうか。', kana: 'いいですね。いっしょに いきましょうか。', en: 'Sounds nice! Shall we go together?' },
      { who: 'you', jp: 'はい、ぜひ 行きましょう。', kana: 'はい、ぜひ いきましょう。', en: 'Yes, let’s definitely go!' },
    ],
  },
];
