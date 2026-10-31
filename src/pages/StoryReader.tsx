import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { STORIES, type Token } from '../data/stories';
import { useStore } from '../lib/store';
import { speak, stopSpeaking } from '../lib/tts';
import { storyUnlocked } from '../lib/progress';

const plain = (tokens: Token[]) => tokens.map((t) => t.r ?? t.t).join('');

function RubyUnit({ base, rt }: { base: string; rt?: string }) {
  if (!rt) return <span>{base}</span>;
  return (
    <ruby className="ruby-pair">
      <span className="rb-text">{base}</span>
      <rp>(</rp>
      <rt>{rt}</rt>
      <rp>)</rp>
    </ruby>
  );
}

function Word({ tok, furigana, onTap, active }: { tok: Token; furigana: boolean; onTap: () => void; active: boolean }) {
  const cls = `word${tok.en ? ' has-gloss' : ''}${active ? ' active' : ''}`;
  if (furigana && tok.parts) {
    return (
      <span className={cls} onClick={onTap}>
        {tok.parts.map(([b, r], idx) => (
          <RubyUnit key={idx} base={b} rt={r} />
        ))}
      </span>
    );
  }
  if (furigana && tok.r) {
    return (
      <span className={cls} onClick={onTap}>
        <RubyUnit base={tok.t} rt={tok.r} />
      </span>
    );
  }
  return <span className={cls} onClick={onTap}>{tok.t}</span>;
}

export default function StoryReader() {
  const { id } = useParams();
  const story = STORIES.find((s) => s.id === id);
  const state = useStore();
  const { showFurigana, toggleFurigana, saveWord, savedWords, completeStory } = state;
  const [gloss, setGloss] = useState<Token | null>(null);
  const [playing, setPlaying] = useState<number | null>(null);
  const [showEn, setShowEn] = useState(false);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [forceOpen, setForceOpen] = useState(false);
  const [savedScore, setSavedScore] = useState(false);

  if (!story) return <div className="page">Story not found. <Link to="/stories">Back</Link></div>;
  if (!forceOpen && !storyUnlocked(story.chapter, state)) {
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

  const playFrom = (i: number) => {
    if (i >= story.paragraphs.length) return setPlaying(null);
    setPlaying(i);
    speak(plain(story.paragraphs[i]), 0.85, () => playFrom(i + 1));
  };

  const allAnswered = Object.keys(answers).length === story.questions.length;
  const score = Math.round(
    (story.questions.filter((q, i) => answers[i] === q.answer).length / story.questions.length) * 100,
  );

  return (
    <div className="page reader">
      <Link to="/stories" className="muted">← Stories</Link>
      <h1>{story.title} <span className="muted">{story.titleEn}</span></h1>
      <div className="controls">
        <button className="chip" onClick={() => (playing === null ? playFrom(0) : (stopSpeaking(), setPlaying(null)))}>
          {playing === null ? '▶ Listen' : '■ Stop'}
        </button>
        <button className={showFurigana ? 'chip on' : 'chip'} onClick={toggleFurigana}>ふりがな</button>
        <button className={showEn ? 'chip on' : 'chip'} onClick={() => setShowEn(!showEn)}>English</button>
      </div>

      <div className="story-body">
        {story.paragraphs.map((para, i) => (
          <div key={i} className={`para${playing === i ? ' playing' : ''}`}>
            <p className="story-line" onDoubleClick={() => speak(plain(para))}>
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
            {showEn && <p className="en">{story.translation[i]}</p>}
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
          <button className="chip" disabled={savedWords.some((w) => w.t === gloss.t)} onClick={() => saveWord(gloss)}>
            {savedWords.some((w) => w.t === gloss.t) ? '✓ Saved' : '+ Save word'}
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
            <button className="chip on" onClick={() => { completeStory(story.id, score); setSavedScore(true); }}>
              Mark complete
            </button>
          ) : (
            <Link className="chip on" to="/stories">✓ Completed — Back to Stories</Link>
          )}
        </div>
      )}
    </div>
  );
}
