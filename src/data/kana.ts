export interface Kana {
  kana: string;
  romaji: string;
  row: string;
}

const base: [string, string[]][] = [
  ['a', ['a', 'i', 'u', 'e', 'o']],
  ['k', ['ka', 'ki', 'ku', 'ke', 'ko']],
  ['s', ['sa', 'shi', 'su', 'se', 'so']],
  ['t', ['ta', 'chi', 'tsu', 'te', 'to']],
  ['n', ['na', 'ni', 'nu', 'ne', 'no']],
  ['h', ['ha', 'hi', 'fu', 'he', 'ho']],
  ['m', ['ma', 'mi', 'mu', 'me', 'mo']],
  ['y', ['ya', 'yu', 'yo']],
  ['r', ['ra', 'ri', 'ru', 're', 'ro']],
  ['w', ['wa', 'wo', 'n']],
  ['g', ['ga', 'gi', 'gu', 'ge', 'go']],
  ['z', ['za', 'ji', 'zu', 'ze', 'zo']],
  ['d', ['da', 'dji', 'dzu', 'de', 'do']],
  ['b', ['ba', 'bi', 'bu', 'be', 'bo']],
  ['p', ['pa', 'pi', 'pu', 'pe', 'po']],
];

const hira =
  'あいうえおかきくけこさしすせそたちつてとなにぬねのはひふへほまみむめもやゆよらりるれろわをんがぎぐげござじずぜぞだぢづでどばびぶべぼぱぴぷぺぽ';
const kata =
  'アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワヲンガギグゲゴザジズゼゾダヂヅデドバビブベボパピプペポ';

function build(chars: string): Kana[] {
  const out: Kana[] = [];
  let i = 0;
  for (const [row, romas] of base) {
    for (const r of romas) {
      // ぢ/づ are typed as ji/zu in practice
      const romaji = r === 'dji' ? 'ji' : r === 'dzu' ? 'zu' : r;
      out.push({ kana: chars[i++], romaji, row });
    }
  }
  return out;
}

export const HIRAGANA = build(hira);
export const KATAKANA = build(kata);
export const ROWS = base.map(([r]) => r);
