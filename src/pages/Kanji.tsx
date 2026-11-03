import { useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { toHiragana, toKatakana } from 'wanakana';
import { KANJI } from '../data/kanji';
import { getKanjiBreakdown, RADICAL_FAMILIES } from '../data/kanjiRadicals';
import { useStore } from '../lib/store';
import { speak } from '../lib/tts';
import { StrokeOrder, TraceCanvas } from '../components/Strokes';

type DeckFilter = 'all' | 'in' | 'out';
type StrokeFilter = 'all' | '1-4' | '5-7' | '8+';
type LevelFilter = 'all' | 'N5' | 'N4';

export function KanjiList() {
  const { srs, addCard } = useStore();
  const [query, setQuery] = useState('');
  const [levelFilter, setLevelFilter] = useState<LevelFilter>('all');
  const [filter, setFilter] = useState<DeckFilter>('all');
  const [strokeFilter, setStrokeFilter] = useState<StrokeFilter>('all');
  const [radicalFam, setRadicalFam] = useState<string>('all');

  const n5Count = KANJI.filter((k) => k.level === 'N5').length;
  const n4Count = KANJI.filter((k) => k.level === 'N4').length;

  const addAll = () =>
    KANJI.filter((k) => levelFilter === 'all' || k.level === levelFilter).forEach((k) =>
      addCard({ id: `k:${k.k}`, kind: 'kanji', front: k.k, reading: `${k.on} / ${k.kun}`, back: k.meaning }),
    );
  const inDeck = KANJI.filter((k) => srs[`k:${k.k}`]).length;

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    const hira = q ? toHiragana(q) : '';
    const kata = q ? toKatakana(q) : '';
    const activeFam = RADICAL_FAMILIES.find((f) => f.id === radicalFam);
    return KANJI.filter((k) => {
      if (levelFilter !== 'all' && k.level !== levelFilter) return false;
      if (activeFam && !activeFam.chars.includes(k.k)) return false;
      const isIn = !!srs[`k:${k.k}`];
      if (filter === 'in' && !isIn) return false;
      if (filter === 'out' && isIn) return false;
      if (strokeFilter === '1-4' && k.strokes > 4) return false;
      if (strokeFilter === '5-7' && (k.strokes < 5 || k.strokes > 7)) return false;
      if (strokeFilter === '8+' && k.strokes < 8) return false;
      if (!q) return true;
      return (
        k.k.includes(q) ||
        String(k.strokes) === q ||
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
  }, [query, levelFilter, radicalFam, filter, strokeFilter, srs]);

  return (
    <div className="page">
      <h1>漢字 <span className="muted">N5 &amp; N4 Kanji Library</span></h1>
      <div className="controls">
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search kanji, meaning, reading, or stroke count (e.g. sun, やま, yama, 4)…"
          className="search-input"
        />
        {query && (
          <button className="chip" onClick={() => setQuery('')}>✕ Clear</button>
        )}
      </div>
      <div className="controls">
        <button className={levelFilter === 'all' ? 'chip on' : 'chip'} onClick={() => setLevelFilter('all')}>
          All Levels ({KANJI.length})
        </button>
        <button className={levelFilter === 'N5' ? 'chip on' : 'chip'} onClick={() => setLevelFilter('N5')}>
          JLPT N5 ({n5Count})
        </button>
        <button className={levelFilter === 'N4' ? 'chip on' : 'chip'} onClick={() => setLevelFilter('N4')}>
          JLPT N4 ({n4Count})
        </button>
        <span className="muted small" style={{ alignSelf: 'center', marginLeft: '0.4rem' }}>Deck:</span>
        <button className={filter === 'all' ? 'chip on' : 'chip'} onClick={() => setFilter('all')}>
          Any
        </button>
        <button className={filter === 'in' ? 'chip on' : 'chip'} onClick={() => setFilter('in')}>
          In Deck ({inDeck})
        </button>
        <button className={filter === 'out' ? 'chip on' : 'chip'} onClick={() => setFilter('out')}>
          Not in Deck ({KANJI.length - inDeck})
        </button>
        <span className="muted small" style={{ alignSelf: 'center', marginLeft: '0.4rem' }}>Strokes:</span>
        {(['all', '1-4', '5-7', '8+'] as StrokeFilter[]).map((sf) => (
          <button key={sf} className={strokeFilter === sf ? 'chip on' : 'chip'} onClick={() => setStrokeFilter(sf)}>
            {sf === 'all' ? 'Any' : `${sf}画`}
          </button>
        ))}
        {inDeck < KANJI.length && (
          <button className="chip on" onClick={addAll}>+ Add to review</button>
        )}
      </div>

      {/* Radical & Component Family Filter */}
      <div className="controls">
        <span className="muted small" style={{ alignSelf: 'center' }}>🧩 Radicals:</span>
        <button className={radicalFam === 'all' ? 'chip on' : 'chip'} onClick={() => setRadicalFam('all')}>
          All Radicals
        </button>
        {RADICAL_FAMILIES.map((fam) => (
          <button
            key={fam.id}
            className={radicalFam === fam.id ? 'chip on' : 'chip'}
            onClick={() => setRadicalFam(fam.id)}
          >
            {fam.label} ({fam.chars.length})
          </button>
        ))}
      </div>

      <div className="kanji-grid">
        {filtered.map((k) => (
          <Link key={k.k} to={`/kanji/${k.k}`} className={`kanji-cell${srs[`k:${k.k}`] ? ' in' : ''}`}>
            <span>{k.k}</span>
            <small>{k.meaning.split(',')[0]}</small>
            <small style={{ fontSize: '0.62rem', opacity: 0.7 }}>{k.level} · {k.strokes}画</small>
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

  const breakdown = getKanjiBreakdown(kj.k, kj.meaning, kj.strokes);
  const family = RADICAL_FAMILIES.find((f) => f.chars.includes(kj.k));
  const siblings = family ? family.chars.filter((c) => c !== kj.k) : [];

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
        <span
          className="kanji-big"
          style={{ cursor: 'pointer' }}
          title={`Click to hear ${kj.k} (${kj.sound})`}
          onClick={() => speak(kj.sound)}
        >
          {kj.k}
        </span>
        <div>
          <h2 className="nomargin">
            {kj.meaning} <span className="muted small">({kj.level} · {kj.strokes} strokes)</span>
          </h2>
          <p>
            <span className="muted">音</span> {kj.on} · <span className="muted">訓</span> {kj.kun}{' '}
            <button
              type="button"
              className="chip"
              style={{ padding: '0.15rem 0.5rem', fontSize: '0.75rem', marginLeft: '0.35rem' }}
              onClick={() => speak(kj.sound)}
              title={`Pronounce ${kj.k}`}
            >
              🔊 Hear Kanji
            </button>
          </p>
          <p className="example" onClick={() => speak(kj.ex.r)} title={`Pronounce compound ${kj.ex.w}`}>
            🔊{' '}
            <ruby>
              {kj.ex.w}
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

      {/* Radical Decomposition & Visual Mnemonic Card */}
      <div className="gp" style={{ margin: '1rem 0' }}>
        <div className="row-between">
          <div>
            <span className="tag">🧩 RADICAL &amp; COMPONENT BREAKDOWN (部首・成り立ち)</span>
            <h3 className="nomargin" style={{ marginTop: '0.2rem' }}>
              Primary Radical: <span className="jp" style={{ color: 'var(--accent)' }}>{breakdown.radical}</span>{' '}
              <span className="muted small">— {breakdown.radicalName}</span>
            </h3>
          </div>
          <div className="controls nomargin">
            {breakdown.parts.map((pt, i) => (
              <span key={i} className="chip on" style={{ fontSize: '0.85rem' }}>
                {pt}
              </span>
            ))}
          </div>
        </div>
        <p style={{ marginTop: '0.5rem', marginBottom: siblings.length ? '0.6rem' : 0 }}>
          💡 <b>Mnemonic:</b> {breakdown.mnemonic}
        </p>
        {siblings.length > 0 && (
          <div className="controls nomargin" style={{ alignItems: 'center' }}>
            <span className="muted small">Related in {family?.label}:</span>
            {siblings.map((sib) => {
              const sibObj = KANJI.find((x) => x.k === sib);
              return (
                <Link key={sib} to={`/kanji/${sib}`} className="chip" style={{ padding: '0.22rem 0.65rem', fontSize: '0.82rem' }}>
                  <b className="jp">{sib}</b> {sibObj ? <span className="muted small">({sibObj.meaning.split(',')[0]})</span> : null}
                </Link>
              );
            })}
          </div>
        )}
      </div>

      <div className="two-col">
        <section><h2>Stroke order</h2><StrokeOrder key={`order-${kj.k}`} kanji={kj.k} /></section>
        <section><h2>Practice writing</h2><TraceCanvas key={`trace-${kj.k}`} kanji={kj.k} /></section>
      </div>
      <p className="muted small">Stroke data: KanjiVG (CC BY-SA 3.0)</p>
    </div>
  );
}
