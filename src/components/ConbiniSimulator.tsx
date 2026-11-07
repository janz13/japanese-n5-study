import { useState } from 'react';
import {
  CONBINI_MISSIONS,
  type ConbiniPaymentMethod,
  type ConbiniMission,
} from '../data/terminalKiosks';
import { useStore } from '../lib/store';
import { speak } from '../lib/tts';
import {
  playKioskBeep,
  playSuicaPing,
  playBarcodeScanner,
  playCoinClink,
  playDing,
  playMiss,
  playFanfare,
} from '../lib/sfx';

export default function ConbiniSimulator({ onCompleteMission }: { onCompleteMission?: () => void }) {
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

  const curMissionIdx = terminalMissionIndices?.conbini ?? 0;
  const mission: ConbiniMission = CONBINI_MISSIONS[curMissionIdx] || CONBINI_MISSIONS[0];

  type Step = 'points' | 'heating' | 'bag' | 'age' | 'payment' | 'result';
  const [step, setStep] = useState<Step>('points');
  const [pointCard, setPointCard] = useState<'present' | 'none' | null>(null);
  const [heating, setHeating] = useState<'yes' | 'no' | null>(null);
  const [bag, setBag] = useState<'none' | 'small' | 'large' | null>(null);
  const [ageConfirmed, setAgeConfirmed] = useState<boolean>(false);
  const [payment, setPayment] = useState<ConbiniPaymentMethod | null>(null);
  const [resultFeedback, setResultFeedback] = useState<{ success: boolean; message: string } | null>(null);

  const basketSubtotal = mission.basket.reduce((sum, item) => sum + item.price, 0);
  const bagCost = bag === 'small' ? 3 : bag === 'large' ? 5 : 0;
  const grandTotal = basketSubtotal + bagCost;

  const requiresHeating = mission.basket.some((item) => item.canHeat);
  const requiresAge = mission.basket.some((item) => item.requiresAgeCheck);

  const resetFlow = () => {
    setStep('points');
    setPointCard(null);
    setHeating(null);
    setBag(null);
    setAgeConfirmed(false);
    setPayment(null);
    setResultFeedback(null);
  };

  const handleSelectMission = (idx: number) => {
    setTerminalMissionIdx('conbini', idx);
    resetFlow();
  };

  const handlePointCard = (choice: 'present' | 'none') => {
    if (sfxEnabled) playKioskBeep();
    setPointCard(choice);
    if (requiresHeating) {
      setStep('heating');
      speak(mission.clerkDialogue.heatPrompt || 'お弁当温めますか？', ttsRate);
    } else {
      setStep('bag');
      speak(mission.clerkDialogue.bagPrompt, ttsRate);
    }
  };

  const handleHeating = (choice: 'yes' | 'no') => {
    if (sfxEnabled) playKioskBeep();
    setHeating(choice);
    setStep('bag');
    speak(mission.clerkDialogue.bagPrompt, ttsRate);
  };

  const handleBag = (choice: 'none' | 'small' | 'large') => {
    if (sfxEnabled) playKioskBeep();
    setBag(choice);
    if (requiresAge) {
      setStep('age');
      speak(mission.clerkDialogue.agePrompt || '画面の年齢確認ボタンを押してください。', ttsRate);
    } else {
      setStep('payment');
      speak(mission.clerkDialogue.paymentPrompt, ttsRate);
    }
  };

  const handleAgeConfirm = (confirmed: boolean) => {
    if (sfxEnabled) playKioskBeep();
    setAgeConfirmed(confirmed);
    setStep('payment');
    speak(mission.clerkDialogue.paymentPrompt, ttsRate);
  };

  const handlePayment = (method: ConbiniPaymentMethod) => {
    setPayment(method);
    if (sfxEnabled) {
      if (method === 'suica') playSuicaPing();
      else if (method === 'qr') playBarcodeScanner();
      else if (method === 'cash') playCoinClink();
      else playDing();
    }

    // Evaluate against mission criteria
    const pointOk = pointCard === mission.expectedPointCard;
    const heatOk = !requiresHeating || heating === mission.expectedHeating;
    const bagOk = bag === mission.expectedBag;
    const ageOk = !requiresAge || ageConfirmed === mission.expectedAgeConfirmed;
    const payOk = method === mission.expectedPayment;

    if (pointOk && heatOk && bagOk && ageOk && payOk) {
      if (sfxEnabled) playFanfare();
      completeTerminalOrder('conbini', mission.id);
      if (onCompleteMission) onCompleteMission();
      setResultFeedback({
        success: true,
        message: '完璧！ Perfect checkout! You correctly completed all steps and clerk dialogues.',
      });
      speak(mission.clerkDialogue.farewell, ttsRate);
    } else {
      if (sfxEnabled) playMiss();
      const reasons: string[] = [];
      if (!pointOk) reasons.push(`Point Card: selected "${pointCard}", expected "${mission.expectedPointCard}"`);
      if (!heatOk) reasons.push(`Heating: selected "${heating}", expected "${mission.expectedHeating}"`);
      if (!bagOk) reasons.push(`Bag: selected "${bag}", expected "${mission.expectedBag}"`);
      if (!ageOk) reasons.push(`Age Check: expected 20+ confirmation`);
      if (!payOk) reasons.push(`Payment: used ${method}, expected ${mission.expectedPayment}`);
      setResultFeedback({
        success: false,
        message: `Order mismatch: ${reasons.join(' · ')}. Read the mission prompt carefully and try again!`,
      });
    }
    setStep('result');
  };

  const speakClerkGreeting = () => {
    speak(mission.clerkDialogue.greeting, ttsRate);
  };

  const CONBINI_VOCAB = [
    { id: 'v:conbini_fukuro', front: 'レジ袋', reading: 'レジぶくろ', back: 'plastic shopping bag (charged ¥3-5)' },
    { id: 'v:conbini_atatameme', front: '温め', reading: 'あたため', back: 'microwaving / heating bento' },
    { id: 'v:conbini_nenrei', front: '年齢確認', reading: 'ねんれいかくにん', back: 'age verification (20+ for alcohol/tobacco)' },
    { id: 'v:conbini_suica', front: '交通系IC', reading: 'こうつうけいアイシー', back: 'transit IC card payment (Suica/PASMO)' },
    { id: 'v:conbini_barcode', front: 'バーコード決済', reading: 'バーコードけっさい', back: 'smartphone QR/barcode payment' },
  ];

  return (
    <div className="terminal-container" style={{ margin: '1rem 0' }}>
      {/* Mission Selector Tabs */}
      <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap', marginBottom: '1rem' }}>
        {CONBINI_MISSIONS.map((m, idx) => {
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

      {/* Mission Scenario Brief */}
      <div
        className="gp"
        style={{
          background: 'var(--surface2)',
          padding: '1rem',
          borderRadius: '10px',
          borderLeft: '4px solid #38bdf8',
          marginBottom: '1rem',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h3 style={{ margin: 0, fontSize: '1.1rem' }}>
            🏪 {mission.title} <span className="muted">({mission.titleJp})</span>
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

      {/* Dual Panel POS Simulator */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: '1rem',
          alignItems: 'start',
        }}
      >
        {/* Left Panel: Register Counter & Clerk Basket */}
        <div
          style={{
            background: 'var(--surface)',
            border: '1px solid var(--border)',
            borderRadius: '12px',
            padding: '1rem',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.85rem' }}>
            <div style={{ fontSize: '2.4rem' }}>🏪</div>
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <b style={{ fontSize: '1rem' }}>コンビニ店員 (Clerk)</b>
                <button
                  type="button"
                  className="chip"
                  style={{ padding: '0.1rem 0.45rem', fontSize: '0.75rem' }}
                  onClick={speakClerkGreeting}
                  title="Listen to clerk greeting"
                >
                  🔊
                </button>
              </div>
              <div
                style={{
                  background: 'var(--surface2)',
                  borderRadius: '8px',
                  padding: '0.45rem 0.65rem',
                  fontSize: '0.88rem',
                  marginTop: '0.3rem',
                  borderLeft: '3px solid var(--accent)',
                }}
              >
                {step === 'points' && `「${mission.clerkDialogue.greeting} ${mission.clerkDialogue.pointCardPrompt}」`}
                {step === 'heating' && `「${mission.clerkDialogue.heatPrompt || 'お弁当温めますか？'}」`}
                {step === 'bag' && `「${mission.clerkDialogue.bagPrompt}」`}
                {step === 'age' && `「${mission.clerkDialogue.agePrompt || '画面の年齢確認ボタンを押してください。'}」`}
                {step === 'payment' && `「${mission.clerkDialogue.paymentPrompt}」`}
                {step === 'result' && (resultFeedback?.success ? `「${mission.clerkDialogue.farewell}」` : '「……恐れ入ります、もう一度お願いいたします。」')}
              </div>
            </div>
          </div>

          <h4 style={{ margin: '0.8rem 0 0.5rem', fontSize: '0.95rem' }}>🛒 カゴの中身 (Customer Basket)</h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
            {mission.basket.map((item) => (
              <div
                key={item.id}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  background: 'var(--surface2)',
                  padding: '0.5rem 0.75rem',
                  borderRadius: '6px',
                  fontSize: '0.88rem',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span>{item.icon}</span>
                  <div>
                    <div style={{ fontWeight: 600 }}>{item.nameJp}</div>
                    <div className="muted small">{item.nameEn}</div>
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <b>¥{item.price}</b>
                  {item.canHeat && <span className="tag" style={{ marginLeft: '0.3rem', fontSize: '0.68rem' }}>要温め</span>}
                  {item.requiresAgeCheck && <span className="tag" style={{ marginLeft: '0.3rem', fontSize: '0.68rem', background: '#f87171', color: '#000' }}>年齢確認</span>}
                </div>
              </div>
            ))}
          </div>

          {/* Bill Summary */}
          <div
            style={{
              marginTop: '0.85rem',
              paddingTop: '0.65rem',
              borderTop: '1px solid var(--border)',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.25rem',
              fontSize: '0.88rem',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span className="muted">商品小計 (Subtotal)</span>
              <span>¥{basketSubtotal}</span>
            </div>
            {bag && bag !== 'none' && (
              <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--accent)' }}>
                <span>レジ袋（{bag === 'small' ? '小 ¥3' : '大 ¥5'}）</span>
                <span>+¥{bagCost}</span>
              </div>
            )}
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1.05rem', fontWeight: 700, marginTop: '0.2rem' }}>
              <span>合計金額 (Grand Total)</span>
              <span style={{ color: '#38bdf8' }}>¥{grandTotal}</span>
            </div>
          </div>
        </div>

        {/* Right Panel: Interactive POS Touchscreen */}
        <div
          style={{
            background: '#0f172a',
            border: '2px solid #334155',
            borderRadius: '14px',
            padding: '1.1rem',
            color: '#f8fafc',
            boxShadow: '0 8px 24px rgba(0,0,0,0.3)',
          }}
        >
          {/* POS Screen Header */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              borderBottom: '1px solid #334155',
              paddingBottom: '0.6rem',
              marginBottom: '1rem',
            }}
          >
            <span style={{ fontSize: '0.82rem', letterSpacing: '0.05em', color: '#38bdf8', fontWeight: 700 }}>
              POS TERMINAL · セルフレジ画面
            </span>
            <span style={{ fontSize: '0.78rem', color: '#94a3b8' }}>
              Step {step === 'points' ? '1' : step === 'heating' ? '2' : step === 'bag' ? '3' : step === 'age' ? '4' : step === 'payment' ? '5' : 'Done'} / 5
            </span>
          </div>

          {/* STEP 1: Point Card */}
          {step === 'points' && (
            <div>
              <h4 style={{ margin: '0 0 0.4rem', color: '#f1f5f9' }}>
                ポイントカードをお持ちですか？
              </h4>
              <p style={{ fontSize: '0.85rem', color: '#94a3b8', margin: '0 0 1rem' }}>
                Do you have a loyalty point card? (Ponta, d-Point, V-Point)
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                <button
                  type="button"
                  className="chip"
                  style={{ padding: '0.75rem', fontSize: '0.95rem', fontWeight: 600, background: '#1e293b', borderColor: '#475569' }}
                  onClick={() => handlePointCard('present')}
                >
                  💳 カードを提示する (Present Card)
                </button>
                <button
                  type="button"
                  className="chip"
                  style={{ padding: '0.75rem', fontSize: '0.95rem', fontWeight: 600, background: '#1e293b', borderColor: '#475569' }}
                  onClick={() => handlePointCard('none')}
                >
                  ✖ 持っていない (No Point Card)
                </button>
              </div>
            </div>
          )}

          {/* STEP 2: Heating */}
          {step === 'heating' && (
            <div>
              <h4 style={{ margin: '0 0 0.4rem', color: '#f1f5f9' }}>
                お弁当・お惣菜を温めますか？
              </h4>
              <p style={{ fontSize: '0.85rem', color: '#94a3b8', margin: '0 0 1rem' }}>
                Would you like your bento or hot snack heated in the microwave?
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                <button
                  type="button"
                  className="chip on"
                  style={{ padding: '0.75rem', fontSize: '0.95rem', fontWeight: 600 }}
                  onClick={() => handleHeating('yes')}
                >
                  🔥 温めてください (Yes, Please Heat It)
                </button>
                <button
                  type="button"
                  className="chip"
                  style={{ padding: '0.75rem', fontSize: '0.95rem', fontWeight: 600, background: '#1e293b', borderColor: '#475569' }}
                  onClick={() => handleHeating('no')}
                >
                  ❄️ そのままで大丈夫です (Fine as is / No heating)
                </button>
              </div>
            </div>
          )}

          {/* STEP 3: Bag */}
          {step === 'bag' && (
            <div>
              <h4 style={{ margin: '0 0 0.4rem', color: '#f1f5f9' }}>
                レジ袋はご利用になりますか？
              </h4>
              <p style={{ fontSize: '0.85rem', color: '#94a3b8', margin: '0 0 1rem' }}>
                Plastic shopping bag choice (Environment Fee required by law):
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                <button
                  type="button"
                  className="chip"
                  style={{ padding: '0.75rem', fontSize: '0.95rem', fontWeight: 600, background: '#1e293b', borderColor: '#475569' }}
                  onClick={() => handleBag('none')}
                >
                  🚫 袋は不要です (No Bag Needed · ¥0)
                </button>
                <button
                  type="button"
                  className="chip"
                  style={{ padding: '0.75rem', fontSize: '0.95rem', fontWeight: 600, background: '#1e293b', borderColor: '#475569' }}
                  onClick={() => handleBag('small')}
                >
                  🛍️ 小袋を希望 (Small Bag · ¥3)
                </button>
                <button
                  type="button"
                  className="chip"
                  style={{ padding: '0.75rem', fontSize: '0.95rem', fontWeight: 600, background: '#1e293b', borderColor: '#475569' }}
                  onClick={() => handleBag('large')}
                >
                  🛍️ 大袋を希望 (Large Bag · ¥5)
                </button>
              </div>
            </div>
          )}

          {/* STEP 4: Age Check Confirmation */}
          {step === 'age' && (
            <div
              style={{
                background: 'rgba(239, 68, 68, 0.15)',
                border: '2px solid #ef4444',
                borderRadius: '10px',
                padding: '1rem',
                textAlign: 'center',
              }}
            >
              <div style={{ fontSize: '1.8rem', marginBottom: '0.4rem' }}>⚠️</div>
              <h3 style={{ margin: '0 0 0.3rem', color: '#fca5a5', fontSize: '1.15rem' }}>
                あなたは20歳以上ですか？
              </h3>
              <p style={{ fontSize: '0.84rem', color: '#cbd5e1', margin: '0 0 1rem' }}>
                Age Verification Law: Alcohol & tobacco require 20+ confirmation by the customer.
              </p>
              <div style={{ display: 'flex', gap: '0.6rem', justifyContent: 'center' }}>
                <button
                  type="button"
                  className="chip ok"
                  style={{ padding: '0.7rem 1.4rem', fontSize: '1rem', fontWeight: 700 }}
                  onClick={() => handleAgeConfirm(true)}
                >
                  はい（20歳以上）
                </button>
                <button
                  type="button"
                  className="chip bad"
                  style={{ padding: '0.7rem 1.4rem', fontSize: '1rem', fontWeight: 700 }}
                  onClick={() => handleAgeConfirm(false)}
                >
                  いいえ（20歳未満）
                </button>
              </div>
            </div>
          )}

          {/* STEP 5: Payment Method */}
          {step === 'payment' && (
            <div>
              <h4 style={{ margin: '0 0 0.4rem', color: '#f1f5f9' }}>
                お支払い方法を選択してください
              </h4>
              <p style={{ fontSize: '0.85rem', color: '#94a3b8', margin: '0 0 1rem' }}>
                Select payment terminal tender (Total: <b>¥{grandTotal}</b>):
              </p>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.6rem' }}>
                <button
                  type="button"
                  className="chip"
                  style={{ padding: '0.85rem 0.5rem', background: '#1e293b', borderColor: '#475569', textAlign: 'center' }}
                  onClick={() => handlePayment('suica')}
                >
                  <div style={{ fontSize: '1.4rem' }}>💳</div>
                  <b style={{ fontSize: '0.9rem' }}>交通系IC</b>
                  <div className="muted small">Suica / PASMO</div>
                </button>

                <button
                  type="button"
                  className="chip"
                  style={{ padding: '0.85rem 0.5rem', background: '#1e293b', borderColor: '#475569', textAlign: 'center' }}
                  onClick={() => handlePayment('cash')}
                >
                  <div style={{ fontSize: '1.4rem' }}>💴</div>
                  <b style={{ fontSize: '0.9rem' }}>現金</b>
                  <div className="muted small">Cash (Bill/Coins)</div>
                </button>

                <button
                  type="button"
                  className="chip"
                  style={{ padding: '0.85rem 0.5rem', background: '#1e293b', borderColor: '#475569', textAlign: 'center' }}
                  onClick={() => handlePayment('credit')}
                >
                  <div style={{ fontSize: '1.4rem' }}>🏷️</div>
                  <b style={{ fontSize: '0.9rem' }}>クレジットカード</b>
                  <div className="muted small">Touch / Chip</div>
                </button>

                <button
                  type="button"
                  className="chip"
                  style={{ padding: '0.85rem 0.5rem', background: '#1e293b', borderColor: '#475569', textAlign: 'center' }}
                  onClick={() => handlePayment('qr')}
                >
                  <div style={{ fontSize: '1.4rem' }}>📱</div>
                  <b style={{ fontSize: '0.9rem' }}>バーコード決済</b>
                  <div className="muted small">PayPay / d-Barai</div>
                </button>
              </div>
            </div>
          )}

          {/* STEP 6: Result / Feedback */}
          {step === 'result' && (
            <div style={{ textAlign: 'center', padding: '0.5rem 0' }}>
              <div style={{ fontSize: '2.5rem', marginBottom: '0.4rem' }}>
                {resultFeedback?.success ? '🎉' : '❌'}
              </div>
              <h3 style={{ margin: '0 0 0.4rem', color: resultFeedback?.success ? '#4ade80' : '#f87171' }}>
                {resultFeedback?.success ? '決済完了 (Payment Complete)' : 'やり直し (Retry)'}
              </h3>
              <p style={{ fontSize: '0.9rem', color: '#cbd5e1', margin: '0 0 1rem' }}>
                {resultFeedback?.message}
              </p>

              {resultFeedback?.success && (
                <div
                  style={{
                    background: 'rgba(56, 189, 248, 0.1)',
                    border: '1px solid rgba(56, 189, 248, 0.3)',
                    borderRadius: '8px',
                    padding: '0.75rem',
                    textAlign: 'left',
                    fontSize: '0.84rem',
                    marginBottom: '1rem',
                  }}
                >
                  <div style={{ marginBottom: '0.3rem' }}>
                    <b>Payment Tendered:</b> {payment ? payment.toUpperCase() : 'CASH'}
                  </div>
                  <b>Cultural Note:</b> {mission.culturalNote}
                </div>
              )}

              <div style={{ display: 'flex', gap: '0.6rem', justifyContent: 'center' }}>
                <button
                  type="button"
                  className="chip on"
                  style={{ padding: '0.6rem 1.2rem', fontWeight: 600 }}
                  onClick={resetFlow}
                >
                  ↺ 注文をやり直す (Try Again)
                </button>
                {curMissionIdx + 1 < CONBINI_MISSIONS.length && (
                  <button
                    type="button"
                    className="chip"
                    style={{ padding: '0.6rem 1.2rem', fontWeight: 600, background: '#1e293b' }}
                    onClick={() => handleSelectMission(curMissionIdx + 1)}
                  >
                    次のミッションへ → (Next Mission)
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Vocabulary Flashcard Quick-Save Drawer */}
      <div style={{ marginTop: '1.5rem', padding: '0.85rem', background: 'var(--surface2)', borderRadius: '10px' }}>
        <h4 style={{ margin: '0 0 0.5rem', fontSize: '0.92rem' }}>
          📌 レジで役立つ日本語単語 (Conbini Survival Vocabulary)
        </h4>
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          {CONBINI_VOCAB.map((v) => (
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
