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
  level?: 'N5' | 'N4';
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
  {
    id: 's5',
    chapter: 7,
    level: 'N4',
    title: '旅館の チェックイン',
    setting: 'Checking into a traditional ryokan in Hakone and asking about onsen rules.',
    lines: [
      { who: 'npc', name: 'スタッフ', jp: 'いらっしゃいませ。ご予約の アナ様ですね。', kana: 'いらっしゃいませ。ごよやくの あなさまですね。', en: 'Welcome. You are Ms. Ana with a reservation, right?' },
      { who: 'you', jp: 'はい、今日から 一泊 おねがいします。', kana: 'はい、きょうから いっぱく おねがいします。', en: 'Yes, one night starting today, please.' },
      { who: 'npc', name: 'スタッフ', jp: 'お部屋は 三階です。温泉は 一階に あります。', kana: 'おへやは さんがいです。おんせんは いっかいに あります。', en: 'Your room is on the 3rd floor. The hot spring is on the 1st floor.' },
      { who: 'you', jp: '夜も 温泉に 入っても いいですか。', kana: 'よるも おんせんに はいっても いいですか。', en: 'May I use the hot spring at night too?' },
      { who: 'npc', name: 'スタッフ', jp: 'はい、十一時まで 入れますよ。入る 前に 体を 洗って ください。', kana: 'はい、じゅういちじまで はいれますよ。はいる まえに からだを あらって ください。', en: 'Yes, you can enter until 11 o’clock. Please wash your body before getting in.' },
      { who: 'you', jp: 'わかりました。ありがとうございます。', kana: 'わかりました。ありがとうございます。', en: 'Understood. Thank you very much.' },
    ],
  },
  {
    id: 's6',
    chapter: 8,
    level: 'N4',
    title: '薬局で 相談する',
    setting: 'Explaining cold symptoms at a pharmacy and asking how to take medicine.',
    lines: [
      { who: 'npc', name: '薬剤師', jp: 'こんにちは。今日は どうしましたか。', kana: 'こんにちは。きょうは どうしましたか。', en: 'Hello. What seems to be the trouble today?' },
      { who: 'you', jp: 'きのうから 頭が 痛くて、少し 熱が あります。', kana: 'きのうから あたまが いたくて、すこし ねつが あります。', en: 'Since yesterday I have a headache and a slight fever.' },
      { who: 'npc', name: '薬剤師', jp: 'そうですか。では、こちらの かぜ薬は どうですか。', kana: 'そうですか。では、こちらの かぜぐすりは どうですか。', en: 'I see. How about this cold medicine?' },
      { who: 'you', jp: '一日に 何回 飲めば いいですか。', kana: 'いちにちに なんかい のめば いいですか。', en: 'How many times a day should I take it?' },
      { who: 'npc', name: '薬剤師', jp: 'ご飯を 食べた 後で、一日 三回 飲んで ください。お大事に。', kana: 'ごはんを たべた あとで、いちにち さんかい のんで ください。おだいじに。', en: 'Please take it three times a day after eating meals. Take care.' },
      { who: 'you', jp: 'ありがとうございます。それを ください。', kana: 'ありがとうございます。それを ください。', en: 'Thank you. I will take that, please.' },
    ],
  },
];
