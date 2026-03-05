import { formatNumber, formatAutonomy } from './utils';

function plural(count, singular, pluralForm) {
  return count === 1 ? `${count} ${singular}` : `${count} ${pluralForm || singular + 's'}`;
}

export function generateInterpretation(project, calculations, selectedPanel, selectedBattery, selectedInverter) {
  const lines = [];
  const totalKwh = calculations.totalDailyKwh;
  const peakW = calculations.estimatedPeakLoadW || project.peakLoad || 0;
  const autonomy = project.daysOfAutonomy || 0;
  const sysV = project.batteryVoltage || 48;
  const systemType = project.systemType || 'off-grid';
  lines.push(`## System Overview`);
  lines.push('');

  const typeLabel = systemType === 'grid-tied' ? 'grid-tied' : systemType === 'hybrid' ? 'hybrid' : 'off-grid';

  if (totalKwh > 0) {
    lines.push(`This is a ${typeLabel} solar power system designed to supply ${formatNumber(totalKwh, 2)} kWh of energy per day. ` +
      (peakW > 0
        ? `The peak demand is estimated at ${formatNumber(peakW, 0)} W, which is the maximum power all connected loads would draw if running simultaneously.`
        : `The daily energy figure is based on the average consumption entered.`));
  } else {
    lines.push(`No load data has been entered yet. Complete the Load Analysis section to get started.`);
    return lines.join('\n');
  }

  lines.push('');
  lines.push(`## Inverter`);
  lines.push('');

  const invKva = project.selectedInverterKva || calculations.recommendedInverterKva || 0;
  if (invKva > 0) {
    const invName = selectedInverter ? selectedInverter.name : `${invKva} kVA inverter`;
    const selectionNote = project.selectedInverterKva
      ? `A ${invName} has been selected.`
      : `A ${invName} has been auto-recommended based on your load profile.`;
    lines.push(`${selectionNote} This inverter converts DC power from the batteries and solar panels into AC power for your appliances. ` +
      `At ${invKva} kVA, it can handle up to approximately ${formatNumber(invKva * 1000 * 0.8, 0)} W of continuous load (at 0.8 power factor). ` +
      (peakW > 0 && invKva * 1000 >= peakW
        ? `This is sufficient to cover the estimated peak demand of ${formatNumber(peakW, 0)} W.`
        : peakW > 0
        ? `Note: the peak demand of ${formatNumber(peakW, 0)} W is close to or exceeds the inverter's capacity — consider a larger inverter or reducing simultaneous loads.`
        : ''));
  } else {
    lines.push(`No inverter has been selected yet. Complete the Inverter Sizing section.`);
  }

  lines.push('');
  lines.push(`## Battery Bank`);
  lines.push('');

  const totalBatteries = calculations.totalNumberOfBatteries || 0;
  if (totalBatteries > 0) {
    let batName;
    if (selectedBattery) {
      const cap = selectedBattery.capacityUnit === 'kWh'
        ? `${selectedBattery.capacityKwh}kWh`
        : `${selectedBattery.capacityAh}Ah`;
      batName = selectedBattery.name || `${cap} ${selectedBattery.voltageV}V battery`;
    } else if (project.manualBatteryCapUnit === 'kWh' && project.manualBatteryKwh > 0) {
      batName = `${project.manualBatteryKwh}kWh ${project.availableBatteryVoltage}V battery`;
    } else {
      batName = `${project.availableBatteryAh}Ah ${project.availableBatteryVoltage}V battery`;
    }
    const series = calculations.batteriesInSeries || 0;
    const parallel = calculations.numberOfParallelStrings || 0;
    const bankKwh = calculations.requiredBankCapacityWh ? calculations.requiredBankCapacityWh / 1000 : 0;
    const dod = (project.batteryDoD || 0.5) * 100;

    lines.push(`The battery bank uses ${plural(totalBatteries, 'unit')} of ${batName}, configured as ${series} in series and ${parallel} in parallel (${series}S${parallel}P). ` +
      `This creates a ${sysV}V battery bank with approximately ${formatNumber(bankKwh, 1)} kWh of usable capacity at ${dod}% depth of discharge.`);
    lines.push('');

    if (systemType === 'grid-tied') {
      lines.push(`In this grid-tied system, the batteries serve as backup storage for power outages. The grid handles normal nighttime and cloudy-period power needs, so these batteries provide emergency backup only.`);
    } else if (systemType === 'hybrid') {
      lines.push(`In this hybrid system, the batteries cover nighttime loads and power outages. The grid supplements when solar production is insufficient, which reduces battery cycling and extends battery lifespan. ` +
        `With a backup duration of ${formatAutonomy(autonomy)}, the system can run independently during grid outages for that period.`);
    } else {
      lines.push(`With a backup duration of ${formatAutonomy(autonomy)}, the system can power your loads for that period without any solar input — ` +
        `useful during extended cloudy weather or nighttime usage.`);
    }

    if (autonomy < 1 && systemType === 'off-grid') {
      lines.push('');
      lines.push(`Tip: A backup duration under 1 day means the system relies heavily on daily solar charging. Consider increasing autonomy if your area experiences frequent cloudy days.`);
    }
  } else if (systemType === 'grid-tied') {
    lines.push(`No batteries are configured for this grid-tied system. The grid will handle all nighttime and cloudy-period power needs. If you want outage backup, configure batteries in the Battery Bank section.`);
  } else {
    lines.push(`No battery configuration has been calculated yet. Complete the Battery Bank section.`);
  }

  lines.push('');
  lines.push(`## Solar Array`);
  lines.push('');

  const numPanels = calculations.numberOfPanels || 0;
  if (numPanels > 0) {
    const panelW = selectedPanel ? selectedPanel.pmax : (project.panelWattage || 0);
    const panelName = selectedPanel ? selectedPanel.name : `${panelW}W panel`;
    const arrayKw = calculations.actualArrayKw || (numPanels * panelW / 1000);
    const psh = project.peakSunHours || 5;
    const eff = project.systemEfficiency || 0.85;
    const expectedDaily = arrayKw * psh * eff;

    lines.push(`The solar array consists of ${plural(numPanels, 'panel')} (${panelName}) for a total capacity of ${formatNumber(arrayKw, 2)} kW. ` +
      `With ${psh} peak sun hours per day and ${(eff * 100).toFixed(0)}% system efficiency, the array is expected to generate approximately ${formatNumber(expectedDaily, 1)} kWh per day.`);

    if (systemType === 'grid-tied') {
      lines.push('');
      if (expectedDaily >= totalKwh) {
        lines.push(`The array generates enough to cover your daily load of ${formatNumber(totalKwh, 2)} kWh, with ${formatNumber(expectedDaily - totalKwh, 1)} kWh surplus for battery charging.`);
      } else {
        lines.push(`The expected daily generation (${formatNumber(expectedDaily, 1)} kWh) is less than the daily demand (${formatNumber(totalKwh, 2)} kWh). The grid will supplement the shortfall of ${formatNumber(totalKwh - expectedDaily, 1)} kWh.`);
      }
    } else if (systemType === 'hybrid') {
      lines.push('');
      if (expectedDaily >= totalKwh) {
        lines.push(`The array generates enough to cover your daily load of ${formatNumber(totalKwh, 2)} kWh, with ${formatNumber(expectedDaily - totalKwh, 1)} kWh surplus for battery charging. The grid supplements during low-production periods, reducing battery strain and extending battery life.`);
      } else {
        lines.push(`The expected daily generation (${formatNumber(expectedDaily, 1)} kWh) is less than the daily demand (${formatNumber(totalKwh, 2)} kWh). The grid will supplement the shortfall of ${formatNumber(totalKwh - expectedDaily, 1)} kWh, keeping battery cycling manageable.`);
      }
    } else {
      if (expectedDaily >= totalKwh) {
        lines.push('');
        lines.push(`This is sufficient to cover your daily energy demand of ${formatNumber(totalKwh, 2)} kWh, with a surplus of ${formatNumber(expectedDaily - totalKwh, 1)} kWh for battery charging.`);
      } else {
        lines.push('');
        lines.push(`Note: The expected daily generation (${formatNumber(expectedDaily, 1)} kWh) is less than the daily demand (${formatNumber(totalKwh, 2)} kWh). The battery bank will need to make up the difference. Consider adding more panels or reducing loads.`);
      }
    }
  } else {
    lines.push(`No solar array has been calculated yet. Complete the Solar Array section.`);
  }

  if (project.wireSectionEnabled) {
    lines.push('');
    lines.push(`## Wiring`);
    lines.push('');
    lines.push(`Wire sizing has been enabled for this project. Proper cable sizing ensures minimal voltage drop and safe operation. Check the Wire Sizing section for recommended cable sizes for each circuit.`);
  }

  if (project.costSectionEnabled) {
    lines.push('');
    lines.push(`## Cost Estimate`);
    lines.push('');
    lines.push(`Cost estimation is enabled for this project. Review the Cost Estimation section for a detailed breakdown of component costs. Actual costs may vary based on supplier pricing, installation labor, and additional accessories like mounting hardware, fuses, and breakers.`);
  }

  lines.push('');
  lines.push(`## Summary`);
  lines.push('');

  const summaryParts = [];
  if (totalKwh > 0) summaryParts.push(`${formatNumber(totalKwh, 2)} kWh/day load`);
  if (invKva > 0) summaryParts.push(`${invKva} kVA inverter`);
  if (numPanels > 0) summaryParts.push(`${plural(numPanels, 'solar panel')} (${formatNumber(calculations.actualArrayKw || 0, 2)} kW)`);
  if (totalBatteries > 0) summaryParts.push(`${plural(totalBatteries, 'battery', 'batteries')} (${formatAutonomy(autonomy)} backup)`);

  if (summaryParts.length > 0) {
    if (systemType === 'grid-tied') {
      lines.push(`In short, this is a ${sysV}V grid-tied system with ${summaryParts.join(', ')}. ` +
        `Solar production supplements your grid power to reduce electricity costs.` +
        (totalBatteries > 0 ? ` Batteries provide backup during grid outages.` : ''));
    } else if (systemType === 'hybrid') {
      lines.push(`In short, this is a ${sysV}V hybrid system with ${summaryParts.join(', ')}. ` +
        `The grid supplements solar when needed, while batteries provide power at night and during outages. This configuration reduces battery wear and provides reliable power even with an unreliable grid.`);
    } else {
      lines.push(`In short, this is a ${sysV}V off-grid system with ${summaryParts.join(', ')}. ` +
        `The system is designed to be fully self-sufficient under normal solar conditions and provide backup power during low-sun periods.`);
    }
  }

  return lines.join('\n');
}
