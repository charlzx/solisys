export function calculateRequiredArrayWattage(dailyEnergyWh, peakSunHours, systemEfficiency) {
  const energy = Number(dailyEnergyWh) || 0;
  const psh = Number(peakSunHours) || 0;
  const eff = Number(systemEfficiency) || 0;

  if (energy <= 0 || psh <= 0 || eff <= 0) return 0;

  const systemEfficiencyDecimal = eff / 100;
  return energy / (psh * systemEfficiencyDecimal);
}

export function calculateNumberOfPanels(requiredArrayW, panelWattageW) {
  const required = Number(requiredArrayW) || 0;
  const panel = Number(panelWattageW) || 0;

  if (required <= 0 || panel <= 0) return 0;

  return Math.ceil(required / panel);
}

export function calculateActualArrayKw(numberOfPanels, panelWattageW) {
  const panels = Number(numberOfPanels) || 0;
  const wattage = Number(panelWattageW) || 0;

  if (panels <= 0 || wattage <= 0) return 0;

  return (panels * wattage) / 1000;
}
