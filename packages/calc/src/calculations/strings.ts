import {
  TEMP_MIN_C,
  TEMP_MAX_C,
  TEMP_STC,
  STANDARD_CONTROLLER_SIZES,
  CHARGE_CONTROLLER_SAFETY_FACTOR,
} from '../data/constants.js';
import type { StringDesignResult } from '../types/index.js';

export function calculateVocAtMinTemp(
  vocStc: number,
  tempCoeffVoc: number,
  tempMinC: number = TEMP_MIN_C,
): number {
  const voc = Number(vocStc) || 0;
  if (voc <= 0) return 0;

  return voc * (1 + (tempCoeffVoc / 100) * (tempMinC - TEMP_STC));
}

export function calculateVmpAtMaxTemp(
  vmpStc: number,
  tempCoeffPmax: number,
  tempMaxC: number = TEMP_MAX_C,
): number {
  const vmp = Number(vmpStc) || 0;
  if (vmp <= 0) return 0;

  return vmp * (1 + (tempCoeffPmax / 100) * (tempMaxC - TEMP_STC));
}

export function calculatePanelsPerStringMin(
  mpptRangeMinV: number,
  vmpAtMaxTemp: number,
): number {
  const mpptMin = Number(mpptRangeMinV) || 0;
  const vmp = Number(vmpAtMaxTemp) || 0;

  if (mpptMin <= 0 || vmp <= 0) return 0;

  return Math.ceil(mpptMin / vmp);
}

export function calculatePanelsPerStringMax(
  maxPvInputV: number,
  vocAtMinTemp: number,
): number {
  const maxV = Number(maxPvInputV) || 0;
  const voc = Number(vocAtMinTemp) || 0;

  if (maxV <= 0 || voc <= 0) return 0;

  return Math.floor(maxV / voc);
}

export function calculateNumberOfStrings(
  numberOfPanels: number,
  panelsPerString: number,
): number {
  const panels = Number(numberOfPanels) || 0;
  const perString = Number(panelsPerString) || 0;

  if (panels <= 0 || perString <= 0) return 0;

  return Math.ceil(panels / perString);
}

export function calculateStringCurrent(isc: number): number {
  const current = Number(isc) || 0;
  if (current <= 0) return 0;

  return current * 1.25;
}

export function calculateTotalArrayCurrent(
  stringCurrentA: number,
  numberOfStrings: number,
): number {
  const current = Number(stringCurrentA) || 0;
  const strings = Number(numberOfStrings) || 0;

  if (current <= 0 || strings <= 0) return 0;

  return current * strings;
}

export function calculateChargeControllerAmps(
  numberOfPanels: number,
  panelWattageW: number,
  systemVoltageV: number,
): number {
  const panels = Number(numberOfPanels) || 0;
  const wp = Number(panelWattageW) || 0;
  const sysV = Number(systemVoltageV) || 0;

  if (panels <= 0 || wp <= 0 || sysV <= 0) return 0;

  const rawAmps = ((panels * wp) / sysV) * CHARGE_CONTROLLER_SAFETY_FACTOR;
  const recommended = (STANDARD_CONTROLLER_SIZES as readonly number[]).find(
    (s) => s >= rawAmps,
  );
  return recommended ?? (STANDARD_CONTROLLER_SIZES[STANDARD_CONTROLLER_SIZES.length - 1] as number);
}

export function calculateChargeControllerAmpsPWM(
  isc: number,
  numberOfStrings: number,
): number {
  const current = Number(isc) || 0;
  const strings = Number(numberOfStrings) || 0;

  if (current <= 0 || strings <= 0) return 0;

  const rawAmps = current * strings * CHARGE_CONTROLLER_SAFETY_FACTOR;
  const recommended = (STANDARD_CONTROLLER_SIZES as readonly number[]).find(
    (s) => s >= rawAmps,
  );
  return recommended ?? (STANDARD_CONTROLLER_SIZES[STANDARD_CONTROLLER_SIZES.length - 1] as number);
}

export function calculateStringDesign(
  vocStc: number,
  vmpStc: number,
  tempCoeffVoc: number,
  tempCoeffPmax: number,
  mpptRangeMinV: number,
  maxPvInputV: number,
  tempMinC?: number,
  tempMaxC?: number,
): StringDesignResult {
  const vocAtMinTemp = calculateVocAtMinTemp(vocStc, tempCoeffVoc, tempMinC);
  const vmpAtMaxTemp = calculateVmpAtMaxTemp(vmpStc, tempCoeffPmax, tempMaxC);
  const panelsPerStringMin = calculatePanelsPerStringMin(mpptRangeMinV, vmpAtMaxTemp);
  const panelsPerStringMax = calculatePanelsPerStringMax(maxPvInputV, vocAtMinTemp);

  return {
    vocAtMinTemp,
    vmpAtMaxTemp,
    panelsPerStringMin,
    panelsPerStringMax,
    validRangeExists: panelsPerStringMin <= panelsPerStringMax && panelsPerStringMax > 0,
  };
}
