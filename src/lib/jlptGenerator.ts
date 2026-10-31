import { KANJI } from '../data/kanji';
import { COUNTERS } from '../data/counters';
import { PARTICLES } from '../data/particles';
import { EXAM_QUESTIONS, type ExamLevel, type ExamSection } from '../data/exam';

export interface GeneratedExamQuestion {
  id: string;
  fingerprint: string;
  level: ExamLevel;
  section: ExamSection;
  mondaiId: string;
  mondaiTitle: string;
  passage?: string;
  prompt: string;
  /** Pure-kana audio string for TTS (supports …… and N:/F:/M: tags) */
  audio?: string;
  /** Transcript kept hidden during active test and shown on review */
  transcript?: string;
  options: string[];
  /** Index of correct option (0..3 or 0..2 for 3-option Mondai 3/4 listening) */
  answer: number;
  explain: string;
}

const SEEN_STORAGE_KEY = 'n5_seen_exam_fingerprints_v1';

export function getSeenFingerprints(): Set<string> {
  try {
    const raw = localStorage.getItem(SEEN_STORAGE_KEY);
    return raw ? new Set(JSON.parse(raw)) : new Set();
  } catch {
    return new Set();
  }
}

export function markFingerprintsSeen(fps: string[]) {
  try {
    const seen = getSeenFingerprints();
    fps.forEach((f) => seen.add(f));
    // Keep up to 600 recent fingerprints before rotating
    const arr = Array.from(seen).slice(-600);
    localStorage.setItem(SEEN_STORAGE_KEY, JSON.stringify(arr));
  } catch {
    // ignore
  }
}

export function clearSeenFingerprints() {
  try {
    localStorage.removeItem(SEEN_STORAGE_KEY);
  } catch {
    // ignore
  }
}

/** Shuffle array and return new copy */
function shuffle<T>(arr: T[]): T[] {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

/** Shuffle options while updating the correct answer index so it's never always option 1! */
function shuffleOptions(options: string[], answerIdx: number): { options: string[]; answer: number } {
  const tagged = options.map((opt, idx) => ({ opt, correct: idx === answerIdx }));
  const mixed = shuffle(tagged);
  return {
    options: mixed.map((m) => m.opt),
    answer: mixed.findIndex((m) => m.correct),
  };
}

/** Pick `count` items prioritizing unseen fingerprints first */
function pickUnseen<T extends { fingerprint: string }>(pool: T[], count: number, seen: Set<string>): T[] {
  const unseen = shuffle(pool.filter((x) => !seen.has(x.fingerprint)));
  const already = shuffle(pool.filter((x) => seen.has(x.fingerprint)));
  return [...unseen, ...already].slice(0, count);
}

/** Generate realistic phonetic distractors for a hiragana reading */
function makeReadingDistractors(correct: string, allReadings: string[]): string[] {
  const candidates = new Set<string>();
  // Phonetic mutations (voicing, long vowel, gemination)
  const swaps: [RegExp, string][] = [
    [/びゃ/g, 'ひゃ'],
    [/ぴゃ/g, 'ひゃ'],
    [/ひゃ/g, 'びゃ'],
    [/っ/g, ''],
    [/う/g, ''],
    [/が/g, 'か'],
    [/か/g, 'が'],
    [/ざ/g, 'さ'],
    [/だ/g, 'た'],
    [/ば/g, 'は'],
    [/ぱ/g, 'は'],
    [/じ/g, 'し'],
    [/し/g, 'じ'],
    [/ず/g, 'す'],
    [/ب/g, ''],
  ];
  for (const [re, rep] of swaps) {
    const mutated = correct.replace(re, rep);
    if (mutated && mutated !== correct && mutated.length >= 2) {
      candidates.add(mutated);
    }
  }
  // Add similar-length readings from the pool
  const similar = shuffle(
    allReadings.filter((r) => r !== correct && Math.abs(r.length - correct.length) <= 1),
  );
  for (const s of similar) {
    if (candidates.size >= 3) break;
    candidates.add(s);
  }
  return Array.from(candidates).slice(0, 3);
}

// ============================================================================
// PART 1 GENERATORS: 文字・語彙 (21 Questions in Official Full Exam)
//   - 問題1: 漢字読み (7 Qs)
//   - 問題2: 表記 (5 Qs)
//   - 問題3: 文脈規定 (5 Qs)
//   - 問題4: 言い換え類義 (4 Qs)
// ============================================================================

function generateVocabQuestions(level: ExamLevel, seen: Set<string>): GeneratedExamQuestion[] {
  const kanjiPool = KANJI.filter((k) => (level === 'N5' ? k.level === 'N5' : true));
  const allReadings = kanjiPool.map((k) => k.ex.r);

  // 1. 問題1・漢字読み (7 Questions: 4 from Kanji compounds + 3 from Counter/Date traps)
  const kanjiReadingPool: GeneratedExamQuestion[] = kanjiPool.map((k) => {
    const d = makeReadingDistractors(k.ex.r, allReadings);
    const { options, answer } = shuffleOptions([k.ex.r, ...d], 0);
    return {
      id: `v-read-k-${k.k}`,
      fingerprint: `v-read-k-${k.ex.w}`,
      level,
      section: 'vocab',
      mondaiId: 'V1',
      mondaiTitle: '問題1・漢字読み (Kanji Reading)',
      prompt: `「${k.ex.w}」の 読み方は どれですか。 (${k.ex.en})`,
      options,
      answer,
      explain: `${k.ex.w} is read 「${k.ex.r}」 (${k.ex.en}). Kanji ${k.k}: 音=${k.on} / 訓=${k.kun}.`,
    };
  });

  const counterReadingPool: GeneratedExamQuestion[] = COUNTERS.map((c) => {
    const sameGroupReadings = COUNTERS.filter((x) => x.group === c.group && x.kana !== c.kana).map((x) => x.kana);
    const d = makeReadingDistractors(c.kana, sameGroupReadings.length >= 3 ? sameGroupReadings : allReadings);
    const { options, answer } = shuffleOptions([c.kana, ...d], 0);
    return {
      id: `v-read-c-${c.id}`,
      fingerprint: `v-read-c-${c.id}`,
      level,
      section: 'vocab',
      mondaiId: 'V1',
      mondaiTitle: '問題1・漢字読み (Kanji Reading)',
      prompt: `「${c.kanji}」の 読み方は どれですか。 (${c.en})`,
      options,
      answer,
      explain: `${c.kanji} (${c.en}) is read 「${c.kana}」. ${c.rule}`,
    };
  });

  const m1 = [
    ...pickUnseen(kanjiReadingPool, 4, seen),
    ...pickUnseen(counterReadingPool, 3, seen),
  ];

  // 2. 問題2・表記 (5 Questions: Hiragana → Kanji Orthography)
  const orthoPool: GeneratedExamQuestion[] = kanjiPool
    .filter((k) => k.ex.w.length >= 1)
    .map((k) => {
      const sameLen = shuffle(
        kanjiPool.filter((x) => x.k !== k.k && x.ex.w !== k.ex.w && Math.abs(x.ex.w.length - k.ex.w.length) <= 1),
      )
        .slice(0, 3)
        .map((x) => x.ex.w);
      const { options, answer } = shuffleOptions([k.ex.w, ...sameLen], 0);
      return {
        id: `v-ortho-${k.k}`,
        fingerprint: `v-ortho-${k.ex.w}`,
        level,
        section: 'vocab',
        mondaiId: 'V2',
        mondaiTitle: '問題2・表記 (Orthography)',
        prompt: `「${k.ex.r}」（${k.ex.en}）の 漢字は どれですか。`,
        options,
        answer,
        explain: `「${k.ex.r}」 (${k.ex.en}) is written ${k.ex.w}.`,
      };
    });

  const m2 = pickUnseen(orthoPool, 5, seen);

  // 3. 問題3・文脈規定 (5 Questions: Context Vocabulary)
  const contextItems = [
    { fp: 'ctx-1', lv: 'N5', p: 'のどが かわきましたから、冷たい みずを（　）。', opts: ['のみます', 'たべます', 'きます', 'はきます'], exp: 'のどが かわく = thirsty → みずを のみます (drink water).' },
    { fp: 'ctx-2', lv: 'N5', p: 'へやが くらいですから、でんきを（　）ください。', opts: ['つけて', 'けして', 'あけて', 'しめて'], exp: 'くらい = dark → でんきを つけて (turn on the light).' },
    { fp: 'ctx-3', lv: 'N5', p: 'あしたは テストが ありますから、今晩は よく（　）します。', opts: ['べんきょう', 'さんぽ', 'りょこう', 'せんたく'], exp: 'Before a test, you study (べんきょうします).' },
    { fp: 'ctx-4', lv: 'N5', p: 'きのう カメラで きれいな（　）を とりました。', opts: ['しゃしん', 'てがみ', 'きっぷ', 'しんぶん'], exp: '写真を とる (しゃしんを とる) = take a photo.' },
    { fp: 'ctx-5', lv: 'N5', p: '外は さむいですから、あつい コートを（　）出かけます。', opts: ['きて', 'はいて', 'かぶって', 'かけて'], exp: 'Upper-body clothes like coats and shirts use 着る (きて).' },
    { fp: 'ctx-6', lv: 'N5', p: 'あたらしい くつを（　）公園を あるきました。', opts: ['はいて', 'きて', 'かぶって', 'しめて'], exp: 'Footwear and pants/skirts use はく (はいて).' },
    { fp: 'ctx-7', lv: 'N5', p: 'この 漢字の 読み方が わかりませんから、（　）で しらべます。', opts: ['じしょ', 'さいふ', 'かばん', 'とけい'], exp: '辞書 (じしょ) = dictionary.' },
    { fp: 'ctx-8', lv: 'N5', p: 'おなかが すきましたね。あの レストランに（　）ましょう。', opts: ['はいり', 'で', 'のり', 'おり'], exp: 'レストランに 入る (はいる) = enter the restaurant.' },
    { fp: 'ctx-9', lv: 'N5', p: '駅で 新幹線の（　）を 買いました。', opts: ['きっぷ', 'きって', 'はがき', 'ふうとう'], exp: 'きっぷ (切符) = train ticket; きって (切手) = postage stamp!' },
    { fp: 'ctx-10', lv: 'N5', p: 'デパートの（　）で 2階から 5階へ あがりました。', opts: ['エレベーター', 'タクシー', 'カレンダー', 'テーブル'], exp: 'エレベーター = elevator.' },
    { fp: 'ctx-11', lv: 'N4', p: 'きのうから 頭が 痛くて、すこし（　）が あります。', opts: ['熱（ねつ）', '薬（くすり）', '予約（よやく）', '元気（げんき）'], exp: '熱が あります = have a fever.' },
    { fp: 'ctx-12', lv: 'N4', p: '箱根へ 旅行する 前に、旅館の 部屋を（　）しました。', opts: ['予約（よやく）', '案内（あんない）', '紹介（しょうかい）', '準備（じゅんび）'], exp: '予約する = reserve / book in advance.' },
    { fp: 'ctx-13', lv: 'N4', p: 'サクラさんは アナさんに 神社の（　）を くれました。', opts: ['お守り', 'お釣り', 'お見舞い', 'お礼'], exp: 'お守り (おまもり) = protective amulet.' },
    { fp: 'ctx-14', lv: 'N4', p: '電車が（　）いたので、次の 電車を まちました。', opts: ['こんで', 'すいて', 'あいて', 'しまっ'], exp: 'こんで いる (混んでいる) = crowded.' },
    { fp: 'ctx-15', lv: 'N4', p: '急いで いたので、家に さいふを（　）しまいました。', opts: ['わすれて', 'おぼえて', 'なくして', 'ひろって'], exp: '家に わすれる = leave/forget something at home.' },
    { fp: 'ctx-16', lv: 'N4', p: '信号が 赤に なりましたから、車を（　）ください。', opts: ['とめて', 'きめて', 'あつめて', 'つづけて'], exp: '車を 止める (とめる) = stop the car.' },
  ];

  const filteredCtx = contextItems
    .filter((x) => (level === 'N5' ? x.lv === 'N5' : true))
    .map((x): GeneratedExamQuestion => {
      const { options, answer } = shuffleOptions(x.opts, 0);
      return {
        id: x.fp,
        fingerprint: x.fp,
        level,
        section: 'vocab',
        mondaiId: 'V3',
        mondaiTitle: '問題3・文脈規定 (Context Vocabulary)',
        prompt: x.p,
        options,
        answer,
        explain: x.exp,
      };
    });

  const m3 = pickUnseen(filteredCtx, 5, seen);

  // 4. 問題4・言い換え類義 (4 Questions: Closest Meaning Paraphrases)
  const paraphraseItems = [
    { fp: 'para-1', lv: 'N5', p: '「この へやは きれいです。」', opts: ['この へやは きたなくないです。', 'この へやは ひろくないです。', 'この へやは しずかです。', 'この へやは くらいです。'], exp: 'きれい (clean) = きたなくない (not dirty).' },
    { fp: 'para-2', lv: 'N5', p: '「ちちは まいばん おそく かえります。」', opts: ['ちちは 毎晩 11時ごろ 家に 帰ります。', 'ちちは 毎朝 6時に 会社へ 行きます。', 'ちちは 毎晩 8時に 寝ます。', 'ちちは 週末 うちに います。'], exp: 'おそく かえります = returns home late at night.' },
    { fp: 'para-3', lv: 'N5', p: '「この テストは やさしかったです。」', opts: ['この テストは むずかしくなかったです。', 'この テストは みじかくなかったです。', 'この テストは たのしかったです。', 'この テストは ながかったです。'], exp: 'やさしい (easy) = むずかしくない (not difficult).' },
    { fp: 'para-4', lv: 'N5', p: '「あしたは ひまです。」', opts: ['あしたは 予定（よてい）が ありません。', 'あしたは とても いそがしいです。', 'あしたは 仕事を します。', 'あしたは 友だちに 会います。'], exp: 'ひま (free/not busy) = having no plans (予定がありません).' },
    { fp: 'para-5', lv: 'N5', p: '「駅の となりに パン屋が あります。」', opts: ['駅の すぐ よこに パン屋が あります。', '駅の とおくに パン屋が あります。', '駅の うしろに パン屋が あります。', '駅の 2階に パン屋が あります。'], exp: 'となり (next to) = すぐ よこ (right beside).' },
    { fp: 'para-6', lv: 'N5', p: '「この 店は いつも 人が おおいです。」', opts: ['この 店には いつも たくさんの 人が います。', 'この 店には 人が あまり いません。', 'この 店は とても 広いです。', 'この 店は 値段が 高いです。'], exp: '人が おおい = たくさんの 人が います (there are many people).' },
    { fp: 'para-7', lv: 'N4', p: '「この 仕事は やっと 終わりました。」', opts: ['たいへんでしたが、最後に 仕事が 終わりました。', '仕事が すぐに かんたんに 終わりました。', '仕事は まだ 終わって いません。', 'これから 仕事を 始めます。'], exp: 'やっと = finally / at last after effort.' },
    { fp: 'para-8', lv: 'N4', p: '「旅館の 部屋を 予約しました。」', opts: ['行く 前に 連絡して 部屋を とりました。', '旅館の 部屋を そうじしました。', '旅館から 家へ 帰りました。', '旅館で 晩ご飯を 作りました。'], exp: '予約する = book/reserve ahead of time.' },
    { fp: 'para-9', lv: 'N4', p: '「アナさんは だんだん 日本語が 上手に なりました。」', opts: ['アナさんは 少しずつ 日本語が うまく 話せる ように なりました。', 'アナさんは 最初から 日本語が ペラペラでした。', 'アナさんは 日本語を あまり 話しません。', 'アナさんは 日本語の 勉強を やめました。'], exp: 'だんだん 上手に なる = gradually become better.' },
    { fp: 'para-10', lv: 'N4', p: '「かならず 9時までに 来て ください。」', opts: ['ぜったいに 9時より 前に 来て ください。', 'たぶん 9時ごろ 来て ください。', '時間があれば 9時に 来て ください。', '9時の 後で 来て ください。'], exp: 'かならず (without fail) = ぜったいに (definitely).' },
  ];

  const filteredPara = paraphraseItems
    .filter((x) => (level === 'N5' ? x.lv === 'N5' : true))
    .map((x): GeneratedExamQuestion => {
      const { options, answer } = shuffleOptions(x.opts, 0);
      return {
        id: x.fp,
        fingerprint: x.fp,
        level,
        section: 'vocab',
        mondaiId: 'V4',
        mondaiTitle: '問題4・言い換え類義 (Closest Meaning)',
        prompt: `${x.p} — いちばん 近い 意味は どれですか。`,
        options,
        answer,
        explain: x.exp,
      };
    });

  const m4 = pickUnseen(filteredPara, 4, seen);

  return [...m1, ...m2, ...m3, ...m4];
}

// ============================================================================
// PART 2 GENERATORS: 文法・読解 (22 Questions in Official Full Exam)
//   - 問題1: 文の文法1 (9 Qs)
//   - 問題2: 文の組み立て ★ Star Puzzle (4 Qs)
//   - 問題3: 文章の文法 Cloze Text (3 Qs)
//   - 問題4: 内容理解（短文）Short Passages (3 Qs)
//   - 問題5: 内容理解（中文）Mid Passage (2 Qs)
//   - 問題6: 情報検索 Information Retrieval Table (1 Q)
// ============================================================================

function generateGrammarReadingQuestions(level: ExamLevel, seen: Set<string>): GeneratedExamQuestion[] {
  // 1. 問題1・文の文法1 (9 Questions: Particles + Verb/Adj Grammar)
  const particleGrammarPool: GeneratedExamQuestion[] = PARTICLES.map((p) => {
    const { options, answer } = shuffleOptions(p.options, p.options.indexOf(p.answer));
    return {
      id: `g-part-${p.id}`,
      fingerprint: `g-part-${p.id}`,
      level,
      section: 'grammar',
      mondaiId: 'G1',
      mondaiTitle: '問題1・文の文法1 (Sentence Grammar)',
      prompt: `${p.before}（　）${p.after}`,
      options,
      answer,
      explain: `${p.why} (${p.en})`,
    };
  });

  const extraGrammar = [
    { fp: 'gr-1', lv: 'N5', p: 'すみません、ここで 写真を（　）いいですか。', opts: ['撮っても', '撮りて', '撮るも', '撮った'], exp: 'V-ても いいですか = May I V?' },
    { fp: 'gr-2', lv: 'N5', p: 'きのうの パーティーは とても（　）です。', opts: ['たのしかった', 'たのしいかった', 'たのしくて', 'たのしいでした'], exp: 'い-adjective past: drop い + かった.' },
    { fp: 'gr-3', lv: 'N5', p: 'この 部屋は 静か（　）きれいです。', opts: ['で', 'くて', 'に', 'だ'], exp: 'な-adjectives connect with で (静かで きれい).' },
    { fp: 'gr-4', lv: 'N5', p: 'まだ 昼ご飯を（　）いません。', opts: ['食べて', '食べた', '食べり', '食べない'], exp: 'まだ V-て いません = have not V-ed yet.' },
    { fp: 'gr-5', lv: 'N5', p: '少し 暑いですから、窓を（　）ください。', opts: ['開けて', '開けって', '開きて', '開く'], exp: '開ける (Ichidan) → 開けて ください.' },
    { fp: 'gr-6', lv: 'N4', p: 'わたしは 日本の 温泉に（　）ことが あります。', opts: ['行った', '行く', '行って', '行こう'], exp: 'V-た ことが あります = have the experience of V-ing.' },
    { fp: 'gr-7', lv: 'N4', p: '温泉に 入る 前に、体を（　）なりません。', opts: ['洗わなければ', '洗っては', '洗うつもり', '洗ったり'], exp: 'V-なければ なりません = must V.' },
    { fp: 'gr-8', lv: 'N4', p: '日本に 来てから、日本語が（　）ように なりました。', opts: ['話せる', '話した', '話して', '話し'], exp: 'Potential form + ように なりました = became able to V.' },
    { fp: 'gr-9', lv: 'N4', p: '誕生日に 友だちが 私に 本を（　）。', opts: ['くれました', 'あげました', 'もらいました', 'やりました'], exp: 'Someone gives to me (私に) → くれました.' },
    { fp: 'gr-10', lv: 'N4', p: 'タオルを お湯の 中に（　）いけません。', opts: ['入れては', '入れなければ', '入れると', '入れたり'], exp: 'V-ては いけません = must not V.' },
    { fp: 'gr-11', lv: 'N4', p: 'いつか また 日本に（　）みたいです。', opts: ['住んで', '住む', '住んだ', '住み'], exp: 'V-て みたい = want to try V-ing.' },
  ].filter((x) => (level === 'N5' ? x.lv === 'N5' : true));

  const extraGrammarPool: GeneratedExamQuestion[] = extraGrammar.map((x) => {
    const { options, answer } = shuffleOptions(x.opts, 0);
    return {
      id: x.fp,
      fingerprint: x.fp,
      level,
      section: 'grammar',
      mondaiId: 'G1',
      mondaiTitle: '問題1・文の文法1 (Sentence Grammar)',
      prompt: x.p,
      options,
      answer,
      explain: x.exp,
    };
  });

  const m1 = pickUnseen([...extraGrammarPool, ...particleGrammarPool], 9, seen);

  // 2. 問題2・文の組み立て ★ Star Puzzle (4 Questions)
  // Notice we can dynamically pick which slot (1 or 2, i.e., 2nd or 3rd blank) has the ★!
  const starTemplates = [
    { fp: 'star-1', lv: 'N5', head: 'きのう', tail: '買いました。', chunks: ['駅の', '近くの', '店で', 'かばんを'], en: 'Yesterday I bought a bag at a shop near the station.' },
    { fp: 'star-2', lv: 'N5', head: '週末は', tail: 'したいです。', chunks: ['お寺を', '見たり', '抹茶を', '飲んだり'], en: 'On the weekend I want to do things like see temples and drink matcha.' },
    { fp: 'star-3', lv: 'N5', head: 'この', tail: 'ください。', chunks: ['紙に', '黒い', 'ペンで', '名前を 書いて'], en: 'Please write your name on this paper with a black pen.' },
    { fp: 'star-4', lv: 'N5', head: '私は', tail: '行きます。', chunks: ['毎朝', '八時に', '電車で', '会社へ'], en: 'Every morning I go to the company by train at 8:00.' },
    { fp: 'star-5', lv: 'N5', head: '東京の', tail: '多いです。', chunks: ['ほうが', '私の', '町より', '人が'], en: 'Tokyo has more people than my town.' },
    { fp: 'star-6', lv: 'N5', head: 'あした', tail: '見ませんか。', chunks: ['駅の', '前で', '友だちと', '映画を'], en: 'Won’t you watch a movie with a friend in front of the station tomorrow?' },
    { fp: 'star-7', lv: 'N4', head: '毎日', tail: 'なりました。', chunks: ['練習したから', '難しい', '漢字が', '読めるように'], en: 'Because I practiced every day, I became able to read difficult kanji.' },
    { fp: 'star-8', lv: 'N4', head: 'この 薬は', tail: 'ください。', chunks: ['ご飯を', '食べた', '後で', '飲んで'], en: 'Please take this medicine after eating a meal.' },
    { fp: 'star-9', lv: 'N4', head: '来月', tail: 'つもりです。', chunks: ['友だちと', '新幹線で', '箱根へ', '行く'], en: 'Next month I intend to go to Hakone with my friend by bullet train.' },
    { fp: 'star-10', lv: 'N4', head: '温泉に', tail: 'なりません。', chunks: ['入る', '前に', '体を', '洗わなければ'], en: 'Before entering the hot spring, you must wash your body.' },
    { fp: 'star-11', lv: 'N4', head: '誕生日に', tail: 'くれました。', chunks: ['サクラさんが', '私に', 'きれいな', 'お守りを'], en: 'On my birthday Sakura gave me a pretty amulet.' },
  ].filter((x) => (level === 'N5' ? x.lv === 'N5' : true));

  const starPool: GeneratedExamQuestion[] = starTemplates.map((st) => {
    const starIdx = Math.random() < 0.5 ? 1 : 2; // 2nd or 3rd slot
    const slots = [0, 1, 2, 3].map((i) => (i === starIdx ? '★' : '＿')).join(' ');
    const correctChunk = st.chunks[starIdx];
    const { options, answer } = shuffleOptions(st.chunks, starIdx);
    return {
      id: `${st.fp}-${starIdx}`,
      fingerprint: `${st.fp}-${starIdx}`,
      level,
      section: 'grammar',
      mondaiId: 'G2',
      mondaiTitle: '問題2・文の組み立て (★ Star Puzzle)',
      prompt: `${st.head} ${slots} ${st.tail}\n（★ に 入る ものは どれですか。 "${st.en}"）`,
      options,
      answer,
      explain: `Correct order: ${st.head} [${st.chunks.join('] [')}] ${st.tail} → ★ is 「${correctChunk}」.`,
    };
  });

  const m2 = pickUnseen(starPool, 4, seen);

  // 3. 問題3・文章の文法 (3 Questions in a shared Cloze Passage)
  const clozeSets = [
    {
      fp: 'cloze-letter-1',
      passage:
        '【アナさんの 日記】\n先週の 土曜日、私は 友だちの サクラさんと 鎌倉（かまくら）へ 行きました。朝 9時に 東京駅で 会って、電車に 乗りました。鎌倉には 古い お寺が たくさん あります。【 1 】、海の 近くまで 歩きました。昼ご飯は 小さい レストランで 魚を 食べました。とても 【 2 】。帰りの 電車では 疲れて 寝て しまいました。また サクラさんと 【 3 】。',
      qs: [
        { slot: '【 1 】', opts: ['それから', 'だから', 'しかし', 'たとえば'], exp: 'それから ("after that") connects visiting temples with walking to the sea.' },
        { slot: '【 2 】', opts: ['おいしかったです', 'おいしいです', 'おいしくて', 'おいしかったでした'], exp: 'The diary describes Saturday’s lunch in the past tense: おいしかったです.' },
        { slot: '【 3 】', opts: ['行きたいです', '行きました', '行くからです', '行って ください'], exp: 'また〜行きたいです ("I want to go again").' },
      ],
    },
    {
      fp: 'cloze-letter-2',
      passage:
        '【サクラさんへの 手紙】\nサクラさん、お元気ですか。私が 日本に 来てから、3か月に なりました。最初は 日本の 生活が 少し 大変でした。【 1 】、今は 毎日 楽しいです。学校の 先生も 友だちも とても 親切です。先週は 一人で 図書館へ 行って、日本の 本を 【 2 】。来月の 休みに、いっしょに 京都へ 【 3 】。返事を 待って います。',
      qs: [
        { slot: '【 1 】', opts: ['でも', 'だから', 'そして', 'それで'], exp: 'でも ("however / but") contrasts the hard beginning with enjoying every day now.' },
        { slot: '【 2 】', opts: ['借りました', '貸しました', '教えました', '習いました'], exp: 'At a library (図書館で), you borrow books: 本を 借りました (かりました).' },
        { slot: '【 3 】', opts: ['行きませんか', '行きましたか', '行く つもりでした', '行っては いけません'], exp: '〜ませんか invites Sakura ("Won’t you go to Kyoto with me?").' },
      ],
    },
  ];

  const chosenCloze = clozeSets[Math.floor(Math.random() * clozeSets.length)];
  const m3: GeneratedExamQuestion[] = chosenCloze.qs.map((q, idx) => {
    const { options, answer } = shuffleOptions(q.opts, 0);
    return {
      id: `${chosenCloze.fp}-${idx}`,
      fingerprint: `${chosenCloze.fp}-${idx}`,
      level,
      section: 'grammar',
      mondaiId: 'G3',
      mondaiTitle: '問題3・文章の文法 (Text Grammar Cloze)',
      passage: idx === 0 ? chosenCloze.passage : undefined,
      prompt: `文章の ${q.slot} に 入る いちばん いい ものは どれですか。`,
      options,
      answer,
      explain: q.exp,
    };
  });

  // 4. 問題4・内容理解（短文） (3 Short Passages with Dynamic Randomized Details!)
  const meetHour = [2, 3, 4, 5][Math.floor(Math.random() * 4)];
  const meetPlace = shuffle([
    { jp: '駅の 東口', wrong: ['駅の 西口', '喫茶店の 中', '本屋の 前'] },
    { jp: '白い ビルの 前', wrong: ['駅の 改札', '公園の 入口', '学校の 前'] },
    { jp: '本屋の 前', wrong: ['駅の 前', 'カフェの 中', '映画館の 前'] },
  ])[0];
  const short1Opts = shuffleOptions([meetPlace.jp, ...meetPlace.wrong], 0);
  const short1: GeneratedExamQuestion = {
    id: `r-short-memo-${meetHour}-${meetPlace.jp}`,
    fingerprint: `r-short-memo-${meetHour}-${meetPlace.jp}`,
    level,
    section: 'grammar',
    mondaiId: 'G4',
    mondaiTitle: '問題4・内容理解（短文）(Short Reading)',
    passage: `【メモ】\nけんさんへ\nきょうは 午後 ${meetHour}時に ${meetPlace.jp}に います。そこで 会ってから、いっしょに 新しい カフェへ 行きましょう。\n— アナ`,
    prompt: `アナさんは 午後 ${meetHour}時に どこで けんさんを まちますか。`,
    options: short1Opts.options,
    answer: short1Opts.answer,
    explain: `The memo states: 「午後 ${meetHour}時に ${meetPlace.jp}に います」.`,
  };

  const closedDay = shuffle(['月曜日', '火曜日', '水曜日', '木曜日'])[0];
  const openDay = closedDay === '火曜日' ? '水曜日' : '火曜日';
  const maxBooks = [3, 4, 5, 6][Math.floor(Math.random() * 4)];
  const short2Opts = shuffleOptions(
    [
      `${openDay}の 午後 2時に 本を ${maxBooks}さつ 借りる ことが できます。`,
      `${closedDay}の 午前 10時に 本を 借りる ことが できます。`,
      `一人で 本を ${maxBooks + 3}さつ 借りる ことが できます。`,
      `夜 10時まで 図書館の 中で 本を 読めます。`,
    ],
    0,
  );
  const short2: GeneratedExamQuestion = {
    id: `r-short-lib-${closedDay}-${maxBooks}`,
    fingerprint: `r-short-lib-${closedDay}-${maxBooks}`,
    level,
    section: 'grammar',
    mondaiId: 'G4',
    mondaiTitle: '問題4・内容理解（短文）(Short Reading)',
    passage: `【みどり図書館の ごあんない】\n・開館時間：午前 9時 〜 午後 7時\n・休館日：毎週 ${closedDay}\n・本は 一人 ${maxBooks}さつまで、2週間 借りる ことが できます。`,
    prompt: 'この 図書館の 使い方で、正しい ものは どれですか。',
    options: short2Opts.options,
    answer: short2Opts.answer,
    explain: `The library is closed on ${closedDay} (休館日), open 9 AM–7 PM, and allows up to ${maxBooks} books per person.`,
  };

  const medTimes = [2, 3][Math.floor(Math.random() * 2)];
  const medTiming = Math.random() < 0.5 ? { jp: 'ご飯を 食べた 後で', en: 'after meals' } : { jp: 'ご飯を 食べる 前に', en: 'before meals' };
  const short3Opts = shuffleOptions(
    [
      `1日に ${medTimes}回、${medTiming.jp} 飲みます。`,
      `1日に 1回、寝る 前に 3つ 飲みます。`,
      `頭が 痛い ときだけ 5つ 飲みます。`,
      `薬を 飲んだ すぐ 後で、車を 運転しても いいです。`,
    ],
    0,
  );
  const short3: GeneratedExamQuestion = {
    id: `r-short-med-${medTimes}-${medTiming.en}`,
    fingerprint: `r-short-med-${medTimes}-${medTiming.en}`,
    level,
    section: 'grammar',
    mondaiId: 'G4',
    mondaiTitle: '問題4・内容理解（短文）(Short Reading)',
    passage: `【おくすりの 袋（ふくろ）】\n・この 薬は 1日に ${medTimes}回、${medTiming.jp} 1つずつ 水で 飲んで ください。\n・薬を 飲んだ 後で 眠く なる ことが ありますから、自転車や 車を 運転しては いけません。`,
    prompt: 'この 薬の 飲み方で、正しい ものは どれですか。',
    options: short3Opts.options,
    answer: short3Opts.answer,
    explain: `The bag specifies: 「1日に ${medTimes}回、${medTiming.jp} 1つずつ」.`,
  };

  // 5. 問題5・内容理解（中文）(Mid-Length Passage with 2 Linked Questions)
  const midPassages = [
    {
      fp: 'mid-onsen-trip',
      passage:
        '【読解・中文】\n先週の 週末、私は 友だちの サクラさんと 初めて 箱根の 旅館に 泊まりました。東京駅から 新幹線と 電車に 乗って、2時間ぐらいで 着きました。\n旅館に 着いてから、まず 1階の 温泉へ 行きました。私は 温泉に 入った ことが なかったので、サクラさんが 入り方を 教えて くれました。「お湯に 入る 前に 体を 洗わなければ ならないよ。それから、タオルは お湯に 入れては いけないよ」と 言いました。外の 景色を 見ながら 入る 温泉は とても 気持ちよかったです。夜は 部屋で おいしい 魚料理を 食べました。',
      q1: {
        prompt: '「私」は どうして サクラさんに 温泉の 入り方を 教えて もらいましたか。',
        opts: [
          '今まで 日本の 温泉に 入った ことが なかったから。',
          '旅館の 看板の 漢字が 全然 読めなかったから。',
          'タオルを 家に 忘れて 来て しまったから。',
          'サクラさんが その 旅館で 働いて いるから。',
        ],
        exp: 'The passage states: 「私は 温泉に 入った ことが なかったので、サクラさんが 入り方を 教えて くれました。」',
      },
      q2: {
        prompt: '旅館に 着いてから、「私」が した ことと 合って いる ものは どれですか。',
        opts: [
          'お湯に 入る 前に 体を 洗って、夜は 部屋で 魚料理を 食べた。',
          'まず 部屋で 魚料理を 食べてから、翌朝 だけ 温泉に 入った。',
          'タオルを お湯の 中に 入れて 体を 洗った。',
          '東京駅から バスに 5時間 乗って 旅館に 着いた。',
        ],
        exp: 'They went to the 1F onsen first, washed before entering, and ate fish dishes in their room at night.',
      },
    },
    {
      fp: 'mid-camera-shop',
      passage:
        '【読解・中文】\n私は 来月 京都へ 旅行に 行く つもりです。きれいな 写真を たくさん 撮りたいですが、私の 古い カメラは 重くて、旅行には 不便です。それで、きのう 秋葉原の 大きい 電気屋へ 新しい カメラを 買いに 行きました。\n5階の カメラ売り場には いろいろな カメラが ありました。白い カメラは デザインが すてきでしたが、3万円で 少し 高かったです。店員さんが「こちらの 黒い カメラは 白い のより 軽くて、2万円ですよ」と 教えて くれました。私は 黒い カメラが 気に入って、それを 買いました。来月の 旅行が とても 楽しみです。',
      q1: {
        prompt: '「私」は どうして 新しい カメラを 買いに 行きましたか。',
        opts: [
          '今 持って いる 古い カメラが 重くて、来月の 旅行に 不便だから。',
          '古い カメラを 電車の 中に 忘れて なくして しまったから。',
          '友だちに 誕生日の プレゼントとして カメラを あげたいから。',
          '学校の 授業で 毎日 カメラを 使わなければ ならないから。',
        ],
        exp: 'The writer explains: 「私の 古い カメラは 重くて、旅行には 不便です。それで…買いに 行きました。」',
      },
      q2: {
        prompt: '「私」が 買った カメラは どれですか。',
        opts: [
          '白い カメラより 軽くて、2万円の 黒い カメラ。',
          'デザインが すてきな、3万円の 白い カメラ。',
          '1階で 売って いた、いちばん 安い 中古の カメラ。',
          '店員さんが 使って いた 小さい カメラ。',
        ],
        exp: 'The clerk recommended the lighter ¥20,000 black camera, and the writer bought it.',
      },
    },
  ];

  const chosenMid = midPassages[Math.floor(Math.random() * midPassages.length)];
  const midQ1Opts = shuffleOptions(chosenMid.q1.opts, 0);
  const midQ2Opts = shuffleOptions(chosenMid.q2.opts, 0);
  const m5: GeneratedExamQuestion[] = [
    {
      id: `${chosenMid.fp}-1`,
      fingerprint: `${chosenMid.fp}-1`,
      level,
      section: 'grammar',
      mondaiId: 'G5',
      mondaiTitle: '問題5・内容理解（中文）(Mid-Length Passage)',
      passage: chosenMid.passage,
      prompt: chosenMid.q1.prompt,
      options: midQ1Opts.options,
      answer: midQ1Opts.answer,
      explain: chosenMid.q1.exp,
    },
    {
      id: `${chosenMid.fp}-2`,
      fingerprint: `${chosenMid.fp}-2`,
      level,
      section: 'grammar',
      mondaiId: 'G5',
      mondaiTitle: '問題5・内容理解（中文）(Mid-Length Passage)',
      prompt: chosenMid.q2.prompt,
      options: midQ2Opts.options,
      answer: midQ2Opts.answer,
      explain: chosenMid.q2.exp,
    },
  ];

  // 6. 問題6・情報検索 (1 Information Retrieval Question with Dynamic Schedule/Prices!)
  const tourBudget = [3000, 4000, 5000][Math.floor(Math.random() * 3)];
  const wantDay = Math.random() < 0.5 ? '土曜日' : '日曜日';
  const otherDay = wantDay === '土曜日' ? '日曜日' : '土曜日';
  const infoOpts = shuffleOptions(
    [
      'Bコース（浅草・スカイツリー散歩）',
      'Aコース（鎌倉・お寺めぐり）',
      'Cコース（箱根・温泉バスツアー）',
      'Dコース（夜の 東京タワーと 船）',
    ],
    0,
  );
  const m6: GeneratedExamQuestion = {
    id: `r-info-${wantDay}-${tourBudget}`,
    fingerprint: `r-info-${wantDay}-${tourBudget}`,
    level,
    section: 'grammar',
    mondaiId: 'G6',
    mondaiTitle: '問題6・情報検索 (Information Retrieval)',
    passage:
      `【週末 東京・日帰り ツアー ごあんない】\n` +
      `・Aコース（鎌倉・お寺めぐり）：${otherDay}のみ ／ 午前 9:00〜16:00 ／ ${tourBudget - 500}円\n` +
      `・Bコース（浅草・スカイツリー散歩）：土曜日・日曜日 ／ 午前 10:00〜15:00 ／ ${tourBudget - 200}円\n` +
      `・Cコース（箱根・温泉バスツアー）：土曜日・日曜日 ／ 午前 8:00〜18:00 ／ ${tourBudget + 2500}円\n` +
      `・Dコース（夜の 東京タワーと 船）：${wantDay}のみ ／ 午後 18:00〜21:00 ／ ${tourBudget - 500}円`,
    prompt: `トムさんは 今週の 「${wantDay}の 昼（午前〜午後3時ごろ）」に 参加できる ツアーを さがして います。お金は 「${tourBudget}円まで」が いいです。トムさんは どの コースを 選びますか。`,
    options: infoOpts.options,
    answer: infoOpts.answer,
    explain: `Tom needs ${wantDay} daytime (午前〜午後3時ごろ) and ≤ ${tourBudget}円. Course A is ${otherDay} only; Course C costs ${tourBudget + 2500}円 (over budget); Course D is at night (18:00–21:00). Course B runs on ${wantDay} from 10:00–15:00 for ${tourBudget - 200}円!`,
  };

  return [...m1, ...m2, ...m3, short1, short2, short3, ...m5, m6];
}

// ============================================================================
// PART 3 GENERATORS: 聴解 (24 Questions in Official Full Exam)
//   - 問題1: 課題理解 Task Comprehension (7 Qs)
//   - 問題2: ポイント理解 Point Comprehension (6 Qs)
//   - 問題3: 発話表現 Utterance Expressions (5 Qs)
//   - 問題4: 即時応答 Immediate Response (6 Qs)
// ============================================================================

function generateListeningQuestions(level: ExamLevel, seen: Set<string>): GeneratedExamQuestion[] {
  // Dynamic Combinatorial Multi-Voice Dialogues so every exam has NEW audio & numbers!
  const dynamicDialogues: GeneratedExamQuestion[] = [];

  // Dynamic 1: Cafe / Restaurant Order with やっぱり change of mind
  const drinks = [
    { jp: '冷たい お茶', kana: 'つめたい おちゃ' },
    { jp: 'ホットコーヒー', kana: 'ホットコーヒー' },
    { jp: '紅茶', kana: 'こうちゃ' },
    { jp: 'オレンジジュース', kana: 'オレンジジュース' },
    { jp: '抹茶ラテ', kana: 'まっちゃラテ' },
  ];
  const dPick = shuffle(drinks);
  const firstDrink = dPick[0];
  const finalDrink = dPick[1];
  const d1Opts = shuffleOptions(dPick.slice(0, 4).map((x) => x.jp), 1);
  dynamicDialogues.push({
    id: `l-dyn-drink-${finalDrink.jp}`,
    fingerprint: `l-dyn-drink-${finalDrink.jp}`,
    level,
    section: 'listening',
    mondaiId: 'L1',
    mondaiTitle: '問題1・課題理解 (Task-Based Listening)',
    prompt: '喫茶店で 男の人と 女の人が 話して います。女の人は 何を 頼みますか。',
    audio: `きっさてんで、おとこのひとと、おんなのひとが はなしています。おんなのひとは、なにを たのみますか。……M:なにを のみますか。ぼくは ${dPick[2].kana}に します。……F:わたしは、${firstDrink.kana}に しようかな。あ、きょうは あついから、やっぱり ${finalDrink.kana}を ください。`,
    transcript: `男：何を 飲みますか。ぼくは ${dPick[2].jp}に します。\n女：私は ${firstDrink.jp}に しようかな。あ、今日は 暑いから、やっぱり ${finalDrink.jp}を ください。`,
    options: d1Opts.options,
    answer: d1Opts.answer,
    explain: `She first considers ${firstDrink.jp}, then says 「やっぱり ${finalDrink.jp}を ください」.`,
  });

  // Dynamic 2: Price × Quantity Calculation at a Shop
  const shopItems = [
    { name: 'りんご', kana: 'りんご', unitPrice: 150, unitKana: 'ひゃくごじゅうえん', qty: 3, qtyKana: 'みっつ', total: 450, totalKana: 'よんひゃくごじゅうえん', distractors: ['150円', '300円', '600円'] },
    { name: 'ノート', kana: 'ノート', unitPrice: 200, unitKana: 'にひゃくえん', qty: 4, qtyKana: 'よんさつ', total: 800, totalKana: 'はっぴゃくえん', distractors: ['200円', '400円', '600円'] },
    { name: 'パン', kana: 'パン', unitPrice: 120, unitKana: 'ひゃくにじゅうえん', qty: 2, qtyKana: 'ふたつ', total: 240, totalKana: 'にひゃくよんじゅうえん', distractors: ['120円', '220円', '360円'] },
    { name: '傘', kana: 'かさ', unitPrice: 500, unitKana: 'ごひゃくえん', qty: 2, qtyKana: 'にほん', total: 1000, totalKana: 'せんえん', distractors: ['500円', '800円', '1500円'] },
  ];
  const sItem = shopItems[Math.floor(Math.random() * shopItems.length)];
  const d2Opts = shuffleOptions([`${sItem.total}円`, ...sItem.distractors], 0);
  dynamicDialogues.push({
    id: `l-dyn-shop-${sItem.name}-${sItem.total}`,
    fingerprint: `l-dyn-shop-${sItem.name}-${sItem.total}`,
    level,
    section: 'listening',
    mondaiId: 'L1',
    mondaiTitle: '問題1・課題理解 (Task-Based Listening)',
    prompt: `店で 男の人と 店員が 話して います。男の人は 全部で いくら 払いますか。`,
    audio: `みせで、おとこのひとと、てんいんが はなしています。おとこのひとは、ぜんぶで いくら はらいますか。……M:すみません、この ${sItem.kana}は ひとつ いくらですか。……F:ひとつ ${sItem.unitKana}です。……M:じゃあ、${sItem.qtyKana} ください。……F:はい、ぜんぶで ${sItem.totalKana}に なります。`,
    transcript: `男：すみません、この ${sItem.name}は 1つ いくらですか。\n店員：1つ ${sItem.unitPrice}円です。\n男：じゃあ、${sItem.qtyKana} ください。\n店員：はい、全部で ${sItem.total}円に なります。`,
    options: d2Opts.options,
    answer: d2Opts.answer,
    explain: `${sItem.unitPrice}円 × ${sItem.qty} = ${sItem.total}円 (${sItem.totalKana}).`,
  });

  // Dynamic 3: Station Platform Change Announcement
  const dests = [
    { jp: '京都', kana: 'きょうと' },
    { jp: '新宿', kana: 'しんじゅく' },
    { jp: '横浜', kana: 'よこはま' },
    { jp: '上野', kana: 'うえの' },
  ];
  const dest = dests[Math.floor(Math.random() * dests.length)];
  const tracks = shuffle([
    { n: '1番線', k: 'いちばんせん' },
    { n: '2番線', k: 'にばんせん' },
    { n: '3番線', k: 'さんばんせん' },
    { n: '5番線', k: 'ごばんせん' },
  ]);
  const oldTrack = tracks[0];
  const newTrack = tracks[1];
  const d3Opts = shuffleOptions(tracks.map((t) => t.n), 1);
  dynamicDialogues.push({
    id: `l-dyn-track-${dest.jp}-${newTrack.n}`,
    fingerprint: `l-dyn-track-${dest.jp}-${newTrack.n}`,
    level,
    section: 'listening',
    mondaiId: 'L1',
    mondaiTitle: '問題1・課題理解 (Task-Based Listening)',
    prompt: `駅で 女の人と 駅員が 話して います。女の人は 何番線へ 行きますか。`,
    audio: `えきで、おんなのひとと、えきいんが はなしています。おんなのひとは、なんばんせんへ いきますか。……F:すみません、${dest.kana}へ いく でんしゃは、なんばんせんですか。……M:いつもは ${oldTrack.k}ですが、きょうは こうじの ため、${newTrack.k}から でます。……F:わかりました。ありがとうございます。`,
    transcript: `女：すみません、${dest.jp}へ 行く 電車は 何番線ですか。\n駅員：いつもは ${oldTrack.n}ですが、今日は 工事の ため、${newTrack.n}から 出ます。\n女：わかりました。ありがとうございます。`,
    options: d3Opts.options,
    answer: d3Opts.answer,
    explain: `Usually it leaves from ${oldTrack.n}, but today it leaves from ${newTrack.n} (${newTrack.k}).`,
  });

  // Dynamic 4: Meeting Time & Place Change
  const times = shuffle([
    { jp: '午前 9時半', k: 'ごぜん くじはん' },
    { jp: '午前 10時', k: 'ごぜん じゅうじ' },
    { jp: '午前 11時', k: 'ごぜん じゅういちじ' },
    { jp: '午後 1時半', k: 'ごご いちじはん' },
  ]);
  const firstTime = times[0];
  const finalTime = times[1];
  const d4Opts = shuffleOptions(times.map((t) => t.jp), 1);
  dynamicDialogues.push({
    id: `l-dyn-time-${finalTime.jp}`,
    fingerprint: `l-dyn-time-${finalTime.jp}`,
    level,
    section: 'listening',
    mondaiId: 'L2',
    mondaiTitle: '問題2・ポイント理解 (Point Comprehension)',
    prompt: '男の人と 女の人が あしたの 約束について 話して います。二人は 何時に 会いますか。',
    audio: `おとこのひとと、おんなのひとが はなしています。ふたりは、なんじに あいますか。……F:あしたは、${firstTime.k}に えきの まえで あいましょうか。……M:ごめん、${firstTime.k}は すこし むずかしいんだ。${finalTime.k}でも いいですか。……F:いいですよ。じゃあ、${finalTime.k}に しましょう。`,
    transcript: `女：あしたは ${firstTime.jp}に 駅の 前で 会いましょうか。\n男：ごめん、${firstTime.jp}は 少し むずかしいんだ。${finalTime.jp}でも いいですか。\n女：いいですよ。じゃあ、${finalTime.jp}に しましょう。`,
    options: d4Opts.options,
    answer: d4Opts.answer,
    explain: `They change the meeting time from ${firstTime.jp} to ${finalTime.jp} (${finalTime.k}).`,
  });

  // Dynamic 5: Floor Directory Lookup
  const depts = shuffle([
    { item: 'カメラ売り場', kana: 'カメラうりば', floor: '5階', floorKana: 'ごかい' },
    { item: '本屋', kana: 'ほんや', floor: '6階', floorKana: 'ろっかい' },
    { item: 'レストラン', kana: 'レストラン', floor: '8階', floorKana: 'はっかい' },
    { item: 'くつ売り場', kana: 'くつうりば', floor: '3階', floorKana: 'さんがい' },
  ]);
  const targetDept = depts[0];
  const otherDept = depts[1];
  const d5Opts = shuffleOptions(depts.map((d) => d.floor), 0);
  dynamicDialogues.push({
    id: `l-dyn-floor-${targetDept.item}-${targetDept.floor}`,
    fingerprint: `l-dyn-floor-${targetDept.item}-${targetDept.floor}`,
    level,
    section: 'listening',
    mondaiId: 'L2',
    mondaiTitle: '問題2・ポイント理解 (Point Comprehension)',
    prompt: `デパートで 男の人と 店員が 話して います。「${targetDept.item}」は 何階ですか。`,
    audio: `デパートで、おとこのひとと、てんいんが はなしています。${targetDept.kana}は なんがいですか。……M:すみません、${targetDept.kana}は ${otherDept.floorKana}ですか。……F:いいえ、${otherDept.floorKana}は ${otherDept.kana}です。${targetDept.kana}は ${targetDept.floorKana}に ございます。`,
    transcript: `男：すみません、${targetDept.item}は ${otherDept.floor}ですか。\n店員：いいえ、${otherDept.floor}は ${otherDept.item}です。${targetDept.item}は ${targetDept.floor}に ございます。`,
    options: d5Opts.options,
    answer: d5Opts.answer,
    explain: `${otherDept.floor} is ${otherDept.item}; ${targetDept.item} is on ${targetDept.floor} (${targetDept.floorKana}).`,
  });

  // Dynamic 6: Appointment Date (Testing Irregular Calendar Days)
  const calDays = shuffle([
    { jp: '4月4日', k: 'しがつ よっか' },
    { jp: '4月8日', k: 'しがつ ようか' },
    { jp: '4月14日', k: 'しがつ じゅうよっか' },
    { jp: '4月20日', k: 'しがつ はつか' },
  ]);
  const targetDate = calDays[0];
  const wrongDate = calDays[1];
  const d6Opts = shuffleOptions(calDays.map((d) => d.jp), 0);
  dynamicDialogues.push({
    id: `l-dyn-date-${targetDate.jp}`,
    fingerprint: `l-dyn-date-${targetDate.jp}`,
    level,
    section: 'listening',
    mondaiId: 'L2',
    mondaiTitle: '問題2・ポイント理解 (Point Comprehension)',
    prompt: '病院で 女の人と 受付の 人が 話して います。次の 予約は いつですか。',
    audio: `びょういんで、おんなのひとと、うけつけの ひとが はなしています。つぎの よやくは いつですか。……M:つぎは、${wrongDate.k}に きて ください。……F:すみません、${wrongDate.k}は しごとが あります。……M:では、${targetDate.k}は どうですか。……F:はい、${targetDate.k}なら だいじょうぶです。おねがいします。`,
    transcript: `受付：次は ${wrongDate.jp}に 来て ください。\n女：すみません、${wrongDate.jp}は 仕事が あります。\n受付：では、${targetDate.jp}は どうですか。\n女：はい、${targetDate.jp}なら 大丈夫です。おねがいします。`,
    options: d6Opts.options,
    answer: d6Opts.answer,
    explain: `She cannot make ${wrongDate.jp} (${wrongDate.k}) and books ${targetDate.jp} (${targetDate.k}).`,
  });

  // Dynamic 7: Transport Mode Choice (Why taking X instead of Y)
  const modes = shuffle([
    { jp: 'バス', k: 'バス', reason: 'やすい', reasonJp: '安い' },
    { jp: '新幹線', k: 'しんかんせん', reason: 'はやい', reasonJp: '速い' },
    { jp: '電車', k: 'でんしゃ', reason: 'べんり', reasonJp: '便利' },
    { jp: 'タクシー', k: 'タクシー', reason: 'にもつが おおい', reasonJp: '荷物が 多い' },
  ]);
  const pickMode = modes[0];
  const altMode = modes[1];
  const d7Opts = shuffleOptions(modes.map((m) => m.jp), 0);
  dynamicDialogues.push({
    id: `l-dyn-trans-${pickMode.jp}`,
    fingerprint: `l-dyn-trans-${pickMode.jp}`,
    level,
    section: 'listening',
    mondaiId: 'L1',
    mondaiTitle: '問題1・課題理解 (Task-Based Listening)',
    prompt: '男の人と 女の人が 旅行について 話して います。二人は 何で 行きますか。',
    audio: `おとこのひとと、おんなのひとが はなしています。ふたりは、なんで いきますか。……M:らいしゅうの りょこう、${altMode.k}で いく？……F:うーん、${pickMode.k}の ほうが ${pickMode.reason}から、${pickMode.k}に しようよ。……M:そうだね、そうしよう。`,
    transcript: `男：来週の 旅行、${altMode.jp}で 行く？\n女：うーん、${pickMode.jp}の ほうが ${pickMode.reasonJp}から、${pickMode.jp}に しようよ。\n男：そうだね、そうしよう。`,
    options: d7Opts.options,
    answer: d7Opts.answer,
    explain: `They choose ${pickMode.jp} because ${pickMode.jp}のほうが ${pickMode.reasonJp}.`,
  });

  // Dynamic 8: Party Preparation Task Assignment
  const tasks = shuffle([
    { jp: '飲み物を 買う', k: 'のみものを かう' },
    { jp: 'ケーキを 作る', k: 'ケーキを つくる' },
    { jp: '部屋を そうじする', k: 'へやを そうじする' },
    { jp: 'お皿を ならべる', k: 'おさらを ならべる' },
  ]);
  const manTask = tasks[0];
  const womanTask = tasks[1];
  const d8Opts = shuffleOptions(tasks.map((t) => t.jp), 0);
  dynamicDialogues.push({
    id: `l-dyn-party-${manTask.jp}`,
    fingerprint: `l-dyn-party-${manTask.jp}`,
    level,
    section: 'listening',
    mondaiId: 'L1',
    mondaiTitle: '問題1・課題理解 (Task-Based Listening)',
    prompt: '男の人と 女の人が パーティーの 準備を して います。男の人は これから 何を しますか。',
    audio: `おとこのひとと、おんなのひとが はなしています。おとこのひとは、これから なにを しますか。……M:パーティーの じゅんび、なにを てつだおうか。${womanTask.k}？……F:ありがとう。それは わたしが やるから、えきの まえの スーパーで、${manTask.k}のを おねがい。……M:わかった。いって くるね。`,
    transcript: `男：パーティーの 準備、何を 手伝おうか。${womanTask.jp}？\n女：ありがとう。それは 私が やるから、駅の 前の スーパーで ${manTask.jp}のを おねがい。\n男：わかった。行って 来るね。`,
    options: d8Opts.options,
    answer: d8Opts.answer,
    explain: `The woman does ${womanTask.jp} herself and asks the man to ${manTask.jp}.`,
  });

  // Dynamic 9: Weather Forecast Transition (Morning vs Afternoon)
  const weathers = shuffle([
    { jp: '晴れますが、午後から 雨が 降ります', k: 'あさは はれますが、ごごから あめが ふります', ans: '午前は 晴れ、午後は 雨' },
    { jp: '雨が 降りますが、昼から 晴れます', k: 'あさは あめが ふりますが、ひるから はれます', ans: '午前は 雨、午後は 晴れ' },
    { jp: '一日中 くもりで、夜は 雪が 降ります', k: 'いちにちじゅう くもりで、よるは ゆきが ふります', ans: '昼は くもり、夜は 雪' },
    { jp: '朝から 晩まで いい 天気です', k: 'あさから ばんまで、ずっと いい てんきです', ans: '一日中 晴れ' },
  ]);
  const wPick = weathers[0];
  const d9Opts = shuffleOptions(weathers.map((w) => w.ans), 0);
  dynamicDialogues.push({
    id: `l-dyn-weather-${wPick.ans}`,
    fingerprint: `l-dyn-weather-${wPick.ans}`,
    level,
    section: 'listening',
    mondaiId: 'L2',
    mondaiTitle: '問題2・ポイント理解 (Point Comprehension)',
    prompt: 'テレビの 天気予報を 聞いて います。あしたの 天気は どうなりますか。',
    audio: `テレビの てんきよほうを きいています。あしたの てんきは どうなりますか。……F:あしたの とうきょうの てんきです。${wPick.k}。でかける ときは 気をつけて ください。`,
    transcript: `アナウンサー：あしたの 東京の 天気です。${wPick.jp}。出かける ときは 気をつけて ください。`,
    options: d9Opts.options,
    answer: d9Opts.answer,
    explain: `The forecast states: 「${wPick.jp}」 → ${wPick.ans}.`,
  });

  // Static Task & Point Listening Pool
  const taskAndPointStatic = [
    {
      fp: 'l-tp-1',
      mondaiId: 'L1',
      mondaiTitle: '問題1・課題理解 (Task-Based Listening)',
      prompt: '学校で 先生が 話して います。学生は あした 何を 持って 来ますか。',
      audio: 'がっこうで、せんせいが はなしています。がくせいは、あした なにを もって きますか。……M:あしたは、こうえんで えを かきます。えんぴつと、おべんとうを もって きて ください。ノートは いりません。',
      transcript: '先生：あしたは 公園で 絵を かきます。鉛筆と お弁当を 持って 来て ください。ノートは いりません。',
      opts: ['鉛筆と お弁当', 'ノートと お弁当', '鉛筆と ノート', 'お弁当だけ'],
      exp: 'The teacher asks for えんぴつと おべんとう and says ノートは いりません.',
    },
    {
      fp: 'l-tp-2',
      mondaiId: 'L1',
      mondaiTitle: '問題1・課題理解 (Task-Based Listening)',
      prompt: '図書館で 男の人と 係の 人が 話して います。男の人は まず 何を しますか。',
      audio: 'としょかんで、おとこのひとと、かかりの ひとが はなしています。おとこのひとは、まず なにを しますか。……M:すみません、はじめて ほんを かりたいんですが。……F:では、まず こちらの かみに、おなまえと でんわばんごうを かいて ください。そのあとで、カードを つくります。',
      transcript: '男：すみません、初めて 本を 借りたいんですが。\n係員：では、まず こちらの 紙に お名前と 電話番号を 書いて ください。そのあとで カードを 作ります。',
      opts: ['紙に 名前と 電話番号を 書く', '本を 棚から えらぶ', 'お金を 払う', 'コピーを とる'],
      exp: 'The staff member says 「まず こちらの かみに、おなまえと でんわばんごうを かいて ください」.',
    },
    {
      fp: 'l-tp-3',
      mondaiId: 'L1',
      mondaiTitle: '問題1・課題理解 (Task-Based Listening)',
      prompt: '家で 母と 男の子が 話して います。男の子は これから 何を しますか。',
      audio: 'いえで、ははと おとこのこが はなしています。おとこのこは、これから なにを しますか。……F:もう ばんごはんが できるよ。てを あらって きて。……M:いま しゅくだいを して いるところだよ。……F:しゅくだいは ごはんの あとで いいから、さきに てを あらって。……M:わかった。',
      transcript: '母：もう 晩ご飯が できるよ。手を 洗って 来て。\n男の子：今 宿題を して いるところだよ。\n母：宿題は ご飯の 後で いいから、先に 手を 洗って。\n男の子：わかった。',
      opts: ['手を 洗う', '宿題を つづける', 'テレビを 見る', '買い物を する'],
      exp: 'His mother tells him homework can wait until after dinner: 「さきに てを あらって」.',
    },
    {
      fp: 'l-tp-4',
      mondaiId: 'L1',
      mondaiTitle: '問題1・課題理解 (Task-Based Listening)',
      prompt: '薬局で 女の人と 薬剤師が 話して います。女の人は いつ 薬を 飲みますか。',
      audio: 'やっきょくで、おんなのひとと、やくざいしが はなしています。おんなのひとは、いつ くすりを のみますか。……F:この しろい くすりは、いちにちに なんかい のみますか。……M:あさと よるの にかい、ごはんを たべた あとで のんで ください。ひるは のまないで ください。',
      transcript: '女：この 白い 薬は 1日に 何回 飲みますか。\n薬剤師：朝と 夜の 2回、ご飯を 食べた 後で 飲んで ください。昼は 飲まないで ください。',
      opts: ['朝と 夜、ご飯の 後', '朝・昼・晩の 3回', '昼ご飯の 前だけ', '寝る 前だけ'],
      exp: 'The pharmacist says 「あさと よるの にかい、ごはんを たべた あとで のんで ください」.',
    },
    {
      fp: 'l-tp-5',
      mondaiId: 'L2',
      mondaiTitle: '問題2・ポイント理解 (Point Comprehension)',
      prompt: '旅館で 女の人と スタッフが 話して います。女の人は 温泉に 入る 前に 何を しなければ なりませんか。',
      audio: 'りょかんで、おんなのひとと、スタッフが はなしています。……F:あのう、いまから おんせんに はいっても いいですか。……M:はい、どうぞ。あ、おゆに はいる まえに、かならず からだを あらって くださいね。',
      transcript: '女：あのう、今から 温泉に 入っても いいですか。\nスタッフ：はい、どうぞ。あ、お湯に 入る 前に、必ず 体を 洗って くださいね。',
      opts: ['体を 洗う', '晩ご飯を 食べる', '3階へ 行く', 'きっぷを 買う'],
      exp: 'The staff reminds her: 「おゆに はいる まえに、かならず からだを あらって くださいね」.',
    },
    {
      fp: 'l-tp-6',
      mondaiId: 'L2',
      mondaiTitle: '問題2・ポイント理解 (Point Comprehension)',
      prompt: '男の人と 女の人が 話して います。女の人は どうして きのうの パーティーに 行きませんでしたか。',
      audio: 'おとこのひとと、おんなのひとが はなしています。……M:きのうの パーティー、たのしかったよ。どうして こなかったの。しごとが いそがしかった？……F:ううん、しごとは はやく おわったんだけど、あたまが いたくて、はやく ねたの。',
      transcript: '男：きのうの パーティー、楽しかったよ。どうして 来なかったの。仕事が 忙しかった？\n女：ううん、仕事は 早く 終わったんだけど、頭が 痛くて、早く 寝たの。',
      opts: ['頭が 痛かったから', '仕事が 忙しかったから', '電車が 止まったから', '約束を 忘れたから'],
      exp: 'She says 「あたまが いたくて、はやく ねたの」 (she had a headache and went to bed early).',
    },
    {
      fp: 'l-tp-7',
      mondaiId: 'L2',
      mondaiTitle: '問題2・ポイント理解 (Point Comprehension)',
      prompt: '駅で アナウンスが 流れて います。電車は どうして 遅れて いますか。',
      audio: 'えきで、アナウンスが ながれています。……M:ほんじつは、つよい あめの ため、でんしゃが じゅっぷんほど おくれて います。',
      transcript: 'アナウンス：本日は、強い 雨の ため、電車が 10分ほど 遅れて います。',
      opts: ['強い 雨の ため', '工事の ため', '雪の ため', '事故の ため'],
      exp: 'The announcement states 「つよい あめの ため」 (because of heavy rain).',
    },
  ].map((x): GeneratedExamQuestion => {
    const { options, answer } = shuffleOptions(x.opts, 0);
    return {
      id: x.fp,
      fingerprint: x.fp,
      level,
      section: 'listening',
      mondaiId: x.mondaiId,
      mondaiTitle: x.mondaiTitle,
      prompt: x.prompt,
      audio: x.audio,
      transcript: x.transcript,
      options,
      answer,
      explain: x.exp,
    };
  });

  // Combine dynamic + static for Mondai 1 (7 Qs) & Mondai 2 (6 Qs) = 13 Qs
  const m1AndM2 = pickUnseen([...dynamicDialogues, ...taskAndPointStatic], 13, seen);

  // 問題3・発話表現 (5 Questions: What do you say in this situation?)
  const utteranceItems = [
    {
      fp: 'l-utt-1',
      prompt: 'ご飯を 食べ終わりました。店の 人や 家族に 何と 言いますか。',
      audio: 'ごはんを たべおわりました。なんと言いますか。……F:いち、いただきます。……に、ごちそうさまでした。……さん、おだいじに。',
      opts: ['ごちそうさまでした。', 'いただきます。', 'おだいじに。'],
      exp: 'After finishing a meal, say 「ごちそうさまでした」 (before eating is いただきます).',
    },
    {
      fp: 'l-utt-2',
      prompt: '友だちの ペンを 借りたいです。友だちに 何と 言いますか。',
      audio: 'ともだちの ペンを かりたいです。なんと言いますか。……F:いち、この ペン、かして もらえませんか。……に、この ペン、あげましょうか。……さん、この ペン、返して ください。',
      opts: ['この ペン、貸して もらえませんか。', 'この ペン、あげましょうか。', 'この ペン、返して ください。'],
      exp: '貸して もらえませんか = Could you lend me (this pen)?',
    },
    {
      fp: 'l-utt-3',
      prompt: '先生の 先生の 話が 速くて わかりませんでした。先生に 何と 言いますか。',
      audio: 'せんせいの はなしが はやくて わかりませんでした。なんと言いますか。……F:いち、すみません、もういちど ゆっくり いって ください。……に、すみません、わたしが おしえましょうか。……さん、よく わかりました。',
      opts: ['すみません、もう一度 ゆっくり 言って ください。', 'すみません、私が 教えましょうか。', 'よく わかりました。'],
      exp: 'もう一度 ゆっくり 言って ください = Please say it slowly once more.',
    },
    {
      fp: 'l-utt-4',
      prompt: '友だちが かぜを ひいて 熱が あります。友だちに 何と 言いますか。',
      audio: 'ともだちが かぜを ひいて ねつが あります。なんと言いますか。……F:いち、おだいじに。……に、おめでとうございます。……さん、いってらっしゃい。',
      opts: ['お大事に。', 'おめでとうございます。', 'いってらっしゃい。'],
      exp: 'お大事に (おだいじに) = Take care / Get well soon.',
    },
    {
      fp: 'l-utt-5',
      prompt: '先生の 部屋に 入ります。ドアを ノックして 何と 言いますか。',
      audio: 'せんせいの へやに はいります。なんと言いますか。……F:いち、しつれいします。……に、ただいま。……さん、ごめんください。',
      opts: ['失礼します（しつれいします）。', 'ただいま。', 'おやすみなさい。'],
      exp: 'When entering a teacher’s or boss’s room, say 「失礼します」.',
    },
    {
      fp: 'l-utt-6',
      prompt: '電車の 中で 席を ゆずって もらいました。何と 言いますか。',
      audio: 'でんしゃの なかで、せきを ゆずって もらいました。なんと言いますか。……F:いち、すみません、ありがとうございます。……に、こちらへ どうぞ。……さん、どういたしまして。',
      opts: ['すみません、ありがとうございます。', 'こちらへ どうぞ。', 'どういたしまして。'],
      exp: 'When someone offers you their seat, thank them with 「すみません、ありがとうございます」.',
    },
  ].map((x): GeneratedExamQuestion => {
    const { options, answer } = shuffleOptions(x.opts, 0);
    return {
      id: x.fp,
      fingerprint: x.fp,
      level,
      section: 'listening',
      mondaiId: 'L3',
      mondaiTitle: '問題3・発話表現 (Utterance Expressions)',
      prompt: x.prompt,
      audio: x.audio,
      options,
      answer,
      explain: x.exp,
    };
  });

  const m3 = pickUnseen(utteranceItems, 5, seen);

  // 問題4・即時応答 (6 Questions: Immediate Response — Audio Prompt → Best Reply)
  const immediateItems = [
    {
      fp: 'l-imm-1',
      audio: 'F:すみません、いま なんじですか。',
      transcript: '「すみません、今 何時ですか。」',
      opts: ['午後 2時半です。', '2時間ぐらいです。', '200円です。'],
      exp: '「今 何時ですか」 (What time is it?) → 「午後 2時半です」.',
    },
    {
      fp: 'l-imm-2',
      audio: 'M:いっしょに ひるごはんを たべませんか。',
      transcript: '「いっしょに 昼ご飯を 食べませんか。」',
      opts: ['ええ、行きましょう。', 'はい、食べました。', 'どういたしまして。'],
      exp: '「〜ませんか」 invites someone → 「ええ、行きましょう」.',
    },
    {
      fp: 'l-imm-3',
      audio: 'F:にほんの おんせんに いった ことが ありますか。',
      transcript: '「日本の 温泉に 行った ことが ありますか。」',
      opts: ['いいえ、まだ 一度も ありません。', 'はい、来週 行く つもりです。', 'いいえ、行っては いけません。'],
      exp: '「〜たことが ありますか」 asks about past experience → 「いいえ、まだ 一度も ありません」.',
    },
    {
      fp: 'l-imm-4',
      audio: 'M:この かばん、おもそうですね。もちましょうか。',
      transcript: '「この かばん、重そうですね。持ちましょうか。」',
      opts: ['ありがとうございます。おねがいします。', 'はい、持っています。', 'いいえ、ちがいます。'],
      exp: '「持ちましょうか」 offers help ("Shall I carry it?") → 「ありがとうございます。おねがいします。」',
    },
    {
      fp: 'l-imm-5',
      audio: 'F:あしたの パーティーには、だれが きますか。',
      transcript: '「あしたの パーティーには、だれが 来ますか。」',
      opts: ['クラスの 友だちが みんな 来ますよ。', '駅の 前の レストランです。', '午後 6時から 始まります。'],
      exp: '「だれが 来ますか」 asks WHO is coming.',
    },
    {
      fp: 'l-imm-6',
      audio: 'M:すみません、まどを しめても いいですか。',
      transcript: '「すみません、窓を 閉めても いいですか。」',
      opts: ['ええ、どうぞ。少し 寒いですね。', 'はい、閉めませんでした。', 'いいえ、開いて いますよ。'],
      exp: '「閉めても いいですか」 asks permission to close the window → 「ええ、どうぞ」.',
    },
    {
      fp: 'l-imm-7',
      audio: 'F:きのうの テストは、どうでしたか。',
      transcript: '「きのうの テストは、どうでしたか。」',
      opts: ['漢字が 少し むずかしかったです。', '来週の 火曜日です。', '鉛筆で 書きました。'],
      exp: '「どうでしたか」 asks how the test was → 「漢字が 少し むずかしかったです」.',
    },
    {
      fp: 'l-imm-8',
      audio: 'M:おちゃを もう いっぱい いかがですか。',
      transcript: '「お茶を もう 一杯 いかがですか。」',
      opts: ['いいえ、もう けっこうです。ありがとうございます。', 'はい、1杯 飲みました。', 'お先に 失礼します。'],
      exp: '「もう一杯 いかがですか」 offers another cup of tea → 「いいえ、もう けっこうです」 (No thank you, I’ve had enough).',
    },
  ].map((x): GeneratedExamQuestion => {
    const { options, answer } = shuffleOptions(x.opts, 0);
    return {
      id: x.fp,
      fingerprint: x.fp,
      level,
      section: 'listening',
      mondaiId: 'L4',
      mondaiTitle: '問題4・即時応答 (Immediate Response)',
      prompt: '🔊 Listen to the spoken line and choose the most natural immediate response.',
      audio: x.audio,
      transcript: x.transcript,
      options,
      answer,
      explain: x.exp,
    };
  });

  const m4 = pickUnseen(immediateItems, 6, seen);

  return [...m1AndM2, ...m3, ...m4];
}

// ============================================================================
// MAIN EXAM BUILDER (67 Questions in Full Mode · 15 Questions in Express Mode)
// ============================================================================

export function generateFreshExam(level: ExamLevel, mode: 'full' | 'mini'): {
  questions: GeneratedExamQuestion[];
  seenCount: number;
} {
  const seen = getSeenFingerprints();
  const vocab = generateVocabQuestions(level, seen); // 21 Qs
  const grammar = generateGrammarReadingQuestions(level, seen); // 22 Qs
  const listening = generateListeningQuestions(level, seen); // 24 Qs

  let selected: GeneratedExamQuestion[];
  if (mode === 'full') {
    // Official 67-question distribution: 21 Vocab + 22 Grammar/Reading + 24 Listening
    selected = [...vocab, ...grammar, ...listening];
  } else {
    // Express 15-question mock: 5 Vocab + 5 Grammar/Reading + 5 Listening
    selected = [
      ...vocab.slice(0, 5),
      ...grammar.slice(0, 5),
      ...listening.slice(0, 5),
    ];
  }

  // Also mix in any unseen items from EXAM_QUESTIONS if needed
  void EXAM_QUESTIONS;

  markFingerprintsSeen(selected.map((q) => q.fingerprint));
  return {
    questions: selected,
    seenCount: getSeenFingerprints().size,
  };
}
