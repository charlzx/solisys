import { useMemo } from 'react';
import {
  calculateTotalDailyWh,
  calculateEstimatedPeakLoad,
  calculateRequiredInverterKva,
  findRecommendedInverterSize,
  calculateTotalStorageWh,
  calculateRequiredBankCapacityWh,
  calculateRequiredBankCapacityAh,
  calculateBatteryConfiguration,
  calculateRequiredArrayWattage,
  calculateNumberOfPanels,
  calculateActualArrayKw,
  calculateVocAtMinTemp,
  calculateVmpAtMaxTemp,
  calculatePanelsPerStringMin,
  calculatePanelsPerStringMax,
  calculateNumberOfStrings,
  calculateStringCurrent,
  calculateTotalArrayCurrent,
  calculateDcArrayWireSizing,
  calculateDcBatteryWireSizing,
  calculateAcWireSizing,
} from '../lib/calculations/index.js';
import { CHARGE_CONTROLLER_SAFETY_FACTOR, STANDARD_CONTROLLER_SIZES, getNominalVoltage } from '../data/constants.js';

export function useCalculations(project, selectedPanel, selectedInverter, selectedBattery) {
  return useMemo(() => {
    if (!project) {
      return emptyResults();
    }

    const totalDailyWh = project.calcMethod === 'audit'
      ? calculateTotalDailyWh(project.appliances)
      : (project.dailyEnergyKwh || 0) * 1000;
    const totalDailyKwh = totalDailyWh / 1000;

    const estimatedPeakLoadW = project.calcMethod === 'audit'
      ? calculateEstimatedPeakLoad(project.appliances)
      : 0;

    const peakLoad = project.isPeakLoadCustom
      ? (project.peakLoad || 0)
      : (project.peakLoad || estimatedPeakLoadW);

    const requiredInverterKva = calculateRequiredInverterKva(peakLoad);
    const recommendedInverterKva = findRecommendedInverterSize(requiredInverterKva);
    const selectedInverterKva = project.selectedInverterKva || recommendedInverterKva;

    const totalStorageWh = calculateTotalStorageWh(totalDailyWh, project.daysOfAutonomy);
    const requiredBankCapacityWh = calculateRequiredBankCapacityWh(totalStorageWh, project.batteryDoD);
    const requiredBankCapacityAh = calculateRequiredBankCapacityAh(requiredBankCapacityWh, project.batteryVoltage);

    const actualBatV = selectedBattery ? selectedBattery.voltageV : (project.availableBatteryVoltage || 12);
    const nominalBatV = getNominalVoltage(actualBatV);
    const batAh = selectedBattery ? selectedBattery.capacityAh : (project.availableBatteryAh || 200);

    const batteryConfig = calculateBatteryConfiguration(
      project.batteryVoltage,
      nominalBatV,
      requiredBankCapacityAh,
      batAh
    );

    const panelW = selectedPanel ? selectedPanel.pmax : (project.panelWattage || 0);
    const requiredPanelWattageTotal = calculateRequiredArrayWattage(
      totalDailyWh,
      project.peakSunHours,
      project.systemEfficiency
    );
    const calculatedPanels = calculateNumberOfPanels(requiredPanelWattageTotal, panelW);
    const numberOfPanels = project.customPanelCount > 0 ? project.customPanelCount : calculatedPanels;

    let vocAtMinTemp = 0;
    let vmpAtMaxTemp = 0;
    let panelsPerStringMin = 0;
    let panelsPerStringMax = 0;

    if (selectedPanel && selectedInverter) {
      vocAtMinTemp = calculateVocAtMinTemp(selectedPanel.voc, selectedPanel.tempCoeffVoc);
      vmpAtMaxTemp = calculateVmpAtMaxTemp(selectedPanel.vmp, selectedPanel.tempCoeffPmax);
      panelsPerStringMin = calculatePanelsPerStringMin(selectedInverter.mpptRangeMin, vmpAtMaxTemp);
      panelsPerStringMax = calculatePanelsPerStringMax(selectedInverter.maxPvInputV, vocAtMinTemp);
    }

    const panelsPerString = project.panelsPerString || panelsPerStringMin;
    const numberOfStrings = calculateNumberOfStrings(numberOfPanels, panelsPerString || 1);
    const actualArrayKw = calculateActualArrayKw(
      panelsPerString > 0 ? numberOfStrings * panelsPerString : numberOfPanels,
      panelW
    );

    const stringCurrentA = selectedPanel
      ? calculateStringCurrent(selectedPanel.isc)
      : 0;
    const totalArrayCurrentA = calculateTotalArrayCurrent(stringCurrentA, numberOfStrings);

    const inverterKva = selectedInverter ? selectedInverter.ratedKva : selectedInverterKva;
    const outputVoltageV = selectedInverter ? selectedInverter.outputVoltageV : 230;

    const dcArray = calculateDcArrayWireSizing(
      stringCurrentA,
      project.dcArrayCableLength,
      project.batteryVoltage,
      project.maxVoltageDrop_dcArray
    );
    const dcBattery = calculateDcBatteryWireSizing(
      inverterKva,
      project.batteryVoltage,
      project.dcBatteryCableLength,
      project.maxVoltageDrop_dcBattery
    );
    const ac = calculateAcWireSizing(
      inverterKva,
      outputVoltageV,
      project.acOutputCableLength,
      project.maxVoltageDrop_ac
    );

    const totalSolarCurrentA = panelW > 0 && project.batteryVoltage > 0
      ? (numberOfPanels * panelW) / project.batteryVoltage
      : 0;
    const rawControllerAmps = Math.ceil(totalSolarCurrentA * CHARGE_CONTROLLER_SAFETY_FACTOR);
    const chargeControllerAmps = STANDARD_CONTROLLER_SIZES.find(s => s >= rawControllerAmps) ||
      STANDARD_CONTROLLER_SIZES[STANDARD_CONTROLLER_SIZES.length - 1];

    const finalBatteryCount = project.customBatteryCount > 0 ? project.customBatteryCount : batteryConfig.totalBatteries;
    const costBreakdown = [
      { label: 'Solar Panels', qty: numberOfPanels, unitCost: project.costPerPanel, total: numberOfPanels * (project.costPerPanel || 0) },
      { label: 'Batteries', qty: finalBatteryCount, unitCost: project.costPerBattery, total: finalBatteryCount * (project.costPerBattery || 0) },
      { label: 'Inverter', qty: 1, unitCost: project.inverterCost, total: project.inverterCost || 0 },
      { label: 'Charge Controller', qty: project.hasBuiltInController ? 0 : 1, unitCost: project.controllerCost, total: project.hasBuiltInController ? 0 : (project.controllerCost || 0) },
      { label: 'Installation', qty: 1, unitCost: project.installationCost, total: project.installationCost || 0 },
      { label: 'Solar Cable', qty: project.solarCableLength, unitCost: project.solarCableCostPerMeter, total: (project.solarCableLength || 0) * (project.solarCableCostPerMeter || 0) },
      { label: 'Electrical Cable', qty: project.electricalCableLength, unitCost: project.electricalCableCostPerMeter, total: (project.electricalCableLength || 0) * (project.electricalCableCostPerMeter || 0) },
      { label: 'Breakers', qty: 1, unitCost: project.breakers, total: project.breakers || 0 },
      { label: 'Connectors', qty: 1, unitCost: project.connectors, total: project.connectors || 0 },
      { label: 'Mounting Structure', qty: 1, unitCost: project.mountingStructure, total: project.mountingStructure || 0 },
      { label: 'Permits', qty: 1, unitCost: project.permits, total: project.permits || 0 },
      { label: 'Miscellaneous', qty: 1, unitCost: project.miscOther, total: project.miscOther || 0 },
    ];
    const totalCost = costBreakdown.reduce((sum, item) => sum + item.total, 0);

    const systemType = project.systemType || 'off-grid';

    return {
      systemType,
      totalDailyWh,
      totalDailyKwh,
      estimatedPeakLoadW,
      requiredInverterKva,
      recommendedInverterKva,
      selectedInverterKva,
      totalStorageWh,
      requiredBankCapacityWh,
      requiredBankCapacityAh,
      calculatedPanels,
      totalNumberOfBatteries: project.customBatteryCount > 0 ? project.customBatteryCount : batteryConfig.totalBatteries,
      calculatedBatteries: batteryConfig.totalBatteries,
      batteriesInSeries: batteryConfig.batteriesInSeries,
      numberOfParallelStrings: batteryConfig.numberOfParallelStrings,
      requiredPanelWattageTotal,
      numberOfPanels,
      actualArrayKw,
      panelsPerStringMin,
      panelsPerStringMax,
      numberOfStrings,
      vocAtMinTemp,
      vmpAtMaxTemp,
      stringCurrentA,
      totalArrayCurrentA,
      chargeControllerAmps,
      wires: { dcArray, dcBattery, ac },
      totalCost,
      costBreakdown,
    };
  }, [project, selectedPanel, selectedInverter, selectedBattery]);
}

function emptyResults() {
  const emptyWire = { currentA: 0, minCrossSectionMm2: 0, recommendedMm2: 0, recommendedAwg: '—', actualVoltageDropPct: 0 };
  return {
    totalDailyWh: 0,
    totalDailyKwh: 0,
    estimatedPeakLoadW: 0,
    requiredInverterKva: 0,
    recommendedInverterKva: 0,
    selectedInverterKva: 0,
    totalStorageWh: 0,
    requiredBankCapacityWh: 0,
    requiredBankCapacityAh: 0,
    calculatedPanels: 0,
    totalNumberOfBatteries: 0,
    calculatedBatteries: 0,
    batteriesInSeries: 0,
    numberOfParallelStrings: 0,
    requiredPanelWattageTotal: 0,
    numberOfPanels: 0,
    actualArrayKw: 0,
    panelsPerStringMin: 0,
    panelsPerStringMax: 0,
    numberOfStrings: 0,
    vocAtMinTemp: 0,
    vmpAtMaxTemp: 0,
    stringCurrentA: 0,
    totalArrayCurrentA: 0,
    chargeControllerAmps: 0,
    wires: { dcArray: emptyWire, dcBattery: emptyWire, ac: emptyWire },
    totalCost: 0,
    costBreakdown: [],
  };
}
