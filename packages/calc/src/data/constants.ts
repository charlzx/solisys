// Calculation constants

export const INVERTER_SIZES_KVA = [1, 1.5, 2, 2.5, 3, 4, 5, 8, 10, 12, 15, 20, 25, 30] as const;
export const STANDARD_CONTROLLER_SIZES = [10, 20, 30, 40, 60, 80, 100, 120, 150, 200] as const;

export const INVERTER_SAFETY_FACTOR = 1.25;
export const CHARGE_CONTROLLER_SAFETY_FACTOR = 1.25;
export const POWER_FACTOR = 0.8;

export const TEMP_MIN_C = -10;
export const TEMP_MAX_C = 70;
export const TEMP_STC = 25;

// Cable constants
export const STANDARD_SIZES_MM2 = [1.5, 2.5, 4, 6, 10, 16, 25, 35, 50, 70, 95, 120] as const;
export const COPPER_RESISTIVITY = 0.0175;
export const TEMP_CORRECTION_FACTOR = 1.15;

export const MM2_TO_AWG: Record<number, string> = {
  1.5: '16',
  2.5: '14',
  4: '12',
  6: '10',
  10: '8',
  16: '6',
  25: '4',
  35: '2',
  50: '1',
  70: '2/0',
  95: '3/0',
  120: '4/0',
};
