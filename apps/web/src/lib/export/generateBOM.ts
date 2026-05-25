import { getCurrencySymbol } from '../utils.js';

export function generateBOM(project, calculations) {
  const curr = getCurrencySymbol(project.currency);
  const rows = [
    ['Component', 'Description', 'Qty', 'Unit', `Unit Cost (${curr})`, `Total (${curr})`],
  ];

  const panelDesc = project.panelWattage ? `${project.panelWattage}W Solar Panel` : 'Solar Panel';
  rows.push([
    'Solar Panel',
    panelDesc,
    calculations.numberOfPanels,
    'pcs',
    project.costPerPanel || 0,
    calculations.numberOfPanels * (project.costPerPanel || 0),
  ]);

  rows.push([
    'Battery',
    `${project.availableBatteryAh}Ah ${project.availableBatteryVoltage}V`,
    calculations.totalNumberOfBatteries,
    'pcs',
    project.costPerBattery || 0,
    calculations.totalNumberOfBatteries * (project.costPerBattery || 0),
  ]);

  rows.push([
    'Inverter',
    `${calculations.selectedInverterKva} kVA`,
    1,
    'pcs',
    project.inverterCost || 0,
    project.inverterCost || 0,
  ]);

  if (!project.hasBuiltInController) {
    rows.push([
      'Charge Controller',
      `${calculations.chargeControllerAmps}A MPPT`,
      1,
      'pcs',
      project.controllerCost || 0,
      project.controllerCost || 0,
    ]);
  }

  rows.push([
    'Solar Cable',
    'DC Array Wiring',
    project.solarCableLength || 0,
    'm',
    project.solarCableCostPerMeter || 0,
    (project.solarCableLength || 0) * (project.solarCableCostPerMeter || 0),
  ]);

  rows.push([
    'Electrical Cable',
    'AC / Battery Wiring',
    project.electricalCableLength || 0,
    'm',
    project.electricalCableCostPerMeter || 0,
    (project.electricalCableLength || 0) * (project.electricalCableCostPerMeter || 0),
  ]);

  rows.push(['Installation', 'Labor & Setup', 1, 'lot', project.installationCost || 0, project.installationCost || 0]);
  rows.push(['Breakers', 'Circuit Protection', 1, 'lot', project.breakers || 0, project.breakers || 0]);
  rows.push(['Connectors', 'MC4 & Terminals', 1, 'lot', project.connectors || 0, project.connectors || 0]);
  rows.push(['Mounting Structure', 'Racking & Rails', 1, 'lot', project.mountingStructure || 0, project.mountingStructure || 0]);
  rows.push(['Permits', 'Permits & Inspection', 1, 'lot', project.permits || 0, project.permits || 0]);
  rows.push(['Miscellaneous', 'Other costs', 1, 'lot', project.miscOther || 0, project.miscOther || 0]);

  const total = rows.slice(1).reduce((sum, r) => sum + Number(r[5]), 0);
  rows.push(['', '', '', '', 'TOTAL', total]);

  const csvContent = rows.map(r =>
    r.map(cell => {
      const str = String(cell);
      if (str.includes(',') || str.includes('"') || str.includes('\n')) {
        return `"${str.replace(/"/g, '""')}"`;
      }
      return str;
    }).join(',')
  ).join('\n');

  return csvContent;
}

export function downloadBOM(project, calculations) {
  const csv = generateBOM(project, calculations);
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${project.projectName || 'solisys'}_BOM.csv`;
  a.click();
  URL.revokeObjectURL(url);
}
