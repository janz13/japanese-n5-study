import { useEffect, useMemo, useRef, useState } from 'react';
import { SCENES } from '../data/scenes';
import { LISTENING } from '../data/listening';
import { LESSONS } from '../data/grammar';
import { useStore } from '../lib/store';
import { speak, speakEnglish, stopSpeaking } from '../lib/tts';
import { playDing } from '../lib/sfx';

type ChannelId = 'mix' | 'shadow' | 'drama' | 'srs';
type Phase = 'idle' | 'host_intro' | 'user_turn' | 'jp_normal' | 'jp_slow' | 'jp_final';

interface PodcastTrack {
  id: string;
  kind: 'shadow' | 'drama' | 'srs';
  categoryTag: string;
  enPrompt: string;
  jpDisplay: string;
  jpKana: string;
  answerExplain?: string;
}

export default function DriveMode() {
  const { srs, sfxEnabled } = useStore();
  const [channel, setChannel] = useState<ChannelId>('mix');
  const [playing, setPlaying] = useState(false);
  const [trackIdx, setTrackIdx] = useState(0);
  const [phase, setPhase] = useState<Phase>('idle');
  const [pauseSecs, setPauseSecs] = useState<number>(4);
  const [countdown, setCountdown] = useState<number>(0);
  const [autoMic, setAutoMic] = useState(false);
  const [heardText, setHeardText] = useState<string>('');
  const [completedTracks, setCompletedTracks] = useState(0);

  const runIdRef = useRef(0);
  const timerRef = useRef<number | null>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const recogRef = useRef<any>(null);

  // Build tracks from Scenes, Grammar examples, Listening dialogues, and user SRS deck
  const tracks = useMemo<PodcastTrack[]>(() => {
    const shadowTracks: PodcastTrack[] = [];

    // 1. Speaking role-play lines
    for (const sc of SCENES) {
      for (let i = 0; i < sc.lines.length; i++) {
        const ln = sc.lines[i];
        shadowTracks.push({
          id: `sc-${sc.id}-${i}`,
          kind: 'shadow',
          categoryTag: `🗣️ ${sc.title} (${sc.level ?? 'N5'})`,
          enPrompt: `How do you say: "${ln.en}"?`,
          jpDisplay: ln.jp,
          jpKana: ln.kana,
        });
      }
    }

    // 2. High-utility grammar examples
    for (const les of LESSONS) {
      for (const pt of les.points) {
        const ex = pt.examples[0];
        if (ex) {
          shadowTracks.push({
            id: `gr-${les.id}-${pt.pattern}`,
            kind: 'shadow',
            categoryTag: `文 ${les.title} · ${pt.pattern}`,
            enPrompt: `Say in Japanese: "${ex.en}"`,
            jpDisplay: ex.jp,
            jpKana: ex.audio ?? ex.jp,
            answerExplain: `${pt.pattern}: ${pt.meaning}`,
          });
        }
      }
    }

    // 3. Multi-voice listening drama tracks
    const dramaTracks: PodcastTrack[] = LISTENING.map((item) => ({
      id: `ls-${item.id}`,
      kind: 'drama',
      categoryTag: `🎧 JLPT Listening · ${item.type.toUpperCase()}`,
      enPrompt: `Listen to the Japanese audio and answer: ${item.question}`,
      jpDisplay: `${item.transcript}\n\nQuestion: ${item.question}`,
      jpKana: item.audio,
      answerExplain: `The answer is ${item.options[item.answer]}. ${item.note ?? ''}`,
    }));

    // 4. Personal SRS audio deck tracks
    const srsList = Object.values(srs);
    const srsTracks: PodcastTrack[] =
      srsList.length > 0
        ? srsList.map((item) => ({
            id: `srs-${item.id}`,
            kind: 'srs',
            categoryTag: `🔄 SRS ${item.kind.toUpperCase()}`,
            enPrompt: `Recall the Japanese for: "${item.back.split('—')[0].trim()}"`,
            jpDisplay: `${item.front}${item.reading ? ` (${item.reading})` : ''}`,
            jpKana: item.reading?.split(/[ /、]/)[0] || item.front,
            answerExplain: item.back,
          }))
        : shadowTracks.slice(0, 12);

    if (channel === 'shadow') return shadowTracks;
    if (channel === 'drama') return dramaTracks;
    if (channel === 'srs') return srsTracks;

    // 'mix' interleaves Shadowing, Drama, and SRS
    const mixed: PodcastTrack[] = [];
    const maxLen = Math.max(shadowTracks.length, dramaTracks.length, srsTracks.length);
    for (let i = 0; i < maxLen; i++) {
      if (shadowTracks[i]) mixed.push(shadowTracks[i]);
      if (i % 2 === 0 && dramaTracks[Math.floor(i / 2)]) mixed.push(dramaTracks[Math.floor(i / 2)]);
      if (i % 3 === 0 && srsTracks[Math.floor(i / 3)]) mixed.push(srsTracks[Math.floor(i / 3)]);
    }
    return mixed;
  }, [channel, srs]);

  const currentTrack = tracks[trackIdx % tracks.length] ?? tracks[0];

  const clearTimersAndMic = () => {
    if (timerRef.current) {
      window.clearInterval(timerRef.current);
      window.clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    if (recogRef.current) {
      try {
        recogRef.current.stop();
      } catch {
        // ignore
      }
      recogRef.current = null;
    }
  };

  // Screen Wake Lock while driving podcast is active
  useEffect(() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let wakeLock: any = null;
    const reqWake = async () => {
      try {
        if (playing && 'wakeLock' in navigator) {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          wakeLock = await (navigator as any).wakeLock.request('screen');
        }
      } catch {
        // ignore if unsupported or blocked
      }
    };
    reqWake();
    return () => {
      if (wakeLock) {
        try {
          wakeLock.release();
        } catch {
          // ignore
        }
      }
    };
  }, [playing]);

  useEffect(() => {
    return () => {
      runIdRef.current++;
      clearTimersAndMic();
      stopSpeaking();
    };
  }, []);

  // Main hands-free state machine per track
  useEffect(() => {
    if (!playing || !currentTrack) {
      setPhase('idle');
      return;
    }

    const myRun = ++runIdRef.current;
    clearTimersAndMic();
    stopSpeaking();
    setHeardText('');

    const runUserTurn = (onDone: () => void) => {
      if (myRun !== runIdRef.current) return;
      setPhase('user_turn');
      setCountdown(pauseSecs);

      // Optional hands-free speech recognition
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (autoMic && SR) {
        try {
          const r = new SR();
          r.lang = 'ja-JP';
          r.interimResults = false;
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          r.onresult = (e: any) => {
            const transcript = e.results?.[0]?.[0]?.transcript ?? '';
            if (transcript && myRun === runIdRef.current) {
              setHeardText(transcript);
              if (sfxEnabled) playDing();
            }
          };
          r.start();
          recogRef.current = r;
        } catch {
          // fallback to timer
        }
      }

      let rem = pauseSecs;
      timerRef.current = window.setInterval(() => {
        if (myRun !== runIdRef.current) return;
        rem -= 1;
        setCountdown(Math.max(0, rem));
        if (rem <= 0) {
          clearTimersAndMic();
          onDone();
        }
      }, 1000);
    };

    if (currentTrack.kind === 'drama') {
      // Drama sequence: 1) Host Intro -> 2) Multi-voice dialogue -> 3) Think pause -> 4) Answer reveal
      setPhase('host_intro');
      speakEnglish(currentTrack.enPrompt, 1.02, () => {
        if (myRun !== runIdRef.current) return;
        setPhase('jp_normal');
        speak(currentTrack.jpKana, 0.9, () => {
          if (myRun !== runIdRef.current) return;
          runUserTurn(() => {
            if (myRun !== runIdRef.current) return;
            setPhase('jp_final');
            speakEnglish(currentTrack.answerExplain ?? 'Good job.', 1.02, () => {
              if (myRun !== runIdRef.current) return;
              if (sfxEnabled) playDing();
              setCompletedTracks((c) => c + 1);
              setTrackIdx((i) => (i + 1) % tracks.length);
            });
          });
        });
      });
    } else {
      // Pimsleur / SRS sequence:
      // 1) Host English prompt -> 2) User Speak window -> 3) Native JP (0.9x) -> 4) Slow JP (0.72x) -> 5) Natural JP (0.95x)
      setPhase('host_intro');
      speakEnglish(currentTrack.enPrompt, 1.02, () => {
        if (myRun !== runIdRef.current) return;
        runUserTurn(() => {
          if (myRun !== runIdRef.current) return;
          setPhase('jp_normal');
          speak(currentTrack.jpKana, 0.9, () => {
            if (myRun !== runIdRef.current) return;
            setPhase('jp_slow');
            timerRef.current = window.setTimeout(() => {
              if (myRun !== runIdRef.current) return;
              speak(currentTrack.jpKana, 0.72, () => {
                if (myRun !== runIdRef.current) return;
                setPhase('jp_final');
                timerRef.current = window.setTimeout(() => {
                  if (myRun !== runIdRef.current) return;
                  speak(currentTrack.jpKana, 0.95, () => {
                    if (myRun !== runIdRef.current) return;
                    if (sfxEnabled) playDing();
                    setCompletedTracks((c) => c + 1);
                    setTrackIdx((i) => (i + 1) % tracks.length);
                  });
                }, 450);
              });
            }, 400);
          });
        });
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [playing, trackIdx, channel]);

  const togglePlay = () => {
    if (playing) {
      runIdRef.current++;
      clearTimersAndMic();
      stopSpeaking();
      setPlaying(false);
      setPhase('idle');
    } else {
      setPlaying(true);
    }
  };

  const stepTrack = (delta: number) => {
    runIdRef.current++;
    clearTimersAndMic();
    stopSpeaking();
    setTrackIdx((i) => (i + delta + tracks.length) % tracks.length);
  };

  const replayCurrent = () => {
    runIdRef.current++;
    clearTimersAndMic();
    stopSpeaking();
    if (!playing) {
      setPlaying(true);
    } else {
      // Re-trigger effect by toggling a re-run
      setPlaying(false);
      setTimeout(() => setPlaying(true), 30);
    }
  };

  const phaseLabel: Record<Phase, string> = {
    idle: '⏸ Paused — Press Play for Hands-Free Audio',
    host_intro: '🎙️ Host Prompt (English Cue)…',
    user_turn: `🗣️ YOUR TURN! Speak Aloud (${countdown}s)…`,
    jp_normal: '🗾 Native Speaker (Normal Speed)…',
    jp_slow: '🐢 Shadowing Breakdown (Slow 0.72x)…',
    jp_final: '✨ Final Native Repeat / Answer…',
  };

  return (
    <div className="page">
      <div className="row-between">
        <div>
          <h1 className="nomargin">
            📻 ドライブ・モード <span className="muted">Hands-Free Driving &amp; Commute Podcast</span>
          </h1>
          <p className="muted small nomargin" style={{ marginTop: '0.2rem' }}>
            Eyes-free Pimsleur-style recall, shadowing, and multi-voice JLPT dialogues. Loops automatically.
          </p>
        </div>
        <span className="chip on">✓ {completedTracks} tracks completed</span>
      </div>

      {/* Podcast Channel Selector */}
      <div className="controls" style={{ marginTop: '0.9rem' }}>
        {(
          [
            ['mix', '📻 All-Rounder Commute Mix'],
            ['shadow', '🗣️ Pimsleur Recall & Shadowing'],
            ['drama', '🎧 Multi-Voice JLPT Drama'],
            ['srs', `🔄 My SRS Audio Deck (${Object.keys(srs).length || 12})`],
          ] as [ChannelId, string][]
        ).map(([id, label]) => (
          <button
            key={id}
            className={channel === id ? 'chip on' : 'chip'}
            onClick={() => {
              setChannel(id);
              setTrackIdx(0);
            }}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Timing & Hands-Free Mic Settings */}
      <div className="controls">
        <span className="muted small" style={{ alignSelf: 'center', marginRight: '0.25rem' }}>
          Speak Pause:
        </span>
        {[3, 4, 6, 8].map((s) => (
          <button key={s} className={pauseSecs === s ? 'chip on' : 'chip'} onClick={() => setPauseSecs(s)}>
            ⏱ {s}s
          </button>
        ))}
        <button
          className={autoMic ? 'chip on' : 'chip'}
          onClick={() => setAutoMic((m) => !m)}
          title="Automatically listen via microphone during the speaking window"
        >
          {autoMic ? '🎙️ Auto-Mic: ON' : '🎙️ Auto-Mic: OFF (Timer Only)'}
        </button>
      </div>

      {/* Giant Car-Friendly HUD Card */}
      {currentTrack && (
        <div
          className={`drill ${phase === 'user_turn' ? 'ok' : ''}`}
          style={{
            padding: '2.2rem 1.6rem',
            textAlign: 'center',
            gap: '0.9rem',
            border: playing ? '2px solid var(--accent)' : '1px solid var(--surface2)',
          }}
        >
          <div className="row-between" style={{ width: '100%' }}>
            <span className="tag">{currentTrack.categoryTag}</span>
            <span className="muted small">
              Track {(trackIdx % tracks.length) + 1} / {tracks.length}
            </span>
          </div>

          {/* Live Phase Banner */}
          <div
            className="chip on"
            style={{
              fontSize: '1.05rem',
              padding: '0.5rem 1.2rem',
              background:
                phase === 'user_turn'
                  ? 'color-mix(in srgb, var(--ok) 25%, var(--surface))'
                  : 'var(--surface2)',
              color: phase === 'user_turn' ? 'var(--ok)' : 'var(--accent)',
              fontWeight: 600,
            }}
          >
            {phaseLabel[phase]}
          </div>

          {/* Prompt */}
          <p style={{ fontSize: '1.35rem', margin: '0.3rem 0', fontWeight: 600 }}>
            {currentTrack.enPrompt}
          </p>

          {/* Japanese Display (dimmed during recall, bright on reveal) */}
          <div
            className="jp"
            style={{
              fontSize: currentTrack.kind === 'drama' ? '1.15rem' : '2.1rem',
              lineHeight: 1.5,
              whiteSpace: 'pre-line',
              opacity: phase === 'host_intro' || phase === 'user_turn' ? 0.25 : 1,
              filter: phase === 'host_intro' || phase === 'user_turn' ? 'blur(5px)' : 'none',
              transition: 'opacity 0.25s, filter 0.25s',
              padding: '0.4rem 0.8rem',
            }}
          >
            {currentTrack.jpDisplay}
          </div>

          {heardText && (
            <p className="ok-text small nomargin">
              🎙️ Heard: 「{heardText}」
            </p>
          )}

          {currentTrack.answerExplain && (phase === 'jp_final' || phase === 'idle') && (
            <p className="muted small nomargin">{currentTrack.answerExplain}</p>
          )}

          {/* Extra-Large Car Dashboard Transport Controls */}
          <div
            className="controls"
            style={{
              justifyContent: 'center',
              gap: '0.8rem',
              marginTop: '0.8rem',
              width: '100%',
            }}
          >
            <button
              className="chip"
              style={{ padding: '0.85rem 1.3rem', fontSize: '1.05rem' }}
              onClick={() => stepTrack(-1)}
            >
              ⏮ Prev
            </button>
            <button
              className={playing ? 'chip bad' : 'chip on'}
              style={{
                padding: '0.95rem 2.2rem',
                fontSize: '1.2rem',
                fontWeight: 700,
              }}
              onClick={togglePlay}
            >
              {playing ? '⏸ Pause Podcast' : '▶ Start Driving Mode'}
            </button>
            <button
              className="chip"
              style={{ padding: '0.85rem 1.3rem', fontSize: '1.05rem' }}
              onClick={replayCurrent}
            >
              🔁 Replay
            </button>
            <button
              className="chip"
              style={{ padding: '0.85rem 1.3rem', fontSize: '1.05rem' }}
              onClick={() => stepTrack(1)}
            >
              ⏭ Next
            </button>
          </div>
        </div>
      )}

      {/* Episode Cycle Guide */}
      <div className="gp">
        <div className="gp-head">
          <b>🚗 How Hands-Free Driving Mode Works</b>
          <span className="muted small">Zero screen touches needed once started</span>
        </div>
        <p className="small muted">
          1. <b>🎙️ English Cue</b>: The host gives you a situational prompt or sentence in English.
          <br />
          2. <b>🗣️ Speak Aloud Window ({pauseSecs}s)</b>: Say the Japanese phrase out loud during the pause (the Japanese text stays blurred until the model voice speaks).
          <br />
          3. <b>🗾 Native Model + Slow Shadow + Natural Repeat</b>: Hear the native pronunciation at normal speed (`0.9x`), slow breakdown (`0.72x`), and final natural speed (`0.95x`), then automatically advance to the next track!
        </p>
      </div>
    </div>
  );
}
