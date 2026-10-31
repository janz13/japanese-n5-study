import { useEffect, useMemo, useState } from 'react';
import {
  PARTICLES,
  PARTICLE_CATEGORIES,
  PARTICLE_GUIDE,
  type ParticleCategory,
  type ParticlePrompt,
} from '../data/particles';
import { useStore } from '../lib/store';
import { speak } from '../lib/tts';
import { playDing, playMiss } from '../lib/sfx';

const ALL_CATS = Object.keys(PARTICLE_CATEGORIES) as ParticleCategory[];

export default function ParticleDojo() {
  const { srs, addCard, sfxEnabled } = useStore();
  const [cat, setCat] = useState<ParticleCategory | 'all'>('all');
  const [current, setCurrent] = useState<ParticlePrompt | null>(null);
  const [picked, setPicked] = useState<string | null>(null);
  const [showWhy, setShowWhy] = useState(false);
  const [session, setSession] = useState({ ok: 0, total: 0 });

  const pool = useMemo(
    () => (cat === 'all' ? PARTICLES : PARTICLES.filter((p) => p.category === cat)),
    [cat],
  );

  const pickNext = (last?: ParticlePrompt | null) => {
    if (!pool.length) return null;
    const candidates = pool.length > 1 && last ? pool.filter((p) => p.id !== last.id) : pool;
    return candidates[Math.floor(Math.random() * candidates.length)];
  };

  useEffect(() => {
    setPicked(null);
    setShowWhy(false);
    setCurrent(pickNext(null));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pool]);

  const shuffledOptions = useMemo(
    () => (current ? [...current.options].sort(() => Math.random() - 0.5) : []),
    [current],
  );

  const choose = (opt: string) => {
    if (!current || picked !== null) return;
    setPicked(opt);
    const ok = opt === current.answer;
    setSession((s) => ({ ok: s.ok + (ok ? 1 : 0), total: s.total + 1 }));
    if (sfxEnabled) (ok ? playDing : playMiss)();
    speak(current.audio);
  };

  const next = () => {
    setPicked(null);
    setShowWhy(false);
    setCurrent(pickNext(current));
  };

  const srsId = current ? `g:particle:${current.id}` : '';
  const inSrs = srsId ? srsId in srs : false;

  const addCurrentToSrs = () => {
    if (!current) return;
    addCard({
      id: srsId,
      kind: 'grammar',
      front: `${current.before}（　）${current.after}`,
      reading: current.answer,
      back: `${current.en} — ${current.why}`,
    });
  };

  return (
    <div className="page">
      <h1>助詞道場 <span className="muted">Particle Dojo</span></h1>
      <p className="muted">
        Conquer the #1 JLPT grammar trap: choosing between は vs が, に vs で vs へ, and を・と・から・より in real sentences.
      </p>

      <div className="controls">
        <button className={cat === 'all' ? 'chip on' : 'chip'} onClick={() => setCat('all')}>
          All ({PARTICLES.length})
        </button>
        {ALL_CATS.map((c) => (
          <button key={c} className={cat === c ? 'chip on' : 'chip'} onClick={() => setCat(c)}>
            {PARTICLE_CATEGORIES[c]}
          </button>
        ))}
      </div>

      {current && (
        <div className={`drill ${picked === null ? '' : picked === current.answer ? 'ok' : 'bad'}`}>
          <span className="tag">{PARTICLE_CATEGORIES[current.category]}</span>

          <div
            className="jp center"
            style={{ fontSize: '1.85rem', margin: '0.9rem 0 0.3rem', lineHeight: 1.5 }}
          >
            {current.before}
            <span
              style={{
                display: 'inline-block',
                minWidth: '2.6rem',
                padding: '0 0.45rem',
                margin: '0 0.25rem',
                borderBottom: '3px solid var(--accent)',
                color:
                  picked === null
                    ? 'var(--accent)'
                    : picked === current.answer
                      ? 'var(--ok)'
                      : 'var(--bad)',
                fontWeight: 700,
              }}
            >
              {picked !== null ? current.answer : '？'}
            </span>
            {current.after}
          </div>

          <p className="muted nomargin" style={{ marginBottom: '0.9rem' }}>
            {current.en}
          </p>

          <div className="controls center">
            {shuffledOptions.map((opt) => {
              const cls =
                picked === null
                  ? 'chip'
                  : opt === current.answer
                    ? 'chip ok'
                    : picked === opt
                      ? 'chip bad'
                      : 'chip';
              return (
                <button
                  key={opt}
                  className={cls}
                  style={{ fontSize: '1.25rem', padding: '0.5rem 1.3rem', fontWeight: 600 }}
                  onClick={() => choose(opt)}
                >
                  {opt}
                </button>
              );
            })}
          </div>

          {(picked !== null || showWhy) && (
            <p className="small ok-text center" style={{ marginTop: '0.9rem', maxWidth: '620px' }}>
              💡 <b>Why 「{current.answer}」:</b> {current.why}
            </p>
          )}

          <div className="controls" style={{ marginTop: '0.9rem' }}>
            {picked === null && (
              <button className="chip" onClick={() => setShowWhy((w) => !w)}>
                💡 {showWhy ? 'Hide Hint' : 'Why Hint'}
              </button>
            )}
            <button className="chip" onClick={() => speak(current.audio)}>
              🔊 Hear Sentence
            </button>
            <button className={inSrs ? 'chip ok' : 'chip'} disabled={inSrs} onClick={addCurrentToSrs}>
              {inSrs ? '✓ In SRS' : '+ Add to SRS'}
            </button>
            <button className="chip on" onClick={next}>
              {picked !== null ? 'Next Prompt →' : 'Skip →'}
            </button>
          </div>

          <div className="drill-meta">
            <span>
              Session: {session.ok}/{session.total}
            </span>
            <span>
              {session.total ? `${Math.round((session.ok / session.total) * 100)}% accuracy` : ''}
            </span>
          </div>
        </div>
      )}

      <h2>Particle Cheat-Sheet Matrix <span className="muted">(tap any card to hear example)</span></h2>
      <div className="story-list">
        {PARTICLE_GUIDE.map((g) => (
          <div
            key={g.p}
            className="gp"
            style={{ cursor: 'pointer' }}
            onClick={() => speak(g.exKana)}
            title="Tap to hear example sentence"
          >
            <div className="gp-head">
              <b className="jp" style={{ fontSize: '1.5rem' }}>{g.p}</b>
              <span><b>{g.role}</b></span>
            </div>
            <p className="muted small">{g.tip}</p>
            <p className="jp nomargin">
              🔊 {g.exJp} <span className="muted small">— {g.exEn}</span>
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
