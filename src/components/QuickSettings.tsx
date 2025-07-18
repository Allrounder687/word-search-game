import React, { useState } from 'react';
import { Palette, Sparkles, X } from 'lucide-react';
import type { GameSettings, Theme, WordCategory } from '../types/game';
import { THEMES } from '../types/game';

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
  };

  const handleThemeChange = (newTheme: Theme) => {
    onSettingsChange({
      ...settings,
      theme: newTheme
    });
    setShowThemeDropdown(false);
  };

  const getCurrentCategoryLabel = () => {
    return 'Categories';
  };

  const getCurrentThemeLabel = () => {
    return 'Themes';
  };

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