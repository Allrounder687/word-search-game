import React from 'react';
import { X } from 'lucide-react';
import type { WordCategory, Theme } from '../../types/game';
import { THEMES } from '../../types/game';

interface MobileDropdownProps {
  isOpen: boolean;
  onClose: () => void;
  settings: any;
  wordCategories: Array<{ value: WordCategory; label: string }>;
  themes: Array<{ value: Theme; label: string }>;
  onCategoryChange: (category: WordCategory) => void;
  onThemeChange: (theme: Theme) => void;
  theme: any;
  iconSize: number;
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
  iconSize
}) => {
  if (!isOpen) return null;

  return (
    <div style={{
      position: 'absolute',
      top: '120px',
      left: '16px',
      right: '16px',
      backgroundColor: 'rgba(0, 0, 0, 0.85)',
      backdropFilter: 'blur(12px)',
      WebkitBackdropFilter: 'blur(12px)',
      borderRadius: '8px',
      boxShadow: '0 10px 25px rgba(0, 0, 0, 0.5)',
      zIndex: 100,
      padding: '12px',
      border: `1px solid ${theme.secondary}40`,
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
          {wordCategories.map((category) => (
            <button
              key={category.value}
              onClick={() => onCategoryChange(category.value)}
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
    </div>
  );
};