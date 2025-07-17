import type { ResponsiveBreakpoints } from '../hooks/useResponsive';

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
  };
}

export const getLayoutConfig = (
  breakpoints: ResponsiveBreakpoints,
  theme: any
): LayoutConfig => {
  const isMobile = breakpoints.isMobile;
  const isTablet = breakpoints.isTablet;

  return {
    spacing: {
      marginTop: isMobile ? '8px' : isTablet ? '16px' : '24px',
      marginBottom: isMobile ? '8px' : isTablet ? '16px' : '24px',
      gap: isMobile ? '12px' : isTablet ? '16px' : '24px',
      padding: isMobile ? '0 4px' : isTablet ? '0 8px' : '0'
    },
    wordGrid: {
      width: breakpoints.isDesktop ? 'auto' : '100%',
      ...(isMobile && {
        padding: '8px',
        borderRadius: '16px',
        backgroundColor: `${theme.gridBg}40`,
        boxShadow: `0 8px 32px -8px ${theme.accent}20, 0 0 0 1px ${theme.accent}10`
      })
    }
  };
};