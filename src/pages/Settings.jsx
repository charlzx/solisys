import { useState, useEffect } from 'react';
import { ArrowLeft, User, Sliders, Database, Download, Upload, Trash2, Save, Plus, X, Sun, BatteryCharging, Power } from 'lucide-react';
import Button from '../components/ui/Button';
import InputField from '../components/ui/InputField';
import SelectField from '../components/ui/SelectField';
import Toggle from '../components/ui/Toggle';
import Modal from '../components/ui/Modal';
import { CURRENCY_OPTIONS, PSH_OPTIONS, SYSTEM_VOLTAGE_OPTIONS, SYSTEM_TYPE_OPTIONS, getNominalVoltage } from '../data/constants';
import { loadCustomComponents, saveCustomComponents } from '../lib/utils';

const SETTINGS_KEY = 'solisys_settings';

function loadSettings() {
  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  return {};
}

function saveSettings(settings) {
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
}

const defaultSettings = {
  userName: '',
  companyName: '',
  phone: '',
  email: '',
  defaultCurrency: 'NGN',
  defaultSystemType: 'off-grid',
  defaultSystemVoltage: '48',
  defaultPsh: '4.5',
  defaultEfficiency: '0.85',
  autoSave: true,
  confirmDelete: true,
};

export default function Settings({ onBack }) {
  const [settings, setSettings] = useState(() => ({
    ...defaultSettings,
    ...loadSettings(),
  }));
  const [saved, setSaved] = useState(true);
  const [clearModalOpen, setClearModalOpen] = useState(false);
  const [importError, setImportError] = useState('');

  const update = (key, value) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
    setSaved(false);
  };

  const handleSave = () => {
    saveSettings(settings);
    setSaved(true);
  };

  const handleExportAll = () => {
    try {
      const raw = localStorage.getItem('solarProjects');
      const projects = raw ? JSON.parse(raw) : [];
      const customPanels = localStorage.getItem('customPanels');
      const customBatteries = localStorage.getItem('customBatteries');
      const customInverters = localStorage.getItem('customInverters');

      const exportData = {
        version: '2.0',
        exportedAt: new Date().toISOString(),
        projects,
        customComponents: {
          panels: customPanels ? JSON.parse(customPanels) : [],
          batteries: customBatteries ? JSON.parse(customBatteries) : [],
          inverters: customInverters ? JSON.parse(customInverters) : [],
        },
        settings,
      };

      const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `solisys-backup-${new Date().toISOString().split('T')[0]}.json`;
      a.click();
      URL.revokeObjectURL(url);
    } catch {}
  };

  const handleImport = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = (e) => {
      const file = e.target.files?.[0];
      if (!file) return;

      if (!file.name.endsWith('.json')) {
        setImportError('Please select a .json file.');
        return;
      }

      const MAX_FILE_SIZE = 10 * 1024 * 1024;
      if (file.size > MAX_FILE_SIZE) {
        setImportError('File is too large. Maximum size is 10MB.');
        return;
      }

      if (file.size === 0) {
        setImportError('File is empty.');
        return;
      }

      const reader = new FileReader();
      reader.onerror = () => {
        setImportError('Failed to read file. Please try again.');
      };
      reader.onload = (ev) => {
        let data;
        try {
          data = JSON.parse(ev.target.result);
        } catch {
          setImportError('File is not valid JSON. Please select a Solisys backup file.');
          return;
        }

        if (!data || typeof data !== 'object') {
          setImportError('Invalid file structure. Expected a Solisys backup file.');
          return;
        }

        const hasProjects = data.projects && Array.isArray(data.projects);
        const hasComponents = data.customComponents && typeof data.customComponents === 'object';
        const hasSettings = data.settings && typeof data.settings === 'object';

        if (!hasProjects && !hasComponents && !hasSettings) {
          setImportError('This file doesn\'t contain any Solisys data (no projects, components, or settings found).');
          return;
        }

        try {
          let importedCount = 0;

          if (hasProjects) {
            const validProjects = data.projects.filter(p =>
              p && typeof p === 'object' && (p.id || p.projectName)
            );
            if (validProjects.length > 0) {
              const existing = localStorage.getItem('solarProjects');
              const existingProjects = existing ? JSON.parse(existing) : [];
              const merged = [...existingProjects, ...validProjects];
              localStorage.setItem('solarProjects', JSON.stringify(merged));
              importedCount += validProjects.length;
            }
          }

          if (hasComponents) {
            const cc = data.customComponents;
            if (Array.isArray(cc.panels) && cc.panels.length) {
              const valid = cc.panels.filter(p => p && typeof p === 'object' && p.manufacturer);
              if (valid.length) {
                const ep = localStorage.getItem('customPanels');
                const existing = ep ? JSON.parse(ep) : [];
                localStorage.setItem('customPanels', JSON.stringify([...existing, ...valid]));
                importedCount += valid.length;
              }
            }
            if (Array.isArray(cc.batteries) && cc.batteries.length) {
              const valid = cc.batteries.filter(b => b && typeof b === 'object' && b.manufacturer);
              if (valid.length) {
                const eb = localStorage.getItem('customBatteries');
                const existing = eb ? JSON.parse(eb) : [];
                localStorage.setItem('customBatteries', JSON.stringify([...existing, ...valid]));
                importedCount += valid.length;
              }
            }
            if (Array.isArray(cc.inverters) && cc.inverters.length) {
              const valid = cc.inverters.filter(i => i && typeof i === 'object' && i.manufacturer);
              if (valid.length) {
                const ei = localStorage.getItem('customInverters');
                const existing = ei ? JSON.parse(ei) : [];
                localStorage.setItem('customInverters', JSON.stringify([...existing, ...valid]));
                importedCount += valid.length;
              }
            }
          }

          if (hasSettings) {
            const allowed = ['defaultCurrency', 'defaultSystemType', 'defaultPsh', 'defaultEfficiency', 'defaultSystemVoltage'];
            const safeSettings = {};
            allowed.forEach(key => {
              if (data.settings[key] !== undefined) {
                safeSettings[key] = data.settings[key];
              }
            });
            if (Object.keys(safeSettings).length > 0) {
              setSettings((prev) => ({ ...prev, ...safeSettings }));
            }
          }

          if (importedCount === 0 && !hasSettings) {
            setImportError('No valid data found in the backup file.');
            return;
          }

          setImportError('');
          window.location.reload();
        } catch {
          setImportError('Error processing backup data. The file may be corrupted.');
        }
      };
      reader.readAsText(file);
    };
    input.click();
  };

  const handleClearAll = () => {
    localStorage.removeItem('solarProjects');
    localStorage.removeItem('customPanels');
    localStorage.removeItem('customBatteries');
    localStorage.removeItem('customInverters');
    setClearModalOpen(false);
    window.location.reload();
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'var(--color-bg-base)',
      position: 'relative',
    }}>
      <div className="dash-grid" />

      <div style={{
        position: 'relative',
        zIndex: 1,
        display: 'flex',
        justifyContent: 'center',
      }}>
        <div style={{
          width: '100%',
          maxWidth: '640px',
          padding: 'var(--space-8) var(--space-4) var(--space-12)',
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: 'var(--space-3)',
            marginBottom: 'var(--space-10)',
            paddingTop: 'var(--space-4)',
          }}>
            <Button variant="ghost" onClick={onBack}>
              <ArrowLeft size={18} />
            </Button>
            <h1 style={{
              fontFamily: 'var(--font-display)',
              fontSize: 'var(--text-xl)',
              fontWeight: 'var(--weight-medium)',
              color: 'var(--color-text-primary)',
              margin: 0,
              letterSpacing: 'var(--tracking-tight)',
            }}>
              Settings
            </h1>
            <div style={{ flex: 1 }} />
            <Button
              variant="primary"
              size="sm"
              onClick={handleSave}
              disabled={saved}
            >
              <Save size={14} />
              {saved ? 'Saved' : 'Save'}
            </Button>
          </div>

          <SettingsSection icon={<User size={16} />} title="Profile">
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 'var(--space-4)' }}>
              <InputField
                label="Your Name"
                value={settings.userName}
                onChange={(e) => update('userName', e.target.value)}
                placeholder="John Doe"
              />
              <InputField
                label="Company Name"
                value={settings.companyName}
                onChange={(e) => update('companyName', e.target.value)}
                placeholder="Solar Solutions Ltd"
              />
              <InputField
                label="Phone"
                value={settings.phone}
                onChange={(e) => update('phone', e.target.value)}
                placeholder="+234 800 000 0000"
              />
              <InputField
                label="Email"
                value={settings.email}
                onChange={(e) => update('email', e.target.value)}
                placeholder="you@example.com"
              />
            </div>
          </SettingsSection>

          <SettingsSection icon={<Sliders size={16} />} title="Default Project Settings">
            <p style={{
              fontSize: 'var(--text-sm)',
              color: 'var(--color-text-muted)',
              fontFamily: 'var(--font-body)',
              margin: '0 0 var(--space-4) 0',
            }}>
              These defaults will be applied when creating new projects.
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 'var(--space-4)' }}>
              <SelectField
                label="System Type"
                value={settings.defaultSystemType}
                onChange={(e) => update('defaultSystemType', e.target.value)}
                options={SYSTEM_TYPE_OPTIONS.map((t) => ({ label: `${t.label} — ${t.description}`, value: t.value }))}
              />
              <SelectField
                label="Currency"
                value={settings.defaultCurrency}
                onChange={(e) => update('defaultCurrency', e.target.value)}
                options={CURRENCY_OPTIONS.map((c) => ({ label: c.label, value: c.value }))}
              />
              <SelectField
                label="System Voltage"
                value={settings.defaultSystemVoltage}
                onChange={(e) => update('defaultSystemVoltage', e.target.value)}
                options={SYSTEM_VOLTAGE_OPTIONS.map((v) => ({ label: v.label, value: String(v.value) }))}
              />
              <SelectField
                label="Peak Sun Hours"
                value={settings.defaultPsh}
                onChange={(e) => update('defaultPsh', e.target.value)}
                options={PSH_OPTIONS.map((p) => ({ label: p.label, value: String(p.value) }))}
              />
              <InputField
                label="System Efficiency"
                type="number"
                value={settings.defaultEfficiency}
                onChange={(e) => update('defaultEfficiency', e.target.value)}
                unit="%"
                min={0.5}
                max={1}
                step={0.01}
              />
            </div>
          </SettingsSection>

          <SettingsSection icon={<Sliders size={16} />} title="Preferences">
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-5)' }}>
              <Toggle
                label="Auto-save projects"
                checked={settings.autoSave}
                onChange={(val) => update('autoSave', val)}
              />
              <Toggle
                label="Confirm before deleting projects"
                checked={settings.confirmDelete}
                onChange={(val) => update('confirmDelete', val)}
              />
            </div>
          </SettingsSection>

          <MyComponentsSection />

          <SettingsSection icon={<Database size={16} />} title="Data Management">
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: 'var(--space-4)',
                background: 'rgba(255,255,255,0.03)',
                borderRadius: 'var(--radius-md)',
                border: '1px solid rgba(255,255,255,0.05)',
              }}>
                <div>
                  <div style={{
                    fontSize: 'var(--text-sm)',
                    fontWeight: 'var(--weight-medium)',
                    color: 'var(--color-text-primary)',
                    fontFamily: 'var(--font-body)',
                  }}>
                    Export All Data
                  </div>
                  <div style={{
                    fontSize: 'var(--text-xs)',
                    color: 'var(--color-text-muted)',
                    fontFamily: 'var(--font-body)',
                    marginTop: '2px',
                  }}>
                    Download projects, components, and settings as JSON
                  </div>
                </div>
                <Button variant="secondary" size="sm" onClick={handleExportAll}>
                  <Download size={14} />
                  Export
                </Button>
              </div>

              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: 'var(--space-4)',
                background: 'rgba(255,255,255,0.03)',
                borderRadius: 'var(--radius-md)',
                border: '1px solid rgba(255,255,255,0.05)',
              }}>
                <div>
                  <div style={{
                    fontSize: 'var(--text-sm)',
                    fontWeight: 'var(--weight-medium)',
                    color: 'var(--color-text-primary)',
                    fontFamily: 'var(--font-body)',
                  }}>
                    Import Data
                  </div>
                  <div style={{
                    fontSize: 'var(--text-xs)',
                    color: 'var(--color-text-muted)',
                    fontFamily: 'var(--font-body)',
                    marginTop: '2px',
                  }}>
                    Restore from a Solisys backup file
                  </div>
                  {importError && (
                    <div style={{
                      fontSize: 'var(--text-xs)',
                      color: 'var(--color-error)',
                      marginTop: 'var(--space-1)',
                    }}>
                      {importError}
                    </div>
                  )}
                </div>
                <Button variant="secondary" size="sm" onClick={handleImport}>
                  <Upload size={14} />
                  Import
                </Button>
              </div>

              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: 'var(--space-4)',
                background: 'rgba(239, 68, 68, 0.03)',
                borderRadius: 'var(--radius-md)',
                border: '1px solid rgba(239, 68, 68, 0.1)',
              }}>
                <div>
                  <div style={{
                    fontSize: 'var(--text-sm)',
                    fontWeight: 'var(--weight-medium)',
                    color: 'var(--color-error)',
                    fontFamily: 'var(--font-body)',
                  }}>
                    Clear All Data
                  </div>
                  <div style={{
                    fontSize: 'var(--text-xs)',
                    color: 'var(--color-text-muted)',
                    fontFamily: 'var(--font-body)',
                    marginTop: '2px',
                  }}>
                    Permanently delete all projects and custom components
                  </div>
                </div>
                <Button variant="danger" size="sm" onClick={() => setClearModalOpen(true)}>
                  <Trash2 size={14} />
                  Clear
                </Button>
              </div>
            </div>
          </SettingsSection>

          <div style={{
            marginTop: 'var(--space-12)',
            padding: 'var(--space-6)',
            textAlign: 'center',
          }}>
            <span style={{
              fontSize: '11px',
              color: 'var(--color-text-muted)',
              fontFamily: 'var(--font-body)',
            }}>
              Solisys v2.0 — Solar System Design Platform
            </span>
          </div>
        </div>
      </div>

      <Modal
        isOpen={clearModalOpen}
        onClose={() => setClearModalOpen(false)}
        title="Clear All Data"
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
          <p style={{
            fontSize: 'var(--text-sm)',
            color: 'var(--color-text-secondary)',
            fontFamily: 'var(--font-body)',
            margin: 0,
            lineHeight: 'var(--leading-loose)',
          }}>
            This will permanently delete all projects, custom components, and reset the application. This action cannot be undone.
          </p>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 'var(--space-3)' }}>
            <Button variant="secondary" onClick={() => setClearModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="danger" onClick={handleClearAll}>
              Delete Everything
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

function SettingsSection({ icon, title, children }) {
  return (
    <div style={{
      marginBottom: 'var(--space-8)',
    }}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: 'var(--space-3)',
        marginBottom: 'var(--space-5)',
      }}>
        <div style={{
          width: '28px',
          height: '28px',
          borderRadius: 'var(--radius-sm)',
          background: 'rgba(0, 195, 201, 0.1)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'var(--color-primary-500)',
          flexShrink: 0,
        }}>
          {icon}
        </div>
        <h2 style={{
          fontSize: 'var(--text-base)',
          fontWeight: 'var(--weight-medium)',
          color: 'var(--color-text-primary)',
          fontFamily: 'var(--font-body)',
          margin: 0,
        }}>
          {title}
        </h2>
      </div>
      <div style={{
        background: 'rgba(255,255,255,0.03)',
        border: '1px solid rgba(255,255,255,0.05)',
        borderRadius: 'var(--radius-lg)',
        padding: 'var(--space-6)',
      }}>
        {children}
      </div>
    </div>
  );
}

const COMPONENT_TABS = [
  { key: 'panels', label: 'Solar Panels', icon: <Sun size={14} /> },
  { key: 'batteries', label: 'Batteries', icon: <BatteryCharging size={14} /> },
  { key: 'inverters', label: 'Inverters', icon: <Power size={14} /> },
];

const PANEL_FIELDS = [
  { key: 'manufacturer', label: 'Manufacturer', type: 'text', placeholder: 'e.g. JA Solar' },
  { key: 'model', label: 'Model', type: 'text', placeholder: 'e.g. JAM72S30-545' },
  { key: 'type', label: 'Type', type: 'select', options: ['Mono', 'Poly', 'HJT'] },
  { key: 'pmax', label: 'Pmax', type: 'number', unit: 'W', placeholder: '545' },
  { key: 'voc', label: 'Voc', type: 'number', unit: 'V', placeholder: '49.62' },
  { key: 'vmp', label: 'Vmp', type: 'number', unit: 'V', placeholder: '41.34' },
  { key: 'isc', label: 'Isc', type: 'number', unit: 'A', placeholder: '13.98' },
  { key: 'imp', label: 'Imp', type: 'number', unit: 'A', placeholder: '13.19' },
  { key: 'tempCoeffPmax', label: 'Temp Coeff Pmax', type: 'number', unit: '%/°C', placeholder: '-0.35' },
  { key: 'tempCoeffVoc', label: 'Temp Coeff Voc', type: 'number', unit: '%/°C', placeholder: '-0.28' },
];

const BATTERY_FIELDS = [
  { key: 'manufacturer', label: 'Manufacturer', type: 'text', placeholder: 'e.g. Felicity' },
  { key: 'model', label: 'Model', type: 'text', placeholder: 'e.g. FL-LFP-48200' },
  { key: 'chemistry', label: 'Chemistry', type: 'select', options: ['LiFePO4', 'Lead-Acid', 'Li-ion', 'Gel', 'Tubular'] },
  { key: 'voltageV', label: 'Actual Voltage', type: 'number', unit: 'V', placeholder: '51.2' },
  { key: 'capacityUnit', label: 'Capacity Unit', type: 'select', options: ['kWh', 'Ah'] },
  { key: 'capacityKwh', label: 'Capacity (kWh)', type: 'number', unit: 'kWh', placeholder: '5', showIf: (fd) => fd.capacityUnit === 'kWh' },
  { key: 'capacityAh', label: 'Capacity (Ah)', type: 'number', unit: 'Ah', placeholder: '200', showIf: (fd) => fd.capacityUnit !== 'kWh' },
  { key: 'maxDod', label: 'Max DoD', type: 'number', unit: '', placeholder: '0.95' },
  { key: 'cycleLife', label: 'Cycle Life', type: 'number', unit: 'cycles', placeholder: '6000' },
];

const INVERTER_FIELDS = [
  { key: 'manufacturer', label: 'Manufacturer', type: 'text', placeholder: 'e.g. Deye' },
  { key: 'model', label: 'Model', type: 'text', placeholder: 'e.g. SUN-8K-SG01LP1' },
  { key: 'type', label: 'Type', type: 'select', options: ['Off-Grid', 'Hybrid'] },
  { key: 'ratedKva', label: 'Rated kVA', type: 'number', unit: 'kVA', placeholder: '8' },
  { key: 'ratedKw', label: 'Rated kW', type: 'number', unit: 'kW', placeholder: '8' },
  { key: 'efficiency', label: 'Efficiency', type: 'number', unit: '%', placeholder: '97' },
  { key: 'maxPvInputV', label: 'Max PV Input Voltage', type: 'number', unit: 'V', placeholder: '500' },
  { key: 'mpptRangeMin', label: 'MPPT Range Min', type: 'number', unit: 'V', placeholder: '120' },
  { key: 'mpptRangeMax', label: 'MPPT Range Max', type: 'number', unit: 'V', placeholder: '450' },
  { key: 'maxPvInputCurrentA', label: 'Max PV Input Current', type: 'number', unit: 'A', placeholder: '16' },
  { key: 'outputVoltageV', label: 'Output Voltage', type: 'number', unit: 'V', placeholder: '230' },
  { key: 'outputFrequencyHz', label: 'Output Frequency', type: 'number', unit: 'Hz', placeholder: '50' },
  { key: 'hasBuiltInMppt', label: 'Built-in MPPT', type: 'toggle' },
];

const FIELDS_MAP = {
  panels: PANEL_FIELDS,
  batteries: BATTERY_FIELDS,
  inverters: INVERTER_FIELDS,
};

const STORAGE_MAP = {
  panels: 'Panels',
  batteries: 'Batteries',
  inverters: 'Inverters',
};

const DEFAULT_VALUES = {
  panels: {},
  batteries: { capacityUnit: 'Ah' },
  inverters: { outputVoltageV: 230, outputFrequencyHz: 50, hasBuiltInMppt: false },
};

function MyComponentsSection() {
  const [activeTab, setActiveTab] = useState('panels');
  const [components, setComponents] = useState({
    panels: loadCustomComponents('Panels'),
    batteries: loadCustomComponents('Batteries'),
    inverters: loadCustomComponents('Inverters'),
  });
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({});

  const fields = FIELDS_MAP[activeTab];
  const items = components[activeTab];

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setShowForm(false);
    setFormData({});
  };

  const handleAdd = () => {
    setFormData({ ...DEFAULT_VALUES[activeTab] });
    setShowForm(true);
  };

  const handleCancel = () => {
    setShowForm(false);
    setFormData({});
  };

  const handleSave = () => {
    const newComponent = {
      id: `custom_${Date.now()}`,
      isCustom: true,
    };
    fields.forEach(f => {
      let val = formData[f.key];
      if (f.type === 'number') {
        val = Number(val) || 0;
        if (!isFinite(val)) val = 0;
        if (val < -9999999) val = -9999999;
        if (val > 9999999) val = 9999999;
      } else if (f.type === 'text') {
        val = String(val || '').replace(/<[^>]*>/g, '').trim().slice(0, 200);
      } else if (f.type === 'select') {
        const allowed = f.options || [];
        if (!allowed.includes(val)) val = allowed[0] || '';
      } else if (f.type === 'toggle') {
        val = !!formData[f.key];
      }
      newComponent[f.key] = val;
    });

    if (activeTab === 'batteries') {
      const voltageV = Number(newComponent.voltageV) || 0;
      newComponent.nominalVoltage = getNominalVoltage(voltageV);

      if (newComponent.capacityUnit === 'kWh') {
        const kwh = Number(newComponent.capacityKwh) || 0;
        newComponent.capacityAh = voltageV > 0 ? Math.round((kwh * 1000) / voltageV * 100) / 100 : 0;
      } else {
        const ah = Number(newComponent.capacityAh) || 0;
        newComponent.capacityKwh = voltageV > 0 ? Math.round(ah * voltageV / 1000 * 100) / 100 : 0;
      }
    }

    const storageKey = STORAGE_MAP[activeTab];
    const updated = [...items, newComponent];
    saveCustomComponents(storageKey, updated);
    setComponents(prev => ({ ...prev, [activeTab]: updated }));
    setShowForm(false);
    setFormData({});
  };

  const handleDelete = (id) => {
    const storageKey = STORAGE_MAP[activeTab];
    const updated = items.filter(c => c.id !== id);
    saveCustomComponents(storageKey, updated);
    setComponents(prev => ({ ...prev, [activeTab]: updated }));
  };

  const isFormValid = () => {
    return fields
      .filter(f => f.type !== 'toggle')
      .filter(f => !f.showIf || f.showIf(formData))
      .every(f => {
        const val = formData[f.key];
        if (f.type === 'number') return val !== undefined && val !== '' && !isNaN(val);
        return val !== undefined && val !== '';
      });
  };

  const formatComponentLabel = (item) => {
    if (activeTab === 'panels') return `${item.manufacturer} ${item.model} — ${item.pmax}W ${item.type || ''}`;
    if (activeTab === 'batteries') {
      const cap = item.capacityUnit === 'kWh' ? `${item.capacityKwh}kWh` : `${item.capacityAh}Ah`;
      return `${item.manufacturer} ${item.model} — ${cap}, ${item.voltageV}V`;
    }
    return `${item.manufacturer} ${item.model} — ${item.ratedKva} kVA ${item.type || ''}`;
  };

  return (
    <SettingsSection icon={<Database size={16} />} title="My Components">
      <div style={{ display: 'flex', gap: 'var(--space-2)', marginBottom: 'var(--space-5)', flexWrap: 'wrap' }}>
        {COMPONENT_TABS.map(tab => (
          <button
            key={tab.key}
            onClick={() => handleTabChange(tab.key)}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 'var(--space-2)',
              padding: 'var(--space-2) var(--space-4)',
              borderRadius: 'var(--radius-md)',
              border: activeTab === tab.key ? '1px solid var(--color-primary-500)' : '1px solid rgba(255,255,255,0.1)',
              background: activeTab === tab.key ? 'rgba(0, 195, 201, 0.1)' : 'rgba(255,255,255,0.03)',
              color: activeTab === tab.key ? 'var(--color-primary-400)' : 'var(--color-text-secondary)',
              fontFamily: 'var(--font-body)',
              fontSize: 'var(--text-sm)',
              fontWeight: 'var(--weight-medium)',
              cursor: 'pointer',
              transition: 'all var(--duration-normal) var(--ease-default)',
            }}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>

      {items.length === 0 && !showForm && (
        <div style={{
          textAlign: 'center',
          padding: 'var(--space-8) var(--space-4)',
          color: 'var(--color-text-muted)',
          fontSize: 'var(--text-sm)',
          fontFamily: 'var(--font-body)',
        }}>
          No {COMPONENT_TABS.find(t => t.key === activeTab)?.label.toLowerCase()} added yet.
        </div>
      )}

      {items.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)', marginBottom: showForm ? 'var(--space-5)' : 0 }}>
          {items.map(item => (
            <div
              key={item.id}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: 'var(--space-3)',
                padding: 'var(--space-3) var(--space-4)',
                background: 'rgba(255,255,255,0.03)',
                borderRadius: 'var(--radius-md)',
                border: '1px solid rgba(255,255,255,0.05)',
              }}
            >
              <div style={{
                fontSize: 'var(--text-sm)',
                color: 'var(--color-text-primary)',
                fontFamily: 'var(--font-body)',
                flex: 1,
                minWidth: 0,
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}>
                {formatComponentLabel(item)}
              </div>
              <Button variant="icon-only" onClick={() => handleDelete(item.id)} title="Delete">
                <Trash2 size={14} style={{ color: 'var(--color-error)' }} />
              </Button>
            </div>
          ))}
        </div>
      )}

      {showForm && (
        <div style={{
          padding: 'var(--space-5)',
          background: 'rgba(255,255,255,0.02)',
          borderRadius: 'var(--radius-md)',
          border: '1px solid rgba(255,255,255,0.08)',
          marginTop: items.length > 0 ? 0 : undefined,
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: 'var(--space-4)',
          }}>
            <span style={{
              fontSize: 'var(--text-sm)',
              fontWeight: 'var(--weight-medium)',
              color: 'var(--color-text-primary)',
              fontFamily: 'var(--font-body)',
            }}>
              Add New {activeTab === 'panels' ? 'Panel' : activeTab === 'batteries' ? 'Battery' : 'Inverter'}
            </span>
            <Button variant="icon-only" onClick={handleCancel} title="Cancel">
              <X size={16} />
            </Button>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 'var(--space-4)' }}>
            {fields.filter(f => !f.showIf || f.showIf(formData)).map(field => {
              if (field.type === 'select') {
                return (
                  <SelectField
                    key={field.key}
                    label={field.label}
                    value={formData[field.key] || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, [field.key]: e.target.value }))}
                    options={field.options.map(o => ({ label: o, value: o }))}
                    placeholder={`Select ${field.label}`}
                  />
                );
              }
              if (field.type === 'toggle') {
                return (
                  <div key={field.key} style={{ display: 'flex', alignItems: 'flex-end', paddingBottom: 'var(--space-2)' }}>
                    <Toggle
                      label={field.label}
                      checked={!!formData[field.key]}
                      onChange={(val) => setFormData(prev => ({ ...prev, [field.key]: val }))}
                    />
                  </div>
                );
              }
              return (
                <InputField
                  key={field.key}
                  label={field.label}
                  type={field.type}
                  value={formData[field.key] ?? ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, [field.key]: e.target.value }))}
                  unit={field.unit}
                  placeholder={field.placeholder}
                  step={field.type === 'number' ? 'any' : undefined}
                />
              );
            })}
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 'var(--space-3)', marginTop: 'var(--space-5)' }}>
            <Button variant="secondary" size="sm" onClick={handleCancel}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" onClick={handleSave} disabled={!isFormValid()}>
              <Save size={14} />
              Save Component
            </Button>
          </div>
        </div>
      )}

      {!showForm && (
        <div style={{ marginTop: items.length > 0 ? 'var(--space-4)' : 0 }}>
          <Button variant="secondary" size="sm" onClick={handleAdd}>
            <Plus size={14} />
            Add {activeTab === 'panels' ? 'Panel' : activeTab === 'batteries' ? 'Battery' : 'Inverter'}
          </Button>
        </div>
      )}
    </SettingsSection>
  );
}
