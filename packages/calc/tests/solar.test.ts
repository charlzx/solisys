import { describe, it, expect } from 'vitest';
import {
  calculateRequiredArrayWattage,
  calculateNumberOfPanels,
  calculateActualArrayKw,
} from '../src/calculations/solar.js';

describe('calculateRequiredArrayWattage', () => {
  it('returns 0 for zero inputs', () => {
    expect(calculateRequiredArrayWattage(0, 5, 75)).toBe(0);
    expect(calculateRequiredArrayWattage(5000, 0, 75)).toBe(0);
    expect(calculateRequiredArrayWattage(5000, 5, 0)).toBe(0);
  });

  it('calculates required wattage correctly', () => {
    // 5000Wh / (5 PSH × 0.75 eff) = 1333.3W
    expect(calculateRequiredArrayWattage(5000, 5, 75)).toBeCloseTo(1333.3, 0);
  });
});

describe('calculateNumberOfPanels', () => {
  it('rounds up to next whole panel', () => {
    // 1333W / 400W = 3.33 → ceil → 4
    expect(calculateNumberOfPanels(1333, 400)).toBe(4);
  });

  it('returns exact number when evenly divisible', () => {
    expect(calculateNumberOfPanels(1200, 400)).toBe(3);
  });
});

describe('calculateActualArrayKw', () => {
  it('returns total array capacity in kWp', () => {
    // 4 panels × 400W = 1600W = 1.6kWp
    expect(calculateActualArrayKw(4, 400)).toBeCloseTo(1.6);
  });
});
