import { useState, useMemo } from 'react';
import { Search, Plus, Settings, Sun, ArrowRight, ArrowUpDown, GitCompare } from 'lucide-react';
import Button from '../components/ui/Button';
import InputField from '../components/ui/InputField';
import Modal from '../components/ui/Modal';
import ProjectCard from '../components/dashboard/ProjectCard';
import EmptyState from '../components/dashboard/EmptyState';
import CompareModal from '../components/dashboard/CompareModal';

export default function Dashboard({ projects = [], onOpenProject, onNewProject, onDeleteProject, onUpdateProject, onDuplicateProject, onOpenSettings }) {
  const [search, setSearch] = useState('');
  const [deleteId, setDeleteId] = useState(null);
  const [editId, setEditId] = useState(null);
  const [editName, setEditName] = useState('');
  const [editClient, setEditClient] = useState('');
  const [searchFocused, setSearchFocused] = useState(false);
  const [sortBy, setSortBy] = useState('dateUpdated');
  const [compareMode, setCompareMode] = useState(false);
  const [compareSelection, setCompareSelection] = useState([]);
  const [compareOpen, setCompareOpen] = useState(false);

  const handleToggleCompare = () => {
    if (compareMode) {
      setCompareMode(false);
      setCompareSelection([]);
    } else {
      setCompareMode(true);
      setCompareSelection([]);
    }
  };

  const handleCompareSelect = (id) => {
    setCompareSelection((prev) => {
      if (prev.includes(id)) return prev.filter((x) => x !== id);
      if (prev.length >= 2) return [prev[1], id];
      return [...prev, id];
    });
  };

  const handleOpenCompare = () => {
    if (compareSelection.length === 2) {
      setCompareOpen(true);
    }
  };

  const handleEditStart = (id) => {
    const p = projects.find(proj => proj.id === id);
    if (p) {
      setEditId(id);
      setEditName(p.projectName || '');
      setEditClient(p.clientName || '');
    }
  };

  const handleEditSave = () => {
    if (editId) {
      onUpdateProject?.(editId, { projectName: editName, clientName: editClient });
      setEditId(null);
    }
  };

  const filtered = useMemo(() => {
    if (!search.trim()) return projects;
    const q = search.toLowerCase();
    return projects.filter(
      (p) =>
        (p.projectName || '').toLowerCase().includes(q) ||
        (p.clientName || '').toLowerCase().includes(q)
    );
  }, [projects, search]);

  const sorted = useMemo(() => {
    return [...filtered].sort((a, b) => {
      if (sortBy === 'nameAZ') return (a.projectName || '').localeCompare(b.projectName || '');
      if (sortBy === 'nameZA') return (b.projectName || '').localeCompare(a.projectName || '');
      return new Date(b.lastUpdated) - new Date(a.lastUpdated);
    });
  }, [filtered, sortBy]);

  const handleConfirmDelete = () => {
    if (deleteId) {
      onDeleteProject?.(deleteId);
      setDeleteId(null);
    }
  };

  const totalProjects = projects.length;

  return (
    <div style={{
      minHeight: '100vh',
      background: 'var(--color-bg-base)',
      position: 'relative',
    }}>
      <div className="dash-grid" />

      <div style={{
        position: 'relative',
        zIndex: 1,
        display: 'flex',
        justifyContent: 'center',
      }}>
        <div style={{
          width: '100%',
          maxWidth: '800px',
          padding: 'var(--space-8) var(--space-4) var(--space-12)',
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: 'var(--space-12)',
            paddingTop: 'var(--space-8)',
          }}>
            <div />
            <Button variant="ghost" onClick={onOpenSettings} title="Settings">
              <Settings size={18} />
            </Button>
          </div>

          <div style={{ textAlign: 'center', marginBottom: 'var(--space-16)' }}>
            <div style={{ position: 'relative', display: 'inline-block' }}>
              <div style={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                width: '300px',
                height: '120px',
                background: 'rgba(0, 195, 201, 0.08)',
                filter: 'blur(60px)',
                borderRadius: '50%',
                pointerEvents: 'none',
              }} />
              <h1 style={{
                fontFamily: 'var(--font-display)',
                fontSize: 'clamp(2.25rem, 6vw, 3.5rem)',
                fontWeight: 'var(--weight-medium)',
                color: 'var(--color-text-primary)',
                letterSpacing: 'var(--tracking-tighter)',
                margin: 0,
                lineHeight: 1.1,
                position: 'relative',
              }}>
                SOLISYS
              </h1>
            </div>
            <p style={{
              fontSize: 'var(--text-md)',
              color: 'var(--color-text-secondary)',
              fontFamily: 'var(--font-body)',
              marginTop: 'var(--space-3)',
              fontWeight: 'var(--weight-regular)',
              lineHeight: 'var(--leading-normal)',
            }}>
              Solar System Design & Calculation Platform
            </p>

            {totalProjects > 0 && (
              <div style={{
                display: 'flex',
                justifyContent: 'center',
                gap: 'var(--space-8)',
                marginTop: 'var(--space-8)',
              }}>
                <StatBlock icon={<Sun size={14} />} value={`${totalProjects} ${totalProjects === 1 ? 'Project' : 'Projects'}`} />
              </div>
            )}
          </div>

          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 'var(--space-3)',
            marginBottom: 'var(--space-6)',
            flexWrap: 'wrap',
          }}>
            <div style={{
              position: 'relative',
              flex: '1 1 200px',
              maxWidth: '360px',
            }}>
              <Search
                size={16}
                style={{
                  position: 'absolute',
                  left: 'var(--space-3)',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: searchFocused ? 'var(--color-primary-500)' : 'var(--color-text-muted)',
                  pointerEvents: 'none',
                  transition: 'color var(--duration-normal) var(--ease-default)',
                }}
              />
              <input
                type="text"
                placeholder="Search projects..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onFocus={() => setSearchFocused(true)}
                onBlur={() => setSearchFocused(false)}
                style={{
                  width: '100%',
                  height: '42px',
                  paddingLeft: 'var(--space-10)',
                  paddingRight: 'var(--space-4)',
                  background: 'rgba(255,255,255,0.05)',
                  border: `1px solid ${searchFocused ? 'var(--color-primary-500)' : 'rgba(255,255,255,0.10)'}`,
                  borderRadius: 'var(--radius-md)',
                  color: 'var(--color-text-primary)',
                  fontFamily: 'var(--font-body)',
                  fontSize: 'var(--text-sm)',
                  outline: 'none',
                  boxSizing: 'border-box',
                  transition: 'border-color var(--duration-normal) var(--ease-default)',
                  backdropFilter: 'blur(12px)',
                }}
              />
            </div>

            <div style={{ position: 'relative', flex: '0 0 auto' }}>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                style={{
                  height: '42px',
                  padding: '0 var(--space-8) 0 var(--space-3)',
                  background: 'rgba(255,255,255,0.05)',
                  border: '1px solid rgba(255,255,255,0.10)',
                  borderRadius: 'var(--radius-md)',
                  color: 'var(--color-text-secondary)',
                  fontFamily: 'var(--font-body)',
                  fontSize: 'var(--text-sm)',
                  outline: 'none',
                  cursor: 'pointer',
                  appearance: 'none',
                  WebkitAppearance: 'none',
                  backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='rgba(255,255,255,0.4)' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E")`,
                  backgroundRepeat: 'no-repeat',
                  backgroundPosition: 'right 8px center',
                }}
              >
                <option value="dateUpdated" style={{ background: '#1a1a2e', color: '#ccc' }}>Date Updated</option>
                <option value="nameAZ" style={{ background: '#1a1a2e', color: '#ccc' }}>Name A–Z</option>
                <option value="nameZA" style={{ background: '#1a1a2e', color: '#ccc' }}>Name Z–A</option>
              </select>
            </div>

            {projects.length >= 2 && (
              <Button
                variant={compareMode ? 'primary' : 'secondary'}
                onClick={handleToggleCompare}
                title="Compare two projects"
              >
                <GitCompare size={16} />
                {compareMode ? 'Cancel' : 'Compare'}
              </Button>
            )}

            <Button variant="primary" onClick={onNewProject}>
              <Plus size={16} />
              New Project
            </Button>
          </div>

          {compareMode && (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: 'var(--space-3) var(--space-4)',
              marginBottom: 'var(--space-4)',
              background: 'rgba(0, 195, 201, 0.08)',
              border: '1px solid rgba(0, 195, 201, 0.2)',
              borderRadius: 'var(--radius-md)',
              fontFamily: 'var(--font-body)',
              fontSize: 'var(--text-sm)',
              color: 'var(--color-text-secondary)',
            }}>
              <span>
                Select 2 projects to compare ({compareSelection.length}/2 selected)
              </span>
              <Button
                variant="primary"
                size="sm"
                disabled={compareSelection.length !== 2}
                onClick={handleOpenCompare}
              >
                Compare
              </Button>
            </div>
          )}

          {projects.length === 0 ? (
            <EmptyState />
          ) : sorted.length === 0 ? (
            <div style={{
              textAlign: 'center',
              padding: 'var(--space-12)',
              color: 'var(--color-text-muted)',
              fontFamily: 'var(--font-body)',
              fontSize: 'var(--text-sm)',
            }}>
              No projects match your search.
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
              {sorted.map((project) => (
                <div
                  key={project.id}
                  style={{
                    display: 'flex',
                    alignItems: 'stretch',
                    gap: 'var(--space-2)',
                  }}
                >
                  {compareMode && (
                    <div
                      onClick={() => handleCompareSelect(project.id)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        width: '36px',
                        flexShrink: 0,
                        cursor: 'pointer',
                      }}
                    >
                      <div style={{
                        width: '20px',
                        height: '20px',
                        borderRadius: 'var(--radius-sm)',
                        border: compareSelection.includes(project.id)
                          ? '2px solid var(--color-primary-500)'
                          : '2px solid rgba(255,255,255,0.15)',
                        background: compareSelection.includes(project.id)
                          ? 'var(--color-primary-500)'
                          : 'transparent',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        transition: 'all var(--duration-fast) var(--ease-default)',
                        fontSize: '12px',
                        color: 'var(--color-text-inverse)',
                        fontWeight: 'bold',
                      }}>
                        {compareSelection.includes(project.id) && '✓'}
                      </div>
                    </div>
                  )}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <ProjectCard
                      project={project}
                      onOpen={compareMode ? () => handleCompareSelect(project.id) : onOpenProject}
                      onEdit={handleEditStart}
                      onDelete={(id) => setDeleteId(id)}
                      onDuplicate={onDuplicateProject}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}

          <Modal
            isOpen={!!deleteId}
            onClose={() => setDeleteId(null)}
            title="Delete Project"
          >
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
              <p style={{
                fontSize: 'var(--text-sm)',
                color: 'var(--color-text-secondary)',
                fontFamily: 'var(--font-body)',
                margin: 0,
              }}>
                Are you sure you want to delete this project? This action cannot be undone.
              </p>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 'var(--space-3)' }}>
                <Button variant="secondary" onClick={() => setDeleteId(null)}>
                  Cancel
                </Button>
                <Button variant="danger" onClick={handleConfirmDelete}>
                  Delete
                </Button>
              </div>
            </div>
          </Modal>

          <Modal
            isOpen={!!editId}
            onClose={() => setEditId(null)}
            title="Edit Project"
          >
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
              <InputField
                label="Project Name"
                type="text"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                placeholder="Project name"
              />
              <InputField
                label="Client Name"
                type="text"
                value={editClient}
                onChange={(e) => setEditClient(e.target.value)}
                placeholder="Client name (optional)"
              />
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 'var(--space-3)' }}>
                <Button variant="secondary" onClick={() => setEditId(null)}>
                  Cancel
                </Button>
                <Button variant="primary" onClick={handleEditSave}>
                  Save
                </Button>
              </div>
            </div>
          </Modal>

          <CompareModal
            isOpen={compareOpen}
            onClose={() => setCompareOpen(false)}
            projectA={projects.find((p) => p.id === compareSelection[0])}
            projectB={projects.find((p) => p.id === compareSelection[1])}
          />
        </div>
      </div>
    </div>
  );
}

function StatBlock({ icon, value, label }) {
  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      gap: 'var(--space-2)',
      color: 'var(--color-primary-500)',
    }}>
      {icon}
      <span style={{
        fontSize: 'var(--text-lg)',
        fontWeight: 'var(--weight-medium)',
        fontFamily: 'var(--font-body)',
        color: 'var(--color-text-secondary)',
        letterSpacing: 'var(--tracking-wide)',
      }}>
        {value}
      </span>
      {label && (
        <span style={{
          fontSize: 'var(--text-sm)',
          color: 'var(--color-text-muted)',
          fontFamily: 'var(--font-body)',
        }}>
          {label}
        </span>
      )}
    </div>
  );
}
