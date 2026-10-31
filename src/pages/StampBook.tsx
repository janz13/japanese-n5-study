import { useState } from 'react';
import { Link } from 'react-router-dom';
import { STAMPS, type StampDef } from '../data/stamps';
import { todayStr, useStore } from '../lib/store';
import { playFanfare } from '../lib/sfx';
import { speak } from '../lib/tts';

export function useEarnedStamps() {
  const s = useStore();
  const kanaCount = Object.values(s.kanaStats).filter((k) => k.correct >= 1).length;
  const srsCount = Object.keys(s.srs).length;

  const autoEarned: Record<string, boolean> = {
    narita: 'ch1-arrival' in s.completedStories || 'g1' in s.grammarDone,
    'tokyo-eki': kanaCount >= 5,
    ueno: s.bentoCount >= 1,
    ginza: 'ch2-cafe' in s.completedStories || 's2' in s.scenesDone || 'g2' in s.grammarDone,
    asakusa: 'ch3-asakusa' in s.completedStories || 'g3' in s.grammarDone,
    akihabara: srsCount >= 5,
    shinjuku: s.examBest !== null,
    kyoto: 'ch4-weekend' in s.completedStories || 'g4' in s.grammarDone,
  };

  const map: Record<string, string> = { ...s.unlockedStamps };
  for (const [id, ok] of Object.entries(autoEarned)) {
    if (ok && !map[id]) {
      map[id] = s.lastStudy ?? todayStr();
    }
  }
  return map;
}

export function StampSvg({ stamp, unlocked, date }: { stamp: StampDef; unlocked: boolean; date?: string }) {
  const ink = unlocked ? (stamp.kind === 'goshuin' ? '#d13b2e' : '#c44536') : 'var(--muted)';
  return (
    <svg viewBox="0 0 120 120" className={`stamp-svg ${unlocked ? 'stamped' : 'unstamped'}`}>
      {stamp.shape === 'circle' && (
        <>
          <circle cx="60" cy="60" r="52" fill="none" stroke={ink} strokeWidth="3.5" />
          <circle cx="60" cy="60" r="47" fill="none" stroke={ink} strokeWidth="1" strokeDasharray="3 2" />
        </>
      )}
      {stamp.shape === 'octagon' && (
        <>
          <polygon
            points="38,8 82,8 112,38 112,82 82,112 38,112 8,82 8,38"
            fill="none"
            stroke={ink}
            strokeWidth="3.5"
          />
          <polygon
            points="40,13 80,13 107,40 107,80 80,107 40,107 13,80 13,40"
            fill="none"
            stroke={ink}
            strokeWidth="1"
          />
        </>
      )}
      {stamp.shape === 'rect' && (
        <>
          <rect x="14" y="10" width="92" height="100" rx="6" fill="none" stroke={ink} strokeWidth="3.5" />
          <rect x="19" y="15" width="82" height="90" rx="3" fill="none" stroke={ink} strokeWidth="1" />
        </>
      )}
      <text x="60" y="30" textAnchor="middle" fill={ink} fontSize="8.5" fontWeight="600" letterSpacing="1">
        {stamp.kind === 'goshuin' ? '奉拝・御朱印' : 'JR・駅スタンプ'}
      </text>
      <text
        x="60"
        y="65"
        textAnchor="middle"
        fill={ink}
        fontSize={stamp.kanji.length > 2 ? '22' : '27'}
        fontWeight="700"
        fontFamily="'Noto Sans JP', serif"
      >
        {stamp.kanji}
      </text>
      <text x="60" y="84" textAnchor="middle" fill={ink} fontSize="8.5" fontFamily="'Noto Sans JP', sans-serif">
        {stamp.subKanji}
      </text>
      <text x="60" y="99" textAnchor="middle" fill={ink} fontSize="7.5" opacity="0.85">
        {unlocked ? date || '合格印' : '未取得'}
      </text>
    </svg>
  );
}

export default function StampBook() {
  const earned = useEarnedStamps();
  const { unlockStamp } = useStore();
  const [selected, setSelected] = useState<StampDef>(STAMPS[0]);
  const [justPressed, setJustPressed] = useState<string | null>(null);

  const count = Object.keys(earned).length;

  const pressStamp = (st: StampDef) => {
    unlockStamp(st.id);
    setSelected(st);
    setJustPressed(st.id);
    playFanfare();
    speak(st.kanji);
    setTimeout(() => setJustPressed(null), 600);
  };

  return (
    <div className="page">
      <div className="row-between">
        <h1>御朱印帳 <span className="muted">Goshuin &amp; Eki-Stamp Book</span></h1>
        <span className="chip on">{count} / {STAMPS.length} Collected</span>
      </div>
      <p className="muted">
        Collect traditional Japanese temple seals (御朱印) and train station stamps (駅スタンプ) as you complete lessons, stories, and Daily Bentos—or press any seal below to preview its ink.
      </p>

      <div className="stamp-grid">
        {STAMPS.map((st) => {
          const isUnlocked = !!earned[st.id];
          const isActive = selected.id === st.id;
          return (
            <div
              key={st.id}
              className={`stamp-card ${isUnlocked ? 'unlocked' : 'locked-stamp'} ${isActive ? 'active-stamp' : ''} ${
                justPressed === st.id ? 'stamp-pop' : ''
              }`}
              onClick={() => {
                setSelected(st);
                speak(st.kanji);
              }}
            >
              <StampSvg stamp={st} unlocked={isUnlocked} date={earned[st.id]} />
              <div className="stamp-title">{st.nameEn}</div>
              <small className="muted">{st.location}</small>
              {!isUnlocked ? (
                <button
                  className="chip small"
                  style={{ marginTop: '0.4rem' }}
                  onClick={(e) => {
                    e.stopPropagation();
                    pressStamp(st);
                  }}
                >
                  🖃 Press Stamp
                </button>
              ) : (
                <span className="ok-text small" style={{ marginTop: '0.4rem' }}>✓ Stamped</span>
              )}
            </div>
          );
        })}
      </div>

      {selected && (
        <div className="gp" style={{ marginTop: '1.5rem' }}>
          <div className="row-between">
            <div>
              <span className="tag">{selected.kind === 'goshuin' ? '御朱印 Temple Goshuin' : '駅スタンプ Station Stamp'}</span>
              <h2 className="nomargin">
                <span className="jp">{selected.kanji}</span> ({selected.subKanji}) — {selected.nameEn}
              </h2>
              <p className="muted small">{selected.location}</p>
            </div>
            {!earned[selected.id] && (
              <button className="chip on" onClick={() => pressStamp(selected)}>
                🖃 Stamp in Book
              </button>
            )}
          </div>
          <p>{selected.culturalNote}</p>
          <p className="small muted">
            <b>How to earn:</b> {selected.requirement}
          </p>
          <div className="controls">
            <Link className="chip on" to="/bento">🍱 Start Today's 5-Min Bento →</Link>
            <Link className="chip" to="/stories">📖 Go to Stories →</Link>
          </div>
        </div>
      )}
    </div>
  );
}
