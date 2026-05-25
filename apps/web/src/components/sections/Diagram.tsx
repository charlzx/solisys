import { useState, useRef, useCallback } from 'react';
import { ZoomIn, ZoomOut, RotateCcw, Download } from 'lucide-react';
import SectionHeader from '../ui/SectionHeader';
import Card from '../ui/Card';
import Button from '../ui/Button';
import { generateDiagram } from '../../lib/diagram/generateDiagram';

const COLORS = {
  panels: '#00c3c9',
  combiner: '#969696',
  mppt: '#10b981',
  battery: '#10b981',
  inverter: '#3b82f6',
  load: '#969696',
  grid: '#f59e0b',
  meter: '#8b5cf6',
  dc: '#00c3c9',
  ac: '#3b82f6',
  bg: '#09090b',
  surface: '#0f0f11',
  border: 'rgba(255,255,255,0.10)',
  textPrimary: '#ffffff',
  textSecondary: '#969696',
  textMuted: 'rgba(255,255,255,0.4)',
};

function NodeSvg({ node }) {
  const { x, y, w, h, type, title, specs } = node;
  const color = COLORS[type] || COLORS.combiner;
  const r = 6;

  const specLines = (specs || []).slice(0, 3);

  return (
    <g>
      <rect
        x={x} y={y} width={w} height={h} rx={r}
        fill={COLORS.surface}
        stroke={color}
        strokeWidth={1.5}
        strokeOpacity={0.6}
      />

      <rect
        x={x} y={y} width={w} height={h} rx={r}
        fill="none"
        stroke="rgba(255,255,255,0.04)"
        strokeWidth={1}
      />

      <NodeIcon type={type} x={x + 10} y={y + 10} color={color} />

      <text
        x={x + 32} y={y + 18}
        fill={COLORS.textPrimary}
        fontSize={12}
        fontFamily="'DM Sans', sans-serif"
        fontWeight={500}
      >
        {title}
      </text>

      {specLines.map((line, i) => (
        <text
          key={i}
          x={x + 32} y={y + 32 + i * 14}
          fill={i === 0 ? color : COLORS.textMuted}
          fontSize={10}
          fontFamily="'DM Sans', monospace"
          fontWeight={400}
        >
          {line}
        </text>
      ))}

      <TypeBadge type={type} x={x + w - 8} y={y + 8} color={color} />
    </g>
  );
}

function TypeBadge({ type, x, y, color }) {
  const labels = {
    panels: 'DC',
    combiner: 'DC',
    mppt: 'DC',
    battery: 'DC',
    inverter: 'AC',
    load: 'AC',
    grid: 'AC',
    meter: 'AC',
  };
  const label = labels[type] || '';
  if (!label) return null;

  return (
    <g>
      <rect
        x={x - 20} y={y - 2}
        width={20} height={14} rx={3}
        fill={color} fillOpacity={0.12}
      />
      <text
        x={x - 10} y={y + 8}
        fill={color}
        fontSize={8}
        fontFamily="'DM Sans', monospace"
        fontWeight={600}
        textAnchor="middle"
        letterSpacing="0.5"
      >
        {label}
      </text>
    </g>
  );
}

function NodeIcon({ type, x, y, color }) {
  const s = 16;
  const cx = x + s / 2;
  const cy = y + s / 2;

  switch (type) {
    case 'panels':
      return (
        <g>
          <rect x={x} y={y} width={s} height={s} rx={2} fill="none" stroke={color} strokeWidth={1.2} />
          <line x1={cx} y1={y + 1} x2={cx} y2={y + s - 1} stroke={color} strokeWidth={0.7} />
          <line x1={x + 1} y1={cy} x2={x + s - 1} y2={cy} stroke={color} strokeWidth={0.7} />
          <line x1={x + 3} y1={y + 3} x2={x + s - 3} y2={y + s - 3} stroke={color} strokeWidth={0.4} />
        </g>
      );
    case 'combiner':
      return (
        <g>
          <rect x={x} y={y} width={s} height={s} rx={2} fill="none" stroke={color} strokeWidth={1.2} />
          <circle cx={cx - 3} cy={cy} r={1.5} fill={color} />
          <circle cx={cx + 3} cy={cy} r={1.5} fill={color} />
        </g>
      );
    case 'mppt':
      return (
        <g>
          <rect x={x} y={y} width={s} height={s} rx={2} fill="none" stroke={color} strokeWidth={1.2} />
          <path d={`M${x + 4} ${cy + 2} L${cx} ${y + 4} L${x + s - 4} ${cy + 2}`} fill="none" stroke={color} strokeWidth={1} />
          <line x1={cx} y1={cy + 1} x2={cx} y2={y + s - 3} stroke={color} strokeWidth={0.8} />
        </g>
      );
    case 'battery':
      return (
        <g>
          <rect x={x + 2} y={y + 3} width={s - 4} height={s - 6} rx={1.5} fill="none" stroke={color} strokeWidth={1.2} />
          <rect x={cx - 1.5} y={y} width={3} height={3} rx={0.5} fill={color} />
          <line x1={cx - 3} y1={cy} x2={cx + 3} y2={cy} stroke={color} strokeWidth={0.6} />
        </g>
      );
    case 'inverter':
      return (
        <g>
          <rect x={x} y={y} width={s} height={s} rx={2} fill="none" stroke={color} strokeWidth={1.2} />
          <text x={cx - 3} y={cy + 3} fill={COLORS.textMuted} fontSize={8} fontFamily="monospace" textAnchor="middle">=</text>
          <text x={cx + 4} y={cy + 3} fill={color} fontSize={9} fontFamily="monospace" textAnchor="middle">~</text>
        </g>
      );
    case 'load':
      return (
        <g>
          <rect x={x} y={y} width={s} height={s} rx={2} fill="none" stroke={color} strokeWidth={1.2} />
          <line x1={cx} y1={y + 3} x2={cx} y2={y + s - 3} stroke={color} strokeWidth={0.8} />
          <line x1={x + 4} y1={y + 5} x2={x + 4} y2={y + s - 5} stroke={color} strokeWidth={0.6} />
          <line x1={x + s - 4} y1={y + 5} x2={x + s - 4} y2={y + s - 5} stroke={color} strokeWidth={0.6} />
        </g>
      );
    case 'grid':
      return (
        <g>
          <line x1={cx} y1={y} x2={cx} y2={y + s} stroke={color} strokeWidth={1.2} />
          <line x1={x + 2} y1={y + 4} x2={x + s - 2} y2={y + 4} stroke={color} strokeWidth={0.8} />
          <line x1={x + 3} y1={y + s - 4} x2={x + s - 3} y2={y + s - 4} stroke={color} strokeWidth={0.8} />
          <line x1={x + 2} y1={y + 4} x2={x + 4} y2={y + s - 4} stroke={color} strokeWidth={0.6} />
          <line x1={x + s - 2} y1={y + 4} x2={x + s - 4} y2={y + s - 4} stroke={color} strokeWidth={0.6} />
        </g>
      );
    case 'meter':
      return (
        <g>
          <circle cx={cx} cy={cy} r={s / 2 - 1} fill="none" stroke={color} strokeWidth={1.2} />
          <line x1={cx} y1={cy - 3} x2={cx - 2} y2={cy + 2} stroke={color} strokeWidth={1} />
          <line x1={cx} y1={cy - 3} x2={cx + 2} y2={cy + 1} stroke={color} strokeWidth={0.8} />
        </g>
      );
    default:
      return null;
  }
}

function EdgeSvg({ edge, edgeIndex }) {
  if (!edge.points || edge.points.length < 2) return null;

  const isAc = edge.type === 'ac';
  const color = isAc ? COLORS.ac : COLORS.dc;
  const strokeW = 1.5;

  let d = `M ${edge.points[0].x} ${edge.points[0].y}`;
  for (let i = 1; i < edge.points.length; i++) {
    d += ` L ${edge.points[i].x} ${edge.points[i].y}`;
  }

  const dashLen = 6;
  const gapLen = 10;

  const last = edge.points[edge.points.length - 1];
  const secondLast = edge.points[edge.points.length - 2];
  const isDown = last.y > secondLast.y;
  const isRight = last.x > secondLast.x;

  let labelX, labelY;
  if (edge.points.length === 2) {
    labelX = (edge.points[0].x + edge.points[1].x) / 2;
    labelY = (edge.points[0].y + edge.points[1].y) / 2;
  } else {
    const mid = Math.floor(edge.points.length / 2);
    labelX = (edge.points[mid - 1].x + edge.points[mid].x) / 2;
    labelY = (edge.points[mid - 1].y + edge.points[mid].y) / 2;
  }

  return (
    <g>
      <path
        d={d}
        fill="none"
        stroke={color}
        strokeWidth={strokeW}
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity={0.2}
      />

      <path
        d={d}
        fill="none"
        stroke={color}
        strokeWidth={strokeW}
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeDasharray={`${dashLen} ${gapLen}`}
        opacity={0.8}
      >
        <animate
          attributeName="stroke-dashoffset"
          from={dashLen + gapLen}
          to="0"
          dur="1.2s"
          repeatCount="indefinite"
        />
      </path>

      {isDown && (
        <polygon
          points={`${last.x},${last.y} ${last.x - 4},${last.y - 8} ${last.x + 4},${last.y - 8}`}
          fill={color}
          opacity={0.7}
        />
      )}

      {!isDown && isRight && edge.horizontal && (
        <polygon
          points={`${last.x},${last.y} ${last.x - 8},${last.y - 4} ${last.x - 8},${last.y + 4}`}
          fill={color}
          opacity={0.7}
        />
      )}

      {edge.label && (
        <g>
          <rect
            x={labelX + 4} y={labelY - 10}
            width={edge.label.length * 6 + 8} height={14}
            rx={3}
            fill={COLORS.bg}
            stroke={color}
            strokeWidth={0.5}
            strokeOpacity={0.3}
          />
          <text
            x={labelX + 8} y={labelY}
            fill={color}
            fontSize={9}
            fontFamily="'DM Sans', monospace"
            opacity={0.8}
          >
            {edge.label}
          </text>
        </g>
      )}
    </g>
  );
}

function ConnectionDot({ x, y, color }) {
  return (
    <g>
      <circle cx={x} cy={y} r={3} fill={color} opacity={0.8} />
      <circle cx={x} cy={y} r={6} fill={color} opacity={0.1} />
    </g>
  );
}

export default function Diagram({
  project,
  calculations,
  selectedPanel,
  selectedInverter,
  selectedBattery,
}) {
  const [zoom, setZoom] = useState(1);
  const svgRef = useRef(null);

  const diagram = generateDiagram(project, calculations, selectedPanel, selectedInverter, selectedBattery);

  const handleZoomIn = () => setZoom(z => Math.min(z + 0.25, 3));
  const handleZoomOut = () => setZoom(z => Math.max(z - 0.25, 0.25));
  const handleResetZoom = () => setZoom(1);

  const handleDownloadSVG = useCallback(() => {
    if (!svgRef.current) return;
    const clone = svgRef.current.cloneNode(true);
    clone.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
    const svgData = new XMLSerializer().serializeToString(clone);
    const blob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${project.projectName || 'solisys'}_diagram.svg`;
    a.click();
    URL.revokeObjectURL(url);
  }, [project.projectName]);

  const handleDownloadPNG = useCallback(() => {
    if (!svgRef.current) return;
    const clone = svgRef.current.cloneNode(true);
    clone.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
    const svgData = new XMLSerializer().serializeToString(clone);
    const canvas = document.createElement('canvas');
    const scale = 2;
    canvas.width = diagram.canvasWidth * scale;
    canvas.height = diagram.canvasHeight * scale;
    const ctx = canvas.getContext('2d');
    const img = new Image();
    img.onload = () => {
      ctx.fillStyle = COLORS.bg;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      const pngUrl = canvas.toDataURL('image/png');
      const a = document.createElement('a');
      a.href = pngUrl;
      a.download = `${project.projectName || 'solisys'}_diagram.png`;
      a.click();
    };
    img.src = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svgData)));
  }, [project.projectName, diagram.canvasWidth, diagram.canvasHeight]);

  const nodeMap = {};
  diagram.nodes.forEach(n => { nodeMap[n.id] = n; });

  return (
    <div id="section-diagram">
      <SectionHeader stepNumber="06" title="Single-Line Diagram" subtitle="Auto-generated system wiring diagram" />

      <Card>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 'var(--space-4)',
          flexWrap: 'wrap',
          gap: 'var(--space-2)',
        }}>
          <div style={{ display: 'flex', gap: 'var(--space-2)', alignItems: 'center' }}>
            <Button variant="icon-only" onClick={handleZoomOut} title="Zoom Out">
              <ZoomOut size={16} />
            </Button>
            <Button variant="icon-only" onClick={handleResetZoom} title="Reset Zoom">
              <RotateCcw size={16} />
            </Button>
            <Button variant="icon-only" onClick={handleZoomIn} title="Zoom In">
              <ZoomIn size={16} />
            </Button>
            <span style={{
              fontSize: '11px',
              color: 'var(--color-text-muted)',
              fontFamily: 'var(--font-numeric)',
              marginLeft: 'var(--space-1)',
              background: 'rgba(255,255,255,0.05)',
              padding: '2px 8px',
              borderRadius: 'var(--radius-sm)',
            }}>
              {Math.round(zoom * 100)}%
            </span>
          </div>

          <div style={{ display: 'flex', gap: 'var(--space-3)', alignItems: 'center' }}>
            <div style={{ display: 'flex', gap: 'var(--space-4)', marginRight: 'var(--space-4)' }}>
              <LegendItem color={COLORS.dc} label="DC" dashed={false} />
              <LegendItem color={COLORS.ac} label="AC" dashed={true} />
            </div>
            <Button variant="secondary" size="sm" onClick={handleDownloadSVG}>
              <Download size={14} /> SVG
            </Button>
            <Button variant="secondary" size="sm" onClick={handleDownloadPNG}>
              <Download size={14} /> PNG
            </Button>
          </div>
        </div>

        <div style={{
          overflow: 'auto',
          WebkitOverflowScrolling: 'touch',
          background: COLORS.bg,
          borderRadius: 'var(--radius-md)',
          border: '1px solid rgba(255,255,255,0.05)',
          padding: 'var(--space-4)',
          display: 'flex',
          justifyContent: 'flex-start',
          touchAction: 'pan-x pan-y',
        }}>
          <svg
            ref={svgRef}
            width={diagram.canvasWidth * zoom}
            height={diagram.canvasHeight * zoom}
            viewBox={`0 0 ${diagram.canvasWidth} ${diagram.canvasHeight}`}
            xmlns="http://www.w3.org/2000/svg"
            style={{ display: 'block', flexShrink: 0 }}
          >
            <rect width={diagram.canvasWidth} height={diagram.canvasHeight} fill={COLORS.bg} />

            <GridPattern width={diagram.canvasWidth} height={diagram.canvasHeight} />

            {diagram.edges.map((edge, idx) => (
              <EdgeSvg key={edge.id} edge={edge} edgeIndex={idx} />
            ))}

            {diagram.edges.map(edge => {
              if (!edge.points || edge.points.length < 2) return null;
              const from = nodeMap[edge.from];
              const to = nodeMap[edge.to];
              if (!from || !to) return null;
              const color = edge.type === 'ac' ? COLORS.ac : COLORS.dc;
              return (
                <g key={`dots_${edge.id}`}>
                  <ConnectionDot x={edge.points[0].x} y={edge.points[0].y} color={color} />
                </g>
              );
            })}

            {diagram.nodes.map(node => (
              <NodeSvg key={node.id} node={node} />
            ))}

            <text
              x={diagram.canvasWidth / 2}
              y={diagram.canvasHeight - 16}
              textAnchor="middle"
              fill={COLORS.textMuted}
              fontSize={9}
              fontFamily="'DM Sans', sans-serif"
            >
              {project.projectName || 'Untitled'} — Single Line Diagram — SOLISYS v2.0
            </text>
          </svg>
        </div>
      </Card>
    </div>
  );
}

function GridPattern({ width, height }) {
  const spacing = 24;
  const lines = [];
  for (let x = spacing; x < width; x += spacing) {
    lines.push(
      <line key={`v${x}`} x1={x} y1={0} x2={x} y2={height}
        stroke="rgba(255,255,255,0.02)" strokeWidth={0.5} />
    );
  }
  for (let y = spacing; y < height; y += spacing) {
    lines.push(
      <line key={`h${y}`} x1={0} y1={y} x2={width} y2={y}
        stroke="rgba(255,255,255,0.02)" strokeWidth={0.5} />
    );
  }
  return <g>{lines}</g>;
}

function LegendItem({ color, label, dashed }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
      <svg width={20} height={8}>
        <line x1={0} y1={4} x2={20} y2={4}
          stroke={color} strokeWidth={1.5}
          strokeDasharray={dashed ? '4 2' : 'none'}
          opacity={0.7}
        />
      </svg>
      <span style={{
        fontSize: '10px',
        color: color,
        fontFamily: 'var(--font-numeric)',
        letterSpacing: '0.05em',
        textTransform: 'uppercase',
        fontWeight: 500,
      }}>
        {label}
      </span>
    </div>
  );
}
