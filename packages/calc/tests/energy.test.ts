import { describe, it, expect } from 'vitest';
import { calculateTotalDailyWh, calculateEstimatedPeakLoad } from '../src/calculations/energy.js';

describe('calculateTotalDailyWh', () => {
  it('returns 0 for empty array', () => {
    expect(calculateTotalDailyWh([])).toBe(0);
  });

  it('calculates watt-hours for W unit', () => {
    // 2 x 100W fan, 8 hours/day → 1600Wh
    const result = calculateTotalDailyWh([{ quantity: 2, wattage: 100, hours: 8, unit: 'W' }]);
    expect(result).toBe(1600);
  });

  it('converts HP to watts correctly', () => {
    // 1HP = 746W; 1 x 1HP x 1h = 746Wh
    const result = calculateTotalDailyWh([{ quantity: 1, wattage: 1, hours: 1, unit: 'HP' }]);
    expect(result).toBe(746);
  });

  it('converts kW to watts correctly', () => {
    // 1 x 1kW x 2h = 2000Wh
    const result = calculateTotalDailyWh([{ quantity: 1, wattage: 1, hours: 2, unit: 'kW' }]);
    expect(result).toBe(2000);
  });

  it('sums multiple appliances', () => {
    const result = calculateTotalDailyWh([
      { quantity: 1, wattage: 200, hours: 10, unit: 'W' }, // 2000Wh
      { quantity: 2, wattage: 50,  hours: 4,  unit: 'W' }, // 400Wh
    ]);
    expect(result).toBe(2400);
  });
});

describe('calculateEstimatedPeakLoad', () => {
  it('returns 0 for empty array', () => {
    expect(calculateEstimatedPeakLoad([])).toBe(0);
  });

  it('applies surge multiplier', () => {
    // 1 x 500W motor with 3× surge = 1500W peak
    const result = calculateEstimatedPeakLoad([{ quantity: 1, wattage: 500, hours: 4, unit: 'W', surgeMultiplier: 3 }]);
    expect(result).toBe(1500);
  });
});
