export default function Card({
  children,
  variant = 'default',
  active = false,
  className = '',
  style: styleProp = {},
  onClick,
}) {
  const baseStyle = {
    borderRadius: 'var(--radius-lg)',
    padding: 'var(--space-6)',
    transition: `all var(--duration-normal) var(--ease-default)`,
  };

  const variants = {
    default: {
      background: 'rgba(255,255,255,0.05)',
      border: '1px solid rgba(255,255,255,0.05)',
    },
    elevated: {
      background: 'rgba(255,255,255,0.08)',
      border: '1px solid rgba(255,255,255,0.10)',
    },
    section: {
      background: 'rgba(255,255,255,0.05)',
      border: '1px solid rgba(255,255,255,0.05)',
      borderLeft: active
        ? '3px solid var(--color-primary-500)'
        : '3px solid rgba(255,255,255,0.10)',
    },
  };

  const variantStyle = variants[variant] || variants.default;

  return (
    <div
      className={className}
      onClick={onClick}
      style={{
        ...baseStyle,
        ...variantStyle,
        ...(onClick ? { cursor: 'pointer' } : {}),
        ...styleProp,
      }}
    >
      {children}
    </div>
  );
}
