import { useState, useEffect } from 'react';

interface ResponsiveBreakpoints {
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
  isLargeDesktop: boolean;
  width: number;
  height: number;
}

export const useResponsive = (): ResponsiveBreakpoints => {
  const [dimensions, setDimensions] = useState({
    width: window.innerWidth,
    height: window.innerHeight
  });

  useEffect(() => {
    const handleResize = () => {
      setDimensions({
        width: window.innerWidth,
        height: window.innerHeight
      });
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return {
    isMobile: dimensions.width < 768,
    isTablet: dimensions.width >= 768 && dimensions.width < 1024,
    isDesktop: dimensions.width >= 1024,
    isLargeDesktop: dimensions.width >= 1280,
    width: dimensions.width,
    height: dimensions.height
  };
};

// Utility functions for responsive values
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