import { useEffect, useMemo, useRef, useState } from 'react';
import { BASIC_ROWS, DAKUTEN_ROWS, HIRAGANA, KATAKANA, ROWS, YOON_ROWS, type Kana } from '../data/kana';
import { useStore } from '../lib/store';
import { speak } from '../lib/tts';
import { playDing, playMiss } from '../lib/sfx';

type Script = 'hiragana' | 'katakana' | 'both';

/** Weighted pick: characters you miss more appear more often. */
function pick(pool: Kana[], stats: Record<string, { correct: number; wrong: number }>, last?: Kana) {
  const weights = pool.map((k) => {
    const s = stats[k.kana] ?? { correct: 0, wrong: 0 };
    return k === last && pool.length > 1 ? 0 : 1 + (s.wrong * 2) / (1 + s.correct * 0.5);
  });
  let r = Math.random() * weights.reduce((a, b) => a + b, 0);
  for (let i = 0; i < pool.length; i++) if ((r -= weights[i]) <= 0) return pool[i];
  return pool[0];
}

function matchesRomaji(input: string, k: Kana) {
  const clean = input.trim().toLowerCase();
  return clean === k.romaji || (k.alts?.includes(clean) ?? false);
}

export default function KanaDojo() {
  const { kanaStats, recordKana, sfxEnabled } = useStore();
  const [script, setScript] = useState<Script>('hiragana');
  const [rows, setRows] = useState<string[]>(ROWS);
  const [current, setCurrent] = useState<Kana | null>(null);
  const [input, setInput] = useState('');
  const [flash, setFlash] = useState<'ok' | 'bad' | null>(null);
  const [reveal, setReveal] = useState<string | null>(null);
  const [session, setSession] = useState({ ok: 0, total: 0 });
  const inputRef = useRef<HTMLInputElement>(null);

  const pool = useMemo(() => {
    const src = script === 'hiragana' ? HIRAGANA : script === 'katakana' ? KATAKANA : [...HIRAGANA, ...KATAKANA];
    return src.filter((k) => rows.includes(k.row));
  }, [script, rows]);

  useEffect(() => {
    if (pool.length) setCurrent(pick(pool, kanaStats));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pool]);

  const submit = (val: string) => {
    if (!current) return;
    const ok = matchesRomaji(val, current);
    recordKana(current.kana, ok);
    setSession((s) => ({ ok: s.ok + (ok ? 1 : 0), total: s.total + 1 }));
    setFlash(ok ? 'ok' : 'bad');
    if (sfxEnabled) (ok ? playDing : playMiss)();
    speak(current.kana, 0.85);
    if (ok) {
      setReveal(null);
      setCurrent(pick(pool, kanaStats, current));
    } else {
      setReveal(`${current.kana} = ${current.romaji}`);
      setCurrent(pick(pool, kanaStats, current));
    }
    setInput('');
    setTimeout(() => setFlash(null), 250);
  };

  const onChange = (v: string) => {
    setInput(v);
    if (current && matchesRomaji(v, current)) submit(v);
  };

  const toggleRow = (r: string) =>
    setRows((rs) => (rs.includes(r) ? (rs.length > 1 ? rs.filter((x) => x !== r) : rs) : [...rs, r]));

  const selectOnlyGroup = (groupRows: string[]) => setRows(groupRows);

  const refSource = script === 'katakana' ? KATAKANA : HIRAGANA;
  const basicAndDakuten = refSource.filter((k) => k.group !== 'yoon');
  const yoonList = refSource.filter((k) => k.group === 'yoon');

  return (
    <div className="page">
      <h1>Kana Dojo</h1>
      <div className="controls">
        {(['hiragana', 'katakana', 'both'] as Script[]).map((s) => (
          <button key={s} className={script === s ? 'chip on' : 'chip'} onClick={() => setScript(s)}>
            {s}
          </button>
        ))}
        <span className="muted small" style={{ alignSelf: 'center', marginLeft: '0.4rem' }}>
          Filter:
        </span>
        <button
          className={rows.length === BASIC_ROWS.length && BASIC_ROWS.every((r) => rows.includes(r)) ? 'chip on' : 'chip'}
          onClick={() => selectOnlyGroup(BASIC_ROWS)}
        >
          Basic (46)
        </button>
        <button
          className={rows.length === DAKUTEN_ROWS.length && DAKUTEN_ROWS.every((r) => rows.includes(r)) ? 'chip on' : 'chip'}
          onClick={() => selectOnlyGroup(DAKUTEN_ROWS)}
        >
          Dakuten (25)
        </button>
        <button
          className={rows.length === YOON_ROWS.length && YOON_ROWS.every((r) => rows.includes(r)) ? 'chip on' : 'chip'}
          onClick={() => selectOnlyGroup(YOON_ROWS)}
        >
          Yōon Combos (33)
        </button>
        <button className={rows.length === ROWS.length ? 'chip on' : 'chip'} onClick={() => setRows(ROWS)}>
          All (104)
        </button>
      </div>

      <div className="controls">
        {ROWS.map((r) => (
          <button key={r} className={rows.includes(r) ? 'chip on' : 'chip'} onClick={() => toggleRow(r)}>
            {refSource.find((k) => k.row === r)?.kana}
          </button>
        ))}
      </div>

      <div className={`drill ${flash ?? ''}`} onClick={() => inputRef.current?.focus()}>
        <div className="drill-char">{current?.kana}</div>
        <input
          ref={inputRef}
          autoFocus
          value={input}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && input && submit(input)}
          placeholder="type romaji…"
          className="drill-input"
          autoComplete="off"
          autoCapitalize="off"
        />
        <div className="drill-meta">
          {reveal ? <span className="bad-text">✗ {reveal}</span> : <span>&nbsp;</span>}
          <span>
            {session.ok}/{session.total} · {session.total ? Math.round((session.ok / session.total) * 100) : 0}%
          </span>
        </div>
      </div>

      {/* Accuracy Heatmap Legend & Drill Weak */}
      <div className="row-between" style={{ marginTop: '1.5rem', marginBottom: '0.5rem', flexWrap: 'wrap', gap: '0.6rem' }}>
        <div className="controls nomargin" style={{ gap: '0.45rem', alignItems: 'center' }}>
          <span className="muted small">Mastery:</span>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.75rem' }}>
            <span style={{ width: '12px', height: '12px', borderRadius: '3px', background: 'var(--surface2)', border: '1px solid var(--border)' }} />
            <span className="muted">Unseen</span>
          </span>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.75rem' }}>
            <span style={{ width: '12px', height: '12px', borderRadius: '3px', background: 'var(--surface2)', borderBottom: '3px solid var(--accent)' }} />
            <span className="muted">Learning</span>
          </span>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.75rem' }}>
            <span style={{ width: '12px', height: '12px', borderRadius: '3px', background: 'var(--surface2)', borderBottom: '3px solid var(--ok)' }} />
            <span className="muted">Mastered</span>
          </span>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.75rem' }}>
            <span style={{ width: '12px', height: '12px', borderRadius: '3px', background: 'var(--surface2)', borderBottom: '3px solid var(--bad)' }} />
            <span className="muted">Struggling</span>
          </span>
        </div>
        {(() => {
          const src = script === 'katakana' ? KATAKANA : script === 'both' ? [...HIRAGANA, ...KATAKANA] : HIRAGANA;
          const weakKana = src.filter((k) => {
            const s = kanaStats[k.kana];
            return s && s.wrong > 0 && s.wrong >= s.correct;
          });
          return weakKana.length > 0 ? (
            <button
              className="chip on"
              onClick={() => {
                const weakRows = [...new Set(weakKana.map((k) => k.row))];
                setRows(weakRows);
              }}
            >
              🎯 Drill {weakKana.length} Struggling Kana
            </button>
          ) : null;
        })()}
      </div>

      <h2>Basic, Dakuten &amp; Handakuten ({basicAndDakuten.length})</h2>
      <div className="chart">
        {basicAndDakuten.map((k) => {
          const s = kanaStats[k.kana];
          const isStruggling = s && s.wrong > 0 && s.wrong >= s.correct;
          const level = !s || s.correct === 0 ? 0 : s.correct >= 3 && s.correct > s.wrong * 2 ? 2 : 1;
          return (
            <button
              key={k.kana}
              className={`cell l${level}`}
              style={isStruggling ? { boxShadow: 'inset 0 -3px 0 var(--bad)' } : undefined}
              onClick={() => speak(k.kana)}
            >
              <span>{k.kana}</span>
              <small>{k.romaji}</small>
            </button>
          );
        })}
      </div>

      <h2>Combination Kana — Yōon 拗音 ({yoonList.length})</h2>
      <div className="chart">
        {yoonList.map((k) => {
          const s = kanaStats[k.kana];
          const isStruggling = s && s.wrong > 0 && s.wrong >= s.correct;
          const level = !s || s.correct === 0 ? 0 : s.correct >= 3 && s.correct > s.wrong * 2 ? 2 : 1;
          return (
            <button
              key={k.kana}
              className={`cell l${level}`}
              style={isStruggling ? { boxShadow: 'inset 0 -3px 0 var(--bad)' } : undefined}
              onClick={() => speak(k.kana)}
            >
              <span>{k.kana}</span>
              <small>{k.romaji}</small>
            </button>
          );
        })}
      </div>
    </div>
  );
}
