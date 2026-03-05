import { INVERTER_SAFETY_FACTOR, POWER_FACTOR, INVERTER_SIZES_KVA } from '../../data/constants.js';

export function calculateRequiredInverterKva(peakLoadW) {
  const load = Number(peakLoadW) || 0;
  if (load <= 0) return 0;

  const inverterSizeW = load * INVERTER_SAFETY_FACTOR;
  const inverterSizeKva = (inverterSizeW / 1000) / POWER_FACTOR;

  return inverterSizeKva;
}

export function findRecommendedInverterSize(requiredKva) {
  const kva = Number(requiredKva) || 0;
  if (kva <= 0) return 0;

  const recommended = INVERTER_SIZES_KVA.find(s => s >= kva);
  return recommended || INVERTER_SIZES_KVA[INVERTER_SIZES_KVA.length - 1];
}
