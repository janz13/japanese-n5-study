import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Rating, type Grade } from 'ts-fsrs';
import { toHiragana } from 'wanakana';
import {
  isDue,
  useStore,
  type CardKind,
  type SrsItem,
  type MemoryVectorType,
  MEMORY_VECTORS,
} from '../lib/store';
import { speak } from '../lib/tts';
import { playDing, playMiss } from '../lib/sfx';
import { STORIES } from '../data/stories';
import { LESSONS } from '../data/grammar';

type ReviewMode = 'recognition' | 'recall' | 'audio';

function buildDueQueue(srs: Record<string, SrsItem>, cap: number): string[] {
  const allDue = Object.values(srs).filter((i) => isDue(i));
  const reviewCards = allDue.filter((i) => (i.card.reps ?? 0) > 0 || (i.card.lapses ?? 0) > 0);
  const newCards = allDue.filter((i) => (i.card.reps ?? 0) === 0 && (i.card.lapses ?? 0) === 0);
  const cappedNew = cap > 0 ? newCards.slice(0, cap) : newCards;
  return [...reviewCards, ...cappedNew].sort(() => Math.random() - 0.5).map((i) => i.id);
}

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
  const {
    srs,
    reviewCard,
    removeCard,
    saveWord,
    addCard,
    sfxEnabled,
    suspendCard,
    unsuspendCard,
    dailyNewCardsCap,
    setDailyNewCardsCap,
    recordVectorReview,
    getVectorRetentionMetrics,
    ghosts,
    reviewGhost,
    getDueGhosts,
  } = useStore();
  // Snapshot the queue at session start so cards don't reshuffle mid-review.
  const [queue, setQueue] = useState(() => buildDueQueue(srs, dailyNewCardsCap));
  const [reviewMode, setReviewMode] = useState<ReviewMode>('recognition');
  const [flipped, setFlipped] = useState(false);
  const [typedInput, setTypedInput] = useState('');
  const [typedResult, setTypedResult] = useState<'ok' | 'bad' | null>(null);
  const [done, setDone] = useState(0);
  const [sessionAgain, setSessionAgain] = useState(0);
  const [sessionStart] = useState(() => Date.now());

  // Deck Browser state
  const [showBrowser, setShowBrowser] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [kindFilter, setKindFilter] = useState<'all' | CardKind | 'leech' | 'suspended'>('all');

  // Workload Forecasting & Ghost Queue state
  const [showForecast, setShowForecast] = useState(false);
  const [showGhostQueue, setShowGhostQueue] = useState(false);
  const [activeVector, setActiveVector] = useState<'all' | MemoryVectorType>('all');
  const [activeGhostDrill, setActiveGhostDrill] = useState(false);
  const [ghostIndex, setGhostIndex] = useState(0);
  const [ghostRevealed, setGhostRevealed] = useState(false);
  const [ghostCelebration, setGhostCelebration] = useState<string | null>(null);

  const isLeechOrHard = (c: SrsItem) =>
    !c.suspended && ((c.card.lapses ?? 0) > 0 || (c.card.difficulty ?? 0) >= 6.0 || c.id.startsWith('exam:'));

  const items = Object.values(srs);
  const total = items.length;
  const counts = {
    kanji: items.filter((i) => !i.suspended && i.kind === 'kanji').length,
    word: items.filter((i) => !i.suspended && i.kind === 'word').length,
    grammar: items.filter((i) => !i.suspended && i.kind === 'grammar').length,
    leech: items.filter(isLeechOrHard).length,
    suspended: items.filter((i) => Boolean(i.suspended)).length,
  };

  const nextDue = useMemo(() => {
    const times = Object.values(srs)
      .filter((i) => !i.suspended)
      .map((i) => new Date(i.card.due).getTime());
    return times.length ? new Date(Math.min(...times)) : null;
  }, [srs]);

  const hourlyDistribution = useMemo(() => {
    const bins = new Array(24).fill(0);
    const now = Date.now();
    const allCards = Object.values(srs).filter((i) => !i.suspended);
    for (const item of allCards) {
      const dueTime = new Date(item.card.due).getTime();
      if (dueTime <= now) {
        bins[0]++;
      } else {
        const diffHours = Math.floor((dueTime - now) / (3600 * 1000));
        if (diffHours < 24) {
          bins[diffHours]++;
        }
      }
    }
    return bins;
  }, [srs]);

  const maxHourlyCount = useMemo(() => Math.max(1, ...hourlyDistribution), [hourlyDistribution]);
  const total24hDue = useMemo(() => hourlyDistribution.reduce((a, b) => a + b, 0), [hourlyDistribution]);
  const peakHour = useMemo(() => {
    let peakIdx = 0;
    let peakVal = 0;
    hourlyDistribution.forEach((val, idx) => {
      if (val > peakVal) {
        peakVal = val;
        peakIdx = idx;
      }
    });
    return { hour: peakIdx, count: peakVal };
  }, [hourlyDistribution]);

  const thirtyDayProjection = useMemo(() => {
    const days = new Array(30).fill(0);
    const now = Date.now();
    const allCards = Object.values(srs).filter((i) => !i.suspended);
    for (const item of allCards) {
      const dueTime = new Date(item.card.due).getTime();
      const diffDays = Math.floor((dueTime - now) / (86400 * 1000));
      if (diffDays <= 0) {
        days[0]++;
      } else if (diffDays < 30) {
        days[diffDays]++;
      } else {
        const s = item.card.stability || 1;
        let next = dueTime;
        while (next <= now + 30 * 86400 * 1000) {
          const d = Math.floor((next - now) / (86400 * 1000));
          if (d >= 0 && d < 30) days[d]++;
          next += Math.max(1, Math.round(s)) * 86400 * 1000;
        }
      }
    }
    return days;
  }, [srs]);

  const maxThirtyDayCount = useMemo(() => Math.max(1, ...thirtyDayProjection), [thirtyDayProjection]);
  const spikeDay = useMemo(() => thirtyDayProjection.findIndex((cnt) => cnt > 50), [thirtyDayProjection]);

  const vectorMetrics = getVectorRetentionMetrics();
  const allGhosts = useMemo(() => Object.values(ghosts ?? {}), [ghosts]);
  const dueGhosts = getDueGhosts();

  const handleGhostAnswer = (ok: boolean) => {
    const currentGhost = dueGhosts[ghostIndex % dueGhosts.length];
    if (!currentGhost) return;
    reviewGhost(currentGhost.id, ok);
    if (sfxEnabled) (ok ? playDing : playMiss)();
    if (ok) {
      if (currentGhost.consecutiveSuccesses + 1 >= 3) {
        setGhostCelebration(`✨ Ghost for "${currentGhost.prompt}" completely evaporated!`);
      }
    }
    setGhostRevealed(false);
    if (dueGhosts.length <= 1) {
      setActiveGhostDrill(false);
      setGhostIndex(0);
    } else {
      setGhostIndex((idx) => (idx + 1) % dueGhosts.length);
    }
  };

  const refreshQueue = () =>
    setQueue(buildDueQueue(useStore.getState().srs, useStore.getState().dailyNewCardsCap));

  const handleSuspend = (idToSuspend?: string) => {
    const targetId = idToSuspend || queue[0];
    if (!targetId) return;
    suspendCard(targetId);
    if (sfxEnabled) playDing();
    setQueue((q) => q.filter((id) => id !== targetId));
    setFlipped(false);
    setTypedInput('');
    setTypedResult(null);
  };

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
    const activeModality: MemoryVectorType =
      activeVector !== 'all'
        ? activeVector
        : reviewMode === 'recognition'
          ? 'meaning'
          : reviewMode === 'recall'
            ? 'production'
            : 'audio';
    recordVectorReview(item.id, activeModality, g);
    setQueue((q) => (g === Rating.Again ? [...q.slice(1), q[0]] : q.slice(1)));
    setFlipped(false);
    setTypedInput('');
    setTypedResult(null);
    setDone((d) => d + 1);
    if (g === Rating.Again) setSessionAgain((n) => n + 1);
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
      } else if (e.key.toLowerCase() === 'e') {
        e.preventDefault();
        handleSuspend();
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
      if (kindFilter === 'suspended') {
        if (!c.suspended) return false;
      } else {
        if (c.suspended) return false;
        if (kindFilter === 'leech') {
          if (!isLeechOrHard(c)) return false;
        } else if (kindFilter !== 'all' && c.kind !== kindFilter) {
          return false;
        }
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
            {counts.kanji} Kanji · {counts.word} Vocab · {counts.grammar} Grammar · Hotkeys: Space (Flip), 1–4 (Grade), R (Audio), E (Suspend)
          </p>
        </div>
        <div className="controls">
          <button className={showForecast ? 'chip on' : 'chip'} onClick={() => setShowForecast((f) => !f)}>
            📊 {showForecast ? 'Hide Forecast' : 'Workload Forecast (24h & 30d)'}
          </button>
          <button className={showGhostQueue ? 'chip on' : 'chip'} onClick={() => setShowGhostQueue((g) => !g)}>
            👻 {showGhostQueue ? 'Hide Ghost Queue' : `Ghost Queue (${allGhosts.length})`}
          </button>
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

      {/* Decoupled Multi-Vector Modality Switcher & Retention Metrics */}
      <div className="gp" style={{ margin: '0.8rem 0 0.5rem', padding: '0.65rem 0.9rem' }}>
        <div className="row-between" style={{ flexWrap: 'wrap', gap: '0.5rem' }}>
          <span className="small muted">
            <b>🧬 Decoupled Multi-Vector FSRS:</b> Independent continuous memory curves
          </span>
          <div className="controls nomargin" style={{ gap: '0.35rem' }}>
            {(['all', 'meaning', 'reading', 'production', 'audio'] as const).map((v) => (
              <button
                key={v}
                className={activeVector === v ? 'chip on' : 'chip'}
                style={{ padding: '0.2rem 0.55rem', fontSize: '0.76rem' }}
                onClick={() => setActiveVector(v)}
              >
                {v === 'all'
                  ? 'All Vectors'
                  : v === 'meaning'
                    ? '📖 Meaning'
                    : v === 'reading'
                      ? '🔤 Reading'
                      : v === 'production'
                        ? '✍️ Production'
                        : '🎧 Audio'}
              </button>
            ))}
          </div>
        </div>

        {/* Vector retention metrics chips */}
        <div className="stats" style={{ margin: '0.5rem 0 0', gap: '0.5rem' }}>
          {MEMORY_VECTORS.map((vec) => {
            const m = vectorMetrics[vec];
            const isSel = activeVector === 'all' || activeVector === vec;
            return (
              <div
                key={vec}
                className="stat"
                style={{
                  padding: '0.45rem 0.65rem',
                  opacity: isSel ? 1 : 0.45,
                  border: isSel ? '1px solid var(--border)' : '1px dashed transparent',
                }}
              >
                <div className="row-between">
                  <span className="small">
                    {vec === 'meaning'
                      ? '📖 Meaning'
                      : vec === 'reading'
                        ? '🔤 Reading'
                        : vec === 'production'
                          ? '✍️ Production'
                          : '🎧 Audio'}
                  </span>
                  <span className={m.dueCount > 0 ? 'bad-text small font-bold' : 'ok-text small'}>
                    {m.dueCount} due
                  </span>
                </div>
                <div className="muted small" style={{ fontSize: '0.72rem', marginTop: '0.2rem' }}>
                  Stability: <b>{m.averageStability}d</b> · Retrievability: <b>{m.retrievabilityPct}%</b>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 24-Hour & 30-Day Workload Forecast Drawer */}
      {showForecast && (
        <div className="gp" style={{ margin: '0.9rem 0', padding: '1rem 1.2rem' }}>
          <div className="row-between">
            <div>
              <h3 className="nomargin">📊 Workload Forecasting Engine</h3>
              <p className="muted small nomargin" style={{ marginTop: '0.15rem' }}>
                Next 24h due: <b>{total24hDue} cards</b> · Peak load: <b>{peakHour.count} cards</b> at +{peakHour.hour}h · 30-day projection
              </p>
            </div>
            {spikeDay !== -1 && (
              <span className="chip bad small">
                ⚠️ Backlog Spike on Day {spikeDay + 1} ({thirtyDayProjection[spikeDay]} cards)
              </span>
            )}
          </div>

          {/* 24-Hour Hourly Histogram */}
          <div style={{ marginTop: '0.9rem' }}>
            <div className="row-between">
              <span className="small"><b>⏱️ 24-Hour Hourly Distribution (Now → +23h):</b></span>
              <span className="muted small">Color: Red (Now/Overdue), Amber (1–6h), Teal (7–24h)</span>
            </div>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(24, 1fr)',
                gap: '3px',
                height: '75px',
                alignItems: 'end',
                background: 'var(--surface2)',
                padding: '0.5rem',
                borderRadius: '8px',
                marginTop: '0.35rem',
              }}
            >
              {hourlyDistribution.map((cnt, h) => {
                const heightPct = Math.max(8, (cnt / maxHourlyCount) * 100);
                const color = h === 0 ? '#ef4444' : h < 6 ? '#f59e0b' : 'var(--accent)';
                return (
                  <div
                    key={h}
                    title={`Hour +${h}h: ${cnt} cards due`}
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      height: '100%',
                      justifyContent: 'flex-end',
                    }}
                  >
                    <div
                      style={{
                        width: '100%',
                        height: cnt > 0 ? `${heightPct}%` : '4px',
                        background: cnt > 0 ? color : 'rgba(255,255,255,0.06)',
                        borderRadius: '3px 3px 0 0',
                        transition: 'height 0.2s ease',
                      }}
                    />
                  </div>
                );
              })}
            </div>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                fontSize: '0.68rem',
                color: 'var(--muted)',
                marginTop: '0.2rem',
                padding: '0 2px',
              }}
            >
              <span>Now (+0h)</span>
              <span>+4h</span>
              <span>+8h</span>
              <span>+12h</span>
              <span>+16h</span>
              <span>+20h</span>
              <span>+23h</span>
            </div>
          </div>

          {/* 30-Day Workload Projection Area */}
          <div style={{ marginTop: '1.1rem' }}>
            <div className="row-between">
              <span className="small"><b>📅 30-Day Forward Workload Projection (Days 1 → 30):</b></span>
              <span className="muted small">Threshold: 50 cards/day cap</span>
            </div>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(30, 1fr)',
                gap: '2px',
                height: '80px',
                alignItems: 'end',
                background: 'var(--surface2)',
                padding: '0.5rem',
                borderRadius: '8px',
                marginTop: '0.35rem',
              }}
            >
              {thirtyDayProjection.map((cnt, d) => {
                const heightPct = Math.max(6, (cnt / maxThirtyDayCount) * 100);
                const isSpike = cnt > 50;
                return (
                  <div
                    key={d}
                    title={`Day ${d + 1}: ${cnt} cards projected`}
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      height: '100%',
                      justifyContent: 'flex-end',
                    }}
                  >
                    <div
                      style={{
                        width: '100%',
                        height: cnt > 0 ? `${heightPct}%` : '3px',
                        background: isSpike ? '#ef4444' : cnt > 25 ? '#f59e0b' : 'var(--accent)',
                        borderRadius: '2px 2px 0 0',
                        transition: 'height 0.2s ease',
                      }}
                    />
                  </div>
                );
              })}
            </div>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                fontSize: '0.68rem',
                color: 'var(--muted)',
                marginTop: '0.2rem',
                padding: '0 2px',
              }}
            >
              <span>Day 1</span>
              <span>Day 5</span>
              <span>Day 10</span>
              <span>Day 15</span>
              <span>Day 20</span>
              <span>Day 25</span>
              <span>Day 30</span>
            </div>
          </div>
        </div>
      )}

      {/* Isolated Ghost Review Queue Drawer */}
      {showGhostQueue && (
        <div className="gp" style={{ margin: '0.9rem 0', padding: '1rem 1.2rem' }}>
          <div className="row-between">
            <div>
              <h3 className="nomargin">👻 Isolated Ghost Review Queue</h3>
              <p className="muted small nomargin" style={{ marginTop: '0.15rem' }}>
                Rapid remediation loop (4h → 12h → 24h) for failed cards. Evaporates on 3 consecutive passes without resetting parent card stability.
              </p>
            </div>
            {dueGhosts.length > 0 && !activeGhostDrill && (
              <button
                className="chip on"
                style={{ padding: '0.3rem 0.8rem', fontSize: '0.85rem' }}
                onClick={() => {
                  setActiveGhostDrill(true);
                  setGhostIndex(0);
                  setGhostRevealed(false);
                }}
              >
                ⚡ Start Ghost Remediation Drill ({dueGhosts.length} due)
              </button>
            )}
          </div>

          {ghostCelebration && (
            <div className="chip ok" style={{ margin: '0.6rem 0', width: '100%' }}>
              {ghostCelebration}
            </div>
          )}

          {/* Interactive Ghost Drill Mode */}
          {activeGhostDrill && dueGhosts.length > 0 && (() => {
            const currentGhost = dueGhosts[ghostIndex % dueGhosts.length];
            return (
              <div
                style={{
                  background: 'var(--surface2)',
                  padding: '1.2rem',
                  borderRadius: '12px',
                  margin: '0.8rem 0',
                  textAlign: 'center',
                }}
              >
                <div className="row-between" style={{ marginBottom: '0.6rem' }}>
                  <span className="tag">
                    👻 Ghost Drill ({ghostIndex + 1} of {dueGhosts.length}) · Stage {currentGhost.stage} ({currentGhost.stage === 1 ? '4h' : currentGhost.stage === 2 ? '12h' : '24h'})
                  </span>
                  <button
                    className="chip"
                    style={{ fontSize: '0.75rem', padding: '0.15rem 0.5rem' }}
                    onClick={() => setActiveGhostDrill(false)}
                  >
                    ✕ Exit Drill
                  </button>
                </div>
                <div style={{ fontSize: '0.85rem', color: 'var(--muted)', marginBottom: '0.3rem' }}>
                  Modality: <b style={{ textTransform: 'uppercase' }}>{currentGhost.vector}</b> · Consecutive Passes: <b>{currentGhost.consecutiveSuccesses}/3</b> (3 to evaporate)
                </div>
                <div className="jp" style={{ fontSize: '2.2rem', fontWeight: 700, margin: '0.6rem 0' }}>
                  {currentGhost.prompt}
                </div>

                {!ghostRevealed ? (
                  <button
                    className="chip on"
                    style={{ marginTop: '0.6rem', padding: '0.4rem 1.2rem' }}
                    onClick={() => {
                      setGhostRevealed(true);
                      speak(currentGhost.expectedAnswer);
                    }}
                  >
                    Show Expected Answer
                  </button>
                ) : (
                  <div style={{ marginTop: '0.8rem' }}>
                    <div className="jp" style={{ fontSize: '1.5rem', color: 'var(--accent)', fontWeight: 600 }}>
                      {currentGhost.expectedAnswer}
                    </div>
                    <div className="controls center" style={{ marginTop: '1rem', gap: '0.8rem' }}>
                      <button
                        className="chip bad"
                        style={{ padding: '0.4rem 1rem' }}
                        onClick={() => handleGhostAnswer(false)}
                      >
                        ✗ Still Missed It (Reset to 4h)
                      </button>
                      <button
                        className="chip ok"
                        style={{ padding: '0.4rem 1.2rem' }}
                        onClick={() => handleGhostAnswer(true)}
                      >
                        ✓ Got It (+1 Pass)
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })()}

          {/* Active Ghosts List */}
          <div style={{ marginTop: '0.8rem' }}>
            <span className="small muted"><b>Active Ghost Cards ({allGhosts.length}):</b></span>
            {allGhosts.length === 0 ? (
              <p className="muted small" style={{ margin: '0.4rem 0' }}>
                🎉 Zero troubled ghosts! All cards are currently healthy.
              </p>
            ) : (
              <div style={{ display: 'grid', gap: '0.4rem', marginTop: '0.4rem', maxHeight: '200px', overflowY: 'auto' }}>
                {allGhosts.map((g) => {
                  const isDueNow = new Date(g.nextReviewAt).getTime() <= Date.now();
                  return (
                    <div
                      key={g.id}
                      className="row-between"
                      style={{
                        padding: '0.4rem 0.75rem',
                        background: 'var(--surface2)',
                        borderRadius: '6px',
                        borderLeft: `3px solid ${isDueNow ? '#ef4444' : 'var(--accent)'}`,
                      }}
                    >
                      <div>
                        <b className="jp">{g.prompt}</b>{' '}
                        <span className="muted small">[{g.vector}]</span>
                        <span className="chip small" style={{ marginLeft: '0.4rem', padding: '0.1rem 0.4rem', fontSize: '0.7rem' }}>
                          Stage {g.stage} ({g.stage === 1 ? '4h' : g.stage === 2 ? '12h' : '24h'})
                        </span>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <span className={isDueNow ? 'bad-text small font-bold' : 'muted small'}>
                          {isDueNow ? '⚡ Due Now' : `Due: ${new Date(g.nextReviewAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`}
                        </span>
                        <span className="muted small" style={{ marginLeft: '0.6rem' }}>
                          {g.consecutiveSuccesses}/3 wins
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Searchable Deck Browser Drawer */}
      {showBrowser && (
        <div className="gp" style={{ margin: '1rem 0', padding: '1rem 1.2rem' }}>
          <div className="row-between">
            <b>🗂️ SRS Deck Browser ({filteredBrowserItems.length} / {total} cards)</b>
            <div className="controls nomargin">
              {(['all', 'kanji', 'word', 'grammar', 'leech', 'suspended'] as const).map((k) => (
                <button key={k} className={kindFilter === k ? 'chip on' : 'chip'} onClick={() => setKindFilter(k)}>
                  {k === 'all'
                    ? 'All'
                    : k === 'leech'
                    ? `🔥 Leech / Hard (${counts.leech})`
                    : k === 'suspended'
                    ? `📦 Suspended (${counts.suspended})`
                    : `${k.toUpperCase()} (${counts[k]})`}
                </button>
              ))}
            </div>
          </div>
          <div className="row-between" style={{ margin: '0.6rem 0', padding: '0.45rem 0.75rem', background: 'var(--surface2)', borderRadius: '8px' }}>
            <span className="small"><b>Daily New Cards Cap:</b> Limits unlearned cards entering queue</span>
            <div className="controls nomargin">
              {[10, 15, 20, 0].map((cap) => (
                <button
                  key={cap}
                  className={dailyNewCardsCap === cap ? 'chip on' : 'chip'}
                  style={{ padding: '0.15rem 0.55rem', fontSize: '0.75rem' }}
                  onClick={() => {
                    setDailyNewCardsCap(cap);
                    setQueue(buildDueQueue(useStore.getState().srs, cap));
                  }}
                >
                  {cap === 0 ? 'No Cap (All)' : `${cap} / day`}
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
                    borderLeft: isHard ? '3px solid var(--bad)' : c.suspended ? '3px solid var(--muted)' : undefined,
                  }}
                >
                  <div style={{ flex: 1 }}>
                    <span className="tag" style={{ marginRight: '0.45rem' }}>{c.kind}</span>
                    {c.suspended && (
                      <span className="tag" style={{ marginRight: '0.45rem', opacity: 0.85 }}>
                        📦 Suspended
                      </span>
                    )}
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
                  <div className="controls nomargin" style={{ alignItems: 'center' }}>
                    {c.suspended ? (
                      <button
                        className="chip on"
                        style={{ padding: '0.2rem 0.55rem', fontSize: '0.75rem' }}
                        title="Reactivate card into review queue"
                        onClick={() => unsuspendCard(c.id)}
                      >
                        ↩ Unsuspend
                      </button>
                    ) : (
                      <button
                        className="chip"
                        style={{ padding: '0.2rem 0.55rem', fontSize: '0.75rem' }}
                        title="Archive card (already know it)"
                        onClick={() => handleSuspend(c.id)}
                      >
                        📦 Suspend
                      </button>
                    )}
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
                </div>
              );
            })}
            {filteredBrowserItems.length === 0 && (
              <p className="muted small center" style={{ padding: '0.8rem 0' }}>
                {kindFilter === 'leech'
                  ? 'No leech or missed-exam cards yet! Cards you grade "Again" or export from missed exam questions appear here.'
                  : kindFilter === 'suspended'
                  ? 'No suspended cards. Cards you archive with (E) or "Already Know" will appear here.'
                  : 'No cards match your filter.'}
              </p>
            )}
          </div>
        </div>
      )}

      {!item ? (() => {
        const elapsedSec = Math.floor((Date.now() - sessionStart) / 1000);
        const elapsed = `${Math.floor(elapsedSec / 60)}:${String(elapsedSec % 60).padStart(2, '0')}`;
        return (
          <div className="card-box center">
            <div className="big-emoji">🎉</div>
            {done > 0 ? (
              <>
                <p style={{ fontWeight: 600, fontSize: '1.15rem', margin: '0.3rem 0 0.6rem' }}>Session Complete!</p>
                <div style={{ display: 'grid', gap: '0.35rem', textAlign: 'left', width: 'fit-content', margin: '0 auto 0.8rem' }}>
                  <span>✅ <b>{done}</b> cards reviewed</span>
                  <span>⏱ <b>{elapsed}</b></span>
                  <span className="ok-text">🎯 <b>{done - sessionAgain}</b>/{done} correct</span>
                  {sessionAgain > 0 && <span className="bad-text">🔥 <b>{sessionAgain}</b> lapsed</span>}
                </div>
              </>
            ) : (
              <p>All caught up!</p>
            )}
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
        );
      })() : (
        <>
          <div
            className="card-box"
            onClick={() => reviewMode !== 'recall' && !flipped && flipCard()}
          >
            <div className="row-between" style={{ width: '100%' }}>
              <span className="tag">{item.kind} · {reviewMode.toUpperCase()}</span>
              <div className="controls nomargin">
                <button
                  type="button"
                  className="chip"
                  style={{ padding: '0.25rem 0.65rem', fontSize: '0.8rem' }}
                  title="Archive this card — you already know it and won't be quizzed again (E)"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleSuspend();
                  }}
                >
                  📦 Already Know / Suspend <kbd className="kbd-badge">E</kbd>
                </button>
                <button
                  type="button"
                  className="chip"
                  style={{ padding: '0.25rem 0.65rem', fontSize: '0.8rem' }}
                  onClick={(e) => {
                    e.stopPropagation();
                    speakCurrentItem(item);
                  }}
                >
                  🔊 Replay Audio <kbd className="kbd-badge">R</kbd>
                </button>
              </div>
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
