import { useEffect, useMemo, useRef, useState } from 'react';
import { toHiragana } from 'wanakana';
import { COUNTERS, COUNTER_GROUPS, type CounterGroup, type CounterItem } from '../data/counters';
import { useStore } from '../lib/store';
import { speak } from '../lib/tts';
import { playDing, playMiss } from '../lib/sfx';

const ALL_GROUPS = Object.keys(COUNTER_GROUPS) as CounterGroup[];

function matchesCounter(input: string, item: CounterItem) {
  const clean = input.trim().toLowerCase().replace(/\s+/g, '');
  if (!clean) return false;
  if (clean === item.romaji || clean === item.kana || clean === item.kanji) return true;
  if (item.alts?.includes(clean)) return true;
  const hira = toHiragana(clean);
  return hira === item.kana || (item.alts?.includes(hira) ?? false);
}

export default function CounterDojo() {
  const { srs, addCard, sfxEnabled } = useStore();
  const [filter, setFilter] = useState<CounterGroup | 'all' | 'traps'>('all');
  const [current, setCurrent] = useState<CounterItem | null>(null);
  const [input, setInput] = useState('');
  const [flash, setFlash] = useState<'ok' | 'bad' | null>(null);
  const [reveal, setReveal] = useState<string | null>(null);
  const [showHint, setShowHint] = useState(false);
  const [session, setSession] = useState({ ok: 0, total: 0 });
  const inputRef = useRef<HTMLInputElement>(null);

  const pool = useMemo(() => {
    if (filter === 'all') return COUNTERS;
    if (filter === 'traps') return COUNTERS.filter((c) => c.irregular);
    return COUNTERS.filter((c) => c.group === filter);
  }, [filter]);

  const pickNext = (last?: CounterItem | null) => {
    if (!pool.length) return null;
    const candidates = pool.length > 1 && last ? pool.filter((c) => c.id !== last.id) : pool;
    return candidates[Math.floor(Math.random() * candidates.length)];
  };

  useEffect(() => {
    setCurrent(pickNext(null));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pool]);

  const choices = useMemo(() => {
    if (!current) return [];
    const sameGroup = COUNTERS.filter((c) => c.group === current.group && c.id !== current.id);
    const distractors = [...sameGroup.length >= 3 ? sameGroup : COUNTERS.filter((c) => c.id !== current.id)]
      .sort(() => Math.random() - 0.5)
      .slice(0, 3)
      .map((c) => c.kana);
    return [current.kana, ...distractors].sort(() => Math.random() - 0.5);
  }, [current]);

  const submit = (val: string) => {
    if (!current) return;
    const ok = matchesCounter(val, current);
    setSession((s) => ({ ok: s.ok + (ok ? 1 : 0), total: s.total + 1 }));
    setFlash(ok ? 'ok' : 'bad');
    if (sfxEnabled) (ok ? playDing : playMiss)();
    speak(current.kana);
    if (ok) {
      setReveal(null);
    } else {
      setReveal(`${current.kanji} (${current.en}) = ${current.kana} (${current.romaji})`);
    }
    setCurrent(pickNext(current));
    setInput('');
    setShowHint(false);
    setTimeout(() => setFlash(null), 250);
  };

  const onChange = (v: string) => {
    setInput(v);
    if (current && matchesCounter(v, current)) {
      submit(v);
    }
  };

  const srsId = current ? `word:${current.kanji}` : '';
  const inSrs = srsId ? srsId in srs : false;

  const addCurrentToSrs = () => {
    if (!current) return;
    addCard({
      id: `word:${current.kanji}`,
      kind: 'word',
      front: current.kanji,
      reading: current.kana,
      back: `${current.en} (${COUNTER_GROUPS[current.group].label})`,
    });
  };

  return (
    <div className="page">
      <h1>助数詞 <span className="muted">Counter &amp; Number Dojo</span></h1>
      <p className="muted">
        Master Japanese counters, calendar dates, and euphonic sound changes (いっぽん, さんぼん, ふたり, ようか, はつか).
      </p>

      <div className="controls">
        <button className={filter === 'all' ? 'chip on' : 'chip'} onClick={() => setFilter('all')}>
          All ({COUNTERS.length})
        </button>
        <button className={filter === 'traps' ? 'chip on' : 'chip'} onClick={() => setFilter('traps')}>
          ⚡ Sound Changes &amp; Traps ({COUNTERS.filter((c) => c.irregular).length})
        </button>
        {ALL_GROUPS.map((g) => (
          <button key={g} className={filter === g ? 'chip on' : 'chip'} onClick={() => setFilter(g)}>
            {COUNTER_GROUPS[g].label}
          </button>
        ))}
      </div>

      {current && (
        <div className={`drill ${flash ?? ''}`} onClick={() => inputRef.current?.focus()}>
          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', flexWrap: 'wrap', justifyContent: 'center' }}>
            <span className="tag">{COUNTER_GROUPS[current.group].label}</span>
            {current.irregular && <span className="tag" style={{ color: 'var(--ok)' }}>⚡ Sound Change / Irregular</span>}
          </div>

          <div className="drill-char" style={{ fontSize: '4.2rem', margin: '0.3rem 0' }}>
            {current.kanji}
          </div>
          <p className="muted nomargin" style={{ marginBottom: '0.6rem' }}>
            <b>{current.en}</b> — type reading in romaji or kana
          </p>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              submit(input);
            }}
          >
            <input
              ref={inputRef}
              className="drill-input"
              value={input}
              onChange={(e) => onChange(e.target.value)}
              placeholder="romaji or かな…"
              autoFocus
              autoCapitalize="off"
              autoCorrect="off"
              spellCheck={false}
            />
          </form>

          {input.trim() && (
            <p className="muted small nomargin" style={{ marginTop: '0.3rem' }}>
              かな preview: <span className="jp">{toHiragana(input.trim().toLowerCase())}</span>
            </p>
          )}

          {/* Quick-tap multiple choice options */}
          <div className="controls center" style={{ marginTop: '0.9rem' }}>
            {choices.map((c) => (
              <button
                key={c}
                type="button"
                className="chip"
                onClick={(e) => {
                  e.stopPropagation();
                  submit(c);
                }}
              >
                {c}
              </button>
            ))}
          </div>

          <div className="controls" style={{ marginTop: '0.8rem' }}>
            <button
              type="button"
              className="chip"
              onClick={(e) => {
                e.stopPropagation();
                setShowHint((h) => !h);
              }}
            >
              💡 {showHint ? 'Hide Rule' : 'Rule Hint'}
            </button>
            <button
              type="button"
              className="chip"
              onClick={(e) => {
                e.stopPropagation();
                speak(current.kana);
              }}
            >
              🔊 Hear Answer
            </button>
            <button
              type="button"
              className={inSrs ? 'chip ok' : 'chip'}
              disabled={inSrs}
              onClick={(e) => {
                e.stopPropagation();
                addCurrentToSrs();
              }}
            >
              {inSrs ? '✓ In SRS' : '+ Add to SRS'}
            </button>
            <button
              type="button"
              className="chip"
              onClick={(e) => {
                e.stopPropagation();
                submit('');
              }}
            >
              Skip →
            </button>
          </div>

          {showHint && (
            <p className="small ok-text" style={{ marginTop: '0.5rem' }}>
              Rule: {current.rule}
            </p>
          )}

          <div className="drill-meta">
            <span>
              Session: {session.ok}/{session.total}
            </span>
            {reveal && <span className="bad-text">✗ {reveal}</span>}
          </div>
        </div>
      )}

      <h2>Counter Reference Chart <span className="muted">(tap any card to hear pronunciation · highlighted = sound change)</span></h2>
      {ALL_GROUPS.map((g) => {
        const items = COUNTERS.filter((c) => c.group === g);
        return (
          <div key={g} style={{ marginBottom: '1.2rem' }}>
            <h3 className="small-title" style={{ marginBottom: '0.3rem' }}>
              {COUNTER_GROUPS[g].label} <span className="muted small">— {COUNTER_GROUPS[g].desc}</span>
            </h3>
            <div className="chart" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(92px, 1fr))' }}>
              {items.map((c) => (
                <button
                  key={c.id}
                  className={`cell ${c.irregular ? 'l1' : ''}`}
                  onClick={() => speak(c.kana)}
                  title={c.rule}
                >
                  <span>{c.kanji}</span>
                  <small className="jp" style={{ color: c.irregular ? 'var(--accent)' : 'var(--text)', fontWeight: c.irregular ? 600 : 400 }}>
                    {c.kana}
                  </small>
                  <small>{c.en}</small>
                </button>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
