// Performance monitoring utilities for the word search game
export interface PerformanceMetrics {
  initialLoadTime: number;
  gameStartTime: number;
  averageFrameTime: number;
  memoryUsage?: {
    used: number;
    total: number;
    limit: number;
  };
  bundleSize?: number;
  chunkLoadTimes: Record<string, number>;
}

class PerformanceMonitor {
  private metrics: Partial<PerformanceMetrics> = {};
  private frameTimeHistory: number[] = [];
  private maxFrameHistory = 60; // Track last 60 frames

  constructor() {
    this.measureInitialLoad();
  }

  private measureInitialLoad() {
    // Measure time from navigation start to DOM content loaded
    if (typeof window !== 'undefined' && window.performance) {
      window.addEventListener('DOMContentLoaded', () => {
        const loadTime = window.performance.now();
        this.metrics.initialLoadTime = loadTime;
        console.log(`Initial load time: ${loadTime.toFixed(2)}ms`);
      });
    }
  }

  markGameStart() {
    this.metrics.gameStartTime = performance.now();
  }

  measureFrameTime() {
    const frameTime = performance.now();
    this.frameTimeHistory.push(frameTime);
    
    if (this.frameTimeHistory.length > this.maxFrameHistory) {
      this.frameTimeHistory.shift();
    }

    // Calculate average frame time
    if (this.frameTimeHistory.length > 1) {
      const frameDurations = [];
      for (let i = 1; i < this.frameTimeHistory.length; i++) {
        frameDurations.push(this.frameTimeHistory[i] - this.frameTimeHistory[i - 1]);
      }
      this.metrics.averageFrameTime = frameDurations.reduce((a, b) => a + b, 0) / frameDurations.length;
    }
  }

  measureMemoryUsage() {
    // @ts-ignore - performance.memory is not in TypeScript types but exists in browsers
    if (typeof window !== 'undefined' && window.performance && window.performance.memory) {
      // @ts-ignore
      const memory = window.performance.memory;
      this.metrics.memoryUsage = {
        used: memory.usedJSHeapSize,
        total: memory.totalJSHeapSize,
        limit: memory.jsHeapSizeLimit
      };
    }
  }

  measureChunkLoadTime(chunkName: string, startTime: number) {
    const loadTime = performance.now() - startTime;
    if (!this.metrics.chunkLoadTimes) {
      this.metrics.chunkLoadTimes = {};
    }
    this.metrics.chunkLoadTimes[chunkName] = loadTime;
    console.log(`Chunk ${chunkName} loaded in ${loadTime.toFixed(2)}ms`);
  }

  getMetrics(): Partial<PerformanceMetrics> {
    this.measureMemoryUsage();
    return { ...this.metrics };
  }

  logPerformanceReport() {
    const metrics = this.getMetrics();
    console.group('🚀 Performance Report');
    console.log('Initial Load Time:', metrics.initialLoadTime?.toFixed(2) + 'ms');
    console.log('Game Start Time:', metrics.gameStartTime?.toFixed(2) + 'ms');
    console.log('Average Frame Time:', metrics.averageFrameTime?.toFixed(2) + 'ms');
    
    if (metrics.memoryUsage) {
      // @ts-ignore
      console.log('Memory Usage:', (metrics.memoryUsage.used / 1024 / 1024).toFixed(2) + 'MB');
    }
    
    if (metrics.chunkLoadTimes) {
      console.log('Chunk Load Times:', metrics.chunkLoadTimes);
    }
    console.groupEnd();
  }

  // Web Vitals-like metrics
  measureLCP(callback?: (value: number) => void) {
    if (typeof window !== 'undefined' && 'PerformanceObserver' in window) {
      try {
        const observer = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          const lastEntry = entries[entries.length - 1];
          const lcp = lastEntry.startTime;
          console.log('Largest Contentful Paint:', lcp.toFixed(2) + 'ms');
          callback?.(lcp);
        });
        observer.observe({ entryTypes: ['largest-contentful-paint'] });
      } catch (error) {
        console.warn('LCP measurement not supported');
      }
    }
  }

  measureFID(callback?: (value: number) => void) {
    if (typeof window !== 'undefined' && 'PerformanceObserver' in window) {
      try {
        const observer = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          entries.forEach((entry) => {
            // @ts-ignore
            const fid = entry.processingStart - entry.startTime;
            console.log('First Input Delay:', fid.toFixed(2) + 'ms');
            callback?.(fid);
          });
        });
        observer.observe({ entryTypes: ['first-input'] });
      } catch (error) {
        console.warn('FID measurement not supported');
      }
    }
  }
}

// Create singleton instance
export const performanceMonitor = new PerformanceMonitor();

// React hook for performance monitoring
export const usePerformanceMonitor = () => {
  const startFrameMonitoring = () => {
    const monitor = () => {
      performanceMonitor.measureFrameTime();
      requestAnimationFrame(monitor);
    };
    requestAnimationFrame(monitor);
  };

  return {
    markGameStart: () => performanceMonitor.markGameStart(),
    getMetrics: () => performanceMonitor.getMetrics(),
    logReport: () => performanceMonitor.logPerformanceReport(),
    startFrameMonitoring,
    measureChunkLoad: (chunkName: string, startTime: number) => 
      performanceMonitor.measureChunkLoadTime(chunkName, startTime)
  };
};