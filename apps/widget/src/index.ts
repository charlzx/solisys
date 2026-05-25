import { calculateFullSystem, PSH_CITIES } from '@solisys/calc';
import styleText from './widget.css?inline';

// Plain language preset appliances
const SIMPLE_APPLIANCES = [
  { name: 'LED Lights', wattage: 10, hours: 6, icon: '💡', category: 'Lighting' },
  { name: 'Ceiling Fan', wattage: 75, hours: 8, icon: '🌀', category: 'Cooling' },
  { name: 'Refrigerator', wattage: 150, hours: 24, icon: '❄️', category: 'Kitchen' },
  { name: 'TV (LED 40")', wattage: 80, hours: 5, icon: '📺', category: 'Entertainment' },
  { name: 'Laptop / Charger', wattage: 65, hours: 4, icon: '💻', category: 'Office' },
  { name: 'Air Conditioner', wattage: 1200, hours: 6, icon: '🍃', category: 'Cooling' },
  { name: 'Washing Machine', wattage: 500, hours: 1, icon: '🧺', category: 'Kitchen' },
  { name: 'Water Pump', wattage: 750, hours: 2, icon: '🚰', category: 'Workshop' },
  { name: 'Microwave', wattage: 1000, hours: 0.5, icon: '🔥', category: 'Kitchen' },
];

const CATEGORIES = ['All', 'Lighting', 'Cooling', 'Kitchen', 'Entertainment', 'Office', 'Workshop'];

// Helper to format currency
function formatVal(val: number, decimals = 0): string {
  return val.toLocaleString('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
}

export class SolisysSolarWidget extends HTMLElement {
  private shadow: ShadowRoot;
  private siteId = 'free';
  private mode: 'simple' | 'pro' = 'simple';
  private theme: 'light' | 'dark' | 'auto' = 'light';
  private accentColor = '';
  private companyName = '';
  private logoUrl = '';
  private showBranding = true;
  private leadCapture = false;
  private leadWebhook = '';
  private ctaText = 'Get a free quote';
  private defaultPsh: number | null = null;
  private defaultSystemType: string | null = null;
  private currency = 'USD';

  // Sizing Wizard State
  private step = 1;
  private activeCategory = 'All';
  private appliances: Array<{ name: string; icon: string; wattage: number; quantity: number; hours: number }> = [];
  private knowUsage = false;
  private directKwh = 5.0;
  private directPeak = 1500;
  
  // Selections
  private selectedCity = '';
  private peakSunHours = 5.0;
  private customPshMode = false;
  private backupHours = 12;
  private batteryTier: 'budget' | 'standard' | 'premium' = 'premium';
  private systemType = 'hybrid'; // off-grid, hybrid, grid-tied
  private customAccentLoaded = false;
  
  // Pro Mode advanced overrides
  private systemVoltage = 48;
  private systemEfficiency = 0.82;
  private panelWattage = 450;
  private controllerType: 'mppt' | 'pwm' = 'mppt';
  private wireSizingEnabled = false;
  private costEstimationEnabled = true;
  
  // lead form state
  private leadSubmitted = false;

  constructor() {
    super();
    this.shadow = this.attachShadow({ mode: 'open' });
  }

  static get observedAttributes() {
    return [
      'data-site-id',
      'data-mode',
      'data-theme',
      'data-accent-color',
      'data-company-name',
      'data-logo-url',
      'data-show-branding',
      'data-lead-capture',
      'data-lead-webhook',
      'data-cta-text',
      'data-default-psh',
      'data-default-system-type',
      'data-currency'
    ];
  }

  attributeChangedCallback(name: string, oldValue: string, newValue: string) {
    if (oldValue === newValue) return;
    this.readAttributes();
    if (this.isConnected) {
      this.render();
    }
  }

  connectedCallback() {
    this.readAttributes();
    this.validateDomain().then(() => {
      this.render();
    });
  }

  private readAttributes() {
    this.siteId = this.getAttribute('data-site-id') || 'free';
    this.mode = (this.getAttribute('data-mode') || 'simple') === 'pro' ? 'pro' : 'simple';
    this.theme = (this.getAttribute('data-theme') || 'light') as 'light' | 'dark' | 'auto';
    this.accentColor = this.getAttribute('data-accent-color') || '';
    this.companyName = this.getAttribute('data-company-name') || '';
    this.logoUrl = this.getAttribute('data-logo-url') || '';
    this.showBranding = this.getAttribute('data-show-branding') !== 'false';
    this.leadCapture = this.getAttribute('data-lead-capture') === 'true';
    this.leadWebhook = this.getAttribute('data-lead-webhook') || '';
    this.ctaText = this.getAttribute('data-cta-text') || 'Get a free quote';
    this.currency = this.getAttribute('data-currency') || 'USD';

    const pshAttr = this.getAttribute('data-default-psh');
    this.defaultPsh = pshAttr ? parseFloat(pshAttr) : null;
    if (this.defaultPsh !== null) {
      this.peakSunHours = this.defaultPsh;
    }

    const typeAttr = this.getAttribute('data-default-system-type');
    this.defaultSystemType = typeAttr || null;
    if (this.defaultSystemType) {
      this.systemType = this.defaultSystemType;
    }
    
    // Resolve theme auto
    if (this.theme === 'auto' && typeof window !== 'undefined') {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      this.setAttribute('data-theme', prefersDark ? 'dark' : 'light');
    } else {
      this.setAttribute('data-theme', this.theme);
    }
  }

  private async validateDomain(): Promise<boolean> {
    if (this.siteId === 'free') return true;

    try {
      // Mock validation that succeeds automatically locally but logs context
      console.log(`[Solisys Widget] Validating domain for site: ${this.siteId} on host: ${window.location.hostname}`);
      return true;
    } catch {
      return true; // fail gracefully to ensure embeds work
    }
  }

  private triggerCallback(eventName: string, payload: unknown) {
    const event = new CustomEvent(eventName, {
      detail: payload,
      bubbles: true,
      composed: true
    });
    this.dispatchEvent(event);
    
    // Fire on global namespace if available
    const w = window as any;
    if (w.SolisysWidget && typeof w.SolisysWidget[`on${eventName.charAt(0).toUpperCase() + eventName.slice(1)}`] === 'function') {
      w.SolisysWidget[`on${eventName.charAt(0).toUpperCase() + eventName.slice(1)}`](payload);
    }
  }

  private applyCustomAccent() {
    if (this.accentColor && !this.customAccentLoaded) {
      const style = document.createElement('style');
      style.textContent = `
        :host {
          --widget-accent: ${this.accentColor} !important;
          --widget-accent-hover: color-mix(in srgb, ${this.accentColor} 80%, black) !important;
          --widget-accent-surface: color-mix(in srgb, ${this.accentColor} 10%, transparent) !important;
        }
      `;
      this.shadow.appendChild(style);
      this.customAccentLoaded = true;
    }
  }

  private get totalDailyKwh(): number {
    if (this.knowUsage) return this.directKwh;
    const wh = this.appliances.reduce((sum, item) => sum + (item.wattage * item.quantity * item.hours), 0);
    return wh / 1000;
  }

  private get estimatedPeakLoadW(): number {
    if (this.knowUsage) return this.directPeak;
    // Sum of all loaded appliances that run concurrently
    return this.appliances.reduce((sum, item) => sum + (item.wattage * item.quantity), 0);
  }

  // Electrical formula processing using bundled calc package
  private get computedResults() {
    try {
      // Abstract DoD and voltage based on widget specifications
      let dod = 0.9; // Premium Lithium
      if (this.batteryTier === 'budget') dod = 0.5; // Lead-Acid
      if (this.batteryTier === 'standard') dod = 0.7; // Tubular

      // Auto-configured Safe System Voltages
      let sysVolt = 12;
      if (this.mode === 'pro') {
        sysVolt = this.systemVoltage;
      } else {
        sysVolt = this.totalDailyKwh >= 2.0 ? 48 : 24;
      }

      const input = {
        dailyEnergyKwh: this.totalDailyKwh,
        peakLoadW: this.estimatedPeakLoadW,
        daysOfAutonomy: this.backupHours / 24,
        batteryDoD: dod,
        systemVoltageV: sysVolt,
        batteryVoltageV: 12,
        batteryCapacityAh: 200,
        peakSunHours: this.peakSunHours,
        systemEfficiencyPct: this.mode === 'pro' ? this.systemEfficiency : 0.82,
        panelWattageW: this.panelWattage,
      };

      return calculateFullSystem(input);
    } catch (e) {
      console.error('[Solisys Calc error]', e);
      return null;
    }
  }

  private handleAddAppliance(name: string) {
    const preset = SIMPLE_APPLIANCES.find(a => a.name === name);
    if (!preset) return;

    const existing = this.appliances.find(a => a.name === name);
    if (existing) {
      existing.quantity += 1;
    } else {
      this.appliances.push({
        name: preset.name,
        icon: preset.icon,
        wattage: preset.wattage,
        quantity: 1,
        hours: preset.hours
      });
    }
    this.render();
  }

  private handleQtyChange(name: string, delta: number) {
    const item = this.appliances.find(a => a.name === name);
    if (!item) return;

    item.quantity += delta;
    if (item.quantity <= 0) {
      this.appliances = this.appliances.filter(a => a.name !== name);
    }
    this.render();
  }

  private handleHoursChange(name: string, delta: number) {
    const item = this.appliances.find(a => a.name === name);
    if (!item) return;

    item.hours = Math.max(0.5, Math.min(24, item.hours + delta));
    this.render();
  }

  private handleRemoveAppliance(name: string) {
    this.appliances = this.appliances.filter(a => a.name !== name);
    this.render();
  }

  private handleLeadSubmit(e: Event) {
    e.preventDefault();
    const form = e.target as HTMLFormElement;
    const formData = new FormData(form);
    
    const lead = {
      name: formData.get('name') as string,
      phone: formData.get('phone') as string,
      email: formData.get('email') as string,
      message: formData.get('message') as string,
    };

    const res = this.computedResults;
    const payload = {
      event: 'lead_submitted',
      timestamp: new Date().toISOString(),
      siteId: this.siteId,
      lead,
      result: {
        mode: this.mode,
        systemSizeKva: res?.inverter.recommendedKva,
        panelCount: res?.solar.numberOfPanels,
        batteryCount: res?.battery.totalBatteries,
        batteryTier: this.batteryTier,
        estimatedCost: this.costEstimationEnabled ? this.calculateMarketEstimate(res) : undefined,
        currency: this.currency,
        dailyEnergyKwh: this.totalDailyKwh,
        systemType: this.systemType,
        city: this.selectedCity || 'Custom Location',
        psh: this.peakSunHours
      }
    };

    // browser direct post to customer lead webhook
    if (this.leadWebhook) {
      fetch(this.leadWebhook, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      }).catch(err => console.error('[Widget webhook post failed]', err));
    }

    this.triggerCallback('leadSubmit', { lead, result: res });
    this.leadSubmitted = true;
    this.render();
  }

  private calculateMarketEstimate(res: any): number {
    if (!res) return 0;
    // Standard baseline sizing pricing model:
    // Panel $180, Battery $220, Inverter $650, installation/accessories markup
    const panelCost = res.solar.numberOfPanels * 180;
    
    let batteryUnitCost = 150; // Lead-Acid
    if (this.batteryTier === 'standard') batteryUnitCost = 280; // Tubular
    if (this.batteryTier === 'premium') batteryUnitCost = 600; // Lithium LFP
    
    const batteryCost = res.battery.totalBatteries * batteryUnitCost;
    const inverterCost = res.inverter.recommendedKva * 550;
    
    let baseUsd = (panelCost + batteryCost + inverterCost + 400) * 1.15;
    
    if (this.currency === 'NGN') {
      return baseUsd * 1500; // NGN local market peg
    }
    return baseUsd;
  }

  private handlePrintPDF() {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;
    
    const res = this.computedResults;
    if (!res) return;

    const formattedCost = this.costEstimationEnabled 
      ? `${this.currency} ${formatVal(this.calculateMarketEstimate(res))}`
      : 'Contact installer for pricing';

    printWindow.document.write(`
      <html>
        <head>
          <title>Solisys Solar Sizing Proposal</title>
          <style>
            body { font-family: system-ui, sans-serif; color: #0a1f0d; padding: 40px; }
            .header { border-bottom: 2px solid #5e9e28; padding-bottom: 20px; margin-bottom: 30px; }
            .title { font-size: 24px; font-weight: bold; margin: 0; }
            .subtitle { font-size: 14px; color: #4a5c4e; }
            .kpi-row { display: flex; gap: 20px; margin: 30px 0; }
            .kpi-box { flex: 1; padding: 20px; border: 1px solid #c2d4c4; border-radius: 8px; background: #f9fafb; }
            .kpi-label { font-size: 11px; text-transform: uppercase; color: #7d9b82; font-weight: bold; }
            .kpi-val { font-size: 24px; font-weight: 800; color: #5e9e28; margin: 5px 0; }
            .desc { font-size: 15px; line-height: 1.6; margin-bottom: 30px; }
            .footer { border-top: 1px solid #c2d4c4; padding-top: 20px; margin-top: 40px; font-size: 12px; color: #7d9b82; text-align: center; }
          </style>
        </head>
        <body>
          <div class="header">
            <div class="title">${this.companyName || 'Solisys Solar Proposal'}</div>
            <div class="subtitle">Generated for client on ${new Date().toLocaleDateString()}</div>
          </div>
          <div class="desc">
            A recommended system sizing of <strong>${res.inverter.recommendedKva} kVA</strong> system 
            for custom energy requirements of <strong>${formatVal(this.totalDailyKwh, 2)} kWh / day</strong>.
            This incorporates <strong>${res.solar.numberOfPanels} solar panels</strong> (${this.panelWattage}W each) 
            coupled with <strong>${res.battery.totalBatteries} batteries</strong> to support up to 
            <strong>${this.backupHours} hours</strong> of autonomous backups.
            <br/><br/>
            <strong>Market Estimate:</strong> ${formattedCost}
          </div>
          <div class="kpi-row">
            <div class="kpi-box">
              <div class="kpi-label">Inverter Size</div>
              <div class="kpi-val">${res.inverter.recommendedKva} kVA</div>
            </div>
            <div class="kpi-box">
              <div class="kpi-label">Solar Panels</div>
              <div class="kpi-val">${res.solar.numberOfPanels} Units</div>
            </div>
            <div class="kpi-box">
              <div class="kpi-label">Batteries Required</div>
              <div class="kpi-val">${res.battery.totalBatteries} Units</div>
            </div>
          </div>
          <div class="footer">
            Powered by Solisys Sizing Engine &copy; ${new Date().getFullYear()}
          </div>
        </body>
      </html>
    `);
    
    printWindow.document.close();
    printWindow.print();
  }

  private handleWhatsAppShare() {
    const res = this.computedResults;
    if (!res) return;
    const cost = this.costEstimationEnabled ? `\n- *Estimated Cost*: ${this.currency} ${formatVal(this.calculateMarketEstimate(res))}` : '';
    const text = `☀️ *Solisys Solar Sizing Summary* ☀️\n\nHere are my recommended details:\n- *Solar Array Size*: ${formatVal(res.solar.actualArrayKwp, 2)} kW\n- *Panel Count*: ${res.solar.numberOfPanels} panels\n- *Battery Count*: ${res.battery.totalBatteries} batteries\n- *Inverter Sizing*: ${res.inverter.recommendedKva} kVA${cost}\n\nBuild yours at Solisys.dev!`;
    const url = `https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
  }

  private render() {
    // Inject dynamic CSS once
    if (!this.shadow.querySelector('style')) {
      const style = document.createElement('style');
      style.textContent = styleText;
      this.shadow.appendChild(style);
    }
    
    this.applyCustomAccent();

    // Remove old wrapper
    const oldWrapper = this.shadow.querySelector('.widget-container');
    if (oldWrapper) oldWrapper.remove();

    const wrapper = document.createElement('div');
    wrapper.className = 'widget-container';

    // RENDER HEADER
    const header = document.createElement('div');
    header.className = 'widget-header';
    header.innerHTML = `
      <div class="widget-logo-area">
        ${this.logoUrl ? `<img class="widget-logo-img" src="${this.logoUrl}" alt="${this.companyName}"/>` : ''}
        <span class="widget-company-name">${this.companyName || 'Solisys Calculator'}</span>
      </div>
      <div class="widget-mode-badge">${this.mode} mode</div>
    `;
    wrapper.appendChild(header);

    // RENDER STEP PROGRESS
    if (this.step <= 5) {
      const progress = document.createElement('div');
      progress.className = 'step-progress-bar';
      for (let i = 1; i <= 5; i++) {
        const dot = document.createElement('div');
        dot.className = `progress-dot ${i === this.step ? 'active' : i < this.step ? 'completed' : ''}`;
        progress.appendChild(dot);
      }
      wrapper.appendChild(progress);
    }

    // RENDER CONTENT BY STEP
    const stepContent = document.createElement('div');
    stepContent.className = 'step-content';

    if (this.step === 1) {
      this.renderStep1(stepContent);
    } else if (this.step === 2) {
      this.renderStep2(stepContent);
    } else if (this.step === 3) {
      this.renderStep3(stepContent);
    } else if (this.step === 4) {
      this.renderStep4(stepContent);
    } else if (this.step === 5) {
      this.renderStep5(stepContent);
    } else if (this.step === 6) {
      this.renderResults(stepContent);
    }

    wrapper.appendChild(stepContent);

    // RENDER ACTIONS BAR
    if (this.step <= 5) {
      const actions = document.createElement('div');
      actions.className = 'actions-bar';
      
      const backBtn = document.createElement('button');
      backBtn.className = 'btn btn-secondary';
      backBtn.disabled = this.step === 1;
      backBtn.innerHTML = `Back`;
      backBtn.addEventListener('click', () => {
        this.step = Math.max(1, this.step - 1);
        this.render();
      });

      const nextBtn = document.createElement('button');
      nextBtn.className = 'btn btn-primary';
      nextBtn.disabled = this.totalDailyKwh === 0;
      nextBtn.innerHTML = this.step === 5 ? `See Results` : `Continue`;
      nextBtn.addEventListener('click', () => {
        if (this.step === 2 && this.defaultPsh !== null) {
          // Skip location step if defaultPsh exists
          this.step += 1;
        }
        if (this.step === 5 && this.defaultSystemType) {
          // Skip grid status step
          this.step = 6;
        } else {
          this.step += 1;
        }
        this.triggerCallback('stepChange', { step: this.step, totalSteps: 6 });
        this.render();
      });

      actions.appendChild(backBtn);
      actions.appendChild(nextBtn);
      wrapper.appendChild(actions);
    }

    // BRANDING FOOTER
    if (this.showBranding) {
      const footer = document.createElement('div');
      footer.className = 'powered-by-footer';
      footer.innerHTML = `Powered by <a class="powered-by-link" href="https://solisys.dev" target="_blank">Solisys</a>`;
      wrapper.appendChild(footer);
    }

    this.shadow.appendChild(wrapper);
  }

  // STEP 1 RENDER: APPLIANCES OR DIRECT KWH
  private renderStep1(container: HTMLElement) {
    container.innerHTML = `
      <div>
        <h3 class="step-title">1. What appliances do you want to power?</h3>
        <p class="step-subtitle">Select standard home loads or input your daily usage directly.</p>
      </div>
    `;

    if (this.knowUsage) {
      const form = document.createElement('div');
      form.className = 'selection-list';
      form.innerHTML = `
        <div class="form-group">
          <label class="form-label">Total Daily Energy Consumption</label>
          <div class="form-input-wrapper">
            <input class="form-input" type="number" id="kwh-direct-val" value="${this.directKwh}" min="0.1" step="0.1"/>
            <span class="form-input-unit">kWh / day</span>
          </div>
        </div>
        <div class="form-group">
          <label class="form-label">Estimated Peak Load Demand</label>
          <div class="form-input-wrapper">
            <input class="form-input" type="number" id="kw-peak-val" value="${this.directPeak}" min="10"/>
            <span class="form-input-unit">Watts</span>
          </div>
        </div>
      `;
      
      form.querySelector('#kwh-direct-val')?.addEventListener('input', (e) => {
        this.directKwh = parseFloat((e.target as HTMLInputElement).value) || 0;
      });
      form.querySelector('#kw-peak-val')?.addEventListener('input', (e) => {
        this.directPeak = parseInt((e.target as HTMLInputElement).value) || 0;
      });

      const toggleLink = document.createElement('button');
      toggleLink.className = 'btn btn-ghost';
      toggleLink.style.alignSelf = 'flex-start';
      toggleLink.innerHTML = `← Back to Appliance Audit`;
      toggleLink.addEventListener('click', () => {
        this.knowUsage = false;
        this.render();
      });

      container.appendChild(form);
      container.appendChild(toggleLink);
    } else {
      // Render category chips
      const chipsContainer = document.createElement('div');
      chipsContainer.className = 'category-chips';
      CATEGORIES.forEach(cat => {
        const chip = document.createElement('button');
        chip.className = `chip ${this.activeCategory === cat ? 'active' : ''}`;
        chip.innerHTML = cat;
        chip.addEventListener('click', () => {
          this.activeCategory = cat;
          this.render();
        });
        chipsContainer.appendChild(chip);
      });
      container.appendChild(chipsContainer);

      // Render appliance selection cards
      const grid = document.createElement('div');
      grid.className = 'appliance-grid';
      
      const filtered = this.activeCategory === 'All' 
        ? SIMPLE_APPLIANCES 
        : SIMPLE_APPLIANCES.filter(a => a.category === this.activeCategory);

      filtered.forEach(app => {
        const card = document.createElement('div');
        card.className = 'appliance-card';
        card.innerHTML = `
          <span class="appliance-card-icon">${app.icon}</span>
          <span class="appliance-card-name">${app.name}</span>
          <span class="appliance-card-wattage">${app.wattage}W</span>
        `;
        card.addEventListener('click', () => this.handleAddAppliance(app.name));
        grid.appendChild(card);
      });
      container.appendChild(grid);

      // Render Audit Rows if any appliances added
      if (this.appliances.length > 0) {
        const audit = document.createElement('div');
        audit.className = 'audit-list';
        this.appliances.forEach(item => {
          const row = document.createElement('div');
          row.className = 'audit-row';
          row.innerHTML = `
            <div class="audit-row-info">
              <span class="audit-row-icon">${item.icon}</span>
              <div class="audit-row-text">
                <span class="audit-row-name">${item.name}</span>
                <span class="audit-row-desc">${item.wattage}W &times; ${item.hours}h (${formatVal(item.wattage * item.quantity * item.hours)} Wh/day)</span>
              </div>
            </div>
            <div class="audit-row-controls">
              <div class="quantity-control">
                <button class="control-btn" data-action="minus-qty">&minus;</button>
                <span class="control-val">${item.quantity}</span>
                <button class="control-btn" data-action="plus-qty">&plus;</button>
              </div>
              <div class="quantity-control">
                <button class="control-btn" data-action="minus-hr">&minus;</button>
                <span class="control-val" style="min-width: 24px;">${item.hours}h</span>
                <button class="control-btn" data-action="plus-hr">&plus;</button>
              </div>
              <button class="remove-btn" data-action="remove">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
              </button>
            </div>
          `;
          
          row.querySelector('[data-action="minus-qty"]')?.addEventListener('click', () => this.handleQtyChange(item.name, -1));
          row.querySelector('[data-action="plus-qty"]')?.addEventListener('click', () => this.handleQtyChange(item.name, 1));
          row.querySelector('[data-action="minus-hr"]')?.addEventListener('click', () => this.handleHoursChange(item.name, -1));
          row.querySelector('[data-action="plus-hr"]')?.addEventListener('click', () => this.handleHoursChange(item.name, 1));
          row.querySelector('[data-action="remove"]')?.addEventListener('click', () => this.handleRemoveAppliance(item.name));
          
          audit.appendChild(row);
        });
        container.appendChild(audit);
      }

      // Link to know usage
      const toggleLink = document.createElement('button');
      toggleLink.className = 'btn btn-ghost';
      toggleLink.style.alignSelf = 'flex-start';
      toggleLink.innerHTML = `I know my daily usage (direct energy entry)`;
      toggleLink.addEventListener('click', () => {
        this.knowUsage = true;
        this.render();
      });
      container.appendChild(toggleLink);
    }

    // Energy display strip
    if (this.totalDailyKwh > 0) {
      const totalStrip = document.createElement('div');
      totalStrip.className = 'total-strip';
      totalStrip.innerHTML = `
        <span>Total Load:</span>
        <span>${formatVal(this.totalDailyKwh, 2)} kWh / day</span>
      `;
      container.appendChild(totalStrip);
    }
  }

  // STEP 2 RENDER: LOCATION / PSH
  private renderStep2(container: HTMLElement) {
    container.innerHTML = `
      <div>
        <h3 class="step-title">2. Select Your System Location</h3>
        <p class="step-subtitle">Location determines the average sunlight hours your solar array will receive daily.</p>
      </div>
    `;

    const form = document.createElement('div');
    form.className = 'selection-list';
    
    const select = document.createElement('select');
    select.className = 'form-select';
    select.innerHTML = `
      <option value="">-- Choose city location --</option>
      ${PSH_CITIES.map(c => `
        <option value="${c.name}" ${this.selectedCity === c.name ? 'selected' : ''}>
          ${c.name} — ${c.psh}h average sun
        </option>
      `).join('')}
    `;

    select.addEventListener('change', (e) => {
      const val = (e.target as HTMLSelectElement).value;
      this.selectedCity = val;
      const city = PSH_CITIES.find(c => c.name === val);
      if (city) {
        this.peakSunHours = city.psh;
        this.customPshMode = false;
        this.render();
      }
    });

    form.appendChild(select);
    container.appendChild(form);

    // Custom PSH custom checkbox disclose
    const checkboxLabel = document.createElement('label');
    checkboxLabel.className = 'consent-label';
    checkboxLabel.style.marginTop = 'var(--widget-space-2)';
    checkboxLabel.innerHTML = `
      <input type="checkbox" ${this.customPshMode ? 'checked' : ''}/>
      <span>My location is not listed (manually enter peak sun hours)</span>
    `;

    checkboxLabel.querySelector('input')?.addEventListener('change', (e) => {
      this.customPshMode = (e.target as HTMLInputElement).checked;
      this.render();
    });
    container.appendChild(checkboxLabel);

    if (this.customPshMode) {
      const pshGroup = document.createElement('div');
      pshGroup.className = 'range-slider-container';
      pshGroup.innerHTML = `
        <label class="form-label">Peak Sun Hours: <span class="slider-val-readout">${this.peakSunHours}h</span></label>
        <input class="custom-range-slider" type="range" min="2" max="8" step="0.1" value="${this.peakSunHours}"/>
      `;
      pshGroup.querySelector('input')?.addEventListener('input', (e) => {
        this.peakSunHours = parseFloat((e.target as HTMLInputElement).value);
        this.render();
      });
      container.appendChild(pshGroup);
    }
  }

  // STEP 3 RENDER: BACKUP AUTONOMY
  private renderStep3(container: HTMLElement) {
    container.innerHTML = `
      <div>
        <h3 class="step-title">3. Battery Backup Duration</h3>
        <p class="step-subtitle">How long should your batteries keep your home powered when the solar panels aren't generating?</p>
      </div>
    `;

    const slider = document.createElement('div');
    slider.className = 'range-slider-container';
    slider.innerHTML = `
      <label class="form-label">Desired Backup: <span class="slider-val-readout">${this.backupHours} Hours</span></label>
      <input class="custom-range-slider" type="range" min="4" max="72" step="2" value="${this.backupHours}"/>
      <p style="font-size: 11px; color: var(--widget-text-muted); margin: 0; line-height: 1.4;">
        ${this.backupHours <= 8 ? 'Ideal for critical nighttime devices like fans, lights, and routers.' : 
          this.backupHours <= 24 ? 'Covers standard home appliances for a complete day without sun.' : 
          'Extended backup security designed to sustain prolonged cloudy coverage.'}
      </p>
    `;

    slider.querySelector('input')?.addEventListener('input', (e) => {
      this.backupHours = parseInt((e.target as HTMLInputElement).value);
      this.render();
    });
    container.appendChild(slider);
  }

  // STEP 4 RENDER: BATTERY TYPE
  private renderStep4(container: HTMLElement) {
    container.innerHTML = `
      <div>
        <h3 class="step-title">4. Select Battery Storage Chemistry</h3>
        <p class="step-subtitle">We automatically optimize system discharge thresholds and safety settings based on your choice.</p>
      </div>
    `;

    const list = document.createElement('div');
    list.className = 'selection-list';

    const tiers = [
      { id: 'budget', title: 'Lead-Acid / Gel', desc: 'Lowest upfront capital cost, 3-5 year typical cycle lifespan. Must not be discharged past 50% depth.' },
      { id: 'standard', title: 'Tubular OpzS', desc: 'Balanced commercial standard option. 5-8 year durable cycle life, low maintenance.' },
      { id: 'premium', title: 'Lithium LFP', desc: 'Highly recommended modern standard. Outlasts others (10-15 years, 3000+ cycles). Discharges deeply up to 80% safely.', badge: 'Recommended' }
    ];

    tiers.forEach(t => {
      const card = document.createElement('button');
      card.className = `selection-card ${this.batteryTier === t.id ? 'active' : ''}`;
      card.innerHTML = `
        <div class="selection-card-title-row">
          <span class="selection-card-title">${t.title}</span>
          ${t.badge ? `<span class="selection-card-badge">${t.badge}</span>` : ''}
        </div>
        <span class="selection-card-desc">${t.desc}</span>
      `;
      card.addEventListener('click', () => {
        this.batteryTier = t.id as any;
        this.render();
      });
      list.appendChild(card);
    });

    container.appendChild(list);
  }

  // STEP 5 RENDER: POWER SITUATION / SYSTEM TYPE
  private renderStep5(container: HTMLElement) {
    container.innerHTML = `
      <div>
        <h3 class="step-title">5. Grid Connection Status</h3>
        <p class="step-subtitle">How does your location interact with the utility grid?</p>
      </div>
    `;

    const list = document.createElement('div');
    list.className = 'selection-list';

    const gridOptions = [
      { id: 'off-grid', title: 'Completely Disconnected (Off-Grid)', desc: 'Remote areas or full utility grid bypass. Solar and batteries sustain your system sole-source.' },
      { id: 'hybrid', title: 'Unreliable Grid Connection (Hybrid)', desc: 'Frequent utility outages or load shedding. Seamless automatic transition to battery storage during blackouts.' },
      { id: 'grid-tied', title: 'Lower Electric Bills (Grid-Tied)', desc: 'Stable utility power exists. SUPPLEMENT utility supply directly with solar energy to reduce expensive monthly bills.' }
    ];

    gridOptions.forEach(opt => {
      const card = document.createElement('button');
      card.className = `selection-card ${this.systemType === opt.id ? 'active' : ''}`;
      card.innerHTML = `
        <span class="selection-card-title">${opt.title}</span>
        <span class="selection-card-desc">${opt.desc}</span>
      `;
      card.addEventListener('click', () => {
        this.systemType = opt.id;
        this.render();
      });
      list.appendChild(card);
    });

    container.appendChild(list);
  }

  // STEP 6 RENDER: FINAL SIZING RESULTS & LEAD CAPTURE
  private renderResults(container: HTMLElement) {
    const res = this.computedResults;
    if (!res) {
      container.innerHTML = `<p>Error loading sizing results. Please restart wizard.</p>`;
      return;
    }

    const costValue = this.calculateMarketEstimate(res);
    const costText = this.costEstimationEnabled 
      ? `Estimated system investment is valued at <strong>${this.currency} ${formatVal(costValue)}</strong>.` 
      : '';

    container.innerHTML = `
      <div>
        <h3 class="step-title">☀️ Your Custom Sizing Results</h3>
        <p class="step-subtitle">Based on your daily power requirements, we sized the optimal solar and battery storage setup for you.</p>
      </div>

      <div class="results-card">
        <span class="results-headline">Recommended Solar Configuration</span>
        <p class="results-body">
          An actual solar array of <strong>${formatVal(res.solar.actualArrayKwp, 2)} kW</strong> coupled with 
          <strong>${res.battery.totalStorageWh ? formatVal(res.battery.totalStorageWh / 1000, 1) : 0} kWh</strong> of backup capacity.
          This provides up to <strong>${this.backupHours} hours</strong> of backup autonomies. ${costText}
        </p>
      </div>

      <div class="kpi-grid">
        <div class="kpi-card">
          <span class="kpi-label">Solar Array</span>
          <div class="kpi-value-row">
            <span class="kpi-value">${formatVal(res.solar.actualArrayKwp, 1)}</span>
            <span class="kpi-unit">kW</span>
          </div>
          <span class="kpi-subtext">= ${res.solar.numberOfPanels} panels (${this.panelWattage}W)</span>
        </div>

        <div class="kpi-card">
          <span class="kpi-label">Battery Capacity</span>
          <div class="kpi-value-row">
            <span class="kpi-value">${res.battery.totalStorageWh ? formatVal(res.battery.totalStorageWh / 1000, 1) : 0}</span>
            <span class="kpi-unit">kWh</span>
          </div>
          <span class="kpi-subtext">= ${res.battery.totalBatteries} battery units</span>
        </div>

        <div class="kpi-card">
          <span class="kpi-label">Inverter Size</span>
          <div class="kpi-value-row">
            <span class="kpi-value">${res.inverter.recommendedKva}</span>
            <span class="kpi-unit">kVA</span>
          </div>
          <span class="kpi-subtext">Peak Load: ${formatVal(res.load.estimatedPeakLoadW)}W</span>
        </div>
      </div>
    `;

    // Collapsible cost breakdown
    if (this.costEstimationEnabled) {
      const coll = document.createElement('div');
      coll.className = 'collapsible-container';
      
      const trigger = document.createElement('button');
      trigger.className = 'collapsible-trigger';
      trigger.innerHTML = `
        <span>Show Cost Breakdown Estimates</span>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="6 9 12 15 18 9"></polyline></svg>
      `;

      const content = document.createElement('div');
      content.className = 'collapsible-content';
      content.style.display = 'none';

      const panelCostEst = res.solar.numberOfPanels * 180 * (this.currency === 'NGN' ? 1500 : 1);
      const batteryCostEst = res.battery.totalBatteries * (this.batteryTier === 'premium' ? 600 : this.batteryTier === 'standard' ? 280 : 150) * (this.currency === 'NGN' ? 1500 : 1);
      const inverterCostEst = res.inverter.recommendedKva * 550 * (this.currency === 'NGN' ? 1500 : 1);
      const miscCostEst = 400 * (this.currency === 'NGN' ? 1500 : 1);

      content.innerHTML = `
        <div class="breakdown-row">
          <span class="breakdown-label">Solar Panels (${res.solar.numberOfPanels} units)</span>
          <span class="breakdown-value">${this.currency} ${formatVal(panelCostEst)}</span>
        </div>
        <div class="breakdown-row">
          <span class="breakdown-label">Battery Pack (${res.battery.totalBatteries} units)</span>
          <span class="breakdown-value">${this.currency} ${formatVal(batteryCostEst)}</span>
        </div>
        <div class="breakdown-row">
          <span class="breakdown-label">Inverter & Balance</span>
          <span class="breakdown-value">${this.currency} ${formatVal(inverterCostEst)}</span>
        </div>
        <div class="breakdown-row">
          <span class="breakdown-label">Installation & Cables</span>
          <span class="breakdown-value">${this.currency} ${formatVal(miscCostEst)}</span>
        </div>
      `;

      trigger.addEventListener('click', () => {
        content.style.display = content.style.display === 'none' ? 'flex' : 'none';
      });

      coll.appendChild(trigger);
      coll.appendChild(content);
      container.appendChild(coll);
    }

    // Lead Capture Form
    if (this.leadCapture) {
      const leadBox = document.createElement('div');
      leadBox.className = 'lead-form-box';

      if (this.leadSubmitted) {
        leadBox.innerHTML = `
          <h4 class="lead-form-title" style="color: var(--widget-accent);">✓ Thank You!</h4>
          <p class="lead-form-desc">Your contact request was submitted successfully. ${this.companyName || 'Our installer'} will contact you shortly with a formal quote.</p>
        `;
      } else {
        leadBox.innerHTML = `
          <h4 class="lead-form-title">${this.ctaText}</h4>
          <p class="lead-form-desc">Provide your contact details below to receive a formal solar installation quote.</p>
          <form class="selection-list" id="widget-lead-form">
            <div class="form-group">
              <label class="form-label">Full Name</label>
              <input class="form-input" type="text" name="name" required placeholder="Adaeze Okafor" />
            </div>
            <div class="form-group">
              <label class="form-label">Phone Number</label>
              <input class="form-input" type="tel" name="phone" required placeholder="+234 812..." />
            </div>
            <div class="form-group">
              <label class="form-label">Email Address</label>
              <input class="form-input" type="email" name="email" required placeholder="adaeze@example.com" />
            </div>
            <div class="form-group">
              <label class="form-label">Message / Notes</label>
              <textarea class="form-input" name="message" rows="3" placeholder="Any additional site requirements..." style="resize: vertical; font-family: inherit;"></textarea>
            </div>
            <label class="consent-label">
              <input type="checkbox" required class="consent-checkbox" />
              <span>By submitting, you agree to be contacted by ${this.companyName || 'Solisys Solar partners'}.</span>
            </label>
            <button class="btn btn-primary" type="submit" style="width: 100%; margin-top: var(--widget-space-2);">
              Submit Quote Request
            </button>
          </form>
        `;

        leadBox.querySelector('form')?.addEventListener('submit', (e) => this.handleLeadSubmit(e));
      }
      container.appendChild(leadBox);
    }

    // Results Actions Buttons
    const actions = document.createElement('div');
    actions.className = 'actions-bar';
    actions.style.marginTop = 'var(--widget-space-4)';

    const printBtn = document.createElement('button');
    printBtn.className = 'btn btn-secondary';
    printBtn.innerHTML = `
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
      Print Proposal
    `;
    printBtn.addEventListener('click', () => this.handlePrintPDF());

    const shareBtn = document.createElement('button');
    shareBtn.className = 'btn btn-secondary';
    shareBtn.innerHTML = `
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="18" cy="5" r="3"></circle><circle cx="6" cy="12" r="3"></circle><circle cx="18" cy="19" r="3"></circle><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"></line><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"></line></svg>
      WhatsApp Share
    `;
    shareBtn.addEventListener('click', () => this.handleWhatsAppShare());

    actions.appendChild(printBtn);
    actions.appendChild(shareBtn);
    container.appendChild(actions);

    const restartBtn = document.createElement('button');
    restartBtn.className = 'btn btn-ghost';
    restartBtn.style.alignSelf = 'center';
    restartBtn.style.marginTop = 'var(--widget-space-4)';
    restartBtn.innerHTML = `← Start Sizing Over`;
    restartBtn.addEventListener('click', () => {
      this.step = 1;
      this.leadSubmitted = false;
      this.appliances = [];
      this.selectedCity = '';
      this.customPshMode = false;
      this.render();
    });
    container.appendChild(restartBtn);
  }
}

// Register custom element
if (typeof customElements !== 'undefined' && !customElements.get('solisys-solar-widget')) {
  customElements.define('solisys-solar-widget', SolisysSolarWidget);
}

// Global API
const SolisysWidget = {
  init(config: any) {
    const containerId = config.containerId || 'solisys-widget';
    const container = document.getElementById(containerId);
    if (!container) return;

    // Create shadow widget element
    const el = document.createElement('solisys-solar-widget') as any;
    
    // Set custom config attributes
    if (config.siteId) el.setAttribute('data-site-id', config.siteId);
    if (config.mode) el.setAttribute('data-mode', config.mode);
    if (config.theme) el.setAttribute('data-theme', config.theme);
    if (config.accentColor) el.setAttribute('data-accent-color', config.accentColor);
    if (config.companyName) el.setAttribute('data-company-name', config.companyName);
    if (config.logoUrl) el.setAttribute('data-logo-url', config.logoUrl);
    if (config.currency) el.setAttribute('data-currency', config.currency);
    
    if (config.leadCapture) {
      el.setAttribute('data-lead-capture', 'true');
      if (config.leadCapture.webhookUrl) el.setAttribute('data-lead-webhook', config.leadCapture.webhookUrl);
      if (config.leadCapture.ctaText) el.setAttribute('data-cta-text', config.leadCapture.ctaText);
    }

    container.innerHTML = '';
    container.appendChild(el);
  }
};

if (typeof window !== 'undefined') {
  (window as any).SolisysWidget = SolisysWidget;
}

export default SolisysWidget;
