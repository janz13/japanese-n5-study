import { useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { isDue, todayStr, useStore } from '../lib/store';
import { HIRAGANA, KATAKANA } from '../data/kana';
import { STORIES } from '../data/stories';
import { KANJI } from '../data/kanji';
import { LESSONS } from '../data/grammar';
import { STAMPS } from '../data/stamps';
import { lessonUnlocked, storyUnlocked } from '../lib/progress';
import { useEarnedStamps } from './StampBook';

export default function Dashboard() {
  const p = useStore();
  const {
    kanaStats,
    streak,
    completedStories,
    srs,
    grammarDone,
    examBest,
    bentoCount,
    lastBentoDate,
    sfxEnabled,
    theme,
    showFurigana,
    ttsRate,
    toggleTheme,
    toggleFurigana,
    toggleSfx,
    setTtsRate,
    importData,
    resetProgress,
  } = p;
  const [confirmReset, setConfirmReset] = useState(false);
  const [importMsg, setImportMsg] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const earnedStamps = useEarnedStamps();
  const bentoDoneToday = lastBentoDate === todayStr();

  const practiced = (list: typeof HIRAGANA) => list.filter((k) => (kanaStats[k.kana]?.correct ?? 0) >= 1).length;
  const due = Object.values(srs).filter((i) => isDue(i)).length;

  // Suggest the next step on the story path
  const nextStep = (() => {
    for (const l of LESSONS) {
      const story = STORIES.find((s) => s.chapter === l.chapter);
      if (lessonUnlocked(l.chapter, p) && !storyUnlocked(l.chapter, p))
        return { to: `/grammar/${l.id}`, label: `Grammar lesson ${l.chapter}: ${l.title}` };
      if (story && storyUnlocked(story.chapter, p) && !(story.id in completedStories))
        return { to: `/stories/${story.id}`, label: `Story Ch.${story.chapter}: ${story.title}` };
    }
    return null;
  })();

  const exportProgress = () => {
    const payload = {
      kanaStats: p.kanaStats,
      savedWords: p.savedWords,
      srs: p.srs,
      completedStories: p.completedStories,
      grammarDone: p.grammarDone,
      scenesDone: p.scenesDone,
      examBest: p.examBest,
      streak: p.streak,
      lastStudy: p.lastStudy,
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `japanese-n5-backup-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const onImportFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const parsed = JSON.parse(String(reader.result));
        importData(parsed);
        setImportMsg('✓ Progress imported!');
        setTimeout(() => setImportMsg(null), 3000);
      } catch {
        setImportMsg('✗ Invalid backup JSON file.');
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="page">
      <h1 className="hero">こんにちは <span className="muted">— let's study.</span></h1>

      {/* Guided Daily 5-Minute Bento CTA */}
      <div className="bento-banner">
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', flexWrap: 'wrap' }}>
            <span className="tag" style={{ fontWeight: 600 }}>
              {bentoDoneToday ? '✓ TODAY’S BENTO COMPLETED' : '🍱 GUIDED DAILY WORKOUT'}
            </span>
            <span className="muted small">· {bentoCount} Bentos finished · {earnedStamps.length}/{STAMPS.length} Stamps</span>
          </div>
          <h2 style={{ margin: '0.25rem 0 0.2rem', fontSize: '1.35rem' }}>
            Today&apos;s 5-Minute Bento <span className="jp muted">(今日の弁当)</span>
          </h2>
          <p className="muted small nomargin">
            1-click daily routine: 5 rapid-fire warm-ups → due SRS cards → 1 Kanji trace + street sign decoder.
          </p>
        </div>
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', alignItems: 'center' }}>
          <Link to="/bento" className="chip on" style={{ padding: '0.65rem 1.3rem', fontWeight: 600 }}>
            {bentoDoneToday ? '🍱 Practice Another Bento →' : '🍱 Start Today’s Bento (5 min) →'}
          </Link>
          <Link to="/stamps" className="chip">
            印 Stamp Book ({earnedStamps.length}/{STAMPS.length})
          </Link>
        </div>
      </div>

      {(due > 0 || nextStep) && (
        <div className="next-row">
          {due > 0 && <Link to="/review" className="next-card accent">復習 <b>{due}</b> cards due →</Link>}
          {nextStep && <Link to={nextStep.to} className="next-card">Continue: {nextStep.label} →</Link>}
        </div>
      )}

      <div className="stats">
        <div className="stat"><b>{streak}</b><span>day streak 🔥</span></div>
        <div className="stat"><b>{practiced(HIRAGANA)}/{HIRAGANA.length}</b><span>hiragana</span></div>
        <div className="stat"><b>{practiced(KATAKANA)}/{KATAKANA.length}</b><span>katakana</span></div>
        <div className="stat"><b>{Object.values(srs).filter((i) => i.kind === 'kanji').length}/{KANJI.length}</b><span>kanji in deck</span></div>
        <div className="stat"><b>{Object.keys(grammarDone).length}/{LESSONS.length}</b><span>lessons</span></div>
        <div className="stat"><b>{earnedStamps.length}/{STAMPS.length}</b><span>eki-stamps 印</span></div>
      </div>

      <div className="grid">
        <Link to="/bento" className="tile"><span className="big">弁</span>Daily Bento<small>5-min guided loop</small></Link>
        <Link to="/kana" className="tile"><span className="big">あ</span>Kana Dojo<small>Typing &amp; Yōon drills</small></Link>
        <Link to="/kanji" className="tile"><span className="big">漢</span>Kanji<small>103 N5 · Search &amp; write</small></Link>
        <Link to="/conjugate" className="tile"><span className="big">活</span>Conjugation<small>Verbs &amp; adjectives</small></Link>
        <Link to="/counters" className="tile"><span className="big">数</span>Counters<small>助数詞 · Dates &amp; numbers</small></Link>
        <Link to="/review" className="tile"><span className="big">復</span>Review<small>{due} due · {Object.keys(srs).length} total</small></Link>
        <Link to="/grammar" className="tile"><span className="big">文</span>Grammar<small>Unlock chapters</small></Link>
        <Link to="/stories" className="tile"><span className="big">物語</span>Stories<small>Read &amp; listen</small></Link>
        <Link to="/speaking" className="tile"><span className="big">話</span>Speaking<small>Role-play dialogues</small></Link>
        <Link to="/listening" className="tile"><span className="big">聴</span>Listening<small>JLPT-style 聴解 drills</small></Link>
        <Link to="/signs" className="tile"><span className="big">看板</span>Sign Decoder<small>Station · Konbini · Izakaya</small></Link>
        <Link to="/stamps" className="tile"><span className="big">印</span>Stamp Book<small>{earnedStamps.length}/{STAMPS.length} Goshuin &amp; Eki</small></Link>
        <Link to="/exam" className="tile"><span className="big">試</span>Mock Exam<small>{examBest !== null ? `Best: ${examBest}%` : 'Timed N5 test'}</small></Link>
      </div>

      <h2>設定 <span className="muted">Settings &amp; Data</span></h2>
      <div className="gp">
        <div className="controls">
          <button className="chip on" onClick={toggleTheme}>
            {theme === 'dark' ? '☀️ Switch to Light Theme' : '🌙 Switch to Dark Theme'}
          </button>
          <button className={showFurigana ? 'chip on' : 'chip'} onClick={toggleFurigana}>
            ふりがな Furigana: {showFurigana ? 'ON' : 'OFF'}
          </button>
          <button className={sfxEnabled ? 'chip on' : 'chip'} onClick={toggleSfx}>
            🔔 Sound Effects: {sfxEnabled ? 'ON' : 'OFF'}
          </button>
          <span className="muted small" style={{ alignSelf: 'center', marginLeft: '0.3rem' }}>
            🔊 Audio Speed:
          </span>
          {([0.75, 0.9, 1.0] as const).map((r) => (
            <button key={r} className={ttsRate === r ? 'chip on' : 'chip'} onClick={() => setTtsRate(r)}>
              {r === 0.75 ? '0.75x Slow' : r === 0.9 ? '0.9x Normal' : '1.0x Native'}
            </button>
          ))}
        </div>
        <div className="controls" style={{ marginTop: '0.6rem' }}>
          <button className="chip" onClick={exportProgress}>📥 Export Backup (JSON)</button>
          <button className="chip" onClick={() => fileRef.current?.click()}>📤 Import Backup</button>
          <input ref={fileRef} type="file" accept=".json" style={{ display: 'none' }} onChange={onImportFile} />
          {!confirmReset ? (
            <button className="chip bad" onClick={() => setConfirmReset(true)}>
              🗑️ Reset All Progress
            </button>
          ) : (
            <>
              <button
                className="chip bad"
                onClick={() => {
                  resetProgress();
                  setConfirmReset(false);
                }}
              >
                ⚠️ Confirm Reset Progress
              </button>
              <button className="chip" onClick={() => setConfirmReset(false)}>
                Cancel
              </button>
            </>
          )}
        </div>
        {importMsg && <p className="small ok-text">{importMsg}</p>}
      </div>
    </div>
  );
}
