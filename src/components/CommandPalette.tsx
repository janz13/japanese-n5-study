import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toHiragana, toKatakana } from 'wanakana';
import { KANJI } from '../data/kanji';
import { LESSONS } from '../data/grammar';
import { COUNTERS } from '../data/counters';
import { VERB_PAIRS } from '../data/verbPairs';
import { ONOMATOPOEIA } from '../data/onomatopoeia';
import { PITCH_PAIRS } from '../data/pitchAccent';
import { STORIES } from '../data/stories';
import { SIGNS } from '../data/signs';
import { TICKET_BUTTONS } from '../data/shokkenki';
import { CONJUGATIONS } from '../data/conjugations';
import { useStore, type CardKind } from '../lib/store';
import { speak } from '../lib/tts';

type SearchCategory =
  | 'Module'
  | 'Kanji'
  | 'Vocab'
  | 'Grammar'
  | 'Sign & Menu'
  | 'Counter'
  | 'Verb Pair'
  | 'Sound Word'
  | 'Pitch Accent';

interface SearchEntry {
  id: string;
  category: SearchCategory;
  jp: string;
  reading: string;
  en: string;
  to: string;
  tts?: string;
  srsKind?: CardKind;
}

const MODULE_ENTRIES: SearchEntry[] = [
  { id: 'm-bento', category: 'Module', jp: '今日の弁当', reading: 'Daily Bento', en: '5-minute guided daily workout', to: '/bento' },
  { id: 'm-drive', category: 'Module', jp: 'ドライブ・モード', reading: 'Hands-Free Drive Podcast', en: 'Eyes-free Pimsleur shadowing & JLPT drama', to: '/drive' },
  { id: 'm-exam', category: 'Module', jp: '日本語能力試験', reading: 'Official JLPT Exam Simulator', en: '67-Q Full & 15-Q Express non-repeating N5/N4 mock exam', to: '/exam' },
  { id: 'm-review', category: 'Module', jp: '復習 FSRS', reading: 'Spaced Repetition Review', en: 'Recognition, Recall Typing, Audio-Only & Deck Browser', to: '/review' },
  { id: 'm-kana', category: 'Module', jp: 'かな道場', reading: 'Kana Dojo', en: '208 Hiragana & Katakana typing and Yōon drills', to: '/kana' },
  { id: 'm-kanji', category: 'Module', jp: '漢字スタジオ', reading: 'Kanji Studio', en: '150 N5 & N4 Kanji with Radicals, Mnemonics & TraceCanvas', to: '/kanji' },
  { id: 'm-conj', category: 'Module', jp: '活用・自他動詞道場', reading: 'Verb, Adj & Pair Dojo', en: 'Conjugations & 12 Transitive/Intransitive (自動詞・他動詞) pairs', to: '/conjugate' },
  { id: 'm-count', category: 'Module', jp: '助数詞道場', reading: 'Counter & Date Dojo', en: '51 counters & calendar dates with sound-change traps', to: '/counters' },
  { id: 'm-part', category: 'Module', jp: '助詞・擬音語道場', reading: 'Particle & Onomatopoeia Dojo', en: 'は vs が, に vs で & 12 sound words (ペコペコ, ゴロゴロ)', to: '/particles' },
  { id: 'm-gram', category: 'Module', jp: '文法レッスン', reading: 'Grammar Lessons (g1–g10)', en: '10 N5 & N4 lessons including Conditionals & Keigo', to: '/grammar' },
  { id: 'm-story', category: 'Module', jp: '物語リーダー', reading: 'Graded Stories (Ch.1–10)', en: '10 chapters with furigana, karaoke TTS & quizzes', to: '/stories' },
  { id: 'm-speak', category: 'Module', jp: '会話ロールプレイ', reading: 'Speaking Scenarios (s1–s10)', en: '10 situational conversations from cafés to Keigo concierges', to: '/speaking' },
  { id: 'm-listen', category: 'Module', jp: '聴解・高低アクセント', reading: 'Listening & Pitch Accent', en: 'Multi-voice JLPT dialogues & Tokyo Pitch Accent SVG contours', to: '/listening' },
  { id: 'm-signs', category: 'Module', jp: '看板・食券機', reading: 'Sign Decoder & Ramen Ticket Machine', en: '18 street signs & 14-button Ramen Shokkenki simulator', to: '/signs' },
  { id: 'm-stamps', category: 'Module', jp: '御朱印・駅スタンプ帳', reading: 'Stamp Book', en: '8 vermilion Goshuin & Eki-stamps', to: '/stamps' },
];

export default function CommandPalette({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const navigate = useNavigate();
  const { srs, addCard } = useStore();
  const [query, setQuery] = useState('');
  const [catFilter, setCatFilter] = useState<'all' | SearchCategory>('all');
  const [selectedIdx, setSelectedIdx] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) {
      setQuery('');
      setSelectedIdx(0);
      setTimeout(() => inputRef.current?.focus(), 20);
    }
  }, [open]);

  const allEntries = useMemo<SearchEntry[]>(() => {
    const list: SearchEntry[] = [...MODULE_ENTRIES];

    for (const k of KANJI) {
      list.push({
        id: `k:${k.k}`,
        category: 'Kanji',
        jp: `${k.k}（${k.ex.w}）`,
        reading: `${k.on} · ${k.kun} (${k.ex.r})`,
        en: `${k.meaning} — Ex: ${k.ex.w} (${k.ex.en}) [${k.level} · ${k.strokes}画]`,
        to: `/kanji/${k.k}`,
        tts: k.ex.r,
        srsKind: 'kanji',
      });
    }

    // Story Vocabulary (きっぷ, 駅弁, お守り, 温泉, お土産, etc.)
    const seenStoryWords = new Set<string>();
    for (const story of STORIES) {
      for (const para of story.paragraphs) {
        for (const tok of para) {
          if (!tok.en || seenStoryWords.has(tok.t)) continue;
          seenStoryWords.add(tok.t);
          const reading = tok.r ?? tok.t;
          list.push({
            id: `w:${tok.t}`,
            category: 'Vocab',
            jp: tok.t,
            reading: `${reading} · Ch.${story.chapter}`,
            en: `${tok.en} (Story Ch.${story.chapter}: ${story.titleEn})`,
            to: `/stories/${story.id}`,
            tts: reading,
            srsKind: 'word',
          });
        }
      }
    }

    // Conjugatable Verbs & Adjectives (including te-form, negative, past)
    for (const cw of CONJUGATIONS) {
      const allFormsKana = Object.values(cw.forms)
        .map((f) => `${f.kanji} (${f.kana} / ${f.romaji})`)
        .join(' · ');
      list.push({
        id: `conj:${cw.id}`,
        category: 'Vocab',
        jp: cw.dict,
        reading: cw.reading,
        en: `${cw.en} — Forms: ${allFormsKana}`,
        to: '/conjugate',
        tts: cw.reading,
        srsKind: 'word',
      });
    }

    // Real-World Signage & Ramen Ticket Machine Buttons (大盛り, 飲み放題, 替玉, etc.)
    for (const sg of SIGNS) {
      list.push({
        id: `sign:${sg.id}`,
        category: 'Sign & Menu',
        jp: sg.sign,
        reading: sg.reading,
        en: `${sg.options[sg.answer]} — ${sg.note} (${sg.place})`,
        to: '/signs',
        tts: sg.reading,
        srsKind: 'word',
      });
    }

    for (const btn of TICKET_BUTTONS) {
      list.push({
        id: `shokken:${btn.id}`,
        category: 'Sign & Menu',
        jp: btn.kanji,
        reading: btn.kana,
        en: `${btn.en} (¥${btn.price} · Ramen Ticket Machine)`,
        to: '/signs',
        tts: btn.kana,
        srsKind: 'word',
      });
    }

    for (const les of LESSONS) {
      for (const pt of les.points) {
        list.push({
          id: `g:${pt.pattern}`,
          category: 'Grammar',
          jp: pt.pattern,
          reading: les.title,
          en: `${pt.meaning} — ${pt.explain}`,
          to: `/grammar/${les.id}`,
          tts: pt.examples[0]?.audio ?? pt.examples[0]?.jp,
          srsKind: 'grammar',
        });
      }
    }

    for (const c of COUNTERS) {
      list.push({
        id: `cnt:${c.id}`,
        category: 'Counter',
        jp: c.kanji,
        reading: `${c.kana} (${c.romaji})`,
        en: `${c.en} — ${c.rule}`,
        to: '/counters',
        tts: c.kana,
        srsKind: 'word',
      });
    }

    for (const vp of VERB_PAIRS) {
      list.push({
        id: `vp:${vp.id}`,
        category: 'Verb Pair',
        jp: `${vp.intransitive.kanji} (が) ↔ ${vp.transitive.kanji} (を)`,
        reading: `${vp.intransitive.kana} / ${vp.transitive.kana}`,
        en: `Intransitive: ${vp.intransitive.en} · Transitive: ${vp.transitive.en} (${vp.patternRule})`,
        to: '/conjugate',
        tts: `${vp.intransitive.kana}、${vp.transitive.kana}`,
        srsKind: 'grammar',
      });
    }

    for (const ono of ONOMATOPOEIA) {
      list.push({
        id: `ono:${ono.id}`,
        category: 'Sound Word',
        jp: ono.word,
        reading: ono.kana,
        en: `${ono.meaning} — ${ono.vibeNote}`,
        to: '/particles',
        tts: ono.audio,
        srsKind: 'word',
      });
    }

    for (const pp of PITCH_PAIRS) {
      list.push({
        id: `pitch:${pp.id}`,
        category: 'Pitch Accent',
        jp: `${pp.wordA.kanji} [1] vs. ${pp.wordB.kanji} [0/2]`,
        reading: pp.reading,
        en: `${pp.wordA.en} (${pp.wordA.patternName}) vs. ${pp.wordB.en} (${pp.wordB.patternName})`,
        to: '/listening',
        tts: pp.wordA.sentenceTts,
        srsKind: 'word',
      });
    }

    return list;
  }, []);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    const hira = q && /^[a-z-]+$/.test(q) ? toHiragana(q) : '';
    const kata = q && /^[a-z-]+$/.test(q) ? toKatakana(q) : '';

    return allEntries
      .filter((e) => {
        if (catFilter !== 'all' && e.category !== catFilter) return false;
        if (!q) return true;
        const hay = `${e.jp} ${e.reading} ${e.en}`.toLowerCase();
        if (hay.includes(q)) return true;
        if (hira && hay.includes(hira)) return true;
        if (kata && hay.includes(kata)) return true;
        return false;
      })
      .slice(0, 35);
  }, [allEntries, query, catFilter]);

  if (!open) return null;

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 200,
        background: 'rgba(10, 11, 18, 0.72)',
        backdropFilter: 'blur(6px)',
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'center',
        padding: '3.5rem 1rem 1rem',
      }}
      onClick={onClose}
    >
      <div
        className="gp"
        style={{
          width: '100%',
          maxWidth: '700px',
          margin: 0,
          padding: '1rem 1.2rem',
          boxShadow: '0 18px 50px #0009',
          border: '1px solid var(--accent)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="row-between" style={{ gap: '0.6rem' }}>
          <input
            ref={inputRef}
            type="search"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelectedIdx(0);
            }}
            onKeyDown={(e) => {
              if (e.key === 'Escape') {
                onClose();
              } else if (e.key === 'ArrowDown') {
                e.preventDefault();
                setSelectedIdx((i) => (results.length ? (i + 1) % results.length : 0));
              } else if (e.key === 'ArrowUp') {
                e.preventDefault();
                setSelectedIdx((i) => (results.length ? (i - 1 + results.length) % results.length : 0));
              } else if (e.key === 'Enter' && results[selectedIdx]) {
                navigate(results[selectedIdx].to);
                onClose();
              }
            }}
            placeholder={`Search ${allEntries.length}+ Kanji, Vocab, Grammar, Signs, or romaji (kippu, omamori, oomori, taberu)…`}
            className="search-input"
            style={{ width: '100%' }}
          />
          <button className="chip" onClick={onClose}>
            ✕ Esc
          </button>
        </div>

        <div className="controls" style={{ marginTop: '0.6rem', marginBottom: '0.5rem' }}>
          {(
            [
              'all',
              'Kanji',
              'Vocab',
              'Grammar',
              'Sign & Menu',
              'Counter',
              'Verb Pair',
              'Sound Word',
              'Pitch Accent',
              'Module',
            ] as const
          ).map((c) => (
            <button
              key={c}
              className={catFilter === c ? 'chip on' : 'chip'}
              style={{ padding: '0.22rem 0.65rem', fontSize: '0.76rem' }}
              onClick={() => {
                setCatFilter(c);
                setSelectedIdx(0);
              }}
            >
              {c === 'all' ? `All (${allEntries.length})` : c}
            </button>
          ))}
        </div>

        <div
          style={{
            maxHeight: '58vh',
            overflowY: 'auto',
            display: 'grid',
            gap: '0.4rem',
            marginTop: '0.4rem',
          }}
        >
          {results.map((r, idx) => {
            const inSrs = !!srs[r.id];
            const isSelected = idx === selectedIdx;
            return (
              <div
                key={r.id}
                className="row-between"
                style={{
                  background: 'var(--surface2)',
                  padding: '0.55rem 0.85rem',
                  borderRadius: '10px',
                  cursor: 'pointer',
                  border: isSelected ? '1px solid var(--accent)' : '1px solid transparent',
                }}
                onMouseEnter={() => setSelectedIdx(idx)}
                onClick={() => {
                  navigate(r.to);
                  onClose();
                }}
              >
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', flexWrap: 'wrap' }}>
                    <span className="tag" style={{ fontSize: '0.72rem' }}>{r.category}</span>
                    <b className="jp" style={{ fontSize: '1.08rem' }}>{r.jp}</b>
                    <span className="muted small jp">{r.reading}</span>
                  </div>
                  <div className="muted small">{r.en}</div>
                </div>
                <div className="controls nomargin" onClick={(e) => e.stopPropagation()}>
                  {r.tts && (
                    <button
                      type="button"
                      className="chip"
                      style={{ padding: '0.2rem 0.55rem', fontSize: '0.76rem' }}
                      onClick={() => speak(r.tts!)}
                      title="Listen to pronunciation"
                    >
                      🔊
                    </button>
                  )}
                  {r.srsKind && (
                    <button
                      type="button"
                      className={inSrs ? 'chip ok' : 'chip'}
                      style={{ padding: '0.2rem 0.55rem', fontSize: '0.74rem' }}
                      disabled={inSrs}
                      onClick={() =>
                        addCard({
                          id: r.id,
                          kind: r.srsKind!,
                          front: r.jp.split('（')[0],
                          reading: r.reading.split(' · ')[0],
                          back: r.en,
                        })
                      }
                    >
                      {inSrs ? '✓ SRS' : '+ SRS'}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
          {results.length === 0 && (
            <p className="muted center small" style={{ padding: '1.2rem 0' }}>
              No matching kanji, vocabulary, grammar, sign, or module found.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
