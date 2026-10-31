/**
 * A token is a word in the story.
 * `r` = reading (furigana). For multi-kanji compounds, `parts` can specify exact per-kanji readings
 * e.g. parts: [['東','とう'], ['京','きょう']] so each kanji gets its own centered <ruby> tag.
 */
export interface Token {
  t: string;
  r?: string;
  en?: string;
  parts?: [string, string?][];
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
  paragraphs: Token[][];
  translation: string[];
  questions: Question[];
}

/**
 * Format: "word|reading|meaning"
 * In `word`, you can optionally write per-kanji furigana segments separated by `.`
 * e.g. "東.京|とう.きょう|Tokyo" or "着.きました|つ.|arrived"
 */
const p = (...items: string[]): Token[] =>
  items.map((s) => {
    const [rawT, rawR, en] = s.split('|');
    if (rawT.includes('.') && rawR) {
      const tSegs = rawT.split('.');
      const rSegs = rawR.split('.');
      const parts: [string, string?][] = tSegs.map((seg, i) => [seg, rSegs[i] || undefined]);
      return {
        t: tSegs.join(''),
        r: rSegs.map((r, i) => r || tSegs[i]).join(''),
        en: en || undefined,
        parts,
      };
    }
    return { t: rawT, r: rawR || undefined, en: en || undefined };
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
      p('アメリカ||America', 'から', '来.ました|き.|came', '。'),
      p('今日|きょう|today', 'は', '東.京|とう.きょう|Tokyo', 'に', '着.きました|つ.|arrived', '。'),
      p('空.港|くう.こう|airport', 'は', 'とても||very', '大.きい|おお.|big', 'です', '。'),
      p('駅|えき|station', 'で', '電.車|でん.しゃ|train', 'に', '乗.りました|の.|rode', '。'),
      p('窓|まど|window', 'から', '山|やま|mountain', 'が', '見.えました|み.|could see', '。', 'きれい||pretty', 'でした||was', '。'),
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
      p('朝|あさ|morning', '、', 'アナ', 'は', '喫.茶.店|きっ.さ.てん|café', 'に', '行.きました|い.|went', '。'),
      p('店.員|てん.いん|clerk', '：「', 'いらっしゃいませ||welcome', '。」'),
      p('アナ', '：「', 'コーヒー||coffee', 'を', '一.つ|ひと.|one', 'ください||please', '。」'),
      p('店.員|てん.いん|clerk', '：「', 'はい||yes', '。', '三.百.円|さん.びゃく.えん|300 yen', 'です', '。」'),
      p('コーヒー', 'は', '少.し|すこ.|a little', '高.い|たか.|expensive', 'です', 'が', '、', 'おいしい||tasty', 'です', '。'),
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
      p('土.曜.日|ど.よう.び|Saturday', '、', '友.だち|とも.|friend', 'の', 'さくら||Sakura', 'と', '浅.草|あさ.くさ|Asakusa', 'へ', '行.きました|い.|went', '。'),
      p('駅|えき|station', 'の', '前|まえ|in front', 'に', '赤.い|あか.|red', '門|もん|gate', 'が', 'あります||there is', '。'),
      p('そこ||there', 'に', '人|ひと|people', 'が', 'たくさん||many', 'いました||were', '。'),
      p('わたしたち||we', 'は', '写.真|しゃ.しん|photo', 'を', '撮.って|と.|took (and)', '、', 'おかし||sweets', 'を', '食.べました|た.|ate', '。'),
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
      p('来.週|らい.しゅう|next week', 'は', '学.校|がっ.こう|school', 'が', '休.み|やす.|holiday', 'です', '。'),
      p('アナ', 'は', '新.幹.線|しん.かん.せん|bullet train', 'で', '京.都|きょう.と|Kyoto', 'へ', '行.きたい|い.|want to go', 'です', '。'),
      p('古.い|ふる.|old', 'お.寺|.てら|temple', 'を', '見.たり|み.|see (among things)', '、', '抹.茶|まっ.ちゃ|matcha', 'を', '飲.んだり|の.|drink (among things)', 'したい||want to do', 'です', '。'),
      p('だから||therefore', '、', '今.晩|こん.ばん|tonight', 'きっぷ||ticket', 'を', '買.います|か.|will buy', '。'),
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
