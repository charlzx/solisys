import { useState, useCallback, useEffect } from 'react';
import Dashboard from './pages/Dashboard';
import Calculator from './pages/Calculator';
import Settings from './pages/Settings';
import Marketing from './pages/Marketing';
import { ToastProvider, useToast } from './context/ToastContext';
import { loadProjectsFromStorage, saveProjectsToStorage, createDefaultProject } from './lib/utils';

// ─── Router ──────────────────────────────────────────────────────────────────
type Page = 'marketing' | 'dashboard' | 'calculator' | 'settings';

interface Route {
  page: Page;
  projectId: string | null;
}

function parseRoute(): Route {
  const path = window.location.pathname;
  if (path === '/' || path === '') return { page: 'marketing', projectId: null };
  const projectMatch = path.match(/^\/app\/project\/([^/]+)/);
  if (projectMatch) return { page: 'calculator', projectId: projectMatch[1] };
  if (path === '/app/settings') return { page: 'settings', projectId: null };
  if (path.startsWith('/app')) return { page: 'dashboard', projectId: null };
  return { page: 'marketing', projectId: null };
}

// ─── App (inner, has Toast context) ──────────────────────────────────────────
function AppInner() {
  const [route, setRoute] = useState<Route>(parseRoute);
  const [projects, setProjects] = useState(() => loadProjectsFromStorage());
  const { addToast } = useToast();

  const [theme, setTheme] = useState<'dark' | 'light'>(() => {
    const stored = localStorage.getItem('solisys-theme');
    if (stored === 'light' || stored === 'dark') return stored;
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  });

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('solisys-theme', theme);
  }, [theme]);

  const toggleTheme = useCallback(() => {
    setTheme(t => t === 'dark' ? 'light' : 'dark');
  }, []);

  useEffect(() => {
    const onPop = () => setRoute(parseRoute());
    window.addEventListener('popstate', onPop);
    return () => window.removeEventListener('popstate', onPop);
  }, []);

  const navigate = useCallback((page: Page, projectId: string | null = null) => {
    let url = '/';
    if (page === 'calculator' && projectId) url = `/app/project/${projectId}`;
    else if (page === 'settings') url = '/app/settings';
    else if (page === 'dashboard') url = '/app';
    window.history.pushState(null, '', url);
    setRoute({ page, projectId });
  }, []);

  const refreshProjects = useCallback(() => {
    setProjects(loadProjectsFromStorage());
  }, []);

  const handleNewProject = useCallback((projectData?: { projectName: string; clientName?: string; sizingMode?: 'simple' | 'pro' }) => {
    const newProject = createDefaultProject({
      projectName: projectData?.projectName || 'Untitled Project',
      clientName: projectData?.clientName || '',
      sizingMode: projectData?.sizingMode || 'pro',
    });
    const updated = [...projects, newProject];
    saveProjectsToStorage(updated);
    setProjects(updated);
    navigate('calculator', newProject.id);
  }, [projects, navigate]);

  const handleOpenProject = useCallback((id: string) => {
    navigate('calculator', id);
  }, [navigate]);

  const handleDeleteProject = useCallback((id: string) => {
    const updated = projects.filter((p: { id: string }) => p.id !== id);
    saveProjectsToStorage(updated);
    setProjects(updated);
  }, [projects]);

  const handleUpdateProject = useCallback((id: string, changes: Record<string, unknown>) => {
    const updated = projects.map((p: { id: string }) =>
      p.id === id ? { ...p, ...changes, lastUpdated: new Date().toISOString() } : p
    );
    saveProjectsToStorage(updated);
    setProjects(updated);
  }, [projects]);

  const handleDuplicateProject = useCallback((id: string) => {
    const source = projects.find((p: { id: string }) => p.id === id);
    if (!source) return;
    const clone = {
      ...(JSON.parse(JSON.stringify(source)) as Record<string, unknown>),
      id: Date.now().toString(36) + Math.random().toString(36).slice(2, 7),
      projectName: ((source as { projectName?: string }).projectName || 'Untitled Project') + ' (Copy)',
      lastUpdated: new Date().toISOString(),
    };
    const updated = [...projects, clone];
    saveProjectsToStorage(updated);
    setProjects(updated);
    addToast('Project duplicated', 'success');
  }, [projects, addToast]);

  const handleBackToDashboard = useCallback(() => {
    refreshProjects();
    navigate('dashboard');
  }, [refreshProjects, navigate]);

  const handleOpenSettings = useCallback(() => {
    navigate('settings');
  }, [navigate]);

  // Marketing page (root)
  if (route.page === 'marketing') {
    return <Marketing theme={theme} onToggleTheme={toggleTheme} />;
  }

  if (route.page === 'calculator' && route.projectId) {
    return (
      <Calculator
        projectId={route.projectId}
        onBack={handleBackToDashboard}
        theme={theme}
        onToggleTheme={toggleTheme}
      />
    );
  }

  if (route.page === 'settings') {
    return <Settings onBack={handleBackToDashboard} theme={theme} onToggleTheme={toggleTheme} />;
  }

  return (
    <Dashboard
      projects={projects}
      onOpenProject={handleOpenProject}
      onNewProject={handleNewProject}
      onDeleteProject={handleDeleteProject}
      onUpdateProject={handleUpdateProject}
      onDuplicateProject={handleDuplicateProject}
      onOpenSettings={handleOpenSettings}
      theme={theme}
      onToggleTheme={toggleTheme}
    />
  );
}

export default function App() {
  return (
    <ToastProvider>
      <AppInner />
    </ToastProvider>
  );
}
