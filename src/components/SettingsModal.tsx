import { useState, useEffect, useMemo, useCallback } from 'react';
import { X, Palette, Grid, Zap, Plus, Trash2, Brush, Sparkles, Shuffle, Save, FolderOpen, Edit, Lightbulb, Clock, BookOpen, Type } from 'lucide-react';
import type { GameSettings, Theme, TimerMode } from '../types/game';
import { THEMES } from '../types/game';

// Interface for saved word lists
interface SavedWordList {
  id: string;
  name: string;
  settings: GameSettings;
  createdAt: number;
}

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: GameSettings;
  onSettingsChange: (settings: GameSettings) => void;
  theme: any;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  settings,
  onSettingsChange,
  theme
}) => {
  // Initialize local settings with default values for timer
  const [localSettings, setLocalSettings] = useState<GameSettings>({
    ...settings,
    timerMode: settings.timerMode || 'none',
    timerDuration: settings.timerDuration || 180
  });
  const [customWord, setCustomWord] = useState('');
  const [showCustomTheme, setShowCustomTheme] = useState(false);
  const [showSaveListModal, setShowSaveListModal] = useState(false);
  const [showLoadListModal, setShowLoadListModal] = useState(false);
  const [savedLists, setSavedLists] = useState<SavedWordList[]>([]);
  const [listNameInput, setListNameInput] = useState('');
  const [selectedListId, setSelectedListId] = useState<string | null>(null);
  const [customColors, setCustomColors] = useState({
    background: localSettings.customColors?.background || '#000000',
    primary: localSettings.customColors?.primary || '#ffffff',
    secondary: localSettings.customColors?.secondary || '#a855f7',
    accent: localSettings.customColors?.accent || '#ec4899'
  });
  const [selectedFont, setSelectedFont] = useState<string>("'Inter', sans-serif");

  // Update local settings when settings prop changes
  useEffect(() => {
    setLocalSettings({
      ...settings,
      timerMode: settings.timerMode || 'none',
      timerDuration: settings.timerDuration || 180
    });
    
    // Update selected font when settings change
    setSelectedFont(settings.customFont || "'Inter', sans-serif");
    
    // Update custom colors when settings change
    if (settings.customColors) {
      setCustomColors({
        background: settings.customColors.background || '#000000',
        primary: settings.customColors.primary || '#ffffff',
        secondary: settings.customColors.secondary || '#a855f7',
        accent: settings.customColors.accent || '#ec4899'
      });
    }
  }, [settings]);

  // Load saved lists from localStorage when modal opens
  useEffect(() => {
    if (isOpen) {
      const savedListsJson = localStorage.getItem('wordSearchSavedLists');
      if (savedListsJson) {
        try {
          const lists = JSON.parse(savedListsJson);
          setSavedLists(lists);
        } catch (e) {
          console.error('Failed to parse saved lists:', e);
        }
      }
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSave = useCallback(() => {
    // If custom theme is selected, save custom colors
    const updatedSettings = { ...localSettings };

    // Save custom font selection
    updatedSettings.customFont = selectedFont;

    if (updatedSettings.theme === 'custom') {
      updatedSettings.customColors = customColors;

      // Update the custom theme in THEMES object
      // We're using the imported THEMES object directly
      THEMES.custom = {
        background: customColors.background,
        primary: customColors.primary,
        secondary: customColors.secondary,
        accent: customColors.accent,
        gridBg: 'rgba(255, 255, 255, 0.1)',
        cellBg: 'rgba(255, 255, 255, 0.05)',
        cellHover: 'rgba(255, 255, 255, 0.2)',
        font: "'Inter', sans-serif"
      };
    }

    onSettingsChange(updatedSettings);
    onClose();
  }, [localSettings, selectedFont, customColors, onSettingsChange, onClose]);

  const addCustomWord = useCallback(() => {
    if (customWord.trim() && customWord.length >= 3) {
      const words = localSettings.customWords || [];
      if (!words.includes(customWord.toUpperCase())) {
        setLocalSettings({
          ...localSettings,
          customWords: [...words, customWord.toUpperCase()]
        });
      }
      setCustomWord('');
    }
  }, [customWord, localSettings]);

  const removeCustomWord = useCallback((index: number) => {
    const words = localSettings.customWords || [];
    setLocalSettings({
      ...localSettings,
      customWords: words.filter((_, i) => i !== index)
    });
  }, [localSettings]);

  const generateRandomWords = () => {
    // Generate 5-10 random words for custom mode
    const randomWords = [
      'PUZZLE', 'SEARCH', 'HIDDEN', 'FIND', 'GAME',
      'WORD', 'PLAY', 'FUN', 'SEEK', 'DISCOVER',
      'CHALLENGE', 'BRAIN', 'MIND', 'THINK', 'SOLVE'
    ];

    // Shuffle and take a random number between 5-10
    const shuffled = [...randomWords].sort(() => 0.5 - Math.random());
    const count = 5 + Math.floor(Math.random() * 6); // 5-10
    const selected = shuffled.slice(0, count);

    setLocalSettings({
      ...localSettings,
      customWords: selected
    });
  };

  // Save current custom list
  const saveCustomList = () => {
    if (!listNameInput.trim()) return;

    const newList: SavedWordList = {
      id: selectedListId || Date.now().toString(),
      name: listNameInput,
      settings: {
        ...localSettings,
        // Ensure we're saving the custom theme colors if applicable
        customColors: localSettings.theme === 'custom' ? customColors : localSettings.customColors
      },
      createdAt: Date.now()
    };

    // Update or add the list
    const updatedLists = selectedListId
      ? savedLists.map(list => list.id === selectedListId ? newList : list)
      : [...savedLists, newList];

    // Save to localStorage
    localStorage.setItem('wordSearchSavedLists', JSON.stringify(updatedLists));
    setSavedLists(updatedLists);
    setShowSaveListModal(false);
    setListNameInput('');
    setSelectedListId(null);
  };

  // Load a saved list
  const loadCustomList = (list: SavedWordList) => {
    setLocalSettings(list.settings);

    // If the list has custom theme, update the custom colors
    if (list.settings.theme === 'custom' && list.settings.customColors) {
      setCustomColors(list.settings.customColors);
    }

    setShowLoadListModal(false);
  };

  // Delete a saved list
  const deleteCustomList = (id: string) => {
    const updatedLists = savedLists.filter(list => list.id !== id);
    localStorage.setItem('wordSearchSavedLists', JSON.stringify(updatedLists));
    setSavedLists(updatedLists);
  };

  // Memoize static configuration arrays to prevent recreation on every render
  const difficulties = useMemo(() => [
    { value: 'easy' as const, label: 'Easy', description: '10x10 grid, simple words' },
    { value: 'medium' as const, label: 'Medium', description: '12x12 grid, moderate words' },
    { value: 'hard' as const, label: 'Hard', description: '15x15 grid, complex words' },
    { value: 'custom' as const, label: 'Custom', description: 'Your own words and settings' }
  ], []);

  const wordCategories = useMemo(() => [
    { value: 'general', label: 'General', description: 'Standard word lists' },
    { value: 'animals', label: 'Animals', description: 'Various animal names' },
    { value: 'islamicPlaces', label: 'Islamic Places', description: 'Important locations in Islam' },
    { value: 'islamicProphets', label: 'Islamic Prophets', description: 'Prophets mentioned in Islamic tradition' },
    { value: 'fivePillars', label: 'Five Pillars', description: 'The five pillars of Islam and related terms' },
    { value: 'islamicTerms', label: 'Islamic Terms', description: 'Common Islamic terminology' },
    { value: 'custom', label: 'Custom Words', description: 'Your own custom word list' }
  ], []);

  const themes: { value: Theme; label: string; colors: string[] }[] = [
    { value: 'midnight', label: 'Midnight', colors: ['#000000', '#1e1b4b', '#a855f7', '#ec4899'] },
    { value: 'royal', label: 'Royal Blue', colors: ['#000000', '#1e3a8a', '#3b82f6', '#ec4899'] },
    { value: 'darkRoyal', label: 'Dark Royal', colors: ['#000000', '#0f1e4b', '#4f6bff', '#00d4ff'] },
    { value: 'pink', label: 'Pink', colors: ['#000000', '#831843', '#f472b6', '#3b82f6'] },
    { value: 'darkPink', label: 'Dark Pink', colors: ['#000000', '#4a0d25', '#ff6b9d', '#ff3d7f'] },
    { value: 'pure', label: 'White', colors: ['#ffffff', '#f8fafc', '#1e3a8a', '#be185d'] },
    { value: 'ocean', label: 'Ocean', colors: ['#0c4a6e', '#0369a1', '#06b6d4', '#0891b2'] },
    { value: 'sunset', label: 'Sunset', colors: ['#7c2d12', '#ea580c', '#f97316', '#eab308'] },
    { value: 'neon', label: 'Neon', colors: ['#1a1a2e', '#16213e', '#00ff88', '#ff0080'] },
    { value: 'forest', label: 'Forest', colors: ['#1b4332', '#2d6a4f', '#74c69d', '#f9c74f'] },
    { value: 'galaxy', label: 'Galaxy', colors: ['#0f0e17', '#232946', '#7f5af0', '#2cb67d'] },
    { value: 'desert', label: 'Desert', colors: ['#7f5539', '#a68a64', '#bc6c25', '#606c38'] },
    { value: 'cyber', label: 'Cyber', colors: ['#240046', '#3c096c', '#7b2cbf', '#e0aaff'] },
    {
      value: 'custom', label: 'Custom Theme', colors: [
        customColors.background,
        customColors.primary,
        customColors.secondary,
        customColors.accent
      ]
    }
  ];

  // Font options - all fonts are now imported in index.css
  const fonts = [
    { value: "'Inter', sans-serif", label: "Inter (Default)" },
    { value: "'Roboto', sans-serif", label: "Roboto" },
    { value: "'Open Sans', sans-serif", label: "Open Sans" },
    { value: "'Montserrat', sans-serif", label: "Montserrat" },
    { value: "'Poppins', sans-serif", label: "Poppins" },
    { value: "'Quicksand', sans-serif", label: "Quicksand" },
    { value: "'Nunito', sans-serif", label: "Nunito" },
    { value: "'Space Grotesk', sans-serif", label: "Space Grotesk" },
    { value: "'Orbitron', sans-serif", label: "Orbitron" },
    { value: "'Rajdhani', sans-serif", label: "Rajdhani" },
    { value: "'JetBrains Mono', monospace", label: "JetBrains Mono" }
  ];

  // Special handling for white theme
  const isWhiteTheme = theme.primary === '#000000';

  // Adjusted colors for white theme
  const modalBgColor = isWhiteTheme
    ? 'rgba(30, 58, 138, 0.95)' // Dark blue background for white theme
    : 'rgba(0, 0, 0, 0.7)';

  const modalBorderColor = isWhiteTheme ? theme.secondary : `${theme.secondary}80`;
  const modalShadow = isWhiteTheme
    ? '0 25px 50px -12px rgba(0, 0, 0, 0.7), 0 0 0 1px rgba(30, 58, 138, 0.5)'
    : '0 25px 50px -12px rgba(0, 0, 0, 0.5)';

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      backgroundColor: isWhiteTheme ? 'rgba(0, 0, 0, 0.7)' : 'rgba(0, 0, 0, 0.5)',
      backdropFilter: 'blur(8px)',
      WebkitBackdropFilter: 'blur(8px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 50,
      padding: '16px'
    }}>
      <div
        style={{
          backgroundColor: modalBgColor,
          backgroundImage: isWhiteTheme
            ? 'linear-gradient(135deg, rgba(30, 58, 138, 0.95) 0%, rgba(59, 130, 246, 0.85) 100%)'
            : `linear-gradient(rgba(0, 0, 0, 0.7), rgba(0, 0, 0, 0.7)), ${typeof theme.gridBg === 'string' && theme.gridBg.startsWith('linear-gradient') ? theme.gridBg : `linear-gradient(${theme.gridBg}, ${theme.gridBg})`}`,
          borderRadius: '12px',
          boxShadow: modalShadow,
          maxWidth: '42rem',
          width: '100%',
          maxHeight: '90vh',
          overflowY: 'auto',
          border: `1px solid ${modalBorderColor}`
        }}
      >
        {/* Header */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '24px',
          borderBottom: `1px solid ${isWhiteTheme ? 'rgba(255, 255, 255, 0.2)' : theme.secondary + '40'}`
        }}>
          <h2 style={{
            fontSize: '24px',
            fontWeight: 'bold',
            color: isWhiteTheme ? '#ffffff' : theme.primary,
            margin: 0
          }}>
            Game Settings
          </h2>
          <button
            onClick={onClose}
            style={{
              padding: '8px',
              borderRadius: '8px',
              color: isWhiteTheme ? '#ffffff' : theme.primary,
              backgroundColor: 'transparent',
              border: 'none',
              cursor: 'pointer',
              transition: 'background-color 0.2s'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = isWhiteTheme ? 'rgba(255, 255, 255, 0.2)' : theme.cellHover;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent';
            }}
          >
            <X size={24} />
          </button>
        </div>

        <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '32px' }}>
          {/* Difficulty */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
              <Zap size={20} style={{ color: isWhiteTheme ? '#ffffff' : theme.secondary }} />
              <h3 style={{
                fontSize: '18px',
                fontWeight: '600',
                color: isWhiteTheme ? '#ffffff' : theme.primary,
                margin: 0
              }}>
                Difficulty
              </h3>
            </div>
            <div style={{
              display: 'grid',
              gridTemplateColumns: window.innerWidth >= 768 ? '1fr 1fr' : '1fr',
              gap: '12px'
            }}>
              {difficulties.map((diff) => (
                <button
                  key={diff.value}
                  onClick={() => setLocalSettings({ ...localSettings, difficulty: diff.value })}
                  style={{
                    padding: '16px',
                    borderRadius: '8px',
                    border: `2px solid ${localSettings.difficulty === diff.value
                      ? (isWhiteTheme ? '#ffffff' : theme.secondary)
                      : 'transparent'}`,
                    backgroundColor: localSettings.difficulty === diff.value
                      ? (isWhiteTheme ? 'rgba(255, 255, 255, 0.2)' : theme.secondary + '20')
                      : (isWhiteTheme ? 'rgba(255, 255, 255, 0.1)' : theme.cellBg),
                    color: isWhiteTheme ? '#ffffff' : theme.primary,
                    textAlign: 'left',
                    transition: 'all 0.2s',
                    transform: localSettings.difficulty === diff.value ? 'scale(1.05)' : 'scale(1)',
                    cursor: 'pointer'
                  }}
                  onMouseEnter={(e) => {
                    if (localSettings.difficulty !== diff.value) {
                      e.currentTarget.style.transform = 'scale(1.02)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (localSettings.difficulty !== diff.value) {
                      e.currentTarget.style.transform = 'scale(1)';
                    }
                  }}
                >
                  <div style={{ fontWeight: '600' }}>{diff.label}</div>
                  <div style={{ fontSize: '14px', opacity: 0.75 }}>{diff.description}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Word Category */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
              <Sparkles size={20} style={{ color: isWhiteTheme ? '#ffffff' : theme.secondary }} />
              <h3 style={{
                fontSize: '18px',
                fontWeight: '600',
                color: isWhiteTheme ? '#ffffff' : theme.primary,
                margin: 0
              }}>
                Word Category
              </h3>
            </div>
            <div style={{
              display: 'grid',
              gridTemplateColumns: window.innerWidth >= 768 ? '1fr 1fr' : '1fr',
              gap: '12px'
            }}>
              {wordCategories.map((category) => (
                <button
                  key={category.value}
                  onClick={() => setLocalSettings({
                    ...localSettings,
                    wordCategory: category.value as any,
                    // If selecting custom category, ensure difficulty is also set to custom
                    ...(category.value === 'custom' ? { difficulty: 'custom' } : {})
                  })}
                  style={{
                    padding: '16px',
                    borderRadius: '8px',
                    border: `2px solid ${localSettings.wordCategory === category.value
                      ? (isWhiteTheme ? '#ffffff' : theme.secondary)
                      : 'transparent'}`,
                    backgroundColor: localSettings.wordCategory === category.value
                      ? (isWhiteTheme ? 'rgba(255, 255, 255, 0.2)' : theme.secondary + '20')
                      : (isWhiteTheme ? 'rgba(255, 255, 255, 0.1)' : theme.cellBg),
                    color: isWhiteTheme ? '#ffffff' : theme.primary,
                    textAlign: 'left',
                    transition: 'all 0.2s',
                    transform: localSettings.wordCategory === category.value ? 'scale(1.05)' : 'scale(1)',
                    cursor: 'pointer'
                  }}
                  onMouseEnter={(e) => {
                    if (localSettings.wordCategory !== category.value) {
                      e.currentTarget.style.transform = 'scale(1.02)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (localSettings.wordCategory !== category.value) {
                      e.currentTarget.style.transform = 'scale(1)';
                    }
                  }}
                >
                  <div style={{ fontWeight: '600' }}>{category.label}</div>
                  <div style={{ fontSize: '14px', opacity: 0.75 }}>{category.description}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Grid Size (for custom difficulty) */}
          {localSettings.difficulty === 'custom' && (
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
                <Grid size={20} style={{ color: isWhiteTheme ? '#ffffff' : theme.secondary }} />
                <h3 style={{
                  fontSize: '18px',
                  fontWeight: '600',
                  color: isWhiteTheme ? '#ffffff' : theme.primary,
                  margin: 0
                }}>
                  Grid Size
                </h3>
              </div>
              <input
                type="range"
                min="8"
                max="20"
                value={localSettings.gridSize}
                onChange={(e) => setLocalSettings({
                  ...localSettings,
                  gridSize: parseInt(e.target.value)
                })}
                style={{
                  width: '100%',
                  accentColor: isWhiteTheme ? '#ffffff' : theme.secondary
                }}
              />
              <div style={{
                textAlign: 'center',
                marginTop: '8px',
                color: isWhiteTheme ? '#ffffff' : theme.primary
              }}>
                {localSettings.gridSize} x {localSettings.gridSize}
              </div>
            </div>
          )}

          {/* Hint Count Setting */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
              <Lightbulb size={20} style={{ color: isWhiteTheme ? '#ffffff' : theme.secondary }} />
              <h3 style={{
                fontSize: '18px',
                fontWeight: '600',
                color: isWhiteTheme ? '#ffffff' : theme.primary,
                margin: 0
              }}>
                Hint Count
              </h3>
            </div>
            <div style={{ marginBottom: '8px' }}>
              <input
                type="range"
                min="0"
                max="10"
                value={localSettings.hintsCount !== undefined ? localSettings.hintsCount :
                  localSettings.difficulty === 'easy' ? 3 :
                    localSettings.difficulty === 'medium' ? 2 :
                      localSettings.difficulty === 'hard' ? 1 : 2}
                onChange={(e) => setLocalSettings({
                  ...localSettings,
                  hintsCount: parseInt(e.target.value)
                })}
                style={{
                  width: '100%',
                  accentColor: isWhiteTheme ? '#ffffff' : theme.secondary
                }}
              />
              <div style={{
                textAlign: 'center',
                marginTop: '8px',
                color: isWhiteTheme ? '#ffffff' : theme.primary
              }}>
                {localSettings.hintsCount !== undefined ? localSettings.hintsCount :
                  localSettings.difficulty === 'easy' ? 3 :
                    localSettings.difficulty === 'medium' ? 2 :
                      localSettings.difficulty === 'hard' ? 1 : 2} Hints
              </div>
            </div>
            <div style={{
              padding: '8px',
              borderRadius: '8px',
              backgroundColor: theme.cellBg + '80',
              color: theme.primary + '80',
              fontSize: '12px'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <Sparkles size={12} />
                <span>Tip: Set to 0 for an extra challenge or up to 10 for easier gameplay</span>
              </div>
            </div>
          </div>

          {/* Word Descriptions Toggle */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
              <BookOpen size={20} style={{ color: isWhiteTheme ? '#ffffff' : theme.secondary }} />
              <h3 style={{
                fontSize: '18px',
                fontWeight: '600',
                color: isWhiteTheme ? '#ffffff' : theme.primary,
                margin: 0
              }}>
                Word Descriptions
              </h3>
            </div>

            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '16px',
              borderRadius: '8px',
              backgroundColor: isWhiteTheme ? 'rgba(255, 255, 255, 0.1)' : theme.cellBg,
              marginBottom: '8px'
            }}>
              <div>
                <div style={{
                  fontWeight: '600',
                  color: isWhiteTheme ? '#ffffff' : theme.primary
                }}>
                  Show Word Descriptions
                </div>
                <div style={{
                  fontSize: '14px',
                  opacity: 0.75,
                  color: isWhiteTheme ? '#ffffff' : theme.primary
                }}>
                  Display fascinating facts about words when found
                </div>
              </div>

              <button
                onClick={() => setLocalSettings({
                  ...localSettings,
                  showDescriptions: !localSettings.showDescriptions
                })}
                style={{
                  width: '48px',
                  height: '24px',
                  borderRadius: '12px',
                  backgroundColor: localSettings.showDescriptions ? theme.secondary : 'rgba(255, 255, 255, 0.2)',
                  position: 'relative',
                  transition: 'all 0.2s',
                  border: 'none',
                  cursor: 'pointer'
                }}
              >
                <div style={{
                  width: '20px',
                  height: '20px',
                  borderRadius: '50%',
                  backgroundColor: '#ffffff',
                  position: 'absolute',
                  top: '2px',
                  left: localSettings.showDescriptions ? '26px' : '2px',
                  transition: 'all 0.2s'
                }} />
              </button>
            </div>

            <div style={{
              padding: '8px',
              borderRadius: '8px',
              backgroundColor: theme.cellBg + '80',
              color: theme.primary + '80',
              fontSize: '12px'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <Sparkles size={12} />
                <span>Learn about Islamic places and pillars as you find words</span>
              </div>
            </div>
          </div>

          {/* Kids Mode Toggle */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
              <Sparkles size={20} style={{ color: isWhiteTheme ? '#ffffff' : theme.secondary }} />
              <h3 style={{
                fontSize: '18px',
                fontWeight: '600',
                color: isWhiteTheme ? '#ffffff' : theme.primary,
                margin: 0
              }}>
                Kids Mode
              </h3>
            </div>

            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '16px',
              borderRadius: '8px',
              backgroundColor: isWhiteTheme ? 'rgba(255, 255, 255, 0.1)' : theme.cellBg,
              marginBottom: '8px'
            }}>
              <div>
                <div style={{
                  fontWeight: '600',
                  color: isWhiteTheme ? '#ffffff' : theme.primary
                }}>
                  Enable Kids Mode
                </div>
                <div style={{
                  fontSize: '14px',
                  opacity: 0.75,
                  color: isWhiteTheme ? '#ffffff' : theme.primary
                }}>
                  Simplified content with audio and visuals for children
                </div>
              </div>

              <button
                onClick={() => setLocalSettings({
                  ...localSettings,
                  kidsMode: !localSettings.kidsMode
                })}
                style={{
                  width: '48px',
                  height: '24px',
                  borderRadius: '12px',
                  backgroundColor: localSettings.kidsMode ? theme.secondary : 'rgba(255, 255, 255, 0.2)',
                  position: 'relative',
                  transition: 'all 0.2s',
                  border: 'none',
                  cursor: 'pointer'
                }}
              >
                <div style={{
                  width: '20px',
                  height: '20px',
                  borderRadius: '50%',
                  backgroundColor: '#ffffff',
                  position: 'absolute',
                  top: '2px',
                  left: localSettings.kidsMode ? '26px' : '2px',
                  transition: 'all 0.2s'
                }} />
              </button>
            </div>

            <div style={{
              padding: '8px',
              borderRadius: '8px',
              backgroundColor: theme.cellBg + '80',
              color: theme.primary + '80',
              fontSize: '12px'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <Sparkles size={12} />
                <span>Age-appropriate content with audio pronunciation and visual illustrations</span>
              </div>
            </div>
          </div>

          {/* Custom Words */}
          {localSettings.difficulty === 'custom' && (
            <div>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: '16px'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Plus size={20} style={{ color: isWhiteTheme ? '#ffffff' : theme.secondary }} />
                  <h3 style={{
                    fontSize: '18px',
                    fontWeight: '600',
                    color: isWhiteTheme ? '#ffffff' : theme.primary,
                    margin: 0
                  }}>
                    Custom Words
                  </h3>
                </div>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button
                    onClick={() => setShowLoadListModal(true)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      padding: '8px 12px',
                      borderRadius: '8px',
                      backgroundColor: isWhiteTheme ? 'rgba(255, 255, 255, 0.1)' : theme.cellBg,
                      color: isWhiteTheme ? '#ffffff' : theme.secondary,
                      border: `1px solid ${isWhiteTheme ? 'rgba(255, 255, 255, 0.3)' : theme.secondary + '40'}`,
                      cursor: 'pointer',
                      transition: 'all 0.2s'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = 'scale(1.05)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = 'scale(1)';
                    }}
                    title="Load saved list"
                  >
                    <FolderOpen size={16} />
                    <span style={{ fontSize: '14px' }}>Load</span>
                  </button>
                  <button
                    onClick={() => {
                      setListNameInput('');
                      setSelectedListId(null);
                      setShowSaveListModal(true);
                    }}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      padding: '8px 12px',
                      borderRadius: '8px',
                      backgroundColor: isWhiteTheme ? 'rgba(255, 255, 255, 0.1)' : theme.cellBg,
                      color: isWhiteTheme ? '#ffffff' : theme.secondary,
                      border: `1px solid ${isWhiteTheme ? 'rgba(255, 255, 255, 0.3)' : theme.secondary + '40'}`,
                      cursor: 'pointer',
                      transition: 'all 0.2s'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = 'scale(1.05)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = 'scale(1)';
                    }}
                    title="Save current list"
                  >
                    <Save size={16} />
                    <span style={{ fontSize: '14px' }}>Save</span>
                  </button>
                  <button
                    onClick={generateRandomWords}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      padding: '8px 12px',
                      borderRadius: '8px',
                      backgroundColor: isWhiteTheme ? 'rgba(255, 255, 255, 0.1)' : theme.cellBg,
                      color: isWhiteTheme ? '#ffffff' : theme.secondary,
                      border: `1px solid ${isWhiteTheme ? 'rgba(255, 255, 255, 0.3)' : theme.secondary + '40'}`,
                      cursor: 'pointer',
                      transition: 'all 0.2s'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = 'scale(1.05)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = 'scale(1)';
                    }}
                    title="Generate random words"
                  >
                    <Shuffle size={16} />
                    <span style={{ fontSize: '14px' }}>Random</span>
                  </button>
                </div>
              </div>

              <div style={{
                display: 'flex',
                gap: '8px',
                marginBottom: '16px'
              }}>
                <input
                  type="text"
                  value={customWord}
                  onChange={(e) => setCustomWord(e.target.value.toUpperCase())}
                  onKeyDown={(e) => e.key === 'Enter' && addCustomWord()}
                  placeholder="Enter a word (min 3 letters)"
                  style={{
                    flex: 1,
                    padding: '12px',
                    borderRadius: '8px',
                    border: `2px solid ${theme.secondary}40`,
                    backgroundColor: theme.cellBg,
                    color: theme.primary,
                    outline: 'none'
                  }}
                />
                <button
                  onClick={addCustomWord}
                  style={{
                    padding: '12px',
                    borderRadius: '8px',
                    backgroundColor: theme.secondary,
                    color: 'white',
                    border: 'none',
                    cursor: 'pointer',
                    transition: 'all 0.2s'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'scale(1.05)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'scale(1)';
                  }}
                >
                  <Plus size={20} />
                </button>
              </div>

              <div style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '8px',
                maxHeight: '128px',
                overflowY: 'auto',
                marginBottom: '8px'
              }}>
                {(localSettings.customWords || []).length === 0 ? (
                  <div style={{
                    padding: '12px',
                    borderRadius: '8px',
                    textAlign: 'center',
                    backgroundColor: theme.cellBg,
                    color: theme.primary + '80'
                  }}>
                    No custom words added yet
                  </div>
                ) : (
                  (localSettings.customWords || []).map((word, index) => (
                    <div
                      key={index}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '8px',
                        borderRadius: '8px',
                        backgroundColor: theme.cellBg
                      }}
                    >
                      <span style={{ color: theme.primary }}>{word}</span>
                      <button
                        onClick={() => removeCustomWord(index)}
                        style={{
                          padding: '4px',
                          borderRadius: '4px',
                          color: '#ef4444',
                          backgroundColor: 'transparent',
                          border: 'none',
                          cursor: 'pointer',
                          transition: 'background-color 0.2s'
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.backgroundColor = 'rgba(239, 68, 68, 0.2)';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.backgroundColor = 'transparent';
                        }}
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  ))
                )}
              </div>

              <div style={{
                padding: '8px',
                borderRadius: '8px',
                backgroundColor: theme.cellBg + '80',
                color: theme.primary + '80',
                fontSize: '12px'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <Sparkles size={12} />
                  <span>Tip: Add at least 5-10 words for the best experience</span>
                </div>
              </div>
            </div>
          )}

          {/* Timer Mode Setting */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
              <Clock size={20} style={{ color: isWhiteTheme ? '#ffffff' : theme.secondary }} />
              <h3 style={{
                fontSize: '18px',
                fontWeight: '600',
                color: isWhiteTheme ? '#ffffff' : theme.primary,
                margin: 0
              }}>
                Timer Mode
              </h3>
            </div>
            <div style={{
              display: 'grid',
              gridTemplateColumns: window.innerWidth >= 768 ? '1fr 1fr 1fr' : '1fr',
              gap: '12px',
              marginBottom: '16px'
            }}>
              {[
                { value: 'none', label: 'No Timer', description: 'Play without time pressure' },
                { value: 'countup', label: 'Count Up', description: 'Track your completion time' },
                { value: 'countdown', label: 'Countdown', description: 'Race against the clock' }
              ].map((mode) => (
                <button
                  key={mode.value}
                  onClick={() => setLocalSettings({
                    ...localSettings,
                    timerMode: mode.value as TimerMode
                  })}
                  style={{
                    padding: '16px',
                    borderRadius: '8px',
                    border: `2px solid ${localSettings.timerMode === mode.value
                      ? (isWhiteTheme ? '#ffffff' : theme.secondary)
                      : 'transparent'}`,
                    backgroundColor: localSettings.timerMode === mode.value
                      ? (isWhiteTheme ? 'rgba(255, 255, 255, 0.2)' : theme.secondary + '20')
                      : (isWhiteTheme ? 'rgba(255, 255, 255, 0.1)' : theme.cellBg),
                    color: isWhiteTheme ? '#ffffff' : theme.primary,
                    textAlign: 'left',
                    transition: 'all 0.2s',
                    transform: localSettings.timerMode === mode.value ? 'scale(1.05)' : 'scale(1)',
                    cursor: 'pointer'
                  }}
                  onMouseEnter={(e) => {
                    if (localSettings.timerMode !== mode.value) {
                      e.currentTarget.style.transform = 'scale(1.02)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (localSettings.timerMode !== mode.value) {
                      e.currentTarget.style.transform = 'scale(1)';
                    }
                  }}
                >
                  <div style={{ fontWeight: '600' }}>{mode.label}</div>
                  <div style={{ fontSize: '14px', opacity: 0.75 }}>{mode.description}</div>
                </button>
              ))}
            </div>

            {/* Countdown Timer Duration */}
            {localSettings.timerMode === 'countdown' && (
              <div>
                <div style={{ marginBottom: '8px' }}>
                  <div style={{
                    fontSize: '14px',
                    marginBottom: '8px',
                    color: isWhiteTheme ? '#ffffff' : theme.primary
                  }}>
                    Countdown Duration (seconds)
                  </div>
                  <input
                    type="range"
                    min="30"
                    max="600"
                    step="30"
                    value={localSettings.timerDuration || 180}
                    onChange={(e) => setLocalSettings({
                      ...localSettings,
                      timerDuration: parseInt(e.target.value)
                    })}
                    style={{
                      width: '100%',
                      accentColor: isWhiteTheme ? '#ffffff' : theme.secondary
                    }}
                  />
                  <div style={{
                    textAlign: 'center',
                    marginTop: '8px',
                    color: isWhiteTheme ? '#ffffff' : theme.primary
                  }}>
                    {Math.floor((localSettings.timerDuration || 180) / 60)}:{((localSettings.timerDuration || 180) % 60).toString().padStart(2, '0')}
                  </div>
                </div>
                <div style={{
                  padding: '8px',
                  borderRadius: '8px',
                  backgroundColor: theme.cellBg + '80',
                  color: theme.primary + '80',
                  fontSize: '12px'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <Sparkles size={12} />
                    <span>Tip: Adjust the time based on difficulty. 3-5 minutes is recommended for most puzzles.</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Theme */}
          <div>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '16px'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Palette size={20} style={{ color: isWhiteTheme ? '#ffffff' : theme.secondary }} />
                <h3 style={{
                  fontSize: '18px',
                  fontWeight: '600',
                  color: isWhiteTheme ? '#ffffff' : theme.primary,
                  margin: 0
                }}>
                  Theme
                </h3>
              </div>
              {localSettings.theme === 'custom' && (
                <button
                  onClick={() => setShowCustomTheme(!showCustomTheme)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '8px 12px',
                    borderRadius: '8px',
                    backgroundColor: isWhiteTheme ? 'rgba(255, 255, 255, 0.1)' : theme.cellBg,
                    color: isWhiteTheme ? '#ffffff' : theme.secondary,
                    border: `1px solid ${isWhiteTheme ? 'rgba(255, 255, 255, 0.3)' : theme.secondary + '40'}`,
                    cursor: 'pointer',
                    transition: 'all 0.2s'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'scale(1.05)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'scale(1)';
                  }}
                >
                  <Brush size={16} />
                  <span style={{ fontSize: '14px' }}>{showCustomTheme ? 'Hide Editor' : 'Edit Colors'}</span>
                </button>
              )}
            </div>

            <div style={{
              display: 'grid',
              gridTemplateColumns: window.innerWidth >= 768 ? '1fr 1fr' : '1fr',
              gap: '12px'
            }}>
              {themes.map((themeOption) => (
                <button
                  key={themeOption.value}
                  onClick={() => setLocalSettings({ ...localSettings, theme: themeOption.value })}
                  style={{
                    padding: '16px',
                    borderRadius: '8px',
                    border: `2px solid ${localSettings.theme === themeOption.value
                      ? (isWhiteTheme ? '#ffffff' : theme.secondary)
                      : 'transparent'}`,
                    backgroundColor: localSettings.theme === themeOption.value
                      ? (isWhiteTheme ? 'rgba(255, 255, 255, 0.2)' : theme.secondary + '20')
                      : (isWhiteTheme ? 'rgba(255, 255, 255, 0.1)' : theme.cellBg),
                    color: isWhiteTheme ? '#ffffff' : theme.primary,
                    transition: 'all 0.2s',
                    transform: localSettings.theme === themeOption.value ? 'scale(1.05)' : 'scale(1)',
                    cursor: 'pointer'
                  }}
                  onMouseEnter={(e) => {
                    if (localSettings.theme !== themeOption.value) {
                      e.currentTarget.style.transform = 'scale(1.02)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (localSettings.theme !== themeOption.value) {
                      e.currentTarget.style.transform = 'scale(1)';
                    }
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{ display: 'flex', gap: '4px' }}>
                      {themeOption.colors.map((color, i) => (
                        <div
                          key={i}
                          style={{
                            width: '16px',
                            height: '16px',
                            borderRadius: '50%',
                            backgroundColor: color
                          }}
                        />
                      ))}
                    </div>
                    <span style={{ fontWeight: '600' }}>{themeOption.label}</span>
                  </div>
                </button>
              ))}
            </div>

            {/* Custom Theme Editor */}
            {localSettings.theme === 'custom' && showCustomTheme && (
              <div style={{
                marginTop: '16px',
                padding: '16px',
                borderRadius: '8px',
                backgroundColor: theme.cellBg
              }}>
                <div style={{ marginBottom: '12px' }}>
                  <div style={{ fontSize: '14px', marginBottom: '4px', color: isWhiteTheme ? '#ffffff' : theme.primary }}>Background Color</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <input
                      type="color"
                      value={customColors.background}
                      onChange={(e) => setCustomColors({ ...customColors, background: e.target.value })}
                      style={{
                        width: '40px',
                        height: '40px',
                        borderRadius: '4px',
                        cursor: 'pointer'
                      }}
                    />
                    <input
                      type="text"
                      value={customColors.background}
                      onChange={(e) => setCustomColors({ ...customColors, background: e.target.value })}
                      style={{
                        flex: 1,
                        padding: '8px',
                        borderRadius: '4px',
                        backgroundColor: isWhiteTheme ? 'rgba(255, 255, 255, 0.1)' : 'transparent',
                        border: `1px solid ${isWhiteTheme ? 'rgba(255, 255, 255, 0.3)' : theme.secondary + '40'}`,
                        color: isWhiteTheme ? '#ffffff' : theme.primary
                      }}
                    />
                  </div>
                </div>

                <div style={{ marginBottom: '12px' }}>
                  <div style={{ fontSize: '14px', marginBottom: '4px', color: isWhiteTheme ? '#ffffff' : theme.primary }}>Text Color</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <input
                      type="color"
                      value={customColors.primary}
                      onChange={(e) => setCustomColors({ ...customColors, primary: e.target.value })}
                      style={{
                        width: '40px',
                        height: '40px',
                        borderRadius: '4px',
                        cursor: 'pointer'
                      }}
                    />
                    <input
                      type="text"
                      value={customColors.primary}
                      onChange={(e) => setCustomColors({ ...customColors, primary: e.target.value })}
                      style={{
                        flex: 1,
                        padding: '8px',
                        borderRadius: '4px',
                        backgroundColor: isWhiteTheme ? 'rgba(255, 255, 255, 0.1)' : 'transparent',
                        border: `1px solid ${isWhiteTheme ? 'rgba(255, 255, 255, 0.3)' : theme.secondary + '40'}`,
                        color: isWhiteTheme ? '#ffffff' : theme.primary
                      }}
                    />
                  </div>
                </div>

                <div style={{ marginBottom: '12px' }}>
                  <div style={{ fontSize: '14px', marginBottom: '4px', color: isWhiteTheme ? '#ffffff' : theme.primary }}>Secondary Color</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <input
                      type="color"
                      value={customColors.secondary}
                      onChange={(e) => setCustomColors({ ...customColors, secondary: e.target.value })}
                      style={{
                        width: '40px',
                        height: '40px',
                        borderRadius: '4px',
                        cursor: 'pointer'
                      }}
                    />
                    <input
                      type="text"
                      value={customColors.secondary}
                      onChange={(e) => setCustomColors({ ...customColors, secondary: e.target.value })}
                      style={{
                        flex: 1,
                        padding: '8px',
                        borderRadius: '4px',
                        backgroundColor: isWhiteTheme ? 'rgba(255, 255, 255, 0.1)' : 'transparent',
                        border: `1px solid ${isWhiteTheme ? 'rgba(255, 255, 255, 0.3)' : theme.secondary + '40'}`,
                        color: isWhiteTheme ? '#ffffff' : theme.primary
                      }}
                    />
                  </div>
                </div>

                <div style={{ marginBottom: '12px' }}>
                  <div style={{ fontSize: '14px', marginBottom: '4px', color: isWhiteTheme ? '#ffffff' : theme.primary }}>Accent Color</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <input
                      type="color"
                      value={customColors.accent}
                      onChange={(e) => setCustomColors({ ...customColors, accent: e.target.value })}
                      style={{
                        width: '40px',
                        height: '40px',
                        borderRadius: '4px',
                        cursor: 'pointer'
                      }}
                    />
                    <input
                      type="text"
                      value={customColors.accent}
                      onChange={(e) => setCustomColors({ ...customColors, accent: e.target.value })}
                      style={{
                        flex: 1,
                        padding: '8px',
                        borderRadius: '4px',
                        backgroundColor: isWhiteTheme ? 'rgba(255, 255, 255, 0.1)' : 'transparent',
                        border: `1px solid ${isWhiteTheme ? 'rgba(255, 255, 255, 0.3)' : theme.secondary + '40'}`,
                        color: isWhiteTheme ? '#ffffff' : theme.primary
                      }}
                    />
                  </div>
                </div>

                <div style={{
                  marginTop: '16px',
                  padding: '12px',
                  borderRadius: '8px',
                  background: `linear-gradient(135deg, ${customColors.background} 0%, ${customColors.secondary}40 50%, ${customColors.background} 100%)`,
                }}>
                  <div style={{
                    textAlign: 'center',
                    fontWeight: 'bold',
                    color: customColors.primary
                  }}>
                    Preview Text
                  </div>
                  <div style={{
                    display: 'flex',
                    justifyContent: 'center',
                    gap: '8px',
                    marginTop: '8px'
                  }}>
                    <div style={{
                      width: '24px',
                      height: '24px',
                      borderRadius: '50%',
                      backgroundColor: customColors.secondary
                    }}></div>
                    <div style={{
                      width: '24px',
                      height: '24px',
                      borderRadius: '50%',
                      backgroundColor: customColors.accent
                    }}></div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Font Selection */}
          <div>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '16px',
              marginTop: '32px'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Type size={20} style={{ color: isWhiteTheme ? '#ffffff' : theme.secondary }} />
                <h3 style={{
                  fontSize: '18px',
                  fontWeight: '600',
                  color: isWhiteTheme ? '#ffffff' : theme.primary,
                  margin: 0
                }}>
                  Font
                </h3>
              </div>
            </div>

            <div style={{
              display: 'grid',
              gridTemplateColumns: window.innerWidth >= 768 ? '1fr 1fr' : '1fr',
              gap: '12px'
            }}>
              {fonts.map((fontOption) => (
                <button
                  key={fontOption.value}
                  onClick={() => setSelectedFont(fontOption.value)}
                  style={{
                    padding: '16px',
                    borderRadius: '8px',
                    border: `2px solid ${selectedFont === fontOption.value
                      ? (isWhiteTheme ? '#ffffff' : theme.secondary)
                      : 'transparent'}`,
                    backgroundColor: selectedFont === fontOption.value
                      ? (isWhiteTheme ? 'rgba(255, 255, 255, 0.2)' : theme.secondary + '20')
                      : (isWhiteTheme ? 'rgba(255, 255, 255, 0.1)' : theme.cellBg),
                    color: isWhiteTheme ? '#ffffff' : theme.primary,
                    transition: 'all 0.2s',
                    transform: selectedFont === fontOption.value ? 'scale(1.05)' : 'scale(1)',
                    cursor: 'pointer',
                    fontFamily: fontOption.value
                  }}
                  onMouseEnter={(e) => {
                    if (selectedFont !== fontOption.value) {
                      e.currentTarget.style.transform = 'scale(1.02)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (selectedFont !== fontOption.value) {
                      e.currentTarget.style.transform = 'scale(1)';
                    }
                  }}
                >
                  <div style={{ fontWeight: '600' }}>
                    {fontOption.label}
                  </div>
                  <div style={{ fontSize: '14px', opacity: 0.75, marginTop: '4px' }}>
                    The quick brown fox jumps over the lazy dog
                  </div>
                </button>
              ))}
            </div>

            <div style={{
              padding: '8px',
              borderRadius: '8px',
              backgroundColor: theme.cellBg + '80',
              color: theme.primary + '80',
              fontSize: '12px',
              marginTop: '12px'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <Sparkles size={12} />
                <span>Tip: Choose a font that's easy to read for better gameplay experience</span>
              </div>
            </div>
          </div>
        </div>

        {/* Save List Modal */}
        {showSaveListModal && (
          <div style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.7)',
            backdropFilter: 'blur(4px)',
            WebkitBackdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 60,
          }}>
            <div style={{
              backgroundColor: modalBgColor,
              borderRadius: '12px',
              boxShadow: modalShadow,
              width: '90%',
              maxWidth: '400px',
              padding: '24px',
              border: `1px solid ${modalBorderColor}`
            }}>
              <h3 style={{
                fontSize: '18px',
                fontWeight: '600',
                color: isWhiteTheme ? '#ffffff' : theme.primary,
                marginTop: 0,
                marginBottom: '16px'
              }}>
                {selectedListId ? 'Update Word List' : 'Save Word List'}
              </h3>

              <div style={{ marginBottom: '16px' }}>
                <label style={{
                  display: 'block',
                  marginBottom: '8px',
                  color: isWhiteTheme ? '#ffffff' : theme.primary,
                  fontSize: '14px'
                }}>
                  List Name
                </label>
                <input
                  type="text"
                  value={listNameInput}
                  onChange={(e) => setListNameInput(e.target.value)}
                  placeholder="Enter a name for your list"
                  style={{
                    width: '100%',
                    padding: '12px',
                    borderRadius: '8px',
                    backgroundColor: isWhiteTheme ? 'rgba(255, 255, 255, 0.1)' : theme.cellBg,
                    color: isWhiteTheme ? '#ffffff' : theme.primary,
                    border: `1px solid ${isWhiteTheme ? 'rgba(255, 255, 255, 0.3)' : theme.secondary + '40'}`,
                    outline: 'none'
                  }}
                />
              </div>

              <div style={{
                display: 'flex',
                justifyContent: 'flex-end',
                gap: '12px',
                marginTop: '24px'
              }}>
                <button
                  onClick={() => setShowSaveListModal(false)}
                  style={{
                    padding: '8px 16px',
                    borderRadius: '8px',
                    backgroundColor: isWhiteTheme ? 'rgba(255, 255, 255, 0.1)' : theme.cellBg,
                    color: isWhiteTheme ? '#ffffff' : theme.primary,
                    border: `1px solid ${isWhiteTheme ? 'rgba(255, 255, 255, 0.3)' : theme.secondary + '40'}`,
                    cursor: 'pointer',
                    transition: 'all 0.2s'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'scale(1.05)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'scale(1)';
                  }}
                >
                  Cancel
                </button>
                <button
                  onClick={saveCustomList}
                  disabled={!listNameInput.trim()}
                  style={{
                    padding: '8px 16px',
                    borderRadius: '8px',
                    backgroundColor: listNameInput.trim()
                      ? (isWhiteTheme ? '#ffffff' : theme.secondary)
                      : (isWhiteTheme ? 'rgba(255, 255, 255, 0.3)' : theme.secondary + '50'),
                    color: listNameInput.trim()
                      ? (isWhiteTheme ? '#1e3a8a' : 'white')
                      : (isWhiteTheme ? 'rgba(255, 255, 255, 0.5)' : 'rgba(255, 255, 255, 0.5)'),
                    border: 'none',
                    cursor: listNameInput.trim() ? 'pointer' : 'not-allowed',
                    transition: 'all 0.2s'
                  }}
                  onMouseEnter={(e) => {
                    if (listNameInput.trim()) {
                      e.currentTarget.style.transform = 'scale(1.05)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (listNameInput.trim()) {
                      e.currentTarget.style.transform = 'scale(1)';
                    }
                  }}
                >
                  {selectedListId ? 'Update' : 'Save'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Load List Modal */}
        {showLoadListModal && (
          <div style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.7)',
            backdropFilter: 'blur(4px)',
            WebkitBackdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 60,
          }}>
            <div style={{
              backgroundColor: modalBgColor,
              borderRadius: '12px',
              boxShadow: modalShadow,
              width: '90%',
              maxWidth: '500px',
              padding: '24px',
              border: `1px solid ${modalBorderColor}`
            }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: '16px'
              }}>
                <h3 style={{
                  fontSize: '18px',
                  fontWeight: '600',
                  color: isWhiteTheme ? '#ffffff' : theme.primary,
                  margin: 0
                }}>
                  Saved Word Lists
                </h3>
                <button
                  onClick={() => setShowLoadListModal(false)}
                  style={{
                    padding: '8px',
                    borderRadius: '8px',
                    color: isWhiteTheme ? '#ffffff' : theme.primary,
                    backgroundColor: 'transparent',
                    border: 'none',
                    cursor: 'pointer',
                    transition: 'background-color 0.2s'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = isWhiteTheme ? 'rgba(255, 255, 255, 0.2)' : theme.cellHover;
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'transparent';
                  }}
                >
                  <X size={20} />
                </button>
              </div>

              <div style={{
                maxHeight: '300px',
                overflowY: 'auto',
                marginBottom: '16px'
              }}>
                {savedLists.length === 0 ? (
                  <div style={{
                    padding: '16px',
                    textAlign: 'center',
                    color: isWhiteTheme ? '#ffffff' : theme.primary,
                    backgroundColor: isWhiteTheme ? 'rgba(255, 255, 255, 0.1)' : theme.cellBg,
                    borderRadius: '8px'
                  }}>
                    No saved lists found. Create a custom list and save it first.
                  </div>
                ) : (
                  savedLists.map(list => (
                    <div
                      key={list.id}
                      style={{
                        padding: '12px',
                        marginBottom: '8px',
                        borderRadius: '8px',
                        backgroundColor: isWhiteTheme ? 'rgba(255, 255, 255, 0.1)' : theme.cellBg,
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center'
                      }}
                    >
                      <div>
                        <div style={{
                          fontWeight: '600',
                          color: isWhiteTheme ? '#ffffff' : theme.primary,
                          marginBottom: '4px'
                        }}>
                          {list.name}
                        </div>
                        <div style={{
                          fontSize: '12px',
                          color: isWhiteTheme ? 'rgba(255, 255, 255, 0.7)' : theme.primary + '80',
                        }}>
                          {list.settings.customWords?.length || 0} words • {list.settings.gridSize}×{list.settings.gridSize} grid • {list.settings.theme} theme
                        </div>
                      </div>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <button
                          onClick={() => {
                            setListNameInput(list.name);
                            setSelectedListId(list.id);
                            setShowLoadListModal(false);
                            setShowSaveListModal(true);
                          }}
                          style={{
                            padding: '8px',
                            borderRadius: '8px',
                            backgroundColor: 'transparent',
                            color: isWhiteTheme ? '#ffffff' : theme.secondary,
                            border: 'none',
                            cursor: 'pointer',
                            transition: 'background-color 0.2s'
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.backgroundColor = isWhiteTheme ? 'rgba(255, 255, 255, 0.1)' : theme.cellHover;
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.backgroundColor = 'transparent';
                          }}
                          title="Edit list name"
                        >
                          <Edit size={16} />
                        </button>
                        <button
                          onClick={() => deleteCustomList(list.id)}
                          style={{
                            padding: '8px',
                            borderRadius: '8px',
                            backgroundColor: 'transparent',
                            color: '#ef4444',
                            border: 'none',
                            cursor: 'pointer',
                            transition: 'background-color 0.2s'
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.backgroundColor = 'rgba(239, 68, 68, 0.1)';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.backgroundColor = 'transparent';
                          }}
                          title="Delete list"
                        >
                          <Trash2 size={16} />
                        </button>
                        <button
                          onClick={() => loadCustomList(list)}
                          style={{
                            padding: '8px',
                            borderRadius: '8px',
                            backgroundColor: isWhiteTheme ? '#ffffff' : theme.secondary,
                            color: isWhiteTheme ? '#1e3a8a' : 'white',
                            border: 'none',
                            cursor: 'pointer',
                            transition: 'all 0.2s',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px'
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.transform = 'scale(1.05)';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.transform = 'scale(1)';
                          }}
                        >
                          <span style={{ fontSize: '14px' }}>Load</span>
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>

              <div style={{
                display: 'flex',
                justifyContent: 'flex-end',
                marginTop: '16px'
              }}>
                <button
                  onClick={() => setShowLoadListModal(false)}
                  style={{
                    padding: '8px 16px',
                    borderRadius: '8px',
                    backgroundColor: isWhiteTheme ? '#ffffff' : theme.secondary,
                    color: isWhiteTheme ? '#1e3a8a' : 'white',
                    border: 'none',
                    cursor: 'pointer',
                    transition: 'all 0.2s'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'scale(1.05)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'scale(1)';
                  }}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Footer */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'flex-end',
          gap: '12px',
          padding: '24px',
          borderTop: `1px solid ${isWhiteTheme ? 'rgba(255, 255, 255, 0.2)' : theme.secondary + '40'}`
        }}>
          <button
            onClick={onClose}
            style={{
              padding: '8px 24px',
              borderRadius: '8px',
              backgroundColor: isWhiteTheme ? 'rgba(255, 255, 255, 0.1)' : theme.cellBg,
              color: isWhiteTheme ? '#ffffff' : theme.primary,
              border: `1px solid ${isWhiteTheme ? 'rgba(255, 255, 255, 0.3)' : theme.secondary + '40'}`,
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'scale(1.05)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'scale(1)';
            }}
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            style={{
              padding: '8px 24px',
              borderRadius: '8px',
              backgroundColor: isWhiteTheme ? '#ffffff' : theme.secondary,
              color: isWhiteTheme ? '#1e3a8a' : 'white',
              border: 'none',
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'scale(1.05)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'scale(1)';
            }}
          >
            Save Settings
          </button>
        </div>
      </div>
    </div>
  );
};