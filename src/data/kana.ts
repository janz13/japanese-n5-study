export interface Kana {
  kana: string;
  romaji: string;
  alts?: string[];
  row: string;
  group: 'basic' | 'dakuten' | 'yoon';
  mnemonic?: string;
}

export const MNEMONICS: Record<string, string> = {
  // Hiragana Basic
  あ: "An apple with a stem on top (a).",
  い: "Two eels swimming side-by-side (i).",
  う: "A person bent double, punched in the stomach: 'oof!' (u).",
  え: "An energetic runner dashing forward (e).",
  お: "A golfer yelling 'on the green!' with the ball nearby (o).",
  か: "A kite cutting through a fierce wind (ka).",
  き: "A key with two notched teeth (ki).",
  く: "A cuckoo bird's open beak (ku).",
  け: "A tall wooden keg of Japanese sake (ke).",
  こ: "Two worms having a cozy conversation (ko).",
  さ: "A samurai sword slicing diagonally (sa).",
  し: "A shiny fishhook dangling into the sea (shi).",
  す: "A spiral loop on a playground swing (su).",
  せ: "Two people saying: 'set down and talk' (se).",
  そ: "A sewing needle making a zigzag stitch (so).",
  た: "Looks like the English letters 't' and 'a' merged (ta).",
  ち: "A cheerleader doing a high cheer (chi).",
  つ: "A giant tsunami wave curling overhead (tsu).",
  て: "A dog's wagging tail (te).",
  と: "A big toe with a thorn stuck in it (to).",
  な: "A nun kneeling before a cross (na).",
  に: "A needle and thread held together (ni).",
  ぬ: "Noodles tangled up in a ramen bowl (nu).",
  ね: "A cat (neko) with a curled-up tail (ne).",
  の: "A 'NO' parking circular sign (no).",
  は: "A hockey stick and a puck (ha).",
  ひ: "A grinning mouth laughing 'hee-hee!' (hi).",
  ふ: "Mount Fuji with clouds drifting around the peak (fu).",
  へ: "A pointed haystack or mountain peak (he).",
  ほ: "A home with a chimney and roof (ho).",
  ま: "A mask with two eye slits (ma).",
  み: "Looks like lucky number 21 (mi).",
  む: "A cow's head saying 'moo!' (mu).",
  め: "Noodles with NO loop — a messy meal (me).",
  も: "A fish hook with more worms attached (mo).",
  や: "A yak with long sweeping horns (ya).",
  ゆ: "A unique fish swimming left (yu).",
  よ: "A yoga instructor balancing on one leg (yo).",
  ら: "A cheerleader shouting 'rah!' (ra).",
  り: "Two river reeds standing in the stream (ri).",
  る: "A road with a loop at the end (ru).",
  れ: "A resting reindeer looking backwards (re).",
  ろ: "A road with no loop (ro).",
  わ: "A white swan floating on a calm pond (wa).",
  を: "An Olympian leaping over a hurdle (wo).",
  ん: "Looks like a lowercase 'n' — double-tap 'nn' to type (nn).",

  // Katakana Basic
  ア: "An axe cutting wood (a).",
  イ: "An easel standing in an art studio (i).",
  ウ: "An umbrella handle pointing up (u).",
  エ: "An elevator door frame or engineering I-beam (e).",
  オ: "An opera singer with an outstretched arm (o).",
  カ: "A sharp kite corner (ka).",
  キ: "A key with crossbars (ki).",
  ク: "A cook's sharp knife (ku).",
  ケ: "A kettle whistle (ke).",
  コ: "A corner of a box (ko).",
  サ: "Three lines forming a sailboat (sa).",
  シ: "A smiling face with eyes pointing up (shi).",
  ス: "A pair of stylish sunglasses folded up (su).",
  セ: "A crescent moon in a setting sun (se).",
  ソ: "A sewing needle with thread pointing down (so).",
  タ: "A titanic tower or 't' shape (ta).",
  チ: "A cheerleader holding pom-poms (chi).",
  ツ: "Two raindrops splashing down (tsu).",
  テ: "A telephone pole with wires (te).",
  ト: "A totem pole branch (to).",
  ナ: "A nun crossing two swords (na).",
  ニ: "Two (ni) horizontal parallel needles (ni).",
  ヌ: "Noodles gripped with chopsticks (nu).",
  ネ: "A net hanging from a wooden post (ne).",
  ノ: "A single long nose slope (no).",
  ハ: "Two house beams leaning together (ha).",
  ヒ: "A heel of a boot (hi).",
  フ: "A hook or flipper on a seal (fu).",
  ヘ: "A pointed hill (he).",
  ホ: "A holy cross with protective brackets (ho).",
  マ: "A drinking mug handle (ma).",
  ミ: "Three missile streaks in the sky (mi).",
  ム: "A triangle of moose antlers (mu).",
  メ: "An 'X' marking metal crossing beams (me).",
  モ: "A monitor with antenna bars (mo).",
  ヤ: "A yacht mast (ya).",
  ユ: "A U-turn road corner (yu).",
  ヨ: "A yogurt container with shelves (yo).",
  ラ: "A ramen noodle bowl edge (ra).",
  リ: "Two river reed stalks (ri).",
  ル: "Two roots going down into the soil (ru).",
  レ: "A red checkmark (re).",
  ロ: "A square robot mouth (ro).",
  ワ: "A wine glass cup (wa).",
  ヲ: "A worker holding a shovel (wo).",
  ン: "One eye winking horizontally — double-tap 'nn' (nn).",
};

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
      const ch = chars[i++];
      const romaji = r === 'dji' ? 'ji' : r === 'dzu' ? 'zu' : r === 'n' ? 'nn' : r;
      out.push({
        kana: ch,
        romaji,
        alts: ALTS[romaji] ?? (r === 'n' ? ['nn'] : undefined),
        row,
        group,
        mnemonic: MNEMONICS[ch] || (group === 'dakuten' ? `Voiced (${r}) version with dakuten / ten-ten mark.` : undefined),
      });
    }
  }
  for (const [row, romas, hList, kList] of yoonSpec) {
    const list = isKata ? kList : hList;
    romas.forEach((romaji, idx) => {
      const ch = list[idx];
      out.push({
        kana: ch,
        romaji,
        alts: ALTS[romaji],
        row,
        group: 'yoon',
        mnemonic: `Contracted combination of ${row[0].toUpperCase()} sound blended with small ya/yu/yo (${romaji}).`,
      });
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
