import { useState, useEffect, useMemo, useCallback } from 'react';
import { 
  X, Palette, Grid, Zap, Plus, Save, 
  Clock, BookOpen, ChevronDown, ChevronUp 
} from 'lucide-react';
import type { GameSettings, TimerMode, WordCategory } from '../types/game';
import { THEMES } from '../types/game';
import { useResponsive } from '../hooks/useResponsive';



interface CollapsibleSection {
  id: string;
  title: string;
  icon: React.ReactNode;
  isOpen: boolean;
}

interface CollapsibleSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: GameSettings;
  onSettingsChange: (settings: GameSettings) => void;
  theme: any;
}

export const CollapsibleSettingsModal: React.FC<CollapsibleSettingsModalProps> = ({
  isOpen,
  onClose,
  settings,
  onSettingsChange,
  theme
}) => {
  const breakpoints = useResponsive();
  const { isMobile } = breakpoints;

  // Local settings state
  const [localSettings, setLocalSettings] = useState<GameSettings>({
    ...settings,
    timerMode: settings.timerMode || 'none',
    timerDuration: settings.timerDuration || 180
  });

  // Section collapse states
  const [sections, setSections] = useState<CollapsibleSection[]>([
    { id: 'game', title: 'Game Settings', icon: <Grid size={20} />, isOpen: true },
    { id: 'theme', title: 'Theme & Appearance', icon: <Palette size={20} />, isOpen: false },
    { id: 'timer', title: 'Timer Settings', icon: <Clock size={20} />, isOpen: false },
    { id: 'words', title: 'Custom Words', icon: <BookOpen size={20} />, isOpen: false },
    { id: 'advanced', title: 'Advanced Options', icon: <Zap size={20} />, isOpen: false }
  ]);

  // Other state variables
  const [customWord, setCustomWord] = useState('');
  const [customColors, setCustomColors] = useState({
    background: localSettings.customColors?.background || '#000000',
    primary: localSettings.customColors?.primary || '#ffffff',
    secondary: localSettings.customColors?.secondary || '#a855f7',
    accent: localSettings.customColors?.accent || '#ec4899'
  });
  const [selectedFont, setSelectedFont] = useState<string>("'Inter', sans-serif");
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  // Toggle section collapse
  const toggleSection = (sectionId: string) => {
    setSections(prev => prev.map(section => 
      section.id === sectionId 
        ? { ...section, isOpen: !section.isOpen }
        : section
    ));
  };

  // Update local settings when props change
  useEffect(() => {
    setLocalSettings({
      ...settings,
      timerMode: settings.timerMode || 'none',
      timerDuration: settings.timerDuration || 180
    });
    setSelectedFont(settings.customFont || "'Inter', sans-serif");
    if (settings.customColors) {
      setCustomColors({
        background: settings.customColors.background || '#000000',
        primary: settings.customColors.primary || '#ffffff',
        secondary: settings.customColors.secondary || '#a855f7',
        accent: settings.customColors.accent || '#ec4899'
      });
    }
    setHasUnsavedChanges(false);
  }, [settings]);

  // Check for unsaved changes
  useEffect(() => {
    const hasChanges = JSON.stringify(localSettings) !== JSON.stringify(settings);
    setHasUnsavedChanges(hasChanges);
  }, [localSettings, settings]);



  const handleSave = useCallback(() => {
    const updatedSettings = { ...localSettings };
    updatedSettings.customFont = selectedFont;

    if (updatedSettings.theme === 'custom') {
      updatedSettings.customColors = customColors;
      THEMES.custom = {
        background: customColors.background,
        gridBg: customColors.background,
        primary: customColors.primary,
        secondary: customColors.secondary,
        accent: customColors.accent,
        cellBg: customColors.background + '40',
        cellHover: customColors.secondary + '20',
        font: selectedFont
      };
    }

    onSettingsChange(updatedSettings);
    setHasUnsavedChanges(false);
  }, [localSettings, selectedFont, customColors, onSettingsChange]);

  const addCustomWord = useCallback(() => {
    if (customWord.trim() && customWord.trim().length >= 3) {
      const newCustomWords = [...(localSettings.customWords || []), customWord.trim().toUpperCase()];
      setLocalSettings(prev => ({ ...prev, customWords: newCustomWords }));
      setCustomWord('');
    }
  }, [customWord, localSettings.customWords]);

  const removeCustomWord = useCallback((index: number) => {
    const newCustomWords = [...(localSettings.customWords || [])];
    newCustomWords.splice(index, 1);
    setLocalSettings(prev => ({ ...prev, customWords: newCustomWords }));
  }, [localSettings.customWords]);

  // Memoized options
  const difficulties = useMemo(() => [
    { value: 'easy', label: 'Easy', description: '8x8 grid, simple words' },
    { value: 'medium', label: 'Medium', description: '12x12 grid, moderate difficulty' },
    { value: 'hard', label: 'Hard', description: '16x16 grid, challenging words' }
  ], []);

  const wordCategories = useMemo(() => [
    { value: 'fivePillars', label: 'Five Pillars of Islam' },
    { value: 'islamicProphets', label: 'Islamic Prophets' },
    { value: 'islamicMonths', label: 'Islamic Months' },
    { value: 'islamicPlaces', label: 'Islamic Places' },
    { value: 'muslimScientists', label: 'Muslim Scientists' },
    { value: 'quranicSurahs', label: 'Quranic Surahs' },
    { value: 'islamicValues', label: 'Islamic Values' },
    { value: 'islamicAngels', label: 'Islamic Angels' },
    { value: 'islamicBooks', label: 'Islamic Books' },
    { value: 'islamicEvents', label: 'Islamic Events' },
    { value: 'islamicVirtues', label: 'Islamic Virtues' }
  ], []);

  const themes = useMemo(() => [
    { value: 'midnight', label: 'Midnight', colors: ['#000000', '#7c3aed', '#ec4899'] },
    { value: 'ocean', label: 'Ocean', colors: ['#0f172a', '#0ea5e9', '#06b6d4'] },
    { value: 'forest', label: 'Forest', colors: ['#052e16', '#16a34a', '#22c55e'] },
    { value: 'sunset', label: 'Sunset', colors: ['#451a03', '#ea580c', '#f97316'] },
    { value: 'royal', label: 'Royal', colors: ['#1e1b4b', '#6366f1', '#8b5cf6'] },
    { value: 'custom', label: 'Custom', colors: [] }
  ], []);

  if (!isOpen) return null;

  // Render collapsible section
  const renderSection = (section: CollapsibleSection, content: React.ReactNode) => (
    <div key={section.id} style={{
      marginBottom: '16px',
      backgroundColor: theme.cellBg + '40',
      borderRadius: '12px',
      border: `1px solid ${theme.secondary}20`,
      overflow: 'hidden'
    }}>
      <button
        onClick={() => toggleSection(section.id)}
        style={{
          width: '100%',
          padding: '16px',
          backgroundColor: 'transparent',
          border: 'none',
          color: theme.primary,
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          transition: 'background-color 0.2s',
          fontSize: '16px',
          fontWeight: 'bold'
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.backgroundColor = theme.secondary + '10';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor = 'transparent';
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          {section.icon}
          {section.title}
        </div>
        {section.isOpen ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
      </button>
      
      {section.isOpen && (
        <div style={{
          padding: '0 16px 16px 16px',
          borderTop: `1px solid ${theme.secondary}20`
        }}>
          {content}
        </div>
      )}
    </div>
  );

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.8)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
      padding: isMobile ? '20px' : '40px'
    }}>
      <div style={{
        backgroundColor: theme.gridBg,
        borderRadius: '16px',
        width: '100%',
        maxWidth: '600px',
        maxHeight: '90vh',
        display: 'flex',
        flexDirection: 'column',
        border: `1px solid ${theme.secondary}40`,
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
        position: 'relative'
      }}>
        {/* Header */}
        <div style={{
          padding: '24px',
          borderBottom: `1px solid ${theme.secondary}20`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <h2 style={{
            margin: 0,
            color: theme.primary,
            fontSize: '24px',
            fontWeight: 'bold',
            display: 'flex',
            alignItems: 'center',
            gap: '12px'
          }}>
            <Zap style={{ color: theme.secondary }} />
            Game Settings
          </h2>
          <button
            onClick={onClose}
            style={{
              backgroundColor: 'transparent',
              border: 'none',
              color: theme.primary,
              cursor: 'pointer',
              padding: '8px',
              borderRadius: '8px',
              transition: 'background-color 0.2s'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = theme.cellHover;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent';
            }}
          >
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div style={{
          flex: 1,
          overflow: 'auto',
          padding: '24px'
        }}>
          {/* Game Settings Section */}
          {renderSection(
            sections.find(s => s.id === 'game')!,
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {/* Difficulty */}
              <div>
                <label style={{ color: theme.primary, fontWeight: 'bold', marginBottom: '8px', display: 'block' }}>
                  Difficulty Level
                </label>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {difficulties.map(diff => (
                    <label key={diff.value} style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px',
                      padding: '12px',
                      backgroundColor: localSettings.difficulty === diff.value ? theme.secondary + '20' : 'transparent',
                      borderRadius: '8px',
                      border: `1px solid ${localSettings.difficulty === diff.value ? theme.secondary : 'transparent'}`,
                      cursor: 'pointer',
                      transition: 'all 0.2s'
                    }}>
                      <input
                        type="radio"
                        name="difficulty"
                        value={diff.value}
                        checked={localSettings.difficulty === diff.value}
                        onChange={(e) => setLocalSettings(prev => ({ ...prev, difficulty: e.target.value as any }))}
                        style={{ accentColor: theme.secondary }}
                      />
                      <div>
                        <div style={{ color: theme.primary, fontWeight: 'bold' }}>{diff.label}</div>
                        <div style={{ color: theme.primary, opacity: 0.7, fontSize: '12px' }}>{diff.description}</div>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              {/* Word Category */}
              <div>
                <label style={{ color: theme.primary, fontWeight: 'bold', marginBottom: '8px', display: 'block' }}>
                  Word Category
                </label>
                <select
                  value={localSettings.wordCategory}
                  onChange={(e) => setLocalSettings(prev => ({ ...prev, wordCategory: e.target.value as WordCategory }))}
                  style={{
                    width: '100%',
                    padding: '12px',
                    backgroundColor: theme.cellBg,
                    color: theme.primary,
                    border: `1px solid ${theme.secondary}40`,
                    borderRadius: '8px',
                    fontSize: '14px'
                  }}
                >
                  {wordCategories.map(cat => (
                    <option key={cat.value} value={cat.value}>{cat.label}</option>
                  ))}
                </select>
              </div>

              {/* Grid Size */}
              <div>
                <label style={{ color: theme.primary, fontWeight: 'bold', marginBottom: '8px', display: 'block' }}>
                  Grid Size: {localSettings.gridSize}x{localSettings.gridSize}
                </label>
                <input
                  type="range"
                  min="8"
                  max="20"
                  value={localSettings.gridSize}
                  onChange={(e) => setLocalSettings(prev => ({ ...prev, gridSize: parseInt(e.target.value) }))}
                  style={{
                    width: '100%',
                    accentColor: theme.secondary
                  }}
                />
              </div>
            </div>
          )}

          {/* Theme Section */}
          {renderSection(
            sections.find(s => s.id === 'theme')!,
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))',
                gap: '12px'
              }}>
                {themes.map(themeOption => (
                  <button
                    key={themeOption.value}
                    onClick={() => setLocalSettings(prev => ({ ...prev, theme: themeOption.value as any }))}
                    style={{
                      padding: '12px',
                      backgroundColor: localSettings.theme === themeOption.value ? theme.secondary + '20' : theme.cellBg,
                      border: `2px solid ${localSettings.theme === themeOption.value ? theme.secondary : 'transparent'}`,
                      borderRadius: '8px',
                      color: theme.primary,
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                      textAlign: 'center'
                    }}
                  >
                    <div style={{ fontWeight: 'bold', marginBottom: '8px' }}>{themeOption.label}</div>
                    {themeOption.colors.length > 0 && (
                      <div style={{ display: 'flex', justifyContent: 'center', gap: '4px' }}>
                        {themeOption.colors.map((color, i) => (
                          <div
                            key={i}
                            style={{
                              width: '16px',
                              height: '16px',
                              backgroundColor: color,
                              borderRadius: '50%',
                              border: '1px solid rgba(255,255,255,0.2)'
                            }}
                          />
                        ))}
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Timer Section */}
          {renderSection(
            sections.find(s => s.id === 'timer')!,
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ color: theme.primary, fontWeight: 'bold', marginBottom: '8px', display: 'block' }}>
                  Timer Mode
                </label>
                <select
                  value={localSettings.timerMode || 'none'}
                  onChange={(e) => setLocalSettings(prev => ({ ...prev, timerMode: e.target.value as TimerMode }))}
                  style={{
                    width: '100%',
                    padding: '12px',
                    backgroundColor: theme.cellBg,
                    color: theme.primary,
                    border: `1px solid ${theme.secondary}40`,
                    borderRadius: '8px'
                  }}
                >
                  <option value="none">No Timer</option>
                  <option value="countdown">Countdown Timer</option>
                  <option value="stopwatch">Stopwatch</option>
                </select>
              </div>

              {localSettings.timerMode === 'countdown' && (
                <div>
                  <label style={{ color: theme.primary, fontWeight: 'bold', marginBottom: '8px', display: 'block' }}>
                    Duration: {Math.floor((localSettings.timerDuration || 180) / 60)}:{String((localSettings.timerDuration || 180) % 60).padStart(2, '0')}
                  </label>
                  <input
                    type="range"
                    min="60"
                    max="1800"
                    step="30"
                    value={localSettings.timerDuration || 180}
                    onChange={(e) => setLocalSettings(prev => ({ ...prev, timerDuration: parseInt(e.target.value) }))}
                    style={{
                      width: '100%',
                      accentColor: theme.secondary
                    }}
                  />
                </div>
              )}
            </div>
          )}

          {/* Custom Words Section */}
          {renderSection(
            sections.find(s => s.id === 'words')!,
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ display: 'flex', gap: '8px' }}>
                <input
                  type="text"
                  value={customWord}
                  onChange={(e) => setCustomWord(e.target.value.toUpperCase())}
                  placeholder="Add custom word (min 3 letters)"
                  style={{
                    flex: 1,
                    padding: '12px',
                    backgroundColor: theme.cellBg,
                    color: theme.primary,
                    border: `1px solid ${theme.secondary}40`,
                    borderRadius: '8px'
                  }}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      addCustomWord();
                    }
                  }}
                />
                <button
                  onClick={addCustomWord}
                  disabled={!customWord.trim() || customWord.trim().length < 3}
                  style={{
                    padding: '12px',
                    backgroundColor: theme.secondary,
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    opacity: customWord.trim().length >= 3 ? 1 : 0.5
                  }}
                >
                  <Plus size={20} />
                </button>
              </div>

              {localSettings.customWords && localSettings.customWords.length > 0 && (
                <div style={{
                  display: 'flex',
                  flexWrap: 'wrap',
                  gap: '8px',
                  padding: '12px',
                  backgroundColor: theme.cellBg + '40',
                  borderRadius: '8px'
                }}>
                  {localSettings.customWords.map((word, index) => (
                    <div
                      key={index}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        padding: '6px 12px',
                        backgroundColor: theme.secondary + '20',
                        borderRadius: '20px',
                        fontSize: '14px',
                        color: theme.primary
                      }}
                    >
                      {word}
                      <button
                        onClick={() => removeCustomWord(index)}
                        style={{
                          backgroundColor: 'transparent',
                          border: 'none',
                          color: theme.primary,
                          cursor: 'pointer',
                          padding: '2px'
                        }}
                      >
                        <X size={14} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Advanced Options Section */}
          {renderSection(
            sections.find(s => s.id === 'advanced')!,
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <label style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                cursor: 'pointer'
              }}>
                <input
                  type="checkbox"
                  checked={localSettings.showDescriptions}
                  onChange={(e) => setLocalSettings(prev => ({ ...prev, showDescriptions: e.target.checked }))}
                  style={{ accentColor: theme.secondary }}
                />
                <span style={{ color: theme.primary }}>Show word descriptions</span>
              </label>
            </div>
          )}
        </div>

        {/* Floating Save Button */}
        {hasUnsavedChanges && (
          <button
            onClick={handleSave}
            style={{
              position: 'fixed',
              bottom: '30px',
              right: '30px',
              backgroundColor: theme.secondary,
              color: 'white',
              border: 'none',
              borderRadius: '50%',
              width: '60px',
              height: '60px',
              cursor: 'pointer',
              boxShadow: '0 4px 20px rgba(0, 0, 0, 0.3)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 1001,
              transition: 'all 0.3s ease',
              animation: 'pulse 2s infinite'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'scale(1.1)';
              e.currentTarget.style.backgroundColor = theme.accent;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'scale(1)';
              e.currentTarget.style.backgroundColor = theme.secondary;
            }}
          >
            <Save size={24} />
          </button>
        )}
      </div>

      <style>{`
        @keyframes pulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.05); }
        }
      `}</style>
    </div>
  );
};