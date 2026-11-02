export interface MorphStep {
  label: string;
  stem: string;
  suffix: string;
  fullKanji: string;
  fullKana: string;
  romaji: string;
  explanation: string;
}

export interface ConjugationLesson {
  id: string;
  title: string;
  titleJp: string;
  level: 'N5' | 'N4';
  description: string;
  keyRule: string;
  sections: {
    heading: string;
    body: string;
    tip?: string;
    examples?: {
      kanji: string;
      kana: string;
      en: string;
      breakdown: string;
    }[];
  }[];
  interactiveMorph: {
    wordDict: string;
    wordReading: string;
    wordMeaning: string;
    group: string;
    steps: MorphStep[];
  };
  quiz: {
    q: string;
    options: string[];
    answer: number;
    explanation: string;
  }[];
}

export const CONJUGATION_LESSONS: ConjugationLesson[] = [
  {
    id: 'c-groups',
    title: 'The 3 Verb Groups (動詞のグループ)',
    titleJp: '動詞の3グループの見分け方',
    level: 'N5',
    description: 'Every single Japanese verb in existence belongs to one of three groups. Master this classification rule first, and conjugations become a breeze!',
    keyRule: 'Group 2 (Ichidan) always ends in -iru or -eru. Group 3 is just 2 irregular verbs (する & くる). Group 1 (Godan) is everything else.',
    sections: [
      {
        heading: '1. Group 2: 一段 (Ichidan / Ru-Verbs) — The Simplest',
        body: 'These are the friendliest verbs in Japanese. To conjugate an Ichidan verb, you NEVER change the stem — you simply drop the final る and snap on your new ending! They almost always have an "i" sound or "e" sound right before る (e.g. tab-e-ru, m-i-ru).',
        examples: [
          { kanji: '食べる', kana: 'たべる', en: 'to eat', breakdown: 'Stem: たべ + る (e-sound before る → Group 2)' },
          { kanji: '見る', kana: 'みる', en: 'to see', breakdown: 'Stem: み + る (i-sound before る → Group 2)' },
          { kanji: '起きる', kana: 'おきる', en: 'to wake up', breakdown: 'Stem: おき + る (i-sound before る → Group 2)' },
          { kanji: '寝る', kana: 'ねる', en: 'to sleep', breakdown: 'Stem: ね + る (e-sound before る → Group 2)' },
        ],
      },
      {
        heading: '2. Group 3: 不規則 (Irregular Verbs) — Only Two in the Entire Language!',
        body: 'Unlike English or Spanish which have hundreds of irregular verbs, Japanese has ONLY TWO: する (to do) and 来る / くる (to come). Memorize them once and you are done.',
        examples: [
          { kanji: 'する', kana: 'する', en: 'to do', breakdown: 'Polite: します · Negative: しない · Te-form: して' },
          { kanji: '来る', kana: 'くる', en: 'to come', breakdown: 'Polite: きます · Negative: こない · Te-form: きて' },
        ],
      },
      {
        heading: '3. Group 1: 五段 (Godan / U-Verbs) — The 5-Vowel Wheel',
        body: 'Any verb that does NOT fit Group 2 or Group 3 is Group 1 (Godan). Their dictionary form can end in any of 9 sounds: う, く, ぐ, す, つ, ぬ, ぶ, む, る. Their final syllable shifts across the 5 vowels (a, i, u, e, o) to form polite, negative, and potential forms!',
        tip: '⚠️ TRAP ALERT: A handful of verbs like 帰る (かえる - to return home) and 入る (はいる - to enter) look like Group 2 because they end in -eru or -iru, but they are actually Group 1 Godan verbs! Always watch out for 帰る and 入る.',
        examples: [
          { kanji: '飲む', kana: 'のむ', en: 'to drink', breakdown: 'Ends in む → Group 1 Godan' },
          { kanji: '書く', kana: 'かく', en: 'to write', breakdown: 'Ends in く → Group 1 Godan' },
          { kanji: '話す', kana: 'はなす', en: 'to speak', breakdown: 'Ends in す → Group 1 Godan' },
          { kanji: '帰る', kana: 'かえる', en: 'to return home', breakdown: 'Godan trap! 帰ります, not 帰ます' },
        ],
      },
    ],
    interactiveMorph: {
      wordDict: '食べる',
      wordReading: 'たべる',
      wordMeaning: 'to eat (Group 2 Ichidan)',
      group: 'ichidan',
      steps: [
        { label: 'Dictionary', stem: 'たべ', suffix: 'る', fullKanji: '食べる', fullKana: 'たべる', romaji: 'taberu', explanation: 'Original plain dictionary form.' },
        { label: 'Polite (ます)', stem: 'たべ', suffix: 'ます', fullKanji: '食べます', fullKana: 'たべます', romaji: 'tabemasu', explanation: 'Just drop る and snap on ます!' },
        { label: 'Negative (ない)', stem: 'たべ', suffix: 'ない', fullKanji: '食べない', fullKana: 'たべない', romaji: 'tabenai', explanation: 'Drop る and snap on ない!' },
        { label: 'Te-form (て)', stem: 'たべ', suffix: 'て', fullKanji: '食べて', fullKana: 'たべて', romaji: 'tabete', explanation: 'Drop る and snap on て for connecting actions or asking please!' },
        { label: 'Plain Past (た)', stem: 'たべ', suffix: 'た', fullKanji: '食べた', fullKana: 'たべた', romaji: 'tabeta', explanation: 'Drop る and snap on た for casual past tense.' },
      ],
    },
    quiz: [
      {
        q: 'Which group does 見る (みる / to watch) belong to?',
        options: ['Group 1 (Godan)', 'Group 2 (Ichidan)', 'Group 3 (Irregular)'],
        answer: 1,
        explanation: '見る ends in -iru (み + る) and is a classic Group 2 Ichidan verb: drop る → 見ます / 見ない / 見て.',
      },
      {
        q: 'Which verb is a notorious Group 1 Godan "trap" that looks like Group 2?',
        options: ['食べる (たべる)', '起きる (おきる)', '帰る (かえる)'],
        answer: 2,
        explanation: '帰る (かえる - to return) ends in -eru but conjugates as Godan: かえります (not かえます) and かえって (not かえて).',
      },
      {
        q: 'How many irregular verbs exist in standard Japanese?',
        options: ['Only 2 (する and くる)', 'Over 50', 'About 12'],
        answer: 0,
        explanation: 'Only 2! する (to do) and 来る / くる (to come). All compound verbs like 勉強する follow する.',
      },
    ],
  },
  {
    id: 'c-godan-wheel',
    title: 'The Godan 5-Vowel Wheel (五段活用)',
    titleJp: 'あ・い・う・え・お 段の音の変わり方',
    level: 'N5',
    description: 'Why is it called Godan (五段 = 5 Steps)? Because the last kana shifts across the 5 vowels of the Japanese kana chart: a, i, u, e, o!',
    keyRule: 'A-row = Negative (かない) · I-row = Polite Stem (きます) · U-row = Dictionary (く) · E-row = Potential/Imperative (ける) · O-row = Volitional/Let’s (こう)',
    sections: [
      {
        heading: 'The Magic Vowel Wheel: Example with 書く (かく / to write)',
        body: 'Notice how the stem "か" stays frozen, and only the final column changes based on the target vowel:',
        examples: [
          { kanji: '書かない', kana: 'かかない', en: 'Will not write (Negative)', breakdown: 'く shifted to A-row か + ない' },
          { kanji: '書きます', kana: 'かきます', en: 'Writes (Polite Present)', breakdown: 'く shifted to I-row き + ます' },
          { kanji: '書く', kana: 'かく', en: 'To write (Dictionary)', breakdown: 'Original U-row く' },
          { kanji: '書ける', kana: 'かける', en: 'Can write (Potential)', breakdown: 'く shifted to E-row け + る' },
          { kanji: '書こう', kana: 'かこう', en: 'Let’s write! (Volitional)', breakdown: 'く shifted to O-row こ + う' },
        ],
      },
      {
        heading: 'Special U-Ending Rule (う → わ, NOT あ!)',
        body: 'For verbs ending in pure う like 買う (かう / to buy) or 会う (あう / to meet), shifting to the A-row becomes わ, NOT あ! This prevents two identical vowels from clashing.',
        examples: [
          { kanji: '買わない', kana: 'かわない', en: 'Will not buy', breakdown: 'う shifts to わ + ない (never かあない)' },
          { kanji: '会わない', kana: 'あわない', en: 'Will not meet', breakdown: 'う shifts to わ + ない (never ああない)' },
        ],
      },
    ],
    interactiveMorph: {
      wordDict: '飲む',
      wordReading: 'のむ',
      wordMeaning: 'to drink (Group 1 Godan - む row: ま・み・む・め・も)',
      group: 'godan',
      steps: [
        { label: 'U-row (Dictionary)', stem: 'の', suffix: 'む', fullKanji: '飲む', fullKana: 'のむ', romaji: 'nomu', explanation: 'Dictionary form ending in む (U-row).' },
        { label: 'I-row (Polite)', stem: 'の', suffix: 'みます', fullKanji: '飲みます', fullKana: 'のみます', romaji: 'nomimasu', explanation: 'Shift む → み (I-row) + ます for polite speech.' },
        { label: 'A-row (Negative)', stem: 'の', suffix: 'まない', fullKanji: '飲まない', fullKana: 'のまない', romaji: 'nomanai', explanation: 'Shift む → ま (A-row) + ない for negative statement.' },
        { label: 'E-row (Potential)', stem: 'の', suffix: 'める', fullKanji: '飲める', fullKana: 'のめる', romaji: 'nomeru', explanation: 'Shift む → め (E-row) + る for "can drink".' },
        { label: 'O-row (Let’s)', stem: 'の', suffix: 'もう', fullKanji: '飲もう', fullKana: 'のもう', romaji: 'nomou', explanation: 'Shift む → も (O-row) + う for casual "let’s drink!".' },
      ],
    },
    quiz: [
      {
        q: 'What is the polite negative form of 話す (はなす / to speak)?',
        options: ['はなしません', 'はなせません', 'はなさない'],
        answer: 0,
        explanation: 'す shifts to I-row し + ません: 話しません (はなしません).',
      },
      {
        q: 'What is the plain negative form of 買う (かう / to buy)?',
        options: ['かあない', 'かわない', 'かいません'],
        answer: 1,
        explanation: 'Verbs ending in う shift to わ in the A-row: 買わない (かわない).',
      },
    ],
  },
  {
    id: 'c-te-form',
    title: 'The Master Te-Form (て形の歌と音便)',
    titleJp: 'て形とた形の完全マスター',
    level: 'N5',
    description: 'The Te-Form (〜て / 〜で) is the master key to Japanese grammar: it connects actions, makes requests (〜てください), expresses ongoing states (〜ています), and grants permission (〜てもいい).',
    keyRule: 'Ichidan: drop る + て. Godan: follow the rhyming sound changes (う・つ・る → って, む・ぶ・ぬ → んで, く → いて, ぐ → いで, す → して). Exception: 行く → 行って.',
    sections: [
      {
        heading: 'The Famous "Te-Form Rhyme"',
        body: 'Sing this to the tune of "Silver Bells" or "Twinkle Twinkle Little Star":\n\n🎶 う・つ・る → って (u, tsu, ru → tte)\n🎶 む・ぶ・ぬ → んで (mu, bu, nu → nde)\n🎶 く → いて (ku → ite), ぐ → いで (gu → ide)\n🎶 す → して (su → shite)\n🎶 来る → 来て (kuru → kite), する → して (suru → shite)\n🎶 行く goes to 行って (itte)!',
        examples: [
          { kanji: '待つ → 待って', kana: 'まつ → まって', en: 'wait → please wait', breakdown: 'つ → って' },
          { kanji: '飲む → 飲んで', kana: 'のむ → のんで', en: 'drink → drinking', breakdown: 'む → んで' },
          { kanji: '書く → 書いて', kana: 'かく → かいて', en: 'write → writing', breakdown: 'く → いて' },
          { kanji: '泳ぐ → 泳いで', kana: 'およぐ → およいで', en: 'swim → swimming', breakdown: 'ぐ → いで (voiced!)' },
          { kanji: '話す → 話して', kana: 'はなす → はなして', en: 'speak → speaking', breakdown: 'す → して' },
          { kanji: '行く → 行って', kana: 'いく → いって', en: 'go → going', breakdown: '⚠️ The one big exception! Not いいて, but 行って!' },
        ],
      },
      {
        heading: 'Secret Hack: The Ta-Form (Past) is 100% Identical!',
        body: 'Once you know the Te-form, you automatically know the casual past tense (Ta-form)! Just replace "te" with "ta", and "de" with "da":\n- 食べて → 食べた (ate)\n- 飲んで → 飲んだ (drank)\n- 書いて → 書いた (wrote)\n- 行って → 行った (went)',
      },
    ],
    interactiveMorph: {
      wordDict: '待つ',
      wordReading: 'まつ',
      wordMeaning: 'to wait (Godan ending in つ)',
      group: 'godan',
      steps: [
        { label: 'Dictionary', stem: 'ま', suffix: 'つ', fullKanji: '待つ', fullKana: 'まつ', romaji: 'matsu', explanation: 'Dictionary form.' },
        { label: 'Te-form (う・つ・る → って)', stem: 'ま', suffix: 'って', fullKanji: '待って', fullKana: 'まって', romaji: 'matte', explanation: 'Drop つ and snap on small っ + て (待ってください = please wait).' },
        { label: 'Ta-form (Past)', stem: 'ま', suffix: 'った', fullKanji: '待った', fullKana: 'まった', romaji: 'matta', explanation: 'Same sound change with た: 待った (waited).' },
        { label: 'Polite Present', stem: 'ま', suffix: 'ちます', fullKanji: '待ちます', fullKana: 'まちます', romaji: 'machimasu', explanation: 'I-row: 待ちます.' },
      ],
    },
    quiz: [
      {
        q: 'What is the te-form of 飲む (のむ / to drink)?',
        options: ['のんで', 'のみて', 'のって'],
        answer: 0,
        explanation: 'む・ぶ・ぬ verbs turn into んで: 飲んで (のんで).',
      },
      {
        q: 'What is the te-form of 行く (いく / to go)?',
        options: ['いいて', 'いって (行って)', 'いぎて'],
        answer: 1,
        explanation: '行く is the famous exception: instead of "iite", it becomes 行って (いって).',
      },
      {
        q: 'What is the casual past form (Ta-form) of 泳ぐ (およぐ / to swim)?',
        options: ['およいた', 'およんだ', 'およいだ (泳いだ)'],
        answer: 2,
        explanation: 'ぐ turns into いで in te-form (泳いで) and いだ in ta-form (泳いだ). Notice the voiced dakuten!',
      },
    ],
  },
  {
    id: 'c-adjectives',
    title: 'The Two Adjective Tribes (い-形容詞 vs な-形容詞)',
    titleJp: 'い形容詞とな形容詞の4パターン変化',
    level: 'N5',
    description: 'Japanese adjectives fall into two distinct families: true "I-Adjectives" (which conjugate like mini-verbs) and "Na-Adjectives" (which behave like nouns).',
    keyRule: 'い-adj: change い to くない (neg), かった (past), くなかった (past-neg). な-adj: use copula じゃない, でした, じゃなかった; add な before nouns.',
    sections: [
      {
        heading: '1. い-Adjectives (True Adjectives)',
        body: 'These always end in a pure Hiragana い (e.g. たか-い, さむ-い, おおき-い). They NEVER use だ or じゃない. Instead, the final い morphs directly:',
        examples: [
          { kanji: '高い', kana: 'たかい', en: 'expensive / tall (Present Affirmative)', breakdown: 'Dictionary form' },
          { kanji: '高くない', kana: 'たかくない', en: 'Not expensive (Negative)', breakdown: 'Drop い + くない' },
          { kanji: '高かった', kana: 'たかかった', en: 'Was expensive (Past)', breakdown: 'Drop い + かった' },
          { kanji: '高くなかった', kana: 'たかくなかった', en: 'Was not expensive (Past Negative)', breakdown: 'Drop い + くなかった' },
        ],
        tip: '⚠️ SUPER EXCEPTION: いい (good) comes from older 良い (よい). For any conjugation, you MUST use the よ- stem: よくない (not good), よかった (was good), よくなかった (was not good)!',
      },
      {
        heading: '2. な-Adjectives (Adjectival Nouns)',
        body: 'These describe qualities, but grammatically they act just like nouns! When modifying a noun directly, they need "な" (e.g. 静かな町 = quiet town). When making sentences, they use regular noun endings (です, じゃない, でした, じゃなかった):',
        examples: [
          { kanji: '静かです', kana: 'しずかです', en: 'It is quiet', breakdown: 'Stem + です' },
          { kanji: '静かじゃない', kana: 'しずかじゃない', en: 'It is not quiet', breakdown: 'Stem + じゃない (or ではありません)' },
          { kanji: '静かでした', kana: 'しずかでした', en: 'It was quiet', breakdown: 'Stem + でした (casual: だった)' },
          { kanji: '静かじゃなかった', kana: 'しずかじゃなかった', en: 'It was not quiet', breakdown: 'Stem + じゃなかった' },
        ],
        tip: '⚠️ TRAP ALERT: きれい (pretty/clean) and 有名 (ゆうめい / famous) end in the "i" sound, but they are NOT い-adjectives! They are な-adjectives (きれいな花, 有名な人).',
      },
    ],
    interactiveMorph: {
      wordDict: '寒い',
      wordReading: 'さむい',
      wordMeaning: 'cold (い-Adjective)',
      group: 'i-adj',
      steps: [
        { label: 'Present Affirmative', stem: 'さむ', suffix: 'い', fullKanji: '寒い', fullKana: 'さむい', romaji: 'samui', explanation: 'It is cold.' },
        { label: 'Present Negative (くない)', stem: 'さむ', suffix: 'くない', fullKanji: '寒くない', fullKana: 'さむくない', romaji: 'samukunai', explanation: 'Drop い + くない: It is not cold.' },
        { label: 'Past Affirmative (かった)', stem: 'さむ', suffix: 'かった', fullKanji: '寒かった', fullKana: 'さむかった', romaji: 'samukatta', explanation: 'Drop い + かった: It was cold.' },
        { label: 'Past Negative (くなかった)', stem: 'さむ', suffix: 'くなかった', fullKanji: '寒くなかった', fullKana: 'さむくなかった', romaji: 'samukunakatta', explanation: 'Drop い + くなかった: It was not cold.' },
        { label: 'Connecting Te-form (くて)', stem: 'さむ', suffix: 'くて', fullKanji: '寒くて', fullKana: 'さむくて', romaji: 'samukute', explanation: 'Drop い + くて: It was cold and...' },
      ],
    },
    quiz: [
      {
        q: 'What is the past tense of いい (good)?',
        options: ['いかった', 'よかった', 'いいでした'],
        answer: 1,
        explanation: 'いい always shifts to stem よ- for conjugations: よかった (was good).',
      },
      {
        q: 'Which of the following is actually a な-adjective despite ending in an "i" sound?',
        options: ['おいしい (delicious)', 'あつい (hot)', 'きれい (pretty/clean)'],
        answer: 2,
        explanation: 'きれい (綺麗) is a な-adjective! You say きれいな部屋 (clean room), not きれいくない.',
      },
      {
        q: 'How do you say "was not quiet" using 静か (しずか)?',
        options: ['静かくなかった', '静かじゃなかった', '静かないでした'],
        answer: 1,
        explanation: 'な-adjectives conjugate like nouns: 静かじゃなかった (casual) or 静かではありませんでした (polite).',
      },
    ],
  },
];
