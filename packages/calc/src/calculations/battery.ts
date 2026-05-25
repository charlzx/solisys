import type { BatteryConfiguration } from '../types/index.js';

export function calculateTotalStorageWh(
  dailyEnergyWh: number,
  daysOfAutonomy: number,
): number {
  const energy = Number(dailyEnergyWh) || 0;
  const days = Number(daysOfAutonomy) || 0;
  if (energy <= 0 || days <= 0) return 0;

  return energy * days;
}

export function calculateRequiredBankCapacityWh(
  totalStorageWh: number,
  batteryDoD: number,
): number {
  const storage = Number(totalStorageWh) || 0;
  const dod = Number(batteryDoD) || 0;
  if (storage <= 0 || dod <= 0) return 0;

  return storage / dod;
}

export function calculateRequiredBankCapacityAh(
  requiredBankCapacityWh: number,
  systemVoltageV: number,
): number {
  const capacityWh = Number(requiredBankCapacityWh) || 0;
  const voltage = Number(systemVoltageV) || 0;
  if (capacityWh <= 0 || voltage <= 0) return 0;

  return capacityWh / voltage;
}

export function calculateBatteryConfiguration(
  systemVoltageV: number,
  singleBatteryVoltageV: number,
  requiredBankCapacityAh: number,
  singleBatteryAh: number,
): BatteryConfiguration {
  const sysV = Number(systemVoltageV) || 0;
  const batV = Number(singleBatteryVoltageV) || 0;
  const reqAh = Number(requiredBankCapacityAh) || 0;
  const batAh = Number(singleBatteryAh) || 0;

  if (sysV <= 0 || batV <= 0 || reqAh <= 0 || batAh <= 0) {
    return { batteriesInSeries: 0, numberOfParallelStrings: 0, totalBatteries: 0 };
  }

  const batteriesInSeries = Math.round(sysV / batV);
  const numberOfParallelStrings = Math.ceil(reqAh / batAh);
  const totalBatteries = batteriesInSeries * numberOfParallelStrings;

  return { batteriesInSeries, numberOfParallelStrings, totalBatteries };
}
