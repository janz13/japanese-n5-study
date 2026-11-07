import { useEffect, useMemo, useState } from 'react';
import {
  PARTICLES,
  PARTICLE_CATEGORIES,
  PARTICLE_GUIDE,
  PARTICLE_SLOT_CHALLENGES,
  type ParticleCategory,
  type ParticlePrompt,
} from '../data/particles';
import { ParticleSlotGrid } from '../components/ParticleSlotGrid';
import {
  ONOMATOPOEIA,
  ONOMATO_CATEGORIES,
  type OnomatoCategory,
  type OnomatopoeiaItem,
} from '../data/onomatopoeia';
import { useStore } from '../lib/store';
import { speak } from '../lib/tts';
import { playDing, playMiss } from '../lib/sfx';
import { useCampaignMission } from '../lib/useCampaignMission';
import CampaignBanner from '../components/CampaignBanner';

const ALL_CATS = Object.keys(PARTICLE_CATEGORIES) as ParticleCategory[];
const ALL_ONO_CATS = Object.keys(ONOMATO_CATEGORIES) as OnomatoCategory[];

export default function ParticleDojo() {
  const { srs, addCard, sfxEnabled } = useStore();
  const { isCampaignMode, stage, saga, targetCategory, returnToCampaign } = useCampaignMission();
  const [dojoTab, setDojoTab] = useState<'particles' | 'onomatopoeia'>('particles');

  // Particle Dojo State
  const [cat, setCat] = useState<ParticleCategory | 'all'>(() => {
    if (targetCategory && targetCategory in PARTICLE_CATEGORIES) {
      return targetCategory as ParticleCategory;
    }
    return 'all';
  });

  useEffect(() => {
    if (targetCategory && targetCategory in PARTICLE_CATEGORIES) {
      setCat(targetCategory as ParticleCategory);
    }
  }, [targetCategory]);

  const [current, setCurrent] = useState<ParticlePrompt | null>(null);
  const [picked, setPicked] = useState<string | null>(null);
  const [showWhy, setShowWhy] = useState(false);
  const [session, setSession] = useState({ ok: 0, total: 0 });
  const [particleSubMode, setParticleSubMode] = useState<'traps' | 'matrix'>('traps');
  const [slotIdx, setSlotIdx] = useState(0);

  // Onomatopoeia Dojo State
  const [onoCat, setOnoCat] = useState<OnomatoCategory | 'all'>('all');
  const [onoIdx, setOnoIdx] = useState(0);
  const [onoPicked, setOnoPicked] = useState<string | null>(null);

  const pool = useMemo(
    () => (cat === 'all' ? PARTICLES : PARTICLES.filter((p) => p.category === cat)),
    [cat],
  );

  const onoPool = useMemo(
    () => (onoCat === 'all' ? ONOMATOPOEIA : ONOMATOPOEIA.filter((o) => o.category === onoCat)),
    [onoCat],
  );
  const currentOno: OnomatopoeiaItem | undefined = onoPool[onoIdx % onoPool.length];

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

  const chooseOno = (opt: string) => {
    if (!currentOno || onoPicked !== null) return;
    setOnoPicked(opt);
    const ok = opt === currentOno.word;
    setSession((s) => ({ ok: s.ok + (ok ? 1 : 0), total: s.total + 1 }));
    if (sfxEnabled) (ok ? playDing : playMiss)();
    speak(currentOno.audio);
  };

  return (
    <div className="page">
      {isCampaignMode && stage && (
        <CampaignBanner stage={stage} saga={saga} onReturn={returnToCampaign} />
      )}
      <div className="row-between">
        <div>
          <h1 className="nomargin">
            助詞・擬音語道場 <span className="muted">Particles &amp; Onomatopoeia</span>
          </h1>
          <p className="muted small nomargin" style={{ marginTop: '0.2rem' }}>
            Master JLPT particle traps (`は` vs `が`, `に` vs `で`) and expressive Japanese sound words (`ペコペコ`, `ゴロゴロ`, `ギリギリ`).
          </p>
        </div>
        <div className="controls">
          <button
            className={dojoTab === 'particles' ? 'chip on' : 'chip'}
            onClick={() => setDojoTab('particles')}
          >
            助 Particle Dojo ({PARTICLES.length})
          </button>
          <button
            className={dojoTab === 'onomatopoeia' ? 'chip on' : 'chip'}
            onClick={() => setDojoTab('onomatopoeia')}
          >
            ✨ Onomatopoeia · 擬音語 ({ONOMATOPOEIA.length})
          </button>
        </div>
      </div>

      {dojoTab === 'particles' ? (
        <>
          <div className="controls" style={{ marginTop: '0.8rem' }}>
            <button
              className={particleSubMode === 'traps' ? 'chip on' : 'chip'}
              onClick={() => setParticleSubMode('traps')}
            >
              ⚡ Single Particle Traps ({PARTICLES.length})
            </button>
            <button
              className={particleSubMode === 'matrix' ? 'chip on' : 'chip'}
              onClick={() => setParticleSubMode('matrix')}
            >
              🧩 Multi-Slot Matrix ({PARTICLE_SLOT_CHALLENGES.length})
            </button>
          </div>

          {particleSubMode === 'matrix' ? (
            <div>
              <div className="controls" style={{ marginTop: '0.8rem', flexWrap: 'wrap', gap: '0.4rem' }}>
                {PARTICLE_SLOT_CHALLENGES.map((ch, idx) => (
                  <button
                    key={ch.id}
                    className={(slotIdx % PARTICLE_SLOT_CHALLENGES.length) === idx ? 'chip on' : 'chip'}
                    onClick={() => setSlotIdx(idx)}
                  >
                    #{idx + 1} {ch.title}
                  </button>
                ))}
              </div>
              <ParticleSlotGrid
                key={PARTICLE_SLOT_CHALLENGES[slotIdx % PARTICLE_SLOT_CHALLENGES.length].id}
                challenge={PARTICLE_SLOT_CHALLENGES[slotIdx % PARTICLE_SLOT_CHALLENGES.length]}
                onNext={() => setSlotIdx((i) => (i + 1) % PARTICLE_SLOT_CHALLENGES.length)}
              />
            </div>
          ) : (
            <>
              <div className="controls" style={{ marginTop: '0.8rem' }}>
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
            </>
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
        </>
      ) : (
        <>
          <div className="controls" style={{ marginTop: '0.8rem' }}>
            <button
              className={onoCat === 'all' ? 'chip on' : 'chip'}
              onClick={() => {
                setOnoCat('all');
                setOnoIdx(0);
                setOnoPicked(null);
              }}
            >
              All ({ONOMATOPOEIA.length})
            </button>
            {ALL_ONO_CATS.map((c) => (
              <button
                key={c}
                className={onoCat === c ? 'chip on' : 'chip'}
                onClick={() => {
                  setOnoCat(c);
                  setOnoIdx(0);
                  setOnoPicked(null);
                }}
              >
                {ONOMATO_CATEGORIES[c]}
              </button>
            ))}
          </div>

          {currentOno && (
            <div className={`drill ${onoPicked === null ? '' : onoPicked === currentOno.word ? 'ok' : 'bad'}`}>
              <div className="row-between" style={{ width: '100%' }}>
                <span className="tag">{ONOMATO_CATEGORIES[currentOno.category]}</span>
                <span className="muted small">
                  Word {(onoIdx % onoPool.length) + 1} / {onoPool.length}
                </span>
              </div>

              <div
                className="jp center"
                style={{ fontSize: '1.8rem', margin: '0.9rem 0 0.3rem', lineHeight: 1.5 }}
              >
                {currentOno.before}
                <span
                  style={{
                    display: 'inline-block',
                    minWidth: '4.8rem',
                    padding: '0 0.45rem',
                    margin: '0 0.25rem',
                    borderBottom: '3px solid var(--accent)',
                    color:
                      onoPicked === null
                        ? 'var(--accent)'
                        : onoPicked === currentOno.word
                          ? 'var(--ok)'
                          : 'var(--bad)',
                    fontWeight: 700,
                  }}
                >
                  {onoPicked !== null ? currentOno.word : '？？？'}
                </span>
                {currentOno.after}
              </div>

              <p className="muted nomargin" style={{ marginBottom: '0.9rem' }}>
                {currentOno.en}
              </p>

              <div className="controls center">
                {currentOno.options.map((opt) => {
                  const cls =
                    onoPicked === null
                      ? 'chip'
                      : opt === currentOno.word
                        ? 'chip ok'
                        : onoPicked === opt
                          ? 'chip bad'
                          : 'chip';
                  return (
                    <button
                      key={opt}
                      className={cls}
                      style={{ fontSize: '1.15rem', padding: '0.5rem 1.2rem', fontWeight: 600 }}
                      onClick={() => chooseOno(opt)}
                    >
                      {opt}
                    </button>
                  );
                })}
              </div>

              {onoPicked !== null && (
                <p className="small ok-text center" style={{ marginTop: '0.9rem', maxWidth: '620px' }}>
                  💡 <b>{currentOno.word} ({currentOno.kana}):</b> {currentOno.meaning} — {currentOno.vibeNote}
                </p>
              )}

              <div className="controls" style={{ marginTop: '0.9rem' }}>
                <button className="chip" onClick={() => speak(currentOno.audio)}>
                  🔊 Hear Sentence
                </button>
                <button
                  className={srs[`ono:${currentOno.id}`] ? 'chip ok' : 'chip'}
                  disabled={!!srs[`ono:${currentOno.id}`]}
                  onClick={() =>
                    addCard({
                      id: `ono:${currentOno.id}`,
                      kind: 'word',
                      front: currentOno.word,
                      reading: currentOno.kana,
                      back: `${currentOno.meaning} — ${currentOno.before}${currentOno.word}${currentOno.after}`,
                    })
                  }
                >
                  {srs[`ono:${currentOno.id}`] ? '✓ In SRS' : '+ Add to SRS'}
                </button>
                <button
                  className="chip on"
                  onClick={() => {
                    setOnoPicked(null);
                    setOnoIdx((i) => i + 1);
                  }}
                >
                  Next Sound Word →
                </button>
              </div>
            </div>
          )}

          <h2>Onomatopoeia &amp; Mimetic Word Reference ({ONOMATOPOEIA.length} Words)</h2>
          <div className="story-list">
            {onoPool.map((item) => (
              <div
                key={item.id}
                className="gp"
                style={{ cursor: 'pointer' }}
                onClick={() => speak(item.audio)}
              >
                <div className="row-between">
                  <div className="gp-head">
                    <b className="jp" style={{ fontSize: '1.35rem' }}>
                      🔊 {item.word} <span className="muted small">({item.kana})</span>
                    </b>
                    <span><b>{item.meaning}</b></span>
                  </div>
                  <span className="tag">{ONOMATO_CATEGORIES[item.category]}</span>
                </div>
                <p className="muted small">{item.vibeNote}</p>
                <p className="jp nomargin">
                  {item.before}
                  <b style={{ color: 'var(--accent)' }}>{item.word}</b>
                  {item.after} <span className="muted small">— {item.en}</span>
                </p>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
