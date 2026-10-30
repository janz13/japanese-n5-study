import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Rating, type Grade } from 'ts-fsrs';
import { isDue, useStore } from '../lib/store';
import { speak } from '../lib/tts';

export default function Review() {
  const { srs, reviewCard } = useStore();
  // Snapshot the queue at session start so cards don't reshuffle mid-review.
  const [queue, setQueue] = useState(() =>
    Object.values(srs).filter((i) => isDue(i)).sort(() => Math.random() - 0.5).map((i) => i.id),
  );
  const [flipped, setFlipped] = useState(false);
  const [done, setDone] = useState(0);

  const total = Object.keys(srs).length;
  const nextDue = useMemo(() => {
    const times = Object.values(srs).map((i) => new Date(i.card.due).getTime());
    return times.length ? new Date(Math.min(...times)) : null;
  }, [srs]);

  const item = queue.length ? srs[queue[0]] : null;

  const grade = (g: Grade) => {
    reviewCard(item!.id, g);
    // "Again" puts the card back at the end of this session
    setQueue((q) => (g === Rating.Again ? [...q.slice(1), q[0]] : q.slice(1)));
    setFlipped(false);
    setDone((d) => d + 1);
  };

  if (!total)
    return (
      <div className="page">
        <h1>復習 <span className="muted">Review</span></h1>
        <p>Your deck is empty. Add kanji from the <Link to="/kanji" className="link">Kanji</Link> page, or tap words in a <Link to="/stories" className="link">story</Link> and save them.</p>
      </div>
    );

  if (!item)
    return (
      <div className="page">
        <h1>復習 <span className="muted">Review</span></h1>
        <div className="card-box center">
          <div className="big-emoji">🎉</div>
          <p>All caught up! {done ? `${done} reviews done.` : ''}</p>
          {nextDue && <p className="muted">Next card due {nextDue.toLocaleString()}</p>}
          <button className="chip" onClick={() => setQueue(Object.values(srs).filter((i) => isDue(i)).map((i) => i.id))}>Refresh</button>
        </div>
      </div>
    );

  return (
    <div className="page">
      <h1>復習 <span className="muted">Review · {queue.length} left</span></h1>
      <div className="card-box" onClick={() => !flipped && (setFlipped(true), speak(item.reading?.split(/[ /、]/)[0] || item.front))}>
        <span className="tag">{item.kind}</span>
        <div className="card-front">{item.front}</div>
        {flipped ? (
          <div className="card-back">
            {item.reading && <div className="muted">{item.reading}</div>}
            <div className="card-meaning">{item.back}</div>
          </div>
        ) : (
          <div className="muted">Tap to reveal</div>
        )}
      </div>
      {flipped && (
        <div className="grade-row">
          <button className="grade again" onClick={() => grade(Rating.Again)}>Again</button>
          <button className="grade hard" onClick={() => grade(Rating.Hard)}>Hard</button>
          <button className="grade good" onClick={() => grade(Rating.Good)}>Good</button>
          <button className="grade easy" onClick={() => grade(Rating.Easy)}>Easy</button>
        </div>
      )}
    </div>
  );
}
