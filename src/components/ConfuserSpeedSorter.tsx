import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { CONFUSER_GROUPS, type ConfuserGroup, type ConfuserChallenge } from '../data/confusers';
import { speak } from '../lib/tts';
import { playDing, playMiss } from '../lib/sfx';
import { useStore } from '../lib/store';

export interface ConfuserSpeedSorterProps {
  kind: 'kana' | 'kanji';
  onComplete?: (stats: { correct: number; total: number; streak: number }) => void;
}

export default function ConfuserSpeedSorter({ kind }: ConfuserSpeedSorterProps) {
  const { sfxEnabled } = useStore();
  const groups = useMemo(() => CONFUSER_GROUPS.filter((g) => g.kind === kind), [kind]);
  const [selectedGroupId, setSelectedGroupId] = useState<string>('all');
  const [activeGroup, setActiveGroup] = useState<ConfuserGroup>(() => groups[0] ?? CONFUSER_GROUPS[0]);
  const [activeChallenge, setActiveChallenge] = useState<ConfuserChallenge>(() => groups[0]?.challenges[0] ?? CONFUSER_GROUPS[0].challenges[0]);

  // Game session states
  const [streak, setStreak] = useState(0);
  const [bestStreak, setBestStreak] = useState(0);
  const [session, setSession] = useState({ ok: 0, total: 0 });
  const [flash, setFlash] = useState<'ok' | 'bad' | null>(null);
  const [lastReview, setLastReview] = useState<{
    wasCorrect: boolean;
    chosen: string;
    target: string;
    rule: string;
    callout: string;
  } | null>(null);
  const [reviewPaused, setReviewPaused] = useState(false);
  const [reactionTime, setReactionTime] = useState<number | null>(null);
  const startTimeRef = useRef<number>(0);

  const pickNextChallenge = useCallback(() => {
    const pool = selectedGroupId === 'all' ? groups : groups.filter((g) => g.id === selectedGroupId);
    if (!pool.length) return;
    const g = pool[Math.floor(Math.random() * pool.length)];
    const c = g.challenges[Math.floor(Math.random() * g.challenges.length)];
    setActiveGroup(g);
    setActiveChallenge(c);
    startTimeRef.current = Date.now();
    setReactionTime(null);
  }, [groups, selectedGroupId]);

  const handleSelectGroup = (gId: string) => {
    setSelectedGroupId(gId);
    const pool = gId === 'all' ? groups : groups.filter((g) => g.id === gId);
    if (!pool.length) return;
    const g = pool[Math.floor(Math.random() * pool.length)];
    const c = g.challenges[Math.floor(Math.random() * g.challenges.length)];
    setActiveGroup(g);
    setActiveChallenge(c);
    startTimeRef.current = Date.now();
    setReactionTime(null);
    setReviewPaused(false);
    setLastReview(null);
    setFlash(null);
  };

  const resumeAfterReview = useCallback(() => {
    setReviewPaused(false);
    setLastReview(null);
    setFlash(null);
    pickNextChallenge();
  }, [pickNextChallenge]);

  const handleSelect = useCallback((chosenGlyph: string) => {
    if (reviewPaused) return;
    const now = Date.now();
    const elapsed = startTimeRef.current > 0 ? now - startTimeRef.current : 600;
    setReactionTime(elapsed);
    const isCorrect = chosenGlyph === activeChallenge.targetGlyph;
    const nextTotal = session.total + 1;
    const nextOk = session.ok + (isCorrect ? 1 : 0);
    const nextStreak = isCorrect ? streak + 1 : 0;

    setSession({ ok: nextOk, total: nextTotal });
    setStreak(nextStreak);
    if (nextStreak > bestStreak) setBestStreak(nextStreak);
    setFlash(isCorrect ? 'ok' : 'bad');

    if (sfxEnabled) (isCorrect ? playDing : playMiss)();
    speak(activeChallenge.audioReading);

    if (isCorrect) {
      setLastReview(null);
      setTimeout(() => {
        setFlash(null);
        pickNextChallenge();
      }, 350);
    } else {
      // Pause for review on mistake to reinforce distinguishing feature
      setLastReview({
        wasCorrect: false,
        chosen: chosenGlyph,
        target: activeChallenge.targetGlyph,
        rule: activeGroup.distinctionRule,
        callout: activeGroup.strokeDirectionCallout,
      });
      setReviewPaused(true);
    }
  }, [
    reviewPaused,
    activeChallenge.targetGlyph,
    activeChallenge.audioReading,
    session.total,
    session.ok,
    streak,
    bestStreak,
    sfxEnabled,
    activeGroup.distinctionRule,
    activeGroup.strokeDirectionCallout,
    pickNextChallenge,
  ]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (reviewPaused) {
        if (e.key === ' ' || e.key === 'Enter') {
          e.preventDefault();
          resumeAfterReview();
        }
        return;
      }
      const choices = activeGroup.choices;
      if (choices.length === 2) {
        if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A' || e.key === '1') {
          handleSelect(choices[0].glyph);
        } else if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D' || e.key === '2') {
          handleSelect(choices[1].glyph);
        }
      } else if (choices.length === 3) {
        if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A' || e.key === '1') {
          handleSelect(choices[0].glyph);
        } else if (e.key === 'ArrowDown' || e.key === 's' || e.key === 'S' || e.key === '2') {
          handleSelect(choices[1].glyph);
        } else if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D' || e.key === '3') {
          handleSelect(choices[2].glyph);
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeGroup, reviewPaused, handleSelect, resumeAfterReview]);

  const speedRating = reactionTime
    ? reactionTime < 750
      ? '⚡ Lightning'
      : reactionTime < 1400
        ? '🔥 Fast'
        : '👍 Good'
    : null;

  return (
    <div className="confuser-speed-sorter" style={{ maxWidth: '780px', margin: '0 auto' }}>
      {/* Group selector */}
      <div className="controls" style={{ flexWrap: 'wrap', gap: '0.4rem', marginBottom: '1.2rem' }}>
        <span className="muted small" style={{ alignSelf: 'center' }}>Focus Pair:</span>
        <button
          type="button"
          className={selectedGroupId === 'all' ? 'chip on' : 'chip'}
          onClick={() => handleSelectGroup('all')}
        >
          🎲 All Pairs ({groups.length})
        </button>
        {groups.map((g) => (
          <button
            key={g.id}
            type="button"
            className={selectedGroupId === g.id ? 'chip on' : 'chip'}
            onClick={() => handleSelectGroup(g.id)}
          >
            {g.title.split(' ')[0]}
          </button>
        ))}
      </div>

      {/* Main Sorting Arena */}
      <div
        className={`drill ${flash ?? ''}`}
        style={{
          background: 'var(--surface)',
          padding: '2rem',
          borderRadius: '16px',
          border: '1px solid var(--border)',
          textAlign: 'center',
          position: 'relative',
        }}
      >
        {/* Top metrics bar */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
            <span className="tag" style={{ background: 'var(--surface2)', color: 'var(--text)', fontWeight: 600 }}>
              {activeGroup.title}
            </span>
            {speedRating && (
              <span className="tag" style={{ background: '#3b82f620', color: '#60a5fa', fontWeight: 600 }}>
                {speedRating} ({reactionTime}ms)
              </span>
            )}
          </div>
          <div style={{ display: 'flex', gap: '1rem', fontSize: '0.9rem' }}>
            <span>Streak: <b style={{ color: 'var(--accent)' }}>{streak}</b> (Best: {bestStreak})</span>
            <span>Score: <b>{session.ok}/{session.total}</b> ({session.total ? Math.round((session.ok / session.total) * 100) : 0}%)</span>
          </div>
        </div>

        {/* Prompt Card */}
        <div style={{ margin: '1.5rem 0' }}>
          <span className="muted small" style={{ textTransform: 'uppercase', letterSpacing: '0.06em' }}>
            Target Discrimination Cue:
          </span>
          <div style={{ fontSize: '2.5rem', fontWeight: 700, margin: '0.3rem 0', color: 'var(--accent)' }}>
            {activeChallenge.prompt}
          </div>
          {activeChallenge.subPrompt && (
            <div className="muted small">{activeChallenge.subPrompt}</div>
          )}
        </div>

        {/* Sorting Bins */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: `repeat(${activeGroup.choices.length}, 1fr)`,
            gap: '1rem',
            margin: '2rem 0',
          }}
        >
          {activeGroup.choices.map((choice, idx) => {
            const keyLabel =
              activeGroup.choices.length === 2
                ? idx === 0 ? '← or A' : '→ or D'
                : idx === 0 ? '← or A' : idx === 1 ? '↓ or S' : '→ or D';
            return (
              <button
                key={choice.glyph}
                type="button"
                className="sorter-bin-btn"
                style={{
                  background: 'var(--surface2)',
                  border: '2px solid var(--border)',
                  borderRadius: '12px',
                  padding: '1.5rem 1rem',
                  cursor: 'pointer',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '0.5rem',
                  transition: 'all 0.12s ease',
                }}
                onClick={() => handleSelect(choice.glyph)}
              >
                <span className="jp" style={{ fontSize: '4.2rem', lineHeight: 1.1, fontWeight: 700 }}>
                  {choice.glyph}
                </span>
                <span style={{ fontSize: '1rem', fontWeight: 600 }}>{choice.reading}</span>
                <span className="muted small">{choice.meaning}</span>
                <span
                  style={{
                    fontSize: '0.75rem',
                    background: 'var(--bg)',
                    padding: '0.2rem 0.6rem',
                    borderRadius: '999px',
                    color: 'var(--accent)',
                    border: '1px solid var(--border)',
                    marginTop: '0.3rem',
                  }}
                >
                  {choice.strokeCalloutTag}
                </span>
                <span className="muted" style={{ fontSize: '0.72rem', marginTop: '0.2rem' }}>
                  [{keyLabel}]
                </span>
              </button>
            );
          })}
        </div>

        {/* Review Modal / Drawer on error */}
        {reviewPaused && lastReview && (
          <div
            style={{
              background: 'rgba(226, 104, 122, 0.1)',
              border: '2px solid var(--bad)',
              borderRadius: '12px',
              padding: '1.2rem',
              marginTop: '1.5rem',
              textAlign: 'left',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.6rem' }}>
              <b style={{ color: 'var(--bad)', fontSize: '1.1rem' }}>
                ✗ Confuser Miss: Target was {lastReview.target}
              </b>
              <button
                type="button"
                className="chip on"
                style={{ background: 'var(--accent)', color: '#000', fontWeight: 700 }}
                onClick={resumeAfterReview}
              >
                Next (Press Space) →
              </button>
            </div>
            <p style={{ margin: '0.4rem 0', fontSize: '0.95rem' }}>
              💡 <b>Distinguishing Rule:</b> {lastReview.rule}
            </p>
            <div
              style={{
                background: 'var(--surface)',
                padding: '0.6rem 0.9rem',
                borderRadius: '8px',
                borderLeft: '4px solid var(--accent)',
                marginTop: '0.5rem',
                fontSize: '0.88rem',
                fontWeight: 600,
              }}
            >
              📍 Stroke Direction Callout: {lastReview.callout}
            </div>
          </div>
        )}

        {/* Persistent Callout Card */}
        <div
          style={{
            marginTop: '1.2rem',
            padding: '0.8rem 1rem',
            background: 'var(--surface2)',
            borderRadius: '10px',
            fontSize: '0.85rem',
            textAlign: 'left',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '1rem',
          }}
        >
          <div>
            <span style={{ color: 'var(--accent)', fontWeight: 700 }}>🔍 Distinguishing Feature:</span>{' '}
            <span className="muted">{activeGroup.distinctionRule}</span>
          </div>
          <button
            type="button"
            className="chip"
            style={{ flexShrink: 0, padding: '0.2rem 0.6rem', fontSize: '0.78rem' }}
            onClick={() => speak(activeChallenge.audioReading)}
          >
            🔊 Pronounce
          </button>
        </div>
      </div>
    </div>
  );
}
