import { useState, useEffect } from 'react';

const MOBILE = 768;
const DESKTOP = 1280;

function getBreakpoint(width) {
  if (width < MOBILE) return 'mobile';
  if (width < DESKTOP) return 'tablet';
  return 'desktop';
}

function getInitialWidth() {
  if (typeof window !== 'undefined') return window.innerWidth;
  return DESKTOP;
}

export function useBreakpoint() {
  const [bp, setBp] = useState(() => getBreakpoint(getInitialWidth()));

  useEffect(() => {
    setBp(getBreakpoint(window.innerWidth));

    let raf;
    const handler = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        setBp(getBreakpoint(window.innerWidth));
      });
    };
    window.addEventListener('resize', handler);
    return () => {
      window.removeEventListener('resize', handler);
      cancelAnimationFrame(raf);
    };
  }, []);

  return {
    breakpoint: bp,
    isMobile: bp === 'mobile',
    isTablet: bp === 'tablet',
    isDesktop: bp === 'desktop',
  };
}
