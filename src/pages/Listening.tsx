import { useMemo, useState } from 'react';
import { LISTENING, LISTENING_TYPES, type ListeningItem } from '../data/listening';
import { useStore } from '../lib/store';
import { speak } from '../lib/tts';
import { playDing, playFanfare, playMiss } from '../lib/sfx';

type Kind = ListeningItem['type'];
const ROUND = 10;

function buildRound(kind: Kind | 'all') {
  const pool = LISTENING.filter((i) => kind === 'all' || i.type === kind);
  return [...pool]
    .sort(() => Math.random() - 0.5)
    .slice(0, ROUND)
    .map((item) => ({ item, order: item.options.map((_, i) => i).sort(() => Math.random() - 0.5) }));
}

export default function Listening() {
  const sfx = useStore((s) => s.sfxEnabled);
  const [kind, setKind] = useState<Kind | 'all'>('all');
  const [seed, setSeed] = useState(0);
  const round = useMemo(() => buildRound(kind), [kind, seed]);
  const [idx, setIdx] = useState(0);
  const [picked, setPicked] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [showText, setShowText] = useState(false);

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
    if (n >= round.length && sfx) playFanfare();
  };

  return (
    <div className="page">
      <h1>聴解 <span className="muted">Listening Drills</span></h1>
      <p className="muted">JLPT N5-style quick-response listening. Press play, then choose — no peeking at the text!</p>
      <div className="controls">
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
            {(showText || picked !== null) && <p className="jp center" style={{ fontSize: '1.2rem' }}>{cur.item.transcript}</p>}
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
    </div>
  );
}
