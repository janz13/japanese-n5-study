import { useEffect, useMemo, useRef, useState } from 'react';
import { BASIC_ROWS, DAKUTEN_ROWS, HIRAGANA, KATAKANA, ROWS, YOON_ROWS, type Kana } from '../data/kana';
import { useStore } from '../lib/store';
import { speak } from '../lib/tts';

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
  const { kanaStats, recordKana } = useStore();
  const [script, setScript] = useState<Script>('hiragana');
  const [rows, setRows] = useState<string[]>(['a', 'k', 's']);
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

  const toggleGroup = (groupRows: string[]) => {
    const allActive = groupRows.every((r) => rows.includes(r));
    if (allActive) {
      const remaining = rows.filter((r) => !groupRows.includes(r));
      if (remaining.length > 0) setRows(remaining);
    } else {
      setRows(Array.from(new Set([...rows, ...groupRows])));
    }
  };

  const refSource = script === 'katakana' ? KATAKANA : HIRAGANA;

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
          Presets:
        </span>
        <button
          className={BASIC_ROWS.every((r) => rows.includes(r)) ? 'chip on' : 'chip'}
          onClick={() => toggleGroup(BASIC_ROWS)}
        >
          Basic (あ–ん)
        </button>
        <button
          className={DAKUTEN_ROWS.every((r) => rows.includes(r)) ? 'chip on' : 'chip'}
          onClick={() => toggleGroup(DAKUTEN_ROWS)}
        >
          Dakuten (が–ぽ)
        </button>
        <button
          className={YOON_ROWS.every((r) => rows.includes(r)) ? 'chip on' : 'chip'}
          onClick={() => toggleGroup(YOON_ROWS)}
        >
          Yōon Combos (きゃ–ぴょ)
        </button>
        <button className={rows.length === ROWS.length ? 'chip on' : 'chip'} onClick={() => setRows(ROWS)}>
          All ({refSource.length})
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

      <h2>Chart ({pool.length} active)</h2>
      <div className="chart">
        {pool.map((k) => {
          const s = kanaStats[k.kana];
          const level = !s || s.correct === 0 ? 0 : s.correct >= 3 && s.correct > s.wrong * 2 ? 2 : 1;
          return (
            <button key={k.kana} className={`cell l${level}`} onClick={() => speak(k.kana)}>
              <span>{k.kana}</span>
              <small>{k.romaji}</small>
            </button>
          );
        })}
      </div>
    </div>
  );
}
