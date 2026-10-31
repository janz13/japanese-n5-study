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
  {
    id: 'ch7-onsen',
    level: 'N4',
    chapter: 7,
    title: 'はじめての おんせん',
    titleEn: 'My First Hot Spring',
    paragraphs: [
      p('アナ', 'は', '日本|にほん|Japan', 'の', '温泉|おんせん|hot spring', 'に', '行った|いった|went', 'ことが||experience', 'ありません', 'でした', '。'),
      p('週末|しゅうまつ|weekend', '、', '友だち|ともだち|friend', 'の', 'サクラ', 'さん', 'と', '箱根|はこね|Hakone', 'へ', '行く|いく|go', 'つもり||intend to', 'です', '。'),
      p('サクラ', 'さん', 'は', '「', '温泉|おんせん|hot spring', 'に', '入る|はいる|enter', '前|まえ|before', 'に', '、', '体|からだ|body', 'を', '洗わなければ|あらわなければ|must wash', 'なりません', 'よ', '」', 'と', '言いました|いいました|said', '。'),
      p('「', 'タオル||towel', 'を', 'お湯|おゆ|hot water', 'に', '入れて|いれて|put in', 'は', 'いけません', '」', 'とも||also', '言いました|いいました|said', '。'),
      p('温泉|おんせん|hot spring', 'に', '入った|はいった|entered', '後|あと|after', 'で', '、', '旅館|りょかん|inn', 'で', '晩ご飯|ばんごはん|dinner', 'を', '食べました|たべました|ate', '。'),
      p('アナ', 'は', '「', 'また||again', '来たい|きたい|want to come', 'です', '」', 'と', '思いました|おもいました|thought', '。'),
    ],
    translation: [
      'Ana had never been to a Japanese hot spring.',
      'This weekend she plans to go to Hakone with her friend Sakura.',
      'Sakura said, "Before you get into the hot spring, you must wash your body."',
      'She also said, "You must not put your towel in the water."',
      'After the hot spring, they ate dinner at the ryokan.',
      'Ana thought, "I want to come again."',
    ],
    questions: [
      { q: 'アナさんは 温泉に 行った ことが ありましたか。', options: ['はい、あります', 'いいえ、ありませんでした', '毎週 行きます'], answer: 1 },
      { q: '温泉に 入る 前に 何を しなければ なりませんか。', options: ['体を 洗う', 'ご飯を 食べる', '写真を 撮る'], answer: 0 },
      { q: 'お湯に 入れては いけない ものは 何ですか。', options: ['足', 'タオル', '手'], answer: 1 },
    ],
  },
  {
    id: 'ch8-goodbye',
    level: 'N4',
    chapter: 8,
    title: 'さようなら、とうきょう',
    titleEn: 'Goodbye, Tokyo',
    paragraphs: [
      p('来月|らいげつ|next month', '、', 'アナ', 'は', 'アメリカ||America', 'へ', '帰ります|かえります|return', '。'),
      p('日本|にほん|Japan', 'に', '来て|きて|came and', 'から', '、', '日本語|にほんご|Japanese', 'が', '話せる|はなせる|can speak', 'ように||so that', 'なりました', '。'),
      p('アナ', 'は', '「', '日本|にほん|Japan', 'の', '生活|せいかつ|life', 'は', '楽しかった|たのしかった|was fun', 'けど||but', '、', '時々|ときどき|sometimes', 'さびしかった||was lonely', '」', 'と', '言いました|いいました|said', '。'),
      p('サクラ', 'さん', 'は', 'アナ', 'に', 'お守り|おまもり|amulet', 'を', 'くれました||gave (me)', '。'),
      p('アナ', 'は', '「', 'いつか||someday', 'また||again', '日本|にほん|Japan', 'に', '住んで|すんで|live', 'みたい||want to try', 'です', '」', 'と', '言いました|いいました|said', '。'),
    ],
    translation: [
      'Next month, Ana will return to America.',
      'Since coming to Japan, she has become able to speak Japanese.',
      'Ana said, "Life in Japan was fun, but sometimes I was lonely."',
      'Sakura gave Ana an omamori (good-luck charm).',
      'Ana said, "Someday I want to try living in Japan again."',
    ],
    questions: [
      { q: 'アナさんは いつ アメリカへ 帰りますか。', options: ['来週', '来月', '来年'], answer: 1 },
      { q: 'サクラさんは アナさんに 何を くれましたか。', options: ['お守り', '本', 'カメラ'], answer: 0 },
      { q: 'アナさんは いつか 何を して みたいですか。', options: ['日本に 住む', '温泉を 作る', '先生に なる'], answer: 0 },
    ],
  },
  {
    id: 'ch9-kyoto',
    level: 'N4',
    chapter: 9,
    title: '京都の もみじと 約束',
    titleEn: 'Kyoto Autumn Leaves & Conditionals',
    paragraphs: [
      p('秋|あき|autumn', 'に', 'なる|なる|become', 'と||whenever', '、', '京都|きょうと|Kyoto', 'の', '山|やま|mountain', 'は', '赤く|あかく|red', 'なります', '。'),
      p('ケン', 'さん', 'は', '「', '京都|きょうと|Kyoto', 'へ', '行く|いく|go', 'なら||if going to', '、', '朝|あさ|morning', '早く|はやく|early', '出た|でた|departed', 'ほうが||had better', 'いいですよ', '」', 'と', '言いました|いいました|said', '。'),
      p('「', '天気が|てんきが|weather', 'よければ||if good', '、', 'お寺|おてら|temple', 'の', '庭|にわ|garden', 'を', '歩きましょう|あるきましょう|let us walk', '。', '」'),
      p('「', 'もし||if by chance', '雨が|あめが|rain', '降ったら|ふったら|if it falls', '、', '駅|えき|station', 'の', '近く|ちかく|nearby', 'の', '美術館|びじゅつかん|art museum', 'へ', '行きましょう|いきましょう|let us go', '。', '」'),
      p('京都駅|きょうとえき|Kyoto Station', 'に', '着いたら|ついたら|when we arrived', '、', 'とても||very', 'いい', '天気|てんき|weather', 'でした', '。'),
    ],
    translation: [
      'When autumn comes, the mountains of Kyoto turn red.',
      'Ken said, "If you are going to Kyoto, it is better to leave early in the morning."',
      '"If the weather is good, let’s walk through the temple garden."',
      '"If by chance it rains, let’s go to the art museum near the station."',
      'When they arrived at Kyoto Station, the weather was wonderful.',
    ],
    questions: [
      { q: '秋に なると、京都の 山は どう なりますか。', options: ['赤く なります', '白く なります', '暗く なります'], answer: 0 },
      { q: '雨が 降ったら、どこへ 行きますか。', options: ['お寺の 庭', '駅の 近くの 美術館', '箱根の 温泉'], answer: 1 },
      { q: '京都駅に 着いた とき、天気は どうでしたか。', options: ['雨でした', 'とても いい 天気でした', '雪でした'], answer: 1 },
    ],
  },
  {
    id: 'ch10-keigo',
    level: 'N4',
    chapter: 10,
    title: 'デパートの 案内所',
    titleEn: 'Department Store Concierge (Keigo)',
    paragraphs: [
      p('アナ', 'は', '家族|かぞく|family', 'への', 'お土産|おみやげ|souvenir', 'を', '買い|かい|buy', 'に', '、', '東京|とうきょう|Tokyo', 'の', 'デパート||department store', 'へ', '行きました|いきました|went', '。'),
      p('案内所|あんないじょ|information desk', 'の', '店員|てんいん|clerk', 'さん', 'は', '「', 'いらっしゃいませ||welcome', '。', '何を|なにを|what', 'お探しで|おさがしで|looking for (honorific)', 'いらっしゃいますか||are you (honorific)', '」', 'と', '聞きました|ききました|asked', '。'),
      p('アナ', 'は', '「', '日本の|にほんの|Japanese', 'お茶|おちゃ|tea', 'を', '買いたい|かいたい|want to buy', 'のですが、', 'どこに', 'ありますか', '」', 'と', '聞きました|ききました|asked', '。'),
      p('店員|てんいん|clerk', 'さん', 'は', '「', 'お茶|おちゃ|tea', 'の', '売り場|うりば|counter', 'は', '地下|ちか|basement', '一階|いっかい|1st floor', 'で', 'ございます||is (polite)', '。', '私が|わたしが|I', 'ご案内|ごあんない|guide', 'いたします||will do (humble)', '」', 'と', '言いました|いいました|said', '。'),
      p('レジ||register', 'で', '「', 'カードを', 'お使いに|おつかいに|use (honorific)', 'なりますか', '」', 'と', '聞かれて|きかれて|was asked', '、', 'アナ', 'は', '礼儀正しい|れいぎただしい|polite', '敬語|けいご|keigo', 'が', 'よく', '分かりました|わかりました|understood', '。'),
    ],
    translation: [
      'Ana went to a department store in Tokyo to buy souvenirs for her family.',
      'The clerk at the information desk asked, "Welcome. What are you looking for?" (in honorific keigo).',
      'Ana asked, "I would like to buy Japanese green tea; where is it?"',
      'The clerk said, "The tea counter is on the first basement floor. I will guide you." (in polite & humble keigo).',
      'When asked at the register, "Will you be using a card?", Ana understood the polite keigo very well.',
    ],
    questions: [
      { q: 'お茶の 売り場は どこに ありますか。', options: ['地下一階', '三階', '屋上'], answer: 0 },
      { q: '「私が ご案内いたします」は どの 敬語ですか。', options: ['謙譲語 (Humble)', '尊敬語 (Honorific)', 'タメ口 (Casual)'], answer: 0 },
      { q: 'レジで 店員さんは 何と 聞きましたか。', options: ['カードを お使いに なりますか', 'どこから 来ましたか', '何時に 帰りますか'], answer: 0 },
    ],
  },
];
