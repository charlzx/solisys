export function calculateTotalDailyWh(appliances) {
  if (!Array.isArray(appliances) || appliances.length === 0) return 0;

  return appliances.reduce((total, app) => {
    const qty = Number(app.quantity) || 0;
    const hours = Number(app.hours) || 0;
    let wattage = Number(app.wattage) || 0;

    if (app.unit === 'HP') {
      wattage = wattage * 746;
    }

    return total + (qty * wattage * hours);
  }, 0);
}

export function calculateEstimatedPeakLoad(appliances) {
  if (!Array.isArray(appliances) || appliances.length === 0) return 0;

  return appliances.reduce((total, app) => {
    const qty = Number(app.quantity) || 0;
    let wattage = Number(app.wattage) || 0;

    if (app.unit === 'HP') {
      wattage = wattage * 746;
    }

    return total + (qty * wattage);
  }, 0);
}
