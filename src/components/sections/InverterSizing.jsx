import { useState } from 'react';
import { Check, X } from 'lucide-react';
import SectionHeader from '../ui/SectionHeader';
import Card from '../ui/Card';
import InputField from '../ui/InputField';
import SelectField from '../ui/SelectField';
import Toggle from '../ui/Toggle';
import KpiBlock from '../ui/KpiBlock';
import ValidationChip from '../ui/ValidationChip';
import { formatNumber } from '../../lib/utils';
import { INVERTER_SIZES_KVA, INVERTER_QUICK_SELECT_MAX } from '../../data/constants';

const QUICK_SIZES = INVERTER_SIZES_KVA.filter(k => k <= INVERTER_QUICK_SELECT_MAX);

export default function InverterSizing({
  project,
  updateField,
  calculations,
  selectedInverter,
  inverters = [],
}) {
  const [showOverride, setShowOverride] = useState(project.isPeakLoadCustom);
  const [customKva, setCustomKva] = useState('');

  const handleOverrideToggle = (val) => {
    setShowOverride(val);
    updateField('isPeakLoadCustom', val);
    if (!val) {
      updateField('peakLoad', calculations.estimatedPeakLoadW);
    }
  };

  const handleSizeSelect = (kva) => {
    updateField('selectedInverterKva', kva);
    setCustomKva('');
  };

  const handleCustomKvaChange = (e) => {
    const val = e.target.value;
    setCustomKva(val);
    const num = Number(val);
    if (num > 0) {
      updateField('selectedInverterKva', num);
    }
  };

  const effectiveKva = project.selectedInverterKva || calculations.recommendedInverterKva;

  const isRecommended = (kva) => kva === calculations.recommendedInverterKva;
  const isSelected = (kva) => effectiveKva === kva;

  const isSizeAdequate = effectiveKva >= calculations.requiredInverterKva;

  const handleClearInverter = () => {
    updateField('selectedInverterId', null);
  };

  return (
    <div id="section-inverter">
      <SectionHeader
        stepNumber="02"
        title="Inverter Sizing"
        subtitle="Size the inverter based on your peak load demand"
      />

      <Card style={{ marginBottom: 'var(--space-4)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 'var(--space-4)', flexWrap: 'wrap', gap: 'var(--space-2)' }}>
          <span style={{
            fontFamily: 'var(--font-body)',
            fontSize: 'var(--text-sm)',
            color: 'var(--color-text-secondary)',
          }}>
            Peak load {project.calcMethod === 'audit' ? '(from appliance audit)' : '(manual entry)'}
          </span>
          {project.calcMethod === 'audit' && (
            <Toggle
              checked={showOverride}
              onChange={handleOverrideToggle}
              label="Manual override"
            />
          )}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: showOverride ? 'repeat(auto-fit, minmax(200px, 1fr))' : '1fr', gap: 'var(--space-4)' }}>
          {showOverride && project.calcMethod === 'audit' && (
            <InputField
              label="Calculated Peak Load"
              type="number"
              value={calculations.estimatedPeakLoadW}
              unit="W"
              readOnly
              disabled
            />
          )}
          <InputField
            label={showOverride ? 'Override Peak Load' : 'Peak Load'}
            type="number"
            value={project.isPeakLoadCustom ? project.peakLoad : (project.peakLoad || calculations.estimatedPeakLoadW)}
            onChange={(e) => updateField('peakLoad', Number(e.target.value))}
            unit="W"
            readOnly={!showOverride && project.calcMethod === 'audit'}
            disabled={!showOverride && project.calcMethod === 'audit'}
            tooltip="Total peak power demand in watts when all loads are running"
          />
        </div>
      </Card>

      <Card style={{ marginBottom: 'var(--space-4)' }}>
        <div style={{ textAlign: 'center', marginBottom: 'var(--space-6)' }}>
          <span style={{
            fontFamily: 'var(--font-body)',
            fontSize: 'var(--text-xs)',
            textTransform: 'uppercase',
            letterSpacing: 'var(--tracking-widest)',
            color: 'var(--color-text-secondary)',
          }}>
            Required Inverter Size (1.25× safety, 0.8 PF)
          </span>
          <div style={{
            fontFamily: 'var(--font-numeric)',
            fontSize: 'var(--text-3xl)',
            fontWeight: 'var(--weight-bold)',
            color: 'var(--color-primary-500)',
            marginTop: 'var(--space-2)',
          }}>
            {formatNumber(calculations.requiredInverterKva, 1)}
            <span style={{
              fontSize: 'var(--text-base)',
              color: 'var(--color-text-muted)',
              marginLeft: 'var(--space-2)',
            }}>
              kVA
            </span>
          </div>
          {calculations.recommendedInverterKva > 0 && (
            <div style={{
              fontSize: 'var(--text-sm)',
              color: 'var(--color-text-secondary)',
              marginTop: 'var(--space-1)',
              fontFamily: 'var(--font-body)',
            }}>
              Auto-estimated: {calculations.recommendedInverterKva} kVA
            </div>
          )}
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(90px, 1fr))',
          gap: 'var(--space-2)',
          marginBottom: 'var(--space-4)',
        }}>
          {QUICK_SIZES.map((kva) => {
            const selected = isSelected(kva);
            const recommended = isRecommended(kva);
            return (
              <div key={kva} style={{ position: 'relative' }}>
                <button
                  onClick={() => handleSizeSelect(kva)}
                  style={{
                    width: '100%',
                    padding: 'var(--space-3) var(--space-2)',
                    borderRadius: 'var(--radius-sm)',
                    border: selected
                      ? '2px solid var(--color-primary-500)'
                      : recommended
                      ? '2px solid var(--color-primary-700)'
                      : '1px solid var(--color-border-default)',
                    background: selected
                      ? 'var(--color-primary-glow)'
                      : 'var(--color-bg-elevated)',
                    color: selected ? 'var(--color-primary-400)' : 'var(--color-text-primary)',
                    fontFamily: 'var(--font-numeric)',
                    fontSize: 'var(--text-base)',
                    fontWeight: selected ? 'var(--weight-bold)' : 'var(--weight-medium)',
                    cursor: 'pointer',
                    transition: 'all var(--duration-normal) var(--ease-default)',
                    textAlign: 'center',
                  }}
                >
                  {kva} kVA
                </button>
                {recommended && (
                  <span style={{
                    position: 'absolute',
                    top: '-8px',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    fontSize: '9px',
                    fontFamily: 'var(--font-body)',
                    fontWeight: 'var(--weight-semibold)',
                    color: 'var(--color-primary-500)',
                    textTransform: 'uppercase',
                    letterSpacing: 'var(--tracking-wide)',
                    whiteSpace: 'nowrap',
                    background: 'var(--color-bg-surface)',
                    padding: '0 4px',
                  }}>
                    Recommended
                  </span>
                )}
              </div>
            );
          })}
        </div>

        <div style={{
          display: 'flex',
          alignItems: 'flex-end',
          gap: 'var(--space-3)',
          padding: 'var(--space-3)',
          background: 'var(--color-bg-elevated)',
          borderRadius: 'var(--radius-sm)',
          marginBottom: 'var(--space-4)',
        }}>
          <InputField
            label="Custom Size (for larger systems)"
            type="number"
            value={customKva || (effectiveKva > INVERTER_QUICK_SELECT_MAX ? effectiveKva : '')}
            onChange={handleCustomKvaChange}
            placeholder="e.g. 15, 20, 25, 30"
            unit="kVA"
            min={0}
            step={0.5}
          />
        </div>

        {effectiveKva > 0 && (
          <div style={{
            padding: 'var(--space-3)',
            background: isSizeAdequate ? 'var(--color-primary-glow)' : 'rgba(239, 68, 68, 0.1)',
            border: `1px solid ${isSizeAdequate ? 'var(--color-primary-500)' : 'var(--color-error)'}`,
            borderRadius: 'var(--radius-sm)',
            textAlign: 'center',
            marginBottom: 'var(--space-2)',
          }}>
            <span style={{
              fontFamily: 'var(--font-numeric)',
              fontSize: 'var(--text-lg)',
              fontWeight: 'var(--weight-bold)',
              color: isSizeAdequate ? 'var(--color-primary-400)' : 'var(--color-error)',
            }}>
              Selected: {effectiveKva} kVA
            </span>
          </div>
        )}

        {!isSizeAdequate && (effectiveKva > 0) && (
          <ValidationChip
            status="error"
            message={`Selected ${effectiveKva} kVA is below the required ${formatNumber(calculations.requiredInverterKva, 1)} kVA`}
            size="md"
          />
        )}
      </Card>

      <Card style={{ marginBottom: 'var(--space-4)' }}>
        <div style={{ marginBottom: 'var(--space-3)' }}>
          <span style={{
            fontFamily: 'var(--font-body)',
            fontSize: 'var(--text-sm)',
            fontWeight: 'var(--weight-semibold)',
            color: 'var(--color-text-primary)',
            display: 'block',
            marginBottom: 'var(--space-2)',
          }}>
            From My Components
            <span style={{ fontWeight: 'var(--weight-normal)', color: 'var(--color-text-muted)', marginLeft: 'var(--space-2)', fontSize: 'var(--text-xs)' }}>(optional)</span>
          </span>
        </div>

        {inverters.length > 0 ? (
          <>
            <SelectField
              label="Select Inverter"
              value={project.selectedInverterId || ''}
              onChange={(e) => {
                const id = e.target.value;
                if (!id) {
                  handleClearInverter();
                  return;
                }
                const inverter = inverters.find(i => i.id === id);
                if (inverter) {
                  updateField('selectedInverterId', inverter.id);
                  updateField('selectedInverterKva', inverter.ratedKva);
                  if (inverter.hasBuiltInMppt) {
                    updateField('hasBuiltInController', true);
                  }
                }
              }}
              placeholder="-- None (manual entry) --"
              options={inverters.map(i => ({ value: i.id, label: `${i.manufacturer} ${i.model} (${i.ratedKva} kVA)` }))}
            />
            {project.selectedInverterId && (
              <button
                onClick={handleClearInverter}
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
            No inverters saved. Add components in Settings → My Components
          </div>
        )}

        {selectedInverter && (
          <div style={{
            marginTop: 'var(--space-4)',
            padding: 'var(--space-4)',
            background: 'var(--color-primary-glow)',
            border: '1px solid var(--color-primary-500)',
            borderRadius: 'var(--radius-sm)',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 'var(--space-3)' }}>
              <div>
                <div style={{
                  fontFamily: 'var(--font-body)',
                  fontSize: 'var(--text-base)',
                  fontWeight: 'var(--weight-semibold)',
                  color: 'var(--color-text-primary)',
                }}>
                  {selectedInverter.manufacturer} {selectedInverter.model}
                </div>
                <div style={{
                  fontFamily: 'var(--font-body)',
                  fontSize: 'var(--text-sm)',
                  color: 'var(--color-text-secondary)',
                  marginTop: '2px',
                }}>
                  {selectedInverter.type} • {selectedInverter.ratedKva} kVA
                </div>
              </div>
              <Check size={20} style={{ color: 'var(--color-primary-500)' }} />
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--space-2)' }}>
              {[
                { label: 'Efficiency', value: `${selectedInverter.efficiency}%` },
                { label: 'Max PV', value: `${selectedInverter.maxPvInputV}V` },
                { label: 'MPPT', value: `${selectedInverter.mpptRangeMin}-${selectedInverter.mpptRangeMax}V` },
                { label: 'Output', value: `${selectedInverter.outputVoltageV}V` },
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
      </Card>
    </div>
  );
}
