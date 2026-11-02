export interface CampaignStage {
  id: string;
  stageNumber: number;
  title: string;
  titleJp: string;
  icon: string;
  category: 'Kana' | 'Kanji' | 'Grammar' | 'Conjugation' | 'Immersion' | 'Boss';
  description: string;
  targetRoute: string;
  actionPrompt: string;
}

export interface BossQuestion {
  q: string;
  options: string[];
  answer: number;
  explanation: string;
}

export interface CampaignSaga {
  sagaNumber: number;
  id: string;
  title: string;
  titleJp: string;
  theme: string;
  badge: string;
  unlockThresholdScore: number;
  stages: CampaignStage[];
  boss: {
    title: string;
    description: string;
    minPassScore: number;
    questions: BossQuestion[];
  };
}

export const CAMPAIGN_SAGAS: CampaignSaga[] = [
  {
    sagaNumber: 1,
    id: 'saga-1',
    title: 'Saga 1: Ground Zero',
    titleJp: '第1章：ひらがなと基本挨拶',
    theme: 'Master Hiragana, essential pronunciation, numbers, and your first sentences.',
    badge: '🌱 Tokyo Arrival Pioneer',
    unlockThresholdScore: 0,
    stages: [
      {
        id: 's1-1',
        stageNumber: 1,
        title: 'Basic Hiragana Vowels (あいうえお)',
        titleJp: '母音の習得',
        icon: '✍️',
        category: 'Kana',
        description: 'Learn the foundational 5 vowels of the Japanese sound system.',
        targetRoute: '/kana',
        actionPrompt: 'Practice in Kana Dojo →',
      },
      {
        id: 's1-2',
        stageNumber: 2,
        title: 'First Numbers & Counters (一二三四五)',
        titleJp: '数字と数え方',
        icon: '🔢',
        category: 'Kanji',
        description: 'Read and write numbers 1 to 10 in Kanji with their Onyomi and Kunyomi readings.',
        targetRoute: '/kanji-dojo',
        actionPrompt: 'Drill in Kanji Dojo →',
      },
      {
        id: 's1-3',
        stageNumber: 3,
        title: 'Grammar Lesson 1: Introductions & です/ます',
        titleJp: '自己紹介・〜は〜です',
        icon: '📐',
        category: 'Grammar',
        description: 'Form your very first Japanese sentences using the topic marker は and polite copula です.',
        targetRoute: '/grammar/g1',
        actionPrompt: 'Read Lesson 1 →',
      },
      {
        id: 's1-4',
        stageNumber: 4,
        title: 'Story Chapter 1: Arriving in Tokyo',
        titleJp: '物語第1話：とうきょうへ',
        icon: '📖',
        category: 'Immersion',
        description: 'Read about Ana stepping off the airplane at Haneda Airport in Tokyo.',
        targetRoute: '/stories/ch1-arrival',
        actionPrompt: 'Read Story Ch.1 →',
      },
    ],
    boss: {
      title: 'Gatekeeper Challenge: Haneda Airport Customs (羽田空港)',
      description: 'Answer 4 questions correctly to pass airport customs and unlock Saga 2.',
      minPassScore: 3,
      questions: [
        {
          q: 'Which character represents the sound "ka"?',
          options: ['か', 'さ', 'た', 'な'],
          answer: 0,
          explanation: 'か is "ka". さ is "sa", た is "ta", な is "na".',
        },
        {
          q: 'How do you say "I am a student" in polite Japanese?',
          options: ['わたし は がくせい です。', 'わたし が がくせい だ。', 'がくせい は わたし です。'],
          answer: 0,
          explanation: 'わたし (I) + は (topic) + がくせい (student) + です (am/is).',
        },
        {
          q: 'What is the reading of 三時?',
          options: ['にじ', 'さんじ', 'よじ'],
          answer: 1,
          explanation: '三 (さん = 3) + 時 (じ = o’clock) = さんじ (3 o’clock).',
        },
        {
          q: 'Which word means "good morning" among polite company?',
          options: ['こんにちは', 'おはようございます', 'こんばんは'],
          answer: 1,
          explanation: 'おはようございます is polite good morning.',
        },
      ],
    },
  },
  {
    sagaNumber: 2,
    id: 'saga-2',
    title: 'Saga 2: The Reading Bridge',
    titleJp: '第2章：カタカナと街頭看板',
    theme: 'Crack Katakana, loanwords, street signs, and order food at a ramen ticket machine.',
    badge: '🍜 Tokyo Street Navigator',
    unlockThresholdScore: 70,
    stages: [
      {
        id: 's2-1',
        stageNumber: 1,
        title: 'Katakana Chart & Loanwords (アイウエオ)',
        titleJp: 'カタカナのマスター',
        icon: '✍️',
        category: 'Kana',
        description: 'Read borrowed foreign words like コーヒー, ラーメン, and ホテル.',
        targetRoute: '/kana',
        actionPrompt: 'Switch to Katakana in Dojo →',
      },
      {
        id: 's2-2',
        stageNumber: 2,
        title: 'Street & Subway Signs (看板デコーダー)',
        titleJp: '駅と街の看板',
        icon: '🚇',
        category: 'Immersion',
        description: 'Recognize vital city signs: 入口 (Entrance), 出口 (Exit), 非常口 (Emergency Exit).',
        targetRoute: '/signs',
        actionPrompt: 'Decode Signs →',
      },
      {
        id: 's2-3',
        stageNumber: 3,
        title: 'Ramen Ticket Machine (食券機) Ordering',
        titleJp: 'ラーメン食券機シミュレーター',
        icon: '🎫',
        category: 'Immersion',
        description: 'Practice purchasing ramen, egg toppings (味玉), and noodle refills (替玉) on real vending buttons.',
        targetRoute: '/signs',
        actionPrompt: 'Launch Shokkenki Simulator →',
      },
      {
        id: 's2-4',
        stageNumber: 4,
        title: 'Story Chapter 2: Riding the Yamanote Train',
        titleJp: '物語第2話：電車に乗る',
        icon: '📖',
        category: 'Immersion',
        description: 'Follow Ana as she buys a train ticket (きっぷ) and boards the green Yamanote line.',
        targetRoute: '/stories/ch2-train',
        actionPrompt: 'Read Story Ch.2 →',
      },
    ],
    boss: {
      title: 'Gatekeeper Challenge: Shibuya Ramen Shop Order (渋谷)',
      description: 'Prove your ability to decode menu kanji, katakana tickets, and numbers.',
      minPassScore: 3,
      questions: [
        {
          q: 'Which katakana word represents "coffee"?',
          options: ['コーラ', 'コーヒー', 'ケーキ'],
          answer: 1,
          explanation: 'コーヒー is coffee. コーラ is cola, ケーキ is cake.',
        },
        {
          q: 'What does the button [大盛] mean on a ramen ticket machine?',
          options: ['Regular size', 'Large portion / upsizing', 'Take-out box'],
          answer: 1,
          explanation: '大盛 (おおもり) means a large portion of noodles/rice.',
        },
        {
          q: 'Which kanji combination means "Ticket Gate"?',
          options: ['改札口 (かいさつぐち)', '非常口 (ひじょうぐち)', '両替機 (りょうがえき)'],
          answer: 0,
          explanation: '改札口 is the train ticket gate.',
        },
        {
          q: 'How much is 千五百円 (1,500 yen)?',
          options: ['150 yen', '1,500 yen', '15,000 yen'],
          answer: 1,
          explanation: '千 (1,000) + 五百 (500) + 円 (yen) = 1,500 yen.',
        },
      ],
    },
  },
  {
    sagaNumber: 3,
    id: 'saga-3',
    title: 'Saga 3: The Sentence Engine',
    titleJp: '第3章：助詞と基本日常動詞',
    theme: 'Master essential particles (は, を, に, で) and daily routine verbs.',
    badge: '🍱 Daily Habit Architect',
    unlockThresholdScore: 70,
    stages: [
      {
        id: 's3-1',
        stageNumber: 1,
        title: 'Core Particle Dojo (は, を, に, で)',
        titleJp: '助詞道場・基本4助詞',
        icon: '🎯',
        category: 'Grammar',
        description: 'Never confuse location of action (で) with destination/target of movement (に).',
        targetRoute: '/particles',
        actionPrompt: 'Train Particles →',
      },
      {
        id: 's3-2',
        stageNumber: 2,
        title: 'Kanji Dojo: Nature & Calendar Elements',
        titleJp: '漢字道場：自然と暦',
        icon: '🀄',
        category: 'Kanji',
        description: 'Type meanings and readings for 日, 月, 火, 水, 木, 金, 土, 年, 時, 分.',
        targetRoute: '/kanji-dojo',
        actionPrompt: 'Start Kanji Dojo →',
      },
      {
        id: 's3-3',
        stageNumber: 3,
        title: 'Grammar Lesson 2: Verbs & Daily Routine',
        titleJp: '文法第2課：日常の動作',
        icon: '📐',
        category: 'Grammar',
        description: 'Express daily habits: 朝ごはんを食べます (eat breakfast) and 図書館へ行きます (go to library).',
        targetRoute: '/grammar/g2',
        actionPrompt: 'Study Lesson 2 →',
      },
      {
        id: 's3-4',
        stageNumber: 4,
        title: 'Daily 5-Minute Bento Routine',
        titleJp: '毎日の5分弁当ルーティン',
        icon: '🍱',
        category: 'Immersion',
        description: 'Complete a full 4-course Bento workout: Kana warm-up, SRS review, Kanji trace, and sign test.',
        targetRoute: '/bento',
        actionPrompt: 'Open Daily Bento →',
      },
    ],
    boss: {
      title: 'Gatekeeper Challenge: Asakusa Sensoji Temple Tour (浅草)',
      description: 'Demonstrate flawless particle usage and daily verb knowledge.',
      minPassScore: 3,
      questions: [
        {
          q: 'Fill in the blank: レストラン（　）ラーメン を 食べます。',
          options: ['に', 'で', 'を'],
          answer: 1,
          explanation: 'で marks the location where an active action takes place (eating at a restaurant).',
        },
        {
          q: 'Fill in the blank: 8時（　）学校 へ 行きます。',
          options: ['に', 'で', 'は'],
          answer: 0,
          explanation: 'に marks a specific point in time (at 8 o’clock).',
        },
        {
          q: 'What is the reading of 水曜日?',
          options: ['かようび', 'すいようび', 'もくようび'],
          answer: 1,
          explanation: '水曜日 (すいようび) is Wednesday.',
        },
        {
          q: 'What does 毎朝 (まいあさ) mean?',
          options: ['Every evening', 'Every morning', 'Every week'],
          answer: 1,
          explanation: '毎朝 is every morning.',
        },
      ],
    },
  },
  {
    sagaNumber: 4,
    id: 'saga-4',
    title: 'Saga 4: Action & Inflections',
    titleJp: '第4章：動詞グループとて形・形容詞',
    theme: 'Unlock the mental models for 3 Verb Groups, the Te-Form rhyme, and the Two Adjective Tribes.',
    badge: '⚡ Inflection Sorcerer',
    unlockThresholdScore: 70,
    stages: [
      {
        id: 's4-1',
        stageNumber: 1,
        title: 'Conjugation Lesson 1: The 3 Verb Groups',
        titleJp: '動詞の3グループ分類',
        icon: '📖',
        category: 'Conjugation',
        description: 'Identify Ichidan, Godan, and Irregular verbs using the interactive morph slider.',
        targetRoute: '/conjugate',
        actionPrompt: 'Study Lesson 1 →',
      },
      {
        id: 's4-2',
        stageNumber: 2,
        title: 'Conjugation Lesson 3: The Te-Form Rhyme (て形)',
        titleJp: 'て形の歌と音便ルール',
        icon: '🔗',
        category: 'Conjugation',
        description: 'Master connecting verbs and making polite requests with 〜てください.',
        targetRoute: '/conjugate',
        actionPrompt: 'Learn Te-Form →',
      },
      {
        id: 's4-3',
        stageNumber: 3,
        title: 'Conjugation Lesson 4: The Two Adjective Tribes (い vs な)',
        titleJp: 'い形容詞とな形容詞',
        icon: '🟡',
        category: 'Conjugation',
        description: 'Conjugate present, negative, past, and past-negative for both adjective families.',
        targetRoute: '/conjugate',
        actionPrompt: 'Master Adjectives →',
      },
      {
        id: 's4-4',
        stageNumber: 4,
        title: 'Story Chapter 4: Dining at an Izakaya',
        titleJp: '物語第4話：居酒屋での注文',
        icon: '📖',
        category: 'Immersion',
        description: 'Read natural dialogue ordering food and asking for recommendations with 〜てください.',
        targetRoute: '/stories/ch4-izakaya',
        actionPrompt: 'Read Story Ch.4 →',
      },
    ],
    boss: {
      title: 'Gatekeeper Challenge: Akihabara Electronics Negotiation (秋葉原)',
      description: 'Pass the inflection boss fight by proving you can conjugate verbs and adjectives under pressure.',
      minPassScore: 3,
      questions: [
        {
          q: 'What is the te-form of 書く (かく / to write)?',
          options: ['かいて', 'かきて', 'かって'],
          answer: 0,
          explanation: 'く shifts to いて: 書いて (かいて).',
        },
        {
          q: 'What is the negative past form of 高い (たかい / expensive)?',
          options: ['高くないでした', '高くなかった', '高かったじゃない'],
          answer: 1,
          explanation: 'Drop い + くなかった: 高くなかった (was not expensive).',
        },
        {
          q: 'Which verb is an irregular verb?',
          options: ['食べる', '話す', 'する'],
          answer: 2,
          explanation: 'する and くる are the only two irregular verbs.',
        },
        {
          q: 'What is the polite request form of 待つ (まつ / to wait)?',
          options: ['待ってください (まってください)', 'まちてください', 'またないで'],
          answer: 0,
          explanation: 'つ shifts to って: 待ってください (please wait).',
        },
      ],
    },
  },
  {
    sagaNumber: 5,
    id: 'saga-5',
    title: 'Saga 5: Full N5 Mastery',
    titleJp: '第5章：N5総まとめと模擬試験',
    theme: 'Counters, past tense, desires (〜たい), sound-symbolic onomatopoeia, and the official mock exam.',
    badge: '🎓 Official JLPT N5 Certified',
    unlockThresholdScore: 70,
    stages: [
      {
        id: 's5-1',
        stageNumber: 1,
        title: 'Counter & Date Dojo (助数詞・日付)',
        titleJp: '助数詞とカレンダーの日付',
        icon: '🔢',
        category: 'Grammar',
        description: 'Master irregular calendar days (ついたち, ふつか, みっか) and people counters (ひとり, ふたり).',
        targetRoute: '/counters',
        actionPrompt: 'Drill Counters →',
      },
      {
        id: 's5-2',
        stageNumber: 2,
        title: 'Particle Nuances (は vs が & 擬音語)',
        titleJp: 'は vs が とオノマトペ',
        icon: '✨',
        category: 'Grammar',
        description: 'Understand topic contrast vs subject focus, plus iconic sound words like ペコペコ and ドキドキ.',
        targetRoute: '/particles',
        actionPrompt: 'Explore Nuances →',
      },
      {
        id: 's5-3',
        stageNumber: 3,
        title: 'Speaking Role-Play Scenario 3: Asking Directions',
        titleJp: '会話シナリオ：道を聞く',
        icon: '🎤',
        category: 'Immersion',
        description: 'Speak real Japanese aloud and test your pronunciation with speech recognition.',
        targetRoute: '/speaking/s3',
        actionPrompt: 'Practice Speaking →',
      },
      {
        id: 's5-4',
        stageNumber: 4,
        title: 'Official JLPT N5 Full Simulation (67 Qs)',
        titleJp: '日本語能力試験 N5 フル模試',
        icon: '🎓',
        category: 'Boss',
        description: 'Complete the full 67-question N5 exam with all 3 timed sections: Vocab, Grammar/Reading, and Listening.',
        targetRoute: '/exam',
        actionPrompt: 'Take Full N5 Exam →',
      },
    ],
    boss: {
      title: 'Grand Milestone: JLPT N5 Official Benchmark',
      description: 'Score 80/180 or higher on the official JLPT N5 mock exam.',
      minPassScore: 4,
      questions: [
        {
          q: 'How do you say "two people" in Japanese?',
          options: ['ににん', 'ふたり', 'りょうにん'],
          answer: 1,
          explanation: '二人 is irregularly read as ふたり (ひとり, ふたり, さんにん...).',
        },
        {
          q: 'Fill in the blank for "I want to eat ramen": ラーメン が（　）。',
          options: ['食べたい です', '食べます', '食べた です'],
          answer: 0,
          explanation: 'Verb stem + たい marks personal desire: 食べたいです.',
        },
        {
          q: 'What sound does an empty, hungry stomach make?',
          options: ['ゴロゴロ', 'ペコペコ', 'ニコニコ'],
          answer: 1,
          explanation: 'お腹がペコペコ is hungry / starving.',
        },
        {
          q: 'What is the reading for 1st day of the month?',
          options: ['いちにち', 'ついたち', 'はじめのひ'],
          answer: 1,
          explanation: '1日 as calendar date is ついたち.',
        },
      ],
    },
  },
  {
    sagaNumber: 6,
    id: 'saga-6',
    title: 'Saga 6: The N4 Frontier',
    titleJp: '第6章：N4ブリッジ・応用文法',
    theme: 'Step into intermediate Japanese: Transitive/Intransitive pairs, Potential forms, Conditionals, and Keigo.',
    badge: '🚀 Intermediate N4 Ready',
    unlockThresholdScore: 70,
    stages: [
      {
        id: 's6-1',
        stageNumber: 1,
        title: 'Transitive vs. Intransitive Verb Pairs (自動詞・他動詞)',
        titleJp: '自他動詞ペア道場',
        icon: '🔄',
        category: 'Conjugation',
        description: 'Understand the difference between ドアが開く (door opens by itself) and ドアを開ける (someone opens the door).',
        targetRoute: '/conjugate',
        actionPrompt: 'Drill Verb Pairs →',
      },
      {
        id: 's6-2',
        stageNumber: 2,
        title: 'Grammar Lesson 8: Potential Form (〜できる / 〜行ける)',
        titleJp: '可能形・できること',
        icon: '📐',
        category: 'Grammar',
        description: 'Express abilities: 漢字が読める (can read kanji) and 日本語が話せる (can speak Japanese).',
        targetRoute: '/grammar/g8',
        actionPrompt: 'Learn Potential Form →',
      },
      {
        id: 's6-3',
        stageNumber: 3,
        title: 'Grammar Lesson 9: Conditionals (〜たら / 〜ば / 〜なら)',
        titleJp: '条件形（〜たら・〜なら）',
        icon: '📐',
        category: 'Grammar',
        description: 'Learn when to use 〜たら for "if/when" and 〜なら for contextual advice.',
        targetRoute: '/grammar/g9',
        actionPrompt: 'Study Conditionals →',
      },
      {
        id: 's6-4',
        stageNumber: 4,
        title: 'Listening & Tokyo Pitch Accent SVG Contours',
        titleJp: '聴解と東京式高低アクセント',
        icon: '🎧',
        category: 'Immersion',
        description: 'Train your ears on homophones like 箸 (chopsticks, Atamadaka [1]) vs 橋 (bridge, Odaka [2]).',
        targetRoute: '/listening',
        actionPrompt: 'Train Pitch Accent →',
      },
    ],
    boss: {
      title: 'Ultimate Boss Fight: JLPT N4 Readiness Trial',
      description: 'Clear the N4 bridge checkpoint to prove you are ready for intermediate Japanese.',
      minPassScore: 3,
      questions: [
        {
          q: 'Which sentence correctly uses the intransitive verb 開く (あく)?',
          options: ['ドア を 開けます。', 'ドア が 開きます。', 'ドア に 開きます。'],
          answer: 1,
          explanation: '自動詞 (intransitive) takes が: ドアが開きます (The door opens).',
        },
        {
          q: 'What is the potential form of 飲む (のむ / to drink)?',
          options: ['のまれる', 'のめる', 'のませる'],
          answer: 1,
          explanation: 'Godan shifts to E-row + る: 飲める (のめる / can drink).',
        },
        {
          q: 'Fill in the blank for "If it rains, I will not go": 雨が降っ（　）、行きません。',
          options: ['たら', 'から', 'ので'],
          answer: 0,
          explanation: '〜たら is the universal "if/when" conditional: 降ったら (if it rains).',
        },
        {
          q: 'In Keigo, what is the humble form of 行く (to go) and 来る (to come)?',
          options: ['いらっしゃいます', '参ります (まいります)', 'なさいます'],
          answer: 1,
          explanation: '参ります (まいります) is the humble (Kenjougo) form for oneself going or coming.',
        },
      ],
    },
  },
];
