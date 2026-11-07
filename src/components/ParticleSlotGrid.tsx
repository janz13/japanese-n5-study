import { useState, useEffect } from 'react';
import type { ParticleSlotChallenge } from '../data/particles';
import { speak } from '../lib/tts';
import { playDing, playMiss } from '../lib/sfx';
import { useStore } from '../lib/store';

interface ParticleSlotGridProps {
  challenge: ParticleSlotChallenge;
  standalone?: boolean;
  onComplete?: (success: boolean) => void;
  onNext?: () => void;
}

function getSemanticRoleGlow(role: string) {
  const r = role.toLowerCase();
  if (r.includes('time') || r.includes('temporal') || (r.includes('point') && !r.includes('departure') && !r.includes('endpoint')) || r.includes('amber')) {
    return {
      color: '#f59e0b',
      border: '#f59e0b',
      bg: 'rgba(245, 158, 11, 0.16)',
      glow: '0 0 12px rgba(245, 158, 11, 0.45)',
    };
  }
  if (r.includes('companion') || r.includes('with') || r.includes('means') || r.includes('vehicle') || r.includes('teal')) {
    return {
      color: '#14b8a6',
      border: '#14b8a6',
      bg: 'rgba(20, 184, 166, 0.16)',
      glow: '0 0 12px rgba(20, 184, 166, 0.45)',
    };
  }
  if (r.includes('destination') || r.includes('direction') || r.includes('goal') || r.includes('indigo') || r.includes('purpose') || r.includes('endpoint') || r.includes('boundary')) {
    return {
      color: '#818cf8',
      border: '#6366f1',
      bg: 'rgba(99, 102, 241, 0.16)',
      glow: '0 0 12px rgba(99, 102, 241, 0.45)',
    };
  }
  if (r.includes('topic') || r.includes('contrast') || r.includes('rose')) {
    return {
      color: '#fb7185',
      border: '#f43f5e',
      bg: 'rgba(244, 63, 94, 0.16)',
      glow: '0 0 12px rgba(244, 63, 94, 0.45)',
    };
  }
  // Default Emerald (Subject / Object / Location)
  return {
    color: '#34d399',
    border: '#10b981',
    bg: 'rgba(16, 185, 129, 0.16)',
    glow: '0 0 12px rgba(16, 185, 129, 0.45)',
  };
}

export function ParticleSlotGrid({
  challenge,
  standalone = true,
  onComplete,
  onNext,
}: ParticleSlotGridProps) {
  const { sfxEnabled } = useStore();
  const numSlots = challenge.correctParticles.length;
  const [slots, setSlots] = useState<(string | null)[]>(() => Array(numSlots).fill(null));
  const [activeSlotIdx, setActiveSlotIdx] = useState<number>(0);
  const [checked, setChecked] = useState<boolean | null>(null);
  const [slotResults, setSlotResults] = useState<boolean[] | null>(null);

  const slotParticle = (p: string) => {
    if (checked !== null) return;
    setSlots((prev) => {
      const next = [...prev];
      next[activeSlotIdx] = p;
      return next;
    });

    // Auto-advance to next empty slot
    const nextEmpty = slots.findIndex((val, idx) => idx > activeSlotIdx && val === null);
    if (nextEmpty !== -1) {
      setActiveSlotIdx(nextEmpty);
    } else {
      const wrapEmpty = slots.findIndex((val) => val === null);
      if (wrapEmpty !== -1) setActiveSlotIdx(wrapEmpty);
    }
  };

  // Keyboard shortcut listener for particles 1-8
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (checked !== null) return;
      const num = parseInt(e.key, 10);
      if (num >= 1 && num <= challenge.particleBank.length) {
        slotParticle(challenge.particleBank[num - 1]);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  });

  const unslot = (idx: number) => {
    if (checked !== null) return;
    setSlots((prev) => {
      const next = [...prev];
      next[idx] = null;
      return next;
    });
    setActiveSlotIdx(idx);
  };

  const clearAll = () => {
    setSlots(Array(numSlots).fill(null));
    setActiveSlotIdx(0);
    setChecked(null);
    setSlotResults(null);
  };

  const evaluateSlots = () => {
    const results = slots.map((p, i) => p === challenge.correctParticles[i]);
    const allCorrect = results.every(Boolean);
    setChecked(allCorrect);
    setSlotResults(results);

    if (sfxEnabled) {
      if (allCorrect) playDing();
      else playMiss();
    }
    if (allCorrect) {
      speak(challenge.audioText);
    }
    onComplete?.(allCorrect);
  };

  const allFilled = slots.every((s) => s !== null);

  return (
    <div
      className="particle-slot-card"
      style={{
        background: 'var(--surface)',
        border: '1px solid var(--surface2)',
        borderRadius: 'var(--radius)',
        padding: '1.4rem',
        margin: '1rem 0',
      }}
    >
      <div className="row-between" style={{ marginBottom: '0.6rem' }}>
        <span className="tag" style={{ fontWeight: 600 }}>
          🧩 {challenge.title}
        </span>
        <button
          type="button"
          className="chip"
          style={{ fontSize: '0.8rem', padding: '0.2rem 0.6rem' }}
          onClick={() => speak(challenge.audioText)}
        >
          🔊 Hear Sentence
        </button>
      </div>

      <p className="muted small nomargin" style={{ marginBottom: '1rem' }}>
        {challenge.en}
      </p>

      {/* Multi-Slot Sentence Display */}
      <div
        className="slot-sentence-wrap jp"
        style={{
          fontSize: '1.5rem',
          lineHeight: '2.5',
          display: 'flex',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '0.4rem',
          padding: '0.8rem',
          background: 'var(--surface2)',
          borderRadius: '12px',
          margin: '0.8rem 0',
        }}
      >
        {challenge.sentenceSegments.map((segment, segIdx) => (
          <div key={segIdx} style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}>
            <span>{segment}</span>
            {segIdx < numSlots && (
              <div
                style={{
                  display: 'inline-flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  margin: '0 0.2rem',
                }}
              >
                {/* Slot Button Target */}
                <button
                  type="button"
                  onClick={() => (slots[segIdx] ? unslot(segIdx) : setActiveSlotIdx(segIdx))}
                  style={{
                    minWidth: '46px',
                    height: '44px',
                    padding: '0 0.6rem',
                    fontSize: '1.25rem',
                    fontWeight: 700,
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontFamily: "'Noto Sans JP', sans-serif",
                    border: `2px ${slots[segIdx] ? 'solid' : 'dashed'} ${
                      checked === true
                        ? getSemanticRoleGlow(challenge.semanticRoles[segIdx]).border
                        : slotResults && !slotResults[segIdx]
                        ? 'var(--bad)'
                        : activeSlotIdx === segIdx
                        ? 'var(--accent)'
                        : 'var(--muted)'
                    }`,
                    background:
                      checked === true
                        ? getSemanticRoleGlow(challenge.semanticRoles[segIdx]).bg
                        : slots[segIdx]
                        ? 'var(--surface)'
                        : 'transparent',
                    color:
                      checked === true
                        ? getSemanticRoleGlow(challenge.semanticRoles[segIdx]).color
                        : slots[segIdx]
                        ? 'var(--text)'
                        : 'var(--muted)',
                    boxShadow:
                      checked === true
                        ? getSemanticRoleGlow(challenge.semanticRoles[segIdx]).glow
                        : activeSlotIdx === segIdx
                        ? '0 0 8px color-mix(in srgb, var(--accent) 40%, transparent)'
                        : 'none',
                    transition: 'all 0.2s ease',
                  }}
                  title={slots[segIdx] ? 'Tap to remove' : `Slot ${segIdx + 1}`}
                >
                  {slots[segIdx] ?? `${segIdx + 1}`}
                </button>

                {/* Semantic Role Tag (Glows when answered correctly) */}
                {checked === true && (
                  <span
                    className="small"
                    style={{
                      fontSize: '0.68rem',
                      fontWeight: 600,
                      marginTop: '4px',
                      color: getSemanticRoleGlow(challenge.semanticRoles[segIdx]).color,
                    }}
                  >
                    {challenge.semanticRoles[segIdx]}
                  </span>
                )}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Particle Bank Tray */}
      <div style={{ marginTop: '1.2rem' }}>
        <div className="row-between" style={{ marginBottom: '0.4rem' }}>
          <span className="muted small">
            {checked !== null
              ? 'Completed'
              : `Tap particle to slot into Blank #${activeSlotIdx + 1} (or press 1–${challenge.particleBank.length})`}
          </span>
          {slots.some((s) => s !== null) && checked === null && (
            <button
              type="button"
              className="chip"
              style={{ fontSize: '0.75rem', padding: '0.15rem 0.5rem' }}
              onClick={clearAll}
            >
              ↺ Clear All
            </button>
          )}
        </div>

        <div className="controls" style={{ gap: '0.5rem' }}>
          {challenge.particleBank.map((p, idx) => (
            <button
              key={idx}
              type="button"
              className="chip"
              disabled={checked !== null}
              style={{
                fontSize: '1.2rem',
                minWidth: '48px',
                padding: '0.45rem 0.9rem',
                position: 'relative',
                fontWeight: 600,
              }}
              onClick={() => slotParticle(p)}
            >
              {p}
              <span
                style={{
                  position: 'absolute',
                  top: '2px',
                  right: '4px',
                  fontSize: '0.6rem',
                  opacity: 0.5,
                }}
              >
                {idx + 1}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Evaluation Feedback & Explanations */}
      {checked !== null && (
        <div
          style={{
            background: checked ? 'color-mix(in srgb, var(--ok) 12%, var(--surface))' : 'color-mix(in srgb, var(--bad) 12%, var(--surface))',
            border: `1px solid ${checked ? 'var(--ok)' : 'var(--bad)'}`,
            borderRadius: '10px',
            padding: '0.8rem 1rem',
            marginTop: '1rem',
          }}
        >
          {checked ? (
            <div>
              <b className="ok-text" style={{ fontSize: '1rem' }}>✓ All Particles Slotted Correctly!</b>
              <p className="small nomargin" style={{ marginTop: '0.4rem', color: 'var(--text)' }}>
                💡 {challenge.explanation}
              </p>
            </div>
          ) : (
            <div>
              <b className="bad-text">✗ Some particles are misplaced.</b>
              <p className="small nomargin" style={{ marginTop: '0.4rem', color: 'var(--muted)' }}>
                Tap misplaced slots to clear and re-try.
              </p>
            </div>
          )}
        </div>
      )}

      {/* Footer Controls */}
      <div className="controls" style={{ marginTop: '1.2rem' }}>
        {checked === null ? (
          <button
            type="button"
            className="chip on"
            disabled={!allFilled}
            onClick={evaluateSlots}
          >
            Check Sentence
          </button>
        ) : (
          <>
            {!checked && (
              <button
                type="button"
                className="chip on"
                onClick={() => {
                  setChecked(null);
                  setSlotResults(null);
                }}
              >
                Try Again
              </button>
            )}
            {standalone && onNext && (
              <button
                type="button"
                className="chip on"
                onClick={onNext}
              >
                Next Challenge →
              </button>
            )}
          </>
        )}
      </div>
    </div>
  );
}
