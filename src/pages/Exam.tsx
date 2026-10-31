import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  EXAM_QUESTIONS,
  SECTION_META,
  type ExamLevel,
  type ExamQuestion,
  type ExamSection,
} from '../data/exam';
import { useStore } from '../lib/store';
import { speak } from '../lib/tts';
import { playDing, playFanfare } from '../lib/sfx';

type ExamMode = 'full' | 'mini';

function buildExamSet(level: ExamLevel, mode: ExamMode): ExamQuestion[] {
  const pool = EXAM_QUESTIONS.filter((q) => q.level === level);
  const pick = (sec: ExamSection) => {
    const items = pool.filter((q) => q.section === sec);
    const count = mode === 'full' ? SECTION_META[sec].fullCount : SECTION_META[sec].miniCount;
    if (mode === 'full') return items.slice(0, count);
    return [...items].sort(() => Math.random() - 0.5).slice(0, count);
  };
  return [...pick('vocab'), ...pick('grammar'), ...pick('listening')];
}

function letterGrade(pct: number): 'A' | 'B' | 'C' {
  if (pct >= 67) return 'A';
  if (pct >= 34) return 'B';
  return 'C';
}

export default function Exam() {
  const { examBest, completeExam, sfxEnabled } = useStore();
  const [level, setLevel] = useState<ExamLevel>('N5');
  const [mode, setMode] = useState<ExamMode>('full');
  const [activeSec, setActiveSec] = useState<ExamSection | 'all'>('all');
  const [seed, setSeed] = useState(0);
  const questions = useMemo(() => buildExamSet(level, mode), [level, mode, seed]);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [submitted, setSubmitted] = useState(false);
  const durationMins = mode === 'full' ? 30 : 10;
  const [secondsLeft, setSecondsLeft] = useState(durationMins * 60);

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
  const pctScore = Math.round((correctCount / total) * 100);

  // Official JLPT 180-point scoring breakdown:
  // Language Knowledge (Vocab + Grammar/Reading) = 120 pts (min 38 to pass)
  // Listening = 60 pts (min 19 to pass)
  // Total = 180 pts (N5 pass >= 80, N4 pass >= 90)
  const secStats = (sec: ExamSection) => {
    const qs = questions.map((q, i) => ({ q, i })).filter((x) => x.q.section === sec);
    const ok = qs.filter((x) => answers[x.i] === x.q.answer).length;
    const pct = qs.length ? Math.round((ok / qs.length) * 100) : 0;
    return { ok, total: qs.length, pct };
  };

  const vocabStats = secStats('vocab');
  const grammarStats = secStats('grammar');
  const listenStats = secStats('listening');

  const langReadingTotalQs = vocabStats.total + grammarStats.total;
  const langReadingOk = vocabStats.ok + grammarStats.ok;
  const langReadingPts = langReadingTotalQs ? Math.round((langReadingOk / langReadingTotalQs) * 120) : 0;
  const listenPts = listenStats.total ? Math.round((listenStats.ok / listenStats.total) * 60) : 0;
  const totalPts = langReadingPts + listenPts;

  const passTotalThreshold = level === 'N5' ? 80 : 90;
  const passedLangSection = langReadingPts >= 38;
  const passedListenSection = listenPts >= 19;
  const passedOverall = totalPts >= passTotalThreshold && passedLangSection && passedListenSection;

  const submit = () => {
    setSubmitted(true);
    completeExam(pctScore);
    if (sfxEnabled) (passedOverall ? playFanfare : playDing)();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const reset = (nextLevel: ExamLevel = level, nextMode: ExamMode = mode) => {
    setLevel(nextLevel);
    setMode(nextMode);
    setActiveSec('all');
    setSeed((s) => s + 1);
    setAnswers({});
    setSubmitted(false);
    setSecondsLeft((nextMode === 'full' ? 30 : 10) * 60);
  };

  const mins = String(Math.floor(secondsLeft / 60)).padStart(2, '0');
  const secs = String(secondsLeft % 60).padStart(2, '0');

  return (
    <div className="page">
      <div className="row-between">
        <h1>
          模擬試験 <span className="muted">JLPT {level} {mode === 'full' ? 'Full Mock Exam' : 'Mini-Mock'}</span>
        </h1>
        <div className="controls">
          {examBest !== null && <span className="chip">Best: {examBest}%</span>}
          <span className={`chip ${secondsLeft < 60 && !submitted ? 'bad' : 'on'}`}>⏱ {mins}:{secs}</span>
        </div>
      </div>

      {/* Mode & Level Controls */}
      <div className="controls">
        <button className={mode === 'full' ? 'chip on' : 'chip'} onClick={() => reset(level, 'full')}>
          🏛️ Full JLPT Exam (30 Qs · 180 pts)
        </button>
        <button className={mode === 'mini' ? 'chip on' : 'chip'} onClick={() => reset(level, 'mini')}>
          ⚡ Quick Mini-Mock (10 Qs)
        </button>
        <span className="muted small" style={{ alignSelf: 'center', marginLeft: '0.3rem' }}>Level:</span>
        <button className={level === 'N5' ? 'chip on' : 'chip'} onClick={() => reset('N5', mode)}>
          JLPT N5
        </button>
        <button className={level === 'N4' ? 'chip on' : 'chip'} onClick={() => reset('N4', mode)}>
          JLPT N4 Bridge
        </button>
        {mode === 'mini' && (
          <button className="chip" onClick={() => reset(level, mode)}>
            🔀 Shuffle Set
          </button>
        )}
      </div>

      {/* Section Tabs */}
      <div className="controls">
        <button className={activeSec === 'all' ? 'chip on' : 'chip'} onClick={() => setActiveSec('all')}>
          All Parts ({questions.length})
        </button>
        {(['vocab', 'grammar', 'listening'] as ExamSection[]).map((sec) => {
          const cnt = questions.filter((q) => q.section === sec).length;
          return (
            <button key={sec} className={activeSec === sec ? 'chip on' : 'chip'} onClick={() => setActiveSec(sec)}>
              {sec === 'vocab' ? '第1部・文字語彙' : sec === 'grammar' ? '第2部・文法読解' : '第3部・聴解'} ({cnt})
            </button>
          );
        })}
      </div>

      {/* Question Navigator Grid */}
      <div className="gp" style={{ padding: '0.75rem 1rem' }}>
        <div className="row-between" style={{ marginBottom: '0.45rem' }}>
          <span className="small muted">
            Question Navigator ({answeredCount}/{total} answered · Official Scale: 180 pts, Pass ≥ {passTotalThreshold} pts)
          </span>
          {!submitted && answeredCount > 0 && (
            <button className="chip on" style={{ padding: '0.25rem 0.8rem', fontSize: '0.8rem' }} onClick={submit}>
              Submit Exam Now →
            </button>
          )}
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem' }}>
          {questions.map((q, i) => {
            const isAnswered = answers[i] !== undefined;
            const isCorrect = answers[i] === q.answer;
            const pillCls = !submitted
              ? isAnswered
                ? 'chip on'
                : 'chip'
              : isCorrect
                ? 'chip ok'
                : 'chip bad';
            return (
              <button
                key={q.id}
                className={pillCls}
                style={{ padding: '0.22rem 0.55rem', fontSize: '0.78rem', minWidth: '2.1rem' }}
                onClick={() => {
                  setActiveSec('all');
                  setTimeout(() => {
                    document.getElementById(`exam-q-${i}`)?.scrollIntoView({ behavior: 'smooth', block: 'center' });
                  }, 30);
                }}
              >
                {i + 1}
              </button>
            );
          })}
        </div>
      </div>

      {/* Official JLPT Certificate Report Card when submitted */}
      {submitted && (
        <div className="bento-banner" style={{ flexDirection: 'column', alignItems: 'stretch', gap: '0.9rem' }}>
          <div className="row-between">
            <div>
              <span className="tag">日本語能力試験 合否結果通知書 · OFFICIAL SCORE REPORT</span>
              <h2 className="nomargin" style={{ fontSize: '1.55rem', marginTop: '0.2rem' }}>
                JLPT {level} Result:{' '}
                <span className={passedOverall ? 'ok-text' : 'bad-text'}>
                  {passedOverall ? '合格 PASSED 🎉' : '不合格 NOT PASSED'}
                </span>
              </h2>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '2rem', fontWeight: 700 }}>
                {totalPts} <span className="muted" style={{ fontSize: '1rem' }}>/ 180 pts</span>
              </div>
              <span className="muted small">
                Raw: {correctCount}/{total} ({pctScore}%) · Pass Mark: {passTotalThreshold}/180
              </span>
            </div>
          </div>

          <div className="stats" style={{ margin: '0.2rem 0' }}>
            <div className="stat">
              <b>
                {langReadingPts} <span className="muted small">/ 120</span>
              </b>
              <span>
                言語知識・読解 (Min 38) {passedLangSection ? '✓' : '✗'}
              </span>
            </div>
            <div className="stat">
              <b>
                {listenPts} <span className="muted small">/ 60</span>
              </b>
              <span>
                聴解 Listening (Min 19) {passedListenSection ? '✓' : '✗'}
              </span>
            </div>
            <div className="stat">
              <b>Grade {letterGrade(vocabStats.pct)}</b>
              <span>文字・語彙 ({vocabStats.ok}/{vocabStats.total})</span>
            </div>
            <div className="stat">
              <b>Grade {letterGrade(grammarStats.pct)}</b>
              <span>文法・読解 ({grammarStats.ok}/{grammarStats.total})</span>
            </div>
          </div>

          <div className="controls">
            <button className="chip on" onClick={() => reset(level, mode)}>
              ↻ Retake {level} {mode === 'full' ? 'Full Exam' : 'Mini-Mock'}
            </button>
            <button className="chip" onClick={() => reset(level === 'N5' ? 'N4' : 'N5', mode)}>
              Switch to JLPT {level === 'N5' ? 'N4 Bridge' : 'N5'} →
            </button>
            <Link className="chip" to="/">
              ← Back to Dashboard
            </Link>
          </div>
        </div>
      )}

      {/* Questions List */}
      {questions.map((q, i) => {
        if (activeSec !== 'all' && q.section !== activeSec) return null;
        const prevSec = i > 0 ? questions[i - 1].section : null;
        const showSecHeader = activeSec === 'all' && q.section !== prevSec;

        return (
          <div key={q.id} id={`exam-q-${i}`}>
            {showSecHeader && (
              <h2 style={{ marginTop: '1.6rem', marginBottom: '0.4rem' }}>
                {SECTION_META[q.section].jp}{' '}
                <span className="muted small">— {SECTION_META[q.section].en}</span>
              </h2>
            )}
            <div className="question">
              <div className="row-between">
                <span className="tag">
                  Q{i + 1} · {q.level} · {q.mondai}
                </span>
                {q.audio && (
                  <div className="controls nomargin">
                    <button className="chip on" onClick={() => speak(q.audio!, 0.9)}>
                      🔊 Play Audio
                    </button>
                    <button className="chip" onClick={() => speak(q.audio!, 0.72)}>
                      🐢 Slow
                    </button>
                  </div>
                )}
              </div>

              {q.passage && (
                <div
                  className="gp jp"
                  style={{
                    background: 'var(--surface2)',
                    whiteSpace: 'pre-line',
                    fontSize: '1.05rem',
                    margin: '0.6rem 0',
                    borderLeft: '3px solid var(--accent)',
                  }}
                >
                  {q.passage}
                </div>
              )}

              <p className="jp" style={{ whiteSpace: 'pre-line' }}>
                {q.prompt}
              </p>

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
                      {j + 1}. {opt}
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
          </div>
        );
      })}

      {!submitted && (
        <div className="result">
          <span className="muted">
            {answeredCount}/{total} answered
          </span>
          <button className="chip on" onClick={submit}>
            💮 Submit JLPT {level} Exam ({answeredCount}/{total})
          </button>
        </div>
      )}
    </div>
  );
}
