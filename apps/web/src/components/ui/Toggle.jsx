export default function Toggle({
  checked = false,
  onChange,
  label,
  disabled = false,
  className = '',
}) {
  return (
    <label
      className={className}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 'var(--space-3)',
        cursor: disabled ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.5 : 1,
      }}
    >
      <div
        onClick={disabled ? undefined : () => onChange?.(!checked)}
        style={{
          position: 'relative',
          width: '44px',
          height: '24px',
          borderRadius: 'var(--radius-full)',
          background: checked ? 'var(--color-primary-500)' : 'var(--color-bg-overlay)',
          transition: `background var(--duration-normal) var(--ease-default)`,
          flexShrink: 0,
        }}
      >
        <div
          style={{
            position: 'absolute',
            top: '3px',
            left: checked ? '23px' : '3px',
            width: '18px',
            height: '18px',
            borderRadius: '50%',
            background: 'white',
            transition: `left var(--duration-normal) var(--ease-spring)`,
          }}
        />
      </div>
      {label && (
        <span
          style={{
            fontSize: 'var(--text-sm)',
            color: 'var(--color-text-secondary)',
            fontFamily: 'var(--font-body)',
          }}
        >
          {label}
        </span>
      )}
    </label>
  );
}
