import { AlertTriangle, XCircle, CheckCircle } from 'lucide-react';

const config = {
  warning: {
    bg: 'var(--color-warning-bg)',
    border: 'rgba(245, 158, 11, 0.3)',
    color: 'var(--color-warning)',
    Icon: AlertTriangle,
  },
  error: {
    bg: 'var(--color-error-bg)',
    border: 'rgba(239, 68, 68, 0.3)',
    color: 'var(--color-error)',
    Icon: XCircle,
  },
  success: {
    bg: 'var(--color-success-bg)',
    border: 'rgba(16, 185, 129, 0.3)',
    color: 'var(--color-success)',
    Icon: CheckCircle,
  },
};

export default function ValidationChip({
  status = 'success',
  message,
  size = 'sm',
  className = '',
}) {
  const cfg = config[status] || config.success;
  const { Icon } = cfg;
  const isMd = size === 'md';
  const iconSize = 14;

  return (
    <div
      className={className}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 'var(--space-2)',
        padding: isMd ? 'var(--space-2) var(--space-3)' : 'var(--space-1) var(--space-2)',
        background: cfg.bg,
        border: `1px solid ${cfg.border}`,
        borderRadius: 'var(--radius-sm)',
        fontSize: isMd ? 'var(--text-sm)' : 'var(--text-xs)',
        color: cfg.color,
        fontFamily: 'var(--font-body)',
        lineHeight: 'var(--leading-normal)',
      }}
    >
      <Icon size={iconSize} style={{ flexShrink: 0 }} />
      {message && <span>{message}</span>}
    </div>
  );
}
