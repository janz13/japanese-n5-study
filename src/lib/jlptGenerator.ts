import { KANJI } from '../data/kanji';
import { COUNTERS } from '../data/counters';
import { CONJUGATIONS, FORM_LABELS, type ConjForm } from '../data/conjugations';
import { PARTICLES } from '../data/particles';
import { type ExamLevel, type ExamSection } from '../data/exam';

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
  answer: number;
  explain: string;
}

const SEEN_STORAGE_KEY = 'n5_seen_exam_fingerprints_v2';

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
    const arr = Array.from(seen).slice(-1200);
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

function shuffle<T>(arr: T[]): T[] {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

function pickOne<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function shuffleOptions(options: string[], answerIdx: number): { options: string[]; answer: number } {
  const tagged = options.map((opt, idx) => ({ opt, correct: idx === answerIdx }));
  const mixed = shuffle(tagged);
  return {
    options: mixed.map((m) => m.opt),
    answer: mixed.findIndex((m) => m.correct),
  };
}

function pickUnseen<T extends { fingerprint: string }>(pool: T[], count: number, seen: Set<string>): T[] {
  const unseen = shuffle(pool.filter((x) => !seen.has(x.fingerprint)));
  const already = shuffle(pool.filter((x) => seen.has(x.fingerprint)));
  return [...unseen, ...already].slice(0, count);
}

function makeReadingDistractors(correct: string, allReadings: string[]): string[] {
  const candidates = new Set<string>();
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
  ];
  for (const [re, rep] of swaps) {
    const mutated = correct.replace(re, rep);
    if (mutated && mutated !== correct && mutated.length >= 2) {
      candidates.add(mutated);
    }
  }
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
//   - 問題1: 漢字読み (7 Qs) — 200+ items (Kanji compounds + Counters + Conjugations)
//   - 問題2: 表記 (5 Qs) — 180+ items
//   - 問題3: 文脈規定 (5 Qs) — 25 parameterized scenario generators (150+ variants)
//   - 問題4: 言い換え類義 (4 Qs) — 24 synonym/antonym matrix generators (120+ variants)
// ============================================================================

function generateVocabQuestions(level: ExamLevel, seen: Set<string>): GeneratedExamQuestion[] {
  const kanjiPool = KANJI.filter((k) => (level === 'N5' ? k.level === 'N5' : true));
  const allReadings = kanjiPool.map((k) => k.ex.r);
  const subjects = ['私は', '友だちは', '兄は', '姉は', '田中さんは', '母は'];
  const times = ['きのう', '先週', 'まいにち', '今朝', '週末に'];

  // 1. 問題1・漢字読み (7 Questions from 150 Kanji + 51 Counters + 35 Verbs)
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
    const sameGroup = COUNTERS.filter((x) => x.group === c.group && x.kana !== c.kana).map((x) => x.kana);
    const d = makeReadingDistractors(c.kana, sameGroup.length >= 3 ? sameGroup : allReadings);
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
  const orthoPool: GeneratedExamQuestion[] = kanjiPool.map((k) => {
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

  // 3. 問題3・文脈規定 (5 Questions from 25 Parameterized Scenario Archetypes!)
  const ctxArchetypes = [
    { id: 'ctx-thirst', p: () => `のどが かわきましたから、冷たい ${pickOne(['みず', 'おちゃ', 'ジュース'])}を（　）。`, opts: ['のみます', 'たべます', 'きます', 'はきます'], exp: 'のどが かわく = thirsty → のみます (drink).' },
    { id: 'ctx-dark', p: () => `${pickOne(['へや', 'きょうしつ', 'だいどころ'])}が くらいですから、でんきを（　）ください。`, opts: ['つけて', 'けして', 'あけて', 'しめて'], exp: 'くらい = dark → でんきを つけて (turn on the light).' },
    { id: 'ctx-study', p: () => `あしたは ${pickOne(['テスト', 'しけん'])}が ありますから、今晩は よく（　）します。`, opts: ['べんきょう', 'さんぽ', 'りょこう', 'せんたく'], exp: 'Before an exam, you study (べんきょうします).' },
    { id: 'ctx-photo', p: () => `${pickOne(times)} ${pickOne(['カメラ', 'スマホ'])}で きれいな（　）を とりました。`, opts: ['しゃしん', 'てがみ', 'きっぷ', 'しんぶん'], exp: '写真を とる (しゃしんを とる) = take a photo.' },
    { id: 'ctx-coat', p: () => `外は さむいですから、あたたかい ${pickOne(['コート', 'セーター', 'ジャケット'])}を（　）出かけます。`, opts: ['きて', 'はいて', 'かぶって', 'かけて'], exp: 'Upper-body clothing uses 着る (きて).' },
    { id: 'ctx-shoes', p: () => `あたらしい ${pickOne(['くつ', 'くつした', 'ズボン'])}を（　）出かけました。`, opts: ['はいて', 'きて', 'かぶって', 'かけて'], exp: 'Footwear and lower-body clothing use はく (はいて).' },
    { id: 'ctx-hat', p: () => `天気が いいですから、しろい（　）を かぶって 散歩します。`, opts: ['ぼうし', 'めがね', 'くつ', 'ネクタイ'], exp: '帽子を かぶる (ぼうしを かぶる) = wear a hat.' },
    { id: 'ctx-glasses', p: () => `小さい 字が 見えませんから、（　）を かけます。`, opts: ['めがね', 'ぼうし', 'くつ', 'シャツ'], exp: 'めがねを かける = put on glasses.' },
    { id: 'ctx-dict', p: () => `この 言葉の 意味が わかりませんから、（　）で しらべます。`, opts: ['じしょ', 'さいふ', 'かばん', 'とけい'], exp: '辞書 (じしょ) = dictionary.' },
    { id: 'ctx-wallet', p: () => `買い物を したいですが、（　）に お金が ありません。`, opts: ['さいふ', 'じしょ', 'かさ', 'ぼうし'], exp: '財布 (さいふ) = wallet.' },
    { id: 'ctx-ticket', p: () => `駅で ${pickOne(['新幹線', '電車'])}の（　）を 買いました。`, opts: ['きっぷ', 'きって', 'はがき', 'ふうとう'], exp: 'きっぷ (切符) = train ticket; きって (切手) = postage stamp.' },
    { id: 'ctx-stamp', p: () => `郵便局で 手紙に はる（　）を 買いました。`, opts: ['きって', 'きっぷ', 'ざっし', 'しんぶん'], exp: 'きって (切手) = postage stamp.' },
    { id: 'ctx-elev', p: () => `荷物が おもいですから、（　）で 5階へ あがりました。`, opts: ['エレベーター', 'タクシー', 'カレンダー', 'テーブル'], exp: 'エレベーター = elevator.' },
    { id: 'ctx-umbrella', p: () => `外は 雨が ふっていますから、（　）を さして 歩きます。`, opts: ['かさ', 'くつ', 'ぼうし', 'かばん'], exp: '傘を さす (かさを さす) = hold up an umbrella.' },
    { id: 'ctx-wash', p: () => `ご飯を 食べる 前に、石けんで 手を（　）ください。`, opts: ['あらって', 'みがいて', 'きって', 'うたって'], exp: '手を 洗う (あらう) = wash hands.' },
    { id: 'ctx-teeth', p: () => `毎晩 寝る 前に、かならず 歯（は）を（　）。`, opts: ['みがきます', 'あらいます', 'きります', 'かぶります'], exp: '歯を みがく = brush teeth.' },
    { id: 'ctx-fever', p: () => `きのうから 頭が 痛くて、すこし（　）が あります。`, opts: ['熱（ねつ）', '薬（くすり）', '予約（よやく）', '元気（げんき）'], exp: '熱が あります = have a fever.' },
    { id: 'ctx-reserve', p: () => `来週の 旅行の 前に、ホテルの 部屋を（　）しました。`, opts: ['予約（よやく）', '案内（あんない）', '紹介（しょうかい）', '洗濯（せんたく）'], exp: '予約する = book/reserve in advance.' },
    { id: 'ctx-crowded', p: () => `朝の 電車は とても（　）いて、座れませんでした。`, opts: ['こんで', 'すいて', 'あいて', 'きえて'], exp: 'こんで いる (混んでいる) = crowded.' },
    { id: 'ctx-forget', p: () => `急いで いたので、電車の 中に かさを（　）しまいました。`, opts: ['わすれて', 'おぼえて', 'ひろって', 'あつめて'], exp: 'わすれる = leave behind / forget.' },
    { id: 'ctx-stop', p: () => `信号が 赤に なりましたから、車を（　）ください。`, opts: ['とめて', 'きめて', 'あつめて', 'つづけて'], exp: '車を 止める (とめる) = stop a vehicle.' },
    { id: 'ctx-borrow', p: () => `図書館で 日本の 小説を 3さつ（　）。`, opts: ['かりました', 'かしました', 'かえしました', 'おしえました'], exp: '本を 借りる (かりる) = borrow books.' },
    { id: 'ctx-hot-window', p: () => `部屋が あついですから、窓を（　）もいいですか。`, opts: ['あけて', 'しめて', 'つけて', 'けして'], exp: '窓を 開ける (あける) = open the window.' },
    { id: 'ctx-quiet', p: () => `図書館の 中では、（　）に して ください。`, opts: ['しずか', 'にぎやか', 'げんき', 'べんり'], exp: '静かに する (しずかに する) = be quiet.' },
  ];

  const ctxPool: GeneratedExamQuestion[] = ctxArchetypes.map((a) => {
    const prompt = a.p();
    const { options, answer } = shuffleOptions(a.opts, 0);
    return {
      id: a.id,
      fingerprint: `${a.id}-${prompt}`,
      level,
      section: 'vocab',
      mondaiId: 'V3',
      mondaiTitle: '問題3・文脈規定 (Context Vocabulary)',
      prompt,
      options,
      answer,
      explain: a.exp,
    };
  });

  const m3 = pickUnseen(ctxPool, 5, seen);

  // 4. 問題4・言い換え類義 (4 Questions from 22 Synonym / Antonym-Negation Generators!)
  const paraArchetypes = [
    { id: 'para-clean', n: () => pickOne(['この 部屋', 'あの ホテル', '学校の トイレ']), p: (n: string) => `「${n}は きれいです。」`, good: (n: string) => `${n}は きたなくないです。`, bad: (n: string) => [`${n}は ひろくないです。`, `${n}は しずかです。`, `${n}は くらいです。`], exp: 'きれい (clean) = きたなくない (not dirty).' },
    { id: 'para-easy', n: () => pickOne(['きのうの テスト', 'この 問題', '今日の 宿題']), p: (n: string) => `「${n}は やさしかったです。」`, good: (n: string) => `${n}は むずかしくなかったです。`, bad: (n: string) => [`${n}は みじかくなかったです。`, `${n}は ながかったです。`, `${n}は つまらなかったです。`], exp: 'やさしい (easy) = むずかしくない (not difficult).' },
    { id: 'para-free', n: () => pickOne(['あした', '今週の 日曜日', '来週の 土曜日']), p: (n: string) => `「${n}は ひまです。」`, good: (n: string) => `${n}は 予定（よてい）が ありません。`, bad: (n: string) => [`${n}は とても いそがしいです。`, `${n}は テストが あります。`, `${n}は びょうきです。`], exp: 'ひま (free time) = 予定がない (no plans).' },
    { id: 'para-late', n: () => pickOne(['父', '兄', '姉']), p: (n: string) => `「${n}は 毎晩 おそく 帰ります。」`, good: (n: string) => `${n}は 毎晩 11時ごろ 家に 帰ります。`, bad: (n: string) => [`${n}は 毎朝 6時に 会社へ 行きます。`, `${n}は 毎晩 8時に 寝ます。`, `${n}は 週末 家に います。`], exp: 'おそく 帰る = return home late at night.' },
    { id: 'para-next', n: () => pickOne(['パン屋', '薬局', '本屋', '銀行']), p: (n: string) => `「駅の となりに ${n}が あります。」`, good: (n: string) => `駅の すぐ よこに ${n}が あります。`, bad: (n: string) => [`駅の とおくに ${n}が あります。`, `駅の なかに ${n}が あります。`, `駅の 3階に ${n}が あります。`], exp: 'となり (next to) = すぐ よこ (right beside).' },
    { id: 'para-many', n: () => pickOne(['この カフェ', 'あの レストラン', 'この 公園']), p: (n: string) => `「${n}は いつも 人が おおいです。」`, good: (n: string) => `${n}には いつも たくさんの 人が います。`, bad: (n: string) => [`${n}には 人が あまり いません。`, `${n}は とても せまいです。`, `${n}は 値段が 高いです。`], exp: '人が おおい = たくさんの 人が います.' },
    { id: 'para-near', n: () => pickOne(['学校', 'スーパー', '病院']), p: (n: string) => `「家から ${n}まで ちかいです。」`, good: (n: string) => `家から ${n}まで とおくないです。`, bad: (n: string) => [`家から ${n}まで 2時間 かかります。`, `${n}は とても 新しいです。`, `${n}の 前に バスが あります。`], exp: 'ちかい (near) = とおくない (not far).' },
    { id: 'para-cheap', n: () => pickOne(['この かばん', 'あの 時計', 'この カメラ']), p: (n: string) => `「${n}は やすいです。」`, good: (n: string) => `${n}は 高くないです。`, bad: (n: string) => [`${n}は かるくないです。`, `${n}は 古くないです。`, `${n}は 大きくないです。`], exp: 'やすい (cheap) = 高くない (not expensive).' },
    { id: 'para-quiet', n: () => pickOne(['この 図書館', 'わたしの 町', '夜の 公園']), p: (n: string) => `「${n}は しずかです。」`, good: (n: string) => `${n}は うるさくないです。`, bad: (n: string) => [`${n}は くらいです。`, `${n}は さむくないです。`, `${n}は せまいです。`], exp: 'しずか (quiet) = うるさくない (not noisy).' },
    { id: 'para-finally', n: () => pickOne(['この 仕事', 'レポート', '部屋の そうじ']), p: (n: string) => `「${n}が やっと 終わりました。」`, good: (n: string) => `たいへんでしたが、最後に ${n}が 終わりました。`, bad: (n: string) => [`${n}が すぐに かんたんに 終わりました。`, `${n}は まだ 終わって いません。`, `これから ${n}を 始めます。`], exp: 'やっと = finally / at last after effort.' },
    { id: 'para-book', n: () => pickOne(['旅館の 部屋', '新幹線の 席', 'レストラン']), p: (n: string) => `「${n}を 予約しました。」`, good: (n: string) => `行く 前に 連絡して、${n}を とりました。`, bad: (n: string) => [`${n}を そうじしました。`, `${n}から 家へ 帰りました。`, `${n}の 写真を とりました。`], exp: '予約する = book/reserve ahead of time.' },
    { id: 'para-gradual', n: () => pickOne(['日本語', '料理', 'ピアノ']), p: (n: string) => `「${ pickOne(subjects) } だんだん ${n}が 上手に なりました。」`, good: (n: string) => `少しずつ ${n}が うまく できる ように なりました。`, bad: (n: string) => [`最初から ${n}が とても 上手でした。`, `${n}を 全然 練習しませんでした。`, `${n}の 勉強を やめました。`], exp: 'だんだん 上手に なる = gradually become skilled.' },
  ];

  const paraPool: GeneratedExamQuestion[] = paraArchetypes.map((a) => {
    const noun = a.n();
    const prompt = `${a.p(noun)} — いちばん 近い 意味は どれですか。`;
    const { options, answer } = shuffleOptions([a.good(noun), ...a.bad(noun)], 0);
    return {
      id: a.id,
      fingerprint: `${a.id}-${noun}`,
      level,
      section: 'vocab',
      mondaiId: 'V4',
      mondaiTitle: '問題4・言い換え類義 (Closest Meaning)',
      prompt,
      options,
      answer,
      explain: a.exp,
    };
  });

  const m4 = pickUnseen(paraPool, 4, seen);

  return [...m1, ...m2, ...m3, ...m4];
}

// ============================================================================
// PART 2 GENERATORS: 文法・読解 (22 Questions in Official Full Exam)
//   - 問題1: 文の文法1 (9 Qs) — Particles + Procedural Conjugation Frames (180+ items)
//   - 問題2: 文の組み立て ★ Star Puzzle (4 Qs) — 20 templates × dynamic ★ slot
//   - 問題3: 文章の文法 Cloze Text (3 Qs) — 5 distinct multi-blank passages
//   - 問題4: 内容理解（短文）Short Passages (3 Qs) — 6 parameterized notice generators
//   - 問題5: 内容理解（中文）Mid Passage (2 Qs) — 4 distinct multi-paragraph stories
//   - 問題6: 情報検索 Information Retrieval (1 Q) — 4 dynamic table/flyer generators
// ============================================================================

function generateGrammarReadingQuestions(level: ExamLevel, seen: Set<string>): GeneratedExamQuestion[] {
  // 1. 問題1・文の文法1 (9 Questions: Particles + Procedural Verb/Adj Conjugation Frames!)
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

  // Procedural Verb/Adjective Grammar Frames from CONJUGATIONS
  const frameDefs: { form: ConjForm; suffix: string; enSuffix: string; lv: ExamLevel }[] = [
    { form: 'te', suffix: 'ください。', enSuffix: 'Please do/be ~', lv: 'N5' },
    { form: 'te', suffix: 'も いいですか。', enSuffix: 'May I ~?', lv: 'N5' },
    { form: 'negative', suffix: 'で ください。', enSuffix: 'Please do not ~', lv: 'N5' },
    { form: 'past', suffix: 'ことが あります。', enSuffix: 'I have the experience of ~', lv: 'N4' },
    { form: 'te', suffix: 'は いけません。', enSuffix: 'You must not ~', lv: 'N4' },
    { form: 'politePast', suffix: '。きのうの ことです。', enSuffix: 'Polite past (~ました / ~でした)', lv: 'N5' },
  ];

  const conjGrammarPool: GeneratedExamQuestion[] = [];
  for (const w of CONJUGATIONS) {
    if (w.group === 'i-adj' || w.group === 'na-adj') {
      // Past polite adjective question
      const correct = w.forms.past.kanji;
      const distractors = [w.forms.polite.kanji, w.forms.te.kanji, w.forms.negative.kanji];
      const { options, answer } = shuffleOptions([correct, ...distractors], 0);
      conjGrammarPool.push({
        id: `g-conj-adj-${w.id}`,
        fingerprint: `g-conj-adj-${w.id}`,
        level,
        section: 'grammar',
        mondaiId: 'G1',
        mondaiTitle: '問題1・文の文法1 (Sentence Grammar)',
        prompt: `きのうは とても（　）です。 (${w.en} — past)`,
        options,
        answer,
        explain: `${w.dict} (${w.en}) in past form is ${correct} (${w.forms.past.rule}).`,
      });
      continue;
    }
    const fDef = pickOne(frameDefs.filter((f) => (level === 'N5' ? f.lv === 'N5' : true)));
    const correct = w.forms[fDef.form].kanji;
    const otherForms = (['polite', 'te', 'negative', 'past'] as ConjForm[])
      .filter((f) => f !== fDef.form)
      .map((f) => w.forms[f].kanji);
    const { options, answer } = shuffleOptions([correct, ...otherForms], 0);
    conjGrammarPool.push({
      id: `g-conj-${w.id}-${fDef.form}`,
      fingerprint: `g-conj-${w.id}-${fDef.form}`,
      level,
      section: 'grammar',
      mondaiId: 'G1',
      mondaiTitle: '問題1・文の文法1 (Sentence Grammar)',
      prompt: `「${w.dict}（${w.en}）」 → （　）${fDef.suffix} (${fDef.enSuffix})`,
      options,
      answer,
      explain: `Before 「${fDef.suffix}」, use the ${FORM_LABELS[fDef.form].en}: ${correct} (${w.forms[fDef.form].rule}).`,
    });
  }

  const m1 = [
    ...pickUnseen(particleGrammarPool, 5, seen),
    ...pickUnseen(conjGrammarPool, 4, seen),
  ];

  // 2. 問題2・文の組み立て ★ Star Puzzle (4 Questions from 18 templates × 2 star slots = 36 variants)
  const starTemplates = [
    { fp: 'star-1', head: 'きのう', tail: '買いました。', chunks: ['駅の', '近くの', '店で', 'かばんを'], en: 'Yesterday I bought a bag at a shop near the station.' },
    { fp: 'star-2', head: '週末は', tail: 'したいです。', chunks: ['お寺を', '見たり', '抹茶を', '飲んだり'], en: 'On the weekend I want to do things like see temples and drink matcha.' },
    { fp: 'star-3', head: 'この', tail: 'ください。', chunks: ['紙に', '黒い', 'ペンで', '名前を 書いて'], en: 'Please write your name on this paper with a black pen.' },
    { fp: 'star-4', head: '私は', tail: '行きます。', chunks: ['毎朝', '八時に', '電車で', '会社へ'], en: 'Every morning I go to the company by train at 8:00.' },
    { fp: 'star-5', head: '東京の', tail: '多いです。', chunks: ['ほうが', '私の', '町より', '人が'], en: 'Tokyo has more people than my town.' },
    { fp: 'star-6', head: 'あした', tail: '見ませんか。', chunks: ['駅の', '前で', '友だちと', '映画を'], en: 'Won’t you watch a movie with a friend in front of the station tomorrow?' },
    { fp: 'star-7', head: '毎日', tail: 'なりました。', chunks: ['練習したから', '難しい', '漢字が', '読めるように'], en: 'Because I practiced every day, I became able to read difficult kanji.' },
    { fp: 'star-8', head: 'この 薬は', tail: 'ください。', chunks: ['ご飯を', '食べた', '後で', '飲んで'], en: 'Please take this medicine after eating a meal.' },
    { fp: 'star-9', head: '来月', tail: 'つもりです。', chunks: ['友だちと', '新幹線で', '箱根へ', '行く'], en: 'Next month I intend to go to Hakone with my friend by bullet train.' },
    { fp: 'star-10', head: '温泉に', tail: 'なりません。', chunks: ['入る', '前に', '体を', '洗わなければ'], en: 'Before entering the hot spring, you must wash your body.' },
    { fp: 'star-11', head: '誕生日に', tail: 'くれました。', chunks: ['サクラさんが', '私に', 'きれいな', 'お守りを'], en: 'On my birthday Sakura gave me a pretty amulet.' },
    { fp: 'star-12', head: '図書館で', tail: '読みました。', chunks: ['借りた', '日本の', '歴史の', '本を'], en: 'I read a book on Japanese history that I borrowed at the library.' },
    { fp: 'star-13', head: 'すみません、', tail: 'いいですか。', chunks: ['少し', '暑いから', '窓を', '開けても'], en: 'Excuse me, since it is a bit hot, may I open the window?' },
    { fp: 'star-14', head: 'きのうは', tail: '寝ました。', chunks: ['頭が', '痛かったから', '九時に', '早く'], en: 'Yesterday because I had a headache, I went to bed early at 9:00.' },
    { fp: 'star-15', head: 'あの', tail: '人です。', chunks: ['めがねを', 'かけて', 'いる', '男の人は'], en: 'That man wearing glasses is a person (teacher).' },
    { fp: 'star-16', head: '冷蔵庫に', tail: 'ありません。', chunks: ['冷たい', '飲み物が', '何も', '入って'], en: 'There are no cold drinks in the refrigerator.' },
  ];

  const starPool: GeneratedExamQuestion[] = starTemplates.map((st) => {
    const starIdx = Math.random() < 0.5 ? 1 : 2;
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
      explain: `Full order: ${st.head} [${st.chunks.join('] [')}] ${st.tail} → ★ is 「${correctChunk}」.`,
    };
  });

  const m2 = pickUnseen(starPool, 4, seen);

  // 3. 問題3・文章の文法 (3 Questions in a Cloze Passage — 5 distinct Cloze passages rotated by seen history)
  const clozeSets = [
    {
      fp: 'cloze-1',
      passage:
        '【アナさんの 日記】\n先週の 土曜日、私は 友だちの サクラさんと 鎌倉へ 行きました。朝 9時に 東京駅で 会って、電車に 乗りました。鎌倉には 古い お寺が たくさん あります。【 1 】、海の 近くまで 歩きました。昼ご飯は 小さい レストランで 魚を 食べました。とても 【 2 】。帰りの 電車では 疲れて 寝て しまいました。また サクラさんと 【 3 】。',
      qs: [
        { slot: '【 1 】', opts: ['それから', 'だから', 'しかし', 'たとえば'], exp: 'それから ("after that") sequences visiting temples and walking to the sea.' },
        { slot: '【 2 】', opts: ['おいしかったです', 'おいしいです', 'おいしくて', 'おいしかったでした'], exp: 'Past tense for Saturday’s lunch: おいしかったです.' },
        { slot: '【 3 】', opts: ['行きたいです', '行きました', '行くからです', '行って ください'], exp: 'また〜行きたいです ("I want to go again").' },
      ],
    },
    {
      fp: 'cloze-2',
      passage:
        '【サクラさんへの 手紙】\nサクラさん、お元気ですか。私が 日本に 来てから、3か月に なりました。最初は 日本の 生活が 少し 大変でした。【 1 】、今は 毎日 楽しいです。学校の 先生も 友だちも とても 親切です。先週は 一人で 図書館へ 行って、日本の 本を 【 2 】。来月の 休みに、いっしょに 京都へ 【 3 】。',
      qs: [
        { slot: '【 1 】', opts: ['でも', 'だから', 'そして', 'それで'], exp: 'でも ("however") contrasts the difficult start with enjoying life now.' },
        { slot: '【 2 】', opts: ['借りました', '貸しました', '教えました', '習いました'], exp: 'At a library (図書館で), you borrow books: 借りました.' },
        { slot: '【 3 】', opts: ['行きませんか', '行きましたか', '行く つもりでした', '行っては いけません'], exp: '〜ませんか invites someone ("Won’t you go to Kyoto with me?").' },
      ],
    },
    {
      fp: 'cloze-3',
      passage:
        '【私の 趣味（しゅみ）】\n私の 趣味は 料理を 作る ことです。国に いた ときは、あまり 料理を 【 1 】。母が 毎日 作って くれたからです。日本に 来てからは、一人で 住んで いるので、毎日 自分で 晩ご飯を 作ります。最初は 難しかったですが、今は 日本の カレーや みそ汁も 【 2 】。来週の 日曜日は、友だちを 家に 呼んで、いっしょに ご飯を 【 3 】。',
      qs: [
        { slot: '【 1 】', opts: ['しませんでした', 'します', 'して います', 'したいです'], exp: '国に いた ときは (when I was in my home country) requires past negative: しませんでした.' },
        { slot: '【 2 】', opts: ['作れる ように なりました', '作る まえです', '作った ばかりです', '作っては いけません'], exp: '作れる ように なりました = became able to make.' },
        { slot: '【 3 】', opts: ['食べる つもりです', '食べた ことが あります', '食べて しまいました', '食べなければ なりません'], exp: '来週の 日曜日は…食べる つもりです (I plan to eat together next Sunday).' },
      ],
    },
    {
      fp: 'cloze-4',
      passage:
        '【自転車で 通学】\n私は 毎日 自転車で 学校へ 通って います。家から 学校まで 自転車で 15分ぐらい 【 1 】。バスで 行くと、道が こんで いる ときは 30分以上 かかる ことも あります。【 2 】、自転車の ほうが お金も かからなくて 便利です。ただし、雨が 降って いる 日は 危ないですから、自転車に 【 3 】、歩いて 駅まで 行きます。',
      qs: [
        { slot: '【 1 】', opts: ['かかります', 'かります', 'かいます', 'かえます'], exp: 'Time required uses かかります (takes 15 minutes).' },
        { slot: '【 2 】', opts: ['それに', 'しかし', 'けれども', 'なぜなら'], exp: 'それに ("moreover / besides") adds another advantage of cycling.' },
        { slot: '【 3 】', opts: ['乗らないで', '乗って', '乗りたいから', '乗る ために'], exp: '乗らないで ("without riding") explains walking on rainy days.' },
      ],
    },
  ];

  const unseenCloze = clozeSets.filter((c) => !seen.has(`${c.fp}-0`));
  const chosenCloze = pickOne(unseenCloze.length ? unseenCloze : clozeSets);
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

  // 4. 問題4・内容理解（短文） (3 Short Passages picked from 6 Parameterized Generators!)
  const shortGenerators: (() => GeneratedExamQuestion)[] = [
    () => {
      const h = pickOne([2, 3, 4, 5, 6]);
      const loc = pickOne([
        { jp: '駅の 東口', bad: ['駅の 西口', '喫茶店の 中', '本屋の 前'] },
        { jp: '白い ビルの 前', bad: ['駅の 改札', '公園の 入口', '学校の 前'] },
        { jp: '桜デパートの 1階', bad: ['桜デパートの 5階', '駅の 前', '映画館の 中'] },
      ]);
      const { options, answer } = shuffleOptions([loc.jp, ...loc.bad], 0);
      return {
        id: `r-s-memo-${h}-${loc.jp}`,
        fingerprint: `r-s-memo-${h}-${loc.jp}`,
        level,
        section: 'grammar',
        mondaiId: 'G4',
        mondaiTitle: '問題4・内容理解（短文）(Short Reading)',
        passage: `【メモ】\nけんさんへ\nきょうは 午後 ${h}時に ${loc.jp}で 待って います。会ってから いっしょに ご飯を 食べに 行きましょう。\n— アナ`,
        prompt: `アナさんは 午後 ${h}時に どこで けんさんを まちますか。`,
        options,
        answer,
        explain: `The memo says 「午後 ${h}時に ${loc.jp}で 待って います」.`,
      };
    },
    () => {
      const closed = pickOne(['月曜日', '火曜日', '水曜日', '木曜日']);
      const open = closed === '火曜日' ? '水曜日' : '火曜日';
      const limit = pickOne([3, 4, 5, 6, 8]);
      const { options, answer } = shuffleOptions(
        [
          `${open}の 午後 2時に 本を ${limit}さつ 借りる ことが できます。`,
          `${closed}の 午前 10時に 本を 借りる ことが できます。`,
          `一人で 本を ${limit + 4}さつ 借りる ことが できます。`,
          `夜 11時まで 図書館の 中で 本を 読めます。`,
        ],
        0,
      );
      return {
        id: `r-s-lib-${closed}-${limit}`,
        fingerprint: `r-s-lib-${closed}-${limit}`,
        level,
        section: 'grammar',
        mondaiId: 'G4',
        mondaiTitle: '問題4・内容理解（短文）(Short Reading)',
        passage: `【図書館の ごあんない】\n・開館時間：午前 9時 〜 午後 7時\n・休館日：毎週 ${closed}\n・本は 一人 ${limit}さつまで、2週間 借りられます。`,
        prompt: 'この 図書館の 使い方で、正しい ものは どれですか。',
        options,
        answer,
        explain: `Open on ${open} (closed ${closed}) and allows up to ${limit} books.`,
      };
    },
    () => {
      const timesPerDay = pickOne([2, 3]);
      const timing = pickOne([
        { jp: 'ご飯を 食べた 後で', en: 'after' },
        { jp: 'ご飯を 食べる 前に', en: 'before' },
      ]);
      const pills = pickOne([1, 2]);
      const { options, answer } = shuffleOptions(
        [
          `1日に ${timesPerDay}回、${timing.jp} ${pills}つずつ 飲みます。`,
          `1日に 1回、寝る 前に 4つ 飲みます。`,
          `薬を 飲んだ すぐ 後で、車を 運転しても いいです。`,
          `お茶や コーヒーで 薬を 飲まなければ なりません。`,
        ],
        0,
      );
      return {
        id: `r-s-med-${timesPerDay}-${timing.en}-${pills}`,
        fingerprint: `r-s-med-${timesPerDay}-${timing.en}-${pills}`,
        level,
        section: 'grammar',
        mondaiId: 'G4',
        mondaiTitle: '問題4・内容理解（短文）(Short Reading)',
        passage: `【おくすりの 飲み方】\n・この 薬は 1日に ${timesPerDay}回、${timing.jp} ${pills}つずつ 水か お湯で 飲んで ください。\n・薬を 飲んだ 後で 眠く なる ことが ありますから、車を 運転しては いけません。`,
        prompt: 'この 薬の 飲み方で、正しい ものは どれですか。',
        options,
        answer,
        explain: `The label specifies ${timesPerDay} times a day, ${timing.jp}, ${pills} pill(s) each time.`,
      };
    },
    () => {
      const floor = pickOne([2, 3, 4, 6]);
      const discount = pickOne([10, 20, 30, 50]);
      const { options, answer } = shuffleOptions(
        [
          `${floor}階へ 行けば、くつや かばんを ${discount}% 安く 買えます。`,
          `1階で すべての 服が 半額に なります。`,
          `セールは 来月の 月曜日から 始まります。`,
          `レストランも ${discount}% 安く なります。`,
        ],
        0,
      );
      return {
        id: `r-s-sale-${floor}-${discount}`,
        fingerprint: `r-s-sale-${floor}-${discount}`,
        level,
        section: 'grammar',
        mondaiId: 'G4',
        mondaiTitle: '問題4・内容理解（短文）(Short Reading)',
        passage: `【さくらデパート・週末セール】\n今週の 土曜日と 日曜日、${floor}階の くつ・かばん売り場では、すべての 商品が ${discount}% 安く なります。（1階の 食品売り場と 8階の レストランは セールを しません。）`,
        prompt: 'この 案内から わかる ことは どれですか。',
        options,
        answer,
        explain: `On the ${floor}th floor, shoes and bags are ${discount}% off this weekend.`,
      };
    },
    () => {
      const fee = pickOne([500, 800, 1000]);
      const freeAge = pickOne([6, 12, 15]);
      const { options, answer } = shuffleOptions(
        [
          `${freeAge}歳より 小さい 子どもは 無料で 入る ことが できます。`,
          `おとなは 一人 ${fee * 2}円 払わなければ なりません。`,
          `館内で フラッシュを 使って 写真を 撮っても いいです。`,
          `ペットと いっしょに 中へ 入る ことが できます。`,
        ],
        0,
      );
      return {
        id: `r-s-museum-${fee}-${freeAge}`,
        fingerprint: `r-s-museum-${fee}-${freeAge}`,
        level,
        section: 'grammar',
        mondaiId: 'G4',
        mondaiTitle: '問題4・内容理解（短文）(Short Reading)',
        passage: `【東京 美術館の ごあんない】\n・入場料：おとな ${fee}円（${freeAge}歳以下の 子どもは 無料です）\n・館内では 写真を 撮っては いけません。\n・ペットを 連れて 入る ことは できません。`,
        prompt: 'この 美術館について、正しい ものは どれですか。',
        options,
        answer,
        explain: `Children ${freeAge} and under enter free (無料).`,
      };
    },
  ];

  const shortPool = shortGenerators.map((fn) => fn());
  const m4 = pickUnseen(shortPool, 3, seen);

  // 5. 問題5・内容理解（中文）(Mid-Length Passage with 2 Linked Questions — 4 distinct stories rotated)
  const midPassages = [
    {
      fp: 'mid-1-onsen',
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
        exp: '「私は 温泉に 入った ことが なかったので、サクラさんが 入り方を 教えて くれました。」',
      },
      q2: {
        prompt: '旅館に 着いてから、「私」が した ことと 合って いる ものは どれですか。',
        opts: [
          'お湯に 入る 前に 体を 洗って、夜は 部屋で 魚料理を 食べた。',
          'まず 部屋で 魚料理を 食べてから、翌朝だけ 温泉に 入った。',
          'タオルを お湯の 中に 入れて 体を 洗った。',
          '東京駅から バスに 5時間 乗って 旅館に 着いた。',
        ],
        exp: 'They went to the 1F onsen first, washed before entering, and had fish in their room at night.',
      },
    },
    {
      fp: 'mid-2-camera',
      passage:
        '【読解・中文】\n私は 来月 京都へ 旅行に 行く つもりです。きれいな 写真を たくさん 撮りたいですが、私の 古い カメラは 重くて、旅行には 不便です。それで、きのう 秋葉原の 大きい 電気屋へ 新しい カメラを 買いに 行きました。\n5階の カメラ売り場には いろいろな カメラが ありました。白い カメラは デザインが すてきでしたが、3万円で 少し 高かったです。店員さんが「こちらの 黒い カメラは 白い のより 軽くて、2万円ですよ」と 教えて くれました。私は 黒い カメラが 気に入って、それを 買いました。',
      q1: {
        prompt: '「私」は どうして 新しい カメラを 買いに 行きましたか。',
        opts: [
          '今 持って いる 古い カメラが 重くて、来月の 旅行に 不便だから。',
          '古い カメラを 電車の 中に 忘れて なくして しまったから。',
          '友だちに 誕生日の プレゼントとして カメラを あげたいから。',
          '学校の 授業で 毎日 カメラを 使わなければ ならないから。',
        ],
        exp: '「私の 古い カメラは 重くて、旅行には 不便です。それで…買いに 行きました。」',
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
    {
      fp: 'mid-3-bento',
      passage:
        '【読解・中文】\n私は 日本へ 来てから、毎日 昼ご飯に コンビニの お弁当や パンを 買って いました。便利ですが、野菜が 少なくて お金も かかります。それで、先月から 毎朝 自分で お弁当を 作って 学校へ 持って 行く ように しました。\n朝 30分 早く 起きるのは 少し 大変ですが、週末に まとめて 野菜や 肉を 買って おくと 簡単です。友だちの ケンさんも 私の お弁当を 見て、「おいしそうだね。ぼくも 来週から 作って みようかな」と 言いました。',
      q1: {
        prompt: '「私」は どうして 自分で お弁当を 作る ように しましたか。',
        opts: [
          'コンビニの 昼ご飯は 野菜が 少なくて、お金も かかるから。',
          '学校の 近くに コンビニや レストランが ひとつも ないから。',
          '友だちの ケンさんに 毎日 お弁当を 作って あげる ため。',
          '朝 早く 起きるのが 前から 大好きだったから。',
        ],
        exp: '「コンビニの お弁当や パン…便利ですが、野菜が 少なくて お金も かかります。それで…」',
      },
      q2: {
        prompt: 'ケンさんは 「私」の お弁当を 見て、どう 思いましたか。',
        opts: [
          'おいしそうだから、自分も 来週から お弁当を 作って みたい。',
          '朝 早く 起きるのは 大変だから、コンビニの ほうが いい。',
          'あしたから 「私」に お弁当を 買って もらいたい。',
          '野菜が 多すぎて あまり おいしく なさそうだ。',
        ],
        exp: 'Ken said: 「おいしそうだね。ぼくも 来週から 作って みようかな」.',
      },
    },
  ];

  const unseenMid = midPassages.filter((m) => !seen.has(`${m.fp}-1`));
  const chosenMid = pickOne(unseenMid.length ? unseenMid : midPassages);
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

  // 6. 問題6・情報検索 (1 Information Retrieval Question with Randomized Winner Course A/B/C/D!)
  const tourBudget = pickOne([3000, 3500, 4000, 4500, 5000]);
  const wantDay = pickOne(['土曜日', '日曜日']);
  const otherDay = wantDay === '土曜日' ? '日曜日' : '土曜日';
  const timeSlot = pickOne([
    { label: '昼（午前〜午後3時ごろ）', matchHours: '午前 10:00〜15:00', wrongHours: '午後 18:00〜21:00' },
    { label: '夜（午後6時ごろから）', matchHours: '午後 18:00〜21:00', wrongHours: '午前 10:00〜15:00' },
  ]);
  const courses = [
    { name: 'Aコース（鎌倉・お寺めぐり）', valid: false, line: `${otherDay}のみ ／ ${timeSlot.matchHours} ／ ${tourBudget - 500}円`, why: `${otherDay} only` },
    { name: 'Bコース（浅草・スカイツリー）', valid: true, line: `土曜日・日曜日 ／ ${timeSlot.matchHours} ／ ${tourBudget - 300}円`, why: `Matches ${wantDay}, ${timeSlot.matchHours}, and costs ${tourBudget - 300}円 (≤ ${tourBudget}円)` },
    { name: 'Cコース（箱根・温泉ツアー）', valid: false, line: `土曜日・日曜日 ／ ${timeSlot.matchHours} ／ ${tourBudget + 2200}円`, why: `Costs ${tourBudget + 2200}円 (over ${tourBudget}円 budget)` },
    { name: 'Dコース（東京湾クルーズ）', valid: false, line: `${wantDay}のみ ／ ${timeSlot.wrongHours} ／ ${tourBudget - 400}円`, why: `Runs at ${timeSlot.wrongHours} (wrong time of day)` },
  ];
  const infoOpts = shuffleOptions(
    courses.map((c) => c.name),
    1,
  );
  const m6: GeneratedExamQuestion = {
    id: `r-info-${wantDay}-${tourBudget}-${timeSlot.label}`,
    fingerprint: `r-info-${wantDay}-${tourBudget}-${timeSlot.label}`,
    level,
    section: 'grammar',
    mondaiId: 'G6',
    mondaiTitle: '問題6・情報検索 (Information Retrieval)',
    passage:
      `【週末 東京 ツアー ごあんない】\n` +
      courses.map((c) => `・${c.name}：${c.line}`).join('\n'),
    prompt: `トムさんは 今週の 「${wantDay}の ${timeSlot.label}」に 参加できる ツアーを さがして います。お金は 「${tourBudget}円まで」が いいです。トムさんは どの コースを 選びますか。`,
    options: infoOpts.options,
    answer: infoOpts.answer,
    explain: `Tom needs ${wantDay}, ${timeSlot.label}, ≤ ${tourBudget}円 → Bコース (${courses[1].why}).`,
  };

  return [...m1, ...m2, ...m3, ...m4, ...m5, m6];
}

// ============================================================================
// PART 3 GENERATORS: 聴解 (24 Questions in Official Full Exam)
//   - 問題1 & 問題2: 15 Distinct Combinatorial Multi-Voice Dialogue Generators!
//   - 問題3: 発話表現 (5 Qs from 12 situational generators)
//   - 問題4: 即時応答 (6 Qs from 16 immediate-response generators)
// ============================================================================

function generateListeningQuestions(level: ExamLevel, seen: Set<string>): GeneratedExamQuestion[] {
  const dialoguePool: GeneratedExamQuestion[] = [];

  // 1. Cafe / Restaurant Order with やっぱり change of mind
  const drinks = shuffle([
    { jp: '冷たい お茶', kana: 'つめたい おちゃ' },
    { jp: 'ホットコーヒー', kana: 'ホットコーヒー' },
    { jp: '紅茶', kana: 'こうちゃ' },
    { jp: 'オレンジジュース', kana: 'オレンジジュース' },
    { jp: '抹茶ラテ', kana: 'まっちゃラテ' },
    { jp: 'アイスココア', kana: 'アイスココア' },
  ]);
  {
    const d1Opts = shuffleOptions(drinks.slice(0, 4).map((x) => x.jp), 1);
    dialoguePool.push({
      id: `l-drink-${drinks[1].jp}`,
      fingerprint: `l-drink-${drinks[0].jp}-${drinks[1].jp}`,
      level,
      section: 'listening',
      mondaiId: 'L1',
      mondaiTitle: '問題1・課題理解 (Task-Based Listening)',
      prompt: '喫茶店で 男の人と 女の人が 話して います。女の人は 何を 頼みますか。',
      audio: `きっさてんで、おとこのひとと、おんなのひとが はなしています。おんなのひとは、なにを たのみますか。……M:なにを のみますか。ぼくは ${drinks[2].kana}に します。……F:わたしは、${drinks[0].kana}に しようかな。あ、やっぱり ${drinks[1].kana}を ください。`,
      transcript: `男：何を 飲みますか。ぼくは ${drinks[2].jp}に します。\n女：私は ${drinks[0].jp}に しようかな。あ、やっぱり ${drinks[1].jp}を ください。`,
      options: d1Opts.options,
      answer: d1Opts.answer,
      explain: `She switches with やっぱり to ${drinks[1].jp}.`,
    });
  }

  // 2. Price × Quantity Shop Calculation
  const shopItems = [
    { name: 'りんご', kana: 'りんご', unitPrice: 150, unitKana: 'ひゃくごじゅうえん', qty: 2, qtyKana: 'ふたつ', total: 300, totalKana: 'さんびゃくえん', distractors: ['150円', '450円', '600円'] },
    { name: 'りんご', kana: 'りんご', unitPrice: 150, unitKana: 'ひゃくごじゅうえん', qty: 4, qtyKana: 'よっつ', total: 600, totalKana: 'ろっぴゃくえん', distractors: ['150円', '300円', '450円'] },
    { name: 'ノート', kana: 'ノート', unitPrice: 200, unitKana: 'にひゃくえん', qty: 3, qtyKana: 'さんさつ', total: 600, totalKana: 'ろっぴゃくえん', distractors: ['200円', '400円', '800円'] },
    { name: 'ノート', kana: 'ノート', unitPrice: 200, unitKana: 'にひゃくえん', qty: 4, qtyKana: 'よんさつ', total: 800, totalKana: 'はっぴゃくえん', distractors: ['200円', '400円', '600円'] },
    { name: 'パン', kana: 'パン', unitPrice: 120, unitKana: 'ひゃくにじゅうえん', qty: 3, qtyKana: 'みっつ', total: 360, totalKana: 'さんびゃくろくじゅうえん', distractors: ['120円', '240円', '480円'] },
    { name: '傘', kana: 'かさ', unitPrice: 500, unitKana: 'ごひゃくえん', qty: 2, qtyKana: 'にほん', total: 1000, totalKana: 'せんえん', distractors: ['500円', '800円', '1500円'] },
    { name: 'おにぎり', kana: 'おにぎり', unitPrice: 140, unitKana: 'ひゃくよんじゅうえん', qty: 2, qtyKana: 'ふたつ', total: 280, totalKana: 'にひゃくはちじゅうえん', distractors: ['140円', '240円', '420円'] },
  ];
  {
    const sItem = pickOne(shopItems);
    const d2Opts = shuffleOptions([`${sItem.total}円`, ...sItem.distractors], 0);
    dialoguePool.push({
      id: `l-shop-${sItem.name}-${sItem.total}`,
      fingerprint: `l-shop-${sItem.name}-${sItem.total}`,
      level,
      section: 'listening',
      mondaiId: 'L1',
      mondaiTitle: '問題1・課題理解 (Task-Based Listening)',
      prompt: '店で 男の人と 店員が 話して います。男の人は 全部で いくら 払いますか。',
      audio: `みせで、おとこのひとと、てんいんが はなしています。おとこのひとは、ぜんぶで いくら はらいますか。……M:すみません、この ${sItem.kana}は ひとつ いくらですか。……F:ひとつ ${sItem.unitKana}です。……M:じゃあ、${sItem.qtyKana} ください。……F:はい、ぜんぶで ${sItem.totalKana}に なります。`,
      transcript: `男：すみません、この ${sItem.name}は 1つ いくらですか。\n店員：1つ ${sItem.unitPrice}円です。\n男：じゃあ、${sItem.qtyKana} ください。\n店員：はい、全部で ${sItem.total}円に なります。`,
      options: d2Opts.options,
      answer: d2Opts.answer,
      explain: `${sItem.unitPrice}円 × ${sItem.qty} = ${sItem.total}円 (${sItem.totalKana}).`,
    });
  }

  // 3. Station Platform Change
  const dests = [
    { jp: '京都', kana: 'きょうと' },
    { jp: '新宿', kana: 'しんじゅく' },
    { jp: '横浜', kana: 'よこはま' },
    { jp: '上野', kana: 'うえの' },
    { jp: '渋谷', kana: 'しぶや' },
    { jp: '成田空港', kana: 'なりたくうこう' },
  ];
  const tracks = shuffle([
    { n: '1番線', k: 'いちばんせん' },
    { n: '2番線', k: 'にばんせん' },
    { n: '3番線', k: 'さんばんせん' },
    { n: '4番線', k: 'よんばんせん' },
    { n: '5番線', k: 'ごばんせん' },
  ]).slice(0, 4);
  {
    const dest = pickOne(dests);
    const d3Opts = shuffleOptions(tracks.map((t) => t.n), 1);
    dialoguePool.push({
      id: `l-track-${dest.jp}-${tracks[1].n}`,
      fingerprint: `l-track-${dest.jp}-${tracks[1].n}`,
      level,
      section: 'listening',
      mondaiId: 'L1',
      mondaiTitle: '問題1・課題理解 (Task-Based Listening)',
      prompt: '駅で 女の人と 駅員が 話して います。女の人は 何番線へ 行きますか。',
      audio: `えきで、おんなのひとと、えきいんが はなしています。おんなのひとは、なんばんせんへ いきますか。……F:すみません、${dest.kana}へ いく でんしゃは、なんばんせんですか。……M:いつもは ${tracks[0].k}ですが、きょうは こうじの ため、${tracks[1].k}から でます。`,
      transcript: `女：すみません、${dest.jp}へ 行く 電車は 何番線ですか。\n駅員：いつもは ${tracks[0].n}ですが、今日は 工事の ため、${tracks[1].n}から 出ます。`,
      options: d3Opts.options,
      answer: d3Opts.answer,
      explain: `Changed from ${tracks[0].n} to ${tracks[1].n} (${tracks[1].k}).`,
    });
  }

  // 4. Meeting Time Negotiation
  const times = shuffle([
    { jp: '午前 9時半', k: 'ごぜん くじはん' },
    { jp: '午前 10時', k: 'ごぜん じゅうじ' },
    { jp: '午前 11時', k: 'ごぜん じゅういちじ' },
    { jp: '午後 1時半', k: 'ごご いちじはん' },
    { jp: '午後 2時', k: 'ごご にじ' },
    { jp: '午後 4時', k: 'ごご よじ' },
  ]).slice(0, 4);
  {
    const d4Opts = shuffleOptions(times.map((t) => t.jp), 1);
    dialoguePool.push({
      id: `l-time-${times[0].jp}-${times[1].jp}`,
      fingerprint: `l-time-${times[0].jp}-${times[1].jp}`,
      level,
      section: 'listening',
      mondaiId: 'L2',
      mondaiTitle: '問題2・ポイント理解 (Point Comprehension)',
      prompt: '男の人と 女の人が あしたの 約束について 話して います。二人は 何時に 会いますか。',
      audio: `おとこのひとと、おんなのひとが はなしています。ふたりは、なんじに あいますか。……F:あしたは、${times[0].k}に えきの まえで あいましょうか。……M:ごめん、${times[0].k}は ちょっと はやいんだ。${times[1].k}でも いい？……F:うん、じゃあ ${times[1].k}に しましょう。`,
      transcript: `女：あしたは ${times[0].jp}に 駅の 前で 会いましょうか。\n男：ごめん、${times[0].jp}は ちょっと 早いんだ。${times[1].jp}でも いい？\n女：うん、じゃあ ${times[1].jp}に しましょう。`,
      options: d4Opts.options,
      answer: d4Opts.answer,
      explain: `They agree on ${times[1].jp} (${times[1].k}).`,
    });
  }

  // 5. Department Store Floor Directory
  const depts = shuffle([
    { item: 'カメラ売り場', kana: 'カメラうりば', floor: '5階', floorKana: 'ごかい' },
    { item: '本屋', kana: 'ほんや', floor: '6階', floorKana: 'ろっかい' },
    { item: 'レストラン', kana: 'レストラン', floor: '8階', floorKana: 'はっかい' },
    { item: 'くつ売り場', kana: 'くつうりば', floor: '3階', floorKana: 'さんがい' },
    { item: 'かばん売り場', kana: 'かばんうりば', floor: '2階', floorKana: 'にかい' },
    { item: 'めがね売り場', kana: 'めがねうりば', floor: '4階', floorKana: 'よんかい' },
  ]).slice(0, 4);
  {
    const d5Opts = shuffleOptions(depts.map((d) => d.floor), 0);
    dialoguePool.push({
      id: `l-floor-${depts[0].item}-${depts[0].floor}`,
      fingerprint: `l-floor-${depts[0].item}-${depts[0].floor}`,
      level,
      section: 'listening',
      mondaiId: 'L2',
      mondaiTitle: '問題2・ポイント理解 (Point Comprehension)',
      prompt: `デパートで 男の人と 店員が 話して います。「${depts[0].item}」は 何階ですか。`,
      audio: `デパートで、おとこのひとと、てんいんが はなしています。${depts[0].kana}は なんがいですか。……M:すみません、${depts[0].kana}は ${depts[1].floorKana}ですか。……F:いいえ、${depts[1].floorKana}は ${depts[1].kana}です。${depts[0].kana}は ${depts[0].floorKana}です。`,
      transcript: `男：すみません、${depts[0].item}は ${depts[1].floor}ですか。\n店員：いいえ、${depts[1].floor}は ${depts[1].item}です。${depts[0].item}は ${depts[0].floor}です。`,
      options: d5Opts.options,
      answer: d5Opts.answer,
      explain: `${depts[0].item} is on ${depts[0].floor} (${depts[0].floorKana}).`,
    });
  }

  // 6. Hospital / Dentist Appointment Date (Irregular Calendar Days)
  const calDays = shuffle([
    { jp: '5月1日', k: 'ごがつ ついたち' },
    { jp: '5月2日', k: 'ごがつ ふつか' },
    { jp: '5月4日', k: 'ごがつ よっか' },
    { jp: '5月8日', k: 'ごがつ ようか' },
    { jp: '5月14日', k: 'ごがつ じゅうよっか' },
    { jp: '5月20日', k: 'ごがつ はつか' },
  ]).slice(0, 4);
  {
    const d6Opts = shuffleOptions(calDays.map((d) => d.jp), 0);
    dialoguePool.push({
      id: `l-date-${calDays[0].jp}`,
      fingerprint: `l-date-${calDays[0].jp}-${calDays[1].jp}`,
      level,
      section: 'listening',
      mondaiId: 'L2',
      mondaiTitle: '問題2・ポイント理解 (Point Comprehension)',
      prompt: '病院で 女の人と 受付の 人が 話して います。次の 予約は いつですか。',
      audio: `びょういんで、おんなのひとと、うけつけの ひとが はなしています。つぎの よやくは いつですか。……M:つぎは、${calDays[1].k}に きて ください。……F:すみません、${calDays[1].k}は しごとが あります。……M:では、${calDays[0].k}は どうですか。……F:はい、${calDays[0].k}なら だいじょうぶです。`,
      transcript: `受付：次は ${calDays[1].jp}に 来て ください。\n女：すみません、${calDays[1].jp}は 仕事が あります。\n受付：では、${calDays[0].jp}は どうですか。\n女：はい、${calDays[0].jp}なら 大丈夫です。`,
      options: d6Opts.options,
      answer: d6Opts.answer,
      explain: `She books ${calDays[0].jp} (${calDays[0].k}).`,
    });
  }

  // 7. Transport Mode Choice
  const modes = shuffle([
    { jp: 'バス', k: 'バス', reason: 'やすい', reasonJp: '安い' },
    { jp: '新幹線', k: 'しんかんせん', reason: 'はやい', reasonJp: '速い' },
    { jp: '電車', k: 'でんしゃ', reason: 'べんり', reasonJp: '便利' },
    { jp: 'タクシー', k: 'タクシー', reason: 'にもつが おおい', reasonJp: '荷物が 多い' },
  ]);
  {
    const d7Opts = shuffleOptions(modes.map((m) => m.jp), 0);
    dialoguePool.push({
      id: `l-trans-${modes[0].jp}`,
      fingerprint: `l-trans-${modes[0].jp}-${modes[1].jp}`,
      level,
      section: 'listening',
      mondaiId: 'L1',
      mondaiTitle: '問題1・課題理解 (Task-Based Listening)',
      prompt: '男の人と 女の人が 旅行について 話して います。二人は 何で 行きますか。',
      audio: `おとこのひとと、おんなのひとが はなしています。ふたりは、なんで いきますか。……M:らいしゅうの りょこう、${modes[1].k}で いく？……F:うーん、${modes[0].k}の ほうが ${modes[0].reason}から、${modes[0].k}に しようよ。……M:そうだね、そうしよう。`,
      transcript: `男：来週の 旅行、${modes[1].jp}で 行く？\n女：うーん、${modes[0].jp}の ほうが ${modes[0].reasonJp}から、${modes[0].jp}に しようよ。\n男：そうだね、そうしよう。`,
      options: d7Opts.options,
      answer: d7Opts.answer,
      explain: `They choose ${modes[0].jp} because it is ${modes[0].reasonJp}.`,
    });
  }

  // 8. Party Preparation Task Assignment
  const tasks = shuffle([
    { jp: '飲み物を 買う', k: 'のみものを かう' },
    { jp: 'ケーキを 作る', k: 'ケーキを つくる' },
    { jp: '部屋を そうじする', k: 'へやを そうじする' },
    { jp: 'お皿を ならべる', k: 'おさらを ならべる' },
  ]);
  {
    const d8Opts = shuffleOptions(tasks.map((t) => t.jp), 0);
    dialoguePool.push({
      id: `l-party-${tasks[0].jp}`,
      fingerprint: `l-party-${tasks[0].jp}-${tasks[1].jp}`,
      level,
      section: 'listening',
      mondaiId: 'L1',
      mondaiTitle: '問題1・課題理解 (Task-Based Listening)',
      prompt: '男の人と 女の人が パーティーの 準備を して います。男の人は これから 何を しますか。',
      audio: `おとこのひとと、おんなのひとが はなしています。おとこのひとは、これから なにを しますか。……M:パーティーの じゅんび、なにを てつだおうか。${tasks[1].k}？……F:それは わたしが やるから、スーパーで、${tasks[0].k}のを おねがい。……M:わかった。`,
      transcript: `男：パーティーの 準備、何を 手伝おうか。${tasks[1].jp}？\n女：それは 私が やるから、スーパーで ${tasks[0].jp}のを おねがい。\n男：わかった。`,
      options: d8Opts.options,
      answer: d8Opts.answer,
      explain: `The woman asks the man to ${tasks[0].jp}.`,
    });
  }

  // 9. Weather Forecast
  const weathers = shuffle([
    { jp: '朝は 晴れますが、午後から 雨が 降ります', k: 'あさは はれますが、ごごから あめが ふります', ans: '午前は 晴れ、午後は 雨' },
    { jp: '朝は 雨が 降りますが、昼から 晴れます', k: 'あさは あめが ふりますが、ひるから はれます', ans: '午前は 雨、午後は 晴れ' },
    { jp: '一日中 くもりで、夜は 雪が 降ります', k: 'いちにちじゅう くもりで、よるは ゆきが ふります', ans: '昼は くもり、夜は 雪' },
    { jp: '朝から 晩まで ずっと いい 天気です', k: 'あさから ばんまで、ずっと いい てんきです', ans: '一日中 晴れ' },
  ]);
  {
    const d9Opts = shuffleOptions(weathers.map((w) => w.ans), 0);
    dialoguePool.push({
      id: `l-weather-${weathers[0].ans}`,
      fingerprint: `l-weather-${weathers[0].ans}`,
      level,
      section: 'listening',
      mondaiId: 'L2',
      mondaiTitle: '問題2・ポイント理解 (Point Comprehension)',
      prompt: 'テレビの 天気予報を 聞いて います。あしたの 天気は どうなりますか。',
      audio: `テレビの てんきよほうを きいています。あしたの てんきは どうなりますか。……F:あしたの てんきです。${weathers[0].k}。でかける ときは 気をつけて ください。`,
      transcript: `アナウンサー：あしたの 天気です。${weathers[0].jp}。`,
      options: d9Opts.options,
      answer: d9Opts.answer,
      explain: `Forecast: ${weathers[0].jp} → ${weathers[0].ans}.`,
    });
  }

  // 10. Teacher Classroom Instructions (Bring X & Y, NOT Z)
  const schoolItems = shuffle([
    { jp: '鉛筆と お弁当', k: 'えんぴつと おべんとう', noJp: 'ノート', noK: 'ノート' },
    { jp: '辞書と ノート', k: 'じしょと ノート', noJp: 'カメラ', noK: 'カメラ' },
    { jp: '水と 帽子', k: 'みずと ぼうし', noJp: '教科書', noK: 'きょうかしょ' },
    { jp: 'お弁当と 飲み物', k: 'おべんとうと のみもの', noJp: '辞書', noK: 'じしょ' },
  ]);
  {
    const d10Opts = shuffleOptions(schoolItems.map((s) => s.jp), 0);
    dialoguePool.push({
      id: `l-school-${schoolItems[0].jp}`,
      fingerprint: `l-school-${schoolItems[0].jp}`,
      level,
      section: 'listening',
      mondaiId: 'L1',
      mondaiTitle: '問題1・課題理解 (Task-Based Listening)',
      prompt: '学校で 先生が 話して います。学生は あした 何を 持って 来ますか。',
      audio: `がっこうで、せんせいが はなしています。がくせいは、あした なにを もって きますか。……M:あしたは、${schoolItems[0].k}を もって きて ください。${schoolItems[0].noK}は いりません。`,
      transcript: `先生：あしたは、${schoolItems[0].jp}を 持って 来て ください。${schoolItems[0].noJp}は いりません。`,
      options: d10Opts.options,
      answer: d10Opts.answer,
      explain: `Bring ${schoolItems[0].jp}; ${schoolItems[0].noJp} is not needed (いりません).`,
    });
  }

  // 11. Pharmacy Medicine Dosage Instructions
  const medInstructions = shuffle([
    { jp: '朝と 夜、ご飯の 後', k: 'あさと よるの にかい、ごはんを たべた あとで', noK: 'ひるは のまないで ください' },
    { jp: '朝・昼・晩、ご飯の 後', k: 'あさと ひると ばんの さんかい、ごはんを たべた あとで', noK: 'みずで のんで ください' },
    { jp: '夜、寝る 前だけ', k: 'よる、ねる まえに いっかいだけ', noK: 'あさと ひるは のまないで ください' },
    { jp: '朝と 晩、ご飯の 前', k: 'あさと ばんの にかい、ごはんを たべる まえに', noK: 'おゆで のんで ください' },
  ]);
  {
    const d11Opts = shuffleOptions(medInstructions.map((m) => m.jp), 0);
    dialoguePool.push({
      id: `l-med-${medInstructions[0].jp}`,
      fingerprint: `l-med-${medInstructions[0].jp}`,
      level,
      section: 'listening',
      mondaiId: 'L1',
      mondaiTitle: '問題1・課題理解 (Task-Based Listening)',
      prompt: '薬局で 女の人と 薬剤師が 話して います。女の人は いつ 薬を 飲みますか。',
      audio: `やっきょくで、おんなのひとと、やくざいしが はなしています。おんなのひとは、いつ くすりを のみますか。……F:この くすりは、いつ のみますか。……M:${medInstructions[0].k} のんで ください。${medInstructions[0].noK}。`,
      transcript: `女：この 薬は いつ 飲みますか。\n薬剤師：${medInstructions[0].jp}に 飲んで ください。`,
      options: d11Opts.options,
      answer: d11Opts.answer,
      explain: `Dosage: ${medInstructions[0].jp}.`,
    });
  }

  // 12. Lost & Found Item Description (Color + Size + Object)
  const lostBags = shuffle([
    { jp: '小さい 黒い かばん', k: 'ちいさい くろい かばん' },
    { jp: '大きい 黒い かばん', k: 'おおきい くろい かばん' },
    { jp: '小さい 白い かばん', k: 'ちいさい しろい かばん' },
    { jp: '大きい 白い かばん', k: 'おおきい しろい かばん' },
  ]);
  {
    const d12Opts = shuffleOptions(lostBags.map((b) => b.jp), 0);
    dialoguePool.push({
      id: `l-lost-${lostBags[0].jp}`,
      fingerprint: `l-lost-${lostBags[0].jp}`,
      level,
      section: 'listening',
      mondaiId: 'L2',
      mondaiTitle: '問題2・ポイント理解 (Point Comprehension)',
      prompt: '駅で 女の人と 駅員が 話して います。女の人の かばんは どれですか。',
      audio: `えきで、おんなのひとと、えきいんが はなしています。おんなのひとの かばんは どれですか。……F:すみません、でんしゃの なかに かばんを わすれて しまいました。……M:どんな かばんですか。……F:${lostBags[0].k}です。なかに じしょが はいって います。`,
      transcript: `女：すみません、電車の 中に かばんを 忘れて しまいました。\n駅員：どんな かばんですか。\n女：${lostBags[0].jp}です。中に 辞書が 入って います。`,
      options: d12Opts.options,
      answer: d12Opts.answer,
      explain: `She describes her bag as 「${lostBags[0].jp}」.`,
    });
  }

  // 13. Restaurant Party Size & Seating
  const partyCounts = shuffle([
    { jp: '2人（ふたり）', k: 'ふたり' },
    { jp: '3人（さんにん）', k: 'さんにん' },
    { jp: '4人（よにん）', k: 'よにん' },
    { jp: '5人（ごにん）', k: 'ごにん' },
  ]);
  {
    const d13Opts = shuffleOptions(partyCounts.map((p) => p.jp), 0);
    dialoguePool.push({
      id: `l-rest-cnt-${partyCounts[0].jp}`,
      fingerprint: `l-rest-cnt-${partyCounts[0].jp}`,
      level,
      section: 'listening',
      mondaiId: 'L2',
      mondaiTitle: '問題2・ポイント理解 (Point Comprehension)',
      prompt: 'レストランで 店員と 男の人が 話して います。男の人は 何人で 来ましたか。',
      audio: `レストランで、てんいんと おとこのひとが はなしています。おとこのひとは なんにんで きましたか。……F:いらっしゃいませ。なんめいさまですか。……M:いまは ふたりですが、あとから ともだちが きて、ぜんぶで ${partyCounts[0].k}に なります。`,
      transcript: `店員：いらっしゃいませ。何名様ですか。\n男：今は 2人ですが、あとから 友だちが 来て、全部で ${partyCounts[0].jp}に なります。`,
      options: d13Opts.options,
      answer: d13Opts.answer,
      explain: `Total party size: ${partyCounts[0].jp} (${partyCounts[0].k}).`,
    });
  }

  // 14. Library First Action
  {
    const steps = shuffle([
      { jp: '紙に 名前と 電話番号を 書く', k: 'こちらの かみに おなまえと でんわばんごうを かいて ください' },
      { jp: '2階の カウンターへ 行く', k: 'にかいの カウンターへ いって ください' },
      { jp: '青い カードを 出す', k: 'あおい カードを だして ください' },
      { jp: 'パソコンで 本を さがす', k: 'あそこの パソコンで ほんを さがして ください' },
    ]);
    const d14Opts = shuffleOptions(steps.map((s) => s.jp), 0);
    dialoguePool.push({
      id: `l-lib-first-${steps[0].jp}`,
      fingerprint: `l-lib-first-${steps[0].jp}`,
      level,
      section: 'listening',
      mondaiId: 'L1',
      mondaiTitle: '問題1・課題理解 (Task-Based Listening)',
      prompt: '図書館で 男の人と 係の 人が 話して います。男の人は まず 何を しますか。',
      audio: `としょかんで、おとこのひとと、かかりの ひとが はなしています。おとこのひとは、まず なにを しますか。……M:すみません、はじめて ほんを かりたいんですが。……F:では、まず ${steps[0].k}。`,
      transcript: `男：すみません、初めて 本を 借りたいんですが。\n係員：では、まず ${steps[0].jp}。`,
      options: d14Opts.options,
      answer: d14Opts.answer,
      explain: `First action (まず): ${steps[0].jp}.`,
    });
  }

  // 15. Train Delay Reason
  const reasons = shuffle([
    { jp: '強い 雨の ため', k: 'つよい あめの ため' },
    { jp: '強い 風の ため', k: 'つよい かぜの ため' },
    { jp: '大雪の ため', k: 'おおゆきの ため' },
    { jp: '工事の ため', k: 'こうじの ため' },
  ]);
  {
    const d15Opts = shuffleOptions(reasons.map((r) => r.jp), 0);
    dialoguePool.push({
      id: `l-delay-${reasons[0].jp}`,
      fingerprint: `l-delay-${reasons[0].jp}`,
      level,
      section: 'listening',
      mondaiId: 'L2',
      mondaiTitle: '問題2・ポイント理解 (Point Comprehension)',
      prompt: '駅で アナウンスが 流れて います。電車は どうして 遅れて いますか。',
      audio: `えきで、アナウンスが ながれています。……M:ほんじつは、${reasons[0].k}、でんしゃが じゅっぷんほど おくれて います。`,
      transcript: `アナウンス：本日は、${reasons[0].jp}、電車が 10分ほど 遅れて います。`,
      options: d15Opts.options,
      answer: d15Opts.answer,
      explain: `Delay reason: ${reasons[0].jp} (${reasons[0].k}).`,
    });
  }

  const m1AndM2 = pickUnseen(dialoguePool, 13, seen);

  // 問題3・発話表現 (5 Questions from 12 Situational Utterance Items with Dynamic Spoken Options!)
  const utteranceRaw = [
    { fp: 'u-1', sit: 'ご飯を 食べ終わりました。店の 人や 家族に 何と 言いますか。', sitK: 'ごはんを たべおわりました。なんと言いますか。', opts: [{ jp: 'ごちそうさまでした。', k: 'ごちそうさまでした' }, { jp: 'いただきます。', k: 'いただきます' }, { jp: 'お大事に。', k: 'おだいじに' }], exp: 'After finishing a meal, say 「ごちそうさまでした」.' },
    { fp: 'u-2', sit: 'これから ご飯を 食べます。食べる 前に 何と 言いますか。', sitK: 'これから ごはんを たべます。なんと言いますか。', opts: [{ jp: 'いただきます。', k: 'いただきます' }, { jp: 'ごちそうさまでした。', k: 'ごちそうさまでした' }, { jp: 'いってきます。', k: 'いってきます' }], exp: 'Before eating a meal, say 「いただきます」.' },
    { fp: 'u-3', sit: '友だちの ペンを 借りたいです。友だちに 何と 言いますか。', sitK: 'ともだちの ペンを かりたいです。なんと言いますか。', opts: [{ jp: 'この ペン、貸して もらえませんか。', k: 'この ペン、かして もらえませんか' }, { jp: 'この ペン、あげましょうか。', k: 'この ペン、あげましょうか' }, { jp: 'この ペン、返して ください。', k: 'この ペン、かえして ください' }], exp: '貸して もらえませんか = Could you lend me this?' },
    { fp: 'u-4', sit: '先生の 話が 速くて わかりませんでした。先生に 何と 言いますか。', sitK: 'せんせいの はなしが はやくて わかりませんでした。なんと言いますか。', opts: [{ jp: 'すみません、もう一度 ゆっくり 言って ください。', k: 'すみません、もういちど ゆっくり いって ください' }, { jp: 'すみません、私が 教えましょうか。', k: 'すみません、わたしが おしえましょうか' }, { jp: 'よく わかりました。', k: 'よく わかりました' }], exp: 'もう一度 ゆっくり 言って ください = Please say it slowly once more.' },
    { fp: 'u-5', sit: '友だちが かぜを ひいて 熱が あります。友だちに 何と 言いますか。', sitK: 'ともだちが かぜを ひいて ねつが あります。なんと言いますか。', opts: [{ jp: 'お大事に。', k: 'おだいじに' }, { jp: 'おめでとうございます。', k: 'おめでとうございます' }, { jp: 'いってらっしゃい。', k: 'いってらっしゃい' }], exp: 'お大事に = Take care / Get well soon.' },
    { fp: 'u-6', sit: '先生の 部屋に 入ります。ドアを ノックして 何と 言いますか。', sitK: 'せんせいの へやに はいります。なんと言いますか。', opts: [{ jp: '失礼します。', k: 'しつれいします' }, { jp: 'ただいま。', k: 'ただいま' }, { jp: 'おやすみなさい。', k: 'おやすみなさい' }], exp: 'When entering a room, say 「失礼します」.' },
    { fp: 'u-7', sit: '電車の 中で 席を ゆずって もらいました。何と 言いますか。', sitK: 'でんしゃの なかで、せきを ゆずって もらいました。なんと言いますか。', opts: [{ jp: 'すみません、ありがとうございます。', k: 'すみません、ありがとうございます' }, { jp: 'こちらへ どうぞ。', k: 'こちらへ どうぞ' }, { jp: 'どういたしまして。', k: 'どういたしまして' }], exp: 'Thank them with 「すみません、ありがとうございます」.' },
    { fp: 'u-8', sit: '朝、家を 出かけて 学校へ 行きます。家族に 何と 言いますか。', sitK: 'あさ、いえを でかけて がっこうへ いきます。なんと言いますか。', opts: [{ jp: 'いってきます。', k: 'いってきます' }, { jp: 'ただいま。', k: 'ただいま' }, { jp: 'おかえりなさい。', k: 'おかえりなさい' }], exp: 'When leaving home, say 「いってきます」.' },
    { fp: 'u-9', sit: '学校から 家に 帰りました。ドアを 開けて 家族に 何と 言いますか。', sitK: 'がっこうから いえに かえりました。なんと言いますか。', opts: [{ jp: 'ただいま。', k: 'ただいま' }, { jp: 'いってきます。', k: 'いってきます' }, { jp: 'いらっしゃいませ。', k: 'いらっしゃいませ' }], exp: 'When arriving home, say 「ただいま」.' },
    { fp: 'u-10', sit: '店で 買いたい 物が どこに あるか わかりません。店員に 何と 言いますか。', sitK: 'みせで かいたい ものが どこに あるか わかりません。なんと言いますか。', opts: [{ jp: 'すみません、コーヒーは どこに ありますか。', k: 'すみません、コーヒーは どこに ありますか' }, { jp: 'すみません、コーヒーを 飲んでは いけませんか。', k: 'すみません、コーヒーを のんでは いけませんか' }, { jp: 'コーヒーは こちらに ございます。', k: 'コーヒーは こちらに ございます' }], exp: 'Ask where the item is with 「すみません、〜は どこに ありますか」.' },
  ];

  const utterancePool: GeneratedExamQuestion[] = utteranceRaw.map((u) => {
    const tagged = u.opts.map((o, idx) => ({ ...o, correct: idx === 0 }));
    const mixed = shuffle(tagged);
    const numKana = ['いち', 'に', 'さん'];
    const spokenChoices = mixed.map((m, idx) => `F:${numKana[idx]}、${m.k}。`).join('……');
    return {
      id: u.fp,
      fingerprint: u.fp,
      level,
      section: 'listening',
      mondaiId: 'L3',
      mondaiTitle: '問題3・発話表現 (Utterance Expressions)',
      prompt: u.sit,
      audio: `N:${u.sitK}……${spokenChoices}`,
      options: mixed.map((m) => m.jp),
      answer: mixed.findIndex((m) => m.correct),
      explain: u.exp,
    };
  });

  const m3 = pickUnseen(utterancePool, 5, seen);

  // 問題4・即時応答 (6 Questions from 15 Immediate-Response Generators!)
  const immRaw = [
    { fp: 'imm-1', audio: 'F:すみません、いま なんじですか。', tr: '「すみません、今 何時ですか。」', opts: ['午後 2時半です。', '2時間ぐらいです。', '200円です。'], exp: '「今 何時ですか」 → 「午後 2時半です」.' },
    { fp: 'imm-2', audio: 'M:いっしょに ひるごはんを たべませんか。', tr: '「いっしょに 昼ご飯を 食べませんか。」', opts: ['ええ、行きましょう。', 'はい、食べました。', 'どういたしまして。'], exp: '「〜ませんか」 invitation → 「ええ、行きましょう」.' },
    { fp: 'imm-3', audio: 'F:にほんの おんせんに いった ことが ありますか。', tr: '「日本の 温泉に 行った ことが ありますか。」', opts: ['いいえ、まだ 一度も ありません。', 'はい、来週 行く つもりです。', 'いいえ、行っては いけません。'], exp: '「〜たことが ありますか」 → 「いいえ、まだ 一度も ありません」.' },
    { fp: 'imm-4', audio: 'M:この かばん、おもそうですね。もちましょうか。', tr: '「この かばん、重そうですね。持ちましょうか。」', opts: ['ありがとうございます。おねがいします。', 'はい、持っています。', 'いいえ、ちがいます。'], exp: '「持ちましょうか」 (Shall I carry it?) → 「ありがとうございます。おねがいします。」' },
    { fp: 'imm-5', audio: 'F:あしたの パーティーには、だれが きますか。', tr: '「あしたの パーティーには、だれが 来ますか。」', opts: ['クラスの 友だちが みんな 来ますよ。', '駅の 前の レストランです。', '午後 6時から 始まります。'], exp: '「だれが 来ますか」 asks WHO is coming.' },
    { fp: 'imm-6', audio: 'M:すみません、まどを しめても いいですか。', tr: '「すみません、窓を 閉めても いいですか。」', opts: ['ええ、どうぞ。少し 寒いですね。', 'はい、閉めませんでした。', 'いいえ、開いて いますよ。'], exp: '「閉めても いいですか」 asks permission → 「ええ、どうぞ」.' },
    { fp: 'imm-7', audio: 'F:きのうの テストは、どうでしたか。', tr: '「きのうの テストは、どうでしたか。」', opts: ['漢字が 少し むずかしかったです。', '来週の 火曜日です。', '鉛筆で 書きました。'], exp: '「どうでしたか」 asks how the test went.' },
    { fp: 'imm-8', audio: 'M:おちゃを もう いっぱい いかがですか。', tr: '「お茶を もう 一杯 いかがですか。」', opts: ['いいえ、もう けっこうです。ありがとうございます。', 'はい、1杯 飲みました。', 'お先に 失礼します。'], exp: '「もう一杯 いかがですか」 → 「いいえ、もう けっこうです」.' },
    { fp: 'imm-9', audio: 'F:きのうから かぜを ひいて、ねつが あるんです。', tr: '「きのうから かぜを ひいて、熱が あるんです。」', opts: ['それは いけませんね。お大事に。', 'おめでとう ございます。', 'ごちそうさま でした。'], exp: 'When someone says they are sick, reply 「それは いけませんね。お大事に。」' },
    { fp: 'imm-10', audio: 'M:すみません、えきまで どうやって いきますか。', tr: '「すみません、駅まで どうやって 行きますか。」', opts: ['この 道を まっすぐ 行くと、右に ありますよ。', '歩いて 10分ぐらい でした。', 'はい、駅へ 行きます。'], exp: '「どうやって 行きますか」 asks for directions/method.' },
    { fp: 'imm-11', audio: 'F:その カメラ、どこで かったんですか。', tr: '「その カメラ、どこで 買ったんですか。」', opts: ['秋葉原の 大きい 電気屋で 買いました。', '2万円ぐらい でした。', 'とても 軽くて いいですよ。'], exp: '「どこで 買ったんですか」 asks WHERE it was bought.' },
    { fp: 'imm-12', audio: 'M:おさきに しつれいします。', tr: '「お先に 失礼します。」', opts: ['お疲れさまでした。', 'いらっしゃいませ。', 'いただきます。'], exp: 'When a coworker leaves first (お先に失礼します), reply 「お疲れさまでした」.' },
    { fp: 'imm-13', audio: 'F:あした 映画を 見に 行きませんか。', tr: '「あした 映画を 見に 行きませんか。」', opts: ['すみません、あしたは ちょっと 用事が あります。', 'はい、きのう 見ました。', '映画館の 前で 会いました。'], exp: 'Declining an invitation politely: 「すみません、あしたは ちょっと…」' },
    { fp: 'imm-14', audio: 'M:もう 宿題を 出しましたか。', tr: '「もう 宿題を 出しましたか。」', opts: ['いいえ、まだです。これから 出します。', 'はい、あした 出しました。', 'いいえ、出しません でしたか。'], exp: '「もう〜ましたか」 (Have you already ~?) → 「いいえ、まだです」 (Not yet).' },
  ];

  const immPool: GeneratedExamQuestion[] = immRaw.map((x) => {
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
      transcript: x.tr,
      options,
      answer,
      explain: x.exp,
    };
  });

  const m4 = pickUnseen(immPool, 6, seen);

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

  const selected =
    mode === 'full'
      ? [...vocab, ...grammar, ...listening]
      : [...vocab.slice(0, 5), ...grammar.slice(0, 5), ...listening.slice(0, 5)];

  markFingerprintsSeen(selected.map((q) => q.fingerprint));
  return {
    questions: selected,
    seenCount: getSeenFingerprints().size,
  };
}
