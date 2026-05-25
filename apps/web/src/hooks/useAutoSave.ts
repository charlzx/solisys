import { useState, useEffect, useRef, useCallback } from 'react';
import { loadProjectsFromStorage, saveProjectsToStorage } from '../lib/utils.js';

export function useAutoSave(project, delay = 800) {
  const [saveStatus, setSaveStatus] = useState('saved');
  const timerRef = useRef(null);
  const lastSavedRef = useRef(null);

  const saveNow = useCallback((proj) => {
    try {
      const projects = loadProjectsFromStorage();
      const index = projects.findIndex(p => p.id === proj.id);
      if (index >= 0) {
        projects[index] = proj;
      } else {
        projects.push(proj);
      }
      const success = saveProjectsToStorage(projects);
      setSaveStatus(success ? 'saved' : 'error');
      if (success) {
        lastSavedRef.current = proj.lastUpdated;
      }
    } catch {
      setSaveStatus('error');
    }
  }, []);

  useEffect(() => {
    if (!project || !project.id) return;

    if (lastSavedRef.current === project.lastUpdated) return;

    setSaveStatus('unsaved');

    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }

    timerRef.current = setTimeout(() => {
      setSaveStatus('saving');
      saveNow(project);
    }, delay);

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, [project, delay, saveNow]);

  return { saveStatus, saveNow: () => saveNow(project) };
}
