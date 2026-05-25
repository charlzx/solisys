import React, { useEffect, useRef, useState } from 'react';
import {
  Sun, Moon, Lightning as Zap, ChartBar as BarChart3, Globe as Globe2, ArrowRight, CaretRight, List as Menu, X,
  Laptop, DeviceMobile as Smartphone, Code, CheckCircle, CreditCard, CaretDown, Check,
  Copy, CheckCircle as CheckCircle2, DollarSign, Download, Play, Info, Warning as AlertTriangle, ShieldCheck
} from '@phosphor-icons/react';
import './marketing.css';

// ─── Stat counter hook ──────────────────────────────────────────────────────
function useCounter(target: number, duration = 1200, started = false) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    if (!started) return;
    let start: number | null = null;
    const step = (ts: number) => {
      if (!start) start = ts;
      const progress = Math.min((ts - start) / duration, 1);
      setCount(Math.floor(progress * target));
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [started, target, duration]);
  return count;
}

// ─── Intersection observer hook ─────────────────────────────────────────────
function useVisible(threshold = 0.2) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setVisible(true); obs.disconnect(); } },
      { threshold }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [threshold]);
  return { ref, visible };
}

// ─── Programmatic Navigation ────────────────────────────────────────────────
const navigateToPath = (path: string, e?: React.MouseEvent) => {
  if (e) e.preventDefault();
  window.history.pushState(null, '', path);
  window.dispatchEvent(new Event('popstate'));
};

// ─── Nav ─────────────────────────────────────────────────────────────────────
interface NavProps {
  onToggleTheme: () => void;
  theme: string;
  currentPath: string;
}

function Nav({ onToggleTheme, theme, currentPath }: NavProps) {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 80);
    window.addEventListener('scroll', handler, { passive: true });
    return () => window.removeEventListener('scroll', handler);
  }, []);

  return (
    <nav className={`mkt-nav ${scrolled ? 'mkt-nav--scrolled' : ''}`} role="navigation">
      <div className="mkt-nav__inner">
        <a href="/" onClick={(e) => navigateToPath('/', e)} className="mkt-nav__logo" aria-label="Solisys home" style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
          <svg viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ width: '22px', height: '22px', color: 'var(--color-accent)', flexShrink: 0 }}>
            <circle cx="16" cy="16" r="10" stroke="currentColor" strokeWidth="2.5" strokeDasharray="4 2"/>
            <path d="M17 6L9 17H16L15 26L23 15H16L17 6Z" fill="currentColor"/>
          </svg>
          <span>Solisys</span>
        </a>

        {/* Desktop links */}
        <div className="mkt-nav__links" role="menubar">
          <a
            href="/widget"
            onClick={(e) => navigateToPath('/widget', e)}
            className={`mkt-nav__link ${currentPath === '/widget' ? 'mkt-nav__link--active' : ''}`}
            role="menuitem"
          >
            Widget
          </a>
          <a
            href="/api"
            onClick={(e) => navigateToPath('/api', e)}
            className={`mkt-nav__link ${currentPath === '/api' ? 'mkt-nav__link--active' : ''}`}
            role="menuitem"
          >
            API & CLI
          </a>
          <a
            href="/download"
            onClick={(e) => navigateToPath('/download', e)}
            className={`mkt-nav__link ${currentPath === '/download' ? 'mkt-nav__link--active' : ''}`}
            role="menuitem"
          >
            Download
          </a>
          <a
            href="/pricing"
            onClick={(e) => navigateToPath('/pricing', e)}
            className={`mkt-nav__link ${currentPath === '/pricing' ? 'mkt-nav__link--active' : ''}`}
            role="menuitem"
          >
            Pricing
          </a>
        </div>

        {/* Right */}
        <div className="mkt-nav__right">
          <button
            className="mkt-nav__theme-btn"
            onClick={onToggleTheme}
            aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
          >
            {theme === 'dark' ? '☀' : '◑'}
          </button>
          <a href="/app" onClick={(e) => navigateToPath('/app', e)} className="btn btn--primary btn--sm">
            Try Free
          </a>
          <button
            className="mkt-nav__hamburger"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Toggle menu"
            aria-expanded={menuOpen}
          >
            {menuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="mkt-nav__mobile">
          <a href="/widget" onClick={(e) => { setMenuOpen(false); navigateToPath('/widget', e); }}>Widget</a>
          <a href="/api" onClick={(e) => { setMenuOpen(false); navigateToPath('/api', e); }}>API & Package</a>
          <a href="/download" onClick={(e) => { setMenuOpen(false); navigateToPath('/download', e); }}>Download</a>
          <a href="/pricing" onClick={(e) => { setMenuOpen(false); navigateToPath('/pricing', e); }}>Pricing</a>
          <a href="/app" onClick={(e) => { setMenuOpen(false); navigateToPath('/app', e); }} className="btn btn--primary btn--sm" style={{ marginTop: 8 }}>
            Try Free
          </a>
        </div>
      )}
    </nav>
  );
}

// ─── Hero ─────────────────────────────────────────────────────────────────────
function Hero() {
  return (
    <section className="mkt-hero" id="home">
      <div className="hero-glow" aria-hidden="true" />
      <div className="mkt-container mkt-hero__content">
        <div className="mkt-hero__badge animate-fade-in">
          <Zap size={12} />
          <span>Completely free. No account needed.</span>
        </div>

        <h1 className="mkt-hero__headline animate-fade-up-in" style={{ animationDelay: '80ms' }}>
          Solar sizing that
          <br />
          <span className="mkt-hero__accent">actually makes sense.</span>
        </h1>

        <p className="mkt-hero__sub animate-fade-up-in" style={{ animationDelay: '160ms' }}>
          Design complete solar systems in minutes. For professional solar installers and engineers (Pro mode) and everyday people (Simple mode). One tool, two ways to use it.
        </p>

        <div className="mkt-hero__actions animate-fade-up-in" style={{ animationDelay: '240ms' }}>
          <a href="/app" onClick={(e) => navigateToPath('/app', e)} id="hero-cta-primary" className="btn btn--primary btn--lg">
            Try the Calculator
            <ArrowRight size={18} />
          </a>
          <a href="#features" className="btn btn--ghost btn--lg">
            See how it works
            <CaretRight size={16} />
          </a>
        </div>
      </div>

      {/* App mockup */}
      <div className="mkt-hero__mockup animate-fade-up-in" style={{ animationDelay: '360ms' }}>
        <AppMockup />
      </div>
    </section>
  );
}

// ─── App mockup preview ───────────────────────────────────────────────────────
function AppMockup() {
  return (
    <div className="mkt-mockup" aria-hidden="true">
      <div className="mkt-mockup__bar">
        <span /><span /><span />
      </div>
      <div className="mkt-mockup__body">
        {/* Sidebar */}
        <div className="mkt-mockup__sidebar">
          <div className="mkt-mockup__logo-mini">
            <svg viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ width: '14px', height: '14px', color: 'var(--color-accent)' }}>
              <circle cx="16" cy="16" r="10" stroke="currentColor" strokeWidth="2.5" strokeDasharray="4 2"/>
              <path d="M17 6L9 17H16L15 26L23 15H16L17 6Z" fill="currentColor"/>
            </svg>
          </div>
          {['Load Sizing', 'Battery Bank', 'Inverter Sizing', 'Solar Array', 'Wire Sizing'].map((s, i) => (
            <div
              key={s}
              className={`mkt-mockup__step ${i === 1 ? 'mkt-mockup__step--active' : ''}`}
            >
              <span className="mkt-mockup__step-dot" />
              {s}
            </div>
          ))}
        </div>

        {/* Content area */}
        <div className="mkt-mockup__content">
          <div className="mkt-mockup__section-title">Battery Bank Sizing</div>
          <div className="mkt-mockup__fields">
            {[
              { label: 'Daily Energy', val: '4,800 Wh' },
              { label: 'Days Autonomy', val: '2' },
              { label: 'Depth of Discharge', val: '80%' },
              { label: 'System Voltage', val: '48 V' },
            ].map(f => (
              <div key={f.label} className="mkt-mockup__field">
                <span className="mkt-mockup__field-label">{f.label}</span>
                <span className="mkt-mockup__field-val">{f.val}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Output panel */}
        <div className="mkt-mockup__output">
          <div className="mkt-mockup__out-title">Results</div>
          {[
            { label: 'BATTERIES', val: '8', unit: 'units' },
            { label: 'BANK CAPACITY', val: '12.0', unit: 'kWh' },
            { label: 'CHARGE CONTROLLER', val: '60', unit: 'A' },
          ].map(k => (
            <div key={k.label} className="mkt-mockup__kpi">
              <span className="mkt-mockup__kpi-label">{k.label}</span>
              <span className="mkt-mockup__kpi-val">
                {k.val}
                <span className="mkt-mockup__kpi-unit">{k.unit}</span>
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Stats ────────────────────────────────────────────────────────────────────
function Stats() {
  const { ref, visible } = useVisible();
  const c1 = useCounter(74, 1200, visible);
  const c2 = useCounter(8, 1000, visible);
  const c3 = useCounter(5, 800, visible);

  return (
    <section className="mkt-stats" aria-label="Platform statistics">
      <div className="mkt-container">
        <div className="mkt-stats__grid" ref={ref}>
          {[
            { val: c1, suffix: '', label: 'Cities with NASA PSH Data' },
            { val: c2, suffix: '', label: 'Rigorous Calculation Modules' },
            { val: c3, suffix: ' / mo', prefix: '$', label: 'Pro Pricing Starts At' },
          ].map((s) => (
            <div key={s.label} className="mkt-stat">
              <span className="mkt-stat__value">
                {s.prefix || ''}{s.val}{s.suffix}
              </span>
              <span className="mkt-stat__label">{s.label}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── Features ─────────────────────────────────────────────────────────────────
const FEATURES = [
  {
    icon: <BarChart3 size={32} />,
    title: 'Full System Sizing',
    desc: 'Load analysis, battery bank, inverter, solar array, charge controller, and wire sizing — every step in one coherent flow.',
  },
  {
    icon: <Globe2 size={32} />,
    title: '74-City PSH Database',
    desc: 'Pre-loaded peak sun hours for 74 cities across 8 regions, sourced from 20 years of NASA POWER satellite data.',
  },
  {
    icon: <Zap size={32} />,
    title: 'Live Calculations',
    desc: 'Results update in real-time as you type. No submit buttons. No waiting. Instant engineering feedback.',
  },
  {
    icon: <Sun size={32} />,
    title: 'String Design Tool',
    desc: 'MPPT string sizing with temperature-corrected Voc and Vmp. Validates against inverter input specs automatically.',
  },
];

function Features() {
  const { ref, visible } = useVisible(0.1);
  return (
    <section className="mkt-features" id="features" aria-labelledby="features-heading">
      <div className="mkt-container">
        <div className="mkt-section-header">
          <div className="mkt-badge">Features</div>
          <h2 id="features-heading" className="mkt-section-title">
            Everything you need.<br />
            <span className="mkt-accent">Nothing you don't.</span>
          </h2>
          <p className="mkt-section-sub">
            Built for the full solar sizing workflow, from the very first watt-hour to the final cable cross-section.
          </p>
        </div>

        <div className="mkt-features__grid" ref={ref}>
          {FEATURES.map((f, i) => (
            <article
              key={f.title}
              className={`mkt-feature-card ${visible ? 'animate-fade-up-in' : ''}`}
              style={{ animationDelay: `${i * 80}ms` }}
            >
              <div className="mkt-feature-card__icon">{f.icon}</div>
              <h3 className="mkt-feature-card__title">{f.title}</h3>
              <p className="mkt-feature-card__desc">{f.desc}</p>
              <a href="/app" onClick={(e) => navigateToPath('/app', e)} className="mkt-feature-card__link">
                Try it <ArrowRight size={14} />
              </a>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── CTA Banner ───────────────────────────────────────────────────────────────
function CtaBanner() {
  return (
    <section className="mkt-cta" aria-labelledby="cta-heading">
      <div className="mkt-container">
        <div className="mkt-cta__card">
          <div className="mkt-cta__glow" aria-hidden="true" />
          <h2 id="cta-heading" className="mkt-cta__title">
            Ready to size your system?
          </h2>
          <p className="mkt-cta__sub">
            Free. No account. Works on any device. Start in seconds.
          </p>
          <a href="/app" onClick={(e) => navigateToPath('/app', e)} id="cta-open-app" className="btn btn--primary btn--lg">
            Open the Calculator
            <ArrowRight size={18} />
          </a>
        </div>
      </div>
    </section>
  );
}

// ─── Footer ───────────────────────────────────────────────────────────────────
function Footer() {
  return (
    <footer className="mkt-footer" role="contentinfo">
      <div className="mkt-container mkt-footer__inner">
        <a href="/" onClick={(e) => navigateToPath('/', e)} className="mkt-footer__brand" style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
          <svg viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ width: '18px', height: '18px', color: 'var(--color-accent)', flexShrink: 0 }}>
            <circle cx="16" cy="16" r="10" stroke="currentColor" strokeWidth="2.5" strokeDasharray="4 2"/>
            <path d="M17 6L9 17H16L15 26L23 15H16L17 6Z" fill="currentColor"/>
          </svg>
          <span>Solisys</span>
        </a>
        <p className="mkt-footer__copy">
          &copy; {new Date().getFullYear()} Solisys. All rights reserved. Made by Charlz.
        </p>
        <nav className="mkt-footer__links" aria-label="Footer navigation">
          <a href="/widget" onClick={(e) => navigateToPath('/widget', e)}>Widget</a>
          <a href="/api" onClick={(e) => navigateToPath('/api', e)}>API & CLI</a>
          <a href="/download" onClick={(e) => navigateToPath('/download', e)}>Download</a>
          <a href="/pricing" onClick={(e) => navigateToPath('/pricing', e)}>Pricing</a>
        </nav>
      </div>
    </footer>
  );
}

// ─── Widget Product Page ─────────────────────────────────────────────────────
function WidgetPage() {
  const [embedMode, setEmbedMode] = useState<'simple' | 'pro'>('simple');
  const [accentColor, setAccentColor] = useState('#B5F050');
  const [companyName, setCompanyName] = useState('Volt Solar');
  const [showBranding, setShowBranding] = useState(true);

  // Widget preview interactive flow
  const [widgetStep, setWidgetStep] = useState(1);
  const [wUsage, setWUsage] = useState(8); // kWh/day
  const [wBackup, setWBackup] = useState(12); // hours
  const [wCity, setWCity] = useState('Lagos');
  const [wLeadName, setWLeadName] = useState('');
  const [wLeadEmail, setWLeadEmail] = useState('');
  const [wSubmitted, setWSubmitted] = useState(false);

  // Sizing math for preview widget
  const psh = wCity === 'Lagos' ? 4.5 : wCity === 'Nairobi' ? 5.2 : wCity === 'Houston' ? 4.8 : 4.0;
  const panelWatts = 450;
  const panelCount = Math.ceil((wUsage * 1000) / (psh * 0.82 * panelWatts));
  const bankKwh = Math.ceil((wUsage * (wBackup / 24)) / 0.85); // 85% DoD
  const batCount = Math.ceil((bankKwh * 1000) / (12 * 100)); // 12V 100Ah battery count
  const inverterSize = Math.ceil((wUsage / 24) * 1.25 * 1.5); // rough peak estimate

  const resetWidget = () => {
    setWidgetStep(1);
    setWSubmitted(false);
    setWLeadName('');
    setWLeadEmail('');
  };

  const colors = [
    { label: 'Lime Glow', hex: '#B5F050' },
    { label: 'Forest Vitality', hex: '#7DC235' },
    { label: 'Warm Sun', hex: '#F59E0B' },
    { label: 'Ocean Wind', hex: '#3B82F6' },
  ];

  return (
    <div className="widget-page animate-fade-in" style={{ paddingTop: '100px' }}>
      <section className="mkt-container">
        {/* Hero */}
        <div className="mkt-section-header" style={{ marginBottom: '40px' }}>
          <div className="mkt-badge">Embeddable Widget</div>
          <h1 className="mkt-section-title">Add a solar calculator to your website.</h1>
          <p className="mkt-section-sub">
            Your visitors size their systems in seconds. You capture high-quality installer leads instantly.
          </p>
        </div>

        {/* Interactive Configurator & Live Preview */}
        <div className="configurator-grid">
          {/* Controls Panel */}
          <div className="config-panel">
            <h3 className="config-panel__title">Widget Configurator</h3>
            <p className="config-panel__sub">Customize the look, feel, and business rules of your client widget.</p>

            {/* Mode */}
            <div className="config-group">
              <label className="config-label">Default Sizing Mode</label>
              <div className="toggle-pill">
                <button
                  className={`toggle-pill__btn ${embedMode === 'simple' ? 'active' : ''}`}
                  onClick={() => setEmbedMode('simple')}
                >
                  Simple Mode (Standard)
                </button>
                <button
                  className={`toggle-pill__btn ${embedMode === 'pro' ? 'active' : ''}`}
                  onClick={() => setEmbedMode('pro')}
                >
                  Pro Mode (Technical)
                </button>
              </div>
            </div>

            {/* Accent Color */}
            <div className="config-group">
              <label className="config-label">Theme Accent Color</label>
              <div className="color-selectors">
                {colors.map(c => (
                  <button
                    key={c.hex}
                    className={`color-dot ${accentColor === c.hex ? 'active' : ''}`}
                    style={{ backgroundColor: c.hex }}
                    title={c.label}
                    onClick={() => setAccentColor(c.hex)}
                  />
                ))}
              </div>
            </div>

            {/* Company Name */}
            <div className="config-group">
              <label className="config-label" htmlFor="company-name-input">Installer Company Name</label>
              <input
                id="company-name-input"
                type="text"
                className="config-input"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                placeholder="e.g. Volt Solar Inc."
              />
            </div>

            {/* Branding Toggle */}
            <div className="config-group" style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <input
                id="branding-checkbox"
                type="checkbox"
                checked={showBranding}
                onChange={(e) => setShowBranding(e.target.checked)}
                className="config-checkbox"
              />
              <label htmlFor="branding-checkbox" className="config-checkbox-label">Show Solisys attribution (Free tier only)</label>
            </div>

            {/* Copy Embed script */}
            <div className="config-embed">
              <div className="config-embed__header">
                <span>Copy Script Embed Code</span>
                <button
                  className="copy-btn"
                  onClick={() => {
                    const code = `<div id="solisys-widget" data-mode="${embedMode}" data-color="${accentColor}" data-company="${companyName}" data-branding="${showBranding}"></div>\n<script src="https://cdn.solisys.dev/widget.js" async></script>`;
                    navigator.clipboard.writeText(code);
                    alert('Script tag copied to clipboard!');
                  }}
                >
                  <Copy size={14} /> Copy
                </button>
              </div>
              <pre className="code-block-embed">
                <code>
                  {`<div id="solisys-widget"\n  data-mode="${embedMode}"\n  data-color="${accentColor}"\n  data-company="${companyName}"\n></div>\n<script src="https://cdn.solisys.dev/widget.js" async></script>`}
                </code>
              </pre>
            </div>
          </div>

          {/* Live Preview Panel */}
          <div className="preview-panel">
            <div className="preview-panel__badge">Live Simulated Preview</div>

            {/* Render Simulated Widget inside Shadow-like box */}
            <div className="widget-mock">
              <div className="widget-mock__header" style={{ borderTopColor: accentColor }}>
                <div className="widget-mock__title-group" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <svg viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ width: '18px', height: '18px', color: accentColor, flexShrink: 0 }}>
                    <circle cx="16" cy="16" r="10" stroke="currentColor" strokeWidth="2.5" strokeDasharray="4 2"/>
                    <path d="M17 6L9 17H16L15 26L23 15H16L17 6Z" fill="currentColor"/>
                  </svg>
                  <span className="widget-mock__title">Solar Sizing Tool</span>
                </div>
                <span className="widget-mock__company">{companyName}</span>
              </div>

              <div className="widget-mock__body">
                {widgetStep === 1 && (
                  <div className="mock-step">
                    <h4 className="mock-step__question">
                      {embedMode === 'simple' ? 'Where is your home or project located?' : 'Select Site Location (for Climatological PSH)'}
                    </h4>
                    <div className="city-selector-grid">
                      {['Lagos', 'Nairobi', 'Houston', 'London'].map(c => (
                        <button
                          key={c}
                          className={`city-pill ${wCity === c ? 'active' : ''}`}
                          style={{
                            borderColor: wCity === c ? accentColor : '',
                            backgroundColor: wCity === c ? `${accentColor}1A` : ''
                          }}
                          onClick={() => setWCity(c)}
                        >
                          {c}
                        </button>
                      ))}
                    </div>
                    <div className="mock-nav-actions" style={{ marginTop: '24px' }}>
                      <button
                        className="btn btn--primary btn--sm"
                        style={{ backgroundColor: accentColor, color: '#0A1F0D' }}
                        onClick={() => setWidgetStep(2)}
                      >
                        Next Step <ArrowRight size={14} />
                      </button>
                    </div>
                  </div>
                )}

                {widgetStep === 2 && (
                  <div className="mock-step">
                    <h4 className="mock-step__question">
                      {embedMode === 'simple' ? 'What is your estimated daily electricity usage?' : 'Average Daily Load Energy Requirement'}
                    </h4>
                    <div className="slider-container" style={{ margin: '16px 0' }}>
                      <div className="usage-display" style={{ fontFamily: 'var(--font-mono)', fontSize: '20px', color: accentColor, marginBottom: '8px' }}>
                        {wUsage} kWh/day
                      </div>
                      <input
                        type="range"
                        min="2"
                        max="30"
                        value={wUsage}
                        onChange={(e) => setWUsage(parseInt(e.target.value))}
                        style={{ accentColor }}
                        className="w-full"
                      />
                      <div className="usage-presets" style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: 'var(--color-text-secondary)', marginTop: '4px' }}>
                        <span>Small Flat (2-4 kWh)</span>
                        <span>Medium House (6-12 kWh)</span>
                        <span>Large Estate (15-30 kWh)</span>
                      </div>
                    </div>
                    <div className="mock-nav-actions" style={{ display: 'flex', gap: '8px' }}>
                      <button className="btn btn--ghost btn--sm" onClick={() => setWidgetStep(1)}>Back</button>
                      <button
                        className="btn btn--primary btn--sm"
                        style={{ backgroundColor: accentColor, color: '#0A1F0D' }}
                        onClick={() => setWidgetStep(3)}
                      >
                        Next Step <ArrowRight size={14} />
                      </button>
                    </div>
                  </div>
                )}

                {widgetStep === 3 && (
                  <div className="mock-step">
                    <h4 className="mock-step__question">
                      {embedMode === 'simple' ? 'How long do you need power backup after dark?' : 'Autonomy Duration (Hours of battery support)'}
                    </h4>
                    <div className="backup-selector-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '8px', margin: '16px 0' }}>
                      {[4, 8, 12, 18, 24, 48].map(h => (
                        <button
                          key={h}
                          className={`backup-tile ${wBackup === h ? 'active' : ''}`}
                          style={{
                            borderColor: wBackup === h ? accentColor : '',
                            backgroundColor: wBackup === h ? `${accentColor}1A` : ''
                          }}
                          onClick={() => setWBackup(h)}
                        >
                          {h === 24 ? '1 Day' : h === 48 ? '2 Days' : `${h} hrs`}
                        </button>
                      ))}
                    </div>
                    <div className="mock-nav-actions" style={{ display: 'flex', gap: '8px' }}>
                      <button className="btn btn--ghost btn--sm" onClick={() => setWidgetStep(2)}>Back</button>
                      <button
                        className="btn btn--primary btn--sm"
                        style={{ backgroundColor: accentColor, color: '#0A1F0D' }}
                        onClick={() => setWidgetStep(4)}
                      >
                        Calculate Sizing <Zap size={12} />
                      </button>
                    </div>
                  </div>
                )}

                {widgetStep === 4 && (
                  <div className="mock-step">
                    {!wSubmitted ? (
                      <>
                        <h4 className="mock-step__question">Your Estimated Solar System Size</h4>
                        <div className="result-kpis" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px', margin: '16px 0' }}>
                          <div className="result-kpi" style={{ borderBottom: `2px solid ${accentColor}` }}>
                            <span className="result-kpi-label">ARRAY SIZE</span>
                            <span className="result-kpi-val" style={{ color: accentColor }}>
                              {panelCount * panelWatts >= 1000 ? `${((panelCount * panelWatts)/1000).toFixed(1)} kW` : `${panelCount * panelWatts} W`}
                            </span>
                          </div>
                          <div className="result-kpi" style={{ borderBottom: `2px solid ${accentColor}` }}>
                            <span className="result-kpi-label">BATTERIES</span>
                            <span className="result-kpi-val" style={{ color: accentColor }}>{batCount} <span style={{ fontSize: '11px' }}>qty</span></span>
                          </div>
                          <div className="result-kpi" style={{ borderBottom: `2px solid ${accentColor}` }}>
                            <span className="result-kpi-label">INVERTER</span>
                            <span className="result-kpi-val" style={{ color: accentColor }}>{inverterSize} <span style={{ fontSize: '11px' }}>kVA</span></span>
                          </div>
                        </div>

                        {/* Lead Capture Form */}
                        <div className="lead-capture-form" style={{ background: 'var(--color-bg)', padding: '12px', borderRadius: '6px', border: '1px solid var(--color-border)', marginTop: '16px' }}>
                          <span style={{ fontSize: '11px', fontWeight: 600, color: 'var(--color-text-primary)', display: 'block', marginBottom: '8px' }}>
                            Receive a customized structural quote from {companyName}
                          </span>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                            <input
                              type="text"
                              className="mock-form-input"
                              placeholder="Your Name"
                              value={wLeadName}
                              onChange={(e) => setWLeadName(e.target.value)}
                            />
                            <input
                              type="email"
                              className="mock-form-input"
                              placeholder="Your Email"
                              value={wLeadEmail}
                              onChange={(e) => setWLeadEmail(e.target.value)}
                            />
                            <button
                              className="btn btn--primary btn--sm"
                              style={{ backgroundColor: accentColor, color: '#0A1F0D', justifyContent: 'center' }}
                              onClick={() => {
                                if (!wLeadName || !wLeadEmail) {
                                  alert('Please enter your details');
                                  return;
                                }
                                setWSubmitted(true);
                              }}
                            >
                              Submit Quote Request
                            </button>
                          </div>
                        </div>
                        <div style={{ marginTop: '12px', textAlign: 'center' }}>
                          <button className="text-btn" style={{ fontSize: '12px', color: 'var(--color-text-secondary)' }} onClick={resetWidget}>
                            Reset Calculator
                          </button>
                        </div>
                      </>
                    ) : (
                      <div style={{ textAlign: 'center', padding: '20px 0' }}>
                        <CheckCircle2 size={48} style={{ color: accentColor, margin: '0 auto 12px' }} />
                        <h4 style={{ fontSize: '18px', fontWeight: 600, marginBottom: '8px' }}>Thank you!</h4>
                        <p style={{ fontSize: '13px', color: 'var(--color-text-secondary)', marginBottom: '20px' }}>
                          Your request was sent directly to <strong>{companyName}</strong>. Their solar expert will review your sizing and contact you shortly.
                        </p>
                        <button className="btn btn--ghost btn--sm" onClick={resetWidget}>
                          Size Another System
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {showBranding && (
                <div className="widget-mock__footer">
                  <a href="/" onClick={(e) => navigateToPath('/', e)}>
                    Powered by <span>Solisys</span>
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Feature walkthrough */}
      <section className="mkt-stats" style={{ borderTop: 'none' }}>
        <div className="mkt-container">
          <div className="mkt-section-header">
            <div className="mkt-badge">How Sizing Widget Works</div>
            <h2 className="mkt-section-title">Lead capture without friction.</h2>
            <p className="mkt-section-sub">A premium, offline-safe interface embedded on your site in minutes.</p>
          </div>

          <div className="walkthrough-steps">
            <div className="wt-step">
              <div className="wt-step__num">1</div>
              <h4>Visitor enters inputs</h4>
              <p>Clients input appliances, location, or monthly utility bills through a responsive, gorgeous wizard.</p>
            </div>
            <div className="wt-step">
              <div className="wt-step__num">2</div>
              <h4>Calculates on-site</h4>
              <p>The system runs all sizing math inside their browser in real-time, requiring no remote API calls.</p>
            </div>
            <div className="wt-step">
              <div className="wt-step__num">3</div>
              <h4>Lead webhook fired</h4>
              <p>Once submitted, contact info is pushed immediately to your email or custom webhook for CRM ingestion.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Widget pricing */}
      <section className="mkt-features">
        <div className="mkt-container">
          <div className="mkt-section-header">
            <div className="mkt-badge">Widget Pricing</div>
            <h2 className="mkt-section-title">Select a plan for your firm.</h2>
            <p className="mkt-section-sub">Scale lead capture seamlessly with transparent sizing tiers.</p>
          </div>

          <div className="pricing-grid">
            <div className="pricing-card">
              <h3>Free</h3>
              <div className="price-tag">
                <span className="price-num">$0</span>
                <span className="price-period">/ mo</span>
              </div>
              <p className="price-desc">Perfect for testing or small personal solar blogs.</p>
              <ul className="pricing-features">
                <li><Check size={14} /> 100 system sizings / mo</li>
                <li><Check size={14} /> Simple Mode sizing only</li>
                <li><Check size={14} /> Local browser calculation</li>
                <li className="disabled"><X size={14} /> Lead Capture & Webhooks</li>
                <li className="disabled"><X size={14} /> Custom Branding & Colors</li>
              </ul>
              <a href="/app" onClick={(e) => navigateToPath('/app', e)} className="btn btn--ghost w-full">Start Free</a>
            </div>

            <div className="pricing-card pricing-card--popular">
              <div className="popular-badge">Recommended</div>
              <h3>Starter</h3>
              <div className="price-tag">
                <span className="price-num">$10</span>
                <span className="price-period">/ mo</span>
              </div>
              <p className="price-desc">Ideal for boutique solar installers generating local leads.</p>
              <ul className="pricing-features">
                <li><Check size={14} /> 1,000 system sizings / mo</li>
                <li><Check size={14} /> Full lead capture & webhook</li>
                <li><Check size={14} /> Custom accent colors & logo</li>
                <li><Check size={14} /> 30-day analytics dashboard</li>
                <li><Check size={14} /> White label (No Solisys footer)</li>
              </ul>
              <a href="/app" onClick={(e) => navigateToPath('/app', e)} className="btn btn--primary w-full">Upgrade Now</a>
            </div>

            <div className="pricing-card">
              <h3>Business</h3>
              <div className="price-tag">
                <span className="price-num">$30</span>
                <span className="price-period">/ mo</span>
              </div>
              <p className="price-desc">For active installation networks running online marketing campaigns.</p>
              <ul className="pricing-features">
                <li><Check size={14} /> 10,000 system sizings / mo</li>
                <li><Check size={14} /> Up to 3 distinct site IDs</li>
                <li><Check size={14} /> Direct email alerts on lead submit</li>
                <li><Check size={14} /> Custom CSS layout overrides</li>
                <li><Check size={14} /> 12-month historical analytics</li>
              </ul>
              <a href="/app" onClick={(e) => navigateToPath('/app', e)} className="btn btn--ghost w-full">Go Business</a>
            </div>
          </div>
        </div>
      </section>

      <CtaBanner />
    </div>
  );
}

// ─── API & Package Page ──────────────────────────────────────────────────────
function ApiPage() {
  const [apiTab, setApiTab] = useState<'npm' | 'api'>('npm');

  const npmCode = `import { calculateFullSystem, findCityByName } from '@solisys/calc';

// 1. Resolve Peak Sun Hours from PSH database
const city = findCityByName('Lagos');
if (!city) throw new Error('City not in database');

// 2. Compute full technical sizing
const sizing = calculateFullSystem({
  appliances: [
    { quantity: 4, wattage: 12, hours: 8, unit: 'W' },   // LED Bulbs
    { quantity: 1, wattage: 120, hours: 24, unit: 'W' }  // EnergyStar Fridge
  ],
  peakSunHours: city.pshAnnual,
  systemVoltageV: 24,
  systemEfficiencyPct: 82,
  batteryDoD: 0.8,
  daysOfAutonomy: 1,
  batteryVoltageV: 12,
  batteryCapacityAh: 150,
  panelWattageW: 400
});

console.log(sizing.solar.numberOfPanels); // => 2 panels
console.log(sizing.battery.totalBatteries); // => 2 batteries (24V bank)`;

  const restCode = `curl -X POST https://api.solisys.dev/v1/calculate/full \\
  -H "Authorization: Bearer sk_live_your_api_key" \\
  -H "Content-Type: application/json" \\
  -d '{
    "dailyEnergyKwh": 4.8,
    "peakLoadW": 1500,
    "peakSunHours": 4.5,
    "systemVoltageV": 48,
    "systemEfficiencyPct": 85,
    "batteryDoD": 0.85,
    "daysOfAutonomy": 1,
    "batteryVoltageV": 48,
    "batteryCapacityAh": 100,
    "panelWattageW": 450
  }'`;

  const restResponse = `{
  "success": true,
  "result": {
    "dailyEnergyKwh": 4.8,
    "peakLoadW": 1500,
    "inverter": {
      "requiredKva": 2.34,
      "recommendedKva": 3.0
    },
    "battery": {
      "requiredStorageWh": 5647,
      "totalBatteries": 2,
      "seriesCount": 1,
      "parallelCount": 2
    },
    "solar": {
      "requiredWattageW": 1248,
      "numberOfPanels": 3,
      "actualArrayKwp": 1.35
    }
  }
}`;

  return (
    <div className="api-page animate-fade-in" style={{ paddingTop: '100px' }}>
      <section className="mkt-container">
        {/* Hero */}
        <div className="mkt-section-header" style={{ marginBottom: '40px' }}>
          <div className="mkt-badge">Developer Tools</div>
          <h1 className="mkt-section-title">The solar calculation engine, your way.</h1>
          <p className="mkt-section-sub">
            Integrate certified solar engineering formulas into your applications via npm package or hosted REST endpoints.
          </p>
        </div>

        {/* Tab switcher */}
        <div className="tabs-container" style={{ display: 'flex', justifyContent: 'center', marginBottom: '32px' }}>
          <div className="toggle-pill" style={{ maxWidth: '400px', width: '100%' }}>
            <button
              className={`toggle-pill__btn ${apiTab === 'npm' ? 'active' : ''}`}
              onClick={() => setApiTab('npm')}
            >
              npm SDK Package
            </button>
            <button
              className={`toggle-pill__btn ${apiTab === 'api' ? 'active' : ''}`}
              onClick={() => setApiTab('api')}
            >
              Hosted REST API
            </button>
          </div>
        </div>

        {/* Interactive code box */}
        <div className="code-container" style={{ display: 'grid', gridTemplateColumns: apiTab === 'api' ? '1fr 1fr' : '1fr', gap: '20px', margin: '0 auto 48px', maxWidth: '1000px' }}>
          <div className="code-card">
            <div className="code-card__header">
              <span className="code-card__lang">{apiTab === 'npm' ? 'TypeScript / JavaScript' : 'Request (cURL)'}</span>
              <button
                className="copy-btn"
                onClick={() => {
                  navigator.clipboard.writeText(apiTab === 'npm' ? npmCode : restCode);
                  alert('Code copied to clipboard!');
                }}
              >
                <Copy size={12} /> Copy
              </button>
            </div>
            <pre className="code-pre">
              <code>{apiTab === 'npm' ? npmCode : restCode}</code>
            </pre>
          </div>

          {apiTab === 'api' && (
            <div className="code-card">
              <div className="code-card__header">
                <span className="code-card__lang">Response (JSON)</span>
                <button
                  className="copy-btn"
                  onClick={() => {
                    navigator.clipboard.writeText(restResponse);
                    alert('Response copied to clipboard!');
                  }}
                >
                  <Copy size={12} /> Copy
                </button>
              </div>
              <pre className="code-pre">
                <code>{restResponse}</code>
              </pre>
            </div>
          )}
        </div>

        {/* Install box for npm */}
        {apiTab === 'npm' && (
          <div style={{ textAlign: 'center', marginBottom: '64px' }}>
            <div className="install-tag" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '12px 24px', border: '1px solid var(--color-border)', borderRadius: '8px', background: 'var(--color-bg-deep)', fontFamily: 'var(--font-mono)', fontSize: '14px' }}>
              <span style={{ color: 'var(--color-text-secondary)' }}>$</span>
              <span>npm install @charlzx/solisys-calc</span>
              <button
                style={{ background: 'none', border: 'none', color: 'var(--color-accent)', cursor: 'pointer', marginLeft: '12px' }}
                onClick={() => {
                  navigator.clipboard.writeText('npm install @charlzx/solisys-calc');
                  alert('Install command copied!');
                }}
              >
                <Copy size={14} />
              </button>
            </div>
          </div>
        )}
      </section>

      {/* Developer use-cases */}
      <section className="mkt-stats" style={{ borderTop: 'none' }}>
        <div className="mkt-container">
          <div className="mkt-section-header">
            <div className="mkt-badge">Use Cases</div>
            <h2 className="mkt-section-title">Built for serious solar platforms.</h2>
            <p className="mkt-section-sub">Standardize calculation rules across your entire business ecosystem.</p>
          </div>

          <div className="use-cases-grid">
            <div className="use-case-card">
              <div className="use-case-icon"><CreditCard size={28} /></div>
              <h4>Solar Fintech & Loans</h4>
              <p>Automate system size verification for residential applications to balance asset viability before loan disbursement.</p>
            </div>
            <div className="use-case-card">
              <div className="use-case-icon"><Laptop size={28} /></div>
              <h4>E-Commerce Sizing</h4>
              <p>Build an interactive "Add Panels to Cart" sizing recommendation direct on your distributor checkout pages.</p>
            </div>
            <div className="use-case-card">
              <div className="use-case-icon"><Code size={28} /></div>
              <h4>Internal Sizing CRMs</h4>
              <p>Equip custom sales reps applications with instant pricing, single-line diagrams, and BOM technical proposals.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Hosted API pricing */}
      <section className="mkt-features">
        <div className="mkt-container">
          <div className="mkt-section-header">
            <div className="mkt-badge">API Plans</div>
            <h2 className="mkt-section-title">Scale call volume on-demand.</h2>
            <p className="mkt-section-sub">Free to develop. High performance serverless architecture.</p>
          </div>

          <div className="pricing-grid">
            <div className="pricing-card">
              <h3>Free</h3>
              <div className="price-tag">
                <span className="price-num">$0</span>
                <span className="price-period">/ mo</span>
              </div>
              <p className="price-desc">Develop and validate models using test API keys locally.</p>
              <ul className="pricing-features">
                <li><Check size={14} /> 500 sizing calls / mo</li>
                <li><Check size={14} /> Test keys (\`sk_test_\`) only</li>
                <li><Check size={14} /> Access to all sizing endpoints</li>
                <li><Check size={14} /> PSH database query access</li>
                <li className="disabled"><X size={14} /> Production API keys (\`sk_live_\`)</li>
              </ul>
              <a href="/app" onClick={(e) => navigateToPath('/app', e)} className="btn btn--ghost w-full">Get Test Key</a>
            </div>

            <div className="pricing-card pricing-card--popular">
              <div className="popular-badge">Standard</div>
              <h3>Starter</h3>
              <div className="price-tag">
                <span className="price-num">$8</span>
                <span className="price-period">/ mo</span>
              </div>
              <p className="price-desc">Great for small ecommerce widgets and internal estimators.</p>
              <ul className="pricing-features">
                <li><Check size={14} /> 10,000 production calls / mo</li>
                <li><Check size={14} /> Production keys (\`sk_live_\`)</li>
                <li><Check size={14} /> 99.9% API SLA guarantee</li>
                <li><Check size={14} /> Email alerts at 80% quota</li>
                <li><Check size={14} /> Community forum support</li>
              </ul>
              <a href="/app" onClick={(e) => navigateToPath('/app', e)} className="btn btn--primary w-full">Select Starter</a>
            </div>

            <div className="pricing-card">
              <h3>Growth</h3>
              <div className="price-tag">
                <span className="price-num">$25</span>
                <span className="price-period">/ mo</span>
              </div>
              <p className="price-desc">For highly active customer portals and solar distributor hubs.</p>
              <ul className="pricing-features">
                <li><Check size={14} /> 100,000 production calls / mo</li>
                <li><Check size={14} /> Production keys (\`sk_live_\`)</li>
                <li><Check size={14} /> Faster serverless runtimes</li>
                <li><Check size={14} /> Dedicated slack channels</li>
                <li><Check size={14} /> Custom overage allocations</li>
              </ul>
              <a href="/app" onClick={(e) => navigateToPath('/app', e)} className="btn btn--ghost w-full">Select Growth</a>
            </div>
          </div>
        </div>
      </section>

      <CtaBanner />
    </div>
  );
}

// ─── App Download Page ───────────────────────────────────────────────────────
function DownloadPage() {
  return (
    <div className="download-page animate-fade-in" style={{ paddingTop: '100px' }}>
      <section className="mkt-container">
        <div className="download-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '48px', alignItems: 'center', minHeight: '60dvh', padding: '40px 0' }}>
          {/* Details */}
          <div>
            <div className="mkt-badge" style={{ marginBottom: '16px' }}>Mobile Sizing App</div>
            <h1 className="mkt-section-title" style={{ textAlign: 'left', marginBottom: '20px' }}>Solisys on your phone.</h1>
            <p className="mkt-section-sub" style={{ textAlign: 'left', marginBottom: '32px' }}>
              Design customized, professional-grade solar systems on-site. Fully offline-safe. Auto-syncs directly with your web account.
            </p>

            {/* Badges */}
            <div className="badge-group" style={{ display: 'flex', gap: '16px', marginBottom: '40px', flexWrap: 'wrap' }}>
              <a href="https://apple.com" target="_blank" rel="noreferrer" className="btn btn--ghost" style={{ padding: '12px 24px', background: 'var(--color-surface)', display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Smartphone size={20} />
                <div style={{ textAlign: 'left', lineHeight: 1.2 }}>
                  <span style={{ fontSize: '10px', display: 'block', color: 'var(--color-text-secondary)' }}>Download on the</span>
                  <span style={{ fontSize: '15px', fontWeight: 600 }}>App Store</span>
                </div>
              </a>
              <a href="https://google.com" target="_blank" rel="noreferrer" className="btn btn--ghost" style={{ padding: '12px 24px', background: 'var(--color-surface)', display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Play size={20} />
                <div style={{ textAlign: 'left', lineHeight: 1.2 }}>
                  <span style={{ fontSize: '10px', display: 'block', color: 'var(--color-text-secondary)' }}>GET IT ON</span>
                  <span style={{ fontSize: '15px', fontWeight: 600 }}>Google Play</span>
                </div>
              </a>
            </div>

            {/* Mobile checklist */}
            <ul className="mobile-feat-list" style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <li style={{ display: 'flex', gap: '12px', alignItems: 'start' }}>
                <CheckCircle size={18} style={{ color: 'var(--color-accent)', marginTop: '2px' }} />
                <div>
                  <h5 style={{ margin: 0, fontSize: '15px', fontWeight: 600 }}>One-Decision-Per-Screen Wizard</h5>
                  <p style={{ margin: 0, fontSize: '13px', color: 'var(--color-text-secondary)' }}>An optimized 5-step flow designed specifically for quick customer consultations on active construction sites.</p>
                </div>
              </li>
              <li style={{ display: 'flex', gap: '12px', alignItems: 'start' }}>
                <Globe2 size={18} style={{ color: 'var(--color-accent)', marginTop: '2px' }} />
                <div>
                  <h5 style={{ margin: 0, fontSize: '15px', fontWeight: 600 }}>100% Offline-Safe Execution</h5>
                  <p style={{ margin: 0, fontSize: '13px', color: 'var(--color-text-secondary)' }}>No network signal? No worries. All sizing calculations and NASA PSH data run fully offline locally on your device.</p>
                </div>
              </li>
              <li style={{ display: 'flex', gap: '12px', alignItems: 'start' }}>
                <Zap size={18} style={{ color: 'var(--color-accent)', marginTop: '2px' }} />
                <div>
                  <h5 style={{ margin: 0, fontSize: '15px', fontWeight: 600 }}>Instant WhatsApp Proposal Sharing</h5>
                  <p style={{ margin: 0, fontSize: '13px', color: 'var(--color-text-secondary)' }}>Format results instantly as a beautiful technical breakdown message and dispatch it direct to customer contacts on WhatsApp.</p>
                </div>
              </li>
            </ul>
          </div>

          {/* QR Code Column */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
            <div className="qr-card" style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: '16px', padding: '32px', textAlign: 'center', boxShadow: 'var(--shadow-lg)', maxWidth: '320px' }}>
              <div className="qr-placeholder" style={{ width: '200px', height: '200px', background: 'white', borderRadius: '8px', padding: '10px', margin: '0 auto 20px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {/* SVG representing a futuristic QR code */}
                <svg viewBox="0 0 100 100" style={{ width: '100%', height: '100%', fill: '#0A1F0D' }}>
                  <rect x="0" y="0" width="25" height="25" />
                  <rect x="5" y="5" width="15" height="15" fill="white" />
                  <rect x="9" y="9" width="7" height="7" />
                  
                  <rect x="75" y="0" width="25" height="25" />
                  <rect x="80" y="5" width="15" height="15" fill="white" />
                  <rect x="84" y="84" width="7" height="7" />
                  
                  <rect x="0" y="75" width="25" height="25" />
                  <rect x="5" y="80" width="15" height="15" fill="white" />
                  <rect x="9" y="84" width="7" height="7" />

                  {/* Random pixels */}
                  <rect x="35" y="5" width="5" height="10" />
                  <rect x="45" y="0" width="10" height="5" />
                  <rect x="60" y="10" width="5" height="5" />
                  <rect x="35" y="20" width="15" height="5" />
                  <rect x="40" y="30" width="5" height="20" />
                  <rect x="10" y="40" width="15" height="5" />
                  <rect x="0" y="55" width="5" height="10" />
                  <rect x="20" y="60" width="10" height="5" />
                  <rect x="30" y="70" width="5" height="20" />
                  <rect x="45" y="80" width="15" height="5" />
                  <rect x="60" y="85" width="5" height="10" />
                  <rect x="80" y="35" width="10" height="10" />
                  <rect x="90" y="50" width="5" height="15" />
                  <rect x="65" y="60" width="10" height="5" />
                  <rect x="75" y="70" width="10" height="10" />
                </svg>
              </div>
              <h4 style={{ margin: '0 0 8px', fontSize: '16px', fontWeight: 600 }}>Scan to Download</h4>
              <p style={{ margin: 0, fontSize: '13px', color: 'var(--color-text-secondary)' }}>Point your phone camera to scan the code and load store listings instantly.</p>
            </div>
          </div>
        </div>
      </section>
      <CtaBanner />
    </div>
  );
}

// ─── Pricing Page ────────────────────────────────────────────────────────────
function PricingPage() {
  const [billingPeriod, setBillingPeriod] = useState<'monthly' | 'annual'>('monthly');
  const [currency, setCurrency] = useState<'USD' | 'NGN'>('NGN');
  
  // FAQ Accordion State
  const [faqOpen, setFaqOpen] = useState<number | null>(null);

  const toggleFaq = (index: number) => {
    setFaqOpen(faqOpen === index ? null : index);
  };

  const getPrice = (usd: number, ngn: number, usdAnnual: number, ngnAnnual: number) => {
    if (billingPeriod === 'monthly') {
      return currency === 'USD' ? `$${usd}` : `₦${ngn.toLocaleString()}`;
    } else {
      const discounted = currency === 'USD' ? usdAnnual : ngnAnnual;
      return currency === 'USD' ? `$${discounted}` : `₦${discounted.toLocaleString()}`;
    }
  };

  const faqs = [
    {
      q: "Do I need an account to use the solar calculator?",
      a: "No! Everyday users and DIY-builders can run the complete 5-step Simple Mode flow or detailed 8-section Pro Mode without ever making an account. An account is only required to synchronize designs across mobile/web and generate branded PDF quotes."
    },
    {
      q: "What is the difference between Simple and Pro modes?",
      a: "Simple Mode abstracts advanced engineering concepts (like system voltage, Depth of Discharge, and string calculations) into plain language selections suitable for everyday consumers. Pro Mode exposes exact mathematical settings, MPPT ranges, wire size cross-sections, and generates fully compliant single-line wiring diagrams."
    },
    {
      q: "How does the Widget domain allowlist work?",
      a: "To prevent other websites from copying your widget Site ID and exploiting your monthly completion limits, our server checks the hosting site's domain against your registered allowlist before bootstrapping the custom CSS styles. You can register allowed domains inside your Dashboard."
    },
    {
      q: "What counts as a Hosted API calculation?",
      a: "A 'call' represents a single successful HTTP POST response from any our endpoints (like `/calculate/full` or `/calculate/wire`). Caching, lookup calls to `/cities` or simple server diagnostics `/health` are free and never counted towards your premium quota limits."
    },
    {
      q: "Can I export systems and BOM proposals without paying?",
      a: "Yes! The Free web tier permits unlimited local project saves, WhatsApp proposal exports, standard BOM CSV formatting, and clean PDF proposal calculations. Branded PDF proposals carrying custom installer logos require a Pro subscription."
    }
  ];

  return (
    <div className="pricing-page animate-fade-in" style={{ paddingTop: '100px' }}>
      <section className="mkt-container">
        {/* Header */}
        <div className="pricing-header" style={{ textAlign: 'center', marginBottom: '48px' }}>
          <div className="mkt-badge" style={{ marginBottom: '16px' }}>Pricing & Plans</div>
          <h1 className="mkt-section-title">Simple, transparent sizing tiers.</h1>
          <p className="mkt-section-sub" style={{ margin: '12px auto 32px', maxWidth: '560px' }}>
            Choose the plan that suits your solar workflow. Save 20% by purchasing annually.
          </p>

          {/* Interactive selectors */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
            {/* Billing Period Toggle */}
            <div className="toggle-pill" style={{ maxWidth: '320px' }}>
              <button
                className={`toggle-pill__btn ${billingPeriod === 'monthly' ? 'active' : ''}`}
                onClick={() => setBillingPeriod('monthly')}
              >
                Monthly
              </button>
              <button
                className={`toggle-pill__btn ${billingPeriod === 'annual' ? 'active' : ''}`}
                onClick={() => setBillingPeriod('annual')}
              >
                Annual (Save 20%)
              </button>
            </div>

            {/* Currency Toggle */}
            <div className="toggle-pill" style={{ maxWidth: '240px' }}>
              <button
                className={`toggle-pill__btn ${currency === 'NGN' ? 'active' : ''}`}
                onClick={() => setCurrency('NGN')}
              >
                NGN (₦)
              </button>
              <button
                className={`toggle-pill__btn ${currency === 'USD' ? 'active' : ''}`}
                onClick={() => setCurrency('USD')}
              >
                USD ($)
              </button>
            </div>
          </div>
        </div>

        {/* Pricing Cards Grid */}
        <div className="pricing-tabs-group" style={{ marginBottom: '80px' }}>
          <h3 style={{ fontSize: '20px', fontWeight: 700, fontFamily: 'var(--font-display)', textAlign: 'center', marginBottom: '32px', borderBottom: '1px solid var(--color-border)', paddingBottom: '12px' }}>
            Solisys App (Web & Mobile Suite)
          </h3>
          <div className="pricing-grid">
            <div className="pricing-card">
              <h3>Free</h3>
              <div className="price-tag">
                <span className="price-num">{getPrice(0, 0, 0, 0)}</span>
                <span className="price-period">{billingPeriod === 'monthly' ? '/ mo' : '/ yr'}</span>
              </div>
              <p className="price-desc">Perfect for DIYers and off-grid homeowners sizing personal systems.</p>
              <ul className="pricing-features">
                <li><Check size={14} /> Unlimited local projects (IndexedDB)</li>
                <li><Check size={14} /> Both Simple & Pro modes</li>
                <li><Check size={14} /> Full 8-section layout access</li>
                <li><Check size={14} /> Standard PDF & BOM CSV export</li>
                <li><Check size={14} /> WhatsApp proposal share</li>
              </ul>
              <a href="/app" onClick={(e) => navigateToPath('/app', e)} className="btn btn--ghost w-full">Start Free</a>
            </div>

            <div className="pricing-card pricing-card--popular">
              <div className="popular-badge">Most Popular</div>
              <h3>Pro</h3>
              <div className="price-tag">
                <span className="price-num">{getPrice(5, 4000, 45, 36000)}</span>
                <span className="price-period">{billingPeriod === 'monthly' ? '/ mo' : '/ yr'}</span>
              </div>
              <p className="price-desc">Built for professional solar installers generating technical sales pitches.</p>
              <ul className="pricing-features">
                <li><Check size={14} /> <strong>All Free Features</strong></li>
                <li><Check size={14} /> Live Cloud Sync (Web & Mobile)</li>
                <li><Check size={14} /> Branded PDF reports (Your logo)</li>
                <li><Check size={14} /> Signed read-only shared client links</li>
                <li><Check size={14} /> Project status Pipeline tracker</li>
              </ul>
              <a href="/app" onClick={(e) => navigateToPath('/app', e)} className="btn btn--primary w-full">Start Pro Free Trial</a>
            </div>

            <div className="pricing-card">
              <h3>Team</h3>
              <div className="price-tag">
                <span className="price-num">{getPrice(18, 15000, 162, 135000)}</span>
                <span className="price-period">{billingPeriod === 'monthly' ? '/ mo' : '/ yr'}</span>
              </div>
              <p className="price-desc">For regional installer firms managing multi-member field crews.</p>
              <ul className="pricing-features">
                <li><Check size={14} /> <strong>All Pro Features</strong></li>
                <li><Check size={14} /> Includes 5 installer seats</li>
                <li><Check size={14} /> Shared Component Library</li>
                <li><Check size={14} /> Crew dashboard & activity logs</li>
                <li><Check size={14} /> Priority developer support</li>
              </ul>
              <a href="/app" onClick={(e) => navigateToPath('/app', e)} className="btn btn--ghost w-full">Contact Sales</a>
            </div>
          </div>
        </div>

        {/* FAQ Section */}
        <section className="faq-section" style={{ paddingBottom: '80px' }}>
          <h2 className="mkt-section-title" style={{ textAlign: 'center', marginBottom: '40px' }}>Frequently Asked Questions</h2>
          <div className="faq-accordion" style={{ maxWidth: '720px', margin: '0 auto' }}>
            {faqs.map((faq, idx) => (
              <div key={idx} className="faq-item" style={{ borderBottom: '1px solid var(--color-border)', padding: '16px 0' }}>
                <button
                  className="faq-question"
                  onClick={() => toggleFaq(idx)}
                  style={{ display: 'flex', justifyContent: 'space-between', width: '100%', background: 'none', border: 'none', textAlign: 'left', cursor: 'pointer', padding: 0, alignItems: 'center' }}
                >
                  <span style={{ fontSize: '16px', fontWeight: 600, color: 'var(--color-text-primary)' }}>{faq.q}</span>
                  <CaretDown size={18} style={{ transform: faqOpen === idx ? 'rotate(180deg)' : 'rotate(0)', transition: 'transform var(--duration-fast)' }} />
                </button>
                {faqOpen === idx && (
                  <div className="faq-answer" style={{ marginTop: '12px', fontSize: '14px', color: 'var(--color-text-secondary)', lineHeight: 1.5 }}>
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>
      </section>
      <CtaBanner />
    </div>
  );
}

// ─── Marketing page root ──────────────────────────────────────────────────────
export default function Marketing() {
  const [theme, setTheme] = useState<'dark' | 'light'>(() => {
    const stored = localStorage.getItem('solisys-theme');
    if (stored === 'light' || stored === 'dark') return stored;
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  });

  const [currentPath, setCurrentPath] = useState(window.location.pathname);

  useEffect(() => {
    const onPop = () => {
      setCurrentPath(window.location.pathname);
    };
    window.addEventListener('popstate', onPop);
    return () => window.removeEventListener('popstate', onPop);
  }, []);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('solisys-theme', theme);
  }, [theme]);

  const toggleTheme = () => setTheme(t => t === 'dark' ? 'light' : 'dark');

  // Router within marketing sub-views
  const renderMainContent = () => {
    if (currentPath === '/widget') {
      return <WidgetPage />;
    }
    if (currentPath === '/api') {
      return <ApiPage />;
    }
    if (currentPath === '/download') {
      return <DownloadPage />;
    }
    if (currentPath === '/pricing') {
      return <PricingPage />;
    }
    // Default to main Home landing page
    return (
      <>
        <Hero />
        <Stats />
        <Features />
      </>
    );
  };

  return (
    <div className="mkt-root">
      <Nav onToggleTheme={toggleTheme} theme={theme} currentPath={currentPath} />
      <main>
        {renderMainContent()}
      </main>
      <Footer />
    </div>
  );
}
