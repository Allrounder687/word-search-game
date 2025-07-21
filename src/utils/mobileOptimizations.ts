/**
 * Mobile Optimizations for Word Search Game
 * This file contains utility functions to optimize the game for mobile devices
 */

// Check if the device is mobile
export const isMobileDevice = (): boolean => {
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
};

// Check if the device is iOS
export const isIOSDevice = (): boolean => {
  return /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;
};

// Check if the device is specifically an iPad
export const isIPadDevice = (): boolean => {
  // Direct iPad detection
  const isDirectIPad = /iPad/i.test(navigator.userAgent);
  
  // Modern iPads report as Macintosh in user agent but have touch capabilities
  const isModernIPad = /Macintosh/i.test(navigator.userAgent) && 'ontouchend' in document;
  
  return isDirectIPad || isModernIPad;
};

// Get appropriate size based on screen width
export const getResponsiveSize = (
  desktopSize: number,
  tabletSize: number,
  mobileSize: number,
  smallMobileSize: number
): number => {
  if (window.innerWidth >= 768) return desktopSize;
  if (window.innerWidth >= 480) return tabletSize;
  if (window.innerWidth >= 360) return mobileSize;
  return smallMobileSize;
};

// Initialize audio for iOS devices
export const initializeIOSAudio = (): void => {
  if (!isIOSDevice()) return;
  
  // Create a silent audio element
  const silentAudio = document.createElement('audio');
  silentAudio.setAttribute('src', 'data:audio/mp3;base64,SUQzBAAAAAAAI1RTU0UAAAAPAAADTGF2ZjU4LjI5LjEwMAAAAAAAAAAAAAAA//tQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAWGluZwAAAA8AAAACAAABIADAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDV1dXV1dXV1dXV1dXV1dXV1dXV1dXV1dXV6urq6urq6urq6urq6urq6urq6urq6urq6v////////////////////////////////8AAAAATGF2YzU4LjU0AAAAAAAAAAAAAAAAJAAAAAAAAAAAASDs90hvAAAAAAAAAAAAAAAAAAAA//MUZAAAAAGkAAAAAAAAA0gAAAAATEFN//MUZAMAAAGkAAAAAAAAA0gAAAAARTMu//MUZAYAAAGkAAAAAAAAA0gAAAAAOTku//MUZAkAAAGkAAAAAAAAA0gAAAAANVVV');
  silentAudio.setAttribute('playsinline', 'true');
  silentAudio.setAttribute('preload', 'auto');
  silentAudio.className = 'audio-enabled';
  document.body.appendChild(silentAudio);
  
  // Play and immediately pause to enable audio
  const playPromise = silentAudio.play();
  if (playPromise !== undefined) {
    playPromise.then(() => {
      silentAudio.pause();
    }).catch(error => {
      console.error('Audio initialization failed:', error);
    });
  }
};

// Enhanced haptic feedback with performance optimizations
export const provideHapticFeedback = (duration: number = 10): void => {
  if (!navigator.vibrate) return;
  
  // Use requestAnimationFrame to ensure haptic feedback doesn't block UI
  requestAnimationFrame(() => {
    try {
      navigator.vibrate(duration);
    } catch (error) {
      console.warn('Haptic feedback failed:', error);
    }
  });
};

// Optimized haptic feedback for different interaction types
export const provideOptimizedHapticFeedback = (type: 'light' | 'medium' | 'heavy' | 'error' | 'success'): void => {
  if (!navigator.vibrate) return;
  
  let pattern: number | number[];
  
  switch (type) {
    case 'light':
      pattern = 5;
      break;
    case 'medium':
      pattern = 10;
      break;
    case 'heavy':
      pattern = 30;
      break;
    case 'error':
      pattern = [10, 50, 10]; // Short-pause-short pattern for error
      break;
    case 'success':
      pattern = [10, 30, 10, 30, 20]; // Multiple pulses for success
      break;
    default:
      pattern = 10;
  }
  
  requestAnimationFrame(() => {
    try {
      navigator.vibrate(pattern);
    } catch (error) {
      console.warn('Haptic feedback failed:', error);
    }
  });
};

// Prevent default touch behavior for game elements with improved performance
export const preventDefaultTouchBehavior = (element: HTMLElement): void => {
  const options = { passive: false };
  
  element.addEventListener('touchstart', (e) => e.preventDefault(), options);
  element.addEventListener('touchmove', (e) => e.preventDefault(), options);
  element.addEventListener('touchend', (e) => e.preventDefault(), options);
};

// Optimize scrolling for mobile with enhanced performance
export const optimizeScrolling = (): void => {
  document.body.style.overscrollBehavior = 'none';
  document.body.style.WebkitOverscrollBehavior = 'none';
  
  // Add momentum scrolling to elements with scroll-container class
  const scrollContainers = document.querySelectorAll('.scroll-container');
  scrollContainers.forEach(container => {
    const element = container as HTMLElement;
    (element.style as any)['webkitOverflowScrolling'] = 'touch';
    element.style.scrollbarWidth = 'none';
    element.style.msOverflowStyle = 'none';
  });
};

// Enhanced viewport setup for better mobile experience
export const setupMobileViewport = (): void => {
  // Find existing viewport meta tag
  let viewportMeta = document.querySelector('meta[name="viewport"]');

  // Create one if it doesn't exist
  if (!viewportMeta) {
    viewportMeta = document.createElement('meta');
    viewportMeta.setAttribute('name', 'viewport');
    document.head.appendChild(viewportMeta);
  }

  // Set appropriate viewport content based on device
  const isIPad = isIPadDevice();
  const viewportContent = isIPad 
    ? 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover'
    : 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no';

  viewportMeta.setAttribute('content', viewportContent);

  // Add other mobile-specific meta tags
  const metaTags = [
    { name: 'apple-mobile-web-app-capable', content: 'yes' },
    { name: 'apple-mobile-web-app-status-bar-style', content: 'black-translucent' },
    { name: 'format-detection', content: 'telephone=no' },
    { name: 'mobile-web-app-capable', content: 'yes' },
    { name: 'apple-touch-fullscreen', content: 'yes' }
  ];

  metaTags.forEach(meta => {
    if (!document.querySelector(`meta[name="${meta.name}"]`)) {
      const metaTag = document.createElement('meta');
      metaTag.setAttribute('name', meta.name);
      metaTag.setAttribute('content', meta.content);
      document.head.appendChild(metaTag);
    }
  });
};

// Optimize touch event handling for word grid dragging
export const optimizeTouchEvents = (): void => {
  // Add CSS for optimized touch handling
  const style = document.createElement('style');
  style.textContent = `
    .ios-touch-fix {
      -webkit-overflow-scrolling: touch;
      touch-action: manipulation;
      position: relative;
      transform: translateZ(0);
      -webkit-transform: translateZ(0);
      will-change: transform;
      backface-visibility: hidden;
      -webkit-backface-visibility: hidden;
    }
    
    .ios-touch-fix * {
      -webkit-touch-callout: none;
      -webkit-user-select: none;
      user-select: none;
      touch-action: inherit;
    }
    
    .drag-optimized {
      will-change: transform, background-color;
      backface-visibility: hidden;
      -webkit-backface-visibility: hidden;
      transform: translateZ(0);
      -webkit-transform: translateZ(0);
    }
    
    .drag-in-progress body {
      position: fixed !important;
      top: 0 !important;
      left: 0 !important;
      width: 100% !important;
      height: 100% !important;
      overflow: hidden !important;
      touch-action: none !important;
      -webkit-touch-action: none !important;
    }
  `;
  
  if (!document.querySelector('#mobile-optimizations-style')) {
    style.id = 'mobile-optimizations-style';
    document.head.appendChild(style);
  }
};

// Enhanced performance monitoring for mobile
export const monitorMobilePerformance = (): void => {
  if (!window.performance) return;
  
  // Monitor frame drops and lag
  let lastTime = performance.now();
  let frameCount = 0;
  let lagCount = 0;
  
  const checkPerformance = (currentTime: number) => {
    const delta = currentTime - lastTime;
    frameCount++;
    
    // If frame took longer than 16.67ms (60fps), consider it lag
    if (delta > 16.67) {
      lagCount++;
    }
    
    // Log performance stats every 5 seconds
    if (frameCount % 300 === 0) {
      const lagPercentage = (lagCount / frameCount) * 100;
      if (lagPercentage > 10) {
        console.warn(`Mobile performance warning: ${lagPercentage.toFixed(1)}% frames dropped`);
      }
    }
    
    lastTime = currentTime;
    requestAnimationFrame(checkPerformance);
  };
  
  requestAnimationFrame(checkPerformance);
};

// Initialize all mobile optimizations with enhanced features
export const initializeMobileOptimizations = (): void => {
  if (isMobileDevice()) {
    // Add mobile class to body
    document.body.classList.add('mobile-device');
    
    // Device-specific optimizations
    if (isIOSDevice()) {
      document.body.classList.add('ios-device');
      
      // Setup event listeners for iOS audio
      const handleUserInteraction = () => {
        initializeIOSAudio();
        document.removeEventListener('touchstart', handleUserInteraction);
        document.removeEventListener('click', handleUserInteraction);
      };
      
      document.addEventListener('touchstart', handleUserInteraction, { once: true });
      document.addEventListener('click', handleUserInteraction, { once: true });
    }
    
    if (isIPadDevice()) {
      document.body.classList.add('ipad-device');
    }
    
    // Setup mobile viewport
    setupMobileViewport();
    
    // Optimize scrolling
    optimizeScrolling();
    
    // Optimize touch events
    optimizeTouchEvents();
    
    // Monitor performance in development
    if (process.env.NODE_ENV === 'development') {
      monitorMobilePerformance();
    }
    
    // Add resize handler for orientation changes
    const handleResize = () => {
      // Delay to allow for orientation change to complete
      setTimeout(() => {
        const event = new CustomEvent('mobileOrientationChange', {
          detail: {
            width: window.innerWidth,
            height: window.innerHeight,
            orientation: window.innerWidth > window.innerHeight ? 'landscape' : 'portrait'
          }
        });
        window.dispatchEvent(event);
      }, 100);
    };
    
    window.addEventListener('resize', handleResize);
    window.addEventListener('orientationchange', handleResize);
  }
};

// Cleanup function for mobile optimizations
export const cleanupMobileOptimizations = (): void => {
  // Remove mobile-specific styles
  const mobileStyle = document.querySelector('#mobile-optimizations-style');
  if (mobileStyle) {
    mobileStyle.remove();
  }
  
  // Remove mobile classes
  document.body.classList.remove('mobile-device', 'ios-device', 'ipad-device');
  
  // Reset viewport
  const viewportMeta = document.querySelector('meta[name="viewport"]');
  if (viewportMeta) {
    viewportMeta.setAttribute('content', 'width=device-width, initial-scale=1.0');
  }
};