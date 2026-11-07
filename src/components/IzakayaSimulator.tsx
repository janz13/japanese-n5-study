import { useState } from 'react';
import {
  IZAKAYA_MENU,
  IZAKAYA_MISSIONS,
  calculateSplitBill,
  type IzakayaCategory,
  type IzakayaMenuItem,
  type IzakayaMission,
} from '../data/terminalKiosks';
import { useStore } from '../lib/store';
import { speak } from '../lib/tts';
import {
  playKioskBeep,
  playStaffChime,
  playMiss,
  playFanfare,
} from '../lib/sfx';

interface StagedCartItem {
  item: IzakayaMenuItem;
  quantity: number;
  sauce?: 'tare' | 'shio';
  wasabi?: boolean;
}

export default function IzakayaSimulator({ onCompleteMission }: { onCompleteMission?: () => void }) {
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

  const curMissionIdx = terminalMissionIndices?.izakaya ?? 0;
  const mission: IzakayaMission = IZAKAYA_MISSIONS[curMissionIdx] || IZAKAYA_MISSIONS[0];

  const [activeCategory, setActiveCategory] = useState<IzakayaCategory>('starter');
  const [cart, setCart] = useState<StagedCartItem[]>([]);
  const [selectedSauce, setSelectedSauce] = useState<'tare' | 'shio'>('tare');
  const [selectedWasabi, setSelectedWasabi] = useState<boolean>(true);

  // Split-bill modal state
  const [splitModalOpen, setSplitModalOpen] = useState(false);
  const [partySize, setPartySize] = useState(mission.expectedPartySize || 3);

  // Result dialog
  const [orderFeedback, setOrderFeedback] = useState<{ success: boolean; message: string } | null>(null);

  const cartTotalYen = cart.reduce((sum, ci) => sum + ci.item.price * ci.quantity, 0);

  const CATEGORY_TABS: { id: IzakayaCategory; label: string; icon: string }[] = [
    { id: 'starter', label: 'スピード小鉢', icon: '🫛' },
    { id: 'yakitori', label: '串焼き・焼き鳥', icon: '🍢' },
    { id: 'sashimi', label: '鮮魚・刺身', icon: '🐟' },
    { id: 'agemono', label: '揚げ物', icon: '🍗' },
    { id: 'gohan_men', label: 'ご飯・麺・締め', icon: '🍚' },
    { id: 'drink', label: 'お飲み物', icon: '🍺' },
    { id: 'service', label: 'サービス（無料）', icon: '🛎️' },
  ];

  const handleSelectMission = (idx: number) => {
    setTerminalMissionIdx('izakaya', idx);
    setCart([]);
    setOrderFeedback(null);
  };

  const handleAddItem = (item: IzakayaMenuItem) => {
    if (sfxEnabled) playKioskBeep();
    setCart((prev) => {
      // Find matching item with identical sauce/wasabi option
      const existingIdx = prev.findIndex(
        (ci) =>
          ci.item.id === item.id &&
          (!item.hasSauceChoice || ci.sauce === selectedSauce) &&
          (!item.hasWasabiChoice || ci.wasabi === selectedWasabi)
      );

      if (existingIdx >= 0) {
        const next = [...prev];
        next[existingIdx] = { ...next[existingIdx], quantity: next[existingIdx].quantity + 1 };
        return next;
      }

      return [
        ...prev,
        {
          item,
          quantity: 1,
          sauce: item.hasSauceChoice ? selectedSauce : undefined,
          wasabi: item.hasWasabiChoice ? selectedWasabi : undefined,
        },
      ];
    });
  };

  const handleUpdateQuantity = (idx: number, delta: number) => {
    if (sfxEnabled) playKioskBeep();
    setCart((prev) => {
      const next = [...prev];
      const newQty = next[idx].quantity + delta;
      if (newQty <= 0) {
        return next.filter((_, i) => i !== idx);
      }
      next[idx] = { ...next[idx], quantity: newQty };
      return next;
    });
  };

  const handleCallServer = () => {
    if (sfxEnabled) playStaffChime();
    speak('はい、喜んで！少々お待ちくださいませ！', ttsRate);
  };

  const handleSendOrder = () => {
    // Validate cart against mission.expectedItems
    const expected = mission.expectedItems;
    let matched = true;
    const errors: string[] = [];

    // Check every expected item is satisfied
    for (const exp of expected) {
      const found = cart.find(
        (ci) =>
          ci.item.id === exp.itemId &&
          (exp.sauce === undefined || ci.sauce === exp.sauce) &&
          (exp.wasabi === undefined || ci.wasabi === exp.wasabi)
      );

      if (!found) {
        matched = false;
        errors.push(`Missing item: ${exp.itemId}${exp.sauce ? ` (${exp.sauce})` : ''}`);
      } else if (found.quantity !== exp.quantity) {
        matched = false;
        errors.push(`${found.item.nameJp}: ordered ${found.quantity}, expected ${exp.quantity}`);
      }
    }

    // Check no unexpected extra items
    if (cart.length > expected.length) {
      matched = false;
      errors.push(`Extra items in order tray not specified in mission prompt`);
    }

    if (matched) {
      if (sfxEnabled) playFanfare();
      completeTerminalOrder('izakaya', mission.id);
      if (onCompleteMission) onCompleteMission();
      setOrderFeedback({
        success: true,
        message: '注文完了！ Kitchen received your exact order. ' + mission.kitchenResponseKana,
      });
      speak(mission.kitchenResponseKana, ttsRate);
    } else {
      if (sfxEnabled) playMiss();
      setOrderFeedback({
        success: false,
        message: `Order mismatch: ${errors.join('; ')}. Check the scenario and adjust dishes/options!`,
      });
    }
  };

  const splitBill = calculateSplitBill(cartTotalYen, partySize);

  const IZAKAYA_VOCAB = [
    { id: 'v:izakaya_edamame', front: '枝豆', reading: 'えだまめ', back: 'boiled salted soybeans (classic starter)' },
    { id: 'v:izakaya_negima', front: 'ねぎま', reading: 'ねぎま', back: 'chicken thigh & scallion skewer' },
    { id: 'v:izakaya_tare', front: 'タレ・塩', reading: 'タレ・しお', back: 'sweet soy tare vs. salt seasoning choice' },
    { id: 'v:izakaya_wasabi', front: 'わさび抜き', reading: 'さびぬき', back: 'without wasabi (for sushi/sashimi)' },
    { id: 'v:izakaya_ohiya', front: 'お冷', reading: 'おひや', back: 'complimentary cold water at restaurants' },
    { id: 'v:izakaya_agari', front: 'あがり', reading: 'あがり', back: 'hot green tea served at meal finish' },
    { id: 'v:izakaya_warikan', front: '割り勘', reading: 'わりかん', back: 'splitting the dining bill evenly' },
  ];

  return (
    <div className="izakaya-simulator" style={{ margin: '1rem 0' }}>
      {/* Mission Tabs */}
      <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap', marginBottom: '1rem' }}>
        {IZAKAYA_MISSIONS.map((m, idx) => {
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
          borderLeft: '4px solid #f59e0b',
          marginBottom: '1rem',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h3 style={{ margin: 0, fontSize: '1.1rem' }}>
            🍶 {mission.title} <span className="muted">({mission.titleJp})</span>
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

      {/* Main Touchscreen Izakaya Tablet Simulation */}
      <div
        style={{
          background: '#1e293b',
          border: '3px solid #475569',
          borderRadius: '16px',
          padding: '1rem',
          boxShadow: '0 8px 30px rgba(0,0,0,0.4)',
          color: '#f8fafc',
        }}
      >
        {/* Tablet Top Status Bar */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            borderBottom: '1px solid #334155',
            paddingBottom: '0.6rem',
            marginBottom: '0.8rem',
            flexWrap: 'wrap',
            gap: '0.5rem',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <span style={{ fontSize: '1.3rem' }}>🏮</span>
            <b>大衆酒場 タブレット注文端末</b>
            <span className="tag" style={{ background: '#334155', color: '#94a3b8', fontSize: '0.72rem' }}>卓番号 8</span>
          </div>

          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button
              type="button"
              className="chip"
              style={{ background: '#ca8a04', color: '#fff', borderColor: '#eab308', fontWeight: 600 }}
              onClick={handleCallServer}
              title="Call server with chime"
            >
              🛎️ 店員呼出 (Call)
            </button>
            <button
              type="button"
              className="chip"
              style={{ background: '#0284c7', color: '#fff', borderColor: '#38bdf8', fontWeight: 600 }}
              onClick={() => setSplitModalOpen(true)}
            >
              ➗ お会計・割り勘 (Split Bill)
            </button>
          </div>
        </div>

        {/* Category Navigation Ribbon */}
        <div
          style={{
            display: 'flex',
            gap: '0.35rem',
            overflowX: 'auto',
            paddingBottom: '0.4rem',
            marginBottom: '0.8rem',
          }}
        >
          {CATEGORY_TABS.map((cat) => (
            <button
              key={cat.id}
              type="button"
              className={activeCategory === cat.id ? 'chip on' : 'chip'}
              style={{
                fontSize: '0.85rem',
                whiteSpace: 'nowrap',
                fontWeight: activeCategory === cat.id ? 700 : 500,
              }}
              onClick={() => {
                if (sfxEnabled) playKioskBeep();
                setActiveCategory(cat.id);
              }}
            >
              {cat.icon} {cat.label}
            </button>
          ))}
        </div>

        {/* Options Selector Bar (Yakitori Sauce / Sashimi Wasabi) */}
        {(activeCategory === 'yakitori' || activeCategory === 'sashimi') && (
          <div
            style={{
              background: '#0f172a',
              padding: '0.5rem 0.8rem',
              borderRadius: '8px',
              marginBottom: '0.8rem',
              display: 'flex',
              alignItems: 'center',
              gap: '1rem',
              fontSize: '0.85rem',
            }}
          >
            {activeCategory === 'yakitori' && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span className="muted">串焼き味付け:</span>
                <button
                  type="button"
                  className={selectedSauce === 'tare' ? 'chip on' : 'chip'}
                  style={{ padding: '0.2rem 0.6rem', fontSize: '0.82rem' }}
                  onClick={() => setSelectedSauce('tare')}
                >
                  タレ (Sweet Tare)
                </button>
                <button
                  type="button"
                  className={selectedSauce === 'shio' ? 'chip on' : 'chip'}
                  style={{ padding: '0.2rem 0.6rem', fontSize: '0.82rem' }}
                  onClick={() => setSelectedSauce('shio')}
                >
                  塩 (Salt)
                </button>
              </div>
            )}

            {activeCategory === 'sashimi' && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span className="muted">わさびの有無:</span>
                <button
                  type="button"
                  className={selectedWasabi ? 'chip on' : 'chip'}
                  style={{ padding: '0.2rem 0.6rem', fontSize: '0.82rem' }}
                  onClick={() => setSelectedWasabi(true)}
                >
                  わさびあり (With Wasabi)
                </button>
                <button
                  type="button"
                  className={!selectedWasabi ? 'chip on' : 'chip'}
                  style={{ padding: '0.2rem 0.6rem', fontSize: '0.82rem' }}
                  onClick={() => setSelectedWasabi(false)}
                >
                  さび抜き (No Wasabi)
                </button>
              </div>
            )}
          </div>
        )}

        {/* Main Content: Menu Grid (Left) & Order Tray (Right) */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
            gap: '1rem',
            alignItems: 'start',
          }}
        >
          {/* Menu Items Grid */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(170px, 1fr))',
              gap: '0.6rem',
              maxHeight: '380px',
              overflowY: 'auto',
              paddingRight: '0.3rem',
            }}
          >
            {IZAKAYA_MENU.filter((item) => item.category === activeCategory).map((item) => (
              <div
                key={item.id}
                style={{
                  background: '#0f172a',
                  border: '1px solid #334155',
                  borderRadius: '10px',
                  padding: '0.65rem',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  cursor: 'pointer',
                  transition: 'border-color 0.2s',
                }}
                onClick={() => handleAddItem(item)}
              >
                <div>
                  <div style={{ fontSize: '1.6rem', marginBottom: '0.2rem' }}>{item.icon}</div>
                  <b style={{ fontSize: '0.88rem', display: 'block', lineHeight: 1.25 }}>{item.nameJp}</b>
                  <span className="muted small" style={{ fontSize: '0.75rem' }}>{item.nameEn}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.5rem' }}>
                  <span style={{ color: '#38bdf8', fontWeight: 700, fontSize: '0.9rem' }}>
                    {item.price === 0 ? '無料 (¥0)' : `¥${item.price}`}
                  </span>
                  <button
                    type="button"
                    className="chip on"
                    style={{ padding: '0.15rem 0.5rem', fontSize: '0.78rem' }}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleAddItem(item);
                    }}
                  >
                    + 注文
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Current Order Staging Tray */}
          <div
            style={{
              background: '#0f172a',
              border: '1px solid #334155',
              borderRadius: '12px',
              padding: '0.85rem',
              display: 'flex',
              flexDirection: 'column',
              maxHeight: '380px',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.6rem' }}>
              <b style={{ fontSize: '0.95rem' }}>📋 注文トレイ ({cart.length} 品)</b>
              {cart.length > 0 && (
                <button
                  type="button"
                  className="chip"
                  style={{ padding: '0.1rem 0.4rem', fontSize: '0.72rem' }}
                  onClick={() => setCart([])}
                >
                  クリア
                </button>
              )}
            </div>

            <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
              {cart.length === 0 ? (
                <div className="muted small" style={{ textAlign: 'center', padding: '2rem 0' }}>
                  品物が選択されていません。<br />左のメニューから品物をタップしてトレイに追加してください。
                </div>
              ) : (
                cart.map((ci, idx) => (
                  <div
                    key={`${ci.item.id}-${ci.sauce}-${ci.wasabi}`}
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      background: '#1e293b',
                      padding: '0.4rem 0.6rem',
                      borderRadius: '6px',
                      fontSize: '0.84rem',
                    }}
                  >
                    <div style={{ flex: 1, minWidth: 0, paddingRight: '0.4rem' }}>
                      <div style={{ fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {ci.item.icon} {ci.item.nameJp}
                      </div>
                      <div className="muted small">
                        {ci.sauce && `[${ci.sauce === 'tare' ? 'タレ' : '塩'}] `}
                        {ci.wasabi !== undefined && `[${ci.wasabi ? 'わさび有' : 'さび抜き'}] `}
                        ¥{ci.item.price * ci.quantity}
                      </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                      <button
                        type="button"
                        className="chip"
                        style={{ padding: '0.1rem 0.4rem', fontSize: '0.75rem' }}
                        onClick={() => handleUpdateQuantity(idx, -1)}
                      >
                        -
                      </button>
                      <b style={{ minWidth: '1.2rem', textAlign: 'center' }}>{ci.quantity}</b>
                      <button
                        type="button"
                        className="chip"
                        style={{ padding: '0.1rem 0.4rem', fontSize: '0.75rem' }}
                        onClick={() => handleUpdateQuantity(idx, 1)}
                      >
                        +
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Total and Submit */}
            <div style={{ marginTop: '0.6rem', paddingTop: '0.6rem', borderTop: '1px solid #334155' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.6rem' }}>
                <span className="muted">現在合計 (Total):</span>
                <b style={{ color: '#38bdf8', fontSize: '1.1rem' }}>¥{cartTotalYen}</b>
              </div>
              <button
                type="button"
                className="chip on"
                style={{
                  width: '100%',
                  padding: '0.65rem',
                  fontSize: '0.95rem',
                  fontWeight: 700,
                  background: cart.length > 0 ? 'var(--accent)' : '#334155',
                  color: cart.length > 0 ? '#000' : '#94a3b8',
                }}
                disabled={cart.length === 0}
                onClick={handleSendOrder}
              >
                注文を送信する (Send Order)
              </button>
            </div>
          </div>
        </div>

        {/* Order Feedback Notice */}
        {orderFeedback && (
          <div
            style={{
              marginTop: '1rem',
              padding: '0.85rem',
              borderRadius: '8px',
              background: orderFeedback.success ? 'rgba(34, 197, 94, 0.15)' : 'rgba(239, 68, 68, 0.15)',
              border: `1px solid ${orderFeedback.success ? '#22c55e' : '#ef4444'}`,
            }}
          >
            <div style={{ fontWeight: 700, color: orderFeedback.success ? '#4ade80' : '#f87171' }}>
              {orderFeedback.success ? '✓ 注文送信完了 (Order Accepted)' : '⚠️ 注文内容の不一致 (Order Mismatch)'}
            </div>
            <p style={{ margin: '0.3rem 0', fontSize: '0.88rem' }}>{orderFeedback.message}</p>
            {orderFeedback.success && (
              <p className="muted small" style={{ margin: 0 }}>
                <b>Cultural Insight:</b> {mission.culturalNote}
              </p>
            )}
          </div>
        )}
      </div>

      {/* Split-Bill Modal (割り勘計算) */}
      {splitModalOpen && (
        <div
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
          onClick={() => setSplitModalOpen(false)}
        >
          <div
            style={{
              background: '#1e293b',
              border: '2px solid #38bdf8',
              borderRadius: '14px',
              padding: '1.25rem',
              maxWidth: '420px',
              width: '100%',
              color: '#f8fafc',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.85rem' }}>
              <h3 style={{ margin: 0, fontSize: '1.15rem' }}>➗ 割り勘計算機 (Split Bill)</h3>
              <button
                type="button"
                className="chip"
                onClick={() => setSplitModalOpen(false)}
              >
                ✕
              </button>
            </div>

            <p className="muted small" style={{ margin: '0 0 1rem' }}>
              Japanese izakaya bill splitting automatically rounds up to the nearest 100 yen so guests do not exchange small coins.
            </p>

            <div style={{ marginBottom: '1rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
                <span>人数 (Party Size):</span>
                <b>{partySize} 名 (Persons)</b>
              </div>
              <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
                {[2, 3, 4, 5, 6, 8].map((num) => (
                  <button
                    key={num}
                    type="button"
                    className={partySize === num ? 'chip on' : 'chip'}
                    onClick={() => setPartySize(num)}
                  >
                    {num}名
                  </button>
                ))}
              </div>
            </div>

            <div
              style={{
                background: '#0f172a',
                padding: '0.85rem',
                borderRadius: '8px',
                fontSize: '0.9rem',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.35rem',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span className="muted">総額 (Total Bill):</span>
                <span>¥{splitBill.totalYen}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span className="muted">1人当たり計算値:</span>
                <span>¥{splitBill.perPersonRaw}</span>
              </div>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  borderTop: '1px solid #334155',
                  paddingTop: '0.4rem',
                  fontSize: '1.1rem',
                  fontWeight: 700,
                  color: '#38bdf8',
                }}
              >
                <span>1人あたり集金額:</span>
                <span>¥{splitBill.perPersonRounded}</span>
              </div>
              {splitBill.surplus > 0 && (
                <div className="muted small" style={{ textAlign: 'right', fontSize: '0.78rem' }}>
                  （端数余り: +¥{splitBill.surplus} 次のお店の予算へ）
                </div>
              )}
            </div>

            <div style={{ textAlign: 'center', marginTop: '1rem' }}>
              <button
                type="button"
                className="chip on"
                style={{ width: '100%', padding: '0.6rem', fontWeight: 600 }}
                onClick={() => setSplitModalOpen(false)}
              >
                閉じる (Close Preview)
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Vocabulary Flashcard Quick-Save Drawer */}
      <div style={{ marginTop: '1.5rem', padding: '0.85rem', background: 'var(--surface2)', borderRadius: '10px' }}>
        <h4 style={{ margin: '0 0 0.5rem', fontSize: '0.92rem' }}>
          📌 居酒屋で役立つ日本語単語 (Izakaya Dining Vocabulary)
        </h4>
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          {IZAKAYA_VOCAB.map((v) => (
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
