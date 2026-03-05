import { TEMP_MIN_C, TEMP_MAX_C, TEMP_STC } from '../../data/constants.js';

export function calculateVocAtMinTemp(vocStc, tempCoeffVoc) {
  const voc = Number(vocStc) || 0;
  const coeff = Number(tempCoeffVoc) || 0;

  if (voc <= 0) return 0;

  return voc * (1 + (coeff / 100) * (TEMP_MIN_C - TEMP_STC));
}

export function calculateVmpAtMaxTemp(vmpStc, tempCoeffPmax) {
  const vmp = Number(vmpStc) || 0;
  const coeff = Number(tempCoeffPmax) || 0;

  if (vmp <= 0) return 0;

  return vmp * (1 + (coeff / 100) * (TEMP_MAX_C - TEMP_STC));
}

export function calculatePanelsPerStringMin(mpptRangeMin, vmpAtMaxTemp) {
  const mpptMin = Number(mpptRangeMin) || 0;
  const vmp = Number(vmpAtMaxTemp) || 0;

  if (mpptMin <= 0 || vmp <= 0) return 0;

  return Math.ceil(mpptMin / vmp);
}

export function calculatePanelsPerStringMax(maxPvInputV, vocAtMinTemp) {
  const maxV = Number(maxPvInputV) || 0;
  const voc = Number(vocAtMinTemp) || 0;

  if (maxV <= 0 || voc <= 0) return 0;

  return Math.floor(maxV / voc);
}

export function calculateNumberOfStrings(numberOfPanels, panelsPerString) {
  const panels = Number(numberOfPanels) || 0;
  const perString = Number(panelsPerString) || 0;

  if (panels <= 0 || perString <= 0) return 0;

  return Math.ceil(panels / perString);
}

export function calculateStringCurrent(isc) {
  const current = Number(isc) || 0;
  if (current <= 0) return 0;

  return current * 1.25;
}

export function calculateTotalArrayCurrent(stringCurrentA, numberOfStrings) {
  const current = Number(stringCurrentA) || 0;
  const strings = Number(numberOfStrings) || 0;

  if (current <= 0 || strings <= 0) return 0;

  return current * strings;
}
