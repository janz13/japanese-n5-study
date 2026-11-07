import React from 'react';
import { Link } from 'react-router-dom';

export interface DiagnosticRadarMetrics {
  kanjiOrthography: number; // 0 to 100%
  vocabContext: number; // 0 to 100%
  grammarStructure: number; // 0 to 100%
  readingComprehension: number; // 0 to 100%
  infoRetrieval: number; // 0 to 100%
  listeningResponse: number; // 0 to 100%
}

export interface HexagonRadarChartProps {
  metrics: DiagnosticRadarMetrics;
  passBenchmarkPct?: number; // default 60%
  size?: number;
}

interface AxisDefinition {
  key: keyof DiagnosticRadarMetrics;
  labelJp: string;
  labelEn: string;
  targetDojo: string;
  dojoName: string;
}

const AXES: AxisDefinition[] = [
  {
    key: 'kanjiOrthography',
    labelJp: '漢字・表記',
    labelEn: 'Kanji Orthography',
    targetDojo: '/kanji',
    dojoName: 'Kanji Studio',
  },
  {
    key: 'vocabContext',
    labelJp: '文脈規定・語彙',
    labelEn: 'Vocab Collocations',
    targetDojo: '/conjugate',
    dojoName: 'Vocab & Verb Dojo',
  },
  {
    key: 'grammarStructure',
    labelJp: '文法形式・並べ替え',
    labelEn: 'Grammar & Star Assembly',
    targetDojo: '/grammar',
    dojoName: 'Grammar Patterns',
  },
  {
    key: 'readingComprehension',
    labelJp: '短文・中文読解',
    labelEn: 'Reading Comprehension',
    targetDojo: '/stories',
    dojoName: 'Graded Stories',
  },
  {
    key: 'infoRetrieval',
    labelJp: '情報検索・実務',
    labelEn: 'Info Retrieval & Media',
    targetDojo: '/decoder',
    dojoName: 'Sign Decoder & Kiosks',
  },
  {
    key: 'listeningResponse',
    labelJp: '課題理解・即時応答',
    labelEn: 'Listening & Response',
    targetDojo: '/listening',
    dojoName: 'Listening & Pitch Dojo',
  },
];

export const HexagonRadarChart: React.FC<HexagonRadarChartProps> = ({
  metrics,
  passBenchmarkPct = 60,
  size = 320,
}) => {
  const center = size / 2;
  const radius = size * 0.36; // maximum radius for 100%
  const numVertices = AXES.length; // 6

  // Computes vertex (x, y) for an axis at a given fraction (0..1)
  const getCoordinates = (index: number, fraction: number): [number, number] => {
    // Start from top (-PI/2) and rotate clockwise
    const angle = -Math.PI / 2 + (index * 2 * Math.PI) / numVertices;
    const r = radius * Math.max(0, Math.min(1, fraction));
    const x = center + r * Math.cos(angle);
    const y = center + r * Math.sin(angle);
    return [x, y];
  };

  // Convert array of points to SVG path / polygon points string
  const toPolygonPoints = (points: [number, number][]): string =>
    points.map(([x, y]) => `${x.toFixed(1)},${y.toFixed(1)}`).join(' ');

  // Concentric background grid rings at 20%, 40%, 60%, 80%, 100%
  const gridRings = [0.2, 0.4, 0.6, 0.8, 1.0];

  // User polygon points
  const userPoints: [number, number][] = AXES.map((axis, i) => {
    const val = (metrics[axis.key] ?? 0) / 100;
    return getCoordinates(i, val);
  });

  // Benchmark passing polygon points (60%)
  const benchmarkPoints: [number, number][] = AXES.map((_, i) =>
    getCoordinates(i, passBenchmarkPct / 100),
  );

  // Underperforming axes (<= passBenchmarkPct)
  const weakAxes = AXES.filter((a) => (metrics[a.key] ?? 0) < passBenchmarkPct);

  return (
    <div
      className="gp radar-chart-wrapper"
      style={{
        padding: '1.2rem',
        borderRadius: '14px',
        background: 'var(--surface2)',
        border: '1px solid var(--border)',
      }}
    >
      <div className="row-between" style={{ marginBottom: '0.4rem', flexWrap: 'wrap' }}>
        <div>
          <span className="small font-bold">
            🕸️ 6-Competency Diagnostic Radar (六角形レーダーチャート)
          </span>
          <p className="muted small nomargin" style={{ fontSize: '0.74rem' }}>
            User score polygon vs. JLPT Passing Baseline ({passBenchmarkPct}% pass mark)
          </p>
        </div>
        <div className="controls nomargin" style={{ fontSize: '0.72rem', gap: '0.6rem' }}>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
            <span
              style={{
                width: '10px',
                height: '10px',
                background: 'var(--accent)',
                borderRadius: '2px',
                display: 'inline-block',
              }}
            />
            Your Performance
          </span>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
            <span
              style={{
                width: '12px',
                height: '2px',
                borderTop: '2px dashed #f59e0b',
                display: 'inline-block',
              }}
            />
            JLPT Pass Benchmark ({passBenchmarkPct}%)
          </span>
        </div>
      </div>

      <div style={{ display: 'flex', justifyContent: 'center', margin: '0.6rem 0' }}>
        <svg
          viewBox={`0 0 ${size} ${size}`}
          width={size}
          height={size}
          style={{ overflow: 'visible', maxWidth: '100%', height: 'auto' }}
        >
          {/* Background Concentric Hexagonal Rings */}
          {gridRings.map((fraction, ringIdx) => {
            const ringPoints = AXES.map((_, i) => getCoordinates(i, fraction));
            const isBenchmarkRing = Math.abs(fraction - passBenchmarkPct / 100) < 0.01;
            return (
              <polygon
                key={ringIdx}
                points={toPolygonPoints(ringPoints)}
                fill="none"
                stroke={isBenchmarkRing ? '#f59e0b' : 'rgba(255, 255, 255, 0.12)'}
                strokeWidth={isBenchmarkRing ? 1.5 : 1}
                strokeDasharray={isBenchmarkRing ? '3,3' : undefined}
                opacity={isBenchmarkRing ? 0.8 : 0.6}
              />
            );
          })}

          {/* Radial Axis Spokes */}
          {AXES.map((_, i) => {
            const [x, y] = getCoordinates(i, 1.0);
            return (
              <line
                key={i}
                x1={center}
                y1={center}
                x2={x}
                y2={y}
                stroke="rgba(255, 255, 255, 0.15)"
                strokeWidth="1"
              />
            );
          })}

          {/* Passing Benchmark Polygon */}
          <polygon
            points={toPolygonPoints(benchmarkPoints)}
            fill="none"
            stroke="#f59e0b"
            strokeWidth="1.5"
            strokeDasharray="4,4"
          />

          {/* User Score Filled Polygon */}
          <polygon
            points={toPolygonPoints(userPoints)}
            fill="rgba(6, 182, 212, 0.28)"
            stroke="var(--accent)"
            strokeWidth="2.2"
          />

          {/* Data Vertices and Axis Labels */}
          {AXES.map((axis, i) => {
            const [vx, vy] = userPoints[i];
            const [lx, ly] = getCoordinates(i, 1.25);
            const scoreVal = Math.round(metrics[axis.key] ?? 0);
            const isWeak = scoreVal < passBenchmarkPct;

            return (
              <g key={axis.key}>
                {/* Vertex Circle */}
                <circle
                  cx={vx}
                  cy={vy}
                  r="4.5"
                  fill={isWeak ? '#ef4444' : 'var(--accent)'}
                  stroke="var(--surface)"
                  strokeWidth="1.5"
                >
                  <title>{`${axis.labelJp}: ${scoreVal}%`}</title>
                </circle>

                {/* Score value above vertex */}
                <text
                  x={vx}
                  y={vy - 7}
                  textAnchor="middle"
                  fill={isWeak ? '#ef4444' : 'var(--text)'}
                  fontSize="9.5"
                  fontWeight="700"
                >
                  {scoreVal}%
                </text>

                {/* Axis Radial Label */}
                <text
                  x={lx}
                  y={ly}
                  textAnchor="middle"
                  dominantBaseline="central"
                  fill="var(--text)"
                  fontSize="9.5"
                  fontWeight="600"
                >
                  {axis.labelJp}
                </text>
                <text
                  x={lx}
                  y={ly + 10}
                  textAnchor="middle"
                  dominantBaseline="central"
                  fill="var(--muted)"
                  fontSize="7.5"
                >
                  {axis.labelEn}
                </text>
              </g>
            );
          })}
        </svg>
      </div>

      {/* Dynamic Remediation Routing Links */}
      <div style={{ marginTop: '0.6rem', borderTop: '1px solid var(--border)', paddingTop: '0.6rem' }}>
        <span className="small font-bold">
          🎯 Targeted Dojo Study Recommendations:
        </span>
        {weakAxes.length === 0 ? (
          <p className="ok-text small nomargin" style={{ marginTop: '0.2rem' }}>
            🎉 Outstanding! All 6 competency areas are above the JLPT {passBenchmarkPct}% benchmark!
          </p>
        ) : (
          <div className="controls nomargin" style={{ marginTop: '0.4rem', flexWrap: 'wrap', gap: '0.4rem' }}>
            {weakAxes.map((axis) => (
              <Link
                key={axis.key}
                to={axis.targetDojo}
                className="chip bad"
                style={{ padding: '0.22rem 0.65rem', fontSize: '0.78rem' }}
                title={`Practice in ${axis.dojoName}`}
              >
                ⚠️ {axis.labelJp} ({Math.round(metrics[axis.key] ?? 0)}%) → {axis.dojoName}
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default HexagonRadarChart;
