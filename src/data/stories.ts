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
      p('店員|てんいん|clerk', '：「', 'はい||yes', '。', '三百円|さんびゃくえん|300 yen', 'です', '。」'),
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
  {
    id: 'ch5-shinkansen',
    level: 'N5',
    chapter: 5,
    title: 'しんかんせんで きょうとへ',
    titleEn: 'Shinkansen to Kyoto',
    paragraphs: [
      p('土曜日|どようび|Saturday', 'の', '朝|あさ|morning', '、', 'アナ', 'は', '東京駅|とうきょうえき|Tokyo Station', 'へ', '行きました|いきました|went', '。'),
      p('駅|えき|station', 'で', '駅弁|えきべん|station bento', 'を', '買いました|かいました|bought', '。', '千二百円|せんにひゃくえん|1,200 yen', 'でした', '。'),
      p('電車|でんしゃ|train', 'の', '中|なか|inside', 'で', '車掌|しゃしょう|conductor', 'さん', 'に', '「', 'すみません||excuse me', '、', 'この', '席|せき|seat', 'は', 'どこ||where', 'ですか', '」', 'と', '聞きました|ききました|asked', '。'),
      p('車掌|しゃしょう|conductor', 'さん', 'は', '「', '七号車|ななごうしゃ|car no. 7', 'です', '。', 'こちら||this way', 'へ', 'どうぞ||please', '」', 'と', '言いました|いいました|said', '。'),
      p('アナ', 'は', '「', '窓|まど|window', 'を', '開けても|あけても|even if (I) open', 'いいですか||is it okay', '」', 'と', '聞きました|ききました|asked', '。', 'でも||but', '、', '新幹線|しんかんせん|bullet train', 'の', '窓|まど|window', 'は', '開きません|あきません|doesn\'t open', '。'),
      p('窓|まど|window', 'から', '富士山|ふじさん|Mt. Fuji', 'が', '見えました|みえました|could see', '。', 'アナ', 'は', '写真|しゃしん|photo', 'を', 'たくさん||a lot', '撮りました|とりました|took', '。'),
    ],
    translation: [
      'On Saturday morning, Ana went to Tokyo Station.',
      'At the station she bought an ekiben (station bento). It was 1,200 yen.',
      'On the train she asked the conductor, "Excuse me, where is this seat?"',
      'The conductor said, "It\'s car no. 7. This way, please."',
      'Ana asked, "May I open the window?" But shinkansen windows don\'t open.',
      'She could see Mt. Fuji from the window. Ana took lots of photos.',
    ],
    questions: [
      { q: 'アナさんは 駅で 何を 買いましたか。', options: ['きっぷ', '駅弁', 'お茶'], answer: 1 },
      { q: 'アナさんの 席は 何号車ですか。', options: ['三号車', '五号車', '七号車'], answer: 2 },
      { q: '窓から 何が 見えましたか。', options: ['富士山', '海', 'お寺'], answer: 0 },
    ],
  },
  {
    id: 'ch6-akihabara',
    level: 'N5',
    chapter: 6,
    title: 'あきはばらで かいもの',
    titleEn: 'Shopping in Akihabara',
    paragraphs: [
      p('京都|きょうと|Kyoto', 'から', '帰って|かえって|returned and', '、', 'アナ', 'は', '秋葉原|あきはばら|Akihabara', 'へ', '行きました|いきました|went', '。'),
      p('大きい|おおきい|big', '電気屋|でんきや|electronics store', 'に', '入りました|はいりました|entered', '。', 'カメラ||camera', 'は', '五階|ごかい|5th floor', 'に', 'ありました', '。'),
      p('店員|てんいん|shop clerk', 'さん', 'に', '「', 'この', 'カメラ||camera', 'は', 'いくら||how much', 'ですか', '」', 'と', '聞きました|ききました|asked', '。'),
      p('「', '三万円|さんまんえん|30,000 yen', 'です', '。', 'こちら||this one', 'は', '二万円|にまんえん|20,000 yen', 'です', '」'),
      p('アナ', 'は', '「', '黒い|くろい|black', 'ほう||the ... one', 'が', '白い|しろい|white', 'の', 'より||than', '軽い|かるい|light', 'ですね', '」', 'と', '言いました|いいました|said', '。'),
      p('アナ', 'は', '黒い|くろい|black', 'カメラ||camera', 'を', '買いました|かいました|bought', '。', 'それから||after that', '、', 'ゲームセンター||arcade', 'で', '遊びました|あそびました|played', '。'),
    ],
    translation: [
      'After returning from Kyoto, Ana went to Akihabara.',
      'She went into a big electronics store. Cameras were on the 5th floor.',
      'She asked the clerk, "How much is this camera?"',
      '"It\'s 30,000 yen. This one is 20,000 yen."',
      'Ana said, "The black one is lighter than the white one, isn\'t it."',
      'Ana bought the black camera. After that, she played at an arcade.',
    ],
    questions: [
      { q: 'カメラは 何階に ありましたか。', options: ['三階', '五階', '七階'], answer: 1 },
      { q: 'アナさんは どちらの カメラを 買いましたか。', options: ['白い カメラ', '黒い カメラ', '買いませんでした'], answer: 1 },
      { q: 'それから どこで 遊びましたか。', options: ['公園', 'カフェ', 'ゲームセンター'], answer: 2 },
    ],
  },
];
