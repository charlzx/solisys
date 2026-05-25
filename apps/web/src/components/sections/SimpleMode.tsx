import { useState, useMemo } from 'react';
import { CaretLeft, CaretRight, Sun, Lightning as Zap, House, Check, Download, ArrowRight, ArrowSquareOut as Share, Plus, Minus, Trash, Sliders } from '@phosphor-icons/react';
import Card from '../ui/Card';
import InputField from '../ui/InputField';
import SelectField from '../ui/SelectField';
import Button from '../ui/Button';
import KpiBlock from '../ui/KpiBlock';
import { SOLAR_REGIONS } from '../../data/solarData';
import { useBreakpoint } from '../../hooks/useBreakpoint';
import { formatNumber, formatCurrency, getCurrencySymbol } from '../../lib/utils';
import { downloadPDF } from '../../lib/export/generatePDF';

// Standard plain-language appliance options for easy preset addition
const SIMPLE_APPLIANCES = [
  { name: 'LED Lights', wattage: 10, hours: 6, icon: '💡' },
  { name: 'Ceiling Fans', wattage: 75, hours: 8, icon: '🌀' },
  { name: 'Refrigerator', wattage: 150, hours: 24, icon: '❄️' },
  { name: 'TV (LED 40")', wattage: 80, hours: 5, icon: '📺' },
  { name: 'Laptop / Charger', wattage: 65, hours: 4, icon: '💻' },
  { name: 'Air Conditioner', wattage: 1200, hours: 6, icon: '🍃' },
  { name: 'Washing Machine', wattage: 500, hours: 1, icon: '🧺' },
];

const PRESET_PACKAGES = {
  studio: {
    label: 'Studio Apartment',
    desc: 'Lights, router, phones, fan, small fridge',
    items: [
      { name: 'LED Lights', quantity: 4, wattage: 10, unit: 'W', hours: 6 },
      { name: 'Ceiling Fans', quantity: 1, wattage: 75, unit: 'W', hours: 8 },
      { name: 'Refrigerator', quantity: 1, wattage: 100, unit: 'W', hours: 24 },
      { name: 'TV (LED 40")', quantity: 1, wattage: 80, unit: 'W', hours: 4 },
      { name: 'Laptop / Charger', quantity: 2, wattage: 65, unit: 'W', hours: 3 },
    ]
  },
  home: {
    label: 'Standard Home (2-3 Bed)',
    desc: 'Lights, multiple fans, TV, fridge, microwave, washing machine',
    items: [
      { name: 'LED Lights', quantity: 8, wattage: 10, unit: 'W', hours: 6 },
      { name: 'Ceiling Fans', quantity: 4, wattage: 75, unit: 'W', hours: 8 },
      { name: 'Refrigerator', quantity: 1, wattage: 150, unit: 'W', hours: 24 },
      { name: 'TV (LED 40")', quantity: 2, wattage: 80, unit: 'W', hours: 6 },
      { name: 'Laptop / Charger', quantity: 3, wattage: 65, unit: 'W', hours: 4 },
      { name: 'Washing Machine', quantity: 1, wattage: 500, unit: 'W', hours: 1 },
    ]
  },
  mansion: {
    label: 'Large Residence (4+ Bed)',
    desc: 'Lights, fans, multiple TVs/fridges, A/C unit',
    items: [
      { name: 'LED Lights', quantity: 16, wattage: 10, unit: 'W', hours: 6 },
      { name: 'Ceiling Fans', quantity: 6, wattage: 75, unit: 'W', hours: 8 },
      { name: 'Refrigerator', quantity: 2, wattage: 150, unit: 'W', hours: 24 },
      { name: 'TV (LED 40")', quantity: 3, wattage: 80, unit: 'W', hours: 6 },
      { name: 'Laptop / Charger', quantity: 4, wattage: 65, unit: 'W', hours: 5 },
      { name: 'Air Conditioner', quantity: 1, wattage: 1200, unit: 'W', hours: 6 },
      { name: 'Washing Machine', quantity: 1, wattage: 500, unit: 'W', hours: 2 },
    ]
  }
};

export default function SimpleMode({
  project,
  updateField,
  setProject,
  calculations,
  panels = [],
  batteries = [],
  inverters = [],
  onSwitchToPro,
}) {
  const { isMobile } = useBreakpoint();
  const [step, setStep] = useState(1);
  const [selectedPreset, setSelectedPreset] = useState('');
  const [selectedCity, setSelectedCity] = useState('');

  // 1. PSH Cities Options
  const locationOptions = useMemo(() => {
    const options = [];
    for (const region of SOLAR_REGIONS) {
      for (const city of region.cities) {
        options.push({
          value: city.name,
          label: `${city.name} — ${city.psh}h daily sun`,
          psh: city.psh,
        });
      }
    }
    return options;
  }, []);

  const handleCitySelect = (e) => {
    const name = e.target.value;
    setSelectedCity(name);
    const opt = locationOptions.find(o => o.value === name);
    if (opt) {
      updateField('peakSunHours', opt.psh);
    }
  };

  // 2. Preset package applying
  const handleApplyPreset = (key) => {
    setSelectedPreset(key);
    const pkg = PRESET_PACKAGES[key];
    if (pkg) {
      setProject(prev => ({
        ...prev,
        calcMethod: 'audit',
        appliances: pkg.items.map((item, idx) => ({ ...item, id: Date.now() + idx }))
      }));
    }
  };

  // 3. Appliance adjustments
  const handleQtyChange = (applianceName, delta) => {
    const existing = project.appliances || [];
    const item = existing.find(a => a.name === applianceName);
    
    if (item) {
      const newQty = Math.max(0, item.quantity + delta);
      if (newQty === 0) {
        setProject(prev => ({
          ...prev,
          appliances: prev.appliances.filter(a => a.name !== applianceName)
        }));
      } else {
        setProject(prev => ({
          ...prev,
          appliances: prev.appliances.map(a => a.name === applianceName ? { ...a, quantity: newQty } : a)
        }));
      }
    } else {
      const template = SIMPLE_APPLIANCES.find(a => a.name === applianceName);
      if (template && delta > 0) {
        setProject(prev => ({
          ...prev,
          appliances: [...(prev.appliances || []), {
            id: Date.now(),
            name: template.name,
            quantity: delta,
            wattage: template.wattage,
            unit: 'W',
            hours: template.hours
          }]
        }));
      }
    }
  };

  // Helper to read quantity safely
  const getApplianceQty = (name) => {
    return project.appliances?.find(a => a.name === name)?.quantity || 0;
  };

  // 4. Custom Backup Hours Mapping
  const handleBackupPreset = (hours) => {
    updateField('daysOfAutonomy', hours / 24);
  };

  const activeBackupHours = Math.round((project.daysOfAutonomy || 1) * 24);

  // 5. Battery type auto-configuration
  const handleBatteryTypeSelect = (type) => {
    if (type === 'lithium') {
      updateField('batteryDoD', 0.8);
      // Auto-set modern system voltage based on load to keep user safe
      const totalWh = calculations.totalDailyWh || 0;
      if (totalWh > 3000) {
        updateField('batteryVoltage', 48);
      } else if (totalWh > 1500) {
        updateField('batteryVoltage', 24);
      } else {
        updateField('batteryVoltage', 12);
      }
    } else {
      updateField('batteryDoD', 0.5);
      updateField('batteryVoltage', 12); // standard low volt lead-acid
    }
  };

  const isLithiumSelected = project.batteryDoD >= 0.7;

  // 6. PDF and WhatsApp Actions
  const handlePDFDownload = () => {
    // Select standard components if not manually chosen for report completeness
    const selectedPanel = project.selectedPanelId ? panels.find(p => p.id === project.selectedPanelId) : panels[0] || null;
    const selectedInverter = project.selectedInverterId ? inverters.find(i => i.id === project.selectedInverterId) : inverters[0] || null;
    const selectedBattery = project.selectedBatteryId ? batteries.find(b => b.id === project.selectedBatteryId) : batteries[0] || null;

    downloadPDF(project, calculations, selectedPanel, selectedInverter, selectedBattery);
  };

  const handleWhatsAppShare = () => {
    const text = `☀️ *Solisys Solar Sizing Summary* ☀️\n\nI just designed my solar system on Solisys! Here are my recommended details:\n- *Solar Array Size*: ${formatNumber(calculations.actualArrayKw, 2)} kW\n- *Panel Count*: ${calculations.numberOfPanels} panels (${project.panelWattage}W each)\n- *Battery Capacity*: ${formatNumber(calculations.requiredBankCapacityWh / 1000, 1)} kWh (${calculations.totalNumberOfBatteries} batteries)\n- *Inverter Sizing*: ${calculations.recommendedInverterKva} kVA\n\nBuild yours at Solisys.dev!`;
    const url = `https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
  };

  // System Voltage dynamic styling badge
  const autoVoltageLabel = `${project.batteryVoltage}V DC (Auto-configured)`;

  return (
    <div style={{ padding: 'var(--space-6) 0' }}>
      {/* Top Banner and Navigation */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 'var(--space-8)',
        flexWrap: 'wrap',
        gap: 'var(--space-4)',
      }}>
        <div>
          <h2 style={{
            fontSize: 'var(--text-2xl)',
            fontWeight: 'var(--weight-bold)',
            color: 'var(--color-text-primary)',
            fontFamily: 'var(--font-display)',
            margin: 0,
          }}>
            Simple Sizing Wizard
          </h2>
          <p style={{
            fontSize: 'var(--text-sm)',
            color: 'var(--color-text-secondary)',
            fontFamily: 'var(--font-body)',
            marginTop: '2px',
            margin: 0,
          }}>
            Answer 5 simple questions to size your solar and battery bank instantly.
          </p>
        </div>
        <Button variant="secondary" size="sm" onClick={onSwitchToPro} style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
          <Sliders size={16} />
          Switch to Pro Mode
        </Button>
      </div>

      {/* Main flow wrapper */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr',
        gap: 'var(--space-6)',
      }}>
        {/* Step indicator bar */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          background: 'var(--color-bg-deep)',
          borderRadius: 'var(--radius-lg)',
          padding: 'var(--space-3) var(--space-4)',
          border: '1px solid var(--color-border-subtle)',
          alignItems: 'center',
        }}>
          {[1, 2, 3, 4, 5].map((s) => (
            <div key={s} style={{
              display: 'flex',
              alignItems: 'center',
              gap: 'var(--space-2)',
            }}>
              <div style={{
                width: '28px',
                height: '28px',
                borderRadius: '50%',
                background: step === s ? 'var(--color-primary-500)' : step > s ? 'var(--color-success-surface)' : 'var(--color-surface)',
                color: step === s ? 'var(--color-text-inverse)' : step > s ? 'var(--color-success)' : 'var(--color-text-muted)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontFamily: 'var(--font-numeric)',
                fontSize: 'var(--text-xs)',
                fontWeight: 'var(--weight-bold)',
                border: step === s ? '2px solid var(--color-primary-500)' : step > s ? '2px solid var(--color-success)' : '1px solid var(--color-border)',
                transition: 'all var(--duration-normal) var(--ease-default)',
              }}>
                {step > s ? '✓' : s}
              </div>
              {!isMobile && (
                <span style={{
                  fontSize: 'var(--text-xs)',
                  fontWeight: step === s ? 'var(--weight-semibold)' : 'var(--weight-normal)',
                  color: step === s ? 'var(--color-text-primary)' : 'var(--color-text-muted)',
                  fontFamily: 'var(--font-body)',
                }}>
                  {s === 1 ? 'Appliances' : s === 2 ? 'Location' : s === 3 ? 'Backup' : s === 4 ? 'Battery' : 'Power Context'}
                </span>
              )}
            </div>
          ))}
        </div>

        {/* Step Content Card */}
        <Card style={{ minHeight: '340px', display: 'flex', flexDirection: 'column' }}>
          
          {/* STEP 1: APPLIANCES */}
          {step === 1 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)', flex: 1 }}>
              <div>
                <h3 style={{ margin: '0 0 var(--space-1) 0', fontSize: 'var(--text-lg)', color: 'var(--color-text-primary)' }}>1. What appliances will you power?</h3>
                <p style={{ margin: 0, fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)' }}>Choose a quick starting template or customize your appliance counts below.</p>
              </div>

              {/* Presets */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 'var(--space-3)' }}>
                {Object.keys(PRESET_PACKAGES).map((key) => (
                  <button
                    key={key}
                    onClick={() => handleApplyPreset(key)}
                    style={{
                      background: selectedPreset === key ? 'color-mix(in srgb, var(--color-primary-500) 10%, transparent)' : 'var(--color-bg-deep)',
                      border: selectedPreset === key ? '2px solid var(--color-primary-500)' : '1px solid var(--color-border)',
                      borderRadius: 'var(--radius-md)',
                      padding: 'var(--space-4)',
                      textAlign: 'left',
                      cursor: 'pointer',
                      transition: 'all var(--duration-normal) var(--ease-default)',
                    }}
                  >
                    <div style={{ fontWeight: 'var(--weight-semibold)', color: 'var(--color-text-primary)', fontSize: 'var(--text-sm)' }}>
                      {PRESET_PACKAGES[key].label}
                    </div>
                    <div style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)', marginTop: '4px', lineHeight: 'var(--leading-snug)' }}>
                      {PRESET_PACKAGES[key].desc}
                    </div>
                  </button>
                ))}
              </div>

              {/* Adjustments */}
              <div style={{
                background: 'var(--color-bg-deep)',
                borderRadius: 'var(--radius-md)',
                padding: 'var(--space-4)',
                border: '1px solid var(--color-border-subtle)',
              }}>
                <span style={{ fontSize: 'var(--text-xs)', textTransform: 'uppercase', color: 'var(--color-text-muted)', display: 'block', marginBottom: 'var(--space-4)', fontWeight: 'var(--weight-bold)' }}>
                  Appliance Quantities
                </span>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
                  {SIMPLE_APPLIANCES.map((app) => {
                    const qty = getApplianceQty(app.name);
                    return (
                      <div key={app.name} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                          <span style={{ fontSize: '18px' }}>{app.icon}</span>
                          <div>
                            <span style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-primary)', fontWeight: 'var(--weight-medium)' }}>{app.name}</span>
                            <span style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)', marginLeft: 'var(--space-2)' }}>({app.wattage}W)</span>
                          </div>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
                          <Button variant="secondary" size="sm" onClick={() => handleQtyChange(app.name, -1)} style={{ padding: 'var(--space-1)', minWidth: '32px', height: '32px' }}>
                            <Minus size={12} />
                          </Button>
                          <span style={{ fontFamily: 'var(--font-numeric)', fontSize: 'var(--text-base)', color: 'var(--color-text-primary)', minWidth: '24px', textAlign: 'center', fontWeight: 'var(--weight-bold)' }}>
                            {qty}
                          </span>
                          <Button variant="secondary" size="sm" onClick={() => handleQtyChange(app.name, 1)} style={{ padding: 'var(--space-1)', minWidth: '32px', height: '32px' }}>
                            <Plus size={12} />
                          </Button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Dynamic load readout */}
              {calculations.totalDailyKwh > 0 && (
                <div style={{
                  padding: 'var(--space-3) var(--space-4)',
                  background: 'var(--color-success-surface)',
                  color: 'var(--color-success)',
                  borderRadius: 'var(--radius-sm)',
                  fontSize: 'var(--text-sm)',
                  fontWeight: 'var(--weight-medium)',
                  fontFamily: 'var(--font-body)',
                }}>
                  📈 Estimated Energy Usage: **{formatNumber(calculations.totalDailyKwh, 2)} kWh / day** (Peak demand: **{formatNumber(calculations.estimatedPeakLoadW || 0, 0)} W**)
                </div>
              )}
            </div>
          )}

          {/* STEP 2: LOCATION */}
          {step === 2 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)', flex: 1 }}>
              <div>
                <h3 style={{ margin: '0 0 var(--space-1) 0', fontSize: 'var(--text-lg)', color: 'var(--color-text-primary)' }}>2. Where is the system installed?</h3>
                <p style={{ margin: 0, fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)' }}>Location tells us how much sunlight your solar panels will receive daily.</p>
              </div>

              <div style={{ maxWidth: '400px' }}>
                <SelectField
                  label="Select City"
                  value={selectedCity}
                  onChange={handleCitySelect}
                  options={locationOptions}
                  placeholder="-- Search or select city --"
                />
              </div>

              {project.peakSunHours > 0 && (
                <div style={{
                  background: 'var(--color-bg-deep)',
                  border: '1px solid var(--color-border)',
                  padding: 'var(--space-4)',
                  borderRadius: 'var(--radius-md)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 'var(--space-4)',
                }}>
                  <Sun size={28} style={{ color: 'var(--color-warning)', flexShrink: 0 }} />
                  <div>
                    <span style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-primary)', display: 'block', fontWeight: 'var(--weight-semibold)' }}>
                      Sunlight hours calculated!
                    </span>
                    <span style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-secondary)', marginTop: '2px', display: 'block' }}>
                      This location receives an average of **{project.peakSunHours} hours** of full peak sunlight daily.
                    </span>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* STEP 3: BACKUP NEEDS */}
          {step === 3 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)', flex: 1 }}>
              <div>
                <h3 style={{ margin: '0 0 var(--space-1) 0', fontSize: 'var(--text-lg)', color: 'var(--color-text-primary)' }}>3. How many hours of battery backup?</h3>
                <p style={{ margin: 0, fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)' }}>Choose how long your battery bank should support your home when the sun is down.</p>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 'var(--space-3)' }}>
                {[
                  { hours: 8, label: 'Night Backup Only', desc: 'Provides about 8 hours of power for fans and lights' },
                  { hours: 24, label: 'Full Day Backup', desc: 'Provides 24 hours of total autonomous power' },
                  { hours: 48, label: '2 Days Autonomy', desc: 'Secure backup through rain and cloud coverage' }
                ].map((opt) => (
                  <button
                    key={opt.hours}
                    onClick={() => handleBackupPreset(opt.hours)}
                    style={{
                      background: activeBackupHours === opt.hours ? 'color-mix(in srgb, var(--color-primary-500) 10%, transparent)' : 'var(--color-bg-deep)',
                      border: activeBackupHours === opt.hours ? '2px solid var(--color-primary-500)' : '1px solid var(--color-border)',
                      borderRadius: 'var(--radius-md)',
                      padding: 'var(--space-4)',
                      textAlign: 'left',
                      cursor: 'pointer',
                      transition: 'all var(--duration-normal) var(--ease-default)',
                    }}
                  >
                    <div style={{ fontWeight: 'var(--weight-semibold)', color: 'var(--color-text-primary)', fontSize: 'var(--text-sm)' }}>
                      {opt.label} ({opt.hours} hrs)
                    </div>
                    <div style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)', marginTop: '4px', lineHeight: 'var(--leading-snug)' }}>
                      {opt.desc}
                    </div>
                  </button>
                ))}
              </div>

              <div style={{ maxWidth: '300px' }}>
                <InputField
                  label="Or enter custom backup hours:"
                  type="number"
                  value={activeBackupHours}
                  onChange={(e) => updateField('daysOfAutonomy', Number(e.target.value) / 24)}
                  unit="hours"
                  min={1}
                  max={120}
                />
              </div>
            </div>
          )}

          {/* STEP 4: BATTERY TYPE */}
          {step === 4 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)', flex: 1 }}>
              <div>
                <h3 style={{ margin: '0 0 var(--space-1) 0', fontSize: 'var(--text-lg)', color: 'var(--color-text-primary)' }}>4. Select your battery technology</h3>
                <p style={{ margin: 0, fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)' }}>We auto-configure the electrical parameters, safe voltage systems, and efficiency based on your choice.</p>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 'var(--space-4)' }}>
                <button
                  onClick={() => handleBatteryTypeSelect('lithium')}
                  style={{
                    background: isLithiumSelected ? 'color-mix(in srgb, var(--color-primary-500) 10%, transparent)' : 'var(--color-bg-deep)',
                    border: isLithiumSelected ? '2px solid var(--color-primary-500)' : '1px solid var(--color-border)',
                    borderRadius: 'var(--radius-md)',
                    padding: 'var(--space-5)',
                    textAlign: 'left',
                    cursor: 'pointer',
                    transition: 'all var(--duration-normal) var(--ease-default)',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontWeight: 'var(--weight-bold)', color: 'var(--color-text-primary)', fontSize: 'var(--text-base)' }}>
                      Lithium LFP
                    </span>
                    <span style={{ background: 'var(--color-primary-500)', color: 'var(--color-text-inverse)', padding: '2px 8px', borderRadius: 'var(--radius-full)', fontSize: 'var(--text-xs)' }}>
                      Highly Recommended
                    </span>
                  </div>
                  <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-secondary)', marginTop: 'var(--space-3)', lineHeight: 'var(--leading-relaxed)' }}>
                    Extremely efficient, safe, compact, and lasts up to 10 years (3,000+ charging cycles). Can discharge deeply (80%) without damage.
                  </p>
                </button>

                <button
                  onClick={() => handleBatteryTypeSelect('lead')}
                  style={{
                    background: !isLithiumSelected ? 'color-mix(in srgb, var(--color-primary-500) 10%, transparent)' : 'var(--color-bg-deep)',
                    border: !isLithiumSelected ? '2px solid var(--color-primary-500)' : '1px solid var(--color-border)',
                    borderRadius: 'var(--radius-md)',
                    padding: 'var(--space-5)',
                    textAlign: 'left',
                    cursor: 'pointer',
                    transition: 'all var(--duration-normal) var(--ease-default)',
                  }}
                >
                  <span style={{ fontWeight: 'var(--weight-bold)', color: 'var(--color-text-primary)', fontSize: 'var(--text-base)', display: 'block' }}>
                    Lead-Acid / Gel
                  </span>
                  <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-secondary)', marginTop: 'var(--space-3)', lineHeight: 'var(--leading-relaxed)' }}>
                    Lower upfront purchase cost but heavier, takes more space, and must be replaced every 2-3 years. Only safe to discharge up to 50% capacity.
                  </p>
                </button>
              </div>

              {/* Dynamic Auto-voltage Notification */}
              <div style={{
                fontSize: 'var(--text-xs)',
                color: 'var(--color-text-muted)',
                fontFamily: 'var(--font-body)',
                marginTop: 'var(--space-2)',
              }}>
                ⚡️ System Sizing Safety: **{autoVoltageLabel}** auto-selected for optimal currents and breaker protection.
              </div>
            </div>
          )}

          {/* STEP 5: POWER SITUATION (SYSTEM TYPE) */}
          {step === 5 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)', flex: 1 }}>
              <div>
                <h3 style={{ margin: '0 0 var(--space-1) 0', fontSize: 'var(--text-lg)', color: 'var(--color-text-primary)' }}>5. Choose your grid power context</h3>
                <p style={{ margin: 0, fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)' }}>Choose how your home interacts with your local utility company grid.</p>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 'var(--space-4)' }}>
                {[
                  { value: 'off-grid', label: 'No Grid Connection', desc: 'Completely remote or disconnected. Solar & batteries power everything sole-source.' },
                  { value: 'hybrid', label: 'Frequent Outages', desc: 'Connected to the utility grid, but need seamless battery backup during blackouts.' },
                  { value: 'grid-tied', label: 'Lower My Electric Bills', desc: 'Reliable utility grid exists. Sells or supplements power directly to reduce monthly costs.' }
                ].map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => updateField('systemType', opt.value)}
                    style={{
                      background: project.systemType === opt.value ? 'color-mix(in srgb, var(--color-primary-500) 10%, transparent)' : 'var(--color-bg-deep)',
                      border: project.systemType === opt.value ? '2px solid var(--color-primary-500)' : '1px solid var(--color-border)',
                      borderRadius: 'var(--radius-md)',
                      padding: 'var(--space-4)',
                      textAlign: 'left',
                      cursor: 'pointer',
                      transition: 'all var(--duration-normal) var(--ease-default)',
                    }}
                  >
                    <div style={{ fontWeight: 'var(--weight-semibold)', color: 'var(--color-text-primary)', fontSize: 'var(--text-sm)' }}>
                      {opt.label}
                    </div>
                    <div style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-secondary)', marginTop: '8px', lineHeight: 'var(--leading-relaxed)' }}>
                      {opt.desc}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Spacer */}
          <div style={{ flex: 1 }} />

          {/* Wizard Actions Bar */}
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            borderTop: '1px solid var(--color-border-subtle)',
            paddingTop: 'var(--space-4)',
            marginTop: 'var(--space-6)',
          }}>
            <Button
              variant="secondary"
              disabled={step === 1}
              onClick={() => setStep(prev => Math.max(1, prev - 1))}
              style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}
            >
              <CaretLeft size={16} />
              Back
            </Button>

            {step < 5 ? (
              <Button
                variant="primary"
                onClick={() => setStep(prev => Math.min(5, prev + 1))}
                style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}
              >
                Next
                <CaretRight size={16} />
              </Button>
            ) : (
              <Button
                variant="primary"
                onClick={() => setStep(6)}
                style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}
              >
                Calculate Results
                <ArrowRight size={16} />
              </Button>
            )}
          </div>
        </Card>
      </div>

      {/* STEP 6: SIMPLE RESULTS SECTION */}
      {step === 6 && (
        <div style={{ marginTop: 'var(--space-6)', display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
          {/* Results Summary Box */}
          <div style={{
            background: 'var(--color-success-surface)',
            border: '1px solid var(--color-success)',
            borderRadius: 'var(--radius-lg)',
            padding: 'var(--space-6)',
            color: 'var(--color-success)',
          }}>
            <h3 style={{ margin: '0 0 var(--space-2) 0', fontSize: 'var(--text-lg)', fontWeight: 'var(--weight-bold)', color: 'var(--color-text-primary)' }}>
              🎉 Your Recommended Solar Setup
            </h3>
            <p style={{
              margin: 0,
              fontSize: 'var(--text-sm)',
              color: 'var(--color-text-primary)',
              lineHeight: 'var(--leading-relaxed)',
            }}>
              Based on your custom daily usage of **{formatNumber(calculations.totalDailyKwh, 2)} kWh**, 
              we recommend an actual solar array of **{formatNumber(calculations.actualArrayKw, 2)} kW** paired with 
              **{formatNumber(calculations.requiredBankCapacityWh / 1000, 1)} kWh** of {isLithiumSelected ? 'Lithium LFP' : 'Lead-Acid'} storage.
              This keeps your home safe and fully powered for up to **{activeBackupHours} backup hours** during outages.
            </p>
          </div>

          {/* Recommended KPI Cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 'var(--space-4)' }}>
            <Card style={{ padding: 'var(--space-4)' }}>
              <KpiBlock
                label="Solar Array Size"
                value={formatNumber(calculations.actualArrayKw, 2)}
                unit="kW Array"
              />
              <span style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)', display: 'block', marginTop: 'var(--space-2)' }}>
                = {calculations.numberOfPanels} panels ({project.panelWattage}W each)
              </span>
            </Card>

            <Card style={{ padding: 'var(--space-4)' }}>
              <KpiBlock
                label="Battery Storage Capacity"
                value={formatNumber(calculations.requiredBankCapacityWh / 1000, 1)}
                unit="kWh Backup"
              />
              <span style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)', display: 'block', marginTop: 'var(--space-2)' }}>
                = {calculations.totalNumberOfBatteries} battery units in series/parallel
              </span>
            </Card>

            <Card style={{ padding: 'var(--space-4)' }}>
              <KpiBlock
                label="Recommended Inverter"
                value={calculations.recommendedInverterKva}
                unit="kVA size"
              />
              <span style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)', display: 'block', marginTop: 'var(--space-2)' }}>
                Supports up to {formatNumber(calculations.estimatedPeakLoadW, 0)}W peak load
              </span>
            </Card>
          </div>

          {/* Simple Actions Panel */}
          <Card>
            <h4 style={{ margin: '0 0 var(--space-4) 0', color: 'var(--color-text-primary)', fontSize: 'var(--text-md)' }}>Next Steps</h4>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 'var(--space-3)' }}>
              <Button variant="primary" onClick={handlePDFDownload} style={{ justifyContent: 'center', gap: 'var(--space-2)' }}>
                <Download size={16} />
                Download PDF
              </Button>
              <Button variant="secondary" onClick={handleWhatsAppShare} style={{ justifyContent: 'center', gap: 'var(--space-2)' }}>
                <Share size={16} />
                Share WhatsApp
              </Button>
              <Button variant="secondary" onClick={onSwitchToPro} style={{ justifyContent: 'center', gap: 'var(--space-2)' }}>
                <Sliders size={16} />
                View Pro Schematics
              </Button>
            </div>
          </Card>
          
          <Button variant="ghost" onClick={() => setStep(1)} style={{ alignSelf: 'center', marginTop: 'var(--space-4)' }}>
            ← Recalculate / Start Over
          </Button>
        </div>
      )}
    </div>
  );
}
