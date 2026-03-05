import { COPPER_RESISTIVITY, TEMP_CORRECTION_FACTOR, STANDARD_SIZES_MM2, MM2_TO_AWG } from '../../data/cableSizes.js';
import { POWER_FACTOR } from '../../data/constants.js';

export function calculateMinCrossSection(current, cableLength, voltage, maxVoltageDropPct) {
  const i = Number(current) || 0;
  const l = Number(cableLength) || 0;
  const v = Number(voltage) || 0;
  const dropPct = Number(maxVoltageDropPct) || 0;

  if (i <= 0 || l <= 0 || v <= 0 || dropPct <= 0) return 0;

  const voltageDrop_V = (v * dropPct) / 100;
  return (2 * l * i * COPPER_RESISTIVITY * TEMP_CORRECTION_FACTOR) / voltageDrop_V;
}

export function calculateRecommendedCableSize(minCrossSectionMm2) {
  const min = Number(minCrossSectionMm2) || 0;
  if (min <= 0) return 0;

  for (const size of STANDARD_SIZES_MM2) {
    if (size >= min) return size;
  }
  return STANDARD_SIZES_MM2[STANDARD_SIZES_MM2.length - 1];
}

export function calculateActualVoltageDrop(current, cableLength, recommendedMm2, systemVoltage) {
  const i = Number(current) || 0;
  const l = Number(cableLength) || 0;
  const mm2 = Number(recommendedMm2) || 0;
  const v = Number(systemVoltage) || 0;

  if (i <= 0 || l <= 0 || mm2 <= 0 || v <= 0) return 0;

  const resistance = (2 * l * COPPER_RESISTIVITY * TEMP_CORRECTION_FACTOR) / mm2;
  const voltageDrop_V = i * resistance;
  return (voltageDrop_V / v) * 100;
}

export function calculateWireSizing(current, cableLength, voltage, maxVoltageDropPct) {
  const i = Number(current) || 0;
  const l = Number(cableLength) || 0;
  const v = Number(voltage) || 0;
  const dropPct = Number(maxVoltageDropPct) || 0;

  if (i <= 0 || l <= 0 || v <= 0 || dropPct <= 0) {
    return {
      currentA: i,
      minCrossSectionMm2: 0,
      recommendedMm2: 0,
      recommendedAwg: '—',
      actualVoltageDropPct: 0,
    };
  }

  const minCrossSectionMm2 = calculateMinCrossSection(i, l, v, dropPct);
  const recommendedMm2 = calculateRecommendedCableSize(minCrossSectionMm2);
  const recommendedAwg = MM2_TO_AWG[recommendedMm2] || '—';
  const actualVoltageDropPct = calculateActualVoltageDrop(i, l, recommendedMm2, v);

  return {
    currentA: i,
    minCrossSectionMm2,
    recommendedMm2,
    recommendedAwg,
    actualVoltageDropPct,
  };
}

export function calculateDcArrayWireSizing(stringCurrentA, cableLength, systemVoltageV, maxVoltageDropPct) {
  const current = (Number(stringCurrentA) || 0) * 1.25;
  return calculateWireSizing(current, cableLength, systemVoltageV, maxVoltageDropPct);
}

export function calculateDcBatteryWireSizing(inverterKva, systemVoltageV, cableLength, maxVoltageDropPct) {
  const kva = Number(inverterKva) || 0;
  const sysV = Number(systemVoltageV) || 0;
  if (kva <= 0 || sysV <= 0) {
    return calculateWireSizing(0, cableLength, sysV, maxVoltageDropPct);
  }
  const current = (kva * 1000 * POWER_FACTOR) / sysV;
  return calculateWireSizing(current, cableLength, sysV, maxVoltageDropPct);
}

export function calculateAcWireSizing(inverterKva, outputVoltageV, cableLength, maxVoltageDropPct) {
  const kva = Number(inverterKva) || 0;
  const outV = Number(outputVoltageV) || 230;
  if (kva <= 0) {
    return calculateWireSizing(0, cableLength, outV, maxVoltageDropPct);
  }
  const current = (kva * 1000) / outV;
  return calculateWireSizing(current, cableLength, outV, maxVoltageDropPct);
}
