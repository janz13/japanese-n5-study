import { useEffect, useMemo, useRef, useState } from 'react';
import { toHiragana } from 'wanakana';
import { KANJI, type Kanji } from '../data/kanji';
import { useStore } from '../lib/store';
import { speak } from '../lib/tts';
import { playDing, playMiss } from '../lib/sfx';

type PromptKind = 'meaning' | 'reading' | 'vocab';
type ModeFilter = 'all' | 'meaning' | 'reading' | 'vocab';
type LevelFilter = 'N5' | 'N4' | 'all';

interface DrillItem {
  id: string;
  kanjiObj: Kanji;
  kind: PromptKind;
  promptDisplay: string;
  subLabel: string;
  expectedInputType: 'en' | 'kana';
  acceptableAnswers: string[];
  displayAnswer: string;
  ttsAudio: string;
}

function normalize(s: string) {
  return s.trim().toLowerCase().replace(/[\s\-_]/g, '');
}

function checkAnswer(input: string, item: DrillItem): boolean {
  const clean = normalize(input);
  if (!clean) return false;
  if (item.expectedInputType === 'kana') {
    const asHira = toHiragana(clean);
    return item.acceptableAnswers.some((ans) => {
      const cleanAns = normalize(ans).replace(/[・()（）]/g, '');
      return clean === cleanAns || asHira === cleanAns || clean === toHiragana(cleanAns);
    });
  } else {
    // English meaning fuzzy match
    return item.acceptableAnswers.some((ans) => {
      const normAns = normalize(ans);
      return clean === normAns || normAns.split(',').some((part) => normalize(part) === clean);
    });
  }
}

export default function KanjiDojo() {
  const { kanjiStats, recordKanji, srs, addCard, sfxEnabled } = useStore();
  const [level, setLevel] = useState<LevelFilter>('N5');
  const [modeFilter, setModeFilter] = useState<ModeFilter>('all');
  const [batchRange, setBatchRange] = useState<number>(20); // First 20, 50, all
  const [currentItem, setCurrentItem] = useState<DrillItem | null>(null);
  const [input, setInput] = useState('');
  const [flash, setFlash] = useState<'ok' | 'bad' | null>(null);
  const [reveal, setReveal] = useState<string | null>(null);
  const [session, setSession] = useState({ ok: 0, total: 0 });
  const inputRef = useRef<HTMLInputElement>(null);

  const activeKanjiList = useMemo(() => {
    let list = KANJI;
    if (level !== 'all') list = list.filter((k) => k.level === level);
    if (batchRange < list.length) list = list.slice(0, batchRange);
    return list;
  }, [level, batchRange]);

  const pool = useMemo<DrillItem[]>(() => {
    const items: DrillItem[] = [];
    for (const kj of activeKanjiList) {
      // 1. Meaning
      if (modeFilter === 'all' || modeFilter === 'meaning') {
        const meanings = kj.meaning.split(',').map((s) => s.trim().toLowerCase());
        items.push({
          id: `m:${kj.k}`,
          kanjiObj: kj,
          kind: 'meaning',
          promptDisplay: kj.k,
          subLabel: 'Kanji Meaning (English)',
          expectedInputType: 'en',
          acceptableAnswers: meanings,
          displayAnswer: kj.meaning,
          ttsAudio: kj.ex.r,
        });
      }

      // 2. Reading
      if (modeFilter === 'all' || modeFilter === 'reading') {
        const onParts = kj.on.split('、').map((s) => toHiragana(s.trim()));
        const kunClean = kj.kun.replace(/[()（）-]/g, '').split('、').map((s) => toHiragana(s.trim()));
        items.push({
          id: `r:${kj.k}`,
          kanjiObj: kj,
          kind: 'reading',
          promptDisplay: kj.k,
          subLabel: `Reading · 音: ${kj.on} · 訓: ${kj.kun}`,
          expectedInputType: 'kana',
          acceptableAnswers: [...onParts, ...kunClean],
          displayAnswer: `${kj.on} / ${kj.kun}`,
          ttsAudio: kj.ex.r,
        });
      }

      // 3. Vocab
      if (modeFilter === 'all' || modeFilter === 'vocab') {
        items.push({
          id: `v:${kj.k}`,
          kanjiObj: kj,
          kind: 'vocab',
          promptDisplay: kj.ex.w,
          subLabel: `Vocabulary Reading for ${kj.k} (${kj.ex.en})`,
          expectedInputType: 'kana',
          acceptableAnswers: [toHiragana(kj.ex.r)],
          displayAnswer: `${kj.ex.w}【${kj.ex.r}】= ${kj.ex.en}`,
          ttsAudio: kj.ex.r,
        });
      }
    }
    return items;
  }, [activeKanjiList, modeFilter]);

  const pickNext = (last?: DrillItem | null) => {
    if (!pool.length) return null;
    const candidates = pool.length > 1 && last ? pool.filter((x) => x.id !== last.id) : pool;
    return candidates[Math.floor(Math.random() * candidates.length)];
  };

  useEffect(() => {
    setCurrentItem(pickNext(null));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pool]);

  const submit = (val: string) => {
    if (!currentItem) return;
    const ok = checkAnswer(val, currentItem);
    recordKanji(currentItem.kanjiObj.k, ok);
    setSession((s) => ({ ok: s.ok + (ok ? 1 : 0), total: s.total + 1 }));
    setFlash(ok ? 'ok' : 'bad');
    if (sfxEnabled) (ok ? playDing : playMiss)();
    speak(currentItem.ttsAudio);

    if (ok) {
      setReveal(null);
    } else {
      setReveal(`${currentItem.promptDisplay} = ${currentItem.displayAnswer}`);
    }

    setCurrentItem(pickNext(currentItem));
    setInput('');
    setTimeout(() => setFlash(null), 250);
  };

  const handleInputChange = (v: string) => {
    if (currentItem?.expectedInputType === 'kana') {
      const hira = toHiragana(v);
      setInput(hira);
      if (currentItem && checkAnswer(hira, currentItem)) {
        submit(hira);
      }
    } else {
      setInput(v);
      if (currentItem && checkAnswer(v, currentItem)) {
        submit(v);
      }
    }
  };

  const badgeColor =
    currentItem?.kind === 'meaning'
      ? '#ec4899' // Pink/Magenta for Meaning
      : currentItem?.kind === 'reading'
        ? '#06b6d4' // Cyan for Reading
        : '#a855f7'; // Purple for Vocab

  const srsId = currentItem ? `k:${currentItem.kanjiObj.k}` : '';

  return (
    <div className="page">
      <div className="row-between">
        <div>
          <h1 className="nomargin">
            漢字道場 <span className="muted">WaniKani-Style Pure Kanji Dojo</span>
          </h1>
          <p className="muted small nomargin" style={{ marginTop: '0.2rem' }}>
            Fast-paced typing drills for Kanji Meanings, Readings, and Compound Words — zero radical memorization required!
          </p>
        </div>
        <div className="controls nomargin">
          {(['N5', 'N4', 'all'] as LevelFilter[]).map((lv) => (
            <button
              key={lv}
              className={level === lv ? 'chip on' : 'chip'}
              onClick={() => setLevel(lv)}
            >
              {lv === 'all' ? `All (${KANJI.length})` : `JLPT ${lv} (${KANJI.filter((k) => k.level === lv).length})`}
            </button>
          ))}
        </div>
      </div>

      {/* Mode & Batch Filters */}
      <div className="controls" style={{ marginTop: '0.8rem', flexWrap: 'wrap' }}>
        <span className="muted small" style={{ alignSelf: 'center' }}>Focus:</span>
        <button className={modeFilter === 'all' ? 'chip on' : 'chip'} onClick={() => setModeFilter('all')}>
          ⚡ All Prompts (Meaning + Reading + Vocab)
        </button>
        <button className={modeFilter === 'meaning' ? 'chip on' : 'chip'} onClick={() => setModeFilter('meaning')}>
          🌸 Meanings Only
        </button>
        <button className={modeFilter === 'reading' ? 'chip on' : 'chip'} onClick={() => setModeFilter('reading')}>
          🌊 Readings Only
        </button>
        <button className={modeFilter === 'vocab' ? 'chip on' : 'chip'} onClick={() => setModeFilter('vocab')}>
          🔮 Vocab Context Only
        </button>

        <span className="muted small" style={{ alignSelf: 'center', marginLeft: '0.4rem' }}>Batch:</span>
        {[20, 50, 150].map((b) => (
          <button
            key={b}
            className={batchRange === b ? 'chip on' : 'chip'}
            onClick={() => setBatchRange(b)}
          >
            {b === 150 ? 'All' : `First ${b}`}
          </button>
        ))}
      </div>

      {/* Main Interactive Drill Card */}
      {currentItem && (
        <div
          className={`drill ${flash ?? ''}`}
          style={{
            position: 'relative',
            borderTop: `4px solid ${badgeColor}`,
            cursor: 'text',
          }}
          onClick={() => inputRef.current?.focus()}
        >
          {/* Header Banner */}
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.45rem',
              background: badgeColor,
              color: '#fff',
              fontWeight: 700,
              fontSize: '0.85rem',
              padding: '0.3rem 0.85rem',
              borderRadius: '999px',
              textTransform: 'uppercase',
              letterSpacing: '0.5px',
            }}
          >
            {currentItem.kind === 'meaning' && '🌸 Kanji Meaning'}
            {currentItem.kind === 'reading' && '🌊 Kanji Reading'}
            {currentItem.kind === 'vocab' && '🔮 Compound Vocabulary'}
          </div>

          {/* Large Prompt */}
          <div
            className="drill-char jp"
            style={{
              fontSize: currentItem.kind === 'vocab' ? '3.6rem' : '4.6rem',
              margin: '0.4rem 0 0.1rem',
            }}
          >
            {currentItem.promptDisplay}
          </div>

          <div className="muted" style={{ marginBottom: '0.9rem', fontSize: '0.95rem' }}>
            {currentItem.subLabel}
          </div>

          {/* Typing Input */}
          <input
            ref={inputRef}
            autoFocus
            value={input}
            onChange={(e) => handleInputChange(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && input && submit(input)}
            placeholder={currentItem.expectedInputType === 'kana' ? 'type reading (romaji auto-converts to kana)…' : 'type English meaning…'}
            className="drill-input"
            style={{
              width: '320px',
              borderColor: badgeColor,
            }}
            autoComplete="off"
            autoCapitalize="off"
          />

          <div className="controls center" style={{ marginTop: '0.9rem', gap: '0.5rem' }}>
            <button
              type="button"
              className="chip"
              onClick={(e) => {
                e.stopPropagation();
                speak(currentItem.ttsAudio);
              }}
            >
              🔊 Hear Word
            </button>
            <button
              type="button"
              className={srs[srsId] ? 'chip ok' : 'chip'}
              disabled={!!srs[srsId]}
              onClick={(e) => {
                e.stopPropagation();
                addCard({
                  id: srsId,
                  kind: 'kanji',
                  front: currentItem.kanjiObj.k,
                  reading: `${currentItem.kanjiObj.on} / ${currentItem.kanjiObj.kun}`,
                  back: `${currentItem.kanjiObj.meaning} (Ex: ${currentItem.kanjiObj.ex.w})`,
                });
              }}
            >
              {srs[srsId] ? '✓ In SRS' : '+ Add to SRS'}
            </button>
            <button
              type="button"
              className="chip"
              onClick={(e) => {
                e.stopPropagation();
                submit(input || 'skip');
              }}
            >
              Skip / Reveal →
            </button>
          </div>

          {/* Answer Reveal & Session Stats */}
          <div className="drill-meta">
            {reveal ? <span className="bad-text">✗ {reveal}</span> : <span>&nbsp;</span>}
            <span>
              Session: {session.ok}/{session.total} ({session.total ? Math.round((session.ok / session.total) * 100) : 0}%)
            </span>
          </div>
        </div>
      )}

      {/* Kanji Mastery Heatmap & Weak Characters */}
      <div className="row-between" style={{ marginTop: '1.8rem', marginBottom: '0.6rem', flexWrap: 'wrap', gap: '0.6rem' }}>
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
          const weak = activeKanjiList.filter((k) => {
            const st = kanjiStats[k.k];
            return st && st.wrong > 0 && st.wrong >= st.correct;
          });
          return weak.length > 0 ? (
            <span className="chip bad">
              ⚠️ {weak.length} Struggling Kanji: {weak.map((w) => w.k).join(' ')}
            </span>
          ) : null;
        })()}
      </div>

      <div className="kanji-grid">
        {activeKanjiList.map((k) => {
          const st = kanjiStats[k.k];
          const isStruggling = st && st.wrong > 0 && st.wrong >= st.correct;
          const levelTier = !st || st.correct === 0 ? 0 : st.correct >= 3 && st.correct > st.wrong * 2 ? 2 : 1;
          const borderStyle = isStruggling
            ? '3px solid var(--bad)'
            : levelTier === 2
              ? '3px solid var(--ok)'
              : levelTier === 1
                ? '3px solid var(--accent)'
                : '1px solid var(--border)';
          return (
            <div
              key={k.k}
              className={`kanji-cell${srs[`k:${k.k}`] ? ' in' : ''}`}
              style={{
                borderBottom: borderStyle,
                cursor: 'pointer',
              }}
              onClick={() => speak(k.ex.r)}
              title={`${k.meaning} (${k.on} / ${k.kun}) - Click for audio`}
            >
              <span>{k.k}</span>
              <small>{k.meaning.split(',')[0]}</small>
              <small style={{ fontSize: '0.62rem', opacity: 0.7 }}>{k.level}</small>
            </div>
          );
        })}
      </div>
    </div>
  );
}
