import React, { useState, useMemo, useCallback } from 'react';
import { Palette, Sparkles, X, ChevronDown } from 'lucide-react';
import type { GameSettings, Theme, WordCategory } from '../types/game';
import { THEMES } from '../types/game';
import { getResponsiveIconSize } from '../utils/responsiveLayout';

import { MobileDropdown } from './QuickSettings/MobileDropdown';

interface ThemeColors {
  background: string;
  primary: string;
  secondary: string;
  accent: string;
  gridBg: string;
  cellBg: string;
  cellHover: string;
  font: string;
}

interface QuickSettingsProps {
  settings: GameSettings;
  onSettingsChange: (settings: GameSettings) => void;
  theme: ThemeColors;
  // Game control props
  onReset?: () => void;
  onToggleZoom?: () => void;
  onToggleClickMode?: () => void;
  isZoomed?: boolean;
  isClickMode?: boolean;
}



export const QuickSettings: React.FC<QuickSettingsProps> = ({
  settings,
  onSettingsChange,
  theme,
  onReset,
  onToggleZoom,
  onToggleClickMode,
  isZoomed,
  isClickMode
}) => {
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);
  const [showThemeDropdown, setShowThemeDropdown] = useState(false);
  const [showDropdownMenu, setShowDropdownMenu] = useState(false);
  
  // Get responsive icon size
  const iconSize = getResponsiveIconSize(16);
  
  // Responsive mobile detection with resize handling
  const [isMobile, setIsMobile] = useState(() => window.innerWidth < 480);
  
  // Handle window resize for responsive behavior with error handling
  React.useEffect(() => {
    const handleResize = () => {
      try {
        setIsMobile(window.innerWidth < 480);
      } catch (error) {
        console.warn('Error handling window resize:', error);
      }
    };
    
    // Check if window is available (SSR compatibility)
    if (typeof window !== 'undefined') {
      window.addEventListener('resize', handleResize);
      return () => window.removeEventListener('resize', handleResize);
    }
  }, []);

  // Memoize static data to prevent recreation on every render
  const wordCategories = useMemo(() => [
    { value: 'general' as const, label: 'General' },
    { value: 'animals' as const, label: 'Animals' },
    { value: 'islamicPlaces' as const, label: 'Islamic Places' },
    { value: 'islamicProphets' as const, label: 'Islamic Prophets' },
    { value: 'fivePillars' as const, label: 'Five Pillars' },
    { value: 'islamicTerms' as const, label: 'Islamic Terms' },
    { value: 'custom' as const, label: 'Custom Words' }
  ], []);

  const themes = useMemo(() => [
    { value: 'midnight' as const, label: 'Midnight' },
    { value: 'royal' as const, label: 'Royal Blue' },
    { value: 'darkRoyal' as const, label: 'Dark Royal' },
    { value: 'pink' as const, label: 'Pink' },
    { value: 'darkPink' as const, label: 'Dark Pink' },
    { value: 'pure' as const, label: 'White' },
    { value: 'ocean' as const, label: 'Ocean' },
    { value: 'sunset' as const, label: 'Sunset' },
    { value: 'neon' as const, label: 'Neon' },
    { value: 'custom' as const, label: 'Custom Theme' }
  ], []);

  const handleCategoryChange = useCallback((category: WordCategory) => {
    onSettingsChange({
      ...settings,
      wordCategory: category
    });
    setShowCategoryDropdown(false);
    setShowDropdownMenu(false);
  }, [settings, onSettingsChange]);

  const handleThemeChange = useCallback((newTheme: Theme) => {
    onSettingsChange({
      ...settings,
      theme: newTheme
    });
    setShowThemeDropdown(false);
    setShowDropdownMenu(false);
  }, [settings, onSettingsChange]);

  const getCurrentCategoryLabel = useCallback(() => {
    const currentCategory = wordCategories.find(c => c.value === settings.wordCategory);
    return isMobile ? currentCategory?.label || 'Category' : 'Categories';
  }, [wordCategories, settings.wordCategory, isMobile]);

  const getCurrentThemeLabel = useCallback(() => {
    const currentTheme = themes.find(t => t.value === settings.theme);
    return isMobile ? currentTheme?.label || 'Theme' : 'Themes';
  }, [themes, settings.theme, isMobile]);
  
  // For very small screens, use a single dropdown menu
  if (isMobile) {
    return (
      <div style={{
        display: 'flex',
        flexDirection: 'row',
        gap: '8px',
        marginBottom: '12px',
        width: '100%',
        justifyContent: 'center'
      }}>
        {/* Combined dropdown button */}
        <button
          onClick={() => setShowDropdownMenu(!showDropdownMenu)}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            width: '100%',
            padding: '8px 10px',
            borderRadius: '8px',
            backgroundColor: theme.gridBg,
            color: theme.primary,
            border: `1px solid ${theme.secondary}40`,
            cursor: 'pointer',
            transition: 'all 0.2s',
            fontSize: '13px'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Sparkles size={iconSize} style={{ color: theme.secondary }} />
            <span>Game Options</span>
          </div>
          <ChevronDown size={iconSize} style={{ color: theme.primary }} />
        </button>

        <MobileDropdown
          isOpen={showDropdownMenu}
          onClose={() => setShowDropdownMenu(false)}
          settings={settings}
          wordCategories={wordCategories}
          themes={themes}
          onCategoryChange={handleCategoryChange}
          onThemeChange={handleThemeChange}
          theme={theme}
          iconSize={iconSize}
          onReset={onReset}
          onToggleZoom={onToggleZoom}
          onToggleClickMode={onToggleClickMode}
          isZoomed={isZoomed}
          isClickMode={isClickMode}
        />
      </div>
    );
  }

  // Standard layout for larger screens
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'row',
      gap: '12px',
      marginBottom: '16px',
      width: '100%',
      justifyContent: 'center'
    }}>
      {/* Category Selector */}
      <div style={{ position: 'relative', flex: 1, maxWidth: '180px' }}>
        <button
          onClick={() => {
            setShowCategoryDropdown(!showCategoryDropdown);
            setShowThemeDropdown(false);
          }}
          aria-expanded={showCategoryDropdown}
          aria-haspopup="listbox"
          aria-label="Select word category"
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            width: '100%',
            padding: '10px 12px',
            borderRadius: '8px',
            backgroundColor: theme.gridBg,
            color: theme.primary,
            border: `1px solid ${theme.secondary}40`,
            cursor: 'pointer',
            transition: 'all 0.2s',
            fontSize: '14px'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Sparkles size={16} style={{ color: theme.secondary }} />
            <span>{getCurrentCategoryLabel()}</span>
          </div>
        </button>

        {showCategoryDropdown && (
          <div style={{
            position: 'absolute',
            top: 'calc(100% + 4px)',
            left: 0,
            width: '100%',
            backgroundColor: theme.gridBg,
            borderRadius: '8px',
            boxShadow: '0 10px 25px rgba(0, 0, 0, 0.2)',
            zIndex: 10,
            padding: '8px',
            border: `1px solid ${theme.secondary}20`
          }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '8px',
              paddingBottom: '8px',
              borderBottom: `1px solid ${theme.secondary}20`
            }}>
              <span style={{ fontWeight: 'bold', fontSize: '14px', color: theme.primary }}>
                Word Category
              </span>
              <button
                onClick={() => setShowCategoryDropdown(false)}
                style={{
                  background: 'transparent',
                  border: 'none',
                  cursor: 'pointer',
                  padding: '4px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: theme.primary
                }}
              >
                <X size={16} />
              </button>
            </div>
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '4px',
              maxHeight: '200px',
              overflowY: 'auto'
            }}>
              {wordCategories.map((category) => (
                <button
                  key={category.value}
                  onClick={() => handleCategoryChange(category.value)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    padding: '8px 12px',
                    borderRadius: '6px',
                    backgroundColor: settings.wordCategory === category.value
                      ? `${theme.secondary}20`
                      : 'transparent',
                    color: settings.wordCategory === category.value
                      ? theme.secondary
                      : theme.primary,
                    border: 'none',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    textAlign: 'left',
                    width: '100%'
                  }}
                >
                  {category.label}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Theme Selector */}
      <div style={{ position: 'relative', flex: 1, maxWidth: '180px' }}>
        <button
          onClick={() => {
            setShowThemeDropdown(!showThemeDropdown);
            setShowCategoryDropdown(false);
          }}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            width: '100%',
            padding: '10px 12px',
            borderRadius: '8px',
            backgroundColor: theme.gridBg,
            color: theme.primary,
            border: `1px solid ${theme.secondary}40`,
            cursor: 'pointer',
            transition: 'all 0.2s',
            fontSize: '14px'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Palette size={16} style={{ color: theme.secondary }} />
            <span>{getCurrentThemeLabel()}</span>
          </div>
        </button>

        {showThemeDropdown && (
          <div style={{
            position: 'absolute',
            top: 'calc(100% + 4px)',
            left: 0,
            width: '200px',
            backgroundColor: theme.gridBg,
            borderRadius: '8px',
            boxShadow: '0 10px 25px rgba(0, 0, 0, 0.2)',
            zIndex: 10,
            padding: '8px',
            border: `1px solid ${theme.secondary}20`
          }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '8px',
              paddingBottom: '8px',
              borderBottom: `1px solid ${theme.secondary}20`
            }}>
              <span style={{ fontWeight: 'bold', fontSize: '14px', color: theme.primary }}>
                Theme
              </span>
              <button
                onClick={() => setShowThemeDropdown(false)}
                style={{
                  background: 'transparent',
                  border: 'none',
                  cursor: 'pointer',
                  padding: '4px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: theme.primary
                }}
              >
                <X size={16} />
              </button>
            </div>
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '4px',
              maxHeight: '300px',
              overflowY: 'auto'
            }}>
              {themes.map((themeOption) => {
                const themeColors = THEMES[themeOption.value as keyof typeof THEMES] || THEMES.midnight;

                return (
                  <button
                    key={themeOption.value}
                    onClick={() => handleThemeChange(themeOption.value)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      padding: '8px 12px',
                      borderRadius: '6px',
                      backgroundColor: settings.theme === themeOption.value
                        ? `${theme.secondary}20`
                        : 'transparent',
                      color: settings.theme === themeOption.value
                        ? theme.secondary
                        : theme.primary,
                      border: 'none',
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                      textAlign: 'left',
                      width: '100%'
                    }}
                  >
                    <div style={{
                      width: '16px',
                      height: '16px',
                      borderRadius: '4px',
                      background: `linear-gradient(135deg, ${themeColors.background} 0%, ${themeColors.gridBg} 100%)`,
                      border: `1px solid ${themeColors.secondary}40`
                    }} />
                    {themeOption.label}
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};