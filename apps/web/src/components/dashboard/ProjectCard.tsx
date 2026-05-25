import { useState } from 'react';
import { Edit2, Trash2, ArrowRight, Copy } from 'lucide-react';
import Button from '../ui/Button';
import { formatNumber, timeAgo } from '../../lib/utils';

export default function ProjectCard({ project, onOpen, onEdit, onDelete, onDuplicate }) {
  const [hovered, setHovered] = useState(false);

  const dailyKwh = project.calcMethod === 'audit'
    ? (project.appliances || []).reduce((sum, a) => {
        const w = a.unit === 'HP' ? a.wattage * 746 : a.wattage;
        return sum + (a.quantity || 0) * (w || 0) * (a.hours || 0);
      }, 0) / 1000
    : project.dailyEnergyKwh || 0;

  const pills = [];
  if (dailyKwh > 0) pills.push(`${formatNumber(dailyKwh, 1)} kWh/day`);
  if (project.selectedInverterKva > 0) pills.push(`${project.selectedInverterKva} kVA`);
  if (project.batteryVoltage) pills.push(`${project.batteryVoltage}V`);

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={() => onOpen?.(project.id)}
      style={{
        background: hovered ? 'rgba(255,255,255,0.08)' : 'rgba(255,255,255,0.05)',
        border: `1px solid ${hovered ? 'rgba(255,255,255,0.15)' : 'rgba(255,255,255,0.05)'}`,
        borderRadius: 'var(--radius-lg)',
        padding: 'var(--space-4) var(--space-5)',
        cursor: 'pointer',
        transition: `all var(--duration-normal) var(--ease-default)`,
        transform: hovered ? 'translateY(-1px)' : 'none',
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'center',
        gap: 'var(--space-3)',
        minHeight: '80px',
      }}
    >
      <div style={{ flex: '1 1 200px', minWidth: 0 }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: 'var(--space-2)',
        }}>
          <div style={{
            width: '8px',
            height: '8px',
            borderRadius: 'var(--radius-full)',
            background: dailyKwh > 0 ? 'var(--color-primary-500)' : 'rgba(255,255,255,0.2)',
            flexShrink: 0,
          }} />
          <span style={{
            fontSize: 'var(--text-base)',
            fontWeight: 'var(--weight-medium)',
            color: 'var(--color-text-primary)',
            fontFamily: 'var(--font-body)',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}>
            {project.projectName || 'Untitled Project'}
          </span>
        </div>
        {project.clientName && (
          <div style={{
            fontSize: 'var(--text-sm)',
            color: 'var(--color-text-secondary)',
            fontFamily: 'var(--font-body)',
            marginTop: '2px',
            paddingLeft: 'var(--space-5)',
          }}>
            {project.clientName}
          </div>
        )}
        <div style={{
          fontSize: '11px',
          color: 'var(--color-text-muted)',
          fontFamily: 'var(--font-body)',
          marginTop: 'var(--space-1)',
          paddingLeft: 'var(--space-5)',
        }}>
          Updated {timeAgo(project.lastUpdated)}
        </div>
      </div>

      {pills.length > 0 && (
        <div style={{
          display: 'flex',
          gap: 'var(--space-2)',
          flexWrap: 'wrap',
          flex: '0 1 auto',
        }}>
          {pills.map((pill) => (
            <span
              key={pill}
              style={{
                padding: '2px var(--space-2)',
                borderRadius: 'var(--radius-sm)',
                background: 'rgba(255,255,255,0.08)',
                fontSize: '10px',
                color: 'var(--color-text-secondary)',
                fontFamily: 'var(--font-numeric)',
                whiteSpace: 'nowrap',
                textTransform: 'uppercase',
                letterSpacing: 'var(--tracking-widest)',
              }}
            >
              {pill}
            </span>
          ))}
        </div>
      )}

      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 'var(--space-1)',
          flex: '0 0 auto',
          marginLeft: 'auto',
          opacity: hovered ? 1 : 0.4,
          transition: `opacity var(--duration-normal) var(--ease-default)`,
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <Button
          variant="ghost"
          size="sm"
          onClick={(e) => { e.stopPropagation(); onEdit?.(project.id); }}
          title="Edit project"
        >
          <Edit2 size={14} />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={(e) => { e.stopPropagation(); onDuplicate?.(project.id); }}
          title="Duplicate project"
        >
          <Copy size={14} />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={(e) => { e.stopPropagation(); onDelete?.(project.id); }}
          title="Delete project"
        >
          <Trash2 size={14} style={{ color: 'var(--color-error)' }} />
        </Button>
        <span style={{
          color: 'var(--color-primary-500)',
          fontSize: 'var(--text-xs)',
          display: 'flex',
          alignItems: 'center',
        }}>
          <ArrowRight size={16} />
        </span>
      </div>
    </div>
  );
}
