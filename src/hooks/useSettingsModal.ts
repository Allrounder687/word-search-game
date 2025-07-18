import { useState, useEffect } from 'react';
import type { GameSettings } from '../types/game';

interface SavedWordList {
  id: string;
  name: string;
  settings: GameSettings;
  createdAt: number;
}

export const useSettingsModal = (initialSettings: GameSettings) => {
  const [localSettings, setLocalSettings] = useState<GameSettings>({
    ...initialSettings,
    timerMode: initialSettings.timerMode || 'none',
    timerDuration: initialSettings.timerDuration || 180
  });

  const [customColors, setCustomColors] = useState({
    background: initialSettings.customColors?.background || '#000000',
    primary: initialSettings.customColors?.primary || '#ffffff',
    secondary: initialSettings.customColors?.secondary || '#a855f7',
    accent: initialSettings.customColors?.accent || '#ec4899'
  });

  const [selectedFont, setSelectedFont] = useState<string>(
    initialSettings.customFont || "'Inter', sans-serif"
  );

  // Update local settings when props change
  useEffect(() => {
    setLocalSettings({
      ...initialSettings,
      timerMode: initialSettings.timerMode || 'none',
      timerDuration: initialSettings.timerDuration || 180
    });
    
    setSelectedFont(initialSettings.customFont || "'Inter', sans-serif");
    
    if (initialSettings.customColors) {
      setCustomColors({
        background: initialSettings.customColors.background || '#000000',
        primary: initialSettings.customColors.primary || '#ffffff',
        secondary: initialSettings.customColors.secondary || '#a855f7',
        accent: initialSettings.customColors.accent || '#ec4899'
      });
    }
  }, [initialSettings]);

  return {
    localSettings,
    setLocalSettings,
    customColors,
    setCustomColors,
    selectedFont,
    setSelectedFont
  };
};