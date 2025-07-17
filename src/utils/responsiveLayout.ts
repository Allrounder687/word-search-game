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