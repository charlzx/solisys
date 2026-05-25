import { useState } from 'react';
import { ChevronDown, ChevronUp, DollarSign } from 'lucide-react';
import SectionHeader from '../ui/SectionHeader';
import Card from '../ui/Card';
import InputField from '../ui/InputField';
import SelectField from '../ui/SelectField';
import KpiBlock from '../ui/KpiBlock';
import { CURRENCY_OPTIONS } from '../../data/constants';
import { formatNumber, formatCurrency, getCurrencySymbol } from '../../lib/utils';

export default function CostEstimation({
  project,
  calculations,
  updateField,
}) {
  const [expanded, setExpanded] = useState(!!project.costSectionEnabled);
  const symbol = getCurrencySymbol(project.currency);
  const systemType = project.systemType || 'off-grid';

  const handleToggle = () => {
    const next = !expanded;
    setExpanded(next);
    updateField('costSectionEnabled', next);
  };

  const costRows = [
    {
      label: 'Solar Panels',
      qty: calculations.numberOfPanels,
      qtyUnit: 'pcs',
      costField: 'costPerPanel',
      total: calculations.numberOfPanels * (project.costPerPanel || 0),
    },
    {
      label: 'Batteries',
      qty: calculations.totalNumberOfBatteries,
      qtyUnit: 'pcs',
      costField: 'costPerBattery',
      total: calculations.totalNumberOfBatteries * (project.costPerBattery || 0),
      hidden: systemType === 'grid-tied' && !calculations.totalNumberOfBatteries,
    },
    {
      label: 'Inverter',
      qty: 1,
      qtyUnit: 'pcs',
      costField: 'inverterCost',
      total: project.inverterCost || 0,
      isSingleCost: true,
    },
    {
      label: 'Charge Controller',
      qty: project.hasBuiltInController ? 0 : 1,
      qtyUnit: 'pcs',
      costField: 'controllerCost',
      total: project.hasBuiltInController ? 0 : (project.controllerCost || 0),
      isSingleCost: true,
      hidden: project.hasBuiltInController || (systemType === 'grid-tied' && !calculations.totalNumberOfBatteries),
    },
    {
      label: 'Solar Cable',
      qty: project.solarCableLength || 0,
      qtyUnit: 'm',
      costField: 'solarCableCostPerMeter',
      qtyField: 'solarCableLength',
      total: (project.solarCableLength || 0) * (project.solarCableCostPerMeter || 0),
      hasQtyInput: true,
    },
    {
      label: 'Electrical Cable',
      qty: project.electricalCableLength || 0,
      qtyUnit: 'm',
      costField: 'electricalCableCostPerMeter',
      qtyField: 'electricalCableLength',
      total: (project.electricalCableLength || 0) * (project.electricalCableCostPerMeter || 0),
      hasQtyInput: true,
    },
    {
      label: 'Installation',
      costField: 'installationCost',
      total: project.installationCost || 0,
      isSingleCost: true,
    },
    {
      label: 'Circuit Breakers',
      costField: 'breakers',
      total: project.breakers || 0,
      isSingleCost: true,
    },
    {
      label: 'Connectors',
      costField: 'connectors',
      total: project.connectors || 0,
      isSingleCost: true,
    },
    {
      label: 'Mounting Structure',
      costField: 'mountingStructure',
      total: project.mountingStructure || 0,
      isSingleCost: true,
    },
    {
      label: 'Permits & Inspection',
      costField: 'permits',
      total: project.permits || 0,
      isSingleCost: true,
    },
    {
      label: 'Miscellaneous',
      costField: 'miscOther',
      total: project.miscOther || 0,
      isSingleCost: true,
    },
    ...(systemType === 'grid-tied' ? [
      {
        label: 'Net Meter',
        costField: 'netMeterCost',
        total: project.netMeterCost || 0,
        isSingleCost: true,
      },
      {
        label: 'Grid Connection',
        costField: 'gridConnectionCost',
        total: project.gridConnectionCost || 0,
        isSingleCost: true,
      },
    ] : []),
    ...(systemType === 'hybrid' ? [
      {
        label: 'Transfer Switch / ATS',
        costField: 'transferSwitchCost',
        total: project.transferSwitchCost || 0,
        isSingleCost: true,
      },
      {
        label: 'Grid Connection',
        costField: 'gridConnectionCost',
        total: project.gridConnectionCost || 0,
        isSingleCost: true,
      },
    ] : []),
  ];

  const visibleRows = costRows.filter(r => !r.hidden);
  const totalCost = visibleRows.reduce((sum, r) => sum + (r.total || 0), 0);

  return (
    <div id="section-cost">
      <SectionHeader stepNumber="07" title="Cost Estimation" subtitle="Component costs and total system budget" />

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
              fontSize: 'var(--text-sm)',
              fontWeight: 'var(--weight-medium)',
              color: 'var(--color-text-primary)',
              fontFamily: 'var(--font-body)',
              display: 'flex',
              alignItems: 'center',
              gap: 'var(--space-2)',
            }}>
              <DollarSign size={16} style={{ color: 'var(--color-primary-500)' }} />
              Cost Breakdown
            </div>
            <div style={{
              fontSize: 'var(--text-xs)',
              color: 'var(--color-text-muted)',
              fontFamily: 'var(--font-body)',
              marginTop: '2px',
            }}>
              {expanded ? 'Click to collapse' : 'Cost estimation is optional. Expand to enter component prices.'}
            </div>
          </div>
          {expanded ? <ChevronUp size={18} color="var(--color-text-muted)" /> : <ChevronDown size={18} color="var(--color-text-muted)" />}
        </div>
      </Card>

      {expanded && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
          <Card>
            <div style={{ maxWidth: '300px' }}>
              <SelectField
                label="Currency"
                value={project.currency}
                onChange={(e) => updateField('currency', e.target.value)}
                options={CURRENCY_OPTIONS}
              />
            </div>
          </Card>

          <Card>
            <div style={{ overflowX: 'auto', WebkitOverflowScrolling: 'touch' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '480px' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--color-border-strong)' }}>
                    {['Component', 'Qty', 'Unit Cost', 'Total'].map((h) => (
                      <th key={h} style={{
                        padding: 'var(--space-2) var(--space-3)',
                        textAlign: h === 'Component' ? 'left' : 'right',
                        fontSize: 'var(--text-xs)',
                        textTransform: 'uppercase',
                        letterSpacing: 'var(--tracking-wide)',
                        color: 'var(--color-text-secondary)',
                        background: 'var(--color-bg-elevated)',
                        fontWeight: 'var(--weight-medium)',
                        fontFamily: 'var(--font-body)',
                        whiteSpace: 'nowrap',
                      }}>
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {visibleRows.map((row) => (
                    <tr key={row.label} style={{ borderBottom: '1px solid var(--color-border-subtle)' }}>
                      <td style={{
                        padding: 'var(--space-3)',
                        color: 'var(--color-text-primary)',
                        fontSize: 'var(--text-sm)',
                        fontFamily: 'var(--font-body)',
                        whiteSpace: 'nowrap',
                      }}>
                        {row.label}
                      </td>
                      <td style={{ padding: 'var(--space-2) var(--space-3)', textAlign: 'right' }}>
                        {row.hasQtyInput ? (
                          <input
                            type="number"
                            value={row.qty || ''}
                            onChange={(e) => updateField(row.qtyField, Number(e.target.value))}
                            style={{
                              width: '70px',
                              background: 'var(--color-bg-elevated)',
                              border: '1px solid var(--color-border-default)',
                              borderRadius: 'var(--radius-sm)',
                              color: 'var(--color-text-primary)',
                              fontFamily: 'var(--font-numeric)',
                              fontSize: 'var(--text-sm)',
                              padding: 'var(--space-1) var(--space-2)',
                              textAlign: 'right',
                              outline: 'none',
                            }}
                            min={0}
                          />
                        ) : (
                          <span style={{
                            fontFamily: 'var(--font-numeric)',
                            fontSize: 'var(--text-sm)',
                            color: 'var(--color-text-secondary)',
                          }}>
                            {row.qty !== undefined ? `${row.qty} ${row.qtyUnit || ''}` : '—'}
                          </span>
                        )}
                      </td>
                      <td style={{ padding: 'var(--space-2) var(--space-3)', textAlign: 'right' }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 'var(--space-1)' }}>
                          <span style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)' }}>{symbol}</span>
                          <input
                            type="number"
                            value={project[row.costField] || ''}
                            onChange={(e) => updateField(row.costField, Number(e.target.value))}
                            placeholder="0"
                            style={{
                              width: '90px',
                              background: 'var(--color-bg-elevated)',
                              border: '1px solid var(--color-border-default)',
                              borderRadius: 'var(--radius-sm)',
                              color: 'var(--color-text-primary)',
                              fontFamily: 'var(--font-numeric)',
                              fontSize: 'var(--text-sm)',
                              padding: 'var(--space-1) var(--space-2)',
                              textAlign: 'right',
                              outline: 'none',
                            }}
                            min={0}
                          />
                        </div>
                      </td>
                      <td style={{
                        padding: 'var(--space-3)',
                        textAlign: 'right',
                        fontFamily: 'var(--font-numeric)',
                        fontSize: 'var(--text-sm)',
                        color: 'var(--color-text-primary)',
                        whiteSpace: 'nowrap',
                      }}>
                        {formatCurrency(row.total, project.currency)}
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr style={{ borderTop: '2px solid var(--color-primary-500)' }}>
                    <td colSpan={3} style={{
                      padding: 'var(--space-3)',
                      textAlign: 'right',
                      fontWeight: 'var(--weight-bold)',
                      fontSize: 'var(--text-base)',
                      color: 'var(--color-text-primary)',
                      fontFamily: 'var(--font-body)',
                    }}>
                      TOTAL
                    </td>
                    <td style={{
                      padding: 'var(--space-3)',
                      textAlign: 'right',
                      fontWeight: 'var(--weight-bold)',
                      fontSize: 'var(--text-md)',
                      color: 'var(--color-primary-500)',
                      fontFamily: 'var(--font-numeric)',
                      whiteSpace: 'nowrap',
                    }}>
                      {formatCurrency(totalCost, project.currency)}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </Card>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: 'var(--space-4)',
          }}>
            <Card variant="elevated">
              <KpiBlock
                label="Total System Cost"
                value={formatCurrency(totalCost, project.currency)}
                large
              />
            </Card>
            {calculations.actualArrayKw > 0 && (
              <Card variant="elevated">
                <KpiBlock
                  label="Cost per kW"
                  value={formatCurrency(totalCost / calculations.actualArrayKw, project.currency)}
                  unit="/kW"
                />
              </Card>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
