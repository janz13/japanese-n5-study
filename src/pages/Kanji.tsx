import { useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { toHiragana, toKatakana } from 'wanakana';
import { KANJI } from '../data/kanji';
import { useStore } from '../lib/store';
import { speak } from '../lib/tts';
import { StrokeOrder, TraceCanvas } from '../components/Strokes';

type DeckFilter = 'all' | 'in' | 'out';

export function KanjiList() {
  const { srs, addCard } = useStore();
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState<DeckFilter>('all');

  const addAll = () =>
    KANJI.forEach((k) => addCard({ id: `k:${k.k}`, kind: 'kanji', front: k.k, reading: `${k.on} / ${k.kun}`, back: k.meaning }));
  const inDeck = KANJI.filter((k) => srs[`k:${k.k}`]).length;

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    const hira = q ? toHiragana(q) : '';
    const kata = q ? toKatakana(q) : '';
    return KANJI.filter((k) => {
      const isIn = !!srs[`k:${k.k}`];
      if (filter === 'in' && !isIn) return false;
      if (filter === 'out' && isIn) return false;
      if (!q) return true;
      return (
        k.k.includes(q) ||
        k.meaning.toLowerCase().includes(q) ||
        k.on.includes(q) ||
        k.on.includes(kata) ||
        k.kun.includes(q) ||
        k.kun.includes(hira) ||
        k.ex.w.includes(q) ||
        k.ex.r.includes(hira) ||
        k.ex.en.toLowerCase().includes(q)
      );
    });
  }, [query, filter, srs]);

  return (
    <div className="page">
      <h1>漢字 <span className="muted">N5 Kanji</span></h1>
      <div className="controls">
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search kanji, meaning, or reading (e.g. sun, やま, yama)…"
          className="search-input"
        />
        {query && (
          <button className="chip" onClick={() => setQuery('')}>✕ Clear</button>
        )}
      </div>
      <div className="controls">
        <button className={filter === 'all' ? 'chip on' : 'chip'} onClick={() => setFilter('all')}>
          All ({KANJI.length})
        </button>
        <button className={filter === 'in' ? 'chip on' : 'chip'} onClick={() => setFilter('in')}>
          In Deck ({inDeck})
        </button>
        <button className={filter === 'out' ? 'chip on' : 'chip'} onClick={() => setFilter('out')}>
          Not in Deck ({KANJI.length - inDeck})
        </button>
        {inDeck < KANJI.length && (
          <button className="chip on" onClick={addAll}>+ Add all to review</button>
        )}
      </div>
      <div className="kanji-grid">
        {filtered.map((k) => (
          <Link key={k.k} to={`/kanji/${k.k}`} className={`kanji-cell${srs[`k:${k.k}`] ? ' in' : ''}`}>
            <span>{k.k}</span>
            <small>{k.meaning.split(',')[0]}</small>
          </Link>
        ))}
      </div>
      {!filtered.length && <p className="muted">No matching kanji found.</p>}
    </div>
  );
}

export function KanjiDetail() {
  const { k } = useParams();
  const idx = KANJI.findIndex((x) => x.k === k);
  const kj = KANJI[idx];
  const { srs, addCard } = useStore();
  if (!kj) return <div className="page">Not found. <Link to="/kanji">Back</Link></div>;
  const id = `k:${kj.k}`;
  const prev = KANJI[idx - 1], next = KANJI[idx + 1];

  return (
    <div className="page">
      <div className="row-between">
        <Link to="/kanji" className="muted">← Kanji</Link>
        <div className="controls">
          {prev && <Link className="chip" to={`/kanji/${prev.k}`}>‹ {prev.k}</Link>}
          {next && <Link className="chip" to={`/kanji/${next.k}`}>{next.k} ›</Link>}
        </div>
      </div>
      <div className="kanji-head">
        <span className="kanji-big">{kj.k}</span>
        <div>
          <h2 className="nomargin">{kj.meaning}</h2>
          <p><span className="muted">音</span> {kj.on}<br /><span className="muted">訓</span> {kj.kun}</p>
          <p className="example" onClick={() => speak(kj.ex.r)}>
            🔊{' '}
            <ruby className="ruby-pair">
              <span className="rb-text">{kj.ex.w}</span>
              <rt>{kj.ex.r}</rt>
            </ruby>{' '}
            <span className="muted">— {kj.ex.en}</span>
          </p>
          <button
            className="chip on"
            disabled={!!srs[id]}
            onClick={() => addCard({ id, kind: 'kanji', front: kj.k, reading: `${kj.on} / ${kj.kun}`, back: kj.meaning })}
          >
            {srs[id] ? '✓ In review deck' : '+ Add to review'}
          </button>
        </div>
      </div>
      <div className="two-col">
        <section><h2>Stroke order</h2><StrokeOrder kanji={kj.k} /></section>
        <section><h2>Practice writing</h2><TraceCanvas kanji={kj.k} /></section>
      </div>
      <p className="muted small">Stroke data: KanjiVG (CC BY-SA 3.0)</p>
    </div>
  );
}
