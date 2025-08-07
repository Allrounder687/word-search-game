/**
 * Responsive Layout Utilities for Word Search Game
 * This file contains utility functions to handle responsive layouts for different screen sizes
 */

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

/**
 * Get responsive icon size based on screen size
 * @param size - Base icon size in pixels
 * @returns Icon size in pixels
 */
export function getResponsiveIconSize(size: number = 20): number {
  return size;
}