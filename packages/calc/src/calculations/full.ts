import { calculateTotalDailyWh, calculateEstimatedPeakLoad } from './energy.js';
import { calculateRequiredInverterKva, findRecommendedInverterSize } from './inverter.js';
import {
  calculateTotalStorageWh,
  calculateRequiredBankCapacityWh,
  calculateRequiredBankCapacityAh,
  calculateBatteryConfiguration,
} from './battery.js';
import {
  calculateRequiredArrayWattage,
  calculateNumberOfPanels,
  calculateActualArrayKw,
} from './solar.js';
import {
  calculateNumberOfStrings,
  calculateChargeControllerAmps,
  calculateStringDesign,
} from './strings.js';
import {
  calculateDcArrayWireSizing,
  calculateDcBatteryWireSizing,
  calculateAcWireSizing,
  calculateAcWireSizingThreePhase,
} from './wire.js';
import type { FullSystemInput, FullSystemResult } from '../types/index.js';

export function calculateFullSystem(input: FullSystemInput): FullSystemResult {
  // ── 1. Load ────────────────────────────────────────────────────────────────
  let totalDailyWh: number;
  let estimatedPeakLoadW: number;

  if (input.appliances && input.appliances.length > 0) {
    totalDailyWh = calculateTotalDailyWh(input.appliances);
    estimatedPeakLoadW = calculateEstimatedPeakLoad(input.appliances);
  } else if (input.dailyEnergyKwh != null) {
    totalDailyWh = input.dailyEnergyKwh * 1000;
    estimatedPeakLoadW = input.peakLoadW ?? 0;
  } else {
    throw new Error('Either appliances or dailyEnergyKwh must be provided');
  }

  // ── 2. Inverter ────────────────────────────────────────────────────────────
  const requiredKva = calculateRequiredInverterKva(estimatedPeakLoadW, input.phase);
  const recommendedKva = findRecommendedInverterSize(requiredKva);
  const selectedKva = input.selectedInverterKva ?? recommendedKva;

  // ── 3. Battery ─────────────────────────────────────────────────────────────
  const totalStorageWh = calculateTotalStorageWh(totalDailyWh, input.daysOfAutonomy);
  const requiredBankWh = calculateRequiredBankCapacityWh(totalStorageWh, input.batteryDoD);
  const requiredBankAh = calculateRequiredBankCapacityAh(requiredBankWh, input.systemVoltageV);
  const batteryConfig = calculateBatteryConfiguration(
    input.systemVoltageV,
    input.batteryVoltageV,
    requiredBankAh,
    input.batteryCapacityAh,
  );

  const totalBatteries = input.customBatteryCount ?? batteryConfig.totalBatteries;

  // ── 4. Solar ───────────────────────────────────────────────────────────────
  const requiredArrayW = calculateRequiredArrayWattage(
    totalDailyWh,
    input.peakSunHours,
    input.systemEfficiencyPct,
  );
  const numberOfPanels = input.customPanelCount ?? calculateNumberOfPanels(requiredArrayW, input.panelWattageW);
  const actualArrayKwp = calculateActualArrayKw(numberOfPanels, input.panelWattageW);
  const chargeControllerA = calculateChargeControllerAmps(
    numberOfPanels,
    input.panelWattageW,
    input.systemVoltageV,
  );

  let numberOfStrings: number | undefined;
  let panelsPerString: number | undefined;
  let stringDesign = undefined;

  if (input.panelsPerString != null) {
    panelsPerString = input.panelsPerString;
    numberOfStrings = calculateNumberOfStrings(numberOfPanels, panelsPerString);
  }

  if (input.panelSpec != null) {
    const spec = input.panelSpec;
    stringDesign = calculateStringDesign(
      spec.vocStc,
      spec.vmpStc,
      spec.tempCoeffVoc,
      spec.tempCoeffPmax,
      spec.mpptRangeMinV,
      spec.maxPvInputV,
      spec.tempMinC,
      spec.tempMaxC,
    );
  }

  // ── 5. Wire (optional) ─────────────────────────────────────────────────────
  let wire: FullSystemResult['wire'];

  if (input.wireSizing != null) {
    const ws = input.wireSizing;
    const stringCurrent = numberOfPanels > 0 && input.panelWattageW > 0
      ? (input.panelWattageW / (input.systemVoltageV || 48)) * 1.25
      : 0;

    const dcArray = calculateDcArrayWireSizing(
      stringCurrent,
      ws.dcArrayLengthM,
      input.systemVoltageV,
      ws.maxDropDcArrayPct ?? 3,
    );

    const dcBattery = calculateDcBatteryWireSizing(
      selectedKva,
      input.systemVoltageV,
      ws.dcBatteryLengthM,
      ws.maxDropDcBatteryPct ?? 1,
    );

    const acOutput = ws.phase === 'three'
      ? calculateAcWireSizingThreePhase(
          selectedKva,
          ws.outputVoltageV ?? 400,
          ws.acOutputLengthM,
          ws.maxDropAcPct ?? 2,
        )
      : calculateAcWireSizing(
          selectedKva,
          ws.outputVoltageV ?? 230,
          ws.acOutputLengthM,
          ws.maxDropAcPct ?? 2,
        );

    wire = { dcArray, dcBattery, acOutput };
  }

  return {
    load: { totalDailyWh, estimatedPeakLoadW },
    inverter: { requiredKva, recommendedKva, selectedKva },
    battery: {
      totalStorageWh,
      requiredBankWh,
      requiredBankAh,
      ...batteryConfig,
      totalBatteries,
    },
    solar: {
      requiredArrayW,
      numberOfPanels,
      actualArrayKwp,
      ...(numberOfStrings != null && { numberOfStrings }),
      ...(panelsPerString != null && { panelsPerString }),
      ...(stringDesign != null && { stringDesign }),
      chargeControllerA,
    },
    ...(wire != null && { wire }),
  };
}
