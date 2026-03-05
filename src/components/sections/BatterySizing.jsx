import { useState } from 'react';
import { Check, X } from 'lucide-react';
import SectionHeader from '../ui/SectionHeader';
import Card from '../ui/Card';
import InputField from '../ui/InputField';
import SelectField from '../ui/SelectField';
import KpiBlock from '../ui/KpiBlock';
import ValidationChip from '../ui/ValidationChip';
import { formatNumber } from '../../lib/utils';
import { BATTERY_DOD_OPTIONS, SYSTEM_VOLTAGE_OPTIONS, getNominalVoltage } from '../../data/constants';

const CAPACITY_UNIT_OPTIONS = [
  { value: 'Ah', label: 'Ah (Amp-hours)' },
  { value: 'kWh', label: 'kWh (Kilowatt-hours)' },
];

export default function BatterySizing({
  project,
  updateField,
  calculations,
  selectedBattery,
  batteries = [],
}) {
  const [manualCapUnit, setManualCapUnit] = useState(project.manualBatteryCapUnit || 'Ah');

  const sysV = project.batteryVoltage || 48;
  const actualBatV = selectedBattery ? selectedBattery.voltageV : (project.availableBatteryVoltage || 12);
  const nominalBatV = getNominalVoltage(actualBatV);
  const isCompatible = nominalBatV > 0 && sysV % nominalBatV === 0;
  const seriesCount = isCompatible ? sysV / nominalBatV : 0;

  const handleClearBattery = () => {
    updateField('selectedBatteryId', null);
  };

  const handleManualKwhChange = (kwh) => {
    const v = project.availableBatteryVoltage || 12;
    const ah = v > 0 ? Math.round((kwh * 1000) / v * 100) / 100 : 0;
    updateField('availableBatteryAh', ah);
    updateField('manualBatteryKwh', kwh);
    updateField('manualBatteryCapUnit', 'kWh');
  };

  const handleManualAhChange = (ah) => {
    updateField('availableBatteryAh', ah);
    updateField('manualBatteryCapUnit', 'Ah');
  };

  const systemType = project.systemType || 'off-grid';
  const batterySubtitle = systemType === 'grid-tied'
    ? 'Optional backup storage for grid outages'
    : systemType === 'hybrid'
    ? 'Configure battery storage for night use & outage backup'
    : 'Configure battery storage for backup autonomy';

  return (
    <div id="section-battery">
      <SectionHeader
        stepNumber="03"
        title="Battery Bank"
        subtitle={batterySubtitle}
      />

      {systemType === 'grid-tied' && (
        <div style={{
          background: 'rgba(0, 195, 201, 0.06)',
          border: '1px solid rgba(0, 195, 201, 0.15)',
          borderRadius: 'var(--radius-md)',
          padding: 'var(--space-3) var(--space-4)',
          marginBottom: 'var(--space-4)',
          fontSize: 'var(--text-sm)',
          color: 'var(--color-primary-400)',
          fontFamily: 'var(--font-body)',
          lineHeight: 'var(--leading-relaxed)',
        }}>
          Batteries are optional for grid-tied systems. Skip this section if you don't need outage backup.
        </div>
      )}

      <Card style={{ marginBottom: 'var(--space-4)' }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
          gap: 'var(--space-4)',
        }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', marginBottom: 'var(--space-1)' }}>
              <label style={{
                fontSize: 'var(--text-sm)',
                color: 'var(--color-text-secondary)',
                fontFamily: 'var(--font-body)',
                fontWeight: 'var(--weight-medium)',
              }}>
                Backup Duration
              </label>
            </div>
            <div style={{ display: 'flex', gap: 'var(--space-3)', alignItems: 'center' }}>
              <div style={{ flex: 1, minWidth: '90px' }}>
                <InputField
                  type="number"
                  value={Math.floor(project.daysOfAutonomy || 0)}
                  onChange={(e) => {
                    const days = Math.max(0, Math.floor(Number(e.target.value) || 0));
                    const currentHours = Math.min(23, Math.floor(((project.daysOfAutonomy || 0) % 1) * 24));
                    updateField('daysOfAutonomy', days + currentHours / 24);
                  }}
                  min={0}
                  unit="days"
                  compact
                />
              </div>
              <div style={{ flex: 1, minWidth: '90px' }}>
                <InputField
                  type="number"
                  value={Math.min(23, Math.floor(((project.daysOfAutonomy || 0) % 1) * 24))}
                  onChange={(e) => {
                    const hours = Math.min(23, Math.max(0, Math.floor(Number(e.target.value) || 0)));
                    const currentDays = Math.floor(project.daysOfAutonomy || 0);
                    updateField('daysOfAutonomy', currentDays + hours / 24);
                  }}
                  min={0}
                  max={23}
                  unit="hrs"
                  compact
                />
              </div>
            </div>
            <span style={{
              fontSize: 'var(--text-xs)',
              color: 'var(--color-text-muted)',
              fontFamily: 'var(--font-body)',
              marginTop: 'var(--space-1)',
              display: 'block',
            }}>
              How long the battery should power the load without solar
            </span>
          </div>

          <SelectField
            label="Battery DoD"
            value={project.batteryDoD}
            onChange={(e) => updateField('batteryDoD', Number(e.target.value))}
            options={BATTERY_DOD_OPTIONS}
            tooltip="Depth of Discharge — how deeply the batteries should be cycled"
          />

          <div>
            <label style={{
              display: 'block',
              fontSize: 'var(--text-sm)',
              color: 'var(--color-text-secondary)',
              fontFamily: 'var(--font-body)',
              fontWeight: 'var(--weight-medium)',
              marginBottom: 'var(--space-1)',
            }}>
              System Voltage
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', borderRadius: 'var(--radius-sm)', overflow: 'hidden', border: '1px solid var(--color-border-default)' }}>
              {SYSTEM_VOLTAGE_OPTIONS.map((opt, idx) => (
                <button
                  key={opt.value}
                  onClick={() => updateField('batteryVoltage', opt.value)}
                  style={{
                    padding: 'var(--space-2) var(--space-2)',
                    height: '42px',
                    border: 'none',
                    background: sysV === opt.value ? 'var(--color-primary-500)' : 'var(--color-bg-elevated)',
                    color: sysV === opt.value ? 'var(--color-text-inverse)' : 'var(--color-text-primary)',
                    fontFamily: 'var(--font-numeric)',
                    fontSize: 'var(--text-sm)',
                    fontWeight: sysV === opt.value ? 'var(--weight-bold)' : 'var(--weight-medium)',
                    cursor: 'pointer',
                    transition: 'all var(--duration-normal) var(--ease-default)',
                    borderRight: (idx % 3 !== 2) ? '1px solid var(--color-border-default)' : 'none',
                    borderBottom: idx < 3 ? '1px solid var(--color-border-default)' : 'none',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </Card>

      <Card style={{ marginBottom: 'var(--space-4)' }}>
        <div style={{ marginBottom: 'var(--space-4)' }}>
          <span style={{
            fontFamily: 'var(--font-body)',
            fontSize: 'var(--text-sm)',
            fontWeight: 'var(--weight-semibold)',
            color: 'var(--color-text-primary)',
            display: 'block',
            marginBottom: 'var(--space-2)',
          }}>
            Individual Battery Specs
            <span style={{ fontWeight: 'var(--weight-normal)', color: 'var(--color-text-muted)', marginLeft: 'var(--space-2)', fontSize: 'var(--text-xs)' }}>(select from library or enter manually)</span>
          </span>
          {batteries.length > 0 ? (
            <>
              <SelectField
                label="Select Battery"
                value={project.selectedBatteryId || ''}
                onChange={(e) => {
                  const id = e.target.value;
                  if (!id) {
                    handleClearBattery();
                    return;
                  }
                  const battery = batteries.find(b => b.id === id);
                  if (battery) {
                    updateField('selectedBatteryId', battery.id);
                    updateField('availableBatteryAh', battery.capacityAh);
                    updateField('availableBatteryVoltage', battery.voltageV);
                  }
                }}
                placeholder="-- None (manual entry) --"
                options={batteries.map(b => {
                  const cap = b.capacityUnit === 'kWh' ? `${b.capacityKwh}kWh` : `${b.capacityAh}Ah`;
                  return { value: b.id, label: `${b.manufacturer} ${b.model} (${cap}, ${b.voltageV}V)` };
                })}
              />
              {project.selectedBatteryId && (
                <button
                  onClick={handleClearBattery}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 'var(--space-1)',
                    marginTop: 'var(--space-2)',
                    padding: 'var(--space-1) var(--space-2)',
                    background: 'none',
                    border: 'none',
                    color: 'var(--color-text-muted)',
                    fontSize: 'var(--text-xs)',
                    cursor: 'pointer',
                    fontFamily: 'var(--font-body)',
                  }}
                >
                  <X size={12} /> Clear selection
                </button>
              )}
            </>
          ) : (
            <div style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)', fontStyle: 'italic' }}>
              No batteries saved. Add components in Settings → My Components
            </div>
          )}
        </div>

        {selectedBattery && (
          <div style={{
            marginBottom: 'var(--space-4)',
            padding: 'var(--space-4)',
            background: 'var(--color-primary-glow)',
            border: '1px solid var(--color-primary-500)',
            borderRadius: 'var(--radius-sm)',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 'var(--space-3)' }}>
              <div style={{ minWidth: 0 }}>
                <div style={{
                  fontFamily: 'var(--font-body)',
                  fontSize: 'var(--text-base)',
                  fontWeight: 'var(--weight-semibold)',
                  color: 'var(--color-text-primary)',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                }}>
                  {selectedBattery.manufacturer} {selectedBattery.model}
                </div>
                <div style={{
                  fontFamily: 'var(--font-body)',
                  fontSize: 'var(--text-sm)',
                  color: 'var(--color-text-secondary)',
                  marginTop: '2px',
                }}>
                  {selectedBattery.chemistry} • {selectedBattery.voltageV}V • {selectedBattery.capacityUnit === 'kWh' ? `${selectedBattery.capacityKwh}kWh` : `${selectedBattery.capacityAh}Ah`}
                </div>
              </div>
              <Check size={20} style={{ color: 'var(--color-primary-500)', flexShrink: 0 }} />
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--space-2)' }}>
              {[
                { label: 'Capacity', value: `${selectedBattery.capacityKwh} kWh` },
                { label: 'DoD', value: `${(selectedBattery.maxDod * 100).toFixed(0)}%` },
                { label: 'Cycle Life', value: `${selectedBattery.cycleLife}` },
                { label: 'Weight', value: `${selectedBattery.weightKg} kg` },
              ].map((spec) => (
                <span
                  key={spec.label}
                  style={{
                    padding: 'var(--space-1) var(--space-2)',
                    background: 'var(--color-bg-elevated)',
                    border: '1px solid var(--color-border-default)',
                    borderRadius: 'var(--radius-sm)',
                    fontSize: 'var(--text-xs)',
                    fontFamily: 'var(--font-numeric)',
                    color: 'var(--color-text-secondary)',
                  }}
                >
                  {spec.label}: {spec.value}
                </span>
              ))}
            </div>
          </div>
        )}

        {!selectedBattery && (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
            gap: 'var(--space-4)',
            marginBottom: 'var(--space-4)',
          }}>
            <InputField
              label="Battery Voltage"
              type="number"
              value={project.availableBatteryVoltage}
              onChange={(e) => updateField('availableBatteryVoltage', Number(e.target.value))}
              unit="V"
              min={0}
              tooltip="Actual voltage of a single battery (e.g. 51.2V for a 48V lithium)"
            />
            <SelectField
              label="Capacity Unit"
              value={manualCapUnit}
              onChange={(e) => {
                setManualCapUnit(e.target.value);
                updateField('manualBatteryCapUnit', e.target.value);
              }}
              options={CAPACITY_UNIT_OPTIONS}
            />
            {manualCapUnit === 'kWh' ? (
              <InputField
                label="Battery Capacity"
                type="number"
                value={project.manualBatteryKwh || ''}
                onChange={(e) => handleManualKwhChange(Number(e.target.value))}
                unit="kWh"
                min={0}
                step={0.1}
                tooltip="Capacity of a single battery in kilowatt-hours (common for lithium)"
              />
            ) : (
              <InputField
                label="Battery Capacity"
                type="number"
                value={project.availableBatteryAh}
                onChange={(e) => handleManualAhChange(Number(e.target.value))}
                unit="Ah"
                min={0}
                tooltip="Capacity of a single battery in Amp-hours"
              />
            )}
            {manualCapUnit === 'kWh' && project.availableBatteryAh > 0 && (
              <div style={{
                display: 'flex',
                alignItems: 'flex-end',
                paddingBottom: 'var(--space-2)',
              }}>
                <span style={{
                  fontSize: 'var(--text-sm)',
                  color: 'var(--color-text-secondary)',
                  fontFamily: 'var(--font-numeric)',
                }}>
                  = {formatNumber(project.availableBatteryAh, 1)} Ah
                </span>
              </div>
            )}
          </div>
        )}

        <div style={{ marginTop: 'var(--space-2)' }}>
          {isCompatible ? (
            <ValidationChip
              status="success"
              message={`${sysV}V system — ${seriesCount}× ${actualBatV}V${actualBatV !== nominalBatV ? ` (nominal ${nominalBatV}V)` : ''} batteries in series`}
              size="md"
            />
          ) : (
            nominalBatV > 0 && (
              <ValidationChip
                status="error"
                message={`System voltage (${sysV}V) is not compatible with battery voltage (${actualBatV}V${actualBatV !== nominalBatV ? ` / nominal ${nominalBatV}V` : ''})`}
                size="md"
              />
            )
          )}
        </div>
      </Card>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
        gap: 'var(--space-4)',
      }}>
        <Card style={{ padding: 'var(--space-4)' }}>
          <KpiBlock
            label="Required Capacity"
            value={formatNumber(calculations.requiredBankCapacityWh, 0)}
            unit="Wh"
            colorState={calculations.requiredBankCapacityWh > 0 ? 'valid' : 'neutral'}
          />
        </Card>
        <Card style={{ padding: 'var(--space-4)' }}>
          <KpiBlock
            label="Bank Capacity"
            value={formatNumber(calculations.requiredBankCapacityAh, 0)}
            unit="Ah"
            colorState={calculations.requiredBankCapacityAh > 0 ? 'valid' : 'neutral'}
          />
        </Card>
        <Card style={{ padding: 'var(--space-4)' }}>
          <KpiBlock
            label="Calculated Batteries"
            value={calculations.calculatedBatteries}
            unit="units"
            colorState={calculations.calculatedBatteries > 0 ? 'valid' : 'neutral'}
          />
        </Card>
        <Card style={{ padding: 'var(--space-4)' }}>
          <KpiBlock
            label="Configuration"
            value={calculations.batteriesInSeries > 0
              ? `${calculations.batteriesInSeries}S × ${calculations.numberOfParallelStrings}P`
              : '—'}
            colorState={calculations.totalNumberOfBatteries > 0 ? 'valid' : 'neutral'}
          />
        </Card>
      </div>

      <Card style={{ marginTop: 'var(--space-4)' }}>
        <InputField
          label="Custom Battery Count"
          tooltip="Override the calculated number of batteries with your own count. Leave empty to use the calculated value."
          type="number"
          value={project.customBatteryCount || ''}
          onChange={(e) => updateField('customBatteryCount', e.target.value ? parseInt(e.target.value) : 0)}
          placeholder={`Calculated: ${calculations.calculatedBatteries}`}
          min={0}
        />
        {project.customBatteryCount > 0 && (
          <div style={{
            fontSize: 'var(--text-xs)',
            color: 'var(--color-primary-500)',
            fontFamily: 'var(--font-body)',
            marginTop: 'var(--space-1)',
          }}>
            Using custom count: {project.customBatteryCount} batteries (calculated: {calculations.calculatedBatteries})
          </div>
        )}
      </Card>
    </div>
  );
}
