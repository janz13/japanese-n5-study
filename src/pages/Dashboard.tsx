import { useMemo, useRef, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { isDue, todayStr, useStore } from '../lib/store';
import { HIRAGANA, KATAKANA } from '../data/kana';
import { STORIES } from '../data/stories';
import { KANJI } from '../data/kanji';
import { LESSONS } from '../data/grammar';
import { SCENES } from '../data/scenes';
import { STAMPS } from '../data/stamps';
import { PARTICLES } from '../data/particles';
import { COUNTERS } from '../data/counters';
import { VERB_PAIRS } from '../data/verbPairs';
import { lessonUnlocked, storyUnlocked } from '../lib/progress';
import { speak } from '../lib/tts';
import { playDing, playFanfare, playMiss } from '../lib/sfx';
import { useEarnedStamps } from './StampBook';

interface RepairItem {
  id: string;
  tag: string;
  prompt: string;
  sub: string;
  options: string[];
  answer: string;
  explain: string;
  audio: string;
}

export default function Dashboard() {
  const location = useLocation();
  const p = useStore();
  const {
    kanaStats,
    streak,
    completedStories,
    srs,
    grammarDone,
    scenesDone,
    examBest,
    examHistory,
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
  const [repairOpen, setRepairOpen] = useState(false);
  const [repairSeed, setRepairSeed] = useState(0);
  const [repairIdx, setRepairIdx] = useState(0);
  const [repairPicked, setRepairPicked] = useState<string | null>(null);
  const [repairScore, setRepairScore] = useState(0);
  const [activeCategory, setActiveCategory] = useState<'all' | 'practice' | 'immersion'>('all');
  const [settingsOpen, setSettingsOpen] = useState(() => location.pathname === '/settings');
  const [prevPath, setPrevPath] = useState(location.pathname);

  if (location.pathname !== prevPath) {
    setPrevPath(location.pathname);
    if (location.pathname === '/settings') {
      setSettingsOpen(true);
    }
  }

  const fileRef = useRef<HTMLInputElement>(null);
  const settingsRef = useRef<HTMLDivElement>(null);
  const earnedStamps = useEarnedStamps();
  const earnedStampCount = Object.keys(earnedStamps).length;
  const bentoDoneToday = lastBentoDate === todayStr();

  const practiced = (list: typeof HIRAGANA) => list.filter((k) => (kanaStats[k.kana]?.correct ?? 0) >= 1).length;
  const due = Object.values(srs).filter((i) => isDue(i)).length;

  const weakKanaList = useMemo(
    () =>
      Object.entries(kanaStats)
        .filter(([, st]) => st.wrong > 0)
        .sort((a, b) => b[1].wrong - a[1].wrong)
        .map(([k]) => k)
        .slice(0, 6),
    [kanaStats],
  );

  const recentWeakMondai = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const cert of examHistory ?? []) {
      for (const m of cert.weakMondai ?? []) {
        counts[m] = (counts[m] ?? 0) + 1;
      }
    }
    return Object.entries(counts)
      .sort((a, b) => b[1] - a[1])
      .map(([m]) => m)
      .slice(0, 3);
  }, [examHistory]);

  // Build a 5-question Weak-Spot & Trap Repair Drill
  const repairQuestions = useMemo<RepairItem[]>(() => {
    const out: RepairItem[] = [];
    // 1. Any missed kana
    const allKana = [...HIRAGANA, ...KATAKANA];
    for (const wk of weakKanaList.slice(0, 2)) {
      const kObj = allKana.find((x) => x.kana === wk);
      if (kObj) {
        const distractors = allKana
          .filter((x) => x.romaji !== kObj.romaji)
          .sort(() => Math.random() - 0.5)
          .slice(0, 3)
          .map((x) => x.romaji);
        out.push({
          id: `rk-${wk}`,
          tag: '⚠️ Missed Kana Repair',
          prompt: kObj.kana,
          sub: 'Select the correct romaji reading:',
          options: [kObj.romaji, ...distractors].sort(() => Math.random() - 0.5),
          answer: kObj.romaji,
          explain: `${kObj.kana} = ${kObj.romaji}`,
          audio: kObj.kana,
        });
      }
    }

    // 2. High-trap Counter sound changes
    const trapCounters = COUNTERS.filter((c) => c.irregular).sort(() => Math.random() - 0.5);
    for (const tc of trapCounters.slice(0, 2)) {
      const distractors = COUNTERS.filter((c) => c.group === tc.group && c.kana !== tc.kana)
        .slice(0, 3)
        .map((c) => c.kana);
      out.push({
        id: `rc-${tc.id}`,
        tag: '⚡ Irregular Counter Trap',
        prompt: `${tc.kanji} (${tc.en})`,
        sub: 'Choose the exact phonetic reading:',
        options: [tc.kana, ...distractors].sort(() => Math.random() - 0.5),
        answer: tc.kana,
        explain: tc.rule,
        audio: tc.kana,
      });
    }

    // 3. Particle trap
    const pt = PARTICLES[Math.floor(Math.random() * PARTICLES.length)];
    out.push({
      id: `rp-${pt.id}`,
      tag: '助 Particle Trap',
      prompt: `${pt.before}（　）${pt.after}`,
      sub: pt.en,
      options: [...pt.options].sort(() => Math.random() - 0.5),
      answer: pt.answer,
      explain: pt.why,
      audio: pt.audio,
    });

    // 4. Transitive vs Intransitive Verb Pair
    const vp = VERB_PAIRS[Math.floor(Math.random() * VERB_PAIRS.length)];
    out.push({
      id: `rvp-${vp.id}`,
      tag: '🔄 Transitive vs. Intransitive',
      prompt: vp.intransitive.exampleJp.replace(/【[^】]+】/, '（　　）'),
      sub: vp.intransitive.exampleEn,
      options: [
        `${vp.intransitive.kanji}（${vp.intransitive.kana}）`,
        `${vp.transitive.kanji}（${vp.transitive.kana}）`,
      ],
      answer: `${vp.intransitive.kanji}（${vp.intransitive.kana}）`,
      explain: `Subject takes が → 自動詞 ${vp.intransitive.kanji} (${vp.intransitive.en}).`,
      audio: vp.intransitive.exampleKana,
    });

    return out.slice(0, 5);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [weakKanaList, repairSeed]);

  const curRepair = repairQuestions[repairIdx];

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
    const s = useStore.getState();
    const payload = {
      version: 10,
      exportedAt: new Date().toISOString(),
      kanaStats: s.kanaStats,
      kanjiStats: s.kanjiStats,
      conjLessonsDone: s.conjLessonsDone,
      campaignClearedSagas: s.campaignClearedSagas,
      campaignCompletedStages: s.campaignCompletedStages,
      savedWords: s.savedWords,
      srs: s.srs,
      completedStories: s.completedStories,
      grammarDone: s.grammarDone,
      scenesDone: s.scenesDone,
      examBest: s.examBest,
      examHistory: s.examHistory,
      bentoCount: s.bentoCount,
      lastBentoDate: s.lastBentoDate,
      unlockedStamps: s.unlockedStamps,
      decodedSigns: s.decodedSigns,
      shokkenkiDone: s.shokkenkiDone,
      shokkenkiMissionIdx: s.shokkenkiMissionIdx,
      terminalDone: s.terminalDone,
      terminalMissionIndices: s.terminalMissionIndices,
      multiVectorItems: s.multiVectorItems,
      ghosts: s.ghosts,
      streak: s.streak,
      lastStudy: s.lastStudy,
      streakShields: s.streakShields,
      lastShieldUsedDate: s.lastShieldUsedDate,
      vacationMode: s.vacationMode,
      vacationStartDate: s.vacationStartDate,
      nutritionPlate: s.nutritionPlate,
      furiganaMode: s.furiganaMode,
      showFurigana: s.showFurigana,
      theme: s.theme,
      ttsRate: s.ttsRate,
      sfxEnabled: s.sfxEnabled,
      dailyNewCardsCap: s.dailyNewCardsCap,
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `japanese-n5-backup-${todayStr()}.json`;
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

  const practicedKana = practiced(HIRAGANA) + practiced(KATAKANA);
  const totalKana = HIRAGANA.length + KATAKANA.length;
  const kanaPct = Math.round((practicedKana / totalKana) * 100);
  const kanjiInDeck = Object.values(srs).filter((i) => i.kind === 'kanji').length;
  const kanjiPct = Math.round((kanjiInDeck / KANJI.length) * 100);
  const grammarPct = Math.round((Object.keys(grammarDone).length / LESSONS.length) * 100);
  const storyPct = Math.round((Object.keys(completedStories).length / STORIES.length) * 100);
  const speakStampDone = Object.keys(scenesDone).length + earnedStampCount;
  const speakStampTotal = SCENES.length + STAMPS.length;
  const speakStampPct = Math.round((speakStampDone / speakStampTotal) * 100);
  const examPct = examBest ?? 0;

  const practiceModules = [
    { to: '/kana', icon: 'あ', title: 'Kana Dojo', sub: `${practicedKana}/${totalKana} practiced` },
    { to: '/kanji-dojo', icon: '漢', title: 'Kanji Typing Dojo', sub: 'Meaning, reading & vocab' },
    { to: '/kanji', icon: '字', title: 'Kanji Reference', sub: `${kanjiInDeck}/${KANJI.length} in deck · Strokes` },
    { to: '/grammar', icon: '文', title: 'Grammar Lessons', sub: `${Object.keys(grammarDone).length}/${LESSONS.length} completed` },
    { to: '/conjugate', icon: '活', title: 'Verbs & Conjugation', sub: 'Groups, Te-form & pairs' },
    { to: '/particles', icon: '助', title: 'Particles & Onomatopoeia', sub: 'は/が/を & sound words' },
    { to: '/counters', icon: '数', title: 'Counters & Numbers', sub: 'Dates, times & 助数詞' },
  ];

  const immersionModules = [
    { to: '/stories', icon: '📖', title: 'Graded Stories', sub: `${Object.keys(completedStories).length}/${STORIES.length} chapters read` },
    { to: '/speaking', icon: '🎤', title: 'Speaking Scenarios', sub: `${Object.keys(scenesDone).length}/${SCENES.length} role-plays` },
    { to: '/listening', icon: '🎧', title: 'Listening & Pitch', sub: 'Comprehension & accent' },
    { to: '/signs', icon: '🍜', title: 'Signs & Ticket Machines', sub: 'Shokkenki, Conbini & menus' },
    { to: '/drive', icon: '📻', title: 'Drive Mode Podcast', sub: 'Hands-free audio drills' },
    { to: '/exam', icon: '🎓', title: 'JLPT Mock Exam', sub: examBest !== null ? `Best score: ${examBest}%` : 'Full timed N5 simulator' },
    { to: '/stamps', icon: '🔖', title: 'Eki-Stamp Book', sub: `${earnedStampCount}/${STAMPS.length} collected` },
  ];

  const visibleModuleGroups = [
    ...(activeCategory === 'all' || activeCategory === 'practice'
      ? [{ heading: '⚡ Core Practice & Dojos', items: practiceModules }]
      : []),
    ...(activeCategory === 'all' || activeCategory === 'immersion'
      ? [{ heading: '🏮 Immersion, Real-World & Exam', items: immersionModules }]
      : []),
  ];

  return (
    <div className="page">
      {/* 1. Top Greeting Row & Compact Status Pills */}
      <div className="row-between" style={{ marginTop: '0.5rem', marginBottom: '0.4rem' }}>
        <h1 className="hero nomargin">
          こんにちは <span className="muted">— let&apos;s study.</span>
        </h1>
        <div className="status-pills">
          <span className="chip" style={{ cursor: 'default' }}>🔥 {streak}d streak</span>
          <Link to="/review" className={due > 0 ? 'chip on' : 'chip'}>
            🗂️ {due} due
          </Link>
          <Link to="/stamps" className="chip">
            🔖 {earnedStampCount}/{STAMPS.length} stamps
          </Link>
          <button
            type="button"
            className={settingsOpen ? 'chip on' : 'chip'}
            onClick={() => {
              const opening = !settingsOpen;
              setSettingsOpen(opening);
              if (opening) {
                setTimeout(() => settingsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' }), 50);
              }
            }}
          >
            ⚙️ Settings
          </button>
        </div>
      </div>

      {/* 2. Primary "Today's Focus" Card */}
      <div className="bento-banner">
        <div style={{ flex: '1 1 320px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
            <span className="tag" style={{ background: 'var(--accent)', color: '#000', fontWeight: 700 }}>
              🗺️ GUIDED CAMPAIGN
            </span>
            <span className="tag" style={{ fontWeight: 600 }}>
              {bentoDoneToday ? '✓ BENTO DONE TODAY' : '🍱 5-MIN DAILY ROUTINE'}
            </span>
          </div>
          <h2 style={{ margin: '0.35rem 0 0.2rem', fontSize: '1.35rem' }}>
            Today&apos;s Study Focus
          </h2>
          <p className="muted small nomargin">
            {nextStep
              ? `Up next: ${nextStep.label}`
              : 'Follow the step-by-step Campaign Odyssey or complete a 5-minute Daily Bento.'}
          </p>
        </div>
        <div style={{ display: 'flex', gap: '0.55rem', flexWrap: 'wrap', alignItems: 'center' }}>
          <Link
            to="/campaign"
            className="chip on"
            style={{ padding: '0.65rem 1.25rem', fontWeight: 700, background: 'var(--accent)', color: '#000' }}
          >
            🗺️ Continue Campaign →
          </Link>
          <Link to="/bento" className="chip on" style={{ padding: '0.65rem 1.1rem', fontWeight: 600 }}>
            {bentoDoneToday ? '🍱 Practice Bento →' : '🍱 Start 5-Min Bento →'}
          </Link>
          {due > 0 && (
            <Link to="/review" className="chip" style={{ padding: '0.65rem 1rem', fontWeight: 600 }}>
              🗂️ Review {due} Due →
            </Link>
          )}
        </div>
      </div>

      {/* 3. Categorized Study Hub */}
      <div style={{ marginTop: '1.4rem' }}>
        <div className="row-between" style={{ marginBottom: '0.4rem' }}>
          <h2 className="nomargin" style={{ fontSize: '1.15rem' }}>Study Hub</h2>
          <div className="controls nomargin">
            {(
              [
                ['all', 'All'],
                ['practice', '⚡ Core Practice'],
                ['immersion', '🏮 Immersion & Exam'],
              ] as const
            ).map(([cat, label]) => (
              <button
                key={cat}
                type="button"
                className={activeCategory === cat ? 'chip on' : 'chip'}
                onClick={() => setActiveCategory(cat)}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {visibleModuleGroups.map((group) => (
          <section key={group.heading} style={{ marginTop: '1rem' }}>
            <h3 className="section-header">{group.heading}</h3>
            <div className="grid">
              {group.items.map((item) => (
                <Link key={item.to} to={item.to} className="tile">
                  <span className="big">{item.icon}</span>
                  <span>{item.title}</span>
                  <small>{item.sub}</small>
                </Link>
              ))}
            </div>
          </section>
        ))}
      </div>

      {/* 4. Consolidated Progress & Weak-Spot Coach */}
      <div className="gp" style={{ padding: '1.1rem 1.3rem', marginTop: '1.6rem', marginBottom: '1.2rem' }}>
        <div className="row-between">
          <div>
            <span className="tag">📊 N5 → N4 MASTERY &amp; DIAGNOSTIC COACH</span>
            <h2 className="nomargin" style={{ fontSize: '1.15rem', marginTop: '0.15rem' }}>
              Progress &amp; Targeted Repair
            </h2>
          </div>
          <button
            className={repairOpen ? 'chip bad' : 'chip on'}
            onClick={() => {
              setRepairOpen((o) => !o);
              setRepairIdx(0);
              setRepairPicked(null);
              setRepairScore(0);
              setRepairSeed((s) => s + 1);
            }}
          >
            {repairOpen ? '✕ Close Repair Drill' : '🎯 5-Q Weak-Spot Repair'}
          </button>
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))',
            gap: '0.7rem',
            marginTop: '0.8rem',
          }}
        >
          {[
            { label: 'あ Kana Mastery', count: `${practicedKana}/${totalKana}`, pct: kanaPct },
            { label: '漢 Kanji Deck', count: `${kanjiInDeck}/${KANJI.length}`, pct: kanjiPct },
            { label: '文 Grammar Lessons', count: `${Object.keys(grammarDone).length}/${LESSONS.length}`, pct: grammarPct },
            { label: '📖 Graded Stories', count: `${Object.keys(completedStories).length}/${STORIES.length}`, pct: storyPct },
            { label: '🎤 Speaking & Stamps', count: `${speakStampDone}/${speakStampTotal}`, pct: speakStampPct },
            { label: '🎓 JLPT Mock Best', count: examBest !== null ? `${examBest}%` : '—', pct: examPct },
          ].map((bar) => (
            <div key={bar.label} style={{ background: 'var(--surface2)', padding: '0.55rem 0.8rem', borderRadius: '10px' }}>
              <div className="row-between small">
                <span>{bar.label}</span>
                <span>
                  <span className="muted" style={{ marginRight: '0.4rem' }}>{bar.count}</span>
                  <b>{bar.pct}%</b>
                </span>
              </div>
              <div
                style={{
                  height: '6px',
                  background: 'var(--surface)',
                  borderRadius: '999px',
                  overflow: 'hidden',
                  marginTop: '0.3rem',
                }}
              >
                <div
                  style={{
                    width: `${Math.min(100, bar.pct)}%`,
                    height: '100%',
                    background: bar.pct >= 70 ? 'var(--ok)' : 'var(--accent)',
                  }}
                />
              </div>
            </div>
          ))}
        </div>

        {(weakKanaList.length > 0 || recentWeakMondai.length > 0) && (
          <div className="controls" style={{ marginTop: '0.75rem', marginBottom: 0 }}>
            <span className="muted small" style={{ alignSelf: 'center' }}>Detected Focus Areas:</span>
            {weakKanaList.length > 0 && <span className="chip">Missed Kana: {weakKanaList.join('・')}</span>}
            {recentWeakMondai.map((m) => (
              <span key={m} className="chip">Exam Focus: {m}</span>
            ))}
          </div>
        )}

        {/* Inline 5-Question Weak-Spot Repair Drill */}
        {repairOpen && (
          <div
            style={{
              marginTop: '0.9rem',
              padding: '1rem 1.2rem',
              background: 'var(--surface2)',
              borderRadius: '12px',
              borderLeft: '3px solid var(--accent)',
            }}
          >
            {repairIdx >= repairQuestions.length ? (
              <div className="center">
                <h3 className="nomargin">🎉 Weak-Spot Repair Complete: {repairScore}/{repairQuestions.length}</h3>
                <p className="muted small">Keep patching high-trap counters, particles, and verb pairs daily!</p>
                <button
                  className="chip on"
                  onClick={() => {
                    setRepairIdx(0);
                    setRepairPicked(null);
                    setRepairScore(0);
                    setRepairSeed((s) => s + 1);
                  }}
                >
                  ↺ Run Another 5-Q Repair Set
                </button>
              </div>
            ) : (
              curRepair && (
                <div>
                  <div className="row-between">
                    <span className="tag">{curRepair.tag} · Q{repairIdx + 1}/{repairQuestions.length}</span>
                    <span className="muted small">Score: {repairScore}</span>
                  </div>
                  <p className="jp" style={{ fontSize: '1.5rem', margin: '0.4rem 0 0.15rem' }}>
                    {curRepair.prompt}
                  </p>
                  <p className="muted small nomargin">{curRepair.sub}</p>
                  <div className="controls" style={{ marginTop: '0.6rem' }}>
                    {curRepair.options.map((opt) => {
                      const cls =
                        repairPicked === null
                          ? 'chip'
                          : opt === curRepair.answer
                            ? 'chip ok'
                            : repairPicked === opt
                              ? 'chip bad'
                              : 'chip';
                      return (
                        <button
                          key={opt}
                          className={cls}
                          onClick={() => {
                            if (repairPicked !== null) return;
                            setRepairPicked(opt);
                            const ok = opt === curRepair.answer;
                            if (ok) setRepairScore((s) => s + 1);
                            if (sfxEnabled) (ok ? playDing : playMiss)();
                            speak(curRepair.audio);
                          }}
                        >
                          {opt}
                        </button>
                      );
                    })}
                  </div>
                  {repairPicked !== null && (
                    <div className="row-between" style={{ marginTop: '0.5rem' }}>
                      <span className="small ok-text">💡 {curRepair.explain}</span>
                      <button
                        className="chip on"
                        onClick={() => {
                          const nextI = repairIdx + 1;
                          setRepairPicked(null);
                          setRepairIdx(nextI);
                          if (nextI >= repairQuestions.length && sfxEnabled) playFanfare();
                        }}
                      >
                        Next →
                      </button>
                    </div>
                  )}
                </div>
              )
            )}
          </div>
        )}
      </div>

      {/* Collapsible Settings & Data Backup */}
      <div ref={settingsRef} className="gp" style={{ padding: '1rem 1.25rem' }}>
        <button
          type="button"
          className="row-between"
          style={{
            width: '100%',
            background: 'none',
            border: 'none',
            color: 'inherit',
            padding: 0,
            cursor: 'pointer',
            font: 'inherit',
          }}
          aria-expanded={settingsOpen}
          onClick={() => setSettingsOpen((o) => !o)}
        >
          <span style={{ fontWeight: 600, fontSize: '1.05rem' }}>
            ⚙️ Settings, Audio &amp; Data Backup
          </span>
          <span className="muted small">{settingsOpen ? '▾ Hide' : '▸ Expand'}</span>
        </button>

        {settingsOpen && (
          <div style={{ marginTop: '0.9rem', paddingTop: '0.9rem', borderTop: '1px solid var(--surface2)' }}>
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
        )}
      </div>
    </div>
  );
}
