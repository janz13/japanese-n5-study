import { useEffect, useRef, useState } from 'react';
import { loadStrokes, strokeEnds } from '../lib/kanjivg';

/** Animated stroke-order diagram. */
export function StrokeOrder({ kanji }: { kanji: string }) {
  const [paths, setPaths] = useState<string[] | null>(null);
  const [err, setErr] = useState(false);
  const [run, setRun] = useState(0);

  useEffect(() => {
    setPaths(null);
    setErr(false);
    loadStrokes(kanji).then(setPaths, () => setErr(true));
  }, [kanji]);

  if (err) return <div className="stroke-box muted center">Stroke data unavailable (offline?)</div>;
  if (!paths) return <div className="stroke-box muted center">Loading…</div>;

  const per = 0.6;
  return (
    <div className="stroke-wrap">
      <svg key={run} viewBox="0 0 109 109" className="stroke-box">
        <Grid />
        {paths.map((d, i) => (
          <path key={i} d={d} className="stroke-anim" pathLength={1}
            style={{ animationDelay: `${i * per}s`, animationDuration: `${per}s` }} />
        ))}
        {paths.map((d, i) => <StrokeNum key={`n${i}`} d={d} n={i + 1} />)}
      </svg>
      <button className="chip" onClick={() => setRun((r) => r + 1)}>↻ Replay · {paths.length} strokes</button>
    </div>
  );
}

function StrokeNum({ d, n }: { d: string; n: number }) {
  const m = d.match(/^[Mm]\s*([\d.]+)[,\s]+([\d.]+)/);
  if (!m) return null;
  return <text x={+m[1] - 4} y={+m[2] - 2} className="stroke-num">{n}</text>;
}

const Grid = () => (
  <g className="grid-lines">
    <line x1="54.5" y1="0" x2="54.5" y2="109" />
    <line x1="0" y1="54.5" x2="109" y2="54.5" />
  </g>
);

type Pt = { x: number; y: number };

/**
 * Tracing / free-writing canvas. Checks stroke count, and that each stroke
 * starts and ends near the reference stroke (catches wrong order/direction).
 */
export function TraceCanvas({ kanji }: { kanji: string }) {
  const [paths, setPaths] = useState<string[] | null>(null);
  const [strokes, setStrokes] = useState<Pt[][]>([]);
  const [guide, setGuide] = useState(true);
  const [result, setResult] = useState<{ ok: boolean[]; msg: string } | null>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const drawing = useRef<Pt[] | null>(null);
  const [, force] = useState(0);

  useEffect(() => {
    setPaths(null);
    setStrokes([]);
    setResult(null);
    loadStrokes(kanji).then(setPaths, () => setPaths([]));
  }, [kanji]);

  const toPt = (e: React.PointerEvent): Pt => {
    const r = svgRef.current!.getBoundingClientRect();
    return { x: ((e.clientX - r.left) / r.width) * 109, y: ((e.clientY - r.top) / r.height) * 109 };
  };

  const down = (e: React.PointerEvent) => {
    (e.target as Element).setPointerCapture(e.pointerId);
    drawing.current = [toPt(e)];
    setResult(null);
    force((n) => n + 1);
  };
  const move = (e: React.PointerEvent) => {
    if (!drawing.current) return;
    drawing.current.push(toPt(e));
    force((n) => n + 1);
  };
  const up = () => {
    if (drawing.current && drawing.current.length > 1) {
      const next = [...strokes, drawing.current];
      setStrokes(next);
      if (paths && next.length === paths.length) check(next);
    }
    drawing.current = null;
  };

  const check = (ss: Pt[][]) => {
    if (!paths?.length) return;
    const ref = strokeEnds(paths);
    const dist = (a: Pt, b: Pt) => Math.hypot(a.x - b.x, a.y - b.y);
    const TOL = 22;
    const ok = ss.map((s, i) => {
      const r = ref[i];
      if (!r) return false;
      const a = s[0], b = s[s.length - 1];
      // short dots (e.g. 、-like strokes) only need a nearby start
      const refLen = dist(r.start, r.end);
      return dist(a, r.start) < TOL && (refLen < 12 || dist(b, r.end) < TOL);
    });
    const good = ok.filter(Boolean).length;
    setResult({
      ok,
      msg: good === paths.length ? '◎ Great! Correct order & direction.' : `${good}/${paths.length} strokes matched. Red = check order/direction.`,
    });
  };

  const toD = (s: Pt[]) => 'M' + s.map((p) => `${p.x.toFixed(1)},${p.y.toFixed(1)}`).join('L');

  return (
    <div className="stroke-wrap">
      <svg ref={svgRef} viewBox="0 0 109 109" className="stroke-box trace"
        onPointerDown={down} onPointerMove={move} onPointerUp={up} onPointerCancel={up}>
        <Grid />
        {guide && paths?.map((d, i) => <path key={i} d={d} className="stroke-guide" />)}
        {strokes.map((s, i) => (
          <path key={i} d={toD(s)} className={`stroke-user ${result ? (result.ok[i] ? 'ok' : 'bad') : ''}`} />
        ))}
        {drawing.current && <path d={toD(drawing.current)} className="stroke-user" />}
      </svg>
      <div className="controls center">
        <button className="chip" onClick={() => { setStrokes((s) => s.slice(0, -1)); setResult(null); }}>↶ Undo</button>
        <button className="chip" onClick={() => { setStrokes([]); setResult(null); }}>Clear</button>
        <button className={guide ? 'chip on' : 'chip'} onClick={() => setGuide(!guide)}>Guide</button>
        <span className="muted small">{strokes.length}/{paths?.length ?? '?'}</span>
      </div>
      {result && <p className={result.ok.every(Boolean) ? 'ok-text' : 'bad-text'}>{result.msg}</p>}
    </div>
  );
}
