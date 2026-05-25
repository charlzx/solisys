export function calculateRequiredArrayWattage(
  dailyEnergyWh: number,
  peakSunHours: number,
  systemEfficiencyPct: number,
): number {
  const energy = Number(dailyEnergyWh) || 0;
  const psh = Number(peakSunHours) || 0;
  const eff = Number(systemEfficiencyPct) || 0;

  if (energy <= 0 || psh <= 0 || eff <= 0) return 0;

  return energy / (psh * (eff / 100));
}

export function calculateNumberOfPanels(
  requiredArrayW: number,
  panelWattageW: number,
): number {
  const required = Number(requiredArrayW) || 0;
  const panel = Number(panelWattageW) || 0;

  if (required <= 0 || panel <= 0) return 0;

  return Math.ceil(required / panel);
}

export function calculateActualArrayKw(
  numberOfPanels: number,
  panelWattageW: number,
): number {
  const panels = Number(numberOfPanels) || 0;
  const wattage = Number(panelWattageW) || 0;

  if (panels <= 0 || wattage <= 0) return 0;

  return (panels * wattage) / 1000;
}
