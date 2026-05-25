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
      background: 'var(--color-surface)',
      border: '1px solid var(--color-border-subtle)',
    },
    elevated: {
      background: 'var(--color-surface-raised)',
      border: '1px solid var(--color-border)',
    },
    section: {
      background: 'var(--color-surface)',
      border: '1px solid var(--color-border-subtle)',
      borderLeft: active
        ? '3px solid var(--color-primary-500)'
        : '3px solid var(--color-border)',
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
