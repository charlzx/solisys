export const formatNumber = (num, decimals = 2) => {
  if (num === null || num === undefined || isNaN(num)) return '—';
  return Number(num).toLocaleString(undefined, {
    minimumFractionDigits: 0,
    maximumFractionDigits: decimals,
  });
};

export const formatCurrency = (amount, currencyCode = 'NGN') => {
  const symbols = { NGN: '₦', USD: '$', EUR: '€', GBP: '£', GHS: '₵', KES: 'KSh' };
  const symbol = symbols[currencyCode] || '₦';
  if (amount === null || amount === undefined || isNaN(amount)) return `${symbol}—`;
  return `${symbol}${Number(amount).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
};

export const getCurrencySymbol = (currencyCode) => {
  const symbols = { NGN: '₦', USD: '$', EUR: '€', GBP: '£', GHS: '₵', KES: 'KSh' };
  return symbols[currencyCode] || '₦';
};

export const formatAutonomy = (daysOfAutonomy) => {
  const total = Number(daysOfAutonomy) || 0;
  const days = Math.floor(total);
  const hours = Math.round((total % 1) * 24);
  if (days > 0 && hours > 0) return `${days}d ${hours}h`;
  if (days > 0) return `${days} day${days !== 1 ? 's' : ''}`;
  if (hours > 0) return `${hours} hour${hours !== 1 ? 's' : ''}`;
  return '0 days';
};

const loadUserDefaults = () => {
  try {
    const raw = localStorage.getItem('solisys_settings');
    if (raw) return JSON.parse(raw);
  } catch {}
  return {};
};

export const createDefaultProject = (overrides = {}) => {
  const userDefaults = loadUserDefaults();
  return {
  id: Date.now().toString(36) + Math.random().toString(36).slice(2, 7),
  projectName: '',
  clientName: '',
  createdAt: new Date().toISOString(),
  lastUpdated: new Date().toISOString(),
  systemType: userDefaults.defaultSystemType || 'off-grid',
  currency: userDefaults.defaultCurrency || 'NGN',
  notes: '',
  calcMethod: 'audit',
  dailyEnergyKwh: 0,
  appliances: [],
  peakLoad: 0,
  isPeakLoadCustom: false,
  selectedInverterKva: 0,
  selectedInverterId: null,
  daysOfAutonomy: 1,
  batteryDoD: 0.8,
  batteryVoltage: Number(userDefaults.defaultSystemVoltage) || 48,
  availableBatteryAh: 200,
  availableBatteryVoltage: 12,
  selectedBatteryId: null,
  peakSunHours: Number(userDefaults.defaultPsh) || 5,
  systemEfficiency: userDefaults.defaultEfficiency ? Math.round(Number(userDefaults.defaultEfficiency) * 100) : 80,
  panelWattage: 450,
  selectedPanelId: null,
  panelsPerString: 0,
  hasBuiltInController: false,
  dcArrayCableLength: 10,
  dcBatteryCableLength: 2,
  acOutputCableLength: 15,
  maxVoltageDrop_dcArray: 2,
  maxVoltageDrop_dcBattery: 1,
  maxVoltageDrop_ac: 3,
  costPerPanel: 0,
  costPerBattery: 0,
  inverterCost: 0,
  controllerCost: 0,
  installationCost: 0,
  solarCableLength: 0,
  solarCableCostPerMeter: 0,
  electricalCableLength: 0,
  electricalCableCostPerMeter: 0,
  breakers: 0,
  connectors: 0,
  mountingStructure: 0,
  permits: 0,
  miscOther: 0,
  netMeterCost: 0,
  gridConnectionCost: 0,
  transferSwitchCost: 0,
  ...overrides,
  };
};

function sanitizeString(val, maxLen = 500) {
  if (typeof val !== 'string') return '';
  return val.replace(/<[^>]*>/g, '').slice(0, maxLen);
}

function sanitizeNumber(val, fallback = 0) {
  const n = Number(val);
  if (!isFinite(n)) return fallback;
  return n;
}

export const migrateProject = (raw) => {
  const defaults = createDefaultProject();
  const migrated = { ...defaults };
  for (const key of Object.keys(defaults)) {
    if (raw[key] !== undefined) {
      const def = defaults[key];
      if (typeof def === 'number') {
        migrated[key] = sanitizeNumber(raw[key], def);
      } else if (typeof def === 'string') {
        migrated[key] = sanitizeString(raw[key]);
      } else if (typeof def === 'boolean') {
        migrated[key] = !!raw[key];
      } else {
        migrated[key] = raw[key];
      }
    }
  }
  migrated.id = raw.id || defaults.id;
  migrated.createdAt = raw.createdAt || defaults.createdAt;
  if (raw.appliances && Array.isArray(raw.appliances)) {
    migrated.appliances = raw.appliances.map(a => ({
      id: a.id || Date.now(),
      name: sanitizeString(a.name, 200),
      quantity: sanitizeNumber(a.quantity, 1),
      wattage: sanitizeNumber(a.wattage, 0),
      unit: ['W', 'HP'].includes(a.unit) ? a.unit : 'W',
      hours: sanitizeNumber(a.hours, 0),
    }));
  }
  return migrated;
};

export const loadProjectsFromStorage = () => {
  try {
    const raw = localStorage.getItem('solarProjects');
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return parsed.map(migrateProject);
  } catch {
    return [];
  }
};

export const saveProjectsToStorage = (projects) => {
  try {
    localStorage.setItem('solarProjects', JSON.stringify(projects));
    return true;
  } catch {
    return false;
  }
};

export const loadCustomComponents = (type) => {
  try {
    const raw = localStorage.getItem(`custom${type}`);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch {
    return [];
  }
};

export const saveCustomComponents = (type, components) => {
  try {
    localStorage.setItem(`custom${type}`, JSON.stringify(components));
    return true;
  } catch {
    return false;
  }
};

export const timeAgo = (dateString) => {
  const date = new Date(dateString);
  const now = new Date();
  const diff = now - date;
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);
  if (minutes < 1) return 'Just now';
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days < 30) return `${days}d ago`;
  return date.toLocaleDateString();
};
