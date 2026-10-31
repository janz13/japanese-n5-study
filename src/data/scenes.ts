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
    id: 's8',
    chapter: 5,
    level: 'N5',
    title: '新幹線の きっぷを 買う',
    setting: 'Buying a Shinkansen ticket to Kyoto and asking for the departure platform.',
    lines: [
      { who: 'you', jp: 'すみません、京都まで 新幹線の きっぷを 一枚 ください。', kana: 'すみません、きょうとまで しんかんせんの きっぷを いちまい ください。', en: 'Excuse me, one Shinkansen ticket to Kyoto, please.' },
      { who: 'npc', name: '駅員', jp: 'はい、自由席と 指定席、どちらが いいですか。', kana: 'はい、じゆうせきと していせき、どちらが いいですか。', en: 'Sure. Unreserved seat or reserved seat—which do you prefer?' },
      { who: 'you', jp: '指定席を おねがいします。何番線から 出ますか。', kana: 'していせきを おねがいします。なんばんせんから でますか。', en: 'A reserved seat, please. Which platform does it depart from?' },
      { who: 'npc', name: '駅員', jp: '十四番線です。もうすぐ 来ますから、いそいで ください。', kana: 'じゅうよんばんせんです。もうすぐ きますから、いそいで ください。', en: 'Platform 14. It is coming soon, so please hurry.' },
      { who: 'you', jp: 'わかりました。ありがとうございます。', kana: 'わかりました。ありがとうございます。', en: 'Understood. Thank you very much.' },
    ],
  },
  {
    id: 's9',
    chapter: 6,
    level: 'N5',
    title: '秋葉原で カメラを くらべる',
    setting: 'Comparing two cameras at an electronics store in Akihabara.',
    lines: [
      { who: 'npc', name: '店員', jp: 'いらっしゃいませ。カメラを お探しですか。', kana: 'いらっしゃいませ。カメラを おさがしですか。', en: 'Welcome. Are you looking for a camera?' },
      { who: 'you', jp: 'はい。この 黒い カメラと 白い カメラと、どちらの ほうが かるいですか。', kana: 'はい。この くろい カメラと しろい カメラと、どちらの ほうが かるいですか。', en: 'Yes. Between this black camera and white camera, which one is lighter?' },
      { who: 'npc', name: '店員', jp: '白い カメラの ほうが かるいですよ。旅行に 一番 いいです。', kana: 'しろい カメラの ほうが かるいですよ。りょこうに いちばん いいです。', en: 'The white camera is lighter. It is the best for travel.' },
      { who: 'you', jp: 'そうですか。では、白い カメラに します。', kana: 'そうですか。では、しろい カメラに します。', en: 'I see. Then I will decide on the white camera.' },
      { who: 'npc', name: '店員', jp: 'ありがとうございます。レジへ どうぞ。', kana: 'ありがとうございます。レジへ どうぞ。', en: 'Thank you very much. Please head to the register.' },
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
  {
    id: 's10',
    chapter: 9,
    level: 'N4',
    title: '京都の 天気と 約束',
    setting: 'Planning an autumn temple visit in Kyoto with a friend depending on the weather.',
    lines: [
      { who: 'npc', name: 'さくら', jp: '明日の 京都旅行、楽しみですね。', kana: 'あしたの きょうとりょこう、たのしみですね。', en: 'I am looking forward to tomorrow’s Kyoto trip!' },
      { who: 'you', jp: 'はい。もし 雨が 降ったら、どこへ 行きますか。', kana: 'はい。もし あめが ふったら、どこへ いきますか。', en: 'Yes. If by chance it rains, where shall we go?' },
      { who: 'npc', name: 'さくら', jp: '雨が 降ったら、駅の 近くの 美術館へ 行きましょう。', kana: 'あめが ふったら、えきの ちかくの びじゅつかんへ いきましょう。', en: 'If it rains, let’s go to the art museum near the station.' },
      { who: 'you', jp: 'いいですね。天気が よければ、お寺の 庭を 歩きたいです。', kana: 'いいですね。てんきが よければ、おてらの にわを あるきたいです。', en: 'Sounds good. If the weather is nice, I want to walk in the temple garden.' },
      { who: 'npc', name: 'さくら', jp: 'ええ。朝 京都駅に 着いたら、電話して くださいね。', kana: 'ええ。あさ きょうとえきに ついたら、でんわして くださいね。', en: 'Yes. When you arrive at Kyoto Station in the morning, please call me.' },
      { who: 'you', jp: 'わかりました。また 明日！', kana: 'わかりました。また あした！', en: 'Got it. See you tomorrow!' },
    ],
  },
  {
    id: 's7',
    chapter: 10,
    level: 'N4',
    title: 'デパートの 案内所（敬語）',
    setting: 'Asking a department store concierge for the souvenir floor and tax-free counter using polite requests.',
    lines: [
      { who: 'npc', name: '受付', jp: 'いらっしゃいませ。ご案内所で ございます。', kana: 'いらっしゃいませ。ごあんないじょで ございます。', en: 'Welcome. This is the information desk.' },
      { who: 'you', jp: 'すみません、お土産の 売り場は 何階ですか。', kana: 'すみません、おみやげの うりばは なんがいですか。', en: 'Excuse me, what floor is the souvenir section on?' },
      { who: 'npc', name: '受付', jp: 'お土産で いらっしゃいますね。地下一階で ございます。', kana: 'おみやげで いらっしゃいますね。ちかいっかいで ございます。', en: 'Souvenirs, right? That is on the 1st basement floor.' },
      { who: 'you', jp: 'カードを 使う ことは できますか。', kana: 'カードを つかう ことは できますか。', en: 'Is it possible to use a credit card?' },
      { who: 'npc', name: '受付', jp: 'はい、お使いに なれます。エレベーターへ ご案内いたします。', kana: 'はい、おつかいに なれます。エレベーターへ ごあんない いたします。', en: 'Yes, you can use it. I will guide you to the elevator.' },
      { who: 'you', jp: 'ご親切に ありがとうございます。', kana: 'ごしんせつに ありがとうございます。', en: 'Thank you very much for your kindness.' },
    ],
  },
];
