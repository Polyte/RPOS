// Simple performance configuration without complex utilities
export const PERFORMANCE_CONFIG = {
  LOADING_TIMEOUT: 1500,
  TRANSITION_TIMEOUT: 800,
  RESIZE_DEBOUNCE: 100,
  ORIENTATION_DELAY: 200,
  MOBILE_BREAKPOINT: 768,
} as const;

// Simple browser detection
export const isMobile = () => 
  typeof window !== 'undefined' && window.innerWidth <= PERFORMANCE_CONFIG.MOBILE_BREAKPOINT;

export const isTablet = () => 
  typeof window !== 'undefined' && 
  window.innerWidth > PERFORMANCE_CONFIG.MOBILE_BREAKPOINT && 
  window.innerWidth <= 1024;

export const isDesktop = () => 
  typeof window !== 'undefined' && window.innerWidth > 1024;

// Simple timing utility
export const timing = {
  start: (label: string) => {
    if (typeof performance !== 'undefined' && process.env.NODE_ENV === 'development') {
      performance.mark(`${label}-start`);
    }
  },
  
  end: (label: string) => {
    if (typeof performance !== 'undefined' && process.env.NODE_ENV === 'development') {
      try {
        performance.mark(`${label}-end`);
        performance.measure(label, `${label}-start`, `${label}-end`);
        const measure = performance.getEntriesByName(label)[0];
        console.log(`⚡ ${label}: ${measure.duration.toFixed(2)}ms`);
      } catch (e) {
        // Ignore timing errors
      }
    }
  }
};

// Simple debounce utility
export const debounce = <T extends (...args: any[]) => any>(
  func: T,
  wait: number
): ((...args: Parameters<T>) => void) => {
  let timeoutId: number | undefined;
  
  return (...args: Parameters<T>) => {
    clearTimeout(timeoutId);
    timeoutId = window.setTimeout(() => func(...args), wait);
  };
};

// Export simplified utilities
export const performanceUtils = {
  config: PERFORMANCE_CONFIG,
  isMobile,
  isTablet,
  isDesktop,
  timing,
  debounce
};