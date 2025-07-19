// Viewport helper utilities to handle landscape mode issues
export interface ViewportDimensions {
  width: number;
  height: number;
  availableHeight: number;
  safeAreaHeight: number;
  isLandscape: boolean;
  deviceType: 'mobile' | 'tablet' | 'desktop';
}

export function getViewportDimensions(): ViewportDimensions {
  const width = window.innerWidth;
  const height = window.innerHeight;
  const visualViewport = (window as any).visualViewport;
  
  // Get the actual available height accounting for browser UI
  const availableHeight = visualViewport ? visualViewport.height : height;
  
  // Calculate safe area height for notched devices
  const safeAreaTop = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('env(safe-area-inset-top)')) || 0;
  const safeAreaBottom = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('env(safe-area-inset-bottom)')) || 0;
  const safeAreaHeight = availableHeight - safeAreaTop - safeAreaBottom;
  
  const isLandscape = width > height;
  
  let deviceType: 'mobile' | 'tablet' | 'desktop' = 'desktop';
  if (width < 768) {
    deviceType = 'mobile';
  } else if (width < 1024) {
    deviceType = 'tablet';
  }
  
  return {
    width,
    height,
    availableHeight,
    safeAreaHeight,
    isLandscape,
    deviceType
  };
}

export function getOptimalGridHeight(maxCells: number = 20): number {
  const viewport = getViewportDimensions();
  const { availableHeight, isLandscape, deviceType } = viewport;
  
  // Reserve space for header, controls, and padding
  let reservedSpace = 0;
  
  if (deviceType === 'mobile') {
    reservedSpace = isLandscape ? 120 : 200; // Less space in landscape
  } else if (deviceType === 'tablet') {
    reservedSpace = isLandscape ? 140 : 250; // iPad landscape needs special handling
  } else {
    reservedSpace = 200; // Desktop
  }
  
  const maxGridHeight = availableHeight - reservedSpace;
  
  // Calculate cell size based on available space
  const maxCellSize = Math.floor(maxGridHeight / maxCells);
  const minCellSize = 25; // Minimum usable cell size
  const maxCellSizeLimit = 60; // Maximum cell size for good UX
  
  const cellSize = Math.max(minCellSize, Math.min(maxCellSize, maxCellSizeLimit));
  
  return Math.min(maxGridHeight, cellSize * maxCells);
}

export function getOptimalGridSize(targetCells: number = 15): number {
  const viewport = getViewportDimensions();
  const { width, availableHeight, isLandscape, deviceType } = viewport;
  
  // Calculate available space for grid
  const padding = deviceType === 'mobile' ? 20 : 40;
  const availableWidth = width - (padding * 2);
  
  let reservedHeight = 0;
  if (deviceType === 'mobile') {
    reservedHeight = isLandscape ? 100 : 180;
  } else if (deviceType === 'tablet') {
    reservedHeight = isLandscape ? 120 : 220;
  } else {
    reservedHeight = 180;
  }
  
  const availableGridHeight = availableHeight - reservedHeight;
  
  // Determine optimal cell size
  const maxCellSizeByWidth = Math.floor(availableWidth / targetCells);
  const maxCellSizeByHeight = Math.floor(availableGridHeight / targetCells);
  
  const cellSize = Math.min(maxCellSizeByWidth, maxCellSizeByHeight);
  
  // Ensure minimum cell size
  const minCellSize = deviceType === 'mobile' ? 25 : 30;
  const finalCellSize = Math.max(cellSize, minCellSize);
  
  // Calculate how many cells can fit
  const maxCellsByWidth = Math.floor(availableWidth / finalCellSize);
  const maxCellsByHeight = Math.floor(availableGridHeight / finalCellSize);
  
  const maxCells = Math.min(maxCellsByWidth, maxCellsByHeight);
  
  // Return a reasonable grid size
  return Math.max(10, Math.min(maxCells, 20));
}

export function setupViewportHandling(): () => void {
  // Set CSS custom properties for viewport handling
  function updateViewportProperties() {
    const viewport = getViewportDimensions();
    const root = document.documentElement;
    
    root.style.setProperty('--viewport-width', `${viewport.width}px`);
    root.style.setProperty('--viewport-height', `${viewport.height}px`);
    root.style.setProperty('--available-height', `${viewport.availableHeight}px`);
    root.style.setProperty('--safe-area-height', `${viewport.safeAreaHeight}px`);
    root.style.setProperty('--is-landscape', viewport.isLandscape ? '1' : '0');
    root.style.setProperty('--device-type', viewport.deviceType);
  }
  
  // Initial setup
  updateViewportProperties();
  
  // Listen for viewport changes
  const handleResize = () => {
    updateViewportProperties();
  };
  
  const handleOrientationChange = () => {
    // Small delay to ensure viewport has updated
    setTimeout(updateViewportProperties, 100);
  };
  
  window.addEventListener('resize', handleResize);
  window.addEventListener('orientationchange', handleOrientationChange);
  
  // Visual Viewport API support
  if ((window as any).visualViewport) {
    (window as any).visualViewport.addEventListener('resize', handleResize);
  }
  
  // Cleanup function
  return () => {
    window.removeEventListener('resize', handleResize);
    window.removeEventListener('orientationchange', handleOrientationChange);
    
    if ((window as any).visualViewport) {
      (window as any).visualViewport.removeEventListener('resize', handleResize);
    }
  };
}

// CSS helper for landscape mode fixes
export function injectLandscapeCSS() {
  const styleId = 'landscape-fixes';
  
  // Remove existing styles
  const existing = document.getElementById(styleId);
  if (existing) {
    existing.remove();
  }
  
  const style = document.createElement('style');
  style.id = styleId;
  style.textContent = `
    /* Landscape mode optimizations */
    @media screen and (orientation: landscape) and (max-height: 600px) {
      /* iPad landscape fixes */
      .game-container {
        max-height: calc(var(--available-height, 100vh) - 20px);
        overflow-y: auto;
        padding-bottom: env(safe-area-inset-bottom, 20px);
      }
      
      .word-grid {
        max-height: calc(var(--available-height, 100vh) - 140px);
        overflow: hidden;
      }
      
      .game-header {
        padding: 8px 16px;
        font-size: 14px;
      }
      
      .settings-modal {
        max-height: calc(var(--available-height, 100vh) - 40px);
        margin: 20px;
      }
      
      /* Ensure grid doesn't get cut off */
      .grid-container {
        max-height: calc(var(--safe-area-height, var(--available-height, 100vh)) - 120px);
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
      }
    }
    
    /* Mobile landscape optimizations */
    @media screen and (orientation: landscape) and (max-width: 768px) and (max-height: 500px) {
      .game-container {
        padding: 8px;
      }
      
      .word-grid {
        max-height: calc(var(--available-height, 100vh) - 100px);
      }
      
      .game-header {
        padding: 4px 8px;
        font-size: 12px;
      }
    }
  `;
  
  document.head.appendChild(style);
}