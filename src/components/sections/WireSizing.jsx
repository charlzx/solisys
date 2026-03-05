import { useState } from 'react';
import { Cable, ChevronDown, ChevronUp } from 'lucide-react';
import SectionHeader from '../ui/SectionHeader';
import Card from '../ui/Card';
import Button from '../ui/Button';
import InputField from '../ui/InputField';
import ValidationChip from '../ui/ValidationChip';
import { formatNumber } from '../../lib/utils';
import { CABLE_REFERENCE_TABLE } from '../../data/cableSizes';

function WireSubsection({ title, description, current, currentLabel, cableLength, cableLengthField, maxDrop, maxDropField, wireResult, updateField, validationChip }) {
  return (
    <Card variant="section">
      <h3 style={{
        fontSize: 'var(--text-md)',
        fontWeight: 'var(--weight-semibold)',
        color: 'var(--color-text-primary)',
        margin: '0 0 var(--space-1) 0',
      }}>
        {title}
      </h3>
      {description && (
        <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)', margin: '0 0 var(--space-4) 0' }}>
          {description}
        </p>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 'var(--space-4)' }}>
        <InputField
          label={currentLabel || 'Current'}
          type="number"
          value={formatNumber(wireResult.currentA, 2)}
          readOnly
          unit="A"
        />
        <InputField
          label="One-way Run Length"
          type="number"
          value={cableLength}
          onChange={(e) => updateField(cableLengthField, Number(e.target.value))}
          unit="m"
          min={0}
        />
        <InputField
          label="Max Voltage Drop"
          type="number"
          value={maxDrop}
          onChange={(e) => updateField(maxDropField, Number(e.target.value))}
          unit="%"
          min={0}
          max={10}
          step={0.5}
        />
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))',
        gap: 'var(--space-4)',
        marginTop: 'var(--space-4)',
        padding: 'var(--space-4)',
        background: 'var(--color-bg-elevated)',
        borderRadius: 'var(--radius-sm)',
      }}>
        <div>
          <div style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: 'var(--tracking-wide)' }}>
            Min Cable Size
          </div>
          <div style={{ fontSize: 'var(--text-base)', fontFamily: 'var(--font-numeric)', color: 'var(--color-text-primary)', marginTop: 'var(--space-1)' }}>
            {formatNumber(wireResult.minCrossSectionMm2, 2)} mm²
          </div>
        </div>
        <div>
          <div style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: 'var(--tracking-wide)' }}>
            Recommended
          </div>
          <div style={{ fontSize: 'var(--text-base)', fontFamily: 'var(--font-numeric)', color: 'var(--color-primary-500)', fontWeight: 'var(--weight-bold)', marginTop: 'var(--space-1)' }}>
            {wireResult.recommendedMm2 || '—'} mm²
          </div>
        </div>
        <div>
          <div style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: 'var(--tracking-wide)' }}>
            AWG Equivalent
          </div>
          <div style={{ fontSize: 'var(--text-base)', fontFamily: 'var(--font-numeric)', color: 'var(--color-text-primary)', marginTop: 'var(--space-1)' }}>
            {wireResult.recommendedAwg} AWG
          </div>
        </div>
        <div>
          <div style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: 'var(--tracking-wide)' }}>
            Actual Drop
          </div>
          <div style={{
            fontSize: 'var(--text-base)',
            fontFamily: 'var(--font-numeric)',
            marginTop: 'var(--space-1)',
            color: wireResult.actualVoltageDropPct > maxDrop
              ? 'var(--color-error)'
              : wireResult.actualVoltageDropPct > maxDrop * 0.8
                ? 'var(--color-warning)'
                : 'var(--color-success)',
          }}>
            {formatNumber(wireResult.actualVoltageDropPct, 2)}%
          </div>
        </div>
      </div>

      {validationChip && (
        <div style={{ marginTop: 'var(--space-3)' }}>
          <ValidationChip
            status={validationChip.status === 'pass' ? 'success' : validationChip.status}
            message={validationChip.message}
            size="sm"
          />
        </div>
      )}
    </Card>
  );
}

export default function WireSizing({
  project,
  calculations,
  validations = [],
  updateField,
}) {
  const [expanded, setExpanded] = useState(!!project.wireSectionEnabled);
  const [showRefTable, setShowRefTable] = useState(false);
  const wireValidations = validations.filter(v => v.section === 'wires');

  const getValidation = (id) => wireValidations.find(v => v.id === id);

  const handleToggle = () => {
    const next = !expanded;
    setExpanded(next);
    updateField('wireSectionEnabled', next);
  };

  return (
    <div id="section-wire">
      <SectionHeader stepNumber="05" title="Wire Sizing" subtitle="Cable sizing with voltage drop calculations for all circuits" />

      <Card style={{ marginBottom: expanded ? 'var(--space-4)' : 0 }}>
        <div
          onClick={handleToggle}
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            cursor: 'pointer',
            padding: 'var(--space-2) 0',
          }}
        >
          <div>
            <div style={{
              fontSize: 'var(--text-md)',
              fontWeight: 'var(--weight-semibold)',
              color: 'var(--color-text-primary)',
              display: 'flex',
              alignItems: 'center',
              gap: 'var(--space-2)',
            }}>
              <Cable size={18} style={{ color: 'var(--color-primary-500)' }} />
              Wire Sizing Calculator
            </div>
            <div style={{
              fontSize: 'var(--text-sm)',
              color: 'var(--color-text-muted)',
              marginTop: 'var(--space-1)',
            }}>
              {expanded ? 'Calculate cable sizes for all circuits' : 'Optional — expand to calculate cable sizes and voltage drop'}
            </div>
          </div>
          {expanded ? <ChevronUp size={20} style={{ color: 'var(--color-text-muted)' }} /> : <ChevronDown size={20} style={{ color: 'var(--color-text-muted)' }} />}
        </div>
      </Card>

      {expanded && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)', marginTop: 'var(--space-4)' }}>
          <WireSubsection
            title="DC Array Cables"
            description="Panel strings to charge controller / MPPT input"
            current={calculations.wires.dcArray.currentA}
            currentLabel="String Current (Isc × 1.25²)"
            cableLength={project.dcArrayCableLength}
            cableLengthField="dcArrayCableLength"
            maxDrop={project.maxVoltageDrop_dcArray}
            maxDropField="maxVoltageDrop_dcArray"
            wireResult={calculations.wires.dcArray}
            updateField={updateField}
            validationChip={getValidation('wire_dc_array_drop')}
          />

          <WireSubsection
            title="DC Battery Cables"
            description="Battery bank to inverter DC input"
            current={calculations.wires.dcBattery.currentA}
            currentLabel="Inverter Max DC Current"
            cableLength={project.dcBatteryCableLength}
            cableLengthField="dcBatteryCableLength"
            maxDrop={project.maxVoltageDrop_dcBattery}
            maxDropField="maxVoltageDrop_dcBattery"
            wireResult={calculations.wires.dcBattery}
            updateField={updateField}
            validationChip={getValidation('wire_dc_battery_drop')}
          />

          <WireSubsection
            title="AC Output Cables"
            description="Inverter AC output to distribution board"
            current={calculations.wires.ac.currentA}
            currentLabel="AC Load Current"
            cableLength={project.acOutputCableLength}
            cableLengthField="acOutputCableLength"
            maxDrop={project.maxVoltageDrop_ac}
            maxDropField="maxVoltageDrop_ac"
            wireResult={calculations.wires.ac}
            updateField={updateField}
            validationChip={getValidation('wire_ac_drop')}
          />

          <div>
            <Button
              variant="ghost"
              onClick={() => setShowRefTable(!showRefTable)}
              style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}
            >
              <Cable size={16} />
              Cable Size Reference Table
              {showRefTable ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            </Button>

            {showRefTable && (
              <Card style={{ marginTop: 'var(--space-2)', overflow: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontFamily: 'var(--font-numeric)', fontSize: 'var(--text-sm)' }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid var(--color-border-strong)' }}>
                      {['mm²', 'AWG', 'Max Current (A)', 'Notes'].map((h) => (
                        <th key={h} style={{
                          padding: 'var(--space-2) var(--space-3)',
                          textAlign: 'left',
                          fontSize: 'var(--text-xs)',
                          textTransform: 'uppercase',
                          letterSpacing: 'var(--tracking-wide)',
                          color: 'var(--color-text-secondary)',
                          background: 'var(--color-bg-elevated)',
                          fontWeight: 'var(--weight-medium)',
                          whiteSpace: 'nowrap',
                        }}>
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {CABLE_REFERENCE_TABLE.map((row) => (
                      <tr key={row.mm2} style={{ borderBottom: '1px solid var(--color-border-subtle)' }}>
                        <td style={{ padding: 'var(--space-2) var(--space-3)', color: 'var(--color-text-primary)', whiteSpace: 'nowrap' }}>{row.mm2}</td>
                        <td style={{ padding: 'var(--space-2) var(--space-3)', color: 'var(--color-text-primary)', whiteSpace: 'nowrap' }}>{row.awg}</td>
                        <td style={{ padding: 'var(--space-2) var(--space-3)', color: 'var(--color-text-primary)', textAlign: 'right', whiteSpace: 'nowrap' }}>{row.maxCurrentA}</td>
                        <td style={{ padding: 'var(--space-2) var(--space-3)', color: 'var(--color-text-secondary)', fontFamily: 'var(--font-body)' }}>{row.notes}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </Card>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
