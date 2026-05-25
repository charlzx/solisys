import { describe, it, expect } from 'vitest';
import {
  calculateRequiredInverterKva,
  findRecommendedInverterSize,
} from '../src/calculations/inverter.js';

describe('calculateRequiredInverterKva', () => {
  it('returns 0 for zero load', () => {
    expect(calculateRequiredInverterKva(0)).toBe(0);
  });

  it('calculates single-phase size correctly', () => {
    // 2000W × 1.25 safety / 1000 / 0.8 pf = 3.125 kVA
    expect(calculateRequiredInverterKva(2000)).toBeCloseTo(3.125, 3);
  });

  it('calculates three-phase size correctly', () => {
    // 2000W × 1.25 / 1000 / (√3 × 0.8)
    const expected = (2000 * 1.25) / 1000 / (Math.sqrt(3) * 0.8);
    expect(calculateRequiredInverterKva(2000, 'three')).toBeCloseTo(expected, 3);
  });
});

describe('findRecommendedInverterSize', () => {
  it('returns next standard size up', () => {
    expect(findRecommendedInverterSize(2.1)).toBe(2.5);
  });

  it('returns exact size when it matches', () => {
    expect(findRecommendedInverterSize(3)).toBe(3);
  });

  it('returns maximum size for oversized requirement', () => {
    expect(findRecommendedInverterSize(100)).toBe(30);
  });
});
