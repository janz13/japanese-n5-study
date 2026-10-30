import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { STORIES, type Token } from '../data/stories';
import { useStore } from '../lib/store';
import { speak, stopSpeaking } from '../lib/tts';
import { storyUnlocked } from '../lib/progress';

const plain = (tokens: Token[]) => tokens.map((t) => t.r ?? t.t).join('');

function Word({ tok, furigana, onTap, active }: { tok: Token; furigana: boolean; onTap: () => void; active: boolean }) {
  const cls = `word${tok.en ? ' has-gloss' : ''}${active ? ' active' : ''}`;
  if (tok.r && furigana)
    return <ruby className={cls} onClick={onTap}>{tok.t}<rt>{tok.r}</rt></ruby>;
  return <span className={cls} onClick={onTap}>{tok.t}</span>;
}

export default function StoryReader() {
  const { id } = useParams();
  const story = STORIES.find((s) => s.id === id);
  const { showFurigana, toggleFurigana, saveWord, savedWords, completeStory } = useStore();
  const [gloss, setGloss] = useState<Token | null>(null);
  const [playing, setPlaying] = useState<number | null>(null);
  const [showEn, setShowEn] = useState(false);
  const [answers, setAnswers] = useState<Record<number, number>>({});

  if (!story) return <div className="page">Story not found. <Link to="/stories">Back</Link></div>;
  if (!storyUnlocked(story.chapter, useStore.getState()))
    return <div className="page">🔒 Locked. Pass <Link className="link" to="/grammar">grammar lesson {story.chapter}</Link> first.</div>;

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
            <p onDoubleClick={() => speak(plain(para))}>
              {para.map((tok, j) => (
                <Word key={j} tok={tok} furigana={showFurigana} active={gloss === tok}
                  onTap={() => { if (tok.en) { setGloss(tok); speak(tok.r ?? tok.t); } }} />
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
                <button key={j} className={cls} disabled={answers[i] !== undefined}
                  onClick={() => setAnswers((a) => ({ ...a, [i]: j }))}>{o}</button>
              );
            })}
          </div>
        </div>
      ))}
      {allAnswered && (
        <div className="result">
          Score: {score}%{' '}
          <button className="chip on" onClick={() => completeStory(story.id, score)}>Mark complete</button>
        </div>
      )}
    </div>
  );
}
