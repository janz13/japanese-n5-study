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
  {
    id: 'ch3-asakusa',
    level: 'N5',
    chapter: 3,
    title: 'あさくさの おてら',
    titleEn: 'Temple in Asakusa',
    paragraphs: [
      p('土曜日|どようび|Saturday', '、', '友だち|ともだち|friend', 'の', 'さくら||Sakura', 'と', '浅草|あさくさ|Asakusa', 'へ', '行きました|いきました|went', '。'),
      p('駅|えき|station', 'の', '前|まえ|in front', 'に', '赤い|あかい|red', '門|もん|gate', 'が', 'あります||there is', '。'),
      p('そこ||there', 'に', '人|ひと|people', 'が', 'たくさん||many', 'いました||were', '。'),
      p('わたしたち||we', 'は', '写真|しゃしん|photo', 'を', '撮って|とって|took (and)', '、', 'おかし||sweets', 'を', '食べました|たべました|ate', '。'),
      p('とても||very', 'たのしかった||was fun', 'です', '。'),
    ],
    translation: [
      'On Saturday, I went to Asakusa with my friend Sakura.',
      'In front of the station, there is a red gate.',
      'There were many people there.',
      'We took photos and ate sweets.',
      'It was very fun.',
    ],
    questions: [
      { q: 'アナさんは だれと 浅草へ 行きましたか。', options: ['ひとり', 'さくらさん', 'お父さん'], answer: 1 },
      { q: '駅の 前に 何が ありますか。', options: ['赤い 門', '白い ビル', '大きい 山'], answer: 0 },
      { q: '二人は 何を 食べましたか。', options: ['すし', 'ラーメン', 'おかし'], answer: 2 },
    ],
  },
  {
    id: 'ch4-weekend',
    level: 'N5',
    chapter: 4,
    title: 'しゅうまつの よてい',
    titleEn: 'Weekend Plans',
    paragraphs: [
      p('来週|らいしゅう|next week', 'は', '学校|がっこう|school', 'が', '休み|やすみ|holiday', 'です', '。'),
      p('アナ', 'は', '新幹線|しんかんせん|bullet train', 'で', '京都|きょうと|Kyoto', 'へ', '行きたい|いきたい|want to go', 'です', '。'),
      p('古い|ふるい|old', 'お寺|おてら|temple', 'を', '見たり|みたり|see (among things)', '、', '抹茶|まっちゃ|matcha', 'を', '飲んだり|のんだり|drink (among things)', 'したい||want to do', 'です', '。'),
      p('だから||therefore', '、', '今晩|こんばん|tonight', 'きっぷ||ticket', 'を', '買います|かいます|will buy', '。'),
    ],
    translation: [
      'Next week school is on holiday.',
      'Ana wants to go to Kyoto by bullet train.',
      'She wants to do things like see old temples and drink matcha.',
      'So tonight she will buy a ticket.',
    ],
    questions: [
      { q: 'アナさんは どこへ 行きたいですか。', options: ['東京', '京都', '大阪'], answer: 1 },
      { q: '何で 京都へ 行きますか。', options: ['バス', '飛行機', '新幹線'], answer: 2 },
      { q: '今晩 何を しますか。', options: ['きっぷを 買います', '抹茶を 飲みます', '友だちに 会います'], answer: 0 },
    ],
  },
];
