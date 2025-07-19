import React, { useState } from 'react';
import {
  X, RotateCcw, ZoomIn, ZoomOut, MousePointer, Hand, Info,
  Eye, EyeOff, Gamepad2, Timer, Settings, Palette, Sparkles
} from 'lucide-react';
import type { Theme } from '../../types/game';
import { THEMES } from '../../types/game';
import { ISLAMIC_CATEGORIES } from '../../types/islamicCategories';

interface CategoryOption {
  value: string;
  label: string;
  originalKey?: string;
  description?: string;
}

interface ThemeOption {
  value: Theme;
  label: string;
  icon: React.ComponentType<{ size?: number }>;
}

interface MobileDropdownProps {
  isOpen: boolean;
  onClose: () => void;
  settings: any;
  wordCategories: CategoryOption[];
  themes: ThemeOption[];
  onCategoryChange: (category: string) => void;
  onThemeChange: (theme: Theme) => void;
  theme: any;
  iconSize: number;
  // Game control props
  onReset?: () => void;
  onToggleZoom?: () => void;
  onToggleClickMode?: () => void;
  isZoomed?: boolean;
  isClickMode?: boolean;
  // Enhanced props
  onDifficultyChange?: (difficulty: 'easy' | 'medium' | 'hard') => void;
  onTimerModeChange?: (timerMode: 'countup' | 'countdown' | 'none') => void;
  toggleDescriptions?: () => void;
  toggleKidsMode?: () => void;
}

export const MobileDropdown: React.FC<MobileDropdownProps> = ({
  isOpen,
  onClose,
  settings,
  wordCategories,
  themes,
  onCategoryChange,
  onThemeChange,
  theme,
  iconSize,
  onReset,
  onToggleZoom,
  onToggleClickMode,
  isZoomed,
  isClickMode,
  onDifficultyChange,
  onTimerModeChange,
  toggleDescriptions,
  toggleKidsMode
}) => {
  if (!isOpen) return null;

  const [showInfo, setShowInfo] = useState<{[key: string]: boolean}>({});
  const [activeSection, setActiveSection] = useState<'categories' | 'themes' | 'game' | 'controls'>('categories');

  // Create a map of category keys to their descriptions
  const categoryDescriptions = ISLAMIC_CATEGORIES.reduce((acc, category) => {
    // Use the category description or first word description
    const description = category.description ||
      (category.words[0] && category.descriptions[category.words[0]]) ||
      `Learn about ${category.name.toLowerCase()}`;
    acc[category.key] = description;
    return acc;
  }, {} as Record<string, string>);

  // Toggle info display for a category
  const toggleInfo = (key: string) => {
    setShowInfo(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const SectionButton = ({
    section,
    icon: Icon,
    label,
    isActive
  }: {
    section: string;
    icon: React.ComponentType<{ size?: number }>;
    label: string;
    isActive: boolean;
  }) => (
    <button
      onClick={() => setActiveSection(section as any)}
      style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '4px',
        padding: '8px 4px',
        borderRadius: '6px',
        backgroundColor: isActive ? theme.secondary + '20' : 'transparent',
        color: isActive ? theme.secondary : theme.primary,
        border: `1px solid ${isActive ? theme.secondary : 'transparent'}`,
        cursor: 'pointer',
        transition: 'all 0.2s',
        fontSize: '11px',
        minHeight: '60px',
        justifyContent: 'center'
      }}
    >
      <Icon size={16} />
      <span>{label}</span>
    </button>
  );

  return (
    <>
      {/* Backdrop */}
      <div
        style={{
          position: 'fixed',
          inset: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          backdropFilter: 'blur(4px)',
          zIndex: 99
        }}
        onClick={onClose}
      />

      {/* Modal */}
      <div style={{
        position: 'fixed',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        width: '90vw',
        maxWidth: '400px',
        maxHeight: '80vh',
        backgroundColor: theme.gridBg + 'F8',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        borderRadius: '16px',
        boxShadow: '0 20px 40px rgba(0, 0, 0, 0.3)',
        zIndex: 100,
        border: `1px solid ${theme.secondary}40`,
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column'
      }}>
        {/* Header */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '16px',
          borderBottom: `1px solid ${theme.secondary}20`,
          flexShrink: 0
        }}>
          <span style={{ fontWeight: 'bold', fontSize: '18px', color: theme.primary }}>
            Game Settings
          </span>
          <button
            onClick={onClose}
            style={{
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              padding: '8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: theme.primary,
              borderRadius: '50%',
              transition: 'background-color 0.2s'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = theme.secondary + '20';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent';
            }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Section Navigation */}
        <div style={{
          display: 'flex',
          padding: '12px',
          gap: '6px',
          borderBottom: `1px solid ${theme.secondary}20`,
          flexShrink: 0
        }}>
          <SectionButton
            section="categories"
            icon={Sparkles}
            label="Category"
            isActive={activeSection === 'categories'}
          />
          <SectionButton
            section="themes"
            icon={Palette}
            label="Theme"
            isActive={activeSection === 'themes'}
          />
          <SectionButton
            section="game"
            icon={Settings}
            label="Game"
            isActive={activeSection === 'game'}
          />
          <SectionButton
            section="controls"
            icon={MousePointer}
            label="Controls"
            isActive={activeSection === 'controls'}
          />
        </div>

        {/* Content Area */}
        <div style={{
          flex: 1,
          overflowY: 'auto',
          padding: '16px',
          WebkitOverflowScrolling: 'touch'
        }}>
          {/* Categories Section */}
          {activeSection === 'categories' && (
            <div>
              <h3 style={{
                margin: '0 0 12px 0',
                fontSize: '16px',
                color: theme.secondary,
                fontWeight: '600'
              }}>
                Word Categories
              </h3>
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '8px'
              }}>
                {wordCategories.map((category) => {
                  const originalKey = (category as any).originalKey || category.value;
                  const description = categoryDescriptions[originalKey];
                  const isInfoShown = showInfo[originalKey];
                  const isSelected = settings.wordCategory === category.value;

                  return (
                    <div key={category.value} style={{ width: '100%' }}>
                      <div style={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                        <button
                          onClick={() => onCategoryChange(category.value)}
                          style={{
                            backgroundColor: isSelected ? theme.secondary : 'transparent',
                            color: isSelected ? 'white' : theme.primary,
                            border: `1px solid ${isSelected ? theme.secondary : theme.secondary + '40'}`,
                            padding: '12px 16px',
                            borderRadius: '8px',
                            cursor: 'pointer',
                            flex: 1,
                            textAlign: 'left',
                            marginRight: '8px',
                            transition: 'all 0.2s ease',
                            fontSize: '14px',
                            fontWeight: isSelected ? '600' : '400'
                          }}
                        >
                          {category.label}
                        </button>
                        {description && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleInfo(originalKey);
                            }}
                            style={{
                              background: isInfoShown ? theme.secondary + '20' : 'transparent',
                              border: `1px solid ${theme.secondary}40`,
                              color: theme.secondary,
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              padding: '12px',
                              borderRadius: '8px',
                              transition: 'all 0.2s ease',
                              minWidth: '44px',
                              minHeight: '44px'
                            }}
                            aria-label="Show category information"
                          >
                            <Info size={16} />
                          </button>
                        )}
                      </div>
                      {isInfoShown && description && (
                        <div
                          style={{
                            backgroundColor: theme.cellBg,
                            color: theme.primary,
                            padding: '12px',
                            borderRadius: '8px',
                            marginTop: '8px',
                            fontSize: '13px',
                            borderLeft: `3px solid ${theme.secondary}`,
                            lineHeight: '1.4'
                          }}
                        >
                          {description}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Themes Section */}
          {activeSection === 'themes' && (
            <div>
              <h3 style={{
                margin: '0 0 12px 0',
                fontSize: '16px',
                color: theme.secondary,
                fontWeight: '600'
              }}>
                Color Themes
              </h3>
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
                gap: '8px'
              }}>
                {themes.map((themeOption) => {
                  const themeColors = THEMES[themeOption.value as keyof typeof THEMES] || THEMES.midnight;
                  const IconComponent = themeOption.icon;
                  const isSelected = settings.theme === themeOption.value;

                  return (
                    <button
                      key={themeOption.value}
                      onClick={() => onThemeChange(themeOption.value)}
                      style={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        gap: '8px',
                        padding: '12px',
                        borderRadius: '8px',
                        backgroundColor: isSelected ? theme.secondary + '20' : theme.cellBg,
                        color: isSelected ? theme.secondary : theme.primary,
                        border: `1px solid ${isSelected ? theme.secondary : theme.secondary + '20'}`,
                        cursor: 'pointer',
                        transition: 'all 0.2s',
                        textAlign: 'center',
                        fontSize: '12px',
                        minHeight: '80px',
                        justifyContent: 'center'
                      }}
                    >
                      <div style={{
                        width: '24px',
                        height: '24px',
                        borderRadius: '6px',
                        background: `linear-gradient(135deg, ${themeColors.background} 0%, ${themeColors.gridBg} 100%)`,
                        border: `2px solid ${themeColors.secondary}60`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}>
                        <IconComponent size={12} />
                      </div>
                      <span style={{ fontWeight: isSelected ? '600' : '400' }}>
                        {themeOption.label}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Game Settings Section */}
          {activeSection === 'game' && (
            <div>
              <h3 style={{
                margin: '0 0 16px 0',
                fontSize: '16px',
                color: theme.secondary,
                fontWeight: '600'
              }}>
                Game Settings
              </h3>

              {/* Difficulty */}
              {onDifficultyChange && (
                <div style={{ marginBottom: '20px' }}>
                  <span style={{
                    fontSize: '14px',
                    color: theme.primary,
                    fontWeight: '600',
                    display: 'block',
                    marginBottom: '8px'
                  }}>
                    Difficulty Level
                  </span>
                  <div style={{ display: 'flex', gap: '6px' }}>
                    {[
                      { value: 'easy', label: 'Easy', color: '#10b981' },
                      { value: 'medium', label: 'Medium', color: '#f59e0b' },
                      { value: 'hard', label: 'Hard', color: '#ef4444' }
                    ].map((difficulty) => (
                      <button
                        key={difficulty.value}
                        onClick={() => onDifficultyChange(difficulty.value as 'easy' | 'medium' | 'hard')}
                        style={{
                          flex: 1,
                          padding: '10px 8px',
                          borderRadius: '8px',
                          backgroundColor: settings.difficulty === difficulty.value
                            ? difficulty.color
                            : 'transparent',
                          color: settings.difficulty === difficulty.value
                            ? 'white'
                            : theme.primary,
                          border: `1px solid ${settings.difficulty === difficulty.value ? difficulty.color : theme.secondary + '40'}`,
                          cursor: 'pointer',
                          transition: 'all 0.2s',
                          fontSize: '12px',
                          fontWeight: settings.difficulty === difficulty.value ? '600' : '400'
                        }}
                      >
                        {difficulty.label}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Timer Mode */}
              {onTimerModeChange && (
                <div style={{ marginBottom: '20px' }}>
                  <span style={{
                    fontSize: '14px',
                    color: theme.primary,
                    fontWeight: '600',
                    display: 'block',
                    marginBottom: '8px'
                  }}>
                    Timer Mode
                  </span>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    {[
                      { value: 'none', label: 'No Timer', icon: X, desc: 'Play without time pressure' },
                      { value: 'countup', label: 'Count Up', icon: Timer, desc: 'Track how long it takes' },
                      { value: 'countdown', label: 'Countdown', icon: RotateCcw, desc: 'Race against time' }
                    ].map((timerOption) => {
                      const IconComponent = timerOption.icon;
                      const isSelected = settings.timerMode === timerOption.value;

                      return (
                        <button
                          key={timerOption.value}
                          onClick={() => onTimerModeChange(timerOption.value as 'countup' | 'countdown' | 'none')}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '12px',
                            padding: '12px',
                            borderRadius: '8px',
                            backgroundColor: isSelected ? theme.secondary + '20' : 'transparent',
                            color: isSelected ? theme.secondary : theme.primary,
                            border: `1px solid ${isSelected ? theme.secondary : theme.secondary + '20'}`,
                            cursor: 'pointer',
                            transition: 'all 0.2s',
                            fontSize: '14px',
                            width: '100%',
                            textAlign: 'left'
                          }}
                        >
                          <IconComponent size={18} />
                          <div style={{ flex: 1 }}>
                            <div style={{ fontWeight: isSelected ? '600' : '400' }}>
                              {timerOption.label}
                            </div>
                            <div style={{
                              fontSize: '11px',
                              opacity: 0.7,
                              marginTop: '2px'
                            }}>
                              {timerOption.desc}
                            </div>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Toggle Options */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {/* Descriptions Toggle */}
                {toggleDescriptions && (
                  <button
                    onClick={toggleDescriptions}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '12px',
                      borderRadius: '8px',
                      backgroundColor: settings.showDescriptions ? theme.secondary + '20' : 'transparent',
                      color: settings.showDescriptions ? theme.secondary : theme.primary,
                      border: `1px solid ${settings.showDescriptions ? theme.secondary : theme.secondary + '20'}`,
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                      fontSize: '14px',
                      width: '100%'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      {settings.showDescriptions ? <Eye size={18} /> : <EyeOff size={18} />}
                      <div>
                        <div style={{ fontWeight: '500' }}>Word Descriptions</div>
                        <div style={{ fontSize: '11px', opacity: 0.7 }}>
                          {settings.showDescriptions ? 'Showing explanations' : 'Hidden explanations'}
                        </div>
                      </div>
                    </div>
                  </button>
                )}

                {/* Kids Mode Toggle */}
                {toggleKidsMode && (
                  <button
                    onClick={toggleKidsMode}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '12px',
                      borderRadius: '8px',
                      backgroundColor: settings.kidsMode ? theme.secondary + '20' : 'transparent',
                      color: settings.kidsMode ? theme.secondary : theme.primary,
                      border: `1px solid ${settings.kidsMode ? theme.secondary : theme.secondary + '20'}`,
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                      fontSize: '14px',
                      width: '100%'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <Gamepad2 size={18} />
                      <div>
                        <div style={{ fontWeight: '500' }}>Kids Mode</div>
                        <div style={{ fontSize: '11px', opacity: 0.7 }}>
                          {settings.kidsMode ? 'Child-friendly content' : 'Standard content'}
                        </div>
                      </div>
                    </div>
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Controls Section */}
          {activeSection === 'controls' && (
            <div>
              <h3 style={{
                margin: '0 0 16px 0',
                fontSize: '16px',
                color: theme.secondary,
                fontWeight: '600'
              }}>
                Game Controls
              </h3>

              <div style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '12px'
              }}>
                {/* Selection Mode */}
                {onToggleClickMode && (
                  <button
                    onClick={onToggleClickMode}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px',
                      padding: '12px',
                      borderRadius: '8px',
                      backgroundColor: theme.cellBg,
                      color: theme.primary,
                      border: `1px solid ${theme.secondary}40`,
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                      fontSize: '14px',
                      width: '100%',
                      textAlign: 'left'
                    }}
                  >
                    {isClickMode ? <MousePointer size={20} /> : <Hand size={20} />}
                    <div>
                      <div style={{ fontWeight: '500' }}>
                        {isClickMode ? "Click Mode" : "Drag Mode"}
                      </div>
                      <div style={{ fontSize: '11px', opacity: 0.7 }}>
                        {isClickMode ? 'Tap start and end' : 'Drag to select'}
                      </div>
                    </div>
                  </button>
                )}

                {/* Zoom */}
                {onToggleZoom && (
                  <button
                    onClick={onToggleZoom}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px',
                      padding: '12px',
                      borderRadius: '8px',
                      backgroundColor: theme.cellBg,
                      color: theme.primary,
                      border: `1px solid ${theme.secondary}40`,
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                      fontSize: '14px',
                      width: '100%',
                      textAlign: 'left'
                    }}
                  >
                    {isZoomed ? <ZoomOut size={20} /> : <ZoomIn size={20} />}
                    <div>
                      <div style={{ fontWeight: '500' }}>
                        {isZoomed ? "Zoom Out" : "Zoom In"}
                      </div>
                      <div style={{ fontSize: '11px', opacity: 0.7 }}>
                        {isZoomed ? 'Show normal size' : 'Make letters bigger'}
                      </div>
                    </div>
                  </button>
                )}

                {/* Reset Game */}
                {onReset && (
                  <button
                    onClick={onReset}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px',
                      padding: '12px',
                      borderRadius: '8px',
                      backgroundColor: theme.cellBg,
                      color: theme.primary,
                      border: `1px solid ${theme.secondary}40`,
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                      fontSize: '14px',
                      width: '100%',
                      textAlign: 'left'
                    }}
                  >
                    <RotateCcw size={20} />
                    <div>
                      <div style={{ fontWeight: '500' }}>New Game</div>
                      <div style={{ fontSize: '11px', opacity: 0.7 }}>
                        Start over with new words
                      </div>
                    </div>
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
};