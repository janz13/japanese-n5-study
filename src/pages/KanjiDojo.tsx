import { useEffect, useMemo, useRef, useState } from 'react';
import { toHiragana } from 'wanakana';
import { KANJI, type Kanji } from '../data/kanji';
import { useStore } from '../lib/store';
import { speak } from '../lib/tts';
import { playDing, playFanfare, playMiss } from '../lib/sfx';
import { useCampaignMission } from '../lib/useCampaignMission';
import CampaignBanner from '../components/CampaignBanner';
import ConfuserSpeedSorter from '../components/ConfuserSpeedSorter';
import { DeckBag } from '../lib/deckSampler';

type PromptKind = 'meaning' | 'reading' | 'vocab';
type ModeFilter = 'all' | 'meaning' | 'reading' | 'vocab' | 'confuser';
type LevelFilter = 'N5' | 'N4' | 'all';

interface DrillItem {
  id: string;
  kanjiObj: Kanji;
  kind: PromptKind;
  promptDisplay: string;
  subLabel: string;
  hintText?: string;
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
    const cleanHira = asHira.replace(/[・()（）]/g, '');
    return item.acceptableAnswers.some((ans) => {
      const cleanAns = normalize(ans).replace(/[・()（）]/g, '');
      return clean === cleanAns || asHira === cleanAns || cleanHira === cleanAns || clean === toHiragana(cleanAns);
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
  const {
    isCampaignMode,
    stage,
    saga,
    targetItems,
    completeMission,
    returnToCampaign,
  } = useCampaignMission();

  const CAMPAIGN_DRILL_GOAL = 5;
  const [missionModalOpen, setMissionModalOpen] = useState(false);
  const [missionTriggered, setMissionTriggered] = useState(false);

  const [level, setLevel] = useState<LevelFilter>('N5');
  const [modeFilter, setModeFilter] = useState<ModeFilter>('all');
  const [batchRange, setBatchRange] = useState<number>(150); // All in level by default (vs 20, 50)
  const [currentItem, setCurrentItem] = useState<DrillItem | null>(null);
  const [input, setInput] = useState('');
  const [flash, setFlash] = useState<'ok' | 'bad' | null>(null);
  const [reveal, setReveal] = useState<string | null>(null);
  const [showReadingHint, setShowReadingHint] = useState(false);
  const [showGrid, setShowGrid] = useState(false);
  const [session, setSession] = useState({ ok: 0, total: 0 });
  const inputRef = useRef<HTMLInputElement>(null);
  const bagRef = useRef<DeckBag<DrillItem> | null>(null);
  const kanjiStatsRef = useRef(kanjiStats);
  useEffect(() => {
    kanjiStatsRef.current = kanjiStats;
  }, [kanjiStats]);

  const activeKanjiList = useMemo(() => {
    if (isCampaignMode && targetItems && targetItems.length > 0) {
      const cleanTargets = targetItems.map((t) => t.trim());
      return KANJI.filter((k) => cleanTargets.includes(k.k));
    }
    let list = KANJI;
    if (level !== 'all') list = list.filter((k) => k.level === level);
    if (batchRange < list.length) list = list.slice(0, batchRange);
    return list;
  }, [isCampaignMode, targetItems, level, batchRange]);

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
          ttsAudio: kj.sound,
        });
      }

      // 2. Reading
      if (modeFilter === 'all' || modeFilter === 'reading') {
        const onParts = kj.on.split('、').map((s) => toHiragana(s.trim()));
        const kunParts: string[] = [];
        kj.kun.split('、').forEach((s) => {
          const raw = s.trim();
          if (!raw || raw === '-') return;
          const full = raw.replace(/[()（）-]/g, '').trim();
          if (full) kunParts.push(toHiragana(full));
          const stemMatch = raw.match(/^([^(（]+)[(（]/);
          if (stemMatch && stemMatch[1]) {
            const stem = stemMatch[1].replace(/[-]/g, '').trim();
            if (stem) kunParts.push(toHiragana(stem));
          }
        });
        items.push({
          id: `r:${kj.k}`,
          kanjiObj: kj,
          kind: 'reading',
          promptDisplay: kj.k,
          subLabel: `Kanji Reading (${kj.meaning.split(',')[0]}) — type On or Kun reading`,
          hintText: `音: ${kj.on} · 訓: ${kj.kun}`,
          expectedInputType: 'kana',
          acceptableAnswers: [...onParts, ...kunParts],
          displayAnswer: `${kj.on} / ${kj.kun}`,
          ttsAudio: kj.sound,
        });
      }

      // 3. Vocab (all rich compounds for this kanji)
      if (modeFilter === 'all' || modeFilter === 'vocab') {
        kj.compounds.forEach((comp, cIdx) => {
          items.push({
            id: `v:${kj.k}:${cIdx}`,
            kanjiObj: kj,
            kind: 'vocab',
            promptDisplay: comp.w,
            subLabel: `Vocabulary Reading for ${kj.k} (${comp.en})${comp.sentenceJp ? ` · 例文: ${comp.sentenceJp}` : ''}`,
            expectedInputType: 'kana',
            acceptableAnswers: [toHiragana(comp.r)],
            displayAnswer: `${comp.w}【${comp.r}】= ${comp.en}`,
            ttsAudio: comp.r,
          });
        });
      }
    }
    return items;
  }, [activeKanjiList, modeFilter]);

  useEffect(() => {
    if (!pool.length) {
      bagRef.current = null;
      setCurrentItem(null);
      return;
    }
    const bag = new DeckBag<DrillItem>(
      pool,
      (item) => item.id,
      isCampaignMode ? undefined : `kanji_dojo_${level}_${modeFilter}`,
      (item) => {
        const st = kanjiStatsRef.current[item.kanjiObj.k] ?? { correct: 0, wrong: 0 };
        return 1 + (st.wrong * 2) / (1 + st.correct * 0.5);
      },
    );
    bagRef.current = bag;
    setShowReadingHint(false);
    setCurrentItem(bag.next());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pool]);

  const submit = (val: string) => {
    if (!currentItem) return;
    const ok = checkAnswer(val, currentItem);
    recordKanji(currentItem.kanjiObj.k, ok);
    if (!ok) {
      bagRef.current?.requeueMissed(currentItem, 4);
    }
    const nextTotal = session.total + 1;
    const nextOk = session.ok + (ok ? 1 : 0);
    setSession({ ok: nextOk, total: nextTotal });

    if (isCampaignMode && nextOk >= CAMPAIGN_DRILL_GOAL && !missionTriggered) {
      setMissionTriggered(true);
      completeMission();
      if (sfxEnabled) playFanfare();
      setMissionModalOpen(true);
    }
    setFlash(ok ? 'ok' : 'bad');
    if (sfxEnabled) (ok ? playDing : playMiss)();
    speak(currentItem.ttsAudio);

    if (ok) {
      setReveal(null);
    } else {
      setReveal(`${currentItem.promptDisplay} = ${currentItem.displayAnswer}`);
    }

    setShowReadingHint(false);
    setCurrentItem(bagRef.current?.next() ?? pool[0] ?? null);
    setInput('');
    setTimeout(() => setFlash(null), 250);
  };

  const handleInputChange = (v: string) => {
    if (currentItem?.expectedInputType === 'kana') {
      const hira = toHiragana(v, { IMEMode: true });
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
      {isCampaignMode && stage && (
        <CampaignBanner
          stage={stage}
          saga={saga}
          currentProgress={Math.min(session.total, CAMPAIGN_DRILL_GOAL)}
          totalGoal={CAMPAIGN_DRILL_GOAL}
          onReturn={returnToCampaign}
        />
      )}

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
          {isCampaignMode && targetItems && targetItems.length > 0 ? (
            <span className="tag" style={{ background: 'var(--accent)', color: '#000', fontWeight: 700 }}>
              CAMPAIGN SCOPED
            </span>
          ) : (
            (['N5', 'N4', 'all'] as LevelFilter[]).map((lv) => (
              <button
                key={lv}
                className={level === lv ? 'chip on' : 'chip'}
                onClick={() => setLevel(lv)}
              >
                {lv === 'all' ? `All (${KANJI.length})` : `JLPT ${lv} (${KANJI.filter((k) => k.level === lv).length})`}
              </button>
            ))
          )}
        </div>
      </div>

      {isCampaignMode && targetItems && targetItems.length > 0 && (
        <div
          className="controls"
          style={{
            background: 'var(--surface2)',
            padding: '0.6rem 0.9rem',
            borderRadius: '8px',
            marginTop: '0.8rem',
            borderLeft: '3px solid var(--accent)',
            display: 'flex',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '0.5rem',
          }}
        >
          <span className="muted small">🎯 Mission Target Kanji ({targetItems.length}):</span>
          {targetItems.map((k) => (
            <span key={k} className="chip on jp" style={{ fontWeight: 700 }}>
              {k}
            </span>
          ))}
        </div>
      )}

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
        <button className={modeFilter === 'confuser' ? 'chip on' : 'chip'} onClick={() => setModeFilter('confuser')}>
          🎯 Confuser Speed Sorter
        </button>

        {(!isCampaignMode || !targetItems || targetItems.length === 0) && (
          <>
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
          </>
        )}
      </div>

      {/* Main Interactive Drill Card or Confuser Sorter */}
      {modeFilter === 'confuser' ? (
        <div style={{ marginTop: '1.2rem' }}>
          <ConfuserSpeedSorter kind="kanji" />
        </div>
      ) : (
        currentItem && (
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

          <div className="muted" style={{ marginBottom: '0.6rem', fontSize: '0.95rem' }}>
            {currentItem.subLabel}
          </div>

          {showReadingHint && currentItem.hintText && (
            <div className="chip on jp small" style={{ marginBottom: '0.7rem', cursor: 'default' }}>
              💡 {currentItem.hintText}
            </div>
          )}

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
              width: 'min(320px, 100%)',
              borderColor: badgeColor,
            }}
            autoComplete="off"
            autoCapitalize="off"
          />

          <div className="controls center" style={{ marginTop: '0.9rem', gap: '0.5rem' }}>
            {currentItem.hintText && (
              <button
                type="button"
                className={showReadingHint ? 'chip on' : 'chip'}
                onClick={(e) => {
                  e.stopPropagation();
                  setShowReadingHint((h) => !h);
                }}
              >
                💡 {showReadingHint ? 'Hide Hint' : 'Reading Hint'}
              </button>
            )}
            <button
              type="button"
              className="chip"
              onClick={(e) => {
                e.stopPropagation();
                speak(currentItem.ttsAudio);
              }}
            >
              🔊 {currentItem.kind === 'vocab' ? 'Hear Vocab' : 'Hear Kanji'}
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
        )
      )}

      {/* Collapsible Kanji Mastery Grid */}
      <div className="row-between" style={{ marginTop: '1.3rem', marginBottom: '0.6rem', flexWrap: 'wrap', gap: '0.6rem' }}>
        <button
          type="button"
          className="disclosure-toggle"
          onClick={() => setShowGrid((g) => !g)}
        >
          📊 Kanji Mastery Grid ({activeKanjiList.length}) {showGrid ? '▴' : '▾'}
        </button>

        {(() => {
          const weak = activeKanjiList.filter((k) => {
            const st = kanjiStats[k.k];
            return st && st.wrong > 0 && st.wrong >= st.correct;
          });
          return weak.length > 0 ? (
            <span className="chip bad">
              ⚠️ {weak.length} Struggling: {weak.map((w) => w.k).join(' ')}
            </span>
          ) : null;
        })()}
      </div>

      {showGrid && (
        <>
          <div className="controls" style={{ gap: '0.45rem', alignItems: 'center', marginBottom: '0.6rem' }}>
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
        </>
      )}

      {missionModalOpen && stage && (
        <div
          className="completion-modal-overlay"
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.7)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '1rem',
          }}
        >
          <div
            style={{
              background: 'var(--surface)',
              border: '2px solid var(--accent)',
              borderRadius: '16px',
              padding: '1.8rem 2rem',
              maxWidth: '460px',
              width: '100%',
              textAlign: 'center',
              boxShadow: '0 12px 40px rgba(0,0,0,0.6)',
            }}
          >
            <div style={{ fontSize: '3rem', marginBottom: '0.4rem' }}>🎉</div>
            <h2 className="nomargin" style={{ fontSize: '1.4rem' }}>Mission Completed!</h2>
            <p className="muted small" style={{ margin: '0.5rem 0 1rem' }}>
              You completed the 5 required practice drills for <b>{stage.title}</b>. Your campaign progress has been saved!
            </p>
            <div
              style={{
                background: 'var(--surface2)',
                padding: '0.65rem 1rem',
                borderRadius: '8px',
                marginBottom: '1.3rem',
                fontWeight: 600,
              }}
            >
              Session Result: {session.ok} / {session.total} correct ({session.total > 0 ? Math.round((session.ok / session.total) * 100) : 100}%)
            </div>
            <div className="controls center" style={{ gap: '0.8rem', justifyContent: 'center' }}>
              <button
                type="button"
                className="chip on"
                style={{
                  padding: '0.6rem 1.4rem',
                  fontWeight: 700,
                  background: 'var(--accent)',
                  color: '#000',
                  cursor: 'pointer',
                }}
                onClick={returnToCampaign}
              >
                🗺️ Return to Campaign Map →
              </button>
              <button
                type="button"
                className="chip"
                onClick={() => setMissionModalOpen(false)}
              >
                Keep Drilling
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
