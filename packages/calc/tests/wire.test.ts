import { describe, it, expect } from 'vitest';
import {
  calculateWireSizing,
  calculateDcBatteryWireSizing,
  calculateAcWireSizing,
} from '../src/calculations/wire.js';

describe('calculateWireSizing', () => {
  it('returns zeros for invalid inputs', () => {
    const result = calculateWireSizing(0, 10, 48, 3);
    expect(result.recommendedMm2).toBe(0);
  });

  it('recommends a valid standard cable size', () => {
    const result = calculateWireSizing(30, 10, 48, 3);
    expect(result.recommendedMm2).toBeGreaterThan(0);
    // Actual drop must be ≤ max drop
    expect(result.actualVoltageDropPct).toBeLessThanOrEqual(3);
  });

  it('actual voltage drop is within tolerance', () => {
    const result = calculateWireSizing(50, 15, 48, 2);
    expect(result.actualVoltageDropPct).toBeLessThanOrEqual(2);
  });
});

describe('calculateDcBatteryWireSizing', () => {
  it('derives current from inverter kVA and system voltage', () => {
    // 5kVA × 0.8 pf / 48V = 83.3A → size up to next standard
    const result = calculateDcBatteryWireSizing(5, 48, 3, 1);
    expect(result.currentA).toBeGreaterThan(0);
    expect(result.recommendedMm2).toBeGreaterThan(0);
  });
});

describe('calculateAcWireSizing', () => {
  it('derives AC current from inverter kVA and output voltage', () => {
    // 5kVA / 230V = 21.7A
    const result = calculateAcWireSizing(5, 230, 10, 2);
    expect(result.currentA).toBeCloseTo(21.7, 0);
  });
});
