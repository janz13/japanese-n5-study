import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Rating, type Grade } from 'ts-fsrs';
import { toHiragana } from 'wanakana';
import { isDue, useStore, type CardKind, type SrsItem } from '../lib/store';
import { speak } from '../lib/tts';
import { playDing, playMiss } from '../lib/sfx';
import { STORIES } from '../data/stories';
import { LESSONS } from '../data/grammar';

type ReviewMode = 'recognition' | 'recall' | 'audio';

function matchesCardRecall(input: string, item: SrsItem): boolean {
  const clean = input.trim().toLowerCase().replace(/\s+/g, '');
  if (!clean) return false;
  const hira = toHiragana(clean);
  const frontClean = item.front.trim().toLowerCase();
  const readingParts = (item.reading ?? '')
    .split(/[ /、・,()（）]/)
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean);

  if (clean === frontClean || hira === frontClean) return true;
  if (readingParts.some((r) => r === clean || r === hira)) return true;
  return false;
}

export default function Review() {
  const { srs, reviewCard, removeCard, saveWord, addCard, sfxEnabled } = useStore();
  // Snapshot the queue at session start so cards don't reshuffle mid-review.
  const [queue, setQueue] = useState(() =>
    Object.values(srs).filter((i) => isDue(i)).sort(() => Math.random() - 0.5).map((i) => i.id),
  );
  const [reviewMode, setReviewMode] = useState<ReviewMode>('recognition');
  const [flipped, setFlipped] = useState(false);
  const [typedInput, setTypedInput] = useState('');
  const [typedResult, setTypedResult] = useState<'ok' | 'bad' | null>(null);
  const [done, setDone] = useState(0);

  // Deck Browser state
  const [showBrowser, setShowBrowser] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [kindFilter, setKindFilter] = useState<'all' | CardKind | 'leech'>('all');

  const isLeechOrHard = (c: SrsItem) =>
    (c.card.lapses ?? 0) > 0 || (c.card.difficulty ?? 0) >= 6.0 || c.id.startsWith('exam:');

  const items = Object.values(srs);
  const total = items.length;
  const counts = {
    kanji: items.filter((i) => i.kind === 'kanji').length,
    word: items.filter((i) => i.kind === 'word').length,
    grammar: items.filter((i) => i.kind === 'grammar').length,
    leech: items.filter(isLeechOrHard).length,
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

  const speakCurrentItem = (targetItem: SrsItem | null = item) => {
    if (!targetItem) return;
    speak(targetItem.reading?.split(/[ /、]/)[0] || targetItem.front);
  };

  // Auto-play audio when in Audio-Only mode and a new card appears
  useEffect(() => {
    if (item && !flipped && reviewMode === 'audio') {
      speakCurrentItem(item);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [item?.id, reviewMode, flipped]);

  const grade = (g: Grade) => {
    if (!item) return;
    reviewCard(item.id, g);
    setQueue((q) => (g === Rating.Again ? [...q.slice(1), q[0]] : q.slice(1)));
    setFlipped(false);
    setTypedInput('');
    setTypedResult(null);
    setDone((d) => d + 1);
  };

  const flipCard = () => {
    if (!item || flipped) return;
    setFlipped(true);
    speakCurrentItem(item);
  };

  const checkRecallInput = () => {
    if (!item) return;
    const ok = matchesCardRecall(typedInput, item);
    setTypedResult(ok ? 'ok' : 'bad');
    if (sfxEnabled) (ok ? playDing : playMiss)();
    setFlipped(true);
    speakCurrentItem(item);
  };

  // Global keyboard shortcuts (Space to flip, 1-4 to grade, R to replay audio)
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement)?.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA') return;
      if (!item || showBrowser) return;

      if (e.code === 'Space' && !flipped) {
        e.preventDefault();
        flipCard();
      } else if (e.key.toLowerCase() === 'r') {
        e.preventDefault();
        speakCurrentItem(item);
      } else if (flipped) {
        if (e.key === '1') grade(Rating.Again);
        else if (e.key === '2') grade(Rating.Hard);
        else if (e.key === '3') grade(Rating.Good);
        else if (e.key === '4') grade(Rating.Easy);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [item, flipped, showBrowser]);

  const filteredBrowserItems = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return items.filter((c) => {
      if (kindFilter === 'leech') {
        if (!isLeechOrHard(c)) return false;
      } else if (kindFilter !== 'all' && c.kind !== kindFilter) {
        return false;
      }
      if (!q) return true;
      return (
        c.front.toLowerCase().includes(q) ||
        (c.reading ?? '').toLowerCase().includes(q) ||
        c.back.toLowerCase().includes(q)
      );
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [items, kindFilter, searchQuery]);

  const cramFilteredCards = () => {
    if (!filteredBrowserItems.length) return;
    setQueue(filteredBrowserItems.map((c) => c.id));
    setFlipped(false);
    setTypedInput('');
    setTypedResult(null);
    setShowBrowser(false);
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

  return (
    <div className="page">
      <div className="row-between">
        <div>
          <h1 className="nomargin">
            復習 <span className="muted">FSRS Review · {queue.length} due</span>
          </h1>
          <p className="muted small nomargin" style={{ marginTop: '0.15rem' }}>
            {counts.kanji} Kanji · {counts.word} Vocab · {counts.grammar} Grammar · Hotkeys: Space (Flip), 1–4 (Grade), R (Audio)
          </p>
        </div>
        <div className="controls">
          <button className={showBrowser ? 'chip on' : 'chip'} onClick={() => setShowBrowser((b) => !b)}>
            🗂️ {showBrowser ? 'Hide Deck Browser' : `Browse Deck (${total})`}
          </button>
        </div>
      </div>

      {/* 3 Review Modes Switcher */}
      <div className="controls" style={{ marginTop: '0.8rem' }}>
        <button
          className={reviewMode === 'recognition' ? 'chip on' : 'chip'}
          onClick={() => {
            setReviewMode('recognition');
            setFlipped(false);
          }}
        >
          📖 Recognition (JP → EN)
        </button>
        <button
          className={reviewMode === 'recall' ? 'chip on' : 'chip'}
          onClick={() => {
            setReviewMode('recall');
            setFlipped(false);
          }}
        >
          ✍️ Recall Typing (EN → JP)
        </button>
        <button
          className={reviewMode === 'audio' ? 'chip on' : 'chip'}
          onClick={() => {
            setReviewMode('audio');
            setFlipped(false);
          }}
        >
          🎧 Audio-Only (Ears → Meaning)
        </button>
      </div>

      {/* Searchable Deck Browser Drawer */}
      {showBrowser && (
        <div className="gp" style={{ margin: '1rem 0', padding: '1rem 1.2rem' }}>
          <div className="row-between">
            <b>🗂️ SRS Deck Browser ({filteredBrowserItems.length} / {total} cards)</b>
            <div className="controls nomargin">
              {(['all', 'kanji', 'word', 'grammar', 'leech'] as const).map((k) => (
                <button key={k} className={kindFilter === k ? 'chip on' : 'chip'} onClick={() => setKindFilter(k)}>
                  {k === 'all' ? 'All' : k === 'leech' ? `🔥 Leech / Hard (${counts.leech})` : k.toUpperCase()}
                </button>
              ))}
            </div>
          </div>
          <div className="controls" style={{ marginTop: '0.6rem' }}>
            <input
              type="search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search Japanese, reading, or English meaning…"
              className="search-input"
            />
            {filteredBrowserItems.length > 0 && (
              <button className="chip on" onClick={cramFilteredCards}>
                🎯 Drill These {filteredBrowserItems.length} Cards Now
              </button>
            )}
          </div>
          <div style={{ maxHeight: '300px', overflowY: 'auto', display: 'grid', gap: '0.45rem', marginTop: '0.6rem' }}>
            {filteredBrowserItems.map((c) => {
              const lapses = c.card.lapses ?? 0;
              const isHard = isLeechOrHard(c);
              return (
                <div
                  key={c.id}
                  className="row-between"
                  style={{
                    background: 'var(--surface2)',
                    padding: '0.5rem 0.85rem',
                    borderRadius: '10px',
                    borderLeft: isHard ? '3px solid var(--bad)' : undefined,
                  }}
                >
                  <div style={{ flex: 1 }}>
                    <span className="tag" style={{ marginRight: '0.45rem' }}>{c.kind}</span>
                    {isHard && (
                      <span className="tag" style={{ marginRight: '0.45rem', color: 'var(--bad)' }}>
                        🔥 {lapses > 0 ? `${lapses} lapse${lapses > 1 ? 's' : ''}` : c.id.startsWith('exam:') ? 'Missed Exam' : 'Hard'}
                      </span>
                    )}
                    <b className="jp" style={{ cursor: 'pointer' }} onClick={() => speakCurrentItem(c)}>
                      🔊 {c.front}
                    </b>
                    {c.reading && <span className="muted small"> ({c.reading})</span>}
                    <div className="muted small">{c.back}</div>
                  </div>
                  <button
                    className="chip"
                    style={{ padding: '0.2rem 0.55rem', fontSize: '0.75rem' }}
                    title="Remove card from SRS deck"
                    onClick={() => {
                      removeCard(c.id);
                      setQueue((q) => q.filter((id) => id !== c.id));
                    }}
                  >
                    ✕
                  </button>
                </div>
              );
            })}
            {filteredBrowserItems.length === 0 && (
              <p className="muted small center" style={{ padding: '0.8rem 0' }}>
                {kindFilter === 'leech'
                  ? 'No leech or missed-exam cards yet! Cards you grade "Again" or export from missed exam questions appear here.'
                  : 'No cards match your filter.'}
              </p>
            )}
          </div>
        </div>
      )}

      {!item ? (
        <div className="card-box center">
          <div className="big-emoji">🎉</div>
          <p>All caught up! {done ? `${done} reviews done.` : ''}</p>
          {nextDue && <p className="muted">Next card due {nextDue.toLocaleString()}</p>}
          <div className="controls">
            <button className="chip on" onClick={refreshQueue}>Refresh Queue</button>
            {counts.leech > 0 && (
              <button
                className="chip"
                onClick={() => {
                  const leechIds = items.filter(isLeechOrHard).map((c) => c.id);
                  setQueue(leechIds);
                }}
              >
                🔥 Cram {counts.leech} Leech / Missed Cards
              </button>
            )}
            {counts.word === 0 && (
              <button className="chip" onClick={seedVocabAndGrammar}>+ Add Story Vocab &amp; Grammar</button>
            )}
          </div>
        </div>
      ) : (
        <>
          <div
            className="card-box"
            onClick={() => reviewMode !== 'recall' && !flipped && flipCard()}
          >
            <div className="row-between" style={{ width: '100%' }}>
              <span className="tag">{item.kind} · {reviewMode.toUpperCase()}</span>
              <button
                type="button"
                className="chip"
                style={{ padding: '0.25rem 0.7rem', fontSize: '0.8rem' }}
                onClick={(e) => {
                  e.stopPropagation();
                  speakCurrentItem(item);
                }}
              >
                🔊 Replay Audio <kbd className="kbd-badge">R</kbd>
              </button>
            </div>

            {/* Front of Card */}
            {reviewMode === 'recognition' && (
              <div
                className="card-front"
                style={item.front.length > 6 ? { fontSize: 'clamp(1.35rem, 3.2vw, 2.1rem)', lineHeight: 1.45 } : undefined}
              >
                {item.front}
              </div>
            )}

            {reviewMode === 'recall' && (
              <>
                <div className="card-meaning" style={{ fontSize: '1.45rem', fontWeight: 600 }}>
                  {item.back}
                </div>
                {!flipped && (
                  <div
                    className="controls center"
                    style={{ marginTop: '0.6rem' }}
                    onClick={(e) => e.stopPropagation()}
                  >
                    <input
                      autoFocus
                      value={typedInput}
                      onChange={(e) => setTypedInput(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && checkRecallInput()}
                      placeholder="Type Japanese or romaji…"
                      className="drill-input"
                      style={{ width: '240px', fontSize: '1.25rem' }}
                    />
                    <button className="chip on" onClick={checkRecallInput}>
                      Check
                    </button>
                  </div>
                )}
              </>
            )}

            {reviewMode === 'audio' && !flipped && (
              <div style={{ margin: '1.2rem 0' }}>
                <div style={{ fontSize: '3.2rem' }}>🎧</div>
                <p className="muted nomargin">Listen carefully and recall the meaning</p>
              </div>
            )}

            {/* Back of Card */}
            {flipped ? (
              <div className="card-back" style={{ marginTop: '0.6rem' }}>
                {typedResult && (
                  <div className={typedResult === 'ok' ? 'ok-text small' : 'bad-text small'}>
                    {typedResult === 'ok' ? '✓ Exact Recall Match!' : `✗ You typed "${typedInput || '—'}"`}
                  </div>
                )}
                {(reviewMode === 'recall' || reviewMode === 'audio') && (
                  <div className="jp" style={{ fontSize: '2.1rem', fontWeight: 600 }}>
                    {item.front}
                  </div>
                )}
                {item.reading && <div className="muted jp">{item.reading}</div>}
                {reviewMode !== 'recall' && <div className="card-meaning">{item.back}</div>}
              </div>
            ) : (
              reviewMode !== 'recall' && (
                <div className="muted">
                  Tap or press <kbd className="kbd-badge">Space</kbd> to reveal
                </div>
              )
            )}
          </div>

          {flipped && (
            <div className="grade-row">
              <button className="grade again" onClick={() => grade(Rating.Again)}>
                <kbd className="kbd-badge">1</kbd>Again
              </button>
              <button className="grade hard" onClick={() => grade(Rating.Hard)}>
                <kbd className="kbd-badge">2</kbd>Hard
              </button>
              <button className="grade good" onClick={() => grade(Rating.Good)}>
                <kbd className="kbd-badge">3</kbd>Good
              </button>
              <button className="grade easy" onClick={() => grade(Rating.Easy)}>
                <kbd className="kbd-badge">4</kbd>Easy
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
