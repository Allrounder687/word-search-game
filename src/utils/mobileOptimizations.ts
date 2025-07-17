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

// Provide haptic feedback if available
export const provideHapticFeedback = (duration: number = 10): void => {
  if (navigator.vibrate) {
    navigator.vibrate(duration);
  }
};

// Prevent default touch behavior for game elements
export const preventDefaultTouchBehavior = (element: HTMLElement): void => {
  element.addEventListener('touchstart', (e) => e.preventDefault(), { passive: false });
  element.addEventListener('touchmove', (e) => e.preventDefault(), { passive: false });
  element.addEventListener('touchend', (e) => e.preventDefault(), { passive: false });
};

// Optimize scrolling for mobile
export const optimizeScrolling = (): void => {
  document.body.style.overscrollBehavior = 'none';
  
  // Add momentum scrolling to elements with scroll-container class
  const scrollContainers = document.querySelectorAll('.scroll-container');
  scrollContainers.forEach(container => {
    // Use bracket notation with type assertion to set non-standard CSS property
    const element = container as HTMLElement;
    (element.style as any)['webkitOverflowScrolling'] = 'touch';
  });
};

// Initialize all mobile optimizations
export const initializeMobileOptimizations = (): void => {
  if (isMobileDevice()) {
    // Add mobile class to body
    document.body.classList.add('mobile-device');
    
    // iOS-specific optimizations
    if (isIOSDevice()) {
      document.body.classList.add('ios-device');
      
      // Setup event listeners for iOS audio
      const handleUserInteraction = () => {
        initializeIOSAudio();
        document.removeEventListener('touchstart', handleUserInteraction);
        document.removeEventListener('click', handleUserInteraction);
      };
      
      document.addEventListener('touchstart', handleUserInteraction);
      document.addEventListener('click', handleUserInteraction);
    }
    
    // Optimize scrolling
    optimizeScrolling();
  }
};