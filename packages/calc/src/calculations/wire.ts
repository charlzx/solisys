import {
  COPPER_RESISTIVITY,
  TEMP_CORRECTION_FACTOR,
  STANDARD_SIZES_MM2,
  MM2_TO_AWG,
  POWER_FACTOR,
} from '../data/constants.js';
import type { WireSizingResult } from '../types/index.js';

export function calculateWireSizing(
  currentA: number,
  cableLengthM: number,
  voltageV: number,
  maxVoltageDropPct: number,
): WireSizingResult {
  const i = Number(currentA) || 0;
  const l = Number(cableLengthM) || 0;
  const v = Number(voltageV) || 0;
  const dropPct = Number(maxVoltageDropPct) || 0;

  if (i <= 0 || l <= 0 || v <= 0 || dropPct <= 0) {
    return { currentA: i, minCrossSectionMm2: 0, recommendedMm2: 0, recommendedAwg: '—', actualVoltageDropPct: 0 };
  }

  const voltageDropV = (v * dropPct) / 100;
  const minCrossSectionMm2 =
    (2 * l * i * COPPER_RESISTIVITY * TEMP_CORRECTION_FACTOR) / voltageDropV;

  let recommendedMm2 = STANDARD_SIZES_MM2[STANDARD_SIZES_MM2.length - 1] as number;
  for (const size of STANDARD_SIZES_MM2) {
    if (size >= minCrossSectionMm2) {
      recommendedMm2 = size;
      break;
    }
  }

  const resistance = (2 * l * COPPER_RESISTIVITY * TEMP_CORRECTION_FACTOR) / recommendedMm2;
  const actualVoltageDropPct = ((i * resistance) / v) * 100;
  const recommendedAwg = MM2_TO_AWG[recommendedMm2] ?? '—';

  return { currentA: i, minCrossSectionMm2, recommendedMm2, recommendedAwg, actualVoltageDropPct };
}

export function calculateDcArrayWireSizing(
  stringCurrentA: number,
  cableLengthM: number,
  systemVoltageV: number,
  maxVoltageDropPct: number,
): WireSizingResult {
  const current = (Number(stringCurrentA) || 0) * 1.25;
  return calculateWireSizing(current, cableLengthM, systemVoltageV, maxVoltageDropPct);
}

export function calculateDcBatteryWireSizing(
  inverterKva: number,
  systemVoltageV: number,
  cableLengthM: number,
  maxVoltageDropPct: number,
): WireSizingResult {
  const kva = Number(inverterKva) || 0;
  const sysV = Number(systemVoltageV) || 0;
  const current = sysV > 0 ? (kva * 1000 * POWER_FACTOR) / sysV : 0;
  return calculateWireSizing(current, cableLengthM, sysV, maxVoltageDropPct);
}

export function calculateAcWireSizing(
  inverterKva: number,
  outputVoltageV: number,
  cableLengthM: number,
  maxVoltageDropPct: number,
): WireSizingResult {
  const kva = Number(inverterKva) || 0;
  const outV = Number(outputVoltageV) || 230;
  const current = outV > 0 ? (kva * 1000) / outV : 0;
  return calculateWireSizing(current, cableLengthM, outV, maxVoltageDropPct);
}

export function calculateAcWireSizingThreePhase(
  inverterKva: number,
  lineVoltageV: number,
  cableLengthM: number,
  maxVoltageDropPct: number,
): WireSizingResult {
  const kva = Number(inverterKva) || 0;
  const lineV = Number(lineVoltageV) || 400;
  const current = lineV > 0 ? (kva * 1000) / (Math.sqrt(3) * lineV * POWER_FACTOR) : 0;
  return calculateWireSizing(current, cableLengthM, lineV, maxVoltageDropPct);
}
