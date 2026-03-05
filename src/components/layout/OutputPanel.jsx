import { useState } from 'react';
import { ChevronDown, ChevronRight, X } from 'lucide-react';
import KpiBlock from '../ui/KpiBlock';
import ValidationChip from '../ui/ValidationChip';
import Button from '../ui/Button';
import { formatNumber } from '../../lib/utils';

function KpiGroup({ title, defaultOpen = true, children }) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
      <button
        onClick={() => setOpen(!open)}
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          width: '100%',
          padding: 'var(--space-3) var(--space-4)',
          background: 'transparent',
          border: 'none',
          cursor: 'pointer',
          color: 'var(--color-text-secondary)',
        }}
      >
        <span
          style={{
            fontSize: 'var(--text-xs)',
            textTransform: 'uppercase',
            letterSpacing: 'var(--tracking-widest)',
            fontFamily: 'var(--font-body)',
            fontWeight: 'var(--weight-semibold)',
          }}
        >
          {title}
        </span>
        {open ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
      </button>
      {open && (
        <div
          style={{
            padding: '0 var(--space-4) var(--space-4)',
            display: 'flex',
            flexDirection: 'column',
            gap: 'var(--space-4)',
          }}
        >
          {children}
        </div>
      )}
    </div>
  );
}

export default function OutputPanel({
  calculations = {},
  validationResults = [],
  onGenerateReport,
  visible = true,
  isMobile = false,
  onClose,
  systemType = 'off-grid',
}) {
  const [validationOpen, setValidationOpen] = useState(true);

  const energy = calculations.energy || {};
  const solar = calculations.solar || {};
  const battery = calculations.battery || {};
  const inverter = calculations.inverter || {};
  const controller = calculations.controller || {};
  const wire = calculations.wire || {};

  const warnings = validationResults.filter((v) => v.status === 'warning');
  const errors = validationResults.filter((v) => v.status === 'error');
  const passes = validationResults.filter((v) => v.status === 'success');

  const panelStyle = isMobile
    ? {
        position: 'fixed',
        top: '56px',
        right: 0,
        width: '100%',
        maxWidth: '360px',
        height: 'calc(100vh - 56px)',
        background: 'rgba(15, 15, 17, 0.98)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        borderLeft: '1px solid rgba(255,255,255,0.10)',
        display: 'flex',
        flexDirection: 'column',
        zIndex: 50,
        overflow: 'hidden',
        transform: visible ? 'translateX(0)' : 'translateX(100%)',
        transition: `transform var(--duration-normal) var(--ease-default)`,
      }
    : {
        position: 'fixed',
        top: '56px',
        right: 0,
        width: '320px',
        height: 'calc(100vh - 56px)',
        background: 'rgba(15, 15, 17, 0.98)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        borderLeft: '1px solid rgba(255,255,255,0.10)',
        display: 'flex',
        flexDirection: 'column',
        zIndex: 50,
        overflow: 'hidden',
      };

  return (
    <aside style={panelStyle}>
      <div
        style={{
          padding: 'var(--space-4)',
          borderBottom: '1px solid rgba(255,255,255,0.05)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <span
          style={{
            fontSize: 'var(--text-xs)',
            textTransform: 'uppercase',
            letterSpacing: 'var(--tracking-widest)',
            color: 'var(--color-text-secondary)',
            fontFamily: 'var(--font-body)',
            fontWeight: 'var(--weight-semibold)',
          }}
        >
          System Summary
        </span>
        {isMobile && onClose && (
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--color-text-secondary)',
              cursor: 'pointer',
              padding: 'var(--space-1)',
              display: 'flex',
              alignItems: 'center',
            }}
          >
            <X size={18} />
          </button>
        )}
      </div>

      <div style={{ flex: 1, overflowY: 'auto' }}>
        <KpiGroup title="Energy">
          <KpiBlock
            label="Daily Load"
            value={formatNumber(energy.dailyKwh)}
            unit="kWh"
          />
          <KpiBlock
            label="Peak Demand"
            value={formatNumber(energy.peakLoad, 0)}
            unit="W"
          />
        </KpiGroup>

        <KpiGroup title="Solar Array">
          <KpiBlock
            label="Array Size"
            value={formatNumber(solar.arrayKw)}
            unit="kW"
          />
          <KpiBlock
            label="Panel Count"
            value={solar.panelCount ?? '—'}
            unit="units"
          />
          <KpiBlock
            label="String Config"
            value={
              solar.panelsPerString && solar.numberOfStrings
                ? `${solar.panelsPerString}S × ${solar.numberOfStrings}P`
                : '—'
            }
          />
        </KpiGroup>

        <KpiGroup title="Battery Bank">
          <KpiBlock
            label="Total Capacity"
            value={formatNumber(battery.totalKwh)}
            unit="kWh"
          />
          <KpiBlock
            label="Capacity (Ah)"
            value={formatNumber(battery.totalAh, 0)}
            unit="Ah"
          />
          <KpiBlock
            label="Battery Count"
            value={battery.totalBatteries ?? '—'}
            unit="units"
          />
        </KpiGroup>

        <KpiGroup title="Inverter">
          <KpiBlock
            label="Selected Size"
            value={inverter.selectedKva ?? '—'}
            unit="kVA"
          />
          <KpiBlock
            label="Required Min."
            value={formatNumber(inverter.requiredKva)}
            unit="kVA"
          />
        </KpiGroup>

        {systemType === 'hybrid' && (
          <KpiGroup title="Grid">
            <KpiBlock
              label="Role"
              value="Supplement"
              colorState="valid"
            />
          </KpiGroup>
        )}

        <KpiGroup title="Charge Controller">
          {controller.isBuiltIn ? (
            <KpiBlock
              label="Controller"
              value="Built-in"
              colorState="valid"
            />
          ) : (
            <KpiBlock
              label="Required Size"
              value={formatNumber(controller.requiredAmps, 0)}
              unit="A"
            />
          )}
        </KpiGroup>

        <KpiGroup title="Wire Sizing">
          <KpiBlock
            label="DC Array Cable"
            value={wire.dcArray?.recommendedMm2 ?? '—'}
            unit="mm²"
          />
          <KpiBlock
            label="DC Battery Cable"
            value={wire.dcBattery?.recommendedMm2 ?? '—'}
            unit="mm²"
          />
          <KpiBlock
            label="AC Output Cable"
            value={wire.ac?.recommendedMm2 ?? '—'}
            unit="mm²"
          />
        </KpiGroup>

        <div style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
          <button
            onClick={() => setValidationOpen(!validationOpen)}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              width: '100%',
              padding: 'var(--space-3) var(--space-4)',
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              color: 'var(--color-text-secondary)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
              <span
                style={{
                  fontSize: 'var(--text-xs)',
                  textTransform: 'uppercase',
                  letterSpacing: 'var(--tracking-widest)',
                  fontFamily: 'var(--font-body)',
                  fontWeight: 'var(--weight-semibold)',
                }}
              >
                Validation
              </span>
              {errors.length > 0 && (
                <span
                  style={{
                    fontSize: 'var(--text-xs)',
                    background: 'var(--color-error-bg)',
                    color: 'var(--color-error)',
                    padding: '1px 6px',
                    borderRadius: 'var(--radius-full)',
                    fontFamily: 'var(--font-numeric)',
                  }}
                >
                  {errors.length}
                </span>
              )}
              {warnings.length > 0 && (
                <span
                  style={{
                    fontSize: 'var(--text-xs)',
                    background: 'var(--color-warning-bg)',
                    color: 'var(--color-warning)',
                    padding: '1px 6px',
                    borderRadius: 'var(--radius-full)',
                    fontFamily: 'var(--font-numeric)',
                  }}
                >
                  {warnings.length}
                </span>
              )}
            </div>
            {validationOpen ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
          </button>
          {validationOpen && (
            <div
              style={{
                padding: '0 var(--space-4) var(--space-4)',
                display: 'flex',
                flexDirection: 'column',
                gap: 'var(--space-2)',
              }}
            >
              {validationResults.length === 0 ? (
                <span
                  style={{
                    fontSize: 'var(--text-xs)',
                    color: 'var(--color-text-muted)',
                    fontFamily: 'var(--font-body)',
                  }}
                >
                  No validation data yet
                </span>
              ) : (
                validationResults.map((result) => (
                  <ValidationChip
                    key={result.id}
                    status={result.status}
                    message={result.message}
                    size="sm"
                  />
                ))
              )}
            </div>
          )}
        </div>
      </div>

      <div
        style={{
          padding: 'var(--space-4)',
          borderTop: '1px solid rgba(255,255,255,0.05)',
        }}
      >
        <Button
          variant="primary"
          onClick={onGenerateReport}
          style={{ width: '100%' }}
        >
          Generate Report
        </Button>
      </div>
    </aside>
  );
}
