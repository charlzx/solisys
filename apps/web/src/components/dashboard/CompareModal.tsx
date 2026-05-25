import { X } from 'lucide-react';
import Button from '../ui/Button';
import { formatNumber, formatCurrency } from '../../lib/utils';
import { calculateRequiredInverterKva, findRecommendedInverterSize } from '../../lib/calculations';

function getProjectStats(project) {
  const dailyWh = project.calcMethod === 'audit'
    ? (project.appliances || []).reduce((sum, a) => {
        const w = a.unit === 'HP' ? a.wattage * 746 : a.wattage;
        return sum + (a.quantity || 0) * (w || 0) * (a.hours || 0);
      }, 0)
    : (project.dailyEnergyKwh || 0) * 1000;

  const dailyKwh = dailyWh / 1000;

  const peakLoadW = project.calcMethod === 'audit'
    ? (project.appliances || []).reduce((sum, a) => {
        const w = a.unit === 'HP' ? a.wattage * 746 : a.wattage;
        return sum + (a.quantity || 0) * (w || 0);
      }, 0)
    : (project.peakLoad || 0);

  const panelW = project.panelWattage || 0;
  const eff = (project.systemEfficiency || 80) / 100;
  const psh = project.peakSunHours || 5;
  const requiredWattage = psh > 0 && eff > 0 ? dailyWh / (psh * eff) : 0;
  const numberOfPanels = project.customPanelCount > 0
    ? project.customPanelCount
    : (panelW > 0 ? Math.ceil(requiredWattage / panelW) : 0);
  const arrayKw = (numberOfPanels * panelW) / 1000;

  const totalStorageWh = dailyWh * (project.daysOfAutonomy || 1);
  const batteryKwh = (project.batteryDoD || 0.8) > 0
    ? totalStorageWh / (project.batteryDoD || 0.8) / 1000
    : 0;

  const requiredKva = calculateRequiredInverterKva(peakLoadW);
  const recommendedKva = findRecommendedInverterSize(requiredKva);
  const inverterKva = project.selectedInverterKva || recommendedKva || 0;

  const batAh = project.availableBatteryAh || 200;
  const batV = project.availableBatteryVoltage || 12;
  const sysV = project.batteryVoltage || 48;
  const requiredAh = sysV > 0 ? (totalStorageWh / (project.batteryDoD || 0.8)) / sysV : 0;
  const series = batV > 0 ? Math.ceil(sysV / batV) : 1;
  const parallel = batAh > 0 ? Math.ceil(requiredAh / batAh) : 0;
  const totalBatteries = project.customBatteryCount > 0 ? project.customBatteryCount : series * parallel;

  const costItems = [
    numberOfPanels * (project.costPerPanel || 0),
    totalBatteries * (project.costPerBattery || 0),
    project.inverterCost || 0,
    project.hasBuiltInController ? 0 : (project.controllerCost || 0),
    project.installationCost || 0,
    (project.solarCableLength || 0) * (project.solarCableCostPerMeter || 0),
    (project.electricalCableLength || 0) * (project.electricalCableCostPerMeter || 0),
    project.breakers || 0,
    project.connectors || 0,
    project.mountingStructure || 0,
    project.permits || 0,
    project.miscOther || 0,
  ];
  const totalCost = costItems.reduce((s, v) => s + v, 0);

  return { dailyKwh, peakLoadW, arrayKw, numberOfPanels, batteryKwh, inverterKva, totalCost };
}

function CompareRow({ label, valA, valB, unit, format, currency }) {
  const renderVal = (v) => {
    if (format === 'currency') return formatCurrency(v, currency);
    if (v === 0 || v === null || v === undefined) return '—';
    return `${formatNumber(v, 1)}${unit ? ` ${unit}` : ''}`;
  };

  const diff = valA > 0 && valB > 0 ? valB - valA : null;
  const showDiff = diff !== null && diff !== 0;

  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: '1fr 1fr 1fr',
      gap: 'var(--space-3)',
      padding: 'var(--space-3) 0',
      borderBottom: '1px solid rgba(255,255,255,0.05)',
      alignItems: 'center',
    }}>
      <div style={{
        fontSize: 'var(--text-sm)',
        color: 'var(--color-text-secondary)',
        fontFamily: 'var(--font-body)',
      }}>
        {label}
      </div>
      <div style={{
        fontSize: 'var(--text-sm)',
        color: 'var(--color-text-primary)',
        fontFamily: 'var(--font-numeric)',
        textAlign: 'right',
      }}>
        {renderVal(valA)}
      </div>
      <div style={{
        fontSize: 'var(--text-sm)',
        color: 'var(--color-text-primary)',
        fontFamily: 'var(--font-numeric)',
        textAlign: 'right',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'flex-end',
        gap: 'var(--space-2)',
      }}>
        {renderVal(valB)}
        {showDiff && (
          <span style={{
            fontSize: '10px',
            color: diff > 0 ? 'var(--color-primary-500)' : 'var(--color-warning, #f59e0b)',
            fontFamily: 'var(--font-numeric)',
          }}>
            {diff > 0 ? '+' : ''}{format === 'currency' ? formatNumber(diff, 0) : formatNumber(diff, 1)}
          </span>
        )}
      </div>
    </div>
  );
}

export default function CompareModal({ isOpen, onClose, projectA, projectB }) {
  if (!isOpen || !projectA || !projectB) return null;

  const statsA = getProjectStats(projectA);
  const statsB = getProjectStats(projectB);

  const currencyA = projectA.currency || 'NGN';
  const currencyB = projectB.currency || 'NGN';
  const sameCurrency = currencyA === currencyB;

  const rows = [
    { label: 'Daily Energy', key: 'dailyKwh', unit: 'kWh' },
    { label: 'Peak Load', key: 'peakLoadW', unit: 'W' },
    { label: 'Array Size', key: 'arrayKw', unit: 'kW' },
    { label: 'Panel Count', key: 'numberOfPanels', unit: '' },
    { label: 'Battery Bank', key: 'batteryKwh', unit: 'kWh' },
    { label: 'Inverter', key: 'inverterKva', unit: 'kVA' },
    { label: 'Total Cost', key: 'totalCost', unit: '', format: 'currency' },
  ];

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 300,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'rgba(0, 0, 0, 0.7)',
        backdropFilter: 'blur(4px)',
        animation: 'modalOverlayIn var(--duration-normal) var(--ease-default)',
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose?.();
      }}
    >
      <div
        style={{
          background: 'var(--color-bg-surface)',
          border: '1px solid var(--color-border-strong)',
          borderRadius: 'var(--radius-lg)',
          width: '90vw',
          maxWidth: '560px',
          maxHeight: '85vh',
          overflow: 'auto',
          padding: 'var(--space-8)',
          animation: 'modalPanelIn var(--duration-normal) var(--ease-spring)',
        }}
      >
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: 'var(--space-6)',
        }}>
          <h2 style={{
            fontSize: 'var(--text-lg)',
            fontWeight: 'var(--weight-bold)',
            color: 'var(--color-text-primary)',
            fontFamily: 'var(--font-display)',
            margin: 0,
          }}>
            Compare Projects
          </h2>
          <Button variant="icon-only" onClick={onClose} title="Close">
            <X size={18} />
          </Button>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr 1fr',
          gap: 'var(--space-3)',
          marginBottom: 'var(--space-4)',
          paddingBottom: 'var(--space-3)',
          borderBottom: '1px solid rgba(255,255,255,0.10)',
        }}>
          <div style={{
            fontSize: 'var(--text-xs)',
            color: 'var(--color-text-muted)',
            fontFamily: 'var(--font-body)',
            textTransform: 'uppercase',
            letterSpacing: 'var(--tracking-widest)',
          }}>
            Metric
          </div>
          <div style={{
            fontSize: 'var(--text-xs)',
            color: 'var(--color-primary-500)',
            fontFamily: 'var(--font-body)',
            textAlign: 'right',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}>
            {projectA.projectName || 'Untitled'}
          </div>
          <div style={{
            fontSize: 'var(--text-xs)',
            color: 'var(--color-primary-500)',
            fontFamily: 'var(--font-body)',
            textAlign: 'right',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}>
            {projectB.projectName || 'Untitled'}
          </div>
        </div>

        {rows.map((row) => (
          <CompareRow
            key={row.key}
            label={row.label}
            valA={statsA[row.key]}
            valB={statsB[row.key]}
            unit={row.unit}
            format={row.format}
            currency={sameCurrency ? currencyA : undefined}
          />
        ))}
      </div>

      <style>{`
        @keyframes modalOverlayIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes modalPanelIn {
          from { opacity: 0; transform: scale(0.95); }
          to { opacity: 1; transform: scale(1); }
        }
      `}</style>
    </div>
  );
}
