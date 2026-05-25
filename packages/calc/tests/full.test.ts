import { describe, it, expect } from 'vitest';
import { calculateFullSystem } from '../src/calculations/full.js';
import type { FullSystemInput } from '../src/types/index.js';

const BASE_INPUT: FullSystemInput = {
  appliances: [
    { quantity: 2, wattage: 60,  hours: 8,  unit: 'W' },  // lights: 960Wh
    { quantity: 1, wattage: 200, hours: 10, unit: 'W' },  // fan:    2000Wh
    { quantity: 1, wattage: 100, hours: 4,  unit: 'W' },  // TV:     400Wh
  ],
  peakSunHours: 5,
  systemVoltageV: 48,
  systemEfficiencyPct: 75,
  batteryDoD: 0.8,
  daysOfAutonomy: 1,
  batteryVoltageV: 12,
  batteryCapacityAh: 100,
  panelWattageW: 400,
};

describe('calculateFullSystem', () => {
  it('computes a full system without errors', () => {
    const result = calculateFullSystem(BASE_INPUT);
    expect(result.load.totalDailyWh).toBe(3360);
    expect(result.inverter.requiredKva).toBeGreaterThan(0);
    expect(result.battery.totalBatteries).toBeGreaterThan(0);
    expect(result.solar.numberOfPanels).toBeGreaterThan(0);
  });

  it('accepts dailyEnergyKwh instead of appliances', () => {
    const result = calculateFullSystem({
      ...BASE_INPUT,
      appliances: undefined,
      dailyEnergyKwh: 3.36,
    });
    expect(result.load.totalDailyWh).toBeCloseTo(3360);
  });

  it('throws if neither appliances nor dailyEnergyKwh provided', () => {
    expect(() => calculateFullSystem({ ...BASE_INPUT, appliances: undefined })).toThrow();
  });

  it('includes wire sizing when wireSizing is provided', () => {
    const result = calculateFullSystem({
      ...BASE_INPUT,
      wireSizing: { dcArrayLengthM: 10, dcBatteryLengthM: 3, acOutputLengthM: 15 },
    });
    expect(result.wire).toBeDefined();
    expect(result.wire?.dcBattery.recommendedMm2).toBeGreaterThan(0);
  });

  it('selectedKva overrides auto recommendation', () => {
    const result = calculateFullSystem({ ...BASE_INPUT, selectedInverterKva: 10 });
    expect(result.inverter.selectedKva).toBe(10);
  });
});
