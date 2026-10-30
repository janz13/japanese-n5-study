import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { PASS, useStore } from '../lib/store';
import { speak } from '../lib/tts';

interface ExamQuestion {
  section: 'vocab' | 'grammar' | 'listening';
  prompt: string;
  audio?: string;
  options: string[];
  answer: number;
  explain: string;
}

const QUESTIONS: ExamQuestion[] = [
  // Section 1: 文字・語彙 (Vocabulary & Kanji)
  {
    section: 'vocab',
    prompt: '「新しい 車を 買いました。」 — What is the reading of 新しい?',
    options: ['あたらしい', 'ふるい', 'たかい', 'やすい'],
    answer: 0,
    explain: '新しい is read あたらしい (new).',
  },
  {
    section: 'vocab',
    prompt: '「三百円です。」 — What is the reading of 三百円?',
    options: ['さんひゃくえん', 'さんびゃくえん', 'さんぴゃくえん', 'みっつひゃくえん'],
    answer: 1,
    explain: '三百 has a rendaku sound change: さんびゃく + えん.',
  },
  {
    section: 'vocab',
    prompt: 'Which kanji means "station" (えき)?',
    options: ['電', '車', '駅', '店'],
    answer: 2,
    explain: '駅 (えき) means station.',
  },
  {
    section: 'vocab',
    prompt: '「まいにち みずを（　）。」 — Choose the best verb.',
    options: ['のみます', 'たべます', 'よみます', 'ききます'],
    answer: 0,
    explain: 'のみます (飲みます) means "to drink" (water).',
  },
  // Section 2: 文法・読解 (Grammar & Reading)
  {
    section: 'grammar',
    prompt: 'わたしは アメリカ（　）来ました。',
    options: ['を', 'から', 'で', 'が'],
    answer: 1,
    explain: 'から indicates the starting point ("came from America").',
  },
  {
    section: 'grammar',
    prompt: 'この コーヒーは 高いです（　）、おいしいです。',
    options: ['を', 'に', 'が', 'へ'],
    answer: 2,
    explain: 'が connects two contrasting clauses ("It is expensive, but delicious").',
  },
  {
    section: 'grammar',
    prompt: '新幹線（　）京都へ 行きたいです。',
    options: ['で', 'を', 'に', 'は'],
    answer: 0,
    explain: 'で marks the means of transportation ("by bullet train").',
  },
  {
    section: 'grammar',
    prompt: '【メモ】「さくらさんへ。きょうは 3時に 駅の 前に います。いっしょに 喫茶店へ 行きましょう。— アナ」\nアナさんは どこで さくらさんを まちますか。',
    options: ['喫茶店の 中', '駅の 前', '学校の 前', '新幹線の 中'],
    answer: 1,
    explain: 'The note says 「3時に 駅の 前に います」 (I will be in front of the station at 3 o’clock).',
  },
  // Section 3: 聴解 (Listening)
  {
    section: 'listening',
    prompt: 'Listen to the dialogue and answer: How much will the customer pay?',
    audio: 'いらっしゃいませ。コーヒーを 二つ ください。はい、六百円です。',
    options: ['300円', '500円', '600円', '800円'],
    answer: 2,
    explain: 'The clerk says 「はい、六百円（ろっぴゃくえん）です」 (600 yen).',
  },
  {
    section: 'listening',
    prompt: 'Listen to the announcement: What will the speaker do on Sunday?',
    audio: '日曜日は 友だちと 浅草の お寺を 見ます。そのあと、おかしを 食べます。',
    options: ['Go to school', 'See a temple in Asakusa with a friend', 'Buy a train ticket tonight', 'Work at a café'],
    answer: 1,
    explain: 'The speaker says 「日曜日は 友だちと 浅草の お寺を 見ます」.',
  },
];

export default function Exam() {
  const { examBest, completeExam } = useStore();
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

  const total = QUESTIONS.length;
  const answeredCount = Object.keys(answers).length;
  const correctCount = QUESTIONS.filter((q, i) => answers[i] === q.answer).length;
  const score = Math.round((correctCount / total) * 100);

  const sectionScore = (sec: ExamQuestion['section']) => {
    const qs = QUESTIONS.map((q, i) => ({ q, i })).filter((x) => x.q.section === sec);
    const ok = qs.filter((x) => answers[x.i] === x.q.answer).length;
    return `${ok}/${qs.length}`;
  };

  const submit = () => {
    setSubmitted(true);
    completeExam(score);
  };

  const reset = () => {
    setAnswers({});
    setSubmitted(false);
    setSecondsLeft(10 * 60);
  };

  const mins = String(Math.floor(secondsLeft / 60)).padStart(2, '0');
  const secs = String(secondsLeft % 60).padStart(2, '0');

  return (
    <div className="page">
      <div className="row-between">
        <h1>模擬試験 <span className="muted">JLPT N5 Mock Exam</span></h1>
        <div className="controls">
          {examBest !== null && <span className="chip">Best: {examBest}%</span>}
          <span className={`chip ${secondsLeft < 60 && !submitted ? 'bad' : 'on'}`}>⏱ {mins}:{secs}</span>
        </div>
      </div>
      <p className="muted">
        Covers Vocabulary/Kanji (文字・語彙), Grammar/Reading (文法・読解), and Listening (聴解). Pass mark: {PASS}%.
      </p>

      {QUESTIONS.map((q, i) => (
        <div key={i} className="question">
          <div className="row-between">
            <span className="tag">
              Q{i + 1} · {q.section === 'vocab' ? '文字・語彙' : q.section === 'grammar' ? '文法・読解' : '聴解 Listening'}
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
            <button className="chip on" onClick={reset}>↻ Retake Exam</button>
            <Link className="chip" to="/">← Back to Dashboard</Link>
          </div>
        </div>
      )}
    </div>
  );
}
