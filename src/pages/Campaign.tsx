import { useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  CAMPAIGN_SAGAS,
  sampleBossChallenge,
  DEFAULT_BOSS_PHASES,
  type CampaignSaga,
  type BossQuestion,
} from '../data/campaign';
import { STORIES } from '../data/stories';
import { LESSONS } from '../data/grammar';
import { useStore } from '../lib/store';
import { playFanfare, playMiss, playDing } from '../lib/sfx';

export default function Campaign() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const sagaQuery = searchParams.get('saga');

  const {
    campaignClearedSagas,
    campaignCompletedStages,
    completeCampaignSaga,
    sfxEnabled,
  } = useStore();

  const [activeSagaNum, setActiveSagaNum] = useState<number>(() => {
    if (sagaQuery) {
      const parsed = parseInt(sagaQuery, 10);
      if (parsed >= 1 && parsed <= CAMPAIGN_SAGAS.length) return parsed;
    }
    // Find first unfinished saga or default to 1
    for (const saga of CAMPAIGN_SAGAS) {
      if (!campaignClearedSagas[saga.sagaNumber]) return saga.sagaNumber;
    }
    return 1;
  });

  const [prevSagaQuery, setPrevSagaQuery] = useState(sagaQuery);
  if (sagaQuery !== prevSagaQuery) {
    setPrevSagaQuery(sagaQuery);
    if (sagaQuery) {
      const parsed = parseInt(sagaQuery, 10);
      if (parsed >= 1 && parsed <= CAMPAIGN_SAGAS.length && parsed !== activeSagaNum) {
        setActiveSagaNum(parsed);
      }
    }
  }

  // Interactive Procedural Boss Battle State
  const [bossOpen, setBossOpen] = useState<boolean>(false);
  const [bossSaga, setBossSaga] = useState<CampaignSaga | null>(null);
  const [bossQuestions, setBossQuestions] = useState<BossQuestion[]>([]);
  const [bossQIdx, setBossQIdx] = useState<number>(0);
  const [bossHp, setBossHp] = useState<number>(100);
  const [playerHearts, setPlayerHearts] = useState<number>(3);
  const [bossAnswers, setBossAnswers] = useState<Record<number, number>>({});
  const [turnFeedback, setTurnFeedback] = useState<{
    isHit: boolean;
    message: string;
    explanation?: string;
  } | null>(null);
  const [bossSubmitted, setBossSubmitted] = useState<boolean>(false);
  const [placementOpen, setPlacementOpen] = useState<boolean>(false);

  const curSaga = CAMPAIGN_SAGAS.find((s) => s.sagaNumber === activeSagaNum) || CAMPAIGN_SAGAS[0];

  const totalPossibleStages = CAMPAIGN_SAGAS.reduce((acc, s) => acc + s.stages.length, 0);
  const totalStagesCompleted = Object.values(campaignCompletedStages).filter(Boolean).length;
  const totalSagasCleared = Object.values(campaignClearedSagas).filter((score) => score >= 70).length;

  const isSagaUnlocked = (sNum: number) => {
    if (sNum === 1) return true;
    return !!campaignClearedSagas[sNum - 1];
  };

  const activePhase = useMemo(() => {
    if (!bossSaga) return null;
    const phases =
      bossSaga.boss.phases && bossSaga.boss.phases.length === 3
        ? bossSaga.boss.phases
        : DEFAULT_BOSS_PHASES;
    if (bossHp > 66) return phases[0];
    if (bossHp > 33) return phases[1];
    return phases[2];
  }, [bossSaga, bossHp]);

  const handleOpenBoss = (saga: CampaignSaga) => {
    const sampled = sampleBossChallenge(saga, 10);
    setBossSaga(saga);
    setBossQuestions(sampled);
    setBossQIdx(0);
    setBossHp(100);
    setPlayerHearts(3);
    setBossAnswers({});
    setTurnFeedback(null);
    setBossSubmitted(false);
    setBossOpen(true);
  };

  const handleAnswerBossTurn = (optIdx: number) => {
    if (bossAnswers[bossQIdx] !== undefined || bossSubmitted) return;
    const curQ = bossQuestions[bossQIdx];
    if (!curQ) return;
    const isCorrect = optIdx === curQ.answer;

    setBossAnswers((prev) => ({ ...prev, [bossQIdx]: optIdx }));

    if (isCorrect) {
      const nextHp = Math.max(0, bossHp - 10);
      setBossHp(nextHp);
      if (sfxEnabled) playDing();
      setTurnFeedback({
        isHit: true,
        message: '⚡ DIRECT HIT! Gatekeeper took 10 damage!',
        explanation: curQ.explanation,
      });
    } else {
      const nextHearts = Math.max(0, playerHearts - 1);
      setPlayerHearts(nextHearts);
      if (sfxEnabled) playMiss();
      setTurnFeedback({
        isHit: false,
        message: `💥 BOSS COUNTER-ATTACK! You took 1 damage! Correct: "${curQ.options[curQ.answer]}"`,
        explanation: curQ.explanation,
      });
    }
  };

  const handleNextTurnOrFinish = () => {
    setTurnFeedback(null);
    const nextQIdx = bossQIdx + 1;
    const isOutOfHearts = playerHearts <= 0;
    if (isOutOfHearts || nextQIdx >= bossQuestions.length) {
      // Finalize battle
      if (!bossSaga) return;
      setBossSubmitted(true);
      const score = bossQuestions.filter((q, i) => bossAnswers[i] === q.answer).length;
      const passed = score >= bossSaga.boss.minPassScore && playerHearts > 0;
      const pct = Math.round((score / bossQuestions.length) * 100);

      if (passed) {
        completeCampaignSaga(bossSaga.sagaNumber, pct);
        if (sfxEnabled) playFanfare();
      } else {
        if (sfxEnabled) playMiss();
      }
    } else {
      setBossQIdx(nextQIdx);
    }
  };

  const handleSkipToSaga = (targetSaga: number) => {
    const store = useStore.getState();

    // 1. Cleared Sagas: strictly keep only 1..(targetSaga - 1)
    const nextClearedSagas: Record<number, number> = {};
    for (let i = 1; i < targetSaga; i++) {
      nextClearedSagas[i] = 100;
    }

    // 2. Completed Stages: mark < targetSaga complete, delete >= targetSaga
    const nextCompletedStages: Record<string, boolean> = { ...store.campaignCompletedStages };
    for (const saga of CAMPAIGN_SAGAS) {
      if (saga.sagaNumber < targetSaga) {
        saga.stages.forEach((st) => {
          nextCompletedStages[st.id] = true;
        });
      } else {
        saga.stages.forEach((st) => {
          delete nextCompletedStages[st.id];
        });
      }
    }

    // 3. Backfill stories and grammar lessons for all skipped sagas
    const backfillMap: Record<number, { lessons: string[]; stories: string[] }> = {
      2: { lessons: ['g1'], stories: ['ch1-arrival'] },
      3: { lessons: ['g1', 'g2'], stories: ['ch1-arrival', 'ch2-cafe'] },
      4: { lessons: ['g1', 'g2', 'g3'], stories: ['ch1-arrival', 'ch2-cafe', 'ch3-asakusa'] },
      5: {
        lessons: ['g1', 'g2', 'g3', 'g4', 'g5'],
        stories: ['ch1-arrival', 'ch2-cafe', 'ch3-asakusa', 'ch4-weekend', 'ch5-shinkansen'],
      },
      6: {
        lessons: ['g1', 'g2', 'g3', 'g4', 'g5', 'g6', 'g7'],
        stories: [
          'ch1-arrival',
          'ch2-cafe',
          'ch3-asakusa',
          'ch4-weekend',
          'ch5-shinkansen',
          'ch6-akihabara',
          'ch7-onsen',
        ],
      },
      7: {
        lessons: ['g1', 'g2', 'g3', 'g4', 'g5', 'g6', 'g7'],
        stories: ['ch1-arrival', 'ch2-cafe', 'ch3-asakusa', 'ch4-weekend', 'ch5-shinkansen', 'ch6-akihabara', 'ch7-onsen', 'ch8-goodbye'],
      },
      8: {
        lessons: ['g1', 'g2', 'g3', 'g4', 'g5', 'g6', 'g7', 'g8'],
        stories: ['ch1-arrival', 'ch2-cafe', 'ch3-asakusa', 'ch4-weekend', 'ch5-shinkansen', 'ch6-akihabara', 'ch7-onsen', 'ch8-goodbye', 'ch9-kyoto', 'ch19-train-notice'],
      },
      9: {
        lessons: ['g1', 'g2', 'g3', 'g4', 'g5', 'g6', 'g7', 'g8', 'g9'],
        stories: ['ch1-arrival', 'ch2-cafe', 'ch3-asakusa', 'ch4-weekend', 'ch5-shinkansen', 'ch6-akihabara', 'ch7-onsen', 'ch8-goodbye', 'ch9-kyoto', 'ch12-urashima', 'ch19-train-notice'],
      },
      10: {
        lessons: ['g1', 'g2', 'g3', 'g4', 'g5', 'g6', 'g7', 'g8', 'g9', 'g10'],
        stories: ['ch1-arrival', 'ch2-cafe', 'ch3-asakusa', 'ch4-weekend', 'ch5-shinkansen', 'ch6-akihabara', 'ch7-onsen', 'ch8-goodbye', 'ch9-kyoto', 'ch10-keigo', 'ch12-urashima', 'ch19-train-notice', 'ch22-conbini-job'],
      },
      11: {
        lessons: ['g1', 'g2', 'g3', 'g4', 'g5', 'g6', 'g7', 'g8', 'g9', 'g10', 'g11'],
        stories: ['ch1-arrival', 'ch2-cafe', 'ch3-asakusa', 'ch4-weekend', 'ch5-shinkansen', 'ch6-akihabara', 'ch7-onsen', 'ch8-goodbye', 'ch9-kyoto', 'ch10-keigo', 'ch12-urashima', 'ch19-train-notice', 'ch22-conbini-job'],
      },
      12: {
        lessons: ['g1', 'g2', 'g3', 'g4', 'g5', 'g6', 'g7', 'g8', 'g9', 'g10', 'g11'],
        stories: ['ch1-arrival', 'ch2-cafe', 'ch3-asakusa', 'ch4-weekend', 'ch5-shinkansen', 'ch6-akihabara', 'ch7-onsen', 'ch8-goodbye', 'ch9-kyoto', 'ch10-keigo', 'ch12-urashima', 'ch19-train-notice', 'ch22-conbini-job', 'ch30-temple-footprints'],
      },
    };

    const toBackfill = backfillMap[targetSaga] || { lessons: [], stories: [] };

    // Prune previous grammarDone and backfill exact lessons
    const nextGrammarDone: Record<string, number> = { ...store.grammarDone };
    for (const l of LESSONS) {
      delete nextGrammarDone[l.id];
    }
    toBackfill.lessons.forEach((lid) => {
      nextGrammarDone[lid] = 100;
    });

    // Prune previous completedStories and backfill exact stories
    const nextCompletedStories: Record<string, number> = { ...store.completedStories };
    for (const s of STORIES) {
      delete nextCompletedStories[s.id];
    }
    toBackfill.stories.forEach((sid) => {
      nextCompletedStories[sid] = 100;
    });

    useStore.setState({
      campaignClearedSagas: nextClearedSagas,
      campaignCompletedStages: nextCompletedStages,
      grammarDone: nextGrammarDone,
      completedStories: nextCompletedStories,
    });

    setActiveSagaNum(targetSaga);
    setPlacementOpen(false);
    if (sfxEnabled) playFanfare();
  };

  return (
    <div className="page">
      {/* Hero Header */}
      <div className="row-between" style={{ flexWrap: 'wrap', gap: '0.8rem' }}>
        <div>
          <span className="tag" style={{ background: 'var(--accent)', color: '#000', fontWeight: 700 }}>
            🗺️ STEP-BY-STEP CAMPAIGN MODE
          </span>
          <h1 className="nomargin" style={{ marginTop: '0.2rem' }}>
            Zero to N4 Learning Odyssey <span className="muted jp">(学習の旅路)</span>
          </h1>
          <p className="muted small nomargin" style={{ marginTop: '0.25rem' }}>
            A structured linear journey from complete beginner (Hiragana) up to JLPT N4 mastery.
          </p>
        </div>
        <div className="controls nomargin" style={{ alignItems: 'center' }}>
          <button
            className="chip"
            onClick={() => setPlacementOpen(true)}
            title="Fast-forward if you already know basic Japanese"
          >
            ⚡ Placement / Fast-Track Skip
          </button>
        </div>
      </div>

      {/* Progress Metric Bar */}
      <div className="stats" style={{ margin: '1.2rem 0' }}>
        <div className="stat">
          <b>{totalSagasCleared} / {CAMPAIGN_SAGAS.length}</b>
          <span>Sagas Cleared 🏆</span>
        </div>
        <div className="stat">
          <b>{totalStagesCompleted} / {totalPossibleStages}</b>
          <span>Missions Done 🎯</span>
        </div>
        <div className="stat">
          <b>{totalSagasCleared >= 10 ? 'N4 Master' : totalSagasCleared >= 5 ? 'N4 Bound' : totalSagasCleared >= 3 ? 'N5 Candidate' : 'Beginner'}</b>
          <span>Learner Rank 🥋</span>
        </div>
      </div>

      {/* Fast-Track Placement Modal */}
      {placementOpen && (
        <div
          style={{
            background: 'var(--surface2)',
            padding: '1.2rem 1.4rem',
            borderRadius: '12px',
            marginBottom: '1.3rem',
            border: '2px solid var(--accent)',
          }}
        >
          <div className="row-between">
            <h3 className="nomargin">⚡ Fast-Track Placement Jump</h3>
            <button className="chip" onClick={() => setPlacementOpen(false)}>✕ Close</button>
          </div>
          <p className="small muted" style={{ margin: '0.4rem 0 0.8rem' }}>
            Already know Hiragana, Katakana, or basic verbs? Skip ahead directly without completing early beginner stages:
          </p>
          <div className="controls" style={{ gap: '0.5rem', flexWrap: 'wrap' }}>
            {CAMPAIGN_SAGAS.slice(1).map((s) => (
              <button
                key={s.id}
                className="chip on"
                onClick={() => handleSkipToSaga(s.sagaNumber)}
              >
                Jump to Saga {s.sagaNumber} ({s.titleJp}) →
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Saga Navigation Tabs */}
      <div className="controls" style={{ gap: '0.5rem', flexWrap: 'wrap' }}>
        {CAMPAIGN_SAGAS.map((saga) => {
          const unlocked = isSagaUnlocked(saga.sagaNumber);
          const cleared = !!campaignClearedSagas[saga.sagaNumber];
          const active = saga.sagaNumber === activeSagaNum;
          return (
            <button
              key={saga.id}
              className={active ? 'chip on' : unlocked ? 'chip' : 'chip disabled'}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.4rem',
                opacity: unlocked ? 1 : 0.45,
              }}
              disabled={!unlocked}
              onClick={() => setActiveSagaNum(saga.sagaNumber)}
            >
              <span>{cleared ? '✓' : unlocked ? '🔓' : '🔒'}</span>
              <b>Saga {saga.sagaNumber}</b>
              {cleared && (
                <span className="tag" style={{ background: 'var(--ok)', color: '#000', padding: '0.1rem 0.35rem', fontSize: '0.65rem' }}>
                  CLEARED
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Active Saga Banner */}
      <div
        className="gp"
        style={{
          padding: '1.3rem 1.5rem',
          margin: '1rem 0 1.5rem',
          borderLeft: '4px solid var(--accent)',
        }}
      >
        <div className="row-between" style={{ flexWrap: 'wrap', gap: '0.5rem' }}>
          <div>
            <span className="tag">{curSaga.titleJp} · REWARD: {curSaga.badge}</span>
            <h2 className="nomargin" style={{ marginTop: '0.2rem', fontSize: '1.45rem' }}>
              {curSaga.title}
            </h2>
          </div>
          {campaignClearedSagas[curSaga.sagaNumber] ? (
            <span className="tag ok-text" style={{ fontSize: '0.9rem', padding: '0.35rem 0.8rem', fontWeight: 700 }}>
              ✓ SAGA DEFEATED ({campaignClearedSagas[curSaga.sagaNumber]}%)
            </span>
          ) : (
            <span className="tag" style={{ background: 'var(--accent)', color: '#000', fontWeight: 700 }}>
              IN PROGRESS
            </span>
          )}
        </div>
        <p style={{ margin: '0.6rem 0 0', fontSize: '1rem', lineHeight: 1.5 }}>
          {curSaga.theme}
        </p>
      </div>

      {/* Quest Trail: Stages */}
      <h2 style={{ fontSize: '1.2rem', margin: '0 0 0.8rem' }}>Missions &amp; Milestones</h2>
      <div style={{ display: 'grid', gap: '0.9rem' }}>
        {curSaga.stages.map((stage) => {
          const isDone = !!campaignCompletedStages[stage.id];
          return (
            <div
              key={stage.id}
              className="gp"
              style={{
                padding: '1rem 1.25rem',
                margin: 0,
                background: 'var(--surface2)',
                borderLeft: isDone ? '4px solid var(--ok)' : '4px solid var(--border)',
                transition: 'transform 0.15s ease',
              }}
            >
              <div className="row-between" style={{ flexWrap: 'wrap', gap: '0.6rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
                  <span style={{ fontSize: '2rem' }}>{stage.icon}</span>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                      <span className="tag" style={{ fontSize: '0.75rem' }}>
                        MISSION {stage.stageNumber} · {stage.category}
                      </span>
                      {isDone && (
                        <span className="ok-text" style={{ fontSize: '0.85rem', fontWeight: 700 }}>
                          ✓ Done
                        </span>
                      )}
                    </div>
                    <b style={{ fontSize: '1.15rem' }}>{stage.title}</b>
                    <span className="muted small jp" style={{ marginLeft: '0.5rem' }}>
                      ({stage.titleJp})
                    </span>
                    <div className="muted small" style={{ marginTop: '0.2rem' }}>
                      {stage.description}
                    </div>
                  </div>
                </div>

                <div className="controls nomargin" style={{ alignItems: 'center' }}>
                  <button
                    className="chip on"
                    style={{ padding: '0.45rem 1rem', fontWeight: 600 }}
                    onClick={() => {
                      const sep = stage.targetRoute.includes('?') ? '&' : '?';
                      navigate(`${stage.targetRoute}${sep}mission=${stage.id}`);
                    }}
                  >
                    {stage.actionPrompt}
                  </button>
                  {isDone ? (
                    <span
                      className="chip ok"
                      style={{
                        padding: '0.45rem 0.85rem',
                        fontWeight: 700,
                        cursor: 'default',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.3rem',
                      }}
                      title="Stage verified complete via target dojo"
                    >
                      ✓ Verified Complete
                    </span>
                  ) : (
                    <span
                      className="chip"
                      style={{
                        padding: '0.45rem 0.85rem',
                        opacity: 0.65,
                        cursor: 'default',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.3rem',
                      }}
                      title="Launch mission and achieve required score to clear"
                    >
                      🔒 Incomplete
                    </span>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Saga Boss Gatekeeper Card */}
      <div
        className="gp"
        style={{
          marginTop: '1.8rem',
          padding: '1.4rem 1.5rem',
          background: 'var(--surface)',
          borderRadius: '14px',
          border: '2px solid var(--accent)',
          boxShadow: '0 8px 30px rgba(0,0,0,0.4)',
        }}
      >
        <div className="row-between" style={{ flexWrap: 'wrap', gap: '0.8rem' }}>
          <div>
            <span className="tag" style={{ background: 'var(--bad)', color: '#fff', fontWeight: 700 }}>
              👹 SAGA {curSaga.sagaNumber} GATEKEEPER BOSS
            </span>
            <h3 className="nomargin" style={{ marginTop: '0.3rem', fontSize: '1.35rem' }}>
              {curSaga.boss.title}
            </h3>
            <p className="muted small nomargin" style={{ marginTop: '0.35rem' }}>
              {curSaga.boss.description}
            </p>
          </div>
          <button
            className="chip on"
            style={{
              padding: '0.65rem 1.4rem',
              fontSize: '1rem',
              fontWeight: 700,
              background: 'var(--accent)',
              color: '#000',
            }}
            onClick={() => handleOpenBoss(curSaga)}
          >
            ⚔️ Challenge Gatekeeper Boss →
          </button>
        </div>
      </div>

      {/* Interactive Boss Challenge Modal */}
      {bossOpen && bossSaga && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 300,
            background: 'rgba(10, 11, 18, 0.82)',
            backdropFilter: 'blur(8px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '1.5rem',
          }}
          onClick={() => setBossOpen(false)}
        >
          <div
            className="gp"
            style={{
              width: '100%',
              maxWidth: '680px',
              maxHeight: '90vh',
              overflowY: 'auto',
              margin: 0,
              padding: '1.5rem 1.8rem',
              border: '2px solid var(--accent)',
              boxShadow: '0 20px 60px #000c',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="row-between">
              <div>
                <span className="tag" style={{ background: 'var(--bad)', color: '#fff' }}>
                  👹 GATEKEEPER CHALLENGE
                </span>
                <h2 className="nomargin" style={{ marginTop: '0.2rem' }}>
                  {bossSaga.boss.title}
                </h2>
              </div>
              <button className="chip" onClick={() => setBossOpen(false)}>✕ Close</button>
            </div>

            <p className="muted small" style={{ margin: '0.5rem 0 0.8rem' }}>
              {bossSaga.boss.description} (Pass Goal: ≥ {bossSaga.boss.minPassScore} / {bossQuestions.length} correct)
            </p>

            {/* Phase Banner */}
            {activePhase && (
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '0.8rem',
                  background: `${activePhase.themeColor}22`,
                  border: `1px solid ${activePhase.themeColor}`,
                  borderRadius: '8px',
                  padding: '0.6rem 0.9rem',
                  margin: '0.6rem 0 1rem',
                }}
              >
                <div>
                  <span
                    className="tag"
                    style={{
                      background: activePhase.themeColor,
                      color: '#000',
                      fontWeight: 700,
                      marginRight: '0.6rem',
                    }}
                  >
                    {activePhase.nameJp} ({activePhase.name})
                  </span>
                  <span style={{ fontStyle: 'italic', color: 'var(--text)' }}>
                    &ldquo;{activePhase.dialogue}&rdquo;
                  </span>
                </div>
                <span className="small muted" style={{ whiteSpace: 'nowrap' }}>
                  HP ≤ {activePhase.hpThreshold}%
                </span>
              </div>
            )}

            {/* Boss HP Bar & Player Hearts Status Bar */}
            <div
              style={{
                background: 'var(--surface2)',
                borderRadius: '10px',
                padding: '0.8rem 1rem',
                marginBottom: '1.2rem',
                display: 'grid',
                gap: '0.6rem',
              }}
            >
              <div>
                <div className="row-between" style={{ marginBottom: '0.3rem' }}>
                  <span style={{ fontWeight: 600, fontSize: '0.9rem' }}>
                    👹 Boss HP: {bossHp}%
                  </span>
                  <span className="small muted">
                    Turn {bossQIdx + 1} of {bossQuestions.length}
                  </span>
                </div>
                <div
                  style={{
                    height: '14px',
                    width: '100%',
                    background: 'rgba(255,255,255,0.12)',
                    borderRadius: '7px',
                    overflow: 'hidden',
                  }}
                >
                  <div
                    style={{
                      height: '100%',
                      width: `${bossHp}%`,
                      background: activePhase ? activePhase.themeColor : 'var(--bad)',
                      transition: 'width 0.4s ease, background-color 0.4s ease',
                      borderRadius: '7px',
                    }}
                  />
                </div>
              </div>

              <div className="row-between" style={{ flexWrap: 'wrap', gap: '0.5rem', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <span style={{ fontWeight: 600, fontSize: '0.9rem' }}>Hearts:</span>
                  <span style={{ letterSpacing: '2px', fontSize: '1.1rem' }}>
                    {'❤️'.repeat(Math.max(0, playerHearts))}
                    {'🖤'.repeat(Math.max(0, 3 - playerHearts))}
                  </span>
                  <span className="small muted">({playerHearts}/3 remaining)</span>
                </div>
                <div className="small muted">
                  Pass Goal: ≥ {bossSaga.boss.minPassScore} / {bossQuestions.length} correct
                </div>
              </div>
            </div>

            {/* Combat Arena */}
            {!bossSubmitted ? (
              <div>
                {bossQuestions[bossQIdx] ? (
                  <div
                    style={{
                      background: 'var(--surface2)',
                      padding: '1.1rem 1.3rem',
                      borderRadius: '12px',
                      border: '1px solid rgba(255,255,255,0.1)',
                    }}
                  >
                    <div style={{ fontSize: '0.85rem', color: 'var(--accent)', fontWeight: 700, marginBottom: '0.3rem' }}>
                      QUESTION {bossQIdx + 1} / {bossQuestions.length}
                    </div>
                    <div style={{ fontWeight: 600, fontSize: '1.1rem', marginBottom: '1rem', lineHeight: 1.4 }}>
                      {bossQuestions[bossQIdx].q}
                    </div>

                    <div style={{ display: 'grid', gap: '0.6rem', marginBottom: '1rem' }}>
                      {bossQuestions[bossQIdx].options.map((opt, optIdx) => {
                        const picked = bossAnswers[bossQIdx] === optIdx;
                        const isAnswered = bossAnswers[bossQIdx] !== undefined;
                        const isCorrectOption = optIdx === bossQuestions[bossQIdx].answer;

                        let btnCls = 'chip';
                        let btnStyle: React.CSSProperties = {
                          width: '100%',
                          textAlign: 'left',
                          justifyContent: 'flex-start',
                          padding: '0.75rem 1rem',
                          fontSize: '0.95rem',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.6rem',
                        };

                        if (isAnswered) {
                          if (isCorrectOption) {
                            btnCls = 'chip ok';
                            btnStyle = { ...btnStyle, background: 'var(--ok)', color: '#000', fontWeight: 700 };
                          } else if (picked) {
                            btnCls = 'chip bad';
                            btnStyle = { ...btnStyle, background: 'var(--bad)', color: '#fff', fontWeight: 700 };
                          } else {
                            btnStyle = { ...btnStyle, opacity: 0.5 };
                          }
                        }

                        return (
                          <button
                            key={optIdx}
                            className={btnCls}
                            style={btnStyle}
                            disabled={isAnswered}
                            onClick={() => handleAnswerBossTurn(optIdx)}
                          >
                            <span style={{ fontWeight: 700, minWidth: '1.4rem' }}>
                              {['A', 'B', 'C', 'D'][optIdx] || optIdx + 1}.
                            </span>
                            <span>{opt}</span>
                          </button>
                        );
                      })}
                    </div>

                    {turnFeedback && (
                      <div
                        style={{
                          marginTop: '0.8rem',
                          padding: '0.9rem 1.1rem',
                          borderRadius: '8px',
                          background: turnFeedback.isHit ? 'rgba(34, 197, 94, 0.15)' : 'rgba(239, 68, 68, 0.15)',
                          border: `1px solid ${turnFeedback.isHit ? 'var(--ok)' : 'var(--bad)'}`,
                        }}
                      >
                        <div style={{ fontWeight: 700, marginBottom: '0.3rem' }} className={turnFeedback.isHit ? 'ok-text' : 'bad-text'}>
                          {turnFeedback.message}
                        </div>
                        {turnFeedback.explanation && (
                          <p className="small nomargin" style={{ opacity: 0.9 }}>
                            {turnFeedback.explanation}
                          </p>
                        )}
                        <div style={{ marginTop: '0.8rem', display: 'flex', justifyContent: 'flex-end' }}>
                          <button
                            className="chip on"
                            style={{
                              padding: '0.55rem 1.3rem',
                              fontWeight: 700,
                              background: 'var(--accent)',
                              color: '#000',
                            }}
                            onClick={handleNextTurnOrFinish}
                          >
                            {bossQIdx + 1 >= bossQuestions.length || playerHearts <= 0
                              ? '🏁 Finish Battle →'
                              : 'Next Turn →'}
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                ) : null}
              </div>
            ) : (
              /* Battle Result Screen */
              <div
                style={{
                  background: 'var(--surface2)',
                  padding: '1.8rem 1.5rem',
                  borderRadius: '12px',
                  textAlign: 'center',
                }}
              >
                {(() => {
                  const score = bossQuestions.filter((q, i) => bossAnswers[i] === q.answer).length;
                  const passed = score >= bossSaga.boss.minPassScore && playerHearts > 0;
                  return (
                    <div>
                      {passed ? (
                        <div>
                          <div style={{ fontSize: '3rem', marginBottom: '0.5rem' }}>🏆</div>
                          <h2 className="ok-text nomargin" style={{ fontSize: '1.5rem' }}>
                            🎉 VICTORY! SAGA {bossSaga.sagaNumber} CLEARED!
                          </h2>
                          <p style={{ margin: '0.8rem 0 1.2rem', color: 'var(--text)' }}>
                            You defeated <b>{bossSaga.boss.title}</b> with <b>{playerHearts} heart(s)</b> remaining!
                            Score: <b>{score} / {bossQuestions.length}</b> ({Math.round((score / bossQuestions.length) * 100)}%).
                          </p>
                        </div>
                      ) : (
                        <div>
                          <div style={{ fontSize: '3rem', marginBottom: '0.5rem' }}>💀</div>
                          <h2 className="bad-text nomargin" style={{ fontSize: '1.5rem' }}>
                            💀 DEFEAT! You were defeated by the Gatekeeper.
                          </h2>
                          <p style={{ margin: '0.8rem 0 1.2rem', color: 'var(--text)' }}>
                            {playerHearts <= 0
                              ? 'You lost all hearts in battle!'
                              : `Score: ${score} / ${bossQuestions.length}. You need at least ${bossSaga.boss.minPassScore} correct to clear.`}
                          </p>
                        </div>
                      )}

                      <div className="controls" style={{ justifyContent: 'center', gap: '0.8rem', marginTop: '1.2rem' }}>
                        <button
                          className="chip"
                          style={{ padding: '0.6rem 1.3rem' }}
                          onClick={() => handleOpenBoss(bossSaga)}
                        >
                          ↺ {passed ? 'Challenge Again' : 'Retry Battle'}
                        </button>
                        {passed && bossSaga.sagaNumber < CAMPAIGN_SAGAS.length && (
                          <button
                            className="chip on"
                            style={{ padding: '0.6rem 1.3rem', fontWeight: 700 }}
                            onClick={() => {
                              setBossOpen(false);
                              setActiveSagaNum(bossSaga.sagaNumber + 1);
                            }}
                          >
                            Advance to Saga {bossSaga.sagaNumber + 1} →
                          </button>
                        )}
                        <button
                          className="chip"
                          style={{ padding: '0.6rem 1.1rem' }}
                          onClick={() => setBossOpen(false)}
                        >
                          ✕ Close
                        </button>
                      </div>
                    </div>
                  );
                })()}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
