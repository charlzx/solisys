import { useState, useEffect, useRef, useCallback } from 'react';
import { StickyNote, ChevronDown, ChevronUp, Sun, Zap, UtilityPole } from 'lucide-react';
import TopBar from '../components/layout/TopBar';
import Sidebar from '../components/layout/Sidebar';
import OutputPanel from '../components/layout/OutputPanel';
import LoadAnalysis from '../components/sections/LoadAnalysis';
import InverterSizing from '../components/sections/InverterSizing';
import BatterySizing from '../components/sections/BatterySizing';
import SolarArray from '../components/sections/SolarArray';
import WireSizing from '../components/sections/WireSizing';
import Diagram from '../components/sections/Diagram';
import CostEstimation from '../components/sections/CostEstimation';
import ExportSection from '../components/sections/ExportSection';
import { useProject } from '../hooks/useProject';
import { useCalculations } from '../hooks/useCalculations';
import { useValidation } from '../hooks/useValidation';
import { useComponentDatabase } from '../hooks/useComponentDatabase';
import { useAutoSave } from '../hooks/useAutoSave';
import { useBreakpoint } from '../hooks/useBreakpoint';
import { useUndoRedo } from '../hooks/useUndoRedo';
import { useToast } from '../context/ToastContext';
import { NAV_SECTIONS, SYSTEM_TYPE_OPTIONS } from '../data/constants';
import { generateInterpretation } from '../lib/interpretResults';
import InterpretModal from '../components/InterpretModal';

const SECTION_IDS = ['load', 'inverter', 'battery', 'solar', 'wire', 'diagram', 'cost', 'export'];

export default function Calculator({ projectId, onBack }) {
  const { project, setProject, updateField, updateAppliance, addAppliance, removeAppliance } = useProject(projectId);
  const { panels, batteries, inverters } = useComponentDatabase();
  const { saveStatus, saveNow: forceSave } = useAutoSave(project);
  const { isMobile, isTablet, isDesktop } = useBreakpoint();
  const { addToast } = useToast();

  const { pushState, undo, redo, canUndo, canRedo } = useUndoRedo(project);
  const lastProjectRef = useRef(project);

  useEffect(() => {
    if (project !== lastProjectRef.current) {
      pushState(project);
      lastProjectRef.current = project;
    }
  }, [project, pushState]);

  const handleUndo = useCallback(() => {
    const prev = undo();
    if (prev) {
      setProject(prev);
      lastProjectRef.current = prev;
      addToast('Undo', 'info');
    }
  }, [undo, setProject, addToast]);

  const handleRedo = useCallback(() => {
    const next = redo();
    if (next) {
      setProject(next);
      lastProjectRef.current = next;
      addToast('Redo', 'info');
    }
  }, [redo, setProject, addToast]);

  const selectedPanel = project.selectedPanelId
    ? panels.find((p) => p.id === project.selectedPanelId) || null
    : null;
  const selectedInverter = project.selectedInverterId
    ? inverters.find((i) => i.id === project.selectedInverterId) || null
    : null;
  const selectedBattery = project.selectedBatteryId
    ? batteries.find((b) => b.id === project.selectedBatteryId) || null
    : null;

  const calculations = useCalculations(project, selectedPanel, selectedInverter, selectedBattery);
  const validationResults = useValidation(project, calculations, selectedPanel, selectedInverter, selectedBattery);

  const [activeSection, setActiveSection] = useState('load');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(!isDesktop);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [outputOpen, setOutputOpen] = useState(false);
  const [notesOpen, setNotesOpen] = useState(false);
  const [interpretOpen, setInterpretOpen] = useState(false);

  const sectionRefs = useRef({});
  const mainRef = useRef(null);

  useEffect(() => {
    if (isMobile || isTablet) {
      setSidebarCollapsed(true);
      setSidebarOpen(false);
      setOutputOpen(false);
    } else {
      setSidebarCollapsed(false);
    }
  }, [isMobile, isTablet]);

  useEffect(() => {
    const visibleSections = new Map();

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          const id = entry.target.id?.replace('section-', '');
          if (!id || !SECTION_IDS.includes(id)) continue;

          if (entry.isIntersecting) {
            visibleSections.set(id, entry.intersectionRatio);
          } else {
            visibleSections.delete(id);
          }
        }

        if (visibleSections.size > 0) {
          let bestId = null;
          let bestIdx = Infinity;
          for (const [id] of visibleSections) {
            const idx = SECTION_IDS.indexOf(id);
            if (idx < bestIdx) {
              bestIdx = idx;
              bestId = id;
            }
          }
          if (bestId) {
            setActiveSection(bestId);
          }
        }
      },
      { threshold: [0, 0.1], rootMargin: '-56px 0px -35% 0px' }
    );

    SECTION_IDS.forEach((id) => {
      const el = document.getElementById(`section-${id}`);
      if (el) {
        sectionRefs.current[id] = el;
        observer.observe(el);
      }
    });

    return () => observer.disconnect();
  }, []);

  const handleNavigate = useCallback((sectionId) => {
    setActiveSection(sectionId);
    const el = document.getElementById(`section-${sectionId}`);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
    if (isMobile || isTablet) {
      setSidebarOpen(false);
    }
  }, [isMobile, isTablet]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      const isMod = e.ctrlKey || e.metaKey;

      if (isMod && e.key === 's') {
        e.preventDefault();
        forceSave?.();
        addToast('Project saved', 'success');
        return;
      }

      if (isMod && e.key === 'z' && !e.shiftKey) {
        e.preventDefault();
        handleUndo();
        return;
      }

      if (isMod && ((e.key === 'z' && e.shiftKey) || e.key === 'y')) {
        e.preventDefault();
        handleRedo();
        return;
      }

      if (e.key === 'Escape') {
        if (interpretOpen) {
          setInterpretOpen(false);
          return;
        }
        if (outputOpen) {
          setOutputOpen(false);
          return;
        }
        if ((isMobile || isTablet) && sidebarOpen) {
          setSidebarOpen(false);
          return;
        }
      }

      if (isMod && (e.key === 'ArrowUp' || e.key === 'ArrowDown')) {
        e.preventDefault();
        const currentIdx = SECTION_IDS.indexOf(activeSection);
        if (currentIdx === -1) return;
        const nextIdx = e.key === 'ArrowUp'
          ? Math.max(0, currentIdx - 1)
          : Math.min(SECTION_IDS.length - 1, currentIdx + 1);
        if (nextIdx !== currentIdx) {
          handleNavigate(SECTION_IDS[nextIdx]);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleUndo, handleRedo, forceSave, addToast, outputOpen, sidebarOpen, isMobile, isTablet, activeSection, handleNavigate, interpretOpen]);

  const handleProjectNameChange = useCallback((name) => {
    updateField('projectName', name);
  }, [updateField]);

  const handleSelectPanel = useCallback((panel) => {
    updateField('selectedPanelId', panel.id);
    updateField('panelWattage', panel.pmax);
  }, [updateField]);

  const handleSelectInverter = useCallback((inverter) => {
    updateField('selectedInverterId', inverter.id);
    updateField('selectedInverterKva', inverter.ratedKva);
    if (inverter.hasBuiltInMppt) {
      updateField('hasBuiltInController', true);
    }
  }, [updateField]);

  const handleSelectBattery = useCallback((battery) => {
    updateField('selectedBatteryId', battery.id);
    updateField('availableBatteryAh', battery.capacityAh);
    updateField('availableBatteryVoltage', battery.voltageV);
  }, [updateField]);


  const handleExport = useCallback(() => {
    handleNavigate('export');
  }, [handleNavigate]);

  const handleGenerateReport = useCallback(() => {
    setOutputOpen(false);
    setTimeout(() => {
      handleNavigate('export');
    }, 100);
  }, [handleNavigate]);

  const toggleSidebar = useCallback(() => {
    if (isMobile || isTablet) {
      setSidebarOpen((o) => !o);
    } else {
      setSidebarCollapsed((c) => !c);
    }
  }, [isMobile, isTablet]);

  const sectionStatuses = {};
  SECTION_IDS.forEach((id) => {
    const sectionValidations = validationResults.filter((v) => v.section === id);
    if (sectionValidations.some((v) => v.status === 'error')) {
      sectionStatuses[id] = 'in-progress';
    } else if (sectionValidations.some((v) => v.status === 'warning')) {
      sectionStatuses[id] = 'in-progress';
    } else if (sectionValidations.length > 0) {
      sectionStatuses[id] = 'complete';
    } else {
      sectionStatuses[id] = 'empty';
    }
  });
  if (calculations.totalDailyWh > 0) sectionStatuses['load'] = 'complete';
  if (calculations.requiredInverterKva > 0 && project.selectedInverterKva > 0) sectionStatuses['inverter'] = 'complete';
  if (calculations.totalNumberOfBatteries > 0) sectionStatuses['battery'] = 'complete';
  if (calculations.numberOfPanels > 0) sectionStatuses['solar'] = 'complete';

  const showSidebar = isDesktop || sidebarOpen;
  const showOutput = isDesktop || outputOpen;
  const sidebarWidth = isDesktop ? (sidebarCollapsed ? '64px' : '240px') : '240px';

  const mainMarginLeft = isDesktop ? sidebarWidth : '0';
  const mainMarginRight = isDesktop ? '320px' : '0';

  const outputCalcs = {
    energy: {
      dailyKwh: calculations.totalDailyKwh,
      peakLoad: calculations.estimatedPeakLoadW || project.peakLoad,
    },
    solar: {
      arrayKw: calculations.actualArrayKw,
      panelCount: calculations.numberOfPanels,
      panelsPerString: project.panelsPerString || calculations.panelsPerStringMin,
      numberOfStrings: calculations.numberOfStrings,
    },
    battery: {
      totalKwh: calculations.requiredBankCapacityWh ? calculations.requiredBankCapacityWh / 1000 : 0,
      totalAh: calculations.requiredBankCapacityAh,
      totalBatteries: calculations.totalNumberOfBatteries,
    },
    inverter: {
      selectedKva: project.selectedInverterKva || calculations.recommendedInverterKva,
      requiredKva: calculations.requiredInverterKva,
    },
    controller: {
      isBuiltIn: project.hasBuiltInController,
      requiredAmps: calculations.chargeControllerAmps,
    },
    wire: {
      dcArray: calculations.wires.dcArray,
      dcBattery: calculations.wires.dcBattery,
      ac: calculations.wires.ac,
    },
  };

  return (
    <div style={{ minHeight: '100vh', background: 'var(--color-bg-base)' }}>
      <TopBar
        projectName={project.projectName}
        onProjectNameChange={handleProjectNameChange}
        saveStatus={saveStatus}
        onBack={onBack}
        onExport={handleExport}
        onUndo={handleUndo}
        onRedo={handleRedo}
        canUndo={canUndo}
        canRedo={canRedo}
        onToggleSidebar={toggleSidebar}
        onToggleOutput={() => setOutputOpen((o) => !o)}
        isMobile={isMobile}
        isDesktop={isDesktop}
      />

      {(isMobile || isTablet) && sidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          style={{
            position: 'fixed',
            inset: 0,
            top: '56px',
            background: 'rgba(0,0,0,0.5)',
            zIndex: 49,
          }}
        />
      )}

      <Sidebar
        activeSection={activeSection}
        sectionStatuses={sectionStatuses}
        onNavigate={handleNavigate}
        onBackToDashboard={onBack}
        collapsed={isDesktop ? sidebarCollapsed : false}
        onToggleCollapse={toggleSidebar}
        visible={showSidebar}
        isMobile={isMobile || isTablet}
        systemType={project.systemType || 'off-grid'}
        onInterpret={() => {
          const coreIds = (project.systemType || 'off-grid') === 'grid-tied'
            ? ['load', 'inverter', 'solar']
            : ['load', 'inverter', 'battery', 'solar'];
          const allComplete = coreIds.every((id) => sectionStatuses[id] === 'complete');
          if (!allComplete) {
            const count = coreIds.length;
            addToast(`Complete all ${count} core sections first`, 'info');
            return;
          }
          setInterpretOpen(true);
        }}
      />

      {(isMobile || isTablet) && outputOpen && (
        <div
          onClick={() => setOutputOpen(false)}
          style={{
            position: 'fixed',
            inset: 0,
            top: '56px',
            background: 'rgba(0,0,0,0.5)',
            zIndex: 49,
          }}
        />
      )}

      <OutputPanel
        calculations={outputCalcs}
        validationResults={validationResults}
        onGenerateReport={handleGenerateReport}
        visible={showOutput}
        isMobile={isMobile || isTablet}
        onClose={() => setOutputOpen(false)}
        systemType={project.systemType || 'off-grid'}
      />

      <main
        ref={mainRef}
        style={{
          marginLeft: mainMarginLeft,
          marginRight: mainMarginRight,
          paddingTop: '56px',
          transition: `margin-left var(--duration-normal) var(--ease-default)`,
          minHeight: '100vh',
        }}
      >
        <div style={{
          padding: isMobile ? 'var(--space-4) var(--space-3) var(--space-24)' : 'var(--space-8) var(--space-8) var(--space-24)',
          maxWidth: '960px',
          margin: '0 auto',
          display: 'flex',
          flexDirection: 'column',
          gap: isMobile ? 'var(--space-10)' : 'var(--space-16)',
        }}>
          <div style={{
            display: 'grid',
            gridTemplateColumns: isMobile ? '1fr' : 'repeat(3, 1fr)',
            gap: 'var(--space-3)',
          }}>
            {SYSTEM_TYPE_OPTIONS.map((opt) => {
              const isActive = (project.systemType || 'off-grid') === opt.value;
              const IconComp = opt.value === 'off-grid' ? Sun : opt.value === 'hybrid' ? Zap : UtilityPole;
              return (
                <button
                  key={opt.value}
                  onClick={() => updateField('systemType', opt.value)}
                  style={{
                    display: 'flex',
                    flexDirection: isMobile ? 'row' : 'column',
                    alignItems: 'center',
                    gap: isMobile ? 'var(--space-3)' : 'var(--space-2)',
                    padding: isMobile ? 'var(--space-3) var(--space-4)' : 'var(--space-4) var(--space-3)',
                    background: isActive ? 'rgba(0, 195, 201, 0.08)' : 'rgba(255,255,255,0.03)',
                    border: isActive ? '2px solid rgba(0, 195, 201, 0.5)' : '1px solid rgba(255,255,255,0.08)',
                    borderRadius: 'var(--radius-md)',
                    cursor: 'pointer',
                    transition: 'all var(--duration-normal) var(--ease-default)',
                    textAlign: isMobile ? 'left' : 'center',
                  }}
                >
                  <IconComp size={isMobile ? 18 : 22} style={{ color: isActive ? 'var(--color-primary-500)' : 'var(--color-text-secondary)', flexShrink: 0 }} />
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                    <span style={{
                      fontFamily: 'var(--font-body)',
                      fontSize: isMobile ? 'var(--text-sm)' : 'var(--text-base)',
                      fontWeight: 'var(--weight-semibold)',
                      color: isActive ? 'var(--color-text-primary)' : 'var(--color-text-secondary)',
                    }}>
                      {opt.label}
                    </span>
                    <span style={{
                      fontFamily: 'var(--font-body)',
                      fontSize: 'var(--text-xs)',
                      color: isActive ? 'var(--color-primary-400)' : 'var(--color-text-muted)',
                      textAlign: isMobile ? 'left' : 'center',
                      lineHeight: 'var(--leading-snug)',
                    }}>
                      {opt.description}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>

          <div style={{
            background: 'rgba(255,255,255,0.03)',
            border: '1px solid rgba(255,255,255,0.06)',
            borderRadius: 'var(--radius-md)',
            overflow: 'hidden',
          }}>
            <button
              onClick={() => setNotesOpen(o => !o)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 'var(--space-2)',
                width: '100%',
                padding: 'var(--space-3) var(--space-4)',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                color: 'var(--color-text-muted)',
                fontFamily: 'var(--font-body)',
                fontSize: 'var(--text-sm)',
              }}
            >
              <StickyNote size={14} />
              <span>Project Notes</span>
              {project.notes && !notesOpen && (
                <span style={{
                  marginLeft: 'var(--space-2)',
                  width: '6px',
                  height: '6px',
                  borderRadius: 'var(--radius-full)',
                  background: 'var(--color-primary-500)',
                  flexShrink: 0,
                }} />
              )}
              <span style={{ marginLeft: 'auto' }}>
                {notesOpen ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
              </span>
            </button>
            {notesOpen && (
              <div style={{ padding: '0 var(--space-4) var(--space-4)' }}>
                <textarea
                  value={project.notes || ''}
                  onChange={(e) => updateField('notes', e.target.value)}
                  placeholder="Site notes, client preferences, installation remarks..."
                  rows={4}
                  style={{
                    width: '100%',
                    background: 'rgba(255,255,255,0.03)',
                    border: '1px solid rgba(255,255,255,0.08)',
                    borderRadius: 'var(--radius-sm)',
                    color: 'var(--color-text-primary)',
                    fontFamily: 'var(--font-body)',
                    fontSize: 'var(--text-sm)',
                    padding: 'var(--space-3)',
                    resize: 'vertical',
                    outline: 'none',
                    lineHeight: 'var(--leading-relaxed)',
                    boxSizing: 'border-box',
                  }}
                />
              </div>
            )}
          </div>

          <LoadAnalysis
            project={project}
            updateField={updateField}
            updateAppliance={updateAppliance}
            addAppliance={addAppliance}
            removeAppliance={removeAppliance}
            calculations={calculations}
            setProject={setProject}
          />

          <InverterSizing
            project={project}
            updateField={updateField}
            calculations={calculations}
            selectedInverter={selectedInverter}
            inverters={inverters}
          />

          <BatterySizing
            project={project}
            updateField={updateField}
            calculations={calculations}
            selectedBattery={selectedBattery}
            batteries={batteries}
          />

          <SolarArray
            project={project}
            calculations={calculations}
            selectedPanel={selectedPanel}
            selectedInverter={selectedInverter}
            validations={validationResults}
            updateField={updateField}
            panels={panels}
          />

          <WireSizing
            project={project}
            calculations={calculations}
            validations={validationResults}
            updateField={updateField}
          />

          <Diagram
            project={project}
            calculations={calculations}
            selectedPanel={selectedPanel}
            selectedInverter={selectedInverter}
            selectedBattery={selectedBattery}
          />

          <CostEstimation
            project={project}
            calculations={calculations}
            updateField={updateField}
          />

          <ExportSection
            project={project}
            calculations={calculations}
            selectedPanel={selectedPanel}
            selectedInverter={selectedInverter}
            selectedBattery={selectedBattery}
            isMobile={isMobile}
          />
        </div>
      </main>

      {!isDesktop && !outputOpen && (
        <button
          onClick={() => setOutputOpen(true)}
          style={{
            position: 'fixed',
            bottom: 'var(--space-4)',
            right: 'var(--space-4)',
            width: '56px',
            height: '56px',
            borderRadius: 'var(--radius-full)',
            background: 'var(--color-primary-500)',
            color: 'var(--color-text-inverse)',
            border: 'none',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: 'var(--shadow-lg)',
            zIndex: 40,
            fontSize: 'var(--text-xs)',
            fontFamily: 'var(--font-body)',
            fontWeight: 'var(--weight-bold)',
            letterSpacing: 'var(--tracking-wide)',
          }}
          title="Show System Summary"
        >
          KPI
        </button>
      )}

      {interpretOpen && (
        <InterpretModal
          text={generateInterpretation(project, calculations, selectedPanel, selectedBattery, selectedInverter)}
          onClose={() => setInterpretOpen(false)}
          projectName={project.projectName}
        />
      )}

    </div>
  );
}
