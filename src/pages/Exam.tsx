import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { PASS, useStore } from '../lib/store';
import { speak } from '../lib/tts';
import { playDing, playFanfare } from '../lib/sfx';

type ExamLevel = 'N5' | 'N4';

interface ExamQuestion {
  level: ExamLevel;
  section: 'vocab' | 'grammar' | 'listening';
  prompt: string;
  audio?: string;
  options: string[];
  answer: number;
  explain: string;
}

const QUESTION_BANK: ExamQuestion[] = [
  // ==================== JLPT N5 ====================
  // Vocab / Kanji
  {
    level: 'N5',
    section: 'vocab',
    prompt: '「新しい 車を 買いました。」 — What is the reading of 新しい?',
    options: ['あたらしい', 'ふるい', 'たかい', 'やすい'],
    answer: 0,
    explain: '新しい is read あたらしい (new).',
  },
  {
    level: 'N5',
    section: 'vocab',
    prompt: '「三百円です。」 — What is the reading of 三百円?',
    options: ['さんひゃくえん', 'さんびゃくえん', 'さんぴゃくえん', 'みっつひゃくえん'],
    answer: 1,
    explain: '三百 has a rendaku sound change: さんびゃく + えん.',
  },
  {
    level: 'N5',
    section: 'vocab',
    prompt: 'Which kanji means "station" (えき)?',
    options: ['電', '車', '駅', '店'],
    answer: 2,
    explain: '駅 (えき) means station.',
  },
  {
    level: 'N5',
    section: 'vocab',
    prompt: '「まいにち みずを（　）。」 — Choose the best verb.',
    options: ['のみます', 'たべます', 'よみます', 'ききます'],
    answer: 0,
    explain: 'のみます (飲みます) means "to drink" (water).',
  },
  {
    level: 'N5',
    section: 'vocab',
    prompt: '「八月 二十日に テストが あります。」 — What is the reading of 二十日?',
    options: ['にじゅうにち', 'はつか', 'ふつか', 'ようか'],
    answer: 1,
    explain: '二十日 (20th day of the month) has the special reading はつか.',
  },
  {
    level: 'N5',
    section: 'vocab',
    prompt: '「傘を 三本 買いました。」 — What is the reading of 三本?',
    options: ['さんほん', 'さんぽん', 'さんぼん', 'みっつほん'],
    answer: 2,
    explain: '3 + 本 voices to b: さんぼん.',
  },
  // Grammar / Reading
  {
    level: 'N5',
    section: 'grammar',
    prompt: 'わたしは アメリカ（　）来ました。',
    options: ['を', 'から', 'で', 'が'],
    answer: 1,
    explain: 'から indicates the starting point ("came from America").',
  },
  {
    level: 'N5',
    section: 'grammar',
    prompt: 'この コーヒーは 高いです（　）、おいしいです。',
    options: ['を', 'に', 'が', 'へ'],
    answer: 2,
    explain: 'が connects two contrasting clauses ("It is expensive, but delicious").',
  },
  {
    level: 'N5',
    section: 'grammar',
    prompt: '新幹線（　）京都へ 行きたいです。',
    options: ['で', 'を', 'に', 'は'],
    answer: 0,
    explain: 'で marks the means of transportation ("by bullet train").',
  },
  {
    level: 'N5',
    section: 'grammar',
    prompt: '【メモ】「さくらさんへ。きょうは 3時に 駅の 前に います。いっしょに 喫茶店へ 行きましょう。— アナ」\nアナさんは どこで さくらさんを まちますか。',
    options: ['喫茶店の 中', '駅の 前', '学校の 前', '新幹線の 中'],
    answer: 1,
    explain: 'The note says 「3時に 駅の 前に います」 (I will be in front of the station at 3 o’clock).',
  },
  {
    level: 'N5',
    section: 'grammar',
    prompt: 'すみません、ここで 写真を（　）いいですか。',
    options: ['撮っても', '撮りて', '撮るも', '撮った'],
    answer: 0,
    explain: 'V-ても いいですか asks permission ("May I take a photo here?").',
  },
  {
    level: 'N5',
    section: 'grammar',
    prompt: '黒い カメラの（　）が 白い カメラより 軽いです。',
    options: ['ほう', 'より', 'まで', 'から'],
    answer: 0,
    explain: 'A の ほうが B より〜 means "A is more ~ than B".',
  },
  // Listening (pure kana with multi-turn tags)
  {
    level: 'N5',
    section: 'listening',
    prompt: 'Listen to the dialogue and answer: How much will the customer pay?',
    audio: 'みせで、おんなのひとと、てんいんが はなしています。……F:すみません、コーヒーを ふたつ ください。……M:はい、ろっぴゃくえんです。',
    options: ['300円', '500円', '600円', '800円'],
    answer: 2,
    explain: 'The clerk says 「はい、ろっぴゃくえん（六百円）です」 (600 yen).',
  },
  {
    level: 'N5',
    section: 'listening',
    prompt: 'Listen to the announcement: What will the speaker do on Sunday?',
    audio: 'にちようびは、ともだちと、あさくさの おてらを みます。そのあと、おかしを たべます。',
    options: ['Go to school', 'See a temple in Asakusa with a friend', 'Buy a train ticket tonight', 'Work at a café'],
    answer: 1,
    explain: 'The speaker says 「にちようびは、ともだちと、あさくさの おてらを みます」.',
  },
  {
    level: 'N5',
    section: 'listening',
    prompt: 'Listen to the conversation: Which floor is the restroom on?',
    audio: 'デパートで、おとこのひとと、てんいんが はなしています。……M:すみません、おてあらいは どこですか。……F:おてあらいは、さんがいの ひだりです。',
    options: ['1st floor', '2nd floor', '3rd floor', '5th floor'],
    answer: 2,
    explain: 'The staff member says 「おてあらいは、さんがい（三階）の ひだりです」 (3rd floor, on the left).',
  },

  // ==================== JLPT N4 Bridge ====================
  // Vocab / Kanji
  {
    level: 'N4',
    section: 'vocab',
    prompt: '「温泉に 入る 前に、体を 洗います。」 — What is the reading of 温泉?',
    options: ['おんせん', 'おゆ', 'りょかん', 'おきなわ'],
    answer: 0,
    explain: '温泉 is read おんせん (hot spring).',
  },
  {
    level: 'N4',
    section: 'vocab',
    prompt: '「きのうから 少し 熱が あります。」 — What does 熱 (ねつ) mean here?',
    options: ['Fever', 'Medicine', 'Reservation', 'Towel'],
    answer: 0,
    explain: '熱が あります (ねつが あります) means "I have a fever".',
  },
  {
    level: 'N4',
    section: 'vocab',
    prompt: '「今日から 一泊 おねがいします。」 — What is the reading of 一泊 (one night’s stay)?',
    options: ['いちはく', 'いっぱく', 'ひとぱく', 'いっぴき'],
    answer: 1,
    explain: '一 + 泊 (はく) undergoes p-gemination: いっぱく.',
  },
  {
    level: 'N4',
    section: 'vocab',
    prompt: '「サクラさんは アナに お守りを くれました。」 — What is an お守り (おまもり)?',
    options: ['A protective amulet / good-luck charm', 'A bullet train ticket', 'A hot spring towel', 'A cold medicine'],
    answer: 0,
    explain: 'お守り (from 守る, to protect) is a Shinto/Buddhist amulet.',
  },
  // Grammar / Reading
  {
    level: 'N4',
    section: 'grammar',
    prompt: 'わたしは 日本の 温泉に（　）ことが あります。',
    options: ['行った', '行く', '行って', '行こう'],
    answer: 0,
    explain: 'Plain past (V-た) + ことが あります expresses past life experience ("have been to").',
  },
  {
    level: 'N4',
    section: 'grammar',
    prompt: '温泉に 入る 前に、体を（　）なりません。',
    options: ['洗わなければ', '洗っては', '洗うつもり', '洗ったり'],
    answer: 0,
    explain: 'V-なければ なりません means "must V" (洗う → 洗わなければ なりません).',
  },
  {
    level: 'N4',
    section: 'grammar',
    prompt: '日本に 来てから、日本語が（　）ように なりました。',
    options: ['話せる', '話した', '話して', '話し'],
    answer: 0,
    explain: 'Potential form (話せる) + ように なりました means "became able to speak".',
  },
  {
    level: 'N4',
    section: 'grammar',
    prompt: '【旅館の あんない】「温泉は 1階に あります。夜は 11時まで 入れます。タオルを お湯に 入れては いけません。」\nどれが 正しい（ただしい）ですか。',
    options: [
      '夜 10時に 温泉に 入る ことが できます。',
      'タオルを お湯の 中に 入れても いいです。',
      '温泉は 3階に あります。',
      '夜は 温泉に 入れません。',
    ],
    answer: 0,
    explain: 'Since the onsen is open until 11 PM (夜は 11時まで 入れます), you can enter at 10 PM.',
  },
  // Listening (multi-turn N4 dialogues)
  {
    level: 'N4',
    section: 'listening',
    prompt: 'Listen to the pharmacy consultation: When and how often should the patient take the medicine?',
    audio: 'やっきょくで、おんなのひとと、やくざいしが はなしています。……F:この くすりは、いちにちに なんかい のめば いいですか。……M:ごはんを たべた あとで、いちにち さんかい のんで ください。',
    options: [
      '3 times a day, after meals',
      '3 times a day, before meals',
      'Once a day, before sleeping',
      'Twice a day, in the morning and night',
    ],
    answer: 0,
    explain: 'The pharmacist says 「ごはんを たべた あとで、いちにち さんかい のんで ください」 (after meals, 3 times a day).',
  },
  {
    level: 'N4',
    section: 'listening',
    prompt: 'Listen to the two friends talking: Where do they plan to go this weekend?',
    audio: 'おんなのひとと、おとこのひとが はなしています。……F:しゅうまつは、どこへ いく つもりですか。……M:はこねの おんせんに いく つもりです。まだ いった ことが ないんです。',
    options: ['To a hot spring in Hakone', 'To an electronics store in Akihabara', 'To a café in Ginza', 'To Narita Airport'],
    answer: 0,
    explain: 'The man says 「はこねの おんせんに いく つもりです」 (I plan to go to a hot spring in Hakone).',
  },
];

function buildExamSet(level: ExamLevel): ExamQuestion[] {
  const pool = QUESTION_BANK.filter((q) => q.level === level);
  const pick = (sec: ExamQuestion['section'], n: number) =>
    [...pool.filter((q) => q.section === sec)].sort(() => Math.random() - 0.5).slice(0, n);
  return [...pick('vocab', 4), ...pick('grammar', 4), ...pick('listening', 2)];
}

export default function Exam() {
  const { examBest, completeExam, sfxEnabled } = useStore();
  const [level, setLevel] = useState<ExamLevel>('N5');
  const [seed, setSeed] = useState(0);
  const questions = useMemo(() => buildExamSet(level), [level, seed]);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [submitted, setSubmitted] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState(10 * 60); // 10-minute mini mock

  useEffect(() => {
    if (submitted) return;
    const t = setInterval(() => {
      setSecondsLeft((s) => {
        if (s <= 1) {
          setSubmitted(true);
          return 0;
        }
        return s - 1;
      });
    }, 1000);
    return () => clearInterval(t);
  }, [submitted]);

  const total = questions.length;
  const answeredCount = Object.keys(answers).length;
  const correctCount = questions.filter((q, i) => answers[i] === q.answer).length;
  const score = Math.round((correctCount / total) * 100);

  const sectionScore = (sec: ExamQuestion['section']) => {
    const qs = questions.map((q, i) => ({ q, i })).filter((x) => x.q.section === sec);
    const ok = qs.filter((x) => answers[x.i] === x.q.answer).length;
    return `${ok}/${qs.length}`;
  };

  const submit = () => {
    setSubmitted(true);
    completeExam(score);
    if (sfxEnabled) (score >= PASS ? playFanfare : playDing)();
  };

  const reset = (nextLevel: ExamLevel = level) => {
    setLevel(nextLevel);
    setSeed((s) => s + 1);
    setAnswers({});
    setSubmitted(false);
    setSecondsLeft(10 * 60);
  };

  const mins = String(Math.floor(secondsLeft / 60)).padStart(2, '0');
  const secs = String(secondsLeft % 60).padStart(2, '0');

  return (
    <div className="page">
      <div className="row-between">
        <h1>模擬試験 <span className="muted">JLPT {level} Mock Exam</span></h1>
        <div className="controls">
          {examBest !== null && <span className="chip">Best: {examBest}%</span>}
          <span className={`chip ${secondsLeft < 60 && !submitted ? 'bad' : 'on'}`}>⏱ {mins}:{secs}</span>
        </div>
      </div>

      <div className="controls">
        <button className={level === 'N5' ? 'chip on' : 'chip'} onClick={() => reset('N5')}>
          JLPT N5 Exam
        </button>
        <button className={level === 'N4' ? 'chip on' : 'chip'} onClick={() => reset('N4')}>
          JLPT N4 Bridge Exam
        </button>
        <button className="chip" onClick={() => reset(level)}>
          🔀 New Question Set
        </button>
      </div>

      <p className="muted">
        Covers Vocabulary/Kanji (文字・語彙), Grammar/Reading (文法・読解), and Multi-Voice Listening (聴解). Pass mark: {PASS}%.
      </p>

      {questions.map((q, i) => (
        <div key={`${level}-${seed}-${i}`} className="question">
          <div className="row-between">
            <span className="tag">
              Q{i + 1} · {q.level} · {q.section === 'vocab' ? '文字・語彙' : q.section === 'grammar' ? '文法・読解' : '聴解 Listening'}
            </span>
            {q.audio && (
              <button className="chip on" onClick={() => speak(q.audio!, 0.88)}>
                🔊 Play Audio
              </button>
            )}
          </div>
          <p className="jp" style={{ whiteSpace: 'pre-line' }}>{q.prompt}</p>
          <div className="controls">
            {q.options.map((opt, j) => {
              const chosen = answers[i] === j;
              const cls = !submitted
                ? chosen
                  ? 'chip on'
                  : 'chip'
                : j === q.answer
                  ? 'chip ok'
                  : chosen
                    ? 'chip bad'
                    : 'chip';
              return (
                <button
                  key={j}
                  className={cls}
                  disabled={submitted}
                  onClick={() => setAnswers((a) => ({ ...a, [i]: j }))}
                >
                  {opt}
                </button>
              );
            })}
          </div>
          {submitted && (
            <p className={answers[i] === q.answer ? 'ok-text small' : 'bad-text small'}>
              {answers[i] === q.answer ? '✓ Correct — ' : '✗ Incorrect — '}
              {q.explain}
            </p>
          )}
        </div>
      ))}

      {!submitted ? (
        <div className="result">
          <span className="muted">{answeredCount}/{total} answered</span>
          <button className="chip on" onClick={submit}>
            Submit Exam ({answeredCount}/{total})
          </button>
        </div>
      ) : (
        <div className="gp">
          <h2>
            Result: {score}% ({correctCount}/{total}) —{' '}
            <span className={score >= PASS ? 'ok-text' : 'bad-text'}>
              {score >= PASS ? '合格 PASSED 🎉' : '不合格 Keep Studying'}
            </span>
          </h2>
          <p className="muted">
            文字・語彙: {sectionScore('vocab')} · 文法・読解: {sectionScore('grammar')} · 聴解: {sectionScore('listening')}
          </p>
          <div className="controls">
            <button className="chip on" onClick={() => reset(level)}>↻ Retake {level} Exam</button>
            <button className="chip" onClick={() => reset(level === 'N5' ? 'N4' : 'N5')}>
              Switch to {level === 'N5' ? 'N4 Bridge' : 'N5'} Exam →
            </button>
            <Link className="chip" to="/">← Back to Dashboard</Link>
          </div>
        </div>
      )}
    </div>
  );
}
