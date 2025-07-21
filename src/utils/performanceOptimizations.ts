/**
 * Performance Optimizations for Word Search Game
 * This file contains utilities specifically designed to improve drag performance
 * and overall mobile responsiveness
 */

// Performance monitoring interface
interface PerformanceMetrics {
  frameRate: number;
  averageFrameTime: number;
  droppedFrames: number;
  totalFrames: number;
  lagEvents: number;
}

// Throttling and debouncing utilities
export class PerformanceThrottler {
  private lastExecution: number = 0;
  private timeout: number | null = null;

  constructor(private interval: number = 16) {} // Default to ~60fps

  throttle<T extends (...args: any[]) => any>(fn: T): T {
    return ((...args: any[]) => {
      const now = Date.now();
      if (now - this.lastExecution >= this.interval) {
        this.lastExecution = now;
        return fn(...args);
      }
    }) as T;
  }

  debounce<T extends (...args: any[]) => any>(fn: T, delay: number = 100): T {
    return ((...args: any[]) => {
      if (this.timeout) {
        clearTimeout(this.timeout);
      }
      this.timeout = window.setTimeout(() => fn(...args), delay);
    }) as T;
  }
}

// RequestAnimationFrame-based throttling for smooth animations
export class RAFThrottler {
  private rafId: number | null = null;
  private pending: boolean = false;

  throttle<T extends (...args: any[]) => any>(fn: T): T {
    return ((...args: any[]) => {
      if (this.pending) return;
      
      this.pending = true;
      this.rafId = requestAnimationFrame(() => {
        fn(...args);
        this.pending = false;
        this.rafId = null;
      });
    }) as T;
  }

  cancel(): void {
    if (this.rafId) {
      cancelAnimationFrame(this.rafId);
      this.rafId = null;
      this.pending = false;
    }
  }
}

// Touch event optimization for mobile devices
export class TouchEventOptimizer {
  private activeTouches: Map<number, Touch> = new Map();
  private touchStartTime: number = 0;
  private isProcessing: boolean = false;

  // Optimize touch start events
  optimizeTouchStart(event: TouchEvent, callback: (touch: Touch) => void): void {
    if (this.isProcessing) return;
    
    this.isProcessing = true;
    this.touchStartTime = performance.now();
    
    // Store active touches
    Array.from(event.touches).forEach(touch => {
      this.activeTouches.set(touch.identifier, touch);
    });

    // Use RAF for smooth handling
    requestAnimationFrame(() => {
      if (event.touches.length > 0) {
        callback(event.touches[0]);
      }
      this.isProcessing = false;
    });
  }

  // Optimize touch move events with built-in throttling
  optimizeTouchMove(
    event: TouchEvent, 
    callback: (touch: Touch, delta: { x: number; y: number }) => void,
    throttleMs: number = 16
  ): void {
    const now = performance.now();
    
    // Throttle based on time
    if (now - this.touchStartTime < throttleMs) return;
    this.touchStartTime = now;

    // Find the primary touch
    const primaryTouch = Array.from(event.touches).find(touch => 
      this.activeTouches.has(touch.identifier)
    );

    if (!primaryTouch) return;

    // Calculate delta from stored touch
    const storedTouch = this.activeTouches.get(primaryTouch.identifier);
    if (!storedTouch) return;

    const delta = {
      x: primaryTouch.clientX - storedTouch.clientX,
      y: primaryTouch.clientY - storedTouch.clientY
    };

    // Update stored touch
    this.activeTouches.set(primaryTouch.identifier, primaryTouch);

    // Execute callback with RAF for smoothness
    requestAnimationFrame(() => {
      callback(primaryTouch, delta);
    });
  }

  // Clean up touch tracking
  optimizeTouchEnd(event: TouchEvent, callback: () => void): void {
    // Remove ended touches
    Array.from(event.changedTouches).forEach(touch => {
      this.activeTouches.delete(touch.identifier);
    });

    // Execute callback with RAF
    requestAnimationFrame(() => {
      callback();
    });

    this.isProcessing = false;
  }

  // Clear all active touches (useful for cleanup)
  clearTouches(): void {
    this.activeTouches.clear();
    this.isProcessing = false;
  }
}

// Performance monitor for tracking frame rates and lag
export class PerformanceMonitor {
  private metrics: PerformanceMetrics = {
    frameRate: 60,
    averageFrameTime: 16.67,
    droppedFrames: 0,
    totalFrames: 0,
    lagEvents: 0
  };

  private lastFrameTime: number = performance.now();
  private isMonitoring: boolean = false;
  private rafId: number | null = null;

  startMonitoring(): void {
    if (this.isMonitoring) return;
    
    this.isMonitoring = true;
    this.monitorFrame();
  }

  stopMonitoring(): void {
    this.isMonitoring = false;
    if (this.rafId) {
      cancelAnimationFrame(this.rafId);
      this.rafId = null;
    }
  }

  private monitorFrame(): void {
    if (!this.isMonitoring) return;

    const now = performance.now();
    const frameTime = now - this.lastFrameTime;
    
    this.metrics.totalFrames++;
    
    // Update average frame time (exponential moving average)
    this.metrics.averageFrameTime = 
      (this.metrics.averageFrameTime * 0.9) + (frameTime * 0.1);
    
    // Calculate frame rate
    this.metrics.frameRate = 1000 / this.metrics.averageFrameTime;
    
    // Detect dropped frames (anything over 20ms is considered dropped)
    if (frameTime > 20) {
      this.metrics.droppedFrames++;
    }
    
    // Detect lag events (anything over 33ms is significant lag)
    if (frameTime > 33) {
      this.metrics.lagEvents++;
    }
    
    this.lastFrameTime = now;
    this.rafId = requestAnimationFrame(() => this.monitorFrame());
  }

  getMetrics(): PerformanceMetrics {
    return { ...this.metrics };
  }

  getPerformanceScore(): number {
    const frameRateScore = Math.min(this.metrics.frameRate / 60, 1);
    const droppedFramesPenalty = this.metrics.droppedFrames / Math.max(this.metrics.totalFrames, 1);
    const lagPenalty = this.metrics.lagEvents / Math.max(this.metrics.totalFrames, 1);
    
    return Math.max(0, frameRateScore - droppedFramesPenalty - lagPenalty);
  }

  reset(): void {
    this.metrics = {
      frameRate: 60,
      averageFrameTime: 16.67,
      droppedFrames: 0,
      totalFrames: 0,
      lagEvents: 0
    };
  }
}

// DOM optimization utilities
export class DOMOptimizer {
  private static instance: DOMOptimizer;
  private updateQueue: Array<() => void> = [];
  private isProcessingQueue: boolean = false;

  static getInstance(): DOMOptimizer {
    if (!DOMOptimizer.instance) {
      DOMOptimizer.instance = new DOMOptimizer();
    }
    return DOMOptimizer.instance;
  }

  // Batch DOM updates for better performance
  batchUpdate(updateFn: () => void): void {
    this.updateQueue.push(updateFn);
    
    if (!this.isProcessingQueue) {
      this.processQueue();
    }
  }

  private processQueue(): void {
    if (this.updateQueue.length === 0) return;
    
    this.isProcessingQueue = true;
    
    requestAnimationFrame(() => {
      // Process all queued updates in a single frame
      while (this.updateQueue.length > 0) {
        const updateFn = this.updateQueue.shift();
        if (updateFn) {
          updateFn();
        }
      }
      
      this.isProcessingQueue = false;
    });
  }

  // Optimize element style updates
  optimizeStyleUpdate(element: HTMLElement, styles: Partial<CSSStyleDeclaration>): void {
    this.batchUpdate(() => {
      Object.assign(element.style, styles);
    });
  }

  // Optimize class list updates
  optimizeClassUpdate(element: HTMLElement, action: 'add' | 'remove' | 'toggle', className: string): void {
    this.batchUpdate(() => {
      element.classList[action](className);
    });
  }
}

// Hardware acceleration utilities
export const enableHardwareAcceleration = (element: HTMLElement): void => {
  const styles = {
    transform: 'translateZ(0)',
    WebkitTransform: 'translateZ(0)',
    willChange: 'transform',
    backfaceVisibility: 'hidden',
    WebkitBackfaceVisibility: 'hidden'
  };
  
  Object.assign(element.style, styles);
};

export const disableHardwareAcceleration = (element: HTMLElement): void => {
  const properties = [
    'transform',
    'WebkitTransform',
    'willChange',
    'backfaceVisibility',
    'WebkitBackfaceVisibility'
  ];
  
  properties.forEach(prop => {
    element.style.removeProperty(prop);
  });
};

// Memory management utilities
export class MemoryManager {
  private static observers: MutationObserver[] = [];
  private static intervals: number[] = [];
  private static timeouts: number[] = [];

  static addObserver(observer: MutationObserver): void {
    this.observers.push(observer);
  }

  static addInterval(id: number): void {
    this.intervals.push(id);
  }

  static addTimeout(id: number): void {
    this.timeouts.push(id);
  }

  static cleanup(): void {
    // Disconnect all observers
    this.observers.forEach(observer => observer.disconnect());
    this.observers = [];

    // Clear all intervals
    this.intervals.forEach(id => clearInterval(id));
    this.intervals = [];

    // Clear all timeouts
    this.timeouts.forEach(id => clearTimeout(id));
    this.timeouts = [];
  }
}

// Device-specific optimizations
export const getDeviceOptimizations = () => {
  const userAgent = navigator.userAgent;
  const isIOS = /iPad|iPhone|iPod/.test(userAgent);
  const isAndroid = /Android/.test(userAgent);
  const isIPad = /iPad/i.test(userAgent) || (/Macintosh/i.test(userAgent) && 'ontouchend' in document);
  
  return {
    shouldUsePassiveListeners: isIOS || isAndroid,
    shouldPreventScrolling: isIPad,
    recommendedThrottleMs: isIOS ? 16 : (isAndroid ? 20 : 12),
    supportsHardwareAcceleration: true,
    maxConcurrentAnimations: isIOS ? 3 : 5
  };
};

// Export a factory function for creating optimized drag handlers
export const createOptimizedDragHandler = () => {
  const throttler = new RAFThrottler();
  const touchOptimizer = new TouchEventOptimizer();
  const domOptimizer = DOMOptimizer.getInstance();
  const performanceMonitor = new PerformanceMonitor();
  
  return {
    throttler,
    touchOptimizer,
    domOptimizer,
    performanceMonitor,
    
    // Cleanup function
    cleanup: () => {
      throttler.cancel();
      touchOptimizer.clearTouches();
      performanceMonitor.stopMonitoring();
    }
  };
};