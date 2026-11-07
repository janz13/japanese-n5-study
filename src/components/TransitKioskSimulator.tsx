import { useState } from 'react';
import {
  STATION_FARES,
  VENDING_DRINKS,
  KIOSK_MISSIONS,
  type KioskMission,
} from '../data/terminalKiosks';
import { useStore } from '../lib/store';
import { speak } from '../lib/tts';
import {
  playKioskBeep,
  playSuicaPing,
  playCoinClink,
  playVendingDrop,
  playMiss,
  playFanfare,
} from '../lib/sfx';

export default function TransitKioskSimulator({ onCompleteMission }: { onCompleteMission?: () => void }) {
  const store = useStore();
  const {
    terminalDone,
    terminalMissionIndices,
    completeTerminalOrder,
    setTerminalMissionIdx,
    addCard,
    srs,
    sfxEnabled,
    ttsRate,
  } = store;

  const curMissionIdx = terminalMissionIndices?.kiosk ?? 0;
  const mission: KioskMission = KIOSK_MISSIONS[curMissionIdx] || KIOSK_MISSIONS[0];

  // Submachine type: defaults to matching mission subType
  const [activeMachine, setActiveMachine] = useState<'station' | 'vending'>(
    mission.subType === 'drink_vending' ? 'vending' : 'station'
  );

  // Station Machine State
  const [stationTab, setStationTab] = useState<'ticket' | 'charge'>('ticket');
  const [selectedFare, setSelectedFare] = useState<number | null>(null);
  const [passengerType, setPassengerType] = useState<'adult' | 'child'>('adult');
  const [selectedChargeAmount, setSelectedChargeAmount] = useState<number | null>(null);
  const [needReceipt, setNeedReceipt] = useState<boolean>(false);
  const [insertedCash, setInsertedCash] = useState<number>(0);

  // Vending Machine State
  const [vendingCart, setVendingCart] = useState<string[]>([]);
  const [vendingCash, setVendingCash] = useState<number>(0);
  const [dispensedItems, setDispensedItems] = useState<string[]>([]);

  // Feedback State
  const [feedback, setFeedback] = useState<{ success: boolean; message: string } | null>(null);

  const handleSelectMission = (idx: number) => {
    setTerminalMissionIdx('kiosk', idx);
    const m = KIOSK_MISSIONS[idx];
    setActiveMachine(m.subType === 'drink_vending' ? 'vending' : 'station');
    setStationTab(m.subType === 'station_ic' ? 'charge' : 'ticket');
    resetMachineState();
  };

  const resetMachineState = () => {
    setSelectedFare(null);
    setPassengerType('adult');
    setSelectedChargeAmount(null);
    setNeedReceipt(false);
    setInsertedCash(0);
    setVendingCart([]);
    setVendingCash(0);
    setDispensedItems([]);
    setFeedback(null);
  };

  // Station: Insert cash
  const handleInsertStationCash = (amount: number) => {
    if (sfxEnabled) playCoinClink();
    setInsertedCash((c) => c + amount);
  };

  // Station: Complete purchase / charge
  const handleStationCheckout = () => {
    if (sfxEnabled) playKioskBeep();
    const isTicket = stationTab === 'ticket';
    const cost = isTicket ? selectedFare || 0 : selectedChargeAmount || 0;
    const change = Math.max(0, insertedCash - cost);

    let passed = false;
    const errors: string[] = [];

    if (mission.subType === 'station_ticket') {
      const expTicket = mission.expectedTicket!;
      const expPayment = mission.expectedPayment;
      if (selectedFare !== expTicket.fareYen) errors.push(`Fare: chosen ¥${selectedFare}, expected ¥${expTicket.fareYen}`);
      if (passengerType !== expTicket.passengerType) errors.push(`Passenger: chosen ${passengerType}, expected ${expTicket.passengerType}`);
      if (needReceipt !== expTicket.needReceipt) errors.push(`Receipt: selected ${needReceipt}, expected ${expTicket.needReceipt}`);
      if (insertedCash !== expPayment.cashInserted) errors.push(`Cash: inserted ¥${insertedCash}, expected ¥${expPayment.cashInserted}`);
      passed = errors.length === 0;
    } else if (mission.subType === 'station_ic') {
      const expCharge = mission.expectedCharge!;
      const expPayment = mission.expectedPayment;
      if (selectedChargeAmount !== expCharge.chargeAmount) errors.push(`Charge: chosen ¥${selectedChargeAmount}, expected ¥${expCharge.chargeAmount}`);
      if (needReceipt !== expCharge.needReceipt) errors.push(`Receipt: selected ${needReceipt}, expected ${expCharge.needReceipt}`);
      if (insertedCash !== expPayment.cashInserted) errors.push(`Cash: inserted ¥${insertedCash}, expected ¥${expPayment.cashInserted}`);
      passed = errors.length === 0;
    }

    if (passed) {
      if (sfxEnabled) playFanfare();
      completeTerminalOrder('kiosk', mission.id);
      if (onCompleteMission) onCompleteMission();
      setFeedback({
        success: true,
        message: `取引完了！ Transaction complete. Change dispensed: ¥${change}. ${mission.machineAnnouncementKana}`,
      });
      speak(mission.machineAnnouncementKana, ttsRate);
    } else {
      if (sfxEnabled) playMiss();
      setFeedback({
        success: false,
        message: `Mismatched order: ${errors.join('; ')}. Check the scenario details!`,
      });
    }
  };

  // Vending: Tap drink
  const handleSelectDrink = (drinkId: string) => {
    const drink = VENDING_DRINKS.find((d) => d.id === drinkId);
    if (!drink) return;
    if (sfxEnabled) playKioskBeep();
    setVendingCart((prev) => [...prev, drinkId]);
  };

  // Vending: Pay with IC tap
  const handleVendingIcTap = () => {
    if (sfxEnabled) {
      playSuicaPing();
      setTimeout(playVendingDrop, 350);
    }

    const expectedDrinks = mission.expectedDrinks || [];
    const drinksMatch =
      vendingCart.length === expectedDrinks.length &&
      expectedDrinks.every((d) => vendingCart.includes(d));
    const paymentMatch = mission.expectedPayment.method === 'ic_card';

    if (drinksMatch && paymentMatch) {
      if (sfxEnabled) setTimeout(playFanfare, 600);
      completeTerminalOrder('kiosk', mission.id);
      if (onCompleteMission) onCompleteMission();
      setDispensedItems([...vendingCart]);
      setFeedback({
        success: true,
        message: `ICカード決済完了！ All drinks dispensed into the retrieval chute (取出口).`,
      });
      speak(mission.machineAnnouncementKana, ttsRate);
    } else {
      if (sfxEnabled) playMiss();
      setFeedback({
        success: false,
        message: `Selected drinks: [${vendingCart.join(', ')}], expected: [${expectedDrinks.join(', ')}] with IC tap payment.`,
      });
    }
  };

  // Vending: Insert Cash
  const handleInsertVendingCash = (amount: number) => {
    if (sfxEnabled) playCoinClink();
    setVendingCash((c) => c + amount);
  };

  // Vending: Coin return lever (返却レバー)
  const handleVendingCoinReturn = () => {
    if (sfxEnabled) {
      playCoinClink();
      if (vendingCart.length > 0) {
        setTimeout(playVendingDrop, 300);
      }
    }

    const totalCost = vendingCart.reduce((sum, id) => {
      const d = VENDING_DRINKS.find((item) => item.id === id);
      return sum + (d?.price || 0);
    }, 0);

    const change = Math.max(0, vendingCash - totalCost);
    const expectedDrinks = mission.expectedDrinks || [];
    const drinksMatch =
      vendingCart.length === expectedDrinks.length &&
      expectedDrinks.every((d) => vendingCart.includes(d));
    const cashMatch =
      mission.expectedPayment.method === 'cash' &&
      vendingCash === mission.expectedPayment.cashInserted &&
      change === mission.expectedPayment.expectedChange;

    if (drinksMatch && cashMatch) {
      if (sfxEnabled) setTimeout(playFanfare, 600);
      completeTerminalOrder('kiosk', mission.id);
      if (onCompleteMission) onCompleteMission();
      setDispensedItems([...vendingCart]);
      setFeedback({
        success: true,
        message: `購入完了！ Drinks and change (¥${change}) dispensed successfully.`,
      });
      speak(mission.machineAnnouncementKana, ttsRate);
    } else {
      if (sfxEnabled) playMiss();
      setFeedback({
        success: false,
        message: `Cash transaction mismatch. Inserted: ¥${vendingCash}, change: ¥${change}. Expected: ¥${mission.expectedPayment.cashInserted} with ¥${mission.expectedPayment.expectedChange} change.`,
      });
    }
  };

  const KIOSK_VOCAB = [
    { id: 'v:kiosk_kippu', front: '乗車券', reading: 'じょうしゃけん', back: 'standard train ride ticket' },
    { id: 'v:kiosk_charge', front: 'チャージ', reading: 'チャージ', back: 'recharging / loading funds onto IC card' },
    { id: 'v:kiosk_ryoshusho', front: '領収書', reading: 'りょうしゅうしょ', back: 'formal tax receipt' },
    { id: 'v:kiosk_tsumetai', front: 'つめた〜い', reading: 'つめたい', back: 'cold beverage (blue label)' },
    { id: 'v:kiosk_atatakai', front: 'あたたか〜い', reading: 'あたたかい', back: 'hot canned beverage (red label)' },
    { id: 'v:kiosk_toridashiguchi', front: '取出口', reading: 'とりだしぐち', back: 'vending retrieval slot / chute' },
  ];

  return (
    <div className="kiosk-simulator" style={{ margin: '1rem 0' }}>
      {/* Mission Tabs */}
      <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap', marginBottom: '1rem' }}>
        {KIOSK_MISSIONS.map((m, idx) => {
          const isDone = !!terminalDone[m.id];
          const isSelected = idx === curMissionIdx;
          return (
            <button
              key={m.id}
              type="button"
              className={isSelected ? 'chip on' : isDone ? 'chip ok' : 'chip'}
              onClick={() => handleSelectMission(idx)}
              style={{ fontWeight: isSelected ? 700 : 500 }}
            >
              {isDone ? '✓ ' : ''}{m.titleJp} ({idx + 1}/4)
            </button>
          );
        })}
      </div>

      {/* Scenario Brief */}
      <div
        className="gp"
        style={{
          background: 'var(--surface2)',
          padding: '1rem',
          borderRadius: '10px',
          borderLeft: '4px solid #10b981',
          marginBottom: '1rem',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h3 style={{ margin: 0, fontSize: '1.1rem' }}>
            🚆 {mission.title} <span className="muted">({mission.titleJp})</span>
          </h3>
          {terminalDone[mission.id] && (
            <span className="tag" style={{ background: '#22c55e', color: '#000', fontWeight: 700 }}>
              ✓ CLEARED
            </span>
          )}
        </div>
        <p style={{ margin: '0.4rem 0 0.2rem', fontSize: '0.92rem' }}>
          <b>Scenario:</b> {mission.scenarioEn}
        </p>
        <p className="muted small" style={{ margin: 0 }}>
          💡 <b>Tip:</b> {mission.explanation}
        </p>
      </div>

      {/* Submachine Toggle (Station Kiosk vs Drink Vending Machine) */}
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
        <button
          type="button"
          className={activeMachine === 'station' ? 'chip on' : 'chip'}
          onClick={() => setActiveMachine('station')}
        >
          🚆 駅の多機能券売機 (Station Ticket &amp; Suica Kiosk)
        </button>
        <button
          type="button"
          className={activeMachine === 'vending' ? 'chip on' : 'chip'}
          onClick={() => setActiveMachine('vending')}
        >
          🥤 街角の自動販売機 (Drink Vending Machine)
        </button>
      </div>

      {/* =================================================================== */}
      {/* 1. STATION TICKET & SUICA KIOSK */}
      {/* =================================================================== */}
      {activeMachine === 'station' && (
        <div
          style={{
            background: '#1e293b',
            border: '4px solid #0284c7',
            borderRadius: '16px',
            padding: '1.25rem',
            boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
            color: '#f8fafc',
          }}
        >
          {/* Top Banner */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              borderBottom: '2px solid #0284c7',
              paddingBottom: '0.65rem',
              marginBottom: '1rem',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span style={{ fontSize: '1.4rem' }}>🚆</span>
              <b style={{ fontSize: '1.1rem', letterSpacing: '0.05em' }}>JR / 地下鉄 多機能券売機</b>
              <span className="tag" style={{ background: '#0284c7', color: '#fff', fontSize: '0.72rem' }}>Suica対応</span>
            </div>
            <div style={{ display: 'flex', gap: '0.4rem' }}>
              <button
                type="button"
                className={stationTab === 'ticket' ? 'chip on' : 'chip'}
                onClick={() => {
                  if (sfxEnabled) playKioskBeep();
                  setStationTab('ticket');
                }}
              >
                きっぷ購入 (Tickets)
              </button>
              <button
                type="button"
                className={stationTab === 'charge' ? 'chip on' : 'chip'}
                onClick={() => {
                  if (sfxEnabled) playKioskBeep();
                  setStationTab('charge');
                }}
              >
                ICチャージ (Charge)
              </button>
            </div>
          </div>

          {/* Ticket Purchase Mode */}
          {stationTab === 'ticket' && (
            <div>
              {/* Passenger Type Selector */}
              <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.85rem' }}>
                <button
                  type="button"
                  className={passengerType === 'adult' ? 'chip on' : 'chip'}
                  style={{ padding: '0.5rem 1rem', fontSize: '0.9rem', fontWeight: 600 }}
                  onClick={() => setPassengerType('adult')}
                >
                  👤 おとな 1枚 (Adult)
                </button>
                <button
                  type="button"
                  className={passengerType === 'child' ? 'chip on' : 'chip'}
                  style={{ padding: '0.5rem 1rem', fontSize: '0.9rem', fontWeight: 600 }}
                  onClick={() => setPassengerType('child')}
                >
                  🧒 こども 1枚 (Child - Half Fare)
                </button>
              </div>

              {/* Fare Grid */}
              <h4 style={{ margin: '0 0 0.5rem', fontSize: '0.92rem' }}>運賃区間を選択してください (Select Fare Zone):</h4>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '0.6rem', marginBottom: '1rem' }}>
                {STATION_FARES.map((fare) => {
                  const effectiveFare = passengerType === 'child' ? Math.floor(fare.fareYen / 2) : fare.fareYen;
                  const isSelected = selectedFare === effectiveFare;
                  return (
                    <button
                      key={fare.id}
                      type="button"
                      className={isSelected ? 'chip on' : 'chip'}
                      style={{
                        padding: '0.75rem 0.5rem',
                        textAlign: 'center',
                        background: isSelected ? 'var(--accent)' : '#0f172a',
                        color: isSelected ? '#000' : '#fff',
                        borderColor: isSelected ? 'var(--accent)' : '#334155',
                      }}
                      onClick={() => {
                        if (sfxEnabled) playKioskBeep();
                        setSelectedFare(effectiveFare);
                      }}
                    >
                      <div style={{ fontSize: '1.25rem', fontWeight: 700 }}>¥{effectiveFare}</div>
                      <div className="small" style={{ opacity: 0.85 }}>{fare.destinationExample}</div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* IC Card Recharge Mode */}
          {stationTab === 'charge' && (
            <div>
              <h4 style={{ margin: '0 0 0.5rem', fontSize: '0.92rem' }}>チャージ金額を選択してください (Select Recharge Amount):</h4>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(110px, 1fr))', gap: '0.6rem', marginBottom: '1rem' }}>
                {[1000, 2000, 3000, 5000, 10000].map((amt) => {
                  const isSelected = selectedChargeAmount === amt;
                  return (
                    <button
                      key={amt}
                      type="button"
                      className={isSelected ? 'chip on' : 'chip'}
                      style={{
                        padding: '0.75rem 0.5rem',
                        textAlign: 'center',
                        background: isSelected ? 'var(--accent)' : '#0f172a',
                        color: isSelected ? '#000' : '#fff',
                        borderColor: isSelected ? 'var(--accent)' : '#334155',
                      }}
                      onClick={() => {
                        if (sfxEnabled) playKioskBeep();
                        setSelectedChargeAmount(amt);
                      }}
                    >
                      <div style={{ fontSize: '1.25rem', fontWeight: 700 }}>¥{amt.toLocaleString()}</div>
                      <div className="small" style={{ opacity: 0.85 }}>チャージ</div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Receipt Toggle & Payment Panel */}
          <div
            style={{
              background: '#0f172a',
              borderRadius: '10px',
              padding: '0.85rem',
              border: '1px solid #334155',
              marginTop: '0.8rem',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.8rem', flexWrap: 'wrap', gap: '0.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span>領収書の発行:</span>
                <button
                  type="button"
                  className={needReceipt ? 'chip on' : 'chip'}
                  style={{ padding: '0.2rem 0.6rem', fontSize: '0.82rem' }}
                  onClick={() => setNeedReceipt(!needReceipt)}
                >
                  {needReceipt ? '✓ 領収書あり (Receipt Requested)' : '領収書なし (No Receipt)'}
                </button>
              </div>

              <div>
                <span className="muted">投入金額: </span>
                <b style={{ color: '#38bdf8', fontSize: '1.1rem' }}>¥{insertedCash}</b>
              </div>
            </div>

            {/* Cash Slot Simulation */}
            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', alignItems: 'center' }}>
              <span className="muted small">紙幣・硬貨投入口:</span>
              <button
                type="button"
                className="chip"
                style={{ background: '#1e293b' }}
                onClick={() => handleInsertStationCash(100)}
              >
                +¥100 硬貨
              </button>
              <button
                type="button"
                className="chip"
                style={{ background: '#1e293b' }}
                onClick={() => handleInsertStationCash(500)}
              >
                +¥500 硬貨
              </button>
              <button
                type="button"
                className="chip"
                style={{ background: '#1e293b' }}
                onClick={() => handleInsertStationCash(1000)}
              >
                +¥1,000 札
              </button>
              <button
                type="button"
                className="chip"
                style={{ background: '#1e293b' }}
                onClick={() => handleInsertStationCash(5000)}
              >
                +¥5,000 札
              </button>
              <button
                type="button"
                className="chip"
                style={{ background: '#1e293b' }}
                onClick={() => setInsertedCash(0)}
              >
                取消 (Cancel Cash)
              </button>
            </div>

            {/* Final Action Button */}
            <div style={{ marginTop: '0.85rem' }}>
              <button
                type="button"
                className="chip on"
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  fontSize: '1rem',
                  fontWeight: 700,
                  background: 'var(--accent)',
                  color: '#000',
                }}
                disabled={(stationTab === 'ticket' ? !selectedFare : !selectedChargeAmount) || insertedCash === 0}
                onClick={handleStationCheckout}
              >
                {stationTab === 'ticket' ? '🎟️ きっぷを発券する (Purchase Ticket)' : '💳 チャージを実行する (Execute Charge)'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =================================================================== */}
      {/* 2. DRINK VENDING MACHINE SIMULATION */}
      {/* =================================================================== */}
      {activeMachine === 'vending' && (
        <div
          style={{
            background: '#1e293b',
            border: '4px solid #e11d48',
            borderRadius: '16px',
            padding: '1.25rem',
            boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
            color: '#f8fafc',
          }}
        >
          {/* Header */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              borderBottom: '2px solid #e11d48',
              paddingBottom: '0.65rem',
              marginBottom: '1rem',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span style={{ fontSize: '1.4rem' }}>🥤</span>
              <b style={{ fontSize: '1.1rem' }}>街角の飲料自動販売機</b>
              <span className="tag" style={{ background: '#e11d48', color: '#fff', fontSize: '0.72rem' }}>Heat-Pump式</span>
            </div>
            <div>
              <span className="muted">投入金額: </span>
              <b style={{ color: '#38bdf8', fontSize: '1.1rem' }}>¥{vendingCash}</b>
            </div>
          </div>

          {/* Shelves Display */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '1rem' }}>
            {/* Top Shelf: COLD (つめた〜い - Blue) */}
            <div
              style={{
                background: '#0f172a',
                border: '2px solid #0284c7',
                borderRadius: '10px',
                padding: '0.75rem',
              }}
            >
              <div style={{ color: '#38bdf8', fontWeight: 700, fontSize: '0.85rem', marginBottom: '0.5rem' }}>
                ❄️ つめた〜い (Cold Refreshments)
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))', gap: '0.6rem' }}>
                {VENDING_DRINKS.filter((d) => d.temp === 'cold').map((drink) => (
                  <button
                    key={drink.id}
                    type="button"
                    className="chip"
                    style={{
                      background: '#1e293b',
                      borderColor: '#0284c7',
                      padding: '0.6rem 0.4rem',
                      textAlign: 'center',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                    }}
                    onClick={() => handleSelectDrink(drink.id)}
                  >
                    <span style={{ fontSize: '1.6rem' }}>{drink.icon}</span>
                    <b style={{ fontSize: '0.8rem', marginTop: '0.2rem', lineHeight: 1.2 }}>{drink.nameJp}</b>
                    <span className="muted small" style={{ fontSize: '0.72rem' }}>¥{drink.price}</span>
                    <span
                      style={{
                        background: '#0284c7',
                        color: '#fff',
                        borderRadius: '4px',
                        padding: '0.1rem 0.4rem',
                        fontSize: '0.65rem',
                        marginTop: '0.3rem',
                        fontWeight: 700,
                      }}
                    >
                      つめた〜い
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Bottom Shelf: HOT (あたたか〜い - Red) */}
            <div
              style={{
                background: '#0f172a',
                border: '2px solid #e11d48',
                borderRadius: '10px',
                padding: '0.75rem',
              }}
            >
              <div style={{ color: '#f43f5e', fontWeight: 700, fontSize: '0.85rem', marginBottom: '0.5rem' }}>
                🔥 あたたか〜い (Warm Drinks &amp; Soups)
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))', gap: '0.6rem' }}>
                {VENDING_DRINKS.filter((d) => d.temp === 'hot').map((drink) => (
                  <button
                    key={drink.id}
                    type="button"
                    className="chip"
                    style={{
                      background: '#1e293b',
                      borderColor: '#e11d48',
                      padding: '0.6rem 0.4rem',
                      textAlign: 'center',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                    }}
                    onClick={() => handleSelectDrink(drink.id)}
                  >
                    <span style={{ fontSize: '1.6rem' }}>{drink.icon}</span>
                    <b style={{ fontSize: '0.8rem', marginTop: '0.2rem', lineHeight: 1.2 }}>{drink.nameJp}</b>
                    <span className="muted small" style={{ fontSize: '0.72rem' }}>¥{drink.price}</span>
                    <span
                      style={{
                        background: '#e11d48',
                        color: '#fff',
                        borderRadius: '4px',
                        padding: '0.1rem 0.4rem',
                        fontSize: '0.65rem',
                        marginTop: '0.3rem',
                        fontWeight: 700,
                      }}
                    >
                      あたたか〜い
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Vending Controls: Selected tray & payment tenders */}
          <div
            style={{
              background: '#0f172a',
              borderRadius: '10px',
              padding: '0.85rem',
              border: '1px solid #334155',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.6rem', flexWrap: 'wrap', gap: '0.4rem' }}>
              <div>
                <b style={{ fontSize: '0.9rem' }}>選択中の飲料 ({vendingCart.length} 本): </b>
                <span>
                  {vendingCart.map((id) => VENDING_DRINKS.find((d) => d.id === id)?.nameJp).join(', ') || 'なし'}
                </span>
              </div>
              {vendingCart.length > 0 && (
                <button
                  type="button"
                  className="chip"
                  style={{ padding: '0.1rem 0.4rem', fontSize: '0.72rem' }}
                  onClick={() => setVendingCart([])}
                >
                  取消
                </button>
              )}
            </div>

            {/* Payment Options: Cash Insertion or IC Tap */}
            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', alignItems: 'center' }}>
              <span className="muted small">硬貨・紙幣投入:</span>
              <button
                type="button"
                className="chip"
                style={{ background: '#1e293b' }}
                onClick={() => handleInsertVendingCash(100)}
              >
                +¥100 硬貨
              </button>
              <button
                type="button"
                className="chip"
                style={{ background: '#1e293b' }}
                onClick={() => handleInsertVendingCash(500)}
              >
                +¥500 硬貨
              </button>
              <button
                type="button"
                className="chip"
                style={{ background: '#1e293b' }}
                onClick={() => handleInsertVendingCash(1000)}
              >
                +¥1,000 札
              </button>

              <button
                type="button"
                className="chip on"
                style={{ background: '#ca8a04', color: '#fff', fontWeight: 600 }}
                onClick={handleVendingCoinReturn}
              >
                🪙 返却レバー (Return Lever / Dispense)
              </button>

              <button
                type="button"
                className="chip on"
                style={{ background: '#0284c7', color: '#fff', fontWeight: 600 }}
                onClick={handleVendingIcTap}
              >
                💳 交通系ICでタッチ決済 (Suica Tap)
              </button>
            </div>
          </div>

          {/* Dispense Chute (取出口) */}
          {dispensedItems.length > 0 && (
            <div
              style={{
                marginTop: '1rem',
                background: '#090d16',
                border: '2px dashed #475569',
                borderRadius: '8px',
                padding: '0.75rem',
                textAlign: 'center',
              }}
            >
              <b style={{ color: '#4ade80' }}>ガコン！ 取出口（とりだしぐち）に 落ちました：</b>
              <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center', marginTop: '0.4rem' }}>
                {dispensedItems.map((id, i) => {
                  const d = VENDING_DRINKS.find((item) => item.id === id);
                  return (
                    <span key={i} className="chip ok">
                      {d?.icon} {d?.nameJp}
                    </span>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Shared Feedback Card */}
      {feedback && (
        <div
          style={{
            marginTop: '1rem',
            padding: '0.85rem',
            borderRadius: '8px',
            background: feedback.success ? 'rgba(34, 197, 94, 0.15)' : 'rgba(239, 68, 68, 0.15)',
            border: `1px solid ${feedback.success ? '#22c55e' : '#ef4444'}`,
          }}
        >
          <div style={{ fontWeight: 700, color: feedback.success ? '#4ade80' : '#f87171' }}>
            {feedback.success ? '✓ ミッション達成 (Mission Cleared)' : '⚠️ 注文・操作の不一致 (Try Again)'}
          </div>
          <p style={{ margin: '0.3rem 0', fontSize: '0.88rem' }}>{feedback.message}</p>
          {feedback.success && (
            <p className="muted small" style={{ margin: 0 }}>
              <b>Cultural Insight:</b> {mission.culturalNote}
            </p>
          )}
        </div>
      )}

      {/* Vocabulary Flashcard Quick-Save Drawer */}
      <div style={{ marginTop: '1.5rem', padding: '0.85rem', background: 'var(--surface2)', borderRadius: '10px' }}>
        <h4 style={{ margin: '0 0 0.5rem', fontSize: '0.92rem' }}>
          📌 券売機・自販機で役立つ日本語単語 (Station &amp; Vending Vocabulary)
        </h4>
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          {KIOSK_VOCAB.map((v) => (
            <button
              key={v.id}
              type="button"
              className={srs[v.id] ? 'chip' : 'chip on'}
              disabled={!!srs[v.id]}
              onClick={() => addCard({ id: v.id, kind: 'word', front: v.front, reading: v.reading, back: v.back })}
              style={{ fontSize: '0.82rem' }}
            >
              {srs[v.id] ? `✓ ${v.front}` : `+ ${v.front} (${v.reading})`}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
