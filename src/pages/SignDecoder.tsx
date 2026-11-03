import { useEffect, useMemo, useState } from 'react';
import { SIGN_CATEGORIES, SIGNS, type SignCategory } from '../data/signs';
import { SHOKKENKI_MISSIONS, TICKET_BUTTONS, type TicketButton } from '../data/shokkenki';
import { useStore } from '../lib/store';
import { speak } from '../lib/tts';
import { playDing, playFanfare, playMiss } from '../lib/sfx';
import { useCampaignMission } from '../lib/useCampaignMission';
import CampaignBanner from '../components/CampaignBanner';

/** Shuffle options so the correct answer isn't always first. */
function shuffled<T>(arr: T[]) {
  const a = arr.map((v, i) => ({ v, i, r: Math.random() }));
  return a.sort((x, y) => x.r - y.r);
}

export default function SignDecoder() {
  const { sfxEnabled: sfx, srs, addCard } = useStore();
  const {
    isCampaignMode,
    stage,
    saga,
    targetTab,
    completeMission,
    returnToCampaign,
  } = useCampaignMission();

  const [mode, setMode] = useState<'signs' | 'shokkenki'>(() => {
    if (targetTab === 'shokkenki' || targetTab === 'signs') return targetTab;
    return 'signs';
  });

  useEffect(() => {
    if (targetTab === 'shokkenki' || targetTab === 'signs') {
      setMode(targetTab);
    }
  }, [targetTab]);

  const [cat, setCat] = useState<SignCategory | 'all'>('all');
  const [choices, setChoices] = useState<Record<string, number>>({});

  // Shokkenki (Ticket Machine) state
  const [missionIdx, setMissionIdx] = useState(0);
  const [cart, setCart] = useState<string[]>([]);
  const [showGloss, setShowGloss] = useState(false);
  const [ticketResult, setTicketResult] = useState<'ok' | 'bad' | null>(null);

  const list = useMemo(() => SIGNS.filter((s) => cat === 'all' || s.category === cat), [cat]);
  const order = useMemo(() => Object.fromEntries(SIGNS.map((s) => [s.id, shuffled(s.options)])), []);
  const solved = SIGNS.filter((s) => choices[s.id] === s.answer).length;

  const answer = (id: string, idx: number, correct: number) => {
    if (id in choices) return;
    setChoices((c) => ({ ...c, [id]: idx }));
    if (sfx) (idx === correct ? playDing : playMiss)();
    if (isCampaignMode && mode === 'signs' && idx === correct) {
      const nextSolved = solved + 1;
      if (nextSolved >= 3) {
        completeMission();
      }
    }
  };

  const mission = SHOKKENKI_MISSIONS[missionIdx % SHOKKENKI_MISSIONS.length];
  const cartTotal = cart.reduce((sum, id) => {
    const b = TICKET_BUTTONS.find((x) => x.id === id);
    return sum + (b?.price ?? 0);
  }, 0);

  const toggleTicketButton = (btn: TicketButton) => {
    speak(btn.kana);
    setTicketResult(null);
    setCart((prev) => (prev.includes(btn.id) ? prev.filter((x) => x !== btn.id) : [...prev, btn.id]));
  };

  const issueTickets = () => {
    const req = mission.requiredIds;
    const isExactMatch = req.length === cart.length && req.every((id) => cart.includes(id));
    setTicketResult(isExactMatch ? 'ok' : 'bad');
    if (sfx) (isExactMatch ? playFanfare : playMiss)();
    if (isExactMatch) {
      speak(mission.kitchenCallKana);
      if (isCampaignMode) {
        completeMission();
      }
    }
  };

  return (
    <div className="page">
      {isCampaignMode && stage && (
        <CampaignBanner stage={stage} saga={saga} onReturn={returnToCampaign} />
      )}
      <div className="row-between">
        <div>
          <h1 className="nomargin">
            看板・食券機 <span className="muted">Sign Decoder &amp; Ticket Machine</span>
          </h1>
          <p className="muted small nomargin" style={{ marginTop: '0.2rem' }}>
            Decode real Japanese street signs or practice ordering on a ramen shop ticket machine (`食券機`).
          </p>
        </div>
        <div className="controls">
          <button className={mode === 'signs' ? 'chip on' : 'chip'} onClick={() => setMode('signs')}>
            🏮 Street &amp; Shop Signs ({SIGNS.length})
          </button>
          <button className={mode === 'shokkenki' ? 'chip on' : 'chip'} onClick={() => setMode('shokkenki')}>
            🎫 Ramen Ticket Machine (食券機)
          </button>
        </div>
      </div>

      {mode === 'signs' ? (
        <>
          <div className="controls" style={{ marginTop: '0.8rem' }}>
            <button className={cat === 'all' ? 'chip on' : 'chip'} onClick={() => setCat('all')}>
              All ({SIGNS.length} · {solved} decoded)
            </button>
            {(Object.keys(SIGN_CATEGORIES) as SignCategory[]).map((c) => (
              <button key={c} className={cat === c ? 'chip on' : 'chip'} onClick={() => setCat(c)}>
                {SIGN_CATEGORIES[c]} ({SIGNS.filter((s) => s.category === c).length})
              </button>
            ))}
            <button className="chip" onClick={() => setChoices({})}>↺ Reset</button>
          </div>

          {list.map((s) => {
            const picked = choices[s.id];
            return (
              <div key={s.id} className="gp">
                <span className="tag">{s.place}</span>
                <div className="sign-board jp" style={{ margin: '0.6rem 0', fontSize: '1.4rem', cursor: 'pointer' }} onClick={() => speak(s.reading)}>
                  🔊 {s.sign}
                </div>
                {picked !== undefined && <p className="muted small nomargin">{s.reading}</p>}
                <p>{s.question}</p>
                <div className="controls">
                  {order[s.id].map(({ v, i }) => (
                    <button
                      key={i}
                      className={picked === undefined ? 'chip' : i === s.answer ? 'chip ok' : picked === i ? 'chip bad' : 'chip'}
                      onClick={() => answer(s.id, i, s.answer)}
                    >
                      {v}
                    </button>
                  ))}
                </div>
                {picked !== undefined && <p className="small ok-text">💡 {s.note}</p>}
              </div>
            );
          })}
        </>
      ) : (
        <>
          {/* Shokkenki Mission Banner */}
          <div className="bento-banner" style={{ marginTop: '1rem' }}>
            <div style={{ flex: 1 }}>
              <span className="tag">🍜 RAMEN SHOKKENKI ORDER MISSION ({(missionIdx % SHOKKENKI_MISSIONS.length) + 1}/{SHOKKENKI_MISSIONS.length})</span>
              <h2 className="nomargin" style={{ fontSize: '1.3rem', marginTop: '0.2rem' }}>
                {mission.title}
              </h2>
              <p className="nomargin" style={{ marginTop: '0.25rem', fontWeight: 600 }}>
                🎯 {mission.orderEn}
              </p>
            </div>
            <div className="controls">
              <button className={showGloss ? 'chip on' : 'chip'} onClick={() => setShowGloss((g) => !g)}>
                {showGloss ? '🙈 Hide English Gloss' : '💡 Show Reading & English'}
              </button>
              <button
                className="chip"
                onClick={() => {
                  setMissionIdx((i) => i + 1);
                  setCart([]);
                  setTicketResult(null);
                }}
              >
                Next Mission →
              </button>
            </div>
          </div>

          {/* 14-Button Japanese Ticket Machine Grid */}
          <div className="gp" style={{ padding: '1.2rem' }}>
            <div className="row-between" style={{ marginBottom: '0.8rem' }}>
              <b>🎫 自動券売機 (Ticket Vending Machine) — Tap buttons to select</b>
              <span className="chip on" style={{ fontWeight: 700 }}>
                投入金額 / Total: ¥{cartTotal.toLocaleString()} ({cart.length} items)
              </span>
            </div>

            {(['dining', 'main', 'topping', 'side'] as const).map((rowKey) => {
              const rowLabel =
                rowKey === 'dining'
                  ? '① 食券区分 (Dine-In vs. Take-Out)'
                  : rowKey === 'main'
                    ? '② ラーメン・麺類 (Main Ramen Bowls)'
                    : rowKey === 'topping'
                      ? '③ トッピング・お好み (Toppings & Customizations)'
                      : '④ サイドメニュー・お飲み物 (Sides & Drinks)';
              return (
                <div key={rowKey} style={{ marginBottom: '0.9rem' }}>
                  <div className="muted small" style={{ marginBottom: '0.35rem', fontWeight: 600 }}>
                    {rowLabel}
                  </div>
                  <div
                    style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(auto-fill, minmax(195px, 1fr))',
                      gap: '0.55rem',
                    }}
                  >
                    {TICKET_BUTTONS.filter((b) => b.row === rowKey).map((btn) => {
                      const active = cart.includes(btn.id);
                      return (
                        <button
                          key={btn.id}
                          type="button"
                          onClick={() => toggleTicketButton(btn)}
                          style={{
                            background: active
                              ? 'color-mix(in srgb, var(--accent) 24%, var(--surface2))'
                              : 'var(--surface2)',
                            border: active ? '2px solid var(--accent)' : '1px solid transparent',
                            borderRadius: '10px',
                            padding: '0.65rem 0.8rem',
                            textAlign: 'left',
                            cursor: 'pointer',
                            color: 'var(--text)',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '0.15rem',
                          }}
                        >
                          <div className="row-between" style={{ width: '100%' }}>
                            <b className="jp" style={{ fontSize: '1.02rem' }}>
                              <span style={{ marginRight: '0.35rem' }}>{btn.icon}</span>
                              {btn.kanji}
                            </b>
                            <span className="tag" style={{ fontWeight: 700 }}>
                              {btn.price === 0 ? '¥0' : `¥${btn.price}`}
                            </span>
                          </div>
                          {showGloss && (
                            <>
                              <span className="muted small jp">{btn.kana}</span>
                              <span className="muted small">{btn.en}</span>
                            </>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })}

            {/* Tray & Issue Ticket Bar */}
            <div
              className="row-between"
              style={{
                borderTop: '1px solid var(--surface2)',
                paddingTop: '0.9rem',
                marginTop: '0.4rem',
              }}
            >
              <div className="controls nomargin">
                {cart.length === 0 ? (
                  <span className="muted small">No buttons selected yet.</span>
                ) : (
                  cart.map((id) => {
                    const b = TICKET_BUTTONS.find((x) => x.id === id)!;
                    return (
                      <span key={id} className="chip on" style={{ fontSize: '0.82rem' }}>
                        {b.icon} {b.kanji} (¥{b.price})
                      </span>
                    );
                  })
                )}
              </div>
              <div className="controls nomargin">
                <button
                  className="chip"
                  onClick={() => {
                    setCart([]);
                    setTicketResult(null);
                  }}
                >
                  ↺ Clear Tray
                </button>
                <button className="chip on" style={{ fontWeight: 700 }} onClick={issueTickets}>
                  🎫 発券 Issue Tickets (¥{cartTotal.toLocaleString()})
                </button>
              </div>
            </div>

            {ticketResult && (
              <div style={{ marginTop: '0.8rem' }}>
                <p className={ticketResult === 'ok' ? 'ok-text nomargin' : 'bad-text nomargin'}>
                  {ticketResult === 'ok'
                    ? `✓ Order Complete! 「${mission.kitchenCallKana}」 — ${mission.explain}`
                    : `✗ Not quite matching the mission yet! Hint: ${mission.explain}`}
                </p>
                <div className="controls" style={{ marginTop: '0.5rem' }}>
                  {mission.requiredIds.map((reqId) => {
                    const b = TICKET_BUTTONS.find((x) => x.id === reqId)!;
                    const srsId = `shokken:${b.id}`;
                    return (
                      <button
                        key={reqId}
                        className={srs[srsId] ? 'chip ok' : 'chip'}
                        disabled={!!srs[srsId]}
                        onClick={() =>
                          addCard({
                            id: srsId,
                            kind: 'word',
                            front: b.kanji,
                            reading: b.kana,
                            back: `${b.en} (Shokkenki Menu)`,
                          })
                        }
                      >
                        {srs[srsId] ? `✓ ${b.kanji} in SRS` : `+ Add ${b.kanji} to SRS`}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
