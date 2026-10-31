export type CounterGroup = 'tsu' | 'nin' | 'hon' | 'mai' | 'hiki' | 'kai' | 'day';

export interface CounterItem {
  id: string;
  group: CounterGroup;
  num: number;
  kanji: string;
  en: string;
  kana: string;
  romaji: string;
  alts?: string[];
  irregular?: boolean;
  rule: string;
}

export const COUNTER_GROUPS: Record<CounterGroup, { label: string; desc: string }> = {
  tsu: { label: '〜つ (General)', desc: 'Native Japanese counter for 1–10 general objects' },
  nin: { label: '〜人 (People)', desc: 'Counting people (watch 1, 2, and 4!)' },
  hon: { label: '〜本 (Long)', desc: 'Bottles, pens, umbrellas, trees, trains (h → p / b changes)' },
  mai: { label: '〜枚 (Flat)', desc: 'Paper, tickets, plates, shirts (no sound changes!)' },
  hiki: { label: '〜匹 (Animals)', desc: 'Small animals, cats, dogs, fish (h → p / b changes)' },
  kai: { label: '〜階 (Floors)', desc: 'Building floors (k → kk / g changes)' },
  day: { label: '〜日 (Calendar Days)', desc: 'Days of the month (1st–10th, 14th, 20th, 24th)' },
};

export const COUNTERS: CounterItem[] = [
  // 〜つ (General objects 1–10)
  { id: 'tsu-1', group: 'tsu', num: 1, kanji: '一つ', en: '1 thing', kana: 'ひとつ', romaji: 'hitotsu', irregular: true, rule: 'Native Wago numbers (ひ・ふ・み・よ・いつ・む・なな・や・ここの・とお).' },
  { id: 'tsu-2', group: 'tsu', num: 2, kanji: '二つ', en: '2 things', kana: 'ふたつ', romaji: 'futatsu', irregular: true, rule: 'ふたつ — shares the ふ root with 二日 (ふつか) and 二人 (ふたり).' },
  { id: 'tsu-3', group: 'tsu', num: 3, kanji: '三つ', en: '3 things', kana: 'みっつ', romaji: 'mittsu', irregular: true, rule: 'みっつ — notice the small っ before つ.' },
  { id: 'tsu-4', group: 'tsu', num: 4, kanji: '四つ', en: '4 things', kana: 'よっつ', romaji: 'yottsu', irregular: true, rule: 'よっつ — small っ before つ.' },
  { id: 'tsu-5', group: 'tsu', num: 5, kanji: '五つ', en: '5 things', kana: 'いつつ', romaji: 'itsutsu', irregular: true, rule: 'いつつ — no small っ!' },
  { id: 'tsu-6', group: 'tsu', num: 6, kanji: '六つ', en: '6 things', kana: 'むっつ', romaji: 'muttsu', irregular: true, rule: 'むっつ — small っ before つ.' },
  { id: 'tsu-7', group: 'tsu', num: 7, kanji: '七つ', en: '7 things', kana: 'ななつ', romaji: 'nanatsu', irregular: false, rule: 'ななつ — regular なな + つ.' },
  { id: 'tsu-8', group: 'tsu', num: 8, kanji: '八つ', en: '8 things', kana: 'やっつ', romaji: 'yattsu', irregular: true, rule: 'やっつ — shares the や/よう root with 八日 (ようか).' },
  { id: 'tsu-9', group: 'tsu', num: 9, kanji: '九つ', en: '9 things', kana: 'ここのつ', romaji: 'kokonotsu', irregular: true, rule: 'ここのつ — shares the ここの root with 九日 (ここのか).' },
  { id: 'tsu-10', group: 'tsu', num: 10, kanji: '十', en: '10 things', kana: 'とお', romaji: 'too', irregular: true, rule: 'とお — standalone word for 10 things (no つ at the end!).' },

  // 〜人 (People)
  { id: 'nin-1', group: 'nin', num: 1, kanji: '一人', en: '1 person', kana: 'ひとり', romaji: 'hitori', irregular: true, rule: 'ひとり — special native Japanese word (not いちにん).' },
  { id: 'nin-2', group: 'nin', num: 2, kanji: '二人', en: '2 people', kana: 'ふたり', romaji: 'futari', irregular: true, rule: 'ふたり — special native Japanese word (not ににん).' },
  { id: 'nin-3', group: 'nin', num: 3, kanji: '三人', en: '3 people', kana: 'さんにん', romaji: 'sannin', irregular: false, rule: 'From 3 onward, use Sino-Japanese number + にん.' },
  { id: 'nin-4', group: 'nin', num: 4, kanji: '四人', en: '4 people', kana: 'よにん', romaji: 'yonin', irregular: true, rule: 'よにん — drops the ん in よん (never よんにん or しにん)!' },
  { id: 'nin-5', group: 'nin', num: 5, kanji: '五人', en: '5 people', kana: 'ごにん', romaji: 'gonin', irregular: false, rule: 'Regular: ご + にん.' },
  { id: 'nin-6', group: 'nin', num: 6, kanji: '六人', en: '6 people', kana: 'ろくにん', romaji: 'rokunin', irregular: false, rule: 'Regular: ろく + にん.' },
  { id: 'nin-7', group: 'nin', num: 7, kanji: '七人', en: '7 people', kana: 'しちにん', romaji: 'shichinin', alts: ['ななにん', 'nananin'], irregular: false, rule: 'Both しちにん and ななにん are used.' },
  { id: 'nin-8', group: 'nin', num: 8, kanji: '八人', en: '8 people', kana: 'はちにん', romaji: 'hachinin', irregular: false, rule: 'Regular: はち + にん.' },

  // 〜本 (Long cylindrical objects)
  { id: 'hon-1', group: 'hon', num: 1, kanji: '一本', en: '1 long object', kana: 'いっぽん', romaji: 'ippon', irregular: true, rule: '1 + h-counter → っ + p (いっぽん).' },
  { id: 'hon-2', group: 'hon', num: 2, kanji: '二本', en: '2 long objects', kana: 'にほん', romaji: 'nihon', irregular: false, rule: '2 + h-counter stays regular: にほん.' },
  { id: 'hon-3', group: 'hon', num: 3, kanji: '三本', en: '3 long objects', kana: 'さんぼん', romaji: 'sanbon', irregular: true, rule: '3 + h-counter voices to b: さんぼん (and 何本 = なんぼん).' },
  { id: 'hon-4', group: 'hon', num: 4, kanji: '四本', en: '4 long objects', kana: 'よんほん', romaji: 'yonhon', irregular: false, rule: 'Regular: よん + ほん.' },
  { id: 'hon-5', group: 'hon', num: 5, kanji: '五本', en: '5 long objects', kana: 'ごほん', romaji: 'gohon', irregular: false, rule: 'Regular: ご + ほん.' },
  { id: 'hon-6', group: 'hon', num: 6, kanji: '六本', en: '6 long objects', kana: 'ろっぽん', romaji: 'roppon', irregular: true, rule: '6 + h-counter → っ + p (ろっぽん, as in 六本木 Roppongi!).' },
  { id: 'hon-8', group: 'hon', num: 8, kanji: '八本', en: '8 long objects', kana: 'はっぽん', romaji: 'happon', alts: ['はちほん', 'hachihon'], irregular: true, rule: '8 + h-counter → っ + p (はっぽん).' },
  { id: 'hon-10', group: 'hon', num: 10, kanji: '十本', en: '10 long objects', kana: 'じゅっぽん', romaji: 'juppon', irregular: true, rule: '10 + h-counter → っ + p (じゅっぽん).' },

  // 〜枚 (Flat objects)
  { id: 'mai-1', group: 'mai', num: 1, kanji: '一枚', en: '1 flat sheet/ticket', kana: 'いちまい', romaji: 'ichimai', irregular: false, rule: '〜枚 (まい) has zero sound changes from 1 to 10!' },
  { id: 'mai-2', group: 'mai', num: 2, kanji: '二枚', en: '2 flat sheets/tickets', kana: 'にまい', romaji: 'nimai', irregular: false, rule: 'Regular: に + まい.' },
  { id: 'mai-3', group: 'mai', num: 3, kanji: '三枚', en: '3 flat sheets/tickets', kana: 'さんまい', romaji: 'sanmai', irregular: false, rule: 'Regular: さん + まい.' },

  // 〜匹 (Small animals)
  { id: 'hiki-1', group: 'hiki', num: 1, kanji: '一匹', en: '1 small animal', kana: 'いっぴき', romaji: 'ippiki', irregular: true, rule: '1 + ひき → いっぴき (same 1/6/8/10 p-pattern as 〜本).' },
  { id: 'hiki-2', group: 'hiki', num: 2, kanji: '二匹', en: '2 small animals', kana: 'にひき', romaji: 'nihiki', irregular: false, rule: 'Regular: に + ひき.' },
  { id: 'hiki-3', group: 'hiki', num: 3, kanji: '三匹', en: '3 small animals', kana: 'さんびき', romaji: 'sanbiki', irregular: true, rule: '3 + ひき voices to b: さんびき (and 何匹 = なんびき).' },
  { id: 'hiki-6', group: 'hiki', num: 6, kanji: '六匹', en: '6 small animals', kana: 'ろっぴき', romaji: 'roppiki', irregular: true, rule: '6 + ひき → ろっぴき.' },

  // 〜階 (Building floors)
  { id: 'kai-1', group: 'kai', num: 1, kanji: '一階', en: '1st floor', kana: 'いっかい', romaji: 'ikkai', irregular: true, rule: '1 + かい → いっかい (small っ).' },
  { id: 'kai-2', group: 'kai', num: 2, kanji: '二階', en: '2nd floor', kana: 'にかい', romaji: 'nikai', irregular: false, rule: 'Regular: に + かい.' },
  { id: 'kai-3', group: 'kai', num: 3, kanji: '三階', en: '3rd floor', kana: 'さんがい', romaji: 'sangai', alts: ['さんかい', 'sankai'], irregular: true, rule: '三階 is traditionally read さんがい on the JLPT!' },
  { id: 'kai-6', group: 'kai', num: 6, kanji: '六階', en: '6th floor', kana: 'ろっかい', romaji: 'rokkai', irregular: true, rule: '6 + かい → ろっかい.' },
  { id: 'kai-10', group: 'kai', num: 10, kanji: '十階', en: '10th floor', kana: 'じゅっかい', romaji: 'jukkai', irregular: true, rule: '10 + かい → じゅっかい.' },

  // 〜日 (Calendar days of the month)
  { id: 'day-1', group: 'day', num: 1, kanji: '一日', en: '1st of the month', kana: 'ついたち', romaji: 'tsuitachi', irregular: true, rule: 'ついたち = 1st day of the month (いちにち means "1 whole day").' },
  { id: 'day-2', group: 'day', num: 2, kanji: '二日', en: '2nd day / 2 days', kana: 'ふつか', romaji: 'futsuka', irregular: true, rule: 'ふつか — matches 二つ (ふたつ).' },
  { id: 'day-3', group: 'day', num: 3, kanji: '三日', en: '3rd day / 3 days', kana: 'みっか', romaji: 'mikka', irregular: true, rule: 'みっか — matches 三つ (みっつ).' },
  { id: 'day-4', group: 'day', num: 4, kanji: '四日', en: '4th day / 4 days', kana: 'よっか', romaji: 'yokka', irregular: true, rule: 'よっか — don’t confuse with 八日 (ようか)!' },
  { id: 'day-5', group: 'day', num: 5, kanji: '五日', en: '5th day / 5 days', kana: 'いつか', romaji: 'itsuka', irregular: true, rule: 'いつか — matches 五つ (いつつ).' },
  { id: 'day-6', group: 'day', num: 6, kanji: '六日', en: '6th day / 6 days', kana: 'むいか', romaji: 'muika', irregular: true, rule: 'むいか — native む root.' },
  { id: 'day-7', group: 'day', num: 7, kanji: '七日', en: '7th day / 7 days', kana: 'なのか', romaji: 'nanoka', irregular: true, rule: 'なのか — native なな/なの root.' },
  { id: 'day-8', group: 'day', num: 8, kanji: '八日', en: '8th day / 8 days', kana: 'ようか', romaji: 'youka', irregular: true, rule: 'ようか (long vowel おう) — contrast with 四日 (よっか, double k)!' },
  { id: 'day-9', group: 'day', num: 9, kanji: '九日', en: '9th day / 9 days', kana: 'ここのか', romaji: 'kokonoka', irregular: true, rule: 'ここのか — matches 九つ (ここのつ).' },
  { id: 'day-10', group: 'day', num: 10, kanji: '十日', en: '10th day / 10 days', kana: 'とおか', romaji: 'tooka', irregular: true, rule: 'とおか — matches 十 (とお).' },
  { id: 'day-14', group: 'day', num: 14, kanji: '十四日', en: '14th day / 14 days', kana: 'じゅうよっか', romaji: 'juuyokka', irregular: true, rule: '10 (じゅう) + 4th (よっか) = じゅうよっか.' },
  { id: 'day-20', group: 'day', num: 20, kanji: '二十日', en: '20th day / 20 days', kana: 'はつか', romaji: 'hatsuka', irregular: true, rule: 'はつか — major JLPT N5 favorite (related to 二十歳 はたち).' },
  { id: 'day-24', group: 'day', num: 24, kanji: '二十四日', en: '24th day / 24 days', kana: 'にじゅうよっか', romaji: 'nijuuyokka', irregular: true, rule: '20 (にじゅう) + 4th (よっか) = にじゅうよっか.' },
];
