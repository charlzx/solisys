import { useState } from 'react';
import {
  Zap, Power, BatteryCharging, Sun, Cable, GitBranch, DollarSign, FileDown,
  ChevronLeft, ChevronRight, BookOpen, Home,
} from 'lucide-react';
import { NAV_SECTIONS } from '../../data/constants';

const PROGRESS_SECTION_IDS_DEFAULT = ['load', 'inverter', 'battery', 'solar'];
const PROGRESS_SECTION_IDS_GRID_TIED = ['load', 'inverter', 'solar'];

const iconMap = {
  Zap,
  Power,
  BatteryCharging,
  Sun,
  Cable,
  GitBranch,
  DollarSign,
  FileDown,
};

const statusColors = {
  complete: 'var(--color-success)',
  'in-progress': 'var(--color-primary-500)',
  empty: 'rgba(255,255,255,0.2)',
};

export default function Sidebar({
  activeSection = '',
  sectionStatuses = {},
  onNavigate,
  onBackToDashboard,
  collapsed = false,
  onToggleCollapse,
  visible = true,
  isMobile = false,
  onInterpret,
  systemType = 'off-grid',
}) {
  const PROGRESS_SECTION_IDS = systemType === 'grid-tied' ? PROGRESS_SECTION_IDS_GRID_TIED : PROGRESS_SECTION_IDS_DEFAULT;
  const [hoveredId, setHoveredId] = useState(null);

  const width = collapsed ? '64px' : '240px';

  return (
    <nav
      style={{
        position: 'fixed',
        top: '56px',
        left: 0,
        width: isMobile ? '260px' : width,
        height: 'calc(100vh - 56px)',
        background: 'rgba(15, 15, 17, 0.98)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        borderRight: '1px solid rgba(255,255,255,0.10)',
        display: 'flex',
        flexDirection: 'column',
        zIndex: 50,
        transition: `transform var(--duration-normal) var(--ease-default), width var(--duration-normal) var(--ease-default)`,
        overflow: 'hidden',
        transform: visible ? 'translateX(0)' : 'translateX(-100%)',
      }}
    >
      <div style={{ flex: 1, padding: 'var(--space-2)', overflowY: 'auto' }}>
        {isMobile && onBackToDashboard && (
          <button
            onClick={onBackToDashboard}
            onMouseEnter={() => setHoveredId('dashboard')}
            onMouseLeave={() => setHoveredId(null)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 'var(--space-3)',
              width: '100%',
              padding: 'var(--space-2) var(--space-3)',
              marginBottom: 'var(--space-1)',
              background: hoveredId === 'dashboard' ? 'rgba(255,255,255,0.05)' : 'transparent',
              border: 'none',
              borderRadius: 'var(--radius-md)',
              cursor: 'pointer',
              transition: `all var(--duration-normal) var(--ease-default)`,
              borderBottom: '1px solid rgba(255,255,255,0.05)',
              paddingBottom: 'var(--space-3)',
            }}
          >
            <Home size={16} style={{ color: 'var(--color-text-secondary)', flexShrink: 0 }} />
            <span style={{
              fontFamily: 'var(--font-body)',
              fontSize: 'var(--text-sm)',
              color: 'var(--color-text-secondary)',
              fontWeight: 'var(--weight-medium)',
            }}>
              Dashboard
            </span>
          </button>
        )}
        {NAV_SECTIONS.map((section) => {
          const Icon = iconMap[section.icon] || Zap;
          const isActive = activeSection === section.id;
          const isHovered = hoveredId === section.id;
          const sectionStatus = sectionStatuses[section.id] || 'empty';

          return (
            <button
              key={section.id}
              onClick={() => onNavigate?.(section.id)}
              onMouseEnter={() => setHoveredId(section.id)}
              onMouseLeave={() => setHoveredId(null)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 'var(--space-3)',
                width: '100%',
                padding: collapsed && !isMobile ? 'var(--space-3)' : 'var(--space-2) var(--space-3)',
                marginBottom: 'var(--space-1)',
                background: isActive
                  ? 'rgba(0, 195, 201, 0.08)'
                  : isHovered
                  ? 'rgba(255,255,255,0.05)'
                  : 'transparent',
                border: 'none',
                borderRadius: 'var(--radius-md)',
                borderLeft: isActive ? '2px solid var(--color-primary-500)' : '2px solid transparent',
                cursor: 'pointer',
                transition: `all var(--duration-normal) var(--ease-default)`,
                justifyContent: collapsed && !isMobile ? 'center' : 'flex-start',
              }}
              title={collapsed && !isMobile ? `${section.step} — ${section.label}` : undefined}
            >
              <div style={{ position: 'relative', flexShrink: 0 }}>
                <Icon
                  size={16}
                  style={{
                    color: isActive ? 'var(--color-primary-500)' : 'var(--color-text-secondary)',
                  }}
                />
                <span
                  style={{
                    position: 'absolute',
                    top: '-2px',
                    right: '-4px',
                    width: '6px',
                    height: '6px',
                    borderRadius: 'var(--radius-full)',
                    background: statusColors[sectionStatus],
                  }}
                />
              </div>

              {(!collapsed || isMobile) && (
                <>
                  <span
                    style={{
                      fontFamily: 'var(--font-numeric)',
                      fontSize: 'var(--text-xs)',
                      color: isActive ? 'var(--color-primary-400)' : 'var(--color-text-muted)',
                      flexShrink: 0,
                      width: '18px',
                    }}
                  >
                    {section.step}
                  </span>
                  <span
                    style={{
                      fontFamily: 'var(--font-body)',
                      fontSize: '15px',
                      color: isActive ? 'var(--color-text-primary)' : 'var(--color-text-secondary)',
                      fontWeight: isActive ? 'var(--weight-medium)' : 'var(--weight-regular)',
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      textAlign: 'left',
                    }}
                  >
                    {section.label}
                  </span>
                </>
              )}
            </button>
          );
        })}
      </div>

      {(() => {
        const totalSections = PROGRESS_SECTION_IDS.length;
        const completedSections = PROGRESS_SECTION_IDS.filter(
          (id) => sectionStatuses[id] === 'complete'
        ).length;
        const progressPercent = totalSections > 0 ? (completedSections / totalSections) * 100 : 0;
        const allCoreComplete = completedSections === totalSections;

        return (
          <div
            style={{
              borderTop: '1px solid rgba(255,255,255,0.05)',
            }}
          >
            <div
              style={{
                padding: collapsed ? 'var(--space-3) var(--space-2)' : 'var(--space-3) var(--space-3)',
              }}
            >
              {!collapsed && (
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: 'var(--space-2)',
                  }}
                >
                  <span
                    style={{
                      fontFamily: 'var(--font-body)',
                      fontSize: 'var(--text-xs)',
                      color: 'var(--color-text-muted)',
                    }}
                  >
                    Progress
                  </span>
                  <span
                    style={{
                      fontFamily: 'var(--font-numeric)',
                      fontSize: 'var(--text-xs)',
                      color: completedSections === totalSections ? 'var(--color-success)' : 'var(--color-text-secondary)',
                    }}
                  >
                    {completedSections}/{totalSections} complete
                  </span>
                </div>
              )}
              <div
                style={{
                  width: '100%',
                  height: '4px',
                  borderRadius: 'var(--radius-full)',
                  background: 'rgba(255,255,255,0.08)',
                  overflow: 'hidden',
                }}
                title={`${completedSections}/${totalSections} sections complete`}
              >
                <div
                  style={{
                    width: `${progressPercent}%`,
                    height: '100%',
                    borderRadius: 'var(--radius-full)',
                    background: 'var(--color-primary-500)',
                    transition: 'width var(--duration-normal) var(--ease-default)',
                  }}
                />
              </div>
            </div>

            {onInterpret && (
              <div style={{ padding: '0 var(--space-3) var(--space-2)' }}>
                <button
                  onClick={onInterpret}
                  onMouseEnter={() => setHoveredId('interpret')}
                  onMouseLeave={() => setHoveredId(null)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: collapsed ? 'center' : 'flex-start',
                    gap: 'var(--space-2)',
                    width: '100%',
                    padding: 'var(--space-2) var(--space-3)',
                    background: allCoreComplete
                      ? hoveredId === 'interpret'
                        ? 'rgba(0, 195, 201, 0.15)'
                        : 'rgba(0, 195, 201, 0.08)'
                      : hoveredId === 'interpret'
                        ? 'rgba(255,255,255,0.05)'
                        : 'transparent',
                    border: allCoreComplete ? '1px solid rgba(0, 195, 201, 0.2)' : '1px solid transparent',
                    borderRadius: 'var(--radius-md)',
                    color: allCoreComplete ? 'var(--color-primary-500)' : 'var(--color-text-muted)',
                    cursor: 'pointer',
                    transition: `all var(--duration-normal) var(--ease-default)`,
                    fontFamily: 'var(--font-body)',
                    fontSize: collapsed ? 'var(--text-xs)' : 'var(--text-sm)',
                    fontWeight: 'var(--weight-medium)',
                  }}
                  title={allCoreComplete ? 'Interpret your solar design results' : 'Complete all core sections first'}
                >
                  <BookOpen size={14} style={{ flexShrink: 0 }} />
                  {!collapsed && <span>Interpret Results</span>}
                </button>
              </div>
            )}

            {!isMobile && (
              <div style={{ padding: '0 var(--space-3) var(--space-3)' }}>
                <button
                  onClick={onToggleCollapse}
                  onMouseEnter={() => setHoveredId('collapse')}
                  onMouseLeave={() => setHoveredId(null)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: collapsed ? 'center' : 'flex-start',
                    gap: 'var(--space-2)',
                    width: '100%',
                    padding: 'var(--space-2) var(--space-3)',
                    background: hoveredId === 'collapse' ? 'rgba(255,255,255,0.05)' : 'transparent',
                    border: 'none',
                    borderRadius: 'var(--radius-md)',
                    color: 'var(--color-text-muted)',
                    cursor: 'pointer',
                    transition: `all var(--duration-normal) var(--ease-default)`,
                    fontFamily: 'var(--font-body)',
                    fontSize: 'var(--text-xs)',
                  }}
                  title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
                >
                  {collapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
                  {!collapsed && <span>Collapse</span>}
                </button>
              </div>
            )}
          </div>
        );
      })()}
    </nav>
  );
}
