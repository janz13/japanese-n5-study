export type ParticleCategory = 'wa-ga' | 'ni-de-e' | 'action-compare';

export interface ParticlePrompt {
  id: string;
  category: ParticleCategory;
  before: string;
  after: string;
  answer: string;
  options: string[];
  en: string;
  /** Pure-kana string for TTS so readings and pauses are 100% accurate. */
  audio: string;
  why: string;
}

export const PARTICLE_CATEGORIES: Record<ParticleCategory, string> = {
  'wa-ga': '⚖️ は vs が (Topic & Subject)',
  'ni-de-e': '📍 に vs で vs へ (Place, Time & Means)',
  'action-compare': '🔗 を・と・から・より (Objects & Relations)',
};

export const PARTICLE_GUIDE: { p: string; role: string; tip: string; exJp: string; exKana: string; exEn: string }[] = [
  { p: 'は', role: 'Topic marker ("as for…")', tip: 'Sets the stage or contrasts two topics (Pronounced "wa").', exJp: '私は 学生です。', exKana: 'わたしは、がくせいです。', exEn: 'I am a student.' },
  { p: 'が', role: 'Subject / Identifier', tip: 'Used with あります/います (existence), 好き/上手/わかる, abilities (話せる), and natural phenomena.', exJp: '日本語が わかります。', exKana: 'にほんごが、わかります。', exEn: 'I understand Japanese.' },
  { p: 'を', role: 'Direct object / Point of departure', tip: 'Marks what is eaten/read/seen, or the place you exit/walk through (駅を 出る, 公園を 散歩する).', exJp: 'コーヒーを 飲みます。', exKana: 'コーヒーを、のみます。', exEn: 'I drink coffee.' },
  { p: 'に', role: 'Specific time / Static location / Goal', tip: 'Clock times (七時に), where things exist (机の上に あります), or recipient of an action.', exJp: '七時に 起きます。', exKana: 'しちじに、おきます。', exEn: 'I wake up at 7:00.' },
  { p: 'で', role: 'Action location / Means / Tool', tip: 'Where an active event happens (カフェで 勉強する) or how/by what transport (電車で 行く).', exJp: '新幹線で 京都へ 行きます。', exKana: 'しんかんせんで、きょうとへ いきます。', exEn: 'I go to Kyoto by bullet train.' },
  { p: 'へ', role: 'Direction ("toward")', tip: 'Marks travel direction with 行く/来る/帰る (Pronounced "e").', exJp: '東京へ 来ました。', exKana: 'とうきょうへ、きました。', exEn: 'I came to Tokyo.' },
  { p: 'と', role: 'Companion ("with") / "And" / Quote', tip: 'Complete list of nouns (AとB), doing something with someone (友だちと), or quoting (「…」と 言う).', exJp: '友だちと 映画を 見ます。', exKana: 'ともだちと、えいがを みます。', exEn: 'I watch a movie with a friend.' },
  { p: 'から / まで', role: 'From / Until (time or place)', tip: 'Marks starting point (から) and ending point (まで).', exJp: '九時から 五時まで 働きます。', exKana: 'くじから ごじまで、はたらきます。', exEn: 'I work from 9 to 5.' },
  { p: 'より', role: 'Comparison ("than")', tip: 'Pairs with のほうが to show what something is compared against.', exJp: '電車の ほうが バスより 速いです。', exKana: 'でんしゃの ほうが、バスより はやいです。', exEn: 'Trains are faster than buses.' },
];

export const PARTICLES: ParticlePrompt[] = [
  // ==================== は vs が ====================
  {
    id: 'p1',
    category: 'wa-ga',
    before: 'あそこに コンビニ',
    after: 'あります。',
    answer: 'が',
    options: ['が', 'は', 'を', 'で'],
    en: 'There is a convenience store over there.',
    audio: 'あそこに、コンビニが あります。',
    why: 'Existence verbs (あります / います) take が to introduce the thing that exists.',
  },
  {
    id: 'p2',
    category: 'wa-ga',
    before: '私は 抹茶',
    after: '好きです。',
    answer: 'が',
    options: ['が', 'を', 'は', 'に'],
    en: 'I like matcha.',
    audio: 'わたしは、まっちゃが すきです。',
    why: '好き (liked), 嫌い (disliked), 上手 (skilled), and 下手 (unskilled) are adjectives in Japanese and always mark their target with が, never を!',
  },
  {
    id: 'p3',
    category: 'wa-ga',
    before: 'アナさんは 日本語',
    after: '話せます。',
    answer: 'が',
    options: ['が', 'を', 'に', 'で'],
    en: 'Ana can speak Japanese.',
    audio: 'アナさんは、にほんごが はなせます。',
    why: 'Potential verbs (話せる, 食べられる, わかる, できる) take が to mark the thing you can do.',
  },
  {
    id: 'p4',
    category: 'wa-ga',
    before: '窓から 富士山',
    after: '見えました。',
    answer: 'が',
    options: ['が', 'を', 'で', 'へ'],
    en: 'Mt. Fuji could be seen from the window.',
    audio: 'まどから、ふじさんが みえました。',
    why: '見える (can be seen) and 聞こえる (can be heard) describe spontaneous perception and take が, not を.',
  },
  {
    id: 'p5',
    category: 'wa-ga',
    before: 'きのうから 頭',
    after: '痛いです。',
    answer: 'が',
    options: ['が', 'を', 'に', 'で'],
    en: 'My head has been hurting since yesterday.',
    audio: 'きのうから、あたまが いたいです。',
    why: 'Body parts experiencing a physical sensation or symptom (頭が痛い, おなかがすいた, のどがかわいた) take が.',
  },
  {
    id: 'p6',
    category: 'wa-ga',
    before: 'コーヒーは 飲みますが、紅茶',
    after: '飲みません。',
    answer: 'は',
    options: ['は', 'が', 'に', 'で'],
    en: 'I drink coffee, but I don’t drink black tea.',
    audio: 'コーヒーは のみますが、こうちゃは のみません。',
    why: 'When contrasting two items (Aは… Bは…), は replaces を to highlight the contrast.',
  },

  // ==================== に vs で vs へ ====================
  {
    id: 'p7',
    category: 'ni-de-e',
    before: '毎朝 七時半',
    after: '起きます。',
    answer: 'に',
    options: ['に', 'で', 'を', 'は'],
    en: 'I wake up at 7:30 every morning.',
    audio: 'まいあさ、しちじはんに おきます。',
    why: 'Specific clock times and calendar dates take に (whereas relative words like 今日, 明日, 毎朝 take no particle).',
  },
  {
    id: 'p8',
    category: 'ni-de-e',
    before: '駅の 近くの カフェ',
    after: 'コーヒーを 飲みました。',
    answer: 'で',
    options: ['で', 'に', 'へ', 'を'],
    en: 'I drank coffee at a café near the station.',
    audio: 'えきの ちかくの カフェで、コーヒーを のみました。',
    why: 'で marks the place where an active action (drinking, eating, studying, buying) happens.',
  },
  {
    id: 'p9',
    category: 'ni-de-e',
    before: '駅の 前',
    after: '赤い 門が あります。',
    answer: 'に',
    options: ['に', 'で', 'を', 'から'],
    en: 'There is a red gate in front of the station.',
    audio: 'えきの まえに、あかい もんが あります。',
    why: 'Static location with あります / います / 住んでいます takes に, not で.',
  },
  {
    id: 'p10',
    category: 'ni-de-e',
    before: '新幹線',
    after: '京都へ 行きます。',
    answer: 'で',
    options: ['で', 'に', 'を', 'と'],
    en: 'I go to Kyoto by bullet train.',
    audio: 'しんかんせんで、きょうとへ いきます。',
    why: 'で marks the means of transport or tool used (電車で, バスで, はしで).Exception: 歩いて (on foot).',
  },
  {
    id: 'p11',
    category: 'ni-de-e',
    before: '東京駅で 山手線',
    after: '乗りました。',
    answer: 'に',
    options: ['に', 'で', 'を', 'へ'],
    en: 'At Tokyo Station I got on the Yamanote Line.',
    audio: 'とうきょうえきで、やまのてせんに のりました。',
    why: '乗る (to board/ride) and 入る (to enter) treat the vehicle/room as the destination point, so they always take に!',
  },
  {
    id: 'p12',
    category: 'ni-de-e',
    before: '温泉に 入る 前',
    after: '体を 洗って ください。',
    answer: 'に',
    options: ['に', 'で', 'を', 'と'],
    en: 'Please wash your body before entering the hot spring.',
    audio: 'おんせんに はいる まえに、からだを あらって ください。',
    why: '前に (まえに = before) always uses に, whereas 後で (あとで = after) uses で!',
  },
  {
    id: 'p13',
    category: 'ni-de-e',
    before: 'ご飯を 食べた 後',
    after: '薬を 飲んで ください。',
    answer: 'で',
    options: ['で', 'に', 'を', 'へ'],
    en: 'Please take the medicine after eating your meal.',
    audio: 'ごはんを たべた あとで、くすりを のんで ください。',
    why: '後で (あとで = after doing V) takes で (contrast with 前に).',
  },

  // ==================== を・と・から・より ====================
  {
    id: 'p14',
    category: 'action-compare',
    before: '週末、友だち',
    after: '箱根へ 行く つもりです。',
    answer: 'と',
    options: ['と', 'に', 'で', 'を'],
    en: 'This weekend I plan to go to Hakone with my friend.',
    audio: 'しゅうまつ、ともだちと はこねへ いく つもりです。',
    why: 'と marks the companion you do an activity together with.',
  },
  {
    id: 'p15',
    category: 'action-compare',
    before: '黒い カメラの ほうが 白い カメラ',
    after: '軽いです。',
    answer: 'より',
    options: ['より', 'ほう', 'まで', 'から'],
    en: 'The black camera is lighter than the white camera.',
    audio: 'くろい カメラの ほうが、しろい カメラより かるいです。',
    why: 'より means "than" and attaches to the item being compared against.',
  },
  {
    id: 'p16',
    category: 'action-compare',
    before: '車掌さんに「この 席は どこですか」',
    after: '聞きました。',
    answer: 'と',
    options: ['と', 'を', 'に', 'で'],
    en: 'I asked the conductor, "Where is this seat?"',
    audio: 'しゃしょうさんに、この せきは どこですか、と ききました。',
    why: 'と is the quotation particle used before 言う (say), 聞く (ask), and 思う (think).',
  },
  {
    id: 'p17',
    category: 'action-compare',
    before: '毎朝、八時に 家',
    after: '出ます。',
    answer: 'を',
    options: ['を', 'に', 'で', 'から'],
    en: 'Every morning I leave the house at 8 o’clock.',
    audio: 'まいあさ、はちじに いえを でます。',
    why: '出る (to leave/exit) and 降りる (電車を降りる = get off a train) take を to mark the place you exit from!',
  },
  {
    id: 'p18',
    category: 'action-compare',
    before: '会議は 九時',
    after: '十一時までです。',
    answer: 'から',
    options: ['から', 'に', 'で', 'より'],
    en: 'The meeting is from 9:00 until 11:00.',
    audio: 'かいぎは、くじから じゅういちじまでです。',
    why: 'から marks the starting time or place ("from 9:00").',
  },
];

export interface ParticleSlotChallenge {
  id: string;
  title: string;
  /** Sentence text divided by slot gaps. For N slots, there are N + 1 segments. */
  sentenceSegments: string[];
  /** Correct particle for each slot gap. */
  correctParticles: string[];
  /** Pedagogical role for each slot, mapped to Amber, Teal, Indigo, Rose, Emerald. */
  semanticRoles: string[];
  /** Available particles in the tray (includes answers + distractors). */
  particleBank: string[];
  en: string;
  audioText: string;
  explanation: string;
}

export const PARTICLE_SLOT_CHALLENGES: ParticleSlotChallenge[] = [
  {
    id: 'psc-1',
    title: 'Weekend Park Trip',
    sentenceSegments: ['日曜日', '友達', '公園', '行きました。'],
    correctParticles: ['に', 'と', 'へ'],
    semanticRoles: ['Time (on)', 'Companion (with)', 'Destination (direction to)'],
    particleBank: ['に', 'と', 'へ', 'で', 'を', 'は', 'が', 'も'],
    en: 'On Sunday, I went to the park with my friend.',
    audioText: 'にちようびに ともだちと こうえんへ いきました。',
    explanation: 'に marks the specific day/time, と marks the companion you did an action with, and へ marks the destination direction.',
  },
  {
    id: 'psc-2',
    title: 'Cafe Routine',
    sentenceSegments: ['私', 'カフェ', 'コーヒー', '飲みました。'],
    correctParticles: ['は', 'で', 'を'],
    semanticRoles: ['Topic (as for me)', 'Action Location (at)', 'Direct Object (coffee)'],
    particleBank: ['は', 'で', 'を', 'に', 'が', 'と', 'へ', 'より'],
    en: 'As for me, I drank coffee at the cafe.',
    audioText: 'わたしは カフェで コーヒーを のみました。',
    explanation: 'は marks the personal topic, で marks the place where the activity took place, and を marks the direct object of drinking.',
  },
  {
    id: 'psc-3',
    title: 'Cats in the Room',
    sentenceSegments: ['部屋', '猫', '二匹 います。'],
    correctParticles: ['に', 'が'],
    semanticRoles: ['Existence Location (in)', 'Living Subject (cats)'],
    particleBank: ['に', 'が', 'で', 'を', 'は', 'と'],
    en: 'There are two cats in the room.',
    audioText: 'へやに ねこが にひき います。',
    explanation: 'に marks the static location of existence; が introduces the animate subject existing with います.',
  },
  {
    id: 'psc-4',
    title: 'Bullet Train to Kyoto',
    sentenceSegments: ['新幹線', '京都', '行きました。'],
    correctParticles: ['で', 'に'],
    semanticRoles: ['Means / Vehicle (by)', 'Destination Goal (to)'],
    particleBank: ['で', 'に', 'を', 'は', 'と', 'から'],
    en: 'I went to Kyoto by bullet train.',
    audioText: 'しんかんせんで きょうとに いきました。',
    explanation: 'で indicates the means or vehicle of transportation; に marks the destination endpoint.',
  },
  {
    id: 'psc-5',
    title: 'Tokyo to Osaka Route',
    sentenceSegments: ['東京', '大阪', '新幹線で 行きます。'],
    correctParticles: ['から', 'まで'],
    semanticRoles: ['Starting Point (from)', 'Endpoint Boundary (until/to)'],
    particleBank: ['から', 'まで', 'に', 'へ', 'で', 'を'],
    en: 'I travel from Tokyo to Osaka by bullet train.',
    audioText: 'とうきょうから おおさかまで しんかんせんで いきます。',
    explanation: 'から marks the starting point; まで marks the boundary/endpoint.',
  },
  {
    id: 'psc-6',
    title: 'Tanaka-san’s Preference',
    sentenceSegments: ['田中さん', '日本料理', '好きです。'],
    correctParticles: ['は', 'が'],
    semanticRoles: ['Topic (Tanaka)', 'Target of Affection (Japanese food)'],
    particleBank: ['は', 'が', 'を', 'に', 'で', 'と'],
    en: 'Tanaka-san likes Japanese cuisine.',
    audioText: 'たなかさんは にほんりょうりが すきです。',
    explanation: '好き is an adjective in Japanese; the experiencer is marked with は and the liked entity is marked with が (never を!).',
  },
  {
    id: 'psc-7',
    title: 'Morning Departure',
    sentenceSegments: ['毎朝 七時', '家', '出ます。'],
    correctParticles: ['に', 'を'],
    semanticRoles: ['Clock Time (at)', 'Point of Departure (from)'],
    particleBank: ['に', 'を', 'で', 'から', 'は', 'へ'],
    en: 'Every morning at 7:00, I leave home.',
    audioText: 'まいあさ しちじに いえを でます。',
    explanation: 'に marks numerical clock time; を marks the physical space being exited (家を出る).',
  },
  {
    id: 'psc-8',
    title: 'Speed Comparison',
    sentenceSegments: ['電車の ほう', 'バス', '速いです。'],
    correctParticles: ['が', 'より'],
    semanticRoles: ['Selected Option (the one that is)', 'Comparison Benchmark (than)'],
    particleBank: ['が', 'より', 'は', 'に', 'で', 'と'],
    en: 'Trains are faster than buses.',
    audioText: 'でんしゃの ほうが バスより はやいです。',
    explanation: '〜のほうが identifies the superior/chosen option; 〜より marks the comparative standard being measured against.',
  },
  {
    id: 'psc-9',
    title: 'Homework with Sister',
    sentenceSegments: ['私', '妹', '一緒に 宿題', 'しました。'],
    correctParticles: ['は', 'と', 'を'],
    semanticRoles: ['Topic (I)', 'Companion (together with)', 'Direct Object (homework)'],
    particleBank: ['は', 'と', 'を', 'に', 'で', 'が', 'も'],
    en: 'I did homework together with my younger sister.',
    audioText: 'わたしは いもうとと いっしょに しゅくだいを しました。',
    explanation: 'は marks the topic, と pairs with 一緒に to denote doing an activity with someone, and を marks the direct object.',
  },
  {
    id: 'psc-10',
    title: 'Department Store Shopping',
    sentenceSegments: ['デパート', '新しい 靴', '買い', '行きました。'],
    correctParticles: ['へ', 'を', 'に'],
    semanticRoles: ['Destination (to)', 'Direct Object (shoes)', 'Purpose of Movement (in order to buy)'],
    particleBank: ['へ', 'を', 'に', 'で', 'は', 'と', 'が'],
    en: 'I went to the department store to buy new shoes.',
    audioText: 'デパートへ あたらしい くつを かいに いきました。',
    explanation: 'へ marks movement toward the department store, を marks what is bought, and stem + に marks the purpose of movement.',
  },
];
