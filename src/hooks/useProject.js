import { useState, useCallback } from 'react';
import { createDefaultProject, loadProjectsFromStorage, saveProjectsToStorage, migrateProject } from '../lib/utils.js';

function sanitizeValue(field, value) {
  if (value === null || value === undefined) return value;

  if (typeof value === 'string') {
    const sanitized = value.replace(/<[^>]*>/g, '').slice(0, 500);
    return sanitized;
  }

  if (typeof value === 'number') {
    if (!isFinite(value)) return 0;
    return value;
  }

  return value;
}

export function useProject(projectId) {
  const [project, setProject] = useState(() => {
    if (!projectId) return createDefaultProject();
    const projects = loadProjectsFromStorage();
    const found = projects.find(p => p.id === projectId);
    return found ? migrateProject(found) : createDefaultProject({ id: projectId });
  });

  const updateField = useCallback((field, value) => {
    const safe = sanitizeValue(field, value);
    setProject(prev => ({
      ...prev,
      [field]: safe,
      lastUpdated: new Date().toISOString(),
    }));
  }, []);

  const updateAppliance = useCallback((applianceId, field, value) => {
    const safe = sanitizeValue(field, value);
    setProject(prev => ({
      ...prev,
      lastUpdated: new Date().toISOString(),
      appliances: prev.appliances.map(a =>
        a.id === applianceId ? { ...a, [field]: safe } : a
      ),
    }));
  }, []);

  const addAppliance = useCallback(() => {
    const newAppliance = {
      id: Date.now().toString(36) + Math.random().toString(36).slice(2, 7),
      name: '',
      quantity: 1,
      wattage: 0,
      unit: 'W',
      hours: 0,
    };
    setProject(prev => ({
      ...prev,
      lastUpdated: new Date().toISOString(),
      appliances: [...prev.appliances, newAppliance],
    }));
  }, []);

  const removeAppliance = useCallback((applianceId) => {
    setProject(prev => ({
      ...prev,
      lastUpdated: new Date().toISOString(),
      appliances: prev.appliances.filter(a => a.id !== applianceId),
    }));
  }, []);

  return { project, setProject, updateField, updateAppliance, addAppliance, removeAppliance };
}
