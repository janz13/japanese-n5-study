import { useState } from 'react';
import { Link } from 'react-router-dom';
import { isDue, useStore } from '../lib/store';
import { HIRAGANA, KATAKANA } from '../data/kana';
import { STORIES } from '../data/stories';
import { KANJI } from '../data/kanji';
import { LESSONS } from '../data/grammar';
import { lessonUnlocked, storyUnlocked } from '../lib/progress';

export default function Dashboard() {
  const p = useStore();
  const {
    kanaStats,
    streak,
    completedStories,
    srs,
    grammarDone,
    examBest,
    theme,
    showFurigana,
    toggleTheme,
    toggleFurigana,
    resetProgress,
  } = p;
  const [confirmReset, setConfirmReset] = useState(false);

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

  return (
    <div className="page">
      <h1 className="hero">こんにちは <span className="muted">— let's study.</span></h1>

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
        <div className="stat"><b>{Object.keys(completedStories).length}/{STORIES.length}</b><span>stories</span></div>
      </div>

      <div className="grid">
        <Link to="/kana" className="tile"><span className="big">あ</span>Kana Dojo<small>Typing &amp; Yōon drills</small></Link>
        <Link to="/review" className="tile"><span className="big">復</span>Review<small>{due} due</small></Link>
        <Link to="/kanji" className="tile"><span className="big">漢</span>Kanji<small>103 N5 · Search &amp; write</small></Link>
        <Link to="/grammar" className="tile"><span className="big">文</span>Grammar<small>Unlock chapters</small></Link>
        <Link to="/stories" className="tile"><span className="big">物語</span>Stories<small>Read &amp; listen</small></Link>
        <Link to="/speaking" className="tile"><span className="big">話</span>Speaking<small>Role-play dialogues</small></Link>
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
      </div>
    </div>
  );
}
