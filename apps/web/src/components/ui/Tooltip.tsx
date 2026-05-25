import { useState, useRef, useEffect } from 'react';

export default function Tooltip({ content, children, placement = 'top' }) {
  const [visible, setVisible] = useState(false);
  const triggerRef = useRef(null);

  if (!content) return children;

  useEffect(() => {
    if (!visible) return;
    const handleClickOutside = (e) => {
      if (triggerRef.current && !triggerRef.current.contains(e.target)) {
        setVisible(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [visible]);

  const placementStyles = {
    top: {
      bottom: '100%',
      left: '50%',
      transform: 'translateX(-50%)',
      marginBottom: 'var(--space-2)',
    },
    bottom: {
      top: '100%',
      left: '50%',
      transform: 'translateX(-50%)',
      marginTop: 'var(--space-2)',
    },
  };

  return (
    <span
      ref={triggerRef}
      style={{ position: 'relative', display: 'inline-flex' }}
      onMouseEnter={() => setVisible(true)}
      onMouseLeave={() => setVisible(false)}
      onClick={(e) => { e.stopPropagation(); setVisible((v) => !v); }}
    >
      {children}
      {visible && (
        <div
          style={{
            position: 'absolute',
            ...placementStyles[placement],
            zIndex: 400,
            background: '#1c1c20',
            border: '1px solid var(--color-border-default)',
            borderRadius: 'var(--radius-sm)',
            padding: 'var(--space-2) var(--space-3)',
            fontSize: 'var(--text-xs)',
            color: 'var(--color-text-secondary)',
            fontFamily: 'var(--font-body)',
            maxWidth: '320px',
            minWidth: '200px',
            boxShadow: '0 4px 20px rgba(0,0,0,0.5)',
            whiteSpace: 'normal',
            lineHeight: 'var(--leading-normal)',
            pointerEvents: 'none',
          }}
        >
          {content}
        </div>
      )}
    </span>
  );
}
