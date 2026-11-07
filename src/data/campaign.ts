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
  targetItems?: string[];
  targetScript?: 'hiragana' | 'katakana' | 'both';
  targetCategory?: string;
  targetTab?: string;
}

export interface BossQuestion {
  q: string;
  options: string[];
  answer: number;
  explanation: string;
}

export interface BossPhase {
  phase: 1 | 2 | 3;
  name: string;
  nameJp: string;
  hpThreshold: number;
  dialogue: string;
  themeColor: string;
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
    questionPool: BossQuestion[];
    phases: BossPhase[];
  };
}

export const DEFAULT_BOSS_PHASES: BossPhase[] = [
  {
    "phase": 1,
    "name": "Opening Stance",
    "nameJp": "第一形態：構え (Calm Stance)",
    "hpThreshold": 100,
    "dialogue": "「さあ、お手並み拝見といこうか。」 (Show me what you have learned!)",
    "themeColor": "#38bdf8"
  },
  {
    "phase": 2,
    "name": "Enraged Awakening",
    "nameJp": "第二形態：激昂 (Enraged Phase)",
    "hpThreshold": 66,
    "dialogue": "「なかなかやるな…だがここからが本気だ！」 (Impressive... but now I get serious!)",
    "themeColor": "#f59e0b"
  },
  {
    "phase": 3,
    "name": "Desperation Climax",
    "nameJp": "最終形態：極限奥義 (Desperation Climax)",
    "hpThreshold": 33,
    "dialogue": "「これで終わりだ！渾身の一撃を受けよ！」 (This is the end! Withstand my ultimate attack!)",
    "themeColor": "#ef4444"
  }
];

export const CAMPAIGN_SAGAS: CampaignSaga[] = [
  {
    "sagaNumber": 1,
    "id": "saga-1",
    "title": "Saga 1: Ground Zero",
    "titleJp": "第1章：ひらがなと基本挨拶",
    "theme": "Master Hiragana, essential pronunciation, numbers, and your first sentences.",
    "badge": "🌱 Tokyo Arrival Pioneer",
    "unlockThresholdScore": 0,
    "stages": [
      {
        "id": "s1-1",
        "stageNumber": 1,
        "title": "Basic Hiragana Vowels (あいうえお)",
        "titleJp": "母音の習得",
        "icon": "✍️",
        "category": "Kana",
        "description": "Learn the foundational 5 vowels of the Japanese sound system.",
        "targetRoute": "/kana",
        "actionPrompt": "Practice in Kana Dojo →",
        "targetItems": [
          "あ",
          "い",
          "う",
          "え",
          "お"
        ],
        "targetScript": "hiragana"
      },
      {
        "id": "s1-2",
        "stageNumber": 2,
        "title": "First Numbers & Counters (一二三四五)",
        "titleJp": "数字と数え方",
        "icon": "🔢",
        "category": "Kanji",
        "description": "Read and write numbers 1 to 5 in Kanji with their Onyomi and Kunyomi readings.",
        "targetRoute": "/kanji-dojo",
        "actionPrompt": "Drill in Kanji Dojo →",
        "targetItems": [
          "一",
          "二",
          "三",
          "四",
          "五"
        ]
      },
      {
        "id": "s1-3",
        "stageNumber": 3,
        "title": "Grammar Lesson 1: Introductions & です/ます",
        "titleJp": "自己紹介・〜は〜です",
        "icon": "📐",
        "category": "Grammar",
        "description": "Form your very first Japanese sentences using the topic marker は and polite copula です.",
        "targetRoute": "/grammar/g1",
        "actionPrompt": "Read Lesson 1 →",
        "targetCategory": "Grammar"
      },
      {
        "id": "s1-4",
        "stageNumber": 4,
        "title": "Story Chapter 1: Arriving in Tokyo",
        "titleJp": "物語第1話：とうきょうへ",
        "icon": "📖",
        "category": "Immersion",
        "description": "Read about Ana stepping off the airplane at Haneda Airport in Tokyo.",
        "targetRoute": "/stories/ch1-arrival",
        "actionPrompt": "Read Story Ch.1 →",
        "targetCategory": "Immersion"
      }
    ],
    "boss": {
      "title": "Gatekeeper Challenge: Haneda Airport Customs (羽田空港)",
      "description": "Answer at least 7 of 10 checkpoint questions to pass airport customs and unlock Saga 2.",
      "minPassScore": 7,
      "questions": [
        {
          "q": "Which character represents the foundational vowel sound \"u\"?",
          "options": [
            "あ",
            "う",
            "お",
            "え"
          ],
          "answer": 1,
          "explanation": "う is the vowel sound \"u\". あ is \"a\", お is \"o\", え is \"e\"."
        },
        {
          "q": "Which character represents the consonant sound \"ka\"?",
          "options": [
            "か",
            "さ",
            "た",
            "な"
          ],
          "answer": 0,
          "explanation": "か is \"ka\". さ is \"sa\", た is \"ta\", な is \"na\"."
        },
        {
          "q": "How do you say \"I am a student\" in polite Japanese?",
          "options": [
            "わたし は がくせい です。",
            "わたし が がくせい だ。",
            "がくせい は わたし です。"
          ],
          "answer": 0,
          "explanation": "わたし (I) + は (topic marker) + がくせい (student) + です (polite copula)."
        },
        {
          "q": "Fill in the blank for origin: アメリカ（　）来ました。 (\"I came from America.\")",
          "options": [
            "に",
            "から",
            "を"
          ],
          "answer": 1,
          "explanation": "〜から marks the starting point or place of origin."
        },
        {
          "q": "What is the reading of the kanji number 八?",
          "options": [
            "ろく",
            "なな",
            "はち"
          ],
          "answer": 2,
          "explanation": "八 is 8, read as はち (hachi). 六 is ろく (6), 七 is なな/しち (7)."
        },
        {
          "q": "What is the reading of 三時?",
          "options": [
            "にじ",
            "さんじ",
            "よじ"
          ],
          "answer": 1,
          "explanation": "三 (さん = 3) + 時 (じ = o’clock) = さんじ (3 o’clock)."
        },
        {
          "q": "Fill in the blank for boarding: 電車（　）乗りました。 (\"I boarded the train.\")",
          "options": [
            "に",
            "を",
            "から"
          ],
          "answer": 0,
          "explanation": "に marks the conveyance/vehicle you board or get onto (電車に乗ります)."
        },
        {
          "q": "Fill in the blank for polite past: 空港は きれい（　）。 (\"The airport was pretty.\")",
          "options": [
            "です",
            "でした",
            "ました"
          ],
          "answer": 1,
          "explanation": "でした is the polite past tense of the copula です."
        },
        {
          "q": "Which greeting is used when meeting someone for the very first time?",
          "options": [
            "はじめまして",
            "こんばんは",
            "さようなら"
          ],
          "answer": 0,
          "explanation": "はじめまして (\"Nice to meet you\") is exclusively used when introducing yourself for the first time."
        },
        {
          "q": "In Story Chapter 1, Ana steps off the airplane at the 空港 (くうこう). What does 空港 mean?",
          "options": [
            "Train station",
            "Airport",
            "Harbor"
          ],
          "answer": 1,
          "explanation": "空港 (くうこう) means airport (literally \"sky harbor\")."
        }
      ],
      "questionPool": [
        {
          "q": "Which character represents the foundational vowel sound \"u\"?",
          "options": [
            "あ",
            "う",
            "お",
            "え"
          ],
          "answer": 1,
          "explanation": "う is the vowel sound \"u\". あ is \"a\", お is \"o\", え is \"e\"."
        },
        {
          "q": "Which character represents the consonant sound \"ka\"?",
          "options": [
            "か",
            "さ",
            "た",
            "な"
          ],
          "answer": 0,
          "explanation": "か is \"ka\". さ is \"sa\", た is \"ta\", な is \"na\"."
        },
        {
          "q": "How do you say \"I am a student\" in polite Japanese?",
          "options": [
            "わたし は がくせい です。",
            "わたし が がくせい だ。",
            "がくせい は わたし です。"
          ],
          "answer": 0,
          "explanation": "わたし (I) + は (topic marker) + がくせい (student) + です (polite copula)."
        },
        {
          "q": "Fill in the blank for origin: アメリカ（　）来ました。 (\"I came from America.\")",
          "options": [
            "に",
            "から",
            "を"
          ],
          "answer": 1,
          "explanation": "〜から marks the starting point or place of origin."
        },
        {
          "q": "What is the reading of the kanji number 八?",
          "options": [
            "ろく",
            "なな",
            "はち"
          ],
          "answer": 2,
          "explanation": "八 is 8, read as はち (hachi). 六 is ろく (6), 七 is なな/しち (7)."
        },
        {
          "q": "What is the reading of 三時?",
          "options": [
            "にじ",
            "さんじ",
            "よじ"
          ],
          "answer": 1,
          "explanation": "三 (さん = 3) + 時 (じ = o’clock) = さんじ (3 o’clock)."
        },
        {
          "q": "Fill in the blank for boarding: 電車（　）乗りました。 (\"I boarded the train.\")",
          "options": [
            "に",
            "を",
            "から"
          ],
          "answer": 0,
          "explanation": "に marks the conveyance/vehicle you board or get onto (電車に乗ります)."
        },
        {
          "q": "Fill in the blank for polite past: 空港は きれい（　）。 (\"The airport was pretty.\")",
          "options": [
            "です",
            "でした",
            "ました"
          ],
          "answer": 1,
          "explanation": "でした is the polite past tense of the copula です."
        },
        {
          "q": "Which greeting is used when meeting someone for the very first time?",
          "options": [
            "はじめまして",
            "こんばんは",
            "さようなら"
          ],
          "answer": 0,
          "explanation": "はじめまして (\"Nice to meet you\") is exclusively used when introducing yourself for the first time."
        },
        {
          "q": "In Story Chapter 1, Ana steps off the airplane at the 空港 (くうこう). What does 空港 mean?",
          "options": [
            "Train station",
            "Airport",
            "Harbor"
          ],
          "answer": 1,
          "explanation": "空港 (くうこう) means airport (literally \"sky harbor\")."
        },
        {
          "q": "Which hiragana character represents the vowel \"u\"?",
          "options": [
            "あ",
            "う",
            "お",
            "え"
          ],
          "answer": 1,
          "explanation": "う is the vowel sound \"u\" (pronounced like \"oo\" in boot, but shorter and unrounded)."
        },
        {
          "q": "Which character has dakuten (tenten) representing \"ga\"?",
          "options": [
            "か",
            "が",
            "さ",
            "ざ"
          ],
          "answer": 1,
          "explanation": "Adding dakuten (゛) to か (ka) voices it into が (ga)."
        },
        {
          "q": "What sound is produced by the combination し (shi) + small ゃ (ya)?",
          "options": [
            "しゃ (sha)",
            "しゅ (shu)",
            "しょ (sho)",
            "しや (shiya)"
          ],
          "answer": 0,
          "explanation": "し + ゃ forms the contracted syllable しゃ (sha)."
        },
        {
          "q": "What is the correct greeting when meeting someone for the very first time?",
          "options": [
            "はじめまして",
            "こんばんは",
            "じゃあまた",
            "いただきます"
          ],
          "answer": 0,
          "explanation": "はじめまして (Nice to meet you) is used strictly when meeting someone for the first time."
        },
        {
          "q": "What does the small っ (sokuon) indicate in words like きって (stamp)?",
          "options": [
            "A double consonant / brief pause",
            "A long vowel",
            "A rising pitch",
            "A whisper"
          ],
          "answer": 0,
          "explanation": "The small っ creates a geminate (doubled) consonant with a sudden glottal pause."
        },
        {
          "q": "How do you say the number 8 in Japanese?",
          "options": [
            "はち (hachi)",
            "なな (nana)",
            "ろく (roku)",
            "きゅう (kyuu)"
          ],
          "answer": 0,
          "explanation": "8 is はち (八 / hachi)."
        },
        {
          "q": "Which hiragana is from the \"ma\"-row: ま、み、む、め、も?",
          "options": [
            "ぬ",
            "め",
            "ね",
            "ほ"
          ],
          "answer": 1,
          "explanation": "め is \"me\", in the \"ma\" column (まみむめも). ぬ is \"nu\", ね is \"ne\"."
        },
        {
          "q": "How do you say \"Thank you very much\" politely?",
          "options": [
            "ありがとうございます",
            "すみません",
            "ごちそうさまでした",
            "おやすみなさい"
          ],
          "answer": 0,
          "explanation": "ありがとうございます is the standard polite expression for \"thank you very much\"."
        },
        {
          "q": "Which particle indicates the topic of a sentence?",
          "options": [
            "は (pronounced \"wa\")",
            "を (pronounced \"o\")",
            "で",
            "に"
          ],
          "answer": 0,
          "explanation": "The topic marker particle は is written with the \"ha\" kana but pronounced \"wa\"."
        },
        {
          "q": "How do you write the number 10 in Kanji?",
          "options": [
            "十",
            "一",
            "五",
            "八"
          ],
          "answer": 0,
          "explanation": "十 is 10 (じゅう / juu)."
        },
        {
          "q": "What is the negative polite copula corresponding to です (is/am/are)?",
          "options": [
            "じゃありません (ではありません)",
            "でした",
            "ます",
            "ません"
          ],
          "answer": 0,
          "explanation": "じゃありません / ではありません is the polite negative \"is not / are not\"."
        },
        {
          "q": "Which pair of kana are often confused due to visual similarity?",
          "options": [
            "あ and お",
            "か and き",
            "さ and た",
            "ま and も"
          ],
          "answer": 0,
          "explanation": "あ and お both share a cross and looped body, but お has a distinct stroke and floating dot."
        },
        {
          "q": "What is the natural response to \"はじめまして、田中です。どうぞよろしく。\"?",
          "options": [
            "はじめまして、スミスです。こちらこそ、よろしくおねがいします。",
            "さようなら、またあした。",
            "いいえ、けっこうです。"
          ],
          "answer": 0,
          "explanation": "Responding with one's name and こちらこそ よろしくおねがいします is the authentic protocol."
        },
        {
          "q": "What does the question marker か at the end of a sentence do?",
          "options": [
            "Turns the statement into a question",
            "Makes it past tense",
            "Indicates an exclamation",
            "Means \"because\""
          ],
          "answer": 0,
          "explanation": "Adding か to a sentence replaces the question mark and forms a polite question."
        },
        {
          "q": "Which character has handakuten (maru) representing \"pa\"?",
          "options": [
            "ば",
            "ぱ",
            "は",
            "だ"
          ],
          "answer": 1,
          "explanation": "Adding handakuten (゜) to は (ha) creates ぱ (pa)."
        }
      ],
      "phases": [
        {
          "phase": 1,
          "name": "Opening Stance",
          "nameJp": "第一形態：構え (Calm Stance)",
          "hpThreshold": 100,
          "dialogue": "「さあ、お手並み拝見といこうか。」 (Show me what you have learned!)",
          "themeColor": "#38bdf8"
        },
        {
          "phase": 2,
          "name": "Enraged Awakening",
          "nameJp": "第二形態：激昂 (Enraged Phase)",
          "hpThreshold": 66,
          "dialogue": "「なかなかやるな…だがここからが本気だ！」 (Impressive... but now I get serious!)",
          "themeColor": "#f59e0b"
        },
        {
          "phase": 3,
          "name": "Desperation Climax",
          "nameJp": "最終形態：極限奥義 (Desperation Climax)",
          "hpThreshold": 33,
          "dialogue": "「これで終わりだ！渾身の一撃を受けよ！」 (This is the end! Withstand my ultimate attack!)",
          "themeColor": "#ef4444"
        }
      ]
    }
  },
  {
    "sagaNumber": 2,
    "id": "saga-2",
    "title": "Saga 2: The Reading Bridge",
    "titleJp": "第2章：カタカナと街頭看板",
    "theme": "Crack Katakana, loanwords, street signs, and order food at a ramen ticket machine.",
    "badge": "🍜 Tokyo Street Navigator",
    "unlockThresholdScore": 70,
    "stages": [
      {
        "id": "s2-1",
        "stageNumber": 1,
        "title": "Katakana Chart & Loanwords (アイウエオ)",
        "titleJp": "カタカナのマスター",
        "icon": "✍️",
        "category": "Kana",
        "description": "Read borrowed foreign words like コーヒー, ラーメン, and ホテル.",
        "targetRoute": "/kana?script=katakana",
        "actionPrompt": "Switch to Katakana in Dojo →",
        "targetItems": [
          "ア",
          "イ",
          "ウ",
          "エ",
          "オ"
        ],
        "targetScript": "katakana"
      },
      {
        "id": "s2-2",
        "stageNumber": 2,
        "title": "Street & Subway Signs (看板デコーダー)",
        "titleJp": "駅と街の看板",
        "icon": "🚇",
        "category": "Immersion",
        "description": "Recognize vital city signs: 入口 (Entrance), 出口 (Exit), 非常口 (Emergency Exit).",
        "targetRoute": "/signs",
        "actionPrompt": "Decode Signs →",
        "targetCategory": "Immersion"
      },
      {
        "id": "s2-3",
        "stageNumber": 3,
        "title": "Grammar Lesson 2: Verbs & Daily Routine",
        "titleJp": "文法第2課：日常の動作と食事",
        "icon": "📐",
        "category": "Grammar",
        "description": "Express daily habits and restaurant ordering: 食べます, 飲みます, and 〜をください.",
        "targetRoute": "/grammar/g2",
        "actionPrompt": "Study Lesson 2 →",
        "targetCategory": "Grammar"
      },
      {
        "id": "s2-4",
        "stageNumber": 4,
        "title": "Story Chapter 2: Ordering at a Café",
        "titleJp": "物語第2話：きっさてんで",
        "icon": "☕",
        "category": "Immersion",
        "description": "Follow Ana as she orders coffee at a Japanese café and practices polite ordering with ください.",
        "targetRoute": "/stories/ch2-cafe",
        "actionPrompt": "Read Story Ch.2 →",
        "targetCategory": "Immersion"
      }
    ],
    "boss": {
      "title": "Gatekeeper Challenge: Shibuya Ramen Shop Order (渋谷)",
      "description": "Prove your ability to decode menu kanji, katakana tickets, and numbers across 10 questions (score at least 7 to pass).",
      "minPassScore": 7,
      "questions": [
        {
          "q": "Which katakana word represents \"coffee\"?",
          "options": [
            "コーラ",
            "コーヒー",
            "ケーキ"
          ],
          "answer": 1,
          "explanation": "コーヒー is coffee. コーラ is cola, ケーキ is cake."
        },
        {
          "q": "What is the reading of the loanword ラーメン?",
          "options": [
            "raamen",
            "ruumen",
            "raameru"
          ],
          "answer": 0,
          "explanation": "ラーメン is read as raamen (with the prolonged vowel bar ー)."
        },
        {
          "q": "What does the button [大盛] mean on a ramen ticket machine?",
          "options": [
            "Regular size",
            "Large portion / upsizing",
            "Take-out box"
          ],
          "answer": 1,
          "explanation": "大盛 (おおもり) means a large portion of noodles/rice."
        },
        {
          "q": "Which kanji combination means \"Ticket Gate\" at a Japanese train station?",
          "options": [
            "改札口 (かいさつぐち)",
            "非常口 (ひじょうぐち)",
            "両替機 (りょうがえき)"
          ],
          "answer": 0,
          "explanation": "改札口 is the train ticket gate. 非常口 is emergency exit, 両替機 is coin changer."
        },
        {
          "q": "What does the green exit sign 非常口 (ひじょうぐち) designate?",
          "options": [
            "Emergency Exit",
            "Restroom",
            "Elevator"
          ],
          "answer": 0,
          "explanation": "非常口 (ひじょうぐち) is the emergency exit sign seen in stations and buildings."
        },
        {
          "q": "If you want to dine inside the restaurant rather than take-out, which ticket button do you press?",
          "options": [
            "持ち帰り (もちかえり)",
            "店内 (お召し上がり)",
            "ねぎ抜き (ねぎぬき)"
          ],
          "answer": 1,
          "explanation": "店内（お召し上がり） means Dine-In / Eat inside the restaurant."
        },
        {
          "q": "What topping or extra does the button 替玉 (かえだま) order?",
          "options": [
            "Soft-boiled seasoned egg",
            "Extra noodle refill",
            "Bamboo shoots"
          ],
          "answer": 1,
          "explanation": "替玉 (かえだま) is an extra serving of ramen noodles added to your leftover broth."
        },
        {
          "q": "How much is 千五百円 (せんごひゃくえん)?",
          "options": [
            "150 yen",
            "1,500 yen",
            "15,000 yen"
          ],
          "answer": 1,
          "explanation": "千 (1,000) + 五百 (500) + 円 (yen) = 1,500 yen."
        },
        {
          "q": "How do you say \"One ramen, please\" when ordering?",
          "options": [
            "ラーメン を 一つ ください。",
            "ラーメン は 一人 ください。",
            "ラーメン が 一本 です。"
          ],
          "answer": 0,
          "explanation": "Object + を + counter (一つ ひとつ) + ください is the standard polite ordering pattern."
        },
        {
          "q": "What rule does the red circle sign 禁煙 (きんえん) state?",
          "options": [
            "No Smoking",
            "Cash Only",
            "Staff Only"
          ],
          "answer": 0,
          "explanation": "禁煙 (きんえん) strictly means No Smoking (禁 = prohibit, 煙 = smoke)."
        }
      ],
      "questionPool": [
        {
          "q": "Which katakana word represents \"coffee\"?",
          "options": [
            "コーラ",
            "コーヒー",
            "ケーキ"
          ],
          "answer": 1,
          "explanation": "コーヒー is coffee. コーラ is cola, ケーキ is cake."
        },
        {
          "q": "What is the reading of the loanword ラーメン?",
          "options": [
            "raamen",
            "ruumen",
            "raameru"
          ],
          "answer": 0,
          "explanation": "ラーメン is read as raamen (with the prolonged vowel bar ー)."
        },
        {
          "q": "What does the button [大盛] mean on a ramen ticket machine?",
          "options": [
            "Regular size",
            "Large portion / upsizing",
            "Take-out box"
          ],
          "answer": 1,
          "explanation": "大盛 (おおもり) means a large portion of noodles/rice."
        },
        {
          "q": "Which kanji combination means \"Ticket Gate\" at a Japanese train station?",
          "options": [
            "改札口 (かいさつぐち)",
            "非常口 (ひじょうぐち)",
            "両替機 (りょうがえき)"
          ],
          "answer": 0,
          "explanation": "改札口 is the train ticket gate. 非常口 is emergency exit, 両替機 is coin changer."
        },
        {
          "q": "What does the green exit sign 非常口 (ひじょうぐち) designate?",
          "options": [
            "Emergency Exit",
            "Restroom",
            "Elevator"
          ],
          "answer": 0,
          "explanation": "非常口 (ひじょうぐち) is the emergency exit sign seen in stations and buildings."
        },
        {
          "q": "If you want to dine inside the restaurant rather than take-out, which ticket button do you press?",
          "options": [
            "持ち帰り (もちかえり)",
            "店内 (お召し上がり)",
            "ねぎ抜き (ねぎぬき)"
          ],
          "answer": 1,
          "explanation": "店内（お召し上がり） means Dine-In / Eat inside the restaurant."
        },
        {
          "q": "What topping or extra does the button 替玉 (かえだま) order?",
          "options": [
            "Soft-boiled seasoned egg",
            "Extra noodle refill",
            "Bamboo shoots"
          ],
          "answer": 1,
          "explanation": "替玉 (かえだま) is an extra serving of ramen noodles added to your leftover broth."
        },
        {
          "q": "How much is 千五百円 (せんごひゃくえん)?",
          "options": [
            "150 yen",
            "1,500 yen",
            "15,000 yen"
          ],
          "answer": 1,
          "explanation": "千 (1,000) + 五百 (500) + 円 (yen) = 1,500 yen."
        },
        {
          "q": "How do you say \"One ramen, please\" when ordering?",
          "options": [
            "ラーメン を 一つ ください。",
            "ラーメン は 一人 ください。",
            "ラーメン が 一本 です。"
          ],
          "answer": 0,
          "explanation": "Object + を + counter (一つ ひとつ) + ください is the standard polite ordering pattern."
        },
        {
          "q": "What rule does the red circle sign 禁煙 (きんえん) state?",
          "options": [
            "No Smoking",
            "Cash Only",
            "Staff Only"
          ],
          "answer": 0,
          "explanation": "禁煙 (きんえん) strictly means No Smoking (禁 = prohibit, 煙 = smoke)."
        },
        {
          "q": "What does the Katakana word コーヒー mean?",
          "options": [
            "Coffee",
            "Cola",
            "Cookie",
            "Cocoa"
          ],
          "answer": 0,
          "explanation": "コーヒー is coffee, featuring the long vowel mark ー."
        },
        {
          "q": "Which demonstrative pronoun refers to something near the listener (not the speaker)?",
          "options": [
            "これ (kore)",
            "それ (sore)",
            "あれ (are)",
            "どれ (dore)"
          ],
          "answer": 1,
          "explanation": "これ = near speaker; それ = near listener; あれ = far from both; どれ = which one."
        },
        {
          "q": "What does the positional Kanji 上 (うえ) mean?",
          "options": [
            "Above / On top",
            "Below / Under",
            "Inside",
            "In front"
          ],
          "answer": 0,
          "explanation": "上 (うえ) means above or on top. 下 (した) means below."
        },
        {
          "q": "How do you ask \"How much is this?\" at a shop register?",
          "options": [
            "これは いくらですか。",
            "これは なんですか。",
            "だれですか。",
            "どこですか。"
          ],
          "answer": 0,
          "explanation": "いくら means \"how much (price)\"."
        },
        {
          "q": "What is the difference between これ and この?",
          "options": [
            "この must be directly followed by a noun (e.g. この本); これ stands alone.",
            "これ is only for food; この is for people.",
            "There is no difference in usage."
          ],
          "answer": 0,
          "explanation": "この (kono), その (sono), あの (ano) are pre-noun determiners that require a noun."
        },
        {
          "q": "What does the Katakana loanword パン mean in Japanese?",
          "options": [
            "Bread",
            "Pan",
            "Pancake",
            "Pen"
          ],
          "answer": 0,
          "explanation": "パン (bread) originates from the Portuguese word \"pão\"."
        },
        {
          "q": "How do you read the Kanji 前 in 前後 (ぜんご / front and back)?",
          "options": [
            "まえ (mae) / ゼン (zen)",
            "あと (ato) / ゴ (go)",
            "うえ (ue)",
            "なか (naka)"
          ],
          "answer": 0,
          "explanation": "前 has kunyomi まえ and onyomi ゼン (meaning front / before)."
        },
        {
          "q": "Which Katakana characters are notorious confusers due to their stroke angles?",
          "options": [
            "シ (shi) and ツ (tsu)",
            "ア and イ",
            "マ and ム",
            "カ and 力"
          ],
          "answer": 0,
          "explanation": "シ (shi) strokes move upward horizontally; ツ (tsu) strokes drop downward from the top."
        },
        {
          "q": "When pointing to a building far away from both you and your friend, which word do you use?",
          "options": [
            "あのビル",
            "そのビル",
            "このビル",
            "どのビル"
          ],
          "answer": 0,
          "explanation": "あの (ano) is used for objects or locations distant from both speakers."
        },
        {
          "q": "What does \"トイレは どこですか\" mean?",
          "options": [
            "Where is the restroom?",
            "Is the restroom clean?",
            "Who is in the restroom?",
            "When does the restroom close?"
          ],
          "answer": 0,
          "explanation": "どこ (doko) is the question word for \"where\"."
        },
        {
          "q": "What does the Katakana sign レジ indicate at a convenience store?",
          "options": [
            "Cash register / Checkout counter",
            "Restroom",
            "ATM",
            "Trash can"
          ],
          "answer": 0,
          "explanation": "レジ is short for register (cash register checkout)."
        },
        {
          "q": "How do you ask for a receipt politely at a store?",
          "options": [
            "レシートを ください。",
            "お金を ください。",
            "さようなら。",
            "いらっしゃいませ。"
          ],
          "answer": 0,
          "explanation": "〜を ください means \"please give me ~\"."
        },
        {
          "q": "What does the kanji 中 mean in 箱の中 (はこのなか)?",
          "options": [
            "Inside",
            "Behind",
            "Next to",
            "Under"
          ],
          "answer": 0,
          "explanation": "中 (なか) means inside or middle."
        },
        {
          "q": "Which Katakana character is \"so\" (ソ), distinguished from \"n\" (ン)?",
          "options": [
            "ソ (downward vertical stroke)",
            "ン (horizontal rising stroke)",
            "ノ",
            "レ"
          ],
          "answer": 0,
          "explanation": "ソ has a steep top-to-bottom stroke; ン sweeps upward from bottom-left to top-right."
        },
        {
          "q": "Fill in the blank: すみません、水（　）ください。 (\"Excuse me, water please.\")",
          "options": [
            "を",
            "に",
            "で",
            "へ"
          ],
          "answer": 0,
          "explanation": "The direct object particle を marks what you are requesting."
        }
      ],
      "phases": [
        {
          "phase": 1,
          "name": "Opening Stance",
          "nameJp": "第一形態：構え (Calm Stance)",
          "hpThreshold": 100,
          "dialogue": "「さあ、お手並み拝見といこうか。」 (Show me what you have learned!)",
          "themeColor": "#38bdf8"
        },
        {
          "phase": 2,
          "name": "Enraged Awakening",
          "nameJp": "第二形態：激昂 (Enraged Phase)",
          "hpThreshold": 66,
          "dialogue": "「なかなかやるな…だがここからが本気だ！」 (Impressive... but now I get serious!)",
          "themeColor": "#f59e0b"
        },
        {
          "phase": 3,
          "name": "Desperation Climax",
          "nameJp": "最終形態：極限奥義 (Desperation Climax)",
          "hpThreshold": 33,
          "dialogue": "「これで終わりだ！渾身の一撃を受けよ！」 (This is the end! Withstand my ultimate attack!)",
          "themeColor": "#ef4444"
        }
      ]
    }
  },
  {
    "sagaNumber": 3,
    "id": "saga-3",
    "title": "Saga 3: The Sentence Engine",
    "titleJp": "第3章：助詞と基本日常動詞",
    "theme": "Master essential particles (は, を, に, で) and daily routine verbs.",
    "badge": "🍱 Daily Habit Architect",
    "unlockThresholdScore": 70,
    "stages": [
      {
        "id": "s3-1",
        "stageNumber": 1,
        "title": "Core Particle Dojo (は, を, に, で)",
        "titleJp": "助詞道場・基本4助詞",
        "icon": "🎯",
        "category": "Grammar",
        "description": "Never confuse location of action (で) with destination/target of movement (に).",
        "targetRoute": "/particles",
        "actionPrompt": "Train Particles →",
        "targetItems": [
          "は",
          "を",
          "に",
          "で"
        ],
        "targetCategory": "ni-de-e"
      },
      {
        "id": "s3-2",
        "stageNumber": 2,
        "title": "Kanji Dojo: Nature & Calendar Elements",
        "titleJp": "漢字道場：自然と暦",
        "icon": "🀄",
        "category": "Kanji",
        "description": "Type meanings and readings for 日, 月, 火, 水, 木, 金, 土, 年, 時, 分.",
        "targetRoute": "/kanji-dojo",
        "actionPrompt": "Start Kanji Dojo →",
        "targetItems": [
          "日",
          "月",
          "火",
          "水",
          "木",
          "金",
          "土",
          "年",
          "時",
          "分"
        ]
      },
      {
        "id": "s3-3",
        "stageNumber": 3,
        "title": "Ramen Ticket Machine (食券機) Simulator",
        "titleJp": "ラーメン食券機シミュレーター",
        "icon": "🎫",
        "category": "Immersion",
        "description": "Practice purchasing ramen, egg toppings (味玉), and noodle refills (替玉) on real vending buttons.",
        "targetRoute": "/signs?tab=shokkenki",
        "actionPrompt": "Launch Shokkenki Simulator →",
        "targetCategory": "Immersion",
        "targetTab": "shokkenki"
      },
      {
        "id": "s3-4",
        "stageNumber": 4,
        "title": "Daily 5-Minute Bento Routine",
        "titleJp": "毎日の5分弁当ルーティン",
        "icon": "🍱",
        "category": "Immersion",
        "description": "Complete a full 4-course Bento workout: Kana warm-up, SRS review, Kanji trace, and sign test.",
        "targetRoute": "/bento",
        "actionPrompt": "Open Daily Bento →",
        "targetCategory": "Immersion"
      }
    ],
    "boss": {
      "title": "Gatekeeper Challenge: Asakusa Sensoji Temple Tour (浅草)",
      "description": "Demonstrate flawless particle usage, daily verbs, and calendar kanji across 10 questions (score at least 7 to pass).",
      "minPassScore": 7,
      "questions": [
        {
          "q": "Fill in the blank: レストラン（　）ラーメン を 食べます。",
          "options": [
            "に",
            "で",
            "を"
          ],
          "answer": 1,
          "explanation": "で marks the location where an active event or action takes place (eating at a restaurant)."
        },
        {
          "q": "Fill in the blank: 8時（　）学校 へ 行きます。",
          "options": [
            "に",
            "で",
            "は"
          ],
          "answer": 0,
          "explanation": "に marks a specific point in clock time (at 8 o’clock)."
        },
        {
          "q": "Fill in the blank: 毎朝 水（　）飲みます。",
          "options": [
            "を",
            "に",
            "で"
          ],
          "answer": 0,
          "explanation": "を marks the direct object of the verb (drinking water)."
        },
        {
          "q": "What is the reading of 水曜日?",
          "options": [
            "かようび",
            "すいようび",
            "もくようび"
          ],
          "answer": 1,
          "explanation": "水曜日 (すいようび) is Wednesday (水 = water)."
        },
        {
          "q": "Which day of the week is 金曜日?",
          "options": [
            "Wednesday",
            "Thursday",
            "Friday"
          ],
          "answer": 2,
          "explanation": "金曜日 (きんようび) is Friday (金 = gold/metal)."
        },
        {
          "q": "What time duration does 30分 (さんじゅっぷん / さんぷん) mean?",
          "options": [
            "30 seconds",
            "30 minutes",
            "30 hours"
          ],
          "answer": 1,
          "explanation": "分 (ふん/ぷん) counts minutes: 30分 = 30 minutes (半 はん = half hour)."
        },
        {
          "q": "What does 毎朝 (まいあさ) mean?",
          "options": [
            "Every evening",
            "Every morning",
            "Every week"
          ],
          "answer": 1,
          "explanation": "毎朝 (まいあさ) means every morning. 毎日 is every day, 毎晩 is every night."
        },
        {
          "q": "Fill in the blank: 駅の 前に 赤い 門が（　）。 (\"There is a red gate in front of the station.\")",
          "options": [
            "あります",
            "います",
            "します"
          ],
          "answer": 0,
          "explanation": "あります is used for the existence of inanimate objects (gates, buildings, items)."
        },
        {
          "q": "Fill in the blank: あそこに 猫が（　）。 (\"There is a cat over there.\")",
          "options": [
            "あります",
            "います",
            "きます"
          ],
          "answer": 1,
          "explanation": "います is used for the existence of living beings (people and animals)."
        },
        {
          "q": "Fill in the blank: 友だち（　）浅草へ 行きました。 (\"I went to Asakusa with my friend.\")",
          "options": [
            "と",
            "で",
            "を"
          ],
          "answer": 0,
          "explanation": "と functions as \"with\" when accompanied by a person or companion."
        }
      ],
      "questionPool": [
        {
          "q": "Fill in the blank: レストラン（　）ラーメン を 食べます。",
          "options": [
            "に",
            "で",
            "を"
          ],
          "answer": 1,
          "explanation": "で marks the location where an active event or action takes place (eating at a restaurant)."
        },
        {
          "q": "Fill in the blank: 8時（　）学校 へ 行きます。",
          "options": [
            "に",
            "で",
            "は"
          ],
          "answer": 0,
          "explanation": "に marks a specific point in clock time (at 8 o’clock)."
        },
        {
          "q": "Fill in the blank: 毎朝 水（　）飲みます。",
          "options": [
            "を",
            "に",
            "で"
          ],
          "answer": 0,
          "explanation": "を marks the direct object of the verb (drinking water)."
        },
        {
          "q": "What is the reading of 水曜日?",
          "options": [
            "かようび",
            "すいようび",
            "もくようび"
          ],
          "answer": 1,
          "explanation": "水曜日 (すいようび) is Wednesday (水 = water)."
        },
        {
          "q": "Which day of the week is 金曜日?",
          "options": [
            "Wednesday",
            "Thursday",
            "Friday"
          ],
          "answer": 2,
          "explanation": "金曜日 (きんようび) is Friday (金 = gold/metal)."
        },
        {
          "q": "What time duration does 30分 (さんじゅっぷん / さんぷん) mean?",
          "options": [
            "30 seconds",
            "30 minutes",
            "30 hours"
          ],
          "answer": 1,
          "explanation": "分 (ふん/ぷん) counts minutes: 30分 = 30 minutes (半 はん = half hour)."
        },
        {
          "q": "What does 毎朝 (まいあさ) mean?",
          "options": [
            "Every evening",
            "Every morning",
            "Every week"
          ],
          "answer": 1,
          "explanation": "毎朝 (まいあさ) means every morning. 毎日 is every day, 毎晩 is every night."
        },
        {
          "q": "Fill in the blank: 駅の 前に 赤い 門が（　）。 (\"There is a red gate in front of the station.\")",
          "options": [
            "あります",
            "います",
            "します"
          ],
          "answer": 0,
          "explanation": "あります is used for the existence of inanimate objects (gates, buildings, items)."
        },
        {
          "q": "Fill in the blank: あそこに 猫が（　）。 (\"There is a cat over there.\")",
          "options": [
            "あります",
            "います",
            "きます"
          ],
          "answer": 1,
          "explanation": "います is used for the existence of living beings (people and animals)."
        },
        {
          "q": "Fill in the blank: 友だち（　）浅草へ 行きました。 (\"I went to Asakusa with my friend.\")",
          "options": [
            "と",
            "で",
            "を"
          ],
          "answer": 0,
          "explanation": "と functions as \"with\" when accompanied by a person or companion."
        },
        {
          "q": "Which particle marks the destination of movement verbs like 行く, 来る, and 帰る?",
          "options": [
            "へ (pronounced \"e\") or に",
            "を",
            "で",
            "から"
          ],
          "answer": 0,
          "explanation": "へ and に indicate the direction and destination of motion."
        },
        {
          "q": "What is the past polite form of the verb 食べます (tabemasu / to eat)?",
          "options": [
            "食べました (tabemashita)",
            "食べません (tabemasen)",
            "食べた (tabeta)",
            "食べませんでした"
          ],
          "answer": 0,
          "explanation": "〜ました is the polite affirmative past inflection."
        },
        {
          "q": "What does the Kanji 月 represent in days of the week and dates?",
          "options": [
            "Moon / Monday / Month (がつ / げつ)",
            "Fire / Tuesday",
            "Water / Wednesday",
            "Sun / Sunday"
          ],
          "answer": 0,
          "explanation": "月 is moon/month (月曜日 = Monday)."
        },
        {
          "q": "Which particle indicates the means of transportation (e.g., going by train)?",
          "options": [
            "で (de)",
            "に (ni)",
            "へ (e)",
            "を (o)"
          ],
          "answer": 0,
          "explanation": "The instrumental particle で indicates means or method (電車で行く = go by train)."
        },
        {
          "q": "How do you say \"half past seven\" (7:30) in Japanese?",
          "options": [
            "七時半 (しちじはん)",
            "七時十五分",
            "八時半",
            "六時半"
          ],
          "answer": 0,
          "explanation": "半 (はん) means half: 7時半 is 7:30."
        },
        {
          "q": "What does 何時に 起きますか (なんじに おきますか) mean?",
          "options": [
            "What time do you wake up?",
            "What time do you sleep?",
            "Where are you going?",
            "What time is dinner?"
          ],
          "answer": 0,
          "explanation": "起きる (おきる) means to wake up."
        },
        {
          "q": "Which day of the week is 金曜日 (きんようび)?",
          "options": [
            "Friday",
            "Thursday",
            "Saturday",
            "Sunday"
          ],
          "answer": 0,
          "explanation": "金 (gold/metal) corresponds to Friday."
        },
        {
          "q": "Fill in the blank: 図書館（　）本を 読みます。 (\"I read books at the library.\")",
          "options": [
            "で",
            "に",
            "へ",
            "を"
          ],
          "answer": 0,
          "explanation": "で marks the location where an active action occurs."
        },
        {
          "q": "What is the negative past polite form of 行きます (goes)?",
          "options": [
            "行きませんでした",
            "行きました",
            "行きません",
            "行かない"
          ],
          "answer": 0,
          "explanation": "〜ませんでした is the polite negative past inflection."
        },
        {
          "q": "How do you say \"together with a friend\" using a particle?",
          "options": [
            "友達と (ともだちと)",
            "友達に",
            "友達で",
            "友達を"
          ],
          "answer": 0,
          "explanation": "Particle と means \"with / and (a companion)\"."
        },
        {
          "q": "What does \"昨日 (きのう)\" mean in Japanese?",
          "options": [
            "Yesterday",
            "Today",
            "Tomorrow",
            "Next week"
          ],
          "answer": 0,
          "explanation": "昨日 = yesterday; 今日 = today; 明日 = tomorrow."
        },
        {
          "q": "How is the particle に used with specific clock times?",
          "options": [
            "Specific times take に (e.g., 7時に), while relative times like 今日 do not.",
            "All time words must always take に.",
            "に is never used with time."
          ],
          "answer": 0,
          "explanation": "Specific clock times and calendar dates take に; relative words (今日, 明日, 毎日) do not."
        },
        {
          "q": "Which kanji means \"to return home\" in 帰ります (かえります)?",
          "options": [
            "帰",
            "行",
            "来",
            "見"
          ],
          "answer": 0,
          "explanation": "帰 (かえる) is to return home or back to one's base."
        },
        {
          "q": "What does \"毎朝 (まいあさ)\" mean?",
          "options": [
            "Every morning",
            "Every evening",
            "Every night",
            "Every month"
          ],
          "answer": 0,
          "explanation": "毎 (every) + 朝 (morning) = every morning."
        },
        {
          "q": "How do you say \"I went to Tokyo by Shinkansen\" correctly?",
          "options": [
            "新幹線で 東京へ 行きました。",
            "新幹線を 東京で 行きました。",
            "新幹線に 東京を 行きました。"
          ],
          "answer": 0,
          "explanation": "新幹線で (by Shinkansen) + 東京へ (to Tokyo) + 行きました (went)."
        }
      ],
      "phases": [
        {
          "phase": 1,
          "name": "Opening Stance",
          "nameJp": "第一形態：構え (Calm Stance)",
          "hpThreshold": 100,
          "dialogue": "「さあ、お手並み拝見といこうか。」 (Show me what you have learned!)",
          "themeColor": "#38bdf8"
        },
        {
          "phase": 2,
          "name": "Enraged Awakening",
          "nameJp": "第二形態：激昂 (Enraged Phase)",
          "hpThreshold": 66,
          "dialogue": "「なかなかやるな…だがここからが本気だ！」 (Impressive... but now I get serious!)",
          "themeColor": "#f59e0b"
        },
        {
          "phase": 3,
          "name": "Desperation Climax",
          "nameJp": "最終形態：極限奥義 (Desperation Climax)",
          "hpThreshold": 33,
          "dialogue": "「これで終わりだ！渾身の一撃を受けよ！」 (This is the end! Withstand my ultimate attack!)",
          "themeColor": "#ef4444"
        }
      ]
    }
  },
  {
    "sagaNumber": 4,
    "id": "saga-4",
    "title": "Saga 4: Action & Inflections",
    "titleJp": "第4章：動詞グループとて形・形容詞",
    "theme": "Unlock the mental models for 3 Verb Groups, the Te-Form rhyme, and the Two Adjective Tribes.",
    "badge": "⚡ Inflection Sorcerer",
    "unlockThresholdScore": 70,
    "stages": [
      {
        "id": "s4-1",
        "stageNumber": 1,
        "title": "Conjugation Lesson 1: The 3 Verb Groups",
        "titleJp": "動詞の3グループ分類",
        "icon": "📖",
        "category": "Conjugation",
        "description": "Identify Ichidan, Godan, and Irregular verbs using the interactive morph slider.",
        "targetRoute": "/conjugate?tab=lessons&lesson=lesson-1",
        "actionPrompt": "Study Lesson 1 →",
        "targetTab": "lessons"
      },
      {
        "id": "s4-2",
        "stageNumber": 2,
        "title": "Conjugation Lesson 3: The Te-Form Rhyme (て形)",
        "titleJp": "て形の歌と音便ルール",
        "icon": "🔗",
        "category": "Conjugation",
        "description": "Master connecting verbs and making polite requests with 〜てください.",
        "targetRoute": "/conjugate?tab=lessons&lesson=lesson-3",
        "actionPrompt": "Learn Te-Form →",
        "targetTab": "lessons"
      },
      {
        "id": "s4-3",
        "stageNumber": 3,
        "title": "Conjugation Lesson 4: The Two Adjective Tribes (い vs な)",
        "titleJp": "い形容詞とな形容詞",
        "icon": "🟡",
        "category": "Conjugation",
        "description": "Conjugate present, negative, past, and past-negative for both adjective families.",
        "targetRoute": "/conjugate?tab=lessons&lesson=lesson-4",
        "actionPrompt": "Master Adjectives →",
        "targetTab": "lessons"
      },
      {
        "id": "s4-4",
        "stageNumber": 4,
        "title": "Story Chapter 4: Weekend Plans",
        "titleJp": "物語第4話：しゅうまつの よてい",
        "icon": "📖",
        "category": "Immersion",
        "description": "Read about Ana making weekend plans to visit Kyoto, using 〜たい and listing activities with 〜たり.",
        "targetRoute": "/stories/ch4-weekend",
        "actionPrompt": "Read Story Ch.4 →",
        "targetCategory": "Immersion"
      }
    ],
    "boss": {
      "title": "Gatekeeper Challenge: Akihabara Electronics Negotiation (秋葉原)",
      "description": "Pass the inflection boss fight by proving you can conjugate verbs and adjectives across 10 questions (score at least 7 to pass).",
      "minPassScore": 7,
      "questions": [
        {
          "q": "What is the te-form of 書く (かく / to write)?",
          "options": [
            "かいて",
            "かきて",
            "かって"
          ],
          "answer": 0,
          "explanation": "く shifts to いて: 書いて (かいて)."
        },
        {
          "q": "What is the te-form of 飲む (のむ / to drink)?",
          "options": [
            "のんで",
            "のみて",
            "のって"
          ],
          "answer": 0,
          "explanation": "む, ぶ, and ぬ shift to んで: 飲んで (のんで)."
        },
        {
          "q": "What is the te-form of the irregular exception verb 行く (いく / to go)?",
          "options": [
            "いいて",
            "いって (行って)",
            "いぎて"
          ],
          "answer": 1,
          "explanation": "行く is the famous exception: instead of \"iite\", it becomes 行って (いって)."
        },
        {
          "q": "What is the polite request form of 待つ (まつ / to wait)?",
          "options": [
            "待ってください (まってください)",
            "まちてください",
            "またないで"
          ],
          "answer": 0,
          "explanation": "つ shifts to って + ください: 待ってください (please wait)."
        },
        {
          "q": "Which pair represents the ONLY two irregular verbs in standard Japanese?",
          "options": [
            "食べる and 飲む",
            "する and 来る (くる)",
            "行く and 帰る"
          ],
          "answer": 1,
          "explanation": "する (to do) and 来る / くる (to come) are the only two irregular verbs in Japanese."
        },
        {
          "q": "Which verb is a notorious Group 1 Godan \"trap\" that ends in -eru but conjugates like a Godan verb?",
          "options": [
            "食べる (たべる)",
            "帰る (かえる)",
            "教える (おしえる)"
          ],
          "answer": 1,
          "explanation": "帰る (かえる - to return home) ends in -eru but conjugates as Godan: 帰ります and 帰って."
        },
        {
          "q": "What is the plain negative form of 買う (かう / to buy)?",
          "options": [
            "かあない",
            "かわない",
            "かいません"
          ],
          "answer": 1,
          "explanation": "Verbs ending in pure う shift to わ in the A-row: 買わない (かわない)."
        },
        {
          "q": "What is the negative past form of the い-adjective 高い (たかい / expensive)?",
          "options": [
            "高くないでした",
            "高くなかった",
            "高かったじゃない"
          ],
          "answer": 1,
          "explanation": "Drop final い + くなかった: 高くなかった (was not expensive)."
        },
        {
          "q": "What is the past tense form of いい (good)?",
          "options": [
            "いかった",
            "よかった",
            "いいでした"
          ],
          "answer": 1,
          "explanation": "いい shifts to its original stem よ- for all conjugations: よかった (was good)."
        },
        {
          "q": "Which of the following is actually a な-adjective despite ending in an \"i\" sound?",
          "options": [
            "おいしい",
            "きれい",
            "あつい"
          ],
          "answer": 1,
          "explanation": "きれい (綺麗) is a な-adjective! You say きれいな部屋 (clean room), not きれいくない."
        }
      ],
      "questionPool": [
        {
          "q": "What is the te-form of 書く (かく / to write)?",
          "options": [
            "かいて",
            "かきて",
            "かって"
          ],
          "answer": 0,
          "explanation": "く shifts to いて: 書いて (かいて)."
        },
        {
          "q": "What is the te-form of 飲む (のむ / to drink)?",
          "options": [
            "のんで",
            "のみて",
            "のって"
          ],
          "answer": 0,
          "explanation": "む, ぶ, and ぬ shift to んで: 飲んで (のんで)."
        },
        {
          "q": "What is the te-form of the irregular exception verb 行く (いく / to go)?",
          "options": [
            "いいて",
            "いって (行って)",
            "いぎて"
          ],
          "answer": 1,
          "explanation": "行く is the famous exception: instead of \"iite\", it becomes 行って (いって)."
        },
        {
          "q": "What is the polite request form of 待つ (まつ / to wait)?",
          "options": [
            "待ってください (まってください)",
            "まちてください",
            "またないで"
          ],
          "answer": 0,
          "explanation": "つ shifts to って + ください: 待ってください (please wait)."
        },
        {
          "q": "Which pair represents the ONLY two irregular verbs in standard Japanese?",
          "options": [
            "食べる and 飲む",
            "する and 来る (くる)",
            "行く and 帰る"
          ],
          "answer": 1,
          "explanation": "する (to do) and 来る / くる (to come) are the only two irregular verbs in Japanese."
        },
        {
          "q": "Which verb is a notorious Group 1 Godan \"trap\" that ends in -eru but conjugates like a Godan verb?",
          "options": [
            "食べる (たべる)",
            "帰る (かえる)",
            "教える (おしえる)"
          ],
          "answer": 1,
          "explanation": "帰る (かえる - to return home) ends in -eru but conjugates as Godan: 帰ります and 帰って."
        },
        {
          "q": "What is the plain negative form of 買う (かう / to buy)?",
          "options": [
            "かあない",
            "かわない",
            "かいません"
          ],
          "answer": 1,
          "explanation": "Verbs ending in pure う shift to わ in the A-row: 買わない (かわない)."
        },
        {
          "q": "What is the negative past form of the い-adjective 高い (たかい / expensive)?",
          "options": [
            "高くないでした",
            "高くなかった",
            "高かったじゃない"
          ],
          "answer": 1,
          "explanation": "Drop final い + くなかった: 高くなかった (was not expensive)."
        },
        {
          "q": "What is the past tense form of いい (good)?",
          "options": [
            "いかった",
            "よかった",
            "いいでした"
          ],
          "answer": 1,
          "explanation": "いい shifts to its original stem よ- for all conjugations: よかった (was good)."
        },
        {
          "q": "Which of the following is actually a な-adjective despite ending in an \"i\" sound?",
          "options": [
            "おいしい",
            "きれい",
            "あつい"
          ],
          "answer": 1,
          "explanation": "きれい (綺麗) is a な-adjective! You say きれいな部屋 (clean room), not きれいくない."
        },
        {
          "q": "What is the te-form of the Ichidan verb 食べる (to eat)?",
          "options": [
            "食べて (tabete)",
            "食べって",
            "食べいで",
            "食べた"
          ],
          "answer": 0,
          "explanation": "Ichidan verbs replace る with て: 食べる → 食べて."
        },
        {
          "q": "What is the te-form of the Godan verb 書く (かく / to write)?",
          "options": [
            "書いて (kaite)",
            "書って",
            "書いで",
            "書きて"
          ],
          "answer": 0,
          "explanation": "Verbs ending in -ku drop ku and add -ite (書く → 書いて). Exception: 行く → 行って."
        },
        {
          "q": "What is the irregular te-form of the movement verb 行く (いく / to go)?",
          "options": [
            "行って (itte)",
            "行いて",
            "行んで",
            "行して"
          ],
          "answer": 0,
          "explanation": "行く is a famous irregular exception to the -ku rule: it conjugates to 行って (itte)."
        },
        {
          "q": "What does the construction 〜てください express?",
          "options": [
            "A polite request (\"please do ...\")",
            "A strong prohibition",
            "Past experience",
            "Future obligation"
          ],
          "answer": 0,
          "explanation": "て-form + ください is the foundational polite request formula."
        },
        {
          "q": "What is the te-form of the verb 飲む (のむ / to drink)?",
          "options": [
            "飲んで (nonde)",
            "飲みて",
            "飲って",
            "飲いで"
          ],
          "answer": 0,
          "explanation": "Verbs ending in -mu, -bu, -nu change to -nde (飲む → 飲んで)."
        },
        {
          "q": "How do you ask for permission politely (\"May I take a photo?\")?",
          "options": [
            "写真を 撮っても いいですか。",
            "写真を 撮ってはいけません。",
            "写真を 撮ってください。"
          ],
          "answer": 0,
          "explanation": "〜てもいいですか asks for permission (\"is it okay if I ...?\")."
        },
        {
          "q": "What does 〜てはいけません express?",
          "options": [
            "Strict prohibition (\"you must not ...\")",
            "A polite suggestion",
            "An invitation to do something",
            "Desire"
          ],
          "answer": 0,
          "explanation": "〜てはいけません means \"you must not / you are not allowed to\"."
        },
        {
          "q": "How do you connect two i-adjectives, such as 安い (cheap) and 美味しい (delicious)?",
          "options": [
            "安くて、美味しい",
            "安いで、美味しい",
            "安くては、美味しい",
            "安いと、美味しい"
          ],
          "answer": 0,
          "explanation": "Drop the final い and add くて to connect i-adjectives: 安くて 美味しい."
        },
        {
          "q": "What does the continuous state 〜ています describe in 今、日本語を 勉強しています?",
          "options": [
            "An ongoing action right now (\"I am studying Japanese now\")",
            "A finished past action",
            "A hypothetical wish"
          ],
          "answer": 0,
          "explanation": "〜ている / 〜ています describes present continuous actions."
        },
        {
          "q": "What is the te-form of the verb 話す (はなす / to speak)?",
          "options": [
            "話して (hanashite)",
            "話って",
            "話しで",
            "話いて"
          ],
          "answer": 0,
          "explanation": "Verbs ending in -su conjugate to -shite (話す → 話して)."
        },
        {
          "q": "What is the te-form of the irregular verb する (to do)?",
          "options": [
            "して (shite)",
            "すて",
            "しって",
            "すんで"
          ],
          "answer": 0,
          "explanation": "する is irregular and becomes して."
        },
        {
          "q": "What is the te-form of the irregular verb 来る (くる / to come)?",
          "options": [
            "来て (きて / kite)",
            "くって",
            "こて",
            "きいで"
          ],
          "answer": 0,
          "explanation": "来る changes vowel sound and becomes 来て (きて / kite)."
        },
        {
          "q": "What does 結婚しています (けっこん しています) mean?",
          "options": [
            "Is married (state resulting from a past event)",
            "Is getting married right this second only",
            "Wants to marry"
          ],
          "answer": 0,
          "explanation": "Certain verbs with 〜ています describe an ongoing state resulting from a past change (married, living, knowing)."
        },
        {
          "q": "How do you connect the na-adjective 静か (quiet) with 綺麗 (pretty)?",
          "options": [
            "静かで、綺麗です",
            "静かくて、綺麗です",
            "静かと、綺麗です",
            "静かて、綺麗です"
          ],
          "answer": 0,
          "explanation": "Na-adjectives connect using で (静かで、綺麗)."
        },
        {
          "q": "Fill in the blank: ここに 座っ（　）いいですか。 (\"May I sit here?\")",
          "options": [
            "ても",
            "たは",
            "たら",
            "ては"
          ],
          "answer": 0,
          "explanation": "〜ても いいですか expresses asking for permission."
        }
      ],
      "phases": [
        {
          "phase": 1,
          "name": "Opening Stance",
          "nameJp": "第一形態：構え (Calm Stance)",
          "hpThreshold": 100,
          "dialogue": "「さあ、お手並み拝見といこうか。」 (Show me what you have learned!)",
          "themeColor": "#38bdf8"
        },
        {
          "phase": 2,
          "name": "Enraged Awakening",
          "nameJp": "第二形態：激昂 (Enraged Phase)",
          "hpThreshold": 66,
          "dialogue": "「なかなかやるな…だがここからが本気だ！」 (Impressive... but now I get serious!)",
          "themeColor": "#f59e0b"
        },
        {
          "phase": 3,
          "name": "Desperation Climax",
          "nameJp": "最終形態：極限奥義 (Desperation Climax)",
          "hpThreshold": 33,
          "dialogue": "「これで終わりだ！渾身の一撃を受けよ！」 (This is the end! Withstand my ultimate attack!)",
          "themeColor": "#ef4444"
        }
      ]
    }
  },
  {
    "sagaNumber": 5,
    "id": "saga-5",
    "title": "Saga 5: Full N5 Mastery",
    "titleJp": "第5章：N5総まとめと模擬試験",
    "theme": "Counters, past tense, desires (〜たい), sound-symbolic onomatopoeia, and the official mock exam.",
    "badge": "🎓 Official JLPT N5 Certified",
    "unlockThresholdScore": 70,
    "stages": [
      {
        "id": "s5-1",
        "stageNumber": 1,
        "title": "Counter & Date Dojo (助数詞・日付)",
        "titleJp": "助数詞とカレンダーの日付",
        "icon": "🔢",
        "category": "Grammar",
        "description": "Master irregular calendar days (ついたち, ふつか, みっか) and people counters (ひとり, ふたり).",
        "targetRoute": "/counters",
        "actionPrompt": "Drill Counters →",
        "targetCategory": "day",
        "targetItems": [
          "day",
          "nin"
        ]
      },
      {
        "id": "s5-2",
        "stageNumber": 2,
        "title": "Particle Nuances (は vs が & 擬音語)",
        "titleJp": "は vs が とオノマトペ",
        "icon": "✨",
        "category": "Grammar",
        "description": "Understand topic contrast vs subject focus, plus iconic sound words like ペコペコ and ドキドキ.",
        "targetRoute": "/particles",
        "actionPrompt": "Explore Nuances →",
        "targetCategory": "wa-ga"
      },
      {
        "id": "s5-3",
        "stageNumber": 3,
        "title": "Speaking Role-Play Scenario 3: Asking Directions",
        "titleJp": "会話シナリオ：道を聞く",
        "icon": "🎤",
        "category": "Immersion",
        "description": "Speak real Japanese aloud and test your pronunciation with speech recognition.",
        "targetRoute": "/speaking/s3",
        "actionPrompt": "Practice Speaking →",
        "targetCategory": "Immersion"
      },
      {
        "id": "s5-4",
        "stageNumber": 4,
        "title": "Official JLPT N5 Full Simulation (67 Qs)",
        "titleJp": "日本語能力試験 N5 フル模試",
        "icon": "🎓",
        "category": "Boss",
        "description": "Complete the full 67-question N5 exam with all 3 timed sections: Vocab, Grammar/Reading, and Listening.",
        "targetRoute": "/exam",
        "actionPrompt": "Take Full N5 Exam →",
        "targetCategory": "Boss"
      }
    ],
    "boss": {
      "title": "Grand Milestone: JLPT N5 Official Benchmark",
      "description": "Demonstrate comprehensive JLPT N5 mastery across counters, particles, desires, and onomatopoeia across 10 questions (score at least 7 to pass).",
      "minPassScore": 7,
      "questions": [
        {
          "q": "How do you say \"two people\" in Japanese?",
          "options": [
            "ににん",
            "ふたり",
            "りょうにん"
          ],
          "answer": 1,
          "explanation": "二人 is irregularly read with native Japanese Wago as ふたり."
        },
        {
          "q": "How is \"4 people\" pronounced correctly in Japanese?",
          "options": [
            "よにん",
            "よんにん",
            "しにん"
          ],
          "answer": 0,
          "explanation": "四人 is read as よにん (drops the ん from よん; never よんにん or しにん)."
        },
        {
          "q": "What is the special calendar reading for the 1st day of the month?",
          "options": [
            "いちにち",
            "ついたち",
            "はじめのひ"
          ],
          "answer": 1,
          "explanation": "1日 as a calendar date is irregularly read as ついたち."
        },
        {
          "q": "What is the special calendar reading for the 20th day of the month?",
          "options": [
            "にじゅうにち",
            "はつか",
            "ふたつひ"
          ],
          "answer": 1,
          "explanation": "20日 as a calendar date is irregularly read as はつか."
        },
        {
          "q": "What is the reading for 1 long cylindrical object (一本)?",
          "options": [
            "いちほん",
            "いっぽん",
            "いちぼん"
          ],
          "answer": 1,
          "explanation": "1 + hon shifts to a geminate p-sound: 一本 (いっぽん)."
        },
        {
          "q": "Fill in the blank for \"I want to eat ramen\": ラーメン が（　）。",
          "options": [
            "食べたい です",
            "食べます",
            "食べた です"
          ],
          "answer": 0,
          "explanation": "Verb stem (食べ) + たい です expresses personal desire."
        },
        {
          "q": "Fill in the blank: 私は 日本語（　）上手です。 (\"I am skilled in Japanese.\")",
          "options": [
            "を",
            "が",
            "で"
          ],
          "answer": 1,
          "explanation": "Adjectives of skill and preference like 上手 (skilled), 下手 (unskilled), and 好き (liked) take が."
        },
        {
          "q": "What sound-symbolic onomatopoeia describes a starving, empty stomach?",
          "options": [
            "ゴロゴロ",
            "ペコペコ",
            "ニコニコ"
          ],
          "answer": 1,
          "explanation": "お腹がペコペコ means hungry / famished."
        },
        {
          "q": "Which onomatopoeia describes a pounding heart from nervousness or excitement before an exam?",
          "options": [
            "ドキドキ",
            "ピカピカ",
            "ペラペラ"
          ],
          "answer": 0,
          "explanation": "胸がドキドキする describes a rapidly pounding heart from anticipation or nerves."
        },
        {
          "q": "Fill in the blank for listing activities: 休みの日は 本を 読んだり、映画を（　）します。",
          "options": [
            "見て",
            "見たり",
            "見る"
          ],
          "answer": 1,
          "explanation": "〜たり、〜たり します lists representative activities (読んだり、見たりします)."
        }
      ],
      "questionPool": [
        {
          "q": "How do you say \"two people\" in Japanese?",
          "options": [
            "ににん",
            "ふたり",
            "りょうにん"
          ],
          "answer": 1,
          "explanation": "二人 is irregularly read with native Japanese Wago as ふたり."
        },
        {
          "q": "How is \"4 people\" pronounced correctly in Japanese?",
          "options": [
            "よにん",
            "よんにん",
            "しにん"
          ],
          "answer": 0,
          "explanation": "四人 is read as よにん (drops the ん from よん; never よんにん or しにん)."
        },
        {
          "q": "What is the special calendar reading for the 1st day of the month?",
          "options": [
            "いちにち",
            "ついたち",
            "はじめのひ"
          ],
          "answer": 1,
          "explanation": "1日 as a calendar date is irregularly read as ついたち."
        },
        {
          "q": "What is the special calendar reading for the 20th day of the month?",
          "options": [
            "にじゅうにち",
            "はつか",
            "ふたつひ"
          ],
          "answer": 1,
          "explanation": "20日 as a calendar date is irregularly read as はつか."
        },
        {
          "q": "What is the reading for 1 long cylindrical object (一本)?",
          "options": [
            "いちほん",
            "いっぽん",
            "いちぼん"
          ],
          "answer": 1,
          "explanation": "1 + hon shifts to a geminate p-sound: 一本 (いっぽん)."
        },
        {
          "q": "Fill in the blank for \"I want to eat ramen\": ラーメン が（　）。",
          "options": [
            "食べたい です",
            "食べます",
            "食べた です"
          ],
          "answer": 0,
          "explanation": "Verb stem (食べ) + たい です expresses personal desire."
        },
        {
          "q": "Fill in the blank: 私は 日本語（　）上手です。 (\"I am skilled in Japanese.\")",
          "options": [
            "を",
            "が",
            "で"
          ],
          "answer": 1,
          "explanation": "Adjectives of skill and preference like 上手 (skilled), 下手 (unskilled), and 好き (liked) take が."
        },
        {
          "q": "What sound-symbolic onomatopoeia describes a starving, empty stomach?",
          "options": [
            "ゴロゴロ",
            "ペコペコ",
            "ニコニコ"
          ],
          "answer": 1,
          "explanation": "お腹がペコペコ means hungry / famished."
        },
        {
          "q": "Which onomatopoeia describes a pounding heart from nervousness or excitement before an exam?",
          "options": [
            "ドキドキ",
            "ピカピカ",
            "ペラペラ"
          ],
          "answer": 0,
          "explanation": "胸がドキドキする describes a rapidly pounding heart from anticipation or nerves."
        },
        {
          "q": "Fill in the blank for listing activities: 休みの日は 本を 読んだり、映画を（　）します。",
          "options": [
            "見て",
            "見たり",
            "見る"
          ],
          "answer": 1,
          "explanation": "〜たり、〜たり します lists representative activities (読んだり、見たりします)."
        },
        {
          "q": "What is the plain / casual equivalent of 食べます?",
          "options": [
            "食べる (dictionary form)",
            "食べた",
            "食べない",
            "食べよう"
          ],
          "answer": 0,
          "explanation": "The non-past affirmative plain form of a verb is its dictionary form (辞書形)."
        },
        {
          "q": "What is the plain negative form of the verb 飲む (のむ / to drink)?",
          "options": [
            "飲まない (nomanai)",
            "飲まなかった",
            "飲めない",
            "飲みない"
          ],
          "answer": 0,
          "explanation": "Godan verbs shift to the A-row + ない: 飲む → 飲まない."
        },
        {
          "q": "What is the plain past affirmative form of 行く (いく / to go)?",
          "options": [
            "行った (itta)",
            "行きた",
            "行ったです",
            "行くだった"
          ],
          "answer": 0,
          "explanation": "Plain past form follows the te-form rule: 行って → 行った."
        },
        {
          "q": "How do you express \"I think that tomorrow will be sunny\" using 〜と思う?",
          "options": [
            "明日は 晴れると 思います。",
            "明日は 晴れますと 思います。",
            "明日は 晴れを 思います。"
          ],
          "answer": 0,
          "explanation": "The quotation particle と precedes 思います and requires the plain form (晴れると)."
        },
        {
          "q": "How do you quote someone saying \"I will go\" using 〜と言いました?",
          "options": [
            "「行く」と 言いました。",
            "「行きます」を 言いました。",
            "「行く」で 言いました。"
          ],
          "answer": 0,
          "explanation": "Quoted speech is enclosed by quotation particle と."
        },
        {
          "q": "What is the plain negative form of the irregular verb ある (to exist / have)?",
          "options": [
            "ない (nai)",
            "あらない",
            "あない",
            "ありません"
          ],
          "answer": 0,
          "explanation": "ある has the special irregular plain negative form ない."
        },
        {
          "q": "In casual conversation with close friends, which sentence sounds most natural?",
          "options": [
            "明日、映画 見に行く？",
            "明日、映画を 見に行きますか。",
            "明日、映画を ご覧になりますか。"
          ],
          "answer": 0,
          "explanation": "In casual peer speech, particles are often dropped and verbs are in plain form with rising intonation."
        },
        {
          "q": "How do you say \"Tokyo is bigger than Kyoto\" in Japanese?",
          "options": [
            "東京は 京都より 大きいです。",
            "東京より 京都は 大きいです。",
            "東京は 京都のほうが 小さいです。"
          ],
          "answer": 0,
          "explanation": "[A] は [B] より [Adjective] means \"A is more [Adjective] than B\"."
        },
        {
          "q": "What does 〜でしょう / 〜だろう indicate at the end of a sentence?",
          "options": [
            "Conjecture / Probability (\"probably / right?\")",
            "Past prohibition",
            "Direct order",
            "Passive voice"
          ],
          "answer": 0,
          "explanation": "〜でしょう expresses conjecture or asking for agreement (\"probably\")."
        },
        {
          "q": "What is the plain form of the polite copula です in the present tense?",
          "options": [
            "だ (da)",
            "だった",
            "じゃない",
            "では"
          ],
          "answer": 0,
          "explanation": "The plain copula corresponding to です is だ (da)."
        },
        {
          "q": "What is the plain past form of the adjective 高い (expensive)?",
          "options": [
            "高かった (takakatta)",
            "高いでした",
            "高くだった",
            "高いた"
          ],
          "answer": 0,
          "explanation": "I-adjectives drop い and add かった for plain past: 高かった."
        },
        {
          "q": "What does \"りんごと みかんと どちらが 好きですか\" ask?",
          "options": [
            "Between apples and oranges, which one do you like better?",
            "Do you like apples and oranges?",
            "Why do you like apples?"
          ],
          "answer": 0,
          "explanation": "〜と〜と どちらが [predicate] is the two-way comparison formula."
        },
        {
          "q": "What is the plain negative form of the irregular verb する (to do)?",
          "options": [
            "しない (shinai)",
            "すない",
            "されない",
            "しなかった"
          ],
          "answer": 0,
          "explanation": "する plain negative is しない."
        },
        {
          "q": "What is the plain negative form of the irregular verb 来る (くる / to come)?",
          "options": [
            "来ない (こない / konai)",
            "きない",
            "くらない",
            "こなかった"
          ],
          "answer": 0,
          "explanation": "くる plain negative shifts pronunciation to こない."
        },
        {
          "q": "Which word means \"the most\" in superlative sentences like \"日本で 一番 高い山\"?",
          "options": [
            "一番 (いちばん)",
            "もっと",
            "より",
            "ずっと"
          ],
          "answer": 0,
          "explanation": "一番 (ichiban) means \"number one / the most\" in superlatives."
        }
      ],
      "phases": [
        {
          "phase": 1,
          "name": "Opening Stance",
          "nameJp": "第一形態：構え (Calm Stance)",
          "hpThreshold": 100,
          "dialogue": "「さあ、お手並み拝見といこうか。」 (Show me what you have learned!)",
          "themeColor": "#38bdf8"
        },
        {
          "phase": 2,
          "name": "Enraged Awakening",
          "nameJp": "第二形態：激昂 (Enraged Phase)",
          "hpThreshold": 66,
          "dialogue": "「なかなかやるな…だがここからが本気だ！」 (Impressive... but now I get serious!)",
          "themeColor": "#f59e0b"
        },
        {
          "phase": 3,
          "name": "Desperation Climax",
          "nameJp": "最終形態：極限奥義 (Desperation Climax)",
          "hpThreshold": 33,
          "dialogue": "「これで終わりだ！渾身の一撃を受けよ！」 (This is the end! Withstand my ultimate attack!)",
          "themeColor": "#ef4444"
        }
      ]
    }
  },
  {
    "sagaNumber": 6,
    "id": "saga-6",
    "title": "Saga 6: The N4 Frontier",
    "titleJp": "第6章：N4ブリッジ・応用文法",
    "theme": "Step into intermediate Japanese: Transitive/Intransitive pairs, Potential forms, Conditionals, and Keigo.",
    "badge": "🚀 Intermediate N4 Ready",
    "unlockThresholdScore": 70,
    "stages": [
      {
        "id": "s6-1",
        "stageNumber": 1,
        "title": "Transitive vs. Intransitive Verb Pairs (自動詞・他動詞)",
        "titleJp": "自他動詞ペア道場",
        "icon": "🔄",
        "category": "Conjugation",
        "description": "Understand the difference between ドアが開く (door opens by itself) and ドアを開ける (someone opens the door).",
        "targetRoute": "/conjugate?tab=pairs",
        "actionPrompt": "Drill Verb Pairs →",
        "targetTab": "pairs"
      },
      {
        "id": "s6-2",
        "stageNumber": 2,
        "title": "Grammar Lesson 8: Potential Form (〜できる / 〜行ける)",
        "titleJp": "可能形・できること",
        "icon": "📐",
        "category": "Grammar",
        "description": "Express abilities: 漢字が読める (can read kanji) and 日本語が話せる (can speak Japanese).",
        "targetRoute": "/grammar/g8",
        "actionPrompt": "Learn Potential Form →",
        "targetCategory": "Grammar"
      },
      {
        "id": "s6-3",
        "stageNumber": 3,
        "title": "Grammar Lesson 9: Conditionals (〜たら / 〜ば / 〜なら)",
        "titleJp": "条件形（〜たら・〜なら）",
        "icon": "📐",
        "category": "Grammar",
        "description": "Learn when to use 〜たら for \"if/when\" and 〜なら for contextual advice.",
        "targetRoute": "/grammar/g9",
        "actionPrompt": "Study Conditionals →",
        "targetCategory": "Grammar"
      },
      {
        "id": "s6-4",
        "stageNumber": 4,
        "title": "Listening & Tokyo Pitch Accent SVG Contours",
        "titleJp": "聴解と東京式高低アクセント",
        "icon": "🎧",
        "category": "Immersion",
        "description": "Train your ears on homophones like 箸 (chopsticks, Atamadaka [1]) vs 橋 (bridge, Odaka [2]).",
        "targetRoute": "/listening?tab=pitch",
        "actionPrompt": "Train Pitch Accent →",
        "targetCategory": "Immersion",
        "targetTab": "pitch"
      }
    ],
    "boss": {
      "title": "Ultimate Boss Fight: JLPT N4 Readiness Trial",
      "description": "Clear the N4 bridge checkpoint covering verb pairs, potential forms, conditionals, keigo, and pitch accent across 10 questions (score at least 7 to pass).",
      "minPassScore": 7,
      "questions": [
        {
          "q": "Which sentence correctly uses the intransitive verb 開く (あく / to open)?",
          "options": [
            "ドア を 開けます。",
            "ドア が 開きます。",
            "ドア に 開きます。"
          ],
          "answer": 1,
          "explanation": "自動詞 (intransitive) takes が: ドアが開きます (The door opens by itself)."
        },
        {
          "q": "Fill in the blank with the transitive verb: 寒いから、窓（　）閉めて ください。 (\"Because it is cold, please close the window.\")",
          "options": [
            "を",
            "が",
            "に"
          ],
          "answer": 0,
          "explanation": "他動詞 (transitive: 閉める) takes the direct object particle を."
        },
        {
          "q": "What is the potential form of the Godan verb 飲む (のむ / to drink)?",
          "options": [
            "のまれる",
            "のめる",
            "のませる"
          ],
          "answer": 1,
          "explanation": "Godan verbs shift to the E-row + る: 飲める (のめる / can drink)."
        },
        {
          "q": "What is the potential form of the Ichidan verb 食べる (たべる / to eat)?",
          "options": [
            "食べられる (食べれる)",
            "食べさせる",
            "食べます"
          ],
          "answer": 0,
          "explanation": "Ichidan verbs drop る and add られる (colloquially 食べれる): 食べられる (can eat)."
        },
        {
          "q": "What is the potential form of the irregular verb する (to do)?",
          "options": [
            "すれる",
            "できる",
            "させられる"
          ],
          "answer": 1,
          "explanation": "する irregular shifts entirely to できる (can do)."
        },
        {
          "q": "Fill in the blank for universal conditional: 雨が降っ（　）、行きません。 (\"If it rains, I will not go.\")",
          "options": [
            "たら",
            "から",
            "ので"
          ],
          "answer": 0,
          "explanation": "〜たら is the versatile \"if/when\" conditional: 降ったら (if it rains)."
        },
        {
          "q": "Fill in the blank for contextual conditional: 京都へ行く（　）、新幹線が 便利です。 (\"If you are going to Kyoto, the Shinkansen is convenient.\")",
          "options": [
            "なら",
            "たらば",
            "と"
          ],
          "answer": 0,
          "explanation": "〜なら is used to give advice or recommendations based on a topic just brought up."
        },
        {
          "q": "In Keigo, what is the humble form (謙譲語) for oneself going (行く) or coming (来る)?",
          "options": [
            "いらっしゃいます",
            "参ります (まいります)",
            "なさいます"
          ],
          "answer": 1,
          "explanation": "参ります (まいります) is the humble (Kenjougo) form used when the speaker goes or comes."
        },
        {
          "q": "Which honorific verb (尊敬語) politely elevates a customer or superior viewing something (見る)?",
          "options": [
            "ご覧になります (ごらんに なります)",
            "拝見します (はいけん します)",
            "見せます"
          ],
          "answer": 0,
          "explanation": "ご覧になります is the honorific (Sonkeigo) form of 見る. 拝見します is humble (Kenjougo)."
        },
        {
          "q": "In Tokyo pitch accent, how do the minimal pair words 雨 (rain) and 飴 (candy) differ?",
          "options": [
            "雨 is 頭高 [1] (High → Low); 飴 is 平板 [0] (Low → High flat)",
            "They have the exact same pitch contour",
            "雨 is flat; 飴 starts high and drops"
          ],
          "answer": 0,
          "explanation": "雨 (rain) starts HIGH and drops (Á-me-ga, [1]), while 飴 (candy) starts LOW and stays flat high (a-MÉ-GA, [0])."
        }
      ],
      "questionPool": [
        {
          "q": "Which sentence correctly uses the intransitive verb 開く (あく / to open)?",
          "options": [
            "ドア を 開けます。",
            "ドア が 開きます。",
            "ドア に 開きます。"
          ],
          "answer": 1,
          "explanation": "自動詞 (intransitive) takes が: ドアが開きます (The door opens by itself)."
        },
        {
          "q": "Fill in the blank with the transitive verb: 寒いから、窓（　）閉めて ください。 (\"Because it is cold, please close the window.\")",
          "options": [
            "を",
            "が",
            "に"
          ],
          "answer": 0,
          "explanation": "他動詞 (transitive: 閉める) takes the direct object particle を."
        },
        {
          "q": "What is the potential form of the Godan verb 飲む (のむ / to drink)?",
          "options": [
            "のまれる",
            "のめる",
            "のませる"
          ],
          "answer": 1,
          "explanation": "Godan verbs shift to the E-row + る: 飲める (のめる / can drink)."
        },
        {
          "q": "What is the potential form of the Ichidan verb 食べる (たべる / to eat)?",
          "options": [
            "食べられる (食べれる)",
            "食べさせる",
            "食べます"
          ],
          "answer": 0,
          "explanation": "Ichidan verbs drop る and add られる (colloquially 食べれる): 食べられる (can eat)."
        },
        {
          "q": "What is the potential form of the irregular verb する (to do)?",
          "options": [
            "すれる",
            "できる",
            "させられる"
          ],
          "answer": 1,
          "explanation": "する irregular shifts entirely to できる (can do)."
        },
        {
          "q": "Fill in the blank for universal conditional: 雨が降っ（　）、行きません。 (\"If it rains, I will not go.\")",
          "options": [
            "たら",
            "から",
            "ので"
          ],
          "answer": 0,
          "explanation": "〜たら is the versatile \"if/when\" conditional: 降ったら (if it rains)."
        },
        {
          "q": "Fill in the blank for contextual conditional: 京都へ行く（　）、新幹線が 便利です。 (\"If you are going to Kyoto, the Shinkansen is convenient.\")",
          "options": [
            "なら",
            "たらば",
            "と"
          ],
          "answer": 0,
          "explanation": "〜なら is used to give advice or recommendations based on a topic just brought up."
        },
        {
          "q": "In Keigo, what is the humble form (謙譲語) for oneself going (行く) or coming (来る)?",
          "options": [
            "いらっしゃいます",
            "参ります (まいります)",
            "なさいます"
          ],
          "answer": 1,
          "explanation": "参ります (まいります) is the humble (Kenjougo) form used when the speaker goes or comes."
        },
        {
          "q": "Which honorific verb (尊敬語) politely elevates a customer or superior viewing something (見る)?",
          "options": [
            "ご覧になります (ごらんに なります)",
            "拝見します (はいけん します)",
            "見せます"
          ],
          "answer": 0,
          "explanation": "ご覧になります is the honorific (Sonkeigo) form of 見る. 拝見します is humble (Kenjougo)."
        },
        {
          "q": "In Tokyo pitch accent, how do the minimal pair words 雨 (rain) and 飴 (candy) differ?",
          "options": [
            "雨 is 頭高 [1] (High → Low); 飴 is 平板 [0] (Low → High flat)",
            "They have the exact same pitch contour",
            "雨 is flat; 飴 starts high and drops"
          ],
          "answer": 0,
          "explanation": "雨 (rain) starts HIGH and drops (Á-me-ga, [1]), while 飴 (candy) starts LOW and stays flat high (a-MÉ-GA, [0])."
        },
        {
          "q": "What is the intransitive partner of the transitive verb 消す (けす / to turn off)?",
          "options": [
            "消える (きえる / to go out by itself)",
            "消させる",
            "消される",
            "消す"
          ],
          "answer": 0,
          "explanation": "電気が消える (light goes out, intransitive) vs 電気を消す (turn off light, transitive)."
        },
        {
          "q": "What does the grammar pattern 〜たことがある express?",
          "options": [
            "Past experience (\"I have had the experience of ...\")",
            "Continuous repetition",
            "Future possibility",
            "Strict obligation"
          ],
          "answer": 0,
          "explanation": "Verb past plain form (た-form) + ことがある expresses past life experience."
        },
        {
          "q": "How do you say \"I have been to Japan before\" correctly?",
          "options": [
            "日本へ 行ったことが あります。",
            "日本へ 行くことが あります。",
            "日本へ 行きますことが あります。"
          ],
          "answer": 0,
          "explanation": "行った (past plain) + ことがある expresses having been there."
        },
        {
          "q": "What does the suffix 〜すぎる mean in 食べすぎました?",
          "options": [
            "Did too much / overdid",
            "Did not do enough",
            "Disliked doing",
            "Easily did"
          ],
          "answer": 0,
          "explanation": "Verb stem + すぎる expresses doing an action in excess (over-eating, over-sleeping)."
        },
        {
          "q": "How do you express an adjective turning into a new state (e.g. \"become cold\") with 寒くなる?",
          "options": [
            "Drop い and add くなる (寒くなる)",
            "Add になる (寒いになる)",
            "Add くなる to na-adjectives"
          ],
          "answer": 0,
          "explanation": "I-adjectives change final い to く + なる (寒い → 寒くなる)."
        },
        {
          "q": "How do na-adjectives express becoming a state (e.g. \"become quiet\")?",
          "options": [
            "静かになる",
            "静かくなる",
            "静かだなる",
            "静かになること"
          ],
          "answer": 0,
          "explanation": "Na-adjectives add に + なる (静かになる)."
        },
        {
          "q": "What does the pattern 〜やすい mean in この本は 読みやすいです?",
          "options": [
            "Easy to read",
            "Hard to read",
            "Must read",
            "Cannot read"
          ],
          "answer": 0,
          "explanation": "Verb stem + やすい means \"easy to do\"."
        },
        {
          "q": "What does the pattern 〜にくい mean in この薬は 飲みにくいです?",
          "options": [
            "Difficult / hard to swallow",
            "Easy to swallow",
            "Tastes delicious",
            "Dangerous to swallow"
          ],
          "answer": 0,
          "explanation": "Verb stem + にくい means \"difficult or unpleasant to do\"."
        },
        {
          "q": "Which verb is transitive in the pair 壊す (こわす) and 壊れる (こわれる)?",
          "options": [
            "壊す (こわす - someone breaks something, takes を)",
            "壊れる (こわれる - something breaks by itself, takes が)"
          ],
          "answer": 0,
          "explanation": "壊す is transitive (他動詞); 壊れる is intransitive (自動詞)."
        },
        {
          "q": "Fill in the blank for listing alternating actions: 日曜日は 掃除をし（　）、洗濯をし（　）しました。",
          "options": [
            "たり / たり",
            "て / て",
            "たら / たら",
            "から / から"
          ],
          "answer": 0,
          "explanation": "〜たり、〜たり します lists non-exhaustive representative activities."
        },
        {
          "q": "What pitch contour does the Tokyo word 箸 (はし / chopsticks) follow?",
          "options": [
            "頭高 [1] (High on は, drops on し)",
            "平板 [0] (Low on は, high on し)",
            "尾高 [2]"
          ],
          "answer": 0,
          "explanation": "箸 (chopsticks) is Atamadaka [1] (H-L)."
        },
        {
          "q": "What pitch contour does the Tokyo word 橋 (はし / bridge) follow?",
          "options": [
            "尾高 [2] (Low on は, high on し, drops on particle が)",
            "頭高 [1]",
            "平板 [0]"
          ],
          "answer": 0,
          "explanation": "橋 (bridge) is Odaka [2] (L-H, drops on following particle が)."
        },
        {
          "q": "What pitch contour does the Tokyo word 端 (はし / edge) follow?",
          "options": [
            "平板 [0] (Low on は, high on し and flat on particle が)",
            "頭高 [1]",
            "中高 [2]"
          ],
          "answer": 0,
          "explanation": "端 (edge) is Heiban [0] (L-H flat, no drop on particle が)."
        },
        {
          "q": "Fill in the blank: 電車が 止まっ（　）。 (\"The train stopped [by itself].\")",
          "options": [
            "た (自動詞: 止まる)",
            "た (他動詞: 止める)",
            "した"
          ],
          "answer": 0,
          "explanation": "止まる (とまる) is the intransitive verb for vehicles coming to a stop."
        },
        {
          "q": "What does まだ 宿題を していません mean?",
          "options": [
            "I have not done my homework yet.",
            "I already did my homework.",
            "I am doing homework now."
          ],
          "answer": 0,
          "explanation": "まだ + negative te-form (〜ていません) means \"have not yet done ~\"."
        }
      ],
      "phases": [
        {
          "phase": 1,
          "name": "Opening Stance",
          "nameJp": "第一形態：構え (Calm Stance)",
          "hpThreshold": 100,
          "dialogue": "「さあ、お手並み拝見といこうか。」 (Show me what you have learned!)",
          "themeColor": "#38bdf8"
        },
        {
          "phase": 2,
          "name": "Enraged Awakening",
          "nameJp": "第二形態：激昂 (Enraged Phase)",
          "hpThreshold": 66,
          "dialogue": "「なかなかやるな…だがここからが本気だ！」 (Impressive... but now I get serious!)",
          "themeColor": "#f59e0b"
        },
        {
          "phase": 3,
          "name": "Desperation Climax",
          "nameJp": "最終形態：極限奥義 (Desperation Climax)",
          "hpThreshold": 33,
          "dialogue": "「これで終わりだ！渾身の一撃を受けよ！」 (This is the end! Withstand my ultimate attack!)",
          "themeColor": "#ef4444"
        }
      ]
    }
  },
  {
    "sagaNumber": 7,
    "id": "saga-7",
    "title": "Saga 7: Akihabara Tech & Hobbies",
    "titleJp": "第7章：可能形と名詞化",
    "theme": "Conquer potential verbs (Can / Cannot), verb nominalization with の/こと, and tech vocabulary in Akihabara.",
    "badge": "⚡ Electric City Hacker",
    "unlockThresholdScore": 70,
    "stages": [
      {
        "id": "s7-1",
        "stageNumber": 1,
        "title": "Potential Form Mastery (飲める・話せる・できる)",
        "titleJp": "可能形マスター道場",
        "icon": "💪",
        "category": "Conjugation",
        "description": "Master potential verb inflections across all Godan and Ichidan verbs to express what you can and cannot do.",
        "targetRoute": "/conjugate?tab=conjugate",
        "actionPrompt": "Practice Potential Forms →",
        "targetTab": "conjugate"
      },
      {
        "id": "s7-2",
        "stageNumber": 2,
        "title": "Nominalization: Turning Verbs into Nouns (〜の / 〜こと)",
        "titleJp": "動詞の名詞化（〜のが好き・〜ことができる）",
        "icon": "📐",
        "category": "Grammar",
        "description": "Learn to talk about hobbies, preferences, and abilities using verb nominalizers の and こと.",
        "targetRoute": "/grammar/g8",
        "actionPrompt": "Study Nominalization →",
        "targetCategory": "Grammar"
      },
      {
        "id": "s7-3",
        "stageNumber": 3,
        "title": "Technology, Machinery & Transport Kanji (電・車・機・使・動)",
        "titleJp": "機械と乗り物の漢字",
        "icon": "🤖",
        "category": "Kanji",
        "description": "Read and write authentic signs and spec sheets from Akihabara electronics stores and gaming centers.",
        "targetRoute": "/kanji-dojo",
        "actionPrompt": "Drill Tech Kanji →",
        "targetItems": [
          "電",
          "車",
          "機",
          "使",
          "動"
        ]
      },
      {
        "id": "s7-4",
        "stageNumber": 4,
        "title": "Real-World Media: Train Delay Notification (電車の遅延通知書)",
        "titleJp": "電車の遅延通知書",
        "icon": "🚆",
        "category": "Immersion",
        "description": "Read graded authentic transport delay notifications and tech announcements.",
        "targetRoute": "/stories/ch19-train-notice",
        "actionPrompt": "Read Transit Notice →",
        "targetCategory": "Immersion"
      }
    ],
    "boss": {
      "title": "Gatekeeper Boss: Master of Electric Town (秋葉原の電脳導師)",
      "description": "Defeat the Cybernetic Sensei of Akihabara by demonstrating total command over potential verbs, nominalization, and technical Japanese.",
      "minPassScore": 7,
      "questions": [
        {
          "q": "What is the potential form of the Godan verb 泳ぐ (およぐ / to swim)?",
          "options": [
            "泳げる (およげる)",
            "泳がれる",
            "泳がせる",
            "泳ぎる"
          ],
          "answer": 0,
          "explanation": "Godan verbs shift from the U-row to the E-row + る: 泳ぐ → 泳げる (can swim)."
        },
        {
          "q": "Which particle typically marks the object of ability with potential verbs in formal Japanese?",
          "options": [
            "が (ga)",
            "を (o)",
            "で (de)",
            "に (ni)"
          ],
          "answer": 0,
          "explanation": "In standard grammar, ability targets take が (e.g. 日本語が話せる), though を is common colloquially."
        },
        {
          "q": "How do you say \"My hobby is listening to music\" correctly using nominalization?",
          "options": [
            "私の趣味は 音楽を 聴くことです。",
            "私の趣味は 音楽を 聴くです。",
            "私の趣味は 音楽を 聴きますこと。"
          ],
          "answer": 0,
          "explanation": "Verb dictionary form + ことです correctly nominalizes 聴く into \"listening\"."
        },
        {
          "q": "What is the potential form of the irregular verb 来る (くる / to come)?",
          "options": [
            "来られる (こられる)",
            "きれる",
            "これる",
            "くられる"
          ],
          "answer": 0,
          "explanation": "来る irregular potential form is 来られる (こられる), colloquially often shortened to これる."
        },
        {
          "q": "What is the difference between 〜のが好き and 〜ことが好き?",
          "options": [
            "〜のが好き is the standard natural phrase for direct personal enjoyment (e.g. 歌うのが好き).",
            "〜ことが好き is mandatory for all hobbies.",
            "They cannot be used with verbs."
          ],
          "answer": 0,
          "explanation": "〜のが好き is the idiomatic, natural phrasing for personal sensory likes and activities."
        },
        {
          "q": "What does \"漢字を 書くことが できます\" mean?",
          "options": [
            "I can write kanji.",
            "I must write kanji.",
            "I like writing kanji.",
            "I am writing kanji now."
          ],
          "answer": 0,
          "explanation": "辞書形 + ことが できます expresses formal capability (\"can do ~\")."
        },
        {
          "q": "What is the potential form of the Ichidan verb 見る (みる / to see)?",
          "options": [
            "見られる (みられる)",
            "みれる",
            "みせる",
            "みられる / 見れる"
          ],
          "answer": 3,
          "explanation": "The standard potential is 見られる, with the common \"ra-nuki\" colloquial form 見れる."
        },
        {
          "q": "Fill in the blank: この店では クレジットカードが 使え（　）。 (\"Credit cards cannot be used here.\")",
          "options": [
            "ません",
            "ます",
            "ないでした",
            "でした"
          ],
          "answer": 0,
          "explanation": "使えません is the polite negative potential of 使う (cannot use)."
        },
        {
          "q": "What does the Akihabara sign 免税 (めんぜい) mean for international travelers?",
          "options": [
            "Tax-Free / Duty-Free shopping",
            "Sold Out",
            "Cash Only",
            "No photography"
          ],
          "answer": 0,
          "explanation": "免 (exempt) + 税 (tax) = Tax-Free shopping."
        },
        {
          "q": "How do you say \"I can speak a little Japanese\" naturally?",
          "options": [
            "日本語が 少し 話せます。",
            "日本語を 少し 話しますこと。",
            "日本語に 少し 話せません。"
          ],
          "answer": 0,
          "explanation": "日本語が少し話せます uses the potential verb 話せる with が and degree adverb 少し."
        }
      ],
      "questionPool": [
        {
          "q": "What is the potential form of the Godan verb 泳ぐ (およぐ / to swim)?",
          "options": [
            "泳げる (およげる)",
            "泳がれる",
            "泳がせる",
            "泳ぎる"
          ],
          "answer": 0,
          "explanation": "Godan verbs shift from the U-row to the E-row + る: 泳ぐ → 泳げる (can swim)."
        },
        {
          "q": "Which particle typically marks the object of ability with potential verbs in formal Japanese?",
          "options": [
            "が (ga)",
            "を (o)",
            "で (de)",
            "に (ni)"
          ],
          "answer": 0,
          "explanation": "In standard grammar, ability targets take が (e.g. 日本語が話せる), though を is common colloquially."
        },
        {
          "q": "How do you say \"My hobby is listening to music\" correctly using nominalization?",
          "options": [
            "私の趣味は 音楽を 聴くことです。",
            "私の趣味は 音楽を 聴くです。",
            "私の趣味は 音楽を 聴きますこと。"
          ],
          "answer": 0,
          "explanation": "Verb dictionary form + ことです correctly nominalizes 聴く into \"listening\"."
        },
        {
          "q": "What is the potential form of the irregular verb 来る (くる / to come)?",
          "options": [
            "来られる (こられる)",
            "きれる",
            "これる",
            "くられる"
          ],
          "answer": 0,
          "explanation": "来る irregular potential form is 来られる (こられる), colloquially often shortened to これる."
        },
        {
          "q": "What is the difference between 〜のが好き and 〜ことが好き?",
          "options": [
            "〜のが好き is the standard natural phrase for direct personal enjoyment (e.g. 歌うのが好き).",
            "〜ことが好き is mandatory for all hobbies.",
            "They cannot be used with verbs."
          ],
          "answer": 0,
          "explanation": "〜のが好き is the idiomatic, natural phrasing for personal sensory likes and activities."
        },
        {
          "q": "What does \"漢字を 書くことが できます\" mean?",
          "options": [
            "I can write kanji.",
            "I must write kanji.",
            "I like writing kanji.",
            "I am writing kanji now."
          ],
          "answer": 0,
          "explanation": "辞書形 + ことが できます expresses formal capability (\"can do ~\")."
        },
        {
          "q": "What is the potential form of the Ichidan verb 見る (みる / to see)?",
          "options": [
            "見られる (みられる)",
            "みれる",
            "みせる",
            "みられる / 見れる"
          ],
          "answer": 3,
          "explanation": "The standard potential is 見られる, with the common \"ra-nuki\" colloquial form 見れる."
        },
        {
          "q": "Fill in the blank: この店では クレジットカードが 使え（　）。 (\"Credit cards cannot be used here.\")",
          "options": [
            "ません",
            "ます",
            "ないでした",
            "でした"
          ],
          "answer": 0,
          "explanation": "使えません is the polite negative potential of 使う (cannot use)."
        },
        {
          "q": "What does the Akihabara sign 免税 (めんぜい) mean for international travelers?",
          "options": [
            "Tax-Free / Duty-Free shopping",
            "Sold Out",
            "Cash Only",
            "No photography"
          ],
          "answer": 0,
          "explanation": "免 (exempt) + 税 (tax) = Tax-Free shopping."
        },
        {
          "q": "How do you say \"I can speak a little Japanese\" naturally?",
          "options": [
            "日本語が 少し 話せます。",
            "日本語を 少し 話しますこと。",
            "日本語に 少し 話せません。"
          ],
          "answer": 0,
          "explanation": "日本語が少し話せます uses the potential verb 話せる with が and degree adverb 少し."
        },
        {
          "q": "What is the potential form of the Godan verb 待つ (まつ / to wait)?",
          "options": [
            "待てる (まてる)",
            "待たれる",
            "待たせる",
            "待てること"
          ],
          "answer": 0,
          "explanation": "待つ (Godan -tsu) shifts to the E-row: 待てる (can wait)."
        },
        {
          "q": "What is the potential form of the Godan verb 買う (かう / to buy)?",
          "options": [
            "買える (かえる)",
            "買われる",
            "買わせる",
            "買えること"
          ],
          "answer": 0,
          "explanation": "買う shifts to E-row: 買える (can buy)."
        },
        {
          "q": "What is the potential form of the verb 話す (はなす / to speak)?",
          "options": [
            "話せる (はなせる)",
            "話される",
            "話させる",
            "話すできる"
          ],
          "answer": 0,
          "explanation": "話す shifts to E-row: 話せる (can speak)."
        },
        {
          "q": "What does \"一人で 日本へ 行くことが できますか\" ask?",
          "options": [
            "Can you go to Japan by yourself?",
            "Did you go to Japan alone?",
            "Do you want to go to Japan alone?"
          ],
          "answer": 0,
          "explanation": "辞書形 + ことができますか asks if one has the ability to do something."
        },
        {
          "q": "How do you say \"I forgot to buy milk\" using nominalizer の?",
          "options": [
            "牛乳を 買うのを 忘れました。",
            "牛乳を 買いますを 忘れました。",
            "牛乳を 買うことに 忘れました。"
          ],
          "answer": 0,
          "explanation": "〜のを 忘れる is the standard pattern for forgetting to perform an action."
        },
        {
          "q": "Which kanji means \"electricity\" in 電話 and 電車?",
          "options": [
            "電",
            "車",
            "機",
            "話"
          ],
          "answer": 0,
          "explanation": "電 (den) means electricity."
        },
        {
          "q": "What does \"彼女が 歌うのを 聴きました\" mean?",
          "options": [
            "I listened to her singing.",
            "I told her to sing.",
            "She asked me to sing."
          ],
          "answer": 0,
          "explanation": "Perception verbs (聴く, 見る) take the direct sensory nominalizer の (歌うのを聴いた)."
        },
        {
          "q": "What is the potential form of the irregular verb する (to do)?",
          "options": [
            "できる (dekiru)",
            "すれる",
            "させられる",
            "される"
          ],
          "answer": 0,
          "explanation": "する potential is completely suppletive: できる."
        },
        {
          "q": "Fill in the blank: 納豆を 食べる（　）が できません。 (\"I cannot eat natto.\")",
          "options": [
            "こと",
            "もの",
            "ところ",
            "わけ"
          ],
          "answer": 0,
          "explanation": "辞書形 + ことが できません expresses inability."
        },
        {
          "q": "What does 中古 (ちゅうこ) mean on an Akihabara camera store sign?",
          "options": [
            "Used / Second-hand",
            "Brand New",
            "Damaged / Junk",
            "Reserved"
          ],
          "answer": 0,
          "explanation": "中 (medium) + 古 (old) = second-hand / used merchandise."
        },
        {
          "q": "What is the potential form of the Ichidan verb 起きる (おきる / to wake up)?",
          "options": [
            "起きられる (おきられる)",
            "おきれる",
            "おきせる",
            "起きられる / 起きれる"
          ],
          "answer": 3,
          "explanation": "Both standard 起きられる and colloquial 起きれる are used."
        },
        {
          "q": "How do you say \"Can you read this kanji?\" politely?",
          "options": [
            "この漢字が 読めますか。",
            "この漢字を 読みますか。",
            "この漢字に 読めますか。"
          ],
          "answer": 0,
          "explanation": "読めますか uses the potential form of 読む with topic/target が."
        },
        {
          "q": "What does 充電器 (じゅうでんき) mean in a tech shop?",
          "options": [
            "Battery Charger",
            "Smartphone Screen",
            "Earphones",
            "Power Cord"
          ],
          "answer": 0,
          "explanation": "充 (charge) + 電 (electricity) + 器 (device) = battery charger."
        },
        {
          "q": "What is the negative potential form of できる?",
          "options": [
            "できない (できません)",
            "できらない",
            "できれない",
            "できぬ"
          ],
          "answer": 0,
          "explanation": "できる inflects as an Ichidan verb: できない / できません."
        },
        {
          "q": "What does the tech sign 新品 (しんぴん) mean?",
          "options": [
            "Brand New / Unopened",
            "Used item",
            "Refurbished",
            "Sample only"
          ],
          "answer": 0,
          "explanation": "新 (new) + 品 (goods) = brand-new item."
        }
      ],
      "phases": [
        {
          "phase": 1,
          "name": "Opening Stance",
          "nameJp": "第一形態：構え (Calm Stance)",
          "hpThreshold": 100,
          "dialogue": "「さあ、お手並み拝見といこうか。」 (Show me what you have learned!)",
          "themeColor": "#38bdf8"
        },
        {
          "phase": 2,
          "name": "Enraged Awakening",
          "nameJp": "第二形態：激昂 (Enraged Phase)",
          "hpThreshold": 66,
          "dialogue": "「なかなかやるな…だがここからが本気だ！」 (Impressive... but now I get serious!)",
          "themeColor": "#f59e0b"
        },
        {
          "phase": 3,
          "name": "Desperation Climax",
          "nameJp": "最終形態：極限奥義 (Desperation Climax)",
          "hpThreshold": 33,
          "dialogue": "「これで終わりだ！渾身の一撃を受けよ！」 (This is the end! Withstand my ultimate attack!)",
          "themeColor": "#ef4444"
        }
      ]
    }
  },
  {
    "sagaNumber": 8,
    "id": "saga-8",
    "title": "Saga 8: Ancient Kyoto Trails",
    "titleJp": "第8章：多様な条件形",
    "theme": "Navigate historic Kyoto while mastering the 4 conditionals: 〜たら, 〜ば, 〜なら, and 〜と.",
    "badge": "⛩️ Kyoto Heritage Walker",
    "unlockThresholdScore": 70,
    "stages": [
      {
        "id": "s8-1",
        "stageNumber": 1,
        "title": "Conditional Conjugations (〜たら・〜ば・〜なら・〜と)",
        "titleJp": "四大条件形の使い分け道場",
        "icon": "🍁",
        "category": "Grammar",
        "description": "Master the delicate differences between past conditional たら, hypothetical ば, advice-driven なら, and natural consequence と.",
        "targetRoute": "/grammar/g9",
        "actionPrompt": "Master Conditionals →",
        "targetCategory": "Grammar"
      },
      {
        "id": "s8-2",
        "stageNumber": 2,
        "title": "Ancient Capital, Nature & Shrine Kanji (古・寺・神・社・京)",
        "titleJp": "古都と社寺の漢字",
        "icon": "🏯",
        "category": "Kanji",
        "description": "Learn the essential kanji for reading temple maps, stone monuments, and sacred shrine plaques.",
        "targetRoute": "/kanji-dojo",
        "actionPrompt": "Study Kyoto Kanji →",
        "targetItems": [
          "古",
          "寺",
          "神",
          "社",
          "京"
        ]
      },
      {
        "id": "s8-3",
        "stageNumber": 3,
        "title": "Historic Station & Bus Stop Decoder",
        "titleJp": "京都バス停・名所標識読解",
        "icon": "🚌",
        "category": "Immersion",
        "description": "Read authentic bilingual bus route markers and temple directional signboards.",
        "targetRoute": "/signs?tab=signs",
        "actionPrompt": "Decode Kyoto Signs →",
        "targetCategory": "Immersion"
      },
      {
        "id": "s8-4",
        "stageNumber": 4,
        "title": "Graded Folklore Story: Urashima Taro (浦島太郎)",
        "titleJp": "昔話：浦島太郎と竜宮城",
        "icon": "🐢",
        "category": "Immersion",
        "description": "Immerse yourself in classical folklore written in graded N4 grammar.",
        "targetRoute": "/stories/ch12-urashima",
        "actionPrompt": "Read Urashima Taro →",
        "targetCategory": "Immersion"
      }
    ],
    "boss": {
      "title": "Gatekeeper Boss: Guardian of the Inari Torii (伏見稲荷の白狐)",
      "description": "Face the sacred Kitsune guardian of Mount Inari and prove you can discern all four conditional patterns without hesitation.",
      "minPassScore": 7,
      "questions": [
        {
          "q": "Which conditional form is created by attaching 〜たら to the past form of a verb?",
          "options": [
            "Tara conditional (〜たら)",
            "Ba conditional (〜ば)",
            "Nara conditional (〜なら)",
            "To conditional (〜と)"
          ],
          "answer": 0,
          "explanation": "Past plain (た-form) + ら creates the versatile \"if / when\" conditional 〜たら."
        },
        {
          "q": "When should you choose 〜なら over 〜たら?",
          "options": [
            "When providing advice or recommendation based on a topic raised by the listener (e.g. 京都へ行くなら).",
            "Only when talking about natural laws like water freezing.",
            "Only for past events."
          ],
          "answer": 0,
          "explanation": "〜なら takes a conversational context and frames advice or conditions upon it."
        },
        {
          "q": "What is the \"Ba\" conditional form (仮定形) of the verb 飲む (to drink)?",
          "options": [
            "飲めば (nomeba)",
            "飲んだら",
            "飲むなら",
            "飲むと"
          ],
          "answer": 0,
          "explanation": "Godan verbs change the final U-sound to E-sound + ば: 飲む → 飲めば."
        },
        {
          "q": "What does the natural conditional 〜と express in \"春になると、桜が 咲きます\"?",
          "options": [
            "An inevitable, natural, or automatic consequence (\"Whenever spring comes, cherry blossoms bloom\")",
            "A personal request or invitation",
            "A past regret"
          ],
          "answer": 0,
          "explanation": "Dictionary form + と expresses inevitable natural consequences, directions, or mechanical triggers."
        },
        {
          "q": "Why can you NOT use 〜と for requests like \"雨が降ると、傘を貸してください\"?",
          "options": [
            "Because 〜と cannot be followed by speaker intentions, requests, or commands.",
            "Because 雨 is a weather word.",
            "Because 傘 is a noun."
          ],
          "answer": 0,
          "explanation": "Clauses with 〜と cannot end in requests, permissions, or invitations; 〜たら must be used instead."
        },
        {
          "q": "How do you say \"If it rains tomorrow, I will stay home\" using 〜たら?",
          "options": [
            "明日、雨が 降ったら、家に います。",
            "明日、雨が 降ると、家に います。",
            "明日、雨が 降れば、家に いてください。"
          ],
          "answer": 0,
          "explanation": "降ったら (if it rains) is the standard conditional for future contingencies."
        },
        {
          "q": "What does the temple sign 拝観料 (はいかんりょう) mean at a Kyoto shrine or temple?",
          "options": [
            "Admission / Viewing Fee",
            "Exit gate",
            "Rest area",
            "Souvenir shop"
          ],
          "answer": 0,
          "explanation": "拝観 (visiting/worshipping) + 料 (fee) = temple admission fee."
        },
        {
          "q": "What is the \"Ba\" conditional form of the Ichidan verb 食べる (to eat)?",
          "options": [
            "食べれば (tabereba)",
            "食べたら",
            "食べるなら",
            "食べると"
          ],
          "answer": 0,
          "explanation": "Ichidan verbs replace る with れば: 食べる → 食べれば."
        },
        {
          "q": "What is the \"Ba\" conditional form of the irregular verb する (to do)?",
          "options": [
            "すれば (sureba)",
            "したら",
            "するなら",
            "すると"
          ],
          "answer": 0,
          "explanation": "する irregular conditional is すれば."
        },
        {
          "q": "What is the \"Ba\" conditional form of the irregular verb 来る (くる / to come)?",
          "options": [
            "来れば (くれば / kureba)",
            "きたら",
            "くるなら",
            "くると"
          ],
          "answer": 0,
          "explanation": "来る conditional is 来れば (くれば)."
        }
      ],
      "questionPool": [
        {
          "q": "Which conditional form is created by attaching 〜たら to the past form of a verb?",
          "options": [
            "Tara conditional (〜たら)",
            "Ba conditional (〜ば)",
            "Nara conditional (〜なら)",
            "To conditional (〜と)"
          ],
          "answer": 0,
          "explanation": "Past plain (た-form) + ら creates the versatile \"if / when\" conditional 〜たら."
        },
        {
          "q": "When should you choose 〜なら over 〜たら?",
          "options": [
            "When providing advice or recommendation based on a topic raised by the listener (e.g. 京都へ行くなら).",
            "Only when talking about natural laws like water freezing.",
            "Only for past events."
          ],
          "answer": 0,
          "explanation": "〜なら takes a conversational context and frames advice or conditions upon it."
        },
        {
          "q": "What is the \"Ba\" conditional form (仮定形) of the verb 飲む (to drink)?",
          "options": [
            "飲めば (nomeba)",
            "飲んだら",
            "飲むなら",
            "飲むと"
          ],
          "answer": 0,
          "explanation": "Godan verbs change the final U-sound to E-sound + ば: 飲む → 飲めば."
        },
        {
          "q": "What does the natural conditional 〜と express in \"春になると、桜が 咲きます\"?",
          "options": [
            "An inevitable, natural, or automatic consequence (\"Whenever spring comes, cherry blossoms bloom\")",
            "A personal request or invitation",
            "A past regret"
          ],
          "answer": 0,
          "explanation": "Dictionary form + と expresses inevitable natural consequences, directions, or mechanical triggers."
        },
        {
          "q": "Why can you NOT use 〜と for requests like \"雨が降ると、傘を貸してください\"?",
          "options": [
            "Because 〜と cannot be followed by speaker intentions, requests, or commands.",
            "Because 雨 is a weather word.",
            "Because 傘 is a noun."
          ],
          "answer": 0,
          "explanation": "Clauses with 〜と cannot end in requests, permissions, or invitations; 〜たら must be used instead."
        },
        {
          "q": "How do you say \"If it rains tomorrow, I will stay home\" using 〜たら?",
          "options": [
            "明日、雨が 降ったら、家に います。",
            "明日、雨が 降ると、家に います。",
            "明日、雨が 降れば、家に いてください。"
          ],
          "answer": 0,
          "explanation": "降ったら (if it rains) is the standard conditional for future contingencies."
        },
        {
          "q": "What does the temple sign 拝観料 (はいかんりょう) mean at a Kyoto shrine or temple?",
          "options": [
            "Admission / Viewing Fee",
            "Exit gate",
            "Rest area",
            "Souvenir shop"
          ],
          "answer": 0,
          "explanation": "拝観 (visiting/worshipping) + 料 (fee) = temple admission fee."
        },
        {
          "q": "What is the \"Ba\" conditional form of the Ichidan verb 食べる (to eat)?",
          "options": [
            "食べれば (tabereba)",
            "食べたら",
            "食べるなら",
            "食べると"
          ],
          "answer": 0,
          "explanation": "Ichidan verbs replace る with れば: 食べる → 食べれば."
        },
        {
          "q": "What is the \"Ba\" conditional form of the irregular verb する (to do)?",
          "options": [
            "すれば (sureba)",
            "したら",
            "するなら",
            "すると"
          ],
          "answer": 0,
          "explanation": "する irregular conditional is すれば."
        },
        {
          "q": "What is the \"Ba\" conditional form of the irregular verb 来る (くる / to come)?",
          "options": [
            "来れば (くれば / kureba)",
            "きたら",
            "くるなら",
            "くると"
          ],
          "answer": 0,
          "explanation": "来る conditional is 来れば (くれば)."
        },
        {
          "q": "How do you form the negative conditional \"if you do not go\" with 〜なければ?",
          "options": [
            "行かなければ (ikanakereba)",
            "行かないなら",
            "行かないと",
            "行かなかったら"
          ],
          "answer": 0,
          "explanation": "ない drops い and adds ければ: 行かない → 行かなければ."
        },
        {
          "q": "What does the Kyoto station sign 烏丸口 (からすまぐち) indicate?",
          "options": [
            "Karasuma Exit (North exit of Kyoto Station)",
            "Ticket gate",
            "Shinkansen transfer",
            "Bus terminal"
          ],
          "answer": 0,
          "explanation": "口 (くち/ぐち) indicates a specific entrance or exit gate of a station."
        },
        {
          "q": "What does \"安ければ、買います\" mean?",
          "options": [
            "If it is cheap, I will buy it.",
            "It is expensive so I will buy it.",
            "I bought it cheaply."
          ],
          "answer": 0,
          "explanation": "I-adjectives form the ba-conditional by replacing い with ければ (安い → 安ければ)."
        },
        {
          "q": "What does \"静かなら、ここで 勉強します\" mean?",
          "options": [
            "If it is quiet, I will study here.",
            "It is noisy here.",
            "I cannot study here."
          ],
          "answer": 0,
          "explanation": "Na-adjectives attach なら directly for conditional meaning."
        },
        {
          "q": "What does the temple sign 撮影禁止 (さつえいきんし) strictly mandate?",
          "options": [
            "Photography strictly prohibited",
            "Shoes off",
            "Silence please",
            "No smoking"
          ],
          "answer": 0,
          "explanation": "撮影 (photography) + 禁止 (prohibition) = No photography."
        },
        {
          "q": "What is the difference between 〜たら and 〜ば in formality and everyday speech?",
          "options": [
            "〜たら is ubiquitous in conversation; 〜ば sounds slightly more formal or hypothetical.",
            "〜ば is only for children.",
            "There is no difference in tone."
          ],
          "answer": 0,
          "explanation": "〜たら is the most common conversational conditional; 〜ば is more formal and literary."
        },
        {
          "q": "What does 土足厳禁 (どそくげんきん) mean at a traditional ryokan or temple hall?",
          "options": [
            "Outdoor shoes strictly prohibited (remove shoes)",
            "Quiet please",
            "No luggage",
            "Do not enter"
          ],
          "answer": 0,
          "explanation": "土足 (outdoor footwear) + 厳禁 (strictly forbidden)."
        },
        {
          "q": "In the story of Urashima Taro, what did the underwater princess give him?",
          "options": [
            "Tamatebako (玉手箱 - Jewel Box)",
            "A magic sword",
            "A golden coin",
            "A wooden flute"
          ],
          "answer": 0,
          "explanation": "Otohime gave Taro the forbidden 玉手箱 (Tamatebako)."
        },
        {
          "q": "Fill in the blank: 右へ 曲がる（　）、郵便局が あります。 (\"Turn right, and you will see the post office.\")",
          "options": [
            "と",
            "たら",
            "なら",
            "ば"
          ],
          "answer": 0,
          "explanation": "〜と is standard for spatial directions leading inevitably to a landmark."
        },
        {
          "q": "What kanji means \"temple\" in 金閣寺 (きんかくじ) and 清水寺 (きよみずでら)?",
          "options": [
            "寺 (ji / tera)",
            "神",
            "社",
            "古"
          ],
          "answer": 0,
          "explanation": "寺 represents Buddhist temples (お寺 / 〜寺)."
        },
        {
          "q": "What does \"時間が あれば、お茶を 飲みましょう\" suggest?",
          "options": [
            "If we have time, let's drink tea.",
            "We have no time for tea.",
            "Tea takes too much time."
          ],
          "answer": 0,
          "explanation": "あれば is the conditional of ある (if there is time)."
        },
        {
          "q": "What does the sign 順路 (じゅんろ) indicate along a temple garden tour?",
          "options": [
            "Recommended tour route / Follow this path",
            "Exit only",
            "Restroom",
            "Ticket office"
          ],
          "answer": 0,
          "explanation": "順路 indicates the designated touring route."
        },
        {
          "q": "Which kanji means \"ancient / old\" in 古都 (こと / ancient capital)?",
          "options": [
            "古",
            "新",
            "今",
            "白"
          ],
          "answer": 0,
          "explanation": "古 (ふるい / コ) means old or ancient."
        },
        {
          "q": "What conditional is best when responding: \"パソコンを 買いたいです。\" → \"パソコンを 買う（　）、秋葉原がいいですよ。\"?",
          "options": [
            "なら",
            "と",
            "ても",
            "ば"
          ],
          "answer": 0,
          "explanation": "〜なら takes the speaker's stated topic and offers targeted advice."
        },
        {
          "q": "What does \"雨が 降っても、行きます\" mean with 〜ても?",
          "options": [
            "Even if it rains, I will go.",
            "If it rains, I will not go.",
            "Because it rained, I went."
          ],
          "answer": 0,
          "explanation": "〜ても expresses the concession \"even if ...\"."
        }
      ],
      "phases": [
        {
          "phase": 1,
          "name": "Opening Stance",
          "nameJp": "第一形態：構え (Calm Stance)",
          "hpThreshold": 100,
          "dialogue": "「さあ、お手並み拝見といこうか。」 (Show me what you have learned!)",
          "themeColor": "#38bdf8"
        },
        {
          "phase": 2,
          "name": "Enraged Awakening",
          "nameJp": "第二形態：激昂 (Enraged Phase)",
          "hpThreshold": 66,
          "dialogue": "「なかなかやるな…だがここからが本気だ！」 (Impressive... but now I get serious!)",
          "themeColor": "#f59e0b"
        },
        {
          "phase": 3,
          "name": "Desperation Climax",
          "nameJp": "最終形態：極限奥義 (Desperation Climax)",
          "hpThreshold": 33,
          "dialogue": "「これで終わりだ！渾身の一撃を受けよ！」 (This is the end! Withstand my ultimate attack!)",
          "themeColor": "#ef4444"
        }
      ]
    }
  },
  {
    "sagaNumber": 9,
    "id": "saga-9",
    "title": "Saga 9: Osaka Street Food & Hospitality",
    "titleJp": "第9章：授受表現と使役準備",
    "theme": "Master Japanese favor exchanges (あげる・もらう・くれる) and dining tablet operations in Osaka.",
    "badge": "🐙 Dotonbori Iron Gourmet",
    "unlockThresholdScore": 70,
    "stages": [
      {
        "id": "s9-1",
        "stageNumber": 1,
        "title": "Giving and Receiving Verbs (あげる・もらう・くれる)",
        "titleJp": "授受動詞の視点マスター",
        "icon": "🎁",
        "category": "Grammar",
        "description": "Master Japanese favor-giving and gratitude nuances that define natural communication.",
        "targetRoute": "/grammar/g10",
        "actionPrompt": "Study Giving & Receiving →",
        "targetCategory": "Grammar"
      },
      {
        "id": "s9-2",
        "stageNumber": 2,
        "title": "Digital Touchscreen Izakaya Simulator",
        "titleJp": "居酒屋タッチパネル注文シミュレーター",
        "icon": "🏮",
        "category": "Immersion",
        "description": "Place multi-dish orders with tare/shio seasonings and split bills accurately.",
        "targetRoute": "/signs?tab=izakaya",
        "actionPrompt": "Order on Izakaya Tablet →",
        "targetCategory": "Immersion"
      },
      {
        "id": "s9-3",
        "stageNumber": 3,
        "title": "Street Food, Dining & Hospitality Kanji (食・飲・肉・魚・店)",
        "titleJp": "飲食と接客の漢字",
        "icon": "🍢",
        "category": "Kanji",
        "description": "Recognize food ingredients and restaurant terms on menus across Osaka.",
        "targetRoute": "/kanji-dojo",
        "actionPrompt": "Drill Dining Kanji →",
        "targetItems": [
          "食",
          "飲",
          "肉",
          "魚",
          "店"
        ]
      },
      {
        "id": "s9-4",
        "stageNumber": 4,
        "title": "Daily Life Story: Working the Conbini (コンビニの仕事)",
        "titleJp": "コンビニの仕事",
        "icon": "🏪",
        "category": "Immersion",
        "description": "Experience late-night Japanese convenience store banter and transactions.",
        "targetRoute": "/stories/ch22-conbini-job",
        "actionPrompt": "Read Conbini Story →",
        "targetCategory": "Immersion"
      }
    ],
    "boss": {
      "title": "Gatekeeper Boss: Osaka Dotonbori Iron Chef (道頓堀の鉄板料理長)",
      "description": "Survive the fierce kitchen banter of the Dotonbori Master by pinpointing giver-recipient perspectives and authentic culinary vocabulary.",
      "minPassScore": 7,
      "questions": [
        {
          "q": "Which verb expresses giving when YOU or your in-group gives something to an OUTSIDER?",
          "options": [
            "あげる (ageru)",
            "くれる (kureru)",
            "もらう (morau)",
            "いただく"
          ],
          "answer": 0,
          "explanation": "あげる is giving outwards (from speaker or in-group to others)."
        },
        {
          "q": "Which verb expresses giving when SOMEONE ELSE gives something to YOU or your in-group?",
          "options": [
            "くれる (kureru)",
            "あげる (ageru)",
            "もらう (morau)",
            "やる"
          ],
          "answer": 0,
          "explanation": "くれる expresses an outsider giving towards the speaker (\"gave to me\"). \"私にあげる\" is an error!"
        },
        {
          "q": "Which verb expresses RECEIVING something from someone else?",
          "options": [
            "もらう (morau)",
            "あげる",
            "くれる",
            "さしあげる"
          ],
          "answer": 0,
          "explanation": "もらう expresses receiving (marked by に or から: 友達にもらった)."
        },
        {
          "q": "What does \"田中さんが 私に 本を くれました\" mean?",
          "options": [
            "Tanaka-san gave me a book.",
            "I gave Tanaka-san a book.",
            "I received Tanaka-san from a book."
          ],
          "answer": 0,
          "explanation": "くれた shows Tanaka gave to the speaker (私に)."
        },
        {
          "q": "Why is the sentence \"私は 友達に プレセントを くれました\" grammatically incorrect?",
          "options": [
            "Because くれる can only be used when someone gives TO the speaker, not when the speaker gives to others.",
            "Because プレゼント is in katakana.",
            "Because 友達 requires particle と."
          ],
          "answer": 0,
          "explanation": "Speaker giving to a friend must use あげました, never くれました."
        },
        {
          "q": "What does the auxiliary pattern 〜てくれる mean in \"友達が 宿題を 手伝ってくれました\"?",
          "options": [
            "My friend kindly helped me with homework (benefiting me).",
            "I forced my friend to do homework.",
            "My friend gave me their homework."
          ],
          "answer": 0,
          "explanation": "〜てくれる indicates someone did a favor for the speaker out of goodwill."
        },
        {
          "q": "What does 〜てもらう express in \"先生に 日本語を 教えてもらいました\"?",
          "options": [
            "I had the teacher teach me Japanese (I received the favor of teaching).",
            "I taught the teacher Japanese.",
            "The teacher asked me to teach."
          ],
          "answer": 0,
          "explanation": "[Recipient] は [Giver] に 〜てもらう expresses receiving a favor."
        },
        {
          "q": "What does the Izakaya tablet option 割り勘 (わりかん) do?",
          "options": [
            "Splits the bill evenly among all diners",
            "Calls the waiter",
            "Orders free water",
            "Cancels the order"
          ],
          "answer": 0,
          "explanation": "割り勘 (split-the-bill calculation) is a staple feature of izakaya tablets."
        },
        {
          "q": "What does the dining term お会計 (おかいけい) mean?",
          "options": [
            "The bill / check",
            "The chef's recommendation",
            "Free refill",
            "Dessert menu"
          ],
          "answer": 0,
          "explanation": "お会計 (おかいけい) or お勘定 (おかんじょう) means the bill/check."
        },
        {
          "q": "What seasoning option does タレ (tare) specify for yakitori skewers?",
          "options": [
            "Sweet savory soy-glaze sauce",
            "Plain salt (塩 / shio)",
            "Spicy mustard",
            "Mayonnaise"
          ],
          "answer": 0,
          "explanation": "タレ is the rich soy-mirin sweet glaze, contrasted with 塩 (shio / salt)."
        }
      ],
      "questionPool": [
        {
          "q": "Which verb expresses giving when YOU or your in-group gives something to an OUTSIDER?",
          "options": [
            "あげる (ageru)",
            "くれる (kureru)",
            "もらう (morau)",
            "いただく"
          ],
          "answer": 0,
          "explanation": "あげる is giving outwards (from speaker or in-group to others)."
        },
        {
          "q": "Which verb expresses giving when SOMEONE ELSE gives something to YOU or your in-group?",
          "options": [
            "くれる (kureru)",
            "あげる (ageru)",
            "もらう (morau)",
            "やる"
          ],
          "answer": 0,
          "explanation": "くれる expresses an outsider giving towards the speaker (\"gave to me\"). \"私にあげる\" is an error!"
        },
        {
          "q": "Which verb expresses RECEIVING something from someone else?",
          "options": [
            "もらう (morau)",
            "あげる",
            "くれる",
            "さしあげる"
          ],
          "answer": 0,
          "explanation": "もらう expresses receiving (marked by に or から: 友達にもらった)."
        },
        {
          "q": "What does \"田中さんが 私に 本を くれました\" mean?",
          "options": [
            "Tanaka-san gave me a book.",
            "I gave Tanaka-san a book.",
            "I received Tanaka-san from a book."
          ],
          "answer": 0,
          "explanation": "くれた shows Tanaka gave to the speaker (私に)."
        },
        {
          "q": "Why is the sentence \"私は 友達に プレセントを くれました\" grammatically incorrect?",
          "options": [
            "Because くれる can only be used when someone gives TO the speaker, not when the speaker gives to others.",
            "Because プレゼント is in katakana.",
            "Because 友達 requires particle と."
          ],
          "answer": 0,
          "explanation": "Speaker giving to a friend must use あげました, never くれました."
        },
        {
          "q": "What does the auxiliary pattern 〜てくれる mean in \"友達が 宿題を 手伝ってくれました\"?",
          "options": [
            "My friend kindly helped me with homework (benefiting me).",
            "I forced my friend to do homework.",
            "My friend gave me their homework."
          ],
          "answer": 0,
          "explanation": "〜てくれる indicates someone did a favor for the speaker out of goodwill."
        },
        {
          "q": "What does 〜てもらう express in \"先生に 日本語を 教えてもらいました\"?",
          "options": [
            "I had the teacher teach me Japanese (I received the favor of teaching).",
            "I taught the teacher Japanese.",
            "The teacher asked me to teach."
          ],
          "answer": 0,
          "explanation": "[Recipient] は [Giver] に 〜てもらう expresses receiving a favor."
        },
        {
          "q": "What does the Izakaya tablet option 割り勘 (わりかん) do?",
          "options": [
            "Splits the bill evenly among all diners",
            "Calls the waiter",
            "Orders free water",
            "Cancels the order"
          ],
          "answer": 0,
          "explanation": "割り勘 (split-the-bill calculation) is a staple feature of izakaya tablets."
        },
        {
          "q": "What does the dining term お会計 (おかいけい) mean?",
          "options": [
            "The bill / check",
            "The chef's recommendation",
            "Free refill",
            "Dessert menu"
          ],
          "answer": 0,
          "explanation": "お会計 (おかいけい) or お勘定 (おかんじょう) means the bill/check."
        },
        {
          "q": "What seasoning option does タレ (tare) specify for yakitori skewers?",
          "options": [
            "Sweet savory soy-glaze sauce",
            "Plain salt (塩 / shio)",
            "Spicy mustard",
            "Mayonnaise"
          ],
          "answer": 0,
          "explanation": "タレ is the rich soy-mirin sweet glaze, contrasted with 塩 (shio / salt)."
        },
        {
          "q": "What does \"お水（お冷や）を お願いします\" request at a restaurant?",
          "options": [
            "Cold drinking water, please.",
            "Hot tea, please.",
            "More chopsticks, please."
          ],
          "answer": 0,
          "explanation": "お冷や (おひや) is cold drinking water provided free at dining tables."
        },
        {
          "q": "How do you say \"I will teach you Japanese\" politely using giving favor 〜てあげる?",
          "options": [
            "日本語を 教えてあげます。",
            "日本語を 教えてくれます。",
            "日本語を 教えてもらいます。"
          ],
          "answer": 0,
          "explanation": "〜てあげる expresses doing a favor for someone else (use with care to avoid sounding condescending)."
        },
        {
          "q": "Which kanji means \"meat\" in 焼肉 (やきにく) and 鳥肉 (とりにく)?",
          "options": [
            "肉 (niku)",
            "魚",
            "酒",
            "食"
          ],
          "answer": 0,
          "explanation": "肉 (にく) means meat."
        },
        {
          "q": "Which kanji means \"fish\" in 刺身 (さしみ) and 鮮魚 (せんぎょ)?",
          "options": [
            "魚 (sakana / gyo)",
            "肉",
            "飲",
            "店"
          ],
          "answer": 0,
          "explanation": "魚 (さかな) means fish."
        },
        {
          "q": "What does the Osaka street food term たこ焼き (たこやき) contain?",
          "options": [
            "Octopus pieces inside fried batter balls",
            "Squid tentacles",
            "Crab claws",
            "Eel skewers"
          ],
          "answer": 0,
          "explanation": "タコ (octopus) + 焼き (grilled/fried) = octopus balls."
        },
        {
          "q": "What does \"おかわり自由 (おかわりじゆう)\" mean on a restaurant menu?",
          "options": [
            "Free refills (rice/soup/water)",
            "No refills allowed",
            "Fixed price meal",
            "Reservations only"
          ],
          "answer": 0,
          "explanation": "おかわり (refill) + 自由 (free/unlimited)."
        },
        {
          "q": "What is the humble counterpart of もらう when receiving from a superior or teacher?",
          "options": [
            "いただく (itadaku)",
            "さしあげる",
            "くださる",
            "やる"
          ],
          "answer": 0,
          "explanation": "いただく is the humble (Kenjougo) equivalent of もらう."
        },
        {
          "q": "What is the honorific counterpart of くれる when a superior gives to you?",
          "options": [
            "くださる (kudasaru)",
            "いただく",
            "さしあげる",
            "やる"
          ],
          "answer": 0,
          "explanation": "くださる is the honorific (Sonkeigo) equivalent of くれる."
        },
        {
          "q": "Fill in the blank: 誕生日に 母（　）時計を もらいました。 (\"I received a watch from my mother.\")",
          "options": [
            "に (or から)",
            "を",
            "で",
            "へ"
          ],
          "answer": 0,
          "explanation": "The giver with もらう is marked with に or から."
        },
        {
          "q": "What does the izakaya term 突き出し (つきだし) / お通し (おとおし) refer to?",
          "options": [
            "Small compulsory appetizer served with the first drink (table charge)",
            "The final bill",
            "Free water",
            "A tooth pick"
          ],
          "answer": 0,
          "explanation": "お通し is the automatic starter appetizer serving as a cover charge in Japanese pubs."
        },
        {
          "q": "What does the drink option 生中 (なまちゅう) order at an izakaya?",
          "options": [
            "Medium mug of draft beer",
            "Medium green tea",
            "Medium raw milk",
            "Medium sake flask"
          ],
          "answer": 0,
          "explanation": "生中 is short for 生ビール 中ジョッキ (draft beer, medium mug)."
        },
        {
          "q": "What does \"ごちそうさまでした\" express after finishing a meal?",
          "options": [
            "Gratitude to the host/chef for the feast",
            "Before-eating prayer",
            "Asking for the check",
            "Greeting a waiter"
          ],
          "answer": 0,
          "explanation": "ごちそうさまでした is said after dining to thank the chef and ingredients."
        },
        {
          "q": "What does \"〜ていただけませんか\" express when speaking to a stranger or teacher?",
          "options": [
            "A very polite request: \"Could you kindly do ... for me?\"",
            "A polite refusal",
            "A past apology"
          ],
          "answer": 0,
          "explanation": "〜ていただけませんか is the premier polite request formula in N4."
        },
        {
          "q": "Which kanji represents an alcohol or liquor shop in 居酒屋 and 酒屋?",
          "options": [
            "酒 (sake / shu)",
            "店",
            "茶",
            "湯"
          ],
          "answer": 0,
          "explanation": "酒 (さけ / シュ) means sake / liquor."
        },
        {
          "q": "What does the restaurant sign 満席 (まんせき) mean at peak dinner hours?",
          "options": [
            "All tables full / No vacancy",
            "Open for business",
            "Half price drinks",
            "Smoking allowed"
          ],
          "answer": 0,
          "explanation": "満 (full) + 席 (seats) = full house / no tables."
        }
      ],
      "phases": [
        {
          "phase": 1,
          "name": "Opening Stance",
          "nameJp": "第一形態：構え (Calm Stance)",
          "hpThreshold": 100,
          "dialogue": "「さあ、お手並み拝見といこうか。」 (Show me what you have learned!)",
          "themeColor": "#38bdf8"
        },
        {
          "phase": 2,
          "name": "Enraged Awakening",
          "nameJp": "第二形態：激昂 (Enraged Phase)",
          "hpThreshold": 66,
          "dialogue": "「なかなかやるな…だがここからが本気だ！」 (Impressive... but now I get serious!)",
          "themeColor": "#f59e0b"
        },
        {
          "phase": 3,
          "name": "Desperation Climax",
          "nameJp": "最終形態：極限奥義 (Desperation Climax)",
          "hpThreshold": 33,
          "dialogue": "「これで終わりだ！渾身の一撃を受けよ！」 (This is the end! Withstand my ultimate attack!)",
          "themeColor": "#ef4444"
        }
      ]
    }
  },
  {
    "sagaNumber": 10,
    "id": "saga-10",
    "title": "Saga 10: The Corporate Citadel",
    "titleJp": "第10章：敬語とビジネスの基礎",
    "theme": "Ascend the skyscrapers of Marunouchi through mastery of Keigo honorifics and workplace protocol.",
    "badge": "👔 Corporate Executive Diplomat",
    "unlockThresholdScore": 70,
    "stages": [
      {
        "id": "s10-1",
        "stageNumber": 1,
        "title": "Keigo Fundamentals: Sonkeigo & Kenjougo (尊敬語と謙譲語)",
        "titleJp": "敬語体系の基礎道場",
        "icon": "🏛️",
        "category": "Grammar",
        "description": "Learn to honor your counterpart and humble your own actions in professional settings.",
        "targetRoute": "/grammar/g11",
        "actionPrompt": "Learn Polite Keigo →",
        "targetCategory": "Grammar"
      },
      {
        "id": "s10-2",
        "stageNumber": 2,
        "title": "Transit & Train Ticket Kiosk Simulator",
        "titleJp": "鉄道券売機・ICチャージシミュレーター",
        "icon": "🚆",
        "category": "Immersion",
        "description": "Recharge Suica IC cards and purchase distance fare zone tickets.",
        "targetRoute": "/signs?tab=kiosk",
        "actionPrompt": "Use Transit Kiosk →",
        "targetCategory": "Immersion"
      },
      {
        "id": "s10-3",
        "stageNumber": 3,
        "title": "Business, Company & Workplace Kanji (会・社・員・仕・事)",
        "titleJp": "職場と役職の漢字",
        "icon": "🏢",
        "category": "Kanji",
        "description": "Read corporate hierarchy and business document terms.",
        "targetRoute": "/kanji-dojo",
        "actionPrompt": "Study Office Kanji →",
        "targetItems": [
          "会",
          "社",
          "員",
          "仕",
          "事"
        ]
      },
      {
        "id": "s10-4",
        "stageNumber": 4,
        "title": "Conbini Cashier & Customer Service Simulator",
        "titleJp": "コンビニ接客と敬語対応シミュレーター",
        "icon": "🏪",
        "category": "Immersion",
        "description": "Respond to polite cashier questions about point cards, bento warming, and receipts.",
        "targetRoute": "/signs?tab=conbini",
        "actionPrompt": "Work Conbini POS Register →",
        "targetCategory": "Immersion"
      }
    ],
    "boss": {
      "title": "Gatekeeper Boss: Marunouchi Executive Director (丸の内の専務取締役)",
      "description": "Enter the boardroom of a Tokyo conglomerate and prove you can converse fluently in both honorific and humble registers without confusing subject roles.",
      "minPassScore": 7,
      "questions": [
        {
          "q": "What is Keigo (敬語) in the Japanese language system?",
          "options": [
            "The formal honorific speech system encompassing Sonkeigo, Kenjougo, and Teineigo",
            "Tokyo slang",
            "Ancient poetic grammar",
            "Dialect of Osaka"
          ],
          "answer": 0,
          "explanation": "敬語 (Keigo) is the honorific language system reflecting social distance and respect."
        },
        {
          "q": "What is Sonkeigo (尊敬語)?",
          "options": [
            "Respectful language elevating the actions of the listener, customer, or superior",
            "Humble language lowering yourself",
            "Casual speech"
          ],
          "answer": 0,
          "explanation": "尊敬語 (Sonkeigo) honors and elevates the counterpart's actions."
        },
        {
          "q": "What is Kenjougo (謙譲語)?",
          "options": [
            "Humble language lowering the speaker's own actions to show modesty and respect",
            "Elevating the listener",
            "Speaking loudly"
          ],
          "answer": 0,
          "explanation": "謙譲語 (Kenjougo) humbles the speaker's actions relative to the other person."
        },
        {
          "q": "What is the honorific (Sonkeigo) equivalent of the verb 行く / 来る / いる?",
          "options": [
            "いらっしゃる (irassharu)",
            "参る (mairu)",
            "おっしゃる",
            "なさる"
          ],
          "answer": 0,
          "explanation": "いらっしゃる is the respectful verb for a superior going, coming, or being present."
        },
        {
          "q": "What is the humble (Kenjougo) equivalent of 行く / 来る when referring to YOUR OWN movement?",
          "options": [
            "参る (まいる / mairu)",
            "いらっしゃる",
            "申す",
            "いたす"
          ],
          "answer": 0,
          "explanation": "参ります (まいります) humbles the speaker's own arrival or departure."
        },
        {
          "q": "What is the honorific (Sonkeigo) verb for 見る (to see / view)?",
          "options": [
            "ご覧になる (ごらんに なる)",
            "拝見する (はいけん する)",
            "見せる",
            "見られます"
          ],
          "answer": 0,
          "explanation": "お客様がご覧になります (The customer views/looks)."
        },
        {
          "q": "What is the humble (Kenjougo) verb for 見る when looking at a document or portfolio?",
          "options": [
            "拝見する (はいけん する)",
            "ご覧になる",
            "見せる",
            "見ます"
          ],
          "answer": 0,
          "explanation": "私が拝見します (I humbly view / take a look)."
        },
        {
          "q": "What is the honorific equivalent of 言う (to say)?",
          "options": [
            "おっしゃる (ossharu)",
            "申す (mousu)",
            "言われる",
            "申される"
          ],
          "answer": 0,
          "explanation": "社長がおっしゃいました (The company president said)."
        },
        {
          "q": "What is the humble equivalent of 言う when stating your own name or thoughts?",
          "options": [
            "申す (もうす / mousu)",
            "おっしゃる",
            "話す",
            "言う"
          ],
          "answer": 0,
          "explanation": "田中と申します (My name is Tanaka / I am called Tanaka)."
        },
        {
          "q": "What is the humble equivalent of する (to do)?",
          "options": [
            "いたす (itasu)",
            "なさる (nasaru)",
            "される",
            "おする"
          ],
          "answer": 0,
          "explanation": "よろしくお願いいたします uses いたす, the humble form of する."
        }
      ],
      "questionPool": [
        {
          "q": "What is Keigo (敬語) in the Japanese language system?",
          "options": [
            "The formal honorific speech system encompassing Sonkeigo, Kenjougo, and Teineigo",
            "Tokyo slang",
            "Ancient poetic grammar",
            "Dialect of Osaka"
          ],
          "answer": 0,
          "explanation": "敬語 (Keigo) is the honorific language system reflecting social distance and respect."
        },
        {
          "q": "What is Sonkeigo (尊敬語)?",
          "options": [
            "Respectful language elevating the actions of the listener, customer, or superior",
            "Humble language lowering yourself",
            "Casual speech"
          ],
          "answer": 0,
          "explanation": "尊敬語 (Sonkeigo) honors and elevates the counterpart's actions."
        },
        {
          "q": "What is Kenjougo (謙譲語)?",
          "options": [
            "Humble language lowering the speaker's own actions to show modesty and respect",
            "Elevating the listener",
            "Speaking loudly"
          ],
          "answer": 0,
          "explanation": "謙譲語 (Kenjougo) humbles the speaker's actions relative to the other person."
        },
        {
          "q": "What is the honorific (Sonkeigo) equivalent of the verb 行く / 来る / いる?",
          "options": [
            "いらっしゃる (irassharu)",
            "参る (mairu)",
            "おっしゃる",
            "なさる"
          ],
          "answer": 0,
          "explanation": "いらっしゃる is the respectful verb for a superior going, coming, or being present."
        },
        {
          "q": "What is the humble (Kenjougo) equivalent of 行く / 来る when referring to YOUR OWN movement?",
          "options": [
            "参る (まいる / mairu)",
            "いらっしゃる",
            "申す",
            "いたす"
          ],
          "answer": 0,
          "explanation": "参ります (まいります) humbles the speaker's own arrival or departure."
        },
        {
          "q": "What is the honorific (Sonkeigo) verb for 見る (to see / view)?",
          "options": [
            "ご覧になる (ごらんに なる)",
            "拝見する (はいけん する)",
            "見せる",
            "見られます"
          ],
          "answer": 0,
          "explanation": "お客様がご覧になります (The customer views/looks)."
        },
        {
          "q": "What is the humble (Kenjougo) verb for 見る when looking at a document or portfolio?",
          "options": [
            "拝見する (はいけん する)",
            "ご覧になる",
            "見せる",
            "見ます"
          ],
          "answer": 0,
          "explanation": "私が拝見します (I humbly view / take a look)."
        },
        {
          "q": "What is the honorific equivalent of 言う (to say)?",
          "options": [
            "おっしゃる (ossharu)",
            "申す (mousu)",
            "言われる",
            "申される"
          ],
          "answer": 0,
          "explanation": "社長がおっしゃいました (The company president said)."
        },
        {
          "q": "What is the humble equivalent of 言う when stating your own name or thoughts?",
          "options": [
            "申す (もうす / mousu)",
            "おっしゃる",
            "話す",
            "言う"
          ],
          "answer": 0,
          "explanation": "田中と申します (My name is Tanaka / I am called Tanaka)."
        },
        {
          "q": "What is the humble equivalent of する (to do)?",
          "options": [
            "いたす (itasu)",
            "なさる (nasaru)",
            "される",
            "おする"
          ],
          "answer": 0,
          "explanation": "よろしくお願いいたします uses いたす, the humble form of する."
        },
        {
          "q": "What is the honorific equivalent of する when a customer performs an action?",
          "options": [
            "なさる (nasaru)",
            "いたす",
            "やる",
            "される"
          ],
          "answer": 0,
          "explanation": "何になさいますか (What will you decide on / do?)."
        },
        {
          "q": "What is the polite phrase said by hotel and shop staff: \"少々 お待ち（　）\"?",
          "options": [
            "ください (or くださいませ)",
            "なさい",
            "しましょう",
            "しろ"
          ],
          "answer": 0,
          "explanation": "少々お待ちください(ませ) = \"Please wait a brief moment.\""
        },
        {
          "q": "What does the train station ticket kiosk button 領収書 (りょうしゅうしょ) print?",
          "options": [
            "Formal business receipt for reimbursement",
            "Train schedule",
            "Luggage tag",
            "Suica card reload form"
          ],
          "answer": 0,
          "explanation": "領収書 is the official tax receipt required by Japanese companies."
        },
        {
          "q": "What does the kiosk option 乗り越し精算 (のりこしせいさん) mean?",
          "options": [
            "Fare adjustment (paying remaining fare when traveling past your ticket zone)",
            "Refund",
            "Lost ticket",
            "Seat change"
          ],
          "answer": 0,
          "explanation": "精算機 handles fare adjustments when your IC card or ticket lacks sufficient funds at exit gates."
        },
        {
          "q": "Which kanji means \"company employee\" in 会社員 (かいしゃいん)?",
          "options": [
            "員 (in)",
            "仕",
            "事",
            "会"
          ],
          "answer": 0,
          "explanation": "員 (member / employee) appears in 会社員, 店員, and 銀行員."
        },
        {
          "q": "What does \"お疲れ様でした (おつかれさまでした)\" signify in the Japanese workplace?",
          "options": [
            "Standard greeting thanking coworkers for their hard work, said when parting or finishing tasks",
            "Apologizing for being sick",
            "Asking for a promotion"
          ],
          "answer": 0,
          "explanation": "お疲れ様でした is the universal ritual acknowledgment of shared labor in Japanese companies."
        },
        {
          "q": "What is the honorific verb for 食べる / 飲む when offering food or drinks to guests?",
          "options": [
            "召し上がる (めしあがる)",
            "いただく",
            "飲む",
            "食べる"
          ],
          "answer": 0,
          "explanation": "どうぞ召し上がってください = \"Please eat / enjoy the meal.\""
        },
        {
          "q": "What is the humble verb for 食べる / 飲む when the speaker partakes?",
          "options": [
            "いただく (itadaku)",
            "召し上がる",
            "食べる",
            "なさる"
          ],
          "answer": 0,
          "explanation": "いただきます originates from いただく (to humbly partake)."
        },
        {
          "q": "What does \"かしこまりました\" communicate from a store clerk or hotel receptionist?",
          "options": [
            "\"Certainly / Right away, understood.\"",
            "\"I do not understand.\"",
            "\"Please wait outside.\"",
            "\"No thank you.\""
          ],
          "answer": 0,
          "explanation": "かしこまりました is the polished humble acknowledgement of a customer request."
        },
        {
          "q": "What is the humble counterpart of 知っている (to know)?",
          "options": [
            "存じております (ぞんじて おります)",
            "ご存知です",
            "知っています",
            "知りません"
          ],
          "answer": 0,
          "explanation": "はい、存じております (Yes, I humbly know / am aware)."
        },
        {
          "q": "What is the honorific counterpart of 知っている (to know)?",
          "options": [
            "ご存知です (ごぞんじです)",
            "存じております",
            "知っています",
            "存じます"
          ],
          "answer": 0,
          "explanation": "そのニュースをご存知ですか (Are you aware of that news?)."
        },
        {
          "q": "Which kanji combination means \"business trip\" in 出張 (しゅっちょう)?",
          "options": [
            "出張",
            "社員",
            "仕事",
            "会社"
          ],
          "answer": 0,
          "explanation": "出張 (しゅっちょう) = business trip."
        },
        {
          "q": "What does \"申し訳ございません (もうしわけ ございません)\" convey?",
          "options": [
            "\"I am deeply sorry / I offer my sincerest apologies.\"",
            "\"Thank you very much.\"",
            "\"You are welcome.\"",
            "\"Goodbye.\""
          ],
          "answer": 0,
          "explanation": "申し訳ございません is the highest formal standard business apology."
        },
        {
          "q": "What does the train station indicator 終電 (しゅうでん) warn passengers about?",
          "options": [
            "The last train of the night",
            "The first morning train",
            "Express train",
            "Freight train"
          ],
          "answer": 0,
          "explanation": "終 (end) + 電 (train) = last train of the night."
        },
        {
          "q": "What does the phrase \"お世話になっております (おせわに なっております)\" mean at the start of business emails?",
          "options": [
            "\"Thank you for your ongoing support / We appreciate your partnership.\"",
            "\"I am resigning from the company.\"",
            "\"Please send the invoice immediately.\""
          ],
          "answer": 0,
          "explanation": "お世話になっております is the mandatory opening pleasantry in Japanese business correspondence."
        }
      ],
      "phases": [
        {
          "phase": 1,
          "name": "Opening Stance",
          "nameJp": "第一形態：構え (Calm Stance)",
          "hpThreshold": 100,
          "dialogue": "「さあ、お手並み拝見といこうか。」 (Show me what you have learned!)",
          "themeColor": "#38bdf8"
        },
        {
          "phase": 2,
          "name": "Enraged Awakening",
          "nameJp": "第二形態：激昂 (Enraged Phase)",
          "hpThreshold": 66,
          "dialogue": "「なかなかやるな…だがここからが本気だ！」 (Impressive... but now I get serious!)",
          "themeColor": "#f59e0b"
        },
        {
          "phase": 3,
          "name": "Desperation Climax",
          "nameJp": "最終形態：極限奥義 (Desperation Climax)",
          "hpThreshold": 33,
          "dialogue": "「これで終わりだ！渾身の一撃を受けよ！」 (This is the end! Withstand my ultimate attack!)",
          "themeColor": "#ef4444"
        }
      ]
    }
  },
  {
    "sagaNumber": 11,
    "id": "saga-11",
    "title": "Saga 11: Dramatic Encounters",
    "titleJp": "第11章：受身形と使役形",
    "theme": "Untangle the dramatic threads of passive adversity (受身) and causative agency (使役).",
    "badge": "🎭 Kabuki Theater Virtuoso",
    "unlockThresholdScore": 70,
    "stages": [
      {
        "id": "s11-1",
        "stageNumber": 1,
        "title": "Passive Voice Verbs (受身形: 褒められる・踏まれる・叱られる)",
        "titleJp": "受身形・迷惑の受身特訓",
        "icon": "🛡️",
        "category": "Conjugation",
        "description": "Express direct passive and indirect \"suffering passive\" (迷惑の受身).",
        "targetRoute": "/conjugate?tab=conjugate",
        "actionPrompt": "Conjugate Passive Forms →",
        "targetTab": "conjugate"
      },
      {
        "id": "s11-2",
        "stageNumber": 2,
        "title": "Causative Voice Verbs (使役形: 食べさせる・待たせる・行かせる)",
        "titleJp": "使役形・許可と指示の表現",
        "icon": "⚡",
        "category": "Conjugation",
        "description": "Express making or letting someone perform an action.",
        "targetRoute": "/conjugate?tab=conjugate",
        "actionPrompt": "Conjugate Causative Forms →",
        "targetTab": "conjugate"
      },
      {
        "id": "s11-3",
        "stageNumber": 3,
        "title": "Emotional & Relational Kanji (心・思・知・言・話)",
        "titleJp": "心理と伝達の漢字",
        "icon": "💭",
        "category": "Kanji",
        "description": "Convey feelings, intentions, and interpersonal relations.",
        "targetRoute": "/kanji-dojo",
        "actionPrompt": "Drill Emotion Kanji →",
        "targetItems": [
          "心",
          "思",
          "知",
          "言",
          "話"
        ]
      },
      {
        "id": "s11-4",
        "stageNumber": 4,
        "title": "Mini-Mystery Story: The Temple Footprints (寺の足跡)",
        "titleJp": "短編推理：寺の足跡",
        "icon": "🔍",
        "category": "Immersion",
        "description": "Piece together clues using passive and causative deduction.",
        "targetRoute": "/stories/ch30-temple-footprints",
        "actionPrompt": "Investigate the Clues →",
        "targetCategory": "Immersion"
      }
    ],
    "boss": {
      "title": "Gatekeeper Boss: The Kabuki Master (歌舞伎座の百面相)",
      "description": "Face the dramatic performer who tests your mastery of who acts upon whom across complex passive, causative, and reciprocal sentences.",
      "minPassScore": 7,
      "questions": [
        {
          "q": "How is the passive voice (受身形) formed for Godan verbs like 叱る (しかる / to scold)?",
          "options": [
            "Shift final U-sound to A-sound + れる: 叱られる (shikarareru)",
            "Add られる to dictionary form",
            "Shift to E-sound + る",
            "Add させる"
          ],
          "answer": 0,
          "explanation": "Godan verbs shift to A-row + れる: 叱る → 叱られる (to be scolded)."
        },
        {
          "q": "How is the passive voice formed for Ichidan verbs like 褒める (ほめる / to praise)?",
          "options": [
            "Replace る with られる: 褒められる (homerareru)",
            "Replace る with させる",
            "Add れる to stem"
          ],
          "answer": 0,
          "explanation": "Ichidan verbs replace る with られる: 褒める → 褒められる (to be praised)."
        },
        {
          "q": "What is the passive form of the irregular verb する (to do)?",
          "options": [
            "される (sareru)",
            "すられる",
            "させられる",
            "しられる"
          ],
          "answer": 0,
          "explanation": "する irregular passive is される."
        },
        {
          "q": "What is the passive form of the irregular verb 来る (くる / to come)?",
          "options": [
            "来られる (こられる / korareru)",
            "きられる",
            "くられる",
            "こさせる"
          ],
          "answer": 0,
          "explanation": "来る passive is 来られる (こられる)."
        },
        {
          "q": "In passive sentences, which particle marks the AGENT (the person who did the action)?",
          "options": [
            "に (ni)",
            "を (o)",
            "で (de)",
            "へ (e)"
          ],
          "answer": 0,
          "explanation": "The agent performing the action upon the subject is marked with に (先生に叱られた)."
        },
        {
          "q": "What does the \"suffering passive\" (迷惑の受身) express in \"雨に降られました\"?",
          "options": [
            "I was rained upon / adversely affected by the rain.",
            "I made the rain fall.",
            "The rain was praised."
          ],
          "answer": 0,
          "explanation": "Japanese uses intransitive verbs in passive voice to express distress or adversity caused by an uncontrollable event."
        },
        {
          "q": "What does \"電車で 足を 踏まれました\" mean?",
          "options": [
            "My foot was stepped on in the train (someone stepped on my foot).",
            "I stepped on someone's foot.",
            "My foot hurts from walking."
          ],
          "answer": 0,
          "explanation": "踏む (to step on) → 踏まれる (passive: to have one's foot stepped on)."
        },
        {
          "q": "How is the CAUSATIVE form (使役形) formed for Godan verbs like 待つ (to wait)?",
          "options": [
            "Shift final U-sound to A-sound + せる: 待たせる (mataseru)",
            "Add られる",
            "Shift to E-sound + せる"
          ],
          "answer": 0,
          "explanation": "Godan causative shifts to A-row + せる: 待つ → 待たせる (to make/let someone wait)."
        },
        {
          "q": "How is the causative form formed for Ichidan verbs like 食べる (to eat)?",
          "options": [
            "Replace る with させる: 食べさせる (tabesaseru)",
            "食べられる",
            "食べす",
            "食べれる"
          ],
          "answer": 0,
          "explanation": "Ichidan causative replaces る with させる: 食べる → 食べさせる (to make/let someone eat)."
        },
        {
          "q": "What does \"先生は 生徒に 漢字を 書かせました\" express?",
          "options": [
            "The teacher made / let the students write kanji.",
            "The students made the teacher write kanji.",
            "The teacher wrote kanji for the students."
          ],
          "answer": 0,
          "explanation": "Causative (書かせた) indicates the teacher caused the students to write."
        }
      ],
      "questionPool": [
        {
          "q": "How is the passive voice (受身形) formed for Godan verbs like 叱る (しかる / to scold)?",
          "options": [
            "Shift final U-sound to A-sound + れる: 叱られる (shikarareru)",
            "Add られる to dictionary form",
            "Shift to E-sound + る",
            "Add させる"
          ],
          "answer": 0,
          "explanation": "Godan verbs shift to A-row + れる: 叱る → 叱られる (to be scolded)."
        },
        {
          "q": "How is the passive voice formed for Ichidan verbs like 褒める (ほめる / to praise)?",
          "options": [
            "Replace る with られる: 褒められる (homerareru)",
            "Replace る with させる",
            "Add れる to stem"
          ],
          "answer": 0,
          "explanation": "Ichidan verbs replace る with られる: 褒める → 褒められる (to be praised)."
        },
        {
          "q": "What is the passive form of the irregular verb する (to do)?",
          "options": [
            "される (sareru)",
            "すられる",
            "させられる",
            "しられる"
          ],
          "answer": 0,
          "explanation": "する irregular passive is される."
        },
        {
          "q": "What is the passive form of the irregular verb 来る (くる / to come)?",
          "options": [
            "来られる (こられる / korareru)",
            "きられる",
            "くられる",
            "こさせる"
          ],
          "answer": 0,
          "explanation": "来る passive is 来られる (こられる)."
        },
        {
          "q": "In passive sentences, which particle marks the AGENT (the person who did the action)?",
          "options": [
            "に (ni)",
            "を (o)",
            "で (de)",
            "へ (e)"
          ],
          "answer": 0,
          "explanation": "The agent performing the action upon the subject is marked with に (先生に叱られた)."
        },
        {
          "q": "What does the \"suffering passive\" (迷惑の受身) express in \"雨に降られました\"?",
          "options": [
            "I was rained upon / adversely affected by the rain.",
            "I made the rain fall.",
            "The rain was praised."
          ],
          "answer": 0,
          "explanation": "Japanese uses intransitive verbs in passive voice to express distress or adversity caused by an uncontrollable event."
        },
        {
          "q": "What does \"電車で 足を 踏まれました\" mean?",
          "options": [
            "My foot was stepped on in the train (someone stepped on my foot).",
            "I stepped on someone's foot.",
            "My foot hurts from walking."
          ],
          "answer": 0,
          "explanation": "踏む (to step on) → 踏まれる (passive: to have one's foot stepped on)."
        },
        {
          "q": "How is the CAUSATIVE form (使役形) formed for Godan verbs like 待つ (to wait)?",
          "options": [
            "Shift final U-sound to A-sound + せる: 待たせる (mataseru)",
            "Add られる",
            "Shift to E-sound + せる"
          ],
          "answer": 0,
          "explanation": "Godan causative shifts to A-row + せる: 待つ → 待たせる (to make/let someone wait)."
        },
        {
          "q": "How is the causative form formed for Ichidan verbs like 食べる (to eat)?",
          "options": [
            "Replace る with させる: 食べさせる (tabesaseru)",
            "食べられる",
            "食べす",
            "食べれる"
          ],
          "answer": 0,
          "explanation": "Ichidan causative replaces る with させる: 食べる → 食べさせる (to make/let someone eat)."
        },
        {
          "q": "What does \"先生は 生徒に 漢字を 書かせました\" express?",
          "options": [
            "The teacher made / let the students write kanji.",
            "The students made the teacher write kanji.",
            "The teacher wrote kanji for the students."
          ],
          "answer": 0,
          "explanation": "Causative (書かせた) indicates the teacher caused the students to write."
        },
        {
          "q": "What is the causative form of the irregular verb する (to do)?",
          "options": [
            "させる (saseru)",
            "すらせる",
            "される",
            "しらせる"
          ],
          "answer": 0,
          "explanation": "する irregular causative is させる."
        },
        {
          "q": "What is the causative form of the irregular verb 来る (くる / to come)?",
          "options": [
            "来させる (こさせる / kosaseru)",
            "きさせる",
            "くらせる",
            "こられる"
          ],
          "answer": 0,
          "explanation": "来る causative is 来させる (こさせる)."
        },
        {
          "q": "What does \"遅くなって、待たせて すみません\" mean when arriving late for a rendezvous?",
          "options": [
            "\"Sorry for being late and making you wait.\"",
            "\"Thank you for waiting for me.\"",
            "\"I will not wait for you.\""
          ],
          "answer": 0,
          "explanation": "待たせる (to make wait) in te-form (待たせて) is the staple apology when arriving late."
        },
        {
          "q": "What does the causative request 〜させてください express in \"自己紹介を させてください\"?",
          "options": [
            "\"Please allow me to introduce myself.\"",
            "\"You must introduce me.\"",
            "\"Do not introduce yourself.\""
          ],
          "answer": 0,
          "explanation": "〜させてください is the humble polite request for permission (\"Please let me do ~\")."
        },
        {
          "q": "Which kanji means \"to praise\" in 褒める (ほめる)?",
          "options": [
            "褒",
            "叱",
            "踏",
            "驚"
          ],
          "answer": 0,
          "explanation": "褒 (ほめる) means to praise or compliment."
        },
        {
          "q": "What does \"泥棒に 財布を 盗まれました\" mean?",
          "options": [
            "My wallet was stolen by a thief.",
            "I stole a wallet from a thief.",
            "I gave my wallet to a thief."
          ],
          "answer": 0,
          "explanation": "盗む (to steal) → 盗まれる (passive: was stolen by someone)."
        },
        {
          "q": "Which kanji represents \"heart / feeling\" in 心配 (しんぱい) and 安心 (あんしん)?",
          "options": [
            "心 (kokoro / shin)",
            "思",
            "知",
            "言"
          ],
          "answer": 0,
          "explanation": "心 means heart, mind, or spirit."
        },
        {
          "q": "In the mystery story, the detective says \"犯人に 逃げられた！\" What does this convey?",
          "options": [
            "The criminal escaped on us (and we suffer the disappointment).",
            "We helped the criminal escape.",
            "The criminal was caught."
          ],
          "answer": 0,
          "explanation": "逃げられた is suffering passive of 逃げる (the criminal escaped, causing us grief)."
        },
        {
          "q": "How do you say \"Please let me think about it\" politely using causative?",
          "options": [
            "考えさせて ください。",
            "考えられて ください。",
            "考えて ください。"
          ],
          "answer": 0,
          "explanation": "考えさせる (make/let think) + てください = \"Please allow me to consider it.\""
        },
        {
          "q": "Which kanji means \"to know\" in 知っています (しっています)?",
          "options": [
            "知 (shiru / chi)",
            "思",
            "話",
            "言"
          ],
          "answer": 0,
          "explanation": "知 (しる) means to know or recognize."
        },
        {
          "q": "What is the passive form of the Godan verb 頼む (たのむ / to request)?",
          "options": [
            "頼まれる (たのまれる)",
            "頼まさせる",
            "頼まえる",
            "頼みられる"
          ],
          "answer": 0,
          "explanation": "頼む shifts to A-row: 頼まれる (to be asked/requested)."
        },
        {
          "q": "What is the causative form of the Godan verb 行く (いく / to go)?",
          "options": [
            "行かせる (いかせる)",
            "行かれる",
            "行かさせる",
            "行ける"
          ],
          "answer": 0,
          "explanation": "行く shifts to A-row: 行かせる (to make/let go)."
        },
        {
          "q": "What does \"子供に 野菜を 食べさせます\" mean?",
          "options": [
            "I make/let my child eat vegetables.",
            "My child makes me eat vegetables.",
            "Vegetables eat the child."
          ],
          "answer": 0,
          "explanation": "Causative 食べさせる with the child marked with に means having the child eat."
        },
        {
          "q": "What does \"犬に 手を 噛まれました (かまれました)\" mean?",
          "options": [
            "I had my hand bitten by a dog.",
            "I bit the dog's hand.",
            "The dog played with my hand."
          ],
          "answer": 0,
          "explanation": "噛む (to bite) → 噛まれる (passive: bitten by a dog)."
        },
        {
          "q": "What is the passive form of the verb 呼ぶ (よぶ / to call)?",
          "options": [
            "呼ばれる (よばれる)",
            "呼ばせる",
            "呼びられる",
            "呼べる"
          ],
          "answer": 0,
          "explanation": "呼ぶ shifts to A-row: 呼ばれる (to be called)."
        }
      ],
      "phases": [
        {
          "phase": 1,
          "name": "Opening Stance",
          "nameJp": "第一形態：構え (Calm Stance)",
          "hpThreshold": 100,
          "dialogue": "「さあ、お手並み拝見といこうか。」 (Show me what you have learned!)",
          "themeColor": "#38bdf8"
        },
        {
          "phase": 2,
          "name": "Enraged Awakening",
          "nameJp": "第二形態：激昂 (Enraged Phase)",
          "hpThreshold": 66,
          "dialogue": "「なかなかやるな…だがここからが本気だ！」 (Impressive... but now I get serious!)",
          "themeColor": "#f59e0b"
        },
        {
          "phase": 3,
          "name": "Desperation Climax",
          "nameJp": "最終形態：極限奥義 (Desperation Climax)",
          "hpThreshold": 33,
          "dialogue": "「これで終わりだ！渾身の一撃を受けよ！」 (This is the end! Withstand my ultimate attack!)",
          "themeColor": "#ef4444"
        }
      ]
    }
  },
  {
    "sagaNumber": 12,
    "id": "saga-12",
    "title": "Saga 12: N4 Summit Trial",
    "titleJp": "第12章：使役受身とN4総決算",
    "theme": "The pinnacle of the Zero-to-N4 Odyssey: Causative-Passive hybrid forms, Tokyo Pitch Accent, and the Grand N4 Exam.",
    "badge": "🐉 Dragon Grandmaster of N4",
    "unlockThresholdScore": 70,
    "stages": [
      {
        "id": "s12-1",
        "stageNumber": 1,
        "title": "Causative-Passive Forms (使役受身形: 待たされる・走らされる)",
        "titleJp": "最難関・使役受身形道場",
        "icon": "⚔️",
        "category": "Conjugation",
        "description": "Conquer the most demanding Japanese inflection: being forced to do something reluctantly.",
        "targetRoute": "/conjugate?tab=conjugate",
        "actionPrompt": "Master Causative-Passive →",
        "targetTab": "conjugate"
      },
      {
        "id": "s12-2",
        "stageNumber": 2,
        "title": "Tokyo Pitch Accent Contours & Minimal Pairs",
        "titleJp": "東京式アクセント聴解とSVG等高線",
        "icon": "🎧",
        "category": "Immersion",
        "description": "Master distinction between homophones using visual pitch contours.",
        "targetRoute": "/listening?tab=pitch",
        "actionPrompt": "Train Pitch Accent Contours →",
        "targetCategory": "Immersion",
        "targetTab": "pitch"
      },
      {
        "id": "s12-3",
        "stageNumber": 3,
        "title": "Full N4 Comprehensive Mock Exam",
        "titleJp": "JLPT N4本番総合模試",
        "icon": "📜",
        "category": "Grammar",
        "description": "Benchmark your mastery across all JLPT N5 and N4 sections.",
        "targetRoute": "/exam",
        "actionPrompt": "Take Full N4 Mock Exam →",
        "targetCategory": "Grammar"
      },
      {
        "id": "s12-4",
        "stageNumber": 4,
        "title": "Folklore Legend: The Tale of the Bamboo Cutter (竹取物語)",
        "titleJp": "大団円：竹取物語と月への帰還",
        "icon": "🌕",
        "category": "Immersion",
        "description": "Read the grand finale classic story in full Japanese.",
        "targetRoute": "/stories/ch13-kaguya",
        "actionPrompt": "Read Princess Kaguya →",
        "targetCategory": "Immersion"
      }
    ],
    "boss": {
      "title": "Final Gatekeeper: The Dragon of Mount Fuji (富士の白龍・N4大師範)",
      "description": "The ultimate boss trial: 10 procedural questions testing the entire breadth of N5 and N4 Japanese grammar, conjugations, vocabulary, and pitch accent.",
      "minPassScore": 7,
      "questions": [
        {
          "q": "What is the Causative-Passive (使役受身形) form of the Godan verb 待つ (まつ / to wait)?",
          "options": [
            "待たされる (matasareru)",
            "待たせられる",
            "待たされる / 待たせられる",
            "待たれる"
          ],
          "answer": 2,
          "explanation": "Godan verbs contract -asaserareru into -asareru: 待つ → 待たされる (forced to wait)."
        },
        {
          "q": "What does the causative-passive form express emotionally in Japanese?",
          "options": [
            "Being forced or coerced into doing an action reluctantly (\"I was made to do ... against my will\")",
            "Joyfully volunteering to help",
            "Polite invitation"
          ],
          "answer": 0,
          "explanation": "使役受身 conveys reluctance or grievance at being coerced into performing an action."
        },
        {
          "q": "What is the causative-passive form of the Ichidan verb 食べる (to eat)?",
          "options": [
            "食べさせられる (tabesaserareru)",
            "食べさされる",
            "食べられる",
            "食べさせる"
          ],
          "answer": 0,
          "explanation": "Ichidan verbs always retain the full -saserareru ending: 食べる → 食べさせられる (forced to eat)."
        },
        {
          "q": "What is the causative-passive form of the Godan verb 飲む (to drink)?",
          "options": [
            "飲まされる (nomasareru)",
            "飲ませられる",
            "飲まされる / 飲ませられる",
            "飲まれる"
          ],
          "answer": 2,
          "explanation": "飲まされる (contracted) and 飲ませられる (formal uncontracted) both mean \"forced to drink\"."
        },
        {
          "q": "What is the causative-passive form of the irregular verb する (to do)?",
          "options": [
            "させられる (saserareru)",
            "すさせられる",
            "される",
            "させす"
          ],
          "answer": 0,
          "explanation": "する irregular causative-passive is させられる (made to do)."
        },
        {
          "q": "What is the causative-passive form of the irregular verb 来る (くる / to come)?",
          "options": [
            "来させられる (こさせられる / kosaserareru)",
            "きさせられる",
            "こされる",
            "くさせられる"
          ],
          "answer": 0,
          "explanation": "来る causative-passive is 来させられる (こさせられる)."
        },
        {
          "q": "What does \"昨日、母に 部屋を 掃除させられました\" mean?",
          "options": [
            "Yesterday, I was forced by my mother to clean my room.",
            "Yesterday, I made my mother clean her room.",
            "My mother asked me if I cleaned my room."
          ],
          "answer": 0,
          "explanation": "掃除させられた expresses the child being made to clean the room by the mother."
        },
        {
          "q": "In JLPT N4 grammar, what does 〜はずです express in \"彼は 今日 来るはずです\"?",
          "options": [
            "Logical expectation based on facts (\"He is supposed to / expected to come today\")",
            "Prohibition",
            "Desire"
          ],
          "answer": 0,
          "explanation": "〜はずです denotes strong logical expectation or assumption based on evidence."
        },
        {
          "q": "What does 〜ようと思います express in \"来年、日本へ 行こうと 思います\"?",
          "options": [
            "A personal decision or intention formed before speaking (\"I intend/plan to go to Japan next year\")",
            "A spontaneous sudden decision",
            "An order"
          ],
          "answer": 0,
          "explanation": "Volitional form (意向形) + と思う expresses ongoing intention or plan."
        },
        {
          "q": "What is the volitional form (意向形) of the verb 行く (いく)?",
          "options": [
            "行こう (ikou)",
            "行きたい",
            "行きましょう",
            "行った"
          ],
          "answer": 0,
          "explanation": "Godan verbs change final U-sound to long O-sound: 行く → 行こう (let's go / plan to go)."
        }
      ],
      "questionPool": [
        {
          "q": "What is the Causative-Passive (使役受身形) form of the Godan verb 待つ (まつ / to wait)?",
          "options": [
            "待たされる (matasareru)",
            "待たせられる",
            "待たされる / 待たせられる",
            "待たれる"
          ],
          "answer": 2,
          "explanation": "Godan verbs contract -asaserareru into -asareru: 待つ → 待たされる (forced to wait)."
        },
        {
          "q": "What does the causative-passive form express emotionally in Japanese?",
          "options": [
            "Being forced or coerced into doing an action reluctantly (\"I was made to do ... against my will\")",
            "Joyfully volunteering to help",
            "Polite invitation"
          ],
          "answer": 0,
          "explanation": "使役受身 conveys reluctance or grievance at being coerced into performing an action."
        },
        {
          "q": "What is the causative-passive form of the Ichidan verb 食べる (to eat)?",
          "options": [
            "食べさせられる (tabesaserareru)",
            "食べさされる",
            "食べられる",
            "食べさせる"
          ],
          "answer": 0,
          "explanation": "Ichidan verbs always retain the full -saserareru ending: 食べる → 食べさせられる (forced to eat)."
        },
        {
          "q": "What is the causative-passive form of the Godan verb 飲む (to drink)?",
          "options": [
            "飲まされる (nomasareru)",
            "飲ませられる",
            "飲まされる / 飲ませられる",
            "飲まれる"
          ],
          "answer": 2,
          "explanation": "飲まされる (contracted) and 飲ませられる (formal uncontracted) both mean \"forced to drink\"."
        },
        {
          "q": "What is the causative-passive form of the irregular verb する (to do)?",
          "options": [
            "させられる (saserareru)",
            "すさせられる",
            "される",
            "させす"
          ],
          "answer": 0,
          "explanation": "する irregular causative-passive is させられる (made to do)."
        },
        {
          "q": "What is the causative-passive form of the irregular verb 来る (くる / to come)?",
          "options": [
            "来させられる (こさせられる / kosaserareru)",
            "きさせられる",
            "こされる",
            "くさせられる"
          ],
          "answer": 0,
          "explanation": "来る causative-passive is 来させられる (こさせられる)."
        },
        {
          "q": "What does \"昨日、母に 部屋を 掃除させられました\" mean?",
          "options": [
            "Yesterday, I was forced by my mother to clean my room.",
            "Yesterday, I made my mother clean her room.",
            "My mother asked me if I cleaned my room."
          ],
          "answer": 0,
          "explanation": "掃除させられた expresses the child being made to clean the room by the mother."
        },
        {
          "q": "In JLPT N4 grammar, what does 〜はずです express in \"彼は 今日 来るはずです\"?",
          "options": [
            "Logical expectation based on facts (\"He is supposed to / expected to come today\")",
            "Prohibition",
            "Desire"
          ],
          "answer": 0,
          "explanation": "〜はずです denotes strong logical expectation or assumption based on evidence."
        },
        {
          "q": "What does 〜ようと思います express in \"来年、日本へ 行こうと 思います\"?",
          "options": [
            "A personal decision or intention formed before speaking (\"I intend/plan to go to Japan next year\")",
            "A spontaneous sudden decision",
            "An order"
          ],
          "answer": 0,
          "explanation": "Volitional form (意向形) + と思う expresses ongoing intention or plan."
        },
        {
          "q": "What is the volitional form (意向形) of the verb 行く (いく)?",
          "options": [
            "行こう (ikou)",
            "行きたい",
            "行きましょう",
            "行った"
          ],
          "answer": 0,
          "explanation": "Godan verbs change final U-sound to long O-sound: 行く → 行こう (let's go / plan to go)."
        },
        {
          "q": "What is the volitional form of the Ichidan verb 食べる (to eat)?",
          "options": [
            "食べよう (tabeyou)",
            "食べろう",
            "食べようこと",
            "食べたい"
          ],
          "answer": 0,
          "explanation": "Ichidan verbs replace る with よう: 食べる → 食べよう."
        },
        {
          "q": "What does 〜予定です (よていです) mean in \"来週、試験の 予定です\"?",
          "options": [
            "Scheduled plan (\"An exam is scheduled for next week\")",
            "Wishful thinking",
            "Canceled event"
          ],
          "answer": 0,
          "explanation": "予定 (よてい) means a fixed schedule or calendar appointment."
        },
        {
          "q": "How does 〜ために differ from 〜ように when expressing purpose (\"in order to\")?",
          "options": [
            "〜ために is for controllable actions with deliberate intent; 〜ように is for uncontrollable states or potential verbs.",
            "〜ように is only for food.",
            "They are completely interchangeable."
          ],
          "answer": 0,
          "explanation": "ために requires volitional verbs; ように connects to non-volitional and potential states (見えるように)."
        },
        {
          "q": "What does \"日本語が 話せるように、毎日 練習しています\" mean?",
          "options": [
            "I practice every day so that I can speak Japanese.",
            "I practice Japanese because I can speak it.",
            "I cannot speak Japanese."
          ],
          "answer": 0,
          "explanation": "Potential verb (話せる) + ように expresses aiming for an achievable state of capability."
        },
        {
          "q": "What does the grammatical pattern 〜し、〜し express?",
          "options": [
            "Listing multiple reasons or contributing factors (\"it's cheap, and delicious, so...\")",
            "A strict conditional",
            "Past repetitive action only"
          ],
          "answer": 0,
          "explanation": "Plain form + し lists reasons leading to a natural conclusion."
        },
        {
          "q": "What pitch accent archetype does the word 桜 (さくら / cherry blossom) exhibit in Tokyo Japanese?",
          "options": [
            "平板 [0] (Heiban - low onset, high flat sustain: sa-KU-RA)",
            "頭高 [1]",
            "尾高 [3]"
          ],
          "answer": 0,
          "explanation": "桜 is Heiban [0], meaning the pitch does not drop on the following particle (さくらが)."
        },
        {
          "q": "What pitch accent archetype does the word 猫 (ねこ / cat) exhibit in Tokyo Japanese?",
          "options": [
            "頭高 [1] (Atamadaka - starts high on ね and immediately drops: NÉ-ko)",
            "平板 [0]",
            "尾高 [2]"
          ],
          "answer": 0,
          "explanation": "猫 is Atamadaka [1], with accent kernel on the first mora."
        },
        {
          "q": "What pitch accent archetype does the word 花 (はな / flower) exhibit in Tokyo Japanese?",
          "options": [
            "尾高 [2] (Odaka - starts low, rises on な, and drops on particle が: ha-NÁ-ga)",
            "平板 [0]",
            "頭高 [1]"
          ],
          "answer": 0,
          "explanation": "花 is Odaka [2], dropping on the grammatical particle (はなが drops). Contrast with 鼻 (nose, Heiban [0])."
        },
        {
          "q": "What does \"雨が 降るかもしれません\" express?",
          "options": [
            "It might rain (possibility / uncertainty ~50%)",
            "It will definitely rain",
            "It never rains"
          ],
          "answer": 0,
          "explanation": "〜かもしれない / 〜かもしれません expresses possibility or doubt (\"might / maybe\")."
        },
        {
          "q": "What does 〜てすみませんでした convey compared to 〜てはいけません?",
          "options": [
            "Apologizing for a past deed (\"I am sorry that I ...\")",
            "Prohibiting someone",
            "Asking a favor"
          ],
          "answer": 0,
          "explanation": "〜てすみませんでした is the apologetic past formula."
        },
        {
          "q": "In the classic tale of Princess Kaguya (竹取物語), where did she ultimately return to?",
          "options": [
            "The Moon (月 / つき)",
            "The Sun",
            "Mount Fuji summit",
            "The Dragon Palace"
          ],
          "answer": 0,
          "explanation": "Princess Kaguya was a celestial maiden who returned to the Moon (月の都)."
        },
        {
          "q": "What does the proverb 猿も木から落ちる (さるも きから おちる) mean?",
          "options": [
            "Even monkeys fall from trees (even experts make mistakes sometimes).",
            "Monkeys love fruit.",
            "Climbing trees is dangerous."
          ],
          "answer": 0,
          "explanation": "猿も木から落ちる is the quintessential Japanese idiom for human fallibility in mastery."
        },
        {
          "q": "What does the grammar pattern 〜とおりに express in \"私が 言ったとおりに やってください\"?",
          "options": [
            "\"Please do it exactly as / in the same way I said.\"",
            "\"Do it quickly.\"",
            "\"Do not do it.\""
          ],
          "answer": 0,
          "explanation": "〜とおりに means \"in the manner of / according to / exactly as\"."
        },
        {
          "q": "What does 〜あとで express in \"仕事が 終わったあとで、飲みに行きましょう\"?",
          "options": [
            "\"After work finishes, let's go drinking.\"",
            "\"Before work finishes, let's go.\"",
            "\"During work, let's go.\""
          ],
          "answer": 0,
          "explanation": "Verb た-form + あとで expresses temporal sequence (\"after doing ...\")."
        },
        {
          "q": "What does 〜ないで express in \"砂糖を 入れないで、コーヒーを 飲みます\"?",
          "options": [
            "Drinking coffee without putting in sugar (\"without doing ...\")",
            "Drinking coffee with sugar",
            "Sugar is forbidden"
          ],
          "answer": 0,
          "explanation": "Verb negative form + で means \"without doing [Verb]\"."
        },
        {
          "q": "What does 〜ば〜ほど express in \"日本語は 勉強すれば するほど、面白くなります\"?",
          "options": [
            "The more you study Japanese, the more interesting it becomes.",
            "You should not study Japanese.",
            "Japanese is only interesting at the beginning."
          ],
          "answer": 0,
          "explanation": "The proportional comparative: 〜ば〜ほど = \"the more... the more...\"."
        },
        {
          "q": "What does 〜やすいです mean in \"この靴は 歩きやすいです\"?",
          "options": [
            "These shoes are easy to walk in.",
            "These shoes are hard to walk in.",
            "These shoes are expensive."
          ],
          "answer": 0,
          "explanation": "Verb stem + やすい = easy to do."
        },
        {
          "q": "What is the full JLPT N4 completion milestone benchmark score required to pass?",
          "options": [
            "90 out of 180 points overall, with balanced sectional thresholds",
            "180/180 points",
            "50 points",
            "No threshold"
          ],
          "answer": 0,
          "explanation": "JLPT N4 requires 90/180 overall points and meeting individual sub-section scores."
        },
        {
          "q": "What is the causative-passive form of the verb 書く (かく / to write)?",
          "options": [
            "書かされる (kakisareru)",
            "書かせられる",
            "書かされる / 書かせられる",
            "書かれる"
          ],
          "answer": 2,
          "explanation": "Both 書かされる (contracted) and 書かせられる (standard) mean \"made to write\"."
        },
        {
          "q": "What does \"子供の時、ピアノを 習わされました\" describe?",
          "options": [
            "When I was a child, I was forced / made to learn the piano against my will.",
            "I loved playing the piano.",
            "I taught children piano."
          ],
          "answer": 0,
          "explanation": "習わされた is the causative-passive of 習う (made to learn)."
        }
      ],
      "phases": [
        {
          "phase": 1,
          "name": "Opening Stance",
          "nameJp": "第一形態：構え (Calm Stance)",
          "hpThreshold": 100,
          "dialogue": "「さあ、お手並み拝見といこうか。」 (Show me what you have learned!)",
          "themeColor": "#38bdf8"
        },
        {
          "phase": 2,
          "name": "Enraged Awakening",
          "nameJp": "第二形態：激昂 (Enraged Phase)",
          "hpThreshold": 66,
          "dialogue": "「なかなかやるな…だがここからが本気だ！」 (Impressive... but now I get serious!)",
          "themeColor": "#f59e0b"
        },
        {
          "phase": 3,
          "name": "Desperation Climax",
          "nameJp": "最終形態：極限奥義 (Desperation Climax)",
          "hpThreshold": 33,
          "dialogue": "「これで終わりだ！渾身の一撃を受けよ！」 (This is the end! Withstand my ultimate attack!)",
          "themeColor": "#ef4444"
        }
      ]
    }
  }
];

/**
 * Procedurally samples unique boss challenge questions from the saga's pool.
 * Falls back to saga.boss.questions if pool is absent.
 */
export function sampleBossChallenge(saga: CampaignSaga, count = 10): BossQuestion[] {
  const pool = saga.boss.questionPool && saga.boss.questionPool.length >= count
    ? saga.boss.questionPool
    : saga.boss.questions;
  const copy = [...pool];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy.slice(0, count);
}

export function getCampaignStage(stageId: string): { stage: CampaignStage; saga: CampaignSaga } | null {
  for (const saga of CAMPAIGN_SAGAS) {
    const stage = saga.stages.find((s) => s.id === stageId);
    if (stage) return { stage, saga };
  }
  return null;
}

export const findCampaignStage = getCampaignStage;
