import { useEffect, useRef, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { LESSONS, type Exercise } from '../data/grammar';
import { PASS, useStore } from '../lib/store';
import { lessonUnlocked } from '../lib/progress';
import { speak } from '../lib/tts';
import { playFanfare } from '../lib/sfx';
import { useCampaignMission } from '../lib/useCampaignMission';
import CampaignBanner from '../components/CampaignBanner';

export function GrammarList() {
  const p = useStore();
  const { isCampaignMode, stage, saga, returnToCampaign } = useCampaignMission();
  const { srs, addCard } = p;
  const allPoints = LESSONS.flatMap((l) => l.points);
  const inDeck = allPoints.filter((pt) => srs[`g:${pt.pattern}`]).length;

  const addAllGrammar = () =>
    allPoints.forEach((pt) =>
      addCard({
        id: `g:${pt.pattern}`,
        kind: 'grammar',
        front: pt.pattern,
        reading: pt.examples[0]?.jp,
        back: `${pt.meaning} — ${pt.explain}`,
      }),
    );

  return (
    <div className="page">
      {isCampaignMode && stage && (
        <CampaignBanner stage={stage} saga={saga} onReturn={returnToCampaign} />
      )}
      <h1>文法 <span className="muted">Grammar</span></h1>
      <p className="muted">Each lesson unlocks the next story chapter (pass with {PASS}%+).</p>
      <div className="controls">
        <span className="muted">{inDeck}/{allPoints.length} grammar points in SRS deck</span>
        {inDeck < allPoints.length && (
          <button className="chip on" onClick={addAllGrammar}>
            + Add all grammar to review
          </button>
        )}
      </div>
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
          <button
            key={n}
            className="chip on"
            disabled={checked !== null}
            onClick={() => setPicked((p) => p.filter((_, k) => k !== n))}
          >
            {ex.tokens[i]}
          </button>
        ))}
        {!picked.length && <span className="muted">Tap the words in order…</span>}
      </div>
      <div className="controls">
        {pool
          .filter((x) => !picked.includes(x.i))
          .map((x) => (
            <button key={x.i} className="chip" onClick={() => setPicked((p) => [...p, x.i])}>
              {x.t}
            </button>
          ))}
      </div>
      {picked.length === ex.tokens.length && checked === null && (
        <button
          className="chip on"
          onClick={() => {
            const ok = answer === ex.tokens.join('');
            setChecked(ok);
            speak(ex.tokens.join(''));
            onAnswer(ok);
          }}
        >
          Check
        </button>
      )}
      {checked === false && <p className="bad-text">✗ {ex.tokens.join(' ')}</p>}
      {checked && <p className="ok-text">✓ Correct</p>}
    </div>
  );
}

export function GrammarLesson() {
  const { id } = useParams();
  const lesson = LESSONS.find((l) => l.id === id);
  const { completeLesson, srs, addCard, sfxEnabled } = useStore();
  const {
    isCampaignMode,
    stage,
    saga,
    completeMission,
    returnToCampaign,
  } = useCampaignMission();
  const [answers, setAnswers] = useState<Record<number, boolean>>({});
  const [mcq, setMcq] = useState<Record<number, number>>({});
  const [saved, setSaved] = useState(false);
  const campaignCompletedRef = useRef(false);

  const n = lesson?.exercises.length ?? 0;
  const doneAll = lesson ? Object.keys(answers).length === n : false;
  const score = n > 0 ? Math.round((Object.values(answers).filter(Boolean).length / n) * 100) : 0;

  useEffect(() => {
    if (isCampaignMode && doneAll && score >= PASS && !campaignCompletedRef.current) {
      campaignCompletedRef.current = true;
      completeMission();
      if (sfxEnabled) playFanfare();
    }
  }, [isCampaignMode, doneAll, score, completeMission, sfxEnabled]);

  if (!lesson) return <div className="page">Not found. <Link to="/grammar">Back</Link></div>;

  return (
    <div className="page">
      {isCampaignMode && stage && (
        <CampaignBanner stage={stage} saga={saga} onReturn={returnToCampaign} />
      )}
      <Link to="/grammar" className="muted">← Grammar</Link>
      <h1>{lesson.title}</h1>
      {lesson.points.map((pt) => {
        const cardId = `g:${pt.pattern}`;
        const inDeck = !!srs[cardId];
        return (
          <div key={pt.pattern} className="gp">
            <div className="row-between">
              <div className="gp-head">
                <b className="jp">{pt.pattern}</b>
                <span className="muted">{pt.meaning}</span>
              </div>
              <button
                className="chip"
                disabled={inDeck}
                onClick={() =>
                  addCard({
                    id: cardId,
                    kind: 'grammar',
                    front: pt.pattern,
                    reading: pt.examples[0]?.jp,
                    back: `${pt.meaning} — ${pt.explain}`,
                  })
                }
              >
                {inDeck ? '✓ In SRS' : '+ Add to SRS'}
              </button>
            </div>
            <p>{pt.explain}</p>
            {pt.examples.map((e) => (
              <p key={e.jp} className="example" onClick={() => speak(e.audio ?? e.jp)}>
                🔊 <span className="jp">{e.jp}</span> <span className="muted">— {e.en}</span>
              </p>
            ))}
          </div>
        );
      })}

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
                    <button
                      key={j}
                      className={cls}
                      disabled={chosen !== undefined}
                      onClick={() => {
                        setMcq((m) => ({ ...m, [i]: j }));
                        setAnswers((a) => ({ ...a, [i]: j === ex.answer }));
                      }}
                    >
                      {o}
                    </button>
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
            <button className="chip on" onClick={() => { completeLesson(lesson.id, score); setSaved(true); }}>
              Save result
            </button>
          ) : score >= PASS ? (
            <div style={{ display: 'inline-flex', gap: '0.6rem', flexWrap: 'wrap', alignItems: 'center' }}>
              {isCampaignMode && (
                <button
                  type="button"
                  className="chip on"
                  style={{
                    background: 'var(--accent)',
                    color: '#000',
                    fontWeight: 700,
                    cursor: 'pointer',
                  }}
                  onClick={returnToCampaign}
                >
                  🗺️ Return to Campaign Map →
                </button>
              )}
              <Link className={isCampaignMode ? 'chip' : 'chip on'} to="/stories">Go to Ch.{lesson.chapter} story →</Link>
            </div>
          ) : (
            <button className="chip" onClick={() => location.reload()}>Retry</button>
          )}

          {isCampaignMode && score >= PASS && !saved && (
            <button
              type="button"
              className="chip on"
              style={{
                marginLeft: '0.6rem',
                background: 'var(--accent)',
                color: '#000',
                fontWeight: 700,
                cursor: 'pointer',
              }}
              onClick={returnToCampaign}
            >
              🗺️ Return to Campaign Map →
            </button>
          )}
        </div>
      )}
    </div>
  );
}
