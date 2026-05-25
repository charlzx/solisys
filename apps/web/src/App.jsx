import { useState, useCallback, useEffect } from 'react';
import Dashboard from './pages/Dashboard';
import Calculator from './pages/Calculator';
import Settings from './pages/Settings';
import { ToastProvider, useToast } from './context/ToastContext';
import { loadProjectsFromStorage, saveProjectsToStorage, createDefaultProject } from './lib/utils';

function parseRoute() {
  const path = window.location.pathname;
  const projectMatch = path.match(/^\/project\/([^/]+)/);
  if (projectMatch) return { page: 'calculator', projectId: projectMatch[1] };
  if (path === '/settings') return { page: 'settings', projectId: null };
  return { page: 'dashboard', projectId: null };
}

function AppInner() {
  const [route, setRoute] = useState(parseRoute);
  const [projects, setProjects] = useState(() => loadProjectsFromStorage());
  const { addToast } = useToast();

  useEffect(() => {
    const onPop = () => setRoute(parseRoute());
    window.addEventListener('popstate', onPop);
    return () => window.removeEventListener('popstate', onPop);
  }, []);

  const navigate = useCallback((page, projectId = null) => {
    let url = '/';
    if (page === 'calculator' && projectId) url = `/project/${projectId}`;
    else if (page === 'settings') url = '/settings';
    window.history.pushState(null, '', url);
    setRoute({ page, projectId });
  }, []);

  const refreshProjects = useCallback(() => {
    setProjects(loadProjectsFromStorage());
  }, []);

  const handleNewProject = useCallback(() => {
    const newProject = createDefaultProject({ projectName: 'Untitled Project' });
    const updated = [...projects, newProject];
    saveProjectsToStorage(updated);
    setProjects(updated);
    navigate('calculator', newProject.id);
  }, [projects, navigate]);

  const handleOpenProject = useCallback((id) => {
    navigate('calculator', id);
  }, [navigate]);

  const handleDeleteProject = useCallback((id) => {
    const updated = projects.filter((p) => p.id !== id);
    saveProjectsToStorage(updated);
    setProjects(updated);
  }, [projects]);

  const handleUpdateProject = useCallback((id, changes) => {
    const updated = projects.map((p) =>
      p.id === id ? { ...p, ...changes, lastUpdated: new Date().toISOString() } : p
    );
    saveProjectsToStorage(updated);
    setProjects(updated);
  }, [projects]);

  const handleDuplicateProject = useCallback((id) => {
    const source = projects.find(p => p.id === id);
    if (!source) return;
    const clone = {
      ...JSON.parse(JSON.stringify(source)),
      id: Date.now().toString(36) + Math.random().toString(36).slice(2, 7),
      projectName: (source.projectName || 'Untitled Project') + ' (Copy)',
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

  if (route.page === 'calculator' && route.projectId) {
    return (
      <Calculator
        projectId={route.projectId}
        onBack={handleBackToDashboard}
      />
    );
  }

  if (route.page === 'settings') {
    return <Settings onBack={handleBackToDashboard} />;
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
