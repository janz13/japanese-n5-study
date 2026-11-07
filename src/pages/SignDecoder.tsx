import { useEffect, useMemo, useState } from 'react';
import {
  SIGNS,
  SIGN_CATEGORIES,
  type SignCategory,
} from '../data/signs';
import {
  TICKET_BUTTONS,
  SHOKKENKI_MISSIONS,
  type TicketButton,
} from '../data/shokkenki';
import { useStore } from '../lib/store';
import { speak } from '../lib/tts';
import { playDing, playMiss, playFanfare } from '../lib/sfx';
import { useCampaignMission } from '../lib/useCampaignMission';
import CampaignBanner from '../components/CampaignBanner';
import ConbiniSimulator from '../components/ConbiniSimulator';
import IzakayaSimulator from '../components/IzakayaSimulator';
import TransitKioskSimulator from '../components/TransitKioskSimulator';

export type DecoderTab = 'signs' | 'shokkenki' | 'conbini' | 'izakaya' | 'kiosk';

function shuffled<T>(arr: T[]): T[] {
  const c = [...arr];
  for (let i = c.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [c[i], c[j]] = [c[j], c[i]];
  }
  return c;
}

export default function SignDecoder() {
  const {
    decodedSigns,
    recordSignChoice,
    resetSignChoices,
    sfxEnabled: sfx,
    shokkenkiMissionIdx,
    setShokkenkiMissionIdx,
    completeShokkenkiOrder,
    addCard,
    srs,
  } = useStore();

  const {
    isCampaignMode,
    stage,
    saga,
    targetTab,
    completeMission,
    returnToCampaign,
  } = useCampaignMission();

  const isValidTab = (tab?: string): tab is DecoderTab =>
    tab === 'signs' || tab === 'shokkenki' || tab === 'conbini' || tab === 'izakaya' || tab === 'kiosk';

  const [mode, setMode] = useState<DecoderTab>(() => {
    if (isValidTab(targetTab)) return targetTab;
    return 'signs';
  });

  useEffect(() => {
    if (targetTab && isValidTab(targetTab)) {
      setMode((prev) => (prev !== targetTab ? (targetTab as DecoderTab) : prev));
    }
  }, [targetTab]);

  const [cat, setCat] = useState<SignCategory | 'all'>('all');

  // Shokkenki (Ticket Machine) transient state
  const [cart, setCart] = useState<string[]>([]);
  const [showGloss, setShowGloss] = useState(false);
  const [ticketResult, setTicketResult] = useState<'ok' | 'bad' | null>(null);

  const list = useMemo(() => SIGNS.filter((s) => cat === 'all' || s.category === cat), [cat]);
  const order = useMemo(() => Object.fromEntries(SIGNS.map((s) => [s.id, shuffled(s.options)])), []);
  const solved = SIGNS.filter((s) => decodedSigns[s.id] === s.answer).length;

  const answer = (id: string, idx: number, correct: number) => {
    if (id in decodedSigns) return;
    recordSignChoice(id, idx);
    if (sfx) (idx === correct ? playDing : playMiss)();
    if (isCampaignMode && mode === 'signs' && idx === correct) {
      const nextSolved = solved + 1;
      if (nextSolved >= 3) {
        completeMission();
      }
    }
  };

  const mission = SHOKKENKI_MISSIONS[shokkenkiMissionIdx % SHOKKENKI_MISSIONS.length];
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
      completeShokkenkiOrder(mission.id);
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
      <div className="row-between" style={{ flexWrap: 'wrap', gap: '0.8rem', alignItems: 'flex-start' }}>
        <div>
          <h1 className="nomargin">
            看板・端末シミュレーター <span className="muted">Japanese Public Terminals</span>
          </h1>
          <p className="muted small nomargin" style={{ marginTop: '0.2rem' }}>
            Decode real street signs or operate authentic Japanese self-service kiosks (Ramen Ticket Machines, Conbini POS, Izakaya Tablets, and Station Kiosks).
          </p>
        </div>
        <div className="controls" style={{ flexWrap: 'wrap', gap: '0.4rem' }}>
          <button className={mode === 'signs' ? 'chip on' : 'chip'} onClick={() => setMode('signs')}>
            🏮 Street Signs ({SIGNS.length})
          </button>
          <button className={mode === 'shokkenki' ? 'chip on' : 'chip'} onClick={() => setMode('shokkenki')}>
            🍜 Ramen Ticket Machine
          </button>
          <button className={mode === 'conbini' ? 'chip on' : 'chip'} onClick={() => setMode('conbini')}>
            🏪 Conbini POS Register
          </button>
          <button className={mode === 'izakaya' ? 'chip on' : 'chip'} onClick={() => setMode('izakaya')}>
            🍶 Izakaya Tablet
          </button>
          <button className={mode === 'kiosk' ? 'chip on' : 'chip'} onClick={() => setMode('kiosk')}>
            🚆 Station &amp; Vending Kiosk
          </button>
        </div>
      </div>

      {/* MODE 1: Street Signs */}
      {mode === 'signs' && (
        <>
          <div className="controls" style={{ marginTop: '0.8rem', flexWrap: 'wrap', gap: '0.4rem', alignItems: 'center' }}>
            <button className={cat === 'all' ? 'chip on' : 'chip'} onClick={() => setCat('all')}>
              All ({SIGNS.length} · {solved} decoded)
            </button>
            {(Object.keys(SIGN_CATEGORIES) as SignCategory[]).map((c) => (
              <button key={c} className={cat === c ? 'chip on' : 'chip'} onClick={() => setCat(c)}>
                {SIGN_CATEGORIES[c]} ({SIGNS.filter((s) => s.category === c).length})
              </button>
            ))}
            {Object.keys(decodedSigns).length > 0 && (
              <button
                className="chip"
                style={{ marginLeft: 'auto', fontSize: '0.78rem' }}
                onClick={() => resetSignChoices()}
              >
                ↺ Reset Decoded Signs
              </button>
            )}
          </div>

          <div className="sign-grid">
            {list.map((s) => {
              const picked = decodedSigns[s.id];
              const isAnswered = picked !== undefined;
              const isCorrect = picked === s.answer;

              return (
                <div key={s.id} className="sign-card">
                  <div className="row-between">
                    <span className="tag">{SIGN_CATEGORIES[s.category]}</span>
                    {isAnswered && (
                      <span className={isCorrect ? 'ok-text' : 'bad-text'}>
                        {isCorrect ? '✓ Decoded' : '✗ Try again next time'}
                      </span>
                    )}
                  </div>

                  <div className="sign-display">
                    <div className="sign-jp">{s.sign}</div>
                    {s.reading && isAnswered && <div className="sign-reading">{s.reading}</div>}
                    <div className="sign-context">{s.place}</div>
                  </div>

                  <p className="sign-prompt">{s.question}</p>

                  <div className="controls">
                    {(order[s.id] || s.options).map((opt) => {
                      const realIdx = s.options.indexOf(opt);
                      let cls = 'chip';
                      if (isAnswered) {
                        if (realIdx === s.answer) cls = 'chip ok';
                        else if (realIdx === picked) cls = 'chip bad';
                      }
                      return (
                        <button
                          key={opt}
                          className={cls}
                          disabled={isAnswered}
                          onClick={() => answer(s.id, realIdx, s.answer)}
                        >
                          {opt}
                        </button>
                      );
                    })}
                  </div>

                  {isAnswered && (
                    <div className="sign-notes">
                      <p className="small nomargin">{s.note}</p>
                      <div className="row-between" style={{ marginTop: '0.5rem' }}>
                        <button
                          className="chip"
                          onClick={() =>
                            addCard({
                              id: `sign:${s.id}`,
                              kind: 'word',
                              front: s.sign,
                              reading: s.reading,
                              back: `${s.question} → ${s.options[s.answer]} (${s.place})`,
                            })
                          }
                          disabled={!!srs[`sign:${s.id}`]}
                        >
                          {srs[`sign:${s.id}`] ? '✓ In SRS' : '+ Add to SRS'}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </>
      )}

      {/* MODE 2: Ramen Shokkenki */}
      {mode === 'shokkenki' && (
        <div style={{ marginTop: '1rem' }}>
          {/* Mission Card */}
          <div
            className="gp"
            style={{
              padding: '1.1rem',
              marginBottom: '1rem',
              background: 'var(--surface)',
              borderLeft: '4px solid var(--accent)',
            }}
          >
            <div className="row-between" style={{ flexWrap: 'wrap', gap: '0.5rem' }}>
              <div>
                <span className="tag" style={{ background: 'var(--accent)', color: '#000', fontWeight: 700 }}>
                  CUSTOMER MISSION {shokkenkiMissionIdx + 1} / {SHOKKENKI_MISSIONS.length}
                </span>
                <h3 className="nomargin" style={{ marginTop: '0.25rem' }}>
                  {mission.title}
                </h3>
              </div>
              {mission.maxBudget && (
                <span className="chip on" style={{ fontWeight: 600 }}>
                  Budget Target: ¥{mission.maxBudget.toLocaleString()}
                </span>
              )}
            </div>
            <p className="muted small" style={{ margin: '0.4rem 0 0.2rem' }}>
              <b>Scenario:</b> {mission.orderEn}
            </p>
            <div className="controls nomargin" style={{ marginTop: '0.6rem' }}>
              <button className="chip" onClick={() => speak(mission.kitchenCallKana)}>
                🔊 Listen to Order Call
              </button>
              <button className="chip" onClick={() => setShowGloss(!showGloss)}>
                {showGloss ? '🙈 Hide English Gloss' : '💡 Show Reading & English'}
              </button>
              <button
                className="chip"
                onClick={() => {
                  setShokkenkiMissionIdx((shokkenkiMissionIdx + 1) % SHOKKENKI_MISSIONS.length);
                  setCart([]);
                  setTicketResult(null);
                }}
              >
                Next Mission →
              </button>
            </div>
            {showGloss && (
              <div style={{ marginTop: '0.6rem', padding: '0.6rem', background: 'rgba(0,0,0,0.2)', borderRadius: '6px' }}>
                <div className="small"><b>Explanation:</b> {mission.explain}</div>
                <div className="small muted"><b>Kitchen Call:</b> {mission.kitchenCallKana}</div>
              </div>
            )}
          </div>

          {/* 14-Button Japanese Ticket Machine Grid */}
          <div className="gp" style={{ padding: '1.2rem' }}>
            <div className="row-between" style={{ marginBottom: '0.8rem', flexWrap: 'wrap', gap: '0.5rem' }}>
              <b>🎫 自動券売機 (Ticket Vending Machine) — Tap buttons to select</b>
              <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                {mission.maxBudget && cartTotal > mission.maxBudget && (
                  <span className="chip bad" style={{ fontWeight: 700, fontSize: '0.82rem' }}>
                    ⚠️ Over Budget (¥{cartTotal.toLocaleString()} &gt; ¥{mission.maxBudget.toLocaleString()})
                  </span>
                )}
                <span className="chip on" style={{ fontWeight: 700 }}>
                  投入金額 / Total: ¥{cartTotal.toLocaleString()} ({cart.length} items)
                </span>
              </div>
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
        </div>
      )}

      {/* MODE 3: Conbini POS Register */}
      {mode === 'conbini' && (
        <ConbiniSimulator onCompleteMission={isCampaignMode ? completeMission : undefined} />
      )}

      {/* MODE 4: Izakaya Touchscreen Tablet */}
      {mode === 'izakaya' && (
        <IzakayaSimulator onCompleteMission={isCampaignMode ? completeMission : undefined} />
      )}

      {/* MODE 5: Transit & Drink Vending Kiosk */}
      {mode === 'kiosk' && (
        <TransitKioskSimulator onCompleteMission={isCampaignMode ? completeMission : undefined} />
      )}
    </div>
  );
}
