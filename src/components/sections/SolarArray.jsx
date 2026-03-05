import { useState, useMemo } from 'react';
import { Sun, ChevronDown, ChevronUp, Minus, Plus, X, MapPin } from 'lucide-react';
import SectionHeader from '../ui/SectionHeader';
import Card from '../ui/Card';
import InputField from '../ui/InputField';
import SelectField from '../ui/SelectField';
import Button from '../ui/Button';
import Toggle from '../ui/Toggle';
import ValidationChip from '../ui/ValidationChip';
import KpiBlock from '../ui/KpiBlock';
import { PSH_OPTIONS, STANDARD_CONTROLLER_SIZES } from '../../data/constants';
import { SOLAR_REGIONS, getAllLocations } from '../../data/solarData';
import { formatNumber } from '../../lib/utils';

export default function SolarArray({
  project,
  calculations,
  selectedPanel,
  selectedInverter,
  validations = [],
  updateField,
  panels = [],
}) {
  const [showStringConfig, setShowStringConfig] = useState(true);
  const [showChargeController, setShowChargeController] = useState(true);
  const [selectedLocation, setSelectedLocation] = useState('');

  const allLocations = useMemo(() => getAllLocations(), []);

  const locationOptions = useMemo(() => {
    const options = [];
    for (const region of SOLAR_REGIONS) {
      for (const city of region.cities) {
        options.push({
          value: city.name,
          label: `${city.name} — ${city.psh}h PSH`,
        });
      }
    }
    return options;
  }, []);

  const handleLocationChange = (e) => {
    const locationName = e.target.value;
    setSelectedLocation(locationName);
    if (!locationName) return;
    const loc = allLocations.find(l => l.value === locationName);
    if (loc) {
      updateField('peakSunHours', loc.psh);
    }
  };

  const hasStringConfig = selectedPanel && selectedInverter;
  const solarValidations = validations.filter(v => v.section === 'solar');

  const handlePanelsPerStringChange = (delta) => {
    const current = project.panelsPerString || calculations.panelsPerStringMin;
    const next = current + delta;
    if (next >= calculations.panelsPerStringMin && next <= calculations.panelsPerStringMax) {
      updateField('panelsPerString', next);
    }
  };

  const currentPanelsPerString = project.panelsPerString || calculations.panelsPerStringMin;

  return (
    <div id="section-solar">
      <SectionHeader stepNumber="04" title="Solar Array" subtitle="Panel sizing, string configuration, and charge controller" />

      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
        <Card>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: 'var(--space-3)',
            marginBottom: 'var(--space-4)',
            padding: 'var(--space-3)',
            background: 'var(--color-bg-elevated)',
            borderRadius: 'var(--radius-sm)',
          }}>
            <MapPin size={18} style={{ color: 'var(--color-primary-500)', flexShrink: 0 }} />
            <div style={{ flex: 1 }}>
              <SelectField
                label="Location (auto-fill PSH)"
                tooltip="Select a city or region to automatically set peak sun hours"
                value={selectedLocation}
                onChange={handleLocationChange}
                placeholder="-- Select location --"
                options={locationOptions}
              />
            </div>
            {selectedLocation && (
              <button
                onClick={() => setSelectedLocation('')}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 'var(--space-1)',
                  padding: 'var(--space-1) var(--space-2)',
                  background: 'none',
                  border: 'none',
                  color: 'var(--color-text-muted)',
                  fontSize: 'var(--text-xs)',
                  cursor: 'pointer',
                  fontFamily: 'var(--font-body)',
                  flexShrink: 0,
                  marginTop: 'var(--space-5)',
                }}
              >
                <X size={12} /> Clear
              </button>
            )}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 'var(--space-4)' }}>
            <SelectField
              label="Peak Sun Hours"
              tooltip="Average daily peak sun hours for your location"
              value={project.peakSunHours}
              onChange={(e) => {
                updateField('peakSunHours', Number(e.target.value));
                setSelectedLocation('');
              }}
              options={PSH_OPTIONS}
            />
            <InputField
              label="System Efficiency"
              tooltip="Overall system efficiency accounting for losses (wiring, temperature, dust)"
              type="number"
              value={project.systemEfficiency}
              onChange={(e) => updateField('systemEfficiency', Number(e.target.value))}
              unit="%"
              min={50}
              max={100}
            />
            <InputField
              label="Panel Wattage"
              tooltip="Rated power of individual solar panel at STC"
              type="number"
              value={selectedPanel ? selectedPanel.pmax : project.panelWattage}
              onChange={(e) => updateField('panelWattage', Number(e.target.value))}
              unit="W"
              readOnly={!!selectedPanel}
              min={0}
            />
          </div>

          <div style={{ marginTop: 'var(--space-4)' }}>
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
            {panels.length > 0 ? (
              <>
                <SelectField
                  label="Select Panel"
                  value={project.selectedPanelId || ''}
                  onChange={(e) => {
                    const id = e.target.value;
                    if (!id) {
                      updateField('selectedPanelId', null);
                      return;
                    }
                    const panel = panels.find(p => p.id === id);
                    if (panel) {
                      updateField('selectedPanelId', panel.id);
                      updateField('panelWattage', panel.pmax);
                    }
                  }}
                  placeholder="-- None (manual entry) --"
                  options={panels.map(p => ({ value: p.id, label: `${p.manufacturer} ${p.model} (${p.pmax}W)` }))}
                />
                {project.selectedPanelId && (
                  <button
                    onClick={() => updateField('selectedPanelId', null)}
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
                No panels saved. Add components in Settings → My Components
              </div>
            )}
          </div>

          {selectedPanel && (
            <Card variant="elevated" style={{ marginTop: 'var(--space-4)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <div style={{ fontSize: 'var(--text-base)', fontWeight: 'var(--weight-semibold)', color: 'var(--color-text-primary)' }}>
                    {selectedPanel.manufacturer} {selectedPanel.model}
                  </div>
                  <div style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-secondary)', marginTop: 'var(--space-1)' }}>
                    {selectedPanel.type} — {selectedPanel.pmax}W
                  </div>
                </div>
                <Sun size={20} style={{ color: 'var(--color-primary-500)' }} />
              </div>
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))',
                gap: 'var(--space-3)',
                marginTop: 'var(--space-3)',
              }}>
                {[
                  { label: 'Voc', value: `${selectedPanel.voc}V` },
                  { label: 'Vmp', value: `${selectedPanel.vmp}V` },
                  { label: 'Isc', value: `${selectedPanel.isc}A` },
                  { label: 'Imp', value: `${selectedPanel.imp}A` },
                  { label: 'TempCoeff Pmax', value: `${selectedPanel.tempCoeffPmax}%/°C` },
                  { label: 'TempCoeff Voc', value: `${selectedPanel.tempCoeffVoc}%/°C` },
                  { label: 'Dimensions', value: `${selectedPanel.lengthMm}×${selectedPanel.widthMm}mm` },
                  { label: 'Weight', value: `${selectedPanel.weightKg}kg` },
                ].map((spec) => (
                  <div key={spec.label}>
                    <div style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: 'var(--tracking-wide)' }}>
                      {spec.label}
                    </div>
                    <div style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-primary)', fontFamily: 'var(--font-numeric)' }}>
                      {spec.value}
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          )}

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
            gap: 'var(--space-4)',
            marginTop: 'var(--space-6)',
            padding: 'var(--space-4)',
            background: 'var(--color-bg-elevated)',
            borderRadius: 'var(--radius-sm)',
          }}>
            <KpiBlock label="Required Array" value={formatNumber(calculations.requiredPanelWattageTotal / 1000, 2)} unit="kW" />
            <KpiBlock label="Calculated Panels" value={calculations.calculatedPanels} unit="panels" />
            <KpiBlock label="Actual Array" value={formatNumber(calculations.actualArrayKw, 2)} unit="kW" />
          </div>

          <div style={{ marginTop: 'var(--space-4)' }}>
            <InputField
              label="Custom Panel Count"
              tooltip="Override the calculated number of panels with your own count. Leave empty to use the calculated value."
              type="number"
              value={project.customPanelCount || ''}
              onChange={(e) => updateField('customPanelCount', e.target.value ? parseInt(e.target.value) : 0)}
              placeholder={`Calculated: ${calculations.calculatedPanels}`}
              min={0}
            />
            {project.customPanelCount > 0 && (
              <div style={{
                fontSize: 'var(--text-xs)',
                color: 'var(--color-primary-500)',
                fontFamily: 'var(--font-body)',
                marginTop: 'var(--space-1)',
              }}>
                Using custom count: {project.customPanelCount} panels (calculated: {calculations.calculatedPanels})
              </div>
            )}
          </div>
        </Card>

        {hasStringConfig && (
          <Card variant="section" active>
            <div
              onClick={() => setShowStringConfig(!showStringConfig)}
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                cursor: 'pointer',
                marginBottom: showStringConfig ? 'var(--space-4)' : 0,
              }}
            >
              <h3 style={{
                fontSize: 'var(--text-md)',
                fontWeight: 'var(--weight-semibold)',
                color: 'var(--color-text-primary)',
                margin: 0,
              }}>
                String Configuration
              </h3>
              {showStringConfig ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
            </div>

            {showStringConfig && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
                  gap: 'var(--space-4)',
                  padding: 'var(--space-3)',
                  background: 'var(--color-bg-elevated)',
                  borderRadius: 'var(--radius-sm)',
                }}>
                  <div>
                    <div style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: 'var(--tracking-wide)' }}>
                      MPPT Input Range
                    </div>
                    <div style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-primary)', fontFamily: 'var(--font-numeric)', marginTop: 'var(--space-1)' }}>
                      {selectedInverter.mpptRangeMin}V – {selectedInverter.mpptRangeMax}V
                    </div>
                  </div>
                  <div>
                    <div style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: 'var(--tracking-wide)' }}>
                      Max Inverter VOC
                    </div>
                    <div style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-primary)', fontFamily: 'var(--font-numeric)', marginTop: 'var(--space-1)' }}>
                      {selectedInverter.maxPvInputV}V
                    </div>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 'var(--space-4)' }}>
                  <div>
                    <div style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-secondary)', marginBottom: 'var(--space-1)' }}>
                      Min Panels per String
                    </div>
                    <div style={{ fontSize: 'var(--text-base)', fontFamily: 'var(--font-numeric)', color: 'var(--color-text-primary)' }}>
                      {calculations.panelsPerStringMin}
                    </div>
                    <div style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)' }}>
                      ⌈MPPT min / Vmp at {70}°C⌉
                    </div>
                  </div>
                  <div>
                    <div style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-secondary)', marginBottom: 'var(--space-1)' }}>
                      Max Panels per String
                    </div>
                    <div style={{ fontSize: 'var(--text-base)', fontFamily: 'var(--font-numeric)', color: 'var(--color-text-primary)' }}>
                      {calculations.panelsPerStringMax}
                    </div>
                    <div style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)' }}>
                      ⌊Max VOC / Voc at {-10}°C⌋
                    </div>
                  </div>
                </div>

                <div>
                  <div style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-secondary)', marginBottom: 'var(--space-2)' }}>
                    Selected Panels per String
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => handlePanelsPerStringChange(-1)}
                      disabled={currentPanelsPerString <= calculations.panelsPerStringMin}
                    >
                      <Minus size={16} />
                    </Button>
                    <span style={{
                      fontSize: 'var(--text-lg)',
                      fontFamily: 'var(--font-numeric)',
                      fontWeight: 'var(--weight-bold)',
                      color: 'var(--color-primary-500)',
                      minWidth: '40px',
                      textAlign: 'center',
                    }}>
                      {currentPanelsPerString}
                    </span>
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => handlePanelsPerStringChange(1)}
                      disabled={currentPanelsPerString >= calculations.panelsPerStringMax}
                    >
                      <Plus size={16} />
                    </Button>
                  </div>
                </div>

                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
                  gap: 'var(--space-4)',
                  padding: 'var(--space-3)',
                  background: 'var(--color-bg-elevated)',
                  borderRadius: 'var(--radius-sm)',
                }}>
                  <div>
                    <div style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: 'var(--tracking-wide)' }}>
                      Strings (Parallel)
                    </div>
                    <div style={{ fontSize: 'var(--text-base)', fontFamily: 'var(--font-numeric)', color: 'var(--color-text-primary)', marginTop: 'var(--space-1)' }}>
                      {calculations.numberOfStrings}
                    </div>
                  </div>
                  <div>
                    <div style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: 'var(--tracking-wide)' }}>
                      Total Panels
                    </div>
                    <div style={{ fontSize: 'var(--text-base)', fontFamily: 'var(--font-numeric)', color: 'var(--color-text-primary)', marginTop: 'var(--space-1)' }}>
                      {currentPanelsPerString > 0 ? calculations.numberOfStrings * currentPanelsPerString : calculations.numberOfPanels}
                    </div>
                  </div>
                  <div>
                    <div style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: 'var(--tracking-wide)' }}>
                      Actual Array
                    </div>
                    <div style={{ fontSize: 'var(--text-base)', fontFamily: 'var(--font-numeric)', color: 'var(--color-text-primary)', marginTop: 'var(--space-1)' }}>
                      {formatNumber(calculations.actualArrayKw, 2)} kW
                    </div>
                  </div>
                </div>

                {solarValidations.length > 0 && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
                    {solarValidations.map((v) => (
                      <ValidationChip
                        key={v.id}
                        status={v.status === 'pass' ? 'success' : v.status}
                        message={v.message}
                        size="md"
                      />
                    ))}
                  </div>
                )}

                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
                  gap: 'var(--space-3)',
                  padding: 'var(--space-3)',
                  background: 'var(--color-bg-base)',
                  borderRadius: 'var(--radius-sm)',
                  border: '1px solid var(--color-border-subtle)',
                }}>
                  <div>
                    <div style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)', textTransform: 'uppercase' }}>
                      VOC at -10°C
                    </div>
                    <div style={{ fontSize: 'var(--text-sm)', fontFamily: 'var(--font-numeric)', color: 'var(--color-text-primary)' }}>
                      {formatNumber(calculations.vocAtMinTemp, 1)}V
                    </div>
                  </div>
                  <div>
                    <div style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)', textTransform: 'uppercase' }}>
                      VMP at +70°C
                    </div>
                    <div style={{ fontSize: 'var(--text-sm)', fontFamily: 'var(--font-numeric)', color: 'var(--color-text-primary)' }}>
                      {formatNumber(calculations.vmpAtMaxTemp, 1)}V
                    </div>
                  </div>
                </div>
              </div>
            )}
          </Card>
        )}

        <Card variant="section">
          <div
            onClick={() => setShowChargeController(!showChargeController)}
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              cursor: 'pointer',
              marginBottom: showChargeController ? 'var(--space-4)' : 0,
            }}
          >
            <h3 style={{
              fontSize: 'var(--text-md)',
              fontWeight: 'var(--weight-semibold)',
              color: 'var(--color-text-primary)',
              margin: 0,
            }}>
              Charge Controller
            </h3>
            {showChargeController ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
          </div>

          {showChargeController && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
              <Toggle
                label="Hybrid inverter with built-in MPPT"
                checked={project.hasBuiltInController}
                onChange={(val) => updateField('hasBuiltInController', val)}
              />

              {!project.hasBuiltInController && (
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
                  gap: 'var(--space-4)',
                  padding: 'var(--space-4)',
                  background: 'var(--color-bg-elevated)',
                  borderRadius: 'var(--radius-sm)',
                }}>
                  <KpiBlock label="Required Size" value={calculations.chargeControllerAmps} unit="A" />
                  <div>
                    <div style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: 'var(--tracking-wide)' }}>
                      Standard Sizes
                    </div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--space-2)', marginTop: 'var(--space-2)' }}>
                      {STANDARD_CONTROLLER_SIZES.filter(s => s >= calculations.chargeControllerAmps * 0.5).slice(0, 5).map((size) => (
                        <span key={size} style={{
                          padding: 'var(--space-1) var(--space-2)',
                          borderRadius: 'var(--radius-sm)',
                          fontSize: 'var(--text-xs)',
                          fontFamily: 'var(--font-numeric)',
                          background: size === calculations.chargeControllerAmps ? 'var(--color-primary-500)' : 'var(--color-bg-overlay)',
                          color: size === calculations.chargeControllerAmps ? 'var(--color-text-inverse)' : 'var(--color-text-secondary)',
                          border: `1px solid ${size === calculations.chargeControllerAmps ? 'var(--color-primary-500)' : 'var(--color-border-default)'}`,
                        }}>
                          {size}A
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {project.hasBuiltInController && (
                <div style={{
                  padding: 'var(--space-3)',
                  background: 'var(--color-bg-elevated)',
                  borderRadius: 'var(--radius-sm)',
                  fontSize: 'var(--text-sm)',
                  color: 'var(--color-text-secondary)',
                }}>
                  Charge controller is integrated into the hybrid inverter. No external controller needed.
                </div>
              )}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
