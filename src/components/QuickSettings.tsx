import React, { useState } from 'react';
import { Palette, Sparkles, X, ChevronDown } from 'lucide-react';
import type { GameSettings, Theme, WordCategory } from '../types/game';
import { THEMES } from '../types/game';
import { getResponsiveIconSize } from '../utils/responsiveLayout';

interface QuickSettingsProps {
  settings: GameSettings;
  onSettingsChange: (settings: GameSettings) => void;
  theme: any;
}

export const QuickSettings: React.FC<QuickSettingsProps> = ({
  settings,
  onSettingsChange,
  theme
}) => {
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);
  const [showThemeDropdown, setShowThemeDropdown] = useState(false);
  const [showDropdownMenu, setShowDropdownMenu] = useState(false);
  
  // Get responsive icon size
  const iconSize = getResponsiveIconSize(16);
  
  // Check if we're on a mobile device
  const isMobile = window.innerWidth < 480;

  const wordCategories: { value: WordCategory; label: string }[] = [
    { value: 'general', label: 'General' },
    { value: 'animals', label: 'Animals' },
    { value: 'islamicPlaces', label: 'Islamic Places' },
    { value: 'islamicProphets', label: 'Islamic Prophets' },
    { value: 'fivePillars', label: 'Five Pillars' },
    { value: 'islamicTerms', label: 'Islamic Terms' },
    { value: 'custom', label: 'Custom Words' }
  ];

  const themes: { value: Theme; label: string }[] = [
    { value: 'midnight', label: 'Midnight' },
    { value: 'royal', label: 'Royal Blue' },
    { value: 'darkRoyal', label: 'Dark Royal' },
    { value: 'pink', label: 'Pink' },
    { value: 'darkPink', label: 'Dark Pink' },
    { value: 'pure', label: 'White' },
    { value: 'ocean', label: 'Ocean' },
    { value: 'sunset', label: 'Sunset' },
    { value: 'neon', label: 'Neon' },
    { value: 'custom', label: 'Custom Theme' }
  ];

  const handleCategoryChange = (category: WordCategory) => {
    onSettingsChange({
      ...settings,
      wordCategory: category
    });
    setShowCategoryDropdown(false);
    setShowDropdownMenu(false);
  };

  const handleThemeChange = (newTheme: Theme) => {
    onSettingsChange({
      ...settings,
      theme: newTheme
    });
    setShowThemeDropdown(false);
    setShowDropdownMenu(false);
  };

  const getCurrentCategoryLabel = () => {
    const currentCategory = wordCategories.find(c => c.value === settings.wordCategory);
    return isMobile ? currentCategory?.label || 'Category' : 'Categories';
  };

  const getCurrentThemeLabel = () => {
    const currentTheme = themes.find(t => t.value === settings.theme);
    return isMobile ? currentTheme?.label || 'Theme' : 'Themes';
  };
  
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

        {/* Combined dropdown menu */}
        {showDropdownMenu && (
          <div style={{
            position: 'absolute',
            top: '120px', // Position below header
            left: '16px',
            right: '16px',
            backgroundColor: theme.gridBg,
            borderRadius: '8px',
            boxShadow: '0 10px 25px rgba(0, 0, 0, 0.3)',
            zIndex: 100,
            padding: '12px',
            border: `1px solid ${theme.secondary}20`,
            animation: 'fadeIn 0.2s ease'
          }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '12px',
              paddingBottom: '8px',
              borderBottom: `1px solid ${theme.secondary}20`
            }}>
              <span style={{ fontWeight: 'bold', fontSize: '16px', color: theme.primary }}>
                Game Options
              </span>
              <button
                onClick={() => setShowDropdownMenu(false)}
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
                <X size={iconSize} />
              </button>
            </div>
            
            {/* Category section */}
            <div style={{ marginBottom: '16px' }}>
              <div style={{ 
                fontWeight: 'bold', 
                fontSize: '14px', 
                color: theme.secondary,
                marginBottom: '8px' 
              }}>
                Word Category
              </div>
              <div style={{
                display: 'flex',
                flexDirection: 'row',
                flexWrap: 'wrap',
                gap: '6px',
                maxHeight: '150px',
                overflowY: 'auto'
              }}>
                {wordCategories.map((category) => (
                  <button
                    key={category.value}
                    onClick={() => handleCategoryChange(category.value)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      padding: '6px 10px',
                      borderRadius: '6px',
                      backgroundColor: settings.wordCategory === category.value
                        ? `${theme.secondary}20`
                        : 'transparent',
                      color: settings.wordCategory === category.value
                        ? theme.secondary
                        : theme.primary,
                      border: `1px solid ${settings.wordCategory === category.value ? theme.secondary : theme.secondary + '20'}`,
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                      textAlign: 'center',
                      fontSize: '13px'
                    }}
                  >
                    {category.label}
                  </button>
                ))}
              </div>
            </div>
            
            {/* Theme section */}
            <div>
              <div style={{ 
                fontWeight: 'bold', 
                fontSize: '14px', 
                color: theme.secondary,
                marginBottom: '8px' 
              }}>
                Theme
              </div>
              <div style={{
                display: 'flex',
                flexDirection: 'row',
                flexWrap: 'wrap',
                gap: '6px',
                maxHeight: '150px',
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
                        gap: '6px',
                        padding: '6px 10px',
                        borderRadius: '6px',
                        backgroundColor: settings.theme === themeOption.value
                          ? `${theme.secondary}20`
                          : 'transparent',
                        color: settings.theme === themeOption.value
                          ? theme.secondary
                          : theme.primary,
                        border: `1px solid ${settings.theme === themeOption.value ? theme.secondary : theme.secondary + '20'}`,
                        cursor: 'pointer',
                        transition: 'all 0.2s',
                        textAlign: 'center',
                        fontSize: '13px'
                      }}
                    >
                      <div style={{
                        width: '12px',
                        height: '12px',
                        borderRadius: '3px',
                        background: `linear-gradient(135deg, ${themeColors.background} 0%, ${themeColors.gridBg} 100%)`,
                        border: `1px solid ${themeColors.secondary}40`
                      }} />
                      {themeOption.label}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        )}
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