// ─── PSH City Database ─────────────────────────────────────────────────────

export interface PshCity {
  id: string;
  city: string;
  country: string;
  lat: number;
  lon: number;
  pshMonthly: [number, number, number, number, number, number,
               number, number, number, number, number, number];
  pshAnnual: number;
}

// ─── Inputs ────────────────────────────────────────────────────────────────

export interface Appliance {
  quantity: number;
  wattage: number;
  hours: number;
  unit: 'W' | 'kW' | 'HP';
  surgeMultiplier?: number;
}

export interface StringDesignInput {
  vocStc: number;
  vmpStc: number;
  isc: number;
  tempCoeffVoc: number;
  tempCoeffPmax: number;
  mpptRangeMinV: number;
  mpptRangeMaxV: number;
  maxPvInputV: number;
  maxPvInputA?: number;
  tempMinC?: number;
  tempMaxC?: number;
}

export interface WireSizingConfig {
  dcArrayLengthM: number;
  dcBatteryLengthM: number;
  acOutputLengthM: number;
  maxDropDcArrayPct?: number;
  maxDropDcBatteryPct?: number;
  maxDropAcPct?: number;
  phase?: 'single' | 'three';
  outputVoltageV?: number;
}

export interface FullSystemInput {
  // Load — one of these is required
  appliances?: Appliance[];
  dailyEnergyKwh?: number;
  peakLoadW?: number;

  // Location
  peakSunHours: number;

  // System
  systemVoltageV: number;
  systemEfficiencyPct: number;
  systemType?: 'off-grid' | 'hybrid' | 'grid-tied';

  // Inverter
  selectedInverterKva?: number;
  phase?: 'single' | 'three';

  // Battery
  batteryDoD: number;
  daysOfAutonomy: number;
  batteryVoltageV: number;
  batteryCapacityAh: number;
  customBatteryCount?: number;

  // Solar
  panelWattageW: number;
  panelsPerString?: number;
  panelSpec?: StringDesignInput;
  controllerType?: 'mppt' | 'pwm';
  customPanelCount?: number;

  // Wire sizing (optional)
  wireSizing?: WireSizingConfig;
}

// ─── Outputs ───────────────────────────────────────────────────────────────

export interface BatteryConfiguration {
  batteriesInSeries: number;
  numberOfParallelStrings: number;
  totalBatteries: number;
}

export interface WireSizingResult {
  currentA: number;
  minCrossSectionMm2: number;
  recommendedMm2: number;
  recommendedAwg: string;
  actualVoltageDropPct: number;
}

export interface StringDesignResult {
  vocAtMinTemp: number;
  vmpAtMaxTemp: number;
  panelsPerStringMin: number;
  panelsPerStringMax: number;
  validRangeExists: boolean;
}

export interface FullSystemResult {
  load: {
    totalDailyWh: number;
    estimatedPeakLoadW: number;
  };
  inverter: {
    requiredKva: number;
    recommendedKva: number;
    selectedKva: number;
  };
  battery: {
    totalStorageWh: number;
    requiredBankWh: number;
    requiredBankAh: number;
    batteriesInSeries: number;
    numberOfParallelStrings: number;
    totalBatteries: number;
  };
  solar: {
    requiredArrayW: number;
    numberOfPanels: number;
    actualArrayKwp: number;
    numberOfStrings?: number;
    panelsPerString?: number;
    stringDesign?: StringDesignResult;
    chargeControllerA: number;
  };
  wire?: {
    dcArray: WireSizingResult;
    dcBattery: WireSizingResult;
    acOutput: WireSizingResult;
  };
}
