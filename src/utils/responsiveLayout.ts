/**
 * Responsive Layout Utilities for Word Search Game
 * This file contains utility functions to handle responsive layouts for different screen sizes
 */

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
  const isTabletDevice = /iPad|Android(?!.*Mobile)/i.test(navigator.userAgent);
  const isMediumScreen = window.innerWidth >= BREAKPOINTS.md && window.innerWidth < BREAKPOINTS.lg;
  return isTabletDevice || isMediumScreen;
}

/**
 * Add viewport meta tags for better mobile experience
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

  // Set appropriate viewport content
  viewportMeta.setAttribute('content',
    'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no');

  // Add other mobile-specific meta tags
  const metaTags = [
    { name: 'apple-mobile-web-app-capable', content: 'yes' },
    { name: 'apple-mobile-web-app-status-bar-style', content: 'black-translucent' },
    { name: 'format-detection', content: 'telephone=no' },
    { name: 'mobile-web-app-capable', content: 'yes' }
  ];

  metaTags.forEach(meta => {
    if (!document.querySelector(`meta[name="${meta.name}"]`)) {
      const metaTag = document.createElement('meta');
      metaTag.setAttribute('name', meta.name);
      metaTag.setAttribute('content', meta.content);
      document.head.appendChild(metaTag);
    }
  });
}

// Extended Screen interface for better type safety
interface ExtendedScreen extends Screen {
  orientation?: {
    lock?: (orientation: OrientationLockType) => Promise<void>;
  };
  msLockOrientation?: (orientation: string) => boolean;
  mozLockOrientation?: (orientation: string) => boolean;
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
      await extendedScreen.orientation.lock(orientation as OrientationLockType);
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

// Mini-map configuration
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
  }
};

/**
 * Create a mini-map indicator for grid navigation with improved performance and type safety
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
  
  // Remove any existing mini-map
  const existingMiniMap = document.getElementById('grid-mini-map');
  if (existingMiniMap) {
    existingMiniMap.remove();
  }

  // Create mini-map container with improved styling
  const miniMap = document.createElement('div');
  miniMap.id = 'grid-mini-map';
  
  // Apply styles using Object.assign for better performance
  Object.assign(miniMap.style, {
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
    pointerEvents: 'none' // Prevent interference with user interactions
  });

  // Create indicator with improved styling
  const indicator = document.createElement('div');
  const indicatorSize = finalConfig.width - (finalConfig.padding * 2);
  
  Object.assign(indicator.style, {
    width: `${indicatorSize}px`,
    height: `${indicatorSize}px`,
    backgroundColor: theme.secondary,
    borderRadius: '50%',
    position: 'absolute',
    left: `${finalConfig.padding}px`,
    top: `${finalConfig.padding}px`,
    transition: 'top 0.3s ease',
    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.3)'
  });

  miniMap.appendChild(indicator);
  containerElement.appendChild(miniMap);

  // Throttle scroll updates for better performance
  let scrollUpdateFrame: number | null = null;
  
  const updateIndicatorPosition = () => {
    if (scrollUpdateFrame) {
      cancelAnimationFrame(scrollUpdateFrame);
    }
    
    scrollUpdateFrame = requestAnimationFrame(() => {
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
    });
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
    const miniMapElement = document.getElementById('grid-mini-map');
    if (miniMapElement) {
      miniMapElement.remove();
    }
  };
}