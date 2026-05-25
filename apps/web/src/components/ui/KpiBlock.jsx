const colorMap = {
  neutral: 'var(--color-text-primary)',
  valid: 'var(--color-success)',
  warning: 'var(--color-warning)',
  error: 'var(--color-error)',
  calculating: 'var(--color-text-muted)',
};

export default function KpiBlock({
  label,
  value,
  unit,
  colorState = 'neutral',
  large = false,
  className = '',
}) {
  const valueColor = colorMap[colorState] || colorMap.neutral;

  return (
    <div className={className} style={{ display: 'flex', flexDirection: 'column', gap: '2px', minWidth: 0 }}>
      <span
        style={{
          fontSize: 'var(--text-xs)',
          textTransform: 'uppercase',
          letterSpacing: 'var(--tracking-widest)',
          color: 'var(--color-text-secondary)',
          fontFamily: 'var(--font-body)',
          fontWeight: 'var(--weight-medium)',
          wordBreak: 'break-word',
        }}
      >
        {label}
      </span>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 'var(--space-1)', minWidth: 0, flexWrap: 'wrap' }}>
        <span
          style={{
            fontSize: large ? 'var(--text-2xl)' : 'var(--text-xl)',
            fontFamily: 'var(--font-numeric)',
            fontWeight: 'var(--weight-bold)',
            color: valueColor,
            lineHeight: 'var(--leading-tight)',
            wordBreak: 'break-word',
            ...(colorState === 'calculating'
              ? { animation: 'kpiPulse 1.5s ease-in-out infinite' }
              : {}),
          }}
        >
          {value ?? '—'}
        </span>
        {unit && (
          <span
            style={{
              fontSize: 'var(--text-sm)',
              color: 'var(--color-text-muted)',
              fontFamily: 'var(--font-body)',
            }}
          >
            {unit}
          </span>
        )}
      </div>
      <style>{`
        @keyframes kpiPulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.4; }
        }
      `}</style>
    </div>
  );
}
