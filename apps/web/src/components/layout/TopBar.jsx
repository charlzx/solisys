import { useState, useRef, useEffect } from 'react';
import { ArrowLeft, Download, Check, Menu, BarChart3, Undo2, Redo2 } from 'lucide-react';
import Button from '../ui/Button';

export default function TopBar({
  projectName = '',
  onProjectNameChange,
  saveStatus = 'saved',
  onBack,
  onExport,
  onUndo,
  onRedo,
  canUndo = false,
  canRedo = false,
  onToggleSidebar,
  onToggleOutput,
  isMobile = false,
  isDesktop = true,
}) {
  const [editing, setEditing] = useState(false);
  const [editValue, setEditValue] = useState(projectName);
  const inputRef = useRef(null);

  useEffect(() => {
    setEditValue(projectName);
  }, [projectName]);

  useEffect(() => {
    if (editing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [editing]);

  const handleBlur = () => {
    setEditing(false);
    if (editValue.trim() && editValue !== projectName) {
      onProjectNameChange?.(editValue.trim());
    } else {
      setEditValue(projectName);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.target.blur();
    } else if (e.key === 'Escape') {
      setEditValue(projectName);
      setEditing(false);
    }
  };

  const statusConfig = {
    saved: { label: 'Saved', color: 'var(--color-success)', pulse: false },
    saving: { label: 'Saving...', color: 'var(--color-primary-500)', pulse: true },
    unsaved: { label: 'Unsaved changes', color: 'var(--color-primary-500)', pulse: false },
    error: { label: 'Save error', color: 'var(--color-error)', pulse: false },
  };

  const status = statusConfig[saveStatus] || statusConfig.saved;

  return (
    <header
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        height: '56px',
        background: 'rgba(9, 9, 11, 0.95)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        borderBottom: '1px solid rgba(255,255,255,0.10)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: isMobile ? '0 var(--space-2)' : '0 var(--space-4)',
        zIndex: 100,
        gap: 'var(--space-2)',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: isMobile ? 'var(--space-2)' : 'var(--space-4)', minWidth: 0, flex: 1 }}>
        {!isDesktop && onToggleSidebar && (
          <Button variant="icon-only" onClick={onToggleSidebar} title="Toggle Navigation">
            <Menu size={18} />
          </Button>
        )}

        {!isMobile && (
          <Button variant="icon-only" onClick={onBack} title="Back to Dashboard" style={{ marginRight: 'var(--space-1)' }}>
            <ArrowLeft size={18} />
          </Button>
        )}

        {!isMobile && (
          <>
            <span
              style={{
                fontFamily: 'var(--font-display)',
                fontSize: '15px',
                fontWeight: 'var(--weight-medium)',
                color: 'var(--color-primary-500)',
                letterSpacing: 'var(--tracking-tight)',
                flexShrink: 0,
              }}
            >
              SOLISYS
            </span>

            <span style={{ color: 'rgba(255,255,255,0.10)', flexShrink: 0 }}>|</span>
          </>
        )}

        {editing ? (
          <input
            ref={inputRef}
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            onBlur={handleBlur}
            onKeyDown={handleKeyDown}
            style={{
              background: 'rgba(255,255,255,0.05)',
              border: '1px solid var(--color-primary-500)',
              borderRadius: 'var(--radius-sm)',
              color: 'var(--color-text-primary)',
              fontFamily: 'var(--font-body)',
              fontSize: isMobile ? 'var(--text-sm)' : '15px',
              padding: '2px var(--space-2)',
              outline: 'none',
              minWidth: 0,
              maxWidth: isMobile ? '140px' : '300px',
              flex: 1,
            }}
          />
        ) : (
          <span
            onClick={() => setEditing(true)}
            style={{
              color: 'var(--color-text-primary)',
              fontFamily: 'var(--font-body)',
              fontSize: isMobile ? 'var(--text-sm)' : '15px',
              fontWeight: 'var(--weight-medium)',
              cursor: 'pointer',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
              minWidth: 0,
            }}
            title="Click to edit project name"
          >
            {projectName || 'Untitled Project'}
          </span>
        )}

        {saveStatus === 'unsaved' && (
          <span
            style={{
              width: '8px',
              height: '8px',
              borderRadius: 'var(--radius-full)',
              background: 'var(--color-primary-500)',
              flexShrink: 0,
            }}
          />
        )}
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-1)', flexShrink: 0 }}>
        {!isMobile && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '2px', marginRight: 'var(--space-2)' }}>
            <Button
              variant="icon-only"
              onClick={onUndo}
              disabled={!canUndo}
              title="Undo (Ctrl+Z)"
              style={{ opacity: canUndo ? 0.7 : 0.2 }}
            >
              <Undo2 size={15} />
            </Button>
            <Button
              variant="icon-only"
              onClick={onRedo}
              disabled={!canRedo}
              title="Redo (Ctrl+Shift+Z)"
              style={{ opacity: canRedo ? 0.7 : 0.2 }}
            >
              <Redo2 size={15} />
            </Button>
          </div>
        )}

        {!isMobile && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 'var(--space-2)',
              marginRight: 'var(--space-3)',
            }}
          >
            <span
              style={{
                width: '8px',
                height: '8px',
                borderRadius: 'var(--radius-full)',
                background: status.color,
                flexShrink: 0,
                ...(status.pulse ? { animation: 'statusPulse 1.5s ease-in-out infinite' } : {}),
              }}
            />
            <span
              style={{
                fontSize: '13px',
                color: 'var(--color-text-secondary)',
                fontFamily: 'var(--font-body)',
                whiteSpace: 'nowrap',
              }}
            >
              {status.label}
            </span>
          </div>
        )}

        {isMobile ? (
          <span
            style={{
              width: '8px',
              height: '8px',
              borderRadius: 'var(--radius-full)',
              background: status.color,
              flexShrink: 0,
              marginRight: 'var(--space-2)',
              ...(status.pulse ? { animation: 'statusPulse 1.5s ease-in-out infinite' } : {}),
            }}
          />
        ) : null}

        {isMobile ? (
          <Button variant="icon-only" onClick={onExport} title="Export">
            <Download size={16} />
          </Button>
        ) : (
          <Button variant="secondary" size="sm" onClick={onExport}>
            <Download size={14} />
            Export
          </Button>
        )}

      </div>

      <style>{`
        @keyframes statusPulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.3; }
        }
      `}</style>
    </header>
  );
}
