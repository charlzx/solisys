import { useState, useCallback } from 'react';
import { loadCustomComponents, saveCustomComponents } from '../lib/utils.js';

export function useComponentDatabase() {
  const [panels, setPanels] = useState(() => loadCustomComponents('Panels'));
  const [batteries, setBatteries] = useState(() => loadCustomComponents('Batteries'));
  const [inverters, setInverters] = useState(() => loadCustomComponents('Inverters'));

  const addCustomComponent = useCallback((type, component) => {
    const newComponent = { ...component, id: component.id || `custom_${Date.now()}`, isCustom: true };

    if (type === 'panels') {
      setPanels(prev => {
        const updated = [...prev, newComponent];
        saveCustomComponents('Panels', updated);
        return updated;
      });
    } else if (type === 'batteries') {
      setBatteries(prev => {
        const updated = [...prev, newComponent];
        saveCustomComponents('Batteries', updated);
        return updated;
      });
    } else if (type === 'inverters') {
      setInverters(prev => {
        const updated = [...prev, newComponent];
        saveCustomComponents('Inverters', updated);
        return updated;
      });
    }
  }, []);

  const removeCustomComponent = useCallback((type, componentId) => {
    if (type === 'panels') {
      setPanels(prev => {
        const updated = prev.filter(c => c.id !== componentId);
        saveCustomComponents('Panels', updated);
        return updated;
      });
    } else if (type === 'batteries') {
      setBatteries(prev => {
        const updated = prev.filter(c => c.id !== componentId);
        saveCustomComponents('Batteries', updated);
        return updated;
      });
    } else if (type === 'inverters') {
      setInverters(prev => {
        const updated = prev.filter(c => c.id !== componentId);
        saveCustomComponents('Inverters', updated);
        return updated;
      });
    }
  }, []);

  return { panels, batteries, inverters, addCustomComponent, removeCustomComponent };
}
