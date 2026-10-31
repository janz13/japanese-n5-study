import { useMemo, useState } from 'react';
import { SIGN_CATEGORIES, SIGNS, type SignCategory } from '../data/signs';
import { useStore } from '../lib/store';
import { speak } from '../lib/tts';
import { playDing, playMiss } from '../lib/sfx';

/** Shuffle options so the correct answer isn't always first. */
function shuffled<T>(arr: T[]) {
  const a = arr.map((v, i) => ({ v, i, r: Math.random() }));
  return a.sort((x, y) => x.r - y.r);
}

export default function SignDecoder() {
  const sfx = useStore((s) => s.sfxEnabled);
  const [cat, setCat] = useState<SignCategory | 'all'>('all');
  const [choices, setChoices] = useState<Record<string, number>>({});

  const list = useMemo(() => SIGNS.filter((s) => cat === 'all' || s.category === cat), [cat]);
  const order = useMemo(() => Object.fromEntries(SIGNS.map((s) => [s.id, shuffled(s.options)])), []);
  const solved = SIGNS.filter((s) => choices[s.id] === s.answer).length;

  const answer = (id: string, idx: number, correct: number) => {
    if (id in choices) return;
    setChoices((c) => ({ ...c, [id]: idx }));
    if (sfx) (idx === correct ? playDing : playMiss)();
  };

  return (
    <div className="page">
      <h1>看板 <span className="muted">Sign &amp; Menu Decoder</span></h1>
      <p className="muted">
        Real signs you will meet in Japan. Tap a sign to hear it. Decoded this session: {solved}/{SIGNS.length}
      </p>
      <div className="controls">
        <button className={cat === 'all' ? 'chip on' : 'chip'} onClick={() => setCat('all')}>All ({SIGNS.length})</button>
        {(Object.keys(SIGN_CATEGORIES) as SignCategory[]).map((c) => (
          <button key={c} className={cat === c ? 'chip on' : 'chip'} onClick={() => setCat(c)}>
            {SIGN_CATEGORIES[c]} ({SIGNS.filter((s) => s.category === c).length})
          </button>
        ))}
        <button className="chip" onClick={() => setChoices({})}>↺ Reset</button>
      </div>

      {list.map((s) => {
        const picked = choices[s.id];
        return (
          <div key={s.id} className="gp">
            <span className="tag">{s.place}</span>
            <div className="sign-board jp" style={{ margin: '0.6rem 0', fontSize: '1.4rem', cursor: 'pointer' }} onClick={() => speak(s.reading)}>
              🔊 {s.sign}
            </div>
            {picked !== undefined && <p className="muted small nomargin">{s.reading}</p>}
            <p>{s.question}</p>
            <div className="controls">
              {order[s.id].map(({ v, i }) => (
                <button
                  key={i}
                  className={picked === undefined ? 'chip' : i === s.answer ? 'chip ok' : picked === i ? 'chip bad' : 'chip'}
                  onClick={() => answer(s.id, i, s.answer)}
                >
                  {v}
                </button>
              ))}
            </div>
            {picked !== undefined && <p className="small ok-text">💡 {s.note}</p>}
          </div>
        );
      })}
    </div>
  );
}
