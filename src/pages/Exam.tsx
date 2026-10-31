import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { SECTION_META, type ExamLevel, type ExamSection } from '../data/exam';
import {
  clearSeenFingerprints,
  generateFreshExam,
  type GeneratedExamQuestion,
} from '../lib/jlptGenerator';
import { useStore, todayStr, type CardKind, type SrsItem } from '../lib/store';
import { speak, stopSpeaking } from '../lib/tts';
import { playDing, playFanfare } from '../lib/sfx';

type ExamMode = 'full' | 'mini';

function letterGrade(pct: number): 'A' | 'B' | 'C' {
  if (pct >= 67) return 'A';
  if (pct >= 34) return 'B';
  return 'C';
}

function examQuestionToSrsCard(q: GeneratedExamQuestion): Omit<SrsItem, 'card'> {
  const bracketMatch = q.prompt.match(/【([^】]+)】/);
  const firstLine = q.prompt.split('\n')[0].trim();
  const winOpt = q.options[q.answer];
  const kind: CardKind =
    q.section === 'vocab'
      ? q.mondaiId === 'V1' || q.mondaiId === 'V2'
        ? 'kanji'
        : 'word'
      : 'grammar';

  const front = bracketMatch ? bracketMatch[1] : firstLine;
  return {
    id: `exam:${q.id}`,
    kind,
    front,
    reading: winOpt,
    back: `${winOpt} — ${q.explain}`,
  };
}

export default function Exam() {
  const { examBest, examHistory, completeExam, recordExamCertificate, sfxEnabled, srs, addCard } = useStore();
  const [level, setLevel] = useState<ExamLevel>('N5');
  const [mode, setMode] = useState<ExamMode>('full');
  const [activeSec, setActiveSec] = useState<ExamSection | 'all'>('all');
  const [edition, setEdition] = useState(1);
  const [showCertHistory, setShowCertHistory] = useState(false);

  const { questions, seenCount } = useMemo(
    () => generateFreshExam(level, mode),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [level, mode, edition],
  );

  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [flagged, setFlagged] = useState<Record<number, boolean>>({});
  const [starOrders, setStarOrders] = useState<Record<number, number[]>>({});
  const [submitted, setSubmitted] = useState(false);

  // Official JLPT N5 time limit: 20m (Vocab) + 40m (Grammar/Reading) + 30m (Listening) = 90 mins
  const durationMins = mode === 'full' ? 90 : 15;
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

  useEffect(() => () => stopSpeaking(), []);

  const total = questions.length;
  const answeredCount = Object.keys(answers).length;
  const flaggedCount = Object.values(flagged).filter(Boolean).length;
  const correctCount = questions.filter((q, i) => answers[i] === q.answer).length;
  const pctScore = Math.round((correctCount / total) * 100);

  const missedQuestions = questions.filter((q, i) => answers[i] !== q.answer);
  const unaddedMissedQuestions = missedQuestions.filter((q) => !srs[`exam:${q.id}`]);

  const addAllMissedToSrs = () => {
    unaddedMissedQuestions.forEach((q) => addCard(examQuestionToSrsCard(q)));
    if (sfxEnabled) playDing();
  };

  const secStats = (sec: ExamSection) => {
    const qs = questions.map((q, i) => ({ q, i })).filter((x) => x.q.section === sec);
    const ok = qs.filter((x) => answers[x.i] === x.q.answer).length;
    const pct = qs.length ? Math.round((ok / qs.length) * 100) : 0;
    return { ok, total: qs.length, pct };
  };

  const vocabStats = secStats('vocab');
  const grammarStats = secStats('grammar');
  const listenStats = secStats('listening');

  // Official JLPT 180-point scaled score calculation
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
    stopSpeaking();
    setSubmitted(true);
    completeExam(pctScore);
    const weakSet = Array.from(
      new Set(questions.filter((q, idx) => answers[idx] !== q.answer).map((q) => q.mondaiTitle.split('（')[0])),
    ).slice(0, 4);
    recordExamCertificate({
      id: `${Date.now()}`,
      date: todayStr(),
      level,
      mode,
      totalPts,
      langReadingPts,
      listenPts,
      passed: passedOverall,
      vocabGrade: letterGrade(vocabStats.pct),
      grammarGrade: letterGrade(grammarStats.pct),
      weakMondai: weakSet,
    });
    if (sfxEnabled) (passedOverall ? playFanfare : playDing)();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const generateNewTake = (nextLevel: ExamLevel = level, nextMode: ExamMode = mode) => {
    stopSpeaking();
    setLevel(nextLevel);
    setMode(nextMode);
    setActiveSec('all');
    setEdition((e) => e + 1);
    setAnswers({});
    setFlagged({});
    setStarOrders({});
    setSubmitted(false);
    setSecondsLeft((nextMode === 'full' ? 90 : 15) * 60);
  };

  const toggleFlag = (idx: number) => {
    setFlagged((f) => ({ ...f, [idx]: !f[idx] }));
  };

  const mins = String(Math.floor(secondsLeft / 60)).padStart(2, '0');
  const secs = String(secondsLeft % 60).padStart(2, '0');

  return (
    <div className="page">
      <div className="row-between">
        <div>
          <h1 className="nomargin">
            日本語能力試験 <span className="muted">JLPT {level} {mode === 'full' ? 'Full Simulation (67 Qs)' : 'Express Mock (15 Qs)'}</span>
          </h1>
          <p className="muted small nomargin" style={{ marginTop: '0.2rem' }}>
            Edition #{edition} · Unique non-repeating generator ({seenCount} unseen/tracked items rotated)
          </p>
        </div>
        <div className="controls">
          {examBest !== null && <span className="chip">Best: {examBest}%</span>}
          <span className={`chip ${secondsLeft < 120 && !submitted ? 'bad' : 'on'}`}>⏱ {mins}:{secs}</span>
        </div>
      </div>

      {/* Mode, Level & Fresh Exam Generator Bar */}
      <div className="controls" style={{ marginTop: '0.8rem' }}>
        <button className={mode === 'full' ? 'chip on' : 'chip'} onClick={() => generateNewTake(level, 'full')}>
          🏛️ Official Full Exam (67 Qs · 90m)
        </button>
        <button className={mode === 'mini' ? 'chip on' : 'chip'} onClick={() => generateNewTake(level, 'mini')}>
          ⚡ Express Mock (15 Qs · 15m)
        </button>
        <button className={level === 'N5' ? 'chip on' : 'chip'} onClick={() => generateNewTake('N5', mode)}>
          JLPT N5
        </button>
        <button className={level === 'N4' ? 'chip on' : 'chip'} onClick={() => generateNewTake('N4', mode)}>
          JLPT N4
        </button>
        <button className="chip on" onClick={() => generateNewTake(level, mode)} title="Synthesize a brand-new exam with fresh questions, passages, and listening dialogues">
          🎲 Generate Brand-New Exam
        </button>
        <button
          className="chip"
          onClick={() => {
            clearSeenFingerprints();
            generateNewTake(level, mode);
          }}
          title="Clear seen-question history and draw fresh"
        >
          ↺ Reset History
        </button>
        {examHistory.length > 0 && (
          <button
            className={showCertHistory ? 'chip on' : 'chip'}
            onClick={() => setShowCertHistory((s) => !s)}
          >
            📜 Past Certificates ({examHistory.length})
          </button>
        )}
      </div>

      {/* Past Score Certificates History Log */}
      {showCertHistory && examHistory.length > 0 && (
        <div className="gp" style={{ margin: '0.8rem 0', padding: '1rem 1.2rem' }}>
          <div className="row-between">
            <b>📜 合否結果通知書履歴 · Past Exam Certificates ({examHistory.length})</b>
            <span className="muted small">Tracks your scaled score trajectory &amp; weak Mondai</span>
          </div>
          <div style={{ display: 'grid', gap: '0.5rem', marginTop: '0.6rem', maxHeight: '260px', overflowY: 'auto' }}>
            {examHistory.map((cert) => (
              <div
                key={cert.id}
                className="row-between"
                style={{
                  background: 'var(--surface2)',
                  padding: '0.55rem 0.9rem',
                  borderRadius: '10px',
                  borderLeft: `3px solid ${cert.passed ? 'var(--ok)' : 'var(--bad)'}`,
                }}
              >
                <div>
                  <b>JLPT {cert.level}</b>{' '}
                  <span className="muted small">
                    ({cert.mode === 'full' ? '67 Qs Full' : '15 Qs Express'} · {cert.date})
                  </span>
                  <span
                    className={cert.passed ? 'ok-text small' : 'bad-text small'}
                    style={{ marginLeft: '0.6rem', fontWeight: 600 }}
                  >
                    {cert.passed ? '合格 PASSED' : '不合格 NOT PASSED'}
                  </span>
                  {cert.weakMondai.length > 0 && (
                    <div className="muted small">
                      Focus areas: {cert.weakMondai.join(' · ')}
                    </div>
                  )}
                </div>
                <div style={{ textAlign: 'right' }}>
                  <b>{cert.totalPts} / 180 pts</b>
                  <div className="muted small">
                    Lang/Read {cert.langReadingPts}/120 · Listen {cert.listenPts}/60 · Grades {cert.vocabGrade}/{cert.grammarGrade}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Section Filter Bar */}
      <div className="controls">
        <button className={activeSec === 'all' ? 'chip on' : 'chip'} onClick={() => setActiveSec('all')}>
          All 3 Sections ({questions.length})
        </button>
        {(['vocab', 'grammar', 'listening'] as ExamSection[]).map((sec) => {
          const cnt = questions.filter((q) => q.section === sec).length;
          return (
            <button key={sec} className={activeSec === sec ? 'chip on' : 'chip'} onClick={() => setActiveSec(sec)}>
              {sec === 'vocab' ? '第1部・文字語彙 (20m)' : sec === 'grammar' ? '第2部・文法読解 (40m)' : '第3部・聴解 (30m)'} ({cnt})
            </button>
          );
        })}
      </div>

      {/* Mark Sheet (マークシート) Question Navigator */}
      <div className="gp" style={{ padding: '0.85rem 1rem' }}>
        <div className="row-between" style={{ marginBottom: '0.5rem' }}>
          <span className="small muted">
            <b>マークシート Answer Sheet</b>: {answeredCount}/{total} answered
            {flaggedCount > 0 ? ` · 🚩 ${flaggedCount} flagged` : ''} · Official Pass ≥ {passTotalThreshold}/180 pts
          </span>
          {!submitted && (
            <button className="chip on" style={{ padding: '0.28rem 0.85rem', fontSize: '0.82rem' }} onClick={submit}>
              💮 Submit &amp; Grade Exam ({answeredCount}/{total})
            </button>
          )}
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.3rem' }}>
          {questions.map((q: GeneratedExamQuestion, i: number) => {
            const isAnswered = answers[i] !== undefined;
            const isFlagged = !!flagged[i];
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
                key={q.id + '-' + i}
                className={pillCls}
                style={{
                  padding: '0.2rem 0.5rem',
                  fontSize: '0.75rem',
                  minWidth: '2.1rem',
                  borderColor: isFlagged && !submitted ? 'var(--bad)' : undefined,
                }}
                onClick={() => {
                  setActiveSec('all');
                  setTimeout(() => {
                    document.getElementById(`exam-q-${i}`)?.scrollIntoView({ behavior: 'smooth', block: 'center' });
                  }, 30);
                }}
              >
                {i + 1}
                {isFlagged && !submitted ? '🚩' : ''}
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
              <span className="tag">日本語能力試験 合否結果通知書 · OFFICIAL SCORE REPORT (EDITION #{edition})</span>
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
                言語知識・読解 (基準点 38) {passedLangSection ? '✓' : '✗'}
              </span>
            </div>
            <div className="stat">
              <b>
                {listenPts} <span className="muted small">/ 60</span>
              </b>
              <span>
                聴解 Listening (基準点 19) {passedListenSection ? '✓' : '✗'}
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
            {missedQuestions.length > 0 && (
              <button
                className={unaddedMissedQuestions.length === 0 ? 'chip ok' : 'chip on'}
                disabled={unaddedMissedQuestions.length === 0}
                onClick={addAllMissedToSrs}
              >
                {unaddedMissedQuestions.length === 0
                  ? `✓ All ${missedQuestions.length} Missed Items in SRS`
                  : `+ Add ${unaddedMissedQuestions.length} Missed Items to SRS`}
              </button>
            )}
            <button className="chip on" onClick={() => generateNewTake(level, mode)}>
              🎲 Take Another Fresh {level} Exam (New Questions &amp; Audio)
            </button>
            <button className="chip" onClick={() => generateNewTake(level === 'N5' ? 'N4' : 'N5', mode)}>
              Switch to JLPT {level === 'N5' ? 'N4' : 'N5'} →
            </button>
            <Link className="chip" to="/review">
              Open FSRS Review →
            </Link>
          </div>
        </div>
      )}

      {/* Questions List */}
      {questions.map((q: GeneratedExamQuestion, i: number) => {
        if (activeSec !== 'all' && q.section !== activeSec) return null;
        const prevSec = i > 0 ? questions[i - 1].section : null;
        const prevMondai = i > 0 ? questions[i - 1].mondaiId : null;
        const showSecHeader = activeSec === 'all' && q.section !== prevSec;
        const showMondaiHeader = q.mondaiId !== prevMondai;

        return (
          <div key={`${edition}-${q.id}-${i}`} id={`exam-q-${i}`}>
            {showSecHeader && (
              <h2 style={{ marginTop: '1.8rem', marginBottom: '0.3rem', color: 'var(--accent)' }}>
                {SECTION_META[q.section].jp}{' '}
                <span className="muted small">— {SECTION_META[q.section].en}</span>
              </h2>
            )}
            {showMondaiHeader && (
              <p className="muted small" style={{ margin: '0.8rem 0 0.3rem', fontWeight: 600 }}>
                ■ {q.mondaiTitle}
              </p>
            )}

            <div className="question">
              <div className="row-between">
                <span className="tag">
                  問{i + 1} · {q.mondaiTitle}
                </span>
                <div className="controls nomargin">
                  {q.audio && (
                    <>
                      <button className="chip on" onClick={() => speak(q.audio!, 0.9)}>
                        🔊 Play Audio
                      </button>
                      <button className="chip" onClick={() => speak(q.audio!, 0.72)}>
                        🐢 Slow
                      </button>
                    </>
                  )}
                  {!submitted && (
                    <button
                      className={flagged[i] ? 'chip bad' : 'chip'}
                      style={{ padding: '0.25rem 0.65rem', fontSize: '0.78rem' }}
                      onClick={() => toggleFlag(i)}
                    >
                      {flagged[i] ? '🚩 Flagged' : '🏳️ Flag'}
                    </button>
                  )}
                </div>
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

              {/* Interactive ★ Star Sentence Builder for G2 questions */}
              {q.mondaiId === 'G2' && !submitted && (() => {
                const slots = [0, 1, 2, 3];
                const beforeStar = q.prompt.split('[ ★ ]')[0] ?? '';
                const starSlotIdx = (beforeStar.match(/＿＿＿/g) ?? []).length; // 1 (2nd slot) or 2 (3rd slot)
                const order = starOrders[i] ?? [];

                const toggleChunkInBuilder = (optIdx: number) => {
                  const nextOrder = order.includes(optIdx)
                    ? order.filter((x) => x !== optIdx)
                    : order.length < 4
                      ? [...order, optIdx]
                      : order;
                  setStarOrders((prev) => ({ ...prev, [i]: nextOrder }));
                  if (nextOrder[starSlotIdx] !== undefined) {
                    setAnswers((a) => ({ ...a, [i]: nextOrder[starSlotIdx] }));
                  }
                };

                return (
                  <div
                    style={{
                      background: 'var(--surface2)',
                      padding: '0.6rem 0.9rem',
                      borderRadius: '10px',
                      margin: '0.5rem 0',
                    }}
                  >
                    <div className="row-between">
                      <span className="small muted">
                        🧩 <b>★ Sentence Builder:</b> Tap options in order (1st → 4th) to auto-select the <b>[ ★ ]</b> slot:
                      </span>
                      {order.length > 0 && (
                        <button
                          type="button"
                          className="chip"
                          style={{ padding: '0.15rem 0.55rem', fontSize: '0.72rem' }}
                          onClick={() => setStarOrders((prev) => ({ ...prev, [i]: [] }))}
                        >
                          ↺ Clear Slots
                        </button>
                      )}
                    </div>
                    <div className="controls" style={{ marginTop: '0.4rem', marginBottom: '0.2rem' }}>
                      {slots.map((sIdx) => {
                        const chosenOptIdx = order[sIdx];
                        const isStar = sIdx === starSlotIdx;
                        return (
                          <span
                            key={sIdx}
                            className={`chip ${isStar ? 'on' : ''}`}
                            style={{
                              fontSize: '0.85rem',
                              padding: '0.28rem 0.7rem',
                              borderStyle: chosenOptIdx === undefined ? 'dashed' : 'solid',
                            }}
                          >
                            {isStar ? '★ ' : `${sIdx + 1}: `}
                            {chosenOptIdx !== undefined ? q.options[chosenOptIdx] : '＿＿＿'}
                          </span>
                        );
                      })}
                    </div>
                    <div className="controls" style={{ marginTop: '0.35rem', marginBottom: 0 }}>
                      {q.options.map((opt, j) => (
                        <button
                          key={j}
                          type="button"
                          className={order.includes(j) ? 'chip on' : 'chip'}
                          style={{ padding: '0.22rem 0.65rem', fontSize: '0.8rem' }}
                          onClick={() => toggleChunkInBuilder(j)}
                        >
                          {order.includes(j) ? `#${order.indexOf(j) + 1} ` : '+ '}
                          {opt}
                        </button>
                      ))}
                    </div>
                  </div>
                );
              })()}

              <div className="controls">
                {q.options.map((opt: string, j: number) => {
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
                <div style={{ marginTop: '0.5rem' }}>
                  {q.transcript && (
                    <p className="jp small muted" style={{ whiteSpace: 'pre-line', margin: '0.3rem 0' }}>
                      📜 <b>Script:</b> {q.transcript}
                    </p>
                  )}
                  <div className="row-between" style={{ gap: '0.6rem', marginTop: '0.25rem' }}>
                    <p
                      className={answers[i] === q.answer ? 'ok-text small nomargin' : 'bad-text small nomargin'}
                      style={{ flex: 1 }}
                    >
                      {answers[i] === q.answer ? '✓ Correct — ' : `✗ Incorrect (Answer: ${q.answer + 1}. ${q.options[q.answer]}) — `}
                      {q.explain}
                    </p>
                    <button
                      className={srs[`exam:${q.id}`] ? 'chip ok' : 'chip'}
                      style={{ padding: '0.22rem 0.65rem', fontSize: '0.76rem', flexShrink: 0 }}
                      disabled={!!srs[`exam:${q.id}`]}
                      onClick={() => addCard(examQuestionToSrsCard(q))}
                    >
                      {srs[`exam:${q.id}`] ? '✓ In SRS' : '+ Add to SRS'}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        );
      })}

      {!submitted && (
        <div className="result">
          <span className="muted">
            {answeredCount}/{total} answered {flaggedCount > 0 ? `(${flaggedCount} flagged)` : ''}
          </span>
          <button className="chip on" onClick={submit}>
            💮 Submit JLPT {level} Exam ({answeredCount}/{total})
          </button>
        </div>
      )}
    </div>
  );
}
