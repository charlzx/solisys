import { VALIDATION_MESSAGES } from './messages.js';

function result(id, status, section) {
  const messages = VALIDATION_MESSAGES[id];
  const message = status === 'pass' ? messages.pass : (messages[status] || messages.error || messages.warning);
  return { id, status, message, details: null, section };
}

export function validateBatteryVoltageCompatible(systemVoltage, batteryVoltage) {
  if (!batteryVoltage || !systemVoltage) return result('battery_voltage_compatible', 'pass', 'battery');
  const compatible = systemVoltage % batteryVoltage === 0;
  return result('battery_voltage_compatible', compatible ? 'pass' : 'error', 'battery');
}

export function validateBatteryAutonomyAdequate(daysOfAutonomy) {
  const adequate = daysOfAutonomy >= 1;
  return result('battery_autonomy_adequate', adequate ? 'pass' : 'warning', 'battery');
}

export function validateBatteryDodReasonable(batteryDoD) {
  const reasonable = batteryDoD <= 0.95;
  return result('battery_dod_reasonable', reasonable ? 'pass' : 'warning', 'battery');
}

export function validateBatteryCountEven(totalBatteries, batteriesInSeries) {
  if (!batteriesInSeries || !totalBatteries) return result('battery_count_even', 'pass', 'battery');
  const even = totalBatteries % batteriesInSeries === 0;
  return result('battery_count_even', even ? 'pass' : 'error', 'battery');
}

export function validateInverterSizeAdequate(selectedInverterKva, requiredInverterKva) {
  if (!selectedInverterKva || !requiredInverterKva) return result('inverter_size_adequate', 'pass', 'inverter');
  const adequate = selectedInverterKva >= requiredInverterKva;
  return result('inverter_size_adequate', adequate ? 'pass' : 'error', 'inverter');
}

export function validateInverterSizeOversized(selectedInverterKva, requiredInverterKva) {
  if (!selectedInverterKva || !requiredInverterKva) return result('inverter_size_oversized', 'pass', 'inverter');
  const oversized = selectedInverterKva > requiredInverterKva * 2;
  return result('inverter_size_oversized', oversized ? 'warning' : 'pass', 'inverter');
}

export function validateStringVocWithinLimit(vocAtMinTemp, panelsPerString, maxPvInputV) {
  if (!vocAtMinTemp || !panelsPerString || !maxPvInputV) return result('string_voc_within_limit', 'pass', 'solar');
  const withinLimit = vocAtMinTemp * panelsPerString < maxPvInputV;
  return result('string_voc_within_limit', withinLimit ? 'pass' : 'error', 'solar');
}

export function validateStringVmpAboveMpptMin(vmpAtMaxTemp, panelsPerString, mpptRangeMin) {
  if (!vmpAtMaxTemp || !panelsPerString || !mpptRangeMin) return result('string_vmp_above_mppt_min', 'pass', 'solar');
  const aboveMin = vmpAtMaxTemp * panelsPerString >= mpptRangeMin;
  return result('string_vmp_above_mppt_min', aboveMin ? 'pass' : 'error', 'solar');
}

export function validateStringVmpBelowMpptMax(vmpAtMaxTemp, panelsPerString, mpptRangeMax) {
  if (!vmpAtMaxTemp || !panelsPerString || !mpptRangeMax) return result('string_vmp_below_mppt_max', 'pass', 'solar');
  const belowMax = vmpAtMaxTemp * panelsPerString <= mpptRangeMax;
  return result('string_vmp_below_mppt_max', belowMax ? 'pass' : 'warning', 'solar');
}

export function validateStringValidRangeExists(panelsPerStringMin, panelsPerStringMax) {
  if (!panelsPerStringMin || !panelsPerStringMax) return result('string_valid_range_exists', 'pass', 'solar');
  const valid = panelsPerStringMin <= panelsPerStringMax;
  return result('string_valid_range_exists', valid ? 'pass' : 'error', 'solar');
}

export function validateStringCurrentWithinInverter(totalArrayCurrentA, maxPvInputCurrentA) {
  if (!totalArrayCurrentA || !maxPvInputCurrentA) return result('string_current_within_inverter', 'pass', 'solar');
  const withinLimit = totalArrayCurrentA <= maxPvInputCurrentA;
  return result('string_current_within_inverter', withinLimit ? 'pass' : 'error', 'solar');
}

export function validateWireDcArrayDrop(actualDropPct, maxVoltageDrop) {
  if (actualDropPct == null || maxVoltageDrop == null) return result('wire_dc_array_drop', 'pass', 'wires');
  const withinLimit = actualDropPct <= maxVoltageDrop;
  return result('wire_dc_array_drop', withinLimit ? 'pass' : 'warning', 'wires');
}

export function validateWireDcBatteryDrop(actualDropPct, maxVoltageDrop) {
  if (actualDropPct == null || maxVoltageDrop == null) return result('wire_dc_battery_drop', 'pass', 'wires');
  const withinLimit = actualDropPct <= maxVoltageDrop;
  return result('wire_dc_battery_drop', withinLimit ? 'pass' : 'warning', 'wires');
}

export function validateWireAcDrop(actualDropPct, maxVoltageDrop) {
  if (actualDropPct == null || maxVoltageDrop == null) return result('wire_ac_drop', 'pass', 'wires');
  const withinLimit = actualDropPct <= maxVoltageDrop;
  return result('wire_ac_drop', withinLimit ? 'pass' : 'warning', 'wires');
}

export function validateEnergyInputPresent(dailyEnergyKwh) {
  const present = dailyEnergyKwh > 0;
  return result('energy_input_present', present ? 'pass' : 'error', 'general');
}

export function validatePeakLoadPresent(peakLoad) {
  const present = peakLoad > 0;
  return result('peak_load_present', present ? 'pass' : 'error', 'general');
}

export function validateSystemEfficiencyReasonable(systemEfficiency) {
  const reasonable = systemEfficiency >= 70 && systemEfficiency <= 95;
  return result('system_efficiency_reasonable', reasonable ? 'pass' : 'warning', 'general');
}

export function validatePshReasonable(peakSunHours) {
  const reasonable = peakSunHours >= 2 && peakSunHours <= 9;
  return result('psh_reasonable', reasonable ? 'pass' : 'warning', 'general');
}

export function runAllValidations({ project, calculations, selectedPanel, selectedInverter, selectedBattery }) {
  const results = [];
  const systemType = project?.systemType || 'off-grid';

  const dailyKwh = calculations?.totalDailyKwh || (project?.dailyEnergyKwh || 0);
  const peakLoad = project?.peakLoad || calculations?.estimatedPeakLoadW || 0;

  results.push(validateEnergyInputPresent(dailyKwh));
  results.push(validatePeakLoadPresent(peakLoad));
  results.push(validateSystemEfficiencyReasonable(project?.systemEfficiency || 0));
  results.push(validatePshReasonable(project?.peakSunHours || 0));

  results.push(validateInverterSizeAdequate(
    calculations?.selectedInverterKva || project?.selectedInverterKva || 0,
    calculations?.requiredInverterKva || 0
  ));
  results.push(validateInverterSizeOversized(
    calculations?.selectedInverterKva || project?.selectedInverterKva || 0,
    calculations?.requiredInverterKva || 0
  ));

  results.push(validateBatteryVoltageCompatible(
    project?.batteryVoltage || 0,
    project?.availableBatteryVoltage || (selectedBattery?.voltageV || 0)
  ));
  if (systemType !== 'grid-tied') {
    results.push(validateBatteryAutonomyAdequate(project?.daysOfAutonomy || 0));
  }
  results.push(validateBatteryDodReasonable(project?.batteryDoD || 0));
  results.push(validateBatteryCountEven(
    calculations?.totalNumberOfBatteries || 0,
    calculations?.batteriesInSeries || 0
  ));

  if (selectedPanel && selectedInverter) {
    results.push(validateStringVocWithinLimit(
      calculations?.vocAtMinTemp || 0,
      project?.panelsPerString || 0,
      selectedInverter.maxPvInputV
    ));
    results.push(validateStringVmpAboveMpptMin(
      calculations?.vmpAtMaxTemp || 0,
      project?.panelsPerString || 0,
      selectedInverter.mpptRangeMin
    ));
    results.push(validateStringVmpBelowMpptMax(
      calculations?.vmpAtMaxTemp || 0,
      project?.panelsPerString || 0,
      selectedInverter.mpptRangeMax
    ));
    results.push(validateStringValidRangeExists(
      calculations?.panelsPerStringMin || 0,
      calculations?.panelsPerStringMax || 0
    ));
    results.push(validateStringCurrentWithinInverter(
      calculations?.totalArrayCurrentA || 0,
      selectedInverter.maxPvInputCurrentA
    ));
  }

  const wires = calculations?.wires;
  if (wires) {
    results.push(validateWireDcArrayDrop(
      wires.dcArray?.actualVoltageDropPct,
      project?.maxVoltageDrop_dcArray
    ));
    results.push(validateWireDcBatteryDrop(
      wires.dcBattery?.actualVoltageDropPct,
      project?.maxVoltageDrop_dcBattery
    ));
    results.push(validateWireAcDrop(
      wires.ac?.actualVoltageDropPct,
      project?.maxVoltageDrop_ac
    ));
  }

  return results;
}
