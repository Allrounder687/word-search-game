import React, { useState } from 'react';
import { X, RotateCcw, ZoomIn, MousePointer, Info } from 'lucide-react';
import type { Theme } from '../../types/game';
import { THEMES } from '../../types/game';
import { ISLAMIC_CATEGORIES } from '../../types/islamicCategories';

interface CategoryOption {
  value: string;
  label: string;
  originalKey?: string;
  description?: string;
}

interface MobileDropdownProps {
  isOpen: boolean;
  onClose: () => void;
  settings: any;
  wordCategories: CategoryOption[];
  themes: Array<{ value: Theme; label: string }>;
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
  isClickMode
}) => {
  if (!isOpen) return null;

  const [showInfo, setShowInfo] = useState<{[key: string]: boolean}>({});
  
  // Create a map of category keys to their descriptions
  const categoryDescriptions = ISLAMIC_CATEGORIES.reduce((acc, category) => {
    // Get the first description as a general description for the category
    const firstWord = category.words[0] || '';
    acc[category.key] = category.descriptions[firstWord] || '';
    return acc;
  }, {} as Record<string, string>);

  // Toggle info display for a category
  const toggleInfo = (key: string) => {
    setShowInfo(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  return (
    <div style={{
      position: 'absolute',
      top: '120px',
      left: '16px',
      right: '16px',
      backgroundColor: 'rgba(0, 0, 0, 0.99)',
      backdropFilter: 'blur(12px)',
      WebkitBackdropFilter: 'blur(12px)',
      borderRadius: '8px',
      boxShadow: '0 10px 25px rgba(0, 0, 0, 0.9)',
      zIndex: 100,
      padding: '12px',
      border: `1px solid ${theme.secondary}40`,
      animation: 'fadeIn 0.2s ease',
      color: theme.primary
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
          onClick={onClose}
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
          {wordCategories.map((category) => {
            const originalKey = (category as any).originalKey || category.value;
            const description = categoryDescriptions[originalKey];
            const isInfoShown = showInfo[originalKey];
            
            return (
              <div key={category.value} style={{ marginBottom: '8px', width: '100%' }}>
                <div style={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                  <button
                    onClick={() => onCategoryChange(category.value)}
                    style={{
                      backgroundColor: settings.wordCategory === category.value ? theme.primary : 'transparent',
                      color: settings.wordCategory === category.value ? theme.font : theme.primary,
                      border: `1px solid ${theme.primary}`,
                      padding: '8px 12px',
                      borderRadius: '4px',
                      cursor: 'pointer',
                      flex: 1,
                      textAlign: 'left',
                      marginRight: '8px',
                      transition: 'all 0.2s ease',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center'
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
                        background: 'transparent',
                        border: 'none',
                        color: theme.primary,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        padding: '8px',
                        borderRadius: '50%',
                        transition: 'all 0.2s ease'
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
                      backgroundColor: theme.gridBg,
                      color: theme.font,
                      padding: '8px',
                      borderRadius: '4px',
                      marginTop: '4px',
                      fontSize: '0.85rem',
                      borderLeft: `3px solid ${theme.primary}`
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
      
      {/* Theme section */}
      <div style={{ marginBottom: '16px' }}>
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
                onClick={() => onThemeChange(themeOption.value)}
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
      
      {/* Game Controls section */}
      <div>
        <div style={{ 
          fontWeight: 'bold', 
          fontSize: '14px', 
          color: theme.secondary,
          marginBottom: '8px' 
        }}>
          Game Controls
        </div>
        <div style={{
          display: 'flex',
          flexDirection: 'row',
          gap: '8px',
          justifyContent: 'flex-start'
        }}>
          {/* Click Mode Button */}
          {onToggleClickMode && (
            <button
              onClick={onToggleClickMode}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '4px',
                padding: '8px 12px',
                borderRadius: '6px',
                backgroundColor: isClickMode ? `${theme.secondary}20` : 'transparent',
                color: isClickMode ? theme.secondary : theme.primary,
                border: `1px solid ${isClickMode ? theme.secondary : theme.secondary + '20'}`,
                cursor: 'pointer',
                transition: 'all 0.2s',
                minWidth: '70px'
              }}
            >
              <MousePointer size={18} />
              <span style={{ fontSize: '12px' }}>
                {isClickMode ? "Click Mode" : "Drag Mode"}
              </span>
            </button>
          )}

          {/* Zoom Button */}
          {onToggleZoom && (
            <button
              onClick={onToggleZoom}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '4px',
                padding: '8px 12px',
                borderRadius: '6px',
                backgroundColor: isZoomed ? `${theme.secondary}20` : 'transparent',
                color: isZoomed ? theme.secondary : theme.primary,
                border: `1px solid ${isZoomed ? theme.secondary : theme.secondary + '20'}`,
                cursor: 'pointer',
                transition: 'all 0.2s',
                minWidth: '70px'
              }}
            >
              <ZoomIn size={18} />
              <span style={{ fontSize: '12px' }}>
                {isZoomed ? "Zoom Out" : "Zoom In"}
              </span>
            </button>
          )}

          {/* Reset Button */}
          {onReset && (
            <button
              onClick={onReset}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '4px',
                padding: '8px 12px',
                borderRadius: '6px',
                backgroundColor: 'transparent',
                color: theme.primary,
                border: `1px solid ${theme.secondary + '20'}`,
                cursor: 'pointer',
                transition: 'all 0.2s',
                minWidth: '70px'
              }}
            >
              <RotateCcw size={18} />
              <span style={{ fontSize: '12px' }}>New Game</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};