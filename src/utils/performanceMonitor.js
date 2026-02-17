/**
 * Performance Monitoring Utility
 * Tracks bundle size impact and lazy loading metrics
 */

export class PerformanceMonitor {
  constructor() {
    this.metrics = {
      initialLoad: null,
      chunkLoads: [],
      componentRenders: [],
    };

    if (typeof window !== 'undefined' && window.performance) {
      this.init();
    }
  }

  init() {
    // Track initial page load
    window.addEventListener('load', () => {
      const perfData = window.performance.timing;
      const loadTime = perfData.loadEventEnd - perfData.navigationStart;

      this.metrics.initialLoad = {
        total: loadTime,
        domReady: perfData.domContentLoadedEventEnd - perfData.navigationStart,
        resources: perfData.loadEventEnd - perfData.domContentLoadedEventEnd,
        timestamp: new Date().toISOString(),
      };

      if (process.env.NODE_ENV === 'development') {
        console.log('📊 Performance Metrics:', this.metrics.initialLoad);
      }
    });

    // Track chunk loads (lazy loaded components)
    if (window.performance.getEntriesByType) {
      const observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (entry.name.includes('.chunk.js')) {
            this.metrics.chunkLoads.push({
              name: entry.name.split('/').pop(),
              duration: entry.duration,
              size: entry.transferSize,
              timestamp: new Date().toISOString(),
            });

            if (process.env.NODE_ENV === 'development') {
              console.log(
                `🧩 Chunk loaded: ${entry.name.split('/').pop()} (${entry.duration.toFixed(2)}ms)`
              );
            }
          }
        }
      });

      observer.observe({ entryTypes: ['resource'] });
    }
  }

  /**
   * Track component render time
   */
  trackComponentRender(componentName, startTime) {
    const duration = performance.now() - startTime;

    this.metrics.componentRenders.push({
      component: componentName,
      duration,
      timestamp: new Date().toISOString(),
    });

    if (process.env.NODE_ENV === 'development' && duration > 16) {
      console.warn(`⚠️ Slow render: ${componentName} (${duration.toFixed(2)}ms)`);
    }

    return duration;
  }

  /**
   * Get summary of performance metrics
   */
  getSummary() {
    const chunkCount = this.metrics.chunkLoads.length;
    const totalChunkTime = this.metrics.chunkLoads.reduce((sum, chunk) => sum + chunk.duration, 0);
    const avgChunkTime = chunkCount > 0 ? totalChunkTime / chunkCount : 0;

    return {
      initialLoad: this.metrics.initialLoad,
      lazyLoading: {
        chunksLoaded: chunkCount,
        totalTime: totalChunkTime,
        averageTime: avgChunkTime,
      },
      rendering: {
        componentsRendered: this.metrics.componentRenders.length,
        slowRenders: this.metrics.componentRenders.filter((r) => r.duration > 16).length,
      },
    };
  }

  /**
   * Log performance summary to console
   */
  logSummary() {
    const summary = this.getSummary();

    console.group('📊 Performance Summary');
    console.log('Initial Load:', summary.initialLoad);
    console.log('Lazy Loading:', summary.lazyLoading);
    console.log('Rendering:', summary.rendering);
    console.groupEnd();

    return summary;
  }

  /**
   * Export metrics as JSON
   */
  exportMetrics() {
    return JSON.stringify(this.metrics, null, 2);
  }
}

// Create singleton instance
export const perfMonitor = new PerformanceMonitor();

/**
 * React hook for tracking component render performance
 */
export const useRenderTracking = (componentName) => {
  if (process.env.NODE_ENV === 'development') {
    const startTime = performance.now();

    return () => {
      perfMonitor.trackComponentRender(componentName, startTime);
    };
  }

  return () => {}; // No-op in production
};

/**
 * Higher-order component for automatic performance tracking
 */
export const withPerformanceTracking = (Component, componentName) => {
  if (process.env.NODE_ENV !== 'development') {
    return Component;
  }

  return function PerformanceTrackedComponent(props) {
    const trackRender = useRenderTracking(componentName || Component.name || 'Unknown');

    React.useEffect(() => {
      trackRender();
    });

    return React.createElement(Component, props);
  };
};

// Expose to window for debugging in development
if (process.env.NODE_ENV === 'development' && typeof window !== 'undefined') {
  window.__perfMonitor = perfMonitor;
  console.log('💡 Tip: Use window.__perfMonitor.logSummary() to see performance metrics');
}
