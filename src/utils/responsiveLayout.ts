/**
 * Responsive Layout Utilities for Word Search Game
 * This file contains utility functions to handle responsive layouts for different screen sizes
 * with enhanced performance optimizations for mobile drag interactions
 */

import { PerformanceThrottler, RAFThrottler } from './performanceOptimizations';

// Screen size breakpoints
export const BREAKPOINTS = {
  xs: 360,  // Extra small screens (small phones)
  sm: 480,  // Small screens (phones)
  md: 768,  // Medium screens (tablets)
  lg: 1024, // Large screens (laptops)
  xl: 1280  // Extra large screens (desktops)
};

// Interface for responsive sizes
interface ResponsiveSizes<T> {
  xs: T;
  sm: T;
  md: T;
  lg: T;
  xl: T;
}

// Device capabilities interface
interface DeviceCapabilities {
  supportsTouch: boolean;
  supportsHardwareAcceleration: boolean;
  maxConcurrentAnimations: number;
  recommendedThrottleMs: number;
  preferredScrollBehavior: 'smooth' | 'auto';
}

/**
 * Get device capabilities for optimization purposes
 */
export function getDeviceCapabilities(): DeviceCapabilities {
  const userAgent = navigator.userAgent;
  const isIOS = /iPad|iPhone|iPod/.test(userAgent);
  const isAndroid = /Android/.test(userAgent);
  const isDesktop = !isIOS && !isAndroid && !('ontouchstart' in window);
  
  return {
    supportsTouch: 'ontouchstart' in window,
    supportsHardwareAcceleration: !isAndroid || window.innerWidth >= 768, // Avoid HA on low-end Android
    maxConcurrentAnimations: isIOS ? 4 : (isAndroid ? 2 : 6),
    recommendedThrottleMs: isIOS ? 16 : (isAndroid ? 20 : 12),
    preferredScrollBehavior: isDesktop ? 'smooth' : 'auto'
  };
}

/**
 * Get responsive value based on current screen width with caching for performance
 * @param values - Object containing values for different screen sizes
 * @returns The appropriate value for the current screen size
 */
export function getResponsiveValue<T>(values: ResponsiveSizes<T>): T {
  const width = window.innerWidth;

  // Use a more efficient approach with early returns
  if (width < BREAKPOINTS.xs) return values.xs;
  if (width < BREAKPOINTS.sm) return values.sm;
  if (width < BREAKPOINTS.md) return values.md;
  if (width < BREAKPOINTS.lg) return values.lg;
  return values.xl;
}

/**
 * Get current breakpoint name based on screen width
 * @returns Current breakpoint name
 */
export function getCurrentBreakpoint(): keyof typeof BREAKPOINTS {
  const width = window.innerWidth;
  
  if (width < BREAKPOINTS.xs) return 'xs';
  if (width < BREAKPOINTS.sm) return 'sm';
  if (width < BREAKPOINTS.md) return 'md';
  if (width < BREAKPOINTS.lg) return 'lg';
  return 'xl';
}

/**
 * Get responsive font size based on current screen width
 * @param baseSize - Base font size in pixels
 * @param scaleFactor - Scale factor for different screen sizes (default: 0.8)
 * @returns Font size in pixels for the current screen size
 */
export function getResponsiveFontSize(baseSize: number, scaleFactor: number = 0.8): string {
  const width = window.innerWidth;

  if (width < BREAKPOINTS.xs) return `${baseSize * scaleFactor * 0.8}px`;
  if (width < BREAKPOINTS.sm) return `${baseSize * scaleFactor}px`;
  if (width < BREAKPOINTS.md) return `${baseSize * 0.9}px`;
  return `${baseSize}px`;
}

/**
 * Get responsive padding based on current screen width
 * @param basePadding - Base padding in pixels
 * @returns Padding in pixels for the current screen size
 */
export function getResponsivePadding(basePadding: number): string {
  return getResponsiveValue({
    xs: `${basePadding * 0.5}px`,
    sm: `${basePadding * 0.75}px`,
    md: `${basePadding * 0.85}px`,
    lg: `${basePadding}px`,
    xl: `${basePadding}px`
  });
}

/**
 * Get responsive grid size based on current screen width
 * @param baseSize - Base grid size in pixels
 * @returns Grid size in pixels for the current screen size
 */
export function getResponsiveGridSize(baseSize: number): number {
  return parseInt(getResponsiveValue({
    xs: `${baseSize * 0.6}`,
    sm: `${baseSize * 0.7}`,
    md: `${baseSize * 0.8}`,
    lg: `${baseSize * 0.9}`,
    xl: `${baseSize}`
  }));
}

/**
 * Get compact padding for mobile layouts
 * @param basePadding - Base padding in pixels
 * @returns Compact padding for mobile layouts
 */
export function getCompactMobilePadding(basePadding: number): string {
  return getResponsiveValue({
    xs: `${basePadding * 0.3}px`,
    sm: `${basePadding * 0.4}px`,
    md: `${basePadding * 0.5}px`,
    lg: `${basePadding * 0.75}px`,
    xl: `${basePadding}px`
  });
}

/**
 * Get responsive icon size for mobile layouts
 * @param baseSize - Base icon size in pixels
 * @returns Icon size for the current screen size
 */
export function getResponsiveIconSize(baseSize: number): number {
  return parseInt(getResponsiveValue({
    xs: `${baseSize * 0.7}`,
    sm: `${baseSize * 0.8}`,
    md: `${baseSize * 0.9}`,
    lg: `${baseSize}`,
    xl: `${baseSize}`
  }));
}

/**
 * Check if the device is in landscape orientation
 * @returns True if the device is in landscape orientation
 */
export function isLandscapeOrientation(): boolean {
  return window.innerWidth > window.innerHeight;
}

/**
 * Check if the device is a mobile phone (not a tablet)
 * @returns True if the device is a mobile phone
 */
export function isMobilePhone(): boolean {
  const isMobile = /Android|webOS|iPhone|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
  const isSmallScreen = window.innerWidth < BREAKPOINTS.md;
  return isMobile && isSmallScreen;
}

/**
 * Check if the device is a tablet
 * @returns True if the device is a tablet
 */
export function isTablet(): boolean {
  // Check for iPad specifically
  const isIPad = /iPad/i.test(navigator.userAgent) || 
                 (/Macintosh/i.test(navigator.userAgent) && 'ontouchend' in document);
  
  // Check for Android tablets
  const isAndroidTablet = /Android(?!.*Mobile)/i.test(navigator.userAgent);
  
  // Check for medium-sized screens (typical tablet dimensions)
  const isMediumScreen = window.innerWidth >= BREAKPOINTS.md && window.innerWidth < BREAKPOINTS.lg;
  
  return isIPad || isAndroidTablet || isMediumScreen;
}

/**
 * Check if the device is specifically an iPad
 * @returns True if the device is an iPad
 */
export function isIPad(): boolean {
  // Direct iPad detection
  const isDirectIPad = /iPad/i.test(navigator.userAgent);
  
  // Modern iPads report as Macintosh in user agent but have touch capabilities
  const isModernIPad = /Macintosh/i.test(navigator.userAgent) && 'ontouchend' in document;
  
  // Additional check for iPad dimensions (typical iPad aspect ratios and sizes)
  const screenWidth = window.innerWidth;
  const screenHeight = window.innerHeight;
  const aspectRatio = screenWidth / screenHeight;
  
  // iPad aspect ratios are typically between 0.65 and 0.77 (portrait) or 1.3 and 1.55 (landscape)
  const hasIPadAspectRatio = (aspectRatio >= 0.65 && aspectRatio <= 0.77) || 
                             (aspectRatio >= 1.3 && aspectRatio <= 1.55);
  
  // iPad screen sizes typically range from 768px to 1366px
  const hasIPadScreenSize = (screenWidth >= 768 && screenWidth <= 1366) || 
                            (screenHeight >= 768 && screenHeight <= 1366);
  
  return isDirectIPad || (isModernIPad && hasIPadAspectRatio && hasIPadScreenSize);
}

/**
 * Get iPad model information based on screen dimensions
 * @returns Object with iPad model information
 */
export function getIPadInfo(): { 
  model: 'iPad' | 'iPad Pro' | 'iPad Mini' | 'iPad Air' | 'unknown', 
  size: '11-inch' | '12.9-inch' | '10.9-inch' | '10.2-inch' | '8.3-inch' | 'unknown',
  orientation: 'portrait' | 'landscape'
} {
  const screenWidth = window.innerWidth;
  const screenHeight = window.innerHeight;
  const isLandscape = screenWidth > screenHeight;
  
  // Default return value
  const defaultInfo = {
    model: 'unknown' as const,
    size: 'unknown' as const,
    orientation: isLandscape ? 'landscape' as const : 'portrait' as const
  };
  
  // Return early if not an iPad
  if (!isIPad()) return defaultInfo;
  
  // Get the longer and shorter dimensions
  const longSide = Math.max(screenWidth, screenHeight);
  const shortSide = Math.min(screenWidth, screenHeight);
  
  // iPad Pro 12.9-inch (2048x2732 or 2732x2048)
  if (longSide >= 2000 && longSide <= 2800 && shortSide >= 1500 && shortSide <= 2100) {
    return {
      model: 'iPad Pro',
      size: '12.9-inch',
      orientation: isLandscape ? 'landscape' : 'portrait'
    };
  }
  
  // iPad Pro 11-inch (1668x2388 or 2388x1668)
  if (longSide >= 2200 && longSide <= 2400 && shortSide >= 1600 && shortSide <= 1700) {
    return {
      model: 'iPad Pro',
      size: '11-inch',
      orientation: isLandscape ? 'landscape' : 'portrait'
    };
  }
  
  // iPad Air (1640x2360 or 2360x1640)
  if (longSide >= 2300 && longSide <= 2400 && shortSide >= 1600 && shortSide <= 1700) {
    return {
      model: 'iPad Air',
      size: '10.9-inch',
      orientation: isLandscape ? 'landscape' : 'portrait'
    };
  }
  
  // iPad 10.2-inch (1620x2160 or 2160x1620)
  if (longSide >= 2100 && longSide <= 2200 && shortSide >= 1600 && shortSide <= 1700) {
    return {
      model: 'iPad',
      size: '10.2-inch',
      orientation: isLandscape ? 'landscape' : 'portrait'
    };
  }
  
  // iPad Mini (1488x2266 or 2266x1488)
  if (longSide >= 2200 && longSide <= 2300 && shortSide >= 1400 && shortSide <= 1500) {
    return {
      model: 'iPad Mini',
      size: '8.3-inch',
      orientation: isLandscape ? 'landscape' : 'portrait'
    };
  }
  
  // Fallback for older iPads or when resolution detection is not precise
  return {
    model: 'iPad',
    size: 'unknown',
    orientation: isLandscape ? 'landscape' : 'portrait'
  };
}

/**
 * Enhanced viewport setup for better mobile experience with performance optimizations
 */
export function setupMobileViewport(): void {
  // Find existing viewport meta tag
  let viewportMeta = document.querySelector('meta[name="viewport"]');

  // Create one if it doesn't exist
  if (!viewportMeta) {
    viewportMeta = document.createElement('meta');
    viewportMeta.setAttribute('name', 'viewport');
    document.head.appendChild(viewportMeta);
  }

  // Enhanced viewport content with device-specific optimizations
  const isIPadDevice = isIPad();
  const isLandscape = isLandscapeOrientation();
  
  let viewportContent = 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no';
  
  if (isIPadDevice) {
    // iPad-specific viewport optimizations
    viewportContent += ', viewport-fit=cover, minimal-ui';
    if (isLandscape) {
      viewportContent += ', shrink-to-fit=no';
    }
  }

  viewportMeta.setAttribute('content', viewportContent);

  // Add other mobile-specific meta tags with performance considerations
  const metaTags = [
    { name: 'apple-mobile-web-app-capable', content: 'yes' },
    { name: 'apple-mobile-web-app-status-bar-style', content: 'black-translucent' },
    { name: 'format-detection', content: 'telephone=no' },
    { name: 'mobile-web-app-capable', content: 'yes' },
    { name: 'apple-touch-fullscreen', content: 'yes' },
    { name: 'theme-color', content: '#000000' },
    { name: 'msapplication-TileColor', content: '#000000' }
  ];

  metaTags.forEach(meta => {
    if (!document.querySelector(`meta[name="${meta.name}"]`)) {
      const metaTag = document.createElement('meta');
      metaTag.setAttribute('name', meta.name);
      metaTag.setAttribute('content', meta.content);
      document.head.appendChild(metaTag);
    }
  });

  // Set CSS custom properties for viewport height (handles mobile browser toolbar issues)
  const setViewportHeight = () => {
    const vh = window.innerHeight * 0.01;
    document.documentElement.style.setProperty('--vh', `${vh}px`);
  };
  
  setViewportHeight();
  
  // Throttled resize handler for better performance
  const throttler = new PerformanceThrottler(100);
  const throttledResize = throttler.throttle(setViewportHeight);
  
  window.addEventListener('resize', throttledResize);
  window.addEventListener('orientationchange', throttledResize);
}

// Extended Screen interface for better type safety
interface ExtendedScreenOrientation {
  lock?: (orientation: string) => Promise<void>;
  unlock?: () => void;
}

interface ExtendedScreen extends Omit<Screen, 'orientation'> {
  orientation?: ExtendedScreenOrientation;
  msLockOrientation?: (orientation: string | string[]) => boolean;
  mozLockOrientation?: (orientation: string | string[]) => boolean;
}

// Result type for orientation lock operations
interface OrientationLockResult {
  success: boolean;
  method?: 'modern' | 'ms' | 'moz' | 'none';
  error?: string;
}

/**
 * Check if screen orientation lock is supported
 * @returns Object indicating support status and available methods
 */
export function checkOrientationLockSupport(): {
  supported: boolean;
  methods: Array<'modern' | 'ms' | 'moz'>;
} {
  const extendedScreen = screen as ExtendedScreen;
  const methods: Array<'modern' | 'ms' | 'moz'> = [];

  if (extendedScreen.orientation?.lock) {
    methods.push('modern');
  }
  if (extendedScreen.msLockOrientation) {
    methods.push('ms');
  }
  if (extendedScreen.mozLockOrientation) {
    methods.push('moz');
  }

  return {
    supported: methods.length > 0,
    methods
  };
}

/**
 * Lock screen orientation for mobile devices with improved error handling
 * @param orientation - The orientation to lock to ('portrait' or 'landscape')
 * @returns Promise that resolves with operation result
 */
export async function lockScreenOrientation(
  orientation: 'portrait' | 'landscape'
): Promise<OrientationLockResult> {
  const extendedScreen = screen as ExtendedScreen;
  
  try {
    // Use the modern Screen Orientation API if available
    if (extendedScreen.orientation?.lock) {
      await extendedScreen.orientation.lock(orientation);
      return { success: true, method: 'modern' };
    }
    
    // Fallback for Internet Explorer/Edge
    if (extendedScreen.msLockOrientation) {
      const success = extendedScreen.msLockOrientation(orientation);
      return { success, method: 'ms' };
    }
    
    // Fallback for Firefox
    if (extendedScreen.mozLockOrientation) {
      const success = extendedScreen.mozLockOrientation(orientation);
      return { success, method: 'moz' };
    }
    
    // No orientation lock API available
    return { 
      success: false, 
      method: 'none',
      error: 'Screen orientation lock API not available' 
    };
    
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.warn('Screen orientation lock failed:', errorMessage);
    return { 
      success: false, 
      error: errorMessage 
    };
  }
}

/**
 * Unlock screen orientation (allow rotation)
 * @returns Promise that resolves with operation result
 */
export async function unlockScreenOrientation(): Promise<OrientationLockResult> {
  const extendedScreen = screen as ExtendedScreen;
  
  try {
    // Use the modern Screen Orientation API if available
    if (extendedScreen.orientation?.unlock) {
      await (extendedScreen.orientation as any).unlock();
      return { success: true, method: 'modern' };
    }
    
    // Fallback for older browsers
    if ((extendedScreen as any).msUnlockOrientation) {
      const success = (extendedScreen as any).msUnlockOrientation();
      return { success, method: 'ms' };
    }
    
    if ((extendedScreen as any).mozUnlockOrientation) {
      const success = (extendedScreen as any).mozUnlockOrientation();
      return { success, method: 'moz' };
    }
    
    return { 
      success: false, 
      method: 'none',
      error: 'Screen orientation unlock API not available' 
    };
    
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.warn('Screen orientation unlock failed:', errorMessage);
    return { 
      success: false, 
      error: errorMessage 
    };
  }
}

// Theme interface for better type safety
interface Theme {
  gridBg: string;
  secondary: string;
  [key: string]: string;
}

// Mini-map configuration with performance optimizations
interface MiniMapConfig {
  width: number;
  height: number;
  borderRadius: number;
  padding: number;
  hideDelay: number;
  position: {
    right: string;
    top: string;
  };
  enableHardwareAcceleration: boolean;
  throttleUpdates: boolean;
}

// Default mini-map configuration
const DEFAULT_MINIMAP_CONFIG: MiniMapConfig = {
  width: 30,
  height: 60,
  borderRadius: 15,
  padding: 5,
  hideDelay: 2000,
  position: {
    right: '8px',
    top: '50%'
  },
  enableHardwareAcceleration: true,
  throttleUpdates: true
};

/**
 * Create a mini-map indicator for grid navigation with enhanced performance optimizations
 * @param gridElement - The grid element to create a mini-map for
 * @param containerElement - The container element to append the mini-map to
 * @param theme - The current theme object
 * @param config - Optional configuration for mini-map appearance
 * @returns Cleanup function to remove event listeners and mini-map
 */
export function createGridMiniMap(
  gridElement: HTMLElement, 
  containerElement: HTMLElement, 
  theme: Theme,
  config: Partial<MiniMapConfig> = {}
): () => void {
  const finalConfig = { ...DEFAULT_MINIMAP_CONFIG, ...config };
  const capabilities = getDeviceCapabilities();
  
  // Remove any existing mini-map
  const existingMiniMap = document.getElementById('grid-mini-map');
  if (existingMiniMap) {
    existingMiniMap.remove();
  }

  // Create mini-map container with improved styling and hardware acceleration
  const miniMap = document.createElement('div');
  miniMap.id = 'grid-mini-map';
  
  // Apply styles using Object.assign for better performance
  const baseStyles: Partial<CSSStyleDeclaration> = {
    position: 'absolute',
    right: finalConfig.position.right,
    top: finalConfig.position.top,
    transform: 'translateY(-50%)',
    width: `${finalConfig.width}px`,
    height: `${finalConfig.height}px`,
    backgroundColor: `${theme.gridBg}80`,
    borderRadius: `${finalConfig.borderRadius}px`,
    boxShadow: '0 2px 10px rgba(0, 0, 0, 0.2)',
    zIndex: '10',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    padding: `${finalConfig.padding}px`,
    opacity: '0.7',
    transition: 'opacity 0.3s ease',
    pointerEvents: 'none'
  };

  // Add hardware acceleration if supported and enabled
  if (finalConfig.enableHardwareAcceleration && capabilities.supportsHardwareAcceleration) {
    Object.assign(baseStyles, {
      transform: 'translateY(-50%) translateZ(0)',
      willChange: 'opacity, transform',
      backfaceVisibility: 'hidden'
    });
  }

  Object.assign(miniMap.style, baseStyles);

  // Create indicator with improved styling and performance
  const indicator = document.createElement('div');
  const indicatorSize = finalConfig.width - (finalConfig.padding * 2);
  
  const indicatorStyles: Partial<CSSStyleDeclaration> = {
    width: `${indicatorSize}px`,
    height: `${indicatorSize}px`,
    backgroundColor: theme.secondary,
    borderRadius: '50%',
    position: 'absolute',
    left: `${finalConfig.padding}px`,
    top: `${finalConfig.padding}px`,
    transition: 'top 0.3s ease',
    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.3)'
  };

  // Add hardware acceleration for indicator if supported
  if (finalConfig.enableHardwareAcceleration && capabilities.supportsHardwareAcceleration) {
    Object.assign(indicatorStyles, {
      transform: 'translateZ(0)',
      willChange: 'top, transform',
      backfaceVisibility: 'hidden'
    });
  }

  Object.assign(indicator.style, indicatorStyles);

  miniMap.appendChild(indicator);
  containerElement.appendChild(miniMap);

  // Performance-optimized scroll updates
  let scrollUpdateFrame: number | null = null;
  const throttler = finalConfig.throttleUpdates ? new RAFThrottler() : null;
  
  const updateIndicatorPosition = () => {
    if (scrollUpdateFrame) {
      cancelAnimationFrame(scrollUpdateFrame);
    }
    
    const doUpdate = () => {
      const gridHeight = gridElement.scrollHeight;
      const containerHeight = containerElement.clientHeight;
      const scrollTop = containerElement.scrollTop;
      
      // Prevent division by zero
      const scrollableHeight = gridHeight - containerHeight;
      if (scrollableHeight <= 0) return;
      
      const scrollRatio = Math.max(0, Math.min(1, scrollTop / scrollableHeight));
      const availableSpace = finalConfig.height - (finalConfig.padding * 2) - indicatorSize;
      const indicatorTop = finalConfig.padding + scrollRatio * availableSpace;
      
      indicator.style.top = `${indicatorTop}px`;
      scrollUpdateFrame = null;
    };

    if (throttler) {
      throttler.throttle(doUpdate)();
    } else {
      scrollUpdateFrame = requestAnimationFrame(doUpdate);
    }
  };

  // Debounce hide functionality for better UX
  let hideTimeout: number | null = null;
  
  const showMiniMap = () => {
    miniMap.style.opacity = '0.7';
    if (hideTimeout) {
      clearTimeout(hideTimeout);
    }
    hideTimeout = window.setTimeout(() => {
      miniMap.style.opacity = '0';
      hideTimeout = null;
    }, finalConfig.hideDelay);
  };

  // Add optimized scroll event listener
  const handleScroll = () => {
    updateIndicatorPosition();
    showMiniMap();
  };

  containerElement.addEventListener('scroll', handleScroll, { passive: true });

  // Initial position update
  updateIndicatorPosition();

  // Return cleanup function
  return () => {
    containerElement.removeEventListener('scroll', handleScroll);
    if (hideTimeout) {
      clearTimeout(hideTimeout);
    }
    if (scrollUpdateFrame) {
      cancelAnimationFrame(scrollUpdateFrame);
    }
    if (throttler) {
      throttler.cancel();
    }
    const miniMapElement = document.getElementById('grid-mini-map');
    if (miniMapElement) {
      miniMapElement.remove();
    }
  };
}