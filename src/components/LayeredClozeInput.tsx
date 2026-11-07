import { useState, useRef, useEffect } from 'react';
import { toHiragana } from 'wanakana';
import type { LayeredClozeExercise } from '../data/grammar';
import { speak } from '../lib/tts';

interface LayeredClozeInputProps {
  ex: LayeredClozeExercise;
  onAnswer: (ok: boolean) => void;
}

export function LayeredClozeInput({ ex, onAnswer }: LayeredClozeInputProps) {
  const [input, setInput] = useState('');
  const [hintLevel, setHintLevel] = useState<number>(0);
  const [warning, setWarning] = useState<string | null>(null);
  const [checked, setChecked] = useState<boolean | null>(null);
  const [shake, setShake] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleInputChange = (raw: string) => {
    // Wanakana IME conversion in real-time
    const converted = toHiragana(raw, { IMEMode: true });
    setInput(converted);
    if (warning) setWarning(null);
  };

  const checkAnswer = () => {
    if (checked !== null) return;
    const clean = input.trim().replace(/\s+/g, '');
    if (!clean) return;

    // 1. Check for Near-Miss Error Interceptor
    const nearMiss = ex.nearMisses?.find((nm) => {
      const inputs = Array.isArray(nm.input) ? nm.input : [nm.input];
      return inputs.some((target) => {
        const nmClean = target.trim().replace(/\s+/g, '');
        return (
          nmClean.toLowerCase() === clean.toLowerCase() ||
          toHiragana(nmClean).toLowerCase() === toHiragana(clean).toLowerCase()
        );
      });
    });

    if (nearMiss) {
      setWarning(nearMiss.warning);
      setShake(true);
      setTimeout(() => setShake(false), 600);
      return; // Non-punitive: no score deduction, no onAnswer call
    }

    // 2. Validate against acceptable answers
    const ok = ex.acceptableAnswers.some((ans) => {
      const aClean = ans.trim().replace(/\s+/g, '');
      return (
        aClean.toLowerCase() === clean.toLowerCase() ||
        toHiragana(aClean).toLowerCase() === toHiragana(clean).toLowerCase()
      );
    });

    setChecked(ok);
    setWarning(null);
    if (ok) {
      const fullSentence = `${ex.sentencePre}${ex.acceptableAnswers[0]}${ex.sentencePost}`;
      speak(ex.audioText ?? fullSentence);
    }
    onAnswer(ok);
  };

  const advanceHint = () => {
    setHintLevel((lvl) => (lvl >= 4 ? 4 : lvl + 1));
  };

  return (
    <div className={`cloze-container ${shake ? 'shake-anim' : ''}`} style={{ marginTop: '0.6rem' }}>
      {ex.en && <p className="muted small nomargin" style={{ marginBottom: '0.4rem' }}>{ex.en}</p>}

      {/* Inline Cloze Sentence */}
      <div
        className="cloze-sentence jp"
        style={{
          fontSize: '1.45rem',
          lineHeight: '2.4',
          display: 'flex',
          alignItems: 'baseline',
          flexWrap: 'wrap',
          gap: '0.35rem',
          margin: '0.5rem 0',
        }}
      >
        <span>{ex.sentencePre}</span>
        <span style={{ display: 'inline-flex', flexDirection: 'column', alignItems: 'center' }}>
          <input
            ref={inputRef}
            type="text"
            className="cloze-input"
            value={input}
            disabled={checked !== null}
            onChange={(e) => handleInputChange(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                checkAnswer();
              }
            }}
            placeholder="入力…"
            style={{
              fontSize: '1.25rem',
              fontFamily: "'Noto Sans JP', sans-serif",
              padding: '0.2rem 0.5rem',
              borderRadius: '6px',
              border: `2px solid ${
                checked === true
                  ? 'var(--ok)'
                  : checked === false
                  ? 'var(--bad)'
                  : warning
                  ? '#f59e0b'
                  : 'var(--surface2)'
              }`,
              background: 'var(--surface2)',
              color: 'var(--text)',
              minWidth: '120px',
              maxWidth: '180px',
              textAlign: 'center',
              outline: 'none',
              transition: 'border-color 0.2s, box-shadow 0.2s',
            }}
            autoComplete="off"
            autoCapitalize="off"
          />
          <small className="muted" style={{ fontSize: '0.72rem', marginTop: '2px' }}>
            ({ex.rootPrompt})
          </small>
        </span>
        <span>{ex.sentencePost}</span>
      </div>

      {/* Near-Miss Warning Callout (Non-Punitive) */}
      {warning && (
        <div
          className="near-miss-box"
          style={{
            background: 'color-mix(in srgb, #f59e0b 16%, var(--surface))',
            border: '1px solid #f59e0b',
            borderRadius: '8px',
            padding: '0.55rem 0.85rem',
            margin: '0.6rem 0',
            fontSize: '0.88rem',
            color: '#fbbf24',
          }}
        >
          <b>⚠️ Near-Miss:</b> {warning}
          <div style={{ fontSize: '0.76rem', color: 'var(--muted)', marginTop: '2px' }}>
            No penalty! Modify your answer and press Check again.
          </div>
        </div>
      )}

      {/* Submission & Progressive Hint Controls */}
      <div className="controls" style={{ marginTop: '0.7rem' }}>
        {checked === null ? (
          <>
            <button
              type="button"
              className="chip on"
              disabled={!input.trim()}
              onClick={checkAnswer}
            >
              Check Answer
            </button>
            <button
              type="button"
              className="chip"
              onClick={advanceHint}
            >
              💡 Hint {hintLevel === 0 ? '' : `(${hintLevel}/4)`}
            </button>
          </>
        ) : checked ? (
          <div className="ok-text" style={{ fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span>✓ Correct!</span>
            <button
              type="button"
              className="chip"
              onClick={() => {
                const fullSentence = `${ex.sentencePre}${ex.acceptableAnswers[0]}${ex.sentencePost}`;
                speak(ex.audioText ?? fullSentence);
              }}
            >
              🔊 Hear Sentence
            </button>
          </div>
        ) : (
          <div className="bad-text" style={{ fontSize: '0.92rem' }}>
            ✗ Expected: <b>{ex.acceptableAnswers.join(' / ')}</b>
          </div>
        )}
      </div>

      {/* Progressive 4-Tier Hint Drawer */}
      {hintLevel > 0 && (
        <div
          className="hint-drawer"
          style={{
            background: 'var(--surface)',
            border: '1px solid var(--surface2)',
            borderRadius: '10px',
            padding: '0.75rem 1rem',
            marginTop: '0.8rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.45rem',
          }}
        >
          {hintLevel >= 1 && (
            <div style={{ fontSize: '0.85rem' }}>
              <span className="chip" style={{ fontSize: '0.72rem', padding: '0.15rem 0.5rem', marginRight: '0.4rem', border: '1px solid #f59e0b', color: '#f59e0b' }}>
                Tier 1 · Nuance
              </span>
              <span>{ex.hints.layer1Nuance}</span>
            </div>
          )}
          {hintLevel >= 2 && (
            <div style={{ fontSize: '0.85rem' }}>
              <span className="chip" style={{ fontSize: '0.72rem', padding: '0.15rem 0.5rem', marginRight: '0.4rem', border: '1px solid #14b8a6', color: '#14b8a6' }}>
                Tier 2 · Pattern
              </span>
              <code style={{ color: 'var(--text)' }}>{ex.hints.layer2Pattern}</code>
            </div>
          )}
          {hintLevel >= 3 && (
            <div style={{ fontSize: '0.85rem' }}>
              <span className="chip" style={{ fontSize: '0.72rem', padding: '0.15rem 0.5rem', marginRight: '0.4rem', border: '1px solid #818cf8', color: '#818cf8' }}>
                Tier 3 · Form Rule
              </span>
              <span>{ex.hints.layer3Rule}</span>
            </div>
          )}
          {hintLevel >= 4 && (
            <div style={{ fontSize: '0.85rem' }}>
              <span className="chip" style={{ fontSize: '0.72rem', padding: '0.15rem 0.5rem', marginRight: '0.4rem', border: '1px solid var(--ok)', color: 'var(--ok)' }}>
                Tier 4 · Full Grammar
              </span>
              <span>{ex.hints.layer4FullGrammar}</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
