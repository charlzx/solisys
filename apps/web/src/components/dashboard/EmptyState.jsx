import { Sun } from 'lucide-react';

export default function EmptyState() {
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: 'var(--space-16) var(--space-4)',
      textAlign: 'center',
    }}>
      <div style={{
        width: '64px',
        height: '64px',
        borderRadius: 'var(--radius-lg)',
        background: 'rgba(0, 195, 201, 0.1)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 'var(--space-6)',
      }}>
        <Sun size={28} style={{ color: 'var(--color-primary-500)' }} />
      </div>
      <h3 style={{
        fontSize: 'var(--text-lg)',
        fontWeight: 'var(--weight-medium)',
        color: 'var(--color-text-primary)',
        fontFamily: 'var(--font-body)',
        margin: '0 0 var(--space-2) 0',
      }}>
        No projects yet
      </h3>
      <p style={{
        fontSize: 'var(--text-sm)',
        color: 'var(--color-text-secondary)',
        fontFamily: 'var(--font-body)',
        margin: 0,
        maxWidth: '340px',
        lineHeight: 'var(--leading-loose)',
      }}>
        Create your first solar system design to get started with load analysis, sizing, and cost estimation.
      </p>
    </div>
  );
}
