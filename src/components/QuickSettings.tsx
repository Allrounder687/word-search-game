import React, { useState, useMemo, useCallback } from 'react';
import {
  Palette, Sparkles, X, ChevronDown, RefreshCw, ZoomIn, ZoomOut,
  MousePointer, Hand, Volume2, VolumeX, Eye, EyeOff, Timer,
  RotateCcw, Settings, Gamepad2, Moon, Sun
} from 'lucide-react';
import type { GameSettings, Theme } from '../types/game';
import { ISLAMIC_CATEGORIES } from '../types/islamicCategories';
import { THEMES } from '../types/game';
import type { WordCategory } from '../types/game';
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
  const [showGameControlsDropdown, setShowGameControlsDropdown] = useState(false);

  // Device detection
  const [isMobile, setIsMobile] = useState(() => window.innerWidth < 768);
  const [isTablet, setIsTablet] = useState(() => window.innerWidth >= 768 && window.innerWidth < 1024);
  const isIPad = /iPad/i.test(navigator.userAgent) ||
                (/Macintosh/i.test(navigator.userAgent) && 'ontouchend' in document);
  const isLandscape = window.innerWidth > window.innerHeight;

  // Handle window resize for responsive behavior
  React.useEffect(() => {
    const handleResize = () => {
      try {
        setIsMobile(window.innerWidth < 768);
        setIsTablet(window.innerWidth >= 768 && window.innerWidth < 1024);
      } catch (error) {
        console.warn('Error handling window resize:', error);
      }
    };

    if (typeof window !== 'undefined') {
      window.addEventListener('resize', handleResize);
      window.addEventListener('orientationchange', handleResize);
      return () => {
        window.removeEventListener('resize', handleResize);
        window.removeEventListener('orientationchange', handleResize);
      };
    }
  }, []);

  // Map between Islamic category keys and WordCategory type
  const categoryKeyToWordCategory: Record<string, WordCategory> = {
    'five-pillars': 'fivePillars',
    'prophets': 'islamicProphets',
    'islamic-months': 'islamicMonths',
    'muslim-scientists': 'muslimScientists',
    'islamic-landmarks': 'islamicPlaces',
    'quranic-surahs': 'quranicSurahs',
    'islamic-values': 'islamicValues',
    'islamic-angels': 'islamicAngels',
    'islamic-books': 'islamicBooks',
    'islamic-events': 'islamicEvents',
    'islamic-virtues': 'islamicVirtues'
  };

  // Build dynamic category list for dropdowns
  const wordCategories = useMemo(() =>
    ISLAMIC_CATEGORIES.map(cat => ({
      value: categoryKeyToWordCategory[cat.key] || 'general',
      label: cat.name,
      originalKey: cat.key
    })),
    []
  );

  // Get responsive icon size
  const iconSize = getResponsiveIconSize(16);

  const themes = useMemo(() => [
    { value: 'midnight' as const, label: 'Midnight', icon: Moon },
    { value: 'royal' as const, label: 'Royal Blue', icon: Sparkles },
    { value: 'darkRoyal' as const, label: 'Dark Royal', icon: Moon },
    { value: 'pink' as const, label: 'Pink', icon: Sparkles },
    { value: 'darkPink' as const, label: 'Dark Pink', icon: Moon },
    { value: 'pure' as const, label: 'White', icon: Sun },
    { value: 'ocean' as const, label: 'Ocean', icon: Sparkles },
    { value: 'sunset' as const, label: 'Sunset', icon: Sun },
    { value: 'neon' as const, label: 'Neon', icon: Sparkles },
    { value: 'forest' as const, label: 'Forest', icon: Sparkles },
    { value: 'custom' as const, label: 'Custom Theme', icon: Palette }
  ], []);

  const handleCategoryChange = useCallback((categoryKey: string) => {
    const newSettings = {
      ...settings,
      wordCategory: categoryKey as WordCategory
    };
    onSettingsChange(newSettings);
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

  const handleDifficultyChange = useCallback((difficulty: 'easy' | 'medium' | 'hard') => {
    onSettingsChange({
      ...settings,
      difficulty
    });
    setShowGameControlsDropdown(false);
    setShowDropdownMenu(false);
  }, [settings, onSettingsChange]);

  const handleTimerModeChange = useCallback((timerMode: 'countup' | 'countdown' | 'none') => {
    const newSettings = {
      ...settings,
      timerMode,
      ...(timerMode === 'countdown' && !settings.timerDuration && { timerDuration: 300 }) // 5 minutes default
    };
    onSettingsChange(newSettings);
    setShowGameControlsDropdown(false);
    setShowDropdownMenu(false);
  }, [settings, onSettingsChange]);

  const toggleDescriptions = useCallback(() => {
    onSettingsChange({
      ...settings,
      showDescriptions: !settings.showDescriptions
    });
  }, [settings, onSettingsChange]);

  const toggleKidsMode = useCallback(() => {
    onSettingsChange({
      ...settings,
      kidsMode: !settings.kidsMode
    });
  }, [settings, onSettingsChange]);

  const getCurrentCategoryLabel = useCallback(() => {
    const currentCategory = wordCategories.find(c => c.value === settings.wordCategory);
    return isMobile ? currentCategory?.label || 'Category' : 'Categories';
  }, [wordCategories, settings.wordCategory, isMobile]);

  const getCurrentThemeLabel = useCallback(() => {
    const currentTheme = themes.find(t => t.value === settings.theme);
    return isMobile ? currentTheme?.label || 'Theme' : 'Themes';
  }, [themes, settings.theme, isMobile]);

  // Quick action buttons for all devices
  const QuickActionButtons = () => (
    <div style={{
      display: 'flex',
      gap: '8px',
      alignItems: 'center',
      flexWrap: 'wrap'
    }}>
      {/* Reset Game */}
      {onReset && (
        <button
          onClick={onReset}
          style={{
            padding: isMobile ? '8px' : '10px',
            borderRadius: '8px',
            backgroundColor: theme.cellBg,
            color: theme.primary,
            border: `1px solid ${theme.secondary}40`,
            cursor: 'pointer',
            transition: 'all 0.2s',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            minHeight: '44px',
            minWidth: '44px',
            justifyContent: 'center'
          }}
          title="Reset Game"
          aria-label="Reset Game"
        >
          <RefreshCw size={iconSize} />
          {!isMobile && <span style={{ fontSize: '14px' }}>Reset</span>}
        </button>
      )}

      {/* Zoom Toggle */}
      {onToggleZoom && (
        <button
          onClick={onToggleZoom}
          style={{
            padding: isMobile ? '8px' : '10px',
            borderRadius: '8px',
            backgroundColor: isZoomed ? theme.accent + '40' : theme.cellBg,
            color: isZoomed ? theme.accent : theme.primary,
            border: `1px solid ${isZoomed ? theme.accent : theme.secondary + '40'}`,
            cursor: 'pointer',
            transition: 'all 0.2s',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            minHeight: '44px',
            minWidth: '44px',
            justifyContent: 'center'
          }}
          title={isZoomed ? "Zoom Out" : "Zoom In"}
          aria-label={isZoomed ? "Zoom Out" : "Zoom In"}
        >
          {isZoomed ? <ZoomOut size={iconSize} /> : <ZoomIn size={iconSize} />}
          {!isMobile && <span style={{ fontSize: '14px' }}>{isZoomed ? 'Zoom Out' : 'Zoom In'}</span>}
        </button>
      )}

      {/* Selection Mode Toggle */}
      {onToggleClickMode && (
        <button
          onClick={onToggleClickMode}
          style={{
            padding: isMobile ? '8px' : '10px',
            borderRadius: '8px',
            backgroundColor: isClickMode ? theme.accent + '40' : theme.cellBg,
            color: isClickMode ? theme.accent : theme.primary,
            border: `1px solid ${isClickMode ? theme.accent : theme.secondary + '40'}`,
            cursor: 'pointer',
            transition: 'all 0.2s',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            minHeight: '44px',
            minWidth: '44px',
            justifyContent: 'center'
          }}
          title={isClickMode ? "Drag Mode" : "Click Mode"}
          aria-label={isClickMode ? "Switch to Drag Mode" : "Switch to Click Mode"}
        >
          {isClickMode ? <MousePointer size={iconSize} /> : <Hand size={iconSize} />}
          {!isMobile && <span style={{ fontSize: '14px' }}>{isClickMode ? 'Click' : 'Drag'}</span>}
        </button>
      )}

      {/* Descriptions Toggle */}
      <button
        onClick={toggleDescriptions}
        style={{
          padding: isMobile ? '8px' : '10px',
          borderRadius: '8px',
          backgroundColor: settings.showDescriptions ? theme.accent + '40' : theme.cellBg,
          color: settings.showDescriptions ? theme.accent : theme.primary,
          border: `1px solid ${settings.showDescriptions ? theme.accent : theme.secondary + '40'}`,
          cursor: 'pointer',
          transition: 'all 0.2s',
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          minHeight: '44px',
          minWidth: '44px',
          justifyContent: 'center'
        }}
        title={settings.showDescriptions ? "Hide Descriptions" : "Show Descriptions"}
        aria-label={settings.showDescriptions ? "Hide Descriptions" : "Show Descriptions"}
      >
        {settings.showDescriptions ? <Eye size={iconSize} /> : <EyeOff size={iconSize} />}
        {!isMobile && <span style={{ fontSize: '14px' }}>Info</span>}
      </button>

      {/* Kids Mode Toggle */}
      <button
        onClick={toggleKidsMode}
        style={{
          padding: isMobile ? '8px' : '10px',
          borderRadius: '8px',
          backgroundColor: settings.kidsMode ? theme.accent + '40' : theme.cellBg,
          color: settings.kidsMode ? theme.accent : theme.primary,
          border: `1px solid ${settings.kidsMode ? theme.accent : theme.secondary + '40'}`,
          cursor: 'pointer',
          transition: 'all 0.2s',
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          minHeight: '44px',
          minWidth: '44px',
          justifyContent: 'center'
        }}
        title={settings.kidsMode ? "Disable Kids Mode" : "Enable Kids Mode"}
        aria-label={settings.kidsMode ? "Disable Kids Mode" : "Enable Kids Mode"}
      >
        <Gamepad2 size={iconSize} />
        {!isMobile && <span style={{ fontSize: '14px' }}>Kids</span>}
      </button>
    </div>
  );

  // For iPad landscape mode, use horizontal layout with more options
  if (isIPad && isLandscape) {
    return (
      <div style={{
        display: 'flex',
        flexDirection: 'row',
        gap: '12px',
        marginBottom: '16px',
        width: '100%',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap'
      }}>
        {/* Category Selector */}
        <div style={{ position: 'relative', flex: '0 0 auto', minWidth: '180px' }}>
          <button
            onClick={() => {
              setShowCategoryDropdown(!showCategoryDropdown);
              setShowThemeDropdown(false);
              setShowGameControlsDropdown(false);
            }}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              width: '100%',
              padding: '12px',
              borderRadius: '8px',
              backgroundColor: theme.gridBg,
              color: theme.primary,
              border: `1px solid ${theme.secondary}40`,
              cursor: 'pointer',
              transition: 'all 0.2s',
              fontSize: '14px',
              minHeight: '44px'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Sparkles size={18} style={{ color: theme.secondary }} />
              <span>Category</span>
            </div>
            <ChevronDown size={16} />
          </button>

          {showCategoryDropdown && (
            <div style={{
              position: 'absolute',
              top: 'calc(100% + 4px)',
              left: 0,
              width: '250px',
              backgroundColor: theme.gridBg,
              borderRadius: '12px',
              boxShadow: '0 10px 25px rgba(0, 0, 0, 0.3)',
              zIndex: 100,
              padding: '12px',
              border: `1px solid ${theme.secondary}20`,
              maxHeight: '300px',
              overflowY: 'auto'
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
                  Word Categories
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
                  <X size={18} />
                </button>
              </div>
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '6px'
              }}>
                {wordCategories.map((category) => (
                  <button
                    key={category.value}
                    onClick={() => handleCategoryChange(category.value)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      padding: '10px 12px',
                      borderRadius: '8px',
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
                      width: '100%',
                      minHeight: '44px'
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
        <div style={{ position: 'relative', flex: '0 0 auto', minWidth: '160px' }}>
          <button
            onClick={() => {
              setShowThemeDropdown(!showThemeDropdown);
              setShowCategoryDropdown(false);
              setShowGameControlsDropdown(false);
            }}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              width: '100%',
              padding: '12px',
              borderRadius: '8px',
              backgroundColor: theme.gridBg,
              color: theme.primary,
              border: `1px solid ${theme.secondary}40`,
              cursor: 'pointer',
              transition: 'all 0.2s',
              fontSize: '14px',
              minHeight: '44px'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Palette size={18} style={{ color: theme.secondary }} />
              <span>Theme</span>
            </div>
            <ChevronDown size={16} />
          </button>

          {showThemeDropdown && (
            <div style={{
              position: 'absolute',
              top: 'calc(100% + 4px)',
              left: 0,
              width: '220px',
              backgroundColor: theme.gridBg,
              borderRadius: '12px',
              boxShadow: '0 10px 25px rgba(0, 0, 0, 0.3)',
              zIndex: 100,
              padding: '12px',
              border: `1px solid ${theme.secondary}20`,
              maxHeight: '300px',
              overflowY: 'auto'
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
                  Themes
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
                  <X size={18} />
                </button>
              </div>
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '6px'
              }}>
                {themes.map((themeOption) => {
                  const themeColors = THEMES[themeOption.value as keyof typeof THEMES] || THEMES.midnight;
                  const IconComponent = themeOption.icon;

                  return (
                    <button
                      key={themeOption.value}
                      onClick={() => handleThemeChange(themeOption.value)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '10px',
                        padding: '10px 12px',
                        borderRadius: '8px',
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
                        width: '100%',
                        minHeight: '44px'
                      }}
                    >
                      <div style={{
                        width: '18px',
                        height: '18px',
                        borderRadius: '4px',
                        background: `linear-gradient(135deg, ${themeColors.background} 0%, ${themeColors.gridBg} 100%)`,
                        border: `1px solid ${themeColors.secondary}40`
                      }} />
                      <IconComponent size={16} />
                      {themeOption.label}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Game Controls */}
        <div style={{ position: 'relative', flex: '0 0 auto', minWidth: '140px' }}>
          <button
            onClick={() => {
              setShowGameControlsDropdown(!showGameControlsDropdown);
              setShowCategoryDropdown(false);
              setShowThemeDropdown(false);
            }}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              width: '100%',
              padding: '12px',
              borderRadius: '8px',
              backgroundColor: theme.gridBg,
              color: theme.primary,
              border: `1px solid ${theme.secondary}40`,
              cursor: 'pointer',
              transition: 'all 0.2s',
              fontSize: '14px',
              minHeight: '44px'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Settings size={18} style={{ color: theme.secondary }} />
              <span>Game</span>
            </div>
            <ChevronDown size={16} />
          </button>

          {showGameControlsDropdown && (
            <div style={{
              position: 'absolute',
              top: 'calc(100% + 4px)',
              left: 0,
              width: '200px',
              backgroundColor: theme.gridBg,
              borderRadius: '12px',
              boxShadow: '0 10px 25px rgba(0, 0, 0, 0.3)',
              zIndex: 100,
              padding: '12px',
              border: `1px solid ${theme.secondary}20`
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
                  Game Settings
                </span>
                <button
                  onClick={() => setShowGameControlsDropdown(false)}
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
                  <X size={18} />
                </button>
              </div>

              {/* Difficulty buttons */}
              <div style={{ marginBottom: '12px' }}>
                <span style={{
                  fontSize: '12px',
                  color: theme.secondary,
                  textTransform: 'uppercase',
                  fontWeight: '600'
                }}>
                  Difficulty
                </span>
                <div style={{ display: 'flex', gap: '4px', marginTop: '6px' }}>
                  {['easy', 'medium', 'hard'].map((difficulty) => (
                    <button
                      key={difficulty}
                      onClick={() => handleDifficultyChange(difficulty as 'easy' | 'medium' | 'hard')}
                      style={{
                        flex: 1,
                        padding: '8px 4px',
                        borderRadius: '6px',
                        backgroundColor: settings.difficulty === difficulty
                          ? theme.secondary
                          : 'transparent',
                        color: settings.difficulty === difficulty
                          ? 'white'
                          : theme.primary,
                        border: `1px solid ${settings.difficulty === difficulty ? theme.secondary : theme.secondary + '40'}`,
                        cursor: 'pointer',
                        transition: 'all 0.2s',
                        fontSize: '12px',
                        textTransform: 'capitalize'
                      }}
                    >
                      {difficulty}
                    </button>
                  ))}
                </div>
              </div>

              {/* Timer mode buttons */}
              <div>
                <span style={{
                  fontSize: '12px',
                  color: theme.secondary,
                  textTransform: 'uppercase',
                  fontWeight: '600'
                }}>
                  Timer
                </span>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', marginTop: '6px' }}>
                  {[
                    { value: 'none', label: 'No Timer', icon: X },
                    { value: 'countup', label: 'Count Up', icon: Timer },
                    { value: 'countdown', label: 'Countdown', icon: RotateCcw }
                  ].map((timerOption) => {
                    const IconComponent = timerOption.icon;
                    return (
                      <button
                        key={timerOption.value}
                        onClick={() => handleTimerModeChange(timerOption.value as 'countup' | 'countdown' | 'none')}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px',
                          padding: '8px',
                          borderRadius: '6px',
                          backgroundColor: settings.timerMode === timerOption.value
                            ? `${theme.secondary}20`
                            : 'transparent',
                          color: settings.timerMode === timerOption.value
                            ? theme.secondary
                            : theme.primary,
                          border: 'none',
                          cursor: 'pointer',
                          transition: 'all 0.2s',
                          fontSize: '12px',
                          width: '100%',
                          textAlign: 'left'
                        }}
                      >
                        <IconComponent size={14} />
                        {timerOption.label}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Quick Action Buttons */}
        <div style={{ flex: '1 1 auto', display: 'flex', justifyContent: 'flex-end' }}>
          <QuickActionButtons />
        </div>
      </div>
    );
  }

  // For very small screens, use a single comprehensive dropdown menu
  if (isMobile) {
    return (
      <div style={{
        display: 'flex',
        flexDirection: 'row',
        gap: '8px',
        marginBottom: '12px',
        width: '100%',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        {/* Combined dropdown button */}
        <button
          onClick={() => setShowDropdownMenu(!showDropdownMenu)}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flex: 1,
            padding: '10px 12px',
            borderRadius: '8px',
            backgroundColor: theme.gridBg,
            color: theme.primary,
            border: `1px solid ${theme.secondary}40`,
            cursor: 'pointer',
            transition: 'all 0.2s',
            fontSize: '14px',
            minHeight: '44px'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Settings size={iconSize} style={{ color: theme.secondary }} />
            <span>Game Options</span>
          </div>
          <ChevronDown size={iconSize} style={{ color: theme.primary }} />
        </button>

        {/* Quick action buttons - most essential ones */}
        <div style={{ display: 'flex', gap: '6px' }}>
          {onReset && (
            <button
              onClick={onReset}
              style={{
                padding: '10px',
                borderRadius: '8px',
                backgroundColor: theme.cellBg,
                color: theme.primary,
                border: `1px solid ${theme.secondary}40`,
                cursor: 'pointer',
                transition: 'all 0.2s',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                minHeight: '44px',
                minWidth: '44px'
              }}
              title="Reset Game"
            >
              <RefreshCw size={16} />
            </button>
          )}

          <button
            onClick={toggleDescriptions}
            style={{
              padding: '10px',
              borderRadius: '8px',
              backgroundColor: settings.showDescriptions ? theme.accent + '40' : theme.cellBg,
              color: settings.showDescriptions ? theme.accent : theme.primary,
              border: `1px solid ${settings.showDescriptions ? theme.accent : theme.secondary + '40'}`,
              cursor: 'pointer',
              transition: 'all 0.2s',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              minHeight: '44px',
              minWidth: '44px'
            }}
            title={settings.showDescriptions ? "Hide Descriptions" : "Show Descriptions"}
          >
            {settings.showDescriptions ? <Eye size={16} /> : <EyeOff size={16} />}
          </button>
        </div>

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
          // Enhanced options
          onDifficultyChange={handleDifficultyChange}
          onTimerModeChange={handleTimerModeChange}
          toggleDescriptions={toggleDescriptions}
          toggleKidsMode={toggleKidsMode}
          key={wordCategories.length}
        />
      </div>
    );
  }

  // Standard layout for larger screens (desktop and tablet portrait)
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'row',
      gap: '12px',
      marginBottom: '16px',
      width: '100%',
      justifyContent: 'center',
      flexWrap: 'wrap'
    }}>
      {/* Category Selector */}
      <div style={{ position: 'relative', flex: '1 1 auto', maxWidth: '200px', minWidth: '160px' }}>
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
            padding: '12px',
            borderRadius: '8px',
            backgroundColor: theme.gridBg,
            color: theme.primary,
            border: `1px solid ${theme.secondary}40`,
            cursor: 'pointer',
            transition: 'all 0.2s',
            fontSize: '14px',
            minHeight: '44px'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Sparkles size={18} style={{ color: theme.secondary }} />
            <span>{getCurrentCategoryLabel()}</span>
          </div>
          <ChevronDown size={16} />
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
      <div style={{ position: 'relative', flex: '1 1 auto', maxWidth: '180px', minWidth: '140px' }}>
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
            padding: '12px',
            borderRadius: '8px',
            backgroundColor: theme.gridBg,
            color: theme.primary,
            border: `1px solid ${theme.secondary}40`,
            cursor: 'pointer',
            transition: 'all 0.2s',
            fontSize: '14px',
            minHeight: '44px'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Palette size={18} style={{ color: theme.secondary }} />
            <span>{getCurrentThemeLabel()}</span>
          </div>
          <ChevronDown size={16} />
        </button>

        {showThemeDropdown && (
          <div style={{
            position: 'absolute',
            top: 'calc(100% + 4px)',
            left: 0,
            width: '220px',
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
                const IconComponent = themeOption.icon;

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
                    <IconComponent size={14} />
                    {themeOption.label}
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Quick Action Buttons for Desktop */}
      <div style={{ flex: '2 1 auto', display: 'flex', justifyContent: 'flex-end' }}>
        <QuickActionButtons />
      </div>
    </div>
  );
};