import { useEffect, useState } from 'react';
import {
  CONJUGATION_LESSONS,
  resolveConjLessonId,
  type ConjugationLesson,
} from '../data/conjugationLessons';
import { useStore } from '../lib/store';
import { speak } from '../lib/tts';
import { playDing, playFanfare } from '../lib/sfx';

export default function ConjugationLessonViewer({
  onSwitchToDrill,
  initialLessonId,
  onComplete,
}: {
  onSwitchToDrill: () => void;
  initialLessonId?: string;
  onComplete?: () => void;
}) {
  const { conjLessonsDone, completeConjLesson, sfxEnabled } = useStore();
  const [activeLessonId, setActiveLessonId] = useState<string>(() => resolveConjLessonId(initialLessonId));

  useEffect(() => {
    if (initialLessonId) {
      setActiveLessonId(resolveConjLessonId(initialLessonId));
    }
  }, [initialLessonId]);

  const [morphStepIdx, setMorphStepIdx] = useState<number>(0);
  const [quizAnswers, setQuizAnswers] = useState<Record<number, number>>({});
  const [quizSubmitted, setQuizSubmitted] = useState<boolean>(false);

  const lesson: ConjugationLesson =
    CONJUGATION_LESSONS.find((l) => l.id === activeLessonId) || CONJUGATION_LESSONS[0];

  const morph = lesson.interactiveMorph;
  const curStep = morph.steps[morphStepIdx] || morph.steps[0];
  const isDone = !!conjLessonsDone[lesson.id];

  const handleSelectLesson = (id: string) => {
    setActiveLessonId(id);
    setMorphStepIdx(0);
    setQuizAnswers({});
    setQuizSubmitted(false);
  };

  const handleSelectQuiz = (qIdx: number, optIdx: number) => {
    if (quizSubmitted) return;
    setQuizAnswers((prev) => ({ ...prev, [qIdx]: optIdx }));
  };

  const handleSubmitQuiz = () => {
    setQuizSubmitted(true);
    const score = lesson.quiz.filter((q, i) => quizAnswers[i] === q.answer).length;
    const allCorrect = score === lesson.quiz.length;
    if (allCorrect) {
      completeConjLesson(lesson.id);
      if (onComplete) onComplete();
      if (sfxEnabled) playFanfare();
    } else {
      if (sfxEnabled) playDing();
    }
  };

  return (
    <div style={{ marginTop: '1rem' }}>
      {/* Lesson Navigation Ribbon */}
      <div className="controls" style={{ gap: '0.5rem', flexWrap: 'wrap' }}>
        {CONJUGATION_LESSONS.map((l, idx) => {
          const cleared = !!conjLessonsDone[l.id];
          const active = l.id === activeLessonId;
          return (
            <button
              key={l.id}
              className={active ? 'chip on' : 'chip'}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.4rem',
                padding: '0.45rem 0.85rem',
              }}
              onClick={() => handleSelectLesson(l.id)}
            >
              <span>{cleared ? '✓' : `Lesson ${idx + 1}:`}</span>
              <b>{l.title.split(' (')[0]}</b>
              {cleared && <span className="tag" style={{ background: 'var(--ok)', color: '#000', padding: '0.1rem 0.35rem', fontSize: '0.65rem' }}>MASTERED</span>}
            </button>
          );
        })}
      </div>

      {/* Lesson Header Banner */}
      <div className="gp" style={{ margin: '1rem 0 1.2rem', padding: '1.2rem 1.4rem', borderLeft: '4px solid var(--accent)' }}>
        <div className="row-between">
          <div>
            <span className="tag">{lesson.level} FUNDAMENTALS · {lesson.titleJp}</span>
            <h2 className="nomargin" style={{ marginTop: '0.2rem', fontSize: '1.45rem' }}>
              {lesson.title}
            </h2>
          </div>
          {isDone && (
            <span className="tag ok-text" style={{ fontSize: '0.85rem', padding: '0.35rem 0.75rem', fontWeight: 600 }}>
              ✓ Lesson Cleared
            </span>
          )}
        </div>
        <p style={{ margin: '0.55rem 0 0.8rem', fontSize: '1rem', lineHeight: 1.6 }}>
          {lesson.description}
        </p>
        <div style={{ background: 'var(--surface2)', padding: '0.65rem 0.95rem', borderRadius: '8px', border: '1px solid var(--accent)' }}>
          <b style={{ color: 'var(--accent)' }}>💡 Golden Rule:</b>{' '}
          <span style={{ fontSize: '0.95rem' }}>{lesson.keyRule}</span>
        </div>
      </div>

      {/* Interactive Morphing Visualizer */}
      <div
        className="gp"
        style={{
          padding: '1.2rem 1.4rem',
          background: 'var(--surface2)',
          borderRadius: '14px',
          marginBottom: '1.5rem',
        }}
      >
        <div className="row-between">
          <div>
            <span className="tag" style={{ background: 'var(--accent)', color: '#000', fontWeight: 700 }}>
              ✨ INTERACTIVE STEM MORPH VISUALIZER
            </span>
            <h3 className="nomargin" style={{ marginTop: '0.3rem', fontSize: '1.2rem' }}>
              Watch <span className="jp" style={{ color: 'var(--accent)' }}>{morph.wordDict}</span> ({morph.wordReading}) Transform
            </h3>
          </div>
          <button
            className="chip"
            onClick={() => speak(curStep.fullKana)}
            title="Listen to pronunciation"
          >
            🔊 Hear {curStep.fullKana}
          </button>
        </div>

        {/* Large Visual Morph Display */}
        <div
          style={{
            margin: '1.2rem 0 0.9rem',
            padding: '1.2rem',
            background: 'var(--surface)',
            borderRadius: '12px',
            textAlign: 'center',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '0.4rem',
          }}
        >
          <div style={{ display: 'inline-flex', alignItems: 'baseline', fontSize: '3.4rem', fontWeight: 700 }}>
            {/* Frozen Stem */}
            <span className="jp" style={{ color: 'var(--text)', borderBottom: '3px solid var(--muted)' }} title="Frozen Root Stem">
              {curStep.stem}
            </span>
            {/* Morphing Suffix */}
            <span
              className="jp"
              style={{
                color: 'var(--accent)',
                marginLeft: '0.1rem',
                borderBottom: '3px solid var(--accent)',
                animation: 'pulse 0.3s ease',
              }}
              title="Conjugated Ending"
            >
              {curStep.suffix}
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginTop: '0.2rem' }}>
            <span className="tag" style={{ fontSize: '0.85rem' }}>{curStep.label}</span>
            <span className="jp muted" style={{ fontSize: '1.1rem' }}>{curStep.fullKana}</span>
            <span className="muted small">({curStep.romaji})</span>
          </div>

          <p className="nomargin" style={{ marginTop: '0.5rem', maxWidth: '580px', color: 'var(--text)', fontSize: '0.95rem' }}>
            👉 {curStep.explanation}
          </p>
        </div>

        {/* Morph Step Selector Chips */}
        <div className="controls center" style={{ marginTop: '0.8rem', gap: '0.4rem' }}>
          {morph.steps.map((st, sIdx) => (
            <button
              key={st.label}
              className={morphStepIdx === sIdx ? 'chip on' : 'chip'}
              style={{ padding: '0.4rem 0.85rem' }}
              onClick={() => {
                setMorphStepIdx(sIdx);
                speak(st.fullKana);
              }}
            >
              {st.label}
            </button>
          ))}
        </div>
      </div>

      {/* Lesson Sections & Examples */}
      <div style={{ display: 'grid', gap: '1.2rem', marginBottom: '1.8rem' }}>
        {lesson.sections.map((sec, sIdx) => (
          <div key={sIdx} className="gp" style={{ padding: '1.1rem 1.3rem' }}>
            <h3 style={{ margin: '0 0 0.5rem', fontSize: '1.15rem' }}>{sec.heading}</h3>
            <p style={{ margin: '0 0 0.8rem', lineHeight: 1.6, whiteSpace: 'pre-line' }}>{sec.body}</p>

            {sec.tip && (
              <div
                style={{
                  background: 'var(--surface2)',
                  padding: '0.65rem 0.9rem',
                  borderRadius: '8px',
                  marginBottom: '0.8rem',
                  borderLeft: '3px solid var(--accent)',
                  fontSize: '0.92rem',
                }}
              >
                {sec.tip}
              </div>
            )}

            {sec.examples && (
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))',
                  gap: '0.6rem',
                }}
              >
                {sec.examples.map((ex, exIdx) => (
                  <div
                    key={exIdx}
                    style={{
                      background: 'var(--surface2)',
                      padding: '0.65rem 0.85rem',
                      borderRadius: '8px',
                      cursor: 'pointer',
                    }}
                    onClick={() => speak(ex.kana)}
                    title="Click to hear audio"
                  >
                    <div className="row-between">
                      <b className="jp" style={{ fontSize: '1.05rem' }}>
                        🔊 {ex.kanji} <span className="muted small jp">({ex.kana})</span>
                      </b>
                      <span className="muted small">{ex.en}</span>
                    </div>
                    <div className="muted small" style={{ marginTop: '0.25rem', fontSize: '0.78rem' }}>
                      {ex.breakdown}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Checkpoint Mastery Quiz */}
      <div
        className="gp"
        style={{
          padding: '1.3rem 1.4rem',
          background: 'var(--surface2)',
          borderRadius: '14px',
          border: '1px solid var(--border)',
        }}
      >
        <div className="row-between">
          <div>
            <span className="tag">🎯 LESSON CHECKPOINT QUIZ</span>
            <h3 className="nomargin" style={{ marginTop: '0.2rem', fontSize: '1.25rem' }}>
              Verify Your Understanding ({lesson.quiz.length} Questions)
            </h3>
          </div>
          {quizSubmitted && (
            <span
              className={
                lesson.quiz.filter((q, i) => quizAnswers[i] === q.answer).length === lesson.quiz.length
                  ? 'tag ok-text'
                  : 'tag bad-text'
              }
              style={{ fontSize: '0.9rem', fontWeight: 700 }}
            >
              Score: {lesson.quiz.filter((q, i) => quizAnswers[i] === q.answer).length} / {lesson.quiz.length}
            </span>
          )}
        </div>

        <div style={{ display: 'grid', gap: '1rem', marginTop: '1rem' }}>
          {lesson.quiz.map((q, qIdx) => {
            const userPick = quizAnswers[qIdx];
            const isCorrect = userPick === q.answer;
            return (
              <div
                key={qIdx}
                style={{
                  background: 'var(--surface)',
                  padding: '0.9rem 1.1rem',
                  borderRadius: '10px',
                }}
              >
                <div style={{ fontWeight: 600, marginBottom: '0.55rem', fontSize: '1rem' }}>
                  {qIdx + 1}. {q.q}
                </div>
                <div className="controls" style={{ gap: '0.5rem', marginBottom: 0 }}>
                  {q.options.map((opt, optIdx) => {
                    const picked = userPick === optIdx;
                    let cls = 'chip';
                    if (picked) cls = 'chip on';
                    if (quizSubmitted) {
                      if (optIdx === q.answer) cls = 'chip ok';
                      else if (picked && !isCorrect) cls = 'chip bad';
                    }
                    return (
                      <button
                        key={optIdx}
                        className={cls}
                        style={{ padding: '0.45rem 0.95rem' }}
                        onClick={() => handleSelectQuiz(qIdx, optIdx)}
                      >
                        {opt}
                      </button>
                    );
                  })}
                </div>
                {quizSubmitted && (
                  <p
                    className={isCorrect ? 'ok-text small nomargin' : 'bad-text small nomargin'}
                    style={{ marginTop: '0.5rem' }}
                  >
                    {isCorrect ? '✓ Correct! ' : '✗ Watch out! '}
                    {q.explanation}
                  </p>
                )}
              </div>
            );
          })}
        </div>

        <div className="controls" style={{ marginTop: '1.2rem', justifyContent: 'space-between', alignItems: 'center' }}>
          {!quizSubmitted ? (
            <button
              className="chip on"
              style={{ padding: '0.6rem 1.5rem', fontWeight: 600 }}
              disabled={Object.keys(quizAnswers).length < lesson.quiz.length}
              onClick={handleSubmitQuiz}
            >
              🎓 Check Answers &amp; Complete Lesson ({Object.keys(quizAnswers).length}/{lesson.quiz.length})
            </button>
          ) : (
            <div style={{ display: 'flex', gap: '0.6rem', flexWrap: 'wrap', alignItems: 'center' }}>
              <button
                className="chip"
                onClick={() => {
                  setQuizAnswers({});
                  setQuizSubmitted(false);
                }}
              >
                ↺ Retry Quiz
              </button>
              <button
                className="chip on"
                style={{ padding: '0.55rem 1.2rem', fontWeight: 600 }}
                onClick={onSwitchToDrill}
              >
                ⚡ Practice in Live Inflection Drill →
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
