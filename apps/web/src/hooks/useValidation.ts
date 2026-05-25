import { useMemo } from 'react';
import { runAllValidations } from '../lib/validation/rules.js';

export function useValidation(project, calculations, selectedPanel, selectedInverter, selectedBattery) {
  return useMemo(() => {
    if (!project || !calculations) return [];

    return runAllValidations({
      project,
      calculations,
      selectedPanel,
      selectedInverter,
      selectedBattery,
    });
  }, [project, calculations, selectedPanel, selectedInverter, selectedBattery]);
}
