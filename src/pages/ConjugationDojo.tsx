import { useEffect, useMemo, useRef, useState } from 'react';
import { toHiragana } from 'wanakana';
import {
  CONJUGATIONS,
  DECONJUGATION_ITEMS,
  FORM_LABELS,
  GROUP_LABELS,
  getConjugationContext,
  type ConjForm,
  type ConjugatableWord,
  type WordGroup,
} from '../data/conjugations';
import { VERB_PAIRS, type VerbPair } from '../data/verbPairs';
import { CONJUGATION_LESSONS } from '../data/conjugationLessons';
import { useStore } from '../lib/store';
import { speak } from '../lib/tts';
import { playDing, playMiss } from '../lib/sfx';
import ConjugationLessonViewer from '../components/ConjugationLessonViewer';
import { useCampaignMission } from '../lib/useCampaignMission';
import CampaignBanner from '../components/CampaignBanner';

const ALL_GROUPS: WordGroup[] = ['ichidan', 'godan', 'irregular', 'i-adj', 'na-adj'];
const ALL_FORMS: ConjForm[] = ['polite', 'te', 'negative', 'past', 'politePast'];

interface PromptItem {
  word: ConjugatableWord;
  form: ConjForm;
}

interface PairDrill {
  pair: VerbPair;
  targetKind: 'intransitive' | 'transitive';
  sentenceWithBlank: string;
  answerWord: string;
  distractorWord: string;
  en: string;
  ttsKana: string;
}

function matchesTarget(input: string, word: ConjugatableWord, form: ConjForm) {
  const target = word.forms[form];
  const clean = input.trim().toLowerCase().replace(/\s+/g, '');
  if (!clean) return false;
  if (clean === target.romaji || clean === target.kana || clean === target.kanji) return true;
  const hira = toHiragana(clean);
  return hira === target.kana;
}

export default function ConjugationDojo() {
  const { srs, addCard, sfxEnabled } = useStore();
  const {
    isCampaignMode,
    stage,
    saga,
    targetTab,
    targetLessonId,
    completeMission,
    returnToCampaign,
  } = useCampaignMission();
  const [dojoMode, setDojoMode] = useState<'lessons' | 'conjugate' | 'deconjugate' | 'pairs'>(() => {
    if (
      targetTab === 'lessons' ||
      targetTab === 'conjugate' ||
      targetTab === 'deconjugate' ||
      targetTab === 'pairs'
    ) {
      return targetTab;
    }
    return 'lessons';
  });

  useEffect(() => {
    if (
      targetTab === 'lessons' ||
      targetTab === 'conjugate' ||
      targetTab === 'deconjugate' ||
      targetTab === 'pairs'
    ) {
      setDojoMode(targetTab);
    }
  }, [targetTab]);

  // Deconjugation Drill State
  const [deconjFilterGroup, setDeconjFilterGroup] = useState<WordGroup | 'all'>('all');
  const [deconjIdx, setDeconjIdx] = useState(0);
  const [selectedRoot, setSelectedRoot] = useState<string | null>(null);
  const [selectedVoice, setSelectedVoice] = useState<string | null>(null);
  const [deconjAnswered, setDeconjAnswered] = useState(false);
  const [deconjSession, setDeconjSession] = useState({ ok: 0, total: 0 });
  const [deconjFlash, setDeconjFlash] = useState<'ok' | 'bad' | null>(null);

  const filteredDeconjList = useMemo(() => {
    if (deconjFilterGroup === 'all') return DECONJUGATION_ITEMS;
    return DECONJUGATION_ITEMS.filter((item) => item.group === deconjFilterGroup);
  }, [deconjFilterGroup]);

  const currentDeconj = filteredDeconjList[deconjIdx % filteredDeconjList.length] || DECONJUGATION_ITEMS[0];

  const handleSelectRoot = (dict: string) => {
    if (deconjAnswered) return;
    setSelectedRoot(dict);
  };

  const handleSelectVoice = (voice: string) => {
    if (deconjAnswered) return;
    setSelectedVoice(voice);
  };

  const submitDeconjugation = () => {
    if (!selectedRoot || deconjAnswered) return;
    const isRootOk = selectedRoot === currentDeconj.targetDictForm;
    const isVoiceOk = selectedVoice ? selectedVoice === currentDeconj.formIdentified : true;
    const isAllOk = isRootOk && isVoiceOk;

    setDeconjAnswered(true);
    setDeconjFlash(isAllOk ? 'ok' : 'bad');
    if (sfxEnabled) (isAllOk ? playDing : playMiss)();
    speak(currentDeconj.inflectedReading);

    setDeconjSession((s) => {
      const nextOk = s.ok + (isAllOk ? 1 : 0);
      const nextTotal = s.total + 1;
      if (isCampaignMode && nextTotal >= 5) {
        completeMission();
      }
      return { ok: nextOk, total: nextTotal };
    });
  };

  const nextDeconjugation = () => {
    setSelectedRoot(null);
    setSelectedVoice(null);
    setDeconjAnswered(false);
    setDeconjFlash(null);
    setDeconjIdx((i) => i + 1);
  };
  const [groups, setGroups] = useState<WordGroup[]>(ALL_GROUPS);
  const [forms, setForms] = useState<ConjForm[]>(['polite', 'te', 'negative', 'past']);
  const [current, setCurrent] = useState<PromptItem | null>(null);
  const [input, setInput] = useState('');
  const [flash, setFlash] = useState<'ok' | 'bad' | null>(null);
  const [reveal, setReveal] = useState<string | null>(null);
  const [showHint, setShowHint] = useState(false);
  const [session, setSession] = useState({ ok: 0, total: 0 });
  const inputRef = useRef<HTMLInputElement>(null);

  // Transitive vs Intransitive Pair Drill State
  const pairDrills = useMemo<PairDrill[]>(() => {
    const list: PairDrill[] = [];
    for (const p of VERB_PAIRS) {
      const inMatch = p.intransitive.exampleJp.match(/【([^】]+)】/);
      const trMatch = p.transitive.exampleJp.match(/【([^】]+)】/);
      list.push({
        pair: p,
        targetKind: 'intransitive',
        sentenceWithBlank: p.intransitive.exampleJp.replace(/【[^】]+】/, '（　　）'),
        answerWord: `${p.intransitive.kanji}（${p.intransitive.kana}） — ${inMatch ? inMatch[1] : p.intransitive.kanji}`,
        distractorWord: `${p.transitive.kanji}（${p.transitive.kana}） — ${trMatch ? trMatch[1] : p.transitive.kanji}`,
        en: p.intransitive.exampleEn,
        ttsKana: p.intransitive.exampleKana,
      });
      list.push({
        pair: p,
        targetKind: 'transitive',
        sentenceWithBlank: p.transitive.exampleJp.replace(/【[^】]+】/, '（　　）'),
        answerWord: `${p.transitive.kanji}（${p.transitive.kana}） — ${trMatch ? trMatch[1] : p.transitive.kanji}`,
        distractorWord: `${p.intransitive.kanji}（${p.intransitive.kana}） — ${inMatch ? inMatch[1] : p.intransitive.kanji}`,
        en: p.transitive.exampleEn,
        ttsKana: p.transitive.exampleKana,
      });
    }
    return list;
  }, []);

  const [pairIdx, setPairIdx] = useState(0);
  const [pairPicked, setPairPicked] = useState<'intransitive' | 'transitive' | null>(null);
  const currentPairDrill = pairDrills[pairIdx % pairDrills.length];

  const pool = useMemo(() => {
    const out: PromptItem[] = [];
    for (const w of CONJUGATIONS) {
      if (!groups.includes(w.group)) continue;
      for (const f of forms) {
        out.push({ word: w, form: f });
      }
    }
    return out;
  }, [groups, forms]);

  const pickNext = (last?: PromptItem | null) => {
    if (!pool.length) return null;
    const candidates =
      pool.length > 1 && last
        ? pool.filter((p) => !(p.word.id === last.word.id && p.form === last.form))
        : pool;
    return candidates[Math.floor(Math.random() * candidates.length)];
  };

  useEffect(() => {
    setCurrent(pickNext(null));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pool]);

  const submit = (val: string) => {
    if (!current) return;
    const target = current.word.forms[current.form];
    const ok = matchesTarget(val, current.word, current.form);
    setSession((s) => ({ ok: s.ok + (ok ? 1 : 0), total: s.total + 1 }));
    setFlash(ok ? 'ok' : 'bad');
    if (sfxEnabled) (ok ? playDing : playMiss)();
    speak(target.kana);
    if (ok) {
      setReveal(null);
    } else {
      setReveal(`${current.word.dict} (${FORM_LABELS[current.form].en}) = ${target.kanji} (${target.kana} / ${target.romaji})`);
    }
    setCurrent(pickNext(current));
    setInput('');
    setShowHint(false);
    setTimeout(() => setFlash(null), 250);
  };

  const onChange = (v: string) => {
    setInput(v);
    if (current && matchesTarget(v, current.word, current.form)) {
      submit(v);
    }
  };

  const toggleGroup = (g: WordGroup) =>
    setGroups((gs) => (gs.includes(g) ? (gs.length > 1 ? gs.filter((x) => x !== g) : gs) : [...gs, g]));

  const toggleForm = (f: ConjForm) =>
    setForms((fs) => (fs.includes(f) ? (fs.length > 1 ? fs.filter((x) => x !== f) : fs) : [...fs, f]));

  const target = current ? current.word.forms[current.form] : null;
  const srsId = current ? `c:${current.word.id}:${current.form}` : '';

  const choosePairOption = (kind: 'intransitive' | 'transitive') => {
    if (pairPicked) return;
    setPairPicked(kind);
    const ok = kind === currentPairDrill.targetKind;
    setSession((s) => {
      const nextOk = s.ok + (ok ? 1 : 0);
      const nextTotal = s.total + 1;
      if (isCampaignMode && nextTotal >= 5) {
        completeMission();
      }
      return { ok: nextOk, total: nextTotal };
    });
    if (sfxEnabled) (ok ? playDing : playMiss)();
    speak(currentPairDrill.ttsKana);
  };

  return (
    <div className="page">
      {isCampaignMode && stage && (
        <CampaignBanner stage={stage} saga={saga} onReturn={returnToCampaign} />
      )}
      <div className="row-between">
        <div>
          <h1 className="nomargin">
            活用・自他動詞道場 <span className="muted">Verb, Adjective &amp; Pair Dojo</span>
          </h1>
          <p className="muted small nomargin" style={{ marginTop: '0.2rem' }}>
            Master verb/adjective inflections and N5/N4 Transitive vs. Intransitive (`自動詞・他動詞`) verb pairs.
          </p>
        </div>
        <div className="controls">
          <button
            className={dojoMode === 'lessons' ? 'chip on' : 'chip'}
            onClick={() => setDojoMode('lessons')}
          >
            📖 Fundamental Lessons ({CONJUGATION_LESSONS.length})
          </button>
          <button
            className={dojoMode === 'conjugate' ? 'chip on' : 'chip'}
            onClick={() => setDojoMode('conjugate')}
          >
            ⚡ Inflection Drill ({CONJUGATIONS.length} words)
          </button>
          <button
            className={dojoMode === 'deconjugate' ? 'chip on' : 'chip'}
            onClick={() => setDojoMode('deconjugate')}
          >
            ↩️ Reverse De-Conjugator ({DECONJUGATION_ITEMS.length} challenges)
          </button>
          <button
            className={dojoMode === 'pairs' ? 'chip on' : 'chip'}
            onClick={() => setDojoMode('pairs')}
          >
            🔄 Transitive vs. Intransitive ({VERB_PAIRS.length} pairs)
          </button>
        </div>
      </div>

      {dojoMode === 'lessons' ? (
        <ConjugationLessonViewer
          onSwitchToDrill={() => setDojoMode('conjugate')}
          initialLessonId={targetLessonId}
          onComplete={() => {
            if (isCampaignMode) completeMission();
          }}
        />
      ) : dojoMode === 'conjugate' ? (
        <>
          <div className="controls" style={{ marginTop: '0.8rem' }}>
            <span className="muted small" style={{ alignSelf: 'center' }}>Groups:</span>
            {ALL_GROUPS.map((g) => (
              <button key={g} className={groups.includes(g) ? 'chip on' : 'chip'} onClick={() => toggleGroup(g)}>
                {GROUP_LABELS[g]}
              </button>
            ))}
            <button className={groups.length === ALL_GROUPS.length ? 'chip on' : 'chip'} onClick={() => setGroups(ALL_GROUPS)}>
              All Groups
            </button>
          </div>

          <div className="controls">
            <span className="muted small" style={{ alignSelf: 'center' }}>Forms:</span>
            {ALL_FORMS.map((f) => (
              <button key={f} className={forms.includes(f) ? 'chip on' : 'chip'} onClick={() => toggleForm(f)}>
                {FORM_LABELS[f].jp}
              </button>
            ))}
          </div>

          {current && target && (
            <div className={`drill ${flash ?? ''}`} onClick={() => inputRef.current?.focus()}>
              <span className="tag">
                {GROUP_LABELS[current.word.group]} → <b>{FORM_LABELS[current.form].jp}</b> ({FORM_LABELS[current.form].en})
              </span>
              <div className="drill-char" style={{ fontSize: '3.6rem', margin: '0.4rem 0' }}>
                <ruby>
                  {current.word.dict}
                  <rt>{current.word.reading}</rt>
                </ruby>
              </div>
              <div className="muted" style={{ marginBottom: '0.5rem' }}>{current.word.en}</div>

              {/* 1-Line Context Sentence Anchor */}
              {(() => {
                const ctx = getConjugationContext(current.word.id, current.form);
                if (!ctx) return null;
                return (
                  <div
                    style={{
                      background: 'var(--surface2)',
                      borderLeft: '3px solid var(--accent)',
                      borderRadius: '8px',
                      padding: '0.55rem 0.95rem',
                      margin: '0.2rem auto 0.9rem',
                      maxWidth: '440px',
                      textAlign: 'left',
                    }}
                  >
                    <div className="jp" style={{ fontSize: '1.05rem', fontWeight: 600, color: 'var(--text)' }}>
                      💬 {ctx.jp}
                    </div>
                    <div className="muted small" style={{ marginTop: '0.2rem' }}>
                      {ctx.en}
                    </div>
                  </div>
                );
              })()}

              <input
                ref={inputRef}
                autoFocus
                value={input}
                onChange={(e) => onChange(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && input && submit(input)}
                placeholder="type romaji or kana…"
                className="drill-input"
                style={{ width: '280px' }}
                autoComplete="off"
                autoCapitalize="off"
              />

              <div className="controls center" style={{ marginTop: '0.9rem' }}>
                <button
                  type="button"
                  className="chip"
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowHint((h) => !h);
                  }}
                >
                  💡 {showHint ? target.rule : 'Rule Hint'}
                </button>
                <button
                  type="button"
                  className="chip"
                  disabled={!!srs[srsId]}
                  onClick={(e) => {
                    e.stopPropagation();
                    addCard({
                      id: srsId,
                      kind: 'grammar',
                      front: `${current.word.dict} → ${FORM_LABELS[current.form].jp}`,
                      reading: target.kana,
                      back: `${target.kanji} (${current.word.en} · ${target.rule})`,
                    });
                  }}
                >
                  {srs[srsId] ? '✓ In SRS' : '+ Add to SRS'}
                </button>
                <button
                  type="button"
                  className="chip"
                  onClick={(e) => {
                    e.stopPropagation();
                    submit(input || 'skip');
                  }}
                >
                  Skip / Reveal →
                </button>
              </div>

              <div className="drill-meta">
                {reveal ? <span className="bad-text">✗ {reveal}</span> : <span>&nbsp;</span>}
                <span>
                  {session.ok}/{session.total} · {session.total ? Math.round((session.ok / session.total) * 100) : 0}%
                </span>
              </div>
            </div>
          )}

          <h2>Conjugation Reference Chart ({CONJUGATIONS.length} words)</h2>
          <div className="story-list">
            {CONJUGATIONS.filter((w) => groups.includes(w.group)).map((w) => (
              <div key={w.id} className="gp">
                <div className="row-between">
                  <div className="gp-head">
                    <b className="jp" onClick={() => speak(w.reading)} style={{ cursor: 'pointer' }}>
                      🔊 {w.dict} <span className="muted small">({w.reading})</span>
                    </b>
                    <span className="muted">{w.en}</span>
                  </div>
                  <span className="tag">{GROUP_LABELS[w.group]}</span>
                </div>
                <div className="controls" style={{ marginTop: '0.5rem' }}>
                  {ALL_FORMS.map((f) => {
                    const tf = w.forms[f];
                    return (
                      <button
                        key={f}
                        className="chip"
                        onClick={() => speak(tf.kana)}
                        title={tf.rule}
                      >
                        <span className="muted small">{FORM_LABELS[f].en}: </span>
                        <b className="jp">{tf.kanji}</b> <span className="muted small">({tf.romaji})</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </>
      ) : dojoMode === 'deconjugate' ? (
        <>
          <div className="controls" style={{ marginTop: '0.8rem' }}>
            <span className="muted small" style={{ alignSelf: 'center' }}>Filter:</span>
            <button
              className={deconjFilterGroup === 'all' ? 'chip on' : 'chip'}
              onClick={() => {
                setDeconjFilterGroup('all');
                setSelectedRoot(null);
                setSelectedVoice(null);
                setDeconjAnswered(false);
              }}
            >
              All Verb Groups ({DECONJUGATION_ITEMS.length})
            </button>
            {(['ichidan', 'godan', 'irregular'] as const).map((g) => (
              <button
                key={g}
                className={deconjFilterGroup === g ? 'chip on' : 'chip'}
                onClick={() => {
                  setDeconjFilterGroup(g);
                  setSelectedRoot(null);
                  setSelectedVoice(null);
                  setDeconjAnswered(false);
                }}
              >
                {GROUP_LABELS[g]}
              </button>
            ))}
          </div>

          {currentDeconj && (
            <div className={`drill ${deconjFlash ?? ''}`} style={{ maxWidth: '640px', margin: '1rem auto' }}>
              <div className="row-between" style={{ width: '100%' }}>
                <span className="tag">
                  ↩️ Reverse De-Conjugator · {GROUP_LABELS[currentDeconj.group]}
                </span>
                <span className="muted small">
                  Challenge {(deconjIdx % filteredDeconjList.length) + 1} / {filteredDeconjList.length}
                </span>
              </div>

              {/* Surface Inflected Word */}
              <div className="drill-char" style={{ fontSize: '3.6rem', margin: '0.6rem 0 0.2rem' }}>
                <ruby>
                  {currentDeconj.inflectedWord}
                  <rt>{currentDeconj.inflectedReading}</rt>
                </ruby>
              </div>
              <div className="muted" style={{ marginBottom: '1.2rem' }}>
                romaji: <code>{currentDeconj.romaji}</code>
              </div>

              {/* Step 1: Root Dictionary Form Selection */}
              <div style={{ textAlign: 'left', width: '100%', marginBottom: '1rem' }}>
                <div style={{ fontWeight: 600, fontSize: '0.95rem', marginBottom: '0.4rem', color: 'var(--text)' }}>
                  1. Deduce the Root Dictionary Form (辞書形):
                </div>
                <div className="controls" style={{ gap: '0.6rem' }}>
                  {currentDeconj.options.map((opt) => {
                    const isPicked = selectedRoot === opt.dict;
                    const isTarget = currentDeconj.targetDictForm === opt.dict;
                    let btnCls = 'chip';
                    if (deconjAnswered) {
                      if (isTarget) btnCls = 'chip ok';
                      else if (isPicked) btnCls = 'chip bad';
                    } else if (isPicked) {
                      btnCls = 'chip on';
                    }

                    return (
                      <button
                        key={opt.dict}
                        type="button"
                        className={btnCls}
                        style={{ padding: '0.6rem 1rem', fontSize: '1.05rem' }}
                        onClick={() => handleSelectRoot(opt.dict)}
                        disabled={deconjAnswered}
                      >
                        <b className="jp">{opt.dict}</b>{' '}
                        <span className="muted small">({opt.reading} · {opt.en})</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Step 2: Grammatical Voice Selection */}
              <div style={{ textAlign: 'left', width: '100%', marginBottom: '1.2rem' }}>
                <div style={{ fontWeight: 600, fontSize: '0.95rem', marginBottom: '0.4rem', color: 'var(--text)' }}>
                  2. Identify the Inflection / Grammatical Voice (文法形・態):
                </div>
                <div className="controls" style={{ gap: '0.5rem' }}>
                  {currentDeconj.voiceOptions.map((vOpt) => {
                    const isPicked = selectedVoice === vOpt;
                    const isTarget = currentDeconj.formIdentified === vOpt;
                    let vCls = 'chip';
                    if (deconjAnswered) {
                      if (isTarget) vCls = 'chip ok';
                      else if (isPicked) vCls = 'chip bad';
                    } else if (isPicked) {
                      vCls = 'chip on';
                    }

                    return (
                      <button
                        key={vOpt}
                        type="button"
                        className={vCls}
                        onClick={() => handleSelectVoice(vOpt)}
                        disabled={deconjAnswered}
                      >
                        {vOpt}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Submit & Audio Controls */}
              {!deconjAnswered ? (
                <div className="controls center">
                  <button
                    type="button"
                    className="chip on"
                    style={{ padding: '0.7rem 1.8rem', fontSize: '1.05rem', fontWeight: 700 }}
                    disabled={!selectedRoot}
                    onClick={submitDeconjugation}
                  >
                    Check De-Conjugation ✓
                  </button>
                  <button
                    type="button"
                    className="chip"
                    onClick={() => speak(currentDeconj.inflectedReading)}
                  >
                    🔊 Hear Inflection
                  </button>
                </div>
              ) : (
                /* Post-Answer Step-by-Step Un-inflection Chain */
                <div style={{ width: '100%', marginTop: '0.5rem' }}>
                  <div
                    style={{
                      background: 'var(--surface2)',
                      border: '1px solid var(--border)',
                      borderLeft: '4px solid var(--accent)',
                      borderRadius: '10px',
                      padding: '1rem',
                      textAlign: 'left',
                      marginBottom: '1rem',
                    }}
                  >
                    <div style={{ fontWeight: 700, fontSize: '1rem', marginBottom: '0.6rem', color: 'var(--accent)' }}>
                      📍 Step-by-Step Un-inflection Chain (解読ステップ):
                    </div>
                    {currentDeconj.uninflectionSteps.map((step, sIdx) => (
                      <div
                        key={sIdx}
                        style={{
                          display: 'flex',
                          alignItems: 'flex-start',
                          gap: '0.6rem',
                          marginBottom: '0.5rem',
                          fontSize: '0.95rem',
                        }}
                      >
                        <span
                          style={{
                            background: 'var(--surface)',
                            border: '1px solid var(--border)',
                            borderRadius: '50%',
                            width: '24px',
                            height: '24px',
                            display: 'inline-flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '0.8rem',
                            fontWeight: 700,
                            flexShrink: 0,
                          }}
                        >
                          {sIdx + 1}
                        </span>
                        <div>
                          <div>
                            <b className="jp">{step.from}</b> ➔ <b className="jp" style={{ color: 'var(--ok)' }}>{step.to}</b>
                          </div>
                          <div className="muted small" style={{ marginTop: '0.15rem' }}>
                            {step.rule}
                          </div>
                        </div>
                      </div>
                    ))}
                    <div
                      style={{
                        marginTop: '0.8rem',
                        paddingTop: '0.6rem',
                        borderTop: '1px dashed var(--border)',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                      }}
                    >
                      <span>
                        Root: <b className="jp" style={{ fontSize: '1.15rem' }}>{currentDeconj.targetDictForm}</b>{' '}
                        <span className="muted small">({currentDeconj.targetDictReading} — {currentDeconj.targetEn})</span>
                      </span>
                      <span className="tag ok">{currentDeconj.formIdentified}</span>
                    </div>
                  </div>

                  <div className="controls center">
                    <button
                      type="button"
                      className="chip"
                      onClick={() => speak(currentDeconj.inflectedReading)}
                    >
                      🔊 Hear Inflection
                    </button>
                    <button
                      type="button"
                      className={srs[`dcj:${currentDeconj.id}`] ? 'chip ok' : 'chip'}
                      disabled={!!srs[`dcj:${currentDeconj.id}`]}
                      onClick={() =>
                        addCard({
                          id: `dcj:${currentDeconj.id}`,
                          kind: 'grammar',
                          front: `Deconjugate: ${currentDeconj.inflectedWord} (${currentDeconj.inflectedReading})`,
                          reading: currentDeconj.targetDictReading,
                          back: `Root: ${currentDeconj.targetDictForm} (${currentDeconj.targetEn}) · Form: ${currentDeconj.formIdentified}`,
                        })
                      }
                    >
                      {srs[`dcj:${currentDeconj.id}`] ? '✓ In SRS' : '+ Add to SRS'}
                    </button>
                    <button
                      type="button"
                      className="chip on"
                      style={{ padding: '0.6rem 1.4rem', fontWeight: 700 }}
                      onClick={nextDeconjugation}
                    >
                      Next Challenge ➔
                    </button>
                  </div>
                </div>
              )}

              {/* Session Score */}
              <div className="drill-meta" style={{ marginTop: '0.8rem' }}>
                <span>
                  {deconjAnswered && (
                    <span className={selectedRoot === currentDeconj.targetDictForm ? 'ok-text' : 'bad-text'}>
                      {selectedRoot === currentDeconj.targetDictForm ? '✓ Correct Deduction!' : `✗ Target was ${currentDeconj.targetDictForm}`}
                    </span>
                  )}
                </span>
                <span>
                  Session: {deconjSession.ok} / {deconjSession.total} ·{' '}
                  {deconjSession.total ? Math.round((deconjSession.ok / deconjSession.total) * 100) : 0}%
                </span>
              </div>
            </div>
          )}

          {/* Reference Matrix for De-Conjugation Rules */}
          <h2>Reverse De-Conjugation (Un-inflection) Cheat Sheet</h2>
          <div className="story-list">
            <div className="gp">
              <div className="row-between">
                <b className="jp">解読の原則 (Core Un-inflection Principles)</b>
                <span className="tag">Morphology Rules</span>
              </div>
              <p className="muted small" style={{ margin: '0.4rem 0 0.8rem' }}>
                How to peel away Japanese verbal suffixes layer-by-layer to discover the dictionary root:
              </p>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '0.8rem' }}>
                <div style={{ background: 'var(--surface2)', padding: '0.75rem', borderRadius: '8px' }}>
                  <b className="jp">1. 〜なかった (Past Negative)</b>
                  <p className="muted small nomargin" style={{ marginTop: '0.2rem' }}>
                    Strip <code>なかった</code> ➔ restore <code>ない</code> ➔ Shift Godan a-row vowel back to u-row (e.g. 飲ま- ➔ 飲む). For Ichidan, replace ない with る (e.g. 食べない ➔ 食べる).
                  </p>
                </div>
                <div style={{ background: 'var(--surface2)', padding: '0.75rem', borderRadius: '8px' }}>
                  <b className="jp">2. 〜ば (Hypothetical Conditional)</b>
                  <p className="muted small nomargin" style={{ marginTop: '0.2rem' }}>
                    Strip <code>ば</code> ➔ Godan e-row vowel shifts back to u-row (e.g. 行け- ➔ 行く, 読め- ➔ 読む). For Ichidan, replace れば with る (e.g. 食べれば ➔ 食べる).
                  </p>
                </div>
                <div style={{ background: 'var(--surface2)', padding: '0.75rem', borderRadius: '8px' }}>
                  <b className="jp">3. 〜れる / 〜られる (Passive &amp; Potential)</b>
                  <p className="muted small nomargin" style={{ marginTop: '0.2rem' }}>
                    Passive attaches to Godan a-row (読まれる ➔ 読む). Potential for Godan attaches to e-row + る (話せる ➔ 話す). For Ichidan, both use 〜られる (食べられる ➔ 食べる).
                  </p>
                </div>
                <div style={{ background: 'var(--surface2)', padding: '0.75rem', borderRadius: '8px' }}>
                  <b className="jp">4. 〜せる / 〜させる (Causative)</b>
                  <p className="muted small nomargin" style={{ marginTop: '0.2rem' }}>
                    Godan causative uses a-row + せる (読ませる ➔ 読む). Ichidan causative uses stem + させる (食べさせる ➔ 食べる). Causative-passive merges both (読ませられる ➔ 読む).
                  </p>
                </div>
              </div>
            </div>
          </div>
        </>
      ) : (
        <>
          {/* Transitive vs. Intransitive Interactive Drill */}
          {currentPairDrill && (
            <div className={`drill ${pairPicked ? (pairPicked === currentPairDrill.targetKind ? 'ok' : 'bad') : ''}`}>
              <div className="row-between" style={{ width: '100%' }}>
                <span className="tag">
                  🔄 自動詞 vs. 他動詞 · Pattern: {currentPairDrill.pair.patternRule}
                </span>
                <span className="muted small">
                  Drill {(pairIdx % pairDrills.length) + 1} / {pairDrills.length}
                </span>
              </div>

              <div className="jp" style={{ fontSize: '2rem', margin: '0.9rem 0 0.3rem', textAlign: 'center' }}>
                {currentPairDrill.sentenceWithBlank}
              </div>
              <div className="muted" style={{ marginBottom: '1rem' }}>
                {currentPairDrill.en}
              </div>

              <div className="controls center" style={{ gap: '0.8rem' }}>
                {(['intransitive', 'transitive'] as const).map((kind) => {
                  const v = currentPairDrill.pair[kind];
                  const isTarget = currentPairDrill.targetKind === kind;
                  const cls = !pairPicked
                    ? 'chip'
                    : isTarget
                      ? 'chip ok'
                      : pairPicked === kind
                        ? 'chip bad'
                        : 'chip';
                  return (
                    <button
                      key={kind}
                      className={cls}
                      style={{ padding: '0.7rem 1.3rem', fontSize: '1.05rem' }}
                      onClick={() => choosePairOption(kind)}
                    >
                      <b className="jp">
                        {v.kanji}（{v.kana}）
                      </b>{' '}
                      <span className="muted small">
                        [{kind === 'intransitive' ? '自動詞 · が' : '他動詞 · を'}]
                      </span>
                    </button>
                  );
                })}
              </div>

              {pairPicked && (
                <div style={{ marginTop: '0.9rem', textAlign: 'center' }}>
                  <p className={pairPicked === currentPairDrill.targetKind ? 'ok-text nomargin' : 'bad-text nomargin'}>
                    {pairPicked === currentPairDrill.targetKind ? '✓ Correct! ' : '✗ Watch the particle! '}
                    {currentPairDrill.targetKind === 'intransitive'
                      ? `Uses 自動詞 (Intransitive: ${currentPairDrill.pair.intransitive.kanji} / ${currentPairDrill.pair.intransitive.kana}) because the subject acts on its own (marked by が).`
                      : `Uses 他動詞 (Transitive: ${currentPairDrill.pair.transitive.kanji} / ${currentPairDrill.pair.transitive.kana}) because an agent acts on a direct object (marked by を).`}
                  </p>
                </div>
              )}

              <div className="controls center" style={{ marginTop: '0.9rem' }}>
                <button className="chip" onClick={() => speak(currentPairDrill.ttsKana)}>
                  🔊 Hear Sentence
                </button>
                <button
                  className={srs[`vp:${currentPairDrill.pair.id}`] ? 'chip ok' : 'chip'}
                  disabled={!!srs[`vp:${currentPairDrill.pair.id}`]}
                  onClick={() =>
                    addCard({
                      id: `vp:${currentPairDrill.pair.id}`,
                      kind: 'grammar',
                      front: `${currentPairDrill.pair.intransitive.kanji} (が) vs. ${currentPairDrill.pair.transitive.kanji} (を)`,
                      reading: `${currentPairDrill.pair.intransitive.kana} / ${currentPairDrill.pair.transitive.kana}`,
                      back: `自動詞: ${currentPairDrill.pair.intransitive.kanji} (${currentPairDrill.pair.intransitive.en}) · 他動詞: ${currentPairDrill.pair.transitive.kanji} (${currentPairDrill.pair.transitive.en})`,
                    })
                  }
                >
                  {srs[`vp:${currentPairDrill.pair.id}`] ? '✓ Pair in SRS' : '+ Add Pair to SRS'}
                </button>
                <button
                  className="chip on"
                  onClick={() => {
                    setPairPicked(null);
                    setPairIdx((i) => i + 1);
                  }}
                >
                  Next Pair Drill →
                </button>
              </div>
            </div>
          )}

          <h2>Transitive vs. Intransitive Verb Pair Matrix ({VERB_PAIRS.length} Pairs)</h2>
          <div className="story-list">
            {VERB_PAIRS.map((p) => (
              <div key={p.id} className="gp">
                <div className="row-between">
                  <span className="tag">{p.patternRule}</span>
                </div>
                <div className="two-col" style={{ marginTop: '0.5rem', gap: '1rem' }}>
                  <div
                    style={{
                      background: 'var(--surface2)',
                      padding: '0.75rem 1rem',
                      borderRadius: '10px',
                      borderLeft: '3px solid var(--ok)',
                    }}
                  >
                    <div className="row-between">
                      <b className="jp" style={{ fontSize: '1.15rem', cursor: 'pointer' }} onClick={() => speak(p.intransitive.kana)}>
                        🔊 {p.intransitive.kanji}（{p.intransitive.kana}）
                      </b>
                      <span className="tag" style={{ color: 'var(--ok)' }}>自動詞 · Subject が</span>
                    </div>
                    <div className="muted small">{p.intransitive.en}</div>
                    <p
                      className="jp small"
                      style={{ margin: '0.4rem 0 0.1rem', cursor: 'pointer' }}
                      onClick={() => speak(p.intransitive.exampleKana)}
                    >
                      🔊 {p.intransitive.exampleJp.replace(/[【】]/g, '')}
                    </p>
                    <div className="muted small">{p.intransitive.exampleEn}</div>
                  </div>

                  <div
                    style={{
                      background: 'var(--surface2)',
                      padding: '0.75rem 1rem',
                      borderRadius: '10px',
                      borderLeft: '3px solid var(--accent)',
                    }}
                  >
                    <div className="row-between">
                      <b className="jp" style={{ fontSize: '1.15rem', cursor: 'pointer' }} onClick={() => speak(p.transitive.kana)}>
                        🔊 {p.transitive.kanji}（{p.transitive.kana}）
                      </b>
                      <span className="tag">他動詞 · Object を</span>
                    </div>
                    <div className="muted small">{p.transitive.en}</div>
                    <p
                      className="jp small"
                      style={{ margin: '0.4rem 0 0.1rem', cursor: 'pointer' }}
                      onClick={() => speak(p.transitive.exampleKana)}
                    >
                      🔊 {p.transitive.exampleJp.replace(/[【】]/g, '')}
                    </p>
                    <div className="muted small">{p.transitive.exampleEn}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
