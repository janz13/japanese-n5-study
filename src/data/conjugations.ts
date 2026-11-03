export type WordGroup = 'ichidan' | 'godan' | 'irregular' | 'i-adj' | 'na-adj';
export type ConjForm = 'polite' | 'te' | 'negative' | 'past' | 'politePast';

export const FORM_LABELS: Record<ConjForm, { jp: string; en: string }> = {
  polite: { jp: '🎩 丁寧形 (〜ます / 〜です)', en: 'Polite Present' },
  te: { jp: '🔗 て形 (〜て / 〜で)', en: 'Te-form (connecting)' },
  negative: { jp: '🚫 ない形 (〜ない)', en: 'Plain Negative' },
  past: { jp: '⏪ た形 (〜た / 〜かった)', en: 'Plain Past' },
  politePast: { jp: '🎩⏪ 過去丁寧 (〜ました)', en: 'Polite Past' },
};

export const GROUP_LABELS: Record<WordGroup, string> = {
  ichidan: '🟢 Ichidan (る-verbs)',
  godan: '🔵 Godan (う-verbs)',
  irregular: '⚡ Irregular Verbs',
  'i-adj': '🟡 い-Adjectives',
  'na-adj': '🟣 な-Adjectives',
};

export interface ConjugationTarget {
  kanji: string;
  kana: string;
  romaji: string;
  rule: string;
}

export interface ConjugatableWord {
  id: string;
  dict: string;
  reading: string;
  en: string;
  group: WordGroup;
  forms: Record<ConjForm, ConjugationTarget>;
}

export const CONJUGATIONS: ConjugatableWord[] = [
  {
    id: 'taberu',
    dict: '食べる',
    reading: 'たべる',
    en: 'to eat',
    group: 'ichidan',
    forms: {
      polite: { kanji: '食べます', kana: 'たべます', romaji: 'tabemasu', rule: 'Drop る + ます' },
      te: { kanji: '食べて', kana: 'たべて', romaji: 'tabete', rule: 'Drop る + て' },
      negative: { kanji: '食べない', kana: 'たべない', romaji: 'tabenai', rule: 'Drop る + ない' },
      past: { kanji: '食べた', kana: 'たべた', romaji: 'tabeta', rule: 'Drop る + た' },
      politePast: { kanji: '食べました', kana: 'たべました', romaji: 'tabemashita', rule: 'Drop る + ました' },
    },
  },
  {
    id: 'miru',
    dict: '見る',
    reading: 'みる',
    en: 'to see / watch',
    group: 'ichidan',
    forms: {
      polite: { kanji: '見ます', kana: 'みます', romaji: 'mimasu', rule: 'Drop る + ます' },
      te: { kanji: '見て', kana: 'みて', romaji: 'mite', rule: 'Drop る + て' },
      negative: { kanji: '見ない', kana: 'みない', romaji: 'minai', rule: 'Drop る + ない' },
      past: { kanji: '見た', kana: 'みた', romaji: 'mita', rule: 'Drop る + た' },
      politePast: { kanji: '見ました', kana: 'みました', romaji: 'mimashita', rule: 'Drop る + ました' },
    },
  },
  {
    id: 'okiru',
    dict: '起きる',
    reading: 'おきる',
    en: 'to wake up',
    group: 'ichidan',
    forms: {
      polite: { kanji: '起きます', kana: 'おきます', romaji: 'okimasu', rule: 'Drop る + ます' },
      te: { kanji: '起きて', kana: 'おきて', romaji: 'okite', rule: 'Drop る + て' },
      negative: { kanji: '起きない', kana: 'おきない', romaji: 'okinai', rule: 'Drop る + ない' },
      past: { kanji: '起きた', kana: 'おきた', romaji: 'okita', rule: 'Drop る + た' },
      politePast: { kanji: '起きました', kana: 'おきました', romaji: 'okimashita', rule: 'Drop る + ました' },
    },
  },
  {
    id: 'neru',
    dict: '寝る',
    reading: 'ねる',
    en: 'to sleep',
    group: 'ichidan',
    forms: {
      polite: { kanji: '寝ます', kana: 'ねます', romaji: 'nemasu', rule: 'Drop る + ます' },
      te: { kanji: '寝て', kana: 'ねて', romaji: 'nete', rule: 'Drop る + て' },
      negative: { kanji: '寝ない', kana: 'ねない', romaji: 'nenai', rule: 'Drop る + ない' },
      past: { kanji: '寝た', kana: 'ねた', romaji: 'neta', rule: 'Drop る + た' },
      politePast: { kanji: '寝ました', kana: 'ねました', romaji: 'nemashita', rule: 'Drop る + ました' },
    },
  },
  {
    id: 'iku',
    dict: '行く',
    reading: 'いく',
    en: 'to go',
    group: 'godan',
    forms: {
      polite: { kanji: '行きます', kana: 'いきます', romaji: 'ikimasu', rule: 'く → きます' },
      te: { kanji: '行って', kana: 'いって', romaji: 'itte', rule: 'Special exception: 行く → 行って' },
      negative: { kanji: '行かない', kana: 'いかない', romaji: 'ikanai', rule: 'く → かない' },
      past: { kanji: '行った', kana: 'いった', romaji: 'itta', rule: 'Special exception: 行く → 行った' },
      politePast: { kanji: '行きました', kana: 'いきました', romaji: 'ikimashita', rule: 'く → きました' },
    },
  },
  {
    id: 'nomu',
    dict: '飲む',
    reading: 'のむ',
    en: 'to drink',
    group: 'godan',
    forms: {
      polite: { kanji: '飲みます', kana: 'のみます', romaji: 'nomimasu', rule: 'む → みます' },
      te: { kanji: '飲んで', kana: 'のんで', romaji: 'nonde', rule: 'む/ぶ/ぬ → んで' },
      negative: { kanji: '飲まない', kana: 'のまない', romaji: 'nomanai', rule: 'む → まない' },
      past: { kanji: '飲んだ', kana: 'のんだ', romaji: 'nonda', rule: 'む/ぶ/ぬ → んだ' },
      politePast: { kanji: '飲みました', kana: 'のみました', romaji: 'nomimashita', rule: 'む → みました' },
    },
  },
  {
    id: 'kaku',
    dict: '書く',
    reading: 'かく',
    en: 'to write',
    group: 'godan',
    forms: {
      polite: { kanji: '書きます', kana: 'かきます', romaji: 'kakimasu', rule: 'く → きます' },
      te: { kanji: '書いて', kana: 'かいて', romaji: 'kaite', rule: 'く → いて' },
      negative: { kanji: '書かない', kana: 'かかない', romaji: 'kakanai', rule: 'く → かない' },
      past: { kanji: '書いた', kana: 'かいた', romaji: 'kaita', rule: 'く → いた' },
      politePast: { kanji: '書きました', kana: 'かきました', romaji: 'kakimashita', rule: 'く → きました' },
    },
  },
  {
    id: 'hanasu',
    dict: '話す',
    reading: 'はなす',
    en: 'to speak',
    group: 'godan',
    forms: {
      polite: { kanji: '話します', kana: 'はなします', romaji: 'hanashimasu', rule: 'す → します' },
      te: { kanji: '話して', kana: 'はなして', romaji: 'hanashite', rule: 'す → して' },
      negative: { kanji: '話さない', kana: 'はなさない', romaji: 'hanasanai', rule: 'す → さない' },
      past: { kanji: '話した', kana: 'はなした', romaji: 'hanashita', rule: 'す → した' },
      politePast: { kanji: '話しました', kana: 'はなしました', romaji: 'hanashimashita', rule: 'す → しました' },
    },
  },
  {
    id: 'kau',
    dict: '買う',
    reading: 'かう',
    en: 'to buy',
    group: 'godan',
    forms: {
      polite: { kanji: '買います', kana: 'かいます', romaji: 'kaimasu', rule: 'う → います' },
      te: { kanji: '買って', kana: 'かって', romaji: 'katte', rule: 'う/つ/る → って' },
      negative: { kanji: '買わない', kana: 'かわない', romaji: 'kawanai', rule: 'う → わない (not あない)' },
      past: { kanji: '買った', kana: 'かった', romaji: 'katta', rule: 'う/つ/る → った' },
      politePast: { kanji: '買いました', kana: 'かいました', romaji: 'kaimashita', rule: 'う → いました' },
    },
  },
  {
    id: 'matsu',
    dict: '待つ',
    reading: 'まつ',
    en: 'to wait',
    group: 'godan',
    forms: {
      polite: { kanji: '待ちます', kana: 'まちます', romaji: 'machimasu', rule: 'つ → ちます' },
      te: { kanji: '待って', kana: 'まって', romaji: 'matte', rule: 'う/つ/る → って' },
      negative: { kanji: '待たない', kana: 'またない', romaji: 'matanai', rule: 'つ → たない' },
      past: { kanji: '待った', kana: 'まった', romaji: 'matta', rule: 'う/つ/る → った' },
      politePast: { kanji: '待ちました', kana: 'まちました', romaji: 'machimashita', rule: 'つ → ちました' },
    },
  },
  {
    id: 'kaeru',
    dict: '帰る',
    reading: 'かえる',
    en: 'to return home (Godan!)',
    group: 'godan',
    forms: {
      polite: { kanji: '帰ります', kana: 'かえります', romaji: 'kaerimasu', rule: 'Godan る → ります' },
      te: { kanji: '帰って', kana: 'かえって', romaji: 'kaette', rule: 'Godan る → って' },
      negative: { kanji: '帰らない', kana: 'かえらない', romaji: 'kaeranai', rule: 'Godan る → らない' },
      past: { kanji: '帰った', kana: 'かえった', romaji: 'kaetta', rule: 'Godan る → った' },
      politePast: { kanji: '帰りました', kana: 'かえりました', romaji: 'kaerimashita', rule: 'Godan る → りました' },
    },
  },
  {
    id: 'oyogu',
    dict: '泳ぐ',
    reading: 'およぐ',
    en: 'to swim',
    group: 'godan',
    forms: {
      polite: { kanji: '泳ぎます', kana: 'およぎます', romaji: 'oyogimasu', rule: 'ぐ → ぎます' },
      te: { kanji: '泳いで', kana: 'およいで', romaji: 'oyoide', rule: 'ぐ → いで' },
      negative: { kanji: '泳がない', kana: 'およがない', romaji: 'oyoganai', rule: 'ぐ → がない' },
      past: { kanji: '泳いだ', kana: 'およいだ', romaji: 'oyoida', rule: 'ぐ → いだ' },
      politePast: { kanji: '泳ぎました', kana: 'およぎました', romaji: 'oyogimashita', rule: 'ぐ → ぎました' },
    },
  },
  {
    id: 'suru',
    dict: 'する',
    reading: 'する',
    en: 'to do',
    group: 'irregular',
    forms: {
      polite: { kanji: 'します', kana: 'します', romaji: 'shimasu', rule: 'Irregular: する → します' },
      te: { kanji: 'して', kana: 'して', romaji: 'shite', rule: 'Irregular: する → して' },
      negative: { kanji: 'しない', kana: 'しない', romaji: 'shinai', rule: 'Irregular: する → しない' },
      past: { kanji: 'した', kana: 'した', romaji: 'shita', rule: 'Irregular: する → した' },
      politePast: { kanji: 'しました', kana: 'しました', romaji: 'shimashita', rule: 'Irregular: する → しました' },
    },
  },
  {
    id: 'kuru',
    dict: '来る',
    reading: 'くる',
    en: 'to come',
    group: 'irregular',
    forms: {
      polite: { kanji: '来ます', kana: 'きます', romaji: 'kimasu', rule: 'Irregular: 来る(くる) → 来ます(きます)' },
      te: { kanji: '来て', kana: 'きて', romaji: 'kite', rule: 'Irregular: 来る(くる) → 来て(きて)' },
      negative: { kanji: '来ない', kana: 'こない', romaji: 'konai', rule: 'Irregular: 来る(くる) → 来ない(こない)' },
      past: { kanji: '来た', kana: 'きた', romaji: 'kita', rule: 'Irregular: 来る(くる) → 来た(きた)' },
      politePast: { kanji: '来ました', kana: 'きました', romaji: 'kimashita', rule: 'Irregular: 来る(くる) → 来ました(きました)' },
    },
  },
  {
    id: 'ookii',
    dict: '大きい',
    reading: 'おおきい',
    en: 'big',
    group: 'i-adj',
    forms: {
      polite: { kanji: '大きいです', kana: 'おおきいです', romaji: 'ookiidesu', rule: 'い-adj + です' },
      te: { kanji: '大きくて', kana: 'おおきくて', romaji: 'ookikute', rule: 'Drop い + くて' },
      negative: { kanji: '大きくない', kana: 'おおきくない', romaji: 'ookikunai', rule: 'Drop い + くない' },
      past: { kanji: '大きかった', kana: 'おおきかった', romaji: 'ookikatta', rule: 'Drop い + かった' },
      politePast: { kanji: '大きかったです', kana: 'おおきかったです', romaji: 'ookikattadesu', rule: 'Drop い + かったです' },
    },
  },
  {
    id: 'takai',
    dict: '高い',
    reading: 'たかい',
    en: 'expensive / tall',
    group: 'i-adj',
    forms: {
      polite: { kanji: '高いです', kana: 'たかいです', romaji: 'takaidesu', rule: 'い-adj + です' },
      te: { kanji: '高くて', kana: 'たかくて', romaji: 'takakute', rule: 'Drop い + くて' },
      negative: { kanji: '高くない', kana: 'たかくない', romaji: 'takakunai', rule: 'Drop い + くない' },
      past: { kanji: '高かった', kana: 'たかかった', romaji: 'takakatta', rule: 'Drop い + かった' },
      politePast: { kanji: '高かったです', kana: 'たかかったです', romaji: 'takakattadesu', rule: 'Drop い + かったです' },
    },
  },
  {
    id: 'ii',
    dict: 'いい',
    reading: 'いい',
    en: 'good (irregular い-adj)',
    group: 'i-adj',
    forms: {
      polite: { kanji: 'いいです', kana: 'いいです', romaji: 'iidesu', rule: 'いい + です' },
      te: { kanji: 'よくて', kana: 'よくて', romaji: 'yokute', rule: 'いい uses stem よ- → よくて' },
      negative: { kanji: 'よくない', kana: 'よくない', romaji: 'yokunai', rule: 'いい uses stem よ- → よくない' },
      past: { kanji: 'よかった', kana: 'よかった', romaji: 'yokatta', rule: 'いい uses stem よ- → よかった' },
      politePast: { kanji: 'よかったです', kana: 'よかったです', romaji: 'yokattadesu', rule: 'いい uses stem よ- → よかったです' },
    },
  },
  {
    id: 'shizuka',
    dict: '静か',
    reading: 'しずか',
    en: 'quiet',
    group: 'na-adj',
    forms: {
      polite: { kanji: '静かです', kana: 'しずかです', romaji: 'shizukadesu', rule: 'な-adj + です' },
      te: { kanji: '静かで', kana: 'しずかで', romaji: 'shizukade', rule: 'な-adj + で' },
      negative: { kanji: '静かじゃない', kana: 'しずかじゃない', romaji: 'shizukajanai', rule: 'な-adj + じゃない' },
      past: { kanji: '静かだった', kana: 'しずかだった', romaji: 'shizukadatta', rule: 'な-adj + だった' },
      politePast: { kanji: '静かでした', kana: 'しずかでした', romaji: 'shizukadeshita', rule: 'な-adj + でした' },
    },
  },
  {
    id: 'genki',
    dict: '元気',
    reading: 'げんき',
    en: 'healthy / energetic',
    group: 'na-adj',
    forms: {
      polite: { kanji: '元気です', kana: 'げんきです', romaji: 'genkidesu', rule: 'な-adj + です' },
      te: { kanji: '元気で', kana: 'げんきで', romaji: 'genkide', rule: 'な-adj + で' },
      negative: { kanji: '元気じゃない', kana: 'げんきじゃない', romaji: 'genkijanai', rule: 'な-adj + じゃない' },
      past: { kanji: '元気だった', kana: 'げんきだった', romaji: 'genkidatta', rule: 'な-adj + だった' },
      politePast: { kanji: '元気でした', kana: 'げんきでした', romaji: 'genkideshita', rule: 'な-adj + でした' },
    },
  },
];


export interface ContextSentence {
  jp: string;
  en: string;
}

export const CONTEXT_SENTENCES: Record<string, Partial<Record<ConjForm, ContextSentence>>> = {
  taberu: {
    polite: { jp: '毎朝、パンを [ 食べる → ？ ]。', en: 'I eat bread every morning.' },
    te: { jp: '朝ごはんを [ 食べる → ？ ]、学校へ行きます。', en: 'I eat breakfast, and then go to school.' },
    negative: { jp: '朝は あまり [ 食べる → ？ ]。', en: "I don't eat much in the morning." },
    past: { jp: 'きのう、寿司を [ 食べる → ？ ]。', en: 'I ate sushi yesterday.' },
    politePast: { jp: '昨日、おいしいラーメンを [ 食べる → ？ ]。', en: 'I ate delicious ramen yesterday.' },
  },
  miru: {
    polite: { jp: '週末に アニメを [ 見る → ？ ]。', en: 'I watch anime on the weekend.' },
    te: { jp: '映画を [ 見る → ？ ]、感動しました。', en: 'I watched the movie and was moved.' },
    negative: { jp: '平日は テレビを [ 見る → ？ ]。', en: "I don't watch TV on weekdays." },
    past: { jp: 'さっき、富士山を [ 見る → ？ ]。', en: 'I saw Mount Fuji earlier.' },
    politePast: { jp: '映画館で 映画を [ 見る → ？ ]。', en: 'I watched a movie at the theater.' },
  },
  okiru: {
    polite: { jp: '毎朝、7時に [ 起きる → ？ ]。', en: 'I wake up at 7:00 every morning.' },
    te: { jp: '早く [ 起きる → ？ ]、散歩します。', en: 'I wake up early and take a walk.' },
    negative: { jp: '休日は 早く [ 起きる → ？ ]。', en: "I don't wake up early on days off." },
    past: { jp: '今朝は 8時に [ 起きる → ？ ]。', en: 'I woke up at 8:00 this morning.' },
    politePast: { jp: '今朝は 早く [ 起きる → ？ ]。', en: 'I woke up early this morning.' },
  },
  neru: {
    polite: { jp: '夜、11時に [ 寝る → ？ ]。', en: 'I go to sleep at 11:00 at night.' },
    te: { jp: 'シャワーを浴びて、すぐ [ 寝る → ？ ]。', en: 'I take a shower and sleep right away.' },
    negative: { jp: 'まだ [ 寝る → ？ ]。', en: "I won't sleep yet." },
    past: { jp: '昨夜は たくさん [ 寝る → ？ ]。', en: 'I slept a lot last night.' },
    politePast: { jp: '昨日は 12時に [ 寝る → ？ ]。', en: 'I went to bed at 12:00 yesterday.' },
  },
  iku: {
    polite: { jp: '毎朝、8時に 学校へ [ 行く → ？ ]。', en: 'I go to school at 8:00 every morning.' },
    te: { jp: '駅へ [ 行く → ？ ]、切符を買います。', en: 'I go to the station and buy a ticket.' },
    negative: { jp: 'あしたは どこへも [ 行く → ？ ]。', en: "I won't go anywhere tomorrow." },
    past: { jp: '先週、京都へ [ 行く → ？ ]。', en: 'I went to Kyoto last week.' },
    politePast: { jp: '去年、日本へ [ 行く → ？ ]。', en: 'I went to Japan last year.' },
  },
  nomu: {
    polite: { jp: '毎朝、コーヒーを [ 飲む → ？ ]。', en: 'I drink coffee every morning.' },
    te: { jp: '薬を [ 飲む → ？ ]、寝ます。', en: 'I take (drink) medicine and sleep.' },
    negative: { jp: 'お酒は [ 飲む → ？ ]。', en: "I don't drink alcohol." },
    past: { jp: '冷たい水を [ 飲む → ？ ]。', en: 'I drank cold water.' },
    politePast: { jp: 'おいしいお茶を [ 飲む → ？ ]。', en: 'I drank delicious green tea.' },
  },
  kaku: {
    polite: { jp: '日本語で 手紙を [ 書く → ？ ]。', en: 'I write a letter in Japanese.' },
    te: { jp: 'ここに 名前を [ 書く → ？ ] ください。', en: 'Please write your name here.' },
    negative: { jp: 'ペンがないから [ 書く → ？ ]。', en: "I don't have a pen, so I won't write." },
    past: { jp: 'きのう、日記を [ 書く → ？ ]。', en: 'I wrote a diary entry yesterday.' },
    politePast: { jp: '願書を 丁寧に [ 書く → ？ ]。', en: 'I wrote the application form carefully.' },
  },
  hanasu: {
    polite: { jp: '先生と 日本語で [ 話す → ？ ]。', en: 'I speak with the teacher in Japanese.' },
    te: { jp: 'ゆっくり [ 話す → ？ ] ください。', en: 'Please speak slowly.' },
    negative: { jp: '秘密だから 誰にも [ 話す → ？ ]。', en: "It's a secret, so I won't speak of it to anyone." },
    past: { jp: '友達と 電話で [ 話す → ？ ]。', en: 'I spoke with my friend on the phone.' },
    politePast: { jp: '店員さんと 楽しく [ 話す → ？ ]。', en: 'I had a pleasant conversation with the clerk.' },
  },
  kau: {
    polite: { jp: 'コンビニで お弁当を [ 買う → ？ ]。', en: 'I buy a bento at the convenience store.' },
    te: { jp: '切符を [ 買う → ？ ]、電車に乗ります。', en: 'I buy a ticket and board the train.' },
    negative: { jp: '高いから [ 買う → ？ ]。', en: "It's expensive, so I won't buy it." },
    past: { jp: 'デパートで 服を [ 買う → ？ ]。', en: 'I bought clothes at the department store.' },
    politePast: { jp: 'お土産を たくさん [ 買う → ？ ]。', en: 'I bought many souvenirs.' },
  },
  matsu: {
    polite: { jp: '駅の改札で 友達を [ 待つ → ？ ]。', en: 'I wait for my friend at the station gate.' },
    te: { jp: 'ちょっと [ 待つ → ？ ] ください。', en: 'Please wait a moment.' },
    negative: { jp: '時間がないから [ 待つ → ？ ]。', en: "I don't have time, so I won't wait." },
    past: { jp: 'バスを 20分 [ 待つ → ？ ]。', en: 'I waited 20 minutes for the bus.' },
    politePast: { jp: 'ロビーで 静かに [ 待つ → ？ ]。', en: 'I waited quietly in the lobby.' },
  },
  kaeru: {
    polite: { jp: '夕方、6時に 家へ [ 帰る → ？ ]。', en: 'I return home at 6:00 in the evening.' },
    te: { jp: '早く 家へ [ 帰る → ？ ]、休みます。', en: 'I return home early and rest.' },
    negative: { jp: '今夜は 家へ [ 帰る → ？ ]。', en: "I won't return home tonight." },
    past: { jp: '父は もう 家へ [ 帰る → ？ ]。', en: 'My father already returned home.' },
    politePast: { jp: '昨日は 9時に [ 帰る → ？ ]。', en: 'Yesterday I returned home at 9:00.' },
  },
  oyogu: {
    polite: { jp: '夏休みに プールで [ 泳ぐ → ？ ]。', en: 'I swim in the pool during summer vacation.' },
    te: { jp: '海で [ 泳ぐ → ？ ]、疲れました。', en: 'I swam in the sea and got tired.' },
    negative: { jp: '水が冷たいから [ 泳ぐ → ？ ]。', en: "Because the water is cold, I won't swim." },
    past: { jp: '川で 魚と一緒に [ 泳ぐ → ？ ]。', en: 'I swam in the river with the fish.' },
    politePast: { jp: 'プールで 1キロ [ 泳ぐ → ？ ]。', en: 'I swam 1 kilometer in the pool.' },
  },
  suru: {
    polite: { jp: '毎日、日本語を 勉強[ する → ？ ]。', en: 'I study Japanese every day.' },
    te: { jp: '宿題を [ する → ？ ]、遊びます。', en: 'I do homework and then play.' },
    negative: { jp: '今日は 無理を [ する → ？ ]。', en: "I won't push myself too hard today." },
    past: { jp: 'きのう、テニスを [ する → ？ ]。', en: 'I played tennis yesterday.' },
    politePast: { jp: '東京で 買い物を [ する → ？ ]。', en: 'I went shopping in Tokyo.' },
  },
  kuru: {
    polite: { jp: '明日の朝、先生が [ 来る → ？ ]。', en: 'The teacher will come tomorrow morning.' },
    te: { jp: 'ここに [ 来る → ？ ] ください。', en: 'Please come here.' },
    negative: { jp: '雨だから 友達は [ 来る → ？ ]。', en: "Because it's raining, my friend won't come." },
    past: { jp: 'さっき、郵便屋さんが [ 来る → ？ ]。', en: 'The mail carrier came earlier.' },
    politePast: { jp: '日本から 留学生が [ 来る → ？ ]。', en: 'An exchange student came from Japan.' },
  },
  ookii: {
    polite: { jp: 'この部屋は [ 大きい → ？ ]。', en: 'This room is big.' },
    te: { jp: '部屋が [ 大きい → ？ ]、明るいです。', en: 'The room is big and bright.' },
    negative: { jp: 'この靴は [ 大きい → ？ ]。', en: "These shoes aren't big." },
    past: { jp: '昔、この木は [ 大きい → ？ ]。', en: 'Long ago, this tree was big.' },
    politePast: { jp: '昔の車は とても [ 大きい → ？ ]。', en: 'Old cars were very big.' },
  },
  takai: {
    polite: { jp: '東京のホテルは [ 高い → ？ ]。', en: 'Hotels in Tokyo are expensive.' },
    te: { jp: '富士山は [ 高い → ？ ]、美しいです。', en: 'Mount Fuji is tall and beautiful.' },
    negative: { jp: 'この定食は [ 高い → ？ ]。', en: "This set meal isn't expensive." },
    past: { jp: '去年の野菜は [ 高い → ？ ]。', en: 'Vegetables were expensive last year.' },
    politePast: { jp: '昔、パソコンは とても [ 高い → ？ ]。', en: 'Computers were very expensive in the past.' },
  },
  ii: {
    polite: { jp: 'このカメラは とても [ いい → ？ ]。', en: 'This camera is very good.' },
    te: { jp: '天気が [ いい → ？ ]、散歩します。', en: 'The weather is good, so I take a walk.' },
    negative: { jp: '今日の気分は あまり [ いい → ？ ]。', en: "I don't feel very good today." },
    past: { jp: '昨日のコンサートは とても [ いい → ？ ]。', en: "Yesterday's concert was very good." },
    politePast: { jp: '旅行は とても [ いい → ？ ]。', en: 'The trip was very good.' },
  },
  shizuka: {
    polite: { jp: 'この図書館は [ 静か → ？ ]。', en: 'This library is quiet.' },
    te: { jp: '部屋が [ 静か → ？ ]、勉強しやすいです。', en: 'The room is quiet and easy to study in.' },
    negative: { jp: '休日の駅は [ 静か → ？ ]。', en: "The station on holidays is not quiet." },
    past: { jp: '夜は まわりが [ 静か → ？ ]。', en: 'At night, the surroundings were quiet.' },
    politePast: { jp: '昨夜のホテルは とても [ 静か → ？ ]。', en: 'Last night hotel was very quiet.' },
  },
  genki: {
    polite: { jp: 'おかげさまで [ 元気 → ？ ]。', en: 'Thanks to you, I am doing well (healthy).' },
    te: { jp: '田中さんは [ 元気 → ？ ]、明るい人です。', en: 'Tanaka-san is energetic and cheerful.' },
    negative: { jp: '最近、あまり [ 元気 → ？ ]。', en: "Lately, I'm not very well/energetic." },
    past: { jp: '子どもの頃は いつも [ 元気 → ？ ]。', en: 'When I was a kid, I was always energetic.' },
    politePast: { jp: '祖父は 昔とても [ 元気 → ？ ]。', en: 'My grandfather was very healthy in the past.' },
  },
};

export function getConjugationContext(wordId: string, form: ConjForm): ContextSentence | undefined {
  return CONTEXT_SENTENCES[wordId]?.[form];
}
