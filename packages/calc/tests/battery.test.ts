import { describe, it, expect } from 'vitest';
import {
  calculateTotalStorageWh,
  calculateRequiredBankCapacityWh,
  calculateRequiredBankCapacityAh,
  calculateBatteryConfiguration,
} from '../src/calculations/battery.js';

describe('calculateTotalStorageWh', () => {
  it('returns 0 for zero inputs', () => {
    expect(calculateTotalStorageWh(0, 2)).toBe(0);
    expect(calculateTotalStorageWh(5000, 0)).toBe(0);
  });

  it('multiplies energy by days', () => {
    expect(calculateTotalStorageWh(5000, 2)).toBe(10000);
  });
});

describe('calculateRequiredBankCapacityWh', () => {
  it('divides by DoD to get usable capacity', () => {
    // 10000Wh / 0.8 DoD = 12500Wh bank
    expect(calculateRequiredBankCapacityWh(10000, 0.8)).toBeCloseTo(12500);
  });
});

describe('calculateRequiredBankCapacityAh', () => {
  it('converts Wh to Ah at system voltage', () => {
    // 12500Wh / 48V = 260.4Ah
    expect(calculateRequiredBankCapacityAh(12500, 48)).toBeCloseTo(260.4, 0);
  });
});

describe('calculateBatteryConfiguration', () => {
  it('returns zeros for invalid inputs', () => {
    const result = calculateBatteryConfiguration(0, 12, 200, 100);
    expect(result).toEqual({ batteriesInSeries: 0, numberOfParallelStrings: 0, totalBatteries: 0 });
  });

  it('calculates 48V system with 12V batteries', () => {
    // 48V / 12V = 4 in series; 260Ah / 100Ah = ceil(2.6) = 3 strings; 4 × 3 = 12 total
    const result = calculateBatteryConfiguration(48, 12, 260, 100);
    expect(result.batteriesInSeries).toBe(4);
    expect(result.numberOfParallelStrings).toBe(3);
    expect(result.totalBatteries).toBe(12);
  });
});
