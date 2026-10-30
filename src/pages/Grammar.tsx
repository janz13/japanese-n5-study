import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { LESSONS, type Exercise } from '../data/grammar';
import { PASS, useStore } from '../lib/store';
import { lessonUnlocked } from '../lib/progress';
import { speak } from '../lib/tts';

export function GrammarList() {
  const p = useStore();
  return (
    <div className="page">
      <h1>文法 <span className="muted">Grammar</span></h1>
      <p className="muted">Each lesson unlocks the next story chapter (pass with {PASS}%+).</p>
      <div className="story-list">
        {LESSONS.map((l) => {
          const open = lessonUnlocked(l.chapter, p);
          const score = p.grammarDone[l.id];
          return open ? (
            <Link key={l.id} to={`/grammar/${l.id}`} className="story-card">
              <span className="tag">Lesson {l.chapter} → unlocks Ch.{l.chapter}</span>
              <span className="story-title small-title">{l.title}</span>
              <span className="muted">{l.points.map((x) => x.pattern).join(' · ')}</span>
              {score !== undefined && <span className={score >= PASS ? 'done' : 'done bad-text'}>{score}%</span>}
            </Link>
          ) : (
            <div key={l.id} className="story-card locked">
              <span className="tag">Lesson {l.chapter}</span>
              <span className="story-title small-title">🔒 {l.title}</span>
              <span className="muted">Finish the Ch.{l.chapter - 1} story first</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

const shuffle = <T,>(a: T[]) => {
  const b = [...a];
  for (let i = b.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [b[i], b[j]] = [b[j], b[i]];
  }
  // avoid presenting an already-solved order
  return b.join() === a.join() && a.length > 1 ? [...b.slice(1), b[0]] : b;
};

function OrderEx({ ex, onAnswer }: { ex: Extract<Exercise, { type: 'order' }>; onAnswer: (ok: boolean) => void }) {
  const [pool] = useState(() => shuffle(ex.tokens.map((t, i) => ({ t, i }))));
  const [picked, setPicked] = useState<number[]>([]);
  const [checked, setChecked] = useState<boolean | null>(null);
  const answer = picked.map((i) => ex.tokens[i]).join('');

  return (
    <div>
      <p className="muted">{ex.en}</p>
      <div className="order-line">
        {picked.map((i, n) => (
          <button key={n} className="chip on" disabled={checked !== null}
            onClick={() => setPicked((p) => p.filter((_, k) => k !== n))}>{ex.tokens[i]}</button>
        ))}
        {!picked.length && <span className="muted">Tap the words in order…</span>}
      </div>
      <div className="controls">
        {pool.filter((x) => !picked.includes(x.i)).map((x) => (
          <button key={x.i} className="chip" onClick={() => setPicked((p) => [...p, x.i])}>{x.t}</button>
        ))}
      </div>
      {picked.length === ex.tokens.length && checked === null && (
        <button className="chip on" onClick={() => {
          const ok = answer === ex.tokens.join('');
          setChecked(ok);
          speak(ex.tokens.join(''));
          onAnswer(ok);
        }}>Check</button>
      )}
      {checked === false && <p className="bad-text">✗ {ex.tokens.join(' ')}</p>}
      {checked && <p className="ok-text">✓ Correct</p>}
    </div>
  );
}

export function GrammarLesson() {
  const { id } = useParams();
  const lesson = LESSONS.find((l) => l.id === id);
  const { completeLesson } = useStore();
  const [answers, setAnswers] = useState<Record<number, boolean>>({});
  const [mcq, setMcq] = useState<Record<number, number>>({});
  const [saved, setSaved] = useState(false);

  if (!lesson) return <div className="page">Not found. <Link to="/grammar">Back</Link></div>;
  const n = lesson.exercises.length;
  const doneAll = Object.keys(answers).length === n;
  const score = Math.round((Object.values(answers).filter(Boolean).length / n) * 100);

  return (
    <div className="page">
      <Link to="/grammar" className="muted">← Grammar</Link>
      <h1>{lesson.title}</h1>
      {lesson.points.map((pt) => (
        <div key={pt.pattern} className="gp">
          <div className="gp-head"><b className="jp">{pt.pattern}</b><span className="muted">{pt.meaning}</span></div>
          <p>{pt.explain}</p>
          {pt.examples.map((e) => (
            <p key={e.jp} className="example" onClick={() => speak(e.jp)}>🔊 <span className="jp">{e.jp}</span> <span className="muted">— {e.en}</span></p>
          ))}
        </div>
      ))}

      <h2>練習 <span className="muted">Practice</span></h2>
      {lesson.exercises.map((ex, i) => (
        <div key={i} className="question">
          <span className="tag">{i + 1}/{n}</span>
          {ex.type === 'mcq' ? (
            <>
              <p className="jp">{ex.prompt}</p>
              <p className="muted small">{ex.en}</p>
              <div className="controls">
                {ex.options.map((o, j) => {
                  const chosen = mcq[i];
                  const cls = chosen === undefined ? 'chip' : j === ex.answer ? 'chip ok' : chosen === j ? 'chip bad' : 'chip';
                  return (
                    <button key={j} className={cls} disabled={chosen !== undefined}
                      onClick={() => { setMcq((m) => ({ ...m, [i]: j })); setAnswers((a) => ({ ...a, [i]: j === ex.answer })); }}>{o}</button>
                  );
                })}
              </div>
            </>
          ) : (
            <OrderEx ex={ex} onAnswer={(ok) => setAnswers((a) => ({ ...a, [i]: ok }))} />
          )}
        </div>
      ))}
      {doneAll && (
        <div className="result">
          <span>Score: {score}% {score >= PASS ? '— passed!' : `— need ${PASS}% to unlock`}</span>
          {!saved ? (
            <button className="chip on" onClick={() => { completeLesson(lesson.id, score); setSaved(true); }}>Save result</button>
          ) : score >= PASS ? (
            <Link className="chip on" to="/stories">Go to Ch.{lesson.chapter} story →</Link>
          ) : (
            <button className="chip" onClick={() => location.reload()}>Retry</button>
          )}
        </div>
      )}
    </div>
  );
}
