import { useEffect, useRef, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { SCENES } from '../data/scenes';
import { useStore } from '../lib/store';
import { speak } from '../lib/tts';
import { listen, similarity, sttSupported } from '../lib/speech';

export function SceneList() {
  const done = useStore((s) => s.scenesDone);
  return (
    <div className="page">
      <h1>会話 <span className="muted">Speaking</span></h1>
      <p className="muted">Role-play scenes from the story. Listen, then say your line out loud.</p>
      {!sttSupported() && (
        <p className="warn">Speech recognition isn't supported in this browser (try Chrome or Edge). You can still practise by listening and rating yourself.</p>
      )}
      <div className="story-list">
        {SCENES.map((s) => (
          <Link key={s.id} to={`/speaking/${s.id}`} className="story-card">
            <span className="tag">Ch.{s.chapter}</span>
            <span className="story-title">{s.title}</span>
            <span className="muted">{s.setting}</span>
            {done[s.id] !== undefined && <span className="done">✓ {done[s.id]}%</span>}
          </Link>
        ))}
      </div>
    </div>
  );
}

const PASS_LINE = 70;

export function ScenePlayer() {
  const { id } = useParams();
  const scene = SCENES.find((s) => s.id === id);
  const completeScene = useStore((s) => s.completeScene);
  const [step, setStep] = useState(0);
  const [scores, setScores] = useState<Record<number, number>>({});
  const [heard, setHeard] = useState<string | null>(null);
  const [listening, setListening] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [showText, setShowText] = useState(true);
  const stopRef = useRef<() => void>(() => {});
  const endRef = useRef<HTMLDivElement>(null);
  const canListen = sttSupported();

  const line = scene?.lines[step];

  // NPC lines play automatically, then advance
  useEffect(() => {
    if (!line) return;
    endRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
    if (line.who === 'npc') {
      const t = setTimeout(() => speak(line.jp, 0.9, () => setTimeout(() => setStep((s) => s + 1), 400)), 300);
      return () => clearTimeout(t);
    }
  }, [step, line]);

  useEffect(() => () => stopRef.current(), []);

  if (!scene) return <div className="page">Not found. <Link to="/speaking">Back</Link></div>;

  const youLines = scene.lines.map((l, i) => (l.who === 'you' ? i : -1)).filter((i) => i >= 0);
  const finished = step >= scene.lines.length;
  const avg = youLines.length ? Math.round(youLines.reduce((a, i) => a + (scores[i] ?? 0), 0) / youLines.length) : 0;

  const record = () => {
    if (!line) return;
    setHeard(null);
    setErr(null);
    setListening(true);
    stopRef.current = listen(
      (t) => {
        setHeard(t);
        setScores((s) => ({ ...s, [step]: Math.max(s[step] ?? 0, similarity(t, [line.jp, line.kana])) }));
      },
      (e) => {
        setListening(false);
        if (e && e !== 'no-speech' && e !== 'aborted') setErr(e === 'not-allowed' ? 'Microphone permission denied.' : `Error: ${e}`);
        else if (e === 'no-speech') setErr("Didn't catch that — try again.");
      },
    );
  };

  const next = () => {
    setHeard(null);
    setErr(null);
    setStep((s) => s + 1);
  };

  const cur = scores[step];

  return (
    <div className="page">
      <Link to="/speaking" className="muted">← Speaking</Link>
      <h1>{scene.title} <span className="muted">{scene.setting}</span></h1>
      <div className="controls">
        <button className={showText ? 'chip on' : 'chip'} onClick={() => setShowText(!showText)}>Show my lines</button>
        <button className="chip" onClick={() => { setStep(0); setScores({}); setHeard(null); }}>↻ Restart</button>
      </div>

      <div className="chat">
        {scene.lines.slice(0, Math.min(step + 1, scene.lines.length)).map((l, i) => (
          <div key={i} className={`bubble ${l.who}`}>
            {l.name && <span className="tag">{l.name}</span>}
            <p className="jp" onClick={() => speak(l.jp)}>
              {l.who === 'you' && i === step && !showText ? '？？？' : l.jp}
            </p>
            <p className="muted small">{l.en}</p>
            {l.who === 'you' && scores[i] !== undefined && (
              <span className={scores[i] >= PASS_LINE ? 'ok-text small' : 'bad-text small'}>{scores[i]}%</span>
            )}
          </div>
        ))}
        <div ref={endRef} />
      </div>

      {line?.who === 'you' && (
        <div className="speak-panel">
          <div className="controls center">
            <button className="chip" onClick={() => speak(line.jp, 0.8)}>🔊 Hear it</button>
            {canListen ? (
              <button className={`mic ${listening ? 'on' : ''}`} onClick={listening ? () => stopRef.current() : record}>
                {listening ? '■' : '🎤'}
              </button>
            ) : (
              <>
                <button className="chip" onClick={() => { setScores((s) => ({ ...s, [step]: 100 })); }}>I said it ✓</button>
                <button className="chip" onClick={() => { setScores((s) => ({ ...s, [step]: 40 })); }}>Struggled</button>
              </>
            )}
            {(cur !== undefined || !canListen) && <button className="chip on" onClick={next}>Next →</button>}
          </div>
          {heard && <p className="center">Heard: <span className="jp">{heard}</span> · <b className={cur >= PASS_LINE ? 'ok-text' : 'bad-text'}>{cur}%</b></p>}
          {err && <p className="bad-text center">{err}</p>}
        </div>
      )}

      {finished && (
        <div className="result">
          <span>Scene complete · {avg}%</span>
          <button className="chip on" onClick={() => completeScene(scene.id, avg)}>Save</button>
        </div>
      )}
    </div>
  );
}
