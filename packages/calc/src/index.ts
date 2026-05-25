// ─── Types ─────────────────────────────────────────────────────────────────
export type {
  PshCity,
  Appliance,
  StringDesignInput,
  WireSizingConfig,
  FullSystemInput,
  BatteryConfiguration,
  WireSizingResult,
  StringDesignResult,
  FullSystemResult,
} from './types/index.js';

// ─── Constants ─────────────────────────────────────────────────────────────
export {
  INVERTER_SIZES_KVA,
  STANDARD_CONTROLLER_SIZES,
  INVERTER_SAFETY_FACTOR,
  CHARGE_CONTROLLER_SAFETY_FACTOR,
  POWER_FACTOR,
  TEMP_MIN_C,
  TEMP_MAX_C,
  TEMP_STC,
  STANDARD_SIZES_MM2,
  COPPER_RESISTIVITY,
  TEMP_CORRECTION_FACTOR,
  MM2_TO_AWG,
} from './data/constants.js';

// ─── PSH City Database ─────────────────────────────────────────────────────
export { PSH_CITIES, findCityByName, findCityById } from './data/psh-cities.js';

// ─── Energy ────────────────────────────────────────────────────────────────
export { calculateTotalDailyWh, calculateEstimatedPeakLoad } from './calculations/energy.js';

// ─── Inverter ──────────────────────────────────────────────────────────────
export { calculateRequiredInverterKva, findRecommendedInverterSize } from './calculations/inverter.js';

// ─── Battery ───────────────────────────────────────────────────────────────
export {
  calculateTotalStorageWh,
  calculateRequiredBankCapacityWh,
  calculateRequiredBankCapacityAh,
  calculateBatteryConfiguration,
} from './calculations/battery.js';

// ─── Solar ─────────────────────────────────────────────────────────────────
export {
  calculateRequiredArrayWattage,
  calculateNumberOfPanels,
  calculateActualArrayKw,
} from './calculations/solar.js';

// ─── String Design ─────────────────────────────────────────────────────────
export {
  calculateVocAtMinTemp,
  calculateVmpAtMaxTemp,
  calculatePanelsPerStringMin,
  calculatePanelsPerStringMax,
  calculateNumberOfStrings,
  calculateStringCurrent,
  calculateTotalArrayCurrent,
  calculateChargeControllerAmps,
  calculateChargeControllerAmpsPWM,
  calculateStringDesign,
} from './calculations/strings.js';

// ─── Wire Sizing ───────────────────────────────────────────────────────────
export {
  calculateWireSizing,
  calculateDcArrayWireSizing,
  calculateDcBatteryWireSizing,
  calculateAcWireSizing,
  calculateAcWireSizingThreePhase,
} from './calculations/wire.js';

// ─── Full System ───────────────────────────────────────────────────────────
export { calculateFullSystem } from './calculations/full.js';
