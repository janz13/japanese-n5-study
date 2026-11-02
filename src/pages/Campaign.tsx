import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CAMPAIGN_SAGAS, type CampaignSaga } from '../data/campaign';
import { useStore } from '../lib/store';
import { playFanfare, playMiss } from '../lib/sfx';

export default function Campaign() {
  const navigate = useNavigate();
  const {
    campaignClearedSagas,
    campaignCompletedStages,
    completeCampaignStage,
    completeCampaignSaga,
    sfxEnabled,
  } = useStore();

  const [activeSagaNum, setActiveSagaNum] = useState<number>(() => {
    // Find first unfinished saga or default to 1
    for (const saga of CAMPAIGN_SAGAS) {
      if (!campaignClearedSagas[saga.sagaNumber]) return saga.sagaNumber;
    }
    return 1;
  });

  const [bossOpen, setBossOpen] = useState<boolean>(false);
  const [bossSaga, setBossSaga] = useState<CampaignSaga | null>(null);
  const [bossAnswers, setBossAnswers] = useState<Record<number, number>>({});
  const [bossSubmitted, setBossSubmitted] = useState<boolean>(false);
  const [placementOpen, setPlacementOpen] = useState<boolean>(false);

  const curSaga = CAMPAIGN_SAGAS.find((s) => s.sagaNumber === activeSagaNum) || CAMPAIGN_SAGAS[0];

  const isSagaUnlocked = (sNum: number) => {
    if (sNum === 1) return true;
    return !!campaignClearedSagas[sNum - 1];
  };

  const totalStagesCompleted = Object.values(campaignCompletedStages).filter(Boolean).length;
  const totalSagasCleared = Object.values(campaignClearedSagas).filter((score) => score >= 70).length;

  const handleOpenBoss = (saga: CampaignSaga) => {
    setBossSaga(saga);
    setBossAnswers({});
    setBossSubmitted(false);
    setBossOpen(true);
  };

  const handleAnswerBossQ = (qIdx: number, optIdx: number) => {
    if (bossSubmitted) return;
    setBossAnswers((prev) => ({ ...prev, [qIdx]: optIdx }));
  };

  const handleSubmitBoss = () => {
    if (!bossSaga) return;
    setBossSubmitted(true);
    const score = bossSaga.boss.questions.filter((q, i) => bossAnswers[i] === q.answer).length;
    const passed = score >= bossSaga.boss.minPassScore;
    const pct = Math.round((score / bossSaga.boss.questions.length) * 100);

    if (passed) {
      completeCampaignSaga(bossSaga.sagaNumber, pct);
      if (sfxEnabled) playFanfare();
    } else {
      if (sfxEnabled) playMiss();
    }
  };

  const handleSkipToSaga = (targetSaga: number) => {
    for (let i = 1; i < targetSaga; i++) {
      completeCampaignSaga(i, 100);
      const saga = CAMPAIGN_SAGAS.find((s) => s.sagaNumber === i);
      if (saga) {
        saga.stages.forEach((st) => completeCampaignStage(st.id));
      }
    }
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
          <b>{totalStagesCompleted} / 24</b>
          <span>Missions Done 🎯</span>
        </div>
        <div className="stat">
          <b>{totalSagasCleared >= 5 ? 'N4 Bound' : totalSagasCleared >= 3 ? 'N5 Candidate' : 'Beginner'}</b>
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
            <button className="chip on" onClick={() => handleSkipToSaga(2)}>
              Jump to Saga 2 (Skip Hiragana) →
            </button>
            <button className="chip on" onClick={() => handleSkipToSaga(3)}>
              Jump to Saga 3 (Skip Katakana &amp; Signs) →
            </button>
            <button className="chip on" onClick={() => handleSkipToSaga(4)}>
              Jump to Saga 4 (Skip to 3 Verb Groups &amp; Te-Form) →
            </button>
            <button className="chip on" onClick={() => handleSkipToSaga(5)}>
              Jump to Saga 5 (N5 Full Simulation &amp; Traps) →
            </button>
            <button className="chip on" onClick={() => handleSkipToSaga(6)}>
              Jump to Saga 6 (N4 Frontier &amp; Conditionals) →
            </button>
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
                      completeCampaignStage(stage.id);
                      navigate(stage.targetRoute);
                    }}
                  >
                    {stage.actionPrompt}
                  </button>
                  <button
                    className={isDone ? 'chip ok' : 'chip'}
                    onClick={() => completeCampaignStage(stage.id)}
                    title="Mark mission as finished"
                  >
                    {isDone ? '✓ Completed' : 'Mark Done'}
                  </button>
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

            <p className="muted small" style={{ margin: '0.5rem 0 1rem' }}>
              {bossSaga.boss.description} (Pass Requirement: ≥ {bossSaga.boss.minPassScore} correct)
            </p>

            <div style={{ display: 'grid', gap: '1rem' }}>
              {bossSaga.boss.questions.map((q, qIdx) => {
                const pick = bossAnswers[qIdx];
                const isCorrect = pick === q.answer;
                return (
                  <div
                    key={qIdx}
                    style={{
                      background: 'var(--surface2)',
                      padding: '0.9rem 1.1rem',
                      borderRadius: '10px',
                    }}
                  >
                    <div style={{ fontWeight: 600, marginBottom: '0.5rem' }}>
                      {qIdx + 1}. {q.q}
                    </div>
                    <div className="controls" style={{ gap: '0.5rem', marginBottom: 0 }}>
                      {q.options.map((opt, optIdx) => {
                        const picked = pick === optIdx;
                        let cls = 'chip';
                        if (picked) cls = 'chip on';
                        if (bossSubmitted) {
                          if (optIdx === q.answer) cls = 'chip ok';
                          else if (picked && !isCorrect) cls = 'chip bad';
                        }
                        return (
                          <button
                            key={optIdx}
                            className={cls}
                            onClick={() => handleAnswerBossQ(qIdx, optIdx)}
                          >
                            {opt}
                          </button>
                        );
                      })}
                    </div>
                    {bossSubmitted && (
                      <p
                        className={isCorrect ? 'ok-text small nomargin' : 'bad-text small nomargin'}
                        style={{ marginTop: '0.45rem' }}
                      >
                        {isCorrect ? '✓ Correct! ' : '✗ Missed! '}
                        {q.explanation}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>

            <div className="controls" style={{ marginTop: '1.2rem', justifyContent: 'space-between', alignItems: 'center' }}>
              {!bossSubmitted ? (
                <button
                  className="chip on"
                  style={{ padding: '0.6rem 1.4rem', fontWeight: 700 }}
                  disabled={Object.keys(bossAnswers).length < bossSaga.boss.questions.length}
                  onClick={handleSubmitBoss}
                >
                  ⚔️ Submit Exam Answers ({Object.keys(bossAnswers).length}/{bossSaga.boss.questions.length})
                </button>
              ) : (
                <div style={{ display: 'flex', gap: '0.6rem', alignItems: 'center', width: '100%', justifyContent: 'space-between' }}>
                  <div>
                    {bossSaga.boss.questions.filter((q, i) => bossAnswers[i] === q.answer).length >= bossSaga.boss.minPassScore ? (
                      <b className="ok-text" style={{ fontSize: '1.1rem' }}>
                        🎉 VICTORY! SAGA {bossSaga.sagaNumber} CLEARED!
                      </b>
                    ) : (
                      <b className="bad-text" style={{ fontSize: '1.05rem' }}>
                        💀 NOT PASSED. Need ≥ {bossSaga.boss.minPassScore} to unlock next Saga.
                      </b>
                    )}
                  </div>
                  <div className="controls nomargin">
                    <button
                      className="chip"
                      onClick={() => {
                        setBossAnswers({});
                        setBossSubmitted(false);
                      }}
                    >
                      ↺ Retry
                    </button>
                    {bossSaga.sagaNumber < CAMPAIGN_SAGAS.length && (
                      <button
                        className="chip on"
                        onClick={() => {
                          setBossOpen(false);
                          setActiveSagaNum(bossSaga.sagaNumber + 1);
                        }}
                      >
                        Advance to Saga {bossSaga.sagaNumber + 1} →
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
