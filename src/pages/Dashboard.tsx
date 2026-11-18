import { useMemo, useRef, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
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
import { pickUnseenBatch, seededShuffle } from '../lib/deckSampler';
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
  const navigate = useNavigate();
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
    bentoCount,
    campaignCompletedStages,
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
  const [repairSeed, setRepairSeed] = useState(1);
  const [repairIdx, setRepairIdx] = useState(0);
  const [repairPicked, setRepairPicked] = useState<string | null>(null);
  const [repairScore, setRepairScore] = useState(0);
  const [activeCategory, setActiveCategory] = useState<'all' | 'practice' | 'immersion'>('all');
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [hubOpen, setHubOpen] = useState<boolean>(() => {
    try {
      return localStorage.getItem('n5_hub_open') === '1';
    } catch {
      return false;
    }
  });
  const [onboarded, setOnboarded] = useState<boolean>(() => {
    try {
      return localStorage.getItem('n5_onboarded') === '1';
    } catch {
      return false;
    }
  });

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
  const practicedKana = practiced(HIRAGANA) + practiced(KATAKANA);
  const due = Object.values(srs).filter((i) => isDue(i)).length;

  const isBrandNewUser =
    practicedKana === 0 &&
    Object.keys(srs).length === 0 &&
    Object.keys(campaignCompletedStages).length === 0 &&
    bentoCount === 0 &&
    !onboarded;

  const chooseTrackOnboarding = (track: 'beginner' | 'travel' | 'n5', dest?: string) => {
    try {
      localStorage.setItem('n5_study_track', track);
      localStorage.setItem('n5_onboarded', '1');
    } catch {
      // ignore
    }
    setOnboarded(true);
    if (dest) navigate(dest);
  };

  const toggleHub = () => {
    const next = !hubOpen;
    setHubOpen(next);
    try {
      localStorage.setItem('n5_hub_open', next ? '1' : '0');
    } catch {
      // ignore
    }
  };

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

  // Build a 5-question Weak-Spot & Trap Repair Drill using unseen-history batching
  const repairQuestions = useMemo<RepairItem[]>(() => {
    if (!repairOpen) return [];
    const out: RepairItem[] = [];
    const allKana = [...HIRAGANA, ...KATAKANA];
    const shuffledWeak = seededShuffle(weakKanaList, repairSeed + 3);
    for (const wk of shuffledWeak.slice(0, 2)) {
      const kObj = allKana.find((x) => x.kana === wk);
      if (kObj) {
        const distractors = seededShuffle(
          allKana.filter((x) => x.romaji !== kObj.romaji),
          repairSeed + wk.charCodeAt(0),
        )
          .slice(0, 3)
          .map((x) => x.romaji);
        out.push({
          id: `rk-${wk}`,
          tag: '⚠️ Missed Kana Repair',
          prompt: kObj.kana,
          sub: 'Select the correct romaji reading:',
          options: seededShuffle([kObj.romaji, ...distractors], repairSeed + 5),
          answer: kObj.romaji,
          explain: `${kObj.kana} = ${kObj.romaji}`,
          audio: kObj.kana,
        });
      }
    }

    const trapCounters = COUNTERS.filter((c) => c.irregular);
    const pickedCounters = pickUnseenBatch(
      trapCounters,
      (c) => c.id,
      2,
      'repair_counters',
      repairSeed + 11,
      true,
    );
    for (const tc of pickedCounters) {
      const distractors = seededShuffle(
        COUNTERS.filter((c) => c.group === tc.group && c.kana !== tc.kana),
        repairSeed + 19,
      )
        .slice(0, 3)
        .map((c) => c.kana);
      out.push({
        id: `rc-${tc.id}`,
        tag: '⚡ Irregular Counter Trap',
        prompt: `${tc.kanji} (${tc.en})`,
        sub: 'Choose the exact phonetic reading:',
        options: seededShuffle([tc.kana, ...distractors], repairSeed + 21),
        answer: tc.kana,
        explain: tc.rule,
        audio: tc.kana,
      });
    }

    const pt = pickUnseenBatch(
      PARTICLES,
      (x) => x.id,
      1,
      'repair_particles',
      repairSeed + 23,
      true,
    )[0];
    if (pt) {
      out.push({
        id: `rp-${pt.id}`,
        tag: '助 Particle Trap',
        prompt: `${pt.before}（　）${pt.after}`,
        sub: pt.en,
        options: seededShuffle(pt.options, repairSeed + 29),
        answer: pt.answer,
        explain: pt.why,
        audio: pt.audio,
      });
    }

    const vp = pickUnseenBatch(
      VERB_PAIRS,
      (v) => v.id,
      1,
      'repair_verbs',
      repairSeed + 37,
      true,
    )[0];
    if (vp) {
      out.push({
        id: `rvp-${vp.id}`,
        tag: '🔄 Transitive vs. Intransitive',
        prompt: vp.intransitive.exampleJp.replace(/【[^】]+】/, '（　　）'),
        sub: vp.intransitive.exampleEn,
        options: seededShuffle(
          [
            `${vp.intransitive.kanji}（${vp.intransitive.kana}）`,
            `${vp.transitive.kanji}（${vp.transitive.kana}）`,
          ],
          repairSeed + 41,
        ),
        answer: `${vp.intransitive.kanji}（${vp.intransitive.kana}）`,
        explain: `Subject takes が → 自動詞 ${vp.intransitive.kanji} (${vp.intransitive.en}).`,
        audio: vp.intransitive.exampleKana,
      });
    }

    return out.slice(0, 5);
  }, [weakKanaList, repairSeed, repairOpen]);

  const curRepair = repairQuestions[repairIdx];

  const nextStep = (() => {
    for (const l of LESSONS) {
      const story = STORIES.find((s) => s.chapter === l.chapter);
      if (lessonUnlocked(l.chapter, p) && !storyUnlocked(l.chapter, p))
        return { to: `/grammar/${l.id}`, icon: '文', title: `Grammar Ch.${l.chapter}`, sub: l.title };
      if (story && storyUnlocked(story.chapter, p) && !(story.id in completedStories))
        return { to: `/stories/${story.id}`, icon: '📖', title: `Story Ch.${story.chapter}`, sub: story.title };
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
  const overallPct = Math.round((kanaPct + kanjiPct + grammarPct + storyPct + speakStampPct + examPct) / 6);

  // 3 Calm Context-Aware Recommendations so new visitors never face a wall of 14 tiles
  const recommendedModules = useMemo(() => {
    const picks: { to: string; icon: string; title: string; sub: string }[] = [];
    if (due > 0) {
      picks.push({ to: '/review', icon: '🗂️', title: 'SRS Review', sub: `${due} cards ready to review` });
    } else if (practicedKana < 46) {
      picks.push({ to: '/kana', icon: 'あ', title: 'Kana Dojo', sub: `${practicedKana}/${totalKana} practiced` });
    } else {
      picks.push({ to: '/kanji-dojo', icon: '漢', title: 'Kanji Typing Dojo', sub: 'Readings, meanings & vocab' });
    }

    if (nextStep) {
      picks.push(nextStep);
    } else {
      picks.push({
        to: '/grammar',
        icon: '文',
        title: 'Grammar Lessons',
        sub: `${Object.keys(grammarDone).length}/${LESSONS.length} completed`,
      });
    }

    if (earnedStampCount < 3) {
      picks.push({ to: '/signs', icon: '🍜', title: 'Signs & Ticket Machines', sub: 'Real Japan konbini & stations' });
    } else {
      picks.push({
        to: '/exam',
        icon: '🎓',
        title: 'JLPT Mock Exam',
        sub: examBest !== null ? `Best score: ${examBest}%` : 'Timed N5 practice test',
      });
    }

    return picks.slice(0, 3);
  }, [due, practicedKana, totalKana, nextStep, grammarDone, earnedStampCount, examBest]);

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
      {/* 1. Calm Top Greeting Row */}
      <div className="row-between" style={{ marginTop: '0.4rem', marginBottom: '0.5rem' }}>
        <h1 className="hero nomargin">
          こんにちは <span className="muted">— ready for today?</span>
        </h1>
        <div className="status-pills">
          <span className="chip" style={{ cursor: 'default' }}>🔥 {streak}d</span>
          {due > 0 && (
            <Link to="/review" className="chip on">
              🗂️ {due} due
            </Link>
          )}
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

      {/* Optional First-Time Onboarding Card */}
      {isBrandNewUser && (
        <div className="gp" style={{ padding: '1rem 1.2rem', borderLeft: '4px solid var(--accent)', marginBottom: '1rem' }}>
          <div className="row-between" style={{ marginBottom: '0.35rem' }}>
            <b style={{ fontSize: '1.05rem' }}>Welcome! Where would you like to start?</b>
            <button
              type="button"
              className="chip"
              style={{ padding: '0.18rem 0.55rem', fontSize: '0.78rem' }}
              onClick={() => chooseTrackOnboarding('beginner')}
            >
              ✕ Dismiss
            </button>
          </div>
          <p className="muted small nomargin" style={{ marginBottom: '0.75rem' }}>
            Pick your goal — we&apos;ll tailor your Daily Bento and recommended next steps automatically.
          </p>
          <div className="controls nomargin">
            <button
              type="button"
              className="chip on"
              onClick={() => chooseTrackOnboarding('beginner', '/campaign')}
            >
              🌱 Brand New to Japanese →
            </button>
            <button
              type="button"
              className="chip on"
              onClick={() => chooseTrackOnboarding('travel', '/bento')}
            >
              🧳 Visiting Japan Soon →
            </button>
            <button
              type="button"
              className="chip"
              onClick={() => chooseTrackOnboarding('n5')}
            >
              ⚡ Already Know Kana (N5/N4)
            </button>
          </div>
        </div>
      )}

      {/* 2. Single-Focus Hero Banner */}
      <div className="bento-banner">
        <div style={{ flex: '1 1 300px' }}>
          <span className="tag" style={{ fontWeight: 700 }}>
            {bentoDoneToday ? '✓ TODAY’S BENTO COMPLETE' : '🍱 5-MINUTE DAILY FOCUS'}
          </span>
          <h2 style={{ margin: '0.3rem 0 0.2rem', fontSize: '1.3rem' }}>
            {bentoDoneToday ? 'Continue Your Odyssey' : 'Start Your 5-Minute Daily Bento'}
          </h2>
          <p className="muted small nomargin">
            {nextStep
              ? `Next milestone: ${nextStep.title} — ${nextStep.sub}`
              : 'Four quick bite-sized steps: warm-up, fresh + SRS memory cards, stroke trace, and a Tokyo street sign.'}
          </p>
        </div>
        <div style={{ display: 'flex', gap: '0.55rem', flexWrap: 'wrap', alignItems: 'center' }}>
          {!bentoDoneToday ? (
            <>
              <Link
                to="/bento"
                className="chip on"
                style={{ padding: '0.65rem 1.25rem', fontWeight: 700, background: 'var(--accent)', color: '#000' }}
              >
                🍱 Start 5-Min Bento →
              </Link>
              <Link to="/campaign" className="chip" style={{ padding: '0.62rem 1.05rem', fontWeight: 600 }}>
                🗺️ Campaign Odyssey →
              </Link>
            </>
          ) : (
            <>
              <Link
                to="/campaign"
                className="chip on"
                style={{ padding: '0.65rem 1.25rem', fontWeight: 700, background: 'var(--accent)', color: '#000' }}
              >
                🗺️ Continue Campaign →
              </Link>
              <Link to="/bento?practice=1" className="chip on" style={{ padding: '0.62rem 1.05rem', fontWeight: 600 }}>
                ↻ Bonus Bento Round →
              </Link>
            </>
          )}
          {due > 0 && (
            <Link to="/review" className="chip" style={{ padding: '0.62rem 0.95rem', fontWeight: 600 }}>
              🗂️ Review {due} Due →
            </Link>
          )}
        </div>
      </div>

      {/* 3. Recommended Next (3 Calm Cards) + Collapsible Full Study Hub */}
      <section style={{ marginTop: '1.1rem' }}>
        <div className="row-between" style={{ marginBottom: '0.6rem' }}>
          <h2 className="nomargin" style={{ fontSize: '1.1rem' }}>Recommended Next</h2>
          <button
            type="button"
            className="disclosure-toggle"
            aria-expanded={hubOpen}
            onClick={toggleHub}
          >
            📚 All 14 Study Tools ({hubOpen ? 'Hide' : 'Browse All'}) {hubOpen ? '▴' : '▾'}
          </button>
        </div>

        <div className="recommended-grid">
          {recommendedModules.map((item) => (
            <Link key={item.to} to={item.to} className="tile">
              <span className="big">{item.icon}</span>
              <span>{item.title}</span>
              <small>{item.sub}</small>
            </Link>
          ))}
        </div>

        {hubOpen && (
          <div style={{ marginTop: '1rem', paddingTop: '0.9rem', borderTop: '1px solid var(--surface2)' }}>
            <div className="controls nomargin">
              {(
                [
                  ['all', 'All Tools'],
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

            {visibleModuleGroups.map((group) => (
              <div key={group.heading} style={{ marginTop: '0.9rem' }}>
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
              </div>
            ))}
          </div>
        )}
      </section>

      {/* 4. Compact Mastery Summary + Collapsible Coach & 5-Q Repair */}
      <div className="gp" style={{ padding: '1rem 1.2rem', marginTop: '1.4rem', marginBottom: '1rem' }}>
        <div className="row-between" style={{ gap: '0.6rem' }}>
          <div style={{ flex: '1 1 260px' }}>
            <div className="row-between small" style={{ marginBottom: '0.3rem' }}>
              <b>📊 N5 → N4 Mastery · {overallPct}%</b>
              <span className="muted">
                Kana {kanaPct}% · Kanji {kanjiPct}% · Grammar {grammarPct}% · 🔖 {earnedStampCount}/{STAMPS.length}
              </span>
            </div>
            <div style={{ height: '7px', background: 'var(--surface2)', borderRadius: '999px', overflow: 'hidden' }}>
              <div
                style={{
                  width: `${Math.min(100, overallPct)}%`,
                  height: '100%',
                  background: overallPct >= 70 ? 'var(--ok)' : 'var(--accent)',
                }}
              />
            </div>
          </div>
          <div className="controls nomargin">
            <button
              type="button"
              className={repairOpen ? 'chip bad' : 'chip on'}
              onClick={() => {
                setRepairOpen((o) => !o);
                setRepairIdx(0);
                setRepairPicked(null);
                setRepairScore(0);
                setRepairSeed((s) => s + 1);
              }}
            >
              {repairOpen ? '✕ Close Repair' : '🎯 5-Q Repair'}
            </button>
            <button
              type="button"
              className={detailsOpen ? 'chip on' : 'chip'}
              onClick={() => setDetailsOpen((d) => !d)}
            >
              {detailsOpen ? 'Hide Breakdown ▴' : 'Breakdown ▾'}
            </button>
          </div>
        </div>

        {detailsOpen && (
          <>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
                gap: '0.65rem',
                marginTop: '0.85rem',
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
                <div key={bar.label} style={{ background: 'var(--surface2)', padding: '0.5rem 0.75rem', borderRadius: '10px' }}>
                  <div className="row-between small">
                    <span>{bar.label}</span>
                    <span>
                      <span className="muted" style={{ marginRight: '0.35rem' }}>{bar.count}</span>
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
              <div className="controls" style={{ marginTop: '0.7rem', marginBottom: 0 }}>
                <span className="muted small" style={{ alignSelf: 'center' }}>Focus Areas:</span>
                {weakKanaList.length > 0 && <span className="chip">Missed Kana: {weakKanaList.join('・')}</span>}
                {recentWeakMondai.map((m) => (
                  <span key={m} className="chip">Exam: {m}</span>
                ))}
              </div>
            )}
          </>
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
                  ↺ Run Fresh 5-Q Repair Set
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

      {/* 5. Collapsible Settings & Data Backup */}
      <div ref={settingsRef} className="gp" style={{ padding: '0.9rem 1.2rem' }}>
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
          <span style={{ fontWeight: 600, fontSize: '1rem' }}>
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
