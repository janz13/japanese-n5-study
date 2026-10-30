/** A token is a word in the story. `r` = reading (furigana) when it contains kanji. */
export interface Token {
  t: string;
  r?: string;
  en?: string;
}

export interface Question {
  q: string;
  options: string[];
  answer: number;
}

export interface Story {
  id: string;
  level: 'N5' | 'N4';
  chapter: number;
  title: string;
  titleEn: string;
  /** Each paragraph is a list of tokens. */
  paragraphs: Token[][];
  translation: string[];
  questions: Question[];
}

// Helper: build tokens quickly. Format "word|reading|meaning", reading optional.
const p = (...parts: string[]): Token[] =>
  parts.map((s) => {
    const [t, r, en] = s.split('|');
    return { t, r: r || undefined, en: en || undefined };
  });

export const STORIES: Story[] = [
  {
    id: 'ch1-arrival',
    level: 'N5',
    chapter: 1,
    title: 'とうきょうへ',
    titleEn: 'To Tokyo',
    paragraphs: [
      p('わたし||I', 'は', 'アナ||Ana', 'です||is', '。'),
      p('アメリカ||America', 'から', '来ました|きました|came', '。'),
      p('今日|きょう|today', 'は', '東京|とうきょう|Tokyo', 'に', '着きました|つきました|arrived', '。'),
      p('空港|くうこう|airport', 'は', 'とても||very', '大きい|おおきい|big', 'です', '。'),
      p('駅|えき|station', 'で', '電車|でんしゃ|train', 'に', '乗りました|のりました|rode', '。'),
      p('窓|まど|window', 'から', '山|やま|mountain', 'が', '見えました|みえました|could see', '。', 'きれい||pretty', 'でした||was', '。'),
    ],
    translation: [
      'I am Ana.',
      'I came from America.',
      'Today I arrived in Tokyo.',
      'The airport is very big.',
      'At the station I took a train.',
      'I could see mountains from the window. They were pretty.',
    ],
    questions: [
      { q: 'アナさんは どこから 来ましたか。', options: ['にほん', 'アメリカ', 'ちゅうごく'], answer: 1 },
      { q: '空港は どうでしたか。', options: ['小さい', '大きい', 'ふるい'], answer: 1 },
      { q: '電車の 窓から 何が 見えましたか。', options: ['うみ', 'やま', 'かわ'], answer: 1 },
    ],
  },
  {
    id: 'ch2-cafe',
    level: 'N5',
    chapter: 2,
    title: 'きっさてんで',
    titleEn: 'At the Café',
    paragraphs: [
      p('朝|あさ|morning', '、', 'アナ', 'は', '喫茶店|きっさてん|café', 'に', '行きました|いきました|went', '。'),
      p('店員|てんいん|clerk', '：「', 'いらっしゃいませ||welcome', '。」'),
      p('アナ', '：「', 'コーヒー||coffee', 'を', '一つ|ひとつ|one', 'ください||please', '。」'),
      p('店員', '：「', 'はい||yes', '。', '三百円|さんびゃくえん|300 yen', 'です', '。」'),
      p('コーヒー', 'は', '少し|すこし|a little', '高い|たかい|expensive', 'です', 'が', '、', 'おいしい||tasty', 'です', '。'),
    ],
    translation: [
      'In the morning, Ana went to a café.',
      'Clerk: "Welcome."',
      'Ana: "One coffee, please."',
      'Clerk: "Sure. That is 300 yen."',
      'The coffee is a little expensive, but it is tasty.',
    ],
    questions: [
      { q: 'アナさんは 何を 飲みましたか。', options: ['おちゃ', 'コーヒー', 'みず'], answer: 1 },
      { q: 'いくら でしたか。', options: ['100円', '300円', '500円'], answer: 1 },
    ],
  },
];
