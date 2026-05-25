import { useState, useId } from 'react';
import { Info } from 'lucide-react';
import Tooltip from './Tooltip';

export default function InputField({
  label,
  tooltip,
  type = 'text',
  value,
  onChange,
  unit,
  prefix,
  helper,
  error,
  disabled = false,
  readOnly = false,
  placeholder,
  compact = false,
  className = '',
  min,
  max,
  step,
  name,
}) {
  const [focused, setFocused] = useState(false);
  const id = useId();

  const height = compact ? '36px' : '42px';

  const borderColor = error
    ? 'var(--color-error)'
    : focused
    ? 'var(--color-primary-500)'
    : 'var(--color-border-default)';

  const boxShadow = error
    ? '0 0 0 3px rgba(239, 68, 68, 0.15)'
    : focused
    ? '0 0 0 3px var(--color-primary-glow)'
    : 'none';

  return (
    <div className={className} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-1)' }}>
      {label && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
          <label
            htmlFor={id}
            style={{
              fontSize: 'var(--text-sm)',
              color: 'var(--color-text-secondary)',
              fontFamily: 'var(--font-body)',
              fontWeight: 'var(--weight-medium)',
            }}
          >
            {label}
          </label>
          {tooltip && (
            <Tooltip content={tooltip}>
              <Info size={14} style={{ color: 'var(--color-text-muted)', cursor: 'help' }} />
            </Tooltip>
          )}
        </div>
      )}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          height,
          background: disabled ? 'var(--color-bg-surface)' : 'var(--color-bg-elevated)',
          border: `1px solid ${borderColor}`,
          borderRadius: 'var(--radius-sm)',
          boxShadow,
          transition: `border-color var(--duration-normal) var(--ease-default), box-shadow var(--duration-normal) var(--ease-default)`,
          opacity: disabled ? 0.5 : 1,
          padding: '0 var(--space-3)',
          gap: 'var(--space-2)',
        }}
      >
        {prefix && (
          <span style={{ color: 'var(--color-text-secondary)', display: 'flex', flexShrink: 0 }}>
            {prefix}
          </span>
        )}
        <input
          id={id}
          name={name}
          type={type}
          value={value ?? ''}
          onChange={onChange}
          disabled={disabled}
          readOnly={readOnly}
          placeholder={placeholder}
          min={min}
          max={max}
          step={step}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          style={{
            flex: 1,
            background: 'transparent',
            border: 'none',
            outline: 'none',
            color: 'var(--color-text-primary)',
            fontFamily: type === 'number' ? 'var(--font-numeric)' : 'var(--font-body)',
            fontSize: 'var(--text-base)',
            width: '100%',
            minWidth: 0,
          }}
        />
        {unit && (
          <span
            style={{
              color: 'var(--color-text-muted)',
              fontSize: 'var(--text-sm)',
              letterSpacing: 'var(--tracking-wide)',
              flexShrink: 0,
              fontFamily: 'var(--font-body)',
            }}
          >
            {unit}
          </span>
        )}
      </div>
      {(helper || error) && (
        <span
          style={{
            fontSize: 'var(--text-xs)',
            color: error ? 'var(--color-error)' : 'var(--color-text-muted)',
            fontFamily: 'var(--font-body)',
          }}
        >
          {error || helper}
        </span>
      )}
    </div>
  );
}
