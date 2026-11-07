export interface StampDef {
  id: string;
  kind: 'eki' | 'goshuin';
  shape: 'circle' | 'octagon' | 'rect';
  kanji: string;
  subKanji: string;
  nameEn: string;
  location: string;
  requirement: string;
  culturalNote: string;
}

/** 7-Day streak milestone stamp IDs in unlock order */
export const STREAK_MILESTONE_IDS = [
  'fushimi-inari', // Day 7
  'kinkakuji',     // Day 14
  'itsukushima',   // Day 21
  'meiji-jingu',   // Day 28
  'koyasan',       // Day 35+
] as const;

export const STAMPS: StampDef[] = [
  // --- Original Core Stamps (8) ---
  {
    id: 'narita',
    kind: 'eki',
    shape: 'circle',
    kanji: '成田',
    subKanji: '空港第２ビル駅',
    nameEn: 'Narita Airport Eki-Stamp',
    location: 'Chiba · Gateway to Japan',
    requirement: 'Complete Story Ch. 1 or Grammar Lesson 1',
    culturalNote: 'Almost every train station in Japan has a free rubber ink stamp (駅スタンプ) near the ticket gate depicting local landmarks.',
  },
  {
    id: 'tokyo-eki',
    kind: 'eki',
    shape: 'octagon',
    kanji: '東京驛',
    subKanji: '丸の内駅舎',
    nameEn: 'Tokyo Station Marunouchi Stamp',
    location: 'Chiyoda · Central Hub',
    requirement: 'Practice 5+ characters in Kana Dojo',
    culturalNote: 'Tokyo Station’s iconic 1914 red-brick Marunouchi building is one of the most sought-after Eki-stamps on the JR Yamanote Line.',
  },
  {
    id: 'ueno',
    kind: 'eki',
    shape: 'circle',
    kanji: '上野',
    subKanji: '恩賜公園・桜',
    nameEn: 'Ueno Park Daily Bento Stamp',
    location: 'Taitō · Museums & Cherry Blossoms',
    requirement: "Complete Today's 5-Minute Bento",
    culturalNote: 'Locals gather under Ueno Park’s 1,000+ cherry trees with homemade bento boxes (お花見弁当) every spring.',
  },
  {
    id: 'ginza',
    kind: 'eki',
    shape: 'rect',
    kanji: '銀座',
    subKanji: '純喫茶・珈琲',
    nameEn: 'Ginza Retro Kissaten Seal',
    location: 'Chūō · Historic Café District',
    requirement: 'Complete Story Ch. 2 or Speaking Scene 2',
    culturalNote: 'Traditional Japanese coffeehouses (純喫茶, junkissa) serve siphon-brewed coffee and thick-sliced toast in quiet, wood-paneled rooms.',
  },
  {
    id: 'asakusa',
    kind: 'goshuin',
    shape: 'rect',
    kanji: '浅草寺',
    subKanji: '奉拝・雷門',
    nameEn: 'Asakusa Sensō-ji Goshuin',
    location: 'Asakusa · Tokyo’s Oldest Temple (645 AD)',
    requirement: 'Complete Story Ch. 3 or Grammar Lesson 3',
    culturalNote: 'A Goshuin (御朱印) is a hand-brushed calligraphy seal stamped in vermilion cinnabar ink (朱肉) at Shinto shrines and Buddhist temples.',
  },
  {
    id: 'akihabara',
    kind: 'eki',
    shape: 'octagon',
    kanji: '秋葉原',
    subKanji: '電気街・万世橋',
    nameEn: 'Akihabara Electric Town Stamp',
    location: 'Chiyoda · Pop Culture & Electronics',
    requirement: 'Add 5+ cards to your SRS Review deck',
    culturalNote: 'Originally a post-war radio parts market under the train tracks, Akihabara evolved into the world capital of electronics and subculture.',
  },
  {
    id: 'shinjuku',
    kind: 'eki',
    shape: 'circle',
    kanji: '新宿',
    subKanji: '世界一の乗降駅',
    nameEn: 'Shinjuku Express Stamp',
    location: 'Shinjuku · Busiest Station on Earth',
    requirement: 'Take the JLPT N5 Mock Exam',
    culturalNote: 'Serving over 3.5 million passengers daily, navigating Shinjuku Station is considered the ultimate rite of passage for Tokyo commuters.',
  },
  {
    id: 'kyoto',
    kind: 'goshuin',
    shape: 'rect',
    kanji: '清水寺',
    subKanji: '大悲閣・京都',
    nameEn: 'Kyoto Kiyomizu-dera Goshuin',
    location: 'Higashiyama · Ancient Capital',
    requirement: 'Complete Story Ch. 4 or Grammar Lesson 4',
    culturalNote: 'The Japanese proverb 「清水の舞台から飛び降りる」 ("to leap from the stage of Kiyomizu") means taking a bold plunge!',
  },

  // --- Expanded Tokyo & Regional Station Stamps (10) ---
  {
    id: 'shibuya',
    kind: 'eki',
    shape: 'circle',
    kanji: '渋谷',
    subKanji: 'ハチ公前・交差点',
    nameEn: 'Shibuya Crossing & Hachiko Stamp',
    location: 'Shibuya · Youth Culture & Neon',
    requirement: 'Complete Daily Bento on a Weekend',
    culturalNote: 'The bronze statue of faithful Akita dog Hachiko waits outside Shibuya Station’s busiest scramble crossing.',
  },
  {
    id: 'harajuku',
    kind: 'eki',
    shape: 'octagon',
    kanji: '原宿',
    subKanji: '竹下通・明治の杜',
    nameEn: 'Harajuku Takeshita & Forest Stamp',
    location: 'Shibuya · Fashion & Shrine Woods',
    requirement: 'Practice 10+ Vocabulary cards in SRS',
    culturalNote: 'Harajuku bridges high-energy kawaii fashion on Takeshita Street with the serene forested approach to Meiji Shrine.',
  },
  {
    id: 'ikebukuro',
    kind: 'eki',
    shape: 'circle',
    kanji: '池袋',
    subKanji: '梟の街・東口西口',
    nameEn: 'Ikebukuro Owl Landmark Stamp',
    location: 'Toshima · Anime & Transit Crossroads',
    requirement: 'Complete 3 Conjugation Dojo drills',
    culturalNote: 'Ikebukuro plays on the word "fukuro" (owl), making the Ikefukurou owl statue a famous station rendezvous spot.',
  },
  {
    id: 'shinagawa',
    kind: 'eki',
    shape: 'rect',
    kanji: '品川',
    subKanji: '東海道・宿場町',
    nameEn: 'Shinagawa Tokaido Post Town Stamp',
    location: 'Minato · Gateway to the Shinkansen',
    requirement: 'Complete a Travel Track Bento',
    culturalNote: 'Shinagawa was the first post town (宿場, shukuba) on the ancient Tokaido highway connecting Edo to Kyoto.',
  },
  {
    id: 'yokohama',
    kind: 'eki',
    shape: 'octagon',
    kanji: '横浜',
    subKanji: '港町・赤レンガ倉庫',
    nameEn: 'Yokohama Port & Red Brick Stamp',
    location: 'Kanagawa · Historic International Port',
    requirement: 'Review 15+ SRS cards',
    culturalNote: 'Opened to foreign trade in 1859, Yokohama was Japan’s first window to the Western world, home to the famous Red Brick Warehouse.',
  },
  {
    id: 'hakone',
    kind: 'eki',
    shape: 'circle',
    kanji: '箱根',
    subKanji: '登山鉄道・芦ノ湖',
    nameEn: 'Hakone Tozan Railway Stamp',
    location: 'Kanagawa · Hot Springs & Lake Ashi',
    requirement: 'Earn 3 Daily Bento completions',
    culturalNote: 'Hakone’s switchback mountain railway climbs steep volcanic slopes with stunning views of Mount Fuji.',
  },
  {
    id: 'sapporo',
    kind: 'eki',
    shape: 'octagon',
    kanji: '札幌',
    subKanji: '時計台・北の玄関口',
    nameEn: 'Sapporo Clock Tower Eki-Stamp',
    location: 'Hokkaido · Northern Frontier',
    requirement: 'Complete Grammar Lesson 5',
    culturalNote: 'Built in 1878 with an American clock mechanism, the Sapporo Clock Tower is one of Hokkaido’s earliest Western-style wooden buildings.',
  },
  {
    id: 'osaka-eki',
    kind: 'eki',
    shape: 'circle',
    kanji: '大阪',
    subKanji: '天下の台所・梅田',
    nameEn: 'Osaka Station City Eki-Stamp',
    location: 'Umeda · The Nation’s Kitchen',
    requirement: 'Score 80%+ on a Practice Quiz',
    culturalNote: 'Osaka is famously known as 天下の台所 (tenka no daidokoro) — "the nation’s kitchen" — celebrated for takoyaki and okonomiyaki.',
  },
  {
    id: 'hiroshima',
    kind: 'eki',
    shape: 'circle',
    kanji: '広島',
    subKanji: '平和都市・もみじ',
    nameEn: 'Hiroshima Peace & Maple Stamp',
    location: 'Hiroshima · City of Peace',
    requirement: 'Read 2 Graded Stories',
    culturalNote: 'Hiroshima’s maple leaf-shaped cake (もみじ饅頭, momiji manjū) was created over a century ago in honor of Miyajima’s autumn foliage.',
  },
  {
    id: 'kanazawa',
    kind: 'eki',
    shape: 'rect',
    kanji: '金沢',
    subKanji: '鼓門・加賀百万石',
    nameEn: 'Kanazawa Tsuzumi-mon Gate Stamp',
    location: 'Ishikawa · Craft & Samurai Heritage',
    requirement: 'Trace 5 Kanji in Kanji Studio',
    culturalNote: 'Kanazawa Station’s dramatic 13-meter wooden Tsuzumi Gate evokes traditional Japanese hand drums (鼓, tsuzumi).',
  },

  // --- Expanded Temple & Shrine Goshuin Seals (5) ---
  {
    id: 'kamakura',
    kind: 'goshuin',
    shape: 'rect',
    kanji: '高徳院',
    subKanji: '鎌倉大仏・相模国',
    nameEn: 'Kamakura Great Buddha Goshuin',
    location: 'Kamakura · Samurai Capital',
    requirement: 'Practice 10 Kanji in Kanji Dojo',
    culturalNote: 'The bronze Amida Buddha of Kotoku-in has stood in open air since a massive tsunami swept away its temple hall in 1498.',
  },
  {
    id: 'nikko',
    kind: 'goshuin',
    shape: 'rect',
    kanji: '東照宮',
    subKanji: '日光廟・三猿奉拝',
    nameEn: 'Nikko Tosho-gu Shrine Goshuin',
    location: 'Tochigi · UNESCO Heritage Forest',
    requirement: 'Complete Particle Dojo challenge',
    culturalNote: 'Dedicated to shogun Tokugawa Ieyasu, Nikko Tosho-gu features the world-famous "Three Wise Monkeys" carving.',
  },
  {
    id: 'todaiji',
    kind: 'goshuin',
    shape: 'rect',
    kanji: '東大寺',
    subKanji: '大仏殿・古都奈良',
    nameEn: 'Nara Todai-ji Great Buddha Goshuin',
    location: 'Nara · Ancient Imperial Capital (710 AD)',
    requirement: 'Study 5 Days in a row',
    culturalNote: 'Todai-ji’s Daibutsuden is one of the world’s largest wooden buildings, sheltering a colossal 15-meter bronze Buddha alongside freely roaming sacred deer.',
  },
  {
    id: 'fukuoka',
    kind: 'eki',
    shape: 'octagon',
    kanji: '博多',
    subKanji: '中洲屋台・山笠の街',
    nameEn: 'Hakata Yatai & Gion Stamp',
    location: 'Fukuoka · Southern Hub',
    requirement: 'Decode 3 Street Signs in Sign Decoder',
    culturalNote: 'Hakata is renowned for its vibrant outdoor food stalls (屋台, yatai) lining the riverside, serving tonkotsu ramen late into the night.',
  },
  {
    id: 'zenkoji',
    kind: 'goshuin',
    shape: 'rect',
    kanji: '善光寺',
    subKanji: '信州名刹・牛に引かれ',
    nameEn: 'Nagano Zenko-ji Temple Goshuin',
    location: 'Nagano · 1,400-Year Pilgrimage Site',
    requirement: 'Complete a 10-card SRS review session',
    culturalNote: 'The saying 「牛に引かれて善光寺参り」 ("led to Zenko-ji by an ox") means being unexpectedly guided toward good fortune.',
  },

  // --- 7-Day Streak Milestone Shrine Seals (5) ---
  {
    id: 'fushimi-inari',
    kind: 'goshuin',
    shape: 'rect',
    kanji: '伏見稲荷',
    subKanji: '千本鳥居・京都伏見',
    nameEn: 'Fushimi Inari 7-Day Streak Milestone',
    location: 'Kyoto · 10,000 Vermilion Torii',
    requirement: 'Maintain an active 7-Day Study Streak (7日連続学習)',
    culturalNote: 'Fushimi Inari’s Senbon Torii tunnel winding up Mount Inari represents over 10,000 torii gates donated by worshippers since 711 AD.',
  },
  {
    id: 'kinkakuji',
    kind: 'goshuin',
    shape: 'rect',
    kanji: '金閣寺',
    subKanji: '鹿苑寺・鏡湖池畔',
    nameEn: 'Kinkaku-ji 14-Day Streak Milestone',
    location: 'Kyoto · Zen Golden Pavilion',
    requirement: 'Maintain an active 14-Day Study Streak (14日連続学習)',
    culturalNote: 'The top two floors of Kinkaku-ji (Rokuon-ji) are covered in pure gold leaf, reflected mirror-like across the Kyoko-chi pond.',
  },
  {
    id: 'itsukushima',
    kind: 'goshuin',
    shape: 'rect',
    kanji: '厳島神社',
    subKanji: '安芸国・海中大鳥居',
    nameEn: 'Itsukushima 21-Day Streak Milestone',
    location: 'Miyajima · Sacred Island of the Gods',
    requirement: 'Maintain an active 21-Day Study Streak (21日連続学習)',
    culturalNote: 'At high tide, the vermilion grand torii gate of Itsukushima Shrine appears to float magically upon the Seto Inland Sea.',
  },
  {
    id: 'meiji-jingu',
    kind: 'goshuin',
    shape: 'rect',
    kanji: '明治神宮',
    subKanji: '代々木・常世の杜',
    nameEn: 'Meiji Jingu 28-Day Streak Milestone',
    location: 'Tokyo · 170-Acre Sacred Forest',
    requirement: 'Maintain an active 28-Day Study Streak (28日連続学習)',
    culturalNote: 'Planted in 1920 with 100,000 trees donated from across Japan, Meiji Jingu’s evergreen forest is designed to self-sustain for 1,000 years.',
  },
  {
    id: 'koyasan',
    kind: 'goshuin',
    shape: 'rect',
    kanji: '金剛峯寺',
    subKanji: '総本山・高野山霊場',
    nameEn: 'Koyasan 35-Day Streak Milestone',
    location: 'Wakayama · Mountain Monastery (816 AD)',
    requirement: 'Maintain an active 35-Day Study Streak (35日連続学習)',
    culturalNote: 'Founded by monk Kobo Daishi (Kukai) in 816 AD atop an 800-meter plateau, Koyasan is the spiritual home of Shingon Esoteric Buddhism.',
  },
];

/** Hash string deterministically into a positive 32-bit integer */
export function dayHash(dateStr: string): number {
  let h = 0;
  for (let i = 0; i < dateStr.length; i++) {
    h = ((h << 5) - h + dateStr.charCodeAt(i)) | 0;
  }
  return Math.abs(h);
}

/**
 * Deterministically awards daily stamps across standard stations/shrines,
 * or awards exclusive cinnabar milestone seals on 7-day streak intervals.
 */
export function getDailyStamp(todayIso: string, streak: number): StampDef {
  // 7-day streak milestone stamps (7, 14, 21, 28, 35...)
  if (streak > 0 && streak % 7 === 0) {
    const mIdx = Math.floor(streak / 7 - 1) % STREAK_MILESTONE_IDS.length;
    const milestoneStamp = STAMPS.find((s) => s.id === STREAK_MILESTONE_IDS[mIdx]);
    if (milestoneStamp) return milestoneStamp;
  }

  // Standard daily rotation across non-milestone stamps
  const standardStamps = STAMPS.filter(
    (s) => !STREAK_MILESTONE_IDS.includes(s.id as (typeof STREAK_MILESTONE_IDS)[number]),
  );
  const h = dayHash(todayIso);
  return standardStamps[h % standardStamps.length] || STAMPS[0];
}

export interface TravelCounterItem {
  display: string;
  answers: string[];
  audio: string;
  options: string[];
}

export const TRAVEL_COUNTERS: TravelCounterItem[] = [
  // 〜つ (General objects)
  { display: '1つ (One thing)', answers: ['ひとつ', 'hitotsu'], audio: 'ひとつ', options: ['ひとつ', 'ふたつ', 'みっつ'] },
  { display: '2つ (Two things)', answers: ['ふたつ', 'futatsu'], audio: 'ふたつ', options: ['ふたつ', 'ひとつ', 'よっつ'] },
  { display: '3つ (Three things)', answers: ['みっつ', 'mittsu'], audio: 'みっつ', options: ['みっつ', 'むっつ', 'いつつ'] },
  { display: '4つ (Four things)', answers: ['よっつ', 'yottsu'], audio: 'よっつ', options: ['よっつ', 'やっつ', 'みっつ'] },
  { display: '5つ (Five things)', answers: ['いつつ', 'itsutsu'], audio: 'いつつ', options: ['いつつ', 'むっつ', 'ななつ'] },
  { display: '10 (Ten things)', answers: ['とお', 'too'], audio: 'とお', options: ['とお', 'じゅう', 'ここのつ'] },

  // 〜人 (People)
  { display: '1人 (One person)', answers: ['ひとり', 'hitori'], audio: 'ひとり', options: ['ひとり', 'ふたり', 'さんにん'] },
  { display: '2人 (Two people)', answers: ['ふたり', 'futari'], audio: 'ふたり', options: ['ふたり', 'ひとり', 'よにん'] },
  { display: '3人 (Three people)', answers: ['さんにん', 'sannin'], audio: 'さんにん', options: ['さんにん', 'よにん', 'ごにん'] },
  { display: '4人 (Four people)', answers: ['よにん', 'yonin'], audio: 'よにん', options: ['よにん', 'しにん', 'さんにん'] },

  // 〜枚 (Flat tickets, sheets, plates)
  { display: '1枚 (One flat ticket/sheet)', answers: ['いちまい', 'ichimai'], audio: 'いちまい', options: ['いちまい', 'にまい', 'さんまい'] },
  { display: '2枚 (Two flat tickets/sheets)', answers: ['にまい', 'nimai'], audio: 'にまい', options: ['にまい', 'いちまい', 'さんまい'] },
  { display: '3枚 (Three flat tickets/sheets)', answers: ['さんまい', 'sanmai'], audio: 'さんまい', options: ['さんまい', 'にまい', 'よんまい'] },

  // 〜本 (Bottles, pens, cylindrical items)
  { display: '1本 (One bottle/umbrella)', answers: ['いっぽん', 'ippon'], audio: 'いっぽん', options: ['いっぽん', 'にほん', 'さんぼん'] },
  { display: '2本 (Two bottles/umbrellas)', answers: ['にほん', 'nihon'], audio: 'にほん', options: ['にほん', 'いっぽん', 'さんぼん'] },
  { display: '3本 (Three bottles/umbrellas)', answers: ['さんぼん', 'sanbon'], audio: 'さんぼん', options: ['さんぼん', 'いっぽん', 'よんほん'] },
  { display: '6本 (Six bottles/umbrellas)', answers: ['ろっぽん', 'roppon'], audio: 'ろっぽん', options: ['ろっぽん', 'ろくほん', 'はちほん'] },

  // 〜杯 (Cups, glasses, bowls)
  { display: '1杯 (One cup/drink/bowl)', answers: ['いっぱい', 'ippai'], audio: 'いっぱい', options: ['いっぱい', 'にはい', 'さんばい'] },
  { display: '2杯 (Two cups/drinks/bowls)', answers: ['にはい', 'nihai'], audio: 'にはい', options: ['にはい', 'いっぱい', 'さんばい'] },
  { display: '3杯 (Three cups/drinks/bowls)', answers: ['さんばい', 'sanbai'], audio: 'さんばい', options: ['さんばい', 'にはい', 'よんはい'] },

  // 〜階 (Building floors)
  { display: '1階 (1st floor)', answers: ['いっかい', 'ikkai'], audio: 'いっかい', options: ['いっかい', 'にかい', 'さんがい'] },
  { display: '2階 (2nd floor)', answers: ['にかい', 'nikai'], audio: 'にかい', options: ['にかい', 'いっかい', 'さんがい'] },
  { display: '3階 (3rd floor)', answers: ['さんがい', 'sangai', 'さんかい', 'sankai'], audio: 'さんがい', options: ['さんがい', 'いっかい', 'よんかい'] },

  // 〜日 (Calendar days of the month)
  { display: '1日 (1st day of month)', answers: ['ついたち', 'tsuitachi'], audio: 'ついたち', options: ['ついたち', 'ふつか', 'みっか'] },
  { display: '2日 (2nd day / 2 days)', answers: ['ふつか', 'futsuka'], audio: 'ふつか', options: ['ふつか', 'ついたち', 'みっか'] },
  { display: '3日 (3rd day / 3 days)', answers: ['みっか', 'mikka'], audio: 'みっか', options: ['みっか', 'ふつか', 'よっか'] },
  { display: '4日 (4th day / 4 days)', answers: ['よっか', 'yokka'], audio: 'よっか', options: ['よっか', 'ようか', 'いつか'] },
  { display: '20日 (20th day / 20 days)', answers: ['はつか', 'hatsuka'], audio: 'はつか', options: ['はつか', 'にじゅうにち', 'ようか'] },
];
