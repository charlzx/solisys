import { useState, useId } from 'react';
import { Info, ChevronDown } from 'lucide-react';
import Tooltip from './Tooltip';

export default function SelectField({
  label,
  tooltip,
  value,
  onChange,
  options = [],
  disabled = false,
  placeholder = 'Select...',
  helper,
  error,
  className = '',
  compact = false,
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
          position: 'relative',
          display: 'flex',
          alignItems: 'center',
          height,
          background: disabled ? 'var(--color-bg-surface)' : 'var(--color-bg-elevated)',
          border: `1px solid ${borderColor}`,
          borderRadius: 'var(--radius-sm)',
          boxShadow,
          transition: `border-color var(--duration-normal) var(--ease-default), box-shadow var(--duration-normal) var(--ease-default)`,
          opacity: disabled ? 0.5 : 1,
        }}
      >
        <select
          id={id}
          name={name}
          value={value ?? ''}
          onChange={onChange}
          disabled={disabled}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          style={{
            flex: 1,
            height: '100%',
            background: 'transparent',
            border: 'none',
            outline: 'none',
            color: value ? 'var(--color-text-primary)' : 'var(--color-text-muted)',
            fontFamily: 'var(--font-body)',
            fontSize: 'var(--text-base)',
            padding: '0 var(--space-8) 0 var(--space-3)',
            cursor: disabled ? 'not-allowed' : 'pointer',
            appearance: 'none',
            WebkitAppearance: 'none',
            width: '100%',
          }}
        >
          {placeholder && (
            <option value="" disabled>
              {placeholder}
            </option>
          )}
          {options.map((opt) => {
            const val = typeof opt === 'object' ? opt.value : opt;
            const lbl = typeof opt === 'object' ? opt.label : opt;
            return (
              <option key={val} value={val}>
                {lbl}
              </option>
            );
          })}
        </select>
        <ChevronDown
          size={16}
          style={{
            position: 'absolute',
            right: 'var(--space-3)',
            color: 'var(--color-text-muted)',
            pointerEvents: 'none',
          }}
        />
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
