import { useEffect, useMemo, useRef, useState } from 'react';
import { toHiragana } from 'wanakana';
import {
  CONJUGATIONS,
  FORM_LABELS,
  GROUP_LABELS,
  type ConjForm,
  type ConjugatableWord,
  type WordGroup,
} from '../data/conjugations';
import { useStore } from '../lib/store';
import { speak } from '../lib/tts';

const ALL_GROUPS: WordGroup[] = ['ichidan', 'godan', 'irregular', 'i-adj', 'na-adj'];
const ALL_FORMS: ConjForm[] = ['polite', 'te', 'negative', 'past', 'politePast'];

interface PromptItem {
  word: ConjugatableWord;
  form: ConjForm;
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
  const { srs, addCard } = useStore();
  const [groups, setGroups] = useState<WordGroup[]>(ALL_GROUPS);
  const [forms, setForms] = useState<ConjForm[]>(['polite', 'te', 'negative', 'past']);
  const [current, setCurrent] = useState<PromptItem | null>(null);
  const [input, setInput] = useState('');
  const [flash, setFlash] = useState<'ok' | 'bad' | null>(null);
  const [reveal, setReveal] = useState<string | null>(null);
  const [showHint, setShowHint] = useState(false);
  const [session, setSession] = useState({ ok: 0, total: 0 });
  const inputRef = useRef<HTMLInputElement>(null);

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

  return (
    <div className="page">
      <h1>活用道場 <span className="muted">Conjugation Dojo</span></h1>
      <p className="muted">
        Transform dictionary verbs and adjectives into polite, 〜て, negative, and past forms. Type romaji, kana, or kanji.
      </p>

      <div className="controls">
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
          <div className="muted" style={{ marginBottom: '0.8rem' }}>{current.word.en}</div>

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
    </div>
  );
}
