// Import the ResponsiveBreakpoints interface
interface ResponsiveBreakpoints {
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
  isLargeDesktop: boolean;
  width: number;
  height: number;
}

// Enhanced device detection
interface DeviceInfo {
  isIPad: boolean;
  isIPadPro: boolean;
  isIPhone: boolean;
  isAndroidTablet: boolean;
  isLandscape: boolean;
  pixelRatio: number;
}

export interface LayoutConfig {
  spacing: {
    marginTop: string;
    marginBottom: string;
    gap: string;
    padding: string;
  };
  wordGrid: {
    width: string;
    padding?: string;
    borderRadius?: string;
    backgroundColor?: string;
    boxShadow?: string;
    maxHeight?: string;
    minHeight?: string;
  };
  typography: {
    fontSize: {
      small: string;
      medium: string;
      large: string;
    };
    lineHeight: string;
  };
  performance: {
    enableHardwareAcceleration: boolean;
    reducedMotion: boolean;
    useTransform3d: boolean;
  };
}

// Enhanced device detection function
const getDeviceInfo = (): DeviceInfo => {
  const userAgent = navigator.userAgent;
  const width = window.innerWidth;
  const height = window.innerHeight;
  
  return {
    isIPad: /iPad/i.test(userAgent) || (/Macintosh/i.test(userAgent) && 'ontouchend' in document),
    isIPadPro: (/iPad/i.test(userAgent) || (/Macintosh/i.test(userAgent) && 'ontouchend' in document)) && 
               (width >= 1000 || height >= 1000),
    isIPhone: /iPhone/i.test(userAgent),
    isAndroidTablet: /Android(?!.*Mobile)/i.test(userAgent),
    isLandscape: width > height,
    pixelRatio: window.devicePixelRatio || 1
  };
};

// Calculate optimal spacing based on device and screen size
const calculateSpacing = (breakpoints: ResponsiveBreakpoints, deviceInfo: DeviceInfo) => {
  const { isIPad, isIPadPro, isIPhone, isLandscape } = deviceInfo;
  
  // Base spacing values
  let marginTop = '8px';
  let marginBottom = '8px';
  let gap = '12px';
  let padding = '0 4px';
  
  if (breakpoints.isDesktop) {
    marginTop = '24px';
    marginBottom = '24px';
    gap = '24px';
    padding = '0';
  } else if (breakpoints.isTablet || isIPad) {
    if (isLandscape) {
      marginTop = isIPadPro ? '12px' : '8px';
      marginBottom = isIPadPro ? '12px' : '8px';
      gap = isIPadPro ? '20px' : '16px';
      padding = isIPadPro ? '0 12px' : '0 8px';
    } else {
      marginTop = '16px';
      marginBottom = '16px';
      gap = '16px';
      padding = '0 8px';
    }
  } else if (breakpoints.isMobile) {
    if (isLandscape) {
      marginTop = '4px';
      marginBottom = '4px';
      gap = isIPhone ? '8px' : '10px';
      padding = '0 4px';
    } else {
      marginTop = '8px';
      marginBottom = '8px';
      gap = '12px';
      padding = '0 4px';
    }
  }
  
  return { marginTop, marginBottom, gap, padding };
};

// Calculate optimal word grid configuration
const calculateWordGridConfig = (breakpoints: ResponsiveBreakpoints, deviceInfo: DeviceInfo, theme: any) => {
  const { isIPad, isIPadPro, isIPhone, isLandscape } = deviceInfo;
  
  let config: LayoutConfig['wordGrid'] = {
    width: breakpoints.isDesktop ? 'auto' : '100%'
  };
  
  // Mobile-specific configurations
  if (breakpoints.isMobile || isIPad) {
    const borderRadius = isIPadPro ? '20px' : (isIPad ? '16px' : '12px');
    const padding = isLandscape ? '6px' : '8px';
    
    config = {
      ...config,
      padding,
      borderRadius,
      backgroundColor: `${theme.gridBg}40`,
      boxShadow: `0 8px 32px -8px ${theme.accent}20, 0 0 0 1px ${theme.accent}10`
    };
    
    // Calculate optimal max height based on screen size and orientation
    if (isLandscape) {
      if (isIPad) {
        config.maxHeight = 'calc(100vh - 100px)';
      } else if (isIPhone) {
        config.maxHeight = 'calc(100vh - 80px)';
      } else {
        config.maxHeight = 'calc(100vh - 90px)';
      }
    } else {
      if (isIPad) {
        config.maxHeight = 'calc(100vh - 160px)';
      } else {
        config.maxHeight = 'calc(100vh - 220px)';
      }
    }
    
    // Minimum height to ensure usability
    config.minHeight = isLandscape ? '200px' : '300px';
  }
  
  return config;
};

// Calculate typography settings based on device
const calculateTypography = (breakpoints: ResponsiveBreakpoints, deviceInfo: DeviceInfo): LayoutConfig['typography'] => {
  const { isIPad, isIPadPro, isIPhone } = deviceInfo;
  
  let fontSize = {
    small: '12px',
    medium: '14px',
    large: '16px'
  };
  
  if (breakpoints.isDesktop) {
    fontSize = {
      small: '14px',
      medium: '16px',
      large: '18px'
    };
  } else if (isIPadPro) {
    fontSize = {
      small: '14px',
      medium: '16px',
      large: '18px'
    };
  } else if (isIPad) {
    fontSize = {
      small: '13px',
      medium: '15px',
      large: '17px'
    };
  } else if (isIPhone) {
    fontSize = {
      small: '12px',
      medium: '14px',
      large: '16px'
    };
  }
  
  return {
    fontSize,
    lineHeight: '1.5'
  };
};

// Determine performance optimizations based on device capabilities
const calculatePerformanceSettings = (breakpoints: ResponsiveBreakpoints, deviceInfo: DeviceInfo): LayoutConfig['performance'] => {
  const { pixelRatio, isIPad, isIPadPro } = deviceInfo;
  const { width } = breakpoints;
  
  // Enable hardware acceleration for capable devices
  const enableHardwareAcceleration = 
    breakpoints.isDesktop || 
    isIPadPro || 
    (isIPad && pixelRatio >= 2) ||
    (width >= 768);
  
  // Check for reduced motion preference
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  
  // Use 3D transforms for better performance on capable devices
  const useTransform3d = enableHardwareAcceleration && !reducedMotion;
  
  return {
    enableHardwareAcceleration,
    reducedMotion,
    useTransform3d
  };
};

export const getLayoutConfig = (
  breakpoints: ResponsiveBreakpoints,
  theme: any
): LayoutConfig => {
  const deviceInfo = getDeviceInfo();
  const spacing = calculateSpacing(breakpoints, deviceInfo);
  const wordGrid = calculateWordGridConfig(breakpoints, deviceInfo, theme);
  const typography = calculateTypography(breakpoints, deviceInfo);
  const performance = calculatePerformanceSettings(breakpoints, deviceInfo);

  return {
    spacing,
    wordGrid,
    typography,
    performance
  };
};

// Utility function to get responsive value based on breakpoints
export const getResponsiveValue = <T>(
  values: {
    mobile: T;
    tablet?: T;
    desktop?: T;
    largeDesktop?: T;
  },
  breakpoints: ResponsiveBreakpoints
): T => {
  if (breakpoints.isLargeDesktop && values.largeDesktop !== undefined) {
    return values.largeDesktop;
  }
  if (breakpoints.isDesktop && values.desktop !== undefined) {
    return values.desktop;
  }
  if (breakpoints.isTablet && values.tablet !== undefined) {
    return values.tablet;
  }
  return values.mobile;
};

// Utility function to get device-specific CSS properties
export const getDeviceOptimizedStyles = (deviceInfo?: DeviceInfo) => {
  const info = deviceInfo || getDeviceInfo();
  
  const baseStyles = {
    touchAction: 'manipulation',
    WebkitTouchAction: 'manipulation',
    userSelect: 'none',
    WebkitUserSelect: 'none',
    WebkitTapHighlightColor: 'transparent'
  };
  
  if (info.isIPad) {
    return {
      ...baseStyles,
      WebkitOverflowScrolling: 'touch',
      overscrollBehavior: 'none',
      WebkitOverscrollBehavior: 'none'
    };
  }
  
  return baseStyles;
};

// Utility function to detect if viewport is stable (useful for mobile browsers)
export const isViewportStable = (): boolean => {
  const vh = window.innerHeight * 0.01;
  document.documentElement.style.setProperty('--vh', `${vh}px`);
  
  // Return true if viewport height hasn't changed significantly in the last 100ms
  return true; // Simplified for now, could be enhanced with actual stability detection
};