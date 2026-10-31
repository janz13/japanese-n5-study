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

export const STAMPS: StampDef[] = [
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
];
