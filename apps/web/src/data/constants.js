export const PSH_OPTIONS = [
  { value: 2, label: '2 Hours (Very Low / Heavy Cloud)' },
  { value: 3, label: '3 Hours (Heavy Clouds / Shade)' },
  { value: 4, label: '4 Hours (Cloudy Regions)' },
  { value: 5, label: '5 Hours (Standard Average)' },
  { value: 6, label: '6 Hours (Sunnier Regions)' },
  { value: 7, label: '7 Hours (Desert / Tropical)' },
  { value: 8, label: '8 Hours (Extreme Sun)' },
  { value: 9, label: '9 Hours (Peak Desert)' },
];

export const BATTERY_DOD_OPTIONS = [
  { value: 0.95, label: 'Lithium LiFePO4 (95% DoD)' },
  { value: 0.90, label: 'Lithium-ion (90% DoD)' },
  { value: 0.85, label: 'Lithium LiFePO4 (85% DoD)' },
  { value: 0.80, label: 'LiFePO4 / Tubular (80% DoD)' },
  { value: 0.75, label: 'Tubular (75% DoD)' },
  { value: 0.70, label: 'Tubular (70% DoD)' },
  { value: 0.50, label: 'Lead-Acid (50% DoD)' },
];

export const CURRENCY_OPTIONS = [
  { value: 'NGN', label: '₦ Nigerian Naira (NGN)', symbol: '₦' },
  { value: 'USD', label: '$ US Dollar (USD)', symbol: '$' },
  { value: 'EUR', label: '€ Euro (EUR)', symbol: '€' },
  { value: 'GBP', label: '£ British Pound (GBP)', symbol: '£' },
  { value: 'GHS', label: '₵ Ghanaian Cedi (GHS)', symbol: '₵' },
  { value: 'KES', label: 'KSh Kenyan Shilling (KES)', symbol: 'KSh' },
];

export const SYSTEM_VOLTAGE_OPTIONS = [
  { value: 12, label: '12V' },
  { value: 24, label: '24V' },
  { value: 48, label: '48V' },
  { value: 96, label: '96V' },
  { value: 120, label: '120V' },
  { value: 192, label: '192V' },
];

export const SYSTEM_TYPE_OPTIONS = [
  { value: 'off-grid', label: 'Off-Grid', description: 'No grid connection — fully self-sufficient', icon: 'Sun' },
  { value: 'hybrid', label: 'Hybrid', description: 'Unreliable grid — solar + battery with grid backup', icon: 'Zap' },
  { value: 'grid-tied', label: 'Grid-Tied', description: 'Reliable grid — solar offsets bill, batteries optional', icon: 'Grid' },
];

export const INVERTER_SIZES_KVA = [1, 1.5, 2, 2.5, 3, 4, 5, 8, 10, 12, 15, 20, 25, 30];
export const INVERTER_QUICK_SELECT_MAX = 12;

export const BATTERY_VOLTAGE_MAP = {
  3.2: 3.2,
  6: 6,
  12: 12,
  12.8: 12,
  24: 24,
  25.6: 24,
  48: 48,
  51.2: 48,
  96: 96,
  102.4: 96,
  120: 120,
  128: 120,
  192: 192,
  204.8: 192,
};

export function getNominalVoltage(actualVoltage) {
  const v = Number(actualVoltage) || 0;
  if (BATTERY_VOLTAGE_MAP[v] !== undefined) return BATTERY_VOLTAGE_MAP[v];
  const nominals = [12, 24, 48, 96, 120, 192];
  for (const nom of nominals) {
    if (v >= nom * 0.9 && v <= nom * 1.15) return nom;
  }
  return v;
}

export const INVERTER_SAFETY_FACTOR = 1.25;
export const CHARGE_CONTROLLER_SAFETY_FACTOR = 1.25;
export const POWER_FACTOR = 0.8;

export const STANDARD_CONTROLLER_SIZES = [10, 20, 30, 40, 60, 80, 100, 120, 150, 200];

export const TEMP_MIN_C = -10;
export const TEMP_MAX_C = 70;
export const TEMP_STC = 25;

export const NAV_SECTIONS = [
  { id: 'load', label: 'Load Analysis', step: '01', icon: 'Zap' },
  { id: 'inverter', label: 'Inverter Sizing', step: '02', icon: 'Power' },
  { id: 'battery', label: 'Battery Bank', step: '03', icon: 'BatteryCharging' },
  { id: 'solar', label: 'Solar Array', step: '04', icon: 'Sun' },
  { id: 'wire', label: 'Wire Sizing', step: '05', icon: 'Cable' },
  { id: 'diagram', label: 'Single-Line Diagram', step: '06', icon: 'GitBranch' },
  { id: 'cost', label: 'Cost Estimation', step: '07', icon: 'DollarSign' },
  { id: 'export', label: 'Export & Report', step: '08', icon: 'FileDown' },
];
