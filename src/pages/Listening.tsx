import { useEffect, useMemo, useState } from 'react';
import { LISTENING, LISTENING_TYPES, type ListeningItem } from '../data/listening';
import { PITCH_PAIRS, type PitchWord } from '../data/pitchAccent';
import { useStore } from '../lib/store';
import { speak } from '../lib/tts';
import { playDing, playFanfare, playMiss } from '../lib/sfx';
import { useCampaignMission } from '../lib/useCampaignMission';
import CampaignBanner from '../components/CampaignBanner';

type Kind = ListeningItem['type'];
const ROUND = 10;

function buildRound(kind: Kind | 'all', _seed?: number) {
  const pool = LISTENING.filter((i) => kind === 'all' || i.type === kind);
  return [...pool]
    .sort(() => Math.random() - 0.5)
    .slice(0, ROUND)
    .map((item) => ({ item, order: item.options.map((_, i) => i).sort(() => Math.random() - 0.5) }));
}

function PitchContourSvg({ word, color }: { word: PitchWord; color: string }) {
  const stepX = 52;
  const padX = 32;
  const w = padX * 2 + (word.morae.length - 1) * stepX;
  const h = 84;
  const yHigh = 22;
  const yLow = 56;

  const particleKana = ['が', 'を', 'に', 'は', 'で', 'と', 'の', 'へ', 'から', 'まで'];
  const lastMora = word.morae[word.morae.length - 1];
  const hasTrailingParticle =
    word.morae.length > word.kana.length || particleKana.includes(lastMora);

  const pts = word.morae.map((m, i) => {
    const isParticle = hasTrailingParticle && i === word.morae.length - 1;
    const isKernel = word.accentKernel ? word.accentKernel === i + 1 : false;
    return {
      m,
      x: padX + i * stepX,
      y: word.heights[i] === 'H' ? yHigh : yLow,
      isParticle,
      isKernel,
    };
  });

  const poly = pts.map((p) => `${p.x},${p.y}`).join(' ');
  const particlePt = pts.find((p) => p.isParticle);
  const nounFinalPt = pts[pts.length - 2];

  // Odaka has word-final mora High and particle Low
  const isOdakaDrop =
    word.patternType === 'odaka' &&
    particlePt &&
    nounFinalPt &&
    nounFinalPt.y === yHigh &&
    particlePt.y === yLow;

  // Heiban maintains flat High into particle
  const isHeibanFlat =
    word.patternType === 'heiban' &&
    particlePt &&
    nounFinalPt &&
    nounFinalPt.y === yHigh &&
    particlePt.y === yHigh;

  return (
    <svg
      width={w}
      height={h}
      viewBox={`0 0 ${w} ${h}`}
      style={{
        overflow: 'visible',
        display: 'block',
        margin: '0.4rem 0',
        maxWidth: '100%',
        height: 'auto',
      }}
    >
      {/* High and Low pitch guide rails */}
      <line
        x1={padX - 18}
        y1={yHigh}
        x2={w - padX + 18}
        y2={yHigh}
        stroke="var(--border)"
        strokeDasharray="3 3"
        strokeWidth="1"
        opacity="0.6"
      />
      <line
        x1={padX - 18}
        y1={yLow}
        x2={w - padX + 18}
        y2={yLow}
        stroke="var(--border)"
        strokeDasharray="3 3"
        strokeWidth="1"
        opacity="0.6"
      />
      <text x={padX - 22} y={yHigh + 3} textAnchor="end" fontSize="9" fill="var(--muted)">
        H
      </text>
      <text x={padX - 22} y={yLow + 3} textAnchor="end" fontSize="9" fill="var(--muted)">
        L
      </text>

      {/* Particle boundary divider */}
      {particlePt && nounFinalPt && (
        <line
          x1={(nounFinalPt.x + particlePt.x) / 2}
          y1={yHigh - 8}
          x2={(nounFinalPt.x + particlePt.x) / 2}
          y2={yLow + 10}
          stroke="var(--border)"
          strokeDasharray="2 2"
          strokeWidth="1.2"
        />
      )}

      {/* Pitch contour line */}
      <polyline
        fill="none"
        stroke={color}
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
        points={poly}
      />

      {/* Drop indicator for Odaka */}
      {isOdakaDrop && particlePt && nounFinalPt && (
        <g>
          <text
            x={(nounFinalPt.x + particlePt.x) / 2}
            y={(yHigh + yLow) / 2 - 2}
            textAnchor="middle"
            fill="var(--warn, #e67e22)"
            fontSize="10"
            fontWeight="bold"
          >
            ▼ drop
          </text>
        </g>
      )}

      {/* Flat continuation indicator for Heiban */}
      {isHeibanFlat && particlePt && nounFinalPt && (
        <g>
          <text
            x={(nounFinalPt.x + particlePt.x) / 2}
            y={yHigh - 6}
            textAnchor="middle"
            fill="var(--ok, #2ecc71)"
            fontSize="10"
            fontWeight="bold"
          >
            ― flat
          </text>
        </g>
      )}

      {/* Mora circles and labels */}
      {pts.map((p, i) => (
        <g key={i}>
          {p.isKernel && (
            <circle
              cx={p.x}
              cy={p.y}
              r={9}
              fill="none"
              stroke="var(--warn, #e67e22)"
              strokeWidth="1.8"
            />
          )}
          <circle
            cx={p.x}
            cy={p.y}
            r={p.isParticle ? 5.5 : 6.5}
            fill={p.isParticle ? 'var(--surface)' : color}
            stroke={color}
            strokeWidth="2.4"
            strokeDasharray={p.isParticle ? '2 2' : undefined}
          />
          <text
            x={p.x}
            y={h - 6}
            textAnchor="middle"
            fill={p.isParticle ? 'var(--muted)' : 'var(--text)'}
            fontSize="13"
            fontFamily="Noto Sans JP, sans-serif"
            fontWeight={p.isParticle ? 500 : 700}
          >
            {p.isParticle ? `+${p.m}` : p.m}
          </text>
        </g>
      ))}
    </svg>
  );
}

export default function Listening() {
  const { sfxEnabled: sfx, srs, addCard } = useStore();
  const {
    isCampaignMode,
    stage,
    saga,
    targetTab,
    completeMission,
    returnToCampaign,
  } = useCampaignMission();

  const [tab, setTab] = useState<'drills' | 'pitch'>(() => {
    if (targetTab === 'pitch' || targetTab === 'drills') return targetTab;
    return 'drills';
  });

  useEffect(() => {
    if (targetTab === 'pitch' || targetTab === 'drills') {
      setTab(targetTab);
    }
  }, [targetTab]);

  const [kind, setKind] = useState<Kind | 'all'>('all');
  const [seed, setSeed] = useState(0);
  const round = useMemo(() => buildRound(kind, seed), [kind, seed]);
  const [idx, setIdx] = useState(0);
  const [picked, setPicked] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [showText, setShowText] = useState(false);

  // Pitch Accent Drill State
  const [pitchIdx, setPitchIdx] = useState(0);
  const [pitchTargetSide, setPitchTargetSide] = useState<'A' | 'B'>('A');
  const [pitchPicked, setPitchPicked] = useState<'A' | 'B' | null>(null);
  const [pitchDrillCount, setPitchDrillCount] = useState(0);
  const [pitchCorrectCount, setPitchCorrectCount] = useState(0);
  const activePair = PITCH_PAIRS[pitchIdx % PITCH_PAIRS.length];
  const targetPitchWord = pitchTargetSide === 'A' ? activePair.wordA : activePair.wordB;

  const restart = (k: Kind | 'all' = kind) => {
    setKind(k);
    setSeed((s) => s + 1);
    setIdx(0);
    setPicked(null);
    setScore(0);
    setShowText(false);
  };

  const done = idx >= round.length;
  const cur = round[idx];

  const choose = (opt: number) => {
    if (picked !== null || !cur) return;
    setPicked(opt);
    const ok = opt === cur.item.answer;
    if (ok) setScore((s) => s + 1);
    if (sfx) (ok ? playDing : playMiss)();
  };

  const next = () => {
    setPicked(null);
    setShowText(false);
    const n = idx + 1;
    setIdx(n);
    if (n >= round.length) {
      const pct = Math.round((score / round.length) * 100);
      if (sfx && pct >= 60) playFanfare();
      if (isCampaignMode && pct >= 60) completeMission();
    }
  };

  const choosePitchSide = (side: 'A' | 'B') => {
    if (pitchPicked) return;
    setPitchPicked(side);
    const ok = side === pitchTargetSide;
    if (sfx) (ok ? playDing : playMiss)();
    speak(targetPitchWord.sentenceTts);
    if (isCampaignMode) {
      const nextCount = pitchDrillCount + 1;
      const nextCorrect = pitchCorrectCount + (ok ? 1 : 0);
      setPitchDrillCount(nextCount);
      setPitchCorrectCount(nextCorrect);
      if (nextCount >= 5 && nextCorrect >= 4) {
        completeMission();
      }
    }
  };

  const nextPitchDrill = () => {
    setPitchPicked(null);
    const nextSide: 'A' | 'B' = Math.random() < 0.5 ? 'A' : 'B';
    setPitchTargetSide(nextSide);
    setPitchIdx((i) => i + 1);
  };

  return (
    <div className="page">
      {isCampaignMode && stage && (
        <CampaignBanner stage={stage} saga={saga} onReturn={returnToCampaign} />
      )}
      <div className="row-between">
        <div>
          <h1 className="nomargin">
            聴解・高低アクセント <span className="muted">Listening &amp; Pitch Accent</span>
          </h1>
          <p className="muted small nomargin" style={{ marginTop: '0.2rem' }}>
            JLPT quick-response listening comprehension and Tokyo Pitch Accent (`高低アクセント`) homophone studio.
          </p>
        </div>
        <div className="controls">
          <button className={tab === 'drills' ? 'chip on' : 'chip'} onClick={() => setTab('drills')}>
            🎧 JLPT 聴解 Drills ({LISTENING.length})
          </button>
          <button className={tab === 'pitch' ? 'chip on' : 'chip'} onClick={() => setTab('pitch')}>
            🎵 Pitch Accent &amp; Homophones ({PITCH_PAIRS.length} pairs)
          </button>
        </div>
      </div>

      {tab === 'drills' ? (
        <>
          <div className="controls" style={{ marginTop: '0.8rem' }}>
            <button className={kind === 'all' ? 'chip on' : 'chip'} onClick={() => restart('all')}>All</button>
            {(Object.keys(LISTENING_TYPES) as Kind[]).map((k) => (
              <button key={k} className={kind === k ? 'chip on' : 'chip'} onClick={() => restart(k)}>
                {LISTENING_TYPES[k]}
              </button>
            ))}
          </div>

          {done ? (
            <div className="card-box center">
              <span className="big-emoji">{score / round.length >= 0.8 ? '🎧' : '📻'}</span>
              <h2 className="nomargin">{score}/{round.length} correct</h2>
              <p className="muted">{score / round.length >= 0.8 ? 'すごい！ Your ears are N5-ready.' : 'もう一度！ Try another round.'}</p>
              <button className="chip on" onClick={() => restart()}>↺ New round</button>
            </div>
          ) : (
            cur && (
              <div className="gp">
                <div className="row-between">
                  <span className="tag">{LISTENING_TYPES[cur.item.type]} · Q{idx + 1}/{round.length}</span>
                  <span className="muted small">Score {score}</span>
                </div>
                <div className="controls center" style={{ margin: '1.2rem 0' }}>
                  <button className="mic" aria-label="Play audio" onClick={() => speak(cur.item.audio)}>▶</button>
                  <button className="chip" onClick={() => speak(cur.item.audio, 0.7)}>🐢 Slow</button>
                  <button className="chip" onClick={() => setShowText((v) => !v)}>{showText ? 'Hide' : 'Show'} transcript</button>
                </div>
                {(showText || picked !== null) && <p className="jp center" style={{ fontSize: '1.2rem', whiteSpace: 'pre-line' }}>{cur.item.transcript}</p>}
                <p><b>{cur.item.question}</b></p>
                <div className="controls">
                  {cur.order.map((o) => (
                    <button
                      key={o}
                      className={picked === null ? 'chip' : o === cur.item.answer ? 'chip ok' : picked === o ? 'chip bad' : 'chip'}
                      onClick={() => choose(o)}
                    >
                      {cur.item.options[o]}
                    </button>
                  ))}
                </div>
                {picked !== null && (
                  <>
                    {cur.item.note && <p className="small ok-text">💡 {cur.item.note}</p>}
                    <button className="chip on" onClick={next}>Next →</button>
                  </>
                )}
              </div>
            )
          )}
        </>
      ) : (
        <>
          {/* 4-Archetype Reference Guide */}
          <div
            className="archetype-grid"
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
              gap: '0.8rem',
              marginBottom: '1.2rem',
            }}
          >
            <div className="card-box" style={{ padding: '0.8rem', borderTop: '3px solid var(--ok)' }}>
              <b style={{ color: 'var(--ok)' }}>平板 [0] Heiban</b>
              <div className="small muted">Low → High (flat across particle)</div>
              <div className="small jp" style={{ marginTop: '0.2rem' }}>
                飴が (a-MÉ-GA) · 酒を · 鼻が
              </div>
            </div>
            <div className="card-box" style={{ padding: '0.8rem', borderTop: '3px solid var(--accent)' }}>
              <b style={{ color: 'var(--accent)' }}>頭高 [1] Atamadaka</b>
              <div className="small muted">HIGH on 1st mora → Drops immediately</div>
              <div className="small jp" style={{ marginTop: '0.2rem' }}>
                雨が (Á-me-ga) · 箸で · 白が
              </div>
            </div>
            <div className="card-box" style={{ padding: '0.8rem', borderTop: '3px solid var(--warn, #e67e22)' }}>
              <b style={{ color: 'var(--warn, #e67e22)' }}>中高 [kernel] Nakadaka</b>
              <div className="small muted">Low → High peak → Drops before end</div>
              <div className="small jp" style={{ marginTop: '0.2rem' }}>
                心が (ko-KÓ-ro-ga) · 温みが · 青い
              </div>
            </div>
            <div className="card-box" style={{ padding: '0.8rem', borderTop: '3px solid var(--secondary, #9b59b6)' }}>
              <b style={{ color: 'var(--secondary, #9b59b6)' }}>尾高 [final] Odaka</b>
              <div className="small muted">Low → High on final mora → Drops on particle!</div>
              <div className="small jp" style={{ marginTop: '0.2rem' }}>
                橋を (ha-SHÍ-o) · 花が · 紙に
              </div>
            </div>
          </div>

          {/* Interactive Pitch Accent Homophone Ear Drill */}
          <div className={`drill ${pitchPicked ? (pitchPicked === pitchTargetSide ? 'ok' : 'bad') : ''}`}>
            <div className="row-between" style={{ width: '100%' }}>
              <span className="tag">🎵 PITCH ACCENT &amp; CONTEXT DISCRIMINATION · {activePair.reading}</span>
              <span className="muted small">
                Pair {(pitchIdx % PITCH_PAIRS.length) + 1} / {PITCH_PAIRS.length}
              </span>
            </div>

            <div className="controls center" style={{ margin: '0.8rem 0' }}>
              <button className="mic" aria-label="Play sentence audio" onClick={() => speak(targetPitchWord.sentenceTts)}>
                ▶
              </button>
              <button className="chip" onClick={() => speak(targetPitchWord.sentenceTts, 0.72)}>
                🐢 Slow
              </button>
            </div>

            <p className="nomargin" style={{ fontWeight: 600 }}>
              Press ▶ to hear the sentence. Which word and pitch contour is being used?
            </p>

            <div className="controls center" style={{ marginTop: '0.8rem', gap: '0.9rem' }}>
              {(['A', 'B'] as const).map((side) => {
                const w = side === 'A' ? activePair.wordA : activePair.wordB;
                const isTarget = side === pitchTargetSide;
                const cls = !pitchPicked
                  ? 'chip'
                  : isTarget
                    ? 'chip ok'
                    : pitchPicked === side
                      ? 'chip bad'
                      : 'chip';
                return (
                  <button
                    key={side}
                    className={cls}
                    style={{
                      padding: '0.75rem 1.2rem',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      borderRadius: '14px',
                    }}
                    onClick={() => choosePitchSide(side)}
                  >
                    <b className="jp" style={{ fontSize: '1.35rem' }}>
                      {w.kanji}（{w.kana}） — {w.en}
                    </b>
                    <span className="muted small">{w.patternName}</span>
                    <PitchContourSvg word={w} color={side === 'A' ? 'var(--accent)' : 'var(--ok)'} />
                  </button>
                );
              })}
            </div>

            {pitchPicked && (
              <div style={{ marginTop: '0.8rem', textAlign: 'center' }}>
                <p className="jp" style={{ fontSize: '1.25rem', margin: '0.2rem 0' }}>
                  「{targetPitchWord.sentenceJp}」 ({targetPitchWord.sentenceEn})
                </p>
                <p className="small ok-text nomargin">💡 {activePair.tip}</p>
                <div className="controls center" style={{ marginTop: '0.7rem' }}>
                  <button className="chip on" onClick={nextPitchDrill}>
                    Next Homophone Drill →
                  </button>
                </div>
              </div>
            )}
          </div>

          <h2>Tokyo Pitch Accent Minimal-Pair Reference ({PITCH_PAIRS.length} Pairs)</h2>
          <div className="story-list">
            {PITCH_PAIRS.map((pair) => {
              const srsId = `pitch:${pair.id}`;
              return (
                <div key={pair.id} className="gp">
                  <div className="row-between">
                    <b className="jp" style={{ fontSize: '1.15rem', color: 'var(--accent)' }}>
                      {pair.reading}
                    </b>
                    <button
                      className={srs[srsId] ? 'chip ok' : 'chip'}
                      disabled={!!srs[srsId]}
                      onClick={() =>
                        addCard({
                          id: srsId,
                          kind: 'word',
                          front: `${pair.wordA.kanji} [1] vs. ${pair.wordB.kanji} [0/2] (${pair.wordA.kana})`,
                          reading: pair.wordA.kana,
                          back: `${pair.wordA.kanji} (${pair.wordA.en}: ${pair.wordA.patternName}) vs. ${pair.wordB.kanji} (${pair.wordB.en}: ${pair.wordB.patternName})`,
                        })
                      }
                    >
                      {srs[srsId] ? '✓ Pair in SRS' : '+ Add Pair to SRS'}
                    </button>
                  </div>

                  <div className="two-col" style={{ marginTop: '0.6rem', gap: '1rem' }}>
                    {[pair.wordA, pair.wordB].map((w, idxSide) => (
                      <div
                        key={w.kanji}
                        style={{
                          background: 'var(--surface2)',
                          padding: '0.8rem 1rem',
                          borderRadius: '10px',
                          borderLeft: `3px solid ${idxSide === 0 ? 'var(--accent)' : 'var(--ok)'}`,
                        }}
                      >
                        <div className="row-between">
                          <b
                            className="jp"
                            style={{ fontSize: '1.25rem', cursor: 'pointer' }}
                            onClick={() => speak(w.sentenceTts)}
                          >
                            🔊 {w.kanji}（{w.kana}） — {w.en}
                          </b>
                          <span className="tag">{w.patternName}</span>
                        </div>
                        <PitchContourSvg word={w} color={idxSide === 0 ? 'var(--accent)' : 'var(--ok)'} />
                        <p
                          className="jp small nomargin"
                          style={{ cursor: 'pointer' }}
                          onClick={() => speak(w.sentenceTts)}
                        >
                          🔊 {w.sentenceJp}
                        </p>
                        <div className="muted small">{w.sentenceEn}</div>
                      </div>
                    ))}
                  </div>
                  <p className="muted small" style={{ marginTop: '0.5rem', marginBottom: 0 }}>
                    💡 {pair.tip}
                  </p>
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
