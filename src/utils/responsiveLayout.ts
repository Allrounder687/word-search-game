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
 * Get responsive value based on current screen width
 * @param values - Object containing values for different screen sizes
 * @returns The appropriate value for the current screen size
 */
export function getResponsiveValue<T>(values: ResponsiveSizes<T>): T {
  const width = window.innerWidth;

  if (width < BREAKPOINTS.xs) return values.xs;
  if (width < BREAKPOINTS.sm) return values.sm;
  if (width < BREAKPOINTS.md) return values.md;
  if (width < BREAKPOINTS.lg) return values.lg;
  return values.xl;
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

/**
 * Lock screen orientation for mobile devices
 * @param orientation - The orientation to lock to ('portrait' or 'landscape')
 */
export function lockScreenOrientation(orientation: 'portrait' | 'landscape'): void {
  try {
    // Use the Screen Orientation API if available
    if (screen.orientation && screen.orientation.lock) {
      screen.orientation.lock(orientation).catch(err => {
        console.warn('Screen orientation lock not supported:', err);
      });
    } 
    // Fallback for older browsers
    else if (screen.msLockOrientation) {
      screen.msLockOrientation(orientation);
    } else if (screen.mozLockOrientation) {
      screen.mozLockOrientation(orientation);
    }
  } catch (e) {
    console.warn('Screen orientation lock not supported');
  }
}

/**
 * Create a mini-map indicator for grid navigation
 * @param gridElement - The grid element to create a mini-map for
 * @param containerElement - The container element to append the mini-map to
 * @param theme - The current theme
 */
export function createGridMiniMap(gridElement: HTMLElement, containerElement: HTMLElement, theme: any): void {
  // Remove any existing mini-map
  const existingMiniMap = document.getElementById('grid-mini-map');
  if (existingMiniMap) {
    existingMiniMap.remove();
  }

  // Create mini-map container
  const miniMap = document.createElement('div');
  miniMap.id = 'grid-mini-map';
  miniMap.style.position = 'absolute';
  miniMap.style.right = '8px';
  miniMap.style.top = '50%';
  miniMap.style.transform = 'translateY(-50%)';
  miniMap.style.width = '30px';
  miniMap.style.height = '60px';
  miniMap.style.backgroundColor = `${theme.gridBg}80`;
  miniMap.style.borderRadius = '15px';
  miniMap.style.boxShadow = '0 2px 10px rgba(0, 0, 0, 0.2)';
  miniMap.style.zIndex = '10';
  miniMap.style.display = 'flex';
  miniMap.style.flexDirection = 'column';
  miniMap.style.justifyContent = 'space-between';
  miniMap.style.padding = '5px';
  miniMap.style.opacity = '0.7';
  miniMap.style.transition = 'opacity 0.3s';

  // Create indicator
  const indicator = document.createElement('div');
  indicator.style.width = '20px';
  indicator.style.height = '20px';
  indicator.style.backgroundColor = theme.secondary;
  indicator.style.borderRadius = '50%';
  indicator.style.position = 'absolute';
  indicator.style.left = '5px';
  indicator.style.top = '5px';
  indicator.style.transition = 'top 0.3s';

  miniMap.appendChild(indicator);
  containerElement.appendChild(miniMap);

  // Update indicator position on scroll
  const updateIndicatorPosition = () => {
    const gridHeight = gridElement.scrollHeight;
    const containerHeight = containerElement.clientHeight;
    const scrollTop = containerElement.scrollTop;
    const scrollRatio = scrollTop / (gridHeight - containerHeight);
    const indicatorTop = 5 + scrollRatio * (50 - 5); // 50px is the height of the mini-map minus padding
    indicator.style.top = `${indicatorTop}px`;
  };

  // Add scroll event listener
  containerElement.addEventListener('scroll', updateIndicatorPosition);

  // Show mini-map on scroll and hide after a delay
  let hideTimeout: number;
  containerElement.addEventListener('scroll', () => {
    miniMap.style.opacity = '0.7';
    clearTimeout(hideTimeout);
    hideTimeout = window.setTimeout(() => {
      miniMap.style.opacity = '0';
    }, 2000);
  });

  // Initial position
  updateIndicatorPosition();
}