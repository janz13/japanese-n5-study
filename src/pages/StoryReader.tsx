import { useEffect, useRef, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { STORIES, type Token } from '../data/stories';
import { useStore } from '../lib/store';
import { speak, stopSpeaking } from '../lib/tts';
import { storyUnlocked } from '../lib/progress';
import { playFanfare } from '../lib/sfx';
import { useCampaignMission } from '../lib/useCampaignMission';
import CampaignBanner from '../components/CampaignBanner';

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

function Word({ tok, furigana, onTap, active }: { tok: Token; furigana: boolean; onTap: () => void; active: boolean }) {
  const cls = `word${tok.en ? ' has-gloss' : ''}${active ? ' active' : ''}`;
  if (tok.r && furigana) {
    const { prefix, base, rt, suffix } = splitFurigana(tok.t, tok.r);
    if (!prefix && !suffix) {
      return (
        <ruby className={cls} onClick={onTap}>
          {base}
          <rt>{rt}</rt>
        </ruby>
      );
    }
    return (
      <span className={cls} onClick={onTap}>
        {prefix}
        <ruby>
          {base}
          <rt>{rt}</rt>
        </ruby>
        {suffix}
      </span>
    );
  }
  return <span className={cls} onClick={onTap}>{tok.t}</span>;
}

export default function StoryReader() {
  const { id } = useParams();
  const story = STORIES.find((s) => s.id === id);
  const state = useStore();
  const { showFurigana, toggleFurigana, saveWord, srs, completeStory, ttsRate, setTtsRate } = state;
  const {
    isCampaignMode,
    stage,
    saga,
    completeMission,
    returnToCampaign,
  } = useCampaignMission();
  const [gloss, setGloss] = useState<Token | null>(null);
  const [playing, setPlaying] = useState<number | null>(null);
  const [showEn, setShowEn] = useState(false);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [forceOpen, setForceOpen] = useState(false);
  const [savedScore, setSavedScore] = useState(false);
  const campaignCompletedRef = useRef(false);

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
  if (!isCampaignMode && !forceOpen && !storyUnlocked(story.chapter, state)) {
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

  return (
    <div className="page reader">
      {isCampaignMode && stage && (
        <CampaignBanner stage={stage} saga={saga} onReturn={returnToCampaign} />
      )}
      <Link to="/stories" className="muted">← Stories</Link>
      <h1>{story.title} <span className="muted">{story.titleEn}</span></h1>
      <div className="controls">
        <button className="chip" onClick={() => (playing === null ? playFrom(0) : (stopSpeaking(), setPlaying(null)))}>
          {playing === null ? '▶ Listen' : '■ Stop'}
        </button>
        {([0.75, 0.9, 1.0] as const).map((r) => (
          <button key={r} className={ttsRate === r ? 'chip on' : 'chip'} onClick={() => setTtsRate(r)}>
            {r}x
          </button>
        ))}
        <button className={showFurigana ? 'chip on' : 'chip'} onClick={toggleFurigana}>ふりがな</button>
        <button className={showEn ? 'chip on' : 'chip'} onClick={() => setShowEn(!showEn)}>English</button>
        {unsavedWords.length > 0 && (
          <button className="chip on" onClick={addAllChapterWords}>
            + Add {unsavedWords.length} words to SRS
          </button>
        )}
      </div>

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
                  {para.map((tok, j) => (
                    <Word
                      key={j}
                      tok={tok}
                      furigana={showFurigana}
                      active={gloss === tok}
                      onTap={() => {
                        if (tok.en) {
                          setGloss(tok);
                          speak(tok.r ?? tok.t);
                        }
                      }}
                    />
                  ))}
                </p>
                {showEn && <p className="en" style={{ marginTop: '0.35rem' }}>{story.translation[i]}</p>}
              </div>
            </div>
          </div>
        ))}
      </div>

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

      <h2>理解チェック <span className="muted">Comprehension</span></h2>
      {story.questions.map((q, i) => (
        <div key={i} className="question">
          <p className="jp">{q.q}</p>
          <div className="controls">
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
