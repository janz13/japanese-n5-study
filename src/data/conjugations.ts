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
