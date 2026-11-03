import { useEffect, useRef, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { SCENES } from '../data/scenes';
import { useStore } from '../lib/store';
import { speak, stopSpeaking } from '../lib/tts';
import { listen, similarity, sttSupported } from '../lib/speech';

export function SceneList() {
  const done = useStore((s) => s.scenesDone);
  return (
    <div className="page">
      <h1>会話 <span className="muted">Speaking</span></h1>
      <p className="muted">Role-play scenes from the story. Listen, then speak or type your line.</p>
      {!sttSupported() && (
        <p className="warn">
          Microphone speech recognition isn't available in this browser — you can practise by speaking aloud and rating yourself, or by typing the response below.
        </p>
      )}
      <div className="story-list">
        {SCENES.map((s) => (
          <Link key={s.id} to={`/speaking/${s.id}`} className="story-card">
            <span className="tag">Ch.{s.chapter} · {s.level ?? 'N5'}</span>
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
  const [typed, setTyped] = useState('');
  const [listening, setListening] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [showText, setShowText] = useState(true);
  const [saved, setSaved] = useState(false);
  const stopRef = useRef<() => void>(() => {});
  const endRef = useRef<HTMLDivElement>(null);
  const canListen = sttSupported();

  const line = scene?.lines[step];

  // NPC lines play automatically and then advance; user can also click Continue at any time
  useEffect(() => {
    if (!line) return;
    endRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
    if (line.who === 'npc') {
      let active = true;
      const t = setTimeout(() => {
        speak(line.kana, 0.9, () => {
          if (active) setTimeout(() => setStep((s) => (s === step ? s + 1 : s)), 350);
        });
      }, 250);
      return () => {
        active = false;
        clearTimeout(t);
      };
    }
  }, [step, line]);

  useEffect(() => () => {
    stopRef.current();
    stopSpeaking();
  }, []);

  if (!scene) return <div className="page">Not found. <Link to="/speaking">Back</Link></div>;

  const youLines = scene.lines.map((l, i) => (l.who === 'you' ? i : -1)).filter((i) => i >= 0);
  const finished = step >= scene.lines.length;
  const avg = youLines.length ? Math.round(youLines.reduce((a, i) => a + (scores[i] ?? 0), 0) / youLines.length) : 100;

  const record = () => {
    if (!line) return;
    setHeard(null);
    setErr(null);
    setListening(true);
    stopRef.current = listen(
      (t) => {
        setHeard(t);
        setScores((s) => ({ ...s, [step]: Math.max(s[step] ?? 0, similarity(t, [line.jp, line.kana])) }));
        // Auto-play native model voice right after speech completes for auditory reinforcement
        speak(line.kana, 0.9);
      },
      (e) => {
        setListening(false);
        if (e && e !== 'no-speech' && e !== 'aborted')
          setErr(e === 'not-allowed' ? 'Microphone permission denied — use Type or "I said it ✓" below.' : `Audio: ${e}`);
        else if (e === 'no-speech') setErr("Didn't catch that — try again or use Type / 'I said it ✓'.");
      },
    );
  };

  const checkTyped = () => {
    if (!line || !typed.trim()) return;
    const sc = similarity(typed.trim(), [line.jp, line.kana]);
    setHeard(typed.trim());
    setScores((s) => ({ ...s, [step]: Math.max(s[step] ?? 0, sc) }));
    speak(line.kana, 0.85);
  };

  const next = () => {
    stopSpeaking();
    setHeard(null);
    setTyped('');
    setErr(null);
    setStep((s) => s + 1);
  };

  const selfPass = () => {
    setScores((s) => ({ ...s, [step]: Math.max(s[step] ?? 0, 100) }));
    next();
  };

  const cur = scores[step];

  return (
    <div className="page">
      <Link to="/speaking" className="muted">← Speaking</Link>
      <h1>{scene.title} <span className="muted">{scene.setting}</span></h1>
      <div className="controls">
        <button className={showText ? 'chip on' : 'chip'} onClick={() => setShowText(!showText)}>
          Show my lines
        </button>
        <button
          className="chip"
          onClick={() => {
            stopSpeaking();
            setStep(0);
            setScores({});
            setHeard(null);
            setTyped('');
            setSaved(false);
          }}
        >
          ↻ Restart
        </button>
        <span className="muted small" style={{ alignSelf: 'center' }}>
          Turn {Math.min(step + 1, scene.lines.length)} / {scene.lines.length}
        </span>
      </div>

      <div className="chat">
        {scene.lines.slice(0, Math.min(step + 1, scene.lines.length)).map((l, i) => (
          <div key={i} className={`bubble ${l.who}`}>
            {l.name && <span className="tag">{l.name}</span>}
            {l.who === 'you' && <span className="tag">You (アナ)</span>}
            <p className="jp" onClick={() => speak(l.kana)}>
              {l.who === 'you' && i === step && !showText ? '？？？' : l.jp}
            </p>
            {l.who === 'you' && showText && <p className="muted small">{l.kana}</p>}
            <p className="muted small">{l.en}</p>
            {l.who === 'you' && scores[i] !== undefined && (
              <span className={scores[i] >= PASS_LINE ? 'ok-text small' : 'bad-text small'}>Score: {scores[i]}%</span>
            )}
          </div>
        ))}
        <div ref={endRef} />
      </div>

      {line?.who === 'npc' && (
        <div className="speak-panel">
          <div className="controls center">
            <span className="muted small">🔊 {line.name ?? 'Partner'} is speaking…</span>
            <button className="chip" onClick={() => speak(line.kana, 0.9)}>🔊 Replay</button>
            <button className="chip on" onClick={next}>Continue →</button>
          </div>
        </div>
      )}

      {line?.who === 'you' && (
        <div className="speak-panel">
          <div className="controls center">
            <button className="chip" onClick={() => speak(line.kana, 0.85)}>🔊 Hear line</button>
            {canListen && (
              <button
                className={`mic ${listening ? 'on' : ''}`}
                onClick={listening ? () => stopRef.current() : record}
                title="Speak into microphone"
              >
                {listening ? '■' : '🎤'}
              </button>
            )}
            <button className="chip ok" onClick={selfPass}>
              ✓ I said it
            </button>
            <button className="chip on" onClick={next}>
              {cur !== undefined ? 'Next →' : 'Skip →'}
            </button>
          </div>

          <div className="controls center" style={{ marginTop: '0.5rem' }}>
            <input
              value={typed}
              onChange={(e) => setTyped(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && checkTyped()}
              placeholder="Or type romaji / kana here to check…"
              className="speak-input"
            />
            <button className="chip" onClick={checkTyped}>Check</button>
          </div>

          {heard && (
            <div className="center small" style={{ marginTop: '0.4rem' }}>
              <p className="nomargin">
                Matched: <span className="jp">{heard}</span> ·{' '}
                <b className={(cur ?? 0) >= PASS_LINE ? 'ok-text' : 'bad-text'}>{cur}%</b>
              </p>
              <div style={{ marginTop: '0.25rem' }}>
                <span className="tag" style={{ background: 'var(--surface2)', fontSize: '0.75rem' }}>
                  🔊 Native Model Audio Pronounced
                </span>
              </div>
            </div>
          )}
          {err && <p className="bad-text center small">{err}</p>}
        </div>
      )}

      {finished && (
        <div className="result">
          <span>Scene complete · Average score: {avg}%</span>
          {!saved ? (
            <button className="chip on" onClick={() => { completeScene(scene.id, avg); setSaved(true); }}>
              Save progress
            </button>
          ) : (
            <Link className="chip on" to="/speaking">✓ Saved — Back to scenes</Link>
          )}
        </div>
      )}
    </div>
  );
}
