import React, { useEffect, useRef, useState } from 'react';
import { Sun, Zap, BarChart3, Globe2, ArrowRight, ChevronRight, Menu, X } from 'lucide-react';
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

// ─── Nav ─────────────────────────────────────────────────────────────────────
function Nav({ onToggleTheme, theme }: { onToggleTheme: () => void; theme: string }) {
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
        {/* Logo */}
        <a href="/" className="mkt-nav__logo" aria-label="Solisys home">
          <Sun size={22} strokeWidth={2} />
          <span>Solisys</span>
        </a>

        {/* Desktop links */}
        <div className="mkt-nav__links" role="menubar">
          <a href="#features" className="mkt-nav__link" role="menuitem">Features</a>
          <a href="#widget" className="mkt-nav__link" role="menuitem">Widget</a>
          <a href="#api" className="mkt-nav__link" role="menuitem">API</a>
          <a href="#download" className="mkt-nav__link" role="menuitem">Download</a>
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
          <a href="/app" className="btn btn--primary btn--sm">
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
          <a href="#features" onClick={() => setMenuOpen(false)}>Features</a>
          <a href="#widget" onClick={() => setMenuOpen(false)}>Widget</a>
          <a href="#api" onClick={() => setMenuOpen(false)}>API</a>
          <a href="#download" onClick={() => setMenuOpen(false)}>Download</a>
          <a href="/app" className="btn btn--primary btn--sm" style={{ marginTop: 8 }}>
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
          Size your solar system
          <br />
          <span className="mkt-hero__accent">accurately, instantly.</span>
        </h1>

        <p className="mkt-hero__sub animate-fade-up-in" style={{ animationDelay: '160ms' }}>
          Solisys is a professional-grade solar PV calculator built for engineers,
          installers, and serious DIY builders. From load analysis to wire sizing —
          all in one place.
        </p>

        <div className="mkt-hero__actions animate-fade-up-in" style={{ animationDelay: '240ms' }}>
          <a href="/app" id="hero-cta-primary" className="btn btn--primary btn--lg">
            Open Calculator
            <ArrowRight size={18} />
          </a>
          <a href="#features" id="hero-cta-secondary" className="btn btn--ghost btn--lg">
            See how it works
            <ChevronRight size={16} />
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
          <div className="mkt-mockup__logo-mini"><Sun size={14} /></div>
          {['Load', 'Battery', 'Inverter', 'Solar', 'Wire'].map((s, i) => (
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
              { label: 'DoD', val: '80%' },
              { label: 'Voltage', val: '48 V' },
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
            { label: 'BANK SIZE', val: '12.0', unit: 'kWh' },
            { label: 'CHARGE CTRL', val: '60', unit: 'A' },
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
  const c1 = useCounter(19000, 1200, visible);
  const c2 = useCounter(127, 1000, visible);
  const c3 = useCounter(74, 800, visible);

  return (
    <section className="mkt-stats" aria-label="Platform statistics">
      <div className="mkt-container">
        <div className="mkt-stats__grid" ref={ref}>
          {[
            { val: c1, suffix: 'K+', label: 'Systems designed', ready: visible },
            { val: c2, suffix: '', label: 'Countries using Solisys', ready: visible },
            { val: c3, suffix: '', label: 'Cities with PSH data', ready: visible },
          ].map((s) => (
            <div key={s.label} className="mkt-stat">
              <span className="mkt-stat__value">
                {s.val >= 1000 ? `${(s.val / 1000).toFixed(s.val < 10000 ? 1 : 0)}${s.suffix}` : `${s.val}${s.suffix}`}
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
              <a href="/app" className="mkt-feature-card__link">
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
          <a href="/app" id="cta-open-app" className="btn btn--primary btn--lg">
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
        <a href="/" className="mkt-footer__brand">
          <Sun size={18} />
          <span>Solisys</span>
        </a>
        <p className="mkt-footer__copy">
          &copy; {new Date().getFullYear()} Solisys. Open-source solar sizing tool.
        </p>
        <nav className="mkt-footer__links" aria-label="Footer navigation">
          <a href="/app">App</a>
          <a href="#widget">Widget</a>
          <a href="#api">API</a>
        </nav>
      </div>
    </footer>
  );
}

// ─── Marketing page root ──────────────────────────────────────────────────────
export default function Marketing() {
  const [theme, setTheme] = useState<'dark' | 'light'>(() => {
    const stored = localStorage.getItem('solisys-theme');
    if (stored === 'light' || stored === 'dark') return stored;
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  });

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('solisys-theme', theme);
  }, [theme]);

  const toggleTheme = () => setTheme(t => t === 'dark' ? 'light' : 'dark');

  return (
    <div className="mkt-root">
      <Nav onToggleTheme={toggleTheme} theme={theme} />
      <main>
        <Hero />
        <Stats />
        <Features />
        <CtaBanner />
      </main>
      <Footer />
    </div>
  );
}
