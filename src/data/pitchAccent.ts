export type PitchType = 'atamadaka' | 'heiban' | 'odaka' | 'nakadaka';

export interface PitchWord {
  kanji: string;
  kana: string;
  morae: string[]; // includes trailing particle (が) to show drop vs flat
  heights: ('H' | 'L')[]; // 1:1 with morae
  patternName: string;
  en: string;
  sentenceJp: string;
  sentenceTts: string; // Kanji sentence so TTS models the lexical pitch contour accurately
  sentenceEn: string;
}

export interface MinimalPair {
  id: string;
  reading: string;
  wordA: PitchWord; // usually Atamadaka [1] (starts HIGH, drops immediately)
  wordB: PitchWord; // usually Heiban [0] or Odaka [2] (starts LOW, rises)
  tip: string;
}

export const PITCH_PAIRS: MinimalPair[] = [
  {
    id: 'ame',
    reading: 'あめ (ame)',
    wordA: {
      kanji: '雨',
      kana: 'あめ',
      morae: ['あ', 'め', 'が'],
      heights: ['H', 'L', 'L'],
      patternName: '頭高 [1] High → Low',
      en: 'rain',
      sentenceJp: 'つめたい 雨が 降っています。',
      sentenceTts: 'つめたい 雨が 降っています。',
      sentenceEn: 'Cold rain is falling.',
    },
    wordB: {
      kanji: '飴',
      kana: 'あめ',
      morae: ['あ', 'め', 'が'],
      heights: ['L', 'H', 'H'],
      patternName: '平板 [0] Low → High (flat)',
      en: 'candy',
      sentenceJp: 'あまい 飴が 好きです。',
      sentenceTts: 'あまい 飴が 好きです。',
      sentenceEn: 'I like sweet candy.',
    },
    tip: 'Think of RAIN (雨) falling DOWN from the sky (High → Low: Á-me), while CANDY (飴) lifts your mood UP (Low → High: a-MÉ-ga).',
  },
  {
    id: 'hashi',
    reading: 'はし (hashi)',
    wordA: {
      kanji: '箸',
      kana: 'はし',
      morae: ['は', 'し', 'で'],
      heights: ['H', 'L', 'L'],
      patternName: '頭高 [1] High → Low',
      en: 'chopsticks',
      sentenceJp: '日本の 箸で ご飯を 食べます。',
      sentenceTts: '日本の 箸で ご飯を 食べます。',
      sentenceEn: 'I eat rice with Japanese chopsticks.',
    },
    wordB: {
      kanji: '橋',
      kana: 'はし',
      morae: ['は', 'し', 'を'],
      heights: ['L', 'H', 'L'],
      patternName: '尾高 [2] Low → High → Low',
      en: 'bridge',
      sentenceJp: '川の 長い 橋を 渡ります。',
      sentenceTts: '川の 長い 橋を 渡ります。',
      sentenceEn: 'I cross the long bridge over the river.',
    },
    tip: 'CHOPSTICKS (箸) pick food up high and drop it down (HÁ-shi), while a BRIDGE (橋) arches up in the middle and drops at the particle (ha-SHÍ-o).',
  },
  {
    id: 'sake',
    reading: 'さけ (sake)',
    wordA: {
      kanji: '鮭',
      kana: 'さけ',
      morae: ['さ', 'け', 'を'],
      heights: ['H', 'L', 'L'],
      patternName: '頭高 [1] High → Low',
      en: 'salmon',
      sentenceJp: '朝ご飯に 鮭を 焼きました。',
      sentenceTts: '朝ご飯に 鮭を 焼きました。',
      sentenceEn: 'I grilled salmon for breakfast.',
    },
    wordB: {
      kanji: '酒',
      kana: 'さけ',
      morae: ['さ', 'け', 'を'],
      heights: ['L', 'H', 'H'],
      patternName: '平板 [0] Low → High (flat)',
      en: 'alcohol / sake',
      sentenceJp: 'おいしい お酒を 飲みます。',
      sentenceTts: 'おいしい お酒を 飲みます。',
      sentenceEn: 'I drink delicious sake.',
    },
    tip: 'SALMON (鮭) leaps high then splashes down (SÁ-ke), while SAKE/ALCOHOL (酒) rises smoothly and stays flat (sa-KÉ-o).',
  },
  {
    id: 'ima',
    reading: 'いま (ima)',
    wordA: {
      kanji: '今',
      kana: 'いま',
      morae: ['い', 'ま', 'は'],
      heights: ['H', 'L', 'L'],
      patternName: '頭高 [1] High → Low',
      en: 'now',
      sentenceJp: '今は 九時です。',
      sentenceTts: '今は 九時です。',
      sentenceEn: 'It is 9 o’clock right now.',
    },
    wordB: {
      kanji: '居間',
      kana: 'いま',
      morae: ['い', 'ま', 'に'],
      heights: ['L', 'H', 'L'],
      patternName: '尾高 [2] Low → High → Low',
      en: 'living room',
      sentenceJp: '家族は 居間に います。',
      sentenceTts: '家族は 居間に います。',
      sentenceEn: 'My family is in the living room.',
    },
    tip: 'NOW (今) is urgent so it starts high immediately (Í-ma), whereas LIVING ROOM (居間) rises on the second mora (i-MÁ-ni).',
  },
  {
    id: 'kami',
    reading: 'かみ (kami)',
    wordA: {
      kanji: '神',
      kana: 'かみ',
      morae: ['か', 'み', 'が'],
      heights: ['H', 'L', 'L'],
      patternName: '頭高 [1] High → Low',
      en: 'god / deity',
      sentenceJp: '山の 神を まつります。',
      sentenceTts: '山の 神を まつります。',
      sentenceEn: 'They enshrine the mountain deity.',
    },
    wordB: {
      kanji: '紙',
      kana: 'かみ',
      morae: ['か', 'み', 'に'],
      heights: ['L', 'H', 'L'],
      patternName: '尾高 [2] Low → High → Low',
      en: 'paper',
      sentenceJp: '白い 紙に 名前を 書きます。',
      sentenceTts: '白い 紙に 名前を 書きます。',
      sentenceEn: 'I write my name on white paper.',
    },
    tip: 'GOD (神) is high up in the heavens (KÁ-mi), while PAPER (紙) rises on み and drops on the particle (ka-MÍ-ni).',
  },
  {
    id: 'kaeru',
    reading: 'かえる (kaeru)',
    wordA: {
      kanji: '帰る',
      kana: 'かえる',
      morae: ['か', 'え', 'る'],
      heights: ['H', 'L', 'L'],
      patternName: '頭高 [1] High → Low → Low',
      en: 'to return home',
      sentenceJp: '六時に 家へ 帰る。',
      sentenceTts: '六時に 家へ 帰る。',
      sentenceEn: 'I return home at 6 o’clock.',
    },
    wordB: {
      kanji: '蛙',
      kana: 'かえる',
      morae: ['か', 'え', 'る', 'が'],
      heights: ['L', 'H', 'H', 'H'],
      patternName: '平板 [0] Low → High → High',
      en: 'frog',
      sentenceJp: '池に 蛙が います。',
      sentenceTts: '池に 蛙が います。',
      sentenceEn: 'There is a frog in the pond.',
    },
    tip: 'RETURN HOME (帰る) drops right after か (KÁ-e-ru), while FROG (蛙) jumps up and stays high (ka-É-RU-ga).',
  },
];
