import { FileDown, FileJson, FileSpreadsheet } from 'lucide-react';
import SectionHeader from '../ui/SectionHeader';
import Card from '../ui/Card';
import Button from '../ui/Button';
import KpiBlock from '../ui/KpiBlock';
import { generateReportData, downloadProjectJSON } from '../../lib/export/generateReport';
import { downloadBOM } from '../../lib/export/generateBOM';
import { downloadPDF } from '../../lib/export/generatePDF';
import { formatNumber, formatCurrency } from '../../lib/utils';

function DetailRow({ label, value }) {
  return (
    <div style={{
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: 'var(--space-2) 0',
      borderBottom: '1px solid rgba(255,255,255,0.04)',
    }}>
      <span style={{
        fontSize: 'var(--text-xs)',
        color: 'var(--color-text-muted)',
        textTransform: 'uppercase',
        letterSpacing: 'var(--tracking-wide)',
        fontFamily: 'var(--font-body)',
      }}>
        {label}
      </span>
      <span style={{
        fontSize: 'var(--text-sm)',
        color: 'var(--color-text-primary)',
        fontFamily: 'var(--font-numeric)',
      }}>
        {value}
      </span>
    </div>
  );
}

export default function ExportSection({
  project,
  calculations,
  selectedPanel,
  selectedInverter,
  selectedBattery,
  isMobile = false,
}) {
  const reportData = generateReportData(project, calculations, selectedPanel, selectedInverter, selectedBattery);

  const handleDownloadPDF = () => {
    downloadPDF(project, calculations, selectedPanel, selectedInverter, selectedBattery);
  };

  const handleExportBOM = () => {
    downloadBOM(project, calculations);
  };

  const handleExportJSON = () => {
    downloadProjectJSON(project);
  };

  const autonomyDisplay = (() => {
    const d = reportData.summary.daysOfAutonomy || 0;
    const days = Math.floor(d);
    const hrs = Math.round((d % 1) * 24);
    if (days > 0 && hrs > 0) return `${days}d ${hrs}h`;
    if (days > 0) return `${days} day${days !== 1 ? 's' : ''}`;
    if (hrs > 0) return `${hrs} hour${hrs !== 1 ? 's' : ''}`;
    return '0 days';
  })();

  return (
    <div id="section-export">
      <SectionHeader title="Export & Report" subtitle="Generate reports and export project data" />

      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
        <Card>
          <h3 style={{
            fontSize: 'var(--text-md)',
            fontWeight: 'var(--weight-semibold)',
            color: 'var(--color-text-primary)',
            margin: '0 0 var(--space-4) 0',
          }}>
            Report Preview
          </h3>

          <div className="print-area" style={{
            background: 'var(--color-bg-elevated)',
            borderRadius: 'var(--radius-md)',
            padding: isMobile ? 'var(--space-4)' : 'var(--space-8)',
            border: '1px solid var(--color-border-default)',
          }}>
            <div style={{ textAlign: 'center', marginBottom: isMobile ? 'var(--space-4)' : 'var(--space-8)' }}>
              <div style={{
                fontSize: isMobile ? 'var(--text-xl)' : 'var(--text-2xl)',
                fontFamily: 'var(--font-display)',
                fontWeight: 'var(--weight-bold)',
                color: 'var(--color-primary-500)',
                letterSpacing: 'var(--tracking-widest)',
              }}>
                SOLISYS
              </div>
              <div style={{
                fontSize: isMobile ? 'var(--text-base)' : 'var(--text-lg)',
                fontWeight: 'var(--weight-semibold)',
                color: 'var(--color-text-primary)',
                marginTop: 'var(--space-2)',
              }}>
                {reportData.cover.projectName}
              </div>
              {reportData.cover.clientName && (
                <div style={{
                  fontSize: 'var(--text-sm)',
                  color: 'var(--color-text-secondary)',
                  marginTop: 'var(--space-1)',
                }}>
                  Client: {reportData.cover.clientName}
                </div>
              )}
              <div style={{
                fontSize: 'var(--text-xs)',
                color: 'var(--color-text-muted)',
                marginTop: 'var(--space-1)',
              }}>
                {reportData.cover.date}
              </div>
            </div>

            <div style={{
              height: '1px',
              background: 'var(--color-border-subtle)',
              margin: isMobile ? 'var(--space-3) 0' : 'var(--space-6) 0',
            }} />

            {reportData.systemTypeLabel && (
              <div style={{
                display: 'inline-block',
                background: 'rgba(0, 195, 201, 0.1)',
                border: '1px solid rgba(0, 195, 201, 0.2)',
                borderRadius: 'var(--radius-sm)',
                padding: '2px 10px',
                fontSize: 'var(--text-xs)',
                fontFamily: 'var(--font-body)',
                color: 'var(--color-primary-500)',
                fontWeight: 'var(--weight-semibold)',
                letterSpacing: 'var(--tracking-wide)',
                textTransform: 'uppercase',
                marginBottom: 'var(--space-4)',
              }}>
                {reportData.systemTypeLabel}
              </div>
            )}

            <div style={{
              display: 'grid',
              gridTemplateColumns: isMobile ? 'repeat(2, 1fr)' : 'repeat(auto-fit, minmax(140px, 1fr))',
              gap: isMobile ? 'var(--space-3)' : 'var(--space-6)',
              marginBottom: isMobile ? 'var(--space-3)' : 'var(--space-6)',
            }}>
              <KpiBlock label="Solar Array" value={reportData.summary.arrayKw} unit="kW" />
              <KpiBlock label="Battery Bank" value={reportData.summary.batteryKwh} unit="kWh" />
              <KpiBlock label="Inverter" value={reportData.summary.inverterKva} unit="kVA" />
            </div>

            {isMobile ? (
              <div style={{
                background: 'rgba(255,255,255,0.02)',
                borderRadius: 'var(--radius-sm)',
                padding: 'var(--space-2) var(--space-3)',
                border: '1px solid rgba(255,255,255,0.05)',
              }}>
                <DetailRow label="Daily Load" value={`${reportData.summary.dailyLoadKwh} kWh`} />
                <DetailRow label="Peak Load" value={`${reportData.summary.peakLoadW} W`} />
                <DetailRow label="Panels" value={`${reportData.summary.numberOfPanels} × ${reportData.summary.panelWattage}W`} />
                <DetailRow label="Batteries" value={`${reportData.summary.totalBatteries} (${reportData.summary.batteriesInSeries}S × ${reportData.summary.parallelStrings}P)`} />
                <DetailRow label="System Voltage" value={`${reportData.summary.systemVoltage}V DC`} />
                <DetailRow label="Autonomy" value={autonomyDisplay} />
              </div>
            ) : (
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
                gap: 'var(--space-4)',
                fontSize: 'var(--text-sm)',
              }}>
                <div>
                  <div style={{ color: 'var(--color-text-muted)', fontSize: 'var(--text-xs)', textTransform: 'uppercase', letterSpacing: 'var(--tracking-wide)' }}>
                    Daily Load
                  </div>
                  <div style={{ color: 'var(--color-text-primary)', fontFamily: 'var(--font-numeric)' }}>
                    {reportData.summary.dailyLoadKwh} kWh
                  </div>
                </div>
                <div>
                  <div style={{ color: 'var(--color-text-muted)', fontSize: 'var(--text-xs)', textTransform: 'uppercase', letterSpacing: 'var(--tracking-wide)' }}>
                    Peak Load
                  </div>
                  <div style={{ color: 'var(--color-text-primary)', fontFamily: 'var(--font-numeric)' }}>
                    {reportData.summary.peakLoadW} W
                  </div>
                </div>
                <div>
                  <div style={{ color: 'var(--color-text-muted)', fontSize: 'var(--text-xs)', textTransform: 'uppercase', letterSpacing: 'var(--tracking-wide)' }}>
                    Panels
                  </div>
                  <div style={{ color: 'var(--color-text-primary)', fontFamily: 'var(--font-numeric)' }}>
                    {reportData.summary.numberOfPanels} × {reportData.summary.panelWattage}W
                  </div>
                </div>
                <div>
                  <div style={{ color: 'var(--color-text-muted)', fontSize: 'var(--text-xs)', textTransform: 'uppercase', letterSpacing: 'var(--tracking-wide)' }}>
                    Batteries
                  </div>
                  <div style={{ color: 'var(--color-text-primary)', fontFamily: 'var(--font-numeric)' }}>
                    {reportData.summary.totalBatteries} units ({reportData.summary.batteriesInSeries}S × {reportData.summary.parallelStrings}P)
                  </div>
                </div>
                <div>
                  <div style={{ color: 'var(--color-text-muted)', fontSize: 'var(--text-xs)', textTransform: 'uppercase', letterSpacing: 'var(--tracking-wide)' }}>
                    System Voltage
                  </div>
                  <div style={{ color: 'var(--color-text-primary)', fontFamily: 'var(--font-numeric)' }}>
                    {reportData.summary.systemVoltage}V DC
                  </div>
                </div>
                <div>
                  <div style={{ color: 'var(--color-text-muted)', fontSize: 'var(--text-xs)', textTransform: 'uppercase', letterSpacing: 'var(--tracking-wide)' }}>
                    Autonomy
                  </div>
                  <div style={{ color: 'var(--color-text-primary)', fontFamily: 'var(--font-numeric)' }}>
                    {autonomyDisplay}
                  </div>
                </div>
              </div>
            )}

            {reportData.costSummary.totalCost > 0 && (
              <>
                <div style={{
                  height: '1px',
                  background: 'var(--color-border-subtle)',
                  margin: isMobile ? 'var(--space-3) 0' : 'var(--space-6) 0',
                }} />
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: 'var(--tracking-wide)' }}>
                    Estimated Total Cost
                  </div>
                  <div style={{
                    fontSize: isMobile ? 'var(--text-lg)' : 'var(--text-xl)',
                    fontFamily: 'var(--font-numeric)',
                    fontWeight: 'var(--weight-bold)',
                    color: 'var(--color-primary-500)',
                  }}>
                    {reportData.costSummary.formattedTotal}
                  </div>
                </div>
              </>
            )}
          </div>
        </Card>

        <Card>
          <h3 style={{
            fontSize: 'var(--text-md)',
            fontWeight: 'var(--weight-semibold)',
            color: 'var(--color-text-primary)',
            margin: '0 0 var(--space-4) 0',
          }}>
            Export Options
          </h3>

          <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(auto-fit, minmax(200px, 1fr))', gap: 'var(--space-3)' }}>
            <Button variant="primary" onClick={handleDownloadPDF} style={{ justifyContent: 'flex-start' }}>
              <FileDown size={16} />
              Download PDF Report
            </Button>
            {project.costSectionEnabled && (
              <Button variant="secondary" onClick={handleExportBOM} style={{ justifyContent: 'flex-start' }}>
                <FileSpreadsheet size={16} />
                Export BOM (CSV)
              </Button>
            )}
            <Button variant="secondary" onClick={handleExportJSON} style={{ justifyContent: 'flex-start' }}>
              <FileJson size={16} />
              Export Project (JSON)
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
}
