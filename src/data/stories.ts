/**
 * Comprehensive Graded Japanese Stories Catalog
 * 32 Graded Stories across 4 distinct genres:
 * - Daily Life & Travel (Chapters 1-10)
 * - Folklore & Legends (Chapters 11-18)
 * - Real-World Functional Media (Chapters 19-26)
 * - Detective Mini-Mysteries (Chapters 27-32)
 */

export type StoryCategory = 'daily_life' | 'folklore' | 'functional_media' | 'mini_mystery';
export type FuriganaMode = 'all' | 'tap' | 'none';

/** A token is a word in the story. `r` = reading (furigana), `en` = English gloss. */
export interface Token {
  t: string;
  r?: string;
  en?: string;
}

export interface Question {
  q: string;
  options: string[];
  answer: number;
  explain?: string;
}

export interface SentenceData {
  id: string;
  jp: string;
  tokens: Token[];
  en: string;
  audioText: string;
  grammarNote?: string;
}

export interface VocabularyNote {
  word: string;
  reading?: string;
  meaning: string;
  jlpt?: 'N5' | 'N4';
}

export interface Story {
  id: string;
  level: 'N5' | 'N4';
  chapter: number;
  title: string;
  titleEn: string;
  category: StoryCategory;
  synopsis?: string;
  /** Each paragraph is a list of tokens (backwards-compatible). */
  paragraphs: Token[][];
  translation: string[];
  sentences: SentenceData[];
  vocabularyNotes?: VocabularyNote[];
  questions: Question[];
}

/** Helper: build tokens quickly. Format "word|reading|meaning", reading optional. */
export const p = (...parts: string[]): Token[] =>
  parts.map((s) => {
    const [t, r, en] = s.split('|');
    return { t, r: r || undefined, en: en || undefined };
  });

export function makeStory(def: {
  id: string;
  level: 'N5' | 'N4';
  chapter: number;
  title: string;
  titleEn: string;
  category: StoryCategory;
  synopsis?: string;
  sentences: Array<{
    id?: string;
    tokens: Token[];
    en: string;
    audioText?: string;
    grammarNote?: string;
  }>;
  vocabularyNotes?: VocabularyNote[];
  questions: Question[];
}): Story {
  const fullSentences: SentenceData[] = def.sentences.map((s, idx) => ({
    id: s.id ?? `s${idx + 1}`,
    jp: s.tokens.map((t) => t.t).join(''),
    tokens: s.tokens,
    en: s.en,
    audioText: s.audioText ?? s.tokens.map((t) => t.r ?? t.t).join(''),
    grammarNote: s.grammarNote,
  }));

  return {
    id: def.id,
    level: def.level,
    chapter: def.chapter,
    title: def.title,
    titleEn: def.titleEn,
    category: def.category,
    synopsis: def.synopsis,
    paragraphs: fullSentences.map((s) => s.tokens),
    translation: fullSentences.map((s) => s.en),
    sentences: fullSentences,
    vocabularyNotes: def.vocabularyNotes ?? [],
    questions: def.questions,
  };
}

export const STORIES: Story[] = [
  // ==========================================================================
  // CATEGORY 1: DAILY LIFE & TRAVEL (Chapters 1 - 10)
  // ==========================================================================
  makeStory({
    id: 'ch1-arrival',
    level: 'N5',
    chapter: 1,
    title: 'とうきょうへ',
    titleEn: 'To Tokyo',
    category: 'daily_life',
    synopsis: 'Ana arrives at Narita airport and rides the train into Tokyo, seeing Mt. Fuji.',
    sentences: [
      { tokens: p('わたし||I', 'は', 'アナ||Ana', 'です||is', '。'), en: 'I am Ana.' },
      { tokens: p('アメリカ||America', 'から', '来ました|きました|came', '。'), en: 'I came from America.' },
      { tokens: p('今日|きょう|today', 'は', '東京|とうきょう|Tokyo', 'に', '着きました|つきました|arrived', '。'), en: 'Today I arrived in Tokyo.' },
      { tokens: p('空港|くうこう|airport', 'は', 'とても||very', '大きい|おおきい|big', 'です', '。'), en: 'The airport is very big.' },
      { tokens: p('駅|えき|station', 'で', '電車|でんしゃ|train', 'に', '乗りました|のりました|rode', '。'), en: 'At the station I took a train.' },
      { tokens: p('窓|まど|window', 'から', '山|やま|mountain', 'が', '見えました|みえました|could see', '。', 'きれい||pretty', 'でした||was', '。'), en: 'I could see mountains from the window. They were pretty.' },
    ],
    vocabularyNotes: [
      { word: '空港', reading: 'くうこう', meaning: 'airport', jlpt: 'N5' },
      { word: '着く', reading: 'つく', meaning: 'to arrive', jlpt: 'N5' },
      { word: '電車', reading: 'でんしゃ', meaning: 'train', jlpt: 'N5' },
      { word: '窓', reading: 'まど', meaning: 'window', jlpt: 'N5' },
    ],
    questions: [
      { q: 'アナさんは どこから 来ましたか。', options: ['にほん', 'アメリカ', 'ちゅうごく'], answer: 1, explain: '「アメリカから 来ました」と 書いてあります。' },
      { q: '空港は どうでしたか。', options: ['小さい', '大きい', 'ふるい'], answer: 1, explain: '「空港は とても 大きい です」と 述べています。' },
      { q: '電車の 窓から 何が 見えましたか。', options: ['うみ', 'やま', 'かわ'], answer: 1, explain: '「窓から 山が 見えました」と あります。' },
    ],
  }),

  makeStory({
    id: 'ch2-cafe',
    level: 'N5',
    chapter: 2,
    title: 'きっさてんで',
    titleEn: 'At the Café',
    category: 'daily_life',
    synopsis: 'Ana orders morning coffee at a traditional Japanese kissaten.',
    sentences: [
      { tokens: p('朝|あさ|morning', '、', 'アナ', 'は', '喫茶店|きっさてん|café', 'に', '行きました|いきました|went', '。'), en: 'In the morning, Ana went to a café.' },
      { tokens: p('店員|てんいん|clerk', '：「', 'いらっしゃいませ||welcome', '。」'), en: 'Clerk: "Welcome."' },
      { tokens: p('アナ', '：「', 'コーヒー||coffee', 'を', '一つ|ひとつ|one', 'ください||please', '。」'), en: 'Ana: "One coffee, please."' },
      { tokens: p('店員|てんいん|clerk', '：「', 'はい||yes', '。', '三百円|さんびゃくえん|300 yen', 'です', '。」'), en: 'Clerk: "Sure. That is 300 yen."' },
      { tokens: p('コーヒー', 'は', '少し|すこし|a little', '高い|たかい|expensive', 'です', 'が', '、', 'おいしい||tasty', 'です', '。'), en: 'The coffee is a little expensive, but it is tasty.' },
    ],
    vocabularyNotes: [
      { word: '喫茶店', reading: 'きっさてん', meaning: 'traditional coffee shop / café', jlpt: 'N5' },
      { word: '店員', reading: 'てんいん', meaning: 'store clerk', jlpt: 'N5' },
      { word: '一つ', reading: 'ひとつ', meaning: 'one item (general counter)', jlpt: 'N5' },
    ],
    questions: [
      { q: 'アナさんは 何を 飲みましたか。', options: ['おちゃ', 'コーヒー', 'みず'], answer: 1, explain: '「コーヒーを 一つ ください」と 注文しました。' },
      { q: 'いくら でしたか。', options: ['100円', '300円', '500円'], answer: 1, explain: '店員が「三百円です」と 答えました。' },
    ],
  }),

  makeStory({
    id: 'ch3-asakusa',
    level: 'N5',
    chapter: 3,
    title: 'あさくさの おてら',
    titleEn: 'Temple in Asakusa',
    category: 'daily_life',
    synopsis: 'Visiting Sensoji Temple in Asakusa with friend Sakura.',
    sentences: [
      { tokens: p('土曜日|どようび|Saturday', '、', '友だち|ともだち|friend', 'の', 'さくら||Sakura', 'と', '浅草|あさくさ|Asakusa', 'へ', '行きました|いきました|went', '。'), en: 'On Saturday, I went to Asakusa with my friend Sakura.' },
      { tokens: p('駅|えき|station', 'の', '前|まえ|in front', 'に', '赤い|あかい|red', '門|もん|gate', 'が', 'あります||there is', '。'), en: 'In front of the station, there is a red gate.' },
      { tokens: p('そこ||there', 'に', '人|ひと|people', 'が', 'たくさん||many', 'いました||were', '。'), en: 'There were many people there.' },
      { tokens: p('わたしたち||we', 'は', '写真|しゃしん|photo', 'を', '撮って|とって|took (and)', '、', 'おかし||sweets', 'を', '食べました|たべました|ate', '。'), en: 'We took photos and ate sweets.' },
      { tokens: p('とても||very', 'たのしかった||was fun', 'です', '。'), en: 'It was very fun.' },
    ],
    vocabularyNotes: [
      { word: '浅草', reading: 'あさくさ', meaning: 'Asakusa historic district', jlpt: 'N5' },
      { word: '門', reading: 'もん', meaning: 'gate (e.g. Kaminarimon)', jlpt: 'N5' },
      { word: '写真', reading: 'しゃしん', meaning: 'photograph', jlpt: 'N5' },
    ],
    questions: [
      { q: 'アナさんは だれと 浅草へ 行きましたか。', options: ['ひとり', 'さくらさん', 'お父さん'], answer: 1, explain: '「友だちの さくらと 浅草へ 行きました」と あります。' },
      { q: '駅の 前に 何が ありますか。', options: ['赤い 門', '白い ビル', '大きい 山'], answer: 0, explain: '「赤い門が あります」と あります。雷門のことです。' },
      { q: '二人は 何を 食べましたか。', options: ['すし', 'ラーメン', 'おかし'], answer: 2, explain: '「おかしを 食べました」と あります。' },
    ],
  }),

  makeStory({
    id: 'ch4-weekend',
    level: 'N5',
    chapter: 4,
    title: 'しゅうまつの よてい',
    titleEn: 'Weekend Plans',
    category: 'daily_life',
    synopsis: 'Planning a weekend shinkansen trip to Kyoto to drink matcha and see temples.',
    sentences: [
      { tokens: p('来週|らいしゅう|next week', 'は', '学校|がっこう|school', 'が', '休み|やすみ|holiday', 'です', '。'), en: 'Next week school is on holiday.' },
      { tokens: p('アナ', 'は', '新幹線|しんかんせん|bullet train', 'で', '京都|きょうと|Kyoto', 'へ', '行きたい|いきたい|want to go', 'です', '。'), en: 'Ana wants to go to Kyoto by bullet train.' },
      { tokens: p('古い|ふるい|old', 'お寺|おてら|temple', 'を', '見たり|みたり|see (among things)', '、', '抹茶|まっちゃ|matcha', 'を', '飲んだり|のんだり|drink (among things)', 'したい||want to do', 'です', '。'), en: 'She wants to do things like see old temples and drink matcha.' },
      { tokens: p('だから||therefore', '、', '今晩|こんばん|tonight', 'きっぷ||ticket', 'を', '買います|かいます|will buy', '。'), en: 'So tonight she will buy a ticket.' },
    ],
    vocabularyNotes: [
      { word: '新幹線', reading: 'しんかんせん', meaning: 'bullet train', jlpt: 'N5' },
      { word: '抹茶', reading: 'まっちゃ', meaning: 'powdered green tea', jlpt: 'N5' },
      { word: '今晩', reading: 'こんばん', meaning: 'tonight / this evening', jlpt: 'N5' },
    ],
    questions: [
      { q: 'アナさんは どこへ 行きたいですか。', options: ['東京', '京都', '大阪'], answer: 1, explain: '「京都へ 行きたいです」と 明記されています。' },
      { q: '何で 京都へ 行きますか。', options: ['バス', '飛行機', '新幹線'], answer: 2, explain: '「新幹線で」と 書かれています。' },
      { q: '今晩 何を しますか。', options: ['きっぷを 買います', '抹茶を 飲みます', '友だちに 会います'], answer: 0, explain: '「今晩 きっぷを 買います」と あります。' },
    ],
  }),

  makeStory({
    id: 'ch5-shinkansen',
    level: 'N5',
    chapter: 5,
    title: 'しんかんせんで きょうとへ',
    titleEn: 'Shinkansen to Kyoto',
    category: 'daily_life',
    synopsis: 'Boarding the Nozomi Shinkansen, eating an ekiben, and viewing Mt. Fuji.',
    sentences: [
      { tokens: p('土曜日|どようび|Saturday', 'の', '朝|あさ|morning', '、', 'アナ', 'は', '東京駅|とうきょうえき|Tokyo Station', 'へ', '行きました|いきました|went', '。'), en: 'On Saturday morning, Ana went to Tokyo Station.' },
      { tokens: p('駅|えき|station', 'で', '駅弁|えきべん|station bento', 'を', '買いました|かいました|bought', '。', '千二百円|せんにひゃくえん|1,200 yen', 'でした', '。'), en: 'At the station she bought an ekiben (station bento). It was 1,200 yen.' },
      { tokens: p('電車|でんしゃ|train', 'の', '中|なか|inside', 'で', '車掌|しゃしょう|conductor', 'さん', 'に', '「', 'すみません||excuse me', '、', 'この', '席|せき|seat', 'は', 'どこ||where', 'ですか', '」', 'と', '聞きました|ききました|asked', '。'), en: 'On the train she asked the conductor, "Excuse me, where is this seat?"' },
      { tokens: p('車掌|しゃしょう|conductor', 'さん', 'は', '「', '七号車|ななごうしゃ|car no. 7', 'です', '。', 'こちら||this way', 'へ', 'どうぞ||please', '」', 'と', '言いました|いいました|said', '。'), en: 'The conductor said, "It\'s car no. 7. This way, please."' },
      { tokens: p('アナ', 'は', '「', '窓|まど|window', 'を', '開けても|あけても|even if (I) open', 'いいですか||is it okay', '」', 'と', '聞きました|ききました|asked', '。', 'でも||but', '、', '新幹線|しんかんせん|bullet train', 'の', '窓|まど|window', 'は', '開きません|あきません|doesn\'t open', '。'), en: 'Ana asked, "May I open the window?" But shinkansen windows don\'t open.' },
      { tokens: p('窓|まど|window', 'から', '富士山|ふじさん|Mt. Fuji', 'が', '見えました|みえました|could see', '。', 'アナ', 'は', '写真|しゃしん|photo', 'を', 'たくさん||a lot', '撮りました|とりました|took', '。'), en: 'She could see Mt. Fuji from the window. Ana took lots of photos.' },
    ],
    vocabularyNotes: [
      { word: '駅弁', reading: 'えきべん', meaning: 'boxed train station lunch', jlpt: 'N5' },
      { word: '車掌', reading: 'しゃしょう', meaning: 'train conductor', jlpt: 'N5' },
      { word: '富士山', reading: 'ふじさん', meaning: 'Mount Fuji', jlpt: 'N5' },
    ],
    questions: [
      { q: 'アナさんは 駅で 何を 買いましたか。', options: ['きっぷ', '駅弁', 'お茶'], answer: 1, explain: '「駅弁を 買いました」と あります。' },
      { q: 'アナさんの 席は 何号車ですか。', options: ['三号車', '五号車', '七号車'], answer: 2, explain: '車掌が「七号車です」と 案内しました。' },
      { q: '窓から 何が 見えましたか。', options: ['富士山', '海', 'お寺'], answer: 0, explain: '「窓から 富士山が 見えました」と あります。' },
    ],
  }),

  makeStory({
    id: 'ch6-akihabara',
    level: 'N5',
    chapter: 6,
    title: 'あきはばらで かいもの',
    titleEn: 'Shopping in Akihabara',
    category: 'daily_life',
    synopsis: 'Comparing electronics cameras and exploring the retro arcade in Akihabara.',
    sentences: [
      { tokens: p('京都|きょうと|Kyoto', 'から', '帰って|かえって|returned and', '、', 'アナ', 'は', '秋葉原|あきはばら|Akihabara', 'へ', '行きました|いきました|went', '。'), en: 'After returning from Kyoto, Ana went to Akihabara.' },
      { tokens: p('大きい|おおきい|big', '電気屋|でんきや|electronics store', 'に', '入りました|はいりました|entered', '。', 'カメラ||camera', 'は', '五階|ごかい|5th floor', 'に', 'ありました', '。'), en: 'She went into a big electronics store. Cameras were on the 5th floor.' },
      { tokens: p('店員|てんいん|shop clerk', 'さん', 'に', '「', 'この', 'カメラ||camera', 'は', 'いくら||how much', 'ですか', '」', 'と', '聞きました|ききました|asked', '。'), en: 'She asked the clerk, "How much is this camera?"' },
      { tokens: p('「', '三万円|さんまんえん|30,000 yen', 'です', '。', 'こちら||this one', 'は', '二万円|にまんえん|20,000 yen', 'です', '」'), en: '"It\'s 30,000 yen. This one is 20,000 yen."' },
      { tokens: p('アナ', 'は', '「', '黒い|くろい|black', 'ほう||the ... one', 'が', '白い|しろい|white', 'の', 'より||than', '軽い|かるい|light', 'ですね', '」', 'と', '言いました|いいました|said', '。'), en: 'Ana said, "The black one is lighter than the white one, isn\'t it."' },
      { tokens: p('アナ', 'は', '黒い|くろい|black', 'カメラ||camera', 'を', '買いました|かいました|bought', '。', 'それから||after that', '、', 'ゲームセンター||arcade', 'で', '遊びました|あそびました|played', '。'), en: 'Ana bought the black camera. After that, she played at an arcade.' },
    ],
    vocabularyNotes: [
      { word: '電気屋', reading: 'でんきや', meaning: 'electronics retail shop', jlpt: 'N5' },
      { word: '軽い', reading: 'かるい', meaning: 'light in weight', jlpt: 'N5' },
      { word: '五階', reading: 'ごかい', meaning: '5th floor', jlpt: 'N5' },
    ],
    questions: [
      { q: 'カメラは 何階に ありましたか。', options: ['三階', '五階', '七階'], answer: 1, explain: '「カメラは 五階に ありました」と あります。' },
      { q: 'アナさんは どちらの カメラを 買いましたか。', options: ['白い カメラ', '黒い カメラ', '買いませんでした'], answer: 1, explain: '「黒い カメラを 買いました」と あります。' },
      { q: 'それから どこで 遊びましたか。', options: ['公園', 'カフェ', 'ゲームセンター'], answer: 2, explain: '「ゲームセンターで 遊びました」と あります。' },
    ],
  }),

  makeStory({
    id: 'ch7-onsen',
    level: 'N4',
    chapter: 7,
    title: 'はじめての おんせん',
    titleEn: 'My First Hot Spring',
    category: 'daily_life',
    synopsis: 'Learning onsen etiquette and enjoying a relaxing ryokan in Hakone.',
    sentences: [
      { tokens: p('アナ', 'は', '日本|にほん|Japan', 'の', '温泉|おんせん|hot spring', 'に', '行った|いった|went', 'ことが||experience', 'ありません', 'でした', '。'), en: 'Ana had never been to a Japanese hot spring.' },
      { tokens: p('週末|しゅうまつ|weekend', '、', '友だち|ともだち|friend', 'の', 'サクラ', 'さん', 'と', '箱根|はこね|Hakone', 'へ', '行く|いく|go', 'つもり||intend to', 'です', '。'), en: 'This weekend she plans to go to Hakone with her friend Sakura.' },
      { tokens: p('サクラ', 'さん', 'は', '「', '温泉|おんせん|hot spring', 'に', '入る|はいる|enter', '前|まえ|before', 'に', '、', '体|からだ|body', 'を', '洗わなければ|あらわなければ|must wash', 'なりません', 'よ', '」', 'と', '言いました|いいました|said', '。'), en: 'Sakura said, "Before you get into the hot spring, you must wash your body."' },
      { tokens: p('「', 'タオル||towel', 'を', 'お湯|おゆ|hot water', 'に', '入れて|いれて|put in', 'は', 'いけません', '」', 'とも||also', '言いました|いいました|said', '。'), en: 'She also said, "You must not put your towel in the water."' },
      { tokens: p('温泉|おんせん|hot spring', 'に', '入った|はいった|entered', '後|あと|after', 'で', '、', '旅館|りょかん|inn', 'で', '晩ご飯|ばんごはん|dinner', 'を', '食べました|たべました|ate', '。'), en: 'After the hot spring, they ate dinner at the ryokan.' },
      { tokens: p('アナ', 'は', '「', 'また||again', '来たい|きたい|want to come', 'です', '」', 'と', '思いました|おもいました|thought', '。'), en: 'Ana thought, "I want to come again."' },
    ],
    vocabularyNotes: [
      { word: '温泉', reading: 'おんせん', meaning: 'hot spring', jlpt: 'N4' },
      { word: '旅館', reading: 'りょかん', meaning: 'traditional Japanese inn', jlpt: 'N4' },
      { word: 'お湯', reading: 'おゆ', meaning: 'hot water / bath water', jlpt: 'N5' },
    ],
    questions: [
      { q: 'アナさんは 温泉に 行った ことが ありましたか。', options: ['はい、あります', 'いいえ、ありませんでした', '毎週 行きます'], answer: 1, explain: '「行った ことが ありませんでした」と 述べています。' },
      { q: '温泉に 入る 前に 何を しなければ なりませんか。', options: ['体を 洗う', 'ご飯を 食べる', '写真を 撮る'], answer: 0, explain: '「体を 洗わなければ なりません」が 温泉のマナーです。' },
      { q: 'お湯に 入れては いけない ものは 何ですか。', options: ['足', 'タオル', '手'], answer: 1, explain: '「タオルを お湯に 入れては いけません」と 注意されました。' },
    ],
  }),

  makeStory({
    id: 'ch8-goodbye',
    level: 'N4',
    chapter: 8,
    title: 'さようなら、とうきょう',
    titleEn: 'Goodbye, Tokyo',
    category: 'daily_life',
    synopsis: 'Ana prepares to return home, reflecting on friendships and language growth.',
    sentences: [
      { tokens: p('来月|らいげつ|next month', '、', 'アナ', 'は', 'アメリカ||America', 'へ', '帰ります|かえります|return', '。'), en: 'Next month, Ana will return to America.' },
      { tokens: p('日本|にほん|Japan', 'に', '来て|きて|came and', 'から', '、', '日本語|にほんご|Japanese', 'が', '話せる|はなせる|can speak', 'ように||so that', 'なりました', '。'), en: 'Since coming to Japan, she has become able to speak Japanese.' },
      { tokens: p('アナ', 'は', '「', '日本|にほん|Japan', 'の', '生活|せいかつ|life', 'は', '楽しかった|たのしかった|was fun', 'けど||but', '、', '時々|ときどき|sometimes', 'さびしかった||was lonely', '」', 'と', '言いました|いいました|said', '。'), en: 'Ana said, "Life in Japan was fun, but sometimes I was lonely."' },
      { tokens: p('サクラ', 'さん', 'は', 'アナ', 'に', 'お守り|おまもり|amulet', 'を', 'くれました||gave (me)', '。'), en: 'Sakura gave Ana an omamori (good-luck charm).' },
      { tokens: p('アナ', 'は', '「', 'いつか||someday', 'また||again', '日本|にほん|Japan', 'に', '住んで|すんで|live', 'みたい||want to try', 'です', '」', 'と', '言いました|いいました|said', '。'), en: 'Ana said, "Someday I want to try living in Japan again."' },
    ],
    vocabularyNotes: [
      { word: 'お守り', reading: 'おまもり', meaning: 'protective shrine charm', jlpt: 'N4' },
      { word: '生活', reading: 'せいかつ', meaning: 'daily life / lifestyle', jlpt: 'N4' },
      { word: '話せる', reading: 'はなせる', meaning: 'can speak (potential form of 話す)', jlpt: 'N4' },
    ],
    questions: [
      { q: 'アナさんは いつ アメリカへ 帰りますか。', options: ['来週', '来月', '来年'], answer: 1, explain: '「来月、アナは アメリカへ 帰ります」と あります。' },
      { q: 'サクラさんは アナさんに 何を くれましたか。', options: ['お守り', '本', 'カメラ'], answer: 0, explain: '「お守りを くれました」と あります。' },
      { q: 'アナさんは いつか 何を して みたいですか。', options: ['日本に 住む', '温泉を 作る', '先生に なる'], answer: 0, explain: '「また 日本に 住んでみたいです」と 述べています。' },
    ],
  }),

  makeStory({
    id: 'ch9-kyoto',
    level: 'N4',
    chapter: 9,
    title: '京都の もみじと 約束',
    titleEn: 'Kyoto Autumn Leaves & Conditionals',
    category: 'daily_life',
    synopsis: 'Mastering conditional expressions while exploring the scarlet maple leaves of Kyoto.',
    sentences: [
      { tokens: p('秋|あき|autumn', 'に', 'なる|なる|become', 'と||whenever', '、', '京都|きょうと|Kyoto', 'の', '山|やま|mountain', 'は', '赤く|あかく|red', 'なります', '。'), en: 'When autumn comes, the mountains of Kyoto turn red.' },
      { tokens: p('ケン', 'さん', 'は', '「', '京都|きょうと|Kyoto', 'へ', '行く|いく|go', 'なら||if going to', '、', '朝|あさ|morning', '早く|はやく|early', '出た|でた|departed', 'ほうが||had better', 'いいですよ', '」', 'と', '言いました|いいました|said', '。'), en: 'Ken said, "If you are going to Kyoto, it is better to leave early in the morning."' },
      { tokens: p('「', '天気が|てんきが|weather', 'よければ||if good', '、', 'お寺|おてら|temple', 'の', '庭|にわ|garden', 'を', '歩きましょう|あるきましょう|let us walk', '。', '」'), en: '"If the weather is good, let’s walk through the temple garden."' },
      { tokens: p('「', 'もし||if by chance', '雨が|あめが|rain', '降ったら|ふったら|if it falls', '、', '駅|えき|station', 'の', '近く|ちかく|nearby', 'の', '美術館|びじゅつかん|art museum', 'へ', '行きましょう|いきましょう|let us go', '。', '」'), en: '"If by chance it rains, let’s go to the art museum near the station."' },
      { tokens: p('京都駅|きょうとえき|Kyoto Station', 'に', '着いたら|ついたら|when we arrived', '、', 'とても||very', 'いい', '天気|てんき|weather', 'でした', '。'), en: 'When they arrived at Kyoto Station, the weather was wonderful.' },
    ],
    vocabularyNotes: [
      { word: 'もみじ', reading: 'もみじ', meaning: 'red autumn maple leaves', jlpt: 'N4' },
      { word: '美術館', reading: 'びじゅつかん', meaning: 'art museum', jlpt: 'N4' },
      { word: '庭', reading: 'にわ', meaning: 'garden', jlpt: 'N5' },
    ],
    questions: [
      { q: '秋に なると、京都の 山は どう なりますか。', options: ['赤く なります', '白く なります', '暗く なります'], answer: 0, explain: '「赤く なります」と 書かれています。' },
      { q: '雨が 降ったら、どこへ 行きますか。', options: ['お寺の 庭', '駅の 近くの 美術館', '箱根の 温泉'], answer: 1, explain: '「駅の 近くの 美術館へ 行きましょう」と 提案しました。' },
      { q: '京都駅に 着いた とき、天気は どうでしたか。', options: ['雨でした', 'とても いい 天気でした', '雪でした'], answer: 1, explain: '「とても いい 天気でした」と 結ばれています。' },
    ],
  }),

  makeStory({
    id: 'ch10-keigo',
    level: 'N4',
    chapter: 10,
    title: 'デパートの 案内所',
    titleEn: 'Department Store Concierge (Keigo)',
    category: 'daily_life',
    synopsis: 'Experiencing polite Japanese customer service and humble language at a Tokyo department store.',
    sentences: [
      { tokens: p('アナ', 'は', '家族|かぞく|family', 'への', 'お土産|おみやげ|souvenir', 'を', '買い|かい|buy', 'に', '、', '東京|とうきょう|Tokyo', 'の', 'デパート||department store', 'へ', '行きました|いきました|went', '。'), en: 'Ana went to a department store in Tokyo to buy souvenirs for her family.' },
      { tokens: p('案内所|あんないじょ|information desk', 'の', '店員|てんいん|clerk', 'さん', 'は', '「', 'いらっしゃいませ||welcome', '。', '何を|なにを|what', 'お探しで|おさがしで|looking for (honorific)', 'いらっしゃいますか||are you (honorific)', '」', 'と', '聞きました|ききました|asked', '。'), en: 'The clerk at the information desk asked, "Welcome. What are you looking for?"' },
      { tokens: p('アナ', 'は', '「', '日本の|にほんの|Japanese', 'お茶|おちゃ|tea', 'を', '買いたい|かいたい|want to buy', 'のですが、', 'どこに', 'ありますか', '」', 'と', '聞きました|ききました|asked', '。'), en: 'Ana asked, "I would like to buy Japanese green tea; where is it?"' },
      { tokens: p('店員|てんいん|clerk', 'さん', 'は', '「', 'お茶|おちゃ|tea', 'の', '売り場|うりば|counter', 'は', '地下|ちか|basement', '一階|いっかい|1st floor', 'で', 'ございます||is (polite)', '。', '私が|わたしが|I', 'ご案内|ごあんない|guide', 'いたします||will do (humble)', '」', 'と', '言いました|いいました|said', '。'), en: 'The clerk said, "The tea counter is on the first basement floor. I will guide you."' },
      { tokens: p('レジ||register', 'で', '「', 'カードを', 'お使いに|おつかいに|use (honorific)', 'なりますか', '」', 'と', '聞かれて|きかれて|was asked', '、', 'アナ', 'は', '礼儀正しい|れいぎただしい|polite', '敬語|けいご|keigo', 'が', 'よく', '分かりました|わかりました|understood', '。'), en: 'When asked at the register, "Will you be using a card?", Ana understood the polite keigo very well.' },
    ],
    vocabularyNotes: [
      { word: '案内所', reading: 'あんないじょ', meaning: 'information desk', jlpt: 'N4' },
      { word: 'お土産', reading: 'おみやげ', meaning: 'souvenir gift', jlpt: 'N5' },
      { word: '売り場', reading: 'うりば', meaning: 'sales floor / counter', jlpt: 'N4' },
      { word: '地下', reading: 'ちか', meaning: 'basement', jlpt: 'N5' },
    ],
    questions: [
      { q: 'お茶の 売り場は どこに ありますか。', options: ['地下一階', '三階', '屋上'], answer: 0, explain: '店員が「地下 一階で ございます」と 答えました。' },
      { q: '「私が ご案内いたします」は どの 敬語ですか。', options: ['謙譲語 (Humble)', '尊敬語 (Honorific)', 'タメ口 (Casual)'], answer: 0, explain: '「ご〜いたします」は 自分の行為をへりくだる謙譲語です。' },
      { q: 'レジで 店員さんは 何と 聞きましたか。', options: ['カードを お使いに なりますか', 'どこから 来ましたか', '何時に 帰りますか'], answer: 0, explain: '「カードを お使いに なりますか」と 丁寧に尋ねられました。' },
    ],
  }),

  // ==========================================================================
  // CATEGORY 2: JAPANESE FOLKLORE & LEGENDS (Chapters 11 - 18)
  // ==========================================================================
  makeStory({
    id: 'ch11-momotaro',
    level: 'N5',
    chapter: 11,
    title: 'ももたろう',
    titleEn: 'Momotaro the Peach Boy',
    category: 'folklore',
    synopsis: 'The legendary tale of the brave boy born from a giant floating peach who befriends animals to defeat ogres.',
    sentences: [
      { tokens: p('昔々|むかしむかし|long long ago', '、', 'ある', '所|ところ|place', 'に', 'おじいさんと', 'おばあさんが', '住んで|すんで|living', 'いました', '。'), en: 'Long, long ago, in a certain place, an old man and an old woman were living.' },
      { tokens: p('おばあさんが', '川|かわ|river', 'で', '洗濯|せんたく|laundry', 'を', 'していると', '、', '大きな|おおきな|big', '桃|もも|peach', 'が', '流れて|ながれて|floating', 'きました', '。'), en: 'While the old woman was doing laundry at the river, a giant peach came floating down.' },
      { tokens: p('桃|もも|peach', 'の', '中|なか|inside', 'から', '元気な|げんきな|healthy', '男の子|おとこのこ|boy', 'が', '生まれました|うまれました|was born', '。'), en: 'From inside the peach, a vigorous healthy baby boy was born.' },
      { tokens: p('男の子|おとこのこ|boy', 'は', '「', '桃太郎|ももたろう|Momotaro', '」', 'と', '名付けられました|なづけられました|was named', '。'), en: 'The boy was named "Momotaro" (Peach Boy).' },
      { tokens: p('桃太郎|ももたろう|Momotaro', 'は', '犬|いぬ|dog', 'と', '猿|さる|monkey', 'と', 'キジ||pheasant', 'に', 'きびだんご||millet dumpling', 'を', 'あげて', '、', '鬼ヶ島|おにがしま|Ogre Island', 'へ', '行きました|いきました|went', '。'), en: 'Momotaro gave millet dumplings to a dog, a monkey, and a pheasant, and set off for Ogre Island.' },
    ],
    vocabularyNotes: [
      { word: '昔々', reading: 'むかしむかし', meaning: 'once upon a time', jlpt: 'N5' },
      { word: '洗濯', reading: 'せんたく', meaning: 'laundry / washing', jlpt: 'N5' },
      { word: '鬼', reading: 'おに', meaning: 'demon / ogre', jlpt: 'N5' },
      { word: '桃', reading: 'もも', meaning: 'peach', jlpt: 'N5' },
    ],
    questions: [
      { q: '桃は どこから 流れて きましたか。', options: ['海から', '川から', '山から'], answer: 1, explain: 'おばあさんが「川で 洗濯をしていると」桃が流れてきました。' },
      { q: '桃の中から だれが 生まれましたか。', options: ['元気な 男の子', 'かわいい 女の子', '小さい 犬'], answer: 0, explain: '元気な男の子が生まれ、桃太郎と名付けられました。' },
      { q: '桃太郎は 動物たちに 何を あげましたか。', options: ['きびだんご', 'りんご', 'おにぎり'], answer: 0, explain: '「きびだんごを あげて」仲間を作りました。' },
    ],
  }),

  makeStory({
    id: 'ch12-urashima',
    level: 'N5',
    chapter: 12,
    title: 'うらしまたろう',
    titleEn: 'Urashima Taro and the Sea Turtle',
    category: 'folklore',
    synopsis: 'A kind fisherman saves a sea turtle and visits the mythical underwater Dragon Palace.',
    sentences: [
      { tokens: p('優しい|やさしい|kind', '漁師|りょうし|fisherman', 'の', '浦島太郎|うらしまたろう|Urashima Taro', 'は', '、', '浜辺|はまべ|beach', 'で', 'いじめられて|いじめられて|bullied', 'いた', '亀|かめ|turtle', 'を', '助けました|たすけました|rescued', '。'), en: 'A kind fisherman named Urashima Taro rescued a turtle being bullied on the beach.' },
      { tokens: p('亀|かめ|turtle', 'は', 'お礼|おれい|thanks', 'に', '太郎|たろう|Taro', 'を', '背中|せなか|back', 'に', '乗せて|のせて|placed on', '、', '竜宮城|りゅうぐうじょう|Dragon Palace', 'へ', '案内|あんない|guided', 'しました', '。'), en: 'In gratitude, the turtle took Taro on its back and guided him to the Dragon Palace.' },
      { tokens: p('竜宮城|りゅうぐうじょう|Dragon Palace', 'では', '乙姫|おとひめ|Princess Otohime', '様が', '美しい|うつくしい|beautiful', '踊り|おどり|dance', 'と', 'ごちそう||feast', 'で', 'もてなしました|もてなしました|entertained', '。'), en: 'At the Dragon Palace, Princess Otohime welcomed him with feasts and beautiful dances.' },
      { tokens: p('帰る|かえる|return', '時|とき|time', '、', '乙姫|おとひめ|Princess', '様は', '「', '決して|けっして|never', '開けては|あけては|open', 'いけません', '」', 'と', '玉手箱|たまてばこ|jeweled box', 'を', '渡しました|わたしました|handed', '。'), en: 'When departing, Princess Otohime gave him a treasure box warning: "Never open it."' },
      { tokens: p('村|むら|village', 'に', '戻る|もどる|returned', 'と', '三百年|さんびゃくねん|300 years', 'が', '過ぎて|すぎて|passed', 'おり', '、', '箱|はこ|box', 'を', '開けると|あけると|when opened', '白髪|しらが|white hair', 'の', 'おじいさんに', 'なりました', '。'), en: 'Returning to his village, 300 years had elapsed; when he opened the box, white smoke made him an old man.' },
    ],
    vocabularyNotes: [
      { word: '亀', reading: 'かめ', meaning: 'sea turtle', jlpt: 'N5' },
      { word: '助ける', reading: 'たすける', meaning: 'to save / rescue', jlpt: 'N5' },
      { word: '竜宮城', reading: 'りゅうぐうじょう', meaning: 'mythical Undersea Dragon Castle', jlpt: 'N4' },
      { word: '玉手箱', reading: 'たまてばこ', meaning: 'treasure box', jlpt: 'N4' },
    ],
    questions: [
      { q: '太郎は 浜辺で 何を 助けましたか。', options: ['犬', '亀', '鳥'], answer: 1, explain: '子供たちにいじめられていた「亀を 助けました」。' },
      { q: '乙姫様は 太郎に 何を 渡しましたか。', options: ['玉手箱', 'きんか', 'お酒'], answer: 0, explain: '開けてはならない「玉手箱」を授けました。' },
      { q: '箱を 開けると、太郎は どう なりましたか。', options: ['おじいさんになった', '魚になった', '子供になった'], answer: 0, explain: '白い煙が出て、一瞬で白髪のおじいさんになってしまいました。' },
    ],
  }),

  makeStory({
    id: 'ch13-kaguya',
    level: 'N5',
    chapter: 13,
    title: '竹取物語・かぐやひめ',
    titleEn: 'Princess Kaguya',
    category: 'folklore',
    synopsis: 'Japan’s oldest recorded narrative: the glowing bamboo maiden who came from the Moon.',
    sentences: [
      { tokens: p('昔|むかし|past', '、', '竹|たけ|bamboo', 'を', '取る|とる|harvest', 'おじいさんが', '光る|ひかる|shining', '竹|たけ|bamboo', 'を', '見つけました|みつけました|found', '。'), en: 'In ancient times, an old bamboo cutter found a miraculously glowing bamboo stalk.' },
      { tokens: p('中|なか|inside', 'を', '見ると|みると|when he looked', '、', '三寸|さんずん|tiny', 'ばかりの', 'とても|とても|very', 'かわいい', '女の子|おんなのこ|girl', 'が', 'いました', '。'), en: 'Looking inside, there was a tiny, lovely girl just three inches tall.' },
      { tokens: p('女の子|おんなのこ|girl', 'は', '「', 'かぐや姫|かぐやひめ|Princess Kaguya', '」', 'と', '名付けられ|なづけられ|named', '、', 'すくすくと', '美しく|うつくしく|beautifully', '育ちました|そだちました|grew up', '。'), en: 'The girl was named "Princess Kaguya" and grew up with radiant grace.' },
      { tokens: p('多くの|おおくの|many', '貴族|きぞく|nobles', 'が', '求婚|きゅうこん|proposal', 'しましたが', '、', '不可能な|ふかのうな|impossible', '宝物|たからもの|treasures', 'を', '求めて|もとめて|demanded', '断りました|ことわりました|refused', '。'), en: 'Many nobles courted her, but she turned them away asking for impossible treasures.' },
      { tokens: p('八月|はちがつ|August', 'の', '満月|まんげつ|full moon', 'の', '夜|よる|night', '、', 'かぐや姫|かぐやひめ|Kaguya', 'は', '月|つき|moon', 'の', '使者|ししゃ|emissaries', 'と', '共に|ともに|together', '天|てん|heavens', 'へ', '帰りました|かえりました|returned', '。'), en: 'On the night of the August full moon, Princess Kaguya returned to the celestial Moon Palace.' },
    ],
    vocabularyNotes: [
      { word: '竹', reading: 'たけ', meaning: 'bamboo', jlpt: 'N5' },
      { word: '光る', reading: 'ひかる', meaning: 'to shine / glow', jlpt: 'N5' },
      { word: '満月', reading: 'まんげつ', meaning: 'full moon', jlpt: 'N4' },
      { word: '宝物', reading: 'たからもの', meaning: 'treasure', jlpt: 'N4' },
    ],
    questions: [
      { q: 'おじいさんは どこで かわいい 女の子を 見つけましたか。', options: ['光る 竹の中', '川の 中', '木の 上'], answer: 0, explain: '「光る 竹を 見つけました。中を見ると 女の子が いました」と あります。' },
      { q: '女の子の 名前は 何ですか。', options: ['さくら姫', 'かぐや姫', 'うめ姫'], answer: 1, explain: '「かぐや姫」と名付けられました。' },
      { q: '満月の 夜、かぐや姫は どこへ 帰りましたか。', options: ['海の 底', '月', 'お城'], answer: 1, explain: '「月の使者と共に 天（月）へ 帰りました」。' },
    ],
  }),

  makeStory({
    id: 'ch14-tsuru',
    level: 'N4',
    chapter: 14,
    title: 'つるの おんがえし',
    titleEn: 'The Grateful Crane',
    category: 'folklore',
    synopsis: 'A rescued crane assumes human form to weave exquisite brocade, testing human promises.',
    sentences: [
      { tokens: p('ある', '冬|ふゆ|winter', 'の', '日|ひ|day', '、', '貧しい|まずしい|poor', '若者|わかもの|young man', 'が', '罠|わな|snare', 'に', 'かかった', '鶴|つる|crane', 'を', '助けました|たすけました|rescued', '。'), en: 'One winter day, a poor young man freed a crane trapped in a hunter’s snare.' },
      { tokens: p('その', '夜|よる|night', '、', '美しい|うつくしい|beautiful', '女性|じょせい|woman', 'が', '家|いえ|house', 'を', '訪ねて|たずねて|visited', '来て|きて|came', '、', '妻|つま|wife', 'に', 'なりました', '。'), en: 'That night, a beautiful maiden visited his cottage and asked to become his wife.' },
      { tokens: p('彼女|かのじょ|she', 'は', '「', '決して|けっして|never', '部屋|へや|room', 'を', '覗かないで|のぞかないで|do not peek', 'ください', '」', 'と', '言って|いって|said', '、', '美しい|うつくしい|gorgeous', '布|ぬの|cloth', 'を', '織りました|おりました|wove', '。'), en: 'She wove breathtaking silk fabric, insisting: "Please never peek inside the loom room."' },
      { tokens: p('若者|わかもの|young man', 'は', '約束|やくそく|promise', 'を', '破って|やぶって|broke', '部屋|へや|room', 'を', '覗いて|のぞいて|peeked', 'しまいました', '。'), en: 'Overcome by curiosity, the young man broke his promise and peeked inside.' },
      { tokens: p('そこには', '自分の|じぶんの|own', '羽|はね|feathers', 'を', '抜いて|ぬいて|plucking', '布|ぬの|cloth', 'を', '織る|おる|weave', '鶴|つる|crane', 'の', '姿|すがた|form', 'が', 'ありました', '。'), en: 'There, plucking her own pure white feathers to weave the cloth, stood the crane.' },
    ],
    vocabularyNotes: [
      { word: '鶴', reading: 'つる', meaning: 'crane (bird of fortune)', jlpt: 'N4' },
      { word: '恩返し', reading: 'おんがえし', meaning: 'repaying a debt of gratitude', jlpt: 'N4' },
      { word: '約束', reading: 'やくそく', meaning: 'promise', jlpt: 'N5' },
      { word: '布', reading: 'ぬの', meaning: 'cloth / woven fabric', jlpt: 'N4' },
    ],
    questions: [
      { q: '若者は 冬の日に どんな 動物を 助けましたか。', options: ['鶴', '狐', '熊'], answer: 0, explain: '罠にかかっていた「鶴を 助けました」。' },
      { q: '女性は 布を 織る とき、若者に 何を 頼みましたか。', options: ['手伝ってほしい', '部屋を 覗かないでほしい', '歌を 歌ってほしい'], answer: 1, explain: '「決して 部屋を 覗かないでください」と 約束しました。' },
      { q: '部屋の 中で 女性の 正体は 何でしたか。', options: ['鶴', '蝶', '猫'], answer: 0, explain: '自分の羽を抜いて布を織る「鶴の姿」でした。' },
    ],
  }),

  makeStory({
    id: 'ch15-omusubi',
    level: 'N4',
    chapter: 15,
    title: 'おむすび ころりん',
    titleEn: 'The Rolling Rice Ball',
    category: 'folklore',
    synopsis: 'A humble woodcutter drops an omusubi into a mouse hole and is gifted hospitality and treasure.',
    sentences: [
      { tokens: p('木こり|きこり|woodcutter', 'の', 'おじいさんが', '山|やま|mountain', 'で', 'お弁当|おべんとう|lunchbox', 'を', '開けました|あけました|opened', '。'), en: 'An old woodcutter opened his lunchbox on the mountain.' },
      { tokens: p('手|て|hand', 'から', 'おむすび||rice ball', 'が', 'すべって|すべって|slipped', '、', '穴|あな|hole', 'へ', 'ころころと', '転がって|ころがって|rolled', '落ちました|おちました|fell', '。'), en: 'A rice ball slipped from his hand and went tumbling right down a deep hole.' },
      { tokens: p('穴|あな|hole', 'の', '奥|おく|depths', 'から', '「', 'おむすび|おむすび|rice ball', 'ころりん|ころりん|tumbling', 'すっとんとん|すっとんとん|plop', '」', 'と', '楽しい|たのしい|merry', '歌|うた|song', 'が', '聞こえました|きこえました|could hear', '。'), en: 'From deep inside the hole, cheerful singing echoed: "Omusubi rolling, rolling, plop!"' },
      { tokens: p('おじいさんが', '穴|あな|hole', 'を', 'のぞくと', '、', 'ねずみ達が|ねずみたちが|mice', '楽しそうに|たのしそうに|delightfully', '餅|もち|mochi', 'を', 'ついて|ついて|pounding', 'いました', '。'), en: 'Peering into the burrow, the old man found friendly mice happily pounding rice cakes.' },
      { tokens: p('親切な|しんせつな|kind', 'おじいさんは', 'ねずみから', '小判|こばん|gold coins', 'の', '入った|はいった|filled', 'つづら||wicker basket', 'を', 'もらいました|もらいました|received', '。'), en: 'For his kindness, the mice presented the gentle old man with a basket brimming with gold coins.' },
    ],
    vocabularyNotes: [
      { word: 'おむすび', reading: 'おむすび', meaning: 'rice ball (onigiri)', jlpt: 'N5' },
      { word: '転がる', reading: 'ころがる', meaning: 'to roll / tumble', jlpt: 'N4' },
      { word: '小判', reading: 'こばん', meaning: 'Edo-era oval gold coin', jlpt: 'N4' },
    ],
    questions: [
      { q: '穴の中へ 何が 転がり 落ちましたか。', options: ['おむすび', '帽子', '水筒'], answer: 0, explain: '「手から おむすびが すべって、穴へ 落ちました」。' },
      { q: '穴の中で 歌っていたのは だれですか。', options: ['ねずみ達', 'うさぎ達', '小鳥達'], answer: 0, explain: '穴の奥でねずみ達が楽しそうに歌い餅をついていました。' },
      { q: '親切な おじいさんは 何を もらいましたか。', options: ['小判の 入った つづら', '大きい 石', '新しい 斧'], answer: 0, explain: '小判がぎっしり詰まったつづらをお礼にもらいました。' },
    ],
  }),

  makeStory({
    id: 'ch16-suzume',
    level: 'N4',
    chapter: 16,
    title: 'したきりすずめ',
    titleEn: 'The Tongue-Cut Sparrow',
    category: 'folklore',
    synopsis: 'Humility and greed contrasted when a grandfather visits the hidden country of the sparrows.',
    sentences: [
      { tokens: p('心優しい|こころやさしい|gentle-hearted', 'おじいさんは', '怪我|けが|injury', 'を', 'した', '小鳥|ことり|small bird', 'の', '雀|すずめ|sparrow', 'を', '可愛がって|かわいがって|cared for', 'いました', '。'), en: 'A kind-hearted old man tenderly cared for an injured little sparrow.' },
      { tokens: p('ある日|あるひ|one day', '、', '雀|すずめ|sparrow', 'が', '糊|のり|starch', 'を', '食べて|たべて|ate', 'しまい', '、', '怒った|おこった|angry', 'おばあさんに', '舌|した|tongue', 'を', '切られて|きられて|cut', '逃げました|にげました|fled', '。'), en: 'One day the sparrow ate laundry starch, and the furious old woman clipped its tongue and chased it away.' },
      { tokens: p('おじいさんは', '山|やま|mountain', 'の', '奥|おく|deep', 'へ', '雀|すずめ|sparrow', 'を', '探しに|さがしに|to search', '行きました|いきました|went', '。'), en: 'The saddened grandfather traveled deep into the bamboo forest to seek his little sparrow.' },
      { tokens: p('雀の宿|すずめのやど|sparrow home', 'で', '大歓迎|だいかんげい|warm welcome', 'され', '、', '軽い|かるい|light', '小さい|ちいさい|small', 'つづら||basket', 'を', '選びました|えらびました|chose', '。'), en: 'At the sparrow sanctuary, welcomed warmly, he humbly selected the smallest and lightest wicker basket.' },
      { tokens: p('中|なか|inside', 'から', '宝物|たからもの|treasures', 'が', 'たくさん|たくさん|plenty', '出ました|でました|emerged', 'が', '、', '欲張りな|よくばりな|greedy', 'おばあさんが', '重い|おもい|heavy', '箱|はこ|box', 'を', '開けると|あけると|when opened', 'お化け|おばけ|monsters', 'が', '出ました|でました|emerged', '。'), en: 'The small basket contained treasures; but when the greedy grandmother seized the heaviest box, monsters leaped out.' },
    ],
    vocabularyNotes: [
      { word: '雀', reading: 'すずめ', meaning: 'sparrow', jlpt: 'N4' },
      { word: '舌', reading: 'した', meaning: 'tongue', jlpt: 'N4' },
      { word: '欲張り', reading: 'よくばり', meaning: 'greedy / covetous', jlpt: 'N4' },
      { word: '宝物', reading: 'たからもの', meaning: 'treasure', jlpt: 'N4' },
    ],
    questions: [
      { q: 'おじいさんは どんな つづらを 選びましたか。', options: ['軽い 小さい つづら', '重い 大きい つづら', '一番 高い つづら'], answer: 0, explain: '欲のないおじいさんは「軽い 小さい つづら」を選びました。' },
      { q: 'おばあさんの 重い箱から 何が 出てきましたか。', options: ['お化け', '金貨', 'お米'], answer: 0, explain: '欲張りなおばあさんの箱からは「お化け」が飛び出しました。' },
      { q: 'おじいさんの 小さい箱には 何が 入っていましたか。', options: ['たくさんの 宝物', '石ころ', '水'], answer: 0, explain: '謙虚なおじいさんの箱には宝物がいっぱい入っていました。' },
    ],
  }),

  makeStory({
    id: 'ch17-bunbuku',
    level: 'N4',
    chapter: 17,
    title: 'ぶんぶくちゃがま',
    titleEn: 'Bunbuku Chagama (The Magic Teakettle)',
    category: 'folklore',
    synopsis: 'A shapeshifting tanuki disguised as an iron teakettle walks the tightrope to repay a junk dealer’s affection.',
    sentences: [
      { tokens: p('古道具屋|ふるどうぐや|junk dealer', 'の', '男|おとこ|man', 'が', '罠|わな|trap', 'から', '狸|たぬき|raccoon dog', 'を', '助けて|たすけて|saved', '逃がしました|にがしました|released', '。'), en: 'A secondhand junk dealer freed a raccoon dog (tanuki) from a poacher’s snare.' },
      { tokens: p('その', '夜|よる|night', '、', '狸|たぬき|tanuki', 'は', 'お礼|おれい|gratitude', 'に', '茶釜|ちゃがま|iron kettle', 'に', '化けて|ばけて|transformed', '戻りました|もどりました|returned', '。'), en: 'That night, the grateful tanuki transformed into an ornate iron tea kettle to help the poor dealer.' },
      { tokens: p('寺|てら|temple', 'の', '和尚|おしょう|priest', 'が', '茶釜|ちゃがま|kettle', 'を', '火|ひ|fire', 'に', 'かけると|かけると|put on', '、「', '熱い|あつい|hot', '！」と', '叫んで|さけんで|screaming', '頭|あたま|head', 'と', '手足|てあし|limbs', 'を', '出しました|だしました|sprouted', '。'), en: 'When a temple priest heated it over charcoal, it yelled "Hot!" and popped out a furry head, tail, and paws.' },
      { tokens: p('男|おとこ|man', 'と', '狸|たぬき|tanuki', 'は', '綱渡り|つなわたり|tightrope', 'の', '見世物小屋|みせものごや|circus show', 'を', '始めました|はじめました|started', '。'), en: 'The junk dealer and the clever tanuki launched a tightrope acrobatics show.' },
      { tokens: p('「', 'ぶんぶく|ぶんぶく|good luck', '茶釜|ちゃがま|teakettle', '」は', '大人気|だいにんき|huge hit', 'になり', '、', '二人は|ふたりは|the two', '幸せに|しあわせに|happily', '暮らしました|くらしました|lived', '。'), en: 'The "Bunbuku Chagama" show became a nationwide sensation, and both lived in comfort and joy.' },
    ],
    vocabularyNotes: [
      { word: '狸', reading: 'たぬき', meaning: 'Japanese raccoon dog / shapeshifter', jlpt: 'N4' },
      { word: '茶釜', reading: 'ちゃがま', meaning: 'iron teakettle for chanoyu', jlpt: 'N4' },
      { word: '化ける', reading: 'ばける', meaning: 'to disguise / shapeshift into', jlpt: 'N4' },
    ],
    questions: [
      { q: '狸は 何の 形に 化けましたか。', options: ['茶釜', '招き猫', '刀'], answer: 0, explain: '恩返しのために「茶釜（鉄のケトル）」に化けました。' },
      { q: '火に かけられた 茶釜は 何を しましたか。', options: ['頭と 手足を 出した', '割れてしまった', '消えた'], answer: 0, explain: '熱さに耐えかねて頭と手足を出して逃げ回りました。' },
      { q: '狸と 男は どんな 見せ物で 有名に なりましたか。', options: ['綱渡り', '水泳', '相撲'], answer: 0, explain: '茶釜の姿のまま「綱渡り」を披露して大人気になりました。' },
    ],
  }),

  makeStory({
    id: 'ch18-warashibe',
    level: 'N4',
    chapter: 18,
    title: 'わらしべちょうじゃ',
    titleEn: 'The Straw Millionaire',
    category: 'folklore',
    synopsis: 'Trusting a deity’s advice, a penniless traveler trades a single piece of straw all the way to a great estate.',
    sentences: [
      { tokens: p('貧乏な|びんぼうな|penniless', '若者|わかもの|young man', 'が', '観音様|かんのんさま|Goddess Kannon', 'に', '「', '助けて|たすけて|help', 'ください', '」と', '祈りました|いのりました|prayed', '。'), en: 'A penniless young man prayed devoutly at the temple of the merciful Goddess Kannon.' },
      { tokens: p('「', '寺|てら|temple', 'を', '出る|でる|leave', 'とき', '最初|さいしょ|first', 'に', '触った|さわった|touched', 'もの', 'を', '大切に|たいせつに|carefully', '持ちなさい|もちなさい|hold', '」と', '告げられました|つげられました|was told', '。'), en: 'A divine voice advised: "Cherish the very first object your hands touch upon leaving the gate."' },
      { tokens: p('門|もん|gate', 'を', '出た|でた|left', '若者|わかもの|young man', 'は', '転んで|ころんで|tripped', '、', '一本の|いっぽんの|one piece', '藁|わら|straw', 'を', '掴みました|つかみました|grabbed', '。'), en: 'Stumbling outside the gate, he caught himself and grasped a single stalk of straw.' },
      { tokens: p('藁|わら|straw', 'に', 'アブ||horsefly', 'を', '結ぶと|むすぶと|tied', '、', '泣く|なく|crying', '子供|こども|child', 'が', '欲しがり|ほしがり|wanted', '、', '蜜柑|みかん|mandarin oranges', 'と', '交換|こうかん|traded', 'しました', '。'), en: 'Tying an insect to entertain a weeping infant, the grateful mother traded three sweet oranges for it.' },
      { tokens: p('蜜柑|みかん|oranges', 'が', '反物|たんもの|silk bolt', 'に', '、', '反物|たんもの|silk', 'が', '馬|うま|horse', 'に', '、', '最後は|さいごは|in the end', '大屋敷|おおやしき|mansion', 'に', '変わり|かわり|turned into', '長者|ちょうじゃ|millionaire', 'に', 'なりました', '。'), en: 'The oranges traded for silk, the silk for a horse, and the horse for a grand manor—making him a wealthy lord.' },
    ],
    vocabularyNotes: [
      { word: '藁', reading: 'わら', meaning: 'straw', jlpt: 'N4' },
      { word: '長者', reading: 'ちょうじゃ', meaning: 'wealthy magnate / millionaire', jlpt: 'N4' },
      { word: '蜜柑', reading: 'みかん', meaning: 'mandarin orange', jlpt: 'N5' },
      { word: '交換', reading: 'こうかん', meaning: 'exchange / trade', jlpt: 'N4' },
    ],
    questions: [
      { q: '若者が 門を 出て 最初に つかんだ 物は 何ですか。', options: ['一本の 藁', '金貨', 'リンゴ'], answer: 0, explain: '転んだときに「一本の 藁（わらしべ）」を掴みました。' },
      { q: '藁は 最初 何と 交換されましたか。', options: ['蜜柑', '馬', '反物'], answer: 0, explain: '子供が欲しがり、お礼に「蜜柑（みかん）」と交換しました。' },
      { q: '最後には 若者は 何を 手に 入れましたか。', options: ['立派な 大屋敷', '小さい 舟', '新しい 靴'], answer: 0, explain: '物々交換を重ねて「大屋敷」を譲り受け、長者になりました。' },
    ],
  }),

  // ==========================================================================
  // CATEGORY 3: REAL-WORLD FUNCTIONAL MEDIA (Chapters 19 - 26)
  // ==========================================================================
  makeStory({
    id: 'ch19-train-notice',
    level: 'N5',
    chapter: 19,
    title: 'ちかてつの ごあんない',
    titleEn: 'Train Station Construction Notice',
    category: 'functional_media',
    synopsis: 'An authentic Tokyo Metro platform bulletin explaining late-night barrier installation and shuttle transfers.',
    sentences: [
      { tokens: p('地下鉄|ちかてつ|subway', 'の', '駅|えき|station', 'に', '新しい|あたらしい|new', '工事|こうじ|construction', 'の', 'お知らせ|おしらせ|notice', 'が', '貼ってあります|はってあります|is posted', '。'), en: 'A new construction notice is posted on the subway station bulletin board.' },
      { tokens: p('ホームドア||platform barrier doors', 'の', '設置|せっち|installation', '工事|こうじ|work', 'のため', '、', '今週|こんしゅう|this week', 'の', '土曜日|どようび|Saturday', 'の', '夜|よる|night', 'は', '一部|いちぶ|partial', '電車|でんしゃ|train', 'が', '止まります|とまります|stop', '。'), en: 'Due to platform door installation, some trains will stop operating this Saturday night.' },
      { tokens: p('午後|ごご|p.m.', '十一時|じゅういちじ|11:00', 'から', '終電|しゅうでん|last train', 'まで', '、', '代行バス|だいこうバス|shuttle bus', 'が', '運転|うんてん|operate', 'します', '。'), en: 'From 11:00 PM until the last train, substitute shuttle buses will run between stations.' },
      { tokens: p('ご利用の|ごりようの|traveling', 'お客様|おきゃくさま|passengers', 'は', '東口|ひがしぐち|east exit', 'の', 'バス停|バスてい|bus stop', 'へ', 'お越し|おこし|come', 'ください', '。'), en: 'Passengers please proceed to the temporary bus stop outside the East Exit.' },
      { tokens: p('ご迷惑|ごめいわく|inconvenience', 'を', 'おかけしますが|おかけしますが|we apologize for', '、', 'ご協力|ごきょうりょく|cooperation', 'を', 'お願い|おねがい|request', 'いたします', '。'), en: 'We sincerely apologize for the inconvenience and appreciate your cooperation.' },
    ],
    vocabularyNotes: [
      { word: '工事', reading: 'こうじ', meaning: 'construction work', jlpt: 'N4' },
      { word: 'お知らせ', reading: 'おしらせ', meaning: 'announcement / notice', jlpt: 'N5' },
      { word: '終電', reading: 'しゅうでん', meaning: 'last train of the night', jlpt: 'N4' },
      { word: '東口', reading: 'ひがしぐち', meaning: 'east exit', jlpt: 'N5' },
    ],
    questions: [
      { q: '電車が 止まるのは いつですか。', options: ['土曜日の 午後11時から', '日曜日の 朝から', '月曜日の 昼から'], answer: 0, explain: '「今週の 土曜日の 夜、午後十一時から」と 告知されています。' },
      { q: '電車の 代わりに 何が 運転しますか。', options: ['代行バス', 'タクシー', '新幹線'], answer: 0, explain: '「代行バスが 運転します」と 明記されています。' },
      { q: 'バス停は どの 出口に ありますか。', options: ['西口', '東口', '南口'], answer: 1, explain: '「東口の バス停へ お越しください」と 案内されています。' },
    ],
  }),

  makeStory({
    id: 'ch20-supermarket-flyer',
    level: 'N5',
    chapter: 20,
    title: 'スーパーの 特売チラシ',
    titleEn: 'Supermarket Special Sale Flyer',
    category: 'functional_media',
    synopsis: 'Navigating weekend grocery bargains, time-limited egg sales, and evening half-price discounts.',
    sentences: [
      { tokens: p('近所|きんじょ|neighborhood', 'の', 'スーパー|スーパー|supermarket', 'から', '週末|しゅうまつ|weekend', 'の', '特売|とくばい|bargain sale', 'チラシ||flyer', 'が', '届きました|とどきました|arrived', '。'), en: 'A weekend sale flyer arrived from the local neighborhood supermarket.' },
      { tokens: p('土曜日|どようび|Saturday', 'の', '朝市|あさいち|morning market', 'では', '、', '卵|たまご|eggs', '一パック|ひとパック|one carton', 'が', '百二十八円|ひゃくにじゅうはちえん|¥128', 'です', '。'), en: 'At the Saturday morning market, one carton of fresh eggs is just ¥128.' },
      { tokens: p('ただし|ただし|however', '、', 'お一人様|おひとりさま|per customer', '一パック|ひとパック|one pack', '限り|かぎり|limit', 'と', '書いてあります|かいてあります|is written', '。'), en: 'However, it states: "Strictly limited to one carton per customer."' },
      { tokens: p('夜|よる|night', '七時|しちじ|7:00', '以降|いこう|after', 'は', '、', 'お刺身|おさしみ|sashimi', 'と', 'お惣菜|おそうざい|prepared deli foods', 'が', '半額|はんがく|half price', 'に', 'なります', '。'), en: 'After 7:00 PM, all fresh sashimi and deli side dishes are marked half-price.' },
      { tokens: p('日曜日|にちようび|Sunday', 'は', 'ポイント|ポイント|points', 'が', '二倍|にばい|double', 'つきます|つきます|are awarded', '。'), en: 'On Sunday, store loyalty points are doubled for all purchases.' },
    ],
    vocabularyNotes: [
      { word: '特売', reading: 'とくばい', meaning: 'special bargain sale', jlpt: 'N4' },
      { word: '半額', reading: 'はんがく', meaning: 'half price (50% off)', jlpt: 'N4' },
      { word: '卵', reading: 'たまご', meaning: 'egg', jlpt: 'N5' },
      { word: '惣菜', reading: 'そうざい', meaning: 'prepared side dishes / deli', jlpt: 'N4' },
    ],
    questions: [
      { q: '卵は 一人 何パックまで 買えますか。', options: ['一パック限り', '二パック', '何パックでもよい'], answer: 0, explain: 'チラシに「お一人様 一パック限り」と 条件があります。' },
      { q: 'お刺身が 半額になるのは 何時からですか。', options: ['午後五時', '午後七時以降', '午前十時'], answer: 1, explain: '「夜七時以降は、お刺身が 半額になります」と あります。' },
      { q: 'ポイントが ２倍になるのは 何曜日ですか。', options: ['金曜日', '土曜日', '日曜日'], answer: 2, explain: '「日曜日は ポイントが 二倍つきます」と 記載されています。' },
    ],
  }),

  makeStory({
    id: 'ch21-lost-cat',
    level: 'N5',
    chapter: 21,
    title: 'まいごの ねこを さがしています',
    titleEn: 'Lost Cat Flyer in Shibuya',
    category: 'functional_media',
    synopsis: 'A bilingual lost pet poster detailing a beloved calico cat missing near Yoyogi Park.',
    sentences: [
      { tokens: p('電柱|でんちゅう|utility pole', 'に', '「', '迷子の|まいごの|lost', '猫|ねこ|cat', 'を', '探しています|さがしています|looking for', '」と', 'ポスター||poster', 'が', 'あります', '。'), en: 'On the telephone pole, there is a poster: "Searching for our lost cat."' },
      { tokens: p('名前|なまえ|name', 'は', '「', 'ミカン|ミカン|Mikan', '」で', '、', '三毛猫|みけねこ|calico cat', 'の', 'メス||female', 'です', '。'), en: 'Her name is "Mikan", a three-year-old female calico cat.' },
      { tokens: p('ピンクの|ピンクの|pink', '首輪|くびわ|collar', 'を', 'つけて|つけて|wearing', 'いて', '、', '小さな|ちいさな|small', '鈴|すず|bell', 'が', 'ついています|ついています|is attached', '。'), en: 'She is wearing a pink collar with a tiny silver bell attached.' },
      { tokens: p('代々木公園|よよぎこうえん|Yoyogi Park', 'の', '近く|ちかく|vicinity', 'で', 'いなくなりました|いなくなりました|went missing', '。'), en: 'She disappeared near the west entrance of Yoyogi Park on Tuesday.' },
      { tokens: p('見かけた|みかけた|spotted', '方は|かたは|whoever', '、', '下の|したの|bottom', '電話番号|でんわばんごう|phone number', 'まで', 'ご連絡|ごれんらく|contact', 'ください', '。'), en: 'If you have spotted her, please contact the telephone number printed below.' },
    ],
    vocabularyNotes: [
      { word: '迷子', reading: 'まいご', meaning: 'lost child / stray pet', jlpt: 'N4' },
      { word: '首輪', reading: 'くびわ', meaning: 'pet collar', jlpt: 'N4' },
      { word: '三毛猫', reading: 'みけねこ', meaning: 'calico cat (three-colored)', jlpt: 'N4' },
      { word: '探す', reading: 'さがす', meaning: 'to search for', jlpt: 'N5' },
    ],
    questions: [
      { q: '迷子の 猫の 名前は 何ですか。', options: ['ミカン', 'サクラ', 'クロ'], answer: 0, explain: '「名前は ミカン」と 明記されています。' },
      { q: 'ミカンは どんな 首輪を していますか。', options: ['青い首輪', 'ピンクの首輪（鈴つき）', '黒い首輪'], answer: 1, explain: '「ピンクの 首輪をつけていて、小さな 鈴が ついています」。' },
      { q: 'どこで いなくなりましたか。', options: ['上野駅', '代々木公園の 近く', '東京タワー'], answer: 1, explain: '「代々木公園の 近くで いなくなりました」と あります。' },
    ],
  }),

  makeStory({
    id: 'ch22-conbini-job',
    level: 'N4',
    chapter: 22,
    title: 'コンビニの アルバイトぼしゅう',
    titleEn: 'Conbini Part-Time Job Ad',
    category: 'functional_media',
    synopsis: 'A storefront recruitment poster detailing shifts, hourly wages, and duties for foreign students.',
    sentences: [
      { tokens: p('駅前|えきまえ|in front of station', 'の', 'ローソン||Lawson', 'の', '窓|まど|window', 'に', '求人票|きゅうじんひょう|job listing', 'が', '貼ってあります|はってあります|is posted', '。'), en: 'A job recruitment notice is posted in the window of the Lawson conbini in front of the station.' },
      { tokens: p('早朝|そうちょう|early morning', 'シフト||shift', 'は', '時給|じきゅう|hourly wage', '千百五十円|せんひゃくごじゅうえん|¥1,150', '、', '夜勤|やきん|night shift', 'は', '千四百五十円|せんよんひゃくごじゅうえん|¥1,450', 'です', '。'), en: 'The early morning shift pays ¥1,150/hr, and the late night shift pays ¥1,450/hr.' },
      { tokens: p('仕事|しごと|work', 'の', '内容|ないよう|content', 'は', '、', 'レジ打ち|レジうち|cashier', '、', '品出し|しなだし|shelf stocking', '、', '清掃|せいそう|cleaning', 'です', '。'), en: 'Job responsibilities include operating the cash register, stocking shelves, and store cleaning.' },
      { tokens: p('留学生|りゅうがくせい|foreign student', 'も', '大歓迎|だいかんげい|very welcome', 'で', '、', '週二日|しゅうふつか|2 days a week', '、', '一日三時間|いちにちさんじかん|3 hours a day', 'から', '働けます|はたらけます|can work', '。'), en: 'International students are warmly welcomed; shifts start from just 2 days a week, 3 hours a day.' },
      { tokens: p('興味が|きょうみが|interest', 'ある|ある|have', '方は|かたは|person', '、', '店長|てんちょう|store manager', 'まで', '履歴書|りれきしょ|resume', 'を', 'お持ち|おもち|bring', 'ください', '。'), en: 'Those interested, please bring your printed resume (rirekisho) to the store manager.' },
    ],
    vocabularyNotes: [
      { word: '時給', reading: 'じきゅう', meaning: 'hourly wage', jlpt: 'N4' },
      { word: '品出し', reading: 'しなだし', meaning: 'stocking merchandise shelves', jlpt: 'N4' },
      { word: '留学生', reading: 'りゅうがくせい', meaning: 'international student', jlpt: 'N5' },
      { word: '履歴書', reading: 'りれきしょ', meaning: 'standard Japanese resume', jlpt: 'N4' },
    ],
    questions: [
      { q: '夜勤の 時給は いくらですか。', options: ['1,000円', '1,150円', '1,450円'], answer: 2, explain: '「夜勤は 千四百五十円（1,450円）」と 記載されています。' },
      { q: '週に 最低 何日から 働けますか。', options: ['週二日から', '週五日', '毎日'], answer: 0, explain: '「週二日、一日三時間から 働けます」と 柔軟な条件です。' },
      { q: '応募する とき、何を 持って 行きますか。', options: ['履歴書', 'パスポートの コピー', '教科書'], answer: 0, explain: '「履歴書を お持ちください」と 求められています。' },
    ],
  }),

  makeStory({
    id: 'ch23-garbage-sorting',
    level: 'N4',
    chapter: 23,
    title: 'アパートの ごみだし ルール',
    titleEn: 'Apartment Garbage Sorting Guide',
    category: 'functional_media',
    synopsis: 'A Tokyo municipal residence bulletin detailing burnable, non-burnable, and PET bottle collection cycles.',
    sentences: [
      { tokens: p('アパート|アパート|apartment', 'の', '玄関|げんかん|entryway', 'に', 'ゴミ収集|ごみしゅうしゅう|garbage collection', 'の', 'カレンダー||calendar', 'が', 'あります', '。'), en: 'In the apartment entrance hall, there is a municipal garbage collection calendar.' },
      { tokens: p('燃える|もえる|burnable', 'ゴミ||trash', 'は', '火曜日|かようび|Tuesday', 'と', '金曜日|きんようび|Friday', 'の', '朝|あさ|morning', '八時|はちじ|8:00', 'まで', 'に', '出します|だします|put out', '。'), en: 'Combustible waste must be put out on Tuesday and Friday mornings before 8:00 AM.' },
      { tokens: p('ペットボトル||plastic bottles', 'は', '中|なか|inside', 'を', '水で|みずで|with water', '洗って|あらって|wash and', '、', 'ラベル||label', 'と', 'キャップ||cap', 'を', '外します|はずします|remove', '。'), en: 'For PET bottles, rinse the inside with water and peel off both the label and plastic cap.' },
      { tokens: p('段ボール|だんボール|cardboard', 'は', '平らに|たいらに|flatten', 'たたんで|たたんで|fold', '、', '紐で|ひもで|with string', 'しっかり', '縛って|しばって|tie', 'ください', '。'), en: 'Cardboard boxes must be folded flat and tied firmly with twine.' },
      { tokens: p('夜間|やかん|at night', 'に', 'ゴミ|ごみ|trash', 'を', '出す|だす|putting out', 'と', 'カラス||crows', 'が', '荒らします|あらします|scatter', 'ので', '、', '絶対に|ぜったいに|absolutely', 'やめましょう|やめましょう|must refrain', '。'), en: 'Putting out trash at night attracts crows that scatter it, so please strictly refrain.' },
    ],
    vocabularyNotes: [
      { word: '燃えるゴミ', reading: 'もえるごみ', meaning: 'burnable / combustible waste', jlpt: 'N4' },
      { word: '段ボール', reading: 'だんボール', meaning: 'corrugated cardboard', jlpt: 'N4' },
      { word: '洗う', reading: 'あらう', meaning: 'to wash / rinse', jlpt: 'N5' },
      { word: '縛る', reading: 'しばる', meaning: 'to tie / bind together', jlpt: 'N4' },
    ],
    questions: [
      { q: '燃えるゴミは 何曜日の 朝に 出しますか。', options: ['月曜と 木曜', '火曜と 金曜', '土曜と 日曜'], answer: 1, explain: '「火曜日と 金曜日の 朝八時までに 出します」と 決められています。' },
      { q: 'ペットボトルを 捨てる 前に 何を しますか。', options: ['水で洗い、ラベルとキャップを外す', 'そのまま袋に入れる', '細かく切る'], answer: 0, explain: '「中を水で洗って、ラベルとキャップを外します」が 正しい分別です。' },
      { q: 'なぜ 夜間に ゴミを 出しては いけませんか。', options: ['カラスが 荒らすから', '臭いが するから', '泥棒が 来るから'], answer: 0, explain: '夜に出すと「カラスが 荒らしますので」禁止されています。' },
    ],
  }),

  makeStory({
    id: 'ch24-curry-recipe',
    level: 'N4',
    chapter: 24,
    title: 'おいしい カレーの つくりかた',
    titleEn: 'Japanese Box Curry Recipe',
    category: 'functional_media',
    synopsis: 'Step-by-step culinary instructions printed on the back of an authentic Japanese curry roux package.',
    sentences: [
      { tokens: p('カレールー||curry roux', 'の', '箱|はこ|box', 'の', '裏|うら|back', 'に', '、', '作り方|つくりかた|recipe', 'が', '書いてあります|かいてあります|is written', '。'), en: 'On the back of the curry roux box, step-by-step cooking instructions are printed.' },
      { tokens: p('まず|まず|first of all', '、', '一口大に|ひとくちだいに|bite-sized', '切った|きった|cut', '玉ねぎ|たまねぎ|onion', '、', '人参|にんじん|carrot', '、', '牛肉|ぎゅうにく|beef', 'を', '油で|あぶらで|with oil', '炒めます|いためま|sauté', '。'), en: 'First, sauté bite-sized onions, carrots, potatoes, and beef in vegetable oil.' },
      { tokens: p('水|みず|water', 'を', '八百ミリリットル|はっぴゃくミリリットル|800ml', '加えて|くわえて|add and', '、', '弱火で|よわびで|on low heat', '二十分間|にじゅっぷんかん|20 minutes', '煮込みます|にこみます|simmer', '。'), en: 'Add 800ml of water and simmer over low heat for 20 minutes until the vegetables are tender.' },
      { tokens: p('一度|いちど|once', '火を|ひを|heat', '止めて|とめて|turn off and', 'から', '、', 'ルー||roux cubes', 'を', '割り入れて|わりいれて|break in and', 'よく', '溶かします|とかします|dissolve', '。'), en: 'Be sure to turn off the heat before breaking in the roux cubes to dissolve them smoothly.' },
      { tokens: p('再び|ふたたび|again', '弱火で|よわびで|on low heat', '十分間|じゅっぷんかん|10 minutes', '煮込むと|にこむと|simmer', '、', 'とろみのある|とろみのある|thick', 'カレーが|カレーが|curry', '完成|かんせい|finished', 'します', '。'), en: 'Simmer gently again on low heat for 10 minutes, and thick, savory curry is ready to serve.' },
    ],
    vocabularyNotes: [
      { word: '炒める', reading: 'いためる', meaning: 'to stir-fry / sauté', jlpt: 'N4' },
      { word: '煮込む', reading: 'にこむ', meaning: 'to simmer / stew', jlpt: 'N4' },
      { word: '溶かす', reading: 'とかす', meaning: 'to melt / dissolve', jlpt: 'N4' },
      { word: '弱火', reading: 'よわび', meaning: 'low heat', jlpt: 'N4' },
    ],
    questions: [
      { q: 'ルーを 入れる 前に 何を しなければ なりませんか。', options: ['一度 火を 止める', '強火に する', '冷たい 水を 足す'], answer: 0, explain: '「一度 火を 止めてから、ルーを 割り入れて 溶かします」が ルールです。' },
      { q: '水は 何ミリリットル 加えますか。', options: ['500ml', '800ml', '1200ml'], answer: 1, explain: '「水を 八百ミリリットル（800ml）加えて」と あります。' },
      { q: '野菜と 肉は どんな 大きさに 切りますか。', options: ['一口大（ひとくちだい）', 'みじん切り', '切らない'], answer: 0, explain: '食べやすい「一口大（ひとくちだい）」に切ります。' },
    ],
  }),

  makeStory({
    id: 'ch25-clinic-intake',
    level: 'N4',
    chapter: 25,
    title: 'びょういんの うけつけ',
    titleEn: 'Clinic Patient Intake Questionnaire',
    category: 'functional_media',
    synopsis: 'Filling out a medical clinic intake form: symptoms, temperatures, and insurance presentation.',
    sentences: [
      { tokens: p('風邪を|かぜを|cold', 'ひいた|ひいた|caught', 'ので', '、', '駅前|えきまえ|station-front', 'の', '内科|ないか|internal medicine', 'クリニック||clinic', 'へ', '行きました|いきました|went', '。'), en: 'Having caught a cold, I visited the internal medicine clinic in front of the station.' },
      { tokens: p('受付|うけつけ|reception', 'で', '「', '保険証|ほけんしょう|insurance card', 'を', 'お持ち|おもち|bring', 'ですか', '」と', '聞かれました|きかれました|was asked', '。'), en: 'At the reception desk, the nurse asked: "Do you have your Health Insurance Card?"' },
      { tokens: p('問診票|もんしんひょう|intake form', 'に', '熱|ねつ|fever', 'が', '三十八度二分|さんじゅうはちどにぶ|38.2°C', 'あり', '、', '咳|せき|cough', 'が', '出ると|でると|coughing', '書きました|かきました|wrote', '。'), en: 'On the medical questionnaire, I indicated a fever of 38.2°C, accompanied by a sore throat and cough.' },
      { tokens: p('「', '薬の|くすりの|medicine', 'アレルギー||allergy', 'は', 'ありますか', '」という', '質問|しつもん|question', 'に', '「', 'いいえ||no', '」と', '答えました|こたえました|answered', '。'), en: 'To the question: "Do you have any known pharmaceutical allergies?", I checked "No."' },
      { tokens: p('「', 'お名前|おなまえ|name', 'を', 'お呼び|および|call', 'するまで', '待合室|まちあいしつ|waiting room', 'で', 'お待ち|おまち|wait', 'ください', '」と', '言われました|いわれました|was told', '。'), en: 'The receptionist said: "Please relax in the waiting room until the doctor calls your name."' },
    ],
    vocabularyNotes: [
      { word: '保険証', reading: 'ほけんしょう', meaning: 'national health insurance card', jlpt: 'N4' },
      { word: '問診票', reading: 'もんしんひょう', meaning: 'medical intake questionnaire', jlpt: 'N4' },
      { word: '待合室', reading: 'まちあいしつ', meaning: 'clinic waiting room', jlpt: 'N4' },
      { word: '熱', reading: 'ねつ', meaning: 'fever / body temperature', jlpt: 'N5' },
    ],
    questions: [
      { q: '受付で 最初に 提示を 求められた 物は 何ですか。', options: ['保険証', '運転免許証', '診察券'], answer: 0, explain: '「保険証を お持ちですか」と 確認されました。' },
      { q: '患者の 熱は 何度 ありましたか。', options: ['36.5度', '37.2度', '38.2度（三十八度二分）'], answer: 2, explain: '「熱が 三十八度二分（38.2°C）あり」と 記入しました。' },
      { q: '名前を 呼ばれるまで どこで 待ちますか。', options: ['待合室', '外の ベンチ', '薬局'], answer: 0, explain: '「待合室で お待ちください」と 指示されました。' },
    ],
  }),

  makeStory({
    id: 'ch26-postal-guide',
    level: 'N4',
    chapter: 26,
    title: 'ゆうびんきょくの そうりょうひょう',
    titleEn: 'Post Office Shipping Rate Guide',
    category: 'functional_media',
    synopsis: 'Comparing domestic postcard stamps, standard envelopes, and overseas EMS express rates at Japan Post.',
    sentences: [
      { tokens: p('郵便局|ゆうびんきょく|post office', 'の', '窓口|まどぐち|counter', 'に', '新しい|あたらしい|new', '送料表|そうりょうひょう|shipping rate chart', 'が', '置かれて|おかれて|placed', 'います', '。'), en: 'A newly updated shipping fee table is displayed on the post office service counter.' },
      { tokens: p('日本国内|にほんこくない|domestic', 'の', 'ハガキ||postcard', 'は', '八十五円|はちじゅうごえん|¥85', '、', '定形の手紙|ていけいのてがみ|standard letter', 'は', '百十円|ひゃくじゅうえん|¥110', 'です', '。'), en: 'Domestic postcards cost ¥85, and standard domestic letters up to 50g cost ¥110.' },
      { tokens: p('重さが|おもさが|weight', '五十グラム|ごじゅうグラム|50 grams', 'を', '超えると|こえると|exceeds', '、', '料金|りょうきん|fee', 'が', '変わります|かわります|changes', '。'), en: 'If the weight exceeds 50 grams, non-standard postal rates will apply.' },
      { tokens: p('海外|かいがい|overseas', 'へ', '送る|おくる|send', '場合|ばあい|in the case', '、', '一番|いちばん|most', '速い|はやい|fast', 'のは', 'EMS（国際スピード郵便）||EMS Express', 'です', '。'), en: 'For overseas dispatches, EMS (Express Mail Service) is the fastest delivery method.' },
      { tokens: p('局員|きょくいん|clerk', 'さん', 'が', '「', '重さを|おもさを|weight', '量ります|はかります|measure', 'ので', '、', 'お荷物|おにもつ|package', 'を', '秤|はかり|scale', 'に', '載せて|のせて|place on', 'ください', '」と', '言いました|いいました|said', '。'), en: 'The postal clerk said: "Please place your parcel onto the electronic scale so I can measure its weight."' },
    ],
    vocabularyNotes: [
      { word: '郵便局', reading: 'ゆうびんきょく', meaning: 'post office', jlpt: 'N5' },
      { word: '送料', reading: 'そうりょう', meaning: 'shipping postage fee', jlpt: 'N4' },
      { word: '手紙', reading: 'てがみ', meaning: 'letter', jlpt: 'N5' },
      { word: '量る', reading: 'はかる', meaning: 'to weigh / measure', jlpt: 'N4' },
    ],
    questions: [
      { q: '日本国内の ハガキの 料金は いくらですか。', options: ['63円', '85円', '110円'], answer: 1, explain: '「ハガキは 八十五円（85円）」と 案内されています。' },
      { q: '海外へ 一番 速く 送れる 郵便は どれですか。', options: ['船便（ふなびん）', 'EMS（国際スピード郵便）', '普通ハガキ'], answer: 1, explain: '「一番 速いのは EMS（国際スピード郵便）です」。' },
      { q: '局員さんは 荷物を どこに 載せて ほしいと 言いましたか。', options: ['秤（はかり）の上', '床の上', 'ポストの中'], answer: 0, explain: '重さを量るために「秤（はかり）に 載せてください」と 頼まれました。' },
    ],
  }),

  // ==========================================================================
  // CATEGORY 4: DETECTIVE MINI-MYSTERIES (Chapters 27 - 32)
  // ==========================================================================
  makeStory({
    id: 'ch27-umbrella',
    level: 'N5',
    chapter: 27,
    title: 'きえた かさ',
    titleEn: 'The Mystery of the Missing Umbrella',
    category: 'mini_mystery',
    synopsis: 'Ken’s unique Shiba Inu tagged umbrella disappears from the cafe rack—who picked it up by mistake?',
    sentences: [
      { tokens: p('雨の|あめの|rainy', '日|ひ|day', '、', 'ケン', 'は', 'カフェ|カフェ|café', 'の', '傘立て|かさたて|umbrella stand', 'に', '青い|あおい|blue', '傘|かさ|umbrella', 'を', '置きました|おきました|placed', '。'), en: 'On a rainy afternoon, Ken parked his bright blue umbrella in the café umbrella stand.' },
      { tokens: p('ケン', 'の', '傘|かさ|umbrella', 'の', '柄|え|handle', 'には', '柴犬|しばいぬ|Shiba Inu', 'の', '黄色い|きいろい|yellow', 'シール||sticker', 'が', '貼ってあります|はってあります|is attached', '。'), en: 'On the handle of Ken’s umbrella was an unmistakable yellow Shiba Inu sticker.' },
      { tokens: p('店|みせ|shop', 'を', '出る|でる|leave', '時|とき|time', '、', 'ケン', 'の', '傘|かさ|umbrella', 'が', 'ありません|ありません|was not there', 'でした', '。'), en: 'When preparing to leave, Ken found his unique umbrella was completely gone.' },
      { tokens: p('傘立て|かさたて|stand', 'には', '、', '猫の|ねこの|cat', 'シール||sticker', 'が', '貼ってある|はってある|stuck on', '同じ|おなじ|identical', '青い|あおい|blue', '傘|かさ|umbrella', 'が', '一本|いっぽん|one', '残って|のこって|remained', 'いました', '。'), en: 'In the stand remained one identical blue umbrella, but it had a black cat sticker on the handle.' },
      { tokens: p('犯人は|はんにんは|the culprit', '、', '青い|あおい|blue', '傘|かさ|umbrella', 'を', '自分の|じぶんの|own', 'と', '間違えて|まちがえて|mistaken and', '持って|もって|taken', '行った|いった|went', '佐藤|さとう|Sato', 'さん', 'でした', '。'), en: 'The "culprit" was regular customer Sato-san, who grabbed the blue umbrella without checking the animal tag!' },
    ],
    vocabularyNotes: [
      { word: '傘立て', reading: 'かさたて', meaning: 'umbrella stand', jlpt: 'N5' },
      { word: '柄', reading: 'え', meaning: 'handle / grip', jlpt: 'N4' },
      { word: '柴犬', reading: 'しばいぬ', meaning: 'Shiba Inu dog breed', jlpt: 'N5' },
      { word: '間違える', reading: 'まちがえる', meaning: 'to make a mistake / mix up', jlpt: 'N4' },
    ],
    questions: [
      { q: 'ケンの 傘には どんな 目印が ありましたか。', options: ['柴犬の 黄色い シール', '猫の 赤い シール', '名前の 文字'], answer: 0, explain: '「柄には 柴犬の 黄色い シールが 貼ってあります」。' },
      { q: '傘立てに 残っていた 傘には 何が 貼ってありましたか。', options: ['柴犬の シール', '猫の シール', '何も 貼っていなかった'], answer: 1, explain: '「猫の シールが 貼ってある 同じ 青い 傘が 残っていました」。' },
      { q: 'なぜ 佐藤さんは ケンの 傘を 持って 行きましたか。', options: ['盗むつもりだった', '自分の 傘と 間違えたから', '壊れていたから'], answer: 1, explain: '同じ青い色だったため「自分のと 間違えて 持って行った」のです。' },
    ],
  }),

  makeStory({
    id: 'ch28-library-note',
    level: 'N5',
    chapter: 28,
    title: 'としょかんの ひみつの メモ',
    titleEn: 'The Secret Note in the Library',
    category: 'mini_mystery',
    synopsis: 'A mysterious antique bookmark reveals a cipher pointing to a historic campus landmark.',
    sentences: [
      { tokens: p('図書館|としょかん|library', 'で', '古い|ふるい|old', '本|ほん|book', 'を', '開くと|ひらくと|opened', '、', '一枚の|いちまいの|one sheet', 'メモ||note', 'が', '落ちました|おちました|dropped', '。'), en: 'Opening a weathered novel in the library, a yellowed parchment slip fluttered out.' },
      { tokens: p('メモには|メモには|on the note', '「', '中央|ちゅうおう|central', '時計台|とけいだい|clock tower', 'の', '後ろ|うしろ|behind', 'の', '桜の木|さくらのき|cherry tree', 'の', '下|した|under', '」と', '書かれて|かかれて|written', 'いました', '。'), en: 'The note read: "Beneath the cherry blossom tree behind the central clock tower."' },
      { tokens: p('ケン', 'と', 'サクラ', 'は', '急いで|いそいで|hurriedly', '時計台|とけいだい|clock tower', 'の', '裏|うら|back', 'の', '庭|にわ|garden', 'へ', '走りました|はしりました|ran', '。'), en: 'Ken and Sakura hurried behind the clock tower to the quiet western garden.' },
      { tokens: p('三本目の|さんぼんめの|third', '桜の|さくらの|cherry', '木の|きの|tree', '根元|ねもと|roots', 'に', '、', '古い|ふるい|old', '小さな|ちいさな|small', '缶|かん|tin can', 'が', '埋まって|うまって|buried', 'いました', '。'), en: 'At the roots of the third cherry tree, a vintage metal time capsule was buried.' },
      { tokens: p('缶の|かんの|can', '中には|なかには|inside', '、', '三十年前の|さんじゅうねんまえの|30 years ago', '学生達の|がくせいたちの|students', '写真|しゃしん|photos', 'と', '手紙|てがみ|letters', 'が', '入って|はいって|contained', 'いました', '。'), en: 'Inside the tin rested photographs and nostalgic graduation letters penned by students 30 years ago.' },
    ],
    vocabularyNotes: [
      { word: '時計台', reading: 'とけいだい', meaning: 'clock tower', jlpt: 'N4' },
      { word: '根元', reading: 'ねもと', meaning: 'tree base / roots', jlpt: 'N4' },
      { word: '埋まる', reading: 'うまる', meaning: 'to be buried', jlpt: 'N4' },
      { word: '秘密', reading: 'ひみつ', meaning: 'secret', jlpt: 'N4' },
    ],
    questions: [
      { q: 'メモは どこから 落ちましたか。', options: ['古い 本の中', '机の 下', 'ポケット'], answer: 0, explain: '「古い 本を 開くと、一枚の メモが 落ちました」。' },
      { q: '桜の木の 下に 何が 埋まっていましたか。', options: ['古い 小さな 缶', '宝箱の 鍵', '金貨'], answer: 0, explain: '「古い 小さな 缶が 埋まっていました」。' },
      { q: '缶の 中には 何が 入っていましたか。', options: ['三十年前の 学生の写真と手紙', '新しい 本', '時計'], answer: 0, explain: '30年前の生徒達が埋めたタイムカプセルの写真と手紙でした。' },
    ],
  }),

  makeStory({
    id: 'ch29-strawberry-cake',
    level: 'N5',
    chapter: 29,
    title: 'ケーキを たべたのは だれ？',
    titleEn: 'Who Ate the Strawberry Cake?',
    category: 'mini_mystery',
    synopsis: 'The last slice of strawberry shortcake in the dorm fridge is gone—detective deductions reveal the culprit!',
    sentences: [
      { tokens: p('寮の|りょうの|dormitory', '冷蔵庫|れいぞうこ|refrigerator', 'から', '、', 'サクラ', 'の', 'ショートケーキ||strawberry shortcake', 'が', '消えました|きえました|vanished', '。'), en: 'From the dormitory shared refrigerator, Sakura’s prized slice of shortcake vanished.' },
      { tokens: p('食べた|たべた|ate', '時間|じかん|time', 'は', '午後|ごご|p.m.', '三時|さんじ|3:00', 'から', '四時|よじ|4:00', 'の', '間|あいだ|between', 'です', '。'), en: 'The disappearance occurred strictly between 3:00 PM and 4:00 PM today.' },
      { tokens: p('ルームメイト||roommate', 'の', 'ユウキ', 'は', '「', 'ずっと', '部屋で|へやで|in room', '寝ていた|ねていた|sleeping', '」と', '言いました|いいました|said', '。'), en: 'Roommate Yuki insisted: "I was fast asleep in my room the entire afternoon."' },
      { tokens: p('しかし|しかし|however', '、', '台所の|だいどころの|kitchen', 'ゴミ箱|ごみばこ|trash can', 'に', 'ケーキの|ケーキの|cake', 'フィルム||plastic wrap', 'が', '捨てて|すてて|thrown away', 'ありました', '。'), en: 'However, in the kitchen trash bin lay the clear plastic film from the cake slice.' },
      { tokens: p('そして|そして|and', 'ユウキ', 'の', '口の|くちの|mouth', '横に|よこに|beside', '、', '赤い|あかい|red', 'イチゴの|イチゴの|strawberry', 'クリーム||cream', 'が', '少し|すこし|a little', 'ついていました|ついていました|was stuck', '！'), en: 'And right on the corner of Yuki’s mouth was a telltale dab of sweet strawberry whipped cream!' },
    ],
    vocabularyNotes: [
      { word: '冷蔵庫', reading: 'れいぞうこ', meaning: 'refrigerator', jlpt: 'N5' },
      { word: '台所', reading: 'だいどころ', meaning: 'kitchen', jlpt: 'N5' },
      { word: '寮', reading: 'りょう', meaning: 'dormitory', jlpt: 'N4' },
      { word: '消える', reading: 'きえる', meaning: 'to disappear / vanish', jlpt: 'N5' },
    ],
    questions: [
      { q: '冷蔵庫から 何が 消えましたか。', options: ['イチゴの ショートケーキ', 'リンゴジュース', 'チョコレート'], answer: 0, explain: 'サクラの「ショートケーキが 消えました」。' },
      { q: 'ユウキは 最初 何と 言い訳しましたか。', options: ['部屋で 寝ていた', '図書館に いた', '買い物に 行っていた'], answer: 0, explain: '「ずっと 部屋で 寝ていた」と 主張しました。' },
      { q: 'ユウキが 犯人だと 分かった 証拠は 何ですか。', options: ['口の横に イチゴクリームが ついていた', '手に フォークを 持っていた', 'ケーキの 箱を持っていた'], answer: 0, explain: '口の横に赤いイチゴのクリームが残っていてバレました。' },
    ],
  }),

  makeStory({
    id: 'ch30-temple-footprints',
    level: 'N4',
    chapter: 30,
    title: 'おてらの あしあと',
    titleEn: 'Footprints in the Temple Garden',
    category: 'mini_mystery',
    synopsis: 'Puzzling paw prints disrupt the freshly raked Zen sand garden at dawn—who was the nighttime visitor?',
    sentences: [
      { tokens: p('夕方|ゆうがた|evening', '、', '寺の|てらの|temple', '和尚|おしょう|abbot', 'さんは', '枯山水|かれさんすい|dry landscape garden', 'の', '白砂|しらすな|white sand', 'を', '綺麗に|きれいに|neatly', '掃き清めました|はききよめました|raked clean', '。'), en: 'At sunset, the temple abbot raked the white Zen sand into pristine wave patterns.' },
      { tokens: p('翌朝|よくあさ|next morning', '、', '庭の|にわの|garden', '砂の|すなの|sand', '上に|うえに|on top of', '不思議な|ふしぎな|mysterious', '足跡|あしあと|footprints', 'が', '続いて|つづいて|continuing', 'いました', '。'), en: 'The next morning, mysterious footprints wound across the freshly swept sand.' },
      { tokens: p('足跡|あしあと|tracks', 'は', '石灯籠|いしどうろう|stone lantern', 'から', '柿の|かきの|persimmon', '木へ|きへ|toward tree', '向かって|むかって|heading', 'いました', '。'), en: 'The footprints led from behind the stone lantern directly toward the ripe persimmon tree.' },
      { tokens: p('人間の|にんげんの|human', '靴|くつ|shoe', 'ではなく|ではなく|not', '、', '小さな|ちいさな|small', '丸い|まるい|round', '肉球の|にくきゅうの|paw pad', '跡|あと|mark', 'でした', '。'), en: 'They were not human shoes, but tiny round paw prints with five distinct pad marks.' },
      { tokens: p('木を|きを|tree', '見上げると|みあげると|looking up', '、', '熟した|じゅくした|ripe', '柿の|かきの|persimmon', '皮|かわ|peel', 'が', '落ちて|おちて|fallen', 'おり', '、', 'タヌキ||tanuki', 'の', '仕業|しわざ|handiwork', 'でした', '。'), en: 'Looking up, freshly peeled persimmon skins lay on the moss—it was the night visit of a wild tanuki!' },
    ],
    vocabularyNotes: [
      { word: '足跡', reading: 'あしあと', meaning: 'footprints / tracks', jlpt: 'N4' },
      { word: '枯山水', reading: 'かれさんすい', meaning: 'dry stone Zen landscape garden', jlpt: 'N4' },
      { word: '肉球', reading: 'にくきゅう', meaning: 'animal paw pad', jlpt: 'N4' },
      { word: '柿', reading: 'かき', meaning: 'Japanese persimmon fruit', jlpt: 'N4' },
    ],
    questions: [
      { q: '足跡は どこから どこへ 続いていましたか。', options: ['石灯籠から 柿の木へ', '本堂から 門へ', '池から 井戸へ'], answer: 0, explain: '「石灯籠から 柿の木へ 向かって」続いていました。' },
      { q: '足跡の 正体は 人間でしたか。', options: ['いいえ、動物の 丸い 肉球だった', 'はい、長靴の 跡だった', '下駄の 跡だった'], answer: 0, explain: '「人間の 靴ではなく、小さな 丸い 肉球の跡」でした。' },
      { q: '夜の 侵入者は 何をしに 庭へ 来ましたか。', options: ['甘い 柿を 食べるため', '魚を 盗むため', '寝るため'], answer: 0, explain: '熟した柿を木に登って食べるタヌキの仕業でした。' },
    ],
  }),

  makeStory({
    id: 'ch31-locked-bicycle',
    level: 'N4',
    chapter: 31,
    title: 'あかない じてんしゃ',
    titleEn: 'The Mystery of the Locked Bicycle',
    category: 'mini_mystery',
    synopsis: 'Ken forgets his four-digit dial lock code at the station—can his notebook riddle crack the dial?',
    sentences: [
      { tokens: p('駅の|えきの|station', '駐輪場|ちゅうりんじょう|bike parking', 'で', '、', 'ケン', 'は', '自転車の|じてんしゃの|bicycle', '鍵の|かぎの|lock', '暗証番号|あんしょうばんごう|code number', 'を', '忘れました|わすれました|forgot', '。'), en: 'At the station bicycle lot, Ken completely forgot the 4-digit code to his combination cable lock.' },
      { tokens: p('四桁の|よんけたの|4-digit', 'ダイヤル||dial lock', 'は', '零から|ぜろから|0 to', '九までの|きゅうまでの|9', '数字|すうじ|digits', 'です', '。'), en: 'The four-digit rotary dial accepts digits from zero through nine.' },
      { tokens: p('ノートに|ノートに|in notebook', '「', '前半の|ぜんはんの|first half', '二桁|ふたけた|two digits', 'は', 'サクラの|サクラの|Sakura’s', '誕生月|たんじょうづき|birth month', '（四月|しがつ|April）', '」と', 'メモが|メモが|memo', 'ありました', '。'), en: 'His memo read: "The first two digits are Sakura’s birth month (April = 04)."' },
      { tokens: p('「', '後半の|こうはんの|second half', '二桁|ふたけた|two digits', 'は', '百二十円の|ひゃくにじゅうえんの|120-yen', 'アイス||ice cream', '二個の|にこの|two', '代金を|だいきんを|cost', '十で|じゅうで|by 10', '割った|わった|divided', '数|かず|number', '」です', '。'), en: '"The final two digits are the price of two 120-yen ice creams divided by 10."' },
      { tokens: p('百二十|ひゃくにじゅう|120', 'かける|かける|multiplied by', '二|に|two', 'は', '二百四十|にひゃくよんじゅう|240', '、', '十で|じゅうで|by 10', '割ると|わると|divided by', '二十四|にじゅうよん|24', 'となり', '、', '「', '零四二四|ぜろよんにいよん|0424', '」で', '開きました|あきました|opened', '！'), en: '120 times 2 equals 240; divided by 10 gives 24. Dialing "0424", the lock snapped open!' },
    ],
    vocabularyNotes: [
      { word: '駐輪場', reading: 'ちゅうりんじょう', meaning: 'bicycle parking area', jlpt: 'N4' },
      { word: '暗証番号', reading: 'あんしょうばんごう', meaning: 'PIN / combination passcode', jlpt: 'N4' },
      { word: '桁', reading: 'けた', meaning: 'digit / decimal place', jlpt: 'N4' },
      { word: '割る', reading: 'わる', meaning: 'to divide (math)', jlpt: 'N4' },
    ],
    questions: [
      { q: '暗証番号の 前半 二桁は 何ですか。', options: ['04', '12', '24'], answer: 0, explain: 'サクラの誕生月である「四月（04）」です。' },
      { q: '百二十円の アイス二個の 代金（240円）を 十で割ると いくつですか。', options: ['12', '20', '24'], answer: 2, explain: '240 ÷ 10 = 「24」です。' },
      { q: '自転車の 鍵が 開いた 四桁の 番号は どれですか。', options: ['0424', '1224', '0412'], answer: 0, explain: '前半04と後半24を合わせて「0424」で開錠しました。' },
    ],
  }),

  makeStory({
    id: 'ch32-train-bento',
    level: 'N4',
    chapter: 32,
    title: 'きえた えきべん',
    titleEn: 'The Vanishing Bento on the Train',
    category: 'mini_mystery',
    synopsis: 'A salmon ekiben disappears from an express train seat tray while visiting the washroom—who snatched the fish?',
    sentences: [
      { tokens: p('箱根行きの|はこねゆきの|Hakone-bound', '特急電車|とっきゅうでんしゃ|limited express', 'で', '、', 'ケン', 'は', '鮭の|さけの|salmon', '駅弁|えきべん|station bento', 'を', 'テーブルに|テーブルに|on table', '置きました|おきました|placed', '。'), en: 'Aboard the limited express Romancecar to Hakone, Ken set his grilled salmon ekiben on the foldout table.' },
      { tokens: p('手を|てを|hands', '洗いに|あらいに|wash', 'トイレ|トイレ|restroom', 'へ', '行き|いき|went', '、', '二分後に|にふんごに|2 minutes later', '席に|せきに|to seat', '戻りました|もどりました|returned', '。'), en: 'He walked to the washroom to wash his hands and returned to his car two minutes later.' },
      { tokens: p('しかし|しかし|however', '、', 'お弁当の|おべんとうの|bento', '鮭だけが|さけだけが|only salmon', '綺麗に|きれいに|cleanly', '消えて|きえて|disappeared', 'いました', '。'), en: 'Incredibly, from inside the bento box, only the savory grilled salmon had completely disappeared!' },
      { tokens: p('ご飯や|ごはんや|rice and', '卵焼きは|たまごやきは|rolled omelet', 'そのまま|そのまま|untouched', '残されて|のこされて|left', 'いました', '。'), en: 'The seasoned rice and sweet tamagoyaki omelet were left entirely untouched.' },
      { tokens: p('座席の|ざせきの|seat', '下を|したを|under', '見ると|みると|peeking', '、', '乗客の|じょうきゃくの|passenger’s', 'カゴから|カゴから|from basket', '脱走した|だっそうした|escaped', '子猫が|こねこが|kitten', '魚を|さかなを|fish', 'くわえて|くわえて|holding in mouth', 'いました', '！'), en: 'Looking under the seat, a passenger’s escaped kitten was merrily munching on the fish!' },
    ],
    vocabularyNotes: [
      { word: '特急電車', reading: 'とっきゅうでんしゃ', meaning: 'limited express train', jlpt: 'N4' },
      { word: '鮭', reading: 'さけ', meaning: 'salmon', jlpt: 'N4' },
      { word: '卵焼き', reading: 'たまごやき', meaning: 'Japanese rolled omelet', jlpt: 'N5' },
      { word: '脱走', reading: 'だっそう', meaning: 'escape / breakout', jlpt: 'N4' },
    ],
    questions: [
      { q: '駅弁の 中から 何だけが 消えましたか。', options: ['鮭（さけ）', 'ご飯', '卵焼き'], answer: 0, explain: '「お弁当の 鮭だけが 綺麗に 消えていました」。' },
      { q: 'ご飯や 卵焼きは どうなって いましたか。', options: ['そのまま 残っていた', '全部 食べられていた', '床に 落ちていた'], answer: 0, explain: '「ご飯や 卵焼きは そのまま 残されていました」。' },
      { q: '犯人は だれでしたか。', options: ['カゴから 脱走した 子猫', '隣の 席の 客', '車掌さん'], answer: 0, explain: 'ペット用カゴから抜け出した子猫が鮭をくわえていました。' },
    ],
  }),
];
