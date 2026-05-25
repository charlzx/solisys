import { useState, useRef, useEffect } from 'react';
import { Zap, Plus, Trash2, Download } from 'lucide-react';
import SectionHeader from '../ui/SectionHeader';
import Card from '../ui/Card';
import InputField from '../ui/InputField';
import Button from '../ui/Button';
import KpiBlock from '../ui/KpiBlock';
import { formatNumber } from '../../lib/utils';
import appliancePresets from '../../data/appliancePresets';

export default function LoadAnalysis({
  project,
  updateField,
  updateAppliance,
  addAppliance,
  removeAppliance,
  calculations,
  setProject,
}) {
  const isAudit = project.calcMethod === 'audit';
  const [showPresets, setShowPresets] = useState(false);
  const presetRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (presetRef.current && !presetRef.current.contains(e.target)) {
        setShowPresets(false);
      }
    };
    if (showPresets) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showPresets]);

  const loadPreset = (presetName) => {
    const preset = appliancePresets[presetName];
    if (!preset || !setProject) return;
    const newAppliances = preset.map((item, i) => ({
      ...item,
      id: Date.now().toString(36) + Math.random().toString(36).slice(2, 7) + i,
    }));
    setProject((prev) => ({
      ...prev,
      lastUpdated: new Date().toISOString(),
      calcMethod: 'audit',
      appliances: newAppliances,
    }));
    setShowPresets(false);
  };

  const getApplianceWh = (a) => {
    const w = a.unit === 'HP' ? a.wattage * 746 : a.wattage;
    return (a.quantity || 0) * (w || 0) * (a.hours || 0);
  };

  return (
    <div id="section-load">
      <SectionHeader
        stepNumber="01"
        title="Load Analysis"
        subtitle="Define your energy consumption to size the entire system"
      />

      <div style={{ display: 'flex', gap: 'var(--space-3)', marginBottom: 'var(--space-6)' }}>
        <Card
          variant={isAudit ? 'section' : 'default'}
          active={isAudit}
          onClick={() => updateField('calcMethod', 'audit')}
          style={{
            flex: 1,
            cursor: 'pointer',
            background: isAudit ? 'var(--color-primary-glow)' : undefined,
            border: isAudit ? '1px solid var(--color-primary-500)' : undefined,
            padding: 'var(--space-4)',
            textAlign: 'center',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 'var(--space-2)' }}>
            <Zap size={16} style={{ color: isAudit ? 'var(--color-primary-500)' : 'var(--color-text-muted)' }} />
            <span style={{
              fontFamily: 'var(--font-body)',
              fontSize: 'var(--text-base)',
              fontWeight: 'var(--weight-semibold)',
              color: isAudit ? 'var(--color-text-primary)' : 'var(--color-text-secondary)',
            }}>
              Appliance Audit
            </span>
          </div>
        </Card>

        <Card
          variant={!isAudit ? 'section' : 'default'}
          active={!isAudit}
          onClick={() => updateField('calcMethod', 'bill')}
          style={{
            flex: 1,
            cursor: 'pointer',
            background: !isAudit ? 'var(--color-primary-glow)' : undefined,
            border: !isAudit ? '1px solid var(--color-primary-500)' : undefined,
            padding: 'var(--space-4)',
            textAlign: 'center',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 'var(--space-2)' }}>
            <Zap size={16} style={{ color: !isAudit ? 'var(--color-primary-500)' : 'var(--color-text-muted)' }} />
            <span style={{
              fontFamily: 'var(--font-body)',
              fontSize: 'var(--text-base)',
              fontWeight: 'var(--weight-semibold)',
              color: !isAudit ? 'var(--color-text-primary)' : 'var(--color-text-secondary)',
            }}>
              From Utility Bill
            </span>
          </div>
        </Card>
      </div>

      {isAudit ? (
        <Card>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontFamily: 'var(--font-body)' }}>
              <thead>
                <tr style={{
                  background: 'var(--color-bg-elevated)',
                  borderBottom: '1px solid var(--color-border-strong)',
                }}>
                  {['Appliance Name', 'Qty', 'Power', 'Unit', 'Hours/Day', 'Daily Wh', ''].map((h, i) => (
                    <th
                      key={i}
                      style={{
                        padding: 'var(--space-2) var(--space-3)',
                        fontSize: 'var(--text-xs)',
                        textTransform: 'uppercase',
                        letterSpacing: 'var(--tracking-wide)',
                        color: 'var(--color-text-secondary)',
                        fontWeight: 'var(--weight-medium)',
                        textAlign: i >= 1 && i <= 5 ? 'right' : 'left',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {project.appliances.map((a) => (
                  <tr
                    key={a.id}
                    style={{ borderBottom: '1px solid var(--color-border-subtle)' }}
                  >
                    <td style={{ padding: 'var(--space-2) var(--space-3)', minWidth: '160px' }}>
                      <input
                        type="text"
                        value={a.name}
                        onChange={(e) => updateAppliance(a.id, 'name', e.target.value)}
                        placeholder="e.g. LED Light"
                        style={{
                          background: 'transparent',
                          border: 'none',
                          outline: 'none',
                          color: 'var(--color-text-primary)',
                          fontFamily: 'var(--font-body)',
                          fontSize: 'var(--text-base)',
                          width: '100%',
                        }}
                      />
                    </td>
                    <td style={{ padding: 'var(--space-2) var(--space-3)', width: '70px' }}>
                      <input
                        type="number"
                        value={a.quantity || ''}
                        onChange={(e) => updateAppliance(a.id, 'quantity', Number(e.target.value))}
                        min={0}
                        style={{
                          background: 'transparent',
                          border: 'none',
                          outline: 'none',
                          color: 'var(--color-text-primary)',
                          fontFamily: 'var(--font-numeric)',
                          fontSize: 'var(--text-base)',
                          width: '100%',
                          textAlign: 'right',
                        }}
                      />
                    </td>
                    <td style={{ padding: 'var(--space-2) var(--space-3)', width: '90px' }}>
                      <input
                        type="number"
                        value={a.wattage || ''}
                        onChange={(e) => updateAppliance(a.id, 'wattage', Number(e.target.value))}
                        min={0}
                        style={{
                          background: 'transparent',
                          border: 'none',
                          outline: 'none',
                          color: 'var(--color-text-primary)',
                          fontFamily: 'var(--font-numeric)',
                          fontSize: 'var(--text-base)',
                          width: '100%',
                          textAlign: 'right',
                        }}
                      />
                    </td>
                    <td style={{ padding: 'var(--space-2) var(--space-3)', width: '80px' }}>
                      <select
                        value={a.unit}
                        onChange={(e) => updateAppliance(a.id, 'unit', e.target.value)}
                        style={{
                          background: 'transparent',
                          border: 'none',
                          outline: 'none',
                          color: 'var(--color-text-primary)',
                          fontFamily: 'var(--font-body)',
                          fontSize: 'var(--text-base)',
                          cursor: 'pointer',
                          appearance: 'none',
                          textAlign: 'right',
                        }}
                      >
                        <option value="W">W</option>
                        <option value="HP">HP</option>
                      </select>
                    </td>
                    <td style={{ padding: 'var(--space-2) var(--space-3)', width: '90px' }}>
                      <input
                        type="number"
                        value={a.hours || ''}
                        onChange={(e) => updateAppliance(a.id, 'hours', Number(e.target.value))}
                        min={0}
                        max={24}
                        style={{
                          background: 'transparent',
                          border: 'none',
                          outline: 'none',
                          color: 'var(--color-text-primary)',
                          fontFamily: 'var(--font-numeric)',
                          fontSize: 'var(--text-base)',
                          width: '100%',
                          textAlign: 'right',
                        }}
                      />
                    </td>
                    <td style={{
                      padding: 'var(--space-2) var(--space-3)',
                      textAlign: 'right',
                      fontFamily: 'var(--font-numeric)',
                      fontSize: 'var(--text-base)',
                      color: 'var(--color-text-secondary)',
                      minWidth: '120px',
                      whiteSpace: 'nowrap',
                    }}>
                      {formatNumber(getApplianceWh(a), 0)}
                    </td>
                    <td style={{ padding: 'var(--space-2)', width: '36px' }}>
                      <Button
                        variant="icon-only"
                        onClick={() => removeAppliance(a.id)}
                        title="Remove appliance"
                      >
                        <Trash2 size={14} style={{ color: 'var(--color-error)' }} />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr style={{
                  borderTop: '2px solid var(--color-border-strong)',
                  background: 'var(--color-bg-elevated)',
                }}>
                  <td
                    colSpan={5}
                    style={{
                      padding: 'var(--space-3)',
                      fontFamily: 'var(--font-body)',
                      fontSize: 'var(--text-sm)',
                      fontWeight: 'var(--weight-semibold)',
                      color: 'var(--color-text-primary)',
                      textAlign: 'right',
                      textTransform: 'uppercase',
                      letterSpacing: 'var(--tracking-wide)',
                    }}
                  >
                    Total
                  </td>
                  <td style={{
                    padding: 'var(--space-3)',
                    textAlign: 'right',
                    fontFamily: 'var(--font-numeric)',
                    fontSize: 'var(--text-base)',
                    fontWeight: 'var(--weight-bold)',
                    color: 'var(--color-primary-500)',
                  }}>
                    <span style={{ whiteSpace: 'nowrap' }}>{formatNumber(calculations.totalDailyWh, 0)} Wh</span>
                  </td>
                  <td />
                </tr>
              </tfoot>
            </table>
          </div>

          <div style={{ marginTop: 'var(--space-4)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 'var(--space-2)' }}>
            <div style={{ display: 'flex', gap: 'var(--space-2)', alignItems: 'center' }}>
              <Button variant="ghost" onClick={addAppliance}>
                <Plus size={16} />
                Add Appliance
              </Button>
              <div style={{ position: 'relative' }} ref={presetRef}>
                <Button variant="ghost" onClick={() => setShowPresets(!showPresets)}>
                  <Download size={16} />
                  Load Preset
                </Button>
                {showPresets && (
                  <div style={{
                    position: 'absolute',
                    top: '100%',
                    left: 0,
                    marginTop: 'var(--space-1)',
                    background: '#18181b',
                    border: '1px solid var(--color-border-strong)',
                    borderRadius: 'var(--radius-lg)',
                    boxShadow: 'var(--shadow-lg)',
                    zIndex: 50,
                    minWidth: '200px',
                    overflow: 'hidden',
                  }}>
                    {Object.keys(appliancePresets).map((name) => (
                      <button
                        key={name}
                        onClick={() => loadPreset(name)}
                        style={{
                          display: 'block',
                          width: '100%',
                          padding: 'var(--space-3) var(--space-4)',
                          background: 'transparent',
                          border: 'none',
                          textAlign: 'left',
                          cursor: 'pointer',
                          fontFamily: 'var(--font-body)',
                          fontSize: 'var(--text-sm)',
                          color: 'var(--color-text-primary)',
                          transition: 'background 0.15s',
                        }}
                        onMouseEnter={(e) => e.target.style.background = 'var(--color-bg-elevated)'}
                        onMouseLeave={(e) => e.target.style.background = 'transparent'}
                      >
                        <div style={{ fontWeight: 'var(--weight-medium)' }}>{name}</div>
                        <div style={{
                          fontSize: 'var(--text-xs)',
                          color: 'var(--color-text-muted)',
                          marginTop: '2px',
                        }}>
                          {appliancePresets[name].length} appliances
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
            <span style={{
              fontFamily: 'var(--font-numeric)',
              fontSize: 'var(--text-sm)',
              color: 'var(--color-text-secondary)',
            }}>
              {formatNumber(calculations.totalDailyKwh, 2)} kWh/day
            </span>
          </div>
        </Card>
      ) : (
        <Card>
          <InputField
            label="Average Daily Consumption"
            type="number"
            value={project.dailyEnergyKwh}
            onChange={(e) => updateField('dailyEnergyKwh', Number(e.target.value))}
            unit="kWh"
            min={0}
            step={0.1}
            helper="Find this on your monthly bill. Divide monthly kWh by 30."
            tooltip="Your average daily electricity consumption in kilowatt-hours"
          />
        </Card>
      )}

      <div style={{
        display: 'grid',
        gridTemplateColumns: project.calcMethod === 'audit'
          ? 'repeat(auto-fit, minmax(160px, 1fr))'
          : '1fr',
        gap: 'var(--space-4)',
        marginTop: 'var(--space-6)',
        maxWidth: project.calcMethod === 'audit' ? undefined : '280px',
      }}>
        <Card style={{ padding: 'var(--space-4)' }}>
          <KpiBlock
            label="Daily Energy"
            value={formatNumber(calculations.totalDailyKwh, 2)}
            unit="kWh"
            colorState={calculations.totalDailyWh > 0 ? 'valid' : 'neutral'}
          />
        </Card>
        {project.calcMethod === 'audit' && (
          <Card style={{ padding: 'var(--space-4)' }}>
            <KpiBlock
              label="Peak Demand"
              value={formatNumber(calculations.estimatedPeakLoadW, 0)}
              unit="W"
              colorState={calculations.estimatedPeakLoadW > 0 ? 'valid' : 'neutral'}
            />
          </Card>
        )}
        {project.calcMethod === 'audit' && (
          <Card style={{ padding: 'var(--space-4)' }}>
            <KpiBlock
              label="Appliances"
              value={project.appliances.length}
              unit="items"
            />
          </Card>
        )}
      </div>
    </div>
  );
}
