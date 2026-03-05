export default function SectionHeader({
  stepNumber,
  title,
  subtitle,
  className = '',
}) {
  return (
    <div
      className={className}
      style={{
        position: 'sticky',
        top: '56px',
        zIndex: 10,
        background: 'var(--color-bg-base)',
        paddingTop: 'var(--space-6)',
        paddingBottom: 'var(--space-4)',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', marginBottom: 'var(--space-2)' }}>
        {stepNumber && (
          <span
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '26px',
              height: '26px',
              borderRadius: 'var(--radius-md)',
              background: 'rgba(0, 195, 201, 0.1)',
              color: 'var(--color-primary-500)',
              fontFamily: 'var(--font-numeric)',
              fontSize: 'var(--text-xs)',
              fontWeight: 'var(--weight-semibold)',
              flexShrink: 0,
            }}
          >
            {stepNumber}
          </span>
        )}
        <h2
          style={{
            fontSize: 'var(--text-lg)',
            fontWeight: 'var(--weight-medium)',
            color: 'var(--color-text-primary)',
            fontFamily: 'var(--font-display)',
            margin: 0,
            lineHeight: 'var(--leading-tight)',
            letterSpacing: 'var(--tracking-tight)',
          }}
        >
          {title}
        </h2>
      </div>
      {subtitle && (
        <p
          style={{
            fontSize: 'var(--text-sm)',
            color: 'var(--color-text-secondary)',
            fontFamily: 'var(--font-body)',
            margin: 0,
            paddingLeft: stepNumber ? '38px' : '0',
          }}
        >
          {subtitle}
        </p>
      )}
      <div
        style={{
          marginTop: 'var(--space-4)',
          height: '1px',
          background: 'rgba(255,255,255,0.05)',
          width: '100%',
        }}
      />
    </div>
  );
}
