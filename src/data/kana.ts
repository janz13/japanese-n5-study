export interface Kana {
  kana: string;
  romaji: string;
  alts?: string[];
  row: string;
  group: 'basic' | 'dakuten' | 'yoon';
}

const base: [string, 'basic' | 'dakuten', string[]][] = [
  ['a', 'basic', ['a', 'i', 'u', 'e', 'o']],
  ['k', 'basic', ['ka', 'ki', 'ku', 'ke', 'ko']],
  ['s', 'basic', ['sa', 'shi', 'su', 'se', 'so']],
  ['t', 'basic', ['ta', 'chi', 'tsu', 'te', 'to']],
  ['n', 'basic', ['na', 'ni', 'nu', 'ne', 'no']],
  ['h', 'basic', ['ha', 'hi', 'fu', 'he', 'ho']],
  ['m', 'basic', ['ma', 'mi', 'mu', 'me', 'mo']],
  ['y', 'basic', ['ya', 'yu', 'yo']],
  ['r', 'basic', ['ra', 'ri', 'ru', 're', 'ro']],
  ['w', 'basic', ['wa', 'wo', 'n']],
  ['g', 'dakuten', ['ga', 'gi', 'gu', 'ge', 'go']],
  ['z', 'dakuten', ['za', 'ji', 'zu', 'ze', 'zo']],
  ['d', 'dakuten', ['da', 'dji', 'dzu', 'de', 'do']],
  ['b', 'dakuten', ['ba', 'bi', 'bu', 'be', 'bo']],
  ['p', 'dakuten', ['pa', 'pi', 'pu', 'pe', 'po']],
];

const hira =
  'あいうえおかきくけこさしすせそたちつてとなにぬねのはひふへほまみむめもやゆよらりるれろわをんがぎぐげござじずぜぞだぢづでどばびぶべぼぱぴぷぺぽ';
const kata =
  'アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワヲンガギグゲゴザジズゼゾダヂヅデドバビブベボパピぷぺぽ'.replace(
    'ぷぺぽ',
    'プペポ',
  );

const yoonSpec: [string, string[], string[], string[]][] = [
  ['ky', ['kya', 'kyu', 'kyo'], ['きゃ', 'きゅ', 'きょ'], ['キャ', 'キュ', 'キョ']],
  ['sh', ['sha', 'shu', 'sho'], ['しゃ', 'しゅ', 'しょ'], ['シャ', 'シュ', 'ショ']],
  ['ch', ['cha', 'chu', 'cho'], ['ちゃ', 'ちゅ', 'ちょ'], ['チャ', 'チュ', 'チョ']],
  ['ny', ['nya', 'nyu', 'nyo'], ['にゃ', 'にゅ', 'にょ'], ['ニャ', 'ニュ', 'ニョ']],
  ['hy', ['hya', 'hyu', 'hyo'], ['ひゃ', 'ひゅ', 'ひょ'], ['ヒャ', 'ヒュ', 'ヒョ']],
  ['my', ['mya', 'myu', 'myo'], ['みゃ', 'みゅ', 'みょ'], ['ミャ', 'ミュ', 'ミョ']],
  ['ry', ['rya', 'ryu', 'ryo'], ['りゃ', 'りゅ', 'りょ'], ['リャ', 'リュ', 'リョ']],
  ['gy', ['gya', 'gyu', 'gyo'], ['ぎゃ', 'ぎゅ', 'ぎょ'], ['ギャ', 'ギュ', 'ギョ']],
  ['j', ['ja', 'ju', 'jo'], ['じゃ', 'じゅ', 'じょ'], ['ジャ', 'ジュ', 'ジョ']],
  ['by', ['bya', 'byu', 'byo'], ['びゃ', 'びゅ', 'びょ'], ['ビャ', 'ビュ', 'ビョ']],
  ['py', ['pya', 'pyu', 'pyo'], ['ぴゃ', 'ぴゅ', 'ぴょ'], ['ピャ', 'ピュ', 'ピョ']],
];

const ALTS: Record<string, string[]> = {
  shi: ['si'],
  chi: ['ti'],
  tsu: ['tu'],
  fu: ['hu'],
  ji: ['zi', 'di'],
  zu: ['du'],
  wo: ['o'],
  sha: ['sya'],
  shu: ['syu'],
  sho: ['syo'],
  cha: ['tya', 'cya'],
  chu: ['tyu', 'cyu'],
  cho: ['tyo', 'cyo'],
  ja: ['jya', 'zya'],
  ju: ['jyu', 'zyu'],
  jo: ['jyo', 'zyo'],
};

function build(chars: string, isKata: boolean): Kana[] {
  const out: Kana[] = [];
  let i = 0;
  for (const [row, group, romas] of base) {
    for (const r of romas) {
      const romaji = r === 'dji' ? 'ji' : r === 'dzu' ? 'zu' : r;
      out.push({ kana: chars[i++], romaji, alts: ALTS[romaji], row, group });
    }
  }
  for (const [row, romas, hList, kList] of yoonSpec) {
    const list = isKata ? kList : hList;
    romas.forEach((romaji, idx) => {
      out.push({ kana: list[idx], romaji, alts: ALTS[romaji], row, group: 'yoon' });
    });
  }
  return out;
}

export const HIRAGANA = build(hira, false);
export const KATAKANA = build(kata, true);
export const BASIC_ROWS = base.filter(([, g]) => g === 'basic').map(([r]) => r);
export const DAKUTEN_ROWS = base.filter(([, g]) => g === 'dakuten').map(([r]) => r);
export const YOON_ROWS = yoonSpec.map(([r]) => r);
export const ROWS = [...BASIC_ROWS, ...DAKUTEN_ROWS, ...YOON_ROWS];
