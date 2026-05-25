import { formatNumber, formatCurrency } from '../utils.js';

export function generateReportData(project, calculations, selectedPanel, selectedInverter, selectedBattery) {
  const systemType = project.systemType || 'off-grid';
  const systemTypeLabel = systemType === 'grid-tied' ? 'Grid-Tied' : systemType === 'hybrid' ? 'Hybrid' : 'Off-Grid';

  return {
    cover: {
      projectName: project.projectName || 'Untitled Project',
      clientName: project.clientName || '',
      date: new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }),
      createdAt: project.createdAt,
    },
    systemType,
    systemTypeLabel,
    summary: {
      arrayKw: formatNumber(calculations.actualArrayKw, 2),
      batteryKwh: formatNumber(calculations.requiredBankCapacityWh / 1000, 1),
      inverterKva: formatNumber(calculations.selectedInverterKva, 1),
      dailyLoadKwh: formatNumber(calculations.totalDailyKwh, 2),
      peakLoadW: formatNumber(calculations.estimatedPeakLoadW, 0),
      numberOfPanels: calculations.numberOfPanels,
      panelWattage: project.panelWattage,
      panelModel: selectedPanel ? `${selectedPanel.manufacturer} ${selectedPanel.model}` : `${project.panelWattage}W Panel`,
      totalBatteries: calculations.totalNumberOfBatteries,
      batteriesInSeries: calculations.batteriesInSeries,
      parallelStrings: calculations.numberOfParallelStrings,
      batteryModel: selectedBattery ? `${selectedBattery.manufacturer} ${selectedBattery.model}` : `${project.availableBatteryAh}Ah ${project.availableBatteryVoltage}V`,
      inverterModel: selectedInverter ? `${selectedInverter.manufacturer} ${selectedInverter.model}` : `${calculations.selectedInverterKva} kVA`,
      chargeControllerAmps: calculations.chargeControllerAmps,
      hasBuiltInController: project.hasBuiltInController,
      systemVoltage: project.batteryVoltage,
      daysOfAutonomy: project.daysOfAutonomy,
    },
    loadAnalysis: {
      method: project.calcMethod,
      appliances: project.appliances || [],
      totalDailyWh: calculations.totalDailyWh,
      totalDailyKwh: calculations.totalDailyKwh,
    },
    wireSizing: {
      dcArray: calculations.wires.dcArray,
      dcBattery: calculations.wires.dcBattery,
      ac: calculations.wires.ac,
    },
    costSummary: {
      breakdown: calculations.costBreakdown || [],
      totalCost: calculations.totalCost,
      currency: project.currency,
      formattedTotal: formatCurrency(calculations.totalCost, project.currency),
    },
  };
}

export function downloadProjectJSON(project) {
  const data = JSON.stringify(project, null, 2);
  const blob = new Blob([data], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${project.projectName || 'solisys'}.solisys.json`;
  a.click();
  URL.revokeObjectURL(url);
}
