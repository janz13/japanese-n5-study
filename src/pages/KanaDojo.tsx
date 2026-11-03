import { useEffect, useMemo, useRef, useState } from 'react';
import { BASIC_ROWS, DAKUTEN_ROWS, HIRAGANA, KATAKANA, ROWS, YOON_ROWS, type Kana } from '../data/kana';
import { useStore } from '../lib/store';
import { speak } from '../lib/tts';
import { playDing, playFanfare, playMiss } from '../lib/sfx';
import { useCampaignMission } from '../lib/useCampaignMission';
import CampaignBanner from '../components/CampaignBanner';

type Script = 'hiragana' | 'katakana' | 'both';

/** Weighted pick: characters you miss more appear more often. */
function pick(pool: Kana[], stats: Record<string, { correct: number; wrong: number }>, last?: Kana) {
  const weights = pool.map((k) => {
    const s = stats[k.kana] ?? { correct: 0, wrong: 0 };
    return k === last && pool.length > 1 ? 0 : 1 + (s.wrong * 2) / (1 + s.correct * 0.5);
  });
  let r = Math.random() * weights.reduce((a, b) => a + b, 0);
  for (let i = 0; i < pool.length; i++) if ((r -= weights[i]) <= 0) return pool[i];
  return pool[0];
}

function matchesRomaji(input: string, k: Kana) {
  const clean = input.trim().toLowerCase();
  if (k.kana === 'ん' || k.kana === 'ン') {
    return clean === 'nn';
  }
  return clean === k.romaji || (k.alts?.includes(clean) ?? false);
}

export default function KanaDojo() {
  const { kanaStats, recordKana, sfxEnabled } = useStore();
  const {
    isCampaignMode,
    stage,
    saga,
    targetItems,
    targetScript,
    completeMission,
    returnToCampaign,
  } = useCampaignMission();

  const CAMPAIGN_DRILL_GOAL = 5;
  const [missionModalOpen, setMissionModalOpen] = useState(false);
  const [missionTriggered, setMissionTriggered] = useState(false);

  const [script, setScript] = useState<Script>(() => {
    if (targetScript === 'hiragana' || targetScript === 'katakana' || targetScript === 'both') {
      return targetScript;
    }
    return 'hiragana';
  });

  useEffect(() => {
    if (targetScript) {
      setScript(targetScript);
    }
  }, [targetScript]);

  const [rows, setRows] = useState<string[]>(ROWS);
  const [current, setCurrent] = useState<Kana | null>(null);
  const [input, setInput] = useState('');
  const [flash, setFlash] = useState<'ok' | 'bad' | null>(null);
  const [reveal, setReveal] = useState<string | null>(null);
  const [session, setSession] = useState({ ok: 0, total: 0 });
  const [showMnemonic, setShowMnemonic] = useState(false);
  const [autoAudio, setAutoAudio] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const pool = useMemo(() => {
    if (isCampaignMode && targetItems && targetItems.length > 0) {
      const cleanTargets = targetItems.map((t) => t.trim());
      const effectiveScript = targetScript ?? script;
      const src = effectiveScript === 'katakana' ? KATAKANA : effectiveScript === 'hiragana' ? HIRAGANA : [...HIRAGANA, ...KATAKANA];
      return src.filter((k) => cleanTargets.includes(k.kana));
    }
    const src = script === 'hiragana' ? HIRAGANA : script === 'katakana' ? KATAKANA : [...HIRAGANA, ...KATAKANA];
    return src.filter((k) => rows.includes(k.row));
  }, [isCampaignMode, targetItems, targetScript, script, rows]);

  useEffect(() => {
    if (pool.length) {
      const nextKana = pick(pool, kanaStats);
      setCurrent(nextKana);
      if (autoAudio && nextKana) speak(nextKana.kana, 0.85);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pool]);

  const submit = (val: string) => {
    if (!current) return;
    const ok = matchesRomaji(val, current);
    recordKana(current.kana, ok);
    const nextTotal = session.total + 1;
    const nextOk = session.ok + (ok ? 1 : 0);
    setSession({ ok: nextOk, total: nextTotal });

    if (isCampaignMode && nextTotal >= CAMPAIGN_DRILL_GOAL && !missionTriggered) {
      setMissionTriggered(true);
      completeMission();
      if (sfxEnabled) playFanfare();
      setMissionModalOpen(true);
    }
    setFlash(ok ? 'ok' : 'bad');
    if (sfxEnabled) (ok ? playDing : playMiss)();
    speak(current.kana, 0.85);
    const nextKana = pick(pool, kanaStats, current);
    if (ok) {
      setReveal(null);
      setCurrent(nextKana);
    } else {
      setReveal(`${current.kana} = ${current.romaji}`);
      setCurrent(nextKana);
    }
    if (autoAudio && nextKana) {
      setTimeout(() => speak(nextKana.kana, 0.85), 350);
    }
    setInput('');
    setTimeout(() => setFlash(null), 250);
  };

  const onChange = (v: string) => {
    setInput(v);
    if (current && matchesRomaji(v, current)) submit(v);
  };

  const toggleRow = (r: string) =>
    setRows((rs) => (rs.includes(r) ? (rs.length > 1 ? rs.filter((x) => x !== r) : rs) : [...rs, r]));

  const selectOnlyGroup = (groupRows: string[]) => setRows(groupRows);

  const refSource = script === 'katakana' ? KATAKANA : HIRAGANA;
  const basicAndDakuten = refSource.filter((k) => k.group !== 'yoon');
  const yoonList = refSource.filter((k) => k.group === 'yoon');

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
      <h1>Kana Dojo</h1>
      {isCampaignMode && targetItems && targetItems.length > 0 ? (
        <div
          className="controls"
          style={{
            background: 'var(--surface2)',
            padding: '0.6rem 0.9rem',
            borderRadius: '8px',
            marginBottom: '1rem',
            borderLeft: '3px solid var(--accent)',
            display: 'flex',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '0.5rem',
          }}
        >
          <span className="muted small">🎯 Mission Target Kana ({targetItems.length}):</span>
          {targetItems.map((item) => (
            <span key={item} className="chip on jp" style={{ fontWeight: 700 }}>
              {item}
            </span>
          ))}
        </div>
      ) : (
        <>
          <div className="controls">
            {(['hiragana', 'katakana', 'both'] as Script[]).map((s) => (
              <button key={s} className={script === s ? 'chip on' : 'chip'} onClick={() => setScript(s)}>
                {s}
              </button>
            ))}
            <span className="muted small" style={{ alignSelf: 'center', marginLeft: '0.4rem' }}>
              Filter:
            </span>
            <button
              className={rows.length === BASIC_ROWS.length && BASIC_ROWS.every((r) => rows.includes(r)) ? 'chip on' : 'chip'}
              onClick={() => selectOnlyGroup(BASIC_ROWS)}
            >
              Basic (46)
            </button>
            <button
              className={rows.length === DAKUTEN_ROWS.length && DAKUTEN_ROWS.every((r) => rows.includes(r)) ? 'chip on' : 'chip'}
              onClick={() => selectOnlyGroup(DAKUTEN_ROWS)}
            >
              Dakuten (25)
            </button>
            <button
              className={rows.length === YOON_ROWS.length && YOON_ROWS.every((r) => rows.includes(r)) ? 'chip on' : 'chip'}
              onClick={() => selectOnlyGroup(YOON_ROWS)}
            >
              Yōon Combos (33)
            </button>
            <button className={rows.length === ROWS.length ? 'chip on' : 'chip'} onClick={() => setRows(ROWS)}>
              All (104)
            </button>
          </div>

          <div className="controls">
            {ROWS.map((r) => (
              <button key={r} className={rows.includes(r) ? 'chip on' : 'chip'} onClick={() => toggleRow(r)}>
                {refSource.find((k) => k.row === r)?.kana}
              </button>
            ))}
          </div>
        </>
      )}

      <div className={`drill ${flash ?? ''}`} onClick={() => inputRef.current?.focus()}>
        <div className="drill-char">{current?.kana}</div>

        {/* 1-Line Visual Memory Hook for Beginners */}
        {showMnemonic && current?.mnemonic && (
          <div
            className="mnemonic-card"
            style={{
              background: 'var(--surface2)',
              borderLeft: '3px solid var(--accent)',
              borderRadius: '8px',
              padding: '0.45rem 0.85rem',
              margin: '0.2rem auto 0.8rem',
              maxWidth: '420px',
              fontSize: '0.9rem',
              textAlign: 'left',
              animation: 'fadeIn 0.2s ease',
            }}
          >
            💡 <b>Memory Hook:</b> {current.mnemonic}
          </div>
        )}

        <input
          ref={inputRef}
          autoFocus
          value={input}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && input && submit(input)}
          placeholder="type romaji…"
          className="drill-input"
          autoComplete="off"
          autoCapitalize="off"
        />

        <div className="controls center" style={{ marginTop: '0.7rem', gap: '0.5rem', flexWrap: 'wrap' }}>
          <button
            type="button"
            className={showMnemonic ? 'chip on' : 'chip'}
            onClick={(e) => {
              e.stopPropagation();
              setShowMnemonic((m) => !m);
            }}
            title="Toggle 1-line visual mnemonic hook"
          >
            💡 {showMnemonic ? 'Hide Mnemonic' : 'Mnemonic Peek'}
          </button>
          <button
            type="button"
            className="chip"
            onClick={(e) => {
              e.stopPropagation();
              if (current) speak(current.kana, 0.85);
            }}
            title="Hear character pronunciation"
          >
            🔊 Hear Sound
          </button>
          <button
            type="button"
            className={autoAudio ? 'chip on' : 'chip'}
            onClick={(e) => {
              e.stopPropagation();
              setAutoAudio((a) => !a);
            }}
            title="Auto-play audio on prompt appearance"
          >
            {autoAudio ? '🔊 Auto-Audio: ON' : '🔈 Auto-Audio: OFF'}
          </button>
        </div>

        <div className="drill-meta" style={{ marginTop: '0.6rem' }}>
          {reveal ? <span className="bad-text">✗ {reveal}</span> : <span>&nbsp;</span>}
          <span>
            {session.ok}/{session.total} · {session.total ? Math.round((session.ok / session.total) * 100) : 0}%
          </span>
        </div>
      </div>

      {/* Accuracy Heatmap Legend & Drill Weak */}
      <div className="row-between" style={{ marginTop: '1.5rem', marginBottom: '0.5rem', flexWrap: 'wrap', gap: '0.6rem' }}>
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
          const src = script === 'katakana' ? KATAKANA : script === 'both' ? [...HIRAGANA, ...KATAKANA] : HIRAGANA;
          const weakKana = src.filter((k) => {
            const s = kanaStats[k.kana];
            return s && s.wrong > 0 && s.wrong >= s.correct;
          });
          return weakKana.length > 0 ? (
            <button
              className="chip on"
              onClick={() => {
                const weakRows = [...new Set(weakKana.map((k) => k.row))];
                setRows(weakRows);
              }}
            >
              🎯 Drill {weakKana.length} Struggling Kana
            </button>
          ) : null;
        })()}
      </div>

      <h2>Basic, Dakuten &amp; Handakuten ({basicAndDakuten.length})</h2>
      <div className="chart">
        {basicAndDakuten.map((k) => {
          const s = kanaStats[k.kana];
          const isStruggling = s && s.wrong > 0 && s.wrong >= s.correct;
          const level = !s || s.correct === 0 ? 0 : s.correct >= 3 && s.correct > s.wrong * 2 ? 2 : 1;
          return (
            <button
              key={k.kana}
              className={`cell l${level}`}
              style={isStruggling ? { boxShadow: 'inset 0 -3px 0 var(--bad)' } : undefined}
              onClick={() => speak(k.kana)}
            >
              <span>{k.kana}</span>
              <small>{k.romaji}</small>
            </button>
          );
        })}
      </div>

      <h2>Combination Kana — Yōon 拗音 ({yoonList.length})</h2>
      <div className="chart">
        {yoonList.map((k) => {
          const s = kanaStats[k.kana];
          const isStruggling = s && s.wrong > 0 && s.wrong >= s.correct;
          const level = !s || s.correct === 0 ? 0 : s.correct >= 3 && s.correct > s.wrong * 2 ? 2 : 1;
          return (
            <button
              key={k.kana}
              className={`cell l${level}`}
              style={isStruggling ? { boxShadow: 'inset 0 -3px 0 var(--bad)' } : undefined}
              onClick={() => speak(k.kana)}
            >
              <span>{k.kana}</span>
              <small>{k.romaji}</small>
            </button>
          );
        })}
      </div>

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
                Continue Practice
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
