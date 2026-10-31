import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Rating, type Grade } from 'ts-fsrs';
import { isDue, useStore } from '../lib/store';
import { speak } from '../lib/tts';
import { STORIES } from '../data/stories';
import { LESSONS } from '../data/grammar';

export default function Review() {
  const { srs, reviewCard, saveWord, addCard } = useStore();
  // Snapshot the queue at session start so cards don't reshuffle mid-review.
  const [queue, setQueue] = useState(() =>
    Object.values(srs).filter((i) => isDue(i)).sort(() => Math.random() - 0.5).map((i) => i.id),
  );
  const [flipped, setFlipped] = useState(false);
  const [done, setDone] = useState(0);

  const items = Object.values(srs);
  const total = items.length;
  const counts = {
    kanji: items.filter((i) => i.kind === 'kanji').length,
    word: items.filter((i) => i.kind === 'word').length,
    grammar: items.filter((i) => i.kind === 'grammar').length,
  };

  const nextDue = useMemo(() => {
    const times = Object.values(srs).map((i) => new Date(i.card.due).getTime());
    return times.length ? new Date(Math.min(...times)) : null;
  }, [srs]);

  const refreshQueue = () =>
    setQueue(
      Object.values(useStore.getState().srs)
        .filter((i) => isDue(i))
        .sort(() => Math.random() - 0.5)
        .map((i) => i.id),
    );

  const seedVocabAndGrammar = () => {
    STORIES.forEach((s) => s.paragraphs.forEach((p) => p.forEach((t) => t.en && saveWord(t))));
    LESSONS.forEach((l) =>
      l.points.forEach((pt) =>
        addCard({
          id: `g:${pt.pattern}`,
          kind: 'grammar',
          front: pt.pattern,
          reading: pt.examples[0]?.jp,
          back: `${pt.meaning} — ${pt.explain}`,
        }),
      ),
    );
    refreshQueue();
  };

  const item = queue.length ? srs[queue[0]] : null;

  const grade = (g: Grade) => {
    reviewCard(item!.id, g);
    setQueue((q) => (g === Rating.Again ? [...q.slice(1), q[0]] : q.slice(1)));
    setFlipped(false);
    setDone((d) => d + 1);
  };

  if (!total)
    return (
      <div className="page">
        <h1>復習 <span className="muted">Review</span></h1>
        <p>
          Your SRS deck is empty. Add items from <Link to="/kanji" className="link">Kanji</Link>,{' '}
          <Link to="/grammar" className="link">Grammar</Link>, or <Link to="/stories" className="link">Stories</Link> — or load the starter vocabulary &amp; grammar pack below:
        </p>
        <div className="controls">
          <button className="chip on" onClick={seedVocabAndGrammar}>
            + Load Story Vocab &amp; Grammar Deck
          </button>
          <Link className="chip" to="/kanji">Browse Kanji →</Link>
        </div>
      </div>
    );

  if (!item)
    return (
      <div className="page">
        <h1>復習 <span className="muted">Review</span></h1>
        <p className="muted small">
          Deck: {counts.kanji} Kanji · {counts.word} Vocab · {counts.grammar} Grammar
        </p>
        <div className="card-box center">
          <div className="big-emoji">🎉</div>
          <p>All caught up! {done ? `${done} reviews done.` : ''}</p>
          {nextDue && <p className="muted">Next card due {nextDue.toLocaleString()}</p>}
          <div className="controls">
            <button className="chip on" onClick={refreshQueue}>Refresh Queue</button>
            {counts.word === 0 && (
              <button className="chip" onClick={seedVocabAndGrammar}>+ Add Story Vocab &amp; Grammar</button>
            )}
          </div>
        </div>
      </div>
    );

  return (
    <div className="page">
      <div className="row-between">
        <h1>復習 <span className="muted">Review · {queue.length} left</span></h1>
        <span className="muted small">
          {counts.kanji} Kanji · {counts.word} Vocab · {counts.grammar} Grammar
        </span>
      </div>
      <div
        className="card-box"
        onClick={() => !flipped && (setFlipped(true), speak(item.reading?.split(/[ /、]/)[0] || item.front))}
      >
        <span className="tag">{item.kind}</span>
        <div
          className="card-front"
          style={item.front.length > 6 ? { fontSize: 'clamp(1.35rem, 3.2vw, 2.1rem)', lineHeight: 1.45 } : undefined}
        >
          {item.front}
        </div>
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
