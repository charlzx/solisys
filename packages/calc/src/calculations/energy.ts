import type { Appliance } from '../types/index.js';

export function calculateTotalDailyWh(appliances: Appliance[]): number {
  if (!Array.isArray(appliances) || appliances.length === 0) return 0;

  return appliances.reduce((total, app) => {
    const qty = Number(app.quantity) || 0;
    const hours = Number(app.hours) || 0;
    let wattage = Number(app.wattage) || 0;

    if (app.unit === 'HP') wattage = wattage * 746;
    if (app.unit === 'kW') wattage = wattage * 1000;

    return total + qty * wattage * hours;
  }, 0);
}

export function calculateEstimatedPeakLoad(appliances: Appliance[]): number {
  if (!Array.isArray(appliances) || appliances.length === 0) return 0;

  return appliances.reduce((total, app) => {
    const qty = Number(app.quantity) || 0;
    const surge = Number(app.surgeMultiplier) || 1.0;
    let wattage = Number(app.wattage) || 0;

    if (app.unit === 'HP') wattage = wattage * 746;
    if (app.unit === 'kW') wattage = wattage * 1000;

    return total + qty * wattage * surge;
  }, 0);
}
