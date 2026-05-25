import {
  INVERTER_SAFETY_FACTOR,
  POWER_FACTOR,
  INVERTER_SIZES_KVA,
} from '../data/constants.js';

export function calculateRequiredInverterKva(
  peakLoadW: number,
  phase: 'single' | 'three' = 'single',
): number {
  const load = Number(peakLoadW) || 0;
  if (load <= 0) return 0;

  if (phase === 'three') {
    return (load * INVERTER_SAFETY_FACTOR) / 1000 / (Math.sqrt(3) * POWER_FACTOR);
  }

  return (load * INVERTER_SAFETY_FACTOR) / 1000 / POWER_FACTOR;
}

export function findRecommendedInverterSize(requiredKva: number): number {
  const kva = Number(requiredKva) || 0;
  if (kva <= 0) return 0;

  const recommended = (INVERTER_SIZES_KVA as readonly number[]).find((s) => s >= kva);
  return recommended ?? INVERTER_SIZES_KVA[INVERTER_SIZES_KVA.length - 1];
}
