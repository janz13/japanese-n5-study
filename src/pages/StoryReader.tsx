import { useEffect, useRef, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { type Token, type FuriganaMode } from '../data/stories';
import { useStore } from '../lib/store';
import { speak, stopSpeaking } from '../lib/tts';
import { storyUnlocked } from '../lib/progress';
import { playFanfare } from '../lib/sfx';
import { useCampaignMission } from '../lib/useCampaignMission';
import CampaignBanner from '../components/CampaignBanner';
import { findStory } from '../lib/findStory';

export type ReaderMode = 'standard' | 'blind_audio';

const plain = (tokens: Token[]) => tokens.map((t) => t.r ?? t.t).join('');

const isKana = (ch: string) => {
  const c = ch.charCodeAt(0);
  return (c >= 0x3040 && c <= 0x309f) || (c >= 0x30a0 && c <= 0x30ff);
};

function splitFurigana(t: string, r: string) {
  let p = 0;
  while (p < t.length && p < r.length && t[p] === r[p] && isKana(t[p])) p++;
  let s = 0;
  while (
    s < t.length - p &&
    s < r.length - p &&
    t[t.length - 1 - s] === r[r.length - 1 - s] &&
    isKana(t[t.length - 1 - s])
  ) {
    s++;
  }
  const prefix = t.slice(0, p);
  const suffix = s > 0 ? t.slice(t.length - s) : '';
  const base = t.slice(p, t.length - s);
  const rt = r.slice(p, r.length - s);
  return { prefix, base: base || t, rt: base ? rt : r, suffix: base ? suffix : '' };
}

function Word({
  tok,
  furiganaMode,
  isTapped,
  onTapWord,
  active,
}: {
  tok: Token;
  furiganaMode: FuriganaMode;
  isTapped: boolean;
  onTapWord: () => void;
  active: boolean;
}) {
  const cls = `word${tok.en ? ' has-gloss' : ''}${active ? ' active' : ''}`;

  if (!tok.r || furiganaMode === 'none') {
    return (
      <span className={cls} onClick={onTapWord}>
        {tok.t}
      </span>
    );
  }

  const { prefix, base, rt, suffix } = splitFurigana(tok.t, tok.r);
  const showRuby = furiganaMode === 'all' || isTapped;

  const rubyElement = (
    <ruby>
      {base}
      <rt
        style={{
          visibility: showRuby ? 'visible' : 'hidden',
          opacity: showRuby ? 1 : 0,
          transition: 'opacity 0.2s ease',
          userSelect: 'none',
        }}
      >
        {rt}
      </rt>
    </ruby>
  );

  if (!prefix && !suffix) {
    return (
      <span className={cls} onClick={onTapWord}>
        {rubyElement}
      </span>
    );
  }

  return (
    <span className={cls} onClick={onTapWord}>
      {prefix}
      {rubyElement}
      {suffix}
    </span>
  );
}

export default function StoryReader() {
  const { id } = useParams();
  const story = findStory(id);
  const state = useStore();
  const {
    saveWord,
    srs,
    completeStory,
    ttsRate,
    setTtsRate,
    cycleFuriganaMode,
  } = state;
  const furiganaMode: FuriganaMode = state.furiganaMode ?? (state.showFurigana ? 'all' : 'none');

  const {
    isCampaignMode,
    stage,
    saga,
    completeMission,
    returnToCampaign,
  } = useCampaignMission();

  const [readerMode, setReaderMode] = useState<ReaderMode>('standard');
  const [blindRevealed, setBlindRevealed] = useState(false);
  const [tappedFurigana, setTappedFurigana] = useState<Set<string>>(new Set());

  const [gloss, setGloss] = useState<Token | null>(null);
  const [playing, setPlaying] = useState<number | null>(null);
  const [showEn, setShowEn] = useState(false);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [forceOpen, setForceOpen] = useState(false);
  const [savedScore, setSavedScore] = useState(false);
  const campaignCompletedRef = useRef(false);

  const isAlreadyCompleted = story ? state.completedStories[story.id] !== undefined : false;
  const allAnswered = story ? Object.keys(answers).length === story.questions.length : false;
  const score = story && story.questions.length > 0
    ? Math.round(
        (story.questions.filter((q, i) => answers[i] === q.answer).length / story.questions.length) * 100,
      )
    : 0;

  useEffect(() => {
    if (isCampaignMode && allAnswered && !campaignCompletedRef.current) {
      campaignCompletedRef.current = true;
      completeMission();
      if (state.sfxEnabled) playFanfare();
    }
  }, [isCampaignMode, allAnswered, completeMission, state.sfxEnabled]);

  if (!story) return <div className="page">Story not found. <Link to="/stories">Back</Link></div>;
  if (!isCampaignMode && !forceOpen && !isAlreadyCompleted && !storyUnlocked(story.chapter, state)) {
    return (
      <div className="page">
        <p>
          🔒 This chapter unlocks after passing <Link className="link" to={`/grammar/g${story.chapter}`}>Grammar Lesson {story.chapter}</Link>.
        </p>
        <div className="controls">
          <Link className="chip on" to={`/grammar/g${story.chapter}`}>Go to Grammar Lesson {story.chapter} →</Link>
          <button className="chip" onClick={() => setForceOpen(true)}>Read anyway</button>
        </div>
      </div>
    );
  }

  const chapterWords = story.paragraphs.flatMap((p) => p.filter((t) => t.en));
  const unsavedWords = chapterWords.filter((w) => !srs[`w:${w.t}`]);
  const addAllChapterWords = () => chapterWords.forEach((w) => saveWord(w));

  const playFrom = (i: number) => {
    if (i >= story.paragraphs.length) return setPlaying(null);
    setPlaying(i);
    speak(plain(story.paragraphs[i]), ttsRate, () => playFrom(i + 1));
  };

  const playSentence = (i: number) => {
    stopSpeaking();
    if (playing === i) {
      setPlaying(null);
      return;
    }
    setPlaying(i);
    speak(plain(story.paragraphs[i]), ttsRate, () => setPlaying(null));
  };

  const toggleTapWord = (key: string, tok: Token) => {
    setTappedFurigana((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
    if (tok.en) {
      setGloss(tok);
      speak(tok.r ?? tok.t);
    }
  };

  const handleModeSwitch = (mode: ReaderMode) => {
    stopSpeaking();
    setPlaying(null);
    setReaderMode(mode);
    if (mode === 'blind_audio') {
      setBlindRevealed(false);
    }
  };

  const isMasked = readerMode === 'blind_audio' && !blindRevealed;

  return (
    <div className="page reader">
      {isCampaignMode && stage && (
        <CampaignBanner stage={stage} saga={saga} onReturn={returnToCampaign} />
      )}
      <Link to="/stories" className="muted">← Stories</Link>
      <h1>{story.title} <span className="muted">{story.titleEn}</span></h1>

      {/* Reader Mode Tabs */}
      <div className="reader-tabs" style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
        <button
          type="button"
          className={readerMode === 'standard' ? 'chip on' : 'chip'}
          onClick={() => handleModeSwitch('standard')}
        >
          📖 Standard Reading
        </button>
        <button
          type="button"
          className={readerMode === 'blind_audio' ? 'chip on' : 'chip'}
          onClick={() => handleModeSwitch('blind_audio')}
        >
          🎧 Blind Audio-First Mode
        </button>
      </div>

      <div className="controls" style={{ flexWrap: 'wrap', gap: '0.4rem' }}>
        <button className="chip" onClick={() => (playing === null ? playFrom(0) : (stopSpeaking(), setPlaying(null)))}>
          {playing === null ? '▶ Listen All' : '■ Stop'}
        </button>
        {([0.75, 0.9, 1.0] as const).map((r) => (
          <button key={r} className={ttsRate === r ? 'chip on' : 'chip'} onClick={() => setTtsRate(r)}>
            {r}x
          </button>
        ))}

        {/* Dynamic Tri-State Furigana Toggle */}
        <button
          type="button"
          className="chip on"
          onClick={cycleFuriganaMode}
          title="Cycle Furigana: All -> Tap-to-Reveal -> None"
        >
          ふりがな: {furiganaMode === 'all' ? '全 (All)' : furiganaMode === 'tap' ? '押 (Tap)' : '無 (None)'}
        </button>

        <button className={showEn ? 'chip on' : 'chip'} onClick={() => setShowEn(!showEn)}>English</button>
        {unsavedWords.length > 0 && (
          <button className="chip on" onClick={addAllChapterWords}>
            + Add {unsavedWords.length} words to SRS
          </button>
        )}
      </div>

      {/* Blind Audio-First Callout Banner */}
      {isMasked && (
        <div
          className="blind-banner"
          style={{
            background: 'rgba(56, 189, 248, 0.12)',
            border: '1px solid rgba(56, 189, 248, 0.35)',
            borderRadius: '10px',
            padding: '0.85rem 1.1rem',
            margin: '1rem 0',
          }}
        >
          <div style={{ fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--accent)' }}>
            <span>🎧</span>
            <span>Blind Audio-First Immersion</span>
          </div>
          <p style={{ margin: '0.35rem 0 0.65rem 0', fontSize: '0.9rem', color: 'var(--text-muted)' }}>
            Story text is hidden to train pure auditory discrimination. Listen line-by-line or play the full story, attempt the comprehension checks, and reveal the transcript when ready!
          </p>
          <div style={{ display: 'flex', gap: '0.6rem', flexWrap: 'wrap' }}>
            <button
              type="button"
              className="chip on"
              onClick={() => playFrom(0)}
            >
              ▶ Play Full Story
            </button>
            <button
              type="button"
              className="chip"
              onClick={() => setBlindRevealed(true)}
            >
              👁️ Reveal Story Text & Shadowing
            </button>
          </div>
        </div>
      )}

      {/* Story Paragraphs / Masked Lines */}
      <div className="story-body">
        {story.paragraphs.map((para, i) => (
          <div key={i} className={`para${playing === i ? ' playing' : ''}`} style={{ marginBottom: '1.1rem' }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.65rem' }}>
              <button
                type="button"
                className="chip sentence-play-btn"
                style={{
                  padding: '0.2rem 0.55rem',
                  fontSize: '0.85rem',
                  flexShrink: 0,
                  marginTop: '0.15rem',
                  background: playing === i ? 'var(--accent)' : 'var(--surface2)',
                  color: playing === i ? '#000' : 'inherit',
                  borderRadius: '6px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  border: playing === i ? '1px solid var(--accent)' : '1px solid var(--border)',
                }}
                onClick={() => playSentence(i)}
                title="Listen to / Shadow this line"
              >
                {playing === i ? '🔊' : '▶'}
              </button>

              <div style={{ flex: 1 }}>
                {isMasked ? (
                  <div
                    style={{
                      padding: '0.55rem 0.85rem',
                      borderRadius: '6px',
                      background: playing === i ? 'rgba(56, 189, 248, 0.15)' : 'var(--surface2)',
                      border: '1px dashed var(--border)',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      userSelect: 'none',
                    }}
                    onClick={() => playSentence(i)}
                  >
                    <span style={{ filter: 'blur(5px)', opacity: 0.5 }}>
                      わたしは日本語をべんきょうしています。
                    </span>
                    <span style={{ fontSize: '0.82rem', color: 'var(--accent)', fontWeight: 600 }}>
                      {playing === i ? '🔊 Playing Audio...' : `🎧 Line ${i + 1} (Tap to Listen)`}
                    </span>
                  </div>
                ) : (
                  <>
                    <p
                      className="story-line"
                      style={{ cursor: 'pointer', margin: 0 }}
                      onClick={(e) => {
                        const target = e.target as HTMLElement;
                        if (!target.closest('.word.has-gloss')) {
                          playSentence(i);
                        }
                      }}
                      title="Click to replay & shadow this sentence"
                    >
                      {para.map((tok, j) => {
                        const wordKey = `${i}-${j}`;
                        return (
                          <Word
                            key={j}
                            tok={tok}
                            furiganaMode={furiganaMode}
                            isTapped={tappedFurigana.has(wordKey)}
                            active={gloss === tok}
                            onTapWord={() => toggleTapWord(wordKey, tok)}
                          />
                        );
                      })}
                    </p>
                    {showEn && <p className="en" style={{ marginTop: '0.35rem' }}>{story.translation[i]}</p>}
                  </>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Post-Reveal Button for Blind Mode */}
      {isMasked && (
        <div style={{ textAlign: 'center', margin: '1.25rem 0' }}>
          <button
            type="button"
            className="chip on"
            style={{ padding: '0.55rem 1.25rem', fontSize: '0.95rem', fontWeight: 700 }}
            onClick={() => setBlindRevealed(true)}
          >
            👁️ Reveal Story Transcript & Vocabulary Notes
          </button>
        </div>
      )}

      {gloss && (
        <div className="gloss">
          <div>
            <b className="jp">{gloss.t}</b>
            {gloss.r && <span className="muted"> ({gloss.r})</span>}
            <div>{gloss.en}</div>
          </div>
          <button className="chip" disabled={!!srs[`w:${gloss.t}`]} onClick={() => saveWord(gloss)}>
            {srs[`w:${gloss.t}`] ? '✓ In SRS' : '+ Add to SRS'}
          </button>
          <button className="chip" onClick={() => setGloss(null)}>✕</button>
        </div>
      )}

      {/* Vocabulary Notes Drawer */}
      {story.vocabularyNotes && story.vocabularyNotes.length > 0 && !isMasked && (
        <div
          className="vocab-notes"
          style={{
            marginTop: '1.5rem',
            padding: '1rem',
            background: 'var(--surface2)',
            borderRadius: '10px',
            border: '1px solid var(--border)',
          }}
        >
          <h3 style={{ margin: '0 0 0.75rem 0', fontSize: '1.05rem' }}>
            単語ノート <span className="muted">Vocabulary Notes</span>
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(210px, 1fr))', gap: '0.6rem' }}>
            {story.vocabularyNotes.map((vn, idx) => (
              <div
                key={idx}
                style={{
                  padding: '0.5rem 0.65rem',
                  background: 'var(--surface)',
                  border: '1px solid var(--border)',
                  borderRadius: '6px',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <b className="jp" style={{ fontSize: '1rem' }}>{vn.word}</b>
                  {vn.jlpt && <span className="tag" style={{ fontSize: '0.7rem' }}>{vn.jlpt}</span>}
                </div>
                {vn.reading && <span className="muted small">（{vn.reading}）</span>}
                <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
                  {vn.meaning}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <h2>理解チェック <span className="muted">Comprehension</span></h2>
      {story.questions.map((q, i) => (
        <div key={i} className="question" style={{ marginBottom: '1.25rem' }}>
          <p className="jp" style={{ fontWeight: 600 }}>{q.q}</p>
          <div className="controls" style={{ flexWrap: 'wrap', gap: '0.4rem' }}>
            {q.options.map((o, j) => {
              const chosen = answers[i] === j;
              const cls = answers[i] === undefined ? 'chip' : j === q.answer ? 'chip ok' : chosen ? 'chip bad' : 'chip';
              return (
                <button
                  key={j}
                  className={cls}
                  disabled={answers[i] !== undefined}
                  onClick={() => setAnswers((a) => ({ ...a, [i]: j }))}
                >
                  {o}
                </button>
              );
            })}
          </div>
          {answers[i] !== undefined && q.explain && (
            <div style={{ fontSize: '0.84rem', color: 'var(--text-muted)', marginTop: '0.4rem' }}>
              💡 {q.explain}
            </div>
          )}
        </div>
      ))}

      {allAnswered && (
        <div className="result">
          <span>Score: {score}%</span>
          {!savedScore ? (
            <button
              className="chip on"
              onClick={() => {
                completeStory(story.id, score);
                setSavedScore(true);
                if (isCampaignMode) {
                  completeMission();
                }
              }}
            >
              Mark complete
            </button>
          ) : (
            <div style={{ display: 'inline-flex', gap: '0.6rem', flexWrap: 'wrap', alignItems: 'center' }}>
              {isCampaignMode && (
                <button
                  type="button"
                  className="chip on"
                  style={{
                    background: 'var(--accent)',
                    color: '#000',
                    fontWeight: 700,
                    cursor: 'pointer',
                  }}
                  onClick={returnToCampaign}
                >
                  🗺️ Return to Campaign Map →
                </button>
              )}
              <Link className={isCampaignMode ? 'chip' : 'chip on'} to="/stories">
                ✓ Completed — Back to Stories
              </Link>
            </div>
          )}

          {isCampaignMode && !savedScore && (
            <button
              type="button"
              className="chip on"
              style={{
                marginLeft: '0.6rem',
                background: 'var(--accent)',
                color: '#000',
                fontWeight: 700,
                cursor: 'pointer',
              }}
              onClick={returnToCampaign}
            >
              🗺️ Return to Campaign Map →
            </button>
          )}
        </div>
      )}
    </div>
  );
}
