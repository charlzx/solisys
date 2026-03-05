import { useState } from 'react';
import { X, Copy, Check, BookOpen, Download } from 'lucide-react';
import Button from './ui/Button';
import { downloadInterpretationPDF } from '../lib/export/generateInterpretationPDF';

export default function InterpretModal({ text, onClose, projectName }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text.replace(/## /g, '').replace(/\*\*/g, ''));
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      const ta = document.createElement('textarea');
      ta.value = text.replace(/## /g, '').replace(/\*\*/g, '');
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleDownloadPDF = () => {
    downloadInterpretationPDF(text, projectName);
  };

  const sections = text.split(/^## /m).filter(Boolean).map((block) => {
    const [title, ...rest] = block.split('\n');
    return { title: title.trim(), content: rest.join('\n').trim() };
  });

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 200,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 'var(--space-4)',
      }}
    >
      <div
        onClick={onClose}
        style={{
          position: 'absolute',
          inset: 0,
          background: 'rgba(0,0,0,0.7)',
          backdropFilter: 'blur(4px)',
        }}
      />

      <div
        style={{
          position: 'relative',
          width: '100%',
          maxWidth: '680px',
          maxHeight: '85vh',
          background: '#0f0f11',
          border: '1px solid rgba(255,255,255,0.10)',
          borderRadius: 'var(--radius-xl)',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            padding: 'var(--space-4) var(--space-5)',
            borderBottom: '1px solid rgba(255,255,255,0.08)',
          }}
        >
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
              <BookOpen size={18} style={{ color: 'var(--color-primary-500)', flexShrink: 0 }} />
              <div>
                <h2 style={{
                  fontSize: 'var(--text-lg)',
                  fontFamily: 'var(--font-body)',
                  fontWeight: 'var(--weight-semibold)',
                  color: 'var(--color-text-primary)',
                  margin: 0,
                }}>
                  System Interpretation
                </h2>
                <p style={{
                  fontSize: 'var(--text-xs)',
                  color: 'var(--color-text-muted)',
                  margin: 0,
                }}>
                  Plain-language breakdown of your solar design
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              style={{
                background: 'transparent',
                border: 'none',
                borderRadius: 'var(--radius-md)',
                width: 32,
                height: 32,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                color: 'var(--color-text-secondary)',
                flexShrink: 0,
              }}
            >
              <X size={16} />
            </button>
          </div>

          <div style={{ display: 'flex', gap: 'var(--space-2)', marginTop: 'var(--space-3)' }}>
            <Button variant="secondary" size="sm" onClick={handleDownloadPDF}>
              <Download size={14} />
              PDF
            </Button>
            <Button variant="secondary" size="sm" onClick={handleCopy}>
              {copied ? <Check size={14} /> : <Copy size={14} />}
              {copied ? 'Copied' : 'Copy'}
            </Button>
          </div>
        </div>

        <div
          style={{
            flex: 1,
            overflowY: 'auto',
            padding: 'var(--space-5)',
          }}
        >
          {sections.map((section, idx) => (
            <div key={idx} style={{ marginBottom: 'var(--space-5)' }}>
              <h3 style={{
                fontSize: 'var(--text-sm)',
                fontFamily: 'var(--font-body)',
                fontWeight: 'var(--weight-semibold)',
                color: 'var(--color-primary-500)',
                textTransform: 'uppercase',
                letterSpacing: 'var(--tracking-wide)',
                marginBottom: 'var(--space-2)',
              }}>
                {section.title}
              </h3>
              {section.content.split('\n\n').filter(Boolean).map((para, pIdx) => (
                <p key={pIdx} style={{
                  fontSize: 'var(--text-sm)',
                  fontFamily: 'var(--font-body)',
                  color: para.startsWith('Note:') || para.startsWith('Tip:')
                    ? 'var(--color-warning)'
                    : 'var(--color-text-secondary)',
                  lineHeight: '1.7',
                  margin: `0 0 var(--space-2) 0`,
                  ...(para.startsWith('Note:') || para.startsWith('Tip:') ? {
                    background: 'rgba(234, 179, 8, 0.08)',
                    padding: 'var(--space-2) var(--space-3)',
                    borderRadius: 'var(--radius-sm)',
                    borderLeft: '3px solid var(--color-warning)',
                  } : {}),
                }}>
                  {para}
                </p>
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
