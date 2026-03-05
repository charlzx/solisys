const variantStyles = {
  primary: {
    background: 'var(--color-primary-500)',
    color: 'var(--color-text-inverse)',
    border: 'none',
    fontWeight: 'var(--weight-medium)',
  },
  white: {
    background: 'white',
    color: '#09090b',
    border: 'none',
    fontWeight: 'var(--weight-medium)',
  },
  secondary: {
    background: 'rgba(255,255,255,0.05)',
    color: 'var(--color-text-primary)',
    border: '1px solid rgba(255,255,255,0.10)',
    backdropFilter: 'blur(12px)',
  },
  ghost: {
    background: 'transparent',
    color: 'var(--color-text-secondary)',
    border: 'none',
  },
  danger: {
    background: 'transparent',
    color: 'var(--color-error)',
    border: '1px solid var(--color-error)',
  },
  'icon-only': {
    background: 'transparent',
    color: 'var(--color-text-secondary)',
    border: 'none',
    padding: '0',
    minWidth: 'auto',
  },
};

const hoverStyles = {
  primary: {
    background: 'var(--color-primary-400)',
    boxShadow: 'var(--glow-primary)',
  },
  white: {
    background: '#f0f0f0',
  },
  secondary: {
    background: 'rgba(255,255,255,0.15)',
    border: '1px solid rgba(255,255,255,0.25)',
  },
  ghost: {
    color: 'var(--color-text-primary)',
    background: 'rgba(255,255,255,0.05)',
  },
  danger: {
    background: 'var(--color-error-bg)',
  },
  'icon-only': {
    color: 'var(--color-text-primary)',
  },
};

import { useState } from 'react';

export default function Button({
  children,
  variant = 'primary',
  onClick,
  disabled = false,
  className = '',
  style: styleProp = {},
  type = 'button',
  title,
  size,
}) {
  const [hovered, setHovered] = useState(false);
  const [active, setActive] = useState(false);

  const isIconOnly = variant === 'icon-only';
  const height = isIconOnly ? '36px' : size === 'sm' ? '36px' : '42px';
  const padding = isIconOnly ? 'var(--space-2)' : size === 'sm' ? '0 var(--space-3)' : '0 var(--space-5)';

  const base = variantStyles[variant] || variantStyles.primary;
  const hover = hoverStyles[variant] || {};

  const mergedStyle = {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 'var(--space-2)',
    height,
    padding,
    borderRadius: 'var(--radius-md)',
    fontFamily: 'var(--font-body)',
    fontSize: 'var(--text-sm)',
    fontWeight: 'var(--weight-medium)',
    cursor: disabled ? 'not-allowed' : 'pointer',
    opacity: disabled ? 0.5 : 1,
    transition: `all var(--duration-normal) var(--ease-default)`,
    whiteSpace: 'nowrap',
    ...base,
    ...(hovered && !disabled ? hover : {}),
    ...(active && !disabled && variant === 'primary'
      ? { transform: 'scale(0.98)' }
      : {}),
    ...styleProp,
  };

  return (
    <button
      type={type}
      className={className}
      style={mergedStyle}
      onClick={disabled ? undefined : onClick}
      disabled={disabled}
      title={title}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => { setHovered(false); setActive(false); }}
      onMouseDown={() => setActive(true)}
      onMouseUp={() => setActive(false)}
    >
      {children}
    </button>
  );
}
