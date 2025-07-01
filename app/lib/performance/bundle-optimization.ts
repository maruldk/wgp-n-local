
export const DYNAMIC_IMPORTS = {
  // Charts (large libraries)
  PlotlyChart: () => import('react-plotly.js'),
  
  // AI Components
  AIEnhancedAnalytics: () => import('@/components/ai/ai-enhanced-analytics'),
  MLDashboard: () => import('@/components/ai/ml-dashboard'),
  PredictiveAnalytics: () => import('@/components/ai/predictive-analytics-panel'),
  
  // Report Builder (heavy components)
  ReportBuilder: () => import('@/components/analytics/report-builder'),
  DashboardBuilder: () => import('@/components/analytics/dashboard-builder'),
  
  // Advanced widgets
  AdvancedWidgets: () => import('@/components/widgets/advanced-widgets'),
  CustomChartBuilder: () => import('@/components/analytics/custom-chart-builder'),
} as const;

export class BundleOptimizer {
  
  // Lazy load component configuration
  static createLazyComponentConfig(importPath: string) {
    return {
      path: importPath,
      loading: 'Loading component...',
      error: 'Component failed to load',
      timeout: 10000,
    };
  }

  // Preload critical components
  static preloadCriticalComponents() {
    if (typeof window !== 'undefined') {
      // Preload charts on user interaction
      const preloadCharts = () => {
        DYNAMIC_IMPORTS.CustomChartBuilder();
        document.removeEventListener('mouseenter', preloadCharts);
        document.removeEventListener('scroll', preloadCharts);
      };

      document.addEventListener('mouseenter', preloadCharts);
      document.addEventListener('scroll', preloadCharts);
    }
  }

  // Resource hints for better loading
  static generateResourceHints(): string[] {
    const hints = [
      // Preconnect to external domains
      '<link rel="preconnect" href="https://fonts.googleapis.com">',
      '<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>',
      
      // DNS prefetch for third-party services
      '<link rel="dns-prefetch" href="//api.openai.com">',
      '<link rel="dns-prefetch" href="//cdn.jsdelivr.net">',
      
      // Preload critical CSS
      '<link rel="preload" href="/styles/critical.css" as="style">',
      
      // Preload important fonts
      '<link rel="preload" href="/fonts/inter-var.woff2" as="font" type="font/woff2" crossorigin>',
    ];

    return hints;
  }

  // Bundle size analysis
  static analyzeBundleSize() {
    if (process.env.NODE_ENV === 'development' && typeof window !== 'undefined') {
      const observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (entry.name.includes('chunk') || entry.name.includes('bundle')) {
            console.log(`📦 Bundle loaded: ${entry.name} (${(entry as PerformanceResourceTiming).transferSize || 0} bytes)`);
          }
        }
      });
      
      observer.observe({ entryTypes: ['resource'] });
    }
  }

  // Tree shaking helpers
  static readonly TREE_SHAKEABLE_IMPORTS = {
    // Import only specific icons
    icons: 'import { BarChart3, TrendingUp } from "lucide-react"',
    
    // Import specific chart types
    recharts: 'import { LineChart, BarChart } from "recharts"',
    
    // Import specific utilities
    lodash: 'import debounce from "lodash/debounce"',
    
    // Import specific date functions
    dateFns: 'import { format, parseISO } from "date-fns"',
  } as const;
}

// React lazy loading utilities
export const LAZY_COMPONENT_CONFIG = {
  loadingComponent: 'loading-skeleton',
  errorComponent: 'error-boundary',
  retryAttempts: 3,
  timeout: 10000,
};

// Critical CSS inlining
export const CRITICAL_CSS = `
  /* Critical above-the-fold styles */
  .loading-skeleton {
    background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
    background-size: 200% 100%;
    animation: loading 1.5s infinite;
  }
  
  @keyframes loading {
    0% { background-position: 200% 0; }
    100% { background-position: -200% 0; }
  }
  
  .fade-in {
    animation: fadeIn 0.3s ease-in-out;
  }
  
  @keyframes fadeIn {
    from { opacity: 0; transform: translateY(10px); }
    to { opacity: 1; transform: translateY(0); }
  }
`;
