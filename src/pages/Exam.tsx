import { useEffect, useMemo, useState, useRef, useCallback } from 'react';
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
import { OmrBubbleSheet } from '../components/OmrBubbleSheet';
import { HexagonRadarChart } from '../components/HexagonRadarChart';
import {
  SECTION_STAGE_META,
  getStageDurationSec,
  calculateRadarMetrics,
  type ExamMode,
  type ExamStage,
} from '../lib/examStage';
import { useCampaignMission } from '../lib/useCampaignMission';
import CampaignBanner from '../components/CampaignBanner';

function letterGrade(pct: number): 'A' | 'B' | 'C' {
  if (pct >= 67) return 'A';
  if (pct >= 34) return 'B';
  return 'C';
}

function mondaiToDojoLink(label: string): { to: string; dojo: string } {
  if (label.includes('漢字') || label.includes('表記')) return { to: '/kanji', dojo: 'Kanji Studio' };
  if (label.includes('文脈') || label.includes('言い換え')) return { to: '/conjugate', dojo: 'Vocab & Verb Dojo' };
  if (label.includes('組み立て')) return { to: '/grammar', dojo: 'Grammar Patterns' };
  if (label.includes('文法')) return { to: '/particles', dojo: 'Particle & Grammar Dojo' };
  if (label.includes('内容理解') || label.includes('情報検索') || label.includes('文章'))
    return { to: '/stories', dojo: 'Graded Stories' };
  if (
    label.includes('課題理解') ||
    label.includes('ポイント') ||
    label.includes('発話') ||
    label.includes('即時応答') ||
    label.includes('聴解')
  )
    return { to: '/listening', dojo: 'Listening & Pitch Dojo' };
  return { to: '/bento', dojo: 'Daily Bento' };
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
  const {
    isCampaignMode,
    stage,
    saga,
    returnToCampaign,
    completeMission,
  } = useCampaignMission();
  const [level, setLevel] = useState<ExamLevel>('N5');
  const [mode, setMode] = useState<ExamMode>('full');
  const [activeSec, setActiveSec] = useState<ExamSection | 'all'>('all');
  const [edition, setEdition] = useState(1);
  const [showCertHistory, setShowCertHistory] = useState(false);
  const [confirmSubmitOpen, setConfirmSubmitOpen] = useState(false);

  const { questions, seenCount } = useMemo(
    () => generateFreshExam(level, mode),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [level, mode, edition],
  );

  const [answers, setAnswers] = useState<Record<number, number>>(() => {
    try {
      const saved = localStorage.getItem('jlpt_active_exam');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && typeof parsed.answers === 'object') return parsed.answers;
      }
    } catch {}
    return {};
  });
  const [flagged, setFlagged] = useState<Record<number, boolean>>(() => {
    try {
      const saved = localStorage.getItem('jlpt_active_exam');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && typeof parsed.flagged === 'object') return parsed.flagged;
      }
    } catch {}
    return {};
  });
  const [starOrders, setStarOrders] = useState<Record<number, number[]>>(() => {
    try {
      const saved = localStorage.getItem('jlpt_active_exam');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && typeof parsed.starOrders === 'object') return parsed.starOrders;
      }
    } catch {}
    return {};
  });
  const [submitted, setSubmitted] = useState(false);

  const [currentStage, setCurrentStage] = useState<ExamStage>('section_1');
  const [stageSecondsLeft, setStageSecondsLeft] = useState(() => getStageDurationSec('section_1', level, mode));
  const stageEndRef = useRef<number>(0);
  const [showOmrSheet, setShowOmrSheet] = useState(false);
  const [playedAudio, setPlayedAudio] = useState<Record<number, boolean>>({});
  const [activeQuestionIdx, setActiveQuestionIdx] = useState<number | undefined>(undefined);

  useEffect(() => {
    if (submitted) {
      localStorage.removeItem('jlpt_active_exam');
      return;
    }
    if (Object.keys(answers).length > 0 || Object.keys(flagged).length > 0) {
      try {
        localStorage.setItem(
          'jlpt_active_exam',
          JSON.stringify({ answers, flagged, starOrders, level, mode, currentStage }),
        );
      } catch {}
    }
  }, [answers, flagged, starOrders, level, mode, currentStage, submitted]);

  const advanceStage = () => {
    stopSpeaking();
    if (currentStage === 'section_1') {
      setCurrentStage('intermission_1');
      setStageSecondsLeft(getStageDurationSec('intermission_1', level, mode));
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else if (currentStage === 'intermission_1') {
      setCurrentStage('section_2');
      setStageSecondsLeft(getStageDurationSec('section_2', level, mode));
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else if (currentStage === 'section_2') {
      setCurrentStage('intermission_2');
      setStageSecondsLeft(getStageDurationSec('intermission_2', level, mode));
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else if (currentStage === 'intermission_2') {
      setCurrentStage('section_3');
      setStageSecondsLeft(getStageDurationSec('section_3', level, mode));
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else if (currentStage === 'section_3') {
      submit();
    }
  };

  const advanceStageRef = useRef(advanceStage);
  advanceStageRef.current = advanceStage;

  useEffect(() => {
    if (submitted) return;
    const durationSec = getStageDurationSec(currentStage, level, mode);
    stageEndRef.current = Date.now() + durationSec * 1000;
    setStageSecondsLeft(durationSec);

    const t = setInterval(() => {
      const remaining = Math.max(0, Math.ceil((stageEndRef.current - Date.now()) / 1000));
      setStageSecondsLeft(remaining);
      if (remaining <= 0) {
        clearInterval(t);
        advanceStageRef.current();
      }
    }, 250);

    return () => clearInterval(t);
  }, [submitted, currentStage, level, mode]);

  const currentExpectedSec = useMemo(() => {
    if (submitted) return null;
    if (currentStage === 'section_1') return 'vocab';
    if (currentStage === 'section_2') return 'grammar';
    if (currentStage === 'section_3') return 'listening';
    return 'locked_intermission';
  }, [submitted, currentStage]);

  const isQuestionLocked = useCallback(
    (qIdx: number) => {
      if (submitted) return false;
      const q = questions[qIdx];
      if (!q) return true;
      return q.section !== currentExpectedSec;
    },
    [submitted, questions, currentExpectedSec],
  );

  useEffect(() => () => stopSpeaking(), []);

  // Prevent accidental navigation during active exam
  useEffect(() => {
    if (submitted) return;
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (Object.keys(answers).length > 0) {
        e.preventDefault();
        e.returnValue = '';
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [submitted, answers]);

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
    if (submitted) return;
    stopSpeaking();
    setSubmitted(true);
    localStorage.removeItem('jlpt_active_exam');
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
    if (isCampaignMode && passedOverall) {
      completeMission();
    }
    if (sfxEnabled) (passedOverall ? playFanfare : playDing)();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const playListeningAudio = (idx: number, audioText: string, rate: number = 0.9) => {
    if (!submitted && playedAudio[idx]) return;
    setPlayedAudio((prev) => ({ ...prev, [idx]: true }));
    speak(audioText, rate);
  };

  const generateNewTake = (nextLevel: ExamLevel = level, nextMode: ExamMode = mode) => {
    stopSpeaking();
    localStorage.removeItem('jlpt_active_exam');
    setLevel(nextLevel);
    setMode(nextMode);
    setActiveSec('all');
    setCurrentStage('section_1');
    setStageSecondsLeft(getStageDurationSec('section_1', nextLevel, nextMode));
    setEdition((e) => e + 1);
    setAnswers({});
    setFlagged({});
    setStarOrders({});
    setPlayedAudio({});
    setSubmitted(false);
  };

  const toggleFlag = (idx: number) => {
    setFlagged((f) => ({ ...f, [idx]: !f[idx] }));
  };

  const mins = String(Math.floor(stageSecondsLeft / 60)).padStart(2, '0');
  const secs = String(stageSecondsLeft % 60).padStart(2, '0');
  const radarMetrics = useMemo(() => calculateRadarMetrics(questions, answers), [questions, answers]);

  return (
    <div className="page">
      {isCampaignMode && stage && (
        <CampaignBanner stage={stage} saga={saga} onReturn={returnToCampaign} />
      )}

      {confirmSubmitOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.65)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '1rem',
          }}
          onClick={() => setConfirmSubmitOpen(false)}
        >
          <div
            className="gp"
            style={{
              maxWidth: '480px',
              width: '100%',
              background: 'var(--surface, #1e293b)',
              border: '2px solid var(--accent, #6366f1)',
              borderRadius: '12px',
              padding: '1.4rem',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="nomargin" style={{ marginBottom: '0.5rem' }}>
              🎓 Submit &amp; Grade JLPT Exam?
            </h3>
            <p className="muted small" style={{ margin: '0.3rem 0 0.8rem' }}>
              Please review your completion status before finalizing your official JLPT test attempt:
            </p>
            <div
              style={{
                background: 'var(--surface2)',
                padding: '0.75rem 1rem',
                borderRadius: '8px',
                marginBottom: '1rem',
                fontSize: '0.9rem',
              }}
            >
              <div>✅ <b>Answered:</b> {answeredCount} / {total} questions ({total - answeredCount} unanswered)</div>
              {flaggedCount > 0 && <div style={{ marginTop: '0.3rem' }}>🚩 <b>Flagged for Review:</b> {flaggedCount} questions</div>}
              <div style={{ marginTop: '0.3rem' }}>⏱ <b>Current Section:</b> {SECTION_STAGE_META[currentStage]?.nameJp ?? currentStage}</div>
            </div>
            {total - answeredCount > 0 && (
              <p className="warn small" style={{ margin: '0 0 1rem' }}>
                ⚠️ You have {total - answeredCount} unanswered questions. Unanswered questions are scored as 0 points.
              </p>
            )}
            <div className="controls center" style={{ justifyContent: 'flex-end', gap: '0.6rem' }}>
              <button
                type="button"
                className="chip"
                onClick={() => setConfirmSubmitOpen(false)}
              >
                Resume Exam
              </button>
              <button
                type="button"
                className="chip on"
                style={{ background: 'var(--accent)', color: '#fff' }}
                onClick={() => {
                  setConfirmSubmitOpen(false);
                  submit();
                }}
              >
                Confirm &amp; Submit Now
              </button>
            </div>
          </div>
        </div>
      )}

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
          <span className={`chip ${stageSecondsLeft < 120 && !submitted ? 'bad' : 'on'}`} style={{ fontWeight: 700 }}>
            ⏱ {!submitted ? SECTION_STAGE_META[currentStage].nameJp.split('：')[0] : 'Exam Completed'}: {mins}:{secs}
          </span>
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

          {/* Score Trajectory Sparkline */}
          {examHistory.length >= 2 && (() => {
            const chron = [...examHistory].reverse().slice(-10);
            const w = 480;
            const h = 90;
            const padX = 35;
            const padY = 16;
            const passY = h - padY - (80 / 180) * (h - padY * 2);

            const points = chron.map((c, idx) => {
              const x = padX + (idx / (chron.length - 1)) * (w - padX * 2);
              const y = h - padY - (Math.min(180, c.totalPts) / 180) * (h - padY * 2);
              return { x, y, c };
            });

            const polylinePoints = points.map((p) => `${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' ');

            return (
              <div style={{ margin: '0.8rem 0 0.6rem', padding: '0.6rem 0.8rem', background: 'var(--surface2)', borderRadius: '10px' }}>
                <div className="row-between" style={{ marginBottom: '0.3rem' }}>
                  <span className="muted small">📈 Score Trajectory (Last {chron.length} Attempts)</span>
                  <span className="small muted">Passing threshold: 80 / 180</span>
                </div>
                <svg viewBox={`0 0 ${w} ${h}`} style={{ width: '100%', height: '80px', overflow: 'visible' }}>
                  {/* Pass line at 80/180 */}
                  <line
                    x1={padX}
                    y1={passY}
                    x2={w - padX}
                    y2={passY}
                    stroke="var(--ok)"
                    strokeWidth="1.5"
                    strokeDasharray="4 3"
                    opacity="0.6"
                  />
                  <text x={w - padX + 5} y={passY + 3} fill="var(--ok)" fontSize="9" opacity="0.8">
                    80
                  </text>

                  {/* Trend line */}
                  <polyline
                    points={polylinePoints}
                    fill="none"
                    stroke="var(--accent)"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />

                  {/* Data points */}
                  {points.map(({ x, y, c }, i) => (
                    <g key={i}>
                      <circle
                        cx={x}
                        cy={y}
                        r="4.5"
                        fill={c.passed ? 'var(--ok)' : 'var(--bad)'}
                        stroke="var(--surface)"
                        strokeWidth="1.5"
                      >
                        <title>{`${c.date}: ${c.totalPts}/180 (${c.passed ? 'Passed' : 'Failed'})`}</title>
                      </circle>
                      <text
                        x={x}
                        y={y - 8}
                        textAnchor="middle"
                        fill="currentColor"
                        fontSize="9.5"
                        fontWeight="600"
                      >
                        {c.totalPts}
                      </text>
                    </g>
                  ))}
                </svg>
              </div>
            );
          })()}

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
                    <div className="controls nomargin" style={{ marginTop: '0.3rem', gap: '0.35rem' }}>
                      <span className="muted small">Focus areas:</span>
                      {cert.weakMondai.map((wm) => {
                        const target = mondaiToDojoLink(wm);
                        return (
                          <Link
                            key={wm}
                            to={target.to}
                            className="chip"
                            style={{ padding: '0.14rem 0.5rem', fontSize: '0.72rem' }}
                            title={`Practice in ${target.dojo}`}
                          >
                            🎯 {wm} → {target.dojo}
                          </Link>
                        );
                      })}
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

      {/* Active Exam Section Stepper & Controls */}
      {!submitted ? (
        <div
          className="gp"
          style={{
            margin: '0.8rem 0 0.4rem',
            padding: '0.75rem 1rem',
            background: 'var(--surface2)',
            borderRadius: '12px',
          }}
        >
          <div className="row-between" style={{ flexWrap: 'wrap', gap: '0.5rem', marginBottom: '0.6rem' }}>
            <div>
              <span className="tag" style={{ textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                CURRENT STAGE: {SECTION_STAGE_META[currentStage].nameJp}
              </span>
              <div className="small muted" style={{ marginTop: '0.2rem' }}>
                {SECTION_STAGE_META[currentStage].nameEn} · Stage Time Remaining: <b>{mins}:{secs}</b>
              </div>
            </div>
            <div className="controls nomargin">
              {currentStage === 'section_1' && (
                <button className="chip on" onClick={advanceStage}>
                  Finish Section 1 &amp; Proceed to Break (3m) →
                </button>
              )}
              {currentStage === 'intermission_1' && (
                <button className="chip on" onClick={advanceStage}>
                  Skip Break &amp; Begin Section 2 (Grammar/Reading) →
                </button>
              )}
              {currentStage === 'section_2' && (
                <button className="chip on" onClick={advanceStage}>
                  Finish Section 2 &amp; Proceed to Audio Check (5m) →
                </button>
              )}
              {currentStage === 'intermission_2' && (
                <button className="chip on" onClick={advanceStage}>
                  Skip Break &amp; Begin Section 3 (Listening) →
                </button>
              )}
              {currentStage === 'section_3' && (
                <button className="chip on" onClick={submit}>
                  🎓 End &amp; Grade Exam ({answeredCount}/{total})
                </button>
              )}
              <button
                className="chip"
                onClick={submit}
                title="Early submission for all sections"
                style={{ fontSize: '0.75rem' }}
              >
                Instant Grade All
              </button>
            </div>
          </div>

          {/* Stepper pills */}
          <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
            {(
              [
                { id: 'section_1', label: '1. 文字・語彙 (Vocab)' },
                { id: 'intermission_1', label: '☕ 休憩 (Break 3m)' },
                { id: 'section_2', label: '2. 文法・読解 (Grammar/Reading)' },
                { id: 'intermission_2', label: '🎧 音響確認 (Break 5m)' },
                { id: 'section_3', label: '3. 聴解 (Listening)' },
              ] as const
            ).map((s) => {
              const isCurrent = currentStage === s.id;
              const isPast =
                (s.id === 'section_1' && currentStage !== 'section_1') ||
                (s.id === 'intermission_1' && (currentStage === 'section_2' || currentStage === 'intermission_2' || currentStage === 'section_3')) ||
                (s.id === 'section_2' && (currentStage === 'intermission_2' || currentStage === 'section_3')) ||
                (s.id === 'intermission_2' && currentStage === 'section_3');
              return (
                <span
                  key={s.id}
                  className={`chip ${isCurrent ? 'on' : isPast ? 'ok' : ''}`}
                  style={{
                    fontSize: '0.75rem',
                    padding: '0.2rem 0.55rem',
                    opacity: isCurrent || isPast ? 1 : 0.5,
                  }}
                >
                  {isPast ? '✓ ' : ''}
                  {s.label}
                </span>
              );
            })}
          </div>
        </div>
      ) : (
        /* Section Filter Bar when Exam is Submitted */
        <div className="controls">
          <button className={activeSec === 'all' ? 'chip on' : 'chip'} onClick={() => setActiveSec('all')}>
            All 3 Sections ({questions.length})
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
      )}

      {/* Intermission 1 Screen */}
      {!submitted && currentStage === 'intermission_1' && (
        <div className="bento-banner" style={{ margin: '1.2rem 0', flexDirection: 'column', alignItems: 'stretch' }}>
          <div className="row-between">
            <div>
              <span className="tag">☕ INTERMISSION 1 · 休憩・説明</span>
              <h2 className="nomargin" style={{ marginTop: '0.2rem' }}>
                第1部（言語知識・文字語彙）が終了しました
              </h2>
              <p className="muted" style={{ marginTop: '0.4rem', maxWidth: '640px' }}>
                Official JLPT exam rules require test booklets to be collected before the next section begins.
                Take a 3-minute mental break, hydrate, and prepare for Section 2 (Grammar &amp; Reading Comprehension).
              </p>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '2.4rem', fontWeight: 800, color: 'var(--accent)' }}>
                {mins}:{secs}
              </div>
              <span className="muted small">Break Countdown</span>
            </div>
          </div>
          <div className="controls" style={{ marginTop: '1rem' }}>
            <button className="chip on" style={{ padding: '0.45rem 1.2rem', fontSize: '0.95rem' }} onClick={advanceStage}>
              ▶ Start Section 2 (Grammar &amp; Reading) Now →
            </button>
          </div>
        </div>
      )}

      {/* Intermission 2 Screen */}
      {!submitted && currentStage === 'intermission_2' && (
        <div className="bento-banner" style={{ margin: '1.2rem 0', flexDirection: 'column', alignItems: 'stretch' }}>
          <div className="row-between">
            <div>
              <span className="tag">🎧 INTERMISSION 2 · 休憩・音響確認 (AUDIO CHECK)</span>
              <h2 className="nomargin" style={{ marginTop: '0.2rem' }}>
                第2部が終了しました。次は第3部（聴解）です
              </h2>
              <p className="muted" style={{ marginTop: '0.4rem', maxWidth: '640px' }}>
                ⚠️ <b>Single-Play Audio Warning:</b> In the official JLPT Listening section, audio plays exactly <b>ONCE</b>.
                You cannot pause or replay the recording during the test. Please test your sound volume now!
              </p>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '2.4rem', fontWeight: 800, color: 'var(--accent)' }}>
                {mins}:{secs}
              </div>
              <span className="muted small">Audio Check Countdown</span>
            </div>
          </div>
          <div className="controls" style={{ marginTop: '1rem' }}>
            <button
              className="chip on"
              style={{ padding: '0.45rem 1rem' }}
              onClick={() => speak('これから、日本語能力試験の聴解試験を始めます。音声がよく聞こえますか。', 0.9)}
            >
              🔊 Test Sound Volume (「聴解試験を始めます」)
            </button>
            <button className="chip" onClick={() => stopSpeaking()}>
              ⏹ Stop Audio
            </button>
            <button className="chip on" style={{ padding: '0.45rem 1.2rem', fontSize: '0.95rem' }} onClick={advanceStage}>
              ▶ Start Section 3 (Listening Comprehension) Now →
            </button>
          </div>
        </div>
      )}

      {/* Section 3 Listening Guidance Banner */}
      {!submitted && currentStage === 'section_3' && (
        <div
          className="gp"
          style={{
            margin: '0.6rem 0',
            padding: '0.75rem 1rem',
            borderLeft: '4px solid #f59e0b',
            background: 'var(--surface2)',
          }}
        >
          <div className="row-between">
            <span className="small">
              ⚠️ <b>JLPT Single-Play Rule:</b> Audio prompts play exactly <b>once</b> per question. After playing, the replay button will lock until you submit the exam.
            </span>
            <span className="chip" style={{ fontSize: '0.72rem' }}>
              Played: {Object.keys(playedAudio).length} / {questions.filter((q) => q.section === 'listening').length}
            </span>
          </div>
        </div>
      )}

      {/* Mark Sheet (マークシート) Question Navigator & OMR Toggle */}
      <div className="gp" style={{ padding: '0.85rem 1rem' }}>
        <div className="row-between" style={{ marginBottom: '0.5rem', flexWrap: 'wrap', gap: '0.4rem' }}>
          <span className="small muted">
            <b>マークシート Answer Sheet</b>: {answeredCount}/{total} answered
            {flaggedCount > 0 ? ` · 🚩 ${flaggedCount} flagged` : ''} · Official Pass ≥ {passTotalThreshold}/180 pts
          </span>
          <div className="controls nomargin">
            <button
              className={showOmrSheet ? 'chip on' : 'chip'}
              style={{ padding: '0.25rem 0.75rem', fontSize: '0.8rem' }}
              onClick={() => setShowOmrSheet((s) => !s)}
            >
              {showOmrSheet ? '✕ Hide OMR Sheet' : '📝 2B OMR Bubble Sheet (マークシート)'}
            </button>
            {!submitted && (
              <button className="chip on" style={{ padding: '0.28rem 0.85rem', fontSize: '0.82rem' }} onClick={() => setConfirmSubmitOpen(true)}>
                🎓 Submit &amp; Grade Exam ({answeredCount}/{total})
              </button>
            )}
          </div>
        </div>

        {/* 2B Pencil OMR Bubble Sheet */}
        {showOmrSheet && (
          <div style={{ margin: '0.6rem 0 0.9rem' }}>
            <OmrBubbleSheet
              totalQuestions={total}
              answers={answers}
              flagged={flagged}
              submitted={submitted}
              correctAnswers={
                submitted
                  ? questions.reduce<Record<number, number>>((acc, q, idx) => {
                      acc[idx] = q.answer;
                      return acc;
                    }, {})
                  : undefined
              }
              activeQuestionIdx={activeQuestionIdx}
              isQuestionLocked={isQuestionLocked}
              onSelectAnswer={(qIdx, optIdx) => {
                if (isQuestionLocked(qIdx)) return;
                setAnswers((prev) => ({ ...prev, [qIdx]: optIdx }));
                setActiveQuestionIdx(qIdx);
              }}
              onSelectQuestion={(qIdx) => {
                if (isQuestionLocked(qIdx)) return;
                setActiveQuestionIdx(qIdx);
                if (submitted) {
                  setActiveSec('all');
                }
                setTimeout(() => {
                  document.getElementById(`exam-q-${qIdx}`)?.scrollIntoView({ behavior: 'smooth', block: 'center' });
                }, 40);
              }}
              onToggleFlag={toggleFlag}
            />
          </div>
        )}

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.3rem' }}>
          {questions.map((q: GeneratedExamQuestion, i: number) => {
            const isAnswered = answers[i] !== undefined;
            const isFlagged = !!flagged[i];
            const isCorrect = answers[i] === q.answer;
            const locked = isQuestionLocked(i);
            const pillCls = !submitted
              ? locked
                ? 'chip'
                : isAnswered
                  ? 'chip on'
                  : 'chip'
              : isCorrect
                ? 'chip ok'
                : 'chip bad';
            return (
              <button
                key={q.id + '-' + i}
                className={pillCls}
                disabled={locked}
                style={{
                  padding: '0.2rem 0.5rem',
                  fontSize: '0.75rem',
                  minWidth: '2.1rem',
                  borderColor: isFlagged && !submitted ? 'var(--bad)' : undefined,
                  opacity: locked ? 0.35 : 1,
                  cursor: locked ? 'not-allowed' : 'pointer',
                }}
                onClick={() => {
                  if (locked) return;
                  setActiveQuestionIdx(i);
                  if (submitted) {
                    setActiveSec('all');
                  }
                  setTimeout(() => {
                    document.getElementById(`exam-q-${i}`)?.scrollIntoView({ behavior: 'smooth', block: 'center' });
                  }, 30);
                }}
                title={locked ? `Question ${i + 1} (Locked to current active section)` : undefined}
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

          {/* Diagnostic 6-Axis Hexagonal Radar Chart */}
          <div style={{ margin: '0.8rem 0' }}>
            <HexagonRadarChart metrics={radarMetrics} passBenchmarkPct={60} />
          </div>

          {missedQuestions.length > 0 && (() => {
            const liveWeakMondai = Array.from(
              new Set(missedQuestions.map((q) => q.mondaiTitle.split('（')[0])),
            ).slice(0, 4);
            return (
              <div className="controls nomargin" style={{ gap: '0.4rem', flexWrap: 'wrap' }}>
                <span className="muted small">
                  <b>🎯 Recommended Focus Dojos:</b>
                </span>
                {liveWeakMondai.map((wm) => {
                  const target = mondaiToDojoLink(wm);
                  return (
                    <Link
                      key={wm}
                      to={target.to}
                      className="chip"
                      style={{ padding: '0.22rem 0.65rem', fontSize: '0.78rem' }}
                    >
                      {wm} → {target.dojo}
                    </Link>
                  );
                })}
              </div>
            );
          })()}

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
        if (!submitted) {
          if (currentStage === 'intermission_1' || currentStage === 'intermission_2') return null;
          const stageKey = SECTION_STAGE_META[currentStage].sectionKey;
          if (stageKey && q.section !== stageKey) return null;
        } else {
          if (activeSec !== 'all' && q.section !== activeSec) return null;
        }

        const prevSec = i > 0 ? questions[i - 1].section : null;
        const prevMondai = i > 0 ? questions[i - 1].mondaiId : null;
        const showSecHeader = (submitted ? activeSec === 'all' : true) && q.section !== prevSec;
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
                      {!submitted ? (
                        playedAudio[i] ? (
                          <button className="chip" disabled style={{ opacity: 0.6, cursor: 'not-allowed' }}>
                            ✓ 音声再生済 (1 Play Used)
                          </button>
                        ) : (
                          <button
                            className="chip on"
                            onClick={() => playListeningAudio(i, q.audio!)}
                            title="Play audio (strictly 1 time per question during exam)"
                          >
                            🔊 Play Audio (1 Time Only)
                          </button>
                        )
                      ) : (
                        <>
                          <button className="chip on" onClick={() => speak(q.audio!, 0.9)}>
                            🔊 Replay Audio
                          </button>
                          <button className="chip" onClick={() => speak(q.audio!, 0.72)}>
                            🐢 Slow
                          </button>
                        </>
                      )}
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
                  } else {
                    setAnswers((a) => {
                      const next = { ...a };
                      delete next[i];
                      return next;
                    });
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
                          onClick={() => {
                            setStarOrders((prev) => ({ ...prev, [i]: [] }));
                            setAnswers((a) => {
                              const next = { ...a };
                              delete next[i];
                              return next;
                            });
                          }}
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
                      onClick={() =>
                        setAnswers((a) => {
                          if (a[i] === j) {
                            const next = { ...a };
                            delete next[i];
                            return next;
                          }
                          return { ...a, [i]: j };
                        })
                      }
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

              <div
                className="row-between"
                style={{
                  marginTop: '0.75rem',
                  paddingTop: '0.45rem',
                  borderTop: '1px solid var(--border, #334155)',
                  alignItems: 'center',
                }}
              >
                <button
                  type="button"
                  className="chip"
                  style={{ fontSize: '0.76rem', padding: '0.2rem 0.6rem' }}
                  disabled={i === 0}
                  onClick={() => {
                    const prevEl = document.getElementById(`exam-q-${i - 1}`);
                    prevEl?.scrollIntoView({ behavior: 'smooth', block: 'center' });
                  }}
                >
                  ← Prev Question
                </button>
                <span className="small muted">問{i + 1} of {total}</span>
                <button
                  type="button"
                  className="chip"
                  style={{ fontSize: '0.76rem', padding: '0.2rem 0.6rem' }}
                  disabled={i === total - 1}
                  onClick={() => {
                    const nextEl = document.getElementById(`exam-q-${i + 1}`);
                    nextEl?.scrollIntoView({ behavior: 'smooth', block: 'center' });
                  }}
                >
                  Next Question →
                </button>
              </div>
            </div>
          </div>
        );
      })}

      {!submitted && (
        <div className="result">
          <span className="muted">
            {answeredCount}/{total} answered {flaggedCount > 0 ? `(${flaggedCount} flagged)` : ''}
          </span>
          <button className="chip on" onClick={() => setConfirmSubmitOpen(true)}>
            🎓 Submit JLPT {level} Exam ({answeredCount}/{total})
          </button>
        </div>
      )}
    </div>
  );
}
