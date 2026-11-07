import { useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
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
  const [repairOpen, setRepairOpen] = useState(false);
  const [repairSeed, setRepairSeed] = useState(0);
  const [repairIdx, setRepairIdx] = useState(0);
  const [repairPicked, setRepairPicked] = useState<string | null>(null);
  const [repairScore, setRepairScore] = useState(0);
  const [studyTrack, setStudyTrack] = useState<'beginner' | 'travel' | 'n5' | 'n4'>(() => {
    return (localStorage.getItem('n5_study_track') as 'beginner' | 'travel' | 'n5' | 'n4') || 'beginner';
  });

  const selectTrack = (t: 'beginner' | 'travel' | 'n5' | 'n4') => {
    setStudyTrack(t);
    try {
      localStorage.setItem('n5_study_track', t);
    } catch {
      // ignore
    }
  };

  const fileRef = useRef<HTMLInputElement>(null);
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

  const kanaPct = Math.round(((practiced(HIRAGANA) + practiced(KATAKANA)) / (HIRAGANA.length + KATAKANA.length)) * 100);
  const kanjiInDeck = Object.values(srs).filter((i) => i.kind === 'kanji').length;
  const kanjiPct = Math.round((kanjiInDeck / KANJI.length) * 100);
  const grammarPct = Math.round((Object.keys(grammarDone).length / LESSONS.length) * 100);
  const storyPct = Math.round((Object.keys(completedStories).length / STORIES.length) * 100);
  const speakStampPct = Math.round(
    ((Object.keys(scenesDone).length + earnedStampCount) / (SCENES.length + STAMPS.length)) * 100,
  );
  const examPct = examBest ?? 0;

  return (
    <div className="page">
      <h1 className="hero">こんにちは <span className="muted">— let's study.</span></h1>

      {/* Guided Daily 5-Minute Bento & Campaign CTA Banner */}
      <div className="bento-banner">
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', flexWrap: 'wrap' }}>
            <span className="tag" style={{ background: 'var(--accent)', color: '#000', fontWeight: 700 }}>
              🗺️ ZERO TO N4 CAMPAIGN ACTIVE
            </span>
            <span className="tag" style={{ fontWeight: 600 }}>
              {bentoDoneToday ? '✓ TODAY’S BENTO COMPLETED' : '🍱 GUIDED DAILY WORKOUT'}
            </span>
            <span className="muted small">· {bentoCount} Bentos finished · {earnedStampCount}/{STAMPS.length} Stamps</span>
          </div>
          <h2 style={{ margin: '0.25rem 0 0.2rem', fontSize: '1.35rem' }}>
            Today&apos;s 5-Minute Bento <span className="jp muted">(今日の弁当)</span> &amp; Campaign
          </h2>
          <p className="muted small nomargin">
            1-click daily routine: 5 rapid-fire warm-ups → due SRS cards → 1 Kanji trace + street sign decoder.
          </p>
        </div>
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', alignItems: 'center' }}>
          <Link to="/campaign" className="chip on" style={{ padding: '0.65rem 1.3rem', fontWeight: 700, background: 'var(--accent)', color: '#000' }}>
            🗺️ Open Campaign Map →
          </Link>
          <Link to="/bento" className="chip on" style={{ padding: '0.65rem 1.1rem', fontWeight: 600 }}>
            {bentoDoneToday ? '🍱 Another Bento →' : '🍱 Start Bento (5 min) →'}
          </Link>
          <Link to="/kanji-dojo" className="chip">
            ⚡ Pure Kanji Dojo
          </Link>
          <Link to="/stamps" className="chip">
            印 Stamps ({earnedStampCount}/{STAMPS.length})
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
        <div className="stat"><b>{kanjiInDeck}/{KANJI.length}</b><span>kanji in deck</span></div>
        <div className="stat"><b>{Object.keys(grammarDone).length}/{LESSONS.length}</b><span>lessons</span></div>
        <div className="stat"><b>{earnedStampCount}/{STAMPS.length}</b><span>eki-stamps 印</span></div>
      </div>

      {/* 6-Pillar Mastery Radar & Weak-Spot Diagnostic Coach */}
      <div className="gp" style={{ padding: '1.1rem 1.3rem', marginBottom: '1.3rem' }}>
        <div className="row-between">
          <div>
            <span className="tag">📊 N5 → N4 MASTERY RADAR &amp; WEAK-SPOT COACH</span>
            <h2 className="nomargin" style={{ fontSize: '1.2rem', marginTop: '0.15rem' }}>
              Curriculum Progress &amp; Targeted Repair
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
            {repairOpen ? '✕ Close Repair Drill' : '🎯 Launch 5-Q Weak-Spot Repair Drill'}
          </button>
        </div>

        {/* 6 Progress Pillars */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))',
            gap: '0.7rem',
            marginTop: '0.8rem',
          }}
        >
          {[
            { label: 'あ Kana Mastery (208)', pct: kanaPct },
            { label: '漢 Kanji Deck (150)', pct: kanjiPct },
            { label: '文 Grammar Lessons (10)', pct: grammarPct },
            { label: '物 Graded Stories (10)', pct: storyPct },
            { label: '話 Speaking & Stamps', pct: speakStampPct },
            { label: '試 JLPT Mock Best', pct: examPct },
          ].map((bar) => (
            <div key={bar.label} style={{ background: 'var(--surface2)', padding: '0.55rem 0.8rem', borderRadius: '10px' }}>
              <div className="row-between small">
                <span>{bar.label}</span>
                <b>{bar.pct}%</b>
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

        {(weakKanaList.length > 0 || recentWeakMondai.length > 0 || due > 0) && (
          <div className="controls" style={{ marginTop: '0.75rem', marginBottom: 0 }}>
            <span className="muted small" style={{ alignSelf: 'center' }}>Detected Focus Areas:</span>
            {due > 0 && <span className="chip">{due} Due SRS Cards</span>}
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

      {/* Guided Study Path Selector */}
      <div className="gp" style={{ padding: '1rem 1.25rem', marginBottom: '1.2rem' }}>
        <div className="row-between">
          <div>
            <span className="tag">🧭 PERSONALIZED STUDY PATH</span>
            <h2 className="nomargin" style={{ fontSize: '1.15rem', marginTop: '0.1rem' }}>
              Choose Your Focus Track
            </h2>
          </div>
          <div className="controls nomargin">
            {(
              [
                ['beginner', '🌱 Complete Beginner'],
                ['travel', '✈️ Japan Travel Survival'],
                ['n5', '🎓 JLPT N5 Exam Prep'],
                ['n4', '🚀 JLPT N4 Bridge'],
              ] as const
            ).map(([id, label]) => (
              <button
                key={id}
                className={studyTrack === id ? 'chip on' : 'chip'}
                onClick={() => selectTrack(id)}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        <div className="controls" style={{ marginTop: '0.7rem', marginBottom: 0 }}>
          {studyTrack === 'beginner' && (
            <>
              <Link to="/kana" className="chip on">Step 1: あ Master Hiragana &amp; Katakana →</Link>
              <Link to="/grammar/g1" className="chip on">Step 2: 文 Unlock Lesson 1 (Particles) →</Link>
              <Link to="/stories/ch1-arrival" className="chip on">Step 3: 物語 Read Ch.1 Arrival in Tokyo →</Link>
            </>
          )}
          {studyTrack === 'travel' && (
            <>
              <Link to="/signs" className="chip on">Step 1: 🎫 Ramen Ticket Machine &amp; Signs →</Link>
              <Link to="/speaking" className="chip on">Step 2: 話 Practice 10 Travel Role-Plays →</Link>
              <Link to="/drive" className="chip on">Step 3: 📻 Hands-Free Pimsleur Drive Mode →</Link>
            </>
          )}
          {studyTrack === 'n5' && (
            <>
              <Link to="/exam" className="chip on">Step 1: 🎓 Take 67-Q JLPT N5 Simulation →</Link>
              <Link to="/particles" className="chip on">Step 2: 🎯 Conquer Particle Traps →</Link>
              <Link to="/counters" className="chip on">Step 3: 🔢 Drill Irregular Counters &amp; Dates →</Link>
            </>
          )}
          {studyTrack === 'n4' && (
            <>
              <Link to="/conjugate" className="chip on">Step 1: 🔄 Transitive vs. Intransitive Pairs →</Link>
              <Link to="/grammar/g9" className="chip on">Step 2: 文 Conditionals (g9) &amp; Keigo (g10) →</Link>
              <Link to="/listening" className="chip on">Step 3: 🎵 Tokyo Pitch Accent &amp; N4 Listening →</Link>
            </>
          )}
        </div>
      </div>

      <div className="grid">
        <Link to="/campaign" className="tile" style={{ borderTop: '3px solid var(--accent)' }}>
          <span className="big">🗺️ 旅</span>Campaign<small>Zero to N4 Odyssey</small>
        </Link>
        <Link to="/bento" className="tile"><span className="big">🍱 弁</span>Daily Bento<small>5-min guided loop</small></Link>
        <Link to="/kana" className="tile"><span className="big">✍️ あ</span>Kana Dojo<small>Typing &amp; Yōon drills</small></Link>
        <Link to="/kanji-dojo" className="tile" style={{ borderTop: '3px solid #ec4899' }}>
          <span className="big">⚡ 漢</span>Kanji Dojo<small>Meaning, read &amp; vocab</small>
        </Link>
        <Link to="/kanji" className="tile"><span className="big">🀄 漢</span>Kanji Studio<small>150 N5/N4 · Radicals &amp; trace</small></Link>
        <Link to="/conjugate" className="tile"><span className="big">🔄 活</span>Verbs &amp; Lessons<small>Mental models &amp; 自動/他動</small></Link>
        <Link to="/counters" className="tile"><span className="big">🔢 数</span>Counters<small>助数詞 · Dates &amp; numbers</small></Link>
        <Link to="/particles" className="tile"><span className="big">🎯 助</span>Particles &amp; 擬音語<small>は/が · ペコペコ/ゴロゴロ</small></Link>
        <Link to="/review" className="tile"><span className="big">🗂️ 復</span>Review<small>{due} due · {Object.keys(srs).length} total</small></Link>
        <Link to="/grammar" className="tile"><span className="big">📐 文</span>Grammar<small>10 N5/N4 lessons &amp; Keigo</small></Link>
        <Link to="/stories" className="tile"><span className="big">📖 物語</span>Stories<small>10 graded chapters</small></Link>
        <Link to="/speaking" className="tile"><span className="big">🎤 話</span>Speaking<small>10 role-play scenarios</small></Link>
        <Link to="/listening" className="tile"><span className="big">🎧 聴</span>Listening &amp; Pitch<small>聴解 &amp; 高低アクセント</small></Link>
        <Link to="/drive" className="tile"><span className="big">📻 音</span>Drive Mode<small>Hands-free podcast</small></Link>
        <Link to="/signs" className="tile"><span className="big">🍜 看板</span>Signs &amp; 食券機<small>Street signs &amp; Ramen machine</small></Link>
        <Link to="/stamps" className="tile"><span className="big">🔖 印</span>Stamp Book<small>{earnedStampCount}/{STAMPS.length} Goshuin &amp; Eki</small></Link>
        <Link to="/exam" className="tile"><span className="big">🎓 試</span>Mock Exam<small>{examBest !== null ? `Best: ${examBest}%` : '67-Q N5/N4 simulator'}</small></Link>
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
